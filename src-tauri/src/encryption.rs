use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Key, Nonce,
};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use rand::Rng;
use serde::{Deserialize, Serialize};
use std::fs;
use once_cell::sync::Lazy;
use std::sync::Mutex;

static ENCRYPTION_KEY: Lazy<Mutex<Vec<u8>>> = Lazy::new(|| {
    Mutex::new(vec![0; 32]) // Initialize with zeros
});

pub fn set_encryption_key(key: &str) -> Result<(), String> {
    let mut key_bytes = [0u8; 32];
    let input_bytes = key.as_bytes();
    
    // Pad or truncate the input key to exactly 32 bytes
    let len = std::cmp::min(input_bytes.len(), 32);
    key_bytes[..len].copy_from_slice(&input_bytes[..len]);
    
    let mut current_key = ENCRYPTION_KEY.lock().map_err(|e| e.to_string())?;
    *current_key = key_bytes.to_vec();
    Ok(())
}

pub fn get_encryption_key() -> Result<String, String> {
    let key = ENCRYPTION_KEY.lock().map_err(|e| e.to_string())?;
    String::from_utf8(key.clone()).map_err(|e| e.to_string())
}

#[derive(Serialize, Deserialize)]
pub struct EncryptedData {
    pub nonce: String,
    pub ciphertext: String,
}

pub fn encrypt_string(data: &str) -> Result<String, String> {
    let key_data = ENCRYPTION_KEY.lock().map_err(|e| e.to_string())?;
    let key = Key::<Aes256Gcm>::from_slice(&key_data);
    let cipher = Aes256Gcm::new(key);
    
    let mut rng = rand::thread_rng();
    let mut nonce_bytes = [0u8; 12];
    rng.fill(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);
    
    let ciphertext = cipher
        .encrypt(nonce, data.as_bytes())
        .map_err(|e| format!("Encryption failed: {}", e))?;
    
    let encrypted_data = EncryptedData {
        nonce: BASE64.encode(nonce),
        ciphertext: BASE64.encode(ciphertext),
    };
    
    serde_json::to_string(&encrypted_data)
        .map_err(|e| format!("Failed to serialize encrypted data: {}", e))
}

pub fn decrypt_string(encrypted_json: &str) -> Result<String, String> {
    // Parse encrypted data
    let encrypted_data: EncryptedData = serde_json::from_str(encrypted_json)
        .map_err(|e| format!("Failed to parse encrypted data: {}", e))?;
    
    // Decode base64
    let nonce_bytes = BASE64
        .decode(encrypted_data.nonce)
        .map_err(|e| format!("Failed to decode nonce: {}", e))?;
    let ciphertext = BASE64
        .decode(encrypted_data.ciphertext)
        .map_err(|e| format!("Failed to decode ciphertext: {}", e))?;
    
    // Get the current encryption key
    let key_data = ENCRYPTION_KEY.lock().map_err(|e| e.to_string())?;
    let key = Key::<Aes256Gcm>::from_slice(&key_data);
    let cipher = Aes256Gcm::new(key);
    let nonce = Nonce::from_slice(&nonce_bytes);
    
    // Decrypt
    let plaintext = cipher
        .decrypt(nonce, ciphertext.as_ref())
        .map_err(|e| format!("Decryption failed: {}", e))?;
    
    String::from_utf8(plaintext)
        .map_err(|e| format!("Failed to convert decrypted data to string: {}", e))
}

pub fn write_encrypted_file(path: &std::path::Path, content: &str) -> Result<(), String> {
    let encrypted = encrypt_string(content)?;
    fs::write(path, encrypted)
        .map_err(|e| format!("Failed to write encrypted file: {}", e))
}

pub fn read_encrypted_file(path: &std::path::Path) -> Result<String, String> {
    let encrypted = fs::read_to_string(path)
        .map_err(|e| format!("Failed to read encrypted file: {}", e))?;
    decrypt_string(&encrypted)
}