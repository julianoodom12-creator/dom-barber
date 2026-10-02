/* ============================================================
   DOM BARBER — Service Worker
   Cache offline: guarda HTML/CSS/JS pra abrir sem internet
   ============================================================ */

const CACHE_NAME = 'dombarber-v1';

/* arquivos que ficam guardados no cache */
const PRECACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png'
];

/* ---------- INSTALL: pré-cacheia os arquivos ---------- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      /* addAll falha se UM arquivo não existir — usamos add() individual
         pra que a ausência de um PNG não quebre o SW inteiro */
      return Promise.all(
        PRECACHE.map((url) =>
          cache.add(url).catch(() => { /* ignora arquivo faltante */ })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

/* ---------- ACTIVATE: limpa caches antigos ---------- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ---------- FETCH: cache-first pra estáticos, network-first pra resto ---------- */
self.addEventListener('fetch', (event) => {
  const req = event.request;

  /* só lida com GET */
  if (req.method !== 'GET') return;

  /* não intercepta WhatsApp, Google Fonts ou origens externas */
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      /* cache-first pros arquivos locais */
      if (cached) return cached;

      /* senão busca na rede e guarda uma cópia */
      return fetch(req)
        .then((res) => {
          /* só guarda respostas válidas */
          if (!res || res.status !== 200 || res.type !== 'basic') return res;
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => {
          /* offline + não está em cache: devolve a home como fallback */
          if (req.mode === 'navigate') return caches.match('./index.html');
        });
    })
  );
});