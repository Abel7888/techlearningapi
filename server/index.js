import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import crypto from 'crypto';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5174;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

const dataPath = path.join(__dirname, 'data.json');

// Uploads setup
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
// Memory storage for conditional upload (Supabase or local fallback)
// Limit file size to 25 MB to avoid excessive memory use on the server
const uploadMem = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });
app.use('/uploads', express.static(uploadsDir));

// Supabase env config (optional)
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || '';
const SUPABASE_PUBLIC = (process.env.SUPABASE_PUBLIC || 'true').toLowerCase() === 'true';
// Admin auth config
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

// Simple HMAC-signed token utilities (JWT-like, no external deps)
function base64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function signToken(payload, secret, expiresInSeconds = 60 * 60 * 8) { // 8 hours default
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expiresInSeconds };
  const h = base64url(JSON.stringify(header));
  const b = base64url(JSON.stringify(body));
  const data = `${h}.${b}`;
  const sig = crypto.createHmac('sha256', secret).update(data).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${data}.${sig}`;
}

function verifyToken(token, secret) {
  if (!token || typeof token !== 'string' || token.split('.').length !== 3) return null;
  const [h, b, s] = token.split('.');
  const data = `${h}.${b}`;
  const expected = crypto.createHmac('sha256', secret).update(data).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  if (s !== expected) return null;
  try {
    const payload = JSON.parse(Buffer.from(b.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function adminRequired(req, res, next) {
  if (!ADMIN_PASSWORD) return res.status(503).json({ error: 'Admin not configured' });
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const payload = verifyToken(token, ADMIN_PASSWORD);
  if (!payload || payload.sub !== 'admin') return res.status(401).json({ error: 'Unauthorized' });
  next();
}

function loadData() {
  if (!fs.existsSync(dataPath)) {
    const seed = {
      tracks: [
        {
          id: 'healthcare',
          name: 'Healthcare Technology',
          description: 'AI in diagnostics, telehealth, devices, compliance, and GTM',
          modules: [
            { day: 1, topic: 'Healthcare Tech Landscape', takeaways: 'AI in diagnostics, edge computing, telehealth', activity: 'AI-assisted imaging demo' },
            { day: 2, topic: 'Digital Trials & Real-World Evidence', takeaways: 'ePRO apps, decentralized trials, wearables', activity: 'Blockchain data integrity exercise' },
            { day: 3, topic: 'Generative AI in Drug Discovery', takeaways: 'Protein folding, molecule design', activity: 'AI-driven compound screening' },
            { day: 4, topic: 'Medical Devices & IoT', takeaways: 'Smart sensors, digital twins', activity: 'Build a patient-device integration mockup' },
            { day: 5, topic: 'Data Privacy & Compliance', takeaways: 'HIPAA, GDPR, FDA regulations', activity: 'Secure data pipeline walkthrough' },
            { day: 6, topic: 'Automation in Manufacturing', takeaways: 'Robotics in pharma production', activity: 'Virtual factory tour' },
            { day: 7, topic: 'Go-to-Market Strategy', takeaways: 'Partnering with hospitals & payers', activity: 'Group pitch simulation' }
          ],
          content: [],
          quizzes: []
        },
        { id: 'construction', name: 'Construction Technology', description: 'Smart building, IoT sensors, automation', modules: [], content: [], quizzes: [] },
        { id: 'finance', name: 'Finance Technology', description: 'Blockchain, AI trading, digital banking', modules: [], content: [], quizzes: [] },
        { id: 'realestate', name: 'PropTech', description: 'Virtual tours, property mgmt, smart home tech', modules: [], content: [], quizzes: [] }
      ]
    };
    fs.writeFileSync(dataPath, JSON.stringify(seed, null, 2));
    return seed;
  }
  const raw = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(raw);
}

function saveData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// API routes
app.get('/api/tracks', (req, res) => {
  const db = loadData();
  res.json(db.tracks.map(({ quizzes, ...t }) => t));
});

// Update content item
app.patch('/api/content/:id', adminRequired, (req, res) => {
  const { id } = req.params;
  const { title, type, url, description, day } = req.body || {};
  const db = loadData();
  let found = null;
  for (const t of db.tracks) {
    const idx = t.content.findIndex(c => c.id === id);
    if (idx !== -1) {
      const current = t.content[idx];
      const updated = {
        ...current,
        ...(title !== undefined ? { title } : {}),
        ...(type !== undefined ? { type } : {}),
        ...(url !== undefined ? { url } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(day !== undefined ? { day } : {}),
      };
      t.content[idx] = updated;
      found = updated;
      break;
    }
  }
  if (!found) return res.status(404).json({ error: 'Content not found' });
  saveData(db);
  res.json(found);
});

// Delete content item
app.delete('/api/content/:id', adminRequired, (req, res) => {
  const { id } = req.params;
  const db = loadData();
  let removed = false;
  for (const t of db.tracks) {
    const before = t.content.length;
    t.content = t.content.filter(c => c.id !== id);
    if (t.content.length !== before) {
      removed = true;
      break;
    }
  }
  if (!removed) return res.status(404).json({ error: 'Content not found' });
  saveData(db);
  res.status(204).end();
});

app.get('/api/tracks/:id', (req, res) => {
  const db = loadData();
  const track = db.tracks.find(t => t.id === req.params.id);
  if (!track) return res.status(404).json({ error: 'Track not found' });
  res.json(track);
});

// Replace modules for a track
app.patch('/api/tracks/:id/modules', adminRequired, (req, res) => {
  const { id } = req.params;
  const { modules } = req.body || {};
  if (!Array.isArray(modules)) return res.status(400).json({ error: 'modules must be an array' });
  const db = loadData();
  const track = db.tracks.find(t => t.id === id);
  if (!track) return res.status(404).json({ error: 'Track not found' });
  track.modules = modules;
  saveData(db);
  res.json(track);
});

app.post('/api/content', adminRequired, (req, res) => {
  const { trackId, title, type, url, description, day } = req.body || {};
  if (!trackId || !title) return res.status(400).json({ error: 'trackId and title are required' });
  const db = loadData();
  const track = db.tracks.find(t => t.id === trackId);
  if (!track) return res.status(404).json({ error: 'Track not found' });
  const item = { id: 'c_' + Date.now(), title, type: type || 'doc', url: url || '', description: description || '', createdAt: new Date().toISOString(), day: typeof day === 'number' ? day : undefined };
  track.content.push(item);
  saveData(db);
  res.status(201).json(item);
});

// Upload endpoint for PDFs (multipart/form-data with field name 'file')
app.post('/api/upload', adminRequired, uploadMem.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // If Supabase is configured, upload to Supabase Storage via REST
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY && SUPABASE_BUCKET) {
      const ts = Date.now();
      const safeName = (req.file.originalname || 'file').replace(/[^a-zA-Z0-9_.-]/g, '_');
      const objectKey = `${ts}_${safeName}`;
      const uploadUrl = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/${encodeURIComponent(SUPABASE_BUCKET)}/${encodeURIComponent(objectKey)}`;

      const putResp = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': req.file.mimetype || 'application/octet-stream',
          'x-upsert': 'true'
        },
        body: req.file.buffer
      });

      if (!putResp.ok) {
        const txt = await putResp.text().catch(() => '');
        return res.status(500).json({ error: 'Supabase upload failed', detail: txt });
      }

      let finalUrl = '';
      if (SUPABASE_PUBLIC) {
        // Try public bucket URL first
        const publicUrl = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${encodeURIComponent(SUPABASE_BUCKET)}/${encodeURIComponent(objectKey)}`;
        try {
          const head = await fetch(publicUrl, { method: 'HEAD' });
          if (head.ok) {
            finalUrl = publicUrl;
          } else {
            // Fallback to signed if bucket/object isn't actually public
            const signUrl = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/sign/${encodeURIComponent(SUPABASE_BUCKET)}/${encodeURIComponent(objectKey)}`;
            const signResp = await fetch(signUrl, {
              method: 'POST',
              headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ expiresIn: 60 * 60 * 24 * 7 }) // 7 days
            });
            if (!signResp.ok) {
              const txt = await signResp.text().catch(() => '');
              return res.status(500).json({ error: 'Supabase sign failed', detail: txt });
            }
            const data = await signResp.json();
            const signedPath = data?.signedURL || data?.signedUrl || data?.signed_path || '';
            finalUrl = signedPath ? `${SUPABASE_URL.replace(/\/$/, '')}${signedPath}` : '';
          }
        } catch {
          finalUrl = publicUrl;
        }
      } else {
        // Generate a signed URL (default 7 days)
        const signUrl = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/sign/${encodeURIComponent(SUPABASE_BUCKET)}/${encodeURIComponent(objectKey)}`;
        const signResp = await fetch(signUrl, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ expiresIn: 60 * 60 * 24 * 7 })
        });
        if (!signResp.ok) {
          const txt = await signResp.text().catch(() => '');
          return res.status(500).json({ error: 'Supabase sign failed', detail: txt });
        }
        const data = await signResp.json();
        const signedPath = data?.signedURL || data?.signedUrl || data?.signed_path || '';
        finalUrl = signedPath ? `${SUPABASE_URL.replace(/\/$/, '')}${signedPath}` : '';
      }

      return res.status(201).json({
        url: finalUrl,
        key: objectKey,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        provider: 'supabase'
      });
    }

    // Fallback: save to local disk under uploads/
    const ts = Date.now();
    const safe = (req.file.originalname || 'file').replace(/[^a-zA-Z0-9_.-]/g, '_');
    const filename = `${ts}_${safe}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, req.file.buffer);
    const publicUrl = `/uploads/${filename}`;
    return res.status(201).json({
      url: publicUrl,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      provider: 'local'
    });
  } catch (e) {
    console.error('Upload error:', e);
    return res.status(500).json({ error: 'Upload failed' });
  }
});

app.post('/api/quiz', adminRequired, (req, res) => {
  const { trackId, question, options, answer, day } = req.body || {};
  if (!trackId || !question) return res.status(400).json({ error: 'trackId and question are required' });
  const db = loadData();
  const track = db.tracks.find(t => t.id === trackId);
  if (!track) return res.status(404).json({ error: 'Track not found' });
  const d = Number(day);
  const quiz = { id: 'q_' + Date.now(), question, options: options || [], answer: answer ?? null, day: Number.isFinite(d) && d > 0 ? d : undefined };
  track.quizzes.push(quiz);
  saveData(db);
  res.status(201).json(quiz);
});

// Update quiz
app.patch('/api/quiz/:id', adminRequired, (req, res) => {
  const { id } = req.params;
  const { question, options, answer, day } = req.body || {};
  const db = loadData();
  let found = null;
  for (const t of db.tracks) {
    const idx = t.quizzes.findIndex(q => q.id === id);
    if (idx !== -1) {
      const current = t.quizzes[idx];
      const d = Number(day);
      const updated = {
        ...current,
        ...(question !== undefined ? { question } : {}),
        ...(options !== undefined ? { options } : {}),
        ...(answer !== undefined ? { answer } : {}),
        ...(day !== undefined ? { day: (Number.isFinite(d) && d > 0) ? d : undefined } : {}),
      };
      t.quizzes[idx] = updated;
      found = updated;
      break;
    }
  }
  if (!found) return res.status(404).json({ error: 'Quiz not found' });
  saveData(db);
  res.json(found);
});

// Delete quiz
app.delete('/api/quiz/:id', adminRequired, (req, res) => {
  const { id } = req.params;
  const db = loadData();
  let removed = false;
  for (const t of db.tracks) {
    const before = t.quizzes.length;
    t.quizzes = t.quizzes.filter(q => q.id !== id);
    if (t.quizzes.length !== before) {
      removed = true;
      break;
    }
  }
  if (!removed) return res.status(404).json({ error: 'Quiz not found' });
  saveData(db);
  res.status(204).end();
});

// Very simple chat endpoint (placeholder for a real LLM integration)
app.post('/api/chat', (req, res) => {
  const { trackId, message } = req.body || {};
  if (!trackId || !message) return res.status(400).json({ error: 'trackId and message are required' });
  const db = loadData();
  const track = db.tracks.find(t => t.id === trackId);
  if (!track) return res.status(404).json({ error: 'Track not found' });

  // naive heuristic: find module with topic containing a keyword from message
  const lower = message.toLowerCase();
  const hit = track.modules.find(m =>
    m.topic.toLowerCase().includes('ai') && lower.includes('ai') ||
    m.topic.toLowerCase().includes('privacy') && (lower.includes('hipaa') || lower.includes('privacy') || lower.includes('gdpr')) ||
    m.topic.toLowerCase().includes('iot') && (lower.includes('device') || lower.includes('iot')) ||
    m.topic.toLowerCase().includes('trial') && (lower.includes('trial') || lower.includes('rwe'))
  );

  const reply = hit
    ? `Regarding ${hit.topic}: Key takeaways include ${hit.takeaways}. Suggested activity: ${hit.activity}.`
    : `Thanks for your question about ${track.name}. Please clarify which module you are referring to (e.g., day number or topic).`;

  res.json({ role: 'assistant', reply });
});

// Simple health check for deployment platforms
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Admin login: exchange password for signed token
app.post('/api/admin/login', (req, res) => {
  try {
    if (!ADMIN_PASSWORD) return res.status(503).json({ error: 'Admin not configured' });
    const pw = String(req.body?.password || '');
    if (pw !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Invalid password' });
    const token = signToken({ sub: 'admin' }, ADMIN_PASSWORD, 60 * 60 * 8);
    return res.json({ token, expiresIn: 60 * 60 * 8 });
  } catch (e) {
    return res.status(500).json({ error: 'Login failed' });
  }
});

function getAgentSystemPrompt(agentId, trackName) {
  switch (agentId) {
    case 'dr-nova':
      return `You are Dr. Nova, a Healthcare Technology AI advisor. Help improve clinical workflows, telehealth optimization, and predictive safety.
Constraints:
- Provide educational, non-medical-advice guidance.
- Give practical steps, checklists, and KPIs (wait times, readmission, no-show, LOS).
- Keep answers concise and action-oriented.
Track: ${trackName}`;
    case 'pharma-mind':
      return `You are PharmaMind, a Pharma R&D strategist for GenAI in discovery, digital twins, and decentralized trials.
Include: model classes (diffusion, transformers, VAEs), validation, data governance, and regulatory awareness.
Return a pilot plan with objectives, data, validation, and timeline.
Track: ${trackName}`;
    case 'site-master':
      return `You are SiteMaster, a Construction Technology AI advisor. Focus on ROI analysis, smart construction tech, and operational efficiency.
Constraints:
- Provide actionable insights on construction tech adoption, cost-benefit analysis, and implementation roadmaps.
- Include metrics like time savings, cost reduction, and productivity gains.
Track: ${trackName}`;
    case 'bim-pro':
      return `You are BIMPro, a BIM & Digital Twins advisor for construction lifecycle.
Focus on: clash detection ROI, lifecycle cost models, data standards (IFC), and twin-enabled operations.
Deliver:
- A step-by-step rollout plan (people, process, data).
- A basic cost-benefit model (assumptions, sensitivity).
- A governance checklist (naming, versions, CDE).
Track: ${trackName}`;
    case 'robo-build':
      return `You are RoboBuild, a Robotics & IoT advisor in construction.
Focus on: labor productivity, safety analytics, drone survey ROI, and sensor-driven QC.
Deliver:
- A quick-start kit (hardware, software, data flow).
- A risk register (privacy, battery life, network).
- KPIs to track (incidents, rework, MTBF, utilization).
Track: ${trackName}`;
    case 'market-mapper':
      return `You are MarketMapper, a Modular & 3D Printing advisor.
Focus on: speed-to-market, waste reduction, design standardization, and vendor selection.
Deliver:
- Candidate project criteria (size, schedule risk, jurisdiction).
- ROI levers (logistics, parallelization, material).
- A pilot playbook (procurement, QA, schedule integration).
Track: ${trackName}`;
    case 'alpha-ai':
      return `You are AlphaAI, a Finance Technology strategist. Specialize in AI-driven financial analysis, risk assessment, and digital transformation.
Constraints:
- Offer data-backed recommendations with clear ROI projections.
- Cover topics like blockchain, algorithmic trading, and regulatory compliance.
- Provide structured responses with key takeaways and action items.
Track: ${trackName}`;
    case 'token-flow':
      return `You are TokenFlow, a Tokenization & Settlement advisor.
Focus on: on-chain settlement (T+0 vs T+2), liquidity, custody, and smart contract risks.
Deliver:
- An adoption roadmap (legal, technology, operations).
- A control checklist (KYC/AML, key mgmt, segregation).
- A KPI pack (fail rates, liquidity, spread, capital efficiency).
Track: ${trackName}`;
    case 'deep-risk':
      return `You are DeepRisk, a Risk & Compliance advisor.
Focus on: model risk management, real-time surveillance, explainability, and audit readiness.
Deliver:
- A control framework mapping (e.g., SR 11-7, SOX).
- A monitoring design (alerts, thresholds, feedback loop).
- A validation plan (backtesting, stability, drift).
Track: ${trackName}`;
    case 'meditech-x':
      return `You are MediTech-X, a MedTech Devices & IoT advisor. Cover sensors, edge vs cloud, HL7/FHIR, cybersecurity.
Provide deployment patterns and a basic data pipeline sketch with risks and mitigation strategies.
Track: ${trackName}`;
    case 'growth-nudge':
      return `You are GrowthNudge, a Business Growth & Strategy advisor. Focus on market expansion, customer retention, and revenue growth.
Provide strategic recommendations with clear implementation steps and success metrics.
Track: ${trackName}`;
    default:
      return `You are a sector agent for ${trackName}. Be concise, helpful, and list concrete steps. Avoid medical advice.`;
  }
}

// LLM proxy: OpenAI Chat Completions
app.post('/api/llm/chat', async (req, res) => {
  try {
    const { agentId, trackId, messages } = req.body || {};
    if (!agentId || !Array.isArray(messages)) return res.status(400).json({ error: 'agentId and messages[] are required' });

    const provider = (process.env.LLM_PROVIDER || 'openai').toLowerCase();
    if (provider !== 'openai') return res.status(400).json({ error: 'Only OpenAI provider is supported currently' });

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_APIKEY || process.env.OPENAI_KEY;
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const temperature = Number(process.env.LLM_TEMPERATURE || '0.3');
    const max_tokens = Number(process.env.LLM_MAX_TOKENS || '600');
    if (!OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });

    let trackName = 'Track';
    try {
      const db = loadData();
      const t = db.tracks.find(t => t.id === trackId);
      if (t && t.name) trackName = t.name;
    } catch {}

    const system = getAgentSystemPrompt(agentId, trackName);
    const chatMessages = [
      { role: 'system', content: system },
      ...messages.map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: String(m.content || '') }))
    ];

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model, temperature, max_tokens, messages: chatMessages })
    });
    if (!resp.ok) {
      const t = await resp.text().catch(() => '');
      return res.status(500).json({ error: 'LLM request failed', detail: t });
    }
    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content || 'Sorry, no response.';
    return res.json({ reply });
  } catch (e) {
    console.error('LLM error:', e);
    return res.status(500).json({ error: 'LLM proxy error' });
  }
});

// Global error handler for multer's file size limit
app.use((err, req, res, next) => {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large', limitMB: 25 });
  }
  return next(err);
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
