export interface GitProfile {
  id: string;
  name: string;
  email: string;
  sshKeyPath?: string;
  configText: string;
  isActive: boolean;
  imageUrl?: string;
  description?: string;
  lastUsed?: Date;
}