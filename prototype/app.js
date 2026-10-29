const daysAgo = count => new Date(Date.now() - count * 86400000).toISOString();
const demoSessions = [
  { id: 'demo-1', routine: 'Upper Body Power', endedAt: daysAgo(1), minutes: 55, sets: 13, xp: 100, demo: true },
  { id: 'demo-2', routine: 'Leg Day', endedAt: daysAgo(3), minutes: 60, sets: 13, xp: 100, demo: true },
  { id: 'demo-3', routine: 'Pull & Back', endedAt: daysAgo(5), minutes: 50, sets: 10, xp: 100, demo: true }
];
const defaultData = {
  onboard: 0, onboardingReturn: 'login', screen: 'onboarding', tab: 'home', name: 'Alex', goal: 'Allenarmi 3 volte a settimana',
  level: 7, xp: 740, workouts: 24, streak: 5, minutes: 1380, period: 'week',
  selectedRoutine: 0, activeRoutine: null, startedAt: null, completed: {}, activeSets: {}, sessions: demoSessions,
  routines: [
    { name: 'Upper Body Power', focus: 'Petto · Spalle · Tricipiti', duration: 55, color: '💪', exercises: [
      { name: 'Panca piana', detail: '4 serie · 8 ripetizioni', sets: 4, reps: 8, weight: 60 },
      { name: 'Shoulder press', detail: '3 serie · 10 ripetizioni', sets: 3, reps: 10, weight: 20 },
      { name: 'Alzate laterali', detail: '3 serie · 12 ripetizioni', sets: 3, reps: 12, weight: 8 },
      { name: 'Pushdown tricipiti', detail: '3 serie · 12 ripetizioni', sets: 3, reps: 12, weight: 25 }
    ]},
    { name: 'Leg Day', focus: 'Gambe · Glutei · Core', duration: 60, color: '⚡', exercises: [
      { name: 'Squat', detail: '4 serie · 8 ripetizioni', sets: 4, reps: 8, weight: 70 },
      { name: 'Affondi', detail: '3 serie · 10 ripetizioni', sets: 3, reps: 10, weight: 16 },
      { name: 'Leg curl', detail: '3 serie · 12 ripetizioni', sets: 3, reps: 12, weight: 35 },
      { name: 'Plank', detail: '3 serie · 45 secondi', sets: 3, reps: 45, weight: 0 }
    ]},
    { name: 'Pull & Back', focus: 'Schiena · Bicipiti', duration: 50, color: '↗', exercises: [
      { name: 'Lat machine', detail: '4 serie · 10 ripetizioni', sets: 4, reps: 10, weight: 45 },
      { name: 'Rematore', detail: '3 serie · 10 ripetizioni', sets: 3, reps: 10, weight: 35 },
      { name: 'Curl manubri', detail: '3 serie · 12 ripetizioni', sets: 3, reps: 12, weight: 12 }
    ]}
  ]
};
let saved = null;
try { saved = JSON.parse(localStorage.getItem('corefit-demo') || 'null'); } catch { /* A corrupted demo can start fresh. */ }
let state = saved ? { ...defaultData, ...saved } : JSON.parse(JSON.stringify(defaultData));
if (!Array.isArray(state.routines)) state.routines = JSON.parse(JSON.stringify(defaultData.routines));
if (!Array.isArray(state.sessions)) state.sessions = JSON.parse(JSON.stringify(demoSessions));
if (!state.activeSets || typeof state.activeSets !== 'object') state.activeSets = {};
const app = document.getElementById('app');
const e = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const save = () => { try { localStorage.setItem('corefit-demo', JSON.stringify(state)); } catch { /* The demo remains usable without browser storage. */ } };
const pages = new Set(['onboarding','login','home','routines','createRoutine','detail','workout','stats','profile','editProfile','finished']);
const route = () => window.location.hash.replace(/^#\//,'');
if (pages.has(route())) state.screen = route();
else { try { history.replaceState(null,'',`#/${state.screen}`); } catch { /* Routing still works in memory. */ } }
const go = screen => {
  if (!pages.has(screen)) return;
  state.screen = screen;
  if (['home','routines','stats','profile'].includes(screen)) state.tab = screen;
  save();
  if (route() !== screen) { try { history.pushState(null,'',`#/${screen}`); } catch { /* Routing still works in memory. */ } }
  render();
};
const nav = () => `<nav class="bottom-nav" aria-label="Navigazione principale">${[['home','⌂','Home'],['routines','▦','Routine'],['stats','▥','Statistiche'],['profile','◉','Profilo']].map(([id,icon,label])=>`<button data-tab="${id}" class="${state.tab===id?'active':''}" aria-label="${label}" aria-current="${state.tab===id?'page':'false'}"><span class="nav-symbol">${icon}</span>${label}</button>`).join('')}</nav>`;
const shell = (content, showNav=true) => `<section class="screen">${content}</section>${showNav?nav():''}`;
const brand = `<div class="brand">CORE<span>FIT</span></div>`;
const top = (right='') => `<div class="topline">${brand}${right}</div>`;
const inPeriod = (date, period) => {
  const day = new Date(date);
  const now = new Date();
  if (period === 'month') return day.getFullYear() === now.getFullYear() && day.getMonth() === now.getMonth();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return day >= start;
};
const periodSessions = period => state.sessions.filter(session => inPeriod(session.endedAt, period));
const xpGoal = () => 900 + Math.max(0, state.level - 7) * 250;
const workoutProgress = () => {
  const routine = state.routines[state.activeRoutine ?? 0];
  const total = routine.exercises.reduce((count, item) => count + item.sets, 0);
  const done = Object.values(state.completed).filter(Boolean).length;
  return { routine, total, done };
};
function onboarding(){
  const slides = [
    ['Ogni allenamento è un passo avanti.','Tieni traccia delle tue sessioni e rendi visibili i tuoi progressi.'],
    ['Le tue routine, a modo tuo.','Organizza gli esercizi e concentrati su quello che conta.'],
    ['Allenati. Guadagna XP. Evolvi.','Trasforma la costanza in livelli, traguardi e motivazione.']
  ];
  const [title, desc] = slides[state.onboard];
  return shell(`<div class="onboard-screen" style="min-height:100%">${brand}<div class="onboard-art art-${state.onboard}" aria-hidden="true"></div><div class="eyebrow">Benvenuto in CoreFit</div><h1 class="title" style="font-size:34px">${title}</h1><p class="sub">${desc}</p><div class="dots">${slides.map((_,i)=>`<span class="${i===state.onboard?'active':''}"></span>`).join('')}</div><div class="spacer"></div><button class="primary" data-action="next-onboard">${state.onboard===2?'Inizia ora':'Continua'}</button><button class="small-btn" data-action="skip-onboard" style="align-self:center;margin-top:12px">Salta introduzione</button></div>`,false);
}
function login(){return shell(`<div class="auth-screen" style="min-height:100%">${brand}<div class="eyebrow" style="margin-top:65px">Benvenuto</div><h1 class="title">Il tuo percorso<br>inizia qui.</h1><p class="sub">Accedi per continuare il tuo allenamento.</p><form id="login-form"><label class="field"><span>Email</span><input name="email" type="email" placeholder="nome@email.com" autocomplete="email" required></label><label class="field"><span>Password</span><input name="password" type="password" placeholder="••••••••" autocomplete="current-password" required minlength="4"></label><button class="primary" type="submit" style="margin-top:10px">Accedi</button></form><div class="spacer"></div><button class="secondary" data-action="demo-login">Esplora la demo</button><p class="demo-note">Prototipo: l’accesso è simulato. Nessun dato viene inviato a un server.</p></div>`,false)}
function home(){
  const first = state.routines[0];
  const thisWeek = periodSessions('week');
  const weekMinutes = thisWeek.reduce((sum, session) => sum + session.minutes, 0);
  const goal = xpGoal();
  return shell(`${top(`<button class="avatar" data-action="profile" aria-label="Apri profilo">${e(state.name[0]||'A')}</button>`)}
    <div class="eyebrow">${new Intl.DateTimeFormat('it-IT',{weekday:'long',day:'numeric',month:'long'}).format(new Date())} · il tuo percorso</div>
    <h1 class="title">Ciao, ${e(state.name)} <span style="color:#c9fa64">✳</span></h1>
    <p class="sub">Continua così: ogni sessione conta.</p>
    ${state.activeRoutine !== null && state.routines[state.activeRoutine] ? `<div class="notice"><strong>Allenamento in corso</strong><p style="margin:5px 0 10px">${e(state.routines[state.activeRoutine].name)} è pronto per essere ripreso.</p><button class="small-btn" data-action="resume-workout">Riprendi allenamento →</button></div>` : ''}
    <div class="section-heading"><h2>Il prossimo passo</h2><span class="pill">✦ Livello ${state.level}</span></div>
    <div class="hero-card"><div class="eyebrow">Allenamento consigliato</div><h2>${e(first.name)}</h2><p>${e(first.focus)} · ${first.duration} min</p><button data-routine="0">Visualizza routine ↗</button></div>
    <div class="section-heading"><h2>La tua settimana</h2><button class="text-action" data-tab="stats">Vedi statistiche →</button></div>
    <div class="grid-2"><div class="stat-card"><span class="stat-icon">▥</span><strong>${thisWeek.length}</strong><small>Allenamenti</small></div><div class="stat-card"><span class="stat-icon">◷</span><strong>${weekMinutes}</strong><small>Minuti attivi</small></div></div>
    <div class="section-heading"><h2>Livello ${state.level}</h2><span class="mini-label">${state.xp} / ${goal} XP</span></div>
    <div class="card"><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100,state.xp/goal*100)}%"></div></div><p class="sub" style="margin-top:12px">${Math.max(0,goal-state.xp)} XP al prossimo livello.</p></div>
    <div class="section-heading"><h2>Le tue routine</h2><button class="text-action" data-tab="routines">Vedi tutte →</button></div>${routineCard(state.routines[1] || first, state.routines[1] ? 1 : 0)}`);
}
function routineCard(r,i){return `<button class="card routine-card" data-routine="${i}"><div class="row"><span class="routine-icon">${e(r.color)}</span><div><h3>${e(r.name)}</h3><p>${e(r.focus)}</p></div><span class="chevron">›</span></div><div class="meta"><span>◷ ${r.duration} min</span><span>▤ ${r.exercises.length} esercizi</span></div></button>`}
function routines(){return shell(`${top(`<button class="icon-btn" data-action="new-routine" aria-label="Aggiungi routine">＋</button>`)}<div class="eyebrow">Allenati con un piano</div><h1 class="title">Le tue routine</h1><p class="sub">Scegli il tuo prossimo allenamento o crea una routine personale.</p>${state.activeRoutine !== null && state.routines[state.activeRoutine] ? `<div class="notice"><strong>Sessione in corso: ${e(state.routines[state.activeRoutine].name)}</strong><button class="small-btn" data-action="resume-workout" style="display:block;margin-top:7px">Riprendi →</button></div>` : ''}<div class="section-heading"><h2>Pronte per te</h2><span class="pill">${state.routines.length} routine</span></div>${state.routines.map(routineCard).join('')}<button class="secondary" data-action="new-routine" style="margin-top:16px">＋ Crea una routine</button>`)}
function detail(){const r=state.routines[state.selectedRoutine];if(!r)return routines();return shell(`${top(`<button class="icon-btn" data-action="back-routines" aria-label="Torna alle routine">×</button>`)}<div class="eyebrow">La tua routine</div><h1 class="title">${e(r.name)}</h1><p class="sub">${e(r.focus)}</p><div class="grid-2" style="margin-top:22px"><div class="stat-card"><span class="stat-icon">◷</span><strong>${r.duration}</strong><small>Minuti previsti</small></div><div class="stat-card"><span class="stat-icon">▤</span><strong>${r.exercises.length}</strong><small>Esercizi</small></div></div><div class="section-heading"><h2>Esercizi</h2><span class="mini-label">${r.exercises.length} totali</span></div><div class="card">${r.exercises.map((x,i)=>`<div class="exercise row"><span class="routine-icon" style="width:34px;height:34px;font-size:13px">${String(i+1).padStart(2,'0')}</span><div><h3>${e(x.name)}</h3><p>${e(x.detail)}</p></div></div>`).join('')}</div><div class="sticky-action"><button class="primary" data-action="start-workout">${state.activeRoutine !== null ? (state.activeRoutine === state.selectedRoutine ? "Riprendi allenamento →" : "Riprendi la sessione in corso →") : "Inizia allenamento →"}</button></div>`,false)}
function workout(){
  const {routine:r,total,done}=workoutProgress();
  return shell(`${top(`<button class="icon-btn" data-action="exit-workout" aria-label="Esci dall'allenamento">×</button>`)}
    <div class="eyebrow">Allenamento in corso</div><h1 class="title">${e(r.name)}</h1>
    <div class="workout-header"><div class="row space"><div><strong>${done} / ${total}</strong><p>Serie completate</p></div><span class="pill">${Math.round(done/total*100)}%</span></div><div class="progress-track" style="margin-top:14px"><div class="progress-fill" style="width:${done/total*100}%"></div></div></div>
    <p class="sub">Modifica peso e ripetizioni, poi segna le serie completate.</p>
    ${r.exercises.map((x,i)=>`<div class="card" style="margin-top:12px"><h2 style="font:700 16px Outfit;margin:0">${e(x.name)}</h2><span class="mini-label">${x.sets} serie previste</span><div class="workout-set"><span></span><span style="text-align:center">kg</span><span style="text-align:center">rip.</span><span></span></div>${Array.from({length:x.sets},(_,j)=>{const key=`${i}-${j}`;const values={weight:x.weight,reps:x.reps,...state.activeSets[key]};return `<div class="workout-set"><span>${j+1}</span><input data-value="${key}" data-field="weight" type="number" min="0" max="1000" step="0.5" value="${values.weight}" aria-label="Peso serie ${j+1} ${e(x.name)}"><input data-value="${key}" data-field="reps" type="number" min="1" max="100" value="${values.reps}" aria-label="Ripetizioni serie ${j+1} ${e(x.name)}"><button data-set="${key}" class="${state.completed[key]?'done':''}" aria-label="${state.completed[key]?'Annulla':'Completa'} serie ${j+1} ${e(x.name)}">✓</button></div>`}).join('')}</div>`).join('')}
    <button class="primary" data-action="finish-workout" style="margin-top:23px" ${done===0?'disabled':''}>Termina allenamento · ${done} serie</button>
    <button class="small-btn" data-action="exit-workout" style="display:block;margin:10px auto">Torna alle routine</button>`,false);
}
function stats(){
  const weekly=state.period==='week', sessions=periodSessions(state.period);
  const minutes=sessions.reduce((sum,item)=>sum+item.minutes,0);
  const values=weekly?Array.from({length:7},(_,index)=>sessions.filter(item=>(new Date(item.endedAt).getDay()+6)%7===index).length):Array.from({length:7},(_,index)=>sessions.filter(item=>Math.min(6,Math.floor((new Date(item.endedAt).getDate()-1)/5))===index).length);
  const peak=Math.max(1,...values);
  return shell(`${top()}<div class="eyebrow">I numeri raccontano</div><h1 class="title">I tuoi progressi</h1><p class="sub">La costanza diventa visibile.</p>
    <div class="segmented" style="margin:23px 0 17px"><button data-period="week" class="${weekly?'active':''}">Settimana</button><button data-period="month" class="${!weekly?'active':''}">Mese</button></div>
    <div class="grid-2"><div class="stat-card"><span class="stat-icon">▥</span><strong>${sessions.length}</strong><small>Allenamenti</small></div><div class="stat-card"><span class="stat-icon">◷</span><strong>${minutes}</strong><small>Minuti attivi</small></div></div>
    <div class="section-heading"><h2>Attività</h2><span class="mini-label">${weekly?'Questa settimana':'Questo mese'}</span></div>
    <div class="card"><div class="chart">${values.map((value,index)=>`<div class="chart-col"><div class="chart-bar ${value===peak&&value>0?'current':''}" style="height:${Math.max(4,value/peak*85)}%"></div><small>${weekly?['L','M','M','G','V','S','D'][index]:['1','6','11','16','21','26','31'][index]}</small></div>`).join('')}</div><p class="sub" style="margin-top:16px">${sessions.length} sessioni registrate nel periodo.</p></div>
    <div class="section-heading"><h2>Allenamenti recenti</h2></div>
    <div class="card">${state.sessions.length?state.sessions.slice().reverse().slice(0,5).map(item=>`<div class="list-row"><span class="circle-icon">✓</span><div><strong>${e(item.routine)}</strong><small>${new Intl.DateTimeFormat('it-IT',{day:'numeric',month:'short'}).format(new Date(item.endedAt))} · ${item.minutes} min · ${item.sets} serie${item.demo?' · esempio':''}</small></div><span class="pill" style="margin-left:auto">+${item.xp} XP</span></div>`).join(''):'<p class="empty">Completa un allenamento per vedere qui i tuoi progressi.</p>'}</div>
    <div class="section-heading"><h2>In totale</h2></div><div class="grid-2"><div class="stat-card"><strong>${state.sessions.length}</strong><small>Sessioni</small></div><div class="stat-card"><strong>${state.sessions.reduce((sum,item)=>sum+item.minutes,0)}</strong><small>Minuti attivi</small></div></div>`);
}
function profile(){return shell(`${top(`<span class="pill">Livello ${state.level}</span>`)}<div class="eyebrow">Il tuo spazio</div><h1 class="title">Profilo</h1><div class="profile-head"><div class="avatar">${e(state.name[0]||'A')}</div><div><h2>${e(state.name)}</h2><p>In cammino verso la tua forma migliore</p></div></div><div class="card"><div class="row space"><strong>Livello ${state.level}</strong><span class="pill">✦ ${state.xp} XP</span></div><div class="progress-track" style="margin-top:16px"><div class="progress-fill" style="width:${Math.min(100,state.xp/xpGoal()*100)}%"></div></div><p class="sub" style="margin-top:10px">${Math.max(0,xpGoal()-state.xp)} XP al livello successivo</p></div><div class="section-heading"><h2>Il mio obiettivo</h2></div><div class="card"><div class="row"><span class="circle-icon">◎</span><div><strong>${e(state.goal)}</strong><small>Obiettivo personale</small></div></div></div><div class="section-heading"><h2>Impostazioni demo</h2></div><div class="card"><button class="list-row" data-action="edit-profile" style="width:100%;background:none;border-left:0;border-right:0;border-top:0;color:#fff;text-align:left"><span class="circle-icon">✎</span><div><strong>Modifica profilo</strong><small>Nome e obiettivo</small></div><span class="chevron">›</span></button><button class="list-row" data-action="replay-onboarding" style="width:100%;background:none;border-left:0;border-right:0;border-top:0;color:#fff;text-align:left"><span class="circle-icon">↗</span><div><strong>Rivedi introduzione</strong><small>Le tre schermate iniziali</small></div><span class="chevron">›</span></button><div class="list-row"><span class="circle-icon">♧</span><div><strong>CoreFit Premium</strong><small>Funzionalità prevista</small></div></div></div><button class="logout" data-action="logout">Esci dalla demo →</button>`)}
function editProfile(){return shell(`${top(`<button class="icon-btn" data-action="profile" aria-label="Torna al profilo">×</button>`)}<div class="eyebrow">Personalizza</div><h1 class="title">Modifica profilo</h1><p class="sub">Queste modifiche restano nel browser.</p><form id="profile-form" style="margin-top:25px"><label class="field"><span>Nome</span><input name="name" value="${e(state.name)}" maxlength="30" required></label><label class="field"><span>Obiettivo</span><input name="goal" value="${e(state.goal)}" maxlength="70" required></label><button class="primary" type="submit">Salva modifiche</button></form>`,false)}
function finished(){const last=state.sessions[state.sessions.length-1];return shell(`${top()}<div class="onboard-art art-2" style="min-height:230px;margin:20px 0" aria-hidden="true"></div><div class="eyebrow">Sessione completata</div><h1 class="title" style="font-size:36px">Ottimo lavoro, ${e(state.name)}!</h1><p class="sub">${e(last?.routine||'Allenamento')} salvato nei tuoi progressi.</p><div class="grid-2" style="margin:25px 0"><div class="stat-card"><span class="stat-icon">✦</span><strong>+${last?.xp||0}</strong><small>XP guadagnati</small></div><div class="stat-card"><span class="stat-icon">✓</span><strong>${last?.sets||0}</strong><small>Serie completate</small></div></div><button class="primary" data-action="finish-home">Torna alla home</button>`,false)}
function exerciseFields(){return `<div class="card exercise-fields" style="margin-bottom:12px"><div class="row space"><strong>Nuovo esercizio</strong><button type="button" class="small-btn" data-action="remove-exercise">Rimuovi</button></div><label class="field"><span>Nome esercizio</span><input name="exerciseName" placeholder="Es. Squat" maxlength="60" required></label><div class="grid-2"><label class="field"><span>Serie</span><input name="sets" type="number" min="1" max="10" value="3" required></label><label class="field"><span>Ripetizioni</span><input name="reps" type="number" min="1" max="100" value="10" required></label></div><label class="field"><span>Peso iniziale (kg)</span><input name="weight" type="number" min="0" max="1000" step="0.5" value="0" required></label></div>`}
function createRoutine(){return shell(`${top(`<button class="icon-btn" data-action="back-routines" aria-label="Torna alle routine">×</button>`)}<div class="eyebrow">Il tuo piano</div><h1 class="title">Nuova routine</h1><p class="sub">Prepara gli esercizi per il tuo prossimo allenamento.</p><form id="routine-form"><label class="field"><span>Nome routine</span><input name="name" placeholder="Es. Full body" maxlength="50" required></label><label class="field"><span>Obiettivo o focus</span><input name="focus" placeholder="Es. Forza · tutto il corpo" maxlength="80" required></label><label class="field"><span>Durata prevista (minuti)</span><input name="duration" type="number" min="5" max="240" value="45" required></label><div class="section-heading"><h2>Esercizi</h2></div><div id="exercise-fields">${exerciseFields()}</div><button type="button" class="secondary" data-action="add-exercise">＋ Aggiungi esercizio</button><button class="primary" type="submit" style="margin-top:20px">Salva routine</button></form>`,false)}
function render(){const screens={onboarding,login,home,routines,createRoutine,detail,workout,stats,profile,editProfile,finished};app.innerHTML=(screens[state.screen]||home)();app.querySelector('.screen')?.scrollTo(0,0)}
app.addEventListener('click', event => {
  const el=event.target.closest('[data-action],[data-tab],[data-routine],[data-set],[data-period]');
  if(!el)return;
  if(el.dataset.tab){state.tab=el.dataset.tab;go(el.dataset.tab);return}
  if(el.dataset.routine!==undefined){state.selectedRoutine=Number(el.dataset.routine);go('detail');return}
  if(el.dataset.set){
    const scroll=app.querySelector('.screen')?.scrollTop||0;
    state.completed[el.dataset.set]=!state.completed[el.dataset.set];
    save();render();app.querySelector('.screen').scrollTop=scroll;return;
  }
  if(el.dataset.period){state.period=el.dataset.period;save();render();return}
  switch(el.dataset.action){
    case 'next-onboard':if(state.onboard<2){state.onboard++;save();render()}else go(state.onboardingReturn);break;
    case 'skip-onboard':go(state.onboardingReturn);break;
    case 'demo-login':state.tab='home';go('home');break;
    case 'profile':state.tab='profile';go('profile');break;
    case 'back-routines':state.tab='routines';go('routines');break;
    case 'new-routine':go('createRoutine');break;
    case 'add-exercise':document.getElementById('exercise-fields').insertAdjacentHTML('beforeend',exerciseFields());break;
    case 'remove-exercise':if(document.querySelectorAll('.exercise-fields').length>1)el.closest('.exercise-fields').remove();break;
    case 'start-workout':
      if (state.activeRoutine === null) {
        state.activeRoutine=state.selectedRoutine;state.startedAt=Date.now();state.completed={};state.activeSets={};
      }
      go('workout');break;
    case 'resume-workout':if(state.activeRoutine !== null)go('workout');break;
    case 'exit-workout':state.tab='routines';go('routines');break;
    case 'finish-workout':{
      const {routine,done}=workoutProgress();
      if(done===0)return;
      const sets=Object.entries(state.completed).filter(([,value])=>value).map(([key])=>{
        const [exerciseIndex,setIndex]=key.split('-').map(Number);
        const exercise=routine.exercises[exerciseIndex];
        const values={weight:exercise.weight,reps:exercise.reps,...state.activeSets[key]};
        return {exercise:exercise.name,set:setIndex+1,weight:Number(values.weight),reps:Number(values.reps)};
      });
      const minutes=Math.max(1,Math.round((Date.now()-state.startedAt)/60000));
      const xp=20+done*10;
      state.sessions.push({id:`session-${Date.now()}-${Math.random().toString(36).slice(2)}`,routine:routine.name,endedAt:new Date().toISOString(),minutes,sets:done,xp,details:sets});
      state.xp+=xp;
      while(state.xp>=xpGoal())state.level++;
      state.activeRoutine=null;state.startedAt=null;state.completed={};state.activeSets={};
      go('finished');break;
    }
    case 'finish-home':state.tab='home';go('home');break;
    case 'edit-profile':go('editProfile');break;
    case 'replay-onboarding':state.onboard=0;state.onboardingReturn='profile';go('onboarding');break;
    case 'logout':go('login');break;
  }
});
app.addEventListener('input', event => {
  const input=event.target;
  if(!input.dataset.value)return;
  if(!state.activeSets[input.dataset.value])state.activeSets[input.dataset.value]={};
  state.activeSets[input.dataset.value][input.dataset.field]=input.value;
  save();
});
app.addEventListener('submit',event=>{
  event.preventDefault();
  const form=event.target;
  if(form.id==='login-form'){state.tab='home';go('home')}
  if(form.id==='profile-form'){
    const data=new FormData(form);
    state.name=String(data.get('name')).trim()||'Alex';
    state.goal=String(data.get('goal')).trim()||defaultData.goal;
    state.tab='profile';go('profile');
  }
  if(form.id==='routine-form'){
    const data=new FormData(form);
    const names=data.getAll('exerciseName'),setCounts=data.getAll('sets'),repetitions=data.getAll('reps'),weights=data.getAll('weight');
    const exercises=names.map((name,index)=>{
      const sets=Number(setCounts[index]),reps=Number(repetitions[index]),weight=Number(weights[index]);
      return {name:String(name).trim(),sets,reps,weight,detail:`${sets} serie · ${reps} ripetizioni`};
    });
    if(exercises.some(item=>!item.name||!Number.isFinite(item.weight)||item.weight<0||item.sets<1||item.reps<1))return;
    state.routines.push({name:String(data.get('name')).trim(),focus:String(data.get('focus')).trim(),duration:Number(data.get('duration')),color:'✦',exercises});
    state.selectedRoutine=state.routines.length-1;
    go('detail');
  }
});
window.addEventListener('popstate',()=>{
  if (!pages.has(route())) return;
  state.screen = route();
  if (['home','routines','stats','profile'].includes(state.screen)) state.tab = state.screen;
  save();render();
});
render();
