# Plano — FPR Player Android + iOS

## Diagnóstico

O APK anexado e o repositório confirmam uma aplicação Android nativa em Java (`MainActivity`) que abre um `WebView` local. A maior parte do produto está em `android-app/app/src/main/assets/index.html`, com HTML, CSS e JavaScript para importação M3U, categorias, agrupamento de séries, favoritos, retomada e reprodução.

## Estratégia aprovada

- Preservar o APK Android e o código atual.
- Reutilizar o `index.html` como núcleo compartilhado da experiência.
- Preparar um wrapper iOS em Swift/SwiftUI com `WKWebView`, que suporta HTML5 e streams HLS compatíveis com iPhone.
- Permitir streams HTTP/HTTPS no wrapper por configuração ATS explícita, sujeita à revisão da Apple.
- Não inventar URL de App Store, TestFlight ou IPA. O botão iOS permanece em estado de preparação até existir uma distribuição assinada e um endereço oficial.
- Atualizar o site para detectar Android, iPhone/iPad e computador, destacar a plataforma provável e manter seleção manual.

## Estrutura

- `android-app/`: aplicativo Android Java/WebView e núcleo atual do player.
- `ios-app/`: scaffold Swift/SwiftUI + WKWebView, documentação de assinatura e sincronização do núcleo compartilhado.
- `public/`: site oficial de download e ativação, com botão Android real e opção iOS controlada por URL de distribuição.
- `server.js`: servidor estático e proxy M3U existente.

## Design

**Direção: Cinema de Bolso (90%)** — interface escura, cinematográfica e objetiva, com acentos laranja FPR e foco no dispositivo escolhido.

- **Princípios:** clareza de plataforma, confiança na distribuição oficial, adaptação responsiva e reaproveitamento visual.
- **Paleta:** `#151116` como base, `#E96A3A` como assinatura, verde apenas para estados de ativação e compatibilidade.
- **Interação:** o sistema sugere a plataforma detectada, mas nunca impede a escolha manual.
- **Voz:** direta e transparente; “Escolha onde assistir” e “iPhone: distribuição oficial em preparação”.
- **Essência:** o mesmo FPR Player em cada tela, sem links falsos e sem confundir APK com instalação iOS.

## Dependências e limite operacional

A compilação, assinatura e distribuição final para iPhone precisam ocorrer em macOS/Xcode com uma conta Apple Developer. O Sandbox Linux pode preparar o código e a configuração, mas não pode gerar um IPA assinado nem publicar na App Store/TestFlight.
