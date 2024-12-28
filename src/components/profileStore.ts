// src/stores/profileStore.ts
import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { GitProfile } from "../types/profile";


interface ProfileState {
  profiles: GitProfile[];
  activeProfile?: GitProfile;
  setActiveProfile: (profile: GitProfile) => Promise<void>;
  addProfile: (profile: GitProfile) => Promise<void>;
  updateProfile: (profile: GitProfile) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  initializeProfiles: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: [],
  activeProfile: undefined,

  setActiveProfile: async (profile: GitProfile) => {
    try {
      // Update git config file
      const result = await invoke('update_git_config', {
        configText: profile.config_text
      });
      console.log(result);

      const updatedProfiles = get().profiles.map(p => ({
        ...p,
        isActive: p.id === profile.id,
        lastUsed: p.id === profile.id ? new Date() : p.last_used
      }));

      // Save to file system
      await invoke('save_profiles', { profiles: updatedProfiles });

      // Update store
      set({
        profiles: updatedProfiles,
        activeProfile: profile
      });
    } catch (error) {
      console.error('Failed to set active profile:', error);
      throw error;
    }
  },

  addProfile: async (profile: GitProfile) => {
    const updatedProfiles = [...get().profiles, profile];

    await invoke('save_profiles', { profiles: updatedProfiles });
    set({ profiles: updatedProfiles });
  },

  updateProfile: async (profile: GitProfile) => {
    const updatedProfiles = get().profiles.map(p => 
      p.id === profile.id ? profile : p
    );
    await invoke('save_profiles', { profiles: updatedProfiles });
    set({
      profiles: updatedProfiles,
      activeProfile: get().activeProfile?.id === profile.id ? profile : get().activeProfile
    });
  },

  deleteProfile: async (id: string) => {
    const updatedProfiles = get().profiles.filter(p => p.id !== id);
    await invoke('save_profiles', { profiles: updatedProfiles });
    set({
      profiles: updatedProfiles,
      activeProfile: get().activeProfile?.id === id ? undefined : get().activeProfile
    });
  },

  initializeProfiles: async () => {
    try {
      // Ensure profiles directory exists
      await invoke('ensure_profiles_dir');

      // Read current git config
      const currentConfig = await invoke<string>('read_git_config');
      
      // Load profiles from file system
      const savedProfiles = await invoke<GitProfile[]>('load_profiles');
      const activeProfile = savedProfiles.find(
        (p: GitProfile) => p.config_text === currentConfig
      );

      set({
        profiles: savedProfiles,
        activeProfile
      });
    } catch (error) {
      console.error('Failed to initialize profiles:', error);
      throw error;
    }
  }
}));