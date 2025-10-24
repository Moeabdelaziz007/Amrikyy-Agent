# 🚀 Amrikyy Agent - AI-Powered Travel Assistant

> **Enterprise-grade AI travel agent** with multi-model architecture, real-time booking, and intelligent recommendations. Enhanced with **UiAmrikyy design system** and **8 specialized AI agents**.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Moeabdelaziz007/Amrikyy-Agent)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/Moeabdelaziz007/Amrikyy-Agent)

**[English](README.md)** | [العربية](README.ar.md)

---

## 🆕 Latest Updates (October 2025)

### 🎉 **UiAmrikyy Integration Complete**
- ✅ **8 Specialized AI Agents**: Travel, Coding, Marketing, Content, Finance, Health, Education, Entertainment
- ✅ **Enhanced UI/UX**: Modern design system with dark/light themes
- ✅ **Multi-language Support**: Full Arabic and English localization
- ✅ **Code Review Agent**: New 6th sub-agent for the Coding Agent with comprehensive testing
- ✅ **Production Ready**: Deployed with Netlify integration and error handling

### 🔧 **Technical Improvements**
- ✅ **Backend Optimization**: Enhanced API routes and agent orchestration
- ✅ **Frontend Enhancement**: React components with TypeScript and i18n support
- ✅ **Testing Suite**: Comprehensive unit tests for all agent functionality
- ✅ **Documentation**: Updated git workflow and deployment guides

---

## ✨ Key Features

### 🤖 **8 Specialized AI Agents**
- **🧳 Travel Agent**: Flight search, hotel booking, itinerary planning
- **💻 Coding Agent**: Code generation, review, debugging, testing (6 sub-agents)
- **📈 Marketing Agent**: Campaign creation, content strategy, analytics (6 sub-agents)
- **📝 Content Agent**: Blog writing, SEO optimization, social media
- **💰 Finance Agent**: Investment advice, budget planning, market analysis
- **🏥 Health Agent**: Wellness tips, symptom analysis, appointment scheduling
- **🎓 Education Agent**: Course recommendations, study plans, skill assessment
- **🎮 Entertainment Agent**: Movie suggestions, event planning, gaming recommendations

### 🌍 **Advanced Travel Services**
- **Flight Search & Booking**: Amadeus, Kiwi, Sabre APIs integration
- **Hotel Reservations**: Booking.com and direct hotel APIs
- **Destination Intelligence**: Weather, attractions, local insights
- **AI-Generated Itineraries**: Personalized travel plans
- **Real-time Updates**: Flight delays, gate changes, weather alerts

### 💬 **Multi-Channel Communication**
- **Telegram Bot**: Full-featured bot with inline keyboards
- **WhatsApp Business**: Enterprise messaging integration
- **Web Interface**: Modern React-based dashboard with UiAmrikyy design
- **Voice Interface**: Voice note processing (coming soon)

### 🔒 **Enterprise Security**
- **JWT Authentication**: Secure user sessions
- **End-to-end Encryption**: Protected user data
- **Rate Limiting**: DDoS protection and abuse prevention
- **GDPR Compliant**: Privacy-first architecture

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite + UiAmrikyy)        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Desktop  │  │   Chat   │  │ Booking  │  │ Profile  │      │
│  │   OS     │  │Interface │  │  System  │  │ Manager  │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────────────────────┘
                               ↕ REST API
┌─────────────────────────────────────────────────────────────────┐
│                   Backend (Node.js + Express)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │   AI     │  │  Travel  │  │   Auth   │  │ Payment  │      │
│  │ Agents   │  │   APIs   │  │  System  │  │ Gateway  │      │
│  │ (8 Types)│  │          │  │          │  │          │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────────────────────┘
                               ↕
┌─────────────────────────────────────────────────────────────────┐
│              External Services & Databases                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Supabase │  │  Redis   │  │ OpenAI   │  │ Telegram │      │
│  │   (DB)   │  │ (Cache)  │  │   API    │  │   Bot    │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key (or alternative AI provider)

### 1. Clone Repository
```bash
git clone https://github.com/Moeabdelaziz007/Amrikyy-Agent.git
cd Amrikyy-Agent
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your credentials (see DEPLOYMENT_KEYS.md)

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:3001" > .env

# Start development server
npm run dev
```

### 4. Access Application

**Local Development:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/api/health

**Production:**
- Frontend: [https://frontend-beta-sandy.vercel.app](https://frontend-beta-sandy.vercel.app)
- Backend API: [https://amrikyy-agent.onrender.com](https://amrikyy-agent.onrender.com)

---

## 🧪 Testing

### Run Tests
```bash
# Backend tests (including new agent tests)
cd backend
npm test
npm run test:coverage

# Frontend tests
cd frontend
npm test
npm run test:e2e

# Integration tests
npm run test:integration
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: UiAmrikyy design system + shadcn/ui
- **Styling**: TailwindCSS
- **i18n**: Multi-language support (Arabic/English)
- **State Management**: React Context + Hooks

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Cache**: Redis
- **Authentication**: JWT + Passport.js

### AI & ML
- **Primary**: Google Gemini 2.0 Flash
- **Alternatives**: Gemini 2.5 Pro, OpenAI GPT-4
- **Agents**: 8 specialized AI agents with sub-agents
- **Tracing**: LangSmith (optional)

---

## 📚 Documentation

- [Quick Start Guide](docs/core/QUICK_START.md)
- [API Documentation](docs/core/API_DOCUMENTATION.md)
- [Architecture Overview](docs/core/ARCHITECTURE.md)
- [Deployment Guide](docs/core/DEPLOYMENT_GUIDE.md)
- [Git Workflow](GIT_WORKFLOW_SIMPLE.md)
- [Build Progress](BUILD_PROGRESS.md)

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 Mohamed Hossameldin Abdelaziz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

See the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author & Contact

<div align="center">

### **Mohamed Hossameldin Abdelaziz**
*Full-Stack Developer & AI Engineer*

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Moeabdelaziz007)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/amrikyy)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:Amrikyy@gmail.com)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/17706160211)

</div>

**📞 Contact Information:**
- **Primary Email**: [Amrikyy@gmail.com](mailto:Amrikyy@gmail.com)
- **Academic Email**: [mabdela1@students.kennesaw.edu](mailto:mabdela1@students.kennesaw.edu)
- **Phone (Egypt)**: [+201094228044](tel:+201094228044)
- **Phone (US)**: [+17706160211](tel:+17706160211)
- **WhatsApp**: [+17706160211](https://wa.me/17706160211)
- **LinkedIn**: [linkedin.com/in/amrikyy](https://linkedin.com/in/amrikyy)
- **GitHub**: [github.com/Moeabdelaziz007](https://github.com/Moeabdelaziz007)

**🎓 Education:**
- Computer Science Student at Kennesaw State University
- AI & Machine Learning Enthusiast
- Full-Stack Development Specialist

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Contributors
- **Mohamed Hossameldin Abdelaziz** - *Lead Developer* - [@Moeabdelaziz007](https://github.com/Moeabdelaziz007)
- **Ona** - *UiAmrikyy Integration* - Co-authored several commits

---

## 🙏 Acknowledgments

- **OpenAI** for GPT models and AI infrastructure
- **Google** for Gemini AI models
- **Supabase** for database and authentication
- **Vercel & Render** for hosting and deployment
- **UiAmrikyy** for the enhanced design system
- **shadcn/ui** for beautiful component library
- **React & Vite** for the frontend framework
- **All open-source contributors** who make this possible

---

## 📊 Project Status

### ✅ **Completed Features**
- ✅ **8 Specialized AI Agents** (Travel, Coding, Marketing, etc.)
- ✅ **UiAmrikyy Design Integration**
- ✅ **Multi-language Support** (Arabic/English)
- ✅ **Production Deployment** (Render + Vercel)
- ✅ **Comprehensive Testing Suite**
- ✅ **Modern UI/UX** with dark/light themes
- ✅ **Backend API** with all endpoints
- ✅ **Authentication System**
- ✅ **Telegram Bot Integration**

### 🚧 **In Progress**
- 🚧 **Payment Processing** (Stripe integration)
- 🚧 **Voice Interface** (Speech-to-text)
- 🚧 **Advanced Analytics** (User behavior tracking)

### 🔮 **Planned Features**
- 🔮 **Mobile Apps** (React Native)
- 🔮 **Desktop App** (Electron)
- 🔮 **API Marketplace** (Third-party integrations)
- 🔮 **Enterprise Dashboard** (Admin panel)

---

## 🔗 Production Links

<div align="center">

### **🌐 Live Application**
**[https://frontend-beta-sandy.vercel.app](https://frontend-beta-sandy.vercel.app)**

### **🔌 API Endpoints**
- **Backend API**: [https://amrikyy-agent.onrender.com](https://amrikyy-agent.onrender.com)
- **Health Check**: [https://amrikyy-agent.onrender.com/api/health](https://amrikyy-agent.onrender.com/api/health)

### **🤖 Bots & Social**
- **Telegram Bot**: [@AmrikyyBot](https://t.me/AmrikyyBot)
- **Support Email**: [Amrikyy@gmail.com](mailto:Amrikyy@gmail.com)

</div>

---

<div align="center">

## 🌟 **Built with ❤️ by Mohamed Hossameldin Abdelaziz**

[![Star us on GitHub](https://img.shields.io/github/stars/Moeabdelaziz007/Amrikyy-Agent?style=social)](https://github.com/Moeabdelaziz007/Amrikyy-Agent)
[![Follow on GitHub](https://img.shields.io/github/followers/Moeabdelaziz007?style=social)](https://github.com/Moeabdelaziz007)

**[⭐ Star us on GitHub](https://github.com/Moeabdelaziz007/Amrikyy-Agent)** | **[🐛 Report Bug](https://github.com/Moeabdelaziz007/Amrikyy-Agent/issues)** | **[💡 Request Feature](https://github.com/Moeabdelaziz007/Amrikyy-Agent/issues)**

---

*"Transforming travel with AI, one conversation at a time."*

**© 2025 Mohamed Hossameldin Abdelaziz. Licensed under MIT License.**

</div>
