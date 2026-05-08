const MAX_PRODUCAO = 22500;

const MATERIAIS = [
  {
    id: 'cartucho',
    label: 'Cartuchos',
    embalagem: 'caixa',
    img: './img/cartucho.png',
    cor: '#0072CE',
    unidadesPorEmbalagem: 400,
    canetasPorUnidade: 5
  },
  {
    id: 'bula',
    label: 'Bulas',
    embalagem: 'caixa',
    img: './img/bula.png',
    cor: '#16a34a',
    unidadesPorEmbalagem: 550,
    canetasPorUnidade: 5
  },
  {
    id: 'rotulo',
    label: 'Rótulos',
    embalagem: 'bobina',
    img: './img/rotulo.png',
    cor: '#7c3aed',
    unidadesPorEmbalagem: 12990,
    canetasPorUnidade: 1
  },
  {
    id: 'caixa',
    label: 'Caixas de Embarque',
    embalagem: 'fardo',
    img: './img/caixa.png',
    cor: '#d97706',
    unidadesPorEmbalagem: 25,
    canetasPorUnidade: 25   // 1 caixa embarque = 5 cartuchos × 5 canetas
  }
];

function getQtd(id) {
  return Math.max(0, parseInt(document.getElementById(id).value, 10) || 0);
}

function calcular() {
  const dados = MATERIAIS.map(mat => {
    const embalagensDispo = getQtd(mat.id);
    const unidadesDispo   = embalagensDispo * mat.unidadesPorEmbalagem;
    const canetasDispo    = unidadesDispo   * mat.canetasPorUnidade;
    return { ...mat, embalagensDispo, unidadesDispo, canetasDispo };
  });

  const producao = Math.min(MAX_PRODUCAO, ...dados.map(d => d.canetasDispo));

  return dados.map(d => {
    const unidadesConsumidas   = Math.ceil(producao / d.canetasPorUnidade);
    const embalagensConsumidas = unidadesConsumidas / d.unidadesPorEmbalagem;
    const unidadesRestantes    = d.unidadesDispo - unidadesConsumidas;
    const gargalo              = d.canetasDispo === producao && producao < MAX_PRODUCAO;
    return { ...d, producao, unidadesConsumidas, embalagensConsumidas, unidadesRestantes, gargalo };
  });
}

function pct(valor, total) {
  return total === 0 ? 0 : Math.min(100, Math.round(valor / total * 100));
}

function fmt(n) {
  return Math.floor(n).toLocaleString('pt-BR');
}

function fmtDec(n) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
}

function renderResultado(dados) {
  if (dados.length === 0) return;
  const producao = dados[0].producao;
  const porcentagem = pct(producao, MAX_PRODUCAO);
  const gargalos = dados.filter(d => d.gargalo).map(d => d.label);
  const tudoZero = dados.every(d => d.embalagensDispo === 0);

  const corBarra = porcentagem >= 90 ? '#16a34a' : porcentagem >= 60 ? '#d97706' : '#dc2626';
  const icone = porcentagem >= 90 ? '✓' : porcentagem >= 60 ? '⚠' : '✕';

  document.getElementById('resultProducao').innerHTML = tudoZero
    ? `<span style="font-size:32px;color:var(--text-muted)">Informe o estoque disponível</span>`
    : `${fmt(producao)}<span style="font-size:22px;font-weight:600;color:var(--text-muted);margin-left:8px;">canetas/hora</span>`;

  document.getElementById('resultBarra').innerHTML = tudoZero ? '' : `
    <div class="calc-barra-wrap">
      <div class="calc-barra-track">
        <div class="calc-barra-fill" style="width:${porcentagem}%;background:${corBarra};"></div>
      </div>
      <div class="calc-barra-info">
        <span style="font-weight:700;color:${corBarra};">${icone} ${porcentagem}% da capacidade máxima</span>
        <span style="color:var(--text-muted);">Máx: ${fmt(MAX_PRODUCAO)}/h</span>
      </div>
      ${gargalos.length ? `<div class="calc-gargalo-aviso">⚠ Gargalo: ${gargalos.join(' e ')}</div>` : ''}
    </div>
  `;

  document.getElementById('resultMateriais').innerHTML = dados.map(d => {
    if (d.embalagensDispo === 0) return '';
    const restPct = pct(d.unidadesRestantes, d.unidadesDispo);
    const corStatus = d.gargalo ? '#d97706' : '#16a34a';
    const labelStatus = d.gargalo ? 'GARGALO' : 'OK';
    return `
      <div class="calc-result-card" style="--card-color:${d.cor}">
        <div class="calc-result-header">
          <img src="${d.img}" alt="${d.label}" class="calc-result-img">
          <span class="calc-result-name">${d.label}</span>
          <span class="calc-status-badge" style="background:${corStatus}20;color:${corStatus};border:1px solid ${corStatus}40;">${labelStatus}</span>
        </div>
        <div class="calc-consumo-grid">
          <div class="calc-consumo-item">
            <span class="calc-consumo-label">Disponível</span>
            <span class="calc-consumo-valor">${fmt(d.unidadesDispo)}</span>
            <span class="calc-consumo-unit">${d.embalagensDispo} ${d.embalagensDispo === 1 ? d.embalagem : d.embalagem + 's'}</span>
          </div>
          <div class="calc-consumo-item">
            <span class="calc-consumo-label">Consumo/hora</span>
            <span class="calc-consumo-valor" style="color:${d.cor};">${fmt(d.unidadesConsumidas)}</span>
            <span class="calc-consumo-unit">${fmtDec(d.embalagensConsumidas)} ${d.embalagem + 's'}</span>
          </div>
          <div class="calc-consumo-item">
            <span class="calc-consumo-label">Sobra</span>
            <span class="calc-consumo-valor" style="color:${d.unidadesRestantes <= 0 ? '#dc2626' : 'var(--text-primary)'};">${fmt(Math.max(0, d.unidadesRestantes))}</span>
            <span class="calc-consumo-unit">${restPct}% restante</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function atualizar() {
  const dados = calcular();
  renderResultado(dados);
}

MATERIAIS.forEach(mat => {
  document.getElementById(mat.id).addEventListener('input', atualizar);
});

function mais(id) {
  const el = document.getElementById(id);
  el.value = (parseInt(el.value, 10) || 0) + 1;
  atualizar();
}

function menos(id) {
  const el = document.getElementById(id);
  const v = (parseInt(el.value, 10) || 0) - 1;
  el.value = Math.max(0, v);
  atualizar();
}

atualizar();
