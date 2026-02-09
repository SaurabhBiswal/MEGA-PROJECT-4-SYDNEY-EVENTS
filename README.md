# 🎭 EventPulse Sydney - Advanced Event Intelligence Platform

A comprehensive, full-stack event discovery and management platform built for Sydney, Australia. It combines **real-time web scraping**, **AI-powered recommendations**, and **multi-channel notifications** to deliver a premium user experience.

> **Status**: Production Ready ✅
> **Live Platform**: [https://sydneyeventslive.vercel.app](https://sydneyeventslive.vercel.app)
> **API Gateway**: [https://mega-project-4-sydney-events-production.up.railway.app](https://mega-project-4-sydney-events-production.up.railway.app)
> **Engine Version**: v1.2.1-Hardened (Reliability Focused)

---

## 🚀 Key Features

### 👤 Core User Experience
- **🔐 Secure Authentication**: Full JWT-based Login/Signup system with persistent sessions.
- **❤️ Favorites & Personalization**: Save events to your profile; get AI-curated recommendations based on your preferences.
- **🗺️ Interactive Map View**: Visualize events across Sydney using **Leaflet Maps**.
- **🔎 Advanced Search & Filters**: Filter by category (Music, Food, Sports, etc.), date, and keyword search with debounce.

### 📱 Engagement & Social
- **⭐ Ratings & Reviews**: Community-driven review system with star ratings.
- **📅 Calendar Integration**: One-click export to **Google Calendar** or **iCal**.
- **📢 Social Sharing**: Instant sharing to WhatsApp, Twitter/X, and Facebook.
- **🔔 Smart Reminders**: Automated email reminders sent 1 day before saved events.

### 🤖 Intelligent Automation
- **🕷️ Real-Time Scraping**: Automated `Puppeteer` scrapers fetch fresh events from major platforms daily.
- **🧠 AI Chatbot**: Context-aware assistant to help users find events using natural language.
- **🤖 Telegram Bot**: Auto-broadcasts new events to a dedicated Telegram channel.

### 🛠️ Admin & DevOps
- **📊 Admin Dashboard**: Analytics, user management, and manual event CRUD.
- **⚡ Performance**: **Redis Caching** for sub-millisecond API response times.
- **🐳 Dockerized**: Full containerization (`docker-compose`) for consistent deployment.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18
- **Styling**: Tailwind CSS (Custom Design System)
- **State Management**: React Context API
- **Mapping**: React Leaflet (OpenStreetMap)
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js / Express
- **Database**: MongoDB Atlas (with Mongoose ODM)
- **Caching**: Redis (Upstash)
- **Scraping**: Puppeteer + Cheerio
- **Scheduling**: Node-Cron

### Services & Integrations
- **Email**: Nodemailer (SMTP)
- **Bot**: Node-Telegram-Bot-API
- **Payment**: (Disabled/Removed as per v1 spec)

---

## 🏗️ Architecture

The system follows a microservices-inspired monolithic architecture:

```
[React Frontend] <---> [Express API Gateway] <---> [Redis Cache]
                             |
                             v
                     [MongoDB Atlas]
                             ^
                             |
                   [Background Workers]
                   (Scrapers / Cron Jobs / Telegram Bot)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Connection String
- Redis Connection String

### 1. Clone & Install
```bash
git clone https://github.com/SaurabhBiswal/MEGA-PROJECT-4-SYDNEY-EVENTS.git
cd sydney-events
```

### 2. Backend Setup
```bash
cd backend
npm install
# Create .env file with:
# PORT=5001
# MONGODB_URI=...
# REDIS_URL=...
# EMAIL_USER=...
# TELEGRAM_BOT_TOKEN=...
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Create .env file with:
# REACT_APP_API_URL=http://localhost:5001
npm start
```

---

## 👨‍💻 Developer
**Saurabh Biswal**
*Full-Stack Developer*

---

## 📝 License
MIT License
