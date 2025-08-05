const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(auth);

// Listar todos os usuários (apenas admin)
router.get('/', adminAuth, (req, res) => {
  const query = `
    SELECT id, name, email, role, created_at, updated_at
    FROM users
    ORDER BY name
  `;

  db.all(query, (err, users) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar usuários' });
    }
    res.json(users);
  });
});

// Buscar usuário por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  // Usuários só podem ver seus próprios dados, exceto admins
  if (req.user.id != id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado' });
  }

  const query = `
    SELECT id, name, email, role, created_at, updated_at
    FROM users
    WHERE id = ?
  `;

  db.get(query, [id], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar usuário' });
    }
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    res.json(user);
  });
});

// Atualizar perfil do usuário
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('Nome não pode ser vazio'),
  body('email').optional().isEmail().withMessage('Email inválido')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    
    // Usuários só podem atualizar seus próprios dados, exceto admins
    if (req.user.id != id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const updates = req.body;
    updates.updated_at = new Date().toISOString();

    // Construir query dinamicamente
    const fields = Object.keys(updates).filter(key => key !== 'id');
    const values = fields.map(field => updates[field]);
    const setClause = fields.map(field => `${field} = ?`).join(', ');

    const query = `UPDATE users SET ${setClause} WHERE id = ?`;

    db.run(query, [...values, id], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Erro ao atualizar usuário' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      res.json({ message: 'Usuário atualizado com sucesso' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar usuário (apenas admin)
router.delete('/:id', adminAuth, (req, res) => {
  const { id } = req.params;

  // Não permitir deletar o próprio usuário admin
  if (req.user.id == id) {
    return res.status(400).json({ message: 'Não é possível deletar sua própria conta' });
  }

  // Verificar se o usuário tem projetos como gerente
  db.get('SELECT COUNT(*) as count FROM projects WHERE manager_id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao verificar projetos do usuário' });
    }

    if (result.count > 0) {
      return res.status(400).json({ 
        message: 'Não é possível deletar usuário que é gerente de projetos' 
      });
    }

    // Deletar usuário
    db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Erro ao deletar usuário' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      res.json({ message: 'Usuário deletado com sucesso' });
    });
  });
});

// Buscar projetos do usuário
router.get('/:id/projects', (req, res) => {
  const { id } = req.params;
  
  // Usuários só podem ver seus próprios projetos, exceto admins
  if (req.user.id != id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado' });
  }

  const query = `
    SELECT p.*, pm.role as member_role
    FROM projects p
    JOIN project_members pm ON p.id = pm.project_id
    WHERE pm.user_id = ?
    ORDER BY p.created_at DESC
  `;

  db.all(query, [id], (err, projects) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar projetos do usuário' });
    }
    res.json(projects);
  });
});

// Buscar tarefas do usuário
router.get('/:id/tasks', (req, res) => {
  const { id } = req.params;
  
  // Usuários só podem ver suas próprias tarefas, exceto admins
  if (req.user.id != id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado' });
  }

  const query = `
    SELECT t.*, p.name as project_name
    FROM tasks t
    LEFT JOIN projects p ON t.project_id = p.id
    WHERE t.assigned_to = ?
    ORDER BY t.due_date ASC, t.priority DESC
  `;

  db.all(query, [id], (err, tasks) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar tarefas do usuário' });
    }
    res.json(tasks);
  });
});

// Estatísticas do usuário
router.get('/:id/stats', (req, res) => {
  const { id } = req.params;
  
  // Usuários só podem ver suas próprias estatísticas, exceto admins
  if (req.user.id != id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado' });
  }

  const statsQuery = `
    SELECT 
      (SELECT COUNT(*) FROM project_members WHERE user_id = ?) as total_projects,
      (SELECT COUNT(*) FROM tasks WHERE assigned_to = ?) as total_tasks,
      (SELECT COUNT(*) FROM tasks WHERE assigned_to = ? AND status = 'completed') as completed_tasks,
      (SELECT COUNT(*) FROM tasks WHERE assigned_to = ? AND status = 'pending') as pending_tasks,
      (SELECT COUNT(*) FROM tasks WHERE assigned_to = ? AND status = 'in_progress') as in_progress_tasks
  `;

  db.get(statsQuery, [id, id, id, id, id], (err, stats) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar estatísticas do usuário' });
    }
    res.json(stats);
  });
});

module.exports = router; 