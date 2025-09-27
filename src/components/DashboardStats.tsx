import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Award,
  Clock,
  Target
} from "lucide-react";

interface Industry {
  moduleCount: number;
  completionRate: number;
  recentDocuments: any[];
}

interface DashboardStatsProps {
  industries: Industry[];
}

export function DashboardStats({ industries }: DashboardStatsProps) {
  const totalModules = industries.reduce((sum, industry) => sum + industry.moduleCount, 0);
  const averageCompletion = Math.round(
    industries.reduce((sum, industry) => sum + industry.completionRate, 0) / industries.length
  );
  const totalDocuments = industries.reduce((sum, industry) => sum + industry.recentDocuments.length, 0);
  const activeUsers = 247; // Mock data

  const stats = [
    {
      title: "Total Modules",
      value: totalModules,
      icon: BookOpen,
      gradient: "bg-gradient-primary",
      change: "+12%",
      changeType: "positive" as const
    },
    {
      title: "Active Users",
      value: activeUsers,
      icon: Users,
      gradient: "bg-gradient-secondary",
      change: "+18%",
      changeType: "positive" as const
    },
    {
      title: "Avg. Completion",
      value: `${averageCompletion}%`,
      icon: Target,
      gradient: "bg-gradient-accent",
      change: "+5%",
      changeType: "positive" as const
    },
    {
      title: "Documents",
      value: totalDocuments,
      icon: Award,
      gradient: "bg-gradient-healthcare",
      change: "+23%",
      changeType: "positive" as const
    }
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Dashboard Overview</h2>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Last updated: 2 minutes ago</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-card/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <div className={`p-3 rounded-xl ${stat.gradient} shadow-lg w-fit`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-card-foreground">
                        {stat.value}
                      </h3>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-success' : 'text-destructive'
                    }`}>
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      {stat.change}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">vs last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Overall Progress */}
      <Card className="bg-card/60 backdrop-blur-sm border-0">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-card-foreground">Overall Training Progress</h3>
              <span className="text-2xl font-bold text-primary">{averageCompletion}%</span>
            </div>
            <Progress value={averageCompletion} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Total completion across all modules</span>
              <span>{Math.round((averageCompletion / 100) * totalModules)} of {totalModules} modules</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}