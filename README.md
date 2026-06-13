# Tabela interativa da Copa 2026

Site estático em HTML, CSS e JavaScript para acompanhar a fase de grupos da Copa do Mundo 2026.

## Publicação

O projeto funciona no GitHub Pages. Depois de ativar o Pages no repositório, o site fica disponível em:

https://soletinho.github.io/tabela-copa-2026/

## Atualização automática de resultados

A automação usa GitHub Actions para consultar a API-Football e atualizar `data/results.json`.
A página pública lê apenas esse arquivo, então a chave da API não fica exposta no navegador.

### Configurar a chave

1. Crie uma conta gratuita em https://www.api-football.com/.
2. Pegue a chave da API no dashboard.
3. No GitHub, abra o repositório e vá em **Settings > Secrets and variables > Actions**.
4. Clique em **New repository secret**.
5. Use o nome `API_FOOTBALL_KEY`.
6. Cole a chave da API no valor do secret e salve.

### Como a automação economiza chamadas

A Action roda a cada 30 minutos, mas só consulta jogos que:

- já passaram de `horário de início + 2h15`;
- ainda não têm resultado final salvo em `data/results.json`.

Quando um jogo recebe status final (`FT`, `AET` ou `PEN`), o resultado fica salvo e não é consultado de novo.

### Variáveis opcionais

Por padrão, a automação busca fixtures por data em todas as competições. Se você quiser restringir a busca a uma competição específica da API-Football, configure em **Settings > Secrets and variables > Actions > Variables**:

- `API_FOOTBALL_LEAGUE_ID`: ID da competição na API-Football.
- `API_FOOTBALL_SEASON`: padrão `2026`.
