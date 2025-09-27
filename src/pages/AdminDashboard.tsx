import { useEffect, useState } from "react";
import { getTracks, getTrack, addContent, addQuiz, uploadFile, updateContent, deleteContent, updateQuiz, deleteQuiz } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [tracks, setTracks] = useState<any[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string>("healthcare");
  const [currentTrack, setCurrentTrack] = useState<any | null>(null);

  // Content form state
  const [cTitle, setCTitle] = useState("");
  const [cType, setCType] = useState("doc");
  const [cUrl, setCUrl] = useState("");
  const [cDesc, setCDesc] = useState("");
  const [cDay, setCDay] = useState<string>("");
  const [cFile, setCFile] = useState<File | null>(null);

  // Quiz form state
  const [qQuestion, setQQuestion] = useState("");
  const [qOptions, setQOptions] = useState<string>("");
  const [qAnswer, setQAnswer] = useState<string>("");
  const [qDay, setQDay] = useState<string>("");
  // Bulk quiz state
  const [bulkDay, setBulkDay] = useState<string>("");
  const [bulkText, setBulkText] = useState<string>("");

  useEffect(() => {
    getTracks().then(setTracks).catch((e) => {
      toast({ title: "Failed to load tracks", description: String(e), variant: "destructive" });
    });
  }, [toast]);

  useEffect(() => {
    if (!selectedTrack) return;
    getTrack(selectedTrack).then(setCurrentTrack).catch((e) => {
      toast({ title: "Failed to load track", description: String(e), variant: "destructive" });
    });
  }, [selectedTrack, toast]);

  async function handleAddContent() {
    try {
      let finalUrl = cUrl;
      let finalType = cType;
      if (cFile) {
        const up = await uploadFile(cFile);
        finalUrl = up.url; // relative URL served by backend
        finalType = "pdf";
      }
      const dayNum = cDay ? parseInt(cDay, 10) : undefined;
      await addContent({ trackId: selectedTrack, title: cTitle, type: finalType, url: finalUrl, description: cDesc, day: isNaN(Number(dayNum)) ? undefined : dayNum });
      toast({ title: "Content added", description: `Added to ${selectedTrack}` });
      setCTitle(""); setCType("doc"); setCUrl(""); setCDesc(""); setCDay(""); setCFile(null);
      // refresh track content list
      getTrack(selectedTrack).then(setCurrentTrack).catch(() => {});
    } catch (e: any) {
      toast({ title: "Failed to add content", description: String(e), variant: "destructive" });
    }
  }

  async function handleAddQuiz() {
    try {
      const options = qOptions.split("\n").map(s => s.trim()).filter(Boolean);
      const answerIndex = qAnswer ? parseInt(qAnswer, 10) : undefined;
      const dayNum = qDay ? parseInt(qDay, 10) : undefined;
      await addQuiz({ trackId: selectedTrack, question: qQuestion, options, answer: isNaN(Number(answerIndex)) ? undefined : answerIndex, day: isNaN(Number(dayNum)) ? undefined : dayNum });
      toast({ title: "Quiz added", description: `Added to ${selectedTrack}` });
      setQQuestion(""); setQOptions(""); setQAnswer(""); setQDay("");
      // refresh track content/quizzes list in Manage tab
      getTrack(selectedTrack).then(setCurrentTrack).catch(() => {});
    } catch (e: any) {
      toast({ title: "Failed to add quiz", description: String(e), variant: "destructive" });
    }
  }

  function parseBulkQuizzes(text: string): Array<{ question: string; options: string[]; answer: number | null }> {
    // Normalize hidden whitespace chars that often appear from copy/paste
    const normalized = (text || '')
      .replace(/\r/g, '\n')
      .replace(/[\u00A0\u200B\u200C\u200D\uFEFF]/g, ' ');
    const lines = normalized.split(/\n/).map(l => l.trim());
    const items: Array<{ question: string; options: string[]; answer: number | null }> = [];
    let i = 0;
    while (i < lines.length) {
      if (!lines[i]) { i++; continue; }
      // Match numbered question like: "1. ...", "1) ...", "1- ...", or with optional Q prefix: "Q1:", "Q1.".
      // Fallback: any line ending with '?' is treated as a question.
      let question = '';
      const qLine = lines[i];
      const qMatch = qLine.match(/^(?:Q\s*)?\d+[\.:)\-]\s*(.+)$/i);
      if (qMatch) {
        question = qMatch[1].trim();
        i++;
      } else {
        const alt = qLine.match(/^(.+\?)\s*$/);
        if (alt) {
          question = alt[1].trim();
          i++;
        } else {
          // Heuristic: if next line looks like an option, treat this line as a question
          const next = lines[i + 1] || '';
          const looksLikeOption = /^(?:[-*]\s*)?[A-Za-z]\s*[\)\.:\-]\s+/.test(next) || /^(?:[-*]\s*)?\S+/.test(next);
          if (looksLikeOption) {
            question = qLine;
            i++;
          } else {
            i++;
            continue;
          }
        }
      }
      let answerIndex: number | null = null;
      const options: string[] = [];
      while (i < lines.length) {
        // Break if next question or Answer line encountered
        const peek = lines[i];
        if (!peek) { i++; break; }
        if (/^(?:Q\s*)?\d+[\.:)\-]\s+/.test(peek)) break; // next numbered question
        if (/^.+\?\s*$/.test(peek)) break; // next question ending with '?'
        if (/^(?:Answer|Ans|Correct|Key|Solution)\s*[:\-]/i.test(peek)) break; // answer line

        // 1) Try labeled options like: "A) ...", "A. ...", "a) ...", "A - ..." (with optional bullet "- " or "* ")
        const optMatch = lines[i]?.match(/^(?:[-*]\s*)?([A-Za-z])\s*[\)\.:\-]\s*(.+)$/);
        if (optMatch) {
          let text = optMatch[2].trim();
          if (/(✅|\(\s*correct\s*\))/i.test(text) && answerIndex === null) {
            answerIndex = options.length; // current option index
            text = text.replace(/✅/g, '').replace(/\(\s*correct\s*\)/ig, '').trim();
          }
          options.push(text);
          i++;
          continue;
        }

        // 2) Accept unlabeled/bulleted plain option lines (e.g., "- Option text" or just "Option text")
        const bulletOnly = lines[i]?.match(/^(?:[-*]\s*)?(.+)$/);
        if (bulletOnly && bulletOnly[1]) {
          let textOnly = bulletOnly[1].trim();
          // Avoid capturing lines that look like section headers with colon and no value
          if (textOnly && !/^(?:Answer|Ans|Correct|Key|Solution)\s*[:\-]/i.test(textOnly)) {
            if (/(✅|\(\s*correct\s*\))/i.test(textOnly) && answerIndex === null) {
              answerIndex = options.length;
              textOnly = textOnly.replace(/✅/g, '').replace(/\(\s*correct\s*\)/ig, '').trim();
            }
            options.push(textOnly);
            i++;
            continue;
          }
        }

        // If we get here, stop collecting options
        break;
      }
      if (i < lines.length && answerIndex === null) {
        // Accept Answer lines with letter (A-D), 1-based number (1-9), or exact text match after colon
        const ansMatch = lines[i]?.match(/^(?:Answer|Ans|Correct|Key|Solution)\s*[:\-]\s*(?:✅\s*)?(.+)$/i);
        if (ansMatch) {
          const tokenRaw = ansMatch[1].trim();
          // Case 1: numeric 1-based index
          if (/^\d+$/.test(tokenRaw)) {
            const idx = parseInt(tokenRaw, 10) - 1;
            if (idx >= 0 && idx < options.length) answerIndex = idx;
          } else if (/^[A-Da-d]$/.test(tokenRaw)) {
            // Case 2: letter
            const idx = tokenRaw.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
            if (idx >= 0 && idx < options.length) answerIndex = idx;
          } else {
            // Case 3: try to match by option text (exact, case-insensitive)
            const idx = options.findIndex(o => o.toLowerCase() === tokenRaw.toLowerCase());
            if (idx !== -1) answerIndex = idx;
          }
          i++;
        }
      }
      // Only push if we detected at least a question (always true here) and at least one option
      if (options.length > 0) {
        items.push({ question, options, answer: answerIndex });
      }
    }
    if (items.length > 0) return items;

    // Fallback: block-based parse (split on blank lines). First line is question (must end with '?' or look like numbered), rest are options until an Answer line.
    const blocks = normalized.split(/\n\s*\n/).map(b => b.split(/\n/).map(s => s.trim()).filter(Boolean)).filter(b => b.length > 0);
    const out: Array<{ question: string; options: string[]; answer: number | null }> = [];
    for (const b of blocks) {
      if (b.length < 2) continue;
      const qLine = b[0];
      // Accept question if ends with '?' or starts with number/"Q"
      if (!/(\?|^(?:Q\s*)?\d+[\.:)\-]\s+)/i.test(qLine)) continue;
      const question = qLine.replace(/^(?:Q\s*)?\d+[\.:)\-]\s*/i, '').trim();
      const opts: string[] = [];
      let ans: number | null = null;
      for (let k = 1; k < b.length; k++) {
        const line = b[k];
        const ansLine = line.match(/^(?:Answer|Ans|Correct|Key|Solution)\s*[:\-]\s*(?:✅\s*)?(.+)$/i);
        if (ansLine && ans === null) {
          const tokenRaw = ansLine[1].trim();
          if (/^\d+$/.test(tokenRaw)) { const idx = parseInt(tokenRaw, 10) - 1; if (idx >= 0) ans = idx; }
          else if (/^[A-Da-d]$/.test(tokenRaw)) { ans = tokenRaw.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0); }
          else { const idx = opts.findIndex(o => o.toLowerCase() === tokenRaw.toLowerCase()); if (idx !== -1) ans = idx; }
          continue;
        }
        // Options: labeled or plain
        let m = line.match(/^(?:[-*]\s*)?([A-Za-z])\s*[\)\.:\-]\s*(.+)$/);
        let textOnly = '';
        if (m) { textOnly = m[2].trim(); }
        else { textOnly = line; }
        if (/^(?:Answer|Ans|Correct|Key|Solution)\s*[:\-]/i.test(textOnly)) continue;
        if (!textOnly) continue;
        if (/(✅|\(\s*correct\s*\))/i.test(textOnly) && ans === null) { ans = opts.length; textOnly = textOnly.replace(/✅/g, '').replace(/\(\s*correct\s*\)/ig, '').trim(); }
        opts.push(textOnly);
      }
      if (opts.length) out.push({ question, options: opts, answer: ans });
    }
    return out;
  }

  async function handleBulkAddQuizzes() {
    try {
      const items = parseBulkQuizzes(bulkText);
      // eslint-disable-next-line no-console
      console.debug('Bulk parsed items', items);
      if (!items.length) {
        toast({ title: "No quizzes detected", description: "Please check the paste format.", variant: "destructive" });
        return;
      }
      const dayNum = bulkDay ? parseInt(bulkDay, 10) : undefined;
      for (const it of items) {
        await addQuiz({ trackId: selectedTrack, question: it.question, options: it.options, answer: it.answer, day: isNaN(Number(dayNum)) ? undefined : dayNum });
      }
      toast({ title: `Added ${items.length} quizzes`, description: `Day: ${dayNum ?? 'Unassigned'}` });
      setBulkText(""); setBulkDay("");
      getTrack(selectedTrack).then(setCurrentTrack).catch(() => {});
    } catch (e: any) {
      toast({ title: "Bulk add failed", description: String(e), variant: "destructive" });
    }
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground">Add training content and quizzes to learner dashboards.</p>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Select Track</label>
              <Select value={selectedTrack} onValueChange={setSelectedTrack}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Track" /></SelectTrigger>
                <SelectContent>
                  {tracks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="content">
            <TabsList>
              <TabsTrigger value="content">Add Content</TabsTrigger>
              <TabsTrigger value="quiz">Add Quiz</TabsTrigger>
              <TabsTrigger value="manage">Manage Content</TabsTrigger>
              <TabsTrigger value="manage-quizzes">Manage Quizzes</TabsTrigger>
            </TabsList>

            <TabsContent value="content">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input className="mt-1" value={cTitle} onChange={(e) => setCTitle(e.target.value)} placeholder="e.g., Telehealth Best Practices" />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Input className="mt-1" value={cType} onChange={(e) => setCType(e.target.value)} placeholder="doc | video | slide | link" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Day (optional)</label>
                  <Input className="mt-1" type="number" min={1} value={cDay} onChange={(e) => setCDay(e.target.value)} placeholder="e.g., 1" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">URL (optional)</label>
                  <Input className="mt-1" value={cUrl} onChange={(e) => setCUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Upload PDF (optional)</label>
                  <Input className="mt-1" type="file" accept="application/pdf" onChange={(e) => setCFile(e.target.files?.[0] || null)} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Description (optional)</label>
                  <Textarea className="mt-1" value={cDesc} onChange={(e) => setCDesc(e.target.value)} placeholder="Short description" />
                </div>
              </div>
              <div className="pt-4">
                <Button onClick={handleAddContent}>Add Content</Button>
              </div>
            </TabsContent>

            <TabsContent value="quiz">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Question</label>
                  <Input className="mt-1" value={qQuestion} onChange={(e) => setQQuestion(e.target.value)} placeholder="e.g., What is HIPAA?" />
                </div>
                <div>
                  <label className="text-sm font-medium">Day (optional)</label>
                  <Input className="mt-1" type="number" min={1} value={qDay} onChange={(e) => setQDay(e.target.value)} placeholder="e.g., 1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Options (one per line)</label>
                  <Textarea className="mt-1" value={qOptions} onChange={(e) => setQOptions(e.target.value)} placeholder={"Option A\nOption B\nOption C"} />
                </div>
                <div>
                  <label className="text-sm font-medium">Answer index (0-based)</label>
                  <Input className="mt-1" value={qAnswer} onChange={(e) => setQAnswer(e.target.value)} placeholder="e.g., 1" />
                </div>
              </div>
              <div className="pt-4">
                <Button onClick={handleAddQuiz}>Add Quiz</Button>
              </div>
              <div className="mt-8 border-t pt-6 space-y-3">
                <div className="text-lg font-semibold">Bulk Add Quizzes</div>
                <div className="text-sm text-muted-foreground">Paste multiple quizzes (numbered question, options A)/B)/C)/D), and an Answer: line). Optionally assign a Day to all.</div>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="md:col-span-1">
                    <label className="text-sm font-medium">Day for all (optional)</label>
                    <Input className="mt-1" type="number" min={1} value={bulkDay} onChange={(e) => setBulkDay(e.target.value)} placeholder="e.g., 1" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-sm font-medium">Quizzes</label>
                    <Textarea className="mt-1 h-64" value={bulkText} onChange={(e) => setBulkText(e.target.value)} placeholder={"1. What percentage of U.S. health systems were reported to use AI in clinical care as of 2024?\nA) 56%\nB) 72%\nC) 86%\nD) 94%\nAnswer: C\n\n2. Which of the following is a key advantage of edge computing in healthcare?\nA) ...\nB) ...\nC) ...\nD) ...\nAnswer: C"} />
                  </div>
                </div>
                <div className="pt-2">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleBulkAddQuizzes}>Bulk Add</Button>
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => {
                        try {
                          const items = parseBulkQuizzes(bulkText);
                          if (!items.length) {
                            toast({ title: "No quizzes detected", description: "Try adding explicit 'Answer: B' lines and ensure a blank line between questions.", variant: "destructive" });
                          } else {
                            toast({ title: `Detected ${items.length} quizzes`, description: `First question: ${items[0].question.slice(0, 80)}...` });
                            // eslint-disable-next-line no-console
                            console.debug('Bulk parse preview', items);
                          }
                        } catch (e: any) {
                          toast({ title: "Parse error", description: String(e), variant: "destructive" });
                        }
                      }}
                    >Preview Parse</Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="manage">
              <div className="space-y-3">
                {!currentTrack || !currentTrack.content || currentTrack.content.length === 0 ? (
                  <div className="text-muted-foreground">No content yet for this track.</div>
                ) : (
                  currentTrack.content.map((c: any) => (
                    <ManageRow key={c.id} item={c} onChanged={async () => {
                      const t = await getTrack(selectedTrack);
                      setCurrentTrack(t);
                    }} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="manage-quizzes">
              <div className="space-y-3">
                {!currentTrack || !currentTrack.quizzes || currentTrack.quizzes.length === 0 ? (
                  <div className="text-muted-foreground">No quizzes yet for this track.</div>
                ) : (
                  currentTrack.quizzes.map((q: any) => (
                    <ManageQuizRow key={q.id} item={q} onChanged={async () => {
                      const t = await getTrack(selectedTrack);
                      setCurrentTrack(t);
                    }} />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function ManageRow({ item, onChanged }: { item: any; onChanged: () => void }) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title || "");
  const [day, setDay] = useState<string>(typeof item.day === 'number' ? String(item.day) : "");
  const [description, setDescription] = useState(item.description || "");
  const [url, setUrl] = useState(item.url || "");
  const [type, setType] = useState(item.type || "doc");

  async function handleSave() {
    try {
      const dayNum = day ? parseInt(day, 10) : undefined;
      await updateContent(item.id, {
        title,
        description,
        url,
        type,
        day: isNaN(Number(dayNum)) ? undefined : dayNum,
      });
      toast({ title: "Content updated" });
      setEditing(false);
      onChanged();
    } catch (e: any) {
      toast({ title: "Failed to update", description: String(e), variant: "destructive" });
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this content item?")) return;
    try {
      await deleteContent(item.id);
      toast({ title: "Content deleted" });
      onChanged();
    } catch (e: any) {
      toast({ title: "Failed to delete", description: String(e), variant: "destructive" });
    }
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <div className="font-medium">{item.title}</div>
          <div className="text-sm text-muted-foreground">{typeof item.day === 'number' ? `Day ${item.day}` : 'Unassigned'} • {item.type}</div>
          {item.url ? <a className="text-sm text-primary underline" href={item.url} target="_blank" rel="noreferrer">Open resource</a> : null}
          {item.description ? <div className="text-sm text-muted-foreground">{item.description}</div> : null}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit</Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>Delete</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-3 space-y-2">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Title</label>
          <Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Type</label>
          <Input className="mt-1" value={type} onChange={(e) => setType(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Day</label>
          <Input className="mt-1" type="number" min={1} value={day} onChange={(e) => setDay(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">URL</label>
          <Input className="mt-1" value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea className="mt-1" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave}>Save</Button>
        <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
      </div>
    </div>
  );
}

function ManageQuizRow({ item, onChanged }: { item: any; onChanged: () => void }) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [question, setQuestion] = useState(item.question || "");
  const [optionsText, setOptionsText] = useState<string>(Array.isArray(item.options) ? item.options.join("\n") : "");
  const [answer, setAnswer] = useState<string>(item.answer === 0 || item.answer ? String(item.answer) : "");
  const [day, setDay] = useState<string>(typeof item.day === 'number' ? String(item.day) : "");

  async function handleSave() {
    try {
      const opts = optionsText.split("\n").map(s => s.trim()).filter(Boolean);
      const ansIdx = answer ? parseInt(answer, 10) : undefined;
      const dayNum = day ? parseInt(day, 10) : undefined;
      await updateQuiz(item.id, {
        question,
        options: opts,
        answer: (ansIdx !== undefined && !isNaN(ansIdx)) ? ansIdx : null,
        day: (dayNum !== undefined && !isNaN(dayNum)) ? dayNum : undefined,
      });
      toast({ title: "Quiz updated" });
      setEditing(false);
      onChanged();
    } catch (e: any) {
      toast({ title: "Failed to update quiz", description: String(e), variant: "destructive" });
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this quiz?")) return;
    try {
      await deleteQuiz(item.id);
      toast({ title: "Quiz deleted" });
      onChanged();
    } catch (e: any) {
      toast({ title: "Failed to delete quiz", description: String(e), variant: "destructive" });
    }
  }

  if (!editing) {
    return (
      <div className="flex items-start justify-between rounded-lg border p-3">
        <div>
          <div className="font-medium">{item.question}</div>
          <div className="text-sm text-muted-foreground">{typeof item.day === 'number' ? `Day ${item.day}` : 'Unassigned'}</div>
          {Array.isArray(item.options) && item.options.length ? (
            <ul className="list-disc ml-6 mt-2 text-sm">
              {item.options.map((o: string, i: number) => (
                <li key={i}>{o} {item.answer === i ? <span className="text-primary">(answer)</span> : null}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit</Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>Delete</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-3 space-y-2">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="text-sm font-medium">Question</label>
          <Input className="mt-1" value={question} onChange={(e) => setQuestion(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Answer index (0-based)</label>
          <Input className="mt-1" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Day</label>
          <Input className="mt-1" type="number" min={1} value={day} onChange={(e) => setDay(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium">Options (one per line)</label>
          <Textarea className="mt-1" value={optionsText} onChange={(e) => setOptionsText(e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave}>Save</Button>
        <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
      </div>
    </div>
  );
}
