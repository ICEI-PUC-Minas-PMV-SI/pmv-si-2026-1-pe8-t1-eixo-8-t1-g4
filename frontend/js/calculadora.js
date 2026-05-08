const MAX_PRODUCAO = 22500;

// Quantidade necessária de embalagens para produção máxima
const NECESSARIO = {
  cartucho: Math.ceil(MAX_PRODUCAO / 5 / 400),   // 4500 cartuchos ÷ 400/cx = 12 caixas
  bula:     Math.ceil(MAX_PRODUCAO / 5 / 550),   // 4500 bulas ÷ 550/cx = 9 caixas
  rotulo:   Math.ceil(MAX_PRODUCAO / 12990),     // 22500 ÷ 12990 = 2 bobinas
  caixa:    Math.ceil(MAX_PRODUCAO / 25 / 25)    // 900 caixas embarque ÷ 25/fardo = 36 fardos
};

function getExistente(id) {
  return Math.max(0, parseInt(document.getElementById('existente-' + id).value, 10) || 0);
}

function calcular() {
  ['cartucho', 'bula', 'rotulo', 'caixa'].forEach(function (id) {
    const necessario = NECESSARIO[id];
    const existente  = getExistente(id);
    const solicitar  = Math.max(0, necessario - existente);

    document.getElementById('nec-' + id).textContent = necessario;
    document.getElementById('solicitar-' + id).value = solicitar;

    // Destaca o campo de resultado se há algo a solicitar
    var campo = document.getElementById('solicitar-' + id);
    campo.style.color        = solicitar > 0 ? '#0072CE' : 'var(--text-muted)';
    campo.style.fontWeight   = solicitar > 0 ? '800' : '600';
    campo.style.borderColor  = solicitar > 0 ? '#0072CE' : 'var(--border)';
  });

  // Atualiza link da solicitação com os valores a solicitar
  var c = parseInt(document.getElementById('solicitar-cartucho').value, 10) || 0;
  var b = parseInt(document.getElementById('solicitar-bula').value,     10) || 0;
  var r = parseInt(document.getElementById('solicitar-rotulo').value,   10) || 0;
  var x = parseInt(document.getElementById('solicitar-caixa').value,    10) || 0;
  document.getElementById('btnSolicitar').href =
    'solicitarRota.html?cartucho=' + c + '&bula=' + b + '&rotulo=' + r + '&caixa=' + x;
}

// Inicializa os "Necessário" e recalcula ao digitar
(function () {
  ['cartucho', 'bula', 'rotulo', 'caixa'].forEach(function (id) {
    document.getElementById('nec-' + id).textContent = NECESSARIO[id];
    document.getElementById('existente-' + id).addEventListener('input', calcular);
  });
  calcular();
})();
