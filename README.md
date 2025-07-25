# 🌱 Flourish.ai - AI-Powered Personal Development Journal

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 20+](https://img.shields.io/badge/node-20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18+-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/fastapi-latest-green.svg)](https://fastapi.tiangolo.com/)

A comprehensive mental health and personal development journaling application that combines hourly life tracking with local AI analysis to provide insights into your growth patterns, productivity, and well-being.

## ✨ Key Features

🕐 **Hourly Journaling** - Document your thoughts, feelings, and activities throughout each hour of the day  
🎯 **SMART Goals Management** - Create, track, and achieve goals with milestone tracking and progress visualization  
🧠 **Local AI Analysis** - Get personalized insights and optimization suggestions using Ollama (completely private)  
😴 **Sleep Tracking** - Monitor sleep patterns and quality with dedicated sleep period management  
🏷️ **Tags & Templates** - Organize entries with customizable tags and note templates  
📊 **Progress Analytics** - Visualize your personal development journey with detailed statistics  
🔒 **Privacy-First** - All data and AI processing stays on your local machine  
💾 **Data Export** - Export your journal and goals data in JSON or CSV formats

## 🚀 Perfect For

- **Mental Health Professionals** - Track client progress and therapeutic outcomes
- **Life Coaches** - Monitor personal development and goal achievement
- **Students** - Manage academic goals and study patterns
- **Professionals** - Optimize productivity and work-life balance
- **Wellness Enthusiasts** - Track habits, mood, and personal growth
- **Anyone** focused on self-improvement and mindful living

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, TailwindCSS, Zustand
- **Backend:** Python FastAPI, SQLAlchemy, SQLite
- **AI:** Ollama (phi3:mini model) - Local AI processing
- **UI Components:** Radix UI, Lucide React
- **Rich Text:** Quill.js editor

## 📸 Screenshots

> _Screenshots and demo GIFs would go here to showcase the UI_

## 🏃‍♂️ Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v20.11.0 or later - use `nvm` with provided `.nvmrc`)
- [Python](https://www.python.org/) (3.8 or later)
- [Ollama](https://ollama.ai/) for AI analysis
- [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager)

### 🔧 Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/flourish-ai.git
   cd flourish-ai
   ```

2. **Set up the Backend:**

   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Set up the Frontend:**

   ```bash
   cd ../frontend
   nvm use
   npm install
   ```

4. **Set up Ollama AI:**
   ```bash
   # Install Ollama from https://ollama.ai/
   ollama pull phi3:mini
   ```

### 🚀 Running the Application

1. **Start the Backend:**

   ```bash
   cd backend
   source venv/bin/activate
   uvicorn main:app --reload
   # Backend runs on http://localhost:8000
   ```

2. **Start the Frontend:**

   ```bash
   cd frontend
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

3. **Open the App:**
   Navigate to `http://localhost:5173` in your browser

## 🤖 AI Model Options

To change the model, update `backend/main.py` line with your preferred model and run:

```bash
ollama pull <model_name>
```

## 📊 Core Features Deep Dive

### Hourly Journaling

- 24-hour timeline view for detailed daily tracking
- Rich text editor with formatting options
- Template system for guided journaling
- Tag-based organization and filtering

### SMART Goals System

- Specific, Measurable, Achievable, Relevant, Time-bound goal framework
- Milestone tracking with progress visualization
- Category-based goal organization
- Automated progress calculation

### AI Analysis Engine

- Local processing ensures complete privacy
- Personalized insights based on your journaling patterns
- Optimization recommendations for productivity and well-being
- Historical analysis tracking

### Sleep & Wellness Tracking

- Dedicated sleep period configuration
- Sleep quality ratings and notes
- Integration with daily mood and energy tracking

## 🔒 Privacy & Security

- **100% Local Processing** - No data ever leaves your machine
- **Open Source** - Full transparency in code and data handling
- **No Analytics** - No tracking, cookies, or telemetry
- **Your Data, Your Control** - Export anytime in standard formats

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Roadmap

- [ ] Mobile app development (React Native)
- [ ] Advanced analytics and insights dashboard
- [ ] Goal sharing and accountability features
- [ ] Integration with wearable devices
- [ ] Multi-language support
- [ ] Voice-to-text journaling
- [ ] Backup and sync options

## 🐛 Bug Reports & Feature Requests

Please use our [Issue Tracker](https://github.com/yourusername/flourish-ai/issues) to:

- Report bugs
- Request new features
- Ask questions
- Share feedback

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**⭐ If this project helps you, please consider giving it a star!**

#mentalhealth #ai #journaling #productivity #goals #wellness #python #react #fastapi #ollama
