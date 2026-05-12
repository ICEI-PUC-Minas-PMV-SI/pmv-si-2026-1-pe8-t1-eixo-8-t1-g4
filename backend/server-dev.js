const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

let solicitacoes = [];
let nextId = 1;

const LINHAS_VALIDAS = ['Linha A', 'Linha B'];
const STATUS_VALIDOS = ['pendente', 'em progresso', 'concluída', 'justificada'];

// Cria solicitação
app.post('/solicitacoes', (req, res) => {
  try {
    const { linha, materiais, observacoes, solicitante } = req.body;
    if (!linha || !solicitante) {
      return res.status(400).json({ error: 'Campos obrigatórios: linha, solicitante' });
    }
    if (!LINHAS_VALIDAS.includes(linha)) {
      return res.status(400).json({ error: `Linha inválida. Use: ${LINHAS_VALIDAS.join(', ')}` });
    }
    const solicitanteNorm = String(solicitante).trim().toUpperCase().slice(0, 10);
    const nova = {
      _id: String(nextId++),
      linha,
      materiais: materiais || {},
      observacoes: observacoes || '',
      solicitante: solicitanteNorm,
      status: 'pendente',
      dataSolicitacao: new Date()
    };
    solicitacoes.push(nova);
    res.status(201).json(nova);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lista todas
app.get('/solicitacoes', (req, res) => {
  try {
    const lista = [...solicitacoes].sort(
      (a, b) => new Date(b.dataSolicitacao) - new Date(a.dataSolicitacao)
    );
    res.json(lista);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Busca por ID
app.get('/solicitacoes/:id', (req, res) => {
  try {
    const doc = solicitacoes.find(s => s._id === req.params.id);
    if (!doc) return res.status(404).json({ error: 'Solicitação não encontrada' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualiza
app.put('/solicitacoes/:id', (req, res) => {
  try {
    const idx = solicitacoes.findIndex(s => s._id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Solicitação não encontrada' });
    const allowed = ['status', 'problema', 'observacoes', 'dataAtendimento'];
    const update = {};
    allowed.forEach(k => {
      if (req.body[k] !== undefined) update[k] = req.body[k];
    });
    if (update.status && !STATUS_VALIDOS.includes(update.status)) {
      return res.status(400).json({ error: `Status inválido. Use: ${STATUS_VALIDOS.join(', ')}` });
    }
    if (update.status === 'concluída' && !update.dataAtendimento) {
      update.dataAtendimento = new Date();
    }
    solicitacoes[idx] = { ...solicitacoes[idx], ...update };
    res.json(solicitacoes[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove
app.delete('/solicitacoes/:id', (req, res) => {
  try {
    const idx = solicitacoes.findIndex(s => s._id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Solicitação não encontrada' });
    solicitacoes.splice(idx, 1);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor DEV rodando em http://localhost:${PORT}`));
