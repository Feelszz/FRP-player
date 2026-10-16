# FPR Player para iOS — preparação oficial

A auditoria confirmou que o Android é um wrapper Java/WebView. A versão iOS reutiliza a mesma experiência por meio de `WKWebView`, que oferece suporte a HTML5 e HLS no iPhone.

## Núcleo compartilhado

Copie o arquivo atual `android-app/app/src/main/assets/index.html` para:

```text
ios-app/PlayerCore/index.html
```

No Xcode, adicione `ios-app/PlayerCore` ao target como **folder reference** ou recurso do bundle. O wrapper `PlayerWebView.swift` carrega esse arquivo localmente; assim, playlists, categorias, séries, favoritos, retomada e identidade visual permanecem no mesmo núcleo.

## Distribuição

Este repositório Linux prepara o código, mas não assina um IPA. Para distribuição oficial:

1. Abrir um projeto iOS SwiftUI no macOS/Xcode.
2. Definir Bundle Identifier, Team e conta Apple Developer.
3. Adicionar `FPRPlayerIOSApp.swift`, `PlayerWebView.swift` e `PlayerCore/index.html` ao target.
4. Revisar o uso de fontes HTTP em `Info.plist`/ATS e validar cada origem IPTV.
5. Testar em iPhone real.
6. Publicar via TestFlight ou App Store.
7. Configurar a URL oficial em `public/app.js`, na constante `IOS_DISTRIBUTION_URL`.

Até a etapa 7, o site mantém o botão iOS visível, porém desativado, sem fabricar links de App Store, TestFlight ou IPA.
