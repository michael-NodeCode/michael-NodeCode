use std::fs;
use std::io::{self, Write};
use std::path::PathBuf;

/// Checks if a file exists in the specified directory.
/// Creates the file if it does not exist.
///
/// # Arguments
///
/// * `filename` - Name of the file to check/create.
/// * `directory` - Optional directory path; defaults to current directory.
///
/// # Returns
///
/// * A `Result<PathBuf>` containing the file's absolute path, or an error.
pub fn check_and_create_file(filename: &str, directory: Option<&str>) -> io::Result<PathBuf> {
    let dir_path = match directory {
        Some(dir) => PathBuf::from(dir),
        None => std::env::current_dir()?,
    };

    if !dir_path.exists() {
        return Err(io::Error::new(
            io::ErrorKind::NotFound,
            format!("Directory does not exist: {:?}", dir_path),
        ));
    }

    let file_path = dir_path.join(filename);

    if !file_path.exists() {
        println!("File does not exist. Creating: {:?}", file_path);

        let mut file = fs::File::create(&file_path)?;
        file.write_all(b"")?;
    } else {
        println!("File already exists: {:?}", file_path);
    }

    Ok(file_path.canonicalize()?)
}
