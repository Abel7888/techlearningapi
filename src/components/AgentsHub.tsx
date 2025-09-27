import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { chatAgentLLM } from "@/lib/api";

export type AgentDef = {
  id: string;
  name: string;
  role: string;
  intro: string;
  starters: string[];
  hint?: string;
};

export default function AgentsHub({ trackId, title, agents }: { trackId: string; title: string; agents: AgentDef[] }) {
  const [active, setActive] = useState<string>(agents[0]?.id || "");
  const [histories, setHistories] = useState<Record<string, { role: "user"|"assistant"; text: string }[]>>({});
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const agent = useMemo(() => agents.find(a => a.id === active) || agents[0], [active, agents]);
  const chat = histories[active] || [];

  async function sendMessage(text: string) {
    if (!text.trim() || sending || !agent) return;
    const userMsg = text.trim();
    setInput("");
    setSending(true);
    setHistories(prev => ({ ...prev, [active]: [...(prev[active]||[]), { role: "user", text: userMsg }] }));
    try {
      const prior = (histories[active] || []).map(m => ({ role: m.role, content: m.text }));
      const res = await chatAgentLLM({ agentId: agent.id, trackId, messages: [...prior, { role: 'user', content: userMsg }] });
      setHistories(prev => ({ ...prev, [active]: [...(prev[active]||[]), { role: "assistant", text: res.reply }] }));
    } catch (e: any) {
      setHistories(prev => ({ ...prev, [active]: [...(prev[active]||[]), { role: "assistant", text: "Sorry, the agent failed to reply." }] }));
    } finally {
      setSending(false);
    }
  }

  if (!agent) {
    return <div className="p-6 text-muted-foreground">No agents configured for {title}.</div>;
  }

  return (
    <div className="w-full flex flex-col md:flex-row">
      {/* Sidebar / Top bar for agents */}
      <div className="md:w-1/4 w-full md:border-r border-b bg-card">
        <div className="p-4 font-semibold">{title} Agents Hub</div>
        <div className="grid grid-cols-2 md:grid-cols-1 gap-3 p-4">
          {agents.map(a => (
            <Card key={a.id} className={`cursor-pointer transition border-2 ${active === a.id ? 'border-primary' : 'border-transparent hover:border-primary/30'}`} onClick={() => setActive(a.id)}>
              <CardContent className="p-3">
                <div className="font-medium">{a.name}</div>
                <div className="text-xs text-muted-foreground">{a.role}</div>
                {a.hint ? <div className="mt-2"><Badge variant="secondary">{a.hint}</Badge></div> : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Chat panel */}
      <div className="md:w-3/4 w-full p-4 flex flex-col" style={{minWidth: 320}}>
        <div className="space-y-1">
          <div className="text-xl font-semibold">{agent.name}</div>
          <div className="text-sm text-muted-foreground">{agent.role}</div>
          <div className="text-sm">{agent.intro}</div>
        </div>

        {/* Starter questions */}
        <div className="mt-3 flex flex-wrap gap-2">
          {agent.starters.map((q, idx) => (
            <Button key={idx} variant="outline" size="sm" onClick={() => sendMessage(q)} disabled={sending}>{q}</Button>
          ))}
        </div>

        {/* Chat window */}
        <div className="mt-4 flex-1 min-h-[50vh] max-h-[70vh] overflow-y-auto rounded border bg-muted/20 p-3 space-y-2">
          {chat.length === 0 ? (
            <div className="text-muted-foreground text-sm">Ask a question or click a starter above to begin.</div>
          ) : (
            chat.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
                <div className={`inline-block max-w-[85%] px-3 py-2 rounded-lg ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                  {m.text}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input bar */}
        <div className="mt-3 flex gap-2 items-start">
          <Textarea placeholder={`Message ${agent.name}...`} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }} className="resize-none h-16" />
          <Button onClick={() => sendMessage(input)} disabled={sending || !input.trim()}>Send</Button>
        </div>
      </div>
    </div>
  );
}
