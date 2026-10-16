const PIX_KEY = '53273945818';
const activationForm = document.querySelector('#activationForm');
const activationFeedback = document.querySelector('#activationFeedback');
const copyPixKey = document.querySelector('#copyPixKey');

copyPixKey?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(PIX_KEY);
    copyPixKey.textContent = 'Chave Pix copiada';
  } catch {
    copyPixKey.textContent = PIX_KEY;
  }
});

activationForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!activationForm.reportValidity()) return;
  const data = new FormData(activationForm);
  const name = `${data.get('firstName')} ${data.get('lastName')}`.trim();
  activationFeedback.textContent = `${name}, confira o valor de R$ 41,00 e pague via Pix usando a chave 53273945818. A confirmação automática será ativada quando o gateway Pix estiver conectado.`;
  activationFeedback.classList.add('is-visible');
});
