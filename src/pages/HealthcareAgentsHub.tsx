import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { chatAgent } from "@/lib/api";
import { Link } from "react-router-dom";

// Agent definitions
const agents = [
  {
    id: "dr-nova",
    name: "Dr. Nova",
    role: "Hospitals & Clinics AI Agent",
    intro: "I specialize in AI Clinical Decision Support, Predictive Analytics, and Telehealth Optimization.",
    starters: [
      "Give me a 2025 trend forecast in hospital AI.",
      "Outline a training guide for telehealth optimization.",
      "Share a case study on predictive patient safety.",
      "What startups should hospital CIOs watch?",
      "How can small clinics adopt AI on a budget?",
    ],
    hint: "Focus: hospital workflows, telehealth, predictive safety"
  },
  {
    id: "pharma-mind",
    name: "PharmaMind",
    role: "Pharmaceutical AI Agent",
    intro: "I guide teams on Generative AI for drug discovery, Digital Twins, and AI-augmented clinical trials.",
    starters: [
      "What is the 2025 outlook for AI in drug discovery?",
      "Give a step-by-step guide to AI-driven lead optimization.",
      "Share a decentralized trials case study.",
      "Which pharma AI startups are most promising?",
      "How can a small R&D team pilot GenAI safely?",
    ],
    hint: "Focus: discovery, digital twins, trials"
  },
  {
    id: "meditech-x",
    name: "MediTech-X",
    role: "MedTech Devices AI Agent",
    intro: "I cover AI diagnostics & imaging, wearables, biosensors, and real-time health data analytics.",
    starters: [
      "What are 2025 trends in AI diagnostics?",
      "Explain an onboarding plan for AI imaging.",
      "Share a case study of biosensor analytics in cardiology.",
      "What device startups are leading in AI imaging?",
      "How to deploy wearable analytics with limited budget?",
    ],
    hint: "Focus: diagnostics, wearables, data"
  },
  {
    id: "health-chain",
    name: "HealthChain",
    role: "Cross-Sector AI Agent",
    intro: "I focus on Blockchain & Data Security, Edge AI, and Interoperability for healthcare.",
    starters: [
      "Give a 2025 forecast for blockchain in healthcare.",
      "Outline a secure data pipeline for telehealth.",
      "Share a case study on edge AI in remote monitoring.",
      "Top startups in healthcare data security?",
      "How can a small team build interoperable APIs?",
    ],
    hint: "Focus: blockchain, edge AI, interoperability"
  },
] as const;

export default function HealthcareAgentsHub() {
  const [active, setActive] = useState<(typeof agents)[number]["id"]>(agents[0].id);
  const [histories, setHistories] = useState<Record<string, { role: "user"|"assistant"; text: string }[]>>({});
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const agent = useMemo(() => agents.find(a => a.id === active)!, [active]);
  const chat = histories[active] || [];

  async function sendMessage(text: string) {
    if (!text.trim() || sending) return;
    const userMsg = text.trim();
    setInput("");
    setSending(true);
    setHistories(prev => ({ ...prev, [active]: [...(prev[active]||[]), { role: "user", text: userMsg }] }));
    try {
      // Pass agent context to backend via message prefix so the simple chat endpoint can respond contextually
      const prompt = `[Agent: ${agent.name} - ${agent.role}] ${userMsg}`;
      const res = await chatAgent({ trackId: "healthcare", message: prompt });
      setHistories(prev => ({ ...prev, [active]: [...(prev[active]||[]), { role: "assistant", text: res.reply }] }));
    } catch (e: any) {
      setHistories(prev => ({ ...prev, [active]: [...(prev[active]||[]), { role: "assistant", text: "Sorry, the agent failed to reply." }] }));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Sidebar / Top bar for agents */}
      <div className="md:w-1/4 w-full border-b md:border-b-0 md:border-r bg-card">
        <div className="p-4 flex items-center justify-between">
          <div className="font-semibold">Healthcare Emerging Tech Agents Hub</div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/track/healthcare">Back</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-1 gap-3 p-4">
          {agents.map(a => (
            <Card key={a.id} className={`cursor-pointer transition border-2 ${active === a.id ? 'border-primary' : 'border-transparent hover:border-primary/30'}`} onClick={() => setActive(a.id)}>
              <CardContent className="p-3">
                <div className="font-medium">{a.name}</div>
                <div className="text-xs text-muted-foreground">{a.role}</div>
                <div className="mt-2"><Badge variant="secondary">{a.hint}</Badge></div>
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
