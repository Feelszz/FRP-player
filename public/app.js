const PIX_KEY = '8c3d996d-0a37-41c3-a081-ed4c7e68552a';
const activationForm = document.querySelector('#activationForm');
const activationFeedback = document.querySelector('#activationFeedback');
const copyPixKey = document.querySelector('#copyPixKey');


copyPixKey?.addEventListener('click', async () => {
  if (!PIX_KEY) return;
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
  activationFeedback.textContent = PIX_KEY
    ? `${name}, confira o valor de R$ 41,00 e pague via Pix. Após a confirmação, o código será enviado para o e-mail informado.`
    : `${name}, seus dados foram preenchidos. Use a chave Pix exibida nesta página para pagar R$ 41,00.`;
  activationFeedback.classList.add('is-visible');
});
