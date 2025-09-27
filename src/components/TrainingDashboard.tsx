import { useState } from "react";
import { IndustryCard } from "./IndustryCard";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardStats } from "./DashboardStats";
import { RecentActivity } from "./RecentActivity";
import { Upload, GraduationCap, TrendingUp, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const industries = [
  {
    id: "healthcare",
    title: "Emerging Healthcare Training",
    description: "Advanced medical technologies, AI diagnostics, and patient care innovations",
    icon: Upload,
    gradient: "bg-gradient-healthcare",
    moduleCount: 12,
    completionRate: 87,
    recentDocuments: [
      { name: "AI-Powered Diagnostics.pdf", uploadedBy: "Dr. Sarah Chen", date: "2024-01-15" },
      { name: "Telehealth Best Practices.mp4", uploadedBy: "Medical Team", date: "2024-01-14" },
      { name: "Patient Data Security.pptx", uploadedBy: "IT Department", date: "2024-01-12" }
    ]
  },
  {
    id: "construction",
    title: "Emerging Tech in Construction",
    description: "Smart building technologies, IoT sensors, and automated construction processes",
    icon: GraduationCap,
    gradient: "bg-gradient-construction",
    moduleCount: 8,
    completionRate: 92,
    recentDocuments: [
      { name: "Smart Building Systems.pdf", uploadedBy: "Engineering Team", date: "2024-01-16" },
      { name: "Drone Inspection Protocols.mp4", uploadedBy: "Safety Officer", date: "2024-01-13" },
      { name: "IoT Installation Guide.pdf", uploadedBy: "Tech Team", date: "2024-01-11" }
    ]
  },
  {
    id: "finance",
    title: "Emerging Tech in Finance",
    description: "Blockchain, cryptocurrency, AI trading algorithms, and digital banking innovations",
    icon: TrendingUp,
    gradient: "bg-gradient-finance",
    moduleCount: 15,
    completionRate: 78,
    recentDocuments: [
      { name: "Blockchain Fundamentals.pdf", uploadedBy: "Crypto Team", date: "2024-01-17" },
      { name: "AI Trading Strategies.pptx", uploadedBy: "Quant Analysts", date: "2024-01-15" },
      { name: "Digital Banking Security.mp4", uploadedBy: "Security Team", date: "2024-01-10" }
    ]
  },
  {
    id: "realestate",
    title: "Real Estate & PropTech Training",
    description: "Virtual tours, property management software, and smart home technologies",
    icon: Users,
    gradient: "bg-gradient-realestate",
    moduleCount: 10,
    completionRate: 85,
    recentDocuments: [
      { name: "Virtual Reality Tours.pdf", uploadedBy: "PropTech Team", date: "2024-01-18" },
      { name: "Smart Home Integration.mp4", uploadedBy: "Tech Support", date: "2024-01-16" },
      { name: "Property Management SaaS.pptx", uploadedBy: "Product Team", date: "2024-01-14" }
    ]
  }
];

export function TrainingDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredIndustries = industries.filter(industry =>
    industry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    industry.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery}
      />
      
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Dashboard Stats Overview */}
        <DashboardStats industries={industries} />
        
        {/* Main Industry Cards Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-foreground">Training Modules</h2>
            <div className="text-sm text-muted-foreground">
              {filteredIndustries.length} of {industries.length} industries
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
            {filteredIndustries.map((industry) => (
              <IndustryCard
                key={industry.id}
                industry={industry}
                onViewDetails={() => navigate(`/track/${industry.id}`)}
              />
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <RecentActivity industries={industries} />
      </main>
    </div>
  );
}