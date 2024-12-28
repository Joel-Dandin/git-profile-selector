import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { GitProfile } from "../types/profile";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

interface ProfileFormProps {
  onSave: (profile: Omit<GitProfile, "id" | "isActive" | "lastUsed">) => void;
  onCancel: () => void;
  initialData?: GitProfile;
}

export const ProfileForm = ({ onSave, onCancel, initialData }: ProfileFormProps) => {
  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [sshKeyPath, setSshKeyPath] = useState(initialData?.sshKeyPath || "");
  const [configText, setConfigText] = useState(initialData?.configText || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [description, setDescription] = useState(initialData?.description || "");

  useEffect(() => {
    if (!configText || !initialData) {
      const newConfigText = `[user]
    name = ${name}
    email = ${email}
${sshKeyPath ? `[core]\n    sshCommand = "ssh -i ${sshKeyPath}"` : ""}`;
      
      setConfigText(newConfigText);
    }
  }, [name, email, sshKeyPath, initialData, configText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      toast.error("Name and email are required");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    onSave({ name, email, sshKeyPath, configText, imageUrl, description });
    setName("");
    setEmail("");
    setSshKeyPath("");
    setConfigText("");
    setImageUrl("");
    setDescription("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={imageUrl || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"} />
          <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Label htmlFor="imageUrl">Profile Image URL</Label>
          <Input
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Work profile for company projects"
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@github.com"
        />
      </div>
      <div>
        <Label htmlFor="sshKey">SSH Key Path (Optional)</Label>
        <Input
          id="sshKey"
          value={sshKeyPath}
          onChange={(e) => setSshKeyPath(e.target.value)}
          placeholder="~/.ssh/id_rsa"
        />
      </div>
      <div>
        <Label htmlFor="configText">Git Config Preview</Label>
        <Textarea
          id="configText"
          value={configText}
          onChange={(e) => setConfigText(e.target.value)}
          className="font-mono text-sm h-32"
          placeholder="[user]
    name = Your Name
    email = your@email.com"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initialData ? "Update" : "Save"} Profile</Button>
      </div>
    </form>
  );
};