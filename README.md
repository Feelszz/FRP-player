# FPR Player

Página web oficial de distribuição do FPR Player para Android, Android TV e TV Box.

O Android atual é uma aplicação nativa Java com `WebView`; o núcleo de reprodução e organização das playlists permanece em HTML, CSS e JavaScript dentro do APK. A adaptação iOS reutiliza esse núcleo em um wrapper SwiftUI com `WKWebView`, preservando a interface, M3U, categorias, filmes, séries, temporadas, episódios, favoritos e retomada.

## Executar

```bash
npm start
```

O servidor escuta em `0.0.0.0:3000` ou na porta definida por `PORT`.

## Distribuição

O site oferece o APK real em `/downloads/fpr-player.apk`, compatível com celulares Android, Android TV e TV Box. O site público oferece somente o APK Android. A adaptação iOS permanece preparada no diretório `ios-app/`, mas não é exibida nem oferecida pelo site até existir uma distribuição oficial compatível.

A compilação e assinatura do IPA exigem macOS/Xcode e uma conta Apple Developer. O scaffold em `ios-app/` contém o wrapper SwiftUI, a configuração inicial e as instruções para adicionar o núcleo `PlayerCore/index.html` ao target Xcode.

## Backend preservado

A rota `/api/playlist` continua disponível no projeto para o futuro aplicativo, com limite remoto padrão de 50 MB e ajuste por `MAX_PLAYLIST_MB` entre 5 e 200 MB. A página pública não exibe formulário, biblioteca ou player.

## Asaas Sandbox

O site agora cria cobranças Pix dinâmicas no Asaas Sandbox. A página oficial usa R$ 41,00 e a rota `#ativacao-dev` usa R$ 5,00 no Sandbox, pois o Asaas aplica valor mínimo por cobrança. O código só é liberado depois do evento `PAYMENT_RECEIVED` recebido no webhook. Consulte `docs/asaas-sandbox.md` para a configuração do endpoint e das variáveis de ambiente.
