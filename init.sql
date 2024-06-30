CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  usuario VARCHAR(50) NOT NULL,
  clave VARCHAR(50) NOT NULL
);

INSERT INTO usuarios (usuario, clave) VALUES ('andresf', '1234567');
