const DEV_MODE = new URLSearchParams(window.location.search).get('dev') === '1' || window.location.hash === '#ativacao-dev';
const ACTIVATION_AMOUNT = DEV_MODE ? 'R$ 5,00' : 'R$ 41,00';
const activationForm = document.querySelector('#activationForm');
const activationFeedback = document.querySelector('#activationFeedback');
const activationResult = document.querySelector('#activationResult');
const activationResultText = document.querySelector('#activationResultText');
const activationCodeNode = document.querySelector('#activationCode');
const activationEmailStatus = document.querySelector('#activationEmailStatus');
const pixQr = document.querySelector('#pixQr');
let pollTimer;

if (DEV_MODE) {
  document.querySelectorAll('.activation-copy strong, .pix-card > strong').forEach((node) => { node.textContent = ACTIVATION_AMOUNT; });
  const steps = document.querySelector('.activation-steps');
  if (steps) steps.innerHTML = steps.innerHTML.replaceAll('R$ 41,00', ACTIVATION_AMOUNT);
  if (pixQr) { pixQr.src = '/assets/pix-qr-dev.svg'; pixQr.alt = 'QR Code Pix de R$ 5,00'; pixQr.hidden = true; }
  document.title = 'FPR Player — Ambiente DEV';
}

function showFeedback(message, error = false) {
  activationFeedback.textContent = message;
  activationFeedback.classList.toggle('error', error);
  activationFeedback.classList.add('is-visible');
}

function startPaymentPolling(orderId) {
  clearInterval(pollTimer);
  pollTimer = setInterval(async () => {
    try {
      const response = await fetch(`/api/asaas/payment-status?orderId=${encodeURIComponent(orderId)}`);
      if (!response.ok) return;
      const status = await response.json();
      if (status.status !== 'PAID') return;
      clearInterval(pollTimer);
      activationResult.hidden = false;
      activationCodeNode.textContent = status.code;
      activationResultText.textContent = 'Pagamento confirmado pelo Asaas Sandbox. O aplicativo será ativado automaticamente; este código permanece disponível como alternativa de recuperação.';
      activationEmailStatus.textContent = status.emailStatus === 'sent' ? 'O código também foi enviado por e-mail.' : 'A confirmação por e-mail será habilitada com o provedor de e-mail.';
      showFeedback('Pagamento aprovado. Código liberado com segurança.', false);
    } catch { /* polling transitório */ }
  }, 3000);
}

activationForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!activationForm.reportValidity()) return;
  const button = activationForm.querySelector('button[type="submit"]');
  const data = Object.fromEntries(new FormData(activationForm));
  button.disabled = true;
  button.textContent = 'Gerando cobrança Pix…';
  activationResult.hidden = true;
  try {
    const response = await fetch('/api/asaas/create-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, dev: DEV_MODE }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Não foi possível gerar a cobrança Pix.');
    if (result.qrCode) { pixQr.src = result.qrCode; pixQr.alt = `QR Code Pix de ${ACTIVATION_AMOUNT}`; pixQr.hidden = false; }
    showFeedback(`QR Code gerado para ${ACTIVATION_AMOUNT}. Escaneie com seu banco e aguarde a confirmação.`, false);
    startPaymentPolling(result.orderId);
  } catch (error) {
    showFeedback(error.message || 'Não foi possível gerar a cobrança Pix.', true);
  } finally {
    button.disabled = false;
    button.innerHTML = 'Continuar para o Pix <b aria-hidden="true">→</b>';
  }
});
