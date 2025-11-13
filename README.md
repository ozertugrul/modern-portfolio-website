# 🚀 Modern Portfolio Website

<div align="center">

![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)

**Enterprise-grade, scalable portfolio platform with advanced admin panel**

Full-stack modern web application built with Rust, Next.js 16, PostgreSQL, and Redis

[Features](#-features) • [Quick Start](#-quick-start-3-minutes) • [Documentation](#-complete-documentation) • [Architecture](#-architecture)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start-3-minutes)
- [Configuration](#-configuration)
- [Admin Panel Guide](#-admin-panel-guide)
- [API Reference](#-api-reference)
- [Development](#-development)
- [Production Deployment](#-production-deployment)
- [Project Structure](#-project-structure)
- [Performance & Security](#-performance--security)
- [License](#-license)

---

## 🎯 Overview

Production-ready, high-performance portfolio website with comprehensive admin panel. Built with modern technologies and best practices for scalability, security, and maintainability.

### Key Highlights

- 🦀 **Rust Backend** - Blazing fast, memory-safe backend with Axum framework
- ⚛️ **Next.js 16** - Latest React framework with App Router and Turbopack
- 🗄️ **PostgreSQL + Redis** - Robust data persistence with caching layer
- 🔐 **Enterprise Security** - SQL injection protection, session management, bcrypt hashing
- 🚀 **Horizontal Scalability** - Load-balanced backend instances with health checks
- 📧 **SMTP Integration** - Professional email system for contact replies
- 🌐 **Internationalization** - Full i18n support (Turkish & English)
- 🎨 **Modern UI/UX** - Dark/light mode, animations, responsive design
- 📊 **Analytics Dashboard** - Traffic monitoring and site logs
- 💾 **Backup System** - Data backup/restore functionality

---

## ✨ Features

### 🎨 Frontend Experience

- ⚡ **Next.js 16** - App Router, Server Components, Turbopack bundler
- 🌓 **Theme System** - Dark/Light mode with system preference detection
- 🌍 **i18n Support** - Turkish & English with dynamic locale switching
- 📱 **Responsive Design** - Mobile-first, optimized for all devices
- 🎭 **Smooth Animations** - Loading states, transitions, hover effects
- 🖼️ **Image Optimization** - Next.js Image with lazy loading
- 🎨 **Rich Text Editor** - TipTap-based WYSIWYG editor for content
- 💅 **Tailwind CSS 4** - Modern utility-first styling

### 🔧 Backend Architecture

- 🦀 **Rust/Axum** - High-performance async web framework
- 🗄️ **PostgreSQL 16** - Primary database with ACID compliance
- 💾 **Redis 7** - Session store and caching layer
- 🔐 **Authentication** - Session-based auth with Redis store
- �� **RESTful API** - Clean, documented JSON API
- 🛡️ **Security** - SQL injection prevention, parameterized queries
- 📧 **Email System** - Lettre SMTP client with Gmail/Yandex/Zoho support
- 📝 **Database Migrations** - Version-controlled schema management
- 🔄 **SQLx** - Compile-time checked SQL queries

### 🛡️ Security & Performance

- 🔒 **SQL Injection Protection** - Parameterized queries with SQLx
- 🔐 **Password Security** - Bcrypt hashing with salt
- 🚦 **Load Balancing** - Nginx reverse proxy with 2 backend instances
- ⚡ **Health Checks** - Automatic failover on instance failure
- 📊 **Session Management** - Redis-backed distributed sessions
- 🌐 **CORS Configuration** - Secure cross-origin requests

### 🎛️ Admin Panel Features

#### 📝 Content Management
- **Portfolio Projects** - Add, edit, delete projects with drag-to-reorder
- **About Section** - Bio, skills, social links management
- **Hero Section** - Homepage headline and subtitle editing
- **Features Grid** - Service/feature cards with icons
- **Footer Settings** - Copyright and footer text

#### 📄 Resume Builder
- **14 Professional Sections**: Personal Info, Summary, Skills, Experience, Education, Projects, Languages, Certifications, Awards, Publications, Volunteer, Interests, References
- **Section Reordering** - Drag to change display order
- **Toggle Visibility** - Enable/disable sections
- **Dynamic Forms** - Add multiple entries per section
- **Date Ranges** - Start/End dates with "Present" option

#### 📧 Message Management
- **Inbox System** - Email-like interface for contact messages
- **SMTP Reply** - Send emails directly from admin panel
- **Read/Unread Status** - Visual indicators for new messages
- **Rich Compose** - Subject and body fields with validation
- **Delete Messages** - Clean up old inquiries

#### 🌐 Translation Editor
- **Tree View** - Hierarchical translation structure
- **Search & Filter** - Find translations instantly
- **Expand/Collapse** - Navigate easily through sections
- **CRUD Operations** - Add, edit, delete translations
- **Statistics** - Track translation completeness
- **Side-by-side** - Edit TR and EN simultaneously

#### 💾 Data Management
- **Backup System** - One-click backup creation
- **Restore Capability** - Roll back to any backup point
- **Rename Backups** - Organize with custom names
- **Download/Export** - JSON export for backups

#### 📊 Analytics & Monitoring
- **Site Logs** - Traffic monitoring dashboard
- **IP Tracking** - Visitor IP addresses
- **Request Logging** - HTTP methods, paths, status codes
- **User Agents** - Browser and device information
- **Timestamps** - Precise activity timeline

#### 🔐 Security Settings
- **Password Management** - Change admin password
- **Session Control** - Logout functionality
- **Secure Storage** - Bcrypt hashed passwords

---

## 🛠️ Tech Stack

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Rust** | 1.83 (2021 edition) | High-performance backend language |
| **Axum** | 0.6 | Async web framework |
| **SQLx** | 0.7 | Async SQL toolkit with compile-time checking |
| **PostgreSQL** | 16 | Primary relational database |
| **Redis** | 7-alpine | Session store and caching |
| **Tokio** | 1.43 | Async runtime |
| **Tower** | 0.4 | Middleware and service abstraction |
| **Serde** | 1.0 | Serialization/deserialization |
| **Bcrypt** | 0.15 | Password hashing |
| **Lettre** | 0.11 | SMTP email client |
| **Chrono** | 0.4 | Date/time handling |
| **UUID** | 1.10 | Unique identifier generation |

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0.1 | React framework with App Router |
| **React** | 19.2.0 | UI library |
| **TypeScript** | 5.9.3 | Type-safe JavaScript |
| **Tailwind CSS** | 4 | Utility-first CSS framework |
| **TipTap** | 3.10.2 | Rich text editor (WYSIWYG) |

### Infrastructure & DevOps

| Technology | Version | Purpose |
|------------|---------|---------|
| **Docker** | 24+ | Containerization |
| **Docker Compose** | 3.9 | Multi-container orchestration |
| **Nginx** | Latest | Load balancer & reverse proxy |

---

## 🏗️ Architecture

### System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                      CLIENT BROWSER                          │
│                  (Web/Mobile Interface)                      │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTP/HTTPS
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                   NGINX LOAD BALANCER                        │
│                      (Port 8000)                             │
│     • Reverse Proxy   • Health Checks   • SSL/TLS           │
└─────────┬────────────────────────┬───────────────────────────┘
          │                        │
          │ /                      │ /api/*
          ▼                        ▼
  ┌───────────────┐      ┌─────────────────┐
  │   Frontend    │      │   Backend #1    │
  │   Next.js     │      │   Rust/Axum     │
  │   Port 3000   │      │   Port 8080     │
  └───────────────┘      └────────┬────────┘
                                  │
                         ┌────────┴────────┐
                         │   Backend #2    │
                         │   Rust/Axum     │
                         │   Port 8080     │
                         └────────┬────────┘
                                  │
                    ┌─────────────┴──────────────┐
                    │                            │
            ┌───────▼────────┐          ┌───────▼────────┐
            │  PostgreSQL 16 │          │   Redis 7      │
            │  Port 5432     │          │   Port 6379    │
            │  • Users       │          │  • Sessions    │
            │  • Portfolio   │          │  • Cache       │
            │  • Messages    │          │  • Backups     │
            │  • Translations│          └────────────────┘
            └────────────────┘
                    │
            ┌───────▼────────┐
            │  SMTP Server   │
            │  Port 587      │
            │  (Gmail/Yandex)│
            └────────────────┘
```

### Key Architectural Patterns

- **Load Balancing** - Round-robin across 2 backend instances
- **Session Affinity** - Redis-backed distributed sessions
- **Health Checks** - 30s interval, 3 retries, 10s timeout
- **Automatic Failover** - Nginx detects failed instances
- **Database Connection Pooling** - SQLx with deadpool-postgres
- **Async I/O** - Tokio runtime for non-blocking operations
- **API Gateway Pattern** - Nginx as single entry point

---

## 🚀 Quick Start (3 Minutes)

### Prerequisites

- **Docker** (v24.0+) & **Docker Compose** (v2.0+)
- **Git**

### Installation Steps

1. **Clone Repository**
   ```bash
   git clone https://github.com/ozertugrul/modern-portfolio-website.git
   cd modern-portfolio-website
   ```

2. **Start Services**
   ```bash
   docker-compose up -d
   ```

3. **Access Application**
   - **Website**: http://localhost:8000
   - **Admin Panel**: http://localhost:8000/admin
   - **Default Password**: `admin123`

4. **⚠️ Change Password Immediately**
   - Login to admin → "Şifre Yönetimi" → Set new password

5. **Configure SMTP (Optional)**
   ```bash
   cp .env.example .env
   nano .env  # Add SMTP credentials
   docker-compose restart backend1 backend2
   ```

### Verify Installation

```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs -f backend1

# Test health endpoint
curl http://localhost:8000/api/health
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file in project root:

```env
# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@yourdomain.com
SMTP_PASSWORD=your_app_specific_password
MAIL_FROM=info@yourdomain.com
BASE_URL=http://localhost:3000

# Database Configuration
DATABASE_URL=postgresql://portfolio_user:portfolio_secure_pass_2025@postgres:5432/portfolio_db

# Redis Configuration
REDIS_URL=redis://redis:6379

# Security
RUST_LOG=info
```

### SMTP Setup Guide

#### Gmail Configuration
1. Enable 2-Factor Authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use app password in `SMTP_PASSWORD`

#### Yandex Connect (Free, Recommended)
1. Register at https://connect.yandex.com
2. Add your custom domain
3. Create mailbox (e.g., info@yourdomain.com)
4. Use mailbox password directly

#### Zoho Mail (Free for 5 Users)
1. Sign up at https://www.zoho.com/mail/
2. Add custom domain
3. Create mailbox
4. Generate app password in settings

### Docker Compose Scaling

Scale backend instances:
```bash
docker-compose up -d --scale backend1=3
```

---

## 🎛️ Admin Panel Guide

### Access & Login

URL: `http://localhost:8000/admin`  
Default Password: `admin123` (⚠️ Change immediately!)

### Dashboard Sections

#### 1. Portfolio Management
- Click **"Portfolio Yönetimi"**
- Add projects with title, description, technologies
- External image URLs supported
- GitHub/Live Demo/HuggingFace links
- Drag ↑↓ to reorder
- Hover effects with auto-expand

#### 2. About Section Editor
- Update bio/description
- Skills (one per line)
- Social links (GitHub, LinkedIn, etc.)
- Contact email
- Name and title

#### 3. Resume Builder
- Navigate to **"CV Yönetimi"**
- Enable/disable sections with checkboxes
- Reorder sections with ↑↓ buttons
- Add multiple entries (experience, education, etc.)
- Date fields support "Present" for current roles
- Real-time preview

#### 4. Contact Messages
- View inbox in **"Mesajlar"**
- Blue highlight = unread
- Click message to view details
- **Reply** button opens compose modal
- Enter subject and message
- Send via SMTP
- Mark as read/unread
- Delete when done

#### 5. Translation Management
- Open **"Çeviriler"**
- Tree view shows all translation keys
- Search bar for quick lookup
- Click edit icon to modify
- Add new translations with + button
- Delete with trash icon
- Changes auto-save

#### 6. Backup System
- Go to **"Yedekleme"**
- Create backup with timestamp
- Rename for organization
- Restore to previous state
- Download as JSON
- Delete old backups

#### 7. Site Logs
- View **"Loglar"**
- See all requests (IP, method, path, status)
- Timestamps for each action
- Refresh to update
- Clear logs when needed

#### 8. Settings
- **Hero Section** - Homepage headline/subtitle
- **Features** - Service cards
- **Footer** - Copyright text
- **Password** - Change admin password

---

## 📡 API Reference

### Public API Endpoints

```http
# Portfolio
GET /api/portfolio
Response: [{ id, title, description, technologies[], image_url, github_url, live_url }]

# About
GET /api/about
Response: { name, title, bio, skills[], email, github, linkedin }

# Resume
GET /api/resume
Response: { personal_info, section_order[], experience[], education[], ... }

# Contact Form
POST /api/contact
Body: { name, email, message }
Response: { success: true }

# Hero Section
GET /api/hero
Response: { greeting_tr, greeting_en, name, title_tr, title_en }

# Features
GET /api/features
Response: [{ icon, title_tr, title_en, description_tr, description_en }]

# Footer
GET /api/footer
Response: { text_tr, text_en }

# Health Check
GET /api/health
Response: { status: "ok", timestamp }
```

### Admin API Endpoints (Requires Authentication)

```http
# Authentication
POST /api/admin/login
Body: { password }
Response: { success: true }

POST /api/admin/logout
Response: { success: true }

# Portfolio CRUD
GET    /api/admin/portfolio
POST   /api/admin/portfolio
PUT    /api/admin/portfolio
DELETE /api/admin/portfolio?id={uuid}

# Resume Management
GET /api/admin/resume
PUT /api/admin/resume
Body: { section_order[], experience[], education[], skills[], ... }

# Contact Messages
GET    /api/admin/contacts
PUT    /api/admin/contacts/read?id={uuid}
POST   /api/admin/contacts/reply
Body: { id, subject, message }
DELETE /api/admin/contacts/delete?id={uuid}

# Translations
GET /api/admin/translations
Response: { tr: {...}, en: {...} }
PUT /api/admin/translations
Body: { tr: {...}, en: {...} }

# Backups
GET    /api/admin/backups
POST   /api/admin/backups
Body: { name }
PUT    /api/admin/backups/restore
Body: { filename }
PUT    /api/admin/backups/rename
Body: { old_name, new_name }
DELETE /api/admin/backups?filename={name}

# Site Logs
GET    /api/admin/logs
DELETE /api/admin/logs

# Password Management
PUT /api/admin/password
Body: { old_password, new_password }

# Other Admin Endpoints
PUT /api/admin/about
PUT /api/admin/hero
PUT /api/admin/features
PUT /api/admin/footer
```

---

## 👨‍💻 Development

### Local Development Setup

#### Backend Development
```bash
cd backend
cargo build
cargo run
# Server starts on http://localhost:8080
```

#### Frontend Development
```bash
cd frontend
npm install
npm run dev
# Server starts on http://localhost:3000
```

#### Run PostgreSQL Locally
```bash
docker run -d \
  --name postgres \
  -e POSTGRES_USER=portfolio_user \
  -e POSTGRES_PASSWORD=portfolio_secure_pass_2025 \
  -e POSTGRES_DB=portfolio_db \
  -p 5432:5432 \
  postgres:16-alpine
```

#### Run Redis Locally
```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7-alpine
```

### Database Migrations

```bash
cd backend

# Run migrations
sqlx migrate run

# Create new migration
sqlx migrate add migration_name

# Revert last migration
sqlx migrate revert
```

### Testing

```bash
# Backend tests
cd backend
cargo test

# Frontend tests
cd frontend
npm test
```

### Code Formatting

```bash
# Format Rust code
cd backend
cargo fmt
cargo clippy

# Format TypeScript
cd frontend
npm run lint
```

---

## 🚢 Production Deployment

### Pre-Deployment Checklist

- [ ] Change default admin password
- [ ] Set strong `SESSION_SECRET`
- [ ] Configure production `DATABASE_URL`
- [ ] Set `RUST_LOG=warn` or `error`
- [ ] Update `BASE_URL` to production domain
- [ ] Configure SMTP credentials
- [ ] Enable HTTPS/SSL
- [ ] Set up domain DNS records
- [ ] Configure firewall rules

### Docker Production Build

```bash
# Build production images
docker-compose build --no-cache

# Start with production settings
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Cloudflare Tunnel Deployment

Expose local server securely without port forwarding:

```bash
# Install cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Start tunnel
cloudflared tunnel --url http://localhost:8000
```

### Health Check Monitoring

```bash
# Backend health
curl http://localhost:8000/api/health

# PostgreSQL health
docker exec -it postgres pg_isready -U portfolio_user

# Redis health
docker exec -it redis redis-cli ping

# All services
docker-compose ps
```

### Backup Strategy

```bash
# Database backup
docker exec postgres pg_dump -U portfolio_user portfolio_db > backup.sql

# Redis backup
docker exec redis redis-cli BGSAVE
docker cp redis:/data/dump.rdb ./redis-backup.rdb

# Full system backup
tar -czf portfolio-backup-$(date +%Y%m%d).tar.gz \
    backend frontend nginx docker-compose.yml .env
```

---

## 📁 Project Structure

```
modern-portfolio-website/
│
├── backend/                          # Rust backend application
│   ├── src/
│   │   └── main.rs                  # Main application logic (4000+ lines)
│   ├── migrations/
│   │   └── 001_init.sql             # Database schema
│   ├── Cargo.toml                   # Rust dependencies
│   ├── Dockerfile                   # Backend container image
│   └── .sqlx/                       # SQLx compile-time query cache
│
├── frontend/                         # Next.js frontend application
│   ├── app/
│   │   ├── page.tsx                 # Homepage
│   │   ├── layout.tsx               # Root layout
│   │   ├── globals.css              # Global styles
│   │   └── admin/                   # Admin panel pages
│   │       └── page.tsx             # Admin dashboard
│   ├── components/
│   │   ├── RichTextEditor.tsx       # TipTap WYSIWYG editor
│   │   ├── ThemeToggle.tsx          # Dark/Light mode toggle
│   │   └── LanguageSwitcher.tsx     # i18n language switcher
│   ├── contexts/
│   │   └── LanguageContext.tsx      # i18n context provider
│   ├── lib/
│   │   └── translations.ts          # Translation utilities
│   ├── public/                      # Static assets
│   ├── package.json                 # Node dependencies
│   ├── tsconfig.json                # TypeScript configuration
│   ├── next.config.ts               # Next.js configuration
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   └── Dockerfile                   # Frontend container image
│
├── nginx/
│   └── nginx.conf                   # Nginx load balancer config
│
├── docker-compose.yml               # Multi-container orchestration
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
├── LICENSE                          # MIT License
└── README.md                        # This file
```

---

## ⚡ Performance & Security

### Performance Optimizations

- ✅ **Rust Backend** - Memory-safe, zero-cost abstractions
- ✅ **Connection Pooling** - SQLx/deadpool-postgres for database
- ✅ **Redis Caching** - Session data and frequently accessed content
- ✅ **Next.js SSR/SSG** - Server-side rendering and static generation
- ✅ **Image Optimization** - Next.js Image component with lazy loading
- ✅ **Gzip Compression** - Nginx compression for responses
- ✅ **HTTP/2** - Modern protocol support
- ✅ **Load Balancing** - Horizontal scaling with 2+ backend instances

### Security Measures

- 🔒 **SQL Injection Prevention** - Parameterized queries with SQLx
- 🔒 **Password Hashing** - Bcrypt with salt (cost factor 12)
- 🔒 **Session Security** - Redis-backed sessions with secure cookies
- 🔒 **CORS Policy** - Configured for specific origins
- 🔒 **HTTPS Ready** - SSL/TLS support via Nginx
- 🔒 **Input Validation** - Server-side validation for all inputs

### Scalability Features

- 📈 **Horizontal Scaling** - Add more backend instances easily
- 📈 **Database Indexing** - Optimized queries with indexes
- 📈 **Stateless Backend** - Sessions in Redis, not in-memory
- 📈 **Health Checks** - Automatic instance failover
- 📈 **Docker Deployment** - Easy replication and deployment

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

Copyright © 2025 Ertuğrul Özer

---

## 📞 Contact & Support

**Ertuğrul Özer** - Full Stack Developer (Rust & Next.js)

- 🌐 Website: [https://culture-angels-low-combined.trycloudflare.com/](https://culture-angels-low-combined.trycloudflare.com/)
- 💼 GitHub: [@ozertugrul](https://github.com/ozertugrul)
- 📧 Email: muhammedozer32@gmail.com

---

<div align="center">

### 🌟 **Star this repository if you found it useful!** 🌟

Made with 🦀 **Rust** • ⚡ **Next.js** • 🗄️ **PostgreSQL** • 💾 **Redis**

**Production-Ready • Scalable • Secure • Modern**

</div>
