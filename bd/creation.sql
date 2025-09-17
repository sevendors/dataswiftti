CREATE DATABASE IF NOT EXISTS db_dataswift;
USE dataswift;

CREATE TABLE cad_usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    cpf CHAR(11) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,  -- Guardar senha criptografada (bcrypt/argon2)
    cep CHAR(8) NOT NULL,
    codigo CHAR(3) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
