// Mbono Professional Services – recruitment API (beta)
// Storage is a JSON file (data/db.json) so nothing else needs installing.
// To move to SQL Server later, replace the load()/save() helpers and the db.* reads.
const express = require('express'), cors = require('cors'), jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const multer = require('multer'), nodemailer = require('nodemailer'), mammoth = require('mammoth');
const pdfParse = require('pdf-parse/lib/pdf-parse.js');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const UPLOADS = path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOADS, { recursive: true });

const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const DB_FILE = path.join(__dirname, 'data', 'db.json');
const STAGES = ['Applied','Screening','Shortlisted','Assessment','Interview','Offer','Hired','Rejected'];

// ---------- storage ----------
function load() {
  if (fs.existsSync(DB_FILE)) return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  const seed = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'seed.json'), 'utf8'));
  const pw = bcrypt.hashSync('Demo@123', 8);
  // The admin account is not a public demo account: its password comes from ADMIN_PASSWORD, or is generated and shown once below.
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@mbono.demo';
  const adminPw = process.env.ADMIN_PASSWORD || crypto.randomBytes(9).toString('base64url');
  if (!process.env.ADMIN_PASSWORD) console.log(`\n*** Admin account created. Email: ${adminEmail}  Password: ${adminPw}  (shown once; set ADMIN_PASSWORD in .env to choose your own) ***\n`);
  const u = (id, name, email, role, extra = {}) => ({ id, name, email, role, pw, loc: '', skills: '', saved: [], ...extra });
  return {
    users: [
      u(1, 'Zanele Dlamini', 'candidate@mbono.demo', 'Candidate', { loc: 'Gqeberha', skills: 'Communication, Customer service, Computer literacy' }),
      u(2, 'Sam Recruiter', 'recruiter@mbono.demo', 'Recruiter'),
      u(3, 'Nomsa Manager', 'manager@mbono.demo', 'Hiring Manager'),
      u(4, 'Admin User', adminEmail, 'Admin', { pw: bcrypt.hashSync(adminPw, 10) }),
    ],
    jobs: seed.jobs, apps: seed.apps, audit: [],
  };
}
const db = load();
const save = () => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
const nextId = list => list.reduce((m, x) => Math.max(m, x.id), 0) + 1;
const log = (user, msg) => { db.audit.unshift({ t: new Date().toLocaleString('en-ZA'), r: user.role, m: msg }); db.audit = db.audit.slice(0, 300); };
const publicUser = u => { const { pw, reset, cvFile, ...rest } = u; return rest; };

// ---------- middleware ----------
const app = express();
app.use(cors());
app.use(express.json());
const auth = (...roles) => (req, res, next) => {
  try { req.user = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), SECRET); }
  catch { return res.status(401).json({ error: 'Please sign in' }); }
  if (!db.users.some(u => u.id === req.user.id)) return res.status(401).json({ error: 'Please sign in' });
  if (roles.length && !roles.includes(req.user.role)) return res.status(403).json({ error: 'Not allowed for your role' });
  next();
};
const me = req => db.users.find(u => u.id === req.user.id);
const STAFF = ['Recruiter', 'Hiring Manager', 'Admin'];

// ---------- auth ----------
app.post('/api/auth/login', (req, res) => {
  const { email = '', password = '' } = req.body;
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.pw)) return res.status(401).json({ error: 'Wrong email or password' });
  log(user, `${user.name} signed in`); save();
  res.json({ token: jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '8h' }), role: user.role });
});

// ---------- profile ----------
app.get('/api/me', auth(), (req, res) => res.json(publicUser(me(req))));
app.put('/api/me', auth(), (req, res) => {
  const u = me(req);
  for (const k of ['name', 'loc', 'skills', 'saved']) if (req.body[k] !== undefined) u[k] = req.body[k];
  if (req.body.skills !== undefined || req.body.name !== undefined) log(u, 'Profile updated');
  save(); res.json(publicUser(u));
});

// ---------- vacancies ----------
app.get('/api/jobs', auth(), (req, res) =>
  res.json(STAFF.includes(req.user.role) ? db.jobs : db.jobs.filter(j => j.st === 'Open')));

app.post('/api/jobs', auth('Recruiter', 'Admin'), (req, res) => {
  const b = req.body;
  if (!b.title || !String(b.title).trim()) return res.status(400).json({ error: 'Title is required' });
  const job = { id: nextId(db.jobs), title: b.title.trim(), loc: b.loc || 'Remote', ind: b.ind || 'General', type: b.type || 'Full-time',
    sal: b.sal || 'Negotiable', skills: Array.isArray(b.skills) ? b.skills : [], desc: b.desc || '', st: 'Pending' };
  db.jobs.push(job); log(req.user, `Vacancy created: ${job.title}`); save(); res.status(201).json(job);
});

app.patch('/api/jobs/:id', auth(...STAFF), (req, res) => {
  const job = db.jobs.find(j => j.id == req.params.id);
  if (!job) return res.status(404).json({ error: 'Vacancy not found' });
  const allowed = req.user.role === 'Recruiter' ? ['Closed'] : ['Open', 'Changes requested', 'Closed'];
  if (!allowed.includes(req.body.st)) return res.status(403).json({ error: `${req.user.role} cannot set status "${req.body.st}"` });
  job.st = req.body.st; log(req.user, `Vacancy ${job.title}: ${job.st}`); save(); res.json(job);
});

app.post('/api/jobs/:id/duplicate', auth('Recruiter', 'Admin'), (req, res) => {
  const job = db.jobs.find(j => j.id == req.params.id);
  if (!job) return res.status(404).json({ error: 'Vacancy not found' });
  const copy = { ...job, id: nextId(db.jobs), title: job.title + ' (copy)', st: 'Pending' };
  db.jobs.push(copy); log(req.user, 'Vacancy duplicated'); save(); res.status(201).json(copy);
});

// ---------- applications ----------
app.get('/api/applications', auth(), (req, res) => {
  const list = req.user.role === 'Candidate' ? db.apps.filter(a => a.email === me(req).email) : db.apps;
  res.json(list);
});

app.post('/api/applications', auth('Candidate'), (req, res) => {
  const u = me(req), job = db.jobs.find(j => j.id == req.body.jobId);
  if (!job || job.st !== 'Open') return res.status(400).json({ error: 'This vacancy is not open' });
  if (!req.body.consent) return res.status(400).json({ error: 'POPIA consent is required' });
  if (db.apps.some(a => a.job === job.id && a.email === u.email)) return res.status(409).json({ error: 'You already applied' });
  const a = { id: nextId(db.apps), job: job.id, name: u.name, email: u.email, skills: u.skills, stage: 'Applied',
    notes: [], rate: 0, fb: '', cover: req.body.coverNote || '' };
  db.apps.push(a); log(req.user, `Applied for ${job.title}`); save();
  mail(u.email, `Application received: ${job.title}`, `Hi ${u.name},\n\nWe received your application for ${job.title}. You can follow its status on your dashboard.\n\nMbono Professional Services`); res.status(201).json(a);
});

app.delete('/api/applications/:id', auth('Candidate'), (req, res) => {
  const i = db.apps.findIndex(a => a.id == req.params.id && a.email === me(req).email);
  if (i < 0) return res.status(404).json({ error: 'Application not found' });
  db.apps.splice(i, 1); log(req.user, 'Application withdrawn'); save(); res.json({ ok: true });
});

app.patch('/api/applications/:id', auth(...STAFF), (req, res) => {
  const a = db.apps.find(x => x.id == req.params.id);
  if (!a) return res.status(404).json({ error: 'Application not found' });
  const { stage, rate, fb } = req.body;
  if (stage !== undefined) {
    if (!STAGES.includes(stage)) return res.status(400).json({ error: 'Unknown stage' });
    a.stage = stage; log(req.user, `${a.name} moved to ${stage}`); notifyStage(a, stage);
  }
  if (rate !== undefined) { a.rate = Math.max(0, Math.min(5, +rate || 0)); log(req.user, `${a.name} rated ${a.rate}`); }
  if (fb !== undefined) { a.fb = String(fb); log(req.user, `Feedback updated for ${a.name}`); }
  save(); res.json(a);
});

app.post('/api/applications/:id/notes', auth(...STAFF), (req, res) => {
  const a = db.apps.find(x => x.id == req.params.id);
  if (!a || !req.body.note) return res.status(400).json({ error: 'Note and application required' });
  a.notes.push(String(req.body.note)); log(req.user, `Note added on ${a.name}`); save(); res.json(a);
});

// ---------- admin ----------
app.get('/api/users', auth('Admin'), (req, res) => res.json(db.users.map(publicUser)));
app.get('/api/audit', auth('Admin'), (req, res) => res.json(db.audit));

// ---------- email (SMTP if configured, otherwise printed and saved to data/outbox.log) ----------
const tx = process.env.SMTP_HOST ? nodemailer.createTransport({ host: process.env.SMTP_HOST, port: +process.env.SMTP_PORT || 587,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } }) : null;
async function mail(to, subject, text, attachments) {
  const m = { from: process.env.MAIL_FROM || 'Mbono Careers <no-reply@mbono.co.za>', to, subject, text, attachments };
  if (tx) { try { await tx.sendMail(m); } catch (e) { console.error('Email failed:', e.message); } return; }
  const out = `\n[EMAIL not sent, no SMTP set] To: ${to}\nSubject: ${subject}\n${text}\n`;
  console.log(out); fs.appendFileSync(path.join(__dirname, 'data', 'outbox.log'), out);
}
const jobOf = a => db.jobs.find(j => j.id === a.job) || { title: 'the vacancy' };
function notifyStage(a, s) {
  const t = { Screening: 'is being screened', Shortlisted: 'has been shortlisted', Interview: 'has moved to the interview stage (an invitation will follow)',
    Offer: 'has resulted in an offer', Hired: 'was successful. Congratulations!', Rejected: 'was not successful this time' }[s];
  if (t) mail(a.email, `Application update: ${jobOf(a).title}`, `Hi ${a.name},\n\nYour application for ${jobOf(a).title} ${t}.\n\nMbono Professional Services`);
}

// ---------- sign-up and password reset ----------
const sha = x => crypto.createHash('sha256').update(x).digest('hex');
const issue = u => ({ token: jwt.sign({ id: u.id, role: u.role }, SECRET, { expiresIn: '8h' }), role: u.role });
app.post('/api/auth/register', (req, res) => {
  const { name = '', email = '', password = '', consent } = req.body;
  if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Enter your name and a valid email' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  if (!consent) return res.status(400).json({ error: 'POPIA consent is required' });
  if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) return res.status(409).json({ error: 'That email is already registered' });
  const u = { id: nextId(db.users), name: name.trim(), email: email.trim(), role: 'Candidate', pw: bcrypt.hashSync(password, 10),
    loc: '', skills: '', saved: [], consentAt: new Date().toISOString() };
  db.users.push(u); log(u, `${u.name} registered`); save();
  mail(u.email, 'Welcome to Mbono Careers', `Hi ${u.name},\n\nYour account is ready. Upload your CV to fill in your skills and start applying.\n\nMbono Professional Services`);
  res.status(201).json(issue(u));
});
app.post('/api/auth/forgot', (req, res) => {
  const u = db.users.find(x => x.email.toLowerCase() === String(req.body.email || '').toLowerCase());
  if (u) {
    const t = crypto.randomBytes(24).toString('hex');
    u.reset = { h: sha(t), exp: Date.now() + 3600e3 }; save();
    mail(u.email, 'Reset your password', `Hi ${u.name},\n\nUse this link within one hour to choose a new password:\n${BASE_URL}/app.html#reset=${t}\n\nIf you did not ask for this, ignore this email.`);
  }
  res.json({ ok: true }); // same answer either way, so emails cannot be probed
});
app.post('/api/auth/reset', (req, res) => {
  const { token = '', password = '' } = req.body;
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  const u = db.users.find(x => x.reset && x.reset.h === sha(token) && x.reset.exp > Date.now());
  if (!u) return res.status(400).json({ error: 'This reset link is invalid or has expired' });
  u.pw = bcrypt.hashSync(password, 10); delete u.reset; log(u, `${u.name} reset their password`); save(); res.json({ ok: true });
});

// ---------- CV upload and parsing ----------
const SKILLS = ['Communication','Customer service','Excel','MS Office','Data capturing','Filing','Records management','Teamwork','Leadership','Coaching',
  'Reporting','Digital literacy','Packing','Stock handling','Payroll','CRM','Problem solving','Typing','Computer literacy','Attention to detail','SQL','JavaScript','Python','C#','React'];
const up = multer({ storage: multer.diskStorage({ destination: UPLOADS, filename: (r, f, cb) => cb(null, `${r.user.id}-${Date.now()}${path.extname(f.originalname).toLowerCase()}`) }),
  limits: { fileSize: 5e6 }, fileFilter: (r, f, cb) => cb(null, /\.(pdf|docx)$/i.test(f.originalname)) });
async function cvText(file) {
  const buf = fs.readFileSync(file.path);
  return /\.pdf$/i.test(file.originalname) ? (await pdfParse(buf)).text : (await mammoth.extractRawText({ buffer: buf })).value;
}
app.post('/api/me/cv', auth(), up.single('cv'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Upload a PDF or DOCX file under 5 MB' });
  const u = me(req);
  try {
    const text = (await cvText(req.file)).toLowerCase();
    const all = [...new Set([...SKILLS, ...db.jobs.flatMap(j => j.skills)])];
    const found = all.filter(sk => text.includes(sk.toLowerCase()));
    const have = u.skills.split(',').map(x => x.trim()).filter(Boolean);
    u.skills = [...new Set([...have, ...found])].join(', ');
    if (u.cvFile) fs.rmSync(path.join(UPLOADS, u.cvFile), { force: true });
    u.cv = req.file.originalname; u.cvFile = req.file.filename; log(u, 'CV uploaded'); save();
    res.json({ found, profile: publicUser(u) });
  } catch (e) { fs.rmSync(req.file.path, { force: true }); res.status(422).json({ error: 'We could not read that file' }); }
});
app.get('/api/me/cv', auth(), (req, res) => {
  const u = me(req);
  if (!u.cvFile) return res.status(404).json({ error: 'No CV stored' });
  res.download(path.join(UPLOADS, u.cvFile), u.cv);
});

// ---------- interviews (invitation email with a calendar file) ----------
function ics(a, job, iv) {
  const d = new Date(iv.when), f = x => x.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Mbono//Careers//EN', 'BEGIN:VEVENT', `UID:${a.id}-${+d}@mbono.co.za`, `DTSTAMP:${f(new Date())}`,
    `DTSTART:${f(d)}`, `DTEND:${f(new Date(+d + 3600e3))}`, `SUMMARY:Interview - ${job.title}`, `DESCRIPTION:${iv.mode} interview ${iv.link || ''}`.trim(),
    iv.link ? `LOCATION:${iv.link}` : '', 'END:VEVENT', 'END:VCALENDAR'].filter(Boolean).join('\r\n');
}
app.post('/api/applications/:id/interview', auth('Recruiter', 'Admin'), (req, res) => {
  const a = db.apps.find(x => x.id == req.params.id), { when, mode = 'Teams', link = '' } = req.body;
  if (!a) return res.status(404).json({ error: 'Application not found' });
  if (!when || isNaN(new Date(when))) return res.status(400).json({ error: 'Choose a valid date and time' });
  a.interview = { when, mode, link }; a.stage = 'Interview'; log(req.user, `Interview booked for ${a.name}`); save();
  const when_ = new Date(when).toLocaleString('en-ZA');
  mail(a.email, `Interview invitation: ${jobOf(a).title}`, `Hi ${a.name},\n\nYou are invited to an interview for ${jobOf(a).title}.\nWhen: ${when_}\nHow: ${mode}${link ? '\nLink or venue: ' + link : ''}\n\nA calendar file is attached.\n\nMbono Professional Services`,
    [{ filename: 'interview.ics', content: ics(a, jobOf(a), a.interview), contentType: 'text/calendar' }]);
  res.json(a);
});

// ---------- POPIA: export and delete my data ----------
app.get('/api/me/export', auth(), (req, res) => {
  const u = me(req);
  res.setHeader('Content-Disposition', 'attachment; filename="my-data.json"');
  res.json({ exportedAt: new Date().toISOString(), profile: publicUser(u), applications: db.apps.filter(a => a.email === u.email) });
});
app.delete('/api/me', auth('Candidate'), (req, res) => {
  const u = me(req);
  if (!bcrypt.compareSync(req.body.password || '', u.pw)) return res.status(403).json({ error: 'Wrong password' });
  if (u.cvFile) fs.rmSync(path.join(UPLOADS, u.cvFile), { force: true });
  db.apps = db.apps.filter(a => a.email !== u.email);
  db.audit.forEach(x => { x.m = x.m.split(u.name).join('Deleted candidate'); });
  db.users = db.users.filter(x => x.id !== u.id);
  db.audit.unshift({ t: new Date().toLocaleString('en-ZA'), r: 'Candidate', m: 'Candidate account and data deleted (POPIA request)' }); save();
  res.json({ ok: true });
});

app.use((err, req, res, next) => res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'File is too large (max 5 MB)' : err.message }));

// ---------- frontend ----------
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.listen(PORT, () => console.log(`Mbono Professional Services running at http://localhost:${PORT}`));
