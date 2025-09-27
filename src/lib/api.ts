export type Track = {
  id: string;
  name: string;
  description: string;
  modules: Array<{ day: number; topic: string; takeaways: string; activity: string }>;
  content: Array<{ id: string; title: string; type: string; url: string; description: string; createdAt: string }>;
  quizzes: Array<{ id: string; question: string; options: string[]; answer: number | null }>;
};

// Use Vite env var for production, fallback to local dev API
const BASE_URL = (import.meta as any)?.env?.VITE_API_BASE_URL || 'http://localhost:5174/api';

export async function getTracks(): Promise<Omit<Track, 'quizzes'>[]> {
  const res = await fetch(`${BASE_URL}/tracks`);
  if (!res.ok) throw new Error('Failed to load tracks');
  return res.json();
}

export async function getTrack(id: string): Promise<Track> {
  const res = await fetch(`${BASE_URL}/tracks/${id}`);
  if (!res.ok) throw new Error('Track not found');
  return res.json();
}

export async function addContent(params: { trackId: string; title: string; type?: string; url?: string; description?: string; day?: number; }) {
  const res = await fetch(`${BASE_URL}/content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to add content');
  return res.json();
}

export async function addQuiz(params: { trackId: string; question: string; options?: string[]; answer?: number | null; day?: number; }) {
  const res = await fetch(`${BASE_URL}/quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to add quiz');
  return res.json();
}

export async function chatAgent(params: { trackId: string; message: string }) {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Chat failed');
  return res.json();
}

export async function chatAgentLLM(params: { agentId: string; trackId?: string; messages: Array<{ role: 'user' | 'assistant'; content: string }> }) {
  const res = await fetch(`${BASE_URL}/llm/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`LLM chat failed: ${t || res.status}`);
  }
  return res.json();
}

export async function updateQuiz(id: string, params: Partial<{ question: string; options: string[]; answer: number | null; day: number }>) {
  const res = await fetch(`${BASE_URL}/quiz/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    let msg = 'Failed to update quiz';
    try { const t = await res.text(); if (t) msg += `: ${t}`; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function deleteQuiz(id: string) {
  const res = await fetch(`${BASE_URL}/quiz/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) {
    let msg = 'Failed to delete quiz';
    try { const t = await res.text(); if (t) msg += `: ${t}`; } catch {}
    throw new Error(msg);
  }
}

export async function uploadFile(file: File): Promise<{ url: string } & Record<string, any>> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

export async function updateContent(id: string, params: Partial<{ title: string; type: string; url: string; description: string; day: number }>) {
  const res = await fetch(`${BASE_URL}/content/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to update content');
  return res.json();
}

export async function deleteContent(id: string) {
  const res = await fetch(`${BASE_URL}/content/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok && res.status !== 204) throw new Error('Failed to delete content');
}
