use std::env;

fn main() {
    tauri_build::build();

    if cfg!(target_os = "macos") {
        println!("cargo:rustc-link-search=/usr/local/lib"); 
    } else if cfg!(target_os = "windows") {
        println!("cargo:rustc-link-search=C:\\src-tauri\\target\\release\\");
    }

    println!("cargo:rustc-link-lib=kuzu");
}
