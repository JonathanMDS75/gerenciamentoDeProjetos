const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Tabela de usuários
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Tabela de projetos
      db.run(`CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'active',
        priority TEXT DEFAULT 'medium',
        start_date DATE,
        end_date DATE,
        budget DECIMAL(10,2),
        manager_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (manager_id) REFERENCES users (id)
      )`);

      // Tabela de tarefas
      db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        priority TEXT DEFAULT 'medium',
        due_date DATE,
        assigned_to INTEGER,
        project_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES users (id),
        FOREIGN KEY (project_id) REFERENCES projects (id)
      )`);

      // Tabela de membros do projeto
      db.run(`CREATE TABLE IF NOT EXISTS project_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        user_id INTEGER,
        role TEXT DEFAULT 'member',
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id),
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE(project_id, user_id)
      )`);

      // Inserir usuário administrador padrão
      const adminPassword = bcrypt.hashSync('admin123', 10);
      db.run(`INSERT OR IGNORE INTO users (name, email, password, role) 
               VALUES ('Administrador', 'admin@projeto.com', ?, 'admin')`, 
               [adminPassword], (err) => {
        if (err) {
          console.error('Erro ao criar usuário admin:', err);
        } else {
          console.log('✅ Banco de dados inicializado com sucesso');
          console.log('👤 Usuário admin criado: admin@projeto.com / admin123');
        }
      });

      resolve();
    });
  });
};

module.exports = { initDatabase, db }; 