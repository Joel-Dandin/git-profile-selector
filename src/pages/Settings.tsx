import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Moon, Sun, Folder, ArrowLeft } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [profilesPath, setProfilesPath] = useState(localStorage.getItem("profilesPath") || "");
  const handleSaveProfilesPath = () => {
    localStorage.setItem("profilesPath", profilesPath);
    toast.success("Profiles path updated successfully");
  };
  return (
    <div className="container py-8 transition-colors duration-200">
      <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        
        <Card className="backdrop-blur-sm bg-background/95">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span>Theme</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  console.log("Current theme:", theme);
                  const newTheme = theme === "dark" ? "light" : "dark";
                  console.log("Setting theme to:", newTheme);
                  setTheme(newTheme);
                }}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-sm bg-background/95">
          <CardHeader>
            <CardTitle>Profile Storage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profilesPath">Profiles Directory Path</Label>
              <div className="flex space-x-2">
                <Input
                  id="profilesPath"
                  value={profilesPath}
                  onChange={(e) => setProfilesPath(e.target.value)}
                  placeholder="/path/to/profiles"
                   className="bg-background/50"
                />
                <Button onClick={handleSaveProfilesPath}>Save</Button>
              </div>
              <p className="text-sm text-muted-foreground">
                This is where your Git profile configurations will be stored
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default Settings;