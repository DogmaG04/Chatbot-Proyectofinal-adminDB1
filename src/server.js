require('dotenv').config();
const express = require('express');
const { pipeline } = require('@xenova/transformers');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(express.static('public'));  // Para servir HTML/CSS/JS

let embedder;

async function initEmbedder() {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedder;
}

const pool = new Pool({ connectionString: process.env.PG_CONNECTION_STRING });

async function insertDocument(title, content) {
  const embedder = await initEmbedder();
  const output = await embedder(content, { pooling: 'mean', normalize: true });
  const embedding = Array.from(output.data);

  const client = await pool.connect();
  try {
    await client.query(
      'INSERT INTO documents (title, content, embedding) VALUES ($1, $2, $3)',
      [title, content, `[${embedding.join(',')}]`]
    );
    console.log('Documento insertado con embedding local');
  } finally {
    client.release();
  }
}

async function semanticSearch(queryText, limit = 1) { 
  const embedder = await initEmbedder();
  const queryOutput = await embedder(queryText, { pooling: 'mean', normalize: true });
  const queryEmbedding = Array.from(queryOutput.data);

  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT id, title, content, embedding <=> $1 AS distance
       FROM documents
       WHERE embedding <=> $1 < $2
       ORDER BY distance ASC
       LIMIT $3`,
      [`[${queryEmbedding.join(',')}]`,0.7, limit] // Umbral de 0.3
    );
    return res.rows.length > 0 ? res.rows : []; 
  } finally {
    client.release();
  }
}

app.post('/insert', async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).send('Título y contenido son requeridos');
  await insertDocument(title, content);
  res.send('Documento insertado');
});

app.post('/search', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).send('Query es requerido');
  try {
    const results = await semanticSearch(query);
    setTimeout(() => {
      if (results.length === 0) {
        res.json([{ title: 'No encontrado', content: 'No se encontraron resultados relevantes.', distance: 0 }]);
      } else {
        res.json(results);
      }
    }, 2000);
  } catch (error) {
    console.error('Error en /search:', error);
    res.status(500).send('Error interno del servidor');
  }
});

app.listen(3000, () => console.log('Servidor en http://localhost:3000'));