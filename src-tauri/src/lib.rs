// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::fs;
use std::path::PathBuf;
use chrono::Local;
use tauri::command;
use std::io::Write;
use serde::{Deserialize, Serialize};

const PROFILES_DIR: &str = "C:/Custom App/GitConfig";

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

#[command]
async fn ensure_profiles_dir() -> Result<(), String> {
    fs::create_dir_all(PROFILES_DIR)
        .map_err(|e| format!("Failed to create profiles directory: {}", e))?;
    Ok(())
}

#[command]
async fn save_profiles(profiles: Vec<GitProfile>) -> Result<(), String> {
    ensure_profiles_dir().await?;
    let profiles_file = format!("{}/profiles.json", PROFILES_DIR);
    let json = serde_json::to_string_pretty(&profiles)
        .map_err(|e| format!("Failed to serialize profiles: {}", e))?;
    
    fs::write(&profiles_file, json)
        .map_err(|e| format!("Failed to write profiles: {}", e))?;
    
    Ok(())
}

#[command]
async fn load_profiles() -> Result<Vec<GitProfile>, String> {
    ensure_profiles_dir().await?;
    let profiles_file = format!("{}/profiles.json", PROFILES_DIR);
    
    if !PathBuf::from(&profiles_file).exists() {
        return Ok(Vec::new());
    }
    
    let json = fs::read_to_string(&profiles_file)
        .map_err(|e| format!("Failed to read profiles: {}", e))?;
    
    serde_json::from_str(&json)
        .map_err(|e| format!("Failed to deserialize profiles: {}", e))
}

#[command]
async fn update_git_config(config_text: String) -> Result<String, String> {
    let home_dir = dirs::home_dir().ok_or("Could not find home directory")?;
    let git_config_path = home_dir.join(".gitconfig");
    let old_config_path = home_dir.join("old.gitconfig");
    let backup_path = PathBuf::from(format!(
        "{}/backups/backup_{}.gitconfig",
        PROFILES_DIR,
        Local::now().format("%Y%m%d_%H%M%S")
    ));

    // Create backups directory if it doesn't exist
    fs::create_dir_all(format!("{}/backups", PROFILES_DIR))
        .map_err(|e| format!("Failed to create backups directory: {}", e))?;

    // Read current .gitconfig if it exists
    let current_config = if git_config_path.exists() {
        fs::read_to_string(&git_config_path).map_err(|e| e.to_string())?
    } else {
        String::new()
    };

    // Always create a backup
    if git_config_path.exists() {
        fs::copy(&git_config_path, &backup_path)
            .map_err(|e| format!("Failed to create backup: {}", e))?;
    }

    // Compare and update if different
    if current_config != config_text {
        // Save current as old if it exists and is different
        if git_config_path.exists() {
            fs::copy(&git_config_path, &old_config_path)
                .map_err(|e| format!("Failed to create old config: {}", e))?;
        }

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
async fn read_git_config() -> Result<String, String> {
    let home_dir = dirs::home_dir().ok_or("Could not find home directory")?;
    let git_config_path = home_dir.join(".gitconfig");
    
    if git_config_path.exists() {
        fs::read_to_string(&git_config_path).map_err(|e| e.to_string())
    } else {
        Ok(String::new())
    }
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
            read_git_config])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
