const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let solicitacoes = [];
let nextId = 1;

app.post('/solicitacoes', (req, res) => {
  try {
    const nova = {
      _id: String(nextId++),
      ...req.body,
      status: 'pendente',
      dataSolicitacao: new Date()
    };
    solicitacoes.push(nova);
    res.json(nova);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/solicitacoes', (req, res) => {
  try {
    res.json(solicitacoes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/solicitacoes/:id', (req, res) => {
  try {
    const idx = solicitacoes.findIndex(s => s._id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Solicitação não encontrada' });
    const update = { ...req.body };
    if (update.status === 'concluída') {
      update.dataAtendimento = new Date();
    }
    solicitacoes[idx] = { ...solicitacoes[idx], ...update };
    res.json(solicitacoes[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Servidor rodando em http://localhost:3000'));
