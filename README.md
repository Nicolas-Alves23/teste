# Cadastro de Motores Elétricos

Portal simples para cadastro de motores elétricos, desenvolvido como teste técnico
para a vaga de Analista Desenvolvedor de Sistemas Júnior.

- **Back-end**: API REST em Node.js (Express) + MySQL, com queries parametrizadas via `mysql2`.
- **Front-end**: Angular (standalone components + Reactive Forms) consumindo a API.
- **Infra**: Docker Compose sobe banco, API e front com um único comando.

## Funcionalidades

Ao abrir o app (`/`), aparece uma **tela inicial de boas-vindas** com um botão para
acessar o cadastro e uma opção "não mostrar novamente" (salva em `localStorage`).
> Essa tela **não faz parte do escopo original do teste** — é um adicional pessoal,
> puramente de front-end (sem backend/sessão envolvida). O núcleo avaliado é a tela
> de cadastro em `/motores`, descrita abaixo.

Tela única de cadastro de motores (`/motores`) com:

- **Listar**: tabela com todos os motores cadastrados, mostrando o nome do fabricante.
- **Buscar**: campo de texto que filtra por código ou modelo (`GET /motores?search=`).
- **Criar**: formulário com validação de campos (client-side e server-side).
- **Editar**: mesmo formulário, pré-carregado com os dados do motor.
- **Excluir**: com modal de confirmação antes de apagar.
- Combo de fabricante alimentado pela tabela `fabricantes` (relacionamento 1:N com `motores`).
- Mensagens de erro por campo, aviso de sucesso/erro ao salvar, indicador de carregamento
  e mensagem de "nenhum motor encontrado".

## Como subir

Pré-requisito: Docker e Docker Compose instalados.

```bash
git clone <url-do-repositorio>
cd <pasta-do-repositorio>
docker compose up -d --build
```

Não é necessário nenhum passo manual antes disso — o compose já usa valores padrão
mesmo sem um arquivo `.env` (veja `.env.example` caso queira customizar usuário/senha
do banco, portas etc.). O banco é criado e populado automaticamente na primeira
subida através dos scripts em `backend/db/init/` (montados em
`/docker-entrypoint-initdb.d` do container MySQL).

Depois que os containers estiverem de pé (o `backend` só inicia depois que o
healthcheck do MySQL fica saudável, e ainda faz retentativa de conexão no código
como segunda camada de proteção):

| Serviço          | URL                          |
| ---------------- | ---------------------------- |
| Front-end Angular | http://localhost:4200        |
| API Node          | http://localhost:3000/api    |
| Health check      | http://localhost:3000/api/health |
| MySQL             | localhost:3306                |

## Como parar

```bash
docker compose down
```

Para apagar também os dados do banco (volume):

```bash
docker compose down -v
```

## Estrutura do repositório

```
/
├── docker-compose.yml
├── README.md
├── .env.example
├── backend/     # API Node.js + Express + MySQL
└── frontend/    # Angular
```

## Modelo de dados

Duas tabelas, seguindo exatamente o esquema do enunciado:

- `fabricantes` (id, nome) — populada com 3 fabricantes (WEG, Siemens, Eberle).
- `motores` (id, codigo, modelo, fabricante_id, potencia_cv, tensao, frequencia_hz,
  polos, rotacao_rpm, carcaca, grau_protecao, preco, criado_em) — populada com 11
  motores de exemplo, com `fabricante_id` referenciando `fabricantes` via FK.

## Contrato da API

Base: `http://localhost:3000/api`

| Método | Rota                  | Retorno                                  |
| ------ | --------------------- | ----------------------------------------- |
| GET    | `/health`              | `200 { status: "ok", database: "ok" }`    |
| GET    | `/fabricantes`         | `200` array de fabricantes                |
| GET    | `/motores`             | `200` array de motores                    |
| GET    | `/motores?search=...`  | `200` array filtrado por código ou modelo |
| GET    | `/motores/:id`         | `200` motor ou `404`                      |
| POST   | `/motores`              | `201` motor criado                        |
| PUT    | `/motores/:id`         | `200` motor atualizado                    |
| DELETE | `/motores/:id`         | `204`                                       |

Erros:

- `400` — `{ "error": "Dados inválidos", "details": ["..."] }`
- `409` — código já cadastrado
- `404` — motor não encontrado

Validações aplicadas **no servidor** (não só no formulário): `codigo` obrigatório e
único, `modelo` obrigatório, `fabricante_id` obrigatório e precisa existir,
`potencia_cv` obrigatório e maior que zero, `tensao` obrigatória, `frequencia_hz`
deve ser 50 ou 60, `polos` deve ser 2, 4, 6 ou 8, `rotacao_rpm` maior que zero.

## Decisões técnicas

- **`mysql2` puro (sem ORM)**: para deixar explícito que todas as queries usam
  placeholders (`?`) e são parametrizadas, sem nenhuma concatenação de string com
  dado vindo da requisição — inclusive no campo de busca (`LIKE ?`), que é o ponto
  testado contra SQL injection.
- **Retorno de `/motores` com o nome do fabricante já no JSON** (`fabricante_nome`,
  via `JOIN`): evita que o front precise fazer uma segunda chamada por linha da
  tabela só para mostrar o fabricante.
- **Duplicidade de código como `409` separado da validação `400`**: a checagem de
  obrigatoriedade do campo `codigo` entra em `details` (400); a violação da
  constraint `UNIQUE` (`uk_motor_codigo`) vira `409`, capturada tanto na validação
  prévia quanto como fallback no error handler (`ER_DUP_ENTRY`), caso duas
  requisições concorrentes colidam entre a checagem e o insert.
- **Router com apenas duas rotas**: `/` (boas-vindas) e `/motores` (cadastro, o
  núcleo avaliado). O `AppComponent` só hospeda o `<router-outlet>`; toda a lógica
  do cadastro vive em `MotoresPageComponent`, que concentra o estado da página e
  delega o formulário para `MotorFormComponent` (componente "burro", recebe o motor
  via `@Input` e emite o payload via `@Output`). Um guard funcional
  (`skipWelcomeGuard`) redireciona direto para `/motores` quando o usuário já marcou
  "não mostrar novamente" — tudo client-side, sem backend envolvido.
- **Helmet + usuário não-root no container da API**: `helmet()` aplica um conjunto
  padrão de headers HTTP de segurança; o `Dockerfile` do backend roda a aplicação
  como o usuário `node` (não-root) já disponível na imagem `node:20-alpine`.
- **Usuário do MySQL com privilégio mínimo**: a API nunca se conecta como `root` —
  usa um usuário de aplicação (`motores_user`) com permissões restritas ao schema
  `motores_db`, definido nas variáveis de ambiente do compose.
- **Front-end serve via Nginx**: o Dockerfile do front faz build multi-stage
  (`ng build` seguido de `nginx:alpine`) em vez de rodar `ng serve` em produção,
  pelos mesmos motivos de qualquer app Angular: build otimizado e um servidor
  HTTP mais leve/estável servindo os arquivos estáticos.
- **Health check do backend consulta o banco** (`SELECT 1`): retorna `503` se o
  MySQL estiver inacessível, para refletir o estado real do serviço.

## Limitações e próximos passos

Fora do escopo pedido pelo enunciado (login, permissões, paginação, relatórios,
upload de imagem, testes automatizados) — de propósito, para não passar a
impressão de over-engineering numa vaga júnior. Como próximos passos reais, dado
mais tempo:

- Testes automatizados (unitários no backend, e2e no front) cobrindo os casos da
  seção 9 do enunciado (validação, SQL injection, duplicidade, 404).
- Rate limiting básico na API (ex.: `express-rate-limit`) — não obrigatório, mas
  uma camada extra razoável mesmo sem autenticação.
- Paginação em `/motores` se a base crescer muito além do volume de teste.

## Parando para pensar: o que ficou mais difícil / o que eu faria diferente

_(espaço reservado para você preencher com suas próprias palavras antes de enviar
por e-mail — veja a seção 7 do enunciado. Vale falar sobre o que foi mais difícil
de acertar no contrato da API e o que você mudaria com mais tempo, ex.: paginação,
testes automatizados, upload de imagem do motor, etc.)_
