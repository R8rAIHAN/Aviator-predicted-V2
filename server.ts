import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('aviator.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS multiplier_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    multiplier REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    predicted_multiplier REAL,
    actual_multiplier REAL,
    risk_level TEXT,
    confidence INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS admin_settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  INSERT OR IGNORE INTO admin_settings (key, value) VALUES ('signal_sensitivity', 'medium');
`);

// Seed some initial data if empty
const historyCount = db.prepare('SELECT COUNT(*) as count FROM multiplier_history').get() as { count: number };
if (historyCount.count === 0) {
  const stmt = db.prepare('INSERT INTO multiplier_history (multiplier) VALUES (?)');
  for (let i = 0; i < 20; i++) {
    stmt.run((Math.random() * 5 + 1).toFixed(2));
  }
}

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'aviator-secret-key-123';

app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    (req as any).user = user;
    next();
  });
};

// API Routes
app.post('/api/auth/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    const role = userCount.count === 0 ? 'admin' : 'user';
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)');
    const result = stmt.run(username, email, hashedPassword, role);
    const token = jwt.sign({ id: result.lastInsertRowid, username, role }, JWT_SECRET);
    res.json({ token, user: { id: result.lastInsertRowid, username, email, role } });
  } catch (error) {
    res.status(400).json({ error: 'User already exists or invalid data' });
  }
});

// Simulate live game: add new multiplier every 10 seconds
setInterval(() => {
  const multiplier = (Math.random() * 4 + 1).toFixed(2);
  db.prepare('INSERT INTO multiplier_history (multiplier) VALUES (?)').run(multiplier);
  // Keep only last 100 records
  db.prepare('DELETE FROM multiplier_history WHERE id NOT IN (SELECT id FROM multiplier_history ORDER BY timestamp DESC LIMIT 100)').run();
}, 10000);

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET);
  res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
});

app.get('/api/history', (req, res) => {
  const history = db.prepare('SELECT * FROM multiplier_history ORDER BY timestamp DESC LIMIT 20').all();
  res.json(history);
});

app.get('/api/prediction', authenticateToken, (req, res) => {
  // Demo probability-based signal generation
  const sensitivity = db.prepare('SELECT value FROM admin_settings WHERE key = ?').get('signal_sensitivity') as any;
  
  let baseMultiplier = 1.5;
  let confidence = 75;
  let risk = 'Medium';

  if (sensitivity?.value === 'high') {
    baseMultiplier = 2.5;
    confidence = 60;
    risk = 'Risky';
  } else if (sensitivity?.value === 'low') {
    baseMultiplier = 1.2;
    confidence = 90;
    risk = 'Safe';
  }

  const predicted = (Math.random() * baseMultiplier + 1).toFixed(2);
  const conf = Math.floor(Math.random() * 20) + (confidence - 10);
  
  const prediction = {
    multiplier: parseFloat(predicted),
    confidence: conf,
    riskLevel: risk,
    timestamp: new Date().toISOString()
  };

  // Save prediction to history
  db.prepare('INSERT INTO predictions (user_id, predicted_multiplier, risk_level, confidence) VALUES (?, ?, ?, ?)')
    .run((req as any).user.id, prediction.multiplier, prediction.riskLevel, prediction.confidence);

  res.json(prediction);
});

app.get('/api/user/predictions', authenticateToken, (req, res) => {
  const predictions = db.prepare('SELECT * FROM predictions WHERE user_id = ? ORDER BY timestamp DESC LIMIT 10').all((req as any).user.id);
  res.json(predictions);
});

// Admin Routes
app.get('/api/admin/users', authenticateToken, (req, res) => {
  if ((req as any).user.role !== 'admin') return res.sendStatus(403);
  const users = db.prepare('SELECT id, username, email, role, created_at FROM users').all();
  res.json(users);
});

app.post('/api/admin/settings', authenticateToken, (req, res) => {
  if ((req as any).user.role !== 'admin') return res.sendStatus(403);
  const { key, value } = req.body;
  db.prepare('INSERT OR REPLACE INTO admin_settings (key, value) VALUES (?, ?)').run(key, value);
  res.json({ success: true });
});

app.post('/api/admin/reset-history', authenticateToken, (req, res) => {
  if ((req as any).user.role !== 'admin') return res.sendStatus(403);
  db.prepare('DELETE FROM multiplier_history').run();
  res.json({ success: true });
});

// Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
