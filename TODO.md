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

## Catálogo IPTV: organização e filtros por metadados

- [ ] Preservar integralmente a interface existente e alterar exclusivamente a lógica, os dados, a organização do catálogo e o funcionamento dos filtros.
- [ ] Manter Filmes, Séries e TV ao vivo; organizar filmes por gênero, país de produção, ano e lançamentos; séries por gênero, país, ano, temporadas e episódios; TV ao vivo por categorias, grupos, favoritos e EPG quando disponível.
- [ ] Disponibilizar exatamente os gêneros de filmes: Ação, Aventura, Animação, Anime, Biografia, Comédia, Comédia Romântica, Crime, Documentário, Drama, Família, Fantasia, Faroeste, Ficção Científica, Guerra, História, Mistério, Musical, Policial, Romance, Suspense, Terror, Thriller, Esporte, Religioso, Épico, Artes Marciais, Filme Noir, Cinema Independente e Curta-metragem.
- [ ] Permitir múltiplos gêneros por filme, ocultar categorias vazias e suportar sinônimos reais como Horror → Terror e Sci-Fi → Ficção Científica.
- [ ] Filtrar por Brasil, Portugal, Estados Unidos, Coreia do Sul, Japão, França, Índia, Espanha, Itália, Alemanha, Reino Unido, China, Hong Kong, México, Argentina, Canadá, Austrália e Rússia; “Brasil” deve usar país de produção, sem confundir com idioma.
- [ ] Permitir combinar gênero, país e ano, atualizar resultados, limpar filtros e exibir o estado vazio existente quando não houver correspondências.
- [ ] Preservar banco, APIs, reprodutor e integrações; aproveitar identificador, título, sinopse, pôster, ano, gêneros, países e referência de reprodução presentes na fonte M3U/Xtream.

## Orientação e ativação automática

- [ ] O aplicativo deve abrir sempre em orientação horizontal em celulares, Android TV e TV Box.
- [ ] O site só deve criar uma cobrança Pix quando o ID informado tiver sido registrado pelo FPR Player e corresponder exatamente ao identificador exibido no aplicativo; IDs digitados incorretamente devem ser rejeitados antes do pagamento.
- [ ] Após a confirmação definitiva do Pix pelo Asaas, o app deve consultar o status automaticamente, validar o código para o próprio dispositivo e liberar o acesso sem exigir copiar e colar código; o código permanece como recuperação manual.

## Navegação lateral e desempenho

- [ ] Manter TV ao vivo, Filmes e Séries no lado esquerdo, em coluna vertical, com categorias roláveis e foco visível para controle remoto.
- [ ] Preservar o visual cinematográfico existente, sem trocar cores, fontes ou componentes.
- [ ] Tornar o catálogo mais fluido com cache de metadados, carregamento lazy/assíncrono de capas, limite incremental de cards, botão “Mostrar mais”, contenção de layout e hardware acceleration no WebView.
- [ ] Preservar busca, agrupamento de séries, temporadas, favoritos, retomada e reprodução.

## Catálogos em tela própria, logo e autoplay

- [ ] Ao clicar em TV ao vivo, Filmes ou Séries, abrir uma tela de catálogo independente, sem rolagem da home; as categorias devem continuar no lado esquerdo.
- [ ] O app deve exibir o logotipo FPR Player no canto inferior esquerdo da tela inicial e utilizar o mesmo desenho como ícone principal do APK.
- [ ] Ao clicar em um episódio dentro de uma temporada, iniciar a reprodução automaticamente sem exigir voltar ao topo e pressionar Reproduzir.

## Rolagem do catálogo

- [ ] A tela independente de Filmes, Séries e TV ao vivo deve permitir rolagem vertical dentro do painel de resultados, com categorias independentes à esquerda, em TV Box, Android e celular.

## Busca superior e autoplay de episódios

- [ ] A barra de pesquisa deve ficar no topo da tela de catálogo, próxima aos controles, sem cobrir os cards.
- [ ] Ao selecionar um episódio na temporada, iniciar sua reprodução imediatamente sem pressionar o botão Reproduzir.
