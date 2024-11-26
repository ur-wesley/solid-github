use dotenv::dotenv;
use reqwest::Client;
use serde::Deserialize;
use std::env;

#[derive(Deserialize)]
struct AccessTokenResponse {
    access_token: String,
    // token_type: String,
    // scope: String,
}

#[tauri::command]
pub fn start_github_login(random_state: &str) -> Result<String, String> {
    if random_state.is_empty() {
        return Err("random state cannot be empty".into());
    }

    dotenv().ok();
    let client_id = env::var("CLIENT_ID").expect("CLIENT_ID not found");

    let url = format!(
        "https://github.com/login/oauth/authorize?client_id={}&redirect_uri={}&scope=read:user,repo&state={}",
        client_id,
        "solid-github://login-success",
        random_state
    );
    Ok(url)
}

#[tauri::command]
pub async fn get_github_access_token(code: &str) -> Result<String, String> {
    dotenv().ok();

    let client_id = env::var("CLIENT_ID").expect("CLIENT_ID not found");
    let client_secret = env::var("CLIENT_SECRET").expect("CLIENT_SECRET not found");

    let params = [
        ("client_id", client_id.as_str()),
        ("client_secret", client_secret.as_str()),
        ("code", code),
    ];

    let client = Client::new();
    let response = client
        .post("https://github.com/login/oauth/access_token")
        .header("Accept", "application/json")
        .form(&params)
        .send()
        .await
        .map_err(|err| err.to_string())?;

    if response.status().is_success() {
        let token_data: AccessTokenResponse =
            response.json().await.map_err(|err| err.to_string())?;
        Ok(token_data.access_token)
    } else {
        Err("Failed to obtain access token".to_string())
    }
}
