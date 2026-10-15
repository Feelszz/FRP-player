# VideoFlow Player

Página web de distribuição do VideoFlow Player para Android e TV Box.

O site serve apenas como página de download e apresentação. A importação do link M3U e o anexo do arquivo de playlist devem acontecer dentro do aplicativo instalado.

## Executar

```bash
npm start
```

O servidor escuta em `0.0.0.0:3000` ou na porta definida por `PORT`.

## Próximo passo para o download

O APK debug gerado pelo GitHub Actions está disponível em `/downloads/videoflow-player.apk` e é oferecido pelo botão da página pública.

## Backend preservado

A rota `/api/playlist` continua disponível no projeto para o futuro aplicativo, com limite remoto padrão de 50 MB e ajuste por `MAX_PLAYLIST_MB` entre 5 e 200 MB. A página pública não exibe mais formulário, biblioteca ou player.
