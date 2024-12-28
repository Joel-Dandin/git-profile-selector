export interface GitProfile {
  id: string;
  name: string;
  email: string;
  ssh_key_path?: string;
  config_text: string;
  is_active: boolean;
  image_url?: string;
  description?: string;
  last_used?: Date;
}