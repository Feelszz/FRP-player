const IOS_DISTRIBUTION_URL = '';
const platform = (() => {
  const ua = navigator.userAgent || '';
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
})();

const androidOption = document.querySelector('#androidOption');
const iosOption = document.querySelector('#iosOption');
const androidDownload = document.querySelector('#androidDownload');
const iosDownload = document.querySelector('#iosDownload');
const iosMessage = document.querySelector('#iosMessage');
const deviceHint = document.querySelector('#deviceHint');

if (platform === 'android') {
  androidOption?.classList.add('is-recommended');
  if (deviceHint) deviceHint.textContent = 'Android detectado · APK destacado';
} else if (platform === 'ios') {
  iosOption?.classList.add('is-recommended');
  if (deviceHint) deviceHint.textContent = IOS_DISTRIBUTION_URL ? 'iPhone detectado · distribuição oficial' : 'iPhone detectado · iOS em preparação';
} else if (deviceHint) {
  deviceHint.textContent = 'Computador detectado · escolha uma plataforma';
}

if (IOS_DISTRIBUTION_URL) {
  iosDownload.disabled = false;
  iosDownload.removeAttribute('aria-disabled');
  iosDownload.textContent = 'Abrir distribuição';
  iosDownload.addEventListener('click', () => { window.location.href = IOS_DISTRIBUTION_URL; });
  if (iosMessage) iosMessage.textContent = 'Instalação oficial disponível';
}

for (const option of [androidOption, iosOption]) {
  option?.addEventListener('click', (event) => {
    if (event.target.closest('a,button')) return;
    option.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}
