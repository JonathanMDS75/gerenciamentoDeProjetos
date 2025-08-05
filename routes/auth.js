const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Registro de usuário
router.post('/register', [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Verificar se email já existe
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }

      if (user) {
        return res.status(400).json({ message: 'Email já cadastrado' });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Inserir novo usuário
      db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', 
        [name, email, hashedPassword], function(err) {
        if (err) {
          return res.status(500).json({ message: 'Erro ao criar usuário' });
        }

        // Gerar token
        const token = jwt.sign({ userId: this.lastID }, JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({
          message: 'Usuário criado com sucesso',
          token,
          user: {
            id: this.lastID,
            name,
            email,
            role: 'user'
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Buscar usuário
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }

      if (!user) {
        return res.status(401).json({ message: 'Email ou senha inválidos' });
      }

      // Verificar senha
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Email ou senha inválidos' });
      }

      // Gerar token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

      res.json({
        message: 'Login realizado com sucesso',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Verificar token
router.get('/verify', (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, userId: decoded.userId });
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
});

module.exports = router; 