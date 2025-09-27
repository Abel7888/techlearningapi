import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  FileText, 
  Video, 
  Presentation, 
  Upload,
  User,
  Clock
} from "lucide-react";

interface Industry {
  id: string;
  title: string;
  recentDocuments: Array<{
    name: string;
    uploadedBy: string;
    date: string;
  }>;
}

interface RecentActivityProps {
  industries: Industry[];
}

export function RecentActivity({ industries }: RecentActivityProps) {
  // Flatten and sort all documents by date
  const allDocuments = industries.flatMap(industry => 
    industry.recentDocuments.map(doc => ({
      ...doc,
      industryTitle: industry.title,
      industryId: industry.id
    }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getFileIcon = (fileName: string) => {
    if (fileName.includes('.pdf')) return FileText;
    if (fileName.includes('.mp4') || fileName.includes('.avi')) return Video;
    if (fileName.includes('.pptx') || fileName.includes('.ppt')) return Presentation;
    return FileText;
  };

  const getIndustryColor = (industryId: string) => {
    const colors = {
      healthcare: "bg-gradient-healthcare",
      construction: "bg-gradient-construction", 
      finance: "bg-gradient-finance",
      realestate: "bg-gradient-realestate"
    };
    return colors[industryId as keyof typeof colors] || "bg-gradient-primary";
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Recent Activity</h2>
        <Badge variant="secondary" className="bg-secondary/50">
          <Clock className="w-3 h-3 mr-1" />
          Last 7 days
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Uploads */}
        <Card className="bg-card/60 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <Upload className="w-5 h-5 mr-2 text-primary" />
              Recent Uploads
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {allDocuments.slice(0, 6).map((doc, index) => {
              const FileIcon = getFileIcon(doc.name);
              return (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-lg ${getIndustryColor(doc.industryId)}`}>
                      <FileIcon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground truncate">
                      {doc.name}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{doc.industryTitle}</span>
                      <span>•</span>
                      <span>by {doc.uploadedBy}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTimeAgo(doc.date)}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card className="bg-card/60 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <User className="w-5 h-5 mr-2 text-primary" />
              Active Contributors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Dr. Sarah Chen", role: "Medical Lead", uploads: 8, avatar: "SC" },
              { name: "Engineering Team", role: "Construction", uploads: 6, avatar: "ET" },
              { name: "Crypto Team", role: "Finance", uploads: 5, avatar: "CT" },
              { name: "PropTech Team", role: "Real Estate", uploads: 4, avatar: "PT" },
              { name: "IT Department", role: "Healthcare", uploads: 3, avatar: "IT" },
              { name: "Safety Officer", role: "Construction", uploads: 2, avatar: "SO" }
            ].map((user, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-primary text-white text-xs font-medium">
                    {user.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium text-card-foreground">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user.role}
                  </p>
                </div>
                <Badge variant="secondary" className="bg-secondary/50">
                  {user.uploads} uploads
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}