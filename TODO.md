# TODO — FPR Player Android + iOS

## Núcleo existente preservado
- [x] O APK atual foi auditado: Android nativo em Java com `WebView`, carregando o núcleo em HTML/CSS/JavaScript.
- [x] O núcleo existente mantém importação M3U por link/arquivo, categorias, filmes, séries, temporadas, episódios, favoritos, retomada e reprodução.

## Compatibilidade iOS
- [x] Preparar um wrapper iOS em Swift/SwiftUI com `WKWebView`, reutilizando o núcleo HTML/CSS/JavaScript do Android.
- [x] Configurar reprodução inline e compatibilidade com streams HTML5/HLS no iPhone.
- [x] Documentar sincronização do núcleo, ATS, assinatura e distribuição oficial.
- [ ] Compilar e assinar o IPA nativo em macOS/Xcode com uma conta Apple Developer.
- [ ] Publicar em App Store ou TestFlight e registrar a URL oficial de distribuição.

## Site oficial de download
- [x] Disponibilizar o APK Android real para celulares Android, Android TV e TV Box.
- [x] Apresentar uma opção visual separada para iPhone/iOS.
- [x] Detectar Android, iPhone/iPad e computador, destacando a plataforma provável e permitindo seleção manual.
- [x] Não oferecer APK para iOS nem criar URL fictícia de App Store/TestFlight.
- [ ] Ativar uma distribuição nativa iOS somente depois que a URL oficial assinada estiver configurada; até lá, o site oferece apenas Android.

## Distribuição e conformidade
- [ ] Configurar identidade Apple, certificados, provisioning profile e revisão das permissões ATS.
- [ ] Validar reprodução das fontes IPTV no iPhone real e revisar as regras da App Store para conteúdo e fontes externas.
