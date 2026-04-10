import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import Anthropic from '@anthropic-ai/sdk';
import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const DB_FILE = path.join(__dirname, 'civicsense.db.json');

// ── Anthropic client ──────────────────────────────────────────────────────────
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── sql.js (pure-JS SQLite, no native bindings) ────────────────────────────────
const SQL = await initSqlJs();
let db;

if (fs.existsSync(DB_FILE)) {
  try {
    const saved = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    db = new SQL.Database(Buffer.from(saved.data));
    console.log('✅ Loaded DB from disk');
  } catch { db = new SQL.Database(); }
} else {
  db = new SQL.Database();
}

function saveDb() {
  fs.writeFileSync(DB_FILE, JSON.stringify({ data: Array.from(db.export()) }));
}

function query(sql, params = []) {
  const res = db.exec(sql, params);
  if (!res.length) return [];
  const { columns, values } = res[0];
  return values.map(row => Object.fromEntries(columns.map((c, i) => [c, row[i]])));
}
function run(sql, params = []) { db.run(sql, params); saveDb(); }
function get(sql, params = []) { return query(sql, params)[0] || null; }

// ── Schema ────────────────────────────────────────────────────────────────────
db.run(`CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY, type TEXT, severity INTEGER, department TEXT,
  summary TEXT, immediate_action TEXT, estimated_hours INTEGER,
  latitude REAL, longitude REAL, address TEXT, status TEXT DEFAULT 'open',
  image_url TEXT, raw_text TEXT,
  created_at TEXT DEFAULT (datetime('now')), resolved_at TEXT
)`);

// ── Seed demo data ────────────────────────────────────────────────────────────
const cnt = get('SELECT COUNT(*) as c FROM incidents');
if (!cnt || cnt.c === 0) {
  const now = new Date().toISOString();
  const INSERT = `INSERT INTO incidents (id,type,severity,department,summary,immediate_action,estimated_hours,latitude,longitude,address,status,image_url,raw_text,created_at,resolved_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  [
    [uuidv4(),'pothole',8,'PWD','Large pothole causing accidents near metro exit','Barricade and patch within 24 hours',24,28.6139,77.2090,'Connaught Place, New Delhi','open',null,'Deep pothole near metro exit',now,null],
    [uuidv4(),'garbage',7,'Sanitation','Overflowing garbage bins near market area','Emergency pickup required immediately',6,28.6200,77.2150,'Karol Bagh Market, Delhi','open',null,'Garbage overflow at market',now,null],
    [uuidv4(),'streetlight',5,'Electricity','4 streetlights non-functional on residential street','Inspect and replace bulbs/fuse',48,28.6080,77.2200,'Lajpat Nagar, New Delhi','open',null,'Streetlights not working',now,null],
    [uuidv4(),'waterlogging',9,'Drainage','Severe waterlogging blocking entire road after rain','Deploy drainage pumps immediately',12,28.6300,77.2050,'Patel Nagar, New Delhi','in-progress',null,'Road completely flooded',now,null],
    [uuidv4(),'pothole',4,'PWD','Small pothole near school entrance','Schedule repair within 3 days',72,28.6050,77.2300,'South Extension, New Delhi','open',null,'Pothole near school',now,null],
    [uuidv4(),'garbage',6,'Sanitation','Illegal dumping on vacant plot attracting pests','Clear waste and identify offenders',24,28.6250,77.2180,'Rajouri Garden, Delhi','resolved',null,'Illegal garbage dumping',now,now],
    [uuidv4(),'streetlight',3,'Electricity','Flickering streetlight near community park','Replace faulty ballast unit',72,28.5950,77.2400,'Saket, New Delhi','open',null,'Flickering light in park area',now,null],
    [uuidv4(),'waterlogging',6,'Drainage','Clogged drain causing stagnant water on footpath','Drain desilting required urgently',18,28.6400,77.2100,'Rohini Sector 9, Delhi','in-progress',null,'Blocked drain stagnant water',now,null],
    [uuidv4(),'pothole',10,'PWD','Critical pothole caused motorcycle accident this morning','URGENT: Close lane and emergency repair now',4,28.6170,77.2300,'Ring Road near Dhaula Kuan, Delhi','open',null,'Dangerous pothole accident site',now,null],
    [uuidv4(),'garbage',5,'Sanitation','Waste bins not collected for 3 days — overflowing','Schedule immediate collection run',12,28.6320,77.1980,'Pitampura, New Delhi','open',null,'Bins not collected 3 days',now,null],
    [uuidv4(),'streetlight',8,'Electricity','Entire street dark — serious safety risk especially at night','Emergency repair all 8 poles on block',8,28.6010,77.2450,'Malviya Nagar, New Delhi','open',null,'Entire street dark',now,null],
    [uuidv4(),'pothole',6,'PWD','Multiple potholes on busy commercial road slowing traffic','Patch repair scheduled this week',48,28.6420,77.2220,'Wazirpur, Delhi','in-progress',null,'Multiple potholes commercial road',now,null],
  ].forEach(d => db.run(INSERT, d));
  saveDb();
  console.log('✅ Seeded 12 demo incidents');
}

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => { fs.mkdirSync('uploads', { recursive: true }); cb(null, 'uploads/'); },
    filename: (req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`)
  }),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// ── Claude classification prompt ──────────────────────────────────────────────
const CLASSIFY_PROMPT = `You are CivicSense AI — an expert at analyzing urban infrastructure problems in Indian cities.
Analyze the image and/or text description and respond ONLY with valid JSON in exactly this format:
{
  "incident_type": "pothole" | "garbage" | "streetlight" | "waterlogging" | "other",
  "severity": <integer 1-10 where 10 = immediate danger to life>,
  "department": "PWD" | "Sanitation" | "Electricity" | "Drainage" | "Municipal",
  "summary": "<concise one-line description, max 80 chars>",
  "immediate_action": "<specific action the department must take>",
  "estimated_resolution_hours": <integer>,
  "location_context": "<any location details visible or mentioned>"
}
Severity guide: 1-3 minor nuisance, 4-6 moderate disruption, 7-8 significant hazard, 9-10 immediate danger to life.
Return ONLY the JSON object. No markdown. No explanation.`;

// ── Routes ────────────────────────────────────────────────────────────────────

// POST /api/report
app.post('/api/report', upload.single('image'), async (req, res) => {
  try {
    const { text, latitude, longitude, address } = req.body;
    const imageFile = req.file;
    if (!text && !imageFile) return res.status(400).json({ error: 'Provide image or text description' });

    const content = [];
    if (imageFile) {
      content.push({ type: 'image', source: { type: 'base64', media_type: imageFile.mimetype, data: fs.readFileSync(imageFile.path).toString('base64') } });
    }
    content.push({ type: 'text', text: text ? `${CLASSIFY_PROMPT}\n\nUser description: ${text}` : CLASSIFY_PROMPT });

    const aiRes = await anthropic.messages.create({ model: 'claude-opus-4-5', max_tokens: 512, messages: [{ role: 'user', content }] });
    const raw = aiRes.content[0].text.trim();

    let analysis;
    try { analysis = JSON.parse(raw.replace(/```json|```/g, '').trim()); }
    catch { return res.status(500).json({ error: 'AI response parse failed', raw }); }

    const id = uuidv4();
    const image_url = imageFile ? `/uploads/${imageFile.filename}` : null;
    const lat = parseFloat(latitude) || (28.6139 + (Math.random() - 0.5) * 0.06);
    const lng = parseFloat(longitude) || (77.2090 + (Math.random() - 0.5) * 0.06);
    const now = new Date().toISOString();

    run(`INSERT INTO incidents (id,type,severity,department,summary,immediate_action,estimated_hours,latitude,longitude,address,status,image_url,raw_text,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, analysis.incident_type, analysis.severity, analysis.department, analysis.summary,
       analysis.immediate_action, analysis.estimated_resolution_hours,
       lat, lng, address || analysis.location_context || 'New Delhi', 'open', image_url, text || '', now]);

    res.json({ success: true, incident: get('SELECT * FROM incidents WHERE id = ?', [id]), analysis });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/incidents
app.get('/api/incidents', (req, res) => {
  const { status, type, department } = req.query;
  let sql = 'SELECT * FROM incidents WHERE 1=1';
  const params = [];
  if (status)     { sql += ' AND status = ?';     params.push(status); }
  if (type)       { sql += ' AND type = ?';       params.push(type); }
  if (department) { sql += ' AND department = ?'; params.push(department); }
  sql += ' ORDER BY severity DESC, created_at DESC';
  res.json(query(sql, params));
});

// GET /api/stats
app.get('/api/stats', (req, res) => {
  const total      = get('SELECT COUNT(*) as c FROM incidents').c;
  const open       = get("SELECT COUNT(*) as c FROM incidents WHERE status='open'").c;
  const inProgress = get("SELECT COUNT(*) as c FROM incidents WHERE status='in-progress'").c;
  const resolved   = get("SELECT COUNT(*) as c FROM incidents WHERE status='resolved'").c;
  const critical   = get("SELECT COUNT(*) as c FROM incidents WHERE severity >= 8 AND status != 'resolved'").c;
  const avgRow     = get("SELECT AVG(CAST(severity AS REAL)) as avg FROM incidents WHERE status != 'resolved'");
  const avgSeverity = avgRow?.avg ? Math.round(avgRow.avg * 10) / 10 : 0;
  const byType     = query('SELECT type, COUNT(*) as count FROM incidents GROUP BY type');
  const byDept     = query("SELECT department, COUNT(*) as count FROM incidents WHERE status != 'resolved' GROUP BY department ORDER BY count DESC");
  res.json({ total, open, inProgress, resolved, critical, avgSeverity, byType, byDept });
});

// PATCH /api/incidents/:id/status
app.patch('/api/incidents/:id/status', (req, res) => {
  const { status } = req.body;
  const resolved_at = status === 'resolved' ? new Date().toISOString() : null;
  run('UPDATE incidents SET status = ?, resolved_at = ? WHERE id = ?', [status, resolved_at, req.params.id]);
  res.json(get('SELECT * FROM incidents WHERE id = ?', [req.params.id]));
});

// GET /api/incidents/:id
app.get('/api/incidents/:id', (req, res) => {
  const incident = get('SELECT * FROM incidents WHERE id = ?', [req.params.id]);
  if (!incident) return res.status(404).json({ error: 'Not found' });
  res.json(incident);
});

app.listen(PORT, () => console.log(`🚀 CivicSense backend → http://localhost:${PORT}`));
