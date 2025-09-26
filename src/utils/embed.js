const { pipeline } = require('@xenova/transformers');

let embedder;

async function initEmbedder() {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedder;
}

async function generateEmbedding(text) {
  const embedder = await initEmbedder();
  const output = await embedder(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);  // Vector de 384 dims como Float32Array -> Array
}

// Prueba
(async () => {
  const embedding = await generateEmbedding('Ejemplo de documento de soporte técnico.');
  console.log('Primeros 5 valores:', embedding.slice(0, 5));
  console.log('Longitud del vector:', embedding.length);  // Debería ser 384
})();