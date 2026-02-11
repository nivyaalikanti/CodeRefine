# CodeRefine – Generative AI Powered Code Review and Optimization Engine

## Overview

**CodeRefine** is an intelligent code improvement platform that analyzes source code and suggests optimizations, refactoring improvements, and best practice enhancements to improve readability, efficiency, security, and maintainability.

The system leverages Generative AI models to automatically review and enhance code quality across multiple programming languages.

---

## Features

**Automated Code Review**
Analyzes code structure and identifies best practice violations.

**Bug Detection**
Detects logical errors, syntax risks, and potential runtime failures.

**Performance Optimization**
Identifies inefficient logic and suggests optimized implementations.

**Secure Coding Checks**
Flags security vulnerabilities such as injection risks and unsafe patterns.

**AI Powered Code Rewriting**
Generates improved and optimized versions of the submitted code.

---

## Tech Stack

**Frontend**
React
CSS

**Backend**
FastAPI, Node JS

**AI Integration**
Gemini


**Authentication**
JWT

---

## System Architecture

The frontend allows users to submit source code.
The backend processes the request and sends the code to the selected AI model.
The AI model analyzes the code and returns structured feedback including detected issues and optimized rewrites.

---

## Screenshots

### Home Page

![Home Page](screenshots/home.png)

### Code Analysis Interface

![Code Analysis](screenshots/analysis.png)

### Optimized Code Output

![Optimized Output](screenshots/output.png)

---

## How to Run Locally

### Step 1: Clone the Repository

git clone [https://github.com/yourusername/CodeRefine.git](https://github.com/yourusername/CodeRefine.git)
cd CodeRefine

### Step 2: Install Dependencies

npm install

### Step 3: Create Environment File

Create a .env file in the root directory and add:

GEMINI_API_KEY=your_key
MONGODB_URI=your_url
JWT_SECRET=your_secret

### Step 4: Run the Application

npm run dev

---

## Future Improvements

Add real time collaboration
Integrate CI CD pipelines
Add code complexity scoring
Support more programming languages

---

If you tell me your GitHub username and actual screenshot names, I can customize this exactly for your repository.
