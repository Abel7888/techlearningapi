import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BASE_URL } from "@/lib/api";
import {
  GraduationCap,
  HeartPulse,
  HardHat,
  TrendingUp,
  Home,
  ShieldCheck,
  Sparkles,
  Brain,
  ChevronRight,
  Settings,
  BookOpen,
  Cpu,
  Zap,
  Network,
  Lock,
} from "lucide-react";

// Sectors displayed on landing
const sectors = [
  {
    id: "healthcare",
    title: "Healthcare Training",
    description: "Advanced medical technologies, AI diagnostics, and patient care innovations",
    icon: HeartPulse,
    gradient: "bg-gradient-healthcare",
    moduleCount: 12,
    avgDuration: "4 hours",
    thumb: "🏥",
  },
  {
    id: "construction",
    title: "Construction Tech",
    description: "Smart building technologies, IoT sensors, and automated construction processes",
    icon: HardHat,
    gradient: "bg-gradient-construction",
    moduleCount: 8,
    avgDuration: "3 hours",
    thumb: "🏗️",
  },
  {
    id: "finance",
    title: "Finance Technology",
    description: "Blockchain, digital assets, AI trading algorithms, and digital banking",
    icon: TrendingUp,
    gradient: "bg-gradient-finance",
    moduleCount: 15,
    avgDuration: "5 hours",
    thumb: "💰",
  },
  {
    id: "realestate",
    title: "PropTech Training",
    description: "Virtual tours, property management software, and smart home technologies",
    icon: Home,
    gradient: "bg-gradient-realestate",
    moduleCount: 10,
    avgDuration: "3.5 hours",
    thumb: "🏠",
  },
];

// Additional Training Programs
const extraTrainings = [
  {
    id: "sltm-roi",
    title: "Emerging Technologies ROI for Supply Chain, Logistics, Transportation, and Manufacturing",
    subtitle: "Goal: Build technical, strategic, ROI-driven fluency",
    description:
      "How emerging technologies reshape operations, cost efficiency, and resilience across supply chain, logistics, transportation, and manufacturing.",
    icon: BookOpen,
    gradient: "bg-gradient-to-r from-amber-500 to-orange-600",
    thumb: "📦",
  },
  {
    id: "risk-frameworks",
    title: "Risk Management & Emerging Technology Frameworks for Modern Enterprises",
    subtitle: "Goal: Master assessment, governance, and compliance",
    description:
      "Use leading frameworks and standards to assess, manage, and govern risk when adopting AI, blockchain, quantum, and automation.",
    icon: ShieldCheck,
    gradient: "bg-gradient-to-r from-slate-600 to-indigo-700",
    thumb: "🧩",
  },
];

// Emefintech: New Sectors & Research Areas
const emeSectors = [
  {
    id: "cognitive-compute",
    title: "Cognitive Compute Systems",
    subtitle: "The Next-Gen AI Hardware Stack",
    description: "Neuromorphic, photonic, in-memory, and quantum-compatible AI processors—building the hardware brain of the AI age.",
    icon: Cpu,
    gradient: "bg-gradient-to-r from-rose-500 to-orange-500",
    thumb: "🧠",
  },
  {
    id: "quantum-edge",
    title: "Quantum Edge Intelligence",
    subtitle: "AI Meets Quantum at the Periphery",
    description: "Hybrid AI–quantum optimization, quantum sensors, and quantum-secure comms for edge/5G/6G systems.",
    icon: Zap,
    gradient: "bg-gradient-to-r from-indigo-500 to-cyan-500",
    thumb: "🧪",
  },
  {
    id: "autonomous-infra",
    title: "Autonomous Infrastructure Intelligence",
    subtitle: "Self-Managing Systems",
    description: "Digital twins + RL, self-adaptive data centers, swarm edge AI, and cyber-resilient smart infrastructure.",
    icon: Network,
    gradient: "bg-gradient-to-r from-emerald-500 to-teal-500",
    thumb: "🏗️",
  },
  {
    id: "synthetic-cognition",
    title: "Synthetic Cognition & Secure Compute",
    subtitle: "Trusted Autonomy & Privacy",
    description: "Confidential AI, zero‑trust pipelines, federated & PQC learning, synthetic data, and governance chips.",
    icon: Lock,
    gradient: "bg-gradient-to-r from-fuchsia-500 to-violet-500",
    thumb: "🛡️",
  },
];

// Landing page is simplified to focus on the four primary sectors, platform features, and About Me.

export function LearnerLandingPage() {
  const navigate = useNavigate();
  const [apiOk, setApiOk] = useState<null | boolean>(null);
  useEffect(() => {
    let alive = true;
    async function check() {
      try {
        const r = await fetch(`${BASE_URL}/health`, { cache: 'no-store' });
        if (!alive) return;
        setApiOk(r.ok);
      } catch {
        if (!alive) return;
        setApiOk(false);
      }
    }
    check();
    const t = setInterval(check, 15000);
    return () => { alive = false; clearInterval(t); };
  }, []);
  return (
    <div className="min-h-screen">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold">
              <GraduationCap className="w-6 h-6 text-primary" />
              Emerging Tech Learning Platform
            </Link>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-xs px-2 py-1 rounded-full border">
                <span className={`inline-block w-2 h-2 rounded-full ${apiOk === null ? 'bg-yellow-500' : apiOk ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                <span className="text-muted-foreground">API {apiOk === null ? 'Checking…' : apiOk ? 'Online' : 'Offline'}</span>
              </div>
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" /> Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="relative py-20 px-6 text-center overflow-hidden">
        {/* decorative background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full blur-3xl opacity-25 bg-gradient-to-br from-primary/40 to-purple-500/40" />
          <div className="absolute -bottom-40 -right-40 w-[520px] h-[520px] rounded-full blur-3xl opacity-25 bg-gradient-to-br from-blue-400/40 to-emerald-400/40" />
        </div>
        <div className="container mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <GraduationCap className="w-4 h-4" /> Welcome
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
            Welcome to the <span className="text-black">Emerging Tech Learning Platform</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-2 max-w-3xl mx-auto leading-relaxed">
            Discover hundreds of up-to-date research-backed training modules and learning quizzes across Healthcare, Finance,
            PropTech (Real Estate), and Construction. Explore practical insights, frameworks, and case studies designed to help you
            understand and apply the latest innovations.
          </p>
        </div>
      </section>

      {/* Append extra trainings to the New Sectors grid to keep uniform sizing */}

      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">Explore Training Sectors</h2>
          <p className="text-lg text-muted-foreground">Select an industry to view specialized training modules</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {sectors.map((sector) => {
            const IconComponent = sector.icon;
            return (
              <Link key={sector.id} to={`/track/${sector.id}`} className="block">
                <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 hover:border-primary/20 overflow-hidden">
                  <div className={`h-24 ${sector.gradient} flex items-center justify-between px-6`}>
                    <div className="text-5xl" aria-hidden>{sector.thumb}</div>
                    <div className="opacity-40">
                      <IconComponent className="w-16 h-16 text-white" />
                    </div>
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl flex items-center gap-2">{sector.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">{sector.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Training modules, quizzes, reports, and more</div>
                      <div className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Latest trends & insights</div>
                      <div className="flex items-center gap-2"><Brain className="w-4 h-4" /> Hands-on AI agent demos</div>
                      <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Practical, ROI-focused guidance</div>
                    </div>
                    <div className="mt-4">
                      <Button className="w-full group-hover:bg-primary/90" size="sm">
                        Explore Training <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* New Sectors & Research Areas */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-foreground mb-2">New Sectors & Research Areas</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[...emeSectors, ...extraTrainings].map((s) => {
            const IconComponent = s.icon;
            return (
              <Link key={s.id} to={`/track/${s.id}`} className="block">
                <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 hover:border-primary/20 overflow-hidden">
                  <div className={`h-24 ${s.gradient} flex items-center justify-between px-6`}>
                    <div className="text-5xl" aria-hidden>{s.thumb}</div>
                    <div className="opacity-40">
                      <IconComponent className="w-16 h-16 text-white" />
                    </div>
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl flex items-center gap-2">{s.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">{s.subtitle}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">{s.description}</p>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Training modules, quizzes, reports, and more</div>
                      <div className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Latest trends & insights</div>
                      <div className="flex items-center gap-2"><Brain className="w-4 h-4" /> Hands-on AI agent demos</div>
                      <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Practical, ROI-focused guidance</div>
                    </div>
                    <div className="mt-4">
                      <Button className="w-full group-hover:bg-primary/90" size="sm">
                        Explore Training <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Platform Features */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">What You'll Get</h2>
          <p className="text-lg text-muted-foreground">Stay ahead with practical, research-backed training and AI agents across industries</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-primary" />
                <CardTitle>Emerging Tech Training</CardTitle>
              </div>
              <CardDescription>Healthcare, Finance, Construction, and PropTech—updated with the latest trends and insights.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Brain className="w-6 h-6 text-primary" />
                <CardTitle>Interactive AI Agents</CardTitle>
              </div>
              <CardDescription>Role-specialized agents that answer questions, suggest roadmaps, and help you plan pilots.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-primary" />
                <CardTitle>Real-World ROI Focus</CardTitle>
              </div>
              <CardDescription>Actionable guidance with checklists, KPIs, and deployment patterns you can use right away.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* About Me */}
      <section className="mt-12 rounded-2xl border bg-card p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center">
            {/* Place your photo at public/profile.jpg */}
            <img src="/profile.jpg" alt="Abel Assefa" className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
            <span className="text-xl font-semibold">AA</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">About Abel Assefa</h3>
            <p className="text-muted-foreground">I originally built this platform as a personal project—something to keep me grounded and continually learning in the fast-changing world of emerging technologies. Over time, I realized that what helped me stay informed could be just as valuable for others. 
Here, you’ll find practical training modules, curated research, and straightforward tools to explore innovation across healthcare, finance, real estate (PropTech), and construction. My hope is that it becomes a resource for anyone who wants to stay ahead of the curve while keeping things approachable and actionable.</p>
            <div className="pt-2">
              <a href="https://buymeacoffee.com/datashieldhealthcare" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Buy me a coffee ☕</a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
