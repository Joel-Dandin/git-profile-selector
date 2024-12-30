// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::fs;
use std::path::PathBuf;
use chrono::Local;
use tauri::command;
use std::io::Write;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use once_cell::sync::Lazy;
use opener;

// App configuration structure
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppConfig {
    profiles_dir: String,
    theme: String,
    backup_enabled: bool,
    auto_backup_interval: u32, // in minutes
}

#[derive(Serialize, Deserialize, Clone)]
struct GitProfile {
    id: String,
    name: String,
    email: String,
    ssh_key_path: Option<String>,
    config_text: Option<String>,
    is_active: bool,
    image_url: Option<String>,
    description: Option<String>,
    last_used: Option<String>,
}

// Global configuration state
static APP_CONFIG: Lazy<Mutex<AppConfig>> = Lazy::new(|| {
    Mutex::new(load_config().unwrap_or_default())
});

#[command]
async fn ensure_profiles_dir() -> Result<(), String> {
    let profiles_dir = get_profiles_dir().await?;
    fs::create_dir_all(&profiles_dir)
        .map_err(|e| format!("Failed to create profiles directory: {}", e))?;
    Ok(())
}

#[command]
async fn save_profiles(profiles: Vec<GitProfile>) -> Result<(), String> {
    let profiles_dir = get_profiles_dir().await?;
    ensure_profiles_dir().await?;
    
    let profiles_file = PathBuf::from(&profiles_dir).join("profiles.json");
    let json = serde_json::to_string_pretty(&profiles)
        .map_err(|e| format!("Failed to serialize profiles: {}", e))?;
    
    fs::write(&profiles_file, json)
        .map_err(|e| format!("Failed to write profiles: {}", e))?;
    
    Ok(())
}

#[command]
async fn load_profiles() -> Result<Vec<GitProfile>, String> {
    let profiles_dir = get_profiles_dir().await?;
    ensure_profiles_dir().await?;
    
    let profiles_file = PathBuf::from(&profiles_dir).join("profiles.json");
    
    if !profiles_file.exists() {
        return Ok(Vec::new());
    }
    
    let json = fs::read_to_string(&profiles_file)
        .map_err(|e| format!("Failed to read profiles: {}", e))?;
    
    serde_json::from_str(&json)
        .map_err(|e| format!("Failed to deserialize profiles: {}", e))
}

#[command]
async fn update_git_config(config_text: String) -> Result<String, String> {
    let profiles_dir = get_profiles_dir().await?;
    let home_dir = dirs::home_dir().ok_or("Could not find home directory")?;
    let git_config_path = home_dir.join(".gitconfig");
    
    // Get backup setting from config
    let config = APP_CONFIG.lock().map_err(|e| e.to_string())?;
    let backup_enabled = config.backup_enabled;

    // Read current .gitconfig if it exists
    let current_config = if git_config_path.exists() {
        fs::read_to_string(&git_config_path).map_err(|e| e.to_string())?
    } else {
        String::new()
    };

    // Only create backups if enabled
    if backup_enabled && git_config_path.exists() {
        let backup_path = PathBuf::from(&profiles_dir)
            .join("backups")
            .join(format!(
                "backup_{}.gitconfig",
                Local::now().format("%Y%m%d_%H%M%S")
            ));

        // Create backups directory if it doesn't exist
        fs::create_dir_all(PathBuf::from(&profiles_dir).join("backups"))
            .map_err(|e| format!("Failed to create backups directory: {}", e))?;

        // Create backup
        fs::copy(&git_config_path, &backup_path)
            .map_err(|e| format!("Failed to create backup: {}", e))?;
    }

    // Compare and update if different
    if current_config != config_text {
        // Write new config
        let mut file = fs::File::create(&git_config_path)
            .map_err(|e| format!("Failed to create .gitconfig: {}", e))?;
        file.write_all(config_text.as_bytes())
            .map_err(|e| format!("Failed to write .gitconfig: {}", e))?;

        Ok("Git config updated successfully".to_string())
    } else {
        Ok("Git config is already up to date".to_string())
    }
}

#[command]
async fn open_git_config() -> Result<(), String> {
    let home_dir = dirs::home_dir().ok_or("Could not find home directory")?;
    let git_config_path = home_dir.join(".gitconfig");
    
    if !git_config_path.exists() {
        return Err("Git config file does not exist".to_string());
    }

    opener::open(git_config_path)
        .map_err(|e| format!("Failed to open git config: {}", e))
}

impl Default for AppConfig {
    fn default() -> Self {
        let default_profiles_dir = dirs::document_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("GitProfileManager")
            .to_string_lossy()
            .to_string();

        Self {
            profiles_dir: default_profiles_dir,
            theme: "system".to_string(),
            backup_enabled: true,
            auto_backup_interval: 60,
        }
    }
}

fn get_config_file_path() -> PathBuf {
    dirs::document_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("GitProfileManager")
        .join("config.json")
}

fn load_config() -> Result<AppConfig, String> {
    let config_path = get_config_file_path();
    
    if !config_path.exists() {
        let config = AppConfig::default();
        save_config(&config)?;
        return Ok(config);
    }

    let config_str = fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read config file: {}", e))?;
    
    serde_json::from_str(&config_str)
        .map_err(|e| format!("Failed to parse config file: {}", e))
}

fn save_config(config: &AppConfig) -> Result<(), String> {
    let config_path = get_config_file_path();
    
    // Create directory if it doesn't exist
    if let Some(parent) = config_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }
    
    let config_str = serde_json::to_string_pretty(config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;
    
    fs::write(&config_path, config_str)
        .map_err(|e| format!("Failed to write config file: {}", e))
}

#[command]
async fn get_app_config() -> Result<AppConfig, String> {
    let config = APP_CONFIG.lock().map_err(|e| e.to_string())?;
    Ok(config.clone())
}

#[command]
async fn update_app_config(config: AppConfig) -> Result<(), String> {
    let mut current_config = APP_CONFIG.lock().map_err(|e| e.to_string())?;
    *current_config = config.clone();
    save_config(&config)
}

#[command]
async fn read_git_config() -> Result<String, String> {
    let home_dir = dirs::home_dir()
        .ok_or_else(|| "Could not find home directory".to_string())?;
    let git_config_path = home_dir.join(".gitconfig");
    
    if git_config_path.exists() {
        fs::read_to_string(&git_config_path)
            .map_err(|e| format!("Failed to read .gitconfig: {}", e))
    } else {
        Ok("# No .gitconfig file found in home directory".to_string())
    }
}

#[command]
async fn get_profiles_dir() -> Result<String, String> {
    let config = APP_CONFIG.lock().map_err(|e| e.to_string())?;
    Ok(config.profiles_dir.clone())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![update_git_config,
            read_git_config,
            save_profiles,
            load_profiles,
            ensure_profiles_dir, 
            get_app_config,
            update_app_config,
            get_profiles_dir,
            open_git_config])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
