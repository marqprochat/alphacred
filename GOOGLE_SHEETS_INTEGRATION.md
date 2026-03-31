# Integracao com Google Sheets

Este projeto envia o formulario para um endpoint do Google Apps Script. O frontend so mostra sucesso quando a resposta do endpoint confirma `verified: true`.

No seu caso, a planilha tem duas colunas extras no inicio:

```text
Nº | STATUS | NOME | CNPJ | CPF | RG | TELEFONE | E-MAIL | END | BAIRRO | CIDADE | ESTADO | CEP
```

O ajuste correto e:

- a coluna `Nº` passa a ser preenchida automaticamente pelo script
- a coluna `STATUS` pode ficar vazia ou receber um valor padrao como `NOVO`
- os dados do formulario entram de `C` ate `M`
- o app deixa de usar o numero fisico da linha como referencia principal

## 1. Estrutura da planilha

Monte a aba exatamente nesta ordem:

```text
A: Nº
B: STATUS
C: NOME
D: CNPJ
E: CPF
F: RG
G: TELEFONE
H: E-MAIL
I: END
J: BAIRRO
K: CIDADE
L: ESTADO
M: CEP
```

## 2. Criar o Apps Script

Na planilha:

1. Acesse `Extensoes > Apps Script`.
2. Apague o conteudo padrao.
3. Cole o script abaixo.
4. Troque `ABA_FORMULARIO` pelo nome real da sua aba.

```javascript
const SHEET_NAME = 'ABA_FORMULARIO';
const HEADER_ROW = 1;
const FIRST_DATA_ROW = 2;
const STATUS_DEFAULT = '';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    if (!sheet) {
      return jsonResponse({
        verified: false,
        message: `A aba "${SHEET_NAME}" nao foi encontrada.`,
      });
    }

    const payload = {
      nome: String(data.nome || '').trim(),
      cnpj: String(data.cnpj || '').trim(),
      cpf: String(data.cpf || '').trim(),
      rg: String(data.rg || '').trim(),
      telefone: String(data.telefone || '').trim(),
      email: String(data.email || '').trim(),
      end: String(data.end || '').trim(),
      bairro: String(data.bairro || '').trim(),
      cidade: String(data.cidade || '').trim(),
      estado: String(data.estado || '').trim().toUpperCase(),
      cep: String(data.cep || '').trim(),
    };

    if (!payload.nome || !payload.telefone || !payload.email) {
      return jsonResponse({
        verified: false,
        message: 'Nome, telefone e e-mail sao obrigatorios.',
      });
    }

    if (!payload.cpf && !payload.cnpj) {
      return jsonResponse({
        verified: false,
        message: 'Informe CPF ou CNPJ.',
      });
    }

    const cadastroNumber = getNextCadastroNumber(sheet);
    const targetRow = getNextEmptyRow(sheet);

    const values = [[
      cadastroNumber,
      STATUS_DEFAULT,
      payload.nome,
      payload.cnpj,
      payload.cpf,
      payload.rg,
      payload.telefone,
      payload.email,
      payload.end,
      payload.bairro,
      payload.cidade,
      payload.estado,
      payload.cep,
    ]];

    sheet.getRange(targetRow, 1, 1, values[0].length).setValues(values);
    SpreadsheetApp.flush();

    const insertedRow = sheet.getRange(targetRow, 1, 1, values[0].length).getValues()[0];
    const verified = values[0].every((value, index) => String(insertedRow[index] || '').trim() === String(value || '').trim());

    return jsonResponse({
      verified,
      status: verified ? 'verified' : 'not_verified',
      rowNumber: targetRow,
      cadastroNumber,
      message: verified
        ? 'Cadastro adicionado e verificado com sucesso.'
        : 'O cadastro foi inserido, mas a verificacao falhou.',
    });
  } catch (error) {
    return jsonResponse({
      verified: false,
      message: error instanceof Error ? error.message : 'Erro inesperado ao gravar na planilha.',
    });
  }
}

function getNextCadastroNumber(sheet) {
  const lastRow = Math.max(sheet.getLastRow(), FIRST_DATA_ROW - 1);

  if (lastRow < FIRST_DATA_ROW) {
    return 1;
  }

  const range = sheet.getRange(FIRST_DATA_ROW, 1, lastRow - FIRST_DATA_ROW + 1, 1).getValues();
  const numbers = range
    .flat()
    .map((value) => Number(value))
    .filter((value) => !Number.isNaN(value) && value > 0);

  return numbers.length ? Math.max(...numbers) + 1 : 1;
}

function getNextEmptyRow(sheet) {
  const lastRow = Math.max(sheet.getLastRow(), FIRST_DATA_ROW - 1);

  if (lastRow < FIRST_DATA_ROW) {
    return FIRST_DATA_ROW;
  }

  const data = sheet.getRange(FIRST_DATA_ROW, 1, lastRow - FIRST_DATA_ROW + 1, 13).getValues();

  for (let index = 0; index < data.length; index += 1) {
    const row = data[index];
    const nome = String(row[2] || '').trim();

    if (!nome) {
      return FIRST_DATA_ROW + index;
    }
  }

  return lastRow + 1;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 3. Como esse ajuste resolve o problema da linha 502

Se o script usa `appendRow()` ou `getLastRow()` sem cuidado, ele pode considerar areas antigas formatadas, linhas vazias usadas antes ou registros escondidos, e por isso o cadastro vai parar em uma linha muito abaixo.

Com o script acima:

- o proximo `Nº` e calculado olhando a coluna `A`
- a proxima linha livre e encontrada pela primeira linha sem `NOME`
- `STATUS` nao interfere no envio
- os dados do formulario sempre entram nas colunas corretas

## 4. Publicar o endpoint

1. Clique em `Implantar > Nova implantacao`.
2. Escolha `Aplicativo da Web`.
3. Em `Executar como`, selecione sua conta.
4. Em `Quem tem acesso`, selecione `Qualquer pessoa`.
5. Conclua a implantacao e copie a URL final do Web App.

Sempre que alterar o script, faca uma nova implantacao.

## 5. Configurar o frontend

Crie ou edite o arquivo `.env` na raiz do projeto:

```env
VITE_GOOGLE_SHEETS_WEBHOOK_URL="https://script.google.com/macros/s/SEU_WEB_APP_ID/exec"
```

Depois reinicie o projeto:

```bash
npm run dev
```

## 6. Payload enviado pelo app

O frontend envia um `POST` assim:

```json
{
  "nome": "Cliente Exemplo",
  "cnpj": "12.345.678/0001-99",
  "cpf": "",
  "rg": "12.345.678-9",
  "telefone": "(19) 99999-9999",
  "email": "contato@empresa.com",
  "end": "Rua Exemplo, 100",
  "bairro": "Centro",
  "cidade": "Campinas",
  "estado": "SP",
  "cep": "13000-000"
}
```

## 7. Resposta esperada

O ideal agora e o Apps Script retornar algo assim:

```json
{
  "verified": true,
  "status": "verified",
  "rowNumber": 2,
  "cadastroNumber": 1,
  "message": "Cadastro adicionado e verificado com sucesso."
}
```

No frontend, o melhor identificador para o usuario acompanhar e `cadastroNumber`, nao `rowNumber`.

## 8. Alternativa sem script para numeracao

Se preferir, voce pode deixar a coluna `A` automatica com formula no Google Sheets:

```text
=ARRAYFORMULA(SE(C2:C="";"";LIN(C2:C)-1))
```

Mas eu recomendo manter a numeracao no script, porque assim:

- o numero fica estavel mesmo se voce mover linhas
- o frontend pode receber o numero do cadastro ja na resposta
- a regra fica centralizada no backend da planilha

## 9. Teste rapido

1. Atualize o Apps Script.
2. Faça uma nova implantacao.
3. Envie um novo cadastro pelo site.
4. Confirme se ele entrou na primeira linha realmente vazia.
5. Confirme se a coluna `A` recebeu o proximo numero automaticamente.
