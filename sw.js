// The app opens straight from the saved copy (instant, no flicker, works offline).
// Updates still arrive: every new version changes this file (cache name below), the phone notices it,
// downloads the new files in the background, and the app offers to switch.
// Only the app's own files go through here; place-name and weather requests are left alone.
const C='sahm-3.9.5';
const FILES=['./','index.html','manifest.json','icon.png','icon-180.png','logo.png','moon.png','wamd-push.js','plex-ar-400.woff2','plex-ar-700.woff2','plex-la-400.woff2','plex-la-700.woff2','wamd-stats.js','wamd-cfg.js','privacy.html','wamdarc-light.png','wamdarc-dark.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES.map(u=>new Request(u,{cache:'reload'})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
  e.respondWith((async()=>{
    const cached=await caches.match(e.request,{ignoreSearch:true})||(e.request.mode==='navigate'?await caches.match('index.html'):null);
    if(cached)return cached;                     // saved copy: open instantly
    try{const r=await fetch(e.request);if(r&&r.ok&&FILES.some(f=>new URL(f,self.location).pathname===new URL(e.request.url).pathname)){const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp))}return r}
    catch(err){return caches.match('index.html')}
  })());
});

/* notifications from the WAMD ARC push server */
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(err){d={body:e.data?e.data.text():''}}
  const ar=d.lang!=='en';
  e.waitUntil(self.registration.showNotification(d.title||(ar?'سهم':'SAHM'),{body:d.body||'',tag:d.tag||'sahm',lang:ar?'ar':'en',dir:ar?'rtl':'ltr',icon:'icon-180.png',badge:'icon-180.png',data:{url:d.url||'./'}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const url=(e.notification.data&&e.notification.data.url)||'./';
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{for(const c of list)if('focus' in c)return c.focus();return self.clients.openWindow(url)}))});
