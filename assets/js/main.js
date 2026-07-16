/* Enterprise Assessoria Contábil — main.js */
(function () {
  'use strict';

  /* ---------- Ano no rodapé ---------- */
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* ---------- Menu mobile ---------- */
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', String(!open));
      burger.setAttribute('aria-expanded', String(!open));
      burger.setAttribute('aria-label', !open ? 'Fechar menu' : 'Abrir menu');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.setAttribute('data-open', 'false');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Máscara de telefone ---------- */
  var tel = document.getElementById('whatsapp');
  if (tel) {
    tel.addEventListener('input', function () {
      var v = tel.value.replace(/\D/g, '').slice(0, 11);
      if (v.length > 6) v = '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7);
      else if (v.length > 2) v = '(' + v.slice(0, 2) + ') ' + v.slice(2);
      else if (v.length > 0) v = '(' + v;
      tel.value = v;
    });
  }

  /* ---------- Formulários (captura de e-mail e diagnóstico) ---------- */
  function encodeForm(data) {
    return Object.keys(data).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]);
    }).join('&');
  }

  function handleForm(form, opts) {
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('.form-msg');

      // Honeypot anti-spam
      if (form.empresa_site && form.empresa_site.value !== '') return;

      if (!form.checkValidity()) { form.reportValidity(); return; }

      // Monta o payload com todos os campos nomeados (inclui form-name p/ Netlify)
      var data = {};
      Array.prototype.forEach.call(form.elements, function (el) {
        if (el.name && el.type !== 'submit') {
          data[el.name] = (el.type === 'checkbox') ? (el.checked ? 'sim' : 'não') : el.value.trim();
        }
      });
      data.origem = window.location.pathname;

      var btn = form.querySelector('button[type=submit]');
      var primeiro = (data.nome || '').split(' ')[0];
      btn.disabled = true;
      btn.textContent = 'Enviando…';

      // Envia para o Netlify Forms (captura nativa, sem backend próprio).
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeForm(data)
      })
        .then(function (r) { if (!r.ok) throw new Error('falha'); return r; })
        .catch(function () { /* fallback silencioso: não perde a experiência do usuário */ })
        .finally(function () {
          if (msg) { msg.hidden = false; msg.textContent = opts.sucesso(primeiro); }
          btn.textContent = opts.btnFeito;
          if (opts.whatsapp) {
            var texto = encodeURIComponent(opts.whatsapp(data));
            setTimeout(function () {
              window.open('https://wa.me/552126764328?text=' + texto, '_blank', 'noopener');
            }, 900);
          }
        });
    });
  }

  var optsDiag = {
    sucesso: function (nome) { return 'Recebido' + (nome ? ', ' + nome : '') + '. Um contador entra em contato em até 1 dia útil.'; },
    btnFeito: 'Diagnóstico solicitado',
    whatsapp: function (d) {
      return 'Olá! Quero o diagnóstico gratuito.\n' +
        'Nome: ' + (d.nome || '') + '\n' +
        'Segmento: ' + (d.segmento || '') + '\n' +
        'Regime atual: ' + (d.regime || '');
    }
  };

  // Home (hero) e página de Contato usam o mesmo comportamento de diagnóstico
  handleForm(document.getElementById('form-diagnostico'), optsDiag);
  handleForm(document.getElementById('form-contato'), optsDiag);

  /* ---------- Banner LGPD ---------- */
  var banner = document.getElementById('lgpd');
  var KEY = 'enterprise_consent';
  function decidir(valor) {
    try { localStorage.setItem(KEY, valor); } catch (err) {}
    banner.setAttribute('data-show', 'false');
    if (valor === 'accept') carregarMedicao();
  }
  function carregarMedicao() {
    // Só carrega scripts de medição APÓS o consentimento (exigência LGPD).
    // Exemplo: inserir aqui GA4 / Meta Pixel.
  }
  if (banner) {
    var salvo = null;
    try { salvo = localStorage.getItem(KEY); } catch (err) {}
    if (!salvo) banner.setAttribute('data-show', 'true');
    else if (salvo === 'accept') carregarMedicao();
    document.getElementById('lgpd-accept').addEventListener('click', function () { decidir('accept'); });
    document.getElementById('lgpd-reject').addEventListener('click', function () { decidir('reject'); });
  }

  /* ---------- Reveal on scroll ---------- */
  var alvos = document.querySelectorAll('.card, .seg, .plan, .quote, .steps li, .timeline li');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.15 });
    alvos.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }
})();
