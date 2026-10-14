# VideoFlow Player

Reprodutor web com visual cinematográfico para importar playlists M3U por URL ou arquivo local.

## Executar

```bash
npm start
```

O servidor escuta em `0.0.0.0:3000` ou na porta definida por `PORT`.

## Funcionalidades

- Importação de playlist M3U por link HTTP/HTTPS.
- Importação de arquivo `.m3u`, `.m3u8` ou `.txt`.
- Parser de `#EXTINF`, grupos, nomes, logos e identificadores de canal.
- Busca, filtro por grupo e contagem de itens.
- Player HTML5 com controles nativos, tela cheia e suporte conforme o navegador.
- Proxy de playlist remota em `/api/playlist?url=...` para reduzir problemas de CORS.

Streams HLS (`.m3u8`) dependem do suporte do navegador. No Chrome/Android, alguns streams precisam de uma camada HLS compatível ou de um formato que o navegador consiga reproduzir nativamente.
