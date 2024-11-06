# Dockerfile for Windows build
FROM mcr.microsoft.com/windows/servercore:ltsc2019 as builder

# Install Rust for Windows (MSVC toolchain)
RUN powershell -Command \
    Invoke-WebRequest -Uri https://static.rust-lang.org/dist/rust-1.57.0-x86_64-pc-windows-msvc.tar.gz -OutFile rust.tar.gz; \
    tar -xvzf rust.tar.gz -C C:\; \
    rm rust.tar.gz

WORKDIR /app

# Copy your Rust source code
COPY . /app

# Install Tauri dependencies (make sure to set up Windows build dependencies)
RUN cargo install tauri-bundler

# Build for Windows
RUN cargo tauri build --target x86_64-pc-windows-msvc
