# SWAASTRIX Migration Plan
## From Current Monolith to Scalable Microservices

### 🎯 Migration Strategy Overview

**Current State**: Single HTML file with embedded JavaScript
**Target State**: Scalable microservices architecture supporting 100k+ users

---

## 📋 Phase 1: Foundation Setup (Week 1-2)

### 1.1 Project Restructuring
```bash
# Create new project structure
mkdir swaastrix-scalable
cd swaastrix-scalable

# Frontend structure
mkdir -p frontend/{src/{components,services,store,utils,styles},public}
mkdir -p frontend/src/components/{common,doctor,patient,admin}
mkdir -p frontend/src/services/{api,cache,auth}

# Backend structure
mkdir -p backend/{services,gateway,shared,scripts}
mkdir -p backend/services/{auth,user,diet,ai,payment,notification}
mkdir -p backend/shared/{models,utils,middleware}
```

### 1.2 Package.json Setup
```json
// frontend/package.json
{
  "name": "swaastrix-frontend",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@reduxjs/toolkit": "^1.9.0",
    "react-redux": "^8.0.0",
    "react-router-dom": "^6.4.0",
    "axios": "^1.3.0",
    "firebase": "^9.15.0",
    "tailwindcss": "^3.2.0",
    "ioredis": "^5.3.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "jest",
    "test:coverage": "jest --coverage"
  }
}

// backend/package.json
{
  "name": "swaastrix-backend",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.0",
    "firebase-admin": "^11.5.0",
    "pg": "^8.8.0",
    "ioredis": "^5.3.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.0",
    "helmet": "^6.1.0",
    "cors": "^2.8.0",
    "dotenv": "^16.0.0"
  }
}
```

---

## 🏗️ Phase 2: Backend Microservices (Week 3-6)

### 2.1 Authentication Service
```javascript
// backend/services/auth/src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(process.env.FIREBASE_SERVICE_ACCOUNT),
});

// Routes
app.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Validate input
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // For demo, accept any credentials
    // In production, validate against database
    const user = {
      id: `user_${Date.now()}`,
      email,
      role,
      name: email.split('@')[0],
    };
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      user,
      token,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    const newToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});
```

### 2.2 User Service
```javascript
// backend/services/user/src/app.js
const express = require('express');
const { Pool } = require('pg');
const admin = require('firebase-admin');

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Get user profile
app.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
app.put('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, preferences, medicalHistory } = req.body;
    
    await pool.query(
      `UPDATE users 
       SET name = $1, preferences = $2, medical_history = $3, updated_at = NOW()
       WHERE id = $4`,
      [name, JSON.stringify(preferences), JSON.stringify(medicalHistory), userId]
    );
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});
```

### 2.3 Diet Service
```javascript
// backend/services/diet/src/app.js
const express = require('express');
const Redis = require('ioredis');

const app = express();
const redis = new Redis(process.env.REDIS_URL);

// Generate diet plan
app.post('/generate', async (req, res) => {
  try {
    const { prakriti, userId } = req.body;
    
    // Check cache first
    const cacheKey = `diet:${userId}:${prakriti}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    // Generate diet plan (simplified AI logic)
    const dietPlans = {
      vata: [
        { meal: 'Breakfast', item: 'Warm oatmeal with ghee and nuts' },
        { meal: 'Lunch', item: 'Vegetable khichdi with ginger' },
        { meal: 'Dinner', item: 'Mung dal soup with turmeric' },
      ],
      pitta: [
        { meal: 'Breakfast', item: 'Coconut milk rice with cardamom' },
        { meal: 'Lunch', item: 'Cucumber salad with cooling herbs' },
        { meal: 'Dinner', item: 'Bitter gourd with moong dal' },
      ],
      kapha: [
        { meal: 'Breakfast', item: 'Light millet porridge with honey' },
        { meal: 'Lunch', item: 'Steamed vegetables with lemon' },
        { meal: 'Dinner', item: 'Light soup with spices' },
      ],
    };
    
    const plan = dietPlans[prakriti] || dietPlans.vata;
    
    // Cache for 24 hours
    await redis.setex(cacheKey, 86400, JSON.stringify(plan));
    
    res.json({ plan });
  } catch (error) {
    console.error('Diet generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Diet service running on port ${PORT}`);
});
```

---

## 🎨 Phase 3: Frontend Refactoring (Week 7-10)

### 3.1 Extract Components from Current HTML

```javascript
// frontend/src/components/LoginForm.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginUser } from '../store/slices/auth';

export const LoginForm = () => {
  const [formData, setFormData] = useState({
    userType: '',
    username: '',
    password: '',
  });
  
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await dispatch(loginUser(formData));
      // Navigation handled by Redux state change
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-primary to-accent">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-4 text-primary">
          Welcome to SWAASTRIX
        </h2>
        
        <select
          value={formData.userType}
          onChange={(e) => setFormData({...formData, userType: e.target.value})}
          className="w-full p-3 border border-secondary rounded mb-4"
          required
        >
          <option value="">Select User Type</option>
          <option value="doctor">Doctor</option>
          <option value="patient">Patient</option>
          <option value="admin">Admin</option>
        </select>
        
        <input
          type="text"
          placeholder="Enter your username"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          className="w-full p-3 border border-secondary rounded mb-4"
          required
        />
        
        <input
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          className="w-full p-3 border border-secondary rounded mb-4"
          required
        />
        
        <button
          type="submit"
          className="w-full p-3 bg-primary text-white rounded font-semibold hover:bg-primary/90"
        >
          Login
        </button>
      </form>
    </div>
  );
};
```

### 3.2 Create Dashboard Components

```javascript
// frontend/src/components/doctor/DoctorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PatientList from './PatientList';
import DietGenerator from './DietGenerator';

export const DoctorDashboard = () => {
  const [activeSection, setActiveSection] = useState('patients');
  const user = useSelector(state => state.auth.user);

  return (
    <div className="flex h-screen">
      {/* Sidebar Navigation */}
      <nav className="w-64 bg-secondary p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Doctor Dashboard</h3>
        <ul className="space-y-3">
          <li>
            <button
              onClick={() => setActiveSection('patients')}
              className={`w-full text-left p-2 rounded hover:bg-primary/80 ${
                activeSection === 'patients' ? 'bg-primary/80' : ''
              }`}
            >
              Patient Management
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveSection('diet')}
              className={`w-full text-left p-2 rounded hover:bg-primary/80 ${
                activeSection === 'diet' ? 'bg-primary/80' : ''
              }`}
            >
              Diet Chart Generator
            </button>
          </li>
          {/* Add more navigation items */}
        </ul>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-6 bg-backgroundLight overflow-auto">
        {activeSection === 'patients' && <PatientList />}
        {activeSection === 'diet' && <DietGenerator />}
      </main>
    </div>
  );
};
```

---

## 🚀 Phase 4: Infrastructure Setup (Week 11-12)

### 4.1 Docker Configuration

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# backend/services/auth/Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001
CMD ["node", "src/app.js"]
```

### 4.2 Kubernetes Deployment

```yaml
# k8s/auth-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
      - name: auth-service
        image: swaastrix/auth-service:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: auth-service
spec:
  selector:
    app: auth-service
  ports:
  - port: 80
    targetPort: 3001
  type: ClusterIP
```

---

## 📊 Phase 5: Monitoring & Testing (Week 13-14)

### 5.1 Health Checks

```javascript
// backend/shared/health.js
const express = require('express');
const { Pool } = require('pg');
const Redis = require('ioredis');

const healthRouter = express.Router();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const redis = new Redis(process.env.REDIS_URL);

healthRouter.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {},
  };

  try {
    // Check database
    await pool.query('SELECT 1');
    health.services.database = 'healthy';
  } catch (error) {
    health.services.database = 'unhealthy';
    health.status = 'degraded';
  }

  try {
    // Check Redis
    await redis.ping();
    health.services.redis = 'healthy';
  } catch (error) {
    health.services.redis = 'unhealthy';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = healthRouter;
```

### 5.2 Load Testing Script

```javascript
// tests/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 500 },
    { duration: '5m', target: 500 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.1'],
  },
};

export default function () {
  // Test login
  const loginRes = http.post('http://localhost/api/auth/login', {
    email: 'test@example.com',
    password: 'test123',
    role: 'patient',
  });

  check(loginRes, {
    'login is status 200': (r) => r.status === 200,
    'login time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

---

## 📅 Implementation Timeline

| Week | Phase | Key Deliverables |
|------|--------|----------------|
| 1-2  | Foundation | Project structure, package.json, CI/CD setup |
| 3-6  | Backend Services | Auth, User, Diet, AI services |
| 7-10 | Frontend Refactor | React components, Redux store, routing |
| 11-12 | Infrastructure | Docker, Kubernetes, monitoring |
| 13-14 | Testing & Launch | Load testing, health checks, deployment |

---

## 🎯 Success Criteria

### Technical Metrics
- [ ] Response time < 200ms (p95)
- [ ] 99.9% uptime
- [ ] Support 10,000 concurrent users
- [ ] Auto-scaling functional
- [ ] Monitoring alerts working

### Business Metrics
- [ ] 100,000+ registered users
- [ ] 70%+ monthly active users
- [ ] < 1% error rate
- [ ] 4.5+ user satisfaction score

This migration plan provides a structured approach to transform SWAASTRIX from a monolithic HTML app to a scalable microservices architecture.
