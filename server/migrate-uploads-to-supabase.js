// Migrate existing local uploads to Supabase Storage and rewrite URLs in data.json
// Usage:
// 1) Put credentials in server/.env, then run: node migrate-uploads-to-supabase.js
// 2) Or pass env inline: SUPABASE_URL=... SUPABASE_SERVICE_KEY=... SUPABASE_BUCKET=... SUPABASE_PUBLIC=true node migrate-uploads-to-supabase.js

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || '';
const SUPABASE_PUBLIC = (process.env.SUPABASE_PUBLIC || 'true').toLowerCase() === 'true';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SUPABASE_BUCKET) {
  console.error('Missing Supabase env. Please set SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_BUCKET');
  process.exit(1);
}

const uploadsDir = path.join(__dirname, 'uploads');
const dataPath = path.join(__dirname, 'data.json');

function readJSON(p) {
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw);
}

function saveJSON(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2));
}

async function uploadToSupabase(filename) {
  const full = path.join(uploadsDir, filename);
  const buf = fs.readFileSync(full);
  const objectKey = filename; // keep original filename for easier mapping
  const uploadUrl = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/${encodeURIComponent(SUPABASE_BUCKET)}/${encodeURIComponent(objectKey)}`;
  const putResp = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/octet-stream',
      'x-upsert': 'true'
    },
    body: buf
  });
  if (!putResp.ok) {
    const t = await putResp.text().catch(() => '');
    throw new Error(`Upload failed for ${filename}: ${t}`);
  }
  if (SUPABASE_PUBLIC) {
    return `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${encodeURIComponent(SUPABASE_BUCKET)}/${encodeURIComponent(objectKey)}`;
  }
  // sign for private bucket
  const signUrl = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/sign/${encodeURIComponent(SUPABASE_BUCKET)}/${encodeURIComponent(objectKey)}`;
  const signResp = await fetch(signUrl, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ expiresIn: 3600 * 24 * 365 }) // 1 year signed URL
  });
  if (!signResp.ok) {
    const t = await signResp.text().catch(() => '');
    throw new Error(`Sign failed for ${filename}: ${t}`);
  }
  const data = await signResp.json();
  const signedPath = data?.signedURL || data?.signedUrl || data?.signed_path || '';
  return signedPath ? `${SUPABASE_URL.replace(/\/$/, '')}${signedPath}` : '';
}

async function main() {
  if (!fs.existsSync(uploadsDir)) {
    console.log('No uploads directory found. Nothing to migrate.');
    process.exit(0);
  }
  const files = fs.readdirSync(uploadsDir).filter(f => fs.statSync(path.join(uploadsDir, f)).isFile());
  if (files.length === 0) {
    console.log('No files in uploads to migrate.');
    process.exit(0);
  }
  console.log(`Found ${files.length} files to migrate...`);

  const mapping = new Map();
  let migrated = 0;
  for (const f of files) {
    try {
      const url = await uploadToSupabase(f);
      mapping.set(f, url);
      migrated++;
      console.log(`✓ Migrated ${f}`);
    } catch (e) {
      console.error(`✗ Failed ${f}:`, e.message || e);
    }
  }

  if (!fs.existsSync(dataPath)) {
    console.log('data.json not found; migration of file references skipped.');
    process.exit(0);
  }
  const db = readJSON(dataPath);
  let rewrites = 0;
  for (const t of db.tracks || []) {
    for (const c of t.content || []) {
      if (typeof c.url === 'string' && c.url.startsWith('/uploads/')) {
        const fname = c.url.split('/').pop();
        const nu = mapping.get(fname);
        if (nu) {
          c.url = nu;
          rewrites++;
        }
      }
    }
  }
  saveJSON(dataPath, db);
  console.log(`Migration complete. Files migrated: ${migrated}. URLs rewritten in data.json: ${rewrites}.`);
}

main().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
