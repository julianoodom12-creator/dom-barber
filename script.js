/* ============================================================
   DOM BARBER — script.js
   Header scrolled · RGB toggle · Ano no rodapé · PWA install
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 1. HEADER SCROLLED ---------- */
  const header = document.getElementById('header');
  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 2. RGB TOGGLE (fundo animado do hero) ---------- */
  const rgbToggle = document.getElementById('rgbToggle');
  const rgbState  = document.getElementById('rgbState');
  const heroBg    = document.getElementById('heroBg');
  let rgbOn = true;

  // aplica estado inicial
  if (heroBg) heroBg.classList.add('rgb-on');

  if (rgbToggle && heroBg && rgbState) {
    rgbToggle.addEventListener('click', () => {
      rgbOn = !rgbOn;
      heroBg.classList.toggle('rgb-on', rgbOn);
      rgbState.textContent = rgbOn ? 'Ligado' : 'Desligado';
      rgbState.style.color = rgbOn ? '#c9a961' : '#7a766e';
    });
  }

  /* ---------- 3. ANO DINÂMICO NO RODAPÉ ---------- */
  const ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* ---------- 4. PWA — BOTÃO "INSTALAR AGORA" ---------- */
  let deferredPrompt = null;
  const btnInstall = document.getElementById('btnInstall');

  window.addEventListener('beforeinstallprompt', (e) => {
    // Chrome/Edge — intercepta o prompt nativo
    e.preventDefault();
    deferredPrompt = e;
    if (btnInstall) btnInstall.hidden = false;
  });

  if (btnInstall) {
    btnInstall.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        btnInstall.hidden = true;
      }
      deferredPrompt = null;
    });
  }

  // esconde o botão quando o app já está instalado (rodando em modo standalone)
  window.addEventListener('appinstalled', () => {
    if (btnInstall) btnInstall.hidden = true;
    deferredPrompt = null;
  });

  if (window.matchMedia('(display-mode: standalone)').matches) {
    if (btnInstall) btnInstall.hidden = true;
  }

  /* ---------- 5. SERVICE WORKER (cache offline) ---------- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }

  /* ---------- 6. SMOOTH SCROLL (fallback pra Safari antigo) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---------- 7. FADE-IN AO ROLAR (leve) ---------- */
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 })
    : null;

  if (io) {
    document.querySelectorAll('.card, .install-card, .info-block').forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transition = 'opacity .5s ease, transform .5s ease';
      io.observe(el);
    });
  }

})();