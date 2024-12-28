import { GitProfile } from "../types/profile";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Trash2, Check, Edit2, Download, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ProfileCardProps {
  profile: GitProfile;
  onActivate: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (profile: GitProfile) => void;
}

export const ProfileCard = ({ profile, onActivate, onDelete, onEdit }: ProfileCardProps) => {
  const handleExport = () => {
    const blob = new Blob([profile.configText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gitconfig-${profile.name.toLowerCase().replace(/\s+/g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile.imageUrl || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"} />
            <AvatarFallback>{profile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl font-bold">{profile.name}</CardTitle>
            {profile.description && (
              <p className="text-sm text-muted-foreground">{profile.description}</p>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          {profile.isActive && (
            <Badge variant="default" className="bg-github-green">
              Active
            </Badge>
          )}
          {profile.lastUsed && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="w-3 h-3 mr-1" />
              {formatDistanceToNow(new Date(profile.lastUsed), { addSuffix: true })}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Email: {profile.email}</p>
          {profile.sshKeyPath && (
            <p className="text-sm text-gray-500">SSH Key: {profile.sshKeyPath}</p>
          )}
          <div className="mt-4">
            <Textarea
              value={profile.configText}
              className="font-mono text-sm h-32 bg-gray-50"
              readOnly
            />
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            {!profile.isActive && (
              <Button
                onClick={() => onActivate(profile.id)}
                variant="outline"
                className="flex items-center"
              >
                <Check className="w-4 h-4 mr-2" />
                Set Active
              </Button>
            )}
            <Button
              onClick={() => onEdit(profile)}
              variant="outline"
              className="flex items-center"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              onClick={handleExport}
              variant="outline"
              className="flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={() => onDelete(profile.id)}
              variant="destructive"
              className="flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};