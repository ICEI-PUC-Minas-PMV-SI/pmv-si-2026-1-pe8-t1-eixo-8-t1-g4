function mais(id) {
  const input = document.getElementById(id);
  input.value = Number(input.value) + 1;
}

function menos(id) {
  const input = document.getElementById(id);

  if (Number(input.value) > 0) {
    input.value = Number(input.value) - 1;
  }
}

function showToast(message, type = 'success') {

  const container = document.getElementById('toastContainer');

  const toast = document.createElement('div');

  toast.className = `toast toast--${type}`;

  toast.innerHTML = `
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

document.getElementById('form')
.addEventListener('submit', async function(e) {

  e.preventDefault();

  const dados = {

    tipo: 'materiais',

    solicitante:
      document.getElementById('iniciais')
      .value
      .trim()
      .toUpperCase(),

    linha:
      document.querySelector('input[name="linha"]:checked').value,

    materiais: {

      palletMadeira:
        Number(document.getElementById('palletMadeira').value),

      flexpen:
        Number(document.getElementById('flexpen').value),

      palletTPU:
        Number(document.getElementById('palletTPU').value)

    },

    observacoes:
      document.getElementById('obs').value,

    status: 'pendente'

  };

  try {

    const response = await fetch(
      'http://localhost:3000/solicitacoes',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify(dados)
      }
    );

    if (!response.ok) {
      throw new Error();
    }

    showToast(
      'Solicitação enviada com sucesso!',
      'success'
    );

    document.getElementById('form').reset();

  } catch {

    showToast(
      'Erro ao enviar solicitação',
      'error'
    );

  }

}); 