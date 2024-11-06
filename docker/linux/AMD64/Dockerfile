# Dockerfile for Linux (AMD64)
FROM rust:latest as builder

# Install required system dependencies
RUN apt-get update && apt-get install -y \
    libgtk-3-dev \
    libsoup-3.0-dev \
    libjavascriptcoregtk-4.1-dev \
    libglib2.0-dev \
    libcairo2-dev \
    libpango1.0-dev \
    libgdk-pixbuf2.0-dev \
    libatk1.0-dev \
    libwebkit2gtk-4.1-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy your Rust source code
COPY . /app

# Install Tauri dependencies
RUN cargo install tauri-bundler

# Build for Linux
RUN cargo tauri build --target x86_64-unknown-linux-gnu
