/**
 * auth.js — Guarda de autenticação SSM
 * Inclua este script no início do <body> em todas as páginas protegidas.
 */
(function () {
  var role = sessionStorage.getItem('ssm_role');

  // Redireciona para login se não autenticado
  if (!role) {
    window.location.replace('login.html');
    return;
  }

  // Permissões por perfil
  var acesso = {
    operador:   ['index.html', 'solicitarMateriais.html', 'calculadora.html', 'historico.html'],
    almoxarife: ['index.html', 'almoxarifado.html', 'historico.html', 'relatorios.html'],
    admin:      ['index.html', 'solicitarMateriais.html', 'calculadora.html', 'almoxarifado.html', 'historico.html', 'relatorios.html']
  };

  var pagina = window.location.pathname.split('/').pop() || 'index.html';
  var permitidas = acesso[role] || [];

  // Redireciona se não tem acesso a esta página
  if (!permitidas.includes(pagina)) {
    window.location.replace('index.html');
    return;
  }

  // Manipulação do DOM após carregamento
  document.addEventListener('DOMContentLoaded', function () {
    var labels = {
      operador:   'Operador',
      almoxarife: 'Almoxarife',
      admin:      'Administrador'
    };

    // Oculta links sem permissão
    if (role !== 'operador' && role !== 'admin') {
      var linkSolicitar = document.querySelector('a[href="solicitarMateriais.html"]');
      if (linkSolicitar) linkSolicitar.style.display = 'none';
      var linkCalc = document.querySelector('a[href="calculadora.html"]');
      if (linkCalc) linkCalc.style.display = 'none';
    }
    if (role !== 'almoxarife' && role !== 'admin') {
      var linkAlmox = document.querySelector('a[href="almoxarifado.html"]');
      if (linkAlmox) linkAlmox.style.display = 'none';
      var linkRel = document.querySelector('a[href="relatorios.html"]');
      if (linkRel) linkRel.style.display = 'none';
    }

    // Atualiza rodapé da sidebar com perfil + botão sair
    var footer = document.querySelector('.sidebar-footer');
    if (footer) {
      footer.innerHTML =
        '<div style="font-size:11px;color:rgba(255,255,255,.42);margin-bottom:9px;line-height:1.5;">' +
          'Novo Nordisk — Eixo 8<br>' +
          '<span style="color:rgba(255,255,255,.65);font-weight:600;">' + labels[role] + '</span>' +
        '</div>' +
        '<button id="ssm-logout" style="' +
          'width:100%;padding:7px 10px;border-radius:7px;' +
          'border:1px solid rgba(255,255,255,.11);' +
          'background:rgba(255,255,255,.055);' +
          'color:rgba(255,255,255,.55);cursor:pointer;' +
          'font-size:12px;font-family:inherit;' +
          'display:flex;align-items:center;justify-content:center;gap:6px;' +
          'transition:background .18s,color .18s;' +
        '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;">' +
            '<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>' +
            '<polyline points="16 17 21 12 16 7"/>' +
            '<line x1="21" y1="12" x2="9" y2="12"/>' +
          '</svg>' +
          'Sair do sistema' +
        '</button>';

      var btnLogout = document.getElementById('ssm-logout');
      btnLogout.addEventListener('mouseenter', function () {
        this.style.background = 'rgba(255,255,255,.1)';
        this.style.color = 'rgba(255,255,255,.88)';
      });
      btnLogout.addEventListener('mouseleave', function () {
        this.style.background = 'rgba(255,255,255,.055)';
        this.style.color = 'rgba(255,255,255,.55)';
      });
      btnLogout.addEventListener('click', function () {
        sessionStorage.removeItem('ssm_role');
        window.location.href = 'login.html';
      });
    }
  });
})();
