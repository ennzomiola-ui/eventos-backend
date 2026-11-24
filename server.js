require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const { SUPABASE_URL, SUPABASE_KEY, FRONTEND_URL } = process.env;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Defina SUPABASE_URL e SUPABASE_KEY nas variáveis de ambiente.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const app = express();

// CORS: libera apenas o frontend (ou todos, se FRONTEND_URL não for definida)
app.use(cors({ origin: FRONTEND_URL || '*' }));
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'API de Eventos Acadêmicos no ar' }));

// Listar eventos
app.get('/eventos', async (req, res) => {
  const { data, error } = await supabase.from('eventos').select('*').order('id');
  if (error) return res.status(500).json({ erro: error.message });
  res.json(data);
});

// Cadastrar evento
app.post('/eventos', async (req, res) => {
  const { titulo, descricao, data_evento, local } = req.body;

  if (!titulo || !data_evento || !local) {
    return res.status(400).json({ erro: 'titulo, data_evento e local são obrigatórios.' });
  }
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data_evento)) {
    return res.status(400).json({ erro: 'data_evento deve estar no formato dd/mm/aaaa.' });
  }

  const { data, error } = await supabase
    .from('eventos')
    .insert([{ titulo, descricao, data_evento, local }])
    .select()
    .single();

  if (error) return res.status(500).json({ erro: error.message });
  res.status(201).json(data);
});

// Porta fornecida pelo Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
