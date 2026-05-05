const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/sistema-rota')
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

const Solicitacao = mongoose.model('Solicitacao', {
  linha: String,
  materiais: Object,
  observacoes: String,
  status: String,
  solicitante: String,
  dataSolicitacao: Date,
  dataAtendimento: Date,
  problema: String
});

app.post('/solicitacoes', async (req, res) => {
  try {
    const nova = await Solicitacao.create({
      ...req.body,
      status: 'pendente',
      dataSolicitacao: new Date()
    });
    res.json(nova);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/solicitacoes', async (req, res) => {
  try {
    const lista = await Solicitacao.find();
    res.json(lista);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/solicitacoes/:id', async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.status === 'concluída') {
      update.dataAtendimento = new Date();
    }
    const updated = await Solicitacao.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Solicitação não encontrada' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Servidor rodando em http://localhost:3000'));
