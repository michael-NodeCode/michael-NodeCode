# Dockerfile for macOS build
FROM rust:latest as builder

# Install required macOS dependencies (via Homebrew)
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    libgtk-3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy your Rust source code
COPY . /app

# Install Tauri dependencies
RUN cargo install tauri-bundler

# Build for macOS
RUN cargo tauri build --target x86_64-apple-darwin
