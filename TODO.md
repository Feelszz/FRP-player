# TODO — VideoFlow Player

## Importação de playlists M3U
- [x] O aplicativo deve ter um campo para inserir uma playlist por link M3U.
- [x] O aplicativo deve permitir carregar um arquivo M3U local.
- [x] O carregamento deve informar estados de processamento, sucesso e erro para link inválido, falha de rede ou formato inválido.
- [x] O carregamento remoto deve usar uma rota do servidor para evitar depender de CORS do site da playlist e aceitar somente URLs HTTP/HTTPS.

## Biblioteca e navegação
- [x] O aplicativo deve ler a playlist e listar os itens encontrados.
- [x] Cada item deve exibir as informações disponíveis, incluindo nome, grupo, logo quando existir e URL de origem de forma resumida.
- [x] A biblioteca deve permitir busca por nome, grupo ou metadados.
- [x] A biblioteca deve permitir filtrar por grupo e mostrar a contagem de resultados.
- [x] O vídeo selecionado ou em reprodução deve ter indicação visual clara.

## Reprodução
- [x] O usuário deve conseguir selecionar um item da playlist para iniciar a reprodução.
- [x] O player deve oferecer reprodução, pausa, volume, progresso e tela cheia por meio dos controles nativos do navegador.
- [x] O painel do player deve exibir o título e o grupo do vídeo atual.
- [x] O aplicativo deve apresentar uma mensagem clara quando o navegador não conseguir reproduzir o formato do stream.

## Experiência e responsividade
- [x] A interface deve seguir a direção visual Cinema de Bolso: escura, imersiva, com vídeo em destaque, painéis discretos e acentos laranja-quente.
- [x] O layout deve funcionar em celular Android e em navegadores de TV Box, com alvos de toque amplos e navegação sem dependência de hover.
- [x] O aplicativo deve oferecer uma tela vazia orientando o usuário a importar sua primeira playlist.
- [x] O código deve funcionar no preview do navegador em uma porta HTTP configurada pelo projeto.
