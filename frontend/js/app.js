const ST=['Applied','Screening','Shortlisted','Assessment','Interview','Offer','Hired'];
const NAV={Candidate:[['jobs','Find jobs'],['dash','My dashboard'],['profile','My profile']],Recruiter:[['rdash','Dashboard'],['pipe','Pipeline'],['post','Vacancies']],'Hiring Manager':[['appr','Approvals'],['review','Candidate review']],Admin:[['users','Users'],['audit','Audit log'],['rep','Reports']]};
// Backend address: same server when opened at :3000, otherwise the local API (e.g. Live Server on :5500)
const API=location.port=='3000'?'/api':'http://localhost:3000/api';
let TOKEN=null,AUTH='login',RT='',QUIET=false;
let D={jobs:[],apps:[],saved:[],audit:[],users:[],me:{name:'',email:'',loc:'',skills:''}};
async function api(m,p,b){
 const r=await fetch(API+p,{method:m,headers:{'Content-Type':'application/json',...(TOKEN?{Authorization:'Bearer '+TOKEN}:{})},body:b?JSON.stringify(b):undefined});
 const j=await r.json().catch(()=>({}));
 if(!r.ok){if(!QUIET)alert(j.error||'Request failed');throw new Error(j.error||r.status)}
 return j}
const ACC={Candidate:'candidate@mbono.demo',Recruiter:'recruiter@mbono.demo','Hiring Manager':'manager@mbono.demo'};
const start=j=>{TOKEN=j.token;role=j.role;try{localStorage.setItem('mbono_token',TOKEN)}catch(e){}view=NAV[role][0][0];return load()};
const signIn=(email,pw)=>api('POST','/auth/login',{email,password:pw}).then(start);
function signOut(){TOKEN=null;try{localStorage.removeItem('mbono_token')}catch(e){}D.me={};AUTH='login';render()}
async function load(){
 const [j,a,me]=await Promise.all([api('GET','/jobs'),api('GET','/applications'),api('GET','/me')]);
 D.jobs=j;D.apps=a;D.me=me;D.saved=me.saved||[];
 if(role=='Admin'){D.audit=await api('GET','/audit');D.users=await api('GET','/users')}}
const act=async fn=>{try{await fn();await load();render()}catch(e){}};
let role='Candidate',view='jobs',F={t:'',l:'',i:'',y:''},pf=0,M='',drag=0;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const job=id=>D.jobs.find(j=>j.id==id)||{title:'(removed)',skills:[]};
const score=(j,s)=>{const k=s.toLowerCase().split(',').map(x=>x.trim());return j.skills.length?Math.round(100*j.skills.filter(x=>k.includes(x.toLowerCase())).length/j.skills.length):0};
const chips=a=>a.map(x=>`<span class="chip">${esc(x)}</span>`).join('');

const setView=v=>{view=v;render()};
const close=()=>{M='';render()};

function render(){
 const nav=!TOKEN?'':NAV[role].map(([v,l])=>`<button class="${v==view?'on':''}" onclick="setView('${v}')">${l}</button>`).join('');
 const sel=Object.keys(NAV).map(r=>`<option ${r==role?'selected':''}>${r}</option>`).join('');
 $('app').innerHTML=`<header><a class="brand" href="https://www.mbono.co.za" target="_blank" rel="noopener"><span class="mark">M</span><span>Mbono<small>Professional Services</small></span></a><nav>${nav}</nav>
 ${TOKEN?`<span style="color:#cfe0f5;font-size:.85rem">${esc(D.me.name)} · ${role}</span> <button class="btn o" style="color:#fff;border-color:#8fb0d4" onclick="signOut()">Sign out</button>`:''}</header>
 <div class="beta">Beta preview · demo accounts are listed on the sign-in page</div>
 <main>${TOKEN?V[view]():authV()}</main>${foot()}${M}`;
}

const CATS=[['BPO & GBS Services','Preparing talent for high-volume contact centre environments and shared services.'],['Professional Services & Admin','Back-office support, including data capturing and records management.'],['Industrial & Manufacturing','Packaging, processing, warehouse support and general labour roles.'],['Learnerships & Work Readiness','SETA-aligned programmes combining theory with workplace practice and digital literacy.']];
const catF=i=>{F.i=F.i==CATS[i][0]?'':CATS[i][0];render()};
const cats=()=>`<h2>Browse by focus area</h2><div class="grid cats">${CATS.map((c,i)=>`<div class="cat ${F.i==c[0]?'on':''}" onclick="catF(${i})"><b>0${i+1}</b><h3>${esc(c[0])}</h3><p>${c[1]}</p></div>`).join('')}</div>`;
const cta=()=>`<div class="cta"><div><h2>Source work-ready talent that fits.</h2><p>Tell us what you need and we will connect you with trained, motivated candidates.</p></div><div><a class="btn" href="https://www.mbono.co.za/request-talent" target="_blank" rel="noopener">Request talent</a> <a class="btn o" style="color:#fff;border-color:#8fb0d4" href="https://www.mbono.co.za/contact" target="_blank" rel="noopener">Talk to us</a></div></div>`;
const foot=()=>`<footer><div class="fg"><div><h4>Professional Mbono Services</h4><p>A purpose-led workforce solutions and business enablement company unlocking human potential across the Eastern Cape.</p></div>
<div><h4>Business units</h4><a href="https://www.mbono.co.za/bpo-link" target="_blank" rel="noopener">BPO Link</a><a href="https://www.mbono.co.za/career-goals" target="_blank" rel="noopener">Career Goals</a><a href="https://www.mbono.co.za/digigoals" target="_blank" rel="noopener">DigiGoals</a><a href="https://www.mbono.co.za/mcx-connect" target="_blank" rel="noopener">MCX Connect</a></div>
<div><h4>Get in touch</h4><p>info@mbono.co.za<br>+27 (0)41 880 0086<br>19 Oakworth Road, Harbour View Building, South End, Gqeberha, 6001</p></div></div>
<small>© 2026 Professional Mbono Services. All rights reserved. · Beta preview</small></footer>`;
const authV=()=>{const m=AUTH,reg=m=='register',fg=m=='forgot',link=(a,t)=>`<a href="#" onclick="AUTH='${a}';render();return false">${t}</a>`;
 if(m=='reset')return `<div class="card" style="max-width:420px;margin:auto"><h2>Choose a new password</h2><label>New password (8+ characters)</label><input id="a2" type="password"><br><br><button class="btn" onclick="doReset()">Save password</button></div>`;
 return `<div class="card" style="max-width:420px;margin:auto"><h2>${reg?'Create your candidate account':fg?'Reset your password':'Sign in'}</h2>
 ${reg?'<label>Full name</label><input id="a0">':''}<label>Email</label><input id="a1" type="email">${fg?'':'<label>Password</label><input id="a2" type="password">'}
 ${reg?'<label><input id="a3" type="checkbox" style="width:auto"> I consent to Mbono processing my personal information for recruitment (POPIA).</label>':''}<br>
 <button class="btn" onclick="${reg?'doReg()':fg?'doForgot()':'doLogin()'}">${reg?'Create account':fg?'Send reset link':'Sign in'}</button>
 <p class="mut">${m=='login'?link('register','Create account')+' · '+link('forgot','Forgot password?'):link('login','Back to sign in')}</p></div>
 ${m=='login'?`<div class="card" style="max-width:420px;margin:1rem auto"><h3>Demo accounts</h3><p class="mut">Password for all: Demo@123</p>${Object.entries(ACC).map(([r,e])=>`<button class="btn o" style="margin:.2rem" onclick="demo('${e}')">${r}</button>`).join('')}</div>`:''}`};
const doLogin=()=>signIn($('a1').value.trim(),$('a2').value).then(render).catch(()=>{});
const demo=e=>signIn(e,'Demo@123').then(render).catch(()=>{});
const doReg=()=>{if(!$('a3').checked){alert('Please give POPIA consent to continue.');return}
 api('POST','/auth/register',{name:$('a0').value,email:$('a1').value,password:$('a2').value,consent:true}).then(start).then(render).catch(()=>{})};
const doForgot=()=>api('POST','/auth/forgot',{email:$('a1').value}).then(()=>{alert('If that email is registered, a reset link has been sent. In this beta the link is printed in the server terminal.');AUTH='login';render()}).catch(()=>{});
const doReset=()=>api('POST','/auth/reset',{token:RT,password:$('a2').value}).then(()=>{alert('Password updated. Please sign in.');RT='';history.replaceState(null,'',location.pathname);AUTH='login';render()}).catch(()=>{});
const V={
jobs(){
 const L=D.jobs.filter(j=>j.st=='Open'&&(!F.t||(j.title+j.skills).toLowerCase().includes(F.t.toLowerCase()))&&(!F.l||j.loc==F.l)&&(!F.i||j.ind==F.i)&&(!F.y||j.type==F.y));
 const op=k=>[...new Set(D.jobs.map(j=>j[k]))].map(x=>`<option ${F[{loc:'l',ind:'i',type:'y'}[k]]==x?'selected':''}>${esc(x)}</option>`).join('');
 return `<div class="hero"><span class="eyebrow">Mbono Career Goals</span><h1>Building skills, unlocking opportunity</h1><p>Work-ready talent and meaningful careers across the Eastern Cape. Search vacancies, apply in one click and track every step.</p>
 <div class="grid"><input id="ft" placeholder="Job title or skill" value="${esc(F.t)}"><select id="fl"><option value="">Any location</option>${op('loc')}</select>
 <select id="fi"><option value="">Any industry</option>${op('ind')}</select><select id="fy"><option value="">Any type</option>${op('type')}</select>
 <button class="btn" onclick="F={t:$('ft').value,l:$('fl').value,i:$('fi').value,y:$('fy').value};render()">Search</button></div></div>
 ${cats()}<p class="mut">${L.length} vacancies</p>`+L.map(j=>{const ap=D.apps.some(a=>a.job==j.id&&a.email==D.me.email);return `<div class="card"><div class="row"><div><h3>${esc(j.title)}</h3>
 <span class="mut">${esc(j.loc)} · ${esc(j.ind)} · ${esc(j.type)} · ${esc(j.sal)}</span></div>
 <div><button class="btn o" onclick="tog(${j.id})">${D.saved.includes(j.id)?'Saved ✓':'Save'}</button> <button class="btn" ${ap?'disabled':''} onclick="applyM(${j.id})">${ap?'Applied':'Apply'}</button></div></div>
 <p>${esc(j.desc)}</p>${chips(j.skills)}</div>`}).join('')+(L.length?'':'<div class="card">No vacancies match your search.</div>')+cta();
},
dash(){
 const my=D.apps.filter(a=>a.email==D.me.email);
 return `<h2>My dashboard</h2><div class="grid" style="margin-bottom:1rem"><div class="stat"><b>${my.length}</b>Applications</div><div class="stat"><b>${D.saved.length}</b>Saved jobs</div><div class="stat"><b>${my.filter(a=>a.stage=='Interview').length}</b>Interviews</div></div>
 <div class="card"><h3>Applications</h3><div class="tw"><table><tr><th>Role</th><th>Status</th><th></th></tr>${my.map(a=>`<tr><td>${esc(job(a.job).title)}</td><td><span class="chip">${a.stage}</span>${a.interview?`<br><span class="mut">Interview ${esc(new Date(a.interview.when).toLocaleString())} · ${esc(a.interview.mode)}${a.interview.link?` · ${esc(a.interview.link)}`:''}</span>`:''}</td><td><button class="btn o" onclick="wd(${a.id})">Withdraw</button></td></tr>`).join('')||'<tr><td colspan=3 class="mut">No applications yet.</td></tr>'}</table></div></div>
 <div class="card"><h3>Saved jobs</h3>${D.saved.map(id=>`<div class="row"><span>${esc(job(id).title)}</span><button class="btn o" onclick="tog(${id})">Remove</button></div>`).join('')||'<span class="mut">Nothing saved.</span>'}</div>`;
},
profile(){const m=D.me;return `<h2>My profile</h2><div class="card"><label>Full name</label><input id="pn" value="${esc(m.name)}"><label>Email</label><input id="pe" value="${esc(m.email)}" readonly>
 <label>Location</label><input id="pl" value="${esc(m.loc)}"><label>Skills (comma separated)</label><input id="ps" value="${esc(m.skills)}">
 <label>CV (PDF or DOCX)</label><input type="file" accept=".pdf,.docx" onchange="upCV(this.files[0])"><p class="mut">${m.cv?`Stored CV: ${esc(m.cv)} · <a href="#" onclick="dlCV();return false">Download</a>`:'Upload a CV and we will read your skills into your profile.'}</p>
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
 return `<h2>Vacancies</h2><div class="card"><h3>New vacancy</h3><div class="grid"><div><label>Title</label><input id="vt"></div><div><label>Location</label><input id="vl"></div><div><label>Industry</label><input id="vi"></div>
 <div><label>Type</label><select id="vy"><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Learnership</option></select></div><div><label>Salary</label><input id="vs" placeholder="R20k–R30k"></div></div>
 <label>Required skills (comma separated)</label><input id="vk"><label>Description</label><textarea id="vd" rows="3"></textarea><br><br>
 <button class="btn" onclick="addJ()">Submit for approval</button></div>
 <div class="card tw"><table><tr><th>Title</th><th>Status</th><th></th></tr>${D.jobs.map(j=>`<tr><td>${esc(j.title)}</td><td><span class="chip">${j.st}</span></td><td><button class="btn o" onclick="dup(${j.id})">Duplicate</button> <button class="btn o" onclick="jst(${j.id},'Closed')">Close</button></td></tr>`).join('')}</table></div>`},
appr(){
 const P=D.jobs.filter(j=>j.st=='Pending');
 return `<h2>Vacancy approvals</h2>`+(P.map(j=>`<div class="card"><h3>${esc(j.title)}</h3><span class="mut">${esc(j.loc)} · ${esc(j.type)} · ${esc(j.sal)}</span><p>${esc(j.desc)}</p>${chips(j.skills)}<br><br>
 <button class="btn" onclick="jst(${j.id},'Open')">Approve</button> <button class="btn o" onclick="jst(${j.id},'Changes requested')">Request changes</button></div>`).join('')||'<div class="card mut">No vacancies waiting for approval.</div>')},
review(){
 const A=D.apps.filter(a=>['Shortlisted','Assessment','Interview','Offer'].includes(a.stage));
 return `<h2>Candidate review</h2>`+(A.map(a=>`<div class="card"><div class="row"><div><h3>${esc(a.name)}</h3><span class="mut">${esc(job(a.job).title)} · ${a.stage} · match ${score(job(a.job),a.skills)}%</span></div>
 <select style="width:130px" onchange="rate(${a.id},+this.value)">${[0,1,2,3,4,5].map(n=>`<option value="${n}" ${a.rate==n?'selected':''}>${n?'★'.repeat(n):'Not rated'}</option>`).join('')}</select></div>
 <p>Skills: ${esc(a.skills)}</p><textarea rows="2" placeholder="Interview feedback" onchange="fb(${a.id},this.value)">${esc(a.fb)}</textarea><br><br>
 <button class="btn" onclick="mv(${a.id},'Offer')">Make offer</button> <button class="btn d" onclick="rej(${a.id})">Reject</button></div>`).join('')||'<div class="card mut">No shortlisted candidates yet.</div>')},
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

function applyM(id){const j=job(id);M=`<div class="ov"><div class="md"><h3>Apply: ${esc(j.title)}</h3><p class="mut">Applying as ${esc(D.me.name)} (${esc(D.me.email)}). Your profile skills are used for matching.</p>
 <label>CV (PDF or DOCX)</label><input id="acv" type="file" accept=".pdf,.docx"><label>Cover letter note</label><textarea id="acl" rows="3"></textarea>
 <label><input id="aco" type="checkbox" style="width:auto"> I consent to my data being processed for recruitment (POPIA).</label><br>
 <button class="btn" onclick="sub(${id})">Submit application</button> <button class="btn o" onclick="close()">Cancel</button></div></div>`;render()}
function det(id){const a=D.apps.find(x=>x.id==id);M=`<div class="ov"><div class="md"><h3>${esc(a.name)}</h3><p class="mut">${esc(a.email)} · ${esc(job(a.job).title)}</p><p>Skills: ${esc(a.skills)}<br>Match score: <b>${score(job(a.job),a.skills)}%</b> · Stage: ${a.stage}</p>
 ${role!='Hiring Manager'?`<h3 style="font-size:1rem">Interview</h3>${a.interview?`<p class="mut">Booked: ${esc(new Date(a.interview.when).toLocaleString())} · ${esc(a.interview.mode)}</p>`:''}<div class="grid"><input id="iw" type="datetime-local"><select id="im"><option>Teams</option><option>In person</option><option>Phone</option></select></div><input id="il" placeholder="Meeting link or venue" style="margin-top:.4rem"><br><br><button class="btn" onclick="book(${a.id})">Send invitation</button>`:''}<h3 style="font-size:1rem">Recruiter notes</h3>${a.notes.map(n=>`<p class="chip">${esc(n)}</p>`).join('')||'<p class="mut">No notes yet.</p>'}
 <textarea id="nt" rows="2" placeholder="Add a note"></textarea><br><br><button class="btn" onclick="addN(${a.id})">Add note</button> <button class="btn d" onclick="rej(${a.id});close()">Reject</button> <button class="btn o" onclick="close()">Close</button></div></div>`;render()}
function tog(id){const x=D.saved.includes(id)?D.saved.filter(i=>i!=id):[...D.saved,id];act(()=>api('PUT','/me',{saved:x}))}
function sub(id){if(!$('aco').checked){alert('Please accept the POPIA consent to continue.');return}
 const c=$('acl').value;M='';act(()=>api('POST','/applications',{jobId:id,coverNote:c,consent:true}))}
function wd(id){act(()=>api('DELETE','/applications/'+id))}
function mv(id,s){if(!id)return;M='';act(()=>api('PATCH','/applications/'+id,{stage:s}))}
function rej(id){act(()=>api('PATCH','/applications/'+id,{stage:'Rejected'}))}
function rate(id,n){act(()=>api('PATCH','/applications/'+id,{rate:n}))}
function fb(id,t){api('PATCH','/applications/'+id,{fb:t}).catch(()=>{})}
function jst(id,s){act(()=>api('PATCH','/jobs/'+id,{st:s}))}
function dup(id){act(()=>api('POST','/jobs/'+id+'/duplicate'))}
function addJ(){const t=$('vt').value.trim();if(!t){alert('Please enter a title.');return}
 act(()=>api('POST','/jobs',{title:t,loc:$('vl').value,ind:$('vi').value,type:$('vy').value,sal:$('vs').value,skills:$('vk').value.split(',').map(x=>x.trim()).filter(Boolean),desc:$('vd').value}))}
function addN(id){const v=$('nt').value.trim();if(v)api('POST','/applications/'+id+'/notes',{note:v}).then(load).then(()=>det(id)).catch(()=>{})}
function saveProfile(){act(()=>api('PUT','/me',{name:$('pn').value,email:$('pe').value,loc:$('pl').value,skills:$('ps').value}))}
async function upCV(f){if(!f)return;const fd=new FormData();fd.append('cv',f);
 try{const r=await fetch(API+'/me/cv',{method:'POST',headers:{Authorization:'Bearer '+TOKEN},body:fd}),j=await r.json();if(!r.ok)throw new Error(j.error);
 alert(j.found.length?'Skills found in your CV: '+j.found.join(', '):'CV saved. No known skills were detected, please add them manually.');await load();render()}catch(e){alert(e.message||'Upload failed')}}
async function dl(path,name){const r=await fetch(API+path,{headers:{Authorization:'Bearer '+TOKEN}});if(!r.ok){alert('Download failed');return}
 const a=document.createElement('a');a.href=URL.createObjectURL(await r.blob());a.download=name;a.click()}
const dlCV=()=>dl('/me/cv',D.me.cv),exp=()=>dl('/me/export','my-data.json');
async function delMe(){const p=prompt('This permanently deletes your account, applications and CV. Type your password to confirm.');if(!p)return;
 try{await api('DELETE','/me',{password:p});alert('Your account and data have been deleted.');signOut()}catch(e){}}
function book(id){const w=$('iw').value;if(!w){alert('Pick a date and time.');return}
 const b={when:new Date(w).toISOString(),mode:$('im').value,link:$('il').value};M='';act(()=>api('POST','/applications/'+id+'/interview',b))}
{const hm=location.hash.match(/reset=([a-f0-9]+)/);if(hm){RT=hm[1];AUTH='reset'}
 if(location.hash=='#register')AUTH='register';
 try{if(AUTH!='reset')TOKEN=localStorage.getItem('mbono_token')}catch(e){}
 if(TOKEN){QUIET=true;api('GET','/me').then(m=>{role=m.role;view=NAV[role][0][0];return load()}).catch(()=>{TOKEN=null}).finally(()=>{QUIET=false;render()})}else render()}
