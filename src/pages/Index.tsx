import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { GitProfile } from "../types/profile";
import { ProfileForm } from "../components/ProfileForm";
import { ProfileCard } from "../components/ProfileCard";
import { Button } from "../components/ui/button";
import { Plus, Settings, RefreshCcw, FileEdit, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useProfileStore } from "../components/profileStore";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { invoke } from '@tauri-apps/api/core';
import { Badge } from "../components/ui/badge";

const Index = () => {
  const {
    profiles,
    addProfile,
    updateProfile,
    deleteProfile,
    setActiveProfile,
    initializeProfiles
  } = useProfileStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<GitProfile | null>(null);
  const [currentConfig, setCurrentConfig] = useState("");
  const [configStatus, setConfigStatus] = useState<"match" | "modified" | "unknown">("unknown");

  const loadGitConfig = async () => {
    try {
      const config = await invoke<string>("read_git_config");
      await setCurrentConfig(config);
      await checkConfigStatus(config);
    } catch (error) {
      console.error("Failed to read git config:", error);
      toast.error("Failed to read Git configuration");
      setCurrentConfig("# Failed to load .gitconfig");
    }
  };

  useEffect(() => {
    // Load the actual .gitconfig content

    loadGitConfig();
    initializeProfiles().catch(_error => {
      toast.error("Failed to initialize profiles");
    });
  }, []);

  const checkConfigStatus = (config: string) => {
    const activeProfile = profiles.find(p => p.is_active);
    if (!activeProfile) {
      setConfigStatus("unknown");
      return;
    }
  
    // Simple comparison - in real app would need more sophisticated comparison
    setConfigStatus(config === activeProfile.config_text ? "match" : "modified");
  };

  const handleRefreshConfig = async () => {
    // In a real app, this would fetch from the actual .gitconfig file
    toast.info("Refreshing configuration...");
    // const config = await invoke<string>("read_git_config");
    // setCurrentConfig(config);
    // checkConfigStatus(config);
    await loadGitConfig()
    toast.success("Configuration refreshed");
  };

  const handleOpenInNotepad = async () => {
    try {
      await invoke('open_git_config');
      toast.success("Opening Git config in default editor");
    } catch (error) {
      toast.error("Failed to open Git config file");
    }
  };


  const handleSaveProfile = async (profileData: Omit<GitProfile, "id" | "is_active" | "last_used">) => {
    try {
      if (editingProfile) {
        // Update existing profile
        const updatedProfile: GitProfile = {
          ...editingProfile,
          ...profileData,
          last_used: new Date(),
        };
        await updateProfile(updatedProfile);
        toast.success("Profile updated successfully");
      } else {
        // Create new profile
        const newProfile: GitProfile = {
          ...profileData,
          id: uuidv4(),
          is_active: false,
          last_used: new Date(),
        };
        await addProfile(newProfile);
        toast.success("Profile added successfully");
      }
      setEditingProfile(null);
      setIsDrawerOpen(false);
    } catch (error) {
      toast.error("Failed to save profile");
    }
  };

  const handleActivateProfile = async (id: string) => {
    const activeProfiles = profiles.filter((p) => p.is_active === true);
    if (activeProfiles.length > 0) {
      activeProfiles.forEach(profile => {
        profile.is_active = false;
      });
    }

    try {
      const profile = profiles.find((p) => p.id === id);
      if (profile) {
        profile.is_active = true;
        await setActiveProfile(profile);
        // checkConfigStatus(profile.config_text);
        await loadGitConfig()
        toast.success("Git configuration updated successfully");
      }
    } catch (error) {
      toast.error("Failed to activate profile");
    }
  };

  const handleDeleteProfile = async (id: string) => {
    try {
      await deleteProfile(id);
      toast.success("Profile deleted successfully");
    } catch (error) {
      toast.error("Failed to delete profile");
    }
  };

  const handleEditProfile = (profile: GitProfile) => {
    setEditingProfile(profile);
    setIsDrawerOpen(true);
  };

  const handleEditProfileClose = () => {
    setEditingProfile(null);
    setIsDrawerOpen(false);
  };

  // handleRefreshConfig()
  return (
    <div className="min-h-screen bg-background/95 backdrop-blur-sm transition-colors duration-200">
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">
              GitHub Profile Switcher
            </h1>
            <div className="flex space-x-2">
              <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <SheetTrigger asChild>
                  <Button className="bg-github-green hover:bg-github-green/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Profile
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className=" min-w-[500px] w-[550px] sm:w-[600px] lg:w-[700px] 2xl:w-[700px]">
                  <div className="max-w-4xl mx-auto p-6">
                    <h2 className="text-xl font-semibold mb-4">
                      {editingProfile ? "Edit Profile" : "Add New Profile"}
                    </h2>
                    <ProfileForm
                      onSave={handleSaveProfile}
                      onCancel={handleEditProfileClose}
                      initialData={editingProfile || undefined}
                    />
                  </div>
                </SheetContent>
              </Sheet>
              <Link to="/settings">
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>

          </div>
          <Card className="mb-8">
            <CardHeader>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CardTitle>Current Git Configuration</CardTitle>
                  {configStatus === "modified" && (
                    <Badge variant="destructive" className="flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Modified
                    </Badge>
                  )}
                  {configStatus === "match" && (
                    <Badge variant="default" className="bg-github-green">
                      Matches Active Profile
                    </Badge>
                  )}
                  {configStatus === "unknown" && (
                    <Badge variant="destructive" className="bg-yellow-500">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Error: No Active Profile
                    </Badge>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRefreshConfig}
                    title="Refresh Configuration"
                  >
                    <RefreshCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleOpenInNotepad}
                    title="Open in Text Editor"
                  >
                    <FileEdit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={currentConfig}
                readOnly
                className="font-mono text-sm h-32 bg-background/50"
              />
            </CardContent>
          </Card>
          <div className="space-y-4">
            {profiles.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border">
                <h2 className="text-xl font-semibold text-foreground">
                  No profiles yet
                </h2>
                <p className="text-muted-foreground mt-2">
                  Add a profile to get started with Git profile switching
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {profiles.map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    onActivate={handleActivateProfile}
                    onDelete={handleDeleteProfile}
                    onEdit={handleEditProfile}
                  />
                ))}
              </div>

            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;