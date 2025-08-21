const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(auth);

// Listar todas as tarefas
router.get('/', (req, res) => {
  const { project_id, status, assigned_to } = req.query;
  
  let query = `
    SELECT t.*, u.name as assigned_to_name, p.name as project_name
    FROM tasks t
    LEFT JOIN users u ON t.assigned_to = u.id
    LEFT JOIN projects p ON t.project_id = p.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (project_id) {
    query += ' AND t.project_id = ?';
    params.push(project_id);
  }
  
  if (status) {
    query += ' AND t.status = ?';
    params.push(status);
  }
  
  if (assigned_to) {
    query += ' AND t.assigned_to = ?';
    params.push(assigned_to);
  }
  
  query += ' ORDER BY t.due_date ASC, t.priority DESC';

  db.all(query, params, (err, tasks) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar tarefas' });
    }
    res.json(tasks);
  });
});

// Buscar tarefa por ID
router.get('/projects/:id/tasks', (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT t.*, u.name as assigned_to_name, p.name as project_name
    FROM tasks t
    LEFT JOIN users u ON t.assigned_to = u.id
    LEFT JOIN projects p ON t.project_id = p.id
    WHERE t.id = ?
  `;

  db.get(query, [id], (err, task) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar tarefa' });
    }
    
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }
    
    res.json(task);
  });
});

// Criar nova tarefa
router.post('/', [
  body('title').notEmpty().withMessage('Título da tarefa é obrigatório'),
  body('description').optional(),
  body('priority').isIn(['low', 'medium', 'high']).withMessage('Prioridade inválida'),
  body('due_date').optional().isISO8601().withMessage('Data de vencimento inválida'),
  body('assigned_to').optional().isInt().withMessage('ID do usuário atribuído inválido'),
  body('project_id').isInt().withMessage('ID do projeto é obrigatório')
], (req, res) => {
  try {
    const { title, description, priority, due_date, assigned_to, project_id } = req.body;

    // Verificar se o projeto existe
    db.get('SELECT id FROM projects WHERE id = ?', [project_id], (err, project) => {
      if (err) {
        return res.status(500).json({ message: 'Erro ao verificar projeto' });
      }

      if (!project) {
        return res.status(404).json({ message: 'Projeto não encontrado' });
      }

      // Verificar se o usuário atribuído existe (se fornecido)
      if (assigned_to) {
        db.get('SELECT id FROM users WHERE id = ?', [assigned_to], (err, user) => {
          if (err) {
            return res.status(500).json({ message: 'Erro ao verificar usuário' });
          }

          if (!user) {
            return res.status(404).json({ message: 'Usuário atribuído não encontrado' });
          }

          createTask();
        });
      } else {
        createTask();
      }

      function createTask() {
        const query = `
          INSERT INTO tasks (title, description, priority, due_date, assigned_to, project_id)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.run(query, [title, description, priority, due_date, assigned_to, project_id], function(err) {
          if (err) {
            return res.status(500).json({ message: 'Erro ao criar tarefa' });
          }

          res.status(201).json({
            message: 'Tarefa criada com sucesso',
            taskId: this.lastID
          });
        });
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar tarefa
router.put('/:id', [
  body('title').optional().notEmpty().withMessage('Título não pode ser vazio'),
  body('description').optional(),
  body('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Status inválido'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Prioridade inválida'),
  body('due_date').optional().isISO8601().withMessage('Data de vencimento inválida'),
  body('assigned_to').optional().isInt().withMessage('ID do usuário atribuído inválido')
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

    const query = `UPDATE tasks SET ${setClause} WHERE id = ?`;

    db.run(query, [...values, id], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Erro ao atualizar tarefa' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Tarefa não encontrada' });
      }

      res.json({ message: 'Tarefa atualizada com sucesso' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar tarefa
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erro ao deletar tarefa' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    res.json({ message: 'Tarefa deletada com sucesso' });
  });
});

// Marcar tarefa como concluída
router.patch('/:id/complete', (req, res) => {
  const { id } = req.params;

  db.run('UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?', 
    ['completed', new Date().toISOString(), id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erro ao marcar tarefa como concluída' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    res.json({ message: 'Tarefa marcada como concluída' });
  });
});

// Estatísticas de tarefas
router.get('/stats/overview', (req, res) => {
  const { project_id } = req.query;
  
  let whereClause = '';
  const params = [];
  
  if (project_id) {
    whereClause = 'WHERE project_id = ?';
    params.push(project_id);
  }

  const query = `
    SELECT 
      COUNT(*) as total_tasks,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
      SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_tasks,
      SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority_tasks,
      SUM(CASE WHEN priority = 'medium' THEN 1 ELSE 0 END) as medium_priority_tasks,
      SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END) as low_priority_tasks
    FROM tasks
    ${whereClause}
  `;

  db.get(query, params, (err, stats) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar estatísticas' });
    }
    res.json(stats);
  });
});

module.exports = router; 