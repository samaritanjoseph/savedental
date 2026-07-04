import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      service TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      patient_id INTEGER,
      doctor_id INTEGER
    )`, () => {
      // Gracefully attempt to add columns if they don't exist (for existing DBs)
      db.run(`ALTER TABLE appointments ADD COLUMN patient_id INTEGER`, () => {});
      db.run(`ALTER TABLE appointments ADD COLUMN doctor_id INTEGER`, () => {});
    });

    db.run(`CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      dob TEXT,
      allergies TEXT,
      medications TEXT,
      medical_conditions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS dental_charts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      tooth_number INTEGER NOT NULL,
      condition TEXT,
      treatment TEXT,
      notes TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      is_approved INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      before_url TEXT NOT NULL,
      after_url TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, () => {
      db.run(`ALTER TABLE gallery ADD COLUMN description TEXT`, () => {});
    });

    db.run(`CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'receptionist'
    )`, async (err) => {
      if (!err) {
        // Gracefully add columns to existing databases
        db.run(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'receptionist'`, () => {});
        db.run(`ALTER TABLE users ADD COLUMN name TEXT`, () => {});
        try {
          // Create default admin user if it doesn't exist
          const salt = await bcrypt.genSalt(10);
          const hash = await bcrypt.hash('password123', salt);
          db.run(`INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, ['Admin', 'admin@savedental.com', hash, 'admin']);
        } catch (error) {
          console.error('Failed to create default user:', error);
        }
      }
    });
  }
});

export default db;
