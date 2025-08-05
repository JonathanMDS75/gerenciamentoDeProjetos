const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(auth);

// Listar todos os projetos
router.get('/', (req, res) => {
  const query = `
    SELECT p.*, u.name as manager_name,
           (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
           (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'completed') as completed_tasks
    FROM projects p
    LEFT JOIN users u ON p.manager_id = u.id
    ORDER BY p.created_at DESC
  `;

  db.all(query, (err, projects) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar projetos' });
    }
    res.json(projects);
  });
});

// Buscar projeto por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT p.*, u.name as manager_name
    FROM projects p
    LEFT JOIN users u ON p.manager_id = u.id
    WHERE p.id = ?
  `;

  db.get(query, [id], (err, project) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar projeto' });
    }
    
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }
    
    res.json(project);
  });
});

// Criar novo projeto
router.post('/', [
  body('name').notEmpty().withMessage('Nome do projeto é obrigatório'),
  body('description').optional(),
  body('priority').isIn(['low', 'medium', 'high']).withMessage('Prioridade inválida'),
  body('start_date').optional().isISO8601().withMessage('Data de início inválida'),
  body('end_date').optional().isISO8601().withMessage('Data de término inválida'),
  body('budget').optional().isNumeric().withMessage('Orçamento deve ser um número')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, priority, start_date, end_date, budget } = req.body;
    const manager_id = req.user.id;

    const query = `
      INSERT INTO projects (name, description, priority, start_date, end_date, budget, manager_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [name, description, priority, start_date, end_date, budget, manager_id], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Erro ao criar projeto' });
      }

      // Adicionar o criador como membro do projeto
      db.run('INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)', 
        [this.lastID, manager_id, 'manager']);

      res.status(201).json({
        message: 'Projeto criado com sucesso',
        projectId: this.lastID
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar projeto
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('Nome não pode ser vazio'),
  body('description').optional(),
  body('status').optional().isIn(['active', 'paused', 'completed', 'cancelled']).withMessage('Status inválido'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Prioridade inválida'),
  body('start_date').optional().isISO8601().withMessage('Data de início inválida'),
  body('end_date').optional().isISO8601().withMessage('Data de término inválida'),
  body('budget').optional().isNumeric().withMessage('Orçamento deve ser um número')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;
    updates.updated_at = new Date().toISOString();

    // Construir query dinamicamente
    const fields = Object.keys(updates).filter(key => key !== 'id');
    const values = fields.map(field => updates[field]);
    const setClause = fields.map(field => `${field} = ?`).join(', ');

    const query = `UPDATE projects SET ${setClause} WHERE id = ?`;

    db.run(query, [...values, id], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Erro ao atualizar projeto' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Projeto não encontrado' });
      }

      res.json({ message: 'Projeto atualizado com sucesso' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar projeto
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // Verificar se o usuário é o gerente do projeto ou admin
  db.get('SELECT manager_id FROM projects WHERE id = ?', [id], (err, project) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao verificar projeto' });
    }

    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    if (project.manager_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Apenas o gerente do projeto pode deletá-lo' });
    }

    // Deletar tarefas do projeto primeiro
    db.run('DELETE FROM tasks WHERE project_id = ?', [id], (err) => {
      if (err) {
        return res.status(500).json({ message: 'Erro ao deletar tarefas do projeto' });
      }

      // Deletar membros do projeto
      db.run('DELETE FROM project_members WHERE project_id = ?', [id], (err) => {
        if (err) {
          return res.status(500).json({ message: 'Erro ao deletar membros do projeto' });
        }

        // Deletar projeto
        db.run('DELETE FROM projects WHERE id = ?', [id], function(err) {
          if (err) {
            return res.status(500).json({ message: 'Erro ao deletar projeto' });
          }

          res.json({ message: 'Projeto deletado com sucesso' });
        });
      });
    });
  });
});

// Listar membros do projeto
router.get('/:id/members', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT u.id, u.name, u.email, pm.role, pm.joined_at
    FROM project_members pm
    JOIN users u ON pm.user_id = u.id
    WHERE pm.project_id = ?
    ORDER BY pm.joined_at
  `;

  db.all(query, [id], (err, members) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar membros' });
    }
    res.json(members);
  });
});

// Adicionar membro ao projeto
router.post('/:id/members', [
  body('user_id').isInt().withMessage('ID do usuário é obrigatório'),
  body('role').optional().isIn(['member', 'manager']).withMessage('Função inválida')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { user_id, role = 'member' } = req.body;

    // Verificar se o usuário existe
    db.get('SELECT id FROM users WHERE id = ?', [user_id], (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Erro ao verificar usuário' });
      }

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Adicionar membro
      db.run('INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)', 
        [id, user_id, role], function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ message: 'Usuário já é membro deste projeto' });
          }
          return res.status(500).json({ message: 'Erro ao adicionar membro' });
        }

        res.status(201).json({ message: 'Membro adicionado com sucesso' });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router; 