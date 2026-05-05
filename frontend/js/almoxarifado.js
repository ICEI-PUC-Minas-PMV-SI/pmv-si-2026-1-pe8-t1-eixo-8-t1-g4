let todasSolicitacoes = [];
let filtroAtivo = 'todas';
let _problemaTargetId = null;

async function loadSolicitacoes() {
  try {
    const res = await fetch('http://localhost:3000/solicitacoes');
    if (!res.ok) throw new Error('Erro ao carregar');
    todasSolicitacoes = await res.json();
    todasSolicitacoes.sort((a, b) => new Date(b.dataSolicitacao) - new Date(a.dataSolicitacao));
    atualizarContadores();
    renderLista();
  } catch (err) {
    showToast('Erro ao conectar com o servidor', 'error');
  }
}

function atualizarContadores() {
  document.getElementById('countPendentes').textContent =
    todasSolicitacoes.filter(s => s.status === 'pendente').length;
  document.getElementById('countProgresso').textContent =
    todasSolicitacoes.filter(s => s.status === 'em progresso').length;
  document.getElementById('countConcluidas').textContent =
    todasSolicitacoes.filter(s => s.status === 'concluída').length;
    document.getElementById('countJustificadas').textContent =
  todasSolicitacoes.filter(s => s.status === 'justificada').length;
}

function renderLista() {
  const lista = document.getElementById('lista');
  const filtradas = filtroAtivo === 'todas'
    ? todasSolicitacoes
    : todasSolicitacoes.filter(s => s.status === filtroAtivo);

  if (filtradas.length === 0) {
    lista.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
        <h3>Nenhuma solicitação</h3>
        <p>Não há solicitações para o filtro selecionado.</p>
      </div>`;
    return;
  }
  lista.innerHTML = filtradas.map(renderCard).join('');
}

function statusClass(status) {
  if (status === 'pendente') return 'pending';
  if (status === 'em progresso') return 'progress';
  if (status === 'justificada') return 'justificada';
  return 'done';
}

function renderCard(s) {
  const sc = statusClass(s.status);
  const materiais = s.materiais || {};
  const tags = [
    materiais.cartucho > 0 ? `Cartucho: ${materiais.cartucho}` : '',
    materiais.bula > 0 ? `Bula: ${materiais.bula}` : '',
    materiais.rotulo > 0 ? `Rótulo: ${materiais.rotulo}` : '',
    materiais.caixa > 0 ? `Caixa: ${materiais.caixa}` : '',
  ].filter(Boolean).map(t => `<span class="material-tag">${t}</span>`).join('');

  const data = new Date(s.dataSolicitacao).toLocaleString('pt-BR');

  let acoes = '';
  
  if (s.status === 'pendente') {
    acoes += `<button class="btn btn-primary" onclick="iniciar('${s._id}')">Iniciar</button>`;
    acoes += `<button class="btn btn-danger" onclick="abrirModal('${s._id}')">Reportar Problema</button>`;
  }
  if (s.status === 'em progresso') {
    acoes += `<button class="btn btn-success" onclick="concluir('${s._id}')">Concluir</button>`;
    acoes += `<button class="btn btn-danger" onclick="abrirModal('${s._id}')">Reportar Problema</button>`;
  }

  const problemaBanner = s.problema ? `
    <div class="request-card__problema">
      <span class="request-card__problema-icon">⚠️</span>
      <div class="request-card__problema-body">
        <div class="request-card__problema-label">Problema Reportado</div>
        <div class="request-card__problema-text">${s.problema}</div>
      </div>
    </div>` : '';

  return `
    <div class="request-card">
      <div class="request-card__header request-card__header--${sc}">
        <span class="request-card__title">${s.linha}</span>
        <span class="badge badge--${sc}">${s.status}</span>
      </div>
      <div class="request-card__body">
        <div class="request-card__meta">
          <span>👤 ${s.solicitante || '—'}</span>
          <span>🕐 ${data}</span>
        </div>
        <div class="request-card__materials">${tags || '<span class="material-tag" style="color:var(--text-muted)">Sem materiais</span>'}</div>
        ${s.observacoes ? `<div class="request-card__obs">"${s.observacoes}"</div>` : ''}
      </div>
      ${problemaBanner}
      ${acoes ? `<div class="request-card__actions">${acoes}</div>` : ''}
    </div>`;
}

async function iniciar(id) {
  try {
    const res = await fetch(`http://localhost:3000/solicitacoes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'em progresso' })
    });
    if (!res.ok) throw new Error();
    showToast('Solicitação iniciada!', 'success');
    loadSolicitacoes();
  } catch {
    showToast('Erro ao atualizar solicitação', 'error');
  }
}

async function concluir(id) {
  try {
    const res = await fetch(`http://localhost:3000/solicitacoes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'concluída' })
    });
    if (!res.ok) throw new Error();
    showToast('Solicitação concluída!', 'success');
    loadSolicitacoes();
  } catch {
    showToast('Erro ao atualizar solicitação', 'error');
  }
}

function abrirModal(id) {
  _problemaTargetId = id;
  document.getElementById('inputProblema').value = '';
  document.getElementById('modalProblema').classList.remove('hidden');
  document.getElementById('inputProblema').focus();
}

function fecharModal() {
  _problemaTargetId = null;
  document.getElementById('modalProblema').classList.add('hidden');
}

async function confirmarProblema() {
  const texto = document.getElementById('inputProblema').value.trim();
  if (!texto) {
    document.getElementById('inputProblema').focus();
    return;
  }
  try {
    const res = await fetch(`http://localhost:3000/solicitacoes/${_problemaTargetId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
  problema: texto,
  status: 'justificada'
})
    });
    if (!res.ok) throw new Error();
    fecharModal();
    showToast('Problema reportado ao solicitante!', 'error');
    loadSolicitacoes();
  } catch {
    showToast('Erro ao reportar problema', 'error');
  }
}

// Fechar modal ao clicar fora
document.getElementById('modalProblema').addEventListener('click', function(e) {
  if (e.target === this) fecharModal();
});

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  const icon = type === 'success' ? '✓' : '✕';
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span>${message}</span>
    <span class="toast-close" onclick="this.parentElement.remove()">×</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filtroAtivo = btn.dataset.filter;
    renderLista();
  });
});

document.getElementById('btnAtualizar').addEventListener('click', loadSolicitacoes);

setInterval(loadSolicitacoes, 30000);

loadSolicitacoes();
