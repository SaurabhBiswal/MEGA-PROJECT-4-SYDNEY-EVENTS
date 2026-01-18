# 🎭 Sydney Events Intelligence Platform

A Full-Stack Event Discovery Platform featuring **AI-powered recommendations** and **automated web scraping** for real-time Sydney event aggregation.

### 🌐 Live Demo
- **Frontend (Live Site):** [https://lively-caramel-47082c.netlify.app/](https://lively-caramel-47082c.netlify.app/)
- **Backend API:** [https://sydney-events-production.up.railway.app](https://sydney-events-production.up.railway.app)
- **GitHub Repo:** [https://github.com/SaurabhBiswal/sydney-events](https://github.com/SaurabhBiswal/sydney-events)

---

## 🌟 Features

### Core Functionality
- 🕷️ **Real-Time Web Scraping**: Automated data extraction from Eventbrite & Time Out Sydney using Puppeteer
- 🤖 **AI Chatbot Assistant**: Context-aware NLP chatbot for personalized event recommendations
- 📧 **Lead Capture System**: Email opt-in modal before ticket redirection
- 🔄 **Auto-Update Mechanism**: CRON-scheduled daily scraping (2:00 AM)
- 🎨 **Responsive Design**: Mobile-first UI with Tailwind CSS
- 📅 **Smart Filtering**: Automatic hiding of past events

### Advanced Features
- 🚀 **Redis Caching**: Sub-millisecond response times for frequent queries
- 🔒 **Fault Tolerance**: Graceful degradation when scraping fails
- 🎯 **Multi-Source Orchestration**: Aggregates data from multiple event platforms

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Framework | 18.2.0 |
| **Tailwind CSS** | Styling | 3.3.5 |
| **Axios** | HTTP Client | 1.6.0 |
| **React Router** | Navigation | 6.18.0 |
| **Lucide React** | Icons | 0.292.0 |
| **date-fns** | Date Formatting | 2.30.0 |

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime | 18+ |
| **Express** | Web Framework | 4.18.2 |
| **MongoDB** | Database | Atlas Cloud |
| **Mongoose** | ODM | 7.5.0 |
| **Puppeteer** | Headless Browser | 21.3.0 |
| **Cheerio** | HTML Parser | 1.0.0-rc.12 |
| **node-cron** | Task Scheduler | 3.0.3 |
| **Redis** | Caching Layer | 5.10.0 |

### DevOps & Tools
- **Railway**: Backend Hosting (using Nixpacks)
- **Netlify**: Frontend Hosting
- **Cron-Job.org**: Automated Tasks
- **MongoDB Atlas**: Cloud Database
- **Git**: Version Control

---

## 📐 System Architecture

```
┌─────────────────┐
│   React SPA     │ ◄─── Tailwind CSS
│  (Netlify)      │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐      ┌──────────────┐
│  Express API    │◄────►│ Redis Cache  │
│  (Railway)      │      │ (Port 6379)  │
└────────┬────────┘      └──────────────┘
         │
         ├──► MongoDB Atlas (Events DB)
         │
         └──► Puppeteer Scrapers
              ├─ Time Out Sydney
              └─ Eventbrite (Primary)
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Git

### Installation

1. **Clone Repository**
   ```bash
   git clone https://github.com/SaurabhBiswal/sydney-events.git
   cd sydney-events
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   
   Create `.env`:
   ```env
   PORT=5001
   MONGODB_URI=your_mongodb_connection_string
   REDIS_URL=redis://localhost:6379
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Run Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev

   # Terminal 2 - Frontend
   cd frontend && npm start
   ```

5. **Trigger Initial Scrape**
   ```
   http://localhost:5001/api/scrape/events
   ```

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/events` | Fetch all upcoming events |
| `POST` | `/api/events/subscribe` | Submit email for ticket access |
| `GET` | `/api/scrape/events` | Trigger manual scraping |
| `POST` | `/api/chat` | AI chatbot interaction |

---

## 🤖 AI Chatbot Features

### Intent Recognition
- **Music**: "Show me concerts", "jazz events"
- **Food**: "restaurants", "food festivals"
- **Sports**: "cricket", "AFL matches"
- **General**: "what's happening this weekend"

### Context Awareness
```
User: "food events"
Bot: [Lists food events]

User: "yes"
Bot: [Provides booking links for previously mentioned events]
```

---

## 🔄 Auto-Update System (Production)

### CRON Job (via Cron-Job.org)
- **URL**: `https://sydney-events-production.up.railway.app/api/scrape/events`
- **Schedule**: Runs daily at 2:00 AM
- **Result**: Fetches fresh events, matches by title/date, and auto-filters past events.

---

## 🎨 UI/UX Highlights

- **Minimalist Design**: Clean, distraction-free event browsing
- **Responsive Grid**: Adapts to mobile, tablet, desktop
- **Floating Chat Widget**: Always accessible AI assistant
- **Modal Interactions**: Smooth email capture flow
- **Loading States**: Skeleton screens and spinners

---

## 🔐 Security & Best Practices

- ✅ Environment variables for sensitive data
- ✅ CORS configuration for API security
- ✅ Input validation on email capture
- ✅ MongoDB injection prevention (Mongoose)
- ✅ Rate limiting ready (Redis integration)

---

## 🚧 Future Enhancements

- [ ] User authentication (save favorite events)
- [ ] Email notifications for new events
- [ ] WhatsApp/Telegram bot integration
- [ ] Advanced filters (price range, distance)
- [ ] Calendar export (iCal format)
- [ ] Social sharing features

---

## 📝 License

MIT License - Free for educational and commercial use

---

## 👨‍💻 Developer

**Saurabh**  
Full-Stack Developer | MERN Specialist  
[GitHub](https://github.com/SaurabhBiswal) | [LinkedIn](www.linkedin.com/in/saurabh-biswal)

---

## 🙏 Acknowledgments

- **Eventbrite & Time Out Sydney** for event data
- **Unsplash** for placeholder images
- **MongoDB Atlas** for cloud database hosting

---

**Built with ❤️ by Saurabh Biswal for the Sydney community**
