import {initial,catalogue,day,addDays,fixed,propose,accept,record,studied,remaining,overlaps,validate} from './core.mjs';
import {load,save} from './store.mjs';
import {outlines} from './catalogue.mjs';
import {syllabus,syncRemote} from './extras.mjs';
const view=document.querySelector('#view'),dialog=document.querySelector('dialog'),form=document.querySelector('#form');
const sections=['Home','Calendario','Materie','Progressi','Strumenti'];
let state,tab=sections.includes(decodeURI(location.hash.slice(1)))?decodeURI(location.hash.slice(1)):'Home',selected=day(),span=7,preview,noticeTimer,busy=false;
function el(tag,content='',cls=''){const n=document.createElement(tag);if(cls)n.className=cls;if(content instanceof Node)n.append(content);else n.textContent=content;return n}
function notify(message){clearTimeout(noticeTimer);document.querySelector('#notice').textContent=message;noticeTimer=setTimeout(()=>document.querySelector('#notice').textContent='',6500)}
function button(label,fn,cls=''){const b=el('button',label,cls);b.type='button';b.onclick=()=>Promise.resolve().then(fn).catch(e=>notify(e.message));return b}
function box(...children){const n=el('article');n.append(...children);return n}
function row(...children){const n=el('div','','row');n.append(...children);return n}
const meta=text=>el('p',text,'meta');
const heading=text=>view.append(el('h2',text));
const task=id=>state.tasks.find(t=>t.id===id);
const course=id=>state.courses.find(c=>c.id===id);
const time=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
const mins=t=>Number(t.split(':')[0])*60+Number(t.split(':')[1]);
const when=date=>new Date(date+'T12:00:00').toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long'});
async function change(fn){
 if(busy)throw Error('Salvataggio in corso.');busy=true;
 try{const copy=structuredClone(state);fn(copy);state=await save(copy,state.revision);preview=null;render()}finally{busy=false}
}
function field(name,title,type='text',value='',opts={}){
 const l=el('label',title),n=el(type==='select'?'select':type==='textarea'?'textarea':'input');n.name=name;
 if(n.tagName==='INPUT')n.type=type;
 if(opts.choices)for(const [v,label] of opts.choices){const o=el('option',label);o.value=v;n.append(o)}
 n.value=value;for(const k of ['min','max','required','step'])if(k in opts)n[k]=opts[k];l.append(n);return l;
}
function edit(title,fields,action,submit='Salva'){
 form.replaceChildren(el('h2',title),...fields);const ok=el('button',submit,'primary');ok.type='submit';form.append(row(ok,button('Annulla',()=>dialog.close())));
 form.onsubmit=async e=>{e.preventDefault();if(ok.disabled)return;ok.disabled=true;try{await action(Object.fromEntries(new FormData(form)));dialog.close()}catch(err){notify(err.message)}finally{ok.disabled=false}};dialog.showModal()
}
function nav(next){if(next!==tab)location.hash=next}
window.onhashchange=()=>{tab=sections.includes(decodeURI(location.hash.slice(1)))?decodeURI(location.hash.slice(1)):'Home';if(state)render()};
function render(){
 const bar=document.querySelector('nav');bar.replaceChildren(...sections.map(n=>{const b=button(n,()=>nav(n));if(n===tab)b.setAttribute('aria-current','page');return b}));
 view.replaceChildren();({Home:home,Calendario:calendar,Materie:courses,Progressi:analytics,Strumenti:tools})[tab]();
}
function log(id,slot){
 const t=task(id),timer=state.timer?.task===id?state.timer:null;
 const now=new Date(),start=timer?new Date(timer.start):new Date(now-50*60000);
 const input=d=>day(d)+'T'+time(d.getHours()*60+d.getMinutes());
 edit('Registra studio',[el('p',t.title),field('start','Inizio','datetime-local',input(start),{required:true}),field('end','Fine','datetime-local',input(now),{required:true}),
 field('progress','Argomento completato in totale (%)','number',t.progress,{min:t.progress,max:100,required:true}),field('rating','Comprensione percepita (1–5)','number',3,{min:1,max:5,required:true}),field('notes','Argomenti svolti e difficoltà','textarea'),field('review','Programma un ripasso','checkbox')],f=>change(s=>{
 record(s,id,+new Date(f.start),+new Date(f.end),+f.progress,f.notes,+f.rating,'review'in f);
 if(timer)s.timer=null;if(slot)s.plan.find(p=>p.id===slot.id&&p.status==='planned').status='done';
 if(task(id)&&s.tasks.find(t=>t.id===id).done)for(const p of s.plan.filter(p=>p.task===id&&p.status==='planned'))p.status='skipped';
 }));
}
function entry(p){
 const card=box(meta(time(p.start)+' – '+time(p.end)),el('strong',task(p.task).title),meta(course(task(p.task).course).course));
 if(p.status==='planned')card.append(row(button('Registra',()=>log(p.task,p)),button('Sposta',()=>move(p)),button('Salta',()=>change(s=>s.plan.find(x=>x.id===p.id&&x.status==='planned').status='skipped'))));
 else card.append(meta(({done:'Registrata',skipped:'Saltata',missed:'Da recuperare'})[p.status]));return card;
}
function home(){
 const d=day(),plan=state.plan.filter(p=>p.date===d&&p.status==='planned'),actual=state.sessions.filter(x=>day(new Date(x.end))===d).reduce((a,x)=>a+x.minutes,0);
 const hero=el('section','','hero');hero.append(el('small',when(d)),el('h1','Oggi'),el('p',plan.reduce((n,p)=>n+p.end-p.start,0)+' min in agenda · '+actual+' min registrati'));view.append(hero);
 if(state.timer)view.append(box(el('b','Timer attivo · '+task(state.timer.task).title),button('Termina e registra',()=>log(state.timer.task))));
 heading('Agenda');for(const e of fixed(state,d))view.append(box(el('strong',e.title),meta(time(e.start)+' – '+time(e.end))));
 view.append(...plan.map(entry));if(!plan.length)view.append(meta('Nessuna sessione di studio pianificata per oggi.'),button('Pianifica studio',()=>nav('Calendario'),'primary'));
 heading('Prossime scadenze');const deadlines=[...state.courses.filter(c=>c.enabled&&c.exam).map(c=>[c.exam,c.title]),...state.tasks.filter(t=>!t.done&&t.due).map(t=>[t.due,t.title])].sort(([a],[b])=>a.localeCompare(b));
 if(!deadlines.length)view.append(meta('Aggiungi la data personale di un esame in Materie.'));for(const [d,title] of deadlines.slice(0,5))view.append(box(el('b',title),meta(when(d))));
 const late=state.plan.filter(p=>p.status==='missed'||p.status==='planned'&&p.date<d).length;view.append(meta(late+' sessioni da verificare · '+weekly()+' min studiati negli ultimi sette giorni.'));
}
function calendar(){
 view.append(el('h1','Calendario'));const date=field('day','Dal giorno','date',selected,{required:true}),period=field('period','Vista','select',span,{choices:[[1,'Giorno'],[7,'Settimana'],[30,'30 giorni']]});
 date.onchange=e=>{if(e.target.value){selected=e.target.value;preview=null;render()}};period.onchange=e=>{span=+e.target.value;render()};
 view.append(row(date,period),row(button('Proponi piano',()=>{const first=selected<day()?day():selected,now=new Date();preview=propose(state,first,28,first===day()?now.getHours()*60+now.getMinutes():0);render()},'primary'),button('Aggiungi impegno',eventForm),button('Disponibilità',settings)));
 if(preview){const panel=box(el('h2','Proposta · 28 giorni'),meta(preview.slots.length+' sessioni nuove · '+preview.unplaced.reduce((n,x)=>n+x[1],0)+' min senza spazio · '+preview.late.length+' sessioni oltre scadenza'));
 for(const p of preview.slots)panel.append(el('p',when(p.date)+' · '+time(p.start)+'–'+time(p.end)+' · '+task(p.task).title));
 panel.append(row(button('Accetta piano',()=>change(s=>{for(const p of preview.missed)s.plan.find(x=>x.id===p.id&&x.status==='planned').status='missed';s.plan.push(...preview.slots)}),'primary'),button('Scarta',()=>{preview=null;render()})));view.append(panel)}
 for(let i=0;i<span;i++){const d=addDays(selected,i),events=fixed(state,d),plan=state.plan.filter(p=>p.date===d);
 if(i&&span>7&&!events.length&&!plan.length)continue;heading(when(d));for(const e of events)view.append(meta(time(e.start)+'–'+time(e.end)+' · '+e.title));view.append(...plan.map(entry));if(!events.length&&!plan.length)view.append(meta('Libero'))}
}
function move(p){
 edit('Sposta sessione',[field('date','Giorno','date',p.date,{required:true,min:day()}),field('time','Inizio','time',time(p.start),{required:true})],f=>change(s=>{
 const start=mins(f.time),next={...p,date:f.date,start,end:start+p.end-p.start};
 if(start<s.settings.from||next.end>s.settings.to||[...fixed(s,f.date),...s.plan.filter(q=>q.id!==p.id&&q.status==='planned'&&q.date===f.date)].some(e=>overlaps(e,next)))throw Error('La fascia scelta è occupata o fuori disponibilità.');
 Object.assign(s.plan.find(q=>q.id===p.id&&q.status==='planned'),next);
 }));
}
function eventForm(){edit('Impegno personale',[field('title','Titolo','text','',{required:true}),field('date','Data','date',selected,{required:true}),field('start','Inizio','time','09:00',{required:true}),field('end','Fine','time','10:00',{required:true})],f=>change(s=>{
 const e={title:f.title,date:f.date,start:mins(f.start),end:mins(f.end)};if(e.end<=e.start)throw Error('Controlla gli orari.');
 if(s.plan.some(p=>p.date===e.date&&p.status==='planned'&&overlaps(e,p)))throw Error('Sposta prima la sessione di studio sovrapposta.');s.events.push(e)
}))}
function settings(){const c=state.settings;edit('Disponibilità e lezioni',[field('from','Dalle','time',time(c.from),{required:true}),field('to','Alle','time',time(c.to),{required:true}),field('limit','Minuti di studio al giorno','number',c.limit,{min:1,max:1440,required:true}),field('commute','Viaggio per tratta (min)','number',c.commute,{min:0,max:360,required:true}),field('buffer','Margine per tratta (min)','number',c.buffer,{min:0,max:120,required:true}),
 field('termStart','Inizio lezioni','date',c.termStart,{required:true}),field('termEnd','Fine lezioni','date',c.termEnd,{required:true}),field('lessons','Lezioni · giorno (0 domenica), inizio, fine, titolo','textarea',c.lessons.map(([d,a,b,t])=>[d,time(a),time(b),t].join(', ')).join('\n'))],f=>change(s=>{
 const lessons=f.lessons.split('\n').filter(x=>x.trim()).map(line=>{const [d,a,b,...t]=line.split(',').map(v=>v.trim());return [+d,mins(a),mins(b),t.join(', ')]});
 Object.assign(s.settings,{from:mins(f.from),to:mins(f.to),limit:+f.limit,commute:+f.commute,buffer:+f.buffer,termStart:f.termStart,termEnd:f.termEnd,lessons});
 for(const p of s.plan.filter(p=>p.status==='planned'))if(fixed(s,p.date).some(e=>overlaps(p,e))||p.start<s.settings.from||p.end>s.settings.to)p.status='skipped';
}))}
function taskForm(c,t){
 edit(t?'Modifica attività':'Nuova attività',[field('title','Argomento o materiale','text',t?.title,{required:true}),field('estimate','Stima totale (min)','number',t?.estimate??50,{min:1,max:100000,required:true}),field('kind','Tipo','select',t?.kind??'Studio',{choices:['Studio','Lettura','Paper','Ripasso','Simulazione'].map(x=>[x,x])}),field('priority','Priorità (1–5)','number',t?.priority??2,{min:1,max:5,required:true}),field('due','Scadenza','date',t?.due),field('after','Dipende da','select',t?.after??'',{choices:[['','Nessuna'],...state.tasks.filter(x=>x.course===c.id&&x.id!==t?.id).map(x=>[x.id,x.title])]})],f=>change(s=>{
 let id=f.after;const seen=new Set([t?.id]);while(id){if(seen.has(id))throw Error('Dipendenza circolare.');seen.add(id);id=task(id)?.after}
 const item=t?s.tasks.find(x=>x.id===t.id):{id:crypto.randomUUID(),course:c.id,progress:0,done:false};Object.assign(item,f,{estimate:+f.estimate,priority:+f.priority});if(!t)s.tasks.push(item)
 }));
}
function courses(){
 view.append(el('h1','Materie'));for(const c of state.courses){
 const info=outlines[c.id]||['',[],[]],n=el('details'),list=state.tasks.filter(t=>t.course===c.id);n.append(el('summary',c.course+' · '+c.teacher),el('h3',c.title),meta(c.credits+' CFU · '+(c.exam?when(c.exam):'Data personale da inserire')),el('p',info[0]),meta(info[2].join(' · ')));
 const source=catalogue.find(x=>x.id===c.id)?.source;if(source){const link=el('a','Syllabus ufficiale Unibo');link.href=source;link.target='_blank';link.rel='noopener';n.append(link)}
 n.append(row(button('Esame e carico',()=>edit('Esame personale',[field('exam','Data esame o consegna','date',c.exam),field('enabled','Prepara in questa sessione','select',String(c.enabled),{choices:[['true','Sì'],['false','No']]})],f=>change(s=>{const x=s.courses.find(x=>x.id===c.id);x.exam=f.exam;x.enabled=f.enabled==='true';if(!x.enabled)for(const p of s.plan.filter(p=>p.status==='planned'&&task(p.task).course===c.id))p.status='skipped'}))),
 button('Aggiungi attività',()=>taskForm(c)),button('Importa syllabus',()=>importForm(c))));
 for(const t of list){const card=box(el('strong',t.title),meta(t.kind+' · '+t.progress+'% · '+studied(state,t.id)+' min registrati · stima '+t.estimate+' min'),row(button('Modifica',()=>taskForm(c,t)),button('Registra',()=>log(t.id))));
 if(!t.done&&!state.timer)card.append(button('Avvia timer',()=>change(s=>{s.timer={task:t.id,start:Date.now()}})));n.append(card)}
 view.append(n)}
}
async function importForm(c){
 let draft='';try{draft=await syllabus(c.id)}catch{notify('Recupero online indisponibile. Incolla gli argomenti da Unibo o Virtuale.')}
 edit('Conferma attività dal syllabus',[el('p','Controlla la bozza. Ogni riga confermata diventa una tua attività. Le stime iniziali sono modificabili.'),field('lines','Argomenti o letture, uno per riga','textarea',draft,{required:true})],f=>change(s=>{
 const known=new Set(s.tasks.filter(t=>t.course===c.id).map(t=>t.title));for(const title of f.lines.split('\n').map(x=>x.trim()).filter(Boolean)){if(known.has(title))continue;known.add(title);s.tasks.push({id:crypto.randomUUID(),course:c.id,title,estimate:50,progress:0,done:false,priority:2,kind:'Studio',after:'',due:'',source:'Confermato manualmente'})}
 }),'Importa righe confermate')
}
function weekly(){const start=addDays(day(),-6);return state.sessions.filter(x=>day(new Date(x.end))>=start).reduce((n,x)=>n+x.minutes,0)}
function analytics(){
 view.append(el('h1','Progressi'),box(el('span',String(weekly())+' min','num'),meta('Studio registrato negli ultimi sette giorni')));
 for(const c of state.courses){const list=state.tasks.filter(t=>t.course===c.id),done=list.filter(t=>t.done),read=list.filter(t=>t.kind==='Lettura'),total=list.reduce((n,t)=>n+t.estimate,0),pct=total?Math.round(list.reduce((n,t)=>n+t.estimate*t.progress,0)/total):0;
 const bar=el('progress');bar.max=100;bar.value=pct;bar.setAttribute('aria-label','Avanzamento ponderato '+pct+'%');
 view.append(box(el('strong',c.title),meta(done.length+'/'+list.length+' attività · '+read.filter(t=>t.done).length+'/'+read.length+' letture · '+list.reduce((n,t)=>n+studied(state,t.id),0)+' min studiati'),bar,meta(pct+'% del carico stimato · '+list.reduce((n,t)=>n+remaining(t),0)+' min residui')))}
 heading('Diario');for(const x of state.sessions.slice(-20).reverse())view.append(box(el('strong',task(x.task).title),meta(when(day(new Date(x.end)))+' · '+x.minutes+' min · comprensione '+x.rating+'/5'),el('p',x.notes)));
}
function download(data,name){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=el('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function tools(){
 view.append(el('h1','Strumenti'),box(el('h3','Appunti'),el('p',state.notes),button('Modifica note',()=>edit('Appunti',[field('notes','Testo','textarea',state.notes)],f=>change(s=>s.notes=f.notes)))));
 const file=field('backup','Ripristina un backup JSON','file');file.lastChild.accept='.json';file.onchange=async e=>{try{const parsed=validate(JSON.parse(await e.target.files[0].text()));if(confirm('Sostituire i dati locali con il backup selezionato?'))await change(s=>Object.assign(s,parsed))}catch(err){notify(err.message)}};
 view.append(box(el('h3','Backup e ripristino'),button('Esporta backup',()=>download(state,'mirees-'+day()+'.json')),file,button('Sincronizzazione privata',()=>syncRemote({state,change,edit,field,notify}))));
 if(!window.Capacitor?.isNativePlatform?.()){const link=el('a','Apri biblioteca, tesi ed Exam Mode originali');link.href='../index.html';view.append(box(link))}
 if(window.Capacitor?.isNativePlatform?.())view.append(button('Attiva promemoria del piano',remind));
}
async function remind(){
 const plugin=window.Capacitor.Plugins.LocalNotifications;
 if((await plugin.requestPermissions()).display!=='granted')throw Error('Permesso notifiche assente.');
 const scheduled=state.plan.filter(p=>p.status==='planned').map(p=>({p,at:new Date(p.date+'T'+time(p.start))})).filter(x=>x.at>Date.now()).slice(0,50);
 const pending=await plugin.getPending();if(pending.notifications.length)await plugin.cancel(pending);
 if(scheduled.length)await plugin.schedule({notifications:scheduled.map(({p,at},i)=>({id:i+1,title:'MIREES · Sessione di studio',body:task(p.task).title,schedule:{at}}))});notify(scheduled.length+' promemoria programmati.')
}
try{state=await load();render();if(window.Capacitor?.isNativePlatform?.()){window.Capacitor.Plugins.App.addListener('backButton',()=>{if(dialog.open)dialog.close();else if(tab!=='Home')nav('Home');else window.Capacitor.Plugins.App.exitApp()})}else if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>notify('Cache offline non disponibile.'))}catch(e){view.textContent='Apertura non riuscita. '+e.message}
