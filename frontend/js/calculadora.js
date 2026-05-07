const MATERIAIS = [
  {
    id: 'cartucho',
    label: 'Cartuchos',
    img: './img/cartucho.png',
    embalagem: 'caixa',
    plural: 'caixas',
    porEmbalagem: 400,
    cor: '#0072CE',
    calcUnidades: canetas => Math.ceil(canetas / 5)
  },
  {
    id: 'bula',
    label: 'Bulas',
    img: './img/bula.png',
    embalagem: 'caixa',
    plural: 'caixas',
    porEmbalagem: 550,
    cor: '#16a34a',
    calcUnidades: canetas => Math.ceil(canetas / 5)
  },
  {
    id: 'rotulo',
    label: 'Rótulos',
    img: './img/rotulo.png',
    embalagem: 'bobina',
    plural: 'bobinas',
    porEmbalagem: 12990,
    cor: '#7c3aed',
    calcUnidades: canetas => canetas
  },
  {
    id: 'caixa',
    label: 'Caixas de Embarque',
    img: './img/caixa.png',
    embalagem: 'fardo',
    plural: 'fardos',
    porEmbalagem: 25,
    cor: '#d97706',
    // 1 caixa embarque = 5 cartuchos; 1 cartucho = 5 canetas → 1 caixa = 25 canetas
    calcUnidades: canetas => Math.ceil(Math.ceil(canetas / 5) / 5)
  }
];

function calcular(canetas) {
  return MATERIAIS.map(mat => {
    const unidades = mat.calcUnidades(canetas);
    return { ...mat, unidades, embalagens: Math.ceil(unidades / mat.porEmbalagem) };
  });
}

function renderResultados(canetas) {
  const resultados = calcular(canetas);
  document.getElementById('calcResults').innerHTML = resultados.map(r => `
    <div class="calc-result-card" style="--card-color:${r.cor}">
      <div class="calc-result-header">
        <img src="${r.img}" alt="${r.label}" class="calc-result-img">
        <span class="calc-result-name">${r.label}</span>
      </div>
      <div class="calc-result-body">
        <span class="calc-result-value">${r.embalagens}</span>
        <span class="calc-result-unit">${r.embalagens === 1 ? r.embalagem : r.plural}</span>
      </div>
      <div class="calc-result-breakdown">
        ${r.unidades.toLocaleString('pt-BR')} unid. ÷ ${r.porEmbalagem.toLocaleString('pt-BR')} por ${r.embalagem}
      </div>
    </div>
  `).join('');

  const params = resultados.map(r => `${r.id}=${r.embalagens}`).join('&');
  document.getElementById('btnUsarSolicitacao').href = `solicitarRota.html?${params}`;
}

function atualizarPresets(val) {
  document.getElementById('preset-meta').classList.toggle('calc-preset-btn--active', val === 21600);
  document.getElementById('preset-max').classList.toggle('calc-preset-btn--active', val === 22500);
}

function atualizar() {
  const val = parseInt(document.getElementById('canetas').value, 10);
  if (!val || val <= 0) return;
  renderResultados(val);
  atualizarPresets(val);
}

function aplicarPreset(val) {
  document.getElementById('canetas').value = val;
  atualizar();
}

document.getElementById('canetas').addEventListener('input', atualizar);

atualizar();
