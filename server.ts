import express, { Express, Request, Response } from 'express';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || '';
console.log('🔗 Attempting to connect to MongoDB...');
console.log('📍 MongoDB URI:', mongoUri.substring(0, 50) + '...'); // Log partial URI for security

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as any);
  }
});

const User = mongoose.model('User', userSchema);

// Signup
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user
    const newUser = new User({ email, password });
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET || 'default_secret_key',
      { expiresIn: '7d' }
    );

    console.log(`✅ User registered: ${email}`);
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
      },
    });
  } catch (error) {
    const err = error as any;
    console.error('❌ Signup error:', err.message || error);
    res.status(500).json({ error: err.message || 'Server error during signup' });
  }
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'default_secret_key',
      { expiresIn: '7d' }
    );

    console.log(`✅ User logged in: ${email}`);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    const err = error as any;
    console.error('❌ Login error:', err.message || error);
    res.status(500).json({ error: err.message || 'Server error during login' });
  }
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log(`║ 🚀 Server running on port ${PORT}       ║`);
  console.log(`║ 📍 http://localhost:${PORT}             ║`);
  console.log('║ 💾 Ready to accept requests             ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
});
