import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getTrack, addContent, addQuiz, chatAgent } from "@/lib/api";
import AgentsHub, { AgentDef } from "@/components/AgentsHub";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function TrackDashboard() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [track, setTrack] = useState<any>(null);
  const [filterDay, setFilterDay] = useState<string>("all");
  const [tabValue, setTabValue] = useState<string>("modules");
  const [moduleSearch, setModuleSearch] = useState<string>("");
  const [moduleSort, setModuleSort] = useState<"dayAsc"|"dayDesc">("dayAsc");

  const [chatInput, setChatInput] = useState("");
  const [chatReplies, setChatReplies] = useState<{ role: string; text: string }[]>([]);

  const title = useMemo(() => {
    if (!id) return "Track";
    switch (id) {
      case "healthcare":
        return "Healthcare Technology";
      case "construction":
        return "Construction Technology";
      case "finance":
        return "Finance Technology";
      case "realestate":
        return "PropTech";
      default:
        return id;
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getTrack(id)
      .then((t) => setTrack(t))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAsk() {
    if (!id || !chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatReplies((prev) => [...prev, { role: "user", text: userMsg }]);
    try {
      const res = await chatAgent({ trackId: id, message: userMsg });
      setChatReplies((prev) => [...prev, { role: "assistant", text: res.reply }]);
    } catch (e: any) {
      setChatReplies((prev) => [...prev, { role: "assistant", text: "Sorry, chat failed." }]);
    }
  }

  function resolveUrl(url: string): string {
    if (!url) return "";
    if (url.startsWith("/uploads/")) {
      const isProd = typeof window !== 'undefined' && !/^(localhost|127\.0\.0\.1)/.test(window.location.hostname);
      return isProd ? `https://trainignewproject.fly.dev${url}` : `http://localhost:5174${url}`;
    }
    return url;
  }

  const groupedContent = useMemo(() => {
    const groups: Record<string, any[]> = {};
    for (const c of (track?.content || [])) {
      const key = typeof c.day === 'number' ? `Day ${c.day}` : 'Unassigned';
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    }
    // Sort keys: Day 1..n then Unassigned
    const dayKeys = Object.keys(groups).filter(k => k.startsWith('Day ')).sort((a,b) => parseInt(a.slice(4)) - parseInt(b.slice(4)));
    const others = Object.keys(groups).filter(k => !k.startsWith('Day ')).sort();
    const ordered: Array<{ title: string; items: any[] }> = [];
    for (const k of dayKeys) ordered.push({ title: k, items: groups[k] });
    for (const k of others) ordered.push({ title: k, items: groups[k] });
    if (filterDay === 'all') return ordered;
    // filter by selected day key
    return ordered.filter(g => g.title === filterDay);
  }, [track, filterDay]);

  const filteredModules = useMemo(() => {
    const list: any[] = Array.isArray(track?.modules) ? [...track.modules] : [];
    const q = moduleSearch.trim().toLowerCase();
    let out = q
      ? list.filter(m =>
          String(m.topic || "").toLowerCase().includes(q) ||
          String(m.takeaways || "").toLowerCase().includes(q) ||
          String(m.activity || "").toLowerCase().includes(q)
        )
      : list;
    out.sort((a, b) => moduleSort === 'dayAsc' ? a.day - b.day : b.day - a.day);
    return out;
  }, [track, moduleSearch, moduleSort]);

  const groupedQuizzes = useMemo(() => {
    const groups: Record<string, any[]> = {};
    for (const q of (track?.quizzes || [])) {
      const d = Number((q as any).day);
      const key = Number.isFinite(d) && d > 0 ? `Day ${d}` : 'Unassigned';
      if (!groups[key]) groups[key] = [];
      groups[key].push(q);
    }
    const dayKeys = Object.keys(groups).filter(k => k.startsWith('Day ')).sort((a,b) => parseInt(a.slice(4)) - parseInt(b.slice(4)));
    const others = Object.keys(groups).filter(k => !k.startsWith('Day ')).sort();
    const ordered: Array<{ title: string; items: any[] }> = [];
    for (const k of dayKeys) ordered.push({ title: k, items: groups[k] });
    for (const k of others) ordered.push({ title: k, items: groups[k] });
    if (filterDay === 'all') return ordered;
    return ordered.filter(g => g.title === filterDay);
  }, [track, filterDay]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-destructive">{error}</div>;
  if (!track) return <div className="p-6">Track not found</div>;

  return (
    <div className="min-h-screen container mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title} Dashboard</h1>
          <p className="text-muted-foreground">Personalized learning dashboard with modules, content, quizzes and an expert chat agent.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/">Back to All Trainings</Link>
          </Button>
          <Button asChild>
            <Link to="/admin">Open Admin</Link>
          </Button>
        </div>
      </div>

      <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
        <TabsList>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="chat">Agents Hub</TabsTrigger>
        </TabsList>

        <TabsContent value="modules">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <div className="flex-1">
                  <Input placeholder="Search modules (topic, takeaways, activity)" value={moduleSearch} onChange={(e) => setModuleSearch(e.target.value)} />
                </div>
                <div className="w-44">
                  <Select value={moduleSort} onValueChange={(v) => setModuleSort(v as any)}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Sort by" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dayAsc">Sort: Day ↑</SelectItem>
                      <SelectItem value="dayDesc">Sort: Day ↓</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {filteredModules && filteredModules.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredModules.map((m: any) => {
                    const chips = String(m.takeaways || "").split(/[;,]/).map((s: string) => s.trim()).filter(Boolean).slice(0,6);
                    return (
                      <div key={m.day} className="rounded-lg border p-4 bg-card">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">Day {m.day}</div>
                          <Badge variant="secondary">{title}</Badge>
                        </div>
                        <h3 className="font-semibold text-lg mt-1">{m.topic}</h3>
                        <Separator className="my-2" />
                        <div className="space-y-2">
                          {chips.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {chips.map((c: string, i: number) => (
                                <Badge key={i} variant="outline">{c}</Badge>
                              ))}
                            </div>
                          ) : null}
                          <div className="text-sm">
                            <span className="font-medium">Activity/Case:</span> {m.activity}
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setFilterDay(`Day ${m.day}`); setTabValue('content'); }}>View Day {m.day} Content</Button>
                          <Button size="sm" onClick={() => setTabValue('chat')}>Ask Agents</Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-muted-foreground">No modules yet.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Filter by day</div>
                <div className="w-40">
                  <Select value={filterDay} onValueChange={setFilterDay}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All days</SelectItem>
                      {Array.from(new Set((track.content || []).filter((c: any) => typeof c.day === 'number').map((c: any) => `Day ${c.day}`)))
                        .sort((a: string, b: string) => parseInt(a.slice(4)) - parseInt(b.slice(4)))
                        .map((k: string) => (
                          <SelectItem key={k} value={k}>{k}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {groupedContent.length ? (
                groupedContent.map(group => (
                  <div key={group.title} className="space-y-2">
                    <div className="text-lg font-semibold">{group.title}</div>
                    <div className="space-y-2">
                      {group.items.map((c: any) => (
                        <div key={c.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <div className="font-medium">{c.title}</div>
                            {c.description ? (
                              <div className="text-sm text-muted-foreground">{c.description}</div>
                            ) : null}
                            {c.url ? (
                              <a className="text-sm text-primary underline" href={resolveUrl(c.url)} target="_blank" rel="noreferrer">
                                Open resource
                              </a>
                            ) : null}
                          </div>
                          <Badge>{c.type}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground">No content yet. Ask your admin to add content in the Admin page.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Filter by day</div>
                <div className="w-40">
                  <Select value={filterDay} onValueChange={setFilterDay}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All days</SelectItem>
                      {Array.from(new Set((track.quizzes || [])
                        .map((q: any) => Number(q.day))
                        .filter((n: number) => Number.isFinite(n) && n > 0)
                        .map((n: number) => `Day ${n}`)))
                        .sort((a: string, b: string) => parseInt(a.slice(4)) - parseInt(b.slice(4)))
                        .map((k: string) => (
                          <SelectItem key={k} value={k}>{k}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {groupedQuizzes.length ? (
                groupedQuizzes.map(group => (
                  <div key={group.title} className="space-y-2">
                    <div className="text-lg font-semibold">{group.title}</div>
                    <div className="space-y-2">
                      {group.items.map((q: any) => (
                        <div key={q.id} className="rounded-lg border p-3">
                          <div className="font-medium">{q.question}</div>
                          {q.options && q.options.length ? (
                            <ul className="ml-6 mt-2 text-sm space-y-1">
                              {q.options.map((o: string, i: number) => {
                                const label = String.fromCharCode('A'.charCodeAt(0) + i);
                                return (
                                  <li key={i} className="flex gap-2">
                                    <span className="font-medium w-5">{label}.</span>
                                    <span>{o}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground">No quizzes yet.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat">
          <AgentsHub trackId={id || 'healthcare'} title={title} agents={getAgentsForTrack(id || 'healthcare')} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getAgentsForTrack(trackId: string): AgentDef[] {
  switch (trackId) {
    case 'healthcare':
      return [
        { id: 'dr-nova', name: 'Dr. Nova', role: 'Hospitals & Clinics AI Agent', intro: 'AI CDS, predictive analytics, and telehealth optimization.', starters: [
          'Give me a 2025 trend forecast in hospital AI.',
          'Outline a telehealth optimization guide.',
          'Share a predictive patient safety case study.',
          'What startups should hospital CIOs watch?',
          'How can small clinics adopt AI on a budget?'
        ], hint: 'workflows, telehealth, safety' },
        { id: 'pharma-mind', name: 'PharmaMind', role: 'Pharmaceutical AI Agent', intro: 'GenAI for discovery, digital twins, and clinical trials.', starters: [
          'What is the outlook for AI in drug discovery?',
          'Guide to AI-driven lead optimization.',
          'Share a decentralized trials case study.',
          'Top pharma AI startups right now?',
          'How to pilot GenAI safely in R&D?'
        ], hint: 'discovery, twins, trials' },
        { id: 'meditech-x', name: 'MediTech-X', role: 'MedTech Devices AI Agent', intro: 'Diagnostics, wearables, biosensors, real-time analytics.', starters: [
          '2025 trends in AI diagnostics?',
          'Onboarding plan for AI imaging.',
          'Biosensor analytics case in cardiology.',
          'Leading AI imaging device startups?',
          'Deploy wearable analytics on a budget.'
        ], hint: 'diagnostics, wearables' },
        { id: 'health-chain', name: 'HealthChain', role: 'Cross-Sector AI Agent', intro: 'Blockchain security, Edge AI, and interoperability.', starters: [
          '2025 forecast for blockchain in healthcare.',
          'Design a secure data pipeline for telehealth.',
          'Edge AI case in remote monitoring.',
          'Startups to watch in data security.',
          'How to build interoperable APIs?'
        ], hint: 'blockchain, edge, APIs' },
      ];
    case 'construction':
      return [
        { id: 'site-master', name: 'SiteMaster', role: 'Construction Ops AI Agent', intro: 'Scheduling, cost control, and site productivity with AI.', starters: [
          '2025 AI trends in construction ops?',
          'How to cut rework using AI?',
          'Case study: schedule compression with ALICE.',
          'Starter stack for small GC teams?',
          'ROI model for drone surveys?'
        ], hint: 'schedules, cost, drones' },
        { id: 'bim-pro', name: 'BIMPro', role: 'BIM & Digital Twins Agent', intro: 'Design-build-operate ROI with BIM and digital twins.', starters: [
          'Clash detection ROI calculator?',
          'Lifecycle cost model example.',
          'Digital twin use cases in operations.',
          'Best practices to roll out BIM.',
          'Data needed for a twin pilot?'
        ], hint: 'BIM, twins, lifecycle' },
        { id: 'robo-build', name: 'RoboBuild', role: 'Robotics & IoT Agent', intro: 'Labor productivity, safety, and sensor-driven insights.', starters: [
          'Break-even for buying a drone?',
          'IoT sensors and insurance savings.',
          'Robot-assisted tasks ROI examples.',
          'Starter kit for safety analytics.',
          'Integrating IoT with Procore.'
        ], hint: 'robots, IoT, safety' },
        { id: 'market-mapper', name: 'MarketMapper', role: 'Modular & 3D Printing Agent', intro: 'Speed-to-market and waste reduction strategies.', starters: [
          'ROI of modular on mid-rise project?',
          'Time value of finishing 3 months early.',
          '3D printing pros/cons in 2025.',
          'Selecting candidates for modular.',
          'Vendor landscape to watch.'
        ], hint: 'modular, 3DP' },
      ];
    case 'finance':
      return [
        { id: 'alpha-ai', name: 'AlphaAI', role: 'AI & Automation Agent', intro: 'Productivity, risk scoring, and compliance automation.', starters: [
          'AI ROI calculator template?',
          'Automate 30% of compliance reporting?',
          'Real-time credit risk scoring impact.',
          'NLP for policy monitoring.',
          'Top AI platforms to pilot.'
        ], hint: 'automation, risk' },
        { id: 'token-flow', name: 'TokenFlow', role: 'Tokenization & Settlement Agent', intro: 'Capital efficiency, instant settlement, and smart contracts.', starters: [
          'Benefits of T+0 vs T+2?',
          'Liquidity gains from tokenization.',
          'Case: Onyx intraday repo.',
          'Reg readiness for tokenized assets.',
          'AUM growth via fractionalization.'
        ], hint: 'settlement, tokenization' },
        { id: 'reg-guard', name: 'RegGuard', role: 'RegTech & Fraud Agent', intro: 'Fraud loss reduction and audit-ready compliance.', starters: [
          'Quantify savings from -15% fraud?',
          'Cut compliance costs by 10%.',
          'Model governance must-haves.',
          'False positives vs LTV tradeoffs.',
          'Best-in-class AML/KYB vendors.'
        ], hint: 'fraud, AML' },
        { id: 'growth-nudge', name: 'GrowthNudge', role: 'Personalization & Growth Agent', intro: 'Client retention, AUM uplift, and API-led growth.', starters: [
          'Churn reduction ROI model.',
          'Personalization playbook for wealth.',
          'APIs for embedded finance.',
          'Monetizing anonymized data.',
          'Low-budget quick wins.'
        ], hint: 'LTV, APIs' },
      ];
    case 'realestate':
      return [
        { id: 'lease-genius', name: 'LeaseGenius', role: 'Leasing & Portfolio Agent', intro: 'Underwriting speed, leasing forecasts, and reporting.', starters: [
          'AI underwriting checklist?',
          'Improve lease renewal forecasting.',
          'Automate investor reporting with GenAI.',
          'Data maturity ladder steps.',
          '2025 CRE trends to watch.'
        ], hint: 'underwriting, leasing' },
        { id: 'twin-ops', name: 'TwinOps', role: 'Smart Buildings & Twins Agent', intro: 'Energy savings, maintenance reduction, tenant retention.', starters: [
          'Smart Building ROI calculator.',
          'Estimate 15% energy savings.',
          'Digital twin ops playbook.',
          'ESG and insurance link.',
          'Vendors to pilot.'
        ], hint: 'energy, twins' },
        { id: 'esg-guide', name: 'ESGGuide', role: 'ESG & Compliance Agent', intro: 'Disclosure rules, rent premiums, and value impact.', starters: [
          'ESG reporting tech stack.',
          'Quantify green rent premium.',
          'SEC climate rules overview.',
          'Map building ESG metrics.',
          'CapEx vs NOI canvas.'
        ], hint: 'ESG, premiums' },
        { id: 'capital-bridge', name: 'CapitalBridge', role: 'Capital & Tokenization Agent', intro: 'Fractional ownership and liquidity strategies.', starters: [
          'Tokenization business case.',
          'Global capital access gains.',
          'Secondary trading scenarios.',
          'Compliance checklist essentials.',
          'Pilot asset selection.'
        ], hint: 'liquidity, tokenization' },
      ];
    default:
      return [
        { id: 'general', name: 'General Agent', role: 'Cross-domain assistant', intro: 'Ask about this track to get started.', starters: [
          'What are key trends in this sector?',
          'Outline a beginner training plan.',
          'Share a case study.',
          'Which startups should I watch?',
          'How to start on a budget?'
        ]}
      ];
  }
}
