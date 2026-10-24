// Network first so updates arrive, but give up after 2.5 s and open the saved copy
// (so a weak signal never leaves you waiting). No network at all → saved copy immediately.
// Only the app's own files go through here; place-name and weather requests are left alone.
const C='sahm-2.0';
const FILES=['./','index.html','manifest.json','icon.png','icon-180.png','logo.png','moon.png','plex-ar-400.woff2','plex-ar-700.woff2','plex-la-400.woff2','plex-la-700.woff2'];
const WAIT=2500;
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
  e.respondWith((async()=>{
    const cached=await caches.match(e.request,{ignoreSearch:true});
    const net=fetch(e.request).then(r=>{
      if(r&&r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp))}
      return r});
    if(!cached)return net;                       // nothing saved yet: must use the network
    const timeout=new Promise(res=>setTimeout(()=>res(cached),WAIT));
    return Promise.race([net.catch(()=>cached),timeout]); // late network reply still refreshes the cache
  })());
});
