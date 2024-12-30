import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Moon, Sun, ArrowLeft, Lock } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { invoke } from '@tauri-apps/api/core';
import { Switch } from "../components/ui/switch";
import { Alert, AlertDescription } from "../components/ui/alert";


interface AppConfig {
  profiles_dir: string;
  theme: string;
  backup_enabled: boolean;
  auto_backup_interval: number;
  encryption_key?: string;
}

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [profilesPath, setProfilesPath] = useState("");
  const [backupEnabled, setBackupEnabled] = useState<boolean>(true);
  const [encryptionKey, setEncryptionKey] = useState("");
  const [isEncryptionSetup, setIsEncryptionSetup] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const appConfig = await invoke<AppConfig>("get_app_config");
      setConfig(appConfig);
      setProfilesPath(appConfig.profiles_dir);
      setBackupEnabled(appConfig.backup_enabled);
    } catch (error) {
      toast.error("Failed to load configuration");
    }
  };


  const handleUpdateEncryption = async () => {
    if (!encryptionKey) {
      toast.error("Please enter an encryption key");
      return;
    }

    try {
      await invoke("update_encryption_key", { key: encryptionKey });
      toast.success("Encryption key updated successfully");
      setIsEncryptionSetup(true);
      setShowKey(false);
    } catch (error) {
      toast.error("Failed to update encryption key");
    }
  };

  const handleSaveProfilesPath = async () => {
    if (!config) return;

    try {
      await invoke("update_app_config", {
        config: {
          ...config,
          profiles_dir: profilesPath
        }
      });
      toast.success("Profiles path updated successfully");
    } catch (error) {
      toast.error("Failed to update profiles path");
    }
  };

  const handleBackupToggle = async (enabled: boolean) => {
    try {
      setBackupEnabled(enabled);
      if (config) {
        await invoke("update_app_config", {
          config: {
            ...config,
            backup_enabled: enabled
          }
        });
        toast.success(`Backup ${enabled ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      toast.error("Failed to update backup settings");
      // Revert the UI state if the update failed
      setBackupEnabled(!enabled);
    }
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
                  const newTheme = theme === "dark" ? "light" : "dark";
                  setTheme(newTheme);
                  if (config) {
                    invoke("update_app_config", {
                      config: {
                        ...config,
                        theme: newTheme
                      }
                    });
                  }
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
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="backup">Backup Configurations</Label>
                <p className="text-sm text-muted-foreground">
                  Create backup files before making changes
                </p>
              </div>
              <Switch
                id="backup"
                checked={backupEnabled}
                onCheckedChange={handleBackupToggle}
              />
            </div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-sm bg-background/95">
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="encryptionKey">File Encryption Key</Label>
              <div className="flex space-x-2">
                <Input
                  id="encryptionKey"
                  type={showKey ? "text" : "password"}
                  value={encryptionKey}
                  onChange={(e) => setEncryptionKey(e.target.value)}
                  placeholder="Enter encryption key"
                  className="bg-background/50"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowKey(!showKey)}
                  title={showKey ? "Hide key" : "Show key"}
                >
                  <Lock className="w-4 h-4" />
                </Button>
                <Button onClick={handleUpdateEncryption}>
                  {isEncryptionSetup ? "Update" : "Set"} Key
                </Button>
              </div>
              {isEncryptionSetup && (
                <Alert>
                  <AlertDescription>
                    Files are currently encrypted. Changing the key will re-encrypt all files.
                  </AlertDescription>
                </Alert>
              )}
              <p className="text-sm text-muted-foreground">
                This key will be used to encrypt your profile and configuration files
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default Settings;