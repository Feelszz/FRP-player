const DEV_MODE = new URLSearchParams(window.location.search).get('dev') === '1' || window.location.hash === '#ativacao-dev';
const ACTIVATION_AMOUNT = DEV_MODE ? 'R$ 0,05' : 'R$ 41,00';
const activationForm = document.querySelector('#activationForm');
const activationFeedback = document.querySelector('#activationFeedback');
const pixQr = document.querySelector('#pixQr');

if (DEV_MODE) {
  document.querySelectorAll('.activation-copy strong, .pix-card > strong').forEach((node) => { node.textContent = ACTIVATION_AMOUNT; });
  const steps = document.querySelector('.activation-steps');
  if (steps) steps.innerHTML = steps.innerHTML.replaceAll('R$ 41,00', ACTIVATION_AMOUNT);
  if (pixQr) { pixQr.src = '/assets/pix-qr-dev.svg'; pixQr.alt = 'QR Code Pix de R$ 0,05'; }
  document.title = 'FPR Player — Ambiente DEV';
}


activationForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!activationForm.reportValidity()) return;
  const data = new FormData(activationForm);
  const name = `${data.get('firstName')} ${data.get('lastName')}`.trim();
  activationFeedback.textContent = `${name}, confira o QR Code e o valor de ${ACTIVATION_AMOUNT} no aplicativo do seu banco. Após a confirmação, o código será enviado para o e-mail informado.`;
  activationFeedback.classList.add('is-visible');
});
