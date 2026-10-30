// Sign-in pop-up shared by the landing page and the app. Roles: Candidate, Recruiter, Hiring Manager.
// (Admins sign in with their own details; they are not listed.)
const API=location.port=='3000'?'/api':'http://localhost:3000/api';
const MB_VIDEO=''; // Hero video: after adding a file such as frontend/img/hero/hero.mp4, set this to 'img/hero/hero.mp4' and refresh.
const MBAuth=(()=>{
 const ROLES=[['Candidate','candidate@mbono.demo'],['Recruiter','recruiter@mbono.demo'],['Hiring Manager','manager@mbono.demo'],...(location.hash=='#admin'?[['Administrator','']]:[])];
 let mode='login',tok='',note='';
 const st=document.createElement('style');
 st.textContent=`.mbo{position:fixed;inset:0;z-index:100;background:rgba(8,40,28,.62);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:1rem}
 .mbb{position:relative;background:#fff;border-radius:18px;width:100%;max-width:410px;max-height:94vh;overflow:auto;padding:1.4rem 1.6rem;box-shadow:0 24px 60px rgba(0,0,0,.35);font:15px/1.5 system-ui,sans-serif;color:#16231d}
 .mbb h2{margin:.2rem 0 .6rem;text-align:center;color:#0f4a33;font-size:1.35rem}.mbl{display:block;margin:0 auto;width:120px;height:120px;object-fit:contain}
 .mbb label{display:block;font-size:.8rem;color:#5b6b62;margin:.7rem 0 .2rem}.mbb label.ck{display:flex;gap:.5rem;align-items:flex-start}
 .mbb input,.mbb select{width:100%;font:inherit;padding:.6rem .7rem;border:1px solid #cfdfd2;border-radius:9px;background:#fff}.mbb input[type=checkbox]{width:auto;margin-top:.25rem}
 .mbb input:focus,.mbb select:focus{outline:2px solid #10b981;outline-offset:1px}
 .mbs{width:100%;margin-top:.8rem;background:#14573f;color:#fff;border:0;border-radius:9px;padding:.75rem;font:inherit;font-weight:700;cursor:pointer}.mbs:hover{background:#0f4a33}
 .mbx{position:absolute;top:.6rem;right:.8rem;background:none;border:0;font-size:1.6rem;line-height:1;cursor:pointer;color:#5b6b62}
 .mbe{min-height:1.2rem;margin:.5rem 0 0;font-size:.85rem;color:#b3392f}.mbe.ok{color:#1f8a4c}.mbk,.mbh{text-align:center;font-size:.85rem;margin:.7rem 0 0;color:#5b6b62}.mbb a{color:#0e7a56;font-weight:600}`;
 document.head.appendChild(st);
 const root=document.createElement('div');document.body.appendChild(root);
 const q=s=>root.querySelector(s);
 const post=async(p,b)=>{const r=await fetch(API+p,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'Something went wrong');return j};
 const msg=(t,ok)=>{const m=q('#mm');m.textContent=t;m.className='mbe'+(ok?' ok':'')};
 function draw(){
  const T={login:'Portal Login',register:'Create your candidate account',forgot:'Reset your password',reset:'Choose a new password'}[mode];
  root.innerHTML=`<div class="mbo" data-bg><div class="mbb" role="dialog" aria-modal="true" aria-label="${T}"><button class="mbx" data-x aria-label="Close">×</button>
  <img class="mbl" src="img/logo-light.png" alt="Mbono Career Goals"><h2>${T}</h2><form id="mf" novalidate>
  ${mode=='login'?`<label for="mr">Sign in as</label><select id="mr">${ROLES.map(r=>`<option>${r[0]}</option>`).join('')}</select>`:''}
  ${mode=='register'?'<label for="mn">Full name</label><input id="mn" autocomplete="name">':''}
  ${mode=='reset'?'':'<label for="me">Email</label><input id="me" type="email" autocomplete="username">'}
  ${mode=='forgot'?'':`<label for="mp">${mode=='reset'?'New password (8+ characters)':'Password'}</label><input id="mp" type="password" autocomplete="${mode=='login'?'current-password':'new-password'}">`}
  ${mode=='register'?'<label class="ck"><input id="mc" type="checkbox"> I consent to Mbono processing my personal information for recruitment (POPIA).</label>':''}
  <p class="mbe" id="mm" role="alert"></p><button class="mbs" type="submit">${{login:'Sign in',register:'Create account',forgot:'Send reset link',reset:'Save password'}[mode]}</button></form>
  <p class="mbk">${mode=='login'?'<a href="#" data-m="register">Create candidate account</a> · <a href="#" data-m="forgot">Forgot password?</a>':'<a href="#" data-m="login">Back to sign in</a>'}</p>
  ${mode=='login'?'<p class="mbh">Beta demo: <a href="#" data-fill>fill demo details</a> for the selected role.</p>':''}</div></div>`;
  if(note){msg(note,true);note=''}
  (q('#mr')?q('#mr'):q('input')).focus();
 }
 function done(j){try{localStorage.setItem('mbono_token',j.token)}catch(e){}close();MBAuth.onDone?MBAuth.onDone(j):location.href='app.html'}
 function close(){root.innerHTML=''}
 root.addEventListener('click',e=>{const t=e.target;
  if(t.dataset.x!==undefined||t.dataset.bg!==undefined)close();
  if(t.dataset.m){e.preventDefault();mode=t.dataset.m;draw()}
  if(t.dataset.fill!==undefined){e.preventDefault();q('#me').value=ROLES.find(r=>r[0]==q('#mr').value)[1];q('#mp').value='Demo@123'}});
 root.addEventListener('submit',async e=>{e.preventDefault();
  const v=i=>q('#'+i)?q('#'+i).value:'';
  try{
   if(mode=='login'){if(!v('me').trim()||!v('mp'))return msg('Enter your email and password.');done(await post('/auth/login',{email:v('me').trim(),password:v('mp'),role:v('mr')}))}
   else if(mode=='register'){if(!q('#mc').checked)return msg('Please give POPIA consent to continue.');done(await post('/auth/register',{name:v('mn'),email:v('me').trim(),password:v('mp'),consent:true}))}
   else if(mode=='forgot'){await post('/auth/forgot',{email:v('me').trim()});msg('If that email is registered, a reset link has been sent. In this beta the link is printed in the server terminal.',true)}
   else{await post('/auth/reset',{token:tok,password:v('mp')});history.replaceState(null,'',location.pathname);mode='login';note='Password updated. Please sign in.';draw()}
  }catch(err){msg(err.message)}});
 document.addEventListener('keydown',e=>{if(e.key=='Escape')close()});
 return{open(m='login',t=''){mode=m;tok=t;draw()},close,onDone:null};
})();