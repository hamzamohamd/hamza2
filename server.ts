import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // Initialize Database
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT,
      email TEXT,
      phone TEXT
    );
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      goal_amount REAL,
      raised_amount REAL DEFAULT 0,
      charity_id INTEGER,
      start_date TEXT,
      end_date TEXT,
      FOREIGN KEY(charity_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      donor_id INTEGER,
      campaign_id INTEGER,
      amount REAL,
      date TEXT,
      payment_method TEXT,
      FOREIGN KEY(donor_id) REFERENCES users(id),
      FOREIGN KEY(campaign_id) REFERENCES campaigns(id)
    );
  `);

  // Seed Data
  const existingUsers = await db.all("SELECT * FROM users");
  if (existingUsers.length === 0) {
    await db.run("INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)", ["admin", "admin123", "admin", "admin@sys.com"]);
    await db.run("INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)", ["charity1", "pass123", "charity", "impact@org.com"]);
    await db.run("INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)", ["donor1", "pass123", "donor", "john@user.com"]);

    await db.run("INSERT INTO campaigns (title, description, goal_amount, raised_amount, charity_id) VALUES (?, ?, ?, ?, ?)", 
      ["Global Hunger Response", "Distributing meals to vulnerable communities worldwide.", 50000, 12500, 2]);
    await db.run("INSERT INTO campaigns (title, description, goal_amount, raised_amount, charity_id) VALUES (?, ?, ?, ?, ?)", 
      ["Clean Water Access", "Building sustainable water systems in rural areas.", 25000, 8000, 2]);
    await db.run("INSERT INTO campaigns (title, description, goal_amount, raised_amount, charity_id) VALUES (?, ?, ?, ?, ?)", 
      ["Youth Education Fund", "Scholarships for underprivileged students.", 100000, 45000, 2]);
  }

  // API Routes
  app.get("/api/campaigns", async (req, res) => {
    const campaigns = await db.all("SELECT * FROM campaigns ORDER BY id DESC");
    res.json(campaigns);
  });

  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password]);
    if (user) {
      res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  app.post("/api/donate", async (req, res) => {
    const { donor_id, campaign_id, amount, method } = req.body;
    await db.run(
      "INSERT INTO donations (donor_id, campaign_id, amount, date, payment_method) VALUES (?, ?, ?, datetime('now'), ?)",
      [donor_id, campaign_id, amount, method]
    );
    await db.run("UPDATE campaigns SET raised_amount = raised_amount + ? WHERE id = ?", [amount, campaign_id]);
    res.json({ success: true });
  });

  app.get("/api/stats", async (req, res) => {
    const total = await db.get("SELECT SUM(amount) as total FROM donations");
    const users = await db.get("SELECT COUNT(*) as count FROM users");
    const camps = await db.get("SELECT COUNT(*) as count FROM campaigns");
    res.json({ total: total.total || 0, users: users.count, campaigns: camps.count });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
