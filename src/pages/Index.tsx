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
  const { profiles,addProfile,updateProfile,deleteProfile, setActiveProfile, initializeProfiles } = useProfileStore();

  const [allProfiles, setAllProfiles] = useState<GitProfile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<GitProfile | null>(null);

  // useEffect(() => {
  //   initializeProfiles().catch(error => {
  //     toast.error("Failed to initialize profiles")
  //   });
  // }, []);
  if(profiles.length > 0){
    setAllProfiles(profiles)
  }
  

  const handleSaveProfile = (profileData: Omit<GitProfile, "id" | "is_active" | "last_used">) => {
    if (editingProfile) {
      // Update existing profile
      setAllProfiles((prev) =>
        prev.map((profile) =>
          profile.id === editingProfile.id
            ? {
                ...profile,
                ...profileData,
                lastUsed: new Date(),
              }
            : profile
        )
      );
      setEditingProfile(null);
      toast.success("Profile updated successfully");
    } else {
      // Create new profile
      const newProfile: GitProfile = {
        ...profileData,
        id: uuidv4(),
        is_active: false,
        last_used: new Date(),
      };
      addProfile(newProfile)
      setAllProfiles((prev) => [...prev, newProfile]);
      toast.success("Profile added successfully");
    }
    setShowForm(false);
  };

  const handleActivateProfile = (id: string) => {
    setAllProfiles((prev) =>
      prev.map((profile) => ({
        ...profile,
        isActive: profile.id === id,
        lastUsed: profile.id === id ? new Date() : profile.last_used,
      }))
    );
    
    const profile = allProfiles.find((p) => p.id === id);
    if (profile) {
      setActiveProfile(profile)
      console.log("Updating .gitconfig with:", {
        name: profile.name,
        email: profile.email,
        sshKeyPath: profile.ssh_key_path,
        configText: profile.config_text,
      });
      toast.success("Git configuration updated successfully");
    }
  };

  const handleDeleteProfile = (id: string) => {
    setAllProfiles((prev) => prev.filter((profile) => profile.id !== id));
    deleteProfile(id)
    toast.success("Profile deleted successfully");
  };

  const handleEditProfile = (profile: GitProfile) => {
    setEditingProfile(profile);
    updateProfile(profile);
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
              <Button onClick={() => setShowForm(true)} className="bg-github-green hover:bg-github-green/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Profile
              </Button>
            )}
          </div>

          {showForm ? (
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
          ) : null}

          <div className="space-y-4">
            {allProfiles.length === 0 && !showForm ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <h2 className="text-xl font-semibold text-gray-600">
                  No profiles yet
                </h2>
                <p className="text-gray-500 mt-2">
                  Add a profile to get started with Git profile switching
                </p>
              </div>
            ) : (
              allProfiles.map((profile) => (
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