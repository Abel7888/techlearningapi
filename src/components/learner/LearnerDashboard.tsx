import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen,
  Trophy,
  Clock,
  Download,
  Play,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Award,
  Share2
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const progressData = [
  { name: 'Completed', value: 45, color: '#10b981' },
  { name: 'In Progress', value: 25, color: '#3b82f6' },
  { name: 'Not Started', value: 30, color: '#e5e7eb' }
];

const categoryProgress = [
  { category: 'Healthcare', completed: 8, total: 12, percentage: 67 },
  { category: 'Construction', completed: 6, total: 8, percentage: 75 },
  { category: 'Finance', completed: 12, total: 15, percentage: 80 },
  { category: 'Real Estate', completed: 5, total: 10, percentage: 50 }
];

const myModules = [
  {
    id: 1,
    title: "AI-Powered Medical Diagnostics",
    category: "Healthcare",
    status: "completed",
    progress: 100,
    lastOpened: "2024-01-20",
    duration: "45 min",
    certificateEarned: true
  },
  {
    id: 2,
    title: "Smart Building IoT Systems", 
    category: "Construction",
    status: "in-progress",
    progress: 65,
    lastOpened: "2024-01-18",
    duration: "35 min",
    certificateEarned: false
  },
  {
    id: 3,
    title: "Blockchain Fundamentals",
    category: "Finance", 
    status: "in-progress",
    progress: 32,
    lastOpened: "2024-01-15",
    duration: "60 min",
    certificateEarned: false
  },
  {
    id: 4,
    title: "Virtual Property Tours",
    category: "Real Estate",
    status: "not-started",
    progress: 0,
    lastOpened: null,
    duration: "40 min",
    certificateEarned: false
  }
];

const certificates = [
  {
    id: 1,
    title: "Advanced Healthcare AI",
    issuedDate: "2024-01-20",
    category: "Healthcare",
    credentialId: "HC-AI-2024-001"
  },
  {
    id: 2,
    title: "Financial Technology Specialist",
    issuedDate: "2024-01-10", 
    category: "Finance",
    credentialId: "FT-SPEC-2024-002"
  }
];

const notifications = [
  {
    id: 1,
    type: "new-module",
    message: "New module 'Drone Construction Monitoring' is now available",
    date: "2024-01-22",
    unread: true
  },
  {
    id: 2,
    type: "deadline", 
    message: "Quiz deadline for 'Blockchain Fundamentals' in 3 days",
    date: "2024-01-21",
    unread: true
  },
  {
    id: 3,
    type: "certificate",
    message: "Certificate earned: Advanced Healthcare AI",
    date: "2024-01-20",
    unread: false
  }
];

export function LearnerDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-warning" />;
      default:
        return <BookOpen className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Dashboard Header */}
      <div className="bg-gradient-primary text-white py-12">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold mb-4">My Learning Dashboard</h1>
          <p className="text-lg opacity-90">Track your progress and continue your professional development</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="modules">My Modules</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Progress Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Modules Completed</CardTitle>
                  <CheckCircle className="w-4 h-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">31</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Learning Hours</CardTitle>
                  <Clock className="w-4 h-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">47.5</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Certificates Earned</CardTitle>
                  <Trophy className="w-4 h-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">+2 this month</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Overall Progress</CardTitle>
                  <CardDescription>Your learning completion status</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={progressData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label={({name, value}) => `${name}: ${value}%`}
                      >
                        {progressData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Progress by Category</CardTitle>
                  <CardDescription>Completion rate across different industries</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="percentage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* My Modules Tab */}
          <TabsContent value="modules" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Learning Modules</h2>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Learning
              </Button>
            </div>

            <div className="grid gap-4">
              {myModules.map((module) => (
                <Card key={module.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(module.status)}
                          <h3 className="font-semibold text-lg">{module.title}</h3>
                          {module.certificateEarned && <Award className="w-4 h-4 text-warning" />}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <Badge variant="outline">{module.category}</Badge>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {module.duration}
                          </span>
                          {module.lastOpened && (
                            <span>Last opened: {new Date(module.lastOpened).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <Badge variant={getStatusColor(module.status) as any}>
                        {module.status.replace('-', ' ')}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <Progress value={module.progress} className="w-full" />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {module.progress}% complete
                        </span>
                        <div className="flex gap-2">
                          {module.status !== 'not-started' && (
                            <Button size="sm">
                              <Play className="w-3 h-3 mr-1" />
                              {module.status === 'completed' ? 'Review' : 'Continue'}
                            </Button>
                          )}
                          {module.status === 'not-started' && (
                            <Button size="sm">
                              <Play className="w-3 h-3 mr-1" />
                              Start Module
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Certificates</h2>
              <Button variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                View All Achievements
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert) => (
                <Card key={cert.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Trophy className="w-8 h-8 text-warning" />
                      <Badge variant="secondary">{cert.category}</Badge>
                    </div>
                    <CardTitle className="text-lg">{cert.title}</CardTitle>
                    <CardDescription>
                      Issued: {new Date(cert.issuedDate).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Credential ID: {cert.credentialId}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Share2 className="w-3 h-3 mr-1" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Notifications</h2>
              <Button variant="outline" size="sm">Mark All as Read</Button>
            </div>

            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card key={notification.id} className={notification.unread ? "border-primary/50" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${notification.unread ? 'bg-primary' : 'bg-transparent'}`} />
                      <div className="flex-1">
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.date).toLocaleDateString()}
                        </p>
                      </div>
                      {notification.type === 'deadline' && <AlertCircle className="w-4 h-4 text-warning" />}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}