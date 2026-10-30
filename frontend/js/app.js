const ST=['Applied','Screening','Shortlisted','Assessment','Interview','Offer','Hired'];
const NAV={Candidate:[['jobs','Find jobs'],['dash','My dashboard'],['profile','My profile']],Recruiter:[['rdash','Dashboard'],['pipe','Pipeline'],['post','Vacancies'],['rep','Reports']],'Hiring Manager':[['appr','Approvals'],['review','Candidate review']],Admin:[['users','Users'],['audit','Audit log'],['rep','Reports']]};
let TOKEN=null,QUIET=false;
let D={jobs:[],apps:[],saved:[],audit:[],users:[],me:{name:'',email:'',loc:'',skills:''}};
async function api(m,p,b){
 const r=await fetch(API+p,{method:m,headers:{'Content-Type':'application/json',...(TOKEN?{Authorization:'Bearer '+TOKEN}:{})},body:b?JSON.stringify(b):undefined});
 const j=await r.json().catch(()=>({}));
 if(!r.ok){if(!QUIET)alert(j.error||'Request failed');throw new Error(j.error||r.status)}
 return j}
const start=j=>{TOKEN=j.token;role=j.role;view=NAV[role][0][0];return load()};
function signOut(){TOKEN=null;try{localStorage.removeItem('mbono_token')}catch(e){}D.me={name:'',email:''};D.apps=[];view='jobs';api('GET','/jobs').then(j=>{D.jobs=j}).catch(()=>{}).finally(render)}
async function load(){
 const [j,a,me]=await Promise.all([api('GET','/jobs'),api('GET','/applications'),api('GET','/me')]);
 D.jobs=j;D.apps=a;D.me=me;D.saved=me.saved||[];
 if(role=='Admin'||role=='Recruiter')D.rep=await api('GET','/reports');
 if(role=='Admin'){D.audit=await api('GET','/audit');D.users=await api('GET','/users')}}
const act=async fn=>{try{await fn();await load();render()}catch(e){}};
let role='Candidate',view='jobs',F={t:'',l:'',i:'',y:''},pf=0,M='',drag=0;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const job=id=>D.jobs.find(j=>j.id==id)||{title:'(removed)',skills:[]};
const score=(j,s)=>{const k=s.toLowerCase().split(',').map(x=>x.trim());return j.skills.length?Math.round(100*j.skills.filter(x=>k.includes(x.toLowerCase())).length/j.skills.length):0};
const chips=a=>a.map(x=>`<span class="chip">${esc(x)}</span>`).join('');

const setView=v=>{view=v;M='';history.pushState({v},'');render();scrollTo(0,0)};
addEventListener('popstate',e=>{view=(e.state&&e.state.v)||(TOKEN?NAV[role][0][0]:'jobs');M='';render()});
addEventListener('keydown',e=>{if(e.key=='Escape'&&M)closeM()});
const closeM=()=>{M='';render()};

const slides=()=>`<div class="slides"><i class="sl" style="background-image:url(img/hero/hero-1.jpg)"></i><i class="sl" style="background-image:url(img/hero/hero-2.jpg)"></i><i class="sl" style="background-image:url(img/hero/hero-3.jpg)"></i>${MB_VIDEO?`<video class="bgvid" autoplay muted loop playsinline src="${MB_VIDEO}"></video>`:''}</div>`;
const bar=(t,sub)=>`<div class="pagebar">${slides()}<img class="wm" src="img/emblem.png" alt=""><div class="bin"><h2>${esc(t)}</h2><p>${esc(sub||'')}</p></div></div>`;
const ini=n=>String(n||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
const av=(u,c='')=>`<span class="av ${c}">${u.avatar?`<img src="${esc(u.avatar)}" alt="">`:esc(ini(u.name))}</span>`;
function render(){
 const nav=!TOKEN?`<button class="on">Vacancies</button>`:NAV[role].map(([v,l])=>`<button class="${v==view?'on':''}" onclick="setView('${v}')">${l}</button>`).join('');
 const lab=TOKEN&&NAV[role].find(x=>x[0]==view),head=view=='jobs'?'':bar(lab?lab[1]:'',D.me.name?'Welcome, '+D.me.name+' · '+role:'');
 $('app').innerHTML=`<header class="top"><div class="in"><a class="brand" href="index.html"><img src="img/emblem-sm.png" alt=""><span><b>Mbono Career Goals</b><small>Mbono Professional Services</small></span></a><nav>${nav}</nav>
 <div class="acts">${TOKEN?`${av(D.me)}<span class="who">${esc(D.me.name)}<small>${role}</small></span><button class="btn o" onclick="signOut()">Sign out</button>`:`<button class="btn o" onclick="MBAuth.open('login')">Portal Login</button><button class="btn" onclick="MBAuth.open('register')">Create account</button>`}</div></div></header>
 <main><div class="view">${head}${V[view]()}</div></main>${foot()}${M}`;
}

const CATS=[['BPO & GBS Services','Preparing talent for high-volume contact centre environments and shared services.'],['Professional Services & Admin','Back-office support, including data capturing and records management.'],['Industrial & Manufacturing','Packaging, processing, warehouse support and general labour roles.'],['Learnerships & Work Readiness','SETA-aligned programmes combining theory with workplace practice and digital literacy.']];
const catF=i=>{F.i=F.i==CATS[i][0]?'':CATS[i][0];render()};
const cats=()=>`<h2>Browse by focus area</h2><div class="grid cats">${CATS.map((c,i)=>`<div class="cat ${F.i==c[0]?'on':''}" onclick="catF(${i})"><b>0${i+1}</b><h3>${esc(c[0])}</h3><p>${c[1]}</p></div>`).join('')}</div>`;
const cta=()=>`<div class="cta"><div><h2>Source work-ready talent that fits.</h2><p>Tell us what you need and we will connect you with trained, motivated candidates.</p></div><div><button class="btn" onclick="MBEnquiry.open('employer')">Request talent</button> </div></div>`;
const foot=()=>`<footer><div class="fg"><div><img src="img/emblem-sm.png" width="52" alt="" style="border-radius:50%;margin-bottom:.5rem"><h4>Mbono Professional Services</h4><p>A purpose-led workforce solutions and business enablement company unlocking human potential across the Eastern Cape.</p></div>
<div><h4>Business units</h4><a href="https://www.mbono.co.za/bpo-link" target="_blank" rel="noopener">BPO Link</a><a href="https://www.mbono.co.za/career-goals" target="_blank" rel="noopener">Career Goals</a><a href="https://www.mbono.co.za/digigoals" target="_blank" rel="noopener">DigiGoals</a><a href="https://www.mbono.co.za/mcx-connect" target="_blank" rel="noopener">MCX Connect</a></div>
<div><h4>Get in touch</h4><p>info@mbono.co.za<br>+27 (0)41 880 0086<br>19 Oakworth Road, Harbour View Building, South End, Gqeberha, 6001</p></div></div>
<small>© 2026 Mbono Professional Services. All rights reserved. · Beta preview</small></footer>`;
const V={
jobs(){
 const S=j=>j.sector||j.ind;
 const L=D.jobs.filter(j=>j.st=='Open'&&(!F.t||(j.title+j.skills).toLowerCase().includes(F.t.toLowerCase()))&&(!F.l||j.loc==F.l)&&(!F.i||S(j)==F.i)&&(!F.y||j.type==F.y));
 const op=(k,f)=>[...new Set(D.jobs.map(j=>j[k]))].map(x=>`<option ${F[f]==x?'selected':''}>${esc(x)}</option>`).join('');
 return `<div class="hero inapp">${slides()}<img class="wm" src="img/emblem.png" alt=""><div class="in"><span class="pill">Eastern Cape workforce enablement</span><h1>Building skills,<em>Unlocking opportunity.</em></h1>
 <p class="lead">Work-ready talent and meaningful careers across the Eastern Cape. Search vacancies, apply in one click and track every step.</p>
 <div class="grid sf"><input id="ft" placeholder="Job title or skill" value="${esc(F.t)}"><select id="fl"><option value="">Any location</option>${op('loc','l')}</select><select id="fy"><option value="">Any type</option>${op('type','y')}</select>
 <button class="btn em" onclick="F={...F,t:$('ft').value,l:$('fl').value,y:$('fy').value};render()">Search</button></div></div></div>
 ${cats()}<p class="mut">${L.length} vacancies</p>`+L.map(j=>{const ap=D.apps.some(a=>a.job==j.id&&a.email==D.me.email);return `<div class="card jc"><div class="art">${mbArt(CATS.findIndex(c=>c[0]==S(j)))}</div><div><div class="row"><div><h3>${esc(j.title)}</h3>
 <span class="mut">${esc(j.ind)} · ${esc(j.loc)} · ${esc(j.type)} · ${esc(j.sal)}</span></div>
 <div><button class="btn o" onclick="tog(${j.id})">${D.saved.includes(j.id)?'Saved ✓':'Save'}</button> <button class="btn" ${ap?'disabled':''} onclick="applyM(${j.id})">${ap?'Applied':'Apply'}</button></div></div>
 <p>${esc(j.desc)}</p>${chips(j.skills)}</div></div>`}).join('')+(L.length?'':'<div class="card">No vacancies match your search.</div>')+cta();
},
dash(){
 const my=D.apps.filter(a=>a.email==D.me.email);
 return `<h2>My dashboard</h2><div class="grid" style="margin-bottom:1rem"><div class="stat"><b>${my.length}</b>Applications</div><div class="stat"><b>${D.saved.length}</b>Saved jobs</div><div class="stat"><b>${my.filter(a=>a.stage=='Interview').length}</b>Interviews</div></div>
 <div class="card"><h3>Applications</h3><div class="tw"><table><tr><th>Role</th><th>Status</th><th></th></tr>${my.map(a=>`<tr><td>${esc(job(a.job).title)}</td><td><span class="chip">${a.stage}</span>${a.interview?`<br><span class="mut">Interview ${esc(new Date(a.interview.when).toLocaleString())} · ${esc(a.interview.mode)}${a.interview.link?` · ${esc(a.interview.link)}`:''}</span>`:''}</td><td><button class="btn o" onclick="wd(${a.id})">Withdraw</button></td></tr>`).join('')||'<tr><td colspan=3 class="mut">No applications yet.</td></tr>'}</table></div></div>
 <div class="card"><h3>Saved jobs</h3>${D.saved.map(id=>`<div class="row"><span>${esc(job(id).title)}</span><button class="btn o" onclick="tog(${id})">Remove</button></div>`).join('')||'<span class="mut">Nothing saved.</span>'}</div>`;
},
profile(){const m=D.me,f=(id,l,k,r)=>r?`<label>${l}</label><textarea id="${id}" rows="${r}">${esc(m[k]||'')}</textarea>`:`<label>${l}</label><input id="${id}" value="${esc(m[k]||'')}"${k=='email'?' readonly':''}>`;
 return `<div class="card"><div class="row" style="justify-content:flex-start;gap:1rem">${av(m,'lg')}<div><h3 style="margin:0">${esc(m.name)}</h3><span class="mut">${esc(m.email)}</span><br><label class="btn o" style="margin-top:.5rem;cursor:pointer">Change photo<input type="file" accept="image/*" hidden onchange="upAv(this.files[0])"></label></div></div></div>
 <div class="card"><h3>Personal details</h3><div class="grid2">${f('pn','Full name','name')}${f('pe','Email','email')}${f('pp','Phone','phone')}${f('pl','Location','loc')}</div>${f('pa','Address','address')}${f('ps','Skills (comma separated)','skills')}
 <h3 style="margin-top:1.2rem">CV details</h3><p class="mut">These fill in automatically when you upload a CV. Check and correct them. Recruiters see all of this and can download your CV.</p>
 ${f('pd','Education','education',3)}${f('px','Work experience','experience',4)}${f('pc','Certifications','certifications',2)}${f('pg','Languages','languages',1)}${f('pr','Professional references','references',2)}
 <label>CV (PDF or DOCX, max 5 MB)</label><input type="file" accept=".pdf,.docx" onchange="upCV(this.files[0])"><p class="mut">${m.cv?`Stored CV: ${esc(m.cv)} · <a href="#" onclick="dlCV();return false">Download</a>`:'Upload a CV and we will read your details into your profile.'}</p>
 <button class="btn" onclick="saveProfile()">Save profile</button></div>${m.role=='Candidate'?`<div class="card"><h3>Your data (POPIA)</h3><p class="mut">Consent recorded: ${esc((m.consentAt||'').slice(0,10)||'demo account')}. Download everything we hold about you, or delete your account and data permanently.</p><button class="btn o" onclick="exp()">Download my data</button> <button class="btn d" onclick="delMe()">Delete my account</button></div>`:''}`},
rdash(){
 const open=D.jobs.filter(j=>j.st=='Open').length,hires=D.apps.filter(a=>a.stage=='Hired').length;
 return `<h2>Recruitment dashboard</h2><div class="grid" style="margin-bottom:1rem"><div class="stat"><b>${open}</b>Open vacancies</div><div class="stat"><b>${D.apps.length}</b>Applications</div>
 <div class="stat"><b>${D.apps.filter(a=>a.stage=='Applied').length}</b>New applicants</div><div class="stat"><b>${D.apps.filter(a=>a.stage=='Interview').length}</b>Interviews</div><div class="stat"><b>${hires}</b>Hires</div></div>
 <div class="card"><h3>Applications per vacancy</h3>${D.jobs.map(j=>{const n=D.apps.filter(a=>a.job==j.id).length;return `<div class="row"><span style="width:200px">${esc(j.title)}</span><div style="flex:1"><div class="bar" style="width:${n*20+2}%"></div></div><b>${n}</b></div>`}).join('')}</div>`},
pipe(){
 const A=D.apps.filter(a=>!pf||a.job==pf&&a.stage!='Rejected');
 return `<div class="row"><h2>Candidate pipeline</h2><select style="width:240px" onchange="pf=+this.value;render()"><option value="0">All vacancies</option>${D.jobs.map(j=>`<option value="${j.id}" ${pf==j.id?'selected':''}>${esc(j.title)}</option>`).join('')}</select></div>
 <p class="mut">Drag cards between stages. The match score compares candidate skills with the vacancy (rule-based in this beta).</p><div class="kan">`+
 ST.map(s=>`<div class="col" ondragover="event.preventDefault()" ondrop="mv(drag,'${s}')"><h3>${s} (${A.filter(a=>a.stage==s).length})</h3>`+A.filter(a=>a.stage==s).map(a=>`<div class="kc" draggable="true" ondragstart="drag=${a.id}" onclick="det(${a.id})"><span class="sc">${score(job(a.job),a.skills)}%</span><b>${esc(a.name)}</b><br><span class="mut">${esc(job(a.job).title)}</span></div>`).join('')+'</div>').join('')+'</div>'},
post(){
 return `<h2>Vacancies</h2><div class="card"><h3>New vacancy</h3><div class="grid"><div><label>Title</label><input id="vt"></div><div><label>Location</label><input id="vl"></div><div><label>Sector</label><select id="vi">${CATS.map(c=>`<option>${esc(c[0])}</option>`).join('')}</select></div>
 <div><label>Type</label><select id="vy"><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Learnership</option></select></div><div><label>Salary</label><input id="vs" placeholder="R20k–R30k"></div></div>
 <label>Required skills (comma separated)</label><input id="vk"><label>Description</label><textarea id="vd" rows="3"></textarea><br><br>
 <button class="btn" onclick="addJ()">Submit for approval</button></div>
 <div class="card tw"><table><tr><th>Title</th><th>Status</th><th></th></tr>${D.jobs.map(j=>`<tr><td>${esc(j.title)}</td><td><span class="chip">${j.st}</span>${j.comment?`<br><span class="mut">Changes requested: ${esc(j.comment)}</span>`:''}</td><td>${['Changes requested','Pending'].includes(j.st)?`<button class="btn" onclick="editJ(${j.id})">Edit</button> `:''}<button class="btn o" onclick="dup(${j.id})">Duplicate</button> <button class="btn o" onclick="jst(${j.id},'Closed')">Close</button></td></tr>`).join('')}</table></div>`},
appr(){
 const P=D.jobs.filter(j=>j.st=='Pending');
 return `<h2>Vacancy approvals</h2>`+(P.map(j=>`<div class="card"><h3>${esc(j.title)}</h3><span class="mut">${esc(j.loc)} · ${esc(j.type)} · ${esc(j.sal)}</span><p>${esc(j.desc)}</p>${chips(j.skills)}<br><br>
 <button class="btn" onclick="jst(${j.id},'Open')">Approve</button> <button class="btn o" onclick="reqCh(${j.id})">Request changes</button></div>`).join('')||'<div class="card mut">No vacancies waiting for approval.</div>')},
review(){
 const A=D.apps.filter(a=>['Shortlisted','Assessment','Interview','Offer'].includes(a.stage));
 return `<h2>Candidate review</h2>`+(A.map(a=>`<div class="card"><div class="row"><div><h3>${esc(a.name)}</h3><span class="mut">${esc(job(a.job).title)} · ${a.stage} · match ${score(job(a.job),a.skills)}%</span></div>
 <select style="width:130px" onchange="rate(${a.id},+this.value)">${[0,1,2,3,4,5].map(n=>`<option value="${n}" ${a.rate==n?'selected':''}>${n?'★'.repeat(n):'Not rated'}</option>`).join('')}</select></div>
 <p>Skills: ${esc(a.skills)}</p><textarea rows="2" placeholder="Interview feedback" onchange="fb(${a.id},this.value)">${esc(a.fb)}</textarea><br><br>
 <button class="btn o" onclick="det(${a.id})">View CV details</button> <button class="btn" onclick="mv(${a.id},'Offer')">Make offer</button> <button class="btn d" onclick="rej(${a.id})">Reject</button></div>`).join('')||'<div class="card mut">No shortlisted candidates yet.</div>')},
users(){
 const U=D.users.map(u=>[u.name,u.role]);
 return `<h2>User management</h2><div class="card tw"><table><tr><th>Name</th><th>Role</th><th>Access</th></tr>${U.map(u=>`<tr><td>${esc(u[0])}</td><td>${u[1]}</td><td class="ok">Active</td></tr>`).join('')}</table></div><p class="mut">Roles are enforced by the API. Real sign-in screens and Microsoft SSO come next.</p>`},
audit(){return `<h2>Audit log</h2><div class="card tw"><table><tr><th>Time</th><th>Role</th><th>Event</th></tr>${D.audit.slice(0,50).map(a=>`<tr><td>${esc(a.t)}</td><td>${esc(a.r)}</td><td>${esc(a.m)}</td></tr>`).join('')}</table></div>`},
rep(){
 const h=D.apps.filter(a=>a.stage=='Hired').length,tk={};D.jobs.forEach(j=>j.skills.forEach(s=>tk[s]=(tk[s]||0)+1));
 const top=Object.entries(tk).sort((a,b)=>b[1]-a[1]).slice(0,6);
 return `<h2>Reports</h2><div class="grid" style="margin-bottom:1rem"><div class="stat"><b>${Math.round(100*h/Math.max(D.apps.length,1))}%</b>Application to hire</div><div class="stat"><b>${D.apps.length}</b>Total applications</div><div class="stat"><b>${D.jobs.filter(j=>j.st=='Open').length}</b>Open vacancies</div></div>
 <div class="card"><h3>Candidates by stage</h3>${ST.map(s=>{const n=D.apps.filter(a=>a.stage==s).length;return `<div class="row"><span style="width:110px">${s}</span><div style="flex:1"><div class="bar" style="width:${n*20+1}%"></div></div><b>${n}</b></div>`}).join('')}</div>
 <div class="card"><h3>Top skills in demand</h3>${top.map(t=>`<div class="row"><span style="width:140px">${esc(t[0])}</span><div style="flex:1"><div class="bar" style="width:${t[1]*25}%"></div></div><b>${t[1]}</b></div>`).join('')}</div>`}
};


const tbl=(h,rows)=>`<div class="card tw"><table><tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr>${rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table></div>`;
const repMore=()=>{const r=D.rep;if(!r)return '';return `<h3>Vacancy aging</h3>${tbl(['Vacancy','Status','Days open','Applications'],r.aging.map(a=>[a.title,a.st,a.days,a.apps]))}<h3>Source of hire</h3>${tbl(['Source','Applications','Hires'],Object.entries(r.source).map(([k,v])=>[k,v.applications,v.hires]))}<h3>Recruiter performance</h3>${tbl(['Recruiter','Vacancies','Applications','Stage moves','Interviews','Hires'],r.perf.map(p=>[p.name,p.vacancies,p.applications,p.moves,p.interviews,p.hires]))}`};
{const r0=V.rep;V.rep=()=>r0()+repMore()}
let CVB='';
{const p0=V.profile;V.profile=()=>{const n=CVB;CVB='';return (n?`<div class="card" style="border-color:#2e7d57;background:#eef4ec"><h3 style="margin:0">CV uploaded and saved</h3><p class="mut" style="margin:.3rem 0 0">${esc(n)} Your details are filled in below. Please check each field, correct anything that is wrong, then click Save profile.</p></div>`:'')+p0()}}
function editJ(id){const j=job(id);M=`<div class="ov" onclick="if(event.target===this)closeM()"><div class="md"><h3>Edit vacancy</h3>${j.comment?`<p class="chip">Hiring manager: ${esc(j.comment)}</p>`:''}<label>Title</label><input id="et" value="${esc(j.title)}"><label>Location</label><input id="el" value="${esc(j.loc)}"><label>Sector</label><select id="es">${CATS.map(c=>`<option ${c[0]==j.sector?'selected':''}>${esc(c[0])}</option>`).join('')}</select><label>Type</label><input id="ey" value="${esc(j.type)}"><label>Salary</label><input id="ez" value="${esc(j.sal)}"><label>Skills (comma separated)</label><input id="ek" value="${esc(j.skills.join(', '))}"><label>Description</label><textarea id="ed" rows="4">${esc(j.desc)}</textarea><br><br><button class="btn" onclick="saveJ(${id})">Save and resubmit</button> <button class="btn o" onclick="closeM()">Cancel</button></div></div>`;render()}
function saveJ(id){const b={title:$('et').value,loc:$('el').value,sector:$('es').value,type:$('ey').value,sal:$('ez').value,skills:$('ek').value.split(',').map(x=>x.trim()).filter(Boolean),desc:$('ed').value};M='';act(()=>api('PUT','/jobs/'+id,b))}
function reqCh(id){const c=prompt('What should the recruiter change?');if(c===null)return;act(()=>api('PATCH','/jobs/'+id,{st:'Changes requested',comment:c}))}
let SC=null;
const scHtml=(id,s)=>'<h3 class="sh">Scorecard</h3>'+s.rows.map((r,i)=>`<div class="row"><span style="width:200px">${esc(r.criterion)}${r.suggested?` <span class="mut">(CV suggests ${r.suggested})</span>`:''}</span><select onchange="scSave(${id},${i},+this.value)">${[0,1,2,3,4,5].map(n=>`<option value="${n}" ${r.rating==n?'selected':''}>${n||'Not rated'}</option>`).join('')}</select></div>`).join('');
function scSave(id,i,v){SC.rows[i].rating=v;api('PUT','/applications/'+id+'/scorecard',{rows:SC.rows}).catch(()=>{})}
function sendMsg(id){api('POST','/applications/'+id+'/message/send',{subject:$('ms').value,body:$('mb').value}).then(()=>alert('Message sent.')).catch(()=>{})}
async function ai(id,k){const o=$('ai');o.innerHTML='<p class="mut">Working...</p>';let h='';
 try{
  if(k=='screen'){const r=await api('GET','/applications/'+id+'/screen');h=`<h3 class="sh">ATS screening: ${r.score}% skills match</h3><p>Matched: ${chips(r.matched)||'none'}</p><p>Missing: ${chips(r.missing)||'none'}</p>${r.flags.map(f=>`<p class="chip">${esc(f)}</p>`).join('')}`}
  else if(k=='q'){const r=await api('GET','/applications/'+id+'/questions');h='<h3 class="sh">Suggested interview questions</h3><ol>'+r.questions.map(q=>`<li>${esc(q)}</li>`).join('')+'</ol>'}
  else if(k=='sc'){SC=await api('POST','/applications/'+id+'/scorecard');h=scHtml(id,SC)}
  else{const r=await api('POST','/applications/'+id+'/message',{kind:k});h=`<h3 class="sh">Draft message (edit before sending)</h3><input id="ms" value="${esc(r.subject)}"><textarea id="mb" rows="6">${esc(r.body)}</textarea><br><br><button class="btn" onclick="sendMsg(${id})">Send to candidate</button>`}
 }catch(e){}
 o.innerHTML=h+'<p class="mut">Assistive output only. A person makes every hiring decision. Name, gender, age and photo are not used.</p>'}
function applyM(id){if(!TOKEN){MBAuth.open('login');return}const j=job(id);M=`<div class="ov" onclick="if(event.target===this)closeM()"><div class="md"><h3>Apply: ${esc(j.title)}</h3><p class="mut">Applying as ${esc(D.me.name)} (${esc(D.me.email)}). Your profile skills are used for matching.</p>
 <label>CV (PDF or DOCX)</label><input id="acv" type="file" accept=".pdf,.docx"><label>How did you hear about us?</label><select id="asrc"><option>Website</option><option>Referral</option><option>Social media</option><option>Job board</option><option>Walk-in</option></select><label>Cover letter note</label><textarea id="acl" rows="3"></textarea>
 <label><input id="aco" type="checkbox" style="width:auto"> I consent to my data being processed for recruitment (POPIA).</label><br>
 <button class="btn" onclick="sub(${id})">Submit application</button> <button class="btn o" onclick="closeM()">Cancel</button></div></div>`;render()}
async function det(id){
 const a=D.apps.find(x=>x.id==id);let c={};
 try{c=await api('GET','/applications/'+id+'/details')}catch(e){return}
 const f=(l,v)=>v?`<h3 class="sh">${l}</h3><p class="pre">${esc(v)}</p>`:'';
 const sk=(c.skills||a.skills||'').split(',').map(x=>x.trim()).filter(Boolean);
 M=`<div class="ov" onclick="if(event.target===this)closeM()"><div class="md wide"><div class="row" style="justify-content:flex-start;gap:1rem">${av(c,'lg')}<div><h3 style="margin:0">${esc(a.name)}</h3>
 <span class="mut">${esc(a.email)}${c.phone?' · '+esc(c.phone):''}${c.loc?' · '+esc(c.loc):''}</span><br><span class="mut">${esc(job(a.job).title)} · Stage: ${a.stage} · Match <b>${score(job(a.job),a.skills)}%</b></span></div></div>
 <div class="row" style="margin:.8rem 0"><span>${chips(sk)}</span>${c.hasCv?`<button class="btn" onclick="dl('/applications/${a.id}/cv','${esc((c.cv||'cv').replace(/'/g,''))}')">Download complete CV</button>`:'<span class="mut">No CV on file</span>'}</div>
 <details open><summary><b>CV details</b></summary>${f('Address',c.address)}${f('Education',c.education)}${f('Work experience',c.experience)}${f('Certifications',c.certifications)}${f('Languages',c.languages)}${f('Professional references',c.references)}
 ${c.cvText?`<details><summary class="mut">Full CV text</summary><p class="pre scroll">${esc(c.cvText)}</p></details>`:''}${!c.hasCv&&!c.education&&!c.experience?'<p class="mut">This applicant has no CV details on file yet.</p>':''}</details>
 ${role!='Hiring Manager'?`<h3 class="sh">Interview</h3>${a.interview?`<p class="mut">Booked: ${esc(new Date(a.interview.when).toLocaleString())} · ${esc(a.interview.mode)}</p>`:''}<div class="grid"><input id="iw" type="datetime-local"><select id="im"><option>Teams</option><option>In person</option><option>Phone</option></select></div><input id="il" placeholder="Meeting link or venue" style="margin-top:.4rem"><br><br><button class="btn" onclick="book(${a.id})">Send invitation</button>`:''}
 <h3 class="sh">Assistive tools</h3><div class="row" style="justify-content:flex-start;gap:.5rem;flex-wrap:wrap"><button class="btn o" onclick="ai(${a.id},'screen')">ATS CV screen</button><button class="btn o" onclick="ai(${a.id},'q')">Interview questions</button><button class="btn o" onclick="ai(${a.id},'sc')">Scorecard</button><select id="mk" style="width:130px"><option value="shortlist">Shortlist</option><option value="interview">Interview</option><option value="offer">Offer</option><option value="rejection">Rejection</option></select><button class="btn o" onclick="ai(${a.id},$('mk').value)">Draft message</button></div><div id="ai"></div>
 <h3 class="sh">Recruiter notes</h3>${a.notes.map(n=>`<p class="chip">${esc(n)}</p>`).join('')||'<p class="mut">No notes yet.</p>'}
 <textarea id="nt" rows="2" placeholder="Add a note"></textarea><br><br><button class="btn" onclick="addN(${a.id})">Add note</button> <button class="btn d" onclick="rej(${a.id});closeM()">Reject</button> <button class="btn o" onclick="closeM()">Close</button></div></div>`;render()}
function tog(id){if(!TOKEN){MBAuth.open('login');return}const x=D.saved.includes(id)?D.saved.filter(i=>i!=id):[...D.saved,id];act(()=>api('PUT','/me',{saved:x}))}
function sub(id){if(!$('aco').checked){alert('Please accept the POPIA consent to continue.');return}
 const c=$('acl').value;M='';act(()=>api('POST','/applications',{jobId:id,coverNote:c,source:$('asrc').value,consent:true}))}
function wd(id){act(()=>api('DELETE','/applications/'+id))}
function mv(id,s){if(!id)return;M='';act(()=>api('PATCH','/applications/'+id,{stage:s}))}
function rej(id){act(()=>api('PATCH','/applications/'+id,{stage:'Rejected'}))}
function rate(id,n){act(()=>api('PATCH','/applications/'+id,{rate:n}))}
function fb(id,t){api('PATCH','/applications/'+id,{fb:t}).catch(()=>{})}
function jst(id,s){act(()=>api('PATCH','/jobs/'+id,{st:s}))}
function dup(id){act(()=>api('POST','/jobs/'+id+'/duplicate'))}
function addJ(){const t=$('vt').value.trim();if(!t){alert('Please enter a title.');return}
 act(()=>api('POST','/jobs',{title:t,loc:$('vl').value,sector:$('vi').value,type:$('vy').value,sal:$('vs').value,skills:$('vk').value.split(',').map(x=>x.trim()).filter(Boolean),desc:$('vd').value}))}
function addN(id){const v=$('nt').value.trim();if(v)api('POST','/applications/'+id+'/notes',{note:v}).then(load).then(()=>det(id)).catch(()=>{})}
function saveProfile(){const g=i=>$(i).value;act(()=>api('PUT','/me',{name:g('pn'),phone:g('pp'),loc:g('pl'),address:g('pa'),skills:g('ps'),education:g('pd'),experience:g('px'),certifications:g('pc'),languages:g('pg'),references:g('pr')}))}
function upAv(f){if(!f)return;const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=c.height=160;const x=c.getContext('2d'),m=Math.min(im.width,im.height);
 x.drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,160,160);act(()=>api('PUT','/me',{avatar:c.toDataURL('image/jpeg',.8)}))};im.src=URL.createObjectURL(f)}
async function upCV(f){if(!f)return;const fd=new FormData();fd.append('cv',f);
 try{const r=await fetch(API+'/me/cv',{method:'POST',headers:{Authorization:'Bearer '+TOKEN},body:fd}),j=await r.json();if(!r.ok)throw new Error(j.error);
 CVB=j.found.length?'We found these skills: '+j.found.join(', ')+'.':'No known skills were detected, so please add them below.';await load();view='profile';M='';history.pushState({v:'profile'},'');render();scrollTo(0,0)}catch(e){alert(e.message||'Upload failed')}}
async function dl(path,name){const r=await fetch(API+path,{headers:{Authorization:'Bearer '+TOKEN}});if(!r.ok){alert('Download failed');return}
 const a=document.createElement('a');a.href=URL.createObjectURL(await r.blob());a.download=name;a.click()}
const dlCV=()=>dl('/me/cv',D.me.cv),exp=()=>dl('/me/export','my-data.json');
async function delMe(){const p=prompt('This permanently deletes your account, applications and CV. Type your password to confirm.');if(!p)return;
 try{await api('DELETE','/me',{password:p});alert('Your account and data have been deleted.');signOut()}catch(e){}}
function book(id){const w=$('iw').value;if(!w){alert('Pick a date and time.');return}
 const b={when:new Date(w).toISOString(),mode:$('im').value,link:$('il').value};M='';act(()=>api('POST','/applications/'+id+'/interview',b))}
MBAuth.onDone=j=>start(j).then(render);
{const hm=location.hash.match(/reset=([a-f0-9]+)/);
 try{TOKEN=localStorage.getItem('mbono_token')}catch(e){}
 if(hm)TOKEN=null;
 const pub=()=>api('GET','/jobs').then(j=>{D.jobs=j}).catch(()=>{});
 if(TOKEN){QUIET=true;api('GET','/me').then(m=>{role=m.role;view=NAV[role][0][0];return load()}).catch(()=>{TOKEN=null;return pub()}).finally(()=>{QUIET=false;render()})}
 else pub().finally(()=>{render();if(hm)MBAuth.open('reset',hm[1]);else if(location.hash=='#login'||location.hash=='#admin')MBAuth.open('login');else if(location.hash=='#register')MBAuth.open('register')})}