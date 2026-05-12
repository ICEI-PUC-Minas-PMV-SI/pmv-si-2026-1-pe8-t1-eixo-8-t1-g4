const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

mongoose.connect('mongodb://localhost:27017/sistema-rota')
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

const SolicitacaoSchema = new mongoose.Schema({
  linha:           { type: String, required: true, enum: ['Linha A', 'Linha B'] },
  materiais:       { type: Object, default: {} },
  observacoes:     { type: String, default: '', maxlength: 500 },
  status:          { type: String, default: 'pendente', enum: ['pendente', 'em progresso', 'concluída', 'justificada'] },
  solicitante:     { type: String, required: true, maxlength: 10 },
  dataSolicitacao: { type: Date, default: Date.now },
  dataAtendimento: { type: Date },
  problema:        { type: String, default: '', maxlength: 1000 }
}, { timestamps: false });

const Solicitacao = mongoose.model('Solicitacao', SolicitacaoSchema);

// Cria solicitação
app.post('/solicitacoes', async (req, res) => {
  try {
    const { linha, materiais, observacoes, solicitante } = req.body;
    if (!linha || !solicitante) {
      return res.status(400).json({ error: 'Campos obrigatórios: linha, solicitante' });
    }
    const nova = await Solicitacao.create({
      linha,
      materiais: materiais || {},
      observacoes: observacoes || '',
      solicitante: String(solicitante).trim().toUpperCase(),
      status: 'pendente',
      dataSolicitacao: new Date()
    });
    res.status(201).json(nova);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lista todas
app.get('/solicitacoes', async (req, res) => {
  try {
    const lista = await Solicitacao.find().sort({ dataSolicitacao: -1 }).lean();
    res.json(lista);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Busca por ID
app.get('/solicitacoes/:id', async (req, res) => {
  try {
    const doc = await Solicitacao.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: 'Solicitação não encontrada' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualiza
app.put('/solicitacoes/:id', async (req, res) => {
  try {
    const allowed = ['status', 'problema', 'observacoes', 'dataAtendimento'];
    const update = {};
    allowed.forEach(k => {
      if (req.body[k] !== undefined) update[k] = req.body[k];
    });
    if (update.status === 'concluída' && !update.dataAtendimento) {
      update.dataAtendimento = new Date();
    }
    const updated = await Solicitacao.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Solicitação não encontrada' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove
app.delete('/solicitacoes/:id', async (req, res) => {
  try {
    const deleted = await Solicitacao.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Solicitação não encontrada' });
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
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
