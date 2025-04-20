USE cadastro2;
create TABLE usuarios (id INT auto_increment PRIMARY KEY,


nome VARCHAR(100),
email VARCHAR(100)UNIQUE,
senha VARCHAR(100)
);

USE cadastro2;
SELECT * FROM usuarios;

