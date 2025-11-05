# 🚀 Modern Portfolio Website

<div align="center">

![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)

**High-performance, scalable, and secure portfolio website with admin panel**

[Live Demo](#) • [Documentation](#features) • [Report Bug](https://github.com/yourusername/portfolio/issues)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Admin Panel](#-admin-panel)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎨 Frontend
- ⚡ **Next.js 16** with App Router and Turbopack
- 🌓 **Dark/Light Mode** support
- 🌍 **i18n** - Turkish & English languages
- 📱 **Fully Responsive** - Mobile, Tablet, Desktop optimized
- 🎭 **Smooth Animations** - Loading states and transitions
- 🖼️ **Image Optimization** - Next.js Image component with lazy loading

### 🔧 Backend
- 🦀 **Rust** - High-performance backend with Axum framework
- 🚀 **Horizontal Scaling** - Load balancer with multiple backend instances
- 💾 **Redis** - Session management and data caching
- 🔐 **Secure Authentication** - Session-based admin authentication
- 📡 **RESTful API** - Clean and documented endpoints

### 🛡️ Security & Performance
- 🔒 **HTTPS Ready** - SSL/TLS configuration
- 🚦 **Rate Limiting** - Protection against abuse
- 🏎️ **Load Balancing** - Nginx reverse proxy with health checks
- 📊 **Session Management** - Redis-backed sessions
- 🔥 **Hot Reload** - Development mode with auto-restart

### 🎛️ Admin Panel
- 📝 **Content Management** - Edit all content dynamically
- 🖼️ **Portfolio Management** - Add/Edit/Delete projects
- 📧 **Contact Messages** - View and manage messages (email-like UI)
- 👤 **Profile Management** - Update bio, skills, resume
- 🎨 **Hero Section Editor** - Customize homepage hero
- 🌐 **i18n Management** - Edit translations for both languages
- 🔐 **Password Management** - Change admin password

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Rust** | 1.83 | High-performance backend |
| **Axum** | Latest | Web framework |
| **Redis** | 7.0 | Session & cache store |
| **Tower** | Latest | Middleware |
| **Serde** | Latest | Serialization |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0.1 | React framework |
| **React** | 19 | UI library |
| **TypeScript** | Latest | Type safety |
| **Tailwind CSS** | Latest | Styling |

### Infrastructure
| Technology | Version | Purpose |
|------------|---------|---------|
| **Docker** | 24+ | Containerization |
| **Docker Compose** | 2.0+ | Multi-container orchestration |
| **Nginx** | 1.29.3 | Load balancer & reverse proxy |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│                    (Browser/Mobile)                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    NGINX (Port 8000)                        │
│           Load Balancer & Reverse Proxy                     │
└──────────────┬──────────────────────┬───────────────────────┘
               │                      │
       ┌───────▼───────┐      ┌──────▼──────┐
       │   Frontend    │      │  Backend    │
       │   (Next.js)   │      │   (Rust)    │
       │   Port 3000   │      │  Port 8080  │
       └───────────────┘      └─────┬───┬───┘
                                    │   │
                              ┌─────▼───▼─────┐
                              │     Redis     │
                              │   Port 6379   │
                              └───────────────┘
```

### Load Balancing Strategy
- **2 Backend Instances** running in parallel
- **Health Checks** every 5 seconds
- **Session Affinity** via Redis
- **Automatic Failover** if one instance fails

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (v24.0+) - [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose** (v2.0+) - [Install Docker Compose](https://docs.docker.com/compose/install/)
- **Git** - [Install Git](https://git-scm.com/downloads)

Optional (for local development):
- **Rust** (1.83+) - [Install Rust](https://rustup.rs/)
- **Node.js** (20+) - [Install Node.js](https://nodejs.org/)

---

## 🚀 Installation

### Quick Start (Docker)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/portfolio.git
   cd portfolio
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - **Website**: http://localhost:8000
   - **Admin Panel**: http://localhost:8000/admin
   - **Default Password**: `admin123`

That's it! 🎉

### Development Setup

<details>
<summary>Click to expand development setup</summary>

#### Backend Development
```bash
cd backend
cargo build --release
cargo run
```

#### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

#### Redis
```bash
docker run -d -p 6379:6379 redis:7.0-alpine
```

</details>

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file in the root directory:

```env
# Backend
RUST_LOG=info
REDIS_URL=redis://redis:6379
SESSION_SECRET=your-secret-key-change-this
ADMIN_PASSWORD_HASH=your-hashed-password

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Docker Compose Configuration

The default `docker-compose.yml` includes:
- ✅ 2 Backend instances (auto-scaling ready)
- ✅ 1 Frontend instance
- ✅ 1 Redis instance
- ✅ 1 Nginx load balancer

Modify `docker-compose.yml` to scale services:
```bash
docker-compose up -d --scale backend1=3
```

---

## 📖 Usage

### Admin Panel Access

1. Navigate to http://localhost:8000/admin
2. Enter password: `admin123` (change this!)
3. Start managing your content

### Admin Panel Features

#### 📝 Portfolio Management
- Add new projects
- Edit existing projects
- Upload images (external URLs)
- Set GitHub/Live demo links
- Tag technologies (multi-line input)

#### 👤 About Section
- Update bio
- Manage skills (one per line)
- Add social links
- Update contact email

#### 📄 Resume Management
- Personal information
- Work experience
- Education
- Languages (one per line)
- Certifications

#### 📧 Contact Messages
- View all messages (newest first)
- Email-like interface
- Mark as read/unread
- Delete messages
- Blue highlight for unread messages

#### 🎨 Hero Section
- Edit greeting text (TR/EN)
- Update name
- Customize title/subtitle
- Real-time preview

#### ⚡ Features Section
- Edit feature cards
- Update icons
- Customize descriptions (TR/EN)

---

## 📡 API Documentation

### Public Endpoints

```http
GET  /api/portfolio          # Get all portfolio items
GET  /api/about              # Get about information
GET  /api/resume             # Get resume data
GET  /api/features           # Get features section
GET  /api/hero               # Get hero section
GET  /api/footer             # Get footer text
POST /api/contact            # Send contact message
```

### Admin Endpoints (Requires Authentication)

```http
POST   /api/admin/login                    # Admin login
POST   /api/admin/logout                   # Admin logout

GET    /api/admin/portfolio                # Get portfolio items
POST   /api/admin/portfolio                # Create portfolio item
PUT    /api/admin/portfolio                # Update portfolio item
DELETE /api/admin/portfolio?id=<id>        # Delete portfolio item

PUT    /api/admin/about                    # Update about section
GET    /api/admin/resume                   # Get resume
PUT    /api/admin/resume                   # Update resume

GET    /api/admin/contacts                 # Get contact messages
PUT    /api/admin/contacts/read?id=<id>    # Mark as read
DELETE /api/admin/contacts/delete?id=<id>  # Delete message

GET    /api/admin/features                 # Get features
PUT    /api/admin/features                 # Update features
GET    /api/admin/hero                     # Get hero section
PUT    /api/admin/hero                     # Update hero section
GET    /api/admin/footer                   # Get footer
PUT    /api/admin/footer                   # Update footer

GET    /api/admin/password                 # Get password info
PUT    /api/admin/password                 # Change password
```

---

## 👨‍💻 Development

### Running Tests

```bash
# Backend tests
cd backend
cargo test

# Frontend tests
cd frontend
npm test
```

### Code Style

```bash
# Format Rust code
cd backend
cargo fmt

# Format TypeScript code
cd frontend
npm run lint
```

### Watch Mode

```bash
# Backend with hot reload
cd backend
cargo watch -x run

# Frontend with hot reload
cd frontend
npm run dev
```

---

## 🚢 Deployment

### Production Deployment

1. **Update environment variables**
   ```bash
   # Update .env with production values
   RUST_LOG=warn
   ADMIN_PASSWORD_HASH=<strong-hash>
   ```

2. **Build production images**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

3. **Start services**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Cloudflare Tunnel (Optional)

Expose your local server securely:
```bash
cloudflared tunnel --url http://localhost:8000
```

### Health Checks

- Backend: `http://localhost:8000/health`
- Redis: `redis-cli ping`

---

## 📁 Project Structure

```
portfolio/
├── backend/                 # Rust backend
│   ├── src/
│   │   └── main.rs         # Main application logic
│   ├── Cargo.toml          # Rust dependencies
│   └── Dockerfile          # Backend container
│
├── frontend/               # Next.js frontend
│   ├── app/               # App router pages
│   │   ├── page.tsx       # Homepage
│   │   ├── admin/         # Admin panel
│   │   └── layout.tsx     # Root layout
│   ├── components/        # React components
│   ├── contexts/          # React contexts (i18n)
│   ├── lib/              # Utilities & i18n
│   ├── package.json      # Node dependencies
│   └── Dockerfile        # Frontend container
│
├── nginx/
│   └── nginx.conf        # Nginx configuration
│
├── docker-compose.yml    # Multi-container setup
└── README.md            # You are here!
```

---

## 🎨 Key Features Showcase

### 1. Multi-line Input System
- Skills, Technologies, Languages
- One item per line
- Enter key support
- Auto-cleanup on save

### 2. Image Support
- External URL support (GitHub raw, CDN, etc.)
- Next.js Image optimization
- Lazy loading
- Responsive sizing

### 3. Email-like Message UI
- Unread messages highlighted in blue
- "NEW" badge on unread messages
- Click to view full message in modal
- Delete button with confirmation

### 4. Loading States
- Skeleton loaders
- Smooth transitions
- No flash/flicker on page load
- Professional UX

### 5. Responsive Design
- Mobile-first approach
- Optimized navbar (no overlap)
- Touch-friendly buttons
- Adaptive font sizes

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with ❤️ using Rust and Next.js
- Inspired by modern portfolio designs
- Thanks to the open-source community

---

## 📞 Contact

**Ertuğrul** - Rust Backend Developer

- Website: [your-website.com](#)
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your-email@example.com

---

<div align="center">

**⭐ Star this repo if you found it helpful!**

Made with 🦀 Rust and ⚡ Next.js

</div>
