-- users: Firebase UID is the primary identity
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('doctor','patient','admin')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- patients linked to users; each patient belongs to a doctor (user)
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doctor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  condition TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- foods
CREATE TABLE IF NOT EXISTS foods (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  calories NUMERIC NOT NULL DEFAULT 0,
  protein NUMERIC NOT NULL DEFAULT 0,
  carbs NUMERIC NOT NULL DEFAULT 0,
  fat NUMERIC NOT NULL DEFAULT 0,
  ayurvedic_properties TEXT
);

-- diet charts (per patient)
CREATE TABLE IF NOT EXISTS diet_charts (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- diet items (food + quantity grams)
CREATE TABLE IF NOT EXISTS diet_items (
  id SERIAL PRIMARY KEY,
  diet_chart_id INTEGER NOT NULL REFERENCES diet_charts(id) ON DELETE CASCADE,
  food_id INTEGER NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  quantity_g NUMERIC NOT NULL CHECK (quantity_g > 0)
);

INSERT INTO foods (name, calories, protein, carbs, fat, ayurvedic_properties) VALUES
('Oats', 389, 16.9, 66.3, 6.9, 'Vata balancing, grounding'),
('Quinoa', 368, 14.1, 64.2, 6.1, 'Tridoshic, light'),
('Lentils', 353, 25.8, 60.1, 1.1, 'Vata/Pitta balancing'),
('Coconut Water', 19, 0.7, 3.7, 0.2, 'Cooling, Pitta balancing')
ON CONFLICT (name) DO NOTHING;

-- =========================
-- USERS
-- =========================
DROP TABLE IF EXISTS payments, diet_charts, patient_history, patients, users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin','doctor','patient')) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (firebase_uid, name, email, role) VALUES
('uid_1','Admin User','admin@swaastrix.com','admin'),
('uid_2','Dr. Meera Sharma','meera@swaastrix.com','doctor'),
('uid_3','Dr. Raj Patel','raj@swaastrix.com','doctor'),
('uid_4','Patient One','p1@mail.com','patient'),
('uid_5','Patient Two','p2@mail.com','patient'),
('uid_6','Patient Three','p3@mail.com','patient'),
('uid_7','Patient Four','p4@mail.com','patient'),
('uid_8','Patient Five','p5@mail.com','patient'),
('uid_9','Patient Six','p6@mail.com','patient'),
('uid_10','Patient Seven','p7@mail.com','patient');

-- =========================
-- PATIENTS
-- =========================
CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  age INT,
  prakriti TEXT CHECK (prakriti IN ('Vata','Pitta','Kapha')),
  condition TEXT,
  doctor_id INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO patients (name, age, prakriti, condition, doctor_id) VALUES
('Ravi Kumar',35,'Vata','Vata Imbalance',2),
('Priya Sharma',28,'Pitta','Acidity',2),
('Amit Verma',42,'Kapha','Weight Gain',3),
('Neha Joshi',31,'Vata','Insomnia',2),
('Suresh Patel',55,'Kapha','Diabetes',3),
('Kiran Shah',26,'Pitta','Skin Issues',2),
('Anjali Mehta',39,'Vata','Anxiety',2),
('Rahul Nair',33,'Kapha','Low Energy',3),
('Pooja Singh',29,'Pitta','Migraine',2),
('Vikram Rao',47,'Vata','Joint Pain',3);

-- =========================
-- PATIENT HISTORY (Timeline)
-- =========================
CREATE TABLE patient_history (
  id SERIAL PRIMARY KEY,
  patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  visit_date DATE DEFAULT CURRENT_DATE
);

INSERT INTO patient_history (patient_id, note) VALUES
(1,'Initial consultation'),
(1,'Diet adjusted for digestion'),
(2,'Acidity reduced'),
(3,'Weight monitoring started'),
(4,'Sleep improved'),
(5,'Sugar levels stable'),
(6,'Skin condition improving'),
(7,'Stress reduced'),
(8,'Energy levels better'),
(9,'Migraine frequency reduced'),
(10,'Joint pain less severe');

-- =========================
-- DIET CHARTS
-- =========================
CREATE TABLE diet_charts (
  id SERIAL PRIMARY KEY,
  patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
  prakriti TEXT,
  diet JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO diet_charts (patient_id, prakriti, diet) VALUES
(1,'Vata','{"breakfast":"Oats with ghee","lunch":"Khichdi","dinner":"Vegetable soup"}'),
(2,'Pitta','{"breakfast":"Fruit bowl","lunch":"Rice & dal","dinner":"Steamed veggies"}'),
(3,'Kapha','{"breakfast":"Warm tea","lunch":"Millet roti","dinner":"Light soup"}'),
(4,'Vata','{"breakfast":"Upma","lunch":"Rice curry","dinner":"Dal"}'),
(5,'Kapha','{"breakfast":"Herbal tea","lunch":"Vegetable curry","dinner":"Soup"}'),
(6,'Pitta','{"breakfast":"Papaya","lunch":"Chapati","dinner":"Salad"}'),
(7,'Vata','{"breakfast":"Milk porridge","lunch":"Khichdi","dinner":"Soup"}'),
(8,'Kapha','{"breakfast":"Green tea","lunch":"Brown rice","dinner":"Steamed veg"}'),
(9,'Pitta','{"breakfast":"Apple","lunch":"Dal rice","dinner":"Soup"}'),
(10,'Vata','{"breakfast":"Oatmeal","lunch":"Vegetable rice","dinner":"Light curry"}');

-- =========================
-- PAYMENTS (INR)
-- =========================
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  patient_id INT REFERENCES patients(id),
  amount_inr NUMERIC(10,2),
  status TEXT CHECK (status IN ('pending','paid')),
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO payments (patient_id, amount_inr, status) VALUES
(1,500,'pending'),
(2,800,'paid'),
(3,600,'pending'),
(4,700,'paid'),
(5,1000,'pending'),
(6,450,'paid'),
(7,550,'pending'),
(8,650,'paid'),
(9,900,'pending'),
(10,750,'paid');
