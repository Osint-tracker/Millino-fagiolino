import {catalogue,validate} from './core.mjs';
export async function syllabus(id){
 const source=catalogue.find(x=>x.id===id)?.source;if(!source)throw Error('Fonte assente');
 let html;
 if(window.Capacitor?.isNativePlatform?.()){
 const result=await window.Capacitor.Plugins.CapacitorHttp.get({url:source,responseType:'text',readTimeout:8000,connectTimeout:8000});if(result.status!==200)throw Error('Fonte indisponibile');html=result.data
 }else{const result=await fetch('/api/syllabus?id='+encodeURIComponent(id),{signal:AbortSignal.timeout(10000)});if(!result.ok)throw Error('Fonte indisponibile');html=(await result.json()).html}
 // Parse the catalogue as inert template content; never attach external HTML to the document.
 const template=document.createElement('template');template.innerHTML=html;
 const headings=[...template.content.querySelectorAll('h2')];const result=[];
 for(const h of headings.filter(h=>/course contents|readings\/bibliography/i.test(h.textContent))){
 for(let n=h.nextElementSibling;n&&!/^H[12]$/.test(n.tagName);n=n.nextElementSibling){
 const lines=n.matches('ul,ol')?[...n.children]:[n];
 for(const item of lines){const line=item.textContent.replace(/\s+/g,' ').trim();if(line.length>4&&line.length<450)result.push(line)}
 }}
 if(!result.length)throw Error('Inserimento manuale necessario');return [...new Set(result)].join('\n')
}
const enc=new TextEncoder(),dec=new TextDecoder(),base=b=>btoa(Array.from(new Uint8Array(b),n=>String.fromCharCode(n)).join('')),bytes=b=>Uint8Array.from(atob(b),c=>c.charCodeAt(0));
async function key(pass,salt){return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',iterations:250000,salt},await crypto.subtle.importKey('raw',enc.encode(pass),'PBKDF2',false,['deriveKey']),{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function encrypt(state,pass){const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));return JSON.stringify({version:1,salt:base(salt),iv:base(iv),data:base(await crypto.subtle.encrypt({name:'AES-GCM',iv},await key(pass,salt),enc.encode(JSON.stringify(state))))})}
async function decrypt(payload,pass){const {iv,salt,data}=payload;return validate(JSON.parse(dec.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(iv)},await key(pass,bytes(salt)),bytes(data)))))}
const revisions=new Map();
export function syncRemote({state,change,edit,field,notify}){
 edit('Sincronizza via WebDAV',[field('url','URL HTTPS del file privato (server con CORS ed ETag)','url','',{required:true}),field('user','Nome utente'),field('token','Password WebDAV','password'),field('pass','Passphrase di cifratura del backup','password','',{required:true}),field('mode','Operazione','select','pull',{choices:[['pull','Scarica e verifica'],['push','Carica modifiche locali']]})],async f=>{
 const url=new URL(f.url);if(url.protocol!=='https:'||url.username||url.password)throw Error('Inserisci un URL HTTPS senza credenziali.');
 const headers=f.user?{Authorization:'Basic '+base(enc.encode(f.user+':'+f.token))}:{};
 const request=(options)=>fetch(url,{...options,headers:{...headers,...options.headers},cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)});
 if(f.mode==='pull'){const r=await request({method:'GET'});if(!r.ok)throw Error('Download non riuscito ('+r.status+').');
 const tag=r.headers.get('ETag');if(!tag||tag.startsWith('W/'))throw Error('Il server deve fornire un ETag forte accessibile via CORS.');
 const remote=await decrypt(await r.json(),f.pass);if(!confirm('Ripristinare '+remote.tasks.length+' attività e '+remote.sessions.length+' sessioni dal server?'))return;
 await change(s=>Object.assign(s,remote));revisions.set(url.href,tag)
 }else{if(f.pass.length<12)throw Error('Usa una passphrase di almeno 12 caratteri.');const tag=revisions.get(url.href);
 const r=await request({method:'PUT',headers:{'Content-Type':'application/json',...(tag?{'If-Match':tag}:{'If-None-Match':'*'})},body:await encrypt(state,f.pass)});
 if(!r.ok)throw Error(r.status===412?'Il file remoto esiste o è cambiato. Esporta un backup prima di scaricarlo.':'Caricamento fallito ('+r.status+').');
 const next=r.headers.get('ETag');if(next&&!next.startsWith('W/'))revisions.set(url.href,next);else revisions.delete(url.href)}
 notify('Sincronizzazione completata.')
 },'Continua')
}
