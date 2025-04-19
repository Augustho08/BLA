const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const port = 3000;

// Configurar o middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname))); // Para servir arquivos estáticos, como HTML
app.use(bodyParser.json()); // Para permitir que o servidor processe JSON

// Criar a conexão com o MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cadastro2'
});

// Conectar ao MySQL e criar a tabela, se necessário
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Conectado ao MySQL!');

    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            senha VARCHAR(255) NOT NULL
        )
    `;

    db.query(createTableQuery, (err) => {
        if (err) throw err;
        console.log('Tabela "usuarios" criada ou já existe.');
    });
});

// Rota para servir o arquivo Alogin.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Alogin.html'));
});

// Rota para servir o arquivo ARegis.html
app.get('/ARegis.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'ARegis.html'));
});

// Rota para o registro
app.post('/cadastro', (req, res) => {
    const { nome, email, senha } = req.body;

    // Hash da senha
    bcrypt.hash(senha, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao processar a senha.' });
        }

        const usuario = { nome, email, senha: hash };

        // Inserir no banco de dados
        db.query('INSERT INTO usuarios SET ?', usuario, (err) => {
            if (err) {
                return res.status(400).json({ message: 'Usuário ou email já em uso. Faça login. ❌' });
            }
            res.status(201).json({ message: 'Registro feito com sucesso! ✔️' });
        });
    });
});

// Rota para o login
app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    db.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao consultar o banco de dados.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado. Verifique seu email e senha. ❌' });
        }

        bcrypt.compare(senha, results[0].senha, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ message: 'Erro ao comparar a senha.' });
            }
            if (!isMatch) {
                return res.status(401).json({ message: 'Senha incorreta. Tente novamente. ❌' });
            }
            return res.status(200).json({ message: 'Login realizado com sucesso! ✔️' });
        });
    });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
