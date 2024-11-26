// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

mod github_auth;
use crate::github_auth::get_github_access_token;
use crate::github_auth::start_github_login;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_deep_link::init())
        .setup(|app| {
            #[cfg(any(windows, target_os = "windows"))]
            {
                use tauri_plugin_deep_link::DeepLinkExt;
                app.deep_link().register("solid-github")?;
                app.deep_link().register_all()?;
            }
            Ok(())
        });

    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|_app, argv, _cwd| {
          println!("a new app instance was opened with {argv:?} and the deep link event was already triggered");
          // when defining deep link schemes at runtime, you must also check `argv` here
        }));
    }

    builder
        .invoke_handler(tauri::generate_handler![
            start_github_login,
            get_github_access_token
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
