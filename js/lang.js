(function () {
  var root = document.documentElement;
  var buttons = document.querySelectorAll('[data-set-lang]');

  function applyLang(lang) {
    root.lang = lang;
    buttons.forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.setLang === lang));
    });
  }

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      applyLang(button.dataset.setLang);
      try { localStorage.setItem('lang', button.dataset.setLang); } catch (e) {}
    });
  });

  applyLang(root.lang);
})();