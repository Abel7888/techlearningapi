import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

import { 
  GraduationCap, 
  Heart, 
  HardHat, 
  TrendingUp, 
  Home,
  ChevronRight,
  Trophy,
  Clock,
  Users,
  BookOpen,
  Play,
  Settings
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const sectors = [
  {
    id: "healthcare",
    title: "Healthcare Training",
    description: "Advanced medical technologies, AI diagnostics, and patient care innovations",
    icon: Heart,
    gradient: "bg-gradient-healthcare",
    moduleCount: 12,
    avgDuration: "4 hours"
  },
  {
    id: "construction",
    title: "Construction Tech",
    description: "Smart building technologies, IoT sensors, and automated construction processes",
    icon: HardHat,
    gradient: "bg-gradient-construction",
    moduleCount: 8,
    avgDuration: "3 hours"
  },
  {
    id: "finance",
    title: "Finance Technology",
    description: "Blockchain, cryptocurrency, AI trading algorithms, and digital banking",
    icon: TrendingUp,
    gradient: "bg-gradient-finance",
    moduleCount: 15,
    avgDuration: "5 hours"
  },
  {
    id: "realestate",
    title: "PropTech Training",
    description: "Virtual tours, property management software, and smart home technologies",
    icon: Home,
    gradient: "bg-gradient-realestate",
    moduleCount: 10,
    avgDuration: "3.5 hours"
  }
];

const featuredModules = [
  { id: 1, title: "AI-Powered Medical Diagnostics", sector: "Healthcare", duration: "45 min", difficulty: "Advanced", thumbnail: "🏥", enrolled: 1243 },
  { id: 2, title: "Smart Building IoT Systems", sector: "Construction", duration: "35 min", difficulty: "Intermediate", thumbnail: "🏗️", enrolled: 892 },
  { id: 3, title: "Blockchain Fundamentals", sector: "Finance", duration: "60 min", difficulty: "Beginner", thumbnail: "💰", enrolled: 2156 }
];

const inProgressModules = [
  { id: 1, title: "Virtual Reality Property Tours", progress: 65, lastAccessed: "2 days ago", gradient: "bg-gradient-realestate" },
  { id: 2, title: "AI Trading Strategies", progress: 32, lastAccessed: "1 week ago", gradient: "bg-gradient-finance" }
];

export function LearnerLandingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
{{ ... }}
      </div>
    </div>
  );
}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold">
              <GraduationCap className="w-6 h-6 text-primary" />
              Learning Platform
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="outline" size="sm">My Dashboard</Button>
              </Link>
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" /> Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6 text-center">
        <div className="container mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <GraduationCap className="w-4 h-4" /> Professional Development Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Choose Your <span className="bg-gradient-primary bg-clip-text text-transparent">Learning Path</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Advance your career with industry-specific training modules designed for emerging technologies and best practices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6">
              <Play className="w-5 h-5 mr-2" /> Start Learning
            </Button>
            <Link to="/dashboard">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">View My Progress</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Sector Selection Grid */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">Explore Training Sectors</h2>
          <p className="text-lg text-muted-foreground">Select an industry to view specialized training modules</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {sectors.map((sector) => {
            const IconComponent = sector.icon;
            return (
              <Card key={sector.id} className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 hover:border-primary/20" onClick={() => navigate(`/track/${sector.id}`)}>
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 rounded-xl ${sector.gradient} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{sector.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">{sector.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {sector.moduleCount} modules</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {sector.avgDuration}</span>
                    </div>
                    <Button className="w-full group-hover:bg-primary/90" size="sm">
                      Explore Training <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Quick Resume Section */}
      {inProgressModules.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-foreground">Continue Learning</h2>
            <Button variant="outline">View All Progress</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inProgressModules.map((module) => (
              <Card key={module.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <CardDescription>Last accessed {module.lastAccessed}</CardDescription>
                    </div>
                    <Badge variant="secondary">{module.progress}%</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={module.progress} className="w-full" />
                  <Button className="w-full"><Play className="w-4 h-4 mr-2" /> Resume Training</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Featured Modules */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">Featured Modules</h2>
          <Button variant="outline">Browse All</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredModules.map((module) => (
            <Card key={module.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="text-4xl mb-3">{module.thumbnail}</div>
                <Badge variant="outline" className="w-fit mb-2">{module.sector}</Badge>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">{module.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {module.duration}</span>
                    <Badge variant="secondary">{module.difficulty}</Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" /> {module.enrolled.toLocaleString()} enrolled
                  </div>
                  <Button className="w-full">Start Module</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Achievements Preview */}
      <section className="text-center bg-gradient-primary rounded-2xl p-12 text-white">
        <Trophy className="w-16 h-16 mx-auto mb-6 opacity-90" />
        <h2 className="text-3xl font-bold mb-4">Earn Industry Certifications</h2>
        <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">Complete training modules to earn recognized certificates and advance your career</p>
        <Button variant="secondary" size="lg">View Certificates</Button>
      </section>