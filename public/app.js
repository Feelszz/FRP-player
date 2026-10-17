const PIX_KEY = '8c3d996d-0a37-41c3-a081-ed4c7e68552a';
const DEV_MODE = new URLSearchParams(window.location.search).get('dev') === '1' || window.location.hash === '#ativacao-dev';
const ACTIVATION_AMOUNT = DEV_MODE ? 'R$ 0,05' : 'R$ 41,00';
const activationForm = document.querySelector('#activationForm');
const activationFeedback = document.querySelector('#activationFeedback');
const copyPixKey = document.querySelector('#copyPixKey');

if (DEV_MODE) {
  document.querySelectorAll('.activation-copy strong, .pix-card > strong').forEach((node) => { node.textContent = ACTIVATION_AMOUNT; });
  const steps = document.querySelector('.activation-steps');
  if (steps) steps.innerHTML = steps.innerHTML.replaceAll('R$ 41,00', ACTIVATION_AMOUNT);
  document.title = 'FPR Player — Ambiente DEV';
}


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
    ? `${name}, confira o valor de ${ACTIVATION_AMOUNT} e pague via Pix. Após a confirmação, o código será enviado para o e-mail informado.`
    : `${name}, seus dados foram preenchidos. Use a chave Pix exibida nesta página para pagar ${ACTIVATION_AMOUNT}.`;
  activationFeedback.classList.add('is-visible');
});
