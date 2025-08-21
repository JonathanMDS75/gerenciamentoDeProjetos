#!/bin/bash

echo "========================================"
echo "Sistema de Gerenciamento de Projetos"
echo "========================================"
echo

echo "Instalando dependencias do backend..."
npm install

echo
echo "Instalando dependencias do frontend..."
cd client
npm install
cd ..

echo
echo "========================================"
echo "Instalacao concluida!"
echo "========================================"
echo
echo "Para iniciar o projeto:"
echo "1. Backend: npm run dev"
echo "2. Frontend: cd client && npm start"
echo
echo "Credenciais de teste:"
echo "Email: admin@projeto.com"
echo "Senha: admin123"
echo 