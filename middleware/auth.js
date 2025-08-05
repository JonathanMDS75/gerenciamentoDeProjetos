const jwt = require('jsonwebtoken');
const { db } = require('../database/init');

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aqui';

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token de acesso necessário' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Buscar usuário no banco
    db.get('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.userId], (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Erro ao verificar usuário' });
      }
      
      if (!user) {
        return res.status(401).json({ message: 'Usuário não encontrado' });
      }
      
      req.user = user;
      next();
    });
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
    }
    next();
  });
};

module.exports = { auth, adminAuth, JWT_SECRET }; 