# --- Build aşaması ---
FROM rust:1.83 AS builder
WORKDIR /app

# Önce sadece dependency dosyalarını kopyala (cache için)
COPY Cargo.toml ./
COPY Cargo.lock* ./

# Geçici bir main.rs oluşturup sadece dependencies'i build et
RUN mkdir src && \
    echo "fn main() {}" > src/main.rs && \
    cargo build --release && \
    rm -rf src

# Sonra gerçek kaynak kodları kopyala
COPY src ./src

# Sadece binary'yi rebuild et (dependencies cache'den kullanılacak)
RUN cargo build --release

# --- Çalışma aşaması ---
FROM debian:bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/backend .
EXPOSE 8080
CMD ["./backend"]
