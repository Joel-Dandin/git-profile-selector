import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { GitProfile } from "../types/profile";
import { ProfileForm } from "../components/ProfileForm";
import { ProfileCard } from "../components/ProfileCard";
import { Button } from "../components/ui/button";
import { Plus, Settings } from "lucide-react";
import { toast } from "sonner";
import { useProfileStore } from "../components/profileStore";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";

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

  useEffect(() => {
    // Simulated reading of .gitconfig file
    // In a real application, this would need backend support
    const mockConfig = `[user]
    name = Current User
    email = current@github.com
[core]
    editor = vim
    whitespace = fix,-indent-with-non-tab,trailing-space,cr-at-eol`;
    setCurrentConfig(mockConfig);
  }, []);

  // Initialize profiles on component mount
  useEffect(() => {
    initializeProfiles().catch(_error => {
      toast.error("Failed to initialize profiles");
    });
  }, []);


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
              <CardTitle>Current Git Configuration</CardTitle>
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
              profiles.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  onActivate={handleActivateProfile}
                  onDelete={handleDeleteProfile}
                  onEdit={handleEditProfile}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;