const state = {
  items: [],
  currentId: null,
  query: '',
  group: 'all'
};

const elements = {
  urlForm: document.querySelector('#urlForm'),
  playlistUrl: document.querySelector('#playlistUrl'),
  urlButton: document.querySelector('#urlButton'),
  playlistFile: document.querySelector('#playlistFile'),
  importFeedback: document.querySelector('#importFeedback'),
  connectionStatus: document.querySelector('#connectionStatus'),
  searchInput: document.querySelector('#searchInput'),
  groupFilter: document.querySelector('#groupFilter'),
  playlistList: document.querySelector('#playlistList'),
  libraryEmpty: document.querySelector('#libraryEmpty'),
  libraryFooter: document.querySelector('#libraryFooter'),
  visibleCount: document.querySelector('#visibleCount'),
  itemCount: document.querySelector('#itemCount'),
  clearButton: document.querySelector('#clearButton'),
  videoPlayer: document.querySelector('#videoPlayer'),
  videoEmpty: document.querySelector('#videoEmpty'),
  videoError: document.querySelector('#videoError'),
  videoErrorMessage: document.querySelector('#videoErrorMessage'),
  nowPlayingTitle: document.querySelector('#nowPlayingTitle'),
  nowPlayingGroup: document.querySelector('#nowPlayingGroup'),
  nowPlayingUrl: document.querySelector('#nowPlayingUrl'),
  livePill: document.querySelector('#livePill')
};

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[character]));
}

function parseAttributes(value) {
  const attributes = {};
  const attributePattern = /([\w-]+)=(?:"([^"]*)"|'([^']*)'|([^\s]+))/g;
  let match;
  while ((match = attributePattern.exec(value)) !== null) {
    attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? '';
  }
  return attributes;
}

function fallbackName(url) {
  try {
    const parsed = new URL(url);
    const name = decodeURIComponent(parsed.pathname.split('/').filter(Boolean).pop() || parsed.hostname);
    return name.replace(/\.(m3u8?|mp4|mkv|webm|ts)$/i, '').replace(/[-_]+/g, ' ').trim() || 'Vídeo sem título';
  } catch {
    return 'Vídeo sem título';
  }
}

function parsePlaylist(text) {
  const lines = String(text || '').replace(/^\uFEFF/, '').split(/\r?\n/);
  const items = [];
  let pending = null;
  let pendingGroup = '';

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF')) {
      const commaIndex = line.indexOf(',');
      const metadata = commaIndex >= 0 ? line.slice(0, commaIndex) : line;
      const label = commaIndex >= 0 ? line.slice(commaIndex + 1).trim() : '';
      const attributes = parseAttributes(metadata);
      pending = { label, attributes, group: attributes['group-title'] || '' };
      continue;
    }

    if (line.startsWith('#EXTGRP:')) {
      pendingGroup = line.slice(8).trim();
      continue;
    }

    if (line.startsWith('#')) continue;

    const attributes = pending?.attributes || {};
    const group = pending?.group || pendingGroup || 'Sem grupo';
    const name = pending?.label || attributes['tvg-name'] || fallbackName(line);
    items.push({
      id: `item-${items.length}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim() || 'Vídeo sem título',
      group,
      logo: attributes['tvg-logo'] || '',
      tvgId: attributes['tvg-id'] || '',
      url: line
    });
    pending = null;
    pendingGroup = '';
  }

  return items;
}

function formatUrl(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname.length > 1 ? parsed.pathname.slice(0, 22) + (parsed.pathname.length > 23 ? '…' : '') : ''}`;
  } catch {
    return url.length > 32 ? `${url.slice(0, 32)}…` : url;
  }
}

function setFeedback(message = '', type = '') {
  elements.importFeedback.textContent = message;
  elements.importFeedback.className = `import-feedback ${type}`.trim();
}

function setLoading(isLoading) {
  elements.urlButton.disabled = isLoading;
  elements.urlButton.querySelector('span').textContent = isLoading ? 'Carregando…' : 'Importar link';
  elements.connectionStatus.innerHTML = isLoading
    ? '<span class="status-dot loading"></span>Carregando playlist'
    : '<span class="status-dot"></span>Pronto para importar';
}

function getFilteredItems() {
  const query = state.query.trim().toLowerCase();
  return state.items.filter((item) => {
    const matchesGroup = state.group === 'all' || item.group === state.group;
    const matchesQuery = !query || `${item.name} ${item.group} ${item.tvgId}`.toLowerCase().includes(query);
    return matchesGroup && matchesQuery;
  });
}

function renderGroupFilter() {
  const groups = [...new Set(state.items.map((item) => item.group).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  elements.groupFilter.innerHTML = '<option value="all">Todos os grupos</option>' + groups
    .map((group) => `<option value="${escapeHtml(group)}">${escapeHtml(group)}</option>`).join('');
  elements.groupFilter.value = state.group;
  elements.groupFilter.disabled = state.items.length === 0;
}

function renderLibrary() {
  const filteredItems = getFilteredItems();
  elements.itemCount.textContent = `${state.items.length} ${state.items.length === 1 ? 'item' : 'itens'}`;
  elements.visibleCount.textContent = filteredItems.length;
  elements.searchInput.disabled = state.items.length === 0;
  elements.clearButton.disabled = state.items.length === 0;
  elements.libraryFooter.hidden = state.items.length === 0;
  elements.libraryEmpty.hidden = filteredItems.length > 0;

  if (filteredItems.length === 0) {
    elements.playlistList.querySelectorAll('.playlist-item').forEach((element) => element.remove());
    if (state.items.length > 0) {
      elements.libraryEmpty.innerHTML = '<span class="empty-stack" aria-hidden="true"><i></i><i></i><i></i></span><strong>Nenhum resultado</strong><p>Tente outro termo ou remova o filtro atual.</p>';
    } else {
      elements.libraryEmpty.innerHTML = '<span class="empty-stack" aria-hidden="true"><i></i><i></i><i></i></span><strong>Sua playlist está vazia</strong><p>Importe um link ou arquivo M3U para começar a assistir.</p>';
    }
    return;
  }

  elements.libraryEmpty.hidden = true;
  elements.playlistList.querySelectorAll('.playlist-item').forEach((element) => element.remove());
  const fragment = document.createDocumentFragment();

  for (const item of filteredItems) {
    const button = document.createElement('button');
    button.className = `playlist-item${item.id === state.currentId ? ' is-active' : ''}`;
    button.type = 'button';
    button.dataset.id = item.id;
    button.setAttribute('aria-label', `Reproduzir ${item.name}`);
    button.innerHTML = `
      <span class="channel-logo">${item.logo ? `<img src="${escapeHtml(item.logo)}" alt="" loading="lazy" />` : '<span class="channel-placeholder">▶</span>'}</span>
      <span class="channel-info"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.group)}</small></span>
      <span class="channel-state" aria-hidden="true">${item.id === state.currentId ? '<i></i>NOW' : '▶'}</span>
    `;
    button.addEventListener('click', () => selectItem(item.id));
    const logo = button.querySelector('img');
    if (logo) logo.addEventListener('error', () => logo.replaceWith(createPlaceholder()));
    fragment.appendChild(button);
  }
  elements.playlistList.appendChild(fragment);
}

function createPlaceholder() {
  const placeholder = document.createElement('span');
  placeholder.className = 'channel-placeholder';
  placeholder.textContent = '▶';
  return placeholder;
}

function selectItem(id) {
  const item = state.items.find((candidate) => candidate.id === id);
  if (!item) return;

  state.currentId = id;
  elements.videoPlayer.src = item.url;
  elements.videoPlayer.load();
  elements.videoEmpty.hidden = true;
  elements.videoError.hidden = true;
  elements.nowPlayingTitle.textContent = item.name;
  elements.nowPlayingGroup.textContent = item.group;
  elements.nowPlayingUrl.textContent = formatUrl(item.url);
  elements.livePill.classList.add('is-ready');
  renderLibrary();

  const playAttempt = elements.videoPlayer.play();
  if (playAttempt?.catch) playAttempt.catch(() => {});
}

function loadPlaylist(text, sourceLabel) {
  const parsed = parsePlaylist(text);
  if (!parsed.length) {
    throw new Error('Não encontramos vídeos válidos nesta playlist. Confira se o conteúdo está no formato M3U.');
  }
  state.items = parsed;
  state.currentId = null;
  state.query = '';
  state.group = 'all';
  elements.searchInput.value = '';
  renderGroupFilter();
  renderLibrary();
  setFeedback(`${parsed.length} ${parsed.length === 1 ? 'item encontrado' : 'itens encontrados'} em ${sourceLabel}.`, 'success');
  elements.connectionStatus.innerHTML = '<span class="status-dot ready"></span>Playlist carregada';
}

async function importFromUrl(event) {
  event.preventDefault();
  const sourceUrl = elements.playlistUrl.value.trim();
  if (!sourceUrl) {
    setFeedback('Cole um link M3U para continuar.', 'error');
    elements.playlistUrl.focus();
    return;
  }

  try {
    new URL(sourceUrl);
  } catch {
    setFeedback('Esse link não parece válido. Use uma URL HTTP ou HTTPS.', 'error');
    return;
  }

  setLoading(true);
  setFeedback('Buscando sua playlist…');
  try {
    const response = await fetch(`/api/playlist?url=${encodeURIComponent(sourceUrl)}`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Não foi possível carregar a playlist.');
    loadPlaylist(payload.text, 'link remoto');
  } catch (error) {
    setFeedback(error.message || 'Não foi possível carregar a playlist.', 'error');
    elements.connectionStatus.innerHTML = '<span class="status-dot error"></span>Falha no carregamento';
  } finally {
    setLoading(false);
  }
}

function importFromFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  setFeedback(`Lendo ${file.name}…`);
  reader.onload = () => {
    try {
      loadPlaylist(reader.result, file.name);
    } catch (error) {
      setFeedback(error.message, 'error');
      elements.connectionStatus.innerHTML = '<span class="status-dot error"></span>Formato inválido';
    }
  };
  reader.onerror = () => setFeedback('Não foi possível ler o arquivo selecionado.', 'error');
  reader.readAsText(file);
  event.target.value = '';
}

function clearPlaylist() {
  state.items = [];
  state.currentId = null;
  state.query = '';
  state.group = 'all';
  elements.searchInput.value = '';
  elements.groupFilter.innerHTML = '<option value="all">Todos os grupos</option>';
  elements.videoPlayer.pause();
  elements.videoPlayer.removeAttribute('src');
  elements.videoPlayer.load();
  elements.videoEmpty.hidden = false;
  elements.videoError.hidden = true;
  elements.nowPlayingTitle.textContent = 'Nenhum vídeo selecionado';
  elements.nowPlayingGroup.textContent = 'Aguardando playlist';
  elements.nowPlayingUrl.textContent = '—';
  elements.livePill.classList.remove('is-ready');
  renderLibrary();
  setFeedback('Playlist removida. Você pode importar outra a qualquer momento.');
  elements.connectionStatus.innerHTML = '<span class="status-dot"></span>Pronto para importar';
}

elements.urlForm.addEventListener('submit', importFromUrl);
elements.playlistFile.addEventListener('change', importFromFile);
elements.searchInput.addEventListener('input', (event) => {
  state.query = event.target.value;
  renderLibrary();
});
elements.groupFilter.addEventListener('change', (event) => {
  state.group = event.target.value;
  renderLibrary();
});
elements.clearButton.addEventListener('click', clearPlaylist);
elements.videoPlayer.addEventListener('error', () => {
  if (!state.currentId) return;
  elements.videoError.hidden = false;
  elements.videoErrorMessage.textContent = 'O navegador pode não suportar este formato, ou o link pode estar indisponível.';
});
elements.videoPlayer.addEventListener('playing', () => {
  elements.livePill.classList.add('is-playing');
});
elements.videoPlayer.addEventListener('pause', () => {
  elements.livePill.classList.remove('is-playing');
});

renderLibrary();
