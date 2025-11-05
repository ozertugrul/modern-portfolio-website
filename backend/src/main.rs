use axum::{
    extract::{Extension, Query},
    http::StatusCode,
    response::Json,
    routing::{delete, get, post, put},
    Router,
};
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
    education: Vec<Education>,
    experience: Vec<Experience>,
    projects: Vec<ResumeProject>,
    languages: Vec<String>,
    certifications: Vec<Certification>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct PersonalInfo {
    name: String,
    title: String,
    email: String,
    phone: Option<String>,
    location: Option<String>,
    github: Option<String>,
    linkedin: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Education {
    id: String,
    institution: String,
    degree: String,
    field: Option<String>,
    start_date: String,
    end_date: Option<String>,
    description: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Experience {
    id: String,
    company: String,
    position: String,
    start_date: String,
    end_date: Option<String>,
    description: String,
    technologies: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct ResumeProject {
    id: String,
    name: String,
    description: String,
    technologies: Vec<String>,
    url: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Certification {
    id: String,
    name: String,
    issuer: String,
    date: String,
    url: Option<String>,
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
struct Translations {
    tr: serde_json::Value,
    en: serde_json::Value,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Footer {
    text_tr: String,
    text_en: String,
    enabled: bool,
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
// Default admin password hash for "admin123" (bcrypt with cost 12)
// This hash is generated once and stored here as fallback
// If this hash doesn't work, the system will generate a new one on first login attempt
const DEFAULT_ADMIN_PASSWORD_HASH: &str = "$2y$12$K1z2YQZ3qCx4Vw5Xy6Zz7.RQhNhU8TvWxYz0AbCdEfGhIjKlMnOp"; // "admin123" - placeholder, will be generated on first run

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

// Public endpoints
async fn get_portfolio(Extension(state): Extension<AppState>) -> Result<Json<Vec<PortfolioItem>>, StatusCode> {
    let mut conn = get_redis_conn(&state).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let data: Option<String> = redis::cmd("GET")
        .arg(REDIS_PORTFOLIO_KEY)
        .query_async(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    if let Some(json_str) = data {
        let items: Vec<PortfolioItem> = serde_json::from_str(&json_str)
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
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
                github: Some("https://github.com/ertu".to_string()),
                linkedin: Some("https://linkedin.com/in/ertu".to_string()),
            },
            education: vec![],
            experience: vec![],
            projects: vec![],
            languages: vec!["Turkish".to_string(), "English".to_string()],
            certifications: vec![],
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

// Helper: Get admin password hash from Redis or default
async fn get_admin_password_hash(state: &AppState) -> Result<String, StatusCode> {
    let mut conn = get_redis_conn(state).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let hash: Option<String> = redis::cmd("GET")
        .arg(REDIS_ADMIN_PASSWORD_KEY)
        .query_async(&mut conn)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    // If no hash in Redis, use default and also store it in Redis for consistency
    let final_hash = hash.unwrap_or_else(|| {
        let default = DEFAULT_ADMIN_PASSWORD_HASH.to_string();
        // Store default in Redis asynchronously (fire and forget)
        let state_clone = state.clone();
        let default_clone = default.clone();
        tokio::spawn(async move {
            if let Ok(mut conn) = get_redis_conn(&state_clone).await {
                let _ = redis::cmd("SET")
                    .arg(REDIS_ADMIN_PASSWORD_KEY)
                    .arg(&default_clone)
                    .query_async::<_, ()>(&mut conn)
                    .await;
            }
        });
        default
    });
    
    Ok(final_hash)
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
    let password_hash = get_admin_password_hash(&state).await?;
    
    tracing::info!("Login attempt - password length: {}", payload.password.len());
    tracing::info!("Using hash from Redis/default");
    
    // Try bcrypt verification
    let verify_result = bcrypt::verify(&payload.password, &password_hash);
    
    match verify_result {
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
            tracing::warn!("Password provided: '{}' (length: {})", payload.password, payload.password.len());
            tracing::warn!("Hash being used: {}", password_hash);
            
            // If Redis hash failed, try default hash
            if password_hash != DEFAULT_ADMIN_PASSWORD_HASH {
                tracing::info!("Trying default hash as fallback...");
                match bcrypt::verify(&payload.password, DEFAULT_ADMIN_PASSWORD_HASH) {
                    Ok(true) => {
                        // Default hash works, update Redis
                        if let Err(e) = set_admin_password_hash(&state, DEFAULT_ADMIN_PASSWORD_HASH).await {
                            tracing::error!("Failed to update Redis with default hash: {:?}", e);
                        }
                        session.insert("is_admin", true).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
                        tracing::info!("✅ Admin login successful with default hash");
                        Ok(Json(LoginResponse {
                            success: true,
                            message: "Giriş başarılı".to_string(),
                        }))
                    }
                    _ => {
                        tracing::error!("Default hash also failed");
                        Ok(Json(LoginResponse {
                            success: false,
                            message: "Şifre hatalı".to_string(),
                        }))
                    }
                }
            } else {
                Ok(Json(LoginResponse {
                    success: false,
                    message: "Şifre hatalı".to_string(),
                }))
            }
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

    // İlk çalıştırmada admin şifresi yoksa oluştur
    {
        let mut conn = app_state.redis_client.get_multiplexed_async_connection().await?;
        let existing_hash: Option<String> = redis::cmd("GET")
            .arg(REDIS_ADMIN_PASSWORD_KEY)
            .query_async(&mut conn)
            .await?;
        
        if existing_hash.is_none() {
            tracing::info!("🔐 Admin şifresi bulunamadı, yeni şifre oluşturuluyor...");
            let default_password = "admin123";
            let hash = bcrypt::hash(default_password, bcrypt::DEFAULT_COST)
                .map_err(|e| anyhow::anyhow!("Bcrypt hash error: {}", e))?;
            redis::cmd("SET")
                .arg(REDIS_ADMIN_PASSWORD_KEY)
                .arg(&hash)
                .query_async::<_, ()>(&mut conn)
                .await?;
            tracing::info!("✅ Admin şifresi oluşturuldu: {}", default_password);
        }
    }

    // Session Layer: 1 saat geçerli
    // Secret en az 64 byte olmalı - tam 64 byte'lık secret
    let secret_key: &[u8] = b"supersecretkeythatis32bytes!supersecretkeythatis32bytes!12345678";
    let session_layer = SessionLayer::new(session_store, secret_key)
        .with_secure(false) // local test için false, production'da true olmalı
        .with_cookie_name("session_id");

    // CORS ayarları - axum 0.6 için (şimdilik kullanılmıyor, Nginx proxy yapıyor)
    let _cors = CorsLayer::new()
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
        .route("/api/admin/contacts/read", put(admin_mark_contact_read))
        .route("/api/admin/contacts/delete", delete(admin_delete_contact))
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
        .layer(Extension(app_state))
        .layer(session_layer);

    let port = env::var("PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse::<u16>()
        .unwrap_or(8080);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    
    tracing::info!("🚀 Backend server listening on http://{}", addr);
    tracing::info!("📊 Health check: http://{}/health", addr);
    tracing::info!("🔐 Admin panel: http://{}/api/admin/login (password: admin123)", addr);

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await?;

    Ok(())
}
