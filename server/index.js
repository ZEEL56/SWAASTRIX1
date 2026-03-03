const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Load environment variables (optional but recommended for deployment)
require('dotenv').config();

// Initialize Firebase Admin using application default credentials
// For local dev, you can set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID || 'swaastrix1',
  });
}

const db = admin.firestore();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Middleware to verify Firebase ID token from frontend
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer (.+)$/);

  if (!match) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const idToken = match[1];

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('ID token verification failed:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'swaastrix-backend' });
});

// Build a large demo food dataset (100 items) without hardcoding every row
function buildDemoFoods() {
  const baseFoods = [
    { name: 'Turmeric Tea', category: 'Spice', dosha: 'pitta', benefit: 'anti-inflammatory' },
    { name: 'Ghee', category: 'Fat', dosha: 'vata', benefit: 'nourishing' },
    { name: 'Buttermilk', category: 'Dairy', dosha: 'kapha', benefit: 'light digestive' },
    { name: 'Coconut Water', category: 'Drink', dosha: 'pitta', benefit: 'cooling' },
    { name: 'Ginger', category: 'Spice', dosha: 'kapha', benefit: 'digestive fire' },
  ];

  return Array.from({ length: 100 }).map((_, index) => {
    const base = baseFoods[index % baseFoods.length];
    return {
      id: index + 1,
      name: `${base.name} #${index + 1}`,
      category: base.category,
      dosha: base.dosha,
      benefit: base.benefit,
    };
  });
}

// Get role and profile for currently authenticated user
app.get('/api/me', authenticate, async (req, res) => {
  try {
    const uid = req.user.uid;
    const email = req.user.email || '';

    // Optional hints from frontend to make demo richer without full signup
    const displayNameHint = (req.query.displayName || '').toString().trim();
    const roleHint = (req.query.roleHint || '').toString().trim();

    const displayName =
      displayNameHint ||
      req.user.name ||
      req.user.displayName ||
      (email ? email.split('@')[0] : 'Demo User');
    const userDoc = await db.collection('users').doc(uid).get();

    let role = roleHint || 'patient';
    let profileFromDb = null;

    if (userDoc.exists) {
      const data = userDoc.data();
      role = data.role || role;
      profileFromDb = data.profile || null;
    } else if (roleHint === 'doctor' || email.endsWith('@doctor.test')) {
      role = 'doctor';
    }

    // Fallback demo profile if none stored
    const foods = buildDemoFoods();
    const profile =
      profileFromDb ||
      (role === 'doctor'
        ? {
            name: displayName.startsWith('Dr.') ? displayName : `Dr. ${displayName}`,
            specialty: 'Ayurvedic Physician',
            totalPatients: 42,
            activePatients: 18,
            foodsTracked: foods.length,
          }
        : {
            name: displayName,
            primaryCondition: 'Chronic acidity and mild Pitta imbalance',
            currentWeightKg: 75,
            targetWeightKg: 70,
            weeklyCompliancePercent: 82,
            foodsTracked: foods.length,
          });

    res.json({
      uid,
      role,
      profile,
      foods,
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Failed to load user profile' });
  }
});

// Diet generator demo endpoint (rule-based, no real AI)
app.post('/api/diet/generate', authenticate, async (req, res) => {
  const { prakriti } = req.body || {};

  const basePlans = {
    vata: [
      'Warm oatmeal with ghee and nuts',
      'Root-vegetable stew with rice',
      'Herbal tea with ginger and cardamom',
    ],
    pitta: [
      'Cooling cucumber and mint salad',
      'Rice with steamed vegetables and ghee',
      'Coconut water or aloe vera juice',
    ],
    kapha: [
      'Spiced millet porridge (light breakfast)',
      'Mixed vegetable soup with black pepper',
      'Warm water with honey and ginger',
    ],
  };

  const key = (prakriti || 'vata').toLowerCase();
  const items = basePlans[key] || basePlans.vata;

  res.json({
    prakriti: key,
    meals: [
      { label: 'Breakfast', description: items[0] },
      { label: 'Lunch', description: items[1] },
      { label: 'Dinner', description: items[2] },
    ],
  });
});

// Basic patient list demo for doctors
app.get('/api/patients', authenticate, async (req, res) => {
  try {
    const role = req.user.role || req.user.customClaims?.role;

    // Only allow doctors/admins to see patients list
    if (role !== 'doctor' && role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const snapshot = await db.collection('patients').limit(20).get();
    const patients = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ patients });
  } catch (err) {
    console.error('Error fetching patients:', err);
    res.status(500).json({ error: 'Failed to load patients' });
  }
});

app.listen(PORT, () => {
  console.log(`SWAASTRIX backend listening on port ${PORT}`);
});

