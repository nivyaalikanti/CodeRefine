# CodeRefine Backend Setup Guide

## Setup Instructions

### 1. **Replace MongoDB URI in `.env`**
   
   Update your `.env` file with your MongoDB Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/coderefine?retryWrites=true&w=majority
   ```

### 2. **Set JWT Secret in `.env`**
   
   Add a secure JWT secret (can be any random string):
   ```
   JWT_SECRET=your_super_secret_jwt_key_12345
   ```

### 3. **Install Dependencies**
   
   ```bash
   npm install
   ```

### 4. **Run Backend Server**
   
   In a terminal, run:
   ```bash
   npm run server
   ```
   
   Or for development with hot reload:
   ```bash
   npm run server:watch
   ```
   
   The server will run on `http://localhost:5000`

### 5. **Run Frontend (in another terminal)**
   
   ```bash
   npm run dev
   ```

## API Endpoints

### **Sign Up**
```
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "mongodb_user_id",
    "email": "user@example.com"
  }
}
```

### **Login**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "mongodb_user_id",
    "email": "user@example.com"
  }
}
```

## File Structure

```
├── server.ts              # Express backend server
├── services/
│   ├── authService.ts     # Frontend auth service (API calls)
│   └── geminiService.ts   # (existing)
├── components/
│   └── Auth.tsx           # (updated with backend integration)
├── .env                   # Environment variables
└── package.json           # (updated with backend dependencies)
```

## Key Features

✅ User registration with email/password
✅ Secure password hashing with bcryptjs
✅ JWT token-based authentication
✅ MongoDB Atlas database integration
✅ Error handling and validation
✅ CORS enabled for frontend communication
✅ Token stored in localStorage for persistence

## Database Schema

**User Collection:**
```
{
  _id: ObjectId,
  email: String (unique, lowercase),
  password: String (hashed),
  createdAt: Date
}
```

## Notes

- Tokens expire after 7 days
- Passwords are hashed using bcryptjs before storage
- All API calls are made to `http://localhost:5000/api`
- Auth token is automatically stored in localStorage
