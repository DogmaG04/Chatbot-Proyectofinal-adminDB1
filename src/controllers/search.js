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
      [`[${queryEmbedding.join(',')}]`, 0.7, limit]
    );
    return res.rows.length > 0 ? res.rows : []; 
  } finally {
    client.release();
  }
}

// Prueba
(async () => {
  const results = await semanticSearch('hola');
  console.log(results.map(r => ({ title: r.title, distance: r.distance })));
})();