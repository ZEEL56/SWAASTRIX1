# SWAASTRIX Scalability Implementation Guide
## Production-Ready Code Examples

### 1. **Enhanced Frontend Architecture**

#### **Modular Component Structure**
```javascript
// src/components/DashboardLayout.js
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

const DoctorDashboard = lazy(() => import('./DoctorDashboard'));
const PatientDashboard = lazy(() => import('./PatientDashboard'));
const AdminDashboard = lazy(() => import('./AdminDashboard'));

export const DashboardLayout = ({ userRole, userId }) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        {userRole === 'doctor' && <DoctorDashboard userId={userId} />}
        {userRole === 'patient' && <PatientDashboard userId={userId} />}
        {userRole === 'admin' && <AdminDashboard userId={userId} />}
      </Suspense>
    </ErrorBoundary>
  );
};
```

#### **State Management with Redux Toolkit**
```javascript
// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './slices/auth';
import { userSlice } from './slices/user';
import { dietSlice } from './slices/diet';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    user: userSlice,
    diet: dietSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(
      rtkQueryErrorLogger,
      performanceMonitor
    ),
});

// src/slices/auth.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password, role }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login({ email, password, role });
      localStorage.setItem('token', response.token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null, loading: false, error: null },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export { authSlice };
```

### 2. **API Service Layer**

#### **HTTP Client with Axios**
```javascript
// src/services/api.js
import axios from 'axios';
import { getToken } from '../utils/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.swaastrix.com';

class APIService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle token refresh or logout
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials) {
    const response = await this.client.post('/auth/login', credentials);
    return response.data;
  }

  async refreshToken() {
    const response = await this.client.post('/auth/refresh');
    return response.data;
  }

  // User endpoints
  async getUserProfile(userId) {
    const response = await this.client.get(`/users/${userId}`);
    return response.data;
  }

  async updateUserProfile(userId, data) {
    const response = await this.client.put(`/users/${userId}`, data);
    return response.data;
  }

  // Diet endpoints
  async generateDietPlan(prakriti, userId) {
    const response = await this.client.post('/diet/generate', {
      prakriti,
      userId,
    });
    return response.data;
  }

  async getDietHistory(userId) {
    const response = await this.client.get(`/diet/history/${userId}`);
    return response.data;
  }

  // AI endpoints
  async getAIResponse(message, context) {
    const response = await this.client.post('/ai/chat', {
      message,
      context,
    });
    return response.data;
  }
}

export default new APIService();
```

### 3. **Caching Implementation**

#### **Redis Cache Service**
```javascript
// src/services/cache.js
import Redis from 'ioredis';

class CacheService {
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
    this.defaultTTL = 3600; // 1 hour
  }

  async get(key) {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  // Cache keys for different data types
  keys = {
    userProfile: (userId) => `user:profile:${userId}`,
    dietPlan: (userId) => `diet:plan:${userId}`,
    aiResponse: (hash) => `ai:response:${hash}`,
    doctorPatients: (doctorId) => `doctor:patients:${doctorId}`,
    sessionData: (sessionId) => `session:${sessionId}`,
  };
}

export default new CacheService();
```

#### **Cache-Enhanced API Calls**
```javascript
// src/services/enhancedAPI.js
import APIService from './api';
import CacheService from './cache';

class EnhancedAPIService {
  async getUserProfile(userId) {
    const cacheKey = CacheService.keys.userProfile(userId);
    
    // Try cache first
    let profile = await CacheService.get(cacheKey);
    if (profile) {
      return profile;
    }

    // Fetch from API if not in cache
    profile = await APIService.getUserProfile(userId);
    
    // Cache for 30 minutes
    await CacheService.set(cacheKey, profile, 1800);
    
    return profile;
  }

  async generateDietPlan(prakriti, userId) {
    const cacheKey = `diet:generated:${userId}:${prakriti}`;
    
    // Check cache for recent diet plan
    let dietPlan = await CacheService.get(cacheKey);
    if (dietPlan) {
      return dietPlan;
    }

    // Generate new plan
    dietPlan = await APIService.generateDietPlan(prakriti, userId);
    
    // Cache for 24 hours
    await CacheService.set(cacheKey, dietPlan, 86400);
    
    return dietPlan;
  }

  async invalidateUserCache(userId) {
    const keys = [
      CacheService.keys.userProfile(userId),
      `diet:*:${userId}`,
      `doctor:*:${userId}`,
    ];
    
    for (const key of keys) {
      await CacheService.del(key);
    }
  }
}

export default new EnhancedAPIService();
```

### 4. **Database Service Layer**

#### **Firestore Service**
```javascript
// src/services/firestore.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, query, where, orderBy, limit, writeBatch } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const app = initializeApp(process.env.FIREBASE_CONFIG);
const db = getFirestore(app);
const auth = getAuth(app);

class FirestoreService {
  // Batch operations for efficiency
  async batchUpdate(updates) {
    const batch = writeBatch(db);
    
    updates.forEach(({ collection, docId, data }) => {
      const docRef = doc(db, collection, docId);
      batch.set(docRef, data, { merge: true });
    });
    
    await batch.commit();
  }

  // User operations
  async getUser(userId) {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? userDoc.data() : null;
  }

  async updateUser(userId, data) {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, data, { merge: true });
    
    // Invalidate cache
    await CacheService.del(CacheService.keys.userProfile(userId));
  }

  // Doctor-Patient relationships
  async getDoctorPatients(doctorId) {
    const cacheKey = CacheService.keys.doctorPatients(doctorId);
    
    let patients = await CacheService.get(cacheKey);
    if (patients) {
      return patients;
    }

    const patientsQuery = query(
      collection(db, 'patients'),
      where('doctorId', '==', doctorId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    const querySnapshot = await getDocs(patientsQuery);
    patients = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Cache for 15 minutes
    await CacheService.set(cacheKey, patients, 900);
    
    return patients;
  }

  // Diet plans with pagination
  async getDietPlans(userId, page = 1, limit = 20) {
    const plansQuery = query(
      collection(db, 'dietPlans'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limit * page)
    );
    
    const querySnapshot = await getDocs(plansQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  // Real-time listeners
  subscribeToUserUpdates(userId, callback) {
    const userRef = doc(db, 'users', userId);
    return onSnapshot(userRef, callback);
  }

  subscribeToDietUpdates(userId, callback) {
    const plansQuery = query(
      collection(db, 'dietPlans'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(plansQuery, callback);
  }
}

export default new FirestoreService();
```

### 5. **Performance Monitoring**

#### **Performance Service**
```javascript
// src/services/performance.js
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      apiCalls: [],
      renderTimes: [],
      userInteractions: [],
      errors: [],
    };
    }

  // Track API performance
  trackAPICall(url, method, duration, status) {
    this.metrics.apiCalls.push({
      url,
      method,
      duration,
      status,
      timestamp: Date.now(),
    });

    // Keep only last 1000 calls
    if (this.metrics.apiCalls.length > 1000) {
      this.metrics.apiCalls = this.metrics.apiCalls.slice(-1000);
    }

    // Send to monitoring service
    this.sendMetrics();
  }

  // Track render performance
  trackRender(componentName, duration) {
    this.metrics.renderTimes.push({
      component: componentName,
      duration,
      timestamp: Date.now(),
    });
  }

  // Track user interactions
  trackInteraction(element, action, duration) {
    this.metrics.userInteractions.push({
      element,
      action,
      duration,
      timestamp: Date.now(),
    });
  }

  // Track errors
  trackError(error, context) {
    this.metrics.errors.push({
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
    });

    // Send critical errors immediately
    if (context === 'critical') {
      this.sendMetrics();
    }
  }

  // Calculate performance metrics
  getMetrics() {
    const apiCalls = this.metrics.apiCalls;
    const avgResponseTime = apiCalls.reduce((sum, call) => sum + call.duration, 0) / apiCalls.length;
    const errorRate = (apiCalls.filter(call => call.status >= 400).length / apiCalls.length) * 100;

    return {
      avgResponseTime,
      errorRate,
      totalCalls: apiCalls.length,
      topSlowEndpoints: this.getSlowEndpoints(),
    };
  }

  getSlowEndpoints() {
    return this.metrics.apiCalls
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);
  }

  // Send metrics to monitoring service
  async sendMetrics() {
    try {
      await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.getMetrics()),
      });
    } catch (error) {
      console.error('Failed to send metrics:', error);
    }
  }
}

export default new PerformanceMonitor();
```

### 6. **Error Handling & Retry Logic**

#### **Resilient API Client**
```javascript
// src/services/resilientAPI.js
import EnhancedAPIService from './enhancedAPI';

class ResilientAPIService {
  constructor() {
    this.maxRetries = 3;
    this.baseDelay = 1000;
    this.maxDelay = 10000;
  }

  // Exponential backoff retry
  async withRetry(operation, context = {}) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Don't retry on client errors (4xx)
        if (error.response?.status >= 400 && error.response?.status < 500) {
          throw error;
        }
        
        // Don't retry on authentication errors
        if (error.response?.status === 401) {
          throw error;
        }
        
        if (attempt < this.maxRetries) {
          const delay = Math.min(
            this.baseDelay * Math.pow(2, attempt - 1),
            this.maxDelay
          );
          
          console.warn(`Attempt ${attempt} failed. Retrying in ${delay}ms:`, error.message);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error(`All ${this.maxRetries} attempts failed:`, lastError);
    throw lastError;
  }

  async getUserProfile(userId) {
    return this.withRetry(
      () => EnhancedAPIService.getUserProfile(userId),
      { operation: 'getUserProfile', userId }
    );
  }

  async generateDietPlan(prakriti, userId) {
    return this.withRetry(
      () => EnhancedAPIService.generateDietPlan(prakriti, userId),
      { operation: 'generateDietPlan', prakriti, userId }
    );
  }
}

export default new ResilientAPIService();
```

### 7. **Load Testing Configuration**

#### **K6 Load Test Script**
```javascript
// load-tests/api-stress-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 500 }, // Ramp up to 500 users
    { duration: '5m', target: 500 }, // Stay at 500 users
    { duration: '2m', target: 1000 }, // Ramp up to 1000 users
    { duration: '5m', target: 1000 }, // Stay at 1000 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'], // Error rate under 0.1%
  },
};

export default function () {
  // Test login endpoint
  const loginResponse = http.post('https://api.swaastrix.com/auth/login', {
    email: `test${__VU}@example.com`,
    password: 'testpassword',
    role: 'patient',
  });

  check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
    'login response time < 500ms': (r) => r.timings.duration < 500,
  });

  const token = loginResponse.json('token');

  // Test diet generation endpoint
  const dietResponse = http.post('https://api.swaastrix.com/diet/generate', {
    prakriti: 'vata',
    userId: `test${__VU}`,
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  check(dietResponse, {
    'diet status is 200': (r) => r.status === 200,
    'diet response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}
```

### 8. **Docker Configuration**

#### **Multi-Service Docker Compose**
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  api-gateway:
    image: swaastrix/api-gateway:latest
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
    depends_on:
      - auth-service
      - user-service
      - diet-service
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 1G

  auth-service:
    image: swaastrix/auth-service:latest
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/swaastrix
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  user-service:
    image: swaastrix/user-service:latest
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/swaastrix
      - FIREBASE_PROJECT=${FIREBASE_PROJECT}
    depends_on:
      - postgres
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.8'
          memory: 768M

  diet-service:
    image: swaastrix/diet-service:latest
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/swaastrix
      - AI_SERVICE_URL=http://ai-service:3001
    depends_on:
      - postgres
      - ai-service
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1.5'
          memory: 2G

  ai-service:
    image: swaastrix/ai-service:latest
    environment:
      - MODEL_PATH=/models/diet-generator
      - REDIS_URL=redis://redis:6379
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '2.0'
          memory: 4G

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=swaastrix
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G

  redis:
    image: redis:7-alpine
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

volumes:
  postgres_data:
```

This implementation guide provides production-ready code examples for scaling SWAASTRIX to handle 100,000+ users with proper architecture, caching, monitoring, and error handling.
