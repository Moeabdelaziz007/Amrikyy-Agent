// ============================================
// AMRIKYY AGENT - BACKEND SERVER
// AI-Powered Travel Assistant
// © 2025 Mohamed Hossameldin Abdelaziz
// ============================================

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'Amrikyy Travel Agent MVP',
    version: '1.0.0',
  });
});

// ============================================
// DASHBOARD STATS ENDPOINT
// ============================================

app.get('/api/dashboard/stats', (req, res) => {
  try {
    const stats = {
      activeAgents: 4,
      totalTasks: 156,
      successRate: 98.5,
      responseTime: 1.2,
      agents: [
        {
          id: 'luna',
          name: 'Luna',
          role: 'Trip Planner',
          status: 'active',
          uptime: '24h 15m',
          tasksCompleted: 45
        },
        {
          id: 'karim',
          name: 'Karim',
          role: 'Budget Optimizer',
          status: 'active',
          uptime: '18h 32m',
          tasksCompleted: 32
        },
        {
          id: 'scout',
          name: 'Scout',
          role: 'Deal Finder',
          status: 'idle',
          uptime: '12h 08m',
          tasksCompleted: 28
        },
        {
          id: 'maya',
          name: 'Maya',
          role: 'Customer Support',
          status: 'active',
          uptime: '36h 45m',
          tasksCompleted: 51
        }
      ],
      recentActivity: [
        {
          id: '1',
          type: 'success',
          agent: 'Luna',
          action: 'Created trip plan for Paris',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString()
        },
        {
          id: '2',
          type: 'info',
          agent: 'Karim',
          action: 'Optimized budget for user #1234',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString()
        },
        {
          id: '3',
          type: 'success',
          agent: 'Scout',
          action: 'Found 5 new deals',
          timestamp: new Date(Date.now() - 30 * 60000).toISOString()
        }
      ]
    };

    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch dashboard stats'
    });
  }
});

// ============================================
// AI CHAT ENDPOINT (MVP CORE FEATURE)
// ============================================

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'Message is required',
      });
    }

    // Mock AI response for MVP
    const aiResponse = {
      message: `I understand you're interested in: "${message}". This is a demo response from the Amrikyy Travel Agent MVP. The full AI integration will be available in the production version.`,
      timestamp: new Date().toISOString(),
      status: 'demo_mode',
    };

    res.status(200).json({
      success: true,
      data: aiResponse,
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong processing your request',
    });
  }
});

// ============================================
// TRIP MANAGEMENT ENDPOINTS (MVP)
// ============================================

// Create Trip
app.post('/api/trips', (req, res) => {
  try {
    const { destination, startDate, endDate, budget, travelers } = req.body;

    if (!destination || !startDate || !endDate || !budget || !travelers) {
      return res.status(400).json({
        error: 'All trip fields are required',
      });
    }

    const newTrip = {
      id: Math.random().toString(36).substr(2, 9),
      destination,
      startDate,
      endDate,
      budget,
      travelers,
      createdAt: new Date().toISOString(),
      status: 'planned',
    };

    res.status(201).json({
      success: true,
      data: newTrip,
      message: 'Trip created successfully',
    });
  } catch (error) {
    console.error('Create Trip Error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

// Get Trips
app.get('/api/trips', (req, res) => {
  try {
    // Mock trips data for MVP
    const mockTrips = [
      {
        id: 'demo_trip_1',
        destination: 'Paris, France',
        startDate: '2025-11-01',
        endDate: '2025-11-07',
        budget: 2500,
        travelers: 2,
        status: 'planned',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'demo_trip_2',
        destination: 'Tokyo, Japan',
        startDate: '2025-12-15',
        endDate: '2025-12-22',
        budget: 4000,
        travelers: 1,
        status: 'planned',
        createdAt: new Date().toISOString(),
      },
    ];

    res.status(200).json({
      success: true,
      data: mockTrips,
      message: 'Trips retrieved successfully',
    });
  } catch (error) {
    console.error('Get Trips Error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

// ============================================
// USER AUTHENTICATION (MVP)
// ============================================

// Register User
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: 'All fields are required',
      });
    }

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      firstName,
      lastName,
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

// Login User
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    // Mock user for MVP
    const user = {
      id: 'demo_user_1',
      email,
      firstName: 'Demo',
      lastName: 'User',
      createdAt: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      data: user,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong on our end',
  });
});

// ============================================
// TELEGRAM BOT INTEGRATION
// ============================================

if (process.env.TELEGRAM_BOT_TOKEN) {
  try {
    console.log('🤖 Initializing Telegram Bot...');
    require('./telegram-bot-gemini');
    console.log('✅ Telegram Bot started successfully');
  } catch (error) {
    console.error('❌ Telegram Bot initialization failed:', error.message);
  }
} else {
  console.log('⚠️  Telegram Bot disabled (no token provided)');
}

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`🚀 Amrikyy Travel Agent MVP Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 AI Chat: http://localhost:${PORT}/api/ai/chat`);
  console.log(`✈️  Trips API: http://localhost:${PORT}/api/trips`);
  console.log(`👤 Auth API: http://localhost:${PORT}/api/auth/login`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
