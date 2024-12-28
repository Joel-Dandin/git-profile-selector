import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { GitProfile } from "../types/profile";
import { ProfileForm } from "../components/ProfileForm";
import { ProfileCard } from "../components/ProfileCard";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [profiles, setProfiles] = useState<GitProfile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<GitProfile | null>(null);

  const handleSaveProfile = (profileData: Omit<GitProfile, "id" | "isActive" | "lastUsed">) => {
    if (editingProfile) {
      // Update existing profile
      setProfiles((prev) =>
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
        isActive: false,
        lastUsed: new Date(),
      };

      setProfiles((prev) => [...prev, newProfile]);
      toast.success("Profile added successfully");
    }
    setShowForm(false);
  };

  const handleActivateProfile = (id: string) => {
    setProfiles((prev) =>
      prev.map((profile) => ({
        ...profile,
        isActive: profile.id === id,
        lastUsed: profile.id === id ? new Date() : profile.lastUsed,
      }))
    );
    
    const profile = profiles.find((p) => p.id === id);
    if (profile) {
      console.log("Updating .gitconfig with:", {
        name: profile.name,
        email: profile.email,
        sshKeyPath: profile.sshKeyPath,
        configText: profile.configText,
      });
      toast.success("Git configuration updated successfully");
    }
  };

  const handleDeleteProfile = (id: string) => {
    setProfiles((prev) => prev.filter((profile) => profile.id !== id));
    toast.success("Profile deleted successfully");
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