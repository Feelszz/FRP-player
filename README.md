# FPR Player

Página web oficial de distribuição do FPR Player para Android, Android TV, TV Box e acompanhamento da versão para iPhone.

O Android atual é uma aplicação nativa Java com `WebView`; o núcleo de reprodução e organização das playlists permanece em HTML, CSS e JavaScript dentro do APK. A adaptação iOS reutiliza esse núcleo em um wrapper SwiftUI com `WKWebView`, preservando a interface, M3U, categorias, filmes, séries, temporadas, episódios, favoritos e retomada.

## Executar

```bash
npm start
```

O servidor escuta em `0.0.0.0:3000` ou na porta definida por `PORT`.

## Distribuição

O site oferece o APK real em `/downloads/fpr-player.apk`, compatível com celulares Android, Android TV e TV Box. A opção iPhone/iOS é exibida separadamente e detecta o dispositivo, mas permanece desativada até existir uma URL oficial de App Store ou TestFlight. Para ativá-la, preencha `IOS_DISTRIBUTION_URL` em `public/app.js` somente após publicar uma versão assinada pela Apple.

A compilação e assinatura do IPA exigem macOS/Xcode e uma conta Apple Developer. O scaffold em `ios-app/` contém o wrapper SwiftUI, a configuração inicial e as instruções para adicionar o núcleo `PlayerCore/index.html` ao target Xcode.

## Backend preservado

A rota `/api/playlist` continua disponível no projeto para o futuro aplicativo, com limite remoto padrão de 50 MB e ajuste por `MAX_PLAYLIST_MB` entre 5 e 200 MB. A página pública não exibe formulário, biblioteca ou player.
