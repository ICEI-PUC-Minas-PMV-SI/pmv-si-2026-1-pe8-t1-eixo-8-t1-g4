const MAX_PRODUCAO = 22500;

const NECESSARIO = {

  cartucho: 12,

  rotulo: 2,

  caixa: {

    caixas: 84,

    fardos: 4

  }

};

function calcularBulas() {

  const modelo =
    Number(
      document.getElementById(
        'modelo-bula'
      ).value
    );

  const necessario =
    Math.ceil(
      (MAX_PRODUCAO / 5) / modelo
    );

  document.getElementById(
    'nec-bula'
  ).textContent = necessario;

  // TEXTO DINÂMICO

  if (modelo === 550) {

    document.getElementById(
      'texto-bula'
    ).innerHTML =

      'caixas (550 bulas/cx · 1 bula/cartucho)';

  } else {

    document.getElementById(
      'texto-bula'
    ).innerHTML =

      'caixas (1100 bulas/cx · 1 bula/cartucho)';
  }

  return necessario;
}

function getExistente(id) {

  return Math.max(

    0,

    parseInt(
      document.getElementById(
        'existente-' + id
      ).value,
      10
    ) || 0

  );

}

function calcular() {

  // ===== BULAS =====

  const necessarioBula =
    calcularBulas();

  // ===== CARTUCHOS =====

  const existenteCartucho =
    getExistente('cartucho');

  const solicitarCartucho =
    Math.max(
      0,
      NECESSARIO.cartucho - existenteCartucho
    );

  document.getElementById(
    'nec-cartucho'
  ).textContent =
    NECESSARIO.cartucho;

  document.getElementById(
    'solicitar-cartucho'
  ).value =
    solicitarCartucho;

  // ===== RÓTULOS =====

  const existenteRotulo =
    getExistente('rotulo');

  const solicitarRotulo =
    Math.max(
      0,
      NECESSARIO.rotulo - existenteRotulo
    );

  document.getElementById(
    'nec-rotulo'
  ).textContent =
    NECESSARIO.rotulo;

  document.getElementById(
    'solicitar-rotulo'
  ).value =
    solicitarRotulo;

  // ===== CAIXAS =====

  const existenteCaixa =
    getExistente('caixa');

  const solicitarCaixa =
    Math.max(
      0,
      NECESSARIO.caixa.fardos - existenteCaixa
    );

  document.getElementById(
    'nec-caixa'
  ).textContent =

    `${NECESSARIO.caixa.caixas} caixas / ${NECESSARIO.caixa.fardos} fardos`;

  document.getElementById(
    'solicitar-caixa'
  ).value =
    solicitarCaixa;

  // ===== BULAS =====

  const existenteBula =
    getExistente('bula');

  const solicitarBula =
    Math.max(
      0,
      necessarioBula - existenteBula
    );

  document.getElementById(
    'solicitar-bula'
  ).value =
    solicitarBula;

  // ===== LINK =====

  document.getElementById(
    'btnSolicitar'
  ).href =

    'solicitarMateriais.html?' +

    'cartucho=' + solicitarCartucho +

    '&bula=' + solicitarBula +

    '&rotulo=' + solicitarRotulo +

    '&caixa=' + solicitarCaixa;

}

// ===== EVENTOS =====

[
  'cartucho',
  'bula',
  'rotulo',
  'caixa'
].forEach(function(id){

  document.getElementById(
    'existente-' + id
  ).addEventListener(
    'input',
    calcular
  );

});

document.getElementById(
  'modelo-bula'
).addEventListener(
  'change',
  calcular
);

// ===== START =====

calcular();