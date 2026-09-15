# Verificação manual de segurança e casos extremos

Testes rodados via `curl` direto na API (sem passar pelo front), com o banco
populado pelo seed padrão, cobrindo a seção 9 do enunciado. Reproduza com o
backend no ar (local ou via `docker compose up`) e ajuste a base
(`http://localhost:3000/api`) se necessário.

## 1. Caso válido (baseline)

```bash
curl -s http://localhost:3000/api/health
# { "status": "ok", "database": "ok" }

curl -s http://localhost:3000/api/fabricantes
# [ { "id": 1, "nome": "WEG" }, { "id": 2, "nome": "Siemens" }, { "id": 3, "nome": "Eberle" } ]

curl -s "http://localhost:3000/api/motores?search=WEG"
# array só com os 4 motores de código WEG-*
```

## 2. Tentativa de SQL injection no campo de busca

```bash
curl -s "http://localhost:3000/api/motores?search=' OR '1'='1"
# []  — array vazio, não o banco inteiro.
```

A query usa `LIKE ?` com o termo passado como parâmetro do `mysql2`, nunca
concatenado na string SQL — o payload é tratado como dado literal, não como
sintaxe SQL.

## 3. Campo obrigatório faltando / corpo vazio

```bash
curl -s -X POST http://localhost:3000/api/motores -H "Content-Type: application/json" -d "{}"
```

```json
{
  "error": "Dados inválidos",
  "details": [
    "codigo é obrigatório",
    "modelo é obrigatório",
    "tensao é obrigatório",
    "fabricante_id é obrigatório",
    "potencia_cv é obrigatório",
    "frequencia_hz é obrigatório",
    "polos é obrigatório",
    "rotacao_rpm é obrigatório"
  ]
}
```

Status `400`, nunca `500` — corpo vazio não derruba a API.

## 4. Tipo errado

```bash
curl -s -X POST http://localhost:3000/api/motores -H "Content-Type: application/json" \
  -d '{"codigo":"X","modelo":"X","fabricante_id":1,"potencia_cv":"abc","tensao":"220V","frequencia_hz":60,"polos":4,"rotacao_rpm":1750}'
```

`potencia_cv: "abc"` vira `NaN` na conversão e entra em `details` como
`"potencia_cv é obrigatório"` — `400`, não `500`.

## 5. Fabricante inexistente

```bash
curl -s -X POST http://localhost:3000/api/motores -H "Content-Type: application/json" \
  -d '{"codigo":"TEST-002","modelo":"X","fabricante_id":999,"potencia_cv":3,"tensao":"220V","frequencia_hz":60,"polos":4,"rotacao_rpm":1750}'
```

```json
{ "error": "Dados inválidos", "details": ["fabricante_id não existe"] }
```

## 6. Criação válida + código duplicado

```bash
curl -s -X POST http://localhost:3000/api/motores -H "Content-Type: application/json" \
  -d '{"codigo":"TEST-001","modelo":"Motor Teste","fabricante_id":1,"potencia_cv":3,"tensao":"220V","frequencia_hz":60,"polos":4,"rotacao_rpm":1750}'
# 201, corpo com o motor criado (incluindo id)

curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/motores -H "Content-Type: application/json" \
  -d '{"codigo":"TEST-001","modelo":"Outro","fabricante_id":1,"potencia_cv":3,"tensao":"220V","frequencia_hz":60,"polos":4,"rotacao_rpm":1750}'
# 409
```

## 7. Id inexistente (GET, e por consequência PUT/DELETE seguem a mesma checagem)

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/motores/99999
# 404
```

## 8. Atualização (PUT) e exclusão (DELETE)

```bash
curl -s -X PUT http://localhost:3000/api/motores/<id> -H "Content-Type: application/json" \
  -d '{"codigo":"TEST-001","modelo":"Motor Teste Editado","fabricante_id":1,"potencia_cv":4,"tensao":"220V","frequencia_hz":60,"polos":4,"rotacao_rpm":1750}'
# 200, corpo com o motor atualizado

curl -s -o /dev/null -w "%{http_code}\n" -X DELETE http://localhost:3000/api/motores/<id>
# 204
```

## Resumo

| Caso                                  | Esperado | Observado |
| -------------------------------------- | -------- | --------- |
| Health check                           | 200      | ✅        |
| SQL injection no `search`              | sem vazar dados | ✅ (array vazio) |
| Corpo vazio                             | 400 com `details` | ✅ |
| Tipo errado (`potencia_cv: "abc"`)      | 400, não 500 | ✅ |
| `fabricante_id` inexistente             | 400 com `details` | ✅ |
| Código duplicado                        | 409      | ✅        |
| Id inexistente                          | 404      | ✅        |
| Criar / editar / excluir válidos        | 201/200/204 | ✅     |

Nenhuma resposta de erro expôs mensagem crua do MySQL, stack trace ou
detalhe interno do servidor em nenhum dos casos acima.
