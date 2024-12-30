import { GitProfile } from "../types/profile";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Trash2, Check, Edit2, Download, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AlertDialogHeader, AlertDialogFooter, AlertDialogTrigger, AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "./ui/alert-dialog";

interface ProfileCardProps {
  profile: GitProfile;
  onActivate: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (profile: GitProfile) => void;
}

export const ProfileCard = ({ profile, onActivate, onDelete, onEdit }: ProfileCardProps) => {
  const handleExport = () => {
    const blob = new Blob([profile.config_text], { type: "text/plain" });
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
            <AvatarImage src={profile.image_url || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"} />
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
          {profile.is_active && (
            <Badge variant="default" className="bg-github-green">
              Active
            </Badge>
          )}
          {profile.last_used && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="w-3 h-3 mr-1" />
              {formatDistanceToNow(new Date(profile.last_used), { addSuffix: true })}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-200">Email: {profile.email}</p>
          {profile.ssh_key_path && (
            <p className="text-sm text-gray-500 dark:text-gray-200" >SSH Key: {profile.ssh_key_path}</p>
          )}
          <div className="mt-4">
            <Textarea
              value={profile.config_text}
              className="font-mono text-sm h-32 bg-gray-50 dark:bg-background dark:text-white"
              readOnly
            />
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            {!profile.is_active && (
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Profile</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the profile "{profile.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(profile.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};