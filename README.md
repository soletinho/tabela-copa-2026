# Tabela interativa da Copa 2026

Site estático em HTML, CSS e JavaScript para acompanhar a fase de grupos e mata-mata da Copa do Mundo 2026.

## Publicação

O projeto funciona no GitHub Pages. Depois de ativar o Pages no repositório, o site fica disponível em:

https://soletinho.github.io/tabela-copa-2026/

## Atualização de resultados

Os resultados são atualizados manualmente por meio de uma **área administrativa**:

https://soletinho.github.io/tabela-copa-2026/admin.html

A página administrativa grava os resultados nos arquivos `data/manual-results.json` e `data/results.json` diretamente no repositório via GitHub API.

### Como usar a área administrativa

1. Acesse `admin.html`
2. Informe um token GitHub com permissão de escrita no repositório
3. Escolha a fase (Grupos ou Mata-Mata)
4. Selecione a partida
5. Informe o placar e salve

O site público lê `data/results.json` e `data/manual-results.json`, então o token da API nunca fica exposto no navegador.

### Fase de grupos

A tabela de grupos é definida em `data/schedule.json` e os resultados em `data/results.json`.

### Fase mata-mata

A estrutura do mata-mata é definida em `data/knockout-schedule.json`. Para partidas do mata-mata, a área administrativa permite preencher tanto os nomes dos times quanto os placares.

## Como a tabela é alimentada

1. O site carrega `data/schedule.json` (grupos) e `data/knockout-schedule.json` (mata-mata)
2. Lê `data/results.json` e `data/manual-results.json` para os placares
3. Renderiza tudo no navegador, sem backend
