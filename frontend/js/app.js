// === ALERTAS DE PROBLEMA ===
async function carregarAlertas() {
  try {
    const res = await fetch('http://localhost:3000/solicitacoes');
    if (!res.ok) return;
    const lista = await res.json();
    const comProblema = lista.filter(s => s.problema && s.status !== 'concluída');
    const container = document.getElementById('alertasProblemas');
    if (!container || comProblema.length === 0) return;
    container.innerHTML = comProblema.map(s => {
      const data = new Date(s.dataSolicitacao).toLocaleString('pt-BR');
      return `
        <div class="problema-card" id="problema-${s._id}">
          <div class="problema-card__header">
            <span class="problema-card__header-icon">⚠️</span>
            <span class="problema-card__title">Problema na sua solicitação — ${s.linha}</span>
            <span class="problema-card__meta">${s.solicitante} · ${data}</span>
          </div>
          <div class="problema-card__body">
            <div class="problema-card__label">Justificativa do Almoxarifado</div>
            <div class="problema-card__text">${s.problema}</div>
          </div>
          <div class="problema-card__actions">
            <button class="btn btn-ok" onclick="dispensarProblema('${s._id}')">OK, entendido</button>
          </div>
        </div>`;
    }).join('');
  } catch {
    // silencioso — não bloqueia o formulário
  }
}

async function dispensarProblema(id) {
  const card = document.getElementById(`problema-${id}`);
  if (card) card.style.opacity = '0.5';
  try {
    await fetch(`http://localhost:3000/solicitacoes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problema: '' })
    });
  } catch {
    // ignora erro de rede, remove o card de qualquer forma
  }
  if (card) card.remove();
}

carregarAlertas();

function mais(id) {
  const input = document.getElementById(id);
  input.value = Number(input.value) + 1;
}

function menos(id) {
  const input = document.getElementById(id);
  if (Number(input.value) > 0) input.value = Number(input.value) - 1;
}

document.querySelectorAll('.qty-input').forEach(input => {
  input.addEventListener('input', () => {
    if (input.value < 0) input.value = 0;
  });
});

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  const icon = type === 'success' ? '✓' : '✕';
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span>${message}</span>
    <span class="toast-close" onclick="this.parentElement.remove()">×</span>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

const form = document.getElementById('form');
const btnEnviar = document.getElementById('btnEnviar');
const btnOriginalHTML = btnEnviar ? btnEnviar.innerHTML : '';

if (form) {
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const iniciais = document.getElementById('iniciais').value.trim().toUpperCase();
    if (!iniciais) {
      showToast('Informe suas iniciais antes de enviar.', 'error');
      return;
    }

    const cartucho = Number(document.getElementById('cartucho').value);
    const bula = Number(document.getElementById('bula').value);
    const rotulo = Number(document.getElementById('rotulo').value);
    const caixa = Number(document.getElementById('caixa').value);

    if (cartucho === 0 && bula === 0 && rotulo === 0 && caixa === 0) {
      showToast('Selecione pelo menos um material.', 'error');
      return;
    }

    const linha = document.querySelector('input[name="linha"]:checked').value;
    const observacoes = document.getElementById('obs').value.trim();

    btnEnviar.disabled = true;
    btnEnviar.innerHTML = '<span class="spinner"></span> Enviando...';

    try {
      const response = await fetch('http://localhost:3000/solicitacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          solicitante: iniciais,
          linha,
          materiais: { cartucho, bula, rotulo, caixa },
          observacoes
        })
      });

      if (!response.ok) throw new Error('Resposta inválida do servidor');

      showToast('Solicitação enviada com sucesso!', 'success');
      form.reset();
      ['cartucho', 'bula', 'rotulo', 'caixa'].forEach(id => {
        document.getElementById(id).value = 0;
      });
    } catch (err) {
      showToast('Erro ao conectar com o servidor. Verifique se o backend está rodando.', 'error');
    } finally {
      btnEnviar.disabled = false;
      btnEnviar.innerHTML = btnOriginalHTML;
    }
  });
}
