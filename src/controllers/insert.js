require('dotenv').config();
const { Pool } = require('pg');
const { pipeline } = require('@xenova/transformers');

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

// Prueba
(async () => {
  await insertDocument('Problema con WiFi', 'Reinicia el router y verifica cables.');
})();