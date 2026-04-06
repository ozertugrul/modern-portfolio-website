use axum::{
    extract::{Extension, Query, Path},
    http::StatusCode,
    response::{IntoResponse, Json, Response},
    routing::{delete, get, post, put},
    Router,
    body::{Bytes, Body},
};
use axum_extra::extract::Multipart;
use axum_sessions::{SessionLayer, extractors::ReadableSession, extractors::WritableSession};
use async_redis_session::RedisSessionStore;
use serde::{Deserialize, Serialize};
use std::env;
use std::net::SocketAddr;
use std::sync::Arc;
use anyhow::Result;
use tower_http::cors::CorsLayer;
use redis::Client as RedisClient;
use uuid::Uuid;
use lettre::{Message, SmtpTransport, Transport};
use lettre::message::{header, MultiPart, SinglePart, Attachment};
use lettre::transport::smtp::authentication::Credentials;
use mailparse::MailHeaderMap;
use std::path::PathBuf;

// Data structures
#[derive(Serialize, Deserialize, Debug, Clone)]
struct PortfolioItem {
    id: String,
    title: String,
    description: String,
    technologies: Vec<String>,
    image_url: Option<String>,
    github_url: Option<String>,
    live_url: Option<String>,
    huggingface_url: Option<String>,
    order: Option<i32>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct About {
    name: String,
    title: String,
    bio: String,
    skills: Vec<String>,
    email: String,
    github: Option<String>,
    linkedin: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Resume {
    id: String,
    personal_info: PersonalInfo,
    section_order: Option<Vec<String>>,
    summary: Option<String>,
    summary_enabled: bool,
    skills: Vec<String>,
    skills_enabled: bool,
    soft_skills: Vec<String>,
    soft_skills_enabled: bool,
    education: Vec<Education>,
    education_enabled: bool,
    experience: Vec<Experience>,
    experience_enabled: bool,
    projects: Vec<ResumeProject>,
    projects_enabled: bool,
    languages: Vec<String>,
    languages_enabled: bool,
    certifications: Vec<Certification>,
    certifications_enabled: bool,
    awards: Vec<Award>,
    awards_enabled: bool,
    publications: Vec<Publication>,
    publications_enabled: bool,
    volunteer: Vec<Volunteer>,
    volunteer_enabled: bool,
    interests: Vec<String>,
    interests_enabled: bool,
    references: Vec<Reference>,
    references_enabled: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct PersonalInfo {
    name: String,
    title: String,
    email: String,
    phone: Option<String>,
    location: Option<String>,
    website: Option<String>,
    github: Option<String>,
    linkedin: Option<String>,
    twitter: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Education {
    id: String,
    institution: String,
    degree: String,
    field: Option<String>,
    start_date: String,
    end_date: Option<String>,
    gpa: Option<String>,
    description: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Experience {
    id: String,
    company: String,
    position: String,
    location: Option<String>,
    start_date: String,
    end_date: Option<String>,
    current: bool,
    description: String,
    achievements: Vec<String>,
    technologies: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct ResumeProject {
    id: String,
    name: String,
    description: String,
    role: Option<String>,
    start_date: Option<String>,
    end_date: Option<String>,
    technologies: Vec<String>,
    url: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Certification {
    id: String,
    name: String,
    issuer: String,
    date: String,
    expiry_date: Option<String>,
    credential_id: Option<String>,
    url: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Award {
    id: String,
    title: String,
    issuer: String,
    date: String,
    description: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Publication {
    id: String,
    title: String,
    publisher: String,
    date: String,
    authors: Vec<String>,
    url: Option<String>,
    description: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Volunteer {
    id: String,
    organization: String,
    role: String,
    start_date: String,
    end_date: Option<String>,
    description: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Reference {
    id: String,
    name: String,
    title: String,
    company: String,
    email: Option<String>,
    phone: Option<String>,
    relationship: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct ContactRequest {
    id: String,
    name: String,
    email: String,
    message: String,
    created_at: String,
    read: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct VisitorLog {
    id: String,
    ip: String,
    user_agent: Option<String>,
    path: String,
    method: String,
    timestamp: String,
    referer: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct BackupInfo {
    filename: String,
    size: u64,
    created_at: String,
    backup_type: String, // "redis" or "postgresql" or "full"
}

#[derive(Serialize, Deserialize, Debug)]
struct FullBackup {
    #[serde(default)]
    redis_data: serde_json::Map<String, serde_json::Value>,
    #[serde(default)]
    redis_app_data: serde_json::Map<String, serde_json::Value>,
    postgres_data: PostgresBackupData,
    metadata: BackupMetadata,
}

#[derive(Serialize, Deserialize, Debug)]
struct BackupMetadata {
    created_at: String,
    version: String,
    backup_type: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct PostgresBackupData {
    portfolio_items: Vec<serde_json::Value>,
    about_info: Option<serde_json::Value>,
    resume_data: Option<serde_json::Value>,
    contact_messages: Vec<serde_json::Value>,
    translations: Option<serde_json::Value>,
    footer_settings: Option<serde_json::Value>,
    features: Option<serde_json::Value>,
    hero_section: Option<serde_json::Value>,
    admin_users: Vec<serde_json::Value>,
    visitor_logs: Vec<serde_json::Value>,
}

#[derive(Serialize, Deserialize, Debug)]
struct LoginRequest {
    password: String,
}

#[derive(Serialize)]
struct LoginResponse {
    success: bool,
    message: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct ChangePasswordRequest {
    old_password: String,
    new_password: String,
}

#[derive(Serialize)]
struct PasswordResponse {
    success: bool,
    message: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct InboxEmail {
    id: String,
    from: String,
    subject: String,
    body: String,
    date: String,
    read: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Translations {
    tr: serde_json::Value,
    en: serde_json::Value,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Footer {
    text_tr: String,
    text_en: String,
    enabled: bool,
    #[serde(default)]
    show_backend: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Feature {
    title: String,
    description: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Features {
    performance_tr: Feature,
    performance_en: Feature,
    scalable_tr: Feature,
    scalable_en: Feature,
    secure_tr: Feature,
    secure_en: Feature,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct HeroSection {
    greeting_tr: String,
    greeting_en: String,
    name: String,
    title_tr: String,
    title_en: String,
}

#[derive(Serialize)]
struct HealthCheck {
    status: String,
    service: String,
    timestamp: String,
}

// App state
#[derive(Clone)]
struct AppState {
    redis_client: Arc<RedisClient>,
}

// Redis keys
const REDIS_PORTFOLIO_KEY: &str = "portfolio:items";
const REDIS_ABOUT_KEY: &str = "about:info";
const REDIS_RESUME_KEY: &str = "resume:data";
const REDIS_CONTACTS_KEY: &str = "contacts:messages";
const REDIS_ADMIN_PASSWORD_KEY: &str = "admin:password_hash";
const REDIS_TRANSLATIONS_KEY: &str = "translations:data";
const REDIS_FOOTER_KEY: &str = "footer:text";
const REDIS_FEATURES_KEY: &str = "features:data";
const REDIS_HERO_KEY: &str = "hero:section";
const REDIS_VISITOR_LOGS_KEY: &str = "logs:visitors";
const REDIS_RATE_LIMIT_PREFIX: &str = "rate_limit";
const CONTACT_RATE_LIMIT_MAX: i64 = 8;
const CONTACT_RATE_LIMIT_WINDOW_SECS: i64 = 600;
const ADMIN_LOGIN_RATE_LIMIT_MAX: i64 = 6;
const ADMIN_LOGIN_RATE_LIMIT_WINDOW_SECS: i64 = 600;
const REDIS_APP_BACKUP_KEYS: [&str; 9] = [
    REDIS_PORTFOLIO_KEY,
    REDIS_ABOUT_KEY,
    REDIS_RESUME_KEY,
    REDIS_CONTACTS_KEY,
    REDIS_ADMIN_PASSWORD_KEY,
    REDIS_TRANSLATIONS_KEY,
    REDIS_FOOTER_KEY,
    REDIS_FEATURES_KEY,
    REDIS_HERO_KEY,
];

// Helper: Check if user is admin
async fn is_admin(session: ReadableSession) -> bool {
    session.get::<bool>("is_admin").unwrap_or(false)
}

// Helper: Require admin
async fn require_admin(session: ReadableSession) -> Result<(), StatusCode> {
    if !is_admin(session).await {
        return Err(StatusCode::UNAUTHORIZED);
    }
    Ok(())
}

// Helper: Get Redis connection
async fn get_redis_conn(state: &AppState) -> Result<redis::aio::MultiplexedConnection> {
    Ok(state.redis_client.get_multiplexed_async_connection().await?)
}

fn extract_client_ip(
    req: &axum::http::Request<axum::body::Body>,
    addr: std::net::SocketAddr,
) -> String {
    if let Some(ip) = req
        .headers()
        .get("cf-connecting-ip")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
    {
        return ip.to_string();
    }

    if let Some(ip) = req
        .headers()
        .get("x-forwarded-for")
        .and_then(|v| v.to_str().ok())
        .and_then(|s| s.split(',').next())
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
    {
        return ip.to_string();
    }

    addr.ip().to_string()
}

async fn check_rate_limit(
    state: &AppState,
    bucket: &str,
    client_ip: &str,
    max_requests: i64,
    window_secs: i64,
) -> Result<bool, StatusCode> {
    let mut conn = get_redis_conn(state)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let key = format!("{}:{}:{}", REDIS_RATE_LIMIT_PREFIX, bucket, client_ip);

    let current: i64 = redis::cmd("INCR")
        .arg(&key)
        .query_async(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if current == 1 {
        let _: () = redis::cmd("EXPIRE")
            .arg(&key)
            .arg(window_secs)
            .query_async(&mut conn)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    }

    Ok(current > max_requests)
}

// Helper: Strip HTML tags for plain text
fn strip_html_tags(html: &str) -> String {
    let mut result = String::new();
    let mut in_tag = false;
    
    for c in html.chars() {
        match c {
            '<' => in_tag = true,
            '>' => in_tag = false,
            _ if !in_tag => result.push(c),
            _ => {}
        }
    }
    
    result
        .replace("&nbsp;", " ")
        .replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", "\"")
}

fn is_safe_backup_filename(filename: &str) -> bool {
    if filename.is_empty() || filename.len() > 150 {
        return false;
    }

    if !filename.ends_with(".json") {
        return false;
    }

    if filename.contains("/") || filename.contains("\\") || filename.contains("..") {
        return false;
    }

    filename
        .chars()
        .all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '-' || c == '.')
}

fn sanitize_backup_filename(name: &str) -> Option<String> {
    if name.is_empty() || name.len() > 100 {
        return None;
    }

    let with_ext = if name.ends_with(".json") {
        name.to_string()
    } else {
        format!("{}.json", name)
    };

    let safe = with_ext
        .chars()
        .filter(|c| c.is_ascii_alphanumeric() || *c == '_' || *c == '-' || *c == '.')
        .collect::<String>();

    if is_safe_backup_filename(&safe) {
        Some(safe)
    } else {
        None
    }
}

// Public endpoints
async fn get_portfolio(Extension(state): Extension<AppState>) -> Result<Json<Vec<PortfolioItem>>, StatusCode> {
    let mut conn = get_redis_conn(&state).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let data: Option<String> = redis::cmd("GET")
        .arg(REDIS_PORTFOLIO_KEY)
        .query_async(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    if let Some(json_str) = data {
        let mut items: Vec<PortfolioItem> = serde_json::from_str(&json_str)
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        
        // Sort by order field
        items.sort_by_key(|item| item.order.unwrap_or(999999));
        
        Ok(Json(items))
    } else {
        // Default portfolio items
        let default_items = vec![
            PortfolioItem {
                id: "1".to_string(),
                title: "E-Commerce Platform".to_string(),
                description: "Rust ve React kullanarak geliştirdiğim modern bir e-ticaret platformu. Yüksek performanslı backend ve responsive frontend.".to_string(),
                technologies: vec!["Rust".to_string(), "React".to_string(), "PostgreSQL".to_string()],
                image_url: Some("https://via.placeholder.com/600x400".to_string()),
                github_url: Some("https://github.com/example".to_string()),
                live_url: Some("https://example.com".to_string()),
                huggingface_url: None,
                order: Some(0),
            },
        ];
        Ok(Json(default_items))
    }
}

async fn get_about(Extension(state): Extension<AppState>) -> Result<Json<About>, StatusCode> {
    let mut conn = get_redis_conn(&state).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let data: Option<String> = redis::cmd("GET")
        .arg(REDIS_ABOUT_KEY)
        .query_async(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    if let Some(json_str) = data {
        let about: About = serde_json::from_str(&json_str)
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        Ok(Json(about))
    } else {
        // Default about
        let default_about = About {
            name: "Ertu".to_string(),
            title: "Rust Backend Developer".to_string(),
            bio: "Rust programlama dili ile yüksek performanslı backend sistemleri geliştiriyorum. Yatay ölçeklenebilir mimariler ve mikroservis tasarımları konusunda deneyimliyim.".to_string(),
            skills: vec![
                "Rust".to_string(),
                "Backend Development".to_string(),
                "Microservices".to_string(),
                "Docker".to_string(),
                "Redis".to_string(),
                "Load Balancing".to_string(),
            ],
            email: "ertu@example.com".to_string(),
            github: Some("https://github.com/ertu".to_string()),
            linkedin: Some("https://linkedin.com/in/ertu".to_string()),
        };
        Ok(Json(default_about))
    }
}

async fn get_resume(Extension(state): Extension<AppState>) -> Result<Json<Resume>, StatusCode> {
    let mut conn = get_redis_conn(&state).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let data: Option<String> = redis::cmd("GET")
        .arg(REDIS_RESUME_KEY)
        .query_async(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    if let Some(json_str) = data {
        let resume: Resume = serde_json::from_str(&json_str)
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        Ok(Json(resume))
    } else {
        // Default resume
        let default_resume = Resume {
            id: "1".to_string(),
            personal_info: PersonalInfo {
                name: "Ertu".to_string(),
                title: "Rust Backend Developer".to_string(),
                email: "ertu@example.com".to_string(),
                phone: Some("+90 555 000 0000".to_string()),
                location: Some("Istanbul, Turkey".to_string()),
                website: None,
                github: Some("https://github.com/ertu".to_string()),
                linkedin: Some("https://linkedin.com/in/ertu".to_string()),
                twitter: None,
            },
            section_order: None,
            summary: Some("Experienced backend developer specializing in Rust and high-performance systems.".to_string()),
            summary_enabled: true,
            skills: vec!["Rust".to_string(), "Docker".to_string(), "PostgreSQL".to_string()],
            skills_enabled: true,
            soft_skills: vec!["Leadership".to_string(), "Problem Solving".to_string(), "Communication".to_string()],
            soft_skills_enabled: true,
            education: vec![],
            education_enabled: true,
            experience: vec![],
            experience_enabled: true,
            projects: vec![],
            projects_enabled: true,
            languages: vec!["Turkish".to_string(), "English".to_string()],
            languages_enabled: true,
            certifications: vec![],
            certifications_enabled: true,
            awards: vec![],
            awards_enabled: false,
            publications: vec![],
            publications_enabled: false,
            volunteer: vec![],
            volunteer_enabled: false,
            interests: vec!["Open Source".to_string(), "Tech Blogging".to_string()],
            interests_enabled: true,
            references: vec![],
            references_enabled: false,
        };
        Ok(Json(default_resume))
    }
}

async fn contact(
    Extension(state): Extension<AppState>,
    Json(payload): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let name = payload.get("name").and_then(|v| v.as_str()).ok_or(StatusCode::BAD_REQUEST)?;
    let email = payload.get("email").and_then(|v| v.as_str()).ok_or(StatusCode::BAD_REQUEST)?;
    let message = payload.get("message").and_then(|v| v.as_str()).ok_or(StatusCode::BAD_REQUEST)?;
    
    let mut conn = get_redis_conn(&state).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let contact = ContactRequest {
        id: Uuid::new_v4().to_string(),
        name: name.to_string(),
        email: email.to_string(),
        message: message.to_string(),
        created_at: chrono::Utc::now().to_rfc3339(),
        read: false,
    };
    
    let mut contacts: Vec<ContactRequest> = {
        let data: Option<String> = redis::cmd("GET")
            .arg(REDIS_CONTACTS_KEY)
            .query_async(&mut conn)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        
        if let Some(json_str) = data {
            serde_json::from_str(&json_str).unwrap_or_else(|_| vec![])
        } else {
            vec![]
        }
    };
    
    contacts.push(contact.clone());
    
    let json_str = serde_json::to_string(&contacts)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    redis::cmd("SET")
        .arg(REDIS_CONTACTS_KEY)
        .arg(&json_str)
        .query_async::<_, ()>(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json(serde_json::json!({
        "success": true,
        "message": "Mesajınız başarıyla gönderildi!"
    })))
}

async fn health_check() -> Json<HealthCheck> {
    use std::time::{SystemTime, UNIX_EPOCH};
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
        .to_string();

    Json(HealthCheck {
        status: "healthy".to_string(),
        service: "backend".to_string(),
        timestamp,
    })
}

async fn get_translations(Extension(state): Extension<AppState>) -> Result<Json<Translations>, StatusCode> {
    let mut conn = get_redis_conn(&state).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let data: Option<String> = redis::cmd("GET")
        .arg(REDIS_TRANSLATIONS_KEY)
        .query_async(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    if let Some(json_str) = data {
        let translations: Translations = serde_json::from_str(&json_str)
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        Ok(Json(translations))
    } else {
        // Return empty translations if not set
        Ok(Json(Translations {
            tr: serde_json::json!({}),
            en: serde_json::json!({}),
        }))
    }
}

async fn get_footer(Extension(state): Extension<AppState>) -> Result<Json<Footer>, StatusCode> {
    let mut conn = get_redis_conn(&state).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let data: Option<String> = redis::cmd("GET")
        .arg(REDIS_FOOTER_KEY)
        .query_async(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    if let Some(json_str) = data {
        let footer: Footer = serde_json::from_str(&json_str)
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        Ok(Json(footer))
    } else {
        // Return default footer if not set
        Ok(Json(Footer {
            text_tr: "© 2025 Ertu. Rust ile geliştirildi.".to_string(),
            text_en: "© 2025 Ertu. Built with Rust.".to_string(),
            enabled: true,
            show_backend: false,
        }))
    }
}

async fn get_features(Extension(state): Extension<AppState>) -> Result<Json<Features>, StatusCode> {
    let mut conn = get_redis_conn(&state).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let data: Option<String> = redis::cmd("GET")
        .arg(REDIS_FEATURES_KEY)
        .query_async(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    if let Some(json_str) = data {
        let features: Features = serde_json::from_str(&json_str)
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        Ok(Json(features))
    } else {
        // Return default features if not set
        Ok(Json(Features {
            performance_tr: Feature {
                title: "Yüksek Performans".to_string(),
                description: "Rust ile geliştirilmiş, hızlı ve verimli backend sistemleri".to_string(),
            },
            performance_en: Feature {
                title: "High Performance".to_string(),
                description: "Fast and efficient backend systems developed with Rust".to_string(),
            },
            scalable_tr: Feature {
                title: "Yatay ölçeklenebilir".to_string(),
                description: "Load balancer ve mikroservis mimarisi ile ölçeklenebilir çözümler".to_string(),
            },
            scalable_en: Feature {
                title: "Horizontally Scalable".to_string(),
                description: "Scalable solutions with load balancer and microservice architecture".to_string(),
            },
            secure_tr: Feature {
                title: "Güvenli".to_string(),
                description: "Modern güvenlik standartları ile korumalı sistemler".to_string(),
            },
            secure_en: Feature {
                title: "Secure".to_string(),
                description: "Systems protected with modern security standards".to_string(),
            },
        }))
    }
}

async fn get_hero(Extension(state): Extension<AppState>) -> Result<Json<HeroSection>, StatusCode> {
    let mut conn = get_redis_conn(&state).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let data: Option<String> = redis::cmd("GET")
        .arg(REDIS_HERO_KEY)
        .query_async(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    if let Some(json_str) = data {
        let hero: HeroSection = serde_json::from_str(&json_str)
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        Ok(Json(hero))
    } else {
        Ok(Json(HeroSection {
            greeting_tr: "Merhaba, Ben".to_string(),
            greeting_en: "Hello, I'm".to_string(),
            name: "Ertu".to_string(),
            title_tr: "Rust Backend Developer - Yüksek Performanslı Sistemler Geliştiriyorum".to_string(),
            title_en: "Rust Backend Developer - Building High-Performance Systems".to_string(),
        }))
    }
}

// Helper: Get admin password hash from Redis
async fn get_admin_password_hash(state: &AppState) -> Result<String, StatusCode> {
    let mut conn = get_redis_conn(state).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let hash: Option<String> = redis::cmd("GET")
        .arg(REDIS_ADMIN_PASSWORD_KEY)
        .query_async(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    hash.ok_or(StatusCode::UNAUTHORIZED)
}

// Helper: Set admin password hash to Redis
async fn set_admin_password_hash(state: &AppState, hash: &str) -> Result<(), StatusCode> {
    let mut conn = get_redis_conn(state).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    redis::cmd("SET")
        .arg(REDIS_ADMIN_PASSWORD_KEY)
        .arg(hash)
        .query_async::<_, ()>(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(())
}

// Admin endpoints
async fn admin_login(
    mut session: WritableSession,
    Extension(state): Extension<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, StatusCode> {
    let password_hash = match get_admin_password_hash(&state).await {
        Ok(hash) => hash,
        Err(StatusCode::UNAUTHORIZED) => {
            return Ok(Json(LoginResponse {
                success: false,
                message: "Admin hesabı henüz yapılandırılmadı".to_string(),
            }))
        }
        Err(_) => return Err(StatusCode::INTERNAL_SERVER_ERROR),
    };

    match bcrypt::verify(&payload.password, &password_hash) {
        Ok(true) => {
            session.insert("is_admin", true).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
            tracing::info!("✅ Admin login successful");
            Ok(Json(LoginResponse {
                success: true,
                message: "Giriş başarılı".to_string(),
            }))
        }
        Ok(false) => {
            tracing::warn!("❌ Admin login failed: password verification failed");
            Ok(Json(LoginResponse {
                success: false,
                message: "Şifre hatalı".to_string(),
            }))
        }
        Err(e) => {
            tracing::error!("Bcrypt verification error: {:?}", e);
            Ok(Json(LoginResponse {
                success: false,
                message: "Şifre doğrulama hatası".to_string(),
            }))
        }
    }
}

async fn admin_logout(mut session: WritableSession) -> Json<&'static str> {
    session.remove("is_admin");
    Json("Çıkış yapıldı")
}

// Admin: Portfolio management
async fn admin_get_portfolio(
    session: ReadableSession,
    Extension(state): Extension<AppState>,
) -> Result<Json<Vec<PortfolioItem>>, StatusCode> {
    require_admin(session).await?;
    get_portfolio(Extension(state)).await
}

async fn admin_create_portfolio(
    session: ReadableSession,
    Extension(state): Extension<AppState>,
    Json(item): Json<PortfolioItem>,
) -> Result<Json<PortfolioItem>, StatusCode> {
    require_admin(session).await?;
    
    let mut conn = get_redis_conn(&state).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let mut items: Vec<PortfolioItem> = {
        let data: Option<String> = redis::cmd("GET")
            .arg(REDIS_PORTFOLIO_KEY)
            .query_async(&mut conn)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        
        if let Some(json_str) = data {
            serde_json::from_str(&json_str).unwrap_or_else(|_| vec![])
        } else {
            vec![]
        }
    };
    
    let mut new_item = item;
    new_item.id = Uuid::new_v4().to_string();
    items.push(new_item.clone());
    
    let json_str = serde_json::to_string(&items)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    redis::cmd("SET")
        .arg(REDIS_PORTFOLIO_KEY)
        .arg(&json_str)
        .query_async::<_, ()>(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json(new_item))
}

async fn admin_update_portfolio(
    session: ReadableSession,
    Extension(state): Extension<AppState>,
    Json(item): Json<PortfolioItem>,
) -> Result<Json<PortfolioItem>, StatusCode> {
    require_admin(session).await?;
    
    let mut conn = get_redis_conn(&state).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let mut items: Vec<PortfolioItem> = {
        let data: Option<String> = redis::cmd("GET")
            .arg(REDIS_PORTFOLIO_KEY)
            .query_async(&mut conn)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        
        if let Some(json_str) = data {
            serde_json::from_str(&json_str).unwrap_or_else(|_| vec![])
        } else {
            vec![]
        }
    };
    
    if let Some(pos) = items.iter().position(|p| p.id == item.id) {
        items[pos] = item.clone();
    } else {
        return Err(StatusCode::NOT_FOUND);
    }
    
    let json_str = serde_json::to_string(&items)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    redis::cmd("SET")
        .arg(REDIS_PORTFOLIO_KEY)
        .arg(&json_str)
        .query_async::<_, ()>(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json(item))
}

async fn admin_delete_portfolio(
    session: ReadableSession,
    Extension(state): Extension<AppState>,
    Query(params): Query<std::collections::HashMap<String, String>>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    require_admin(session).await?;
    
    let id = params.get("id").ok_or(StatusCode::BAD_REQUEST)?;
    
    let mut conn = get_redis_conn(&state).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let mut items: Vec<PortfolioItem> = {
        let data: Option<String> = redis::cmd("GET")
            .arg(REDIS_PORTFOLIO_KEY)
            .query_async(&mut conn)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        
        if let Some(json_str) = data {
            serde_json::from_str(&json_str).unwrap_or_else(|_| vec![])
        } else {
            vec![]
        }
    };
    
    items.retain(|p| &p.id != id);
    
    let json_str = serde_json::to_string(&items)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    redis::cmd("SET")
        .arg(REDIS_PORTFOLIO_KEY)
        .arg(&json_str)
        .query_async::<_, ()>(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json(serde_json::json!({"success": true})))
}

// Admin: About management
async fn admin_update_about(
    session: ReadableSession,
    Extension(state): Extension<AppState>,
    Json(about): Json<About>,
) -> Result<Json<About>, StatusCode> {
    require_admin(session).await?;
    
    let mut conn = get_redis_conn(&state).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let json_str = serde_json::to_string(&about)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    redis::cmd("SET")
        .arg(REDIS_ABOUT_KEY)
        .arg(&json_str)
        .query_async::<_, ()>(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json(about))
}

// Admin: Resume management
async fn admin_get_resume(
    session: ReadableSession,
    Extension(state): Extension<AppState>,
) -> Result<Json<Resume>, StatusCode> {
    require_admin(session).await?;
    get_resume(Extension(state)).await
}

async fn admin_update_resume(
    session: ReadableSession,
    Extension(state): Extension<AppState>,
    Json(resume): Json<Resume>,
) -> Result<Json<Resume>, StatusCode> {
    require_admin(session).await?;
    
    let mut conn = get_redis_conn(&state).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let json_str = serde_json::to_string(&resume)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    redis::cmd("SET")
        .arg(REDIS_RESUME_KEY)
        .arg(&json_str)
        .query_async::<_, ()>(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json(resume))
}

// Admin: Contacts management
async fn admin_get_contacts(
    session: ReadableSession,
    Extension(state): Extension<AppState>,
) -> Result<Json<Vec<ContactRequest>>, StatusCode> {
    require_admin(session).await?;
    
    let mut conn = get_redis_conn(&state).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let data: Option<String> = redis::cmd("GET")
        .arg(REDIS_CONTACTS_KEY)
        .query_async(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let mut contacts: Vec<ContactRequest> = if let Some(json_str) = data {
        serde_json::from_str(&json_str).unwrap_or_else(|_| vec![])
    } else {
        vec![]
    };
    
    // Sort by created_at descending (newest first)
    contacts.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    
    Ok(Json(contacts))
}

// Admin: Mark contact as read
async fn admin_mark_contact_read(
    session: ReadableSession,
    Extension(state): Extension<AppState>,
    Query(params): Query<std::collections::HashMap<String, String>>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    require_admin(session).await?;
    
    let id = params.get("id").ok_or(StatusCode::BAD_REQUEST)?;
    
    let mut conn = get_redis_conn(&state).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let data: Option<String> = redis::cmd("GET")
        .arg(REDIS_CONTACTS_KEY)
        .query_async(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let mut contacts: Vec<ContactRequest> = if let Some(json_str) = data {
        serde_json::from_str(&json_str).unwrap_or_else(|_| vec![])
    } else {
        vec![]
    };
    
    // Find and mark as read
    if let Some(contact) = contacts.iter_mut().find(|c| &c.id == id) {
        contact.read = true;
    }
    
    let json_str = serde_json::to_string(&contacts)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    redis::cmd("SET")
        .arg(REDIS_CONTACTS_KEY)
        .arg(&json_str)
        .query_async::<_, ()>(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json(serde_json::json!({"success": true})))
}

// Admin: Delete contact
async fn admin_delete_contact(
    session: ReadableSession,
    Extension(state): Extension<AppState>,
    Query(params): Query<std::collections::HashMap<String, String>>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    require_admin(session).await?;
    
    let id = params.get("id").ok_or(StatusCode::BAD_REQUEST)?;
    
    let mut conn = get_redis_conn(&state).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let data: Option<String> = redis::cmd("GET")
        .arg(REDIS_CONTACTS_KEY)
        .query_async(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let mut contacts: Vec<ContactRequest> = if let Some(json_str) = data {
        serde_json::from_str(&json_str).unwrap_or_else(|_| vec![])
    } else {
        vec![]
    };
    
    // Remove the contact
    contacts.retain(|c| &c.id != id);
    
    let json_str = serde_json::to_string(&contacts)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    redis::cmd("SET")
        .arg(REDIS_CONTACTS_KEY)
        .arg(&json_str)
        .query_async::<_, ()>(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json(serde_json::json!({"success": true})))
}

// Admin: File upload for email attachments
async fn admin_upload_file(
    session: ReadableSession,
    mut multipart: Multipart,
) -> Result<Json<serde_json::Value>, StatusCode> {
    require_admin(session).await?;
    
    // Create uploads directory if it doesn't exist
    let upload_dir = PathBuf::from("uploads");
    if !upload_dir.exists() {
        std::fs::create_dir_all(&upload_dir).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    }
    
    while let Some(field) = multipart.next_field().await.map_err(|_| StatusCode::BAD_REQUEST)? {
        let file_name = field.file_name()
            .ok_or(StatusCode::BAD_REQUEST)?
            .to_string();
        
        let data = field.bytes().await.map_err(|_| StatusCode::BAD_REQUEST)?;
        
        // Generate unique filename
        let unique_name = format!("{}_{}", Uuid::new_v4(), file_name);
        let file_path = upload_dir.join(&unique_name);
        
        // Save file
        std::fs::write(&file_path, &data).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        
        // Return URL to access the file
        return Ok(Json(serde_json::json!({
            "success": true,
            "url": format!("/uploads/{}", unique_name),
            "filename": file_name
        })));
    }
    
    Err(StatusCode::BAD_REQUEST)
}

// Serve uploaded files
async fn serve_uploaded_file(
    Path(filename): Path<String>,
) -> Result<Response<Body>, StatusCode> {
    let file_path = PathBuf::from("uploads").join(&filename);
    
    if !file_path.exists() {
        return Err(StatusCode::NOT_FOUND);
    }
    
    let file_data = std::fs::read(&file_path).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    // Determine content type from extension
    let content_type = if filename.ends_with(".pdf") {
        "application/pdf"
    } else if filename.ends_with(".jpg") || filename.ends_with(".jpeg") {
        "image/jpeg"
    } else if filename.ends_with(".png") {
        "image/png"
    } else if filename.ends_with(".txt") {
        "text/plain"
    } else if filename.ends_with(".doc") || filename.ends_with(".docx") {
        "application/msword"
    } else {
        "application/octet-stream"
    };
    
    Ok(Response::builder()
        .status(StatusCode::OK)
        .header("Content-Type", content_type)
        .body(Body::from(file_data))
        .unwrap())
}

// Admin: Reply to contact
#[derive(Deserialize)]
struct EmailReplyRequest {
    contact_id: String,
    subject: String,
    message: String,
    attachments: Option<Vec<String>>, // File paths in uploads directory
}

async fn admin_reply_contact(
    session: ReadableSession,
    Extension(state): Extension<AppState>,
    Json(payload): Json<EmailReplyRequest>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    require_admin(session).await?;
    
    let mut conn = get_redis_conn(&state).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    // Get contact info
    let data: Option<String> = redis::cmd("GET")
        .arg(REDIS_CONTACTS_KEY)
        .query_async(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let contacts: Vec<ContactRequest> = if let Some(json_str) = data {
        serde_json::from_str(&json_str).unwrap_or_else(|_| vec![])
    } else {
        vec![]
    };
    
    let contact = contacts.iter().find(|c| c.id == payload.contact_id)
        .ok_or(StatusCode::NOT_FOUND)?;
    
    // Email configuration from env
    let smtp_host = env::var("SMTP_HOST").unwrap_or_else(|_| "mailserver".to_string());
    let smtp_port = env::var("SMTP_PORT").unwrap_or_else(|_| "587".to_string())
        .parse::<u16>().unwrap_or(587);
    let smtp_user = env::var("SMTP_USER").unwrap_or_else(|_| "noreply@example.com".to_string());
    let smtp_pass = env::var("SMTP_PASSWORD").unwrap_or_default();
    let mail_from = env::var("MAIL_FROM").unwrap_or_else(|_| "noreply@example.com".to_string());
    let base_url = env::var("BASE_URL").unwrap_or_else(|_| "http://localhost:3000".to_string());
    
    // Build email with proper From header including name
    let from_address = format!("Ertuğrul Özer <{}>", mail_from);
    
    // Check if message contains HTML tags
    let is_html = payload.message.contains("<") && payload.message.contains(">");
    
    // Extract attachment URLs from HTML href="/uploads/..." and convert relative URLs to absolute
    let mut extracted_attachments = Vec::new();
    let mut modified_message = payload.message.clone();
    
    if is_html {
        // Find all attachment link elements like <a href="/uploads/..." ...>📎 filename</a>
        let re = regex::Regex::new(r#"<a[^>]*href="(/uploads/[^"]+)"[^>]*>.*?</a>"#).unwrap();
        for cap in re.captures_iter(&payload.message) {
            if let Some(url_path) = cap.get(1) {
                let url_path_str = url_path.as_str();
                extracted_attachments.push(url_path_str.to_string());
            }
        }
        // Convert relative /uploads/ URLs to absolute URLs in the HTML
        modified_message = re.replace_all(&modified_message, |caps: &regex::Captures| {
            let relative_url = &caps[1];
            let absolute_url = format!("{}{}", base_url, relative_url);
            caps[0].replace(relative_url, &absolute_url)
        }).to_string();
    }
    
    // Combine extracted attachments with payload attachments
    let mut all_attachments = extracted_attachments;
    if let Some(payload_attachments) = &payload.attachments {
        all_attachments.extend(payload_attachments.clone());
    }
    
    // Build multipart with content
    let mut multipart_content = if is_html {
        MultiPart::alternative()
            .singlepart(
                SinglePart::builder()
                    .header(header::ContentType::TEXT_PLAIN)
                    .body(strip_html_tags(&modified_message))
            )
            .singlepart(
                SinglePart::builder()
                    .header(header::ContentType::TEXT_HTML)
                    .body(format!(
                        r#"<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; }}
        a {{ color: #2563eb; text-decoration: underline; }}
    </style>
</head>
<body>
    {}
</body>
</html>"#,
                        modified_message
                    ))
            )
    } else {
        MultiPart::alternative()
            .singlepart(
                SinglePart::builder()
                    .header(header::ContentType::TEXT_PLAIN)
                    .body(modified_message.clone())
            )
            .singlepart(
                SinglePart::builder()
                    .header(header::ContentType::TEXT_HTML)
                    .body(format!(
                        "<html><body><p>{}</p></body></html>",
                        modified_message.replace("\n", "<br>")
                    ))
            )
    };
    
    // Build email - with or without attachments
    let mut email_builder = Message::builder()
        .from(from_address.parse().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?)
        .reply_to(mail_from.parse().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?)
        .to(contact.email.parse().map_err(|_| StatusCode::BAD_REQUEST)?)
        .subject(&payload.subject);
    
    let email = if !all_attachments.is_empty() {
            // With attachments - use mixed multipart
            let mut mixed = MultiPart::mixed()
                .multipart(multipart_content);
            
            // Add each attachment
            for url in &all_attachments {
                // Extract filename from URL (/uploads/uuid_filename.ext)
                if let Some(filename) = url.strip_prefix("/uploads/") {
                    let file_path = PathBuf::from("uploads").join(filename);
                    if file_path.exists() {
                        if let Ok(file_data) = std::fs::read(&file_path) {
                            // Get original filename (after uuid_)
                            let original_name = filename.split('_').skip(1).collect::<Vec<_>>().join("_");
                            
                            // Determine content type from extension
                            let content_type = if original_name.ends_with(".pdf") {
                                header::ContentType::parse("application/pdf").unwrap()
                            } else if original_name.ends_with(".jpg") || original_name.ends_with(".jpeg") {
                                header::ContentType::parse("image/jpeg").unwrap()
                            } else if original_name.ends_with(".png") {
                                header::ContentType::parse("image/png").unwrap()
                            } else if original_name.ends_with(".txt") {
                                header::ContentType::parse("text/plain").unwrap()
                            } else if original_name.ends_with(".doc") || original_name.ends_with(".docx") {
                                header::ContentType::parse("application/msword").unwrap()
                            } else {
                                header::ContentType::parse("application/octet-stream").unwrap()
                            };
                            
                            mixed = mixed.singlepart(
                                Attachment::new(original_name)
                                    .body(file_data, content_type)
                            );
                        }
                    }
                }
            }
            
            email_builder
                .multipart(mixed)
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        } else {
            // No attachments
            email_builder
                .multipart(multipart_content)
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        };
    
    // Send email with or without authentication
    let mailer = if smtp_pass.is_empty() {
        // No authentication (for local mail servers like Postfix)
        SmtpTransport::relay(&smtp_host)
            .map_err(|e| {
                eprintln!("SMTP relay error: {:?}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?
            .port(smtp_port)
            .build()
    } else {
        // With authentication (for external SMTP like Gmail)
        let creds = Credentials::new(smtp_user.clone(), smtp_pass);
        SmtpTransport::starttls_relay(&smtp_host)
            .map_err(|e| {
                eprintln!("SMTP starttls_relay error: {:?}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?
            .port(smtp_port)
            .credentials(creds)
            .build()
    };
    
    mailer.send(&email).map_err(|e| {
        eprintln!("Email send error: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;
    
    Ok(Json(serde_json::json!({
        "success": true,
        "message": "Email sent successfully"
    })))
}

// Admin: Fetch inbox emails  
async fn admin_fetch_inbox(
    session: ReadableSession,
    Extension(state): Extension<AppState>,
) -> Result<Json<Vec<InboxEmail>>, StatusCode> {
    require_admin(session).await?;
    
    // For Gmail with CGNAT, we recommend:
    // 1. Set up email forwarding in Gmail to send to your contact form
    // 2. Or use Gmail's "Fetch mail" feature to import from another account
    // 3. All emails will appear in the contacts list automatically
    
    // This endpoint returns empty for now since we're using the contact form
    // as the primary entry point for all messages (including forwarded emails)
    let emails: Vec<InboxEmail> = vec![];
    
    Ok(Json(emails))
}

// Admin: Password management
async fn admin_get_password_info(
    session: ReadableSession,
) -> Result<Json<serde_json::Value>, StatusCode> {
    require_admin(session).await?;
    
    // Password hash'i göster ama şifrenin kendisini değil
    Ok(Json(serde_json::json!({
        "has_password": true,
        "message": "Şifre tanımlı. Değiştirmek için yeni şifre girin."
    })))
}

async fn admin_change_password(
    session: ReadableSession,
    Extension(state): Extension<AppState>,
    Json(payload): Json<ChangePasswordRequest>,
) -> Result<Json<PasswordResponse>, StatusCode> {
    require_admin(session).await?;
    
    // Eski şifreyi kontrol et
    let current_hash = get_admin_password_hash(&state).await?;
    match bcrypt::verify(&payload.old_password, &current_hash) {
        Ok(true) => {}
        _ => {
            return Ok(Json(PasswordResponse {
                success: false,
                message: "Eski şifre hatalı".to_string(),
            }));
        }
    }
    
    // Yeni şifre hash'le
    let new_hash = bcrypt::hash(&payload.new_password, bcrypt::DEFAULT_COST)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    // Redis'e kaydet
    set_admin_password_hash(&state, &new_hash).await?;
    
    Ok(Json(PasswordResponse {
        success: true,
        message: "Şifre başarıyla değiştirildi".to_string(),
    }))
}

// Admin: Translations management
async fn admin_get_translations(
    session: ReadableSession,
    Extension(state): Extension<AppState>,
) -> Result<Json<Translations>, StatusCode> {
    require_admin(session).await?;
    
    let mut conn = get_redis_conn(&state).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let data: Option<String> = redis::cmd("GET")
        .arg(REDIS_TRANSLATIONS_KEY)
        .query_async(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    if let Some(json_str) = data {
        let translations: Translations = serde_json::from_str(&json_str)
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        Ok(Json(translations))
    } else {
        // Default translations (frontend'den alınacak)
        Ok(Json(Translations {
            tr: serde_json::json!({}),
            en: serde_json::json!({}),
        }))
    }
}

async fn admin_update_translations(
    session: ReadableSession,
    Extension(state): Extension<AppState>,
    Json(translations): Json<Translations>,
) -> Result<Json<Translations>, StatusCode> {
    require_admin(session).await?;
    
    let mut conn = get_redis_conn(&state).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let json_str = serde_json::to_string(&translations)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    redis::cmd("SET")
        .arg(REDIS_TRANSLATIONS_KEY)
        .arg(&json_str)
        .query_async::<_, ()>(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json(translations))
}

async fn admin_get_footer(
    session: ReadableSession,
    Extension(state): Extension<AppState>,
) -> Result<Json<Footer>, StatusCode> {
    require_admin(session).await?;
    get_footer(Extension(state)).await
}

async fn admin_update_footer(
    session: ReadableSession,
    Extension(state): Extension<AppState>,
    Json(footer): Json<Footer>,
) -> Result<Json<Footer>, StatusCode> {
    require_admin(session).await?;
    
    let mut conn = get_redis_conn(&state).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let json_str = serde_json::to_string(&footer)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    redis::cmd("SET")
        .arg(REDIS_FOOTER_KEY)
        .arg(&json_str)
        .query_async::<_, ()>(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json(footer))
}

async fn admin_get_features(
    session: ReadableSession,
    Extension(state): Extension<AppState>,
) -> Result<Json<Features>, StatusCode> {
    require_admin(session).await?;
    get_features(Extension(state)).await
}

async fn admin_get_hero(
    session: ReadableSession,
    Extension(state): Extension<AppState>,
) -> Result<Json<HeroSection>, StatusCode> {
    require_admin(session).await?;
    get_hero(Extension(state)).await
}

async fn admin_update_features(
    session: ReadableSession,
    Extension(state): Extension<AppState>,
    Json(features): Json<Features>,
) -> Result<Json<Features>, StatusCode> {
    require_admin(session).await?;
    
    let mut conn = get_redis_conn(&state).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let json_str = serde_json::to_string(&features)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    redis::cmd("SET")
        .arg(REDIS_FEATURES_KEY)
        .arg(&json_str)
        .query_async::<_, ()>(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json(features))
}

async fn admin_update_hero(
    session: ReadableSession,
    Extension(state): Extension<AppState>,
    Json(hero): Json<HeroSection>,
) -> Result<Json<HeroSection>, StatusCode> {
    require_admin(session).await?;
    
    let mut conn = get_redis_conn(&state).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let json_str = serde_json::to_string(&hero)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    redis::cmd("SET")
        .arg(REDIS_HERO_KEY)
        .arg(&json_str)
        .query_async::<_, ()>(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json(hero))
}

// Visitor logging middleware
async fn log_visitor(
    axum::extract::ConnectInfo(addr): axum::extract::ConnectInfo<std::net::SocketAddr>,
    axum::extract::State(state): axum::extract::State<AppState>,
    req: axum::http::Request<axum::body::Body>,
    next: axum::middleware::Next<axum::body::Body>,
) -> axum::response::Response {
    let method = req.method().to_string();
    let path = req.uri().path().to_string();
    let user_agent = req.headers()
        .get("user-agent")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());
    let referer = req.headers()
        .get("referer")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    // Execute the request
    let mut response = next.run(req).await;

    // Add backend server identifier header
    let hostname = std::env::var("HOSTNAME")
        .or_else(|_| std::env::var("CONTAINER_NAME"))
        .unwrap_or_else(|_| "backend-unknown".to_string());
    
    if let Ok(value) = axum::http::HeaderValue::from_str(&hostname) {
        response.headers_mut().insert("X-Backend-Server", value);
    }

    // Log to Redis (fire and forget)
    let ip = addr.ip().to_string();
    let timestamp = chrono::Utc::now().to_rfc3339();
    
    tokio::spawn(async move {
        if let Ok(mut conn) = get_redis_conn(&state).await {
            let log = VisitorLog {
                id: uuid::Uuid::new_v4().to_string(),
                ip,
                user_agent,
                path,
                method,
                timestamp,
                referer,
            };

            // Get existing logs
            let data: Option<String> = redis::cmd("GET")
                .arg(REDIS_VISITOR_LOGS_KEY)
                .query_async(&mut conn)
                .await
                .ok()
                .flatten();

            let mut logs: Vec<VisitorLog> = data
                .and_then(|s| serde_json::from_str(&s).ok())
                .unwrap_or_else(|| vec![]);

            // Add new log
            logs.push(log);

            // Keep only last 500 logs
            if logs.len() > 500 {
                logs.drain(0..logs.len() - 500);
            }

            // Save back to Redis
            if let Ok(json_str) = serde_json::to_string(&logs) {
                let _: Result<(), _> = redis::cmd("SET")
                    .arg(REDIS_VISITOR_LOGS_KEY)
                    .arg(&json_str)
                    .query_async(&mut conn)
                    .await;
            }
        }
    });

    response
}

async fn rate_limit_sensitive_routes(
    axum::extract::ConnectInfo(addr): axum::extract::ConnectInfo<std::net::SocketAddr>,
    axum::extract::State(state): axum::extract::State<AppState>,
    req: axum::http::Request<axum::body::Body>,
    next: axum::middleware::Next<axum::body::Body>,
) -> axum::response::Response {
    let method = req.method().clone();
    let path = req.uri().path().to_string();
    let client_ip = extract_client_ip(&req, addr);

    let policy = match (method.as_str(), path.as_str()) {
        ("POST", "/api/contact") => Some((
            "contact",
            CONTACT_RATE_LIMIT_MAX,
            CONTACT_RATE_LIMIT_WINDOW_SECS,
            "Çok fazla iletişim isteği gönderildi. Lütfen birkaç dakika sonra tekrar deneyin.",
        )),
        ("POST", "/api/admin/login") => Some((
            "admin_login",
            ADMIN_LOGIN_RATE_LIMIT_MAX,
            ADMIN_LOGIN_RATE_LIMIT_WINDOW_SECS,
            "Çok fazla giriş denemesi yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.",
        )),
        _ => None,
    };

    if let Some((bucket, max_requests, window_secs, message)) = policy {
        match check_rate_limit(&state, bucket, &client_ip, max_requests, window_secs).await {
            Ok(true) => {
                return (
                    StatusCode::TOO_MANY_REQUESTS,
                    Json(serde_json::json!({
                        "success": false,
                        "message": message,
                    })),
                )
                    .into_response();
            }
            Ok(false) => {}
            Err(status) => return status.into_response(),
        }
    }

    next.run(req).await
}

#[tokio::main]
async fn main() -> Result<()> {
    // Tracing setup
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .init();

    // Redis URL'i environment variable'dan al
    let redis_url = env::var("REDIS_URL")
        .unwrap_or_else(|_| "redis://redis:6379".to_string());
    
    // Redis bağlantısını retry ile dene
    let mut redis_client = None;
    let mut retries = 10;
    while redis_client.is_none() && retries > 0 {
        match RedisClient::open(redis_url.clone()) {
            Ok(client) => {
                // Bağlantıyı test et
                match client.get_multiplexed_async_connection().await {
                    Ok(_) => {
                        redis_client = Some(Arc::new(client));
                        tracing::info!("✅ Redis bağlantısı başarılı");
                        break;
                    }
                    Err(e) => {
                        tracing::warn!("Redis bağlantı hatası ({} deneme kaldı): {}", retries, e);
                        retries -= 1;
                        if retries > 0 {
                            tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
                        }
                    }
                }
            }
            Err(e) => {
                tracing::warn!("Redis client oluşturma hatası ({} deneme kaldı): {}", retries, e);
                retries -= 1;
                if retries > 0 {
                    tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
                }
            }
        }
    }
    
    let redis_client = redis_client.ok_or_else(|| anyhow::anyhow!("Redis bağlantısı kurulamadı"))?;
    
    // Session store'u oluştur
    let mut session_store = None;
    retries = 10;
    while session_store.is_none() && retries > 0 {
        match RedisSessionStore::new(redis_url.clone()) {
            Ok(store) => {
                session_store = Some(store);
                tracing::info!("✅ Redis session store başarılı");
                break;
            }
            Err(e) => {
                tracing::warn!("Redis session store hatası ({} deneme kaldı): {}", retries, e);
                retries -= 1;
                if retries > 0 {
                    tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
                }
            }
        }
    }
    
    let session_store = session_store.ok_or_else(|| anyhow::anyhow!("Redis session store oluşturulamadı"))?;

    let app_state = AppState {
        redis_client: redis_client.clone(),
    };

    // İlk çalıştırmada admin şifresi yoksa env üzerinden oluştur
    {
        let mut conn = app_state.redis_client.get_multiplexed_async_connection().await?;
        let existing_hash: Option<String> = redis::cmd("GET")
            .arg(REDIS_ADMIN_PASSWORD_KEY)
            .query_async(&mut conn)
            .await?;
        
        if existing_hash.is_none() {
            tracing::warn!("🔐 Admin şifresi bulunamadı, env ayarından oluşturuluyor...");
            let hash = if let Ok(hash_from_env) = env::var("ADMIN_PASSWORD_HASH") {
                if hash_from_env.starts_with("$2") {
                    hash_from_env
                } else {
                    return Err(anyhow::anyhow!("ADMIN_PASSWORD_HASH geçerli bcrypt hash olmalı"));
                }
            } else {
                let admin_password = env::var("ADMIN_PASSWORD")
                    .map_err(|_| anyhow::anyhow!("İlk kurulum için ADMIN_PASSWORD veya ADMIN_PASSWORD_HASH gerekli"))?;
                if admin_password.trim().len() < 12 {
                    return Err(anyhow::anyhow!("ADMIN_PASSWORD en az 12 karakter olmalı"));
                }
                bcrypt::hash(admin_password, bcrypt::DEFAULT_COST)
                    .map_err(|e| anyhow::anyhow!("Bcrypt hash error: {}", e))?
            };

            redis::cmd("SET")
                .arg(REDIS_ADMIN_PASSWORD_KEY)
                .arg(&hash)
                .query_async::<_, ()>(&mut conn)
                .await?;
            tracing::info!("✅ Admin şifresi env üzerinden oluşturuldu");
        }
    }

    let session_secret = env::var("SESSION_SECRET")
        .map_err(|_| anyhow::anyhow!("SESSION_SECRET gerekli"))?;
    if session_secret.len() < 64 {
        return Err(anyhow::anyhow!("SESSION_SECRET en az 64 karakter olmalı"));
    }

    let session_layer = SessionLayer::new(session_store, session_secret.as_bytes())
        .with_secure(true)
        .with_cookie_name("session_id");

    let cors = CorsLayer::new()
        .allow_origin(tower_http::cors::Any)
        .allow_methods(tower_http::cors::Any)
        .allow_headers(tower_http::cors::Any);

    let app = Router::new()
        // Public routes
        .route("/health", get(health_check))
        .route("/api/portfolio", get(get_portfolio))
        .route("/api/about", get(get_about))
        .route("/api/resume", get(get_resume))
        .route("/api/contact", post(contact))
        .route("/api/translations", get(get_translations))
        .route("/api/footer", get(get_footer))
        .route("/api/features", get(get_features))
        .route("/api/hero", get(get_hero))
        // Admin routes
        .route("/api/admin/login", post(admin_login))
        .route("/api/admin/logout", post(admin_logout))
        .route("/api/admin/portfolio", get(admin_get_portfolio))
        .route("/api/admin/portfolio", post(admin_create_portfolio))
        .route("/api/admin/portfolio", put(admin_update_portfolio))
        .route("/api/admin/portfolio", delete(admin_delete_portfolio))
        .route("/api/admin/about", put(admin_update_about))
        .route("/api/admin/resume", get(admin_get_resume))
        .route("/api/admin/resume", put(admin_update_resume))
        .route("/api/admin/contacts", get(admin_get_contacts))
        .route("/api/admin/contacts/inbox", get(admin_fetch_inbox))
        .route("/api/admin/contacts/read", put(admin_mark_contact_read))
        .route("/api/admin/contacts/delete", delete(admin_delete_contact))
        .route("/api/admin/contacts/reply", post(admin_reply_contact))
        .route("/api/admin/password", get(admin_get_password_info))
        .route("/api/admin/password", put(admin_change_password))
        .route("/api/admin/translations", get(admin_get_translations))
        .route("/api/admin/translations", put(admin_update_translations))
        .route("/api/admin/footer", get(admin_get_footer))
        .route("/api/admin/footer", put(admin_update_footer))
        .route("/api/admin/features", get(admin_get_features))
        .route("/api/admin/features", put(admin_update_features))
        .route("/api/admin/hero", get(admin_get_hero))
        .route("/api/admin/hero", put(admin_update_hero))
        .route("/api/admin/logs", get(admin_get_logs))
        .route("/api/admin/backups", get(admin_list_backups))
        .route("/api/admin/backups", post(admin_create_backup))
        .route("/api/admin/backups/restore", post(admin_restore_backup))
        .route("/api/admin/backups/rename", post(admin_rename_backup))
        .route("/api/admin/backups/:filename", delete(admin_delete_backup))
        .route("/api/admin/upload", post(admin_upload_file))
        .route("/uploads/:filename", get(serve_uploaded_file))
        .layer(cors)
        .layer(axum::middleware::from_fn_with_state(
            app_state.clone(),
            rate_limit_sensitive_routes
        ))
        .layer(axum::middleware::from_fn_with_state(
            app_state.clone(),
            log_visitor
        ))
        .layer(Extension(app_state))
        .layer(session_layer);

    let port = env::var("PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse::<u16>()
        .unwrap_or(8080);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    
    tracing::info!("🚀 Backend server listening on http://{}", addr);
    tracing::info!("📊 Health check: http://{}/health", addr);
    tracing::info!("🔐 Admin panel: http://{}/api/admin/login", addr);

    axum::Server::bind(&addr)
        .serve(app.into_make_service_with_connect_info::<std::net::SocketAddr>())
        .await?;

    Ok(())
}

// ==================== LOGS & BACKUPS ENDPOINTS ====================

// Get visitor logs
async fn admin_get_logs(
    session: ReadableSession,
    Extension(state): Extension<AppState>,
) -> Result<Json<Vec<VisitorLog>>, StatusCode> {
    if !is_admin(session).await {
        return Err(StatusCode::UNAUTHORIZED);
    }

    let mut conn = get_redis_conn(&state).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let data: Option<String> = redis::cmd("GET")
        .arg(REDIS_VISITOR_LOGS_KEY)
        .query_async(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    if let Some(json_str) = data {
        let mut logs: Vec<VisitorLog> = serde_json::from_str(&json_str)
            .unwrap_or_else(|_| vec![]);
        
        // Sort by timestamp, newest first
        logs.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
        
        // Return last 100 logs
        logs.truncate(100);
        
        Ok(Json(logs))
    } else {
        Ok(Json(vec![]))
    }
}

// List backups
async fn admin_list_backups(
    session: ReadableSession,
) -> Result<Json<Vec<BackupInfo>>, StatusCode> {
    if !is_admin(session).await {
        return Err(StatusCode::UNAUTHORIZED);
    }

    use std::fs;
    use std::path::Path;

    let backup_dir = "/data/backups";
    
    // Create backup directory if not exists
    if let Err(_) = fs::create_dir_all(backup_dir) {
        return Ok(Json(vec![]));
    }

    let mut backups = vec![];
    
    tracing::info!("🔍 Listing backups from: {}", backup_dir);
    
    if let Ok(entries) = fs::read_dir(backup_dir) {
        for entry in entries.flatten() {
            tracing::info!("📁 Found entry: {:?}", entry.path());
            if let Ok(metadata) = entry.metadata() {
                tracing::info!("  - Is file: {}", metadata.is_file());
                if metadata.is_file() {
                    if let Some(filename) = entry.file_name().to_str() {
                        tracing::info!("  - Filename: {}", filename);
                        if filename.ends_with(".json") {
                            tracing::info!("  - ✅ Valid JSON backup: {}", filename);
                            
                            // Detect backup type by reading file
                            let backup_type = if let Ok(content) = fs::read_to_string(entry.path()) {
                                if content.contains("\"postgres_data\"") && content.contains("\"redis_data\"") {
                                    "full".to_string()
                                } else if content.contains("\"portfolio_items\"") {
                                    "postgresql".to_string()
                                } else {
                                    "redis".to_string()
                                }
                            } else {
                                "unknown".to_string()
                            };
                            
                            let created_at = metadata.modified()
                                .ok()
                                .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                                .map(|d| chrono::DateTime::from_timestamp(d.as_secs() as i64, 0))
                                .flatten()
                                .map(|dt| dt.to_rfc3339())
                                .unwrap_or_else(|| chrono::Utc::now().to_rfc3339());

                            backups.push(BackupInfo {
                                filename: filename.to_string(),
                                size: metadata.len(),
                                created_at,
                                backup_type,
                            });
                        }
                    }
                }
            }
        }
    }
    
    tracing::info!("📊 Total backups found: {}", backups.len());

    // Sort by created_at, newest first
    backups.sort_by(|a, b| b.created_at.cmp(&a.created_at));

    Ok(Json(backups))
}

// Create backup (BOTH Redis Sessions + PostgreSQL Data)
async fn admin_create_backup(
    session: ReadableSession,
    Extension(state): Extension<AppState>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    if !is_admin(session).await {
        return Err(StatusCode::UNAUTHORIZED);
    }

    use std::fs;
    use std::path::Path;

    tracing::info!("🔄 Starting FULL backup (Redis + PostgreSQL)...");

    let backup_dir = "/data/backups";
    fs::create_dir_all(backup_dir).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S");
    let backup_filename = format!("backup_{}.json", timestamp);
    let backup_path = Path::new(backup_dir).join(&backup_filename);

    // 1. Export Redis sessions
    let mut redis_conn = get_redis_conn(&state).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let keys: Vec<String> = redis::cmd("KEYS")
        .arg("axum.sid:*") // Only backup session keys
        .query_async(&mut redis_conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let mut redis_data = serde_json::Map::new();
    
    for key in keys {
        let value: Option<String> = redis::cmd("GET")
            .arg(&key)
            .query_async(&mut redis_conn)
            .await
            .ok()
            .flatten();
        
        if let Some(v) = value {
            redis_data.insert(key, serde_json::Value::String(v));
        }
    }

    tracing::info!("✅ Redis sessions backed up: {} keys", redis_data.len());

    // 1b. Export Redis application data keys
    let mut redis_app_data = serde_json::Map::new();
    for key in REDIS_APP_BACKUP_KEYS {
        let value: Option<String> = redis::cmd("GET")
            .arg(key)
            .query_async(&mut redis_conn)
            .await
            .ok()
            .flatten();

        if let Some(v) = value {
            redis_app_data.insert(key.to_string(), serde_json::Value::String(v));
        }
    }

    tracing::info!("✅ Redis app data backed up: {} keys", redis_app_data.len());

    // 2. Export ALL PostgreSQL data
    let db_url = env::var("DATABASE_URL").unwrap_or_else(|_| 
        "postgres://portfolio_user:portfolio_pass@postgres:5432/portfolio_db".to_string()
    );
    
    let pool = sqlx::PgPool::connect(&db_url)
        .await
        .map_err(|e| {
            tracing::error!("❌ PostgreSQL connection failed: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    // Export all tables
    let portfolio_items: Vec<serde_json::Value> = sqlx::query_as::<_, (serde_json::Value,)>(
        "SELECT row_to_json(portfolio_items.*) FROM portfolio_items ORDER BY display_order"
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| {
        tracing::error!("❌ Failed to export portfolio_items: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?
    .into_iter()
    .map(|(json,)| json)
    .collect();

    let about_info: Option<serde_json::Value> = sqlx::query_as::<_, (serde_json::Value,)>(
        "SELECT row_to_json(about_info.*) FROM about_info LIMIT 1"
    )
    .fetch_optional(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .map(|(json,)| json);

    let resume_data: Option<serde_json::Value> = sqlx::query_as::<_, (serde_json::Value,)>(
        "SELECT row_to_json(resume_data.*) FROM resume_data LIMIT 1"
    )
    .fetch_optional(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .map(|(json,)| json);

    let contact_messages: Vec<serde_json::Value> = sqlx::query_as::<_, (serde_json::Value,)>(
        "SELECT row_to_json(contact_messages.*) FROM contact_messages ORDER BY created_at DESC"
    )
    .fetch_all(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .into_iter()
    .map(|(json,)| json)
    .collect();

    let translations: Option<serde_json::Value> = sqlx::query_as::<_, (serde_json::Value,)>(
        "SELECT row_to_json(translations.*) FROM translations LIMIT 1"
    )
    .fetch_optional(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .map(|(json,)| json);

    let footer_settings: Option<serde_json::Value> = sqlx::query_as::<_, (serde_json::Value,)>(
        "SELECT row_to_json(footer_settings.*) FROM footer_settings LIMIT 1"
    )
    .fetch_optional(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .map(|(json,)| json);

    let features: Option<serde_json::Value> = sqlx::query_as::<_, (serde_json::Value,)>(
        "SELECT row_to_json(features_settings.*) FROM features_settings LIMIT 1"
    )
    .fetch_optional(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .map(|(json,)| json);

    let hero_section: Option<serde_json::Value> = sqlx::query_as::<_, (serde_json::Value,)>(
        "SELECT row_to_json(hero_section.*) FROM hero_section LIMIT 1"
    )
    .fetch_optional(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .map(|(json,)| json);

    let admin_users: Vec<serde_json::Value> = sqlx::query_as::<_, (serde_json::Value,)>(
        "SELECT row_to_json(admin_users.*) FROM admin_users"
    )
    .fetch_all(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .into_iter()
    .map(|(json,)| json)
    .collect();

    let visitor_logs: Vec<serde_json::Value> = sqlx::query_as::<_, (serde_json::Value,)>(
        "SELECT row_to_json(visitor_logs.*) FROM visitor_logs ORDER BY created_at DESC LIMIT 1000"
    )
    .fetch_all(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .into_iter()
    .map(|(json,)| json)
    .collect();

    pool.close().await;

    tracing::info!("✅ PostgreSQL data exported:");
    tracing::info!("  - Portfolio Items: {}", portfolio_items.len());
    tracing::info!("  - Contact Messages: {}", contact_messages.len());
    tracing::info!("  - Admin Users: {}", admin_users.len());
    tracing::info!("  - Visitor Logs: {}", visitor_logs.len());

    // 3. Create full backup structure
    let full_backup = FullBackup {
        redis_data,
        redis_app_data,
        postgres_data: PostgresBackupData {
            portfolio_items,
            about_info,
            resume_data,
            contact_messages,
            translations,
            footer_settings,
            features,
            hero_section,
            admin_users,
            visitor_logs,
        },
        metadata: BackupMetadata {
            created_at: chrono::Utc::now().to_rfc3339(),
            version: "1.1".to_string(),
            backup_type: "full".to_string(),
        },
    };

    let json_str = serde_json::to_string_pretty(&full_backup)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    fs::write(&backup_path, json_str)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    tracing::info!("✅ Full backup created: {}", backup_filename);

    Ok(Json(serde_json::json!({
        "success": true,
        "filename": backup_filename,
        "type": "full"
    })))
}

// Restore backup (BOTH Redis Sessions + PostgreSQL Data)
async fn admin_restore_backup(
    session: ReadableSession,
    Extension(state): Extension<AppState>,
    Json(payload): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    if !is_admin(session).await {
        tracing::warn!("⚠️ Unauthorized restore attempt");
        return Err(StatusCode::UNAUTHORIZED);
    }

    use std::fs;
    use std::path::Path;

    let filename = payload.get("filename")
        .and_then(|v| v.as_str())
        .ok_or(StatusCode::BAD_REQUEST)?;

    if !is_safe_backup_filename(filename) {
        return Err(StatusCode::BAD_REQUEST);
    }

    tracing::info!("🔄 Restoring FULL backup: {}", filename);

    let backup_dir = "/data/backups";
    let backup_path = Path::new(backup_dir).join(filename);

    if !backup_path.exists() {
        tracing::error!("❌ Backup file not found: {:?}", backup_path);
        return Err(StatusCode::NOT_FOUND);
    }

    tracing::info!("📂 Reading backup file...");
    let json_str = fs::read_to_string(&backup_path)
        .map_err(|e| {
            tracing::error!("❌ Failed to read backup file: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;
    
    tracing::info!("🔍 Parsing backup ({} bytes)...", json_str.len());
    let full_backup: FullBackup = serde_json::from_str(&json_str)
        .map_err(|e| {
            tracing::error!("❌ Failed to parse backup: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    let FullBackup {
        redis_data,
        redis_app_data,
        postgres_data: pg_data,
        metadata: _,
    } = full_backup;

    // 1. Restore Redis sessions
    tracing::info!("🗑️ Flushing Redis sessions...");
    let mut redis_conn = get_redis_conn(&state).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    // Delete only session keys
    let session_keys: Vec<String> = redis::cmd("KEYS")
        .arg("axum.sid:*")
        .query_async(&mut redis_conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    for key in session_keys {
        let _: () = redis::cmd("DEL")
            .arg(&key)
            .query_async(&mut redis_conn)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    }

    tracing::info!("💾 Restoring {} Redis sessions...", redis_data.len());
    let mut restored_redis = 0;
    for (key, value) in &redis_data {
        if !key.starts_with("axum.sid:") {
            continue;
        }

        if let Some(v) = value.as_str() {
            let _: () = redis::cmd("SET")
                .arg(key)
                .arg(v)
                .query_async(&mut redis_conn)
                .await
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
            restored_redis += 1;
        }
    }

    tracing::info!("✅ Redis restored: {} sessions", restored_redis);

    let mut effective_redis_app_data = redis_app_data;
    if effective_redis_app_data.is_empty() {
        for key in REDIS_APP_BACKUP_KEYS {
            if let Some(value) = redis_data.get(key) {
                effective_redis_app_data.insert(key.to_string(), value.clone());
            }
        }
    }

    for key in REDIS_APP_BACKUP_KEYS {
        let _: () = redis::cmd("DEL")
            .arg(key)
            .query_async(&mut redis_conn)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    }

    let mut restored_redis_app = 0;
    for (key, value) in &effective_redis_app_data {
        if let Some(v) = value.as_str() {
            let _: () = redis::cmd("SET")
                .arg(key)
                .arg(v)
                .query_async(&mut redis_conn)
                .await
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
            restored_redis_app += 1;
        }
    }
    tracing::info!("✅ Redis app data restored: {} keys", restored_redis_app);

    // 2. Restore PostgreSQL data
    let db_url = env::var("DATABASE_URL").unwrap_or_else(|_| 
        "postgres://portfolio_user:portfolio_pass@postgres:5432/portfolio_db".to_string()
    );
    
    let pool = sqlx::PgPool::connect(&db_url)
        .await
        .map_err(|e| {
            tracing::error!("❌ PostgreSQL connection failed: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    let mut tx = pool.begin().await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    tracing::info!("🗑️ Clearing PostgreSQL tables...");
    
    // Clear all tables (except admin_users for safety)
    sqlx::query("DELETE FROM portfolio_items")
        .execute(&mut *tx)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    sqlx::query("DELETE FROM contact_messages")
        .execute(&mut *tx)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    sqlx::query("DELETE FROM visitor_logs")
        .execute(&mut *tx)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    tracing::info!("💾 Restoring PostgreSQL data...");
    let portfolio_count = pg_data.portfolio_items.len();
    let contact_count = pg_data.contact_messages.len();

    // Restore portfolio items
    for item in &pg_data.portfolio_items {
        sqlx::query(
            "INSERT INTO portfolio_items (id, title, description, technologies, image_url, github_url, live_url, huggingface_url, display_order, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)"
        )
        .bind(item.get("id").and_then(|v| v.as_str()))
        .bind(item.get("title").and_then(|v| v.as_str()))
        .bind(item.get("description").and_then(|v| v.as_str()))
        .bind(item.get("technologies").and_then(|v| v.as_array()).map(|arr| {
            arr.iter().filter_map(|v| v.as_str()).map(String::from).collect::<Vec<_>>()
        }))
        .bind(item.get("image_url").and_then(|v| v.as_str()))
        .bind(item.get("github_url").and_then(|v| v.as_str()))
        .bind(item.get("live_url").and_then(|v| v.as_str()))
        .bind(item.get("huggingface_url").and_then(|v| v.as_str()))
        .bind(item.get("display_order").or(item.get("order")).and_then(|v| v.as_i64()).map(|n| n as i32))
        .bind(item.get("created_at").and_then(|v| v.as_str()))
        .bind(item.get("updated_at").and_then(|v| v.as_str()))
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            tracing::error!("❌ Failed to restore portfolio item: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;
    }

    // Restore about_info
    if let Some(about) = pg_data.about_info {
        sqlx::query("DELETE FROM about_info")
            .execute(&mut *tx)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        sqlx::query(
            "INSERT INTO about_info (id, name, title, bio, skills, email, github, linkedin, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)"
        )
        .bind(about.get("id").and_then(|v| v.as_str()))
        .bind(about.get("name").and_then(|v| v.as_str()))
        .bind(about.get("title").and_then(|v| v.as_str()))
        .bind(about.get("bio").and_then(|v| v.as_str()))
        .bind(about.get("skills").and_then(|v| v.as_array()).map(|arr| {
            arr.iter().filter_map(|v| v.as_str()).map(String::from).collect::<Vec<_>>()
        }))
        .bind(about.get("email").and_then(|v| v.as_str()))
        .bind(about.get("github").and_then(|v| v.as_str()))
        .bind(about.get("linkedin").and_then(|v| v.as_str()))
        .bind(about.get("created_at").and_then(|v| v.as_str()))
        .bind(about.get("updated_at").and_then(|v| v.as_str()))
        .execute(&mut *tx)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    }

    // Restore resume_data
    if let Some(resume) = pg_data.resume_data {
        sqlx::query("DELETE FROM resume_data")
            .execute(&mut *tx)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        sqlx::query(
            "INSERT INTO resume_data (
                id, personal_info, section_order, summary, summary_enabled,
                skills, skills_enabled, soft_skills, soft_skills_enabled,
                education, education_enabled, experience, experience_enabled,
                projects, projects_enabled, languages, languages_enabled,
                certifications, certifications_enabled, awards, awards_enabled,
                publications, publications_enabled, volunteer, volunteer_enabled,
                interests, interests_enabled, resume_references, references_enabled,
                created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9,
                $10, $11, $12, $13,
                $14, $15, $16, $17,
                $18, $19, $20, $21,
                $22, $23, $24, $25,
                $26, $27, $28, $29,
                $30, $31
            )"
        )
        .bind(resume.get("id").and_then(|v| v.as_str()))
        .bind(resume.get("personal_info").cloned().unwrap_or_else(|| serde_json::json!({})))
        .bind(resume.get("section_order").cloned().unwrap_or_else(|| serde_json::json!([])))
        .bind(resume.get("summary").and_then(|v| v.as_str()))
        .bind(resume.get("summary_enabled").and_then(|v| v.as_bool()).unwrap_or(false))
        .bind(resume.get("skills").cloned().unwrap_or_else(|| serde_json::json!([])))
        .bind(resume.get("skills_enabled").and_then(|v| v.as_bool()).unwrap_or(true))
        .bind(resume.get("soft_skills").cloned().unwrap_or_else(|| serde_json::json!([])))
        .bind(resume.get("soft_skills_enabled").and_then(|v| v.as_bool()).unwrap_or(true))
        .bind(resume.get("education").cloned().unwrap_or_else(|| serde_json::json!([])))
        .bind(resume.get("education_enabled").and_then(|v| v.as_bool()).unwrap_or(true))
        .bind(resume.get("experience").cloned().unwrap_or_else(|| serde_json::json!([])))
        .bind(resume.get("experience_enabled").and_then(|v| v.as_bool()).unwrap_or(true))
        .bind(resume.get("projects").cloned().unwrap_or_else(|| serde_json::json!([])))
        .bind(resume.get("projects_enabled").and_then(|v| v.as_bool()).unwrap_or(true))
        .bind(resume.get("languages").cloned().unwrap_or_else(|| serde_json::json!([])))
        .bind(resume.get("languages_enabled").and_then(|v| v.as_bool()).unwrap_or(true))
        .bind(resume.get("certifications").cloned().unwrap_or_else(|| serde_json::json!([])))
        .bind(resume.get("certifications_enabled").and_then(|v| v.as_bool()).unwrap_or(true))
        .bind(resume.get("awards").cloned().unwrap_or_else(|| serde_json::json!([])))
        .bind(resume.get("awards_enabled").and_then(|v| v.as_bool()).unwrap_or(true))
        .bind(resume.get("publications").cloned().unwrap_or_else(|| serde_json::json!([])))
        .bind(resume.get("publications_enabled").and_then(|v| v.as_bool()).unwrap_or(true))
        .bind(resume.get("volunteer").cloned().unwrap_or_else(|| serde_json::json!([])))
        .bind(resume.get("volunteer_enabled").and_then(|v| v.as_bool()).unwrap_or(true))
        .bind(resume.get("interests").cloned().unwrap_or_else(|| serde_json::json!([])))
        .bind(resume.get("interests_enabled").and_then(|v| v.as_bool()).unwrap_or(true))
        .bind(
            resume
                .get("resume_references")
                .cloned()
                .or_else(|| resume.get("references").cloned())
                .unwrap_or_else(|| serde_json::json!([]))
        )
        .bind(resume.get("references_enabled").and_then(|v| v.as_bool()).unwrap_or(false))
        .bind(resume.get("created_at").and_then(|v| v.as_str()))
        .bind(resume.get("updated_at").and_then(|v| v.as_str()))
        .execute(&mut *tx)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    }

    // Restore contact_messages
    for msg in &pg_data.contact_messages {
        sqlx::query(
            "INSERT INTO contact_messages (id, name, email, message, created_at) VALUES ($1, $2, $3, $4, $5)"
        )
        .bind(msg.get("id").and_then(|v| v.as_str()))
        .bind(msg.get("name").and_then(|v| v.as_str()))
        .bind(msg.get("email").and_then(|v| v.as_str()))
        .bind(msg.get("message").and_then(|v| v.as_str()))
        .bind(msg.get("created_at").and_then(|v| v.as_str()))
        .execute(&mut *tx)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    }

    // Restore other tables similarly...
    if let Some(trans) = pg_data.translations {
        sqlx::query("DELETE FROM translations")
            .execute(&mut *tx)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        if trans.get("locale").is_some() && trans.get("translations").is_some() {
            sqlx::query("INSERT INTO translations (id, locale, translations) VALUES ($1, $2, $3)")
                .bind(trans.get("id").and_then(|v| v.as_str()))
                .bind(trans.get("locale").and_then(|v| v.as_str()))
                .bind(trans.get("translations").cloned().unwrap_or_else(|| serde_json::json!({})))
                .execute(&mut *tx)
                .await
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        } else {
            let tr_data = trans.get("tr").cloned().unwrap_or_else(|| serde_json::json!({}));
            let en_data = trans.get("en").cloned().unwrap_or_else(|| serde_json::json!({}));
            sqlx::query("INSERT INTO translations (locale, translations) VALUES ($1, $2)")
                .bind("tr")
                .bind(tr_data)
                .execute(&mut *tx)
                .await
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
            sqlx::query("INSERT INTO translations (locale, translations) VALUES ($1, $2)")
                .bind("en")
                .bind(en_data)
                .execute(&mut *tx)
                .await
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        }
    }

    if let Some(footer) = pg_data.footer_settings {
        sqlx::query("DELETE FROM footer_settings")
            .execute(&mut *tx)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        sqlx::query("INSERT INTO footer_settings (id, text_tr, text_en, enabled, show_backend) VALUES ($1, $2, $3, $4, $5)")
            .bind(footer.get("id").and_then(|v| v.as_str()))
            .bind(footer.get("text_tr").or_else(|| footer.get("text")).and_then(|v| v.as_str()).unwrap_or(""))
            .bind(footer.get("text_en").or_else(|| footer.get("text")).and_then(|v| v.as_str()).unwrap_or(""))
            .bind(footer.get("enabled").and_then(|v| v.as_bool()).unwrap_or(true))
            .bind(footer.get("show_backend").and_then(|v| v.as_bool()).unwrap_or(false))
            .execute(&mut *tx)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    }

    if let Some(features) = pg_data.features {
        sqlx::query("DELETE FROM features_settings")
            .execute(&mut *tx)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        sqlx::query(
            "INSERT INTO features_settings (id, performance_tr, performance_en, scalable_tr, scalable_en, secure_tr, secure_en)
             VALUES ($1, $2, $3, $4, $5, $6, $7)"
        )
        .bind(features.get("id").and_then(|v| v.as_str()))
        .bind(features.get("performance_tr").cloned().unwrap_or_else(|| serde_json::json!({})))
        .bind(features.get("performance_en").cloned().unwrap_or_else(|| serde_json::json!({})))
        .bind(features.get("scalable_tr").cloned().unwrap_or_else(|| serde_json::json!({})))
        .bind(features.get("scalable_en").cloned().unwrap_or_else(|| serde_json::json!({})))
        .bind(features.get("secure_tr").cloned().unwrap_or_else(|| serde_json::json!({})))
        .bind(features.get("secure_en").cloned().unwrap_or_else(|| serde_json::json!({})))
        .execute(&mut *tx)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    }

    if let Some(hero) = pg_data.hero_section {
        sqlx::query("DELETE FROM hero_section")
            .execute(&mut *tx)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        sqlx::query(
            "INSERT INTO hero_section (id, greeting_tr, greeting_en, name, title_tr, title_en)
             VALUES ($1, $2, $3, $4, $5, $6)"
        )
        .bind(hero.get("id").and_then(|v| v.as_str()))
        .bind(hero.get("greeting_tr").and_then(|v| v.as_str()).unwrap_or(""))
        .bind(hero.get("greeting_en").and_then(|v| v.as_str()).unwrap_or(""))
        .bind(hero.get("name").and_then(|v| v.as_str()).unwrap_or(""))
        .bind(hero.get("title_tr").and_then(|v| v.as_str()).unwrap_or(""))
        .bind(hero.get("title_en").and_then(|v| v.as_str()).unwrap_or(""))
        .execute(&mut *tx)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    }

    tx.commit().await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    pool.close().await;

    tracing::info!("✅ Restore complete!");

    Ok(Json(serde_json::json!({
        "success": true,
        "message": "Full backup restored successfully!",
        "restored": {
            "redis_sessions": restored_redis,
            "redis_app_keys": restored_redis_app,
            "portfolio_items": portfolio_count,
            "contact_messages": contact_count
        }
    })))
}

// Delete backup
async fn admin_delete_backup(
    session: ReadableSession,
    axum::extract::Path(filename): axum::extract::Path<String>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    if !is_admin(session).await {
        return Err(StatusCode::UNAUTHORIZED);
    }

    use std::fs;
    use std::path::Path;

    if !is_safe_backup_filename(&filename) {
        return Err(StatusCode::BAD_REQUEST);
    }

    let backup_dir = "/data/backups";
    let backup_path = Path::new(backup_dir).join(&filename);

    if !backup_path.exists() {
        return Err(StatusCode::NOT_FOUND);
    }

    fs::remove_file(&backup_path).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(serde_json::json!({
        "success": true
    })))
}

// Rename backup
async fn admin_rename_backup(
    session: ReadableSession,
    Json(payload): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    if !is_admin(session).await {
        tracing::warn!("⚠️ Unauthorized rename attempt");
        return Err(StatusCode::UNAUTHORIZED);
    }

    use std::fs;
    use std::path::Path;

    let old_filename = payload.get("old_filename")
        .and_then(|v| v.as_str())
        .ok_or(StatusCode::BAD_REQUEST)?;
    
    let new_name = payload.get("new_name")
        .and_then(|v| v.as_str())
        .ok_or(StatusCode::BAD_REQUEST)?;

    if !is_safe_backup_filename(old_filename) {
        return Err(StatusCode::BAD_REQUEST);
    }

    let safe_new_filename = sanitize_backup_filename(new_name).ok_or(StatusCode::BAD_REQUEST)?;

    if !is_safe_backup_filename(&safe_new_filename) {
        return Err(StatusCode::BAD_REQUEST);
    }

    tracing::info!("📝 Renaming backup: {} -> {}", old_filename, safe_new_filename);

    let backup_dir = "/data/backups";
    let old_path = Path::new(backup_dir).join(old_filename);
    let new_path = Path::new(backup_dir).join(&safe_new_filename);

    if !old_path.exists() {
        tracing::error!("❌ Old file not found: {:?}", old_path);
        return Err(StatusCode::NOT_FOUND);
    }

    if new_path.exists() {
        tracing::error!("❌ New filename already exists: {:?}", new_path);
        return Err(StatusCode::CONFLICT);
    }

    fs::rename(&old_path, &new_path)
        .map_err(|e| {
            tracing::error!("❌ Rename failed: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    tracing::info!("✅ Backup renamed successfully");

    Ok(Json(serde_json::json!({
        "success": true,
        "new_filename": safe_new_filename
    })))
}
