import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UploadModal } from "./UploadModal";
import { 
  Upload, 
  FileText, 
  Video, 
  Presentation,
  Calendar,
  Users,
  TrendingUp,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Document {
  name: string;
  uploadedBy: string;
  date: string;
}

interface Industry {
  id: string;
  title: string;
  description: string;
  icon: any;
  gradient: string;
  moduleCount: number;
  completionRate: number;
  recentDocuments: Document[];
}

interface IndustryCardProps {
  industry: Industry;
  onViewDetails: () => void;
}

export function IndustryCard({ industry, onViewDetails }: IndustryCardProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const IconComponent = industry.icon;

  const getFileIcon = (fileName: string) => {
    if (fileName.includes('.pdf')) return FileText;
    if (fileName.includes('.mp4') || fileName.includes('.avi')) return Video;
    if (fileName.includes('.pptx') || fileName.includes('.ppt')) return Presentation;
    return FileText;
  };

  return (
    <>
      <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-4">
          {/* Header with Icon and Title */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className={cn(
                "p-4 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300",
                industry.gradient
              )}>
                <IconComponent className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                  {industry.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {industry.description}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between pt-2">
            <Badge variant="secondary" className="bg-secondary/50">
              <Users className="w-3 h-3 mr-1" />
              {industry.moduleCount} modules
            </Badge>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="font-medium">{industry.completionRate}% complete</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={industry.completionRate} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowUploadModal(true)}
              className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Materials
            </Button>
            <Button 
              variant="outline" 
              onClick={onViewDetails}
              className="hover:bg-accent hover:text-accent-foreground"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Recent Documents Preview */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-card-foreground flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Recent Documents
            </h4>
            <div className="space-y-2">
              {industry.recentDocuments.slice(0, 3).map((doc, index) => {
                const FileIcon = getFileIcon(doc.name);
                return (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <FileIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate text-card-foreground">
                          {doc.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          by {doc.uploadedBy}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground ml-2">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(doc.date).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <UploadModal 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        industryTitle={industry.title}
      />
    </>
  );
}