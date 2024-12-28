import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { GitProfile } from "../types/profile";
import { ProfileForm } from "../components/ProfileForm";
import { ProfileCard } from "../components/ProfileCard";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useProfileStore } from "../components/profileStore";

const Index = () => {
  const { 
    profiles, 
    addProfile, 
    updateProfile, 
    deleteProfile, 
    setActiveProfile, 
    initializeProfiles 
  } = useProfileStore();
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<GitProfile | null>(null);
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
      setShowForm(false);
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
    setShowForm(true);
  };


  return (
    <div className="min-h-screen bg-github-gray">
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-github-dark">
              GitHub Profile Switcher
            </h1>
            {!showForm && (
              <Button 
                onClick={() => setShowForm(true)} 
                className="bg-github-green hover:bg-github-green/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Profile
              </Button>
            )}
          </div>

          {showForm && (
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingProfile ? "Edit Profile" : "Add New Profile"}
              </h2>
              <ProfileForm
                onSave={handleSaveProfile}
                onCancel={() => {
                  setShowForm(false);
                  setEditingProfile(null);
                }}
                initialData={editingProfile || undefined}
              />
            </div>
          )}

          <div className="space-y-4">
            {profiles.length === 0 && !showForm ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <h2 className="text-xl font-semibold text-gray-600">
                  No profiles yet
                </h2>
                <p className="text-gray-500 mt-2">
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