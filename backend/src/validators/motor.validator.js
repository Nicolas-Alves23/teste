const FREQUENCIAS_VALIDAS = [50, 60];
const POLOS_VALIDOS = [2, 4, 6, 8];

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

/**
 * Valida e normaliza o payload de um motor (usado em POST e PUT).
 * Retorna { values, details } — values já vem com os tipos corretos
 * (números convertidos), details é um array de mensagens de erro.
 * A existência do fabricante_id no banco é checada à parte no controller,
 * pois depende de uma consulta ao banco.
 */
function validateMotorInput(body = {}) {
  const details = [];

  const codigo = isBlank(body.codigo) ? '' : String(body.codigo).trim();
  if (!codigo) details.push('codigo é obrigatório');

  const modelo = isBlank(body.modelo) ? '' : String(body.modelo).trim();
  if (!modelo) details.push('modelo é obrigatório');

  const tensao = isBlank(body.tensao) ? '' : String(body.tensao).trim();
  if (!tensao) details.push('tensao é obrigatório');

  let fabricanteId = null;
  if (isBlank(body.fabricante_id)) {
    details.push('fabricante_id é obrigatório');
  } else {
    fabricanteId = Number(body.fabricante_id);
    if (!Number.isInteger(fabricanteId) || fabricanteId <= 0) {
      details.push('fabricante_id é obrigatório');
      fabricanteId = null;
    }
  }

  let potenciaCv = null;
  if (isBlank(body.potencia_cv)) {
    details.push('potencia_cv é obrigatório');
  } else {
    potenciaCv = Number(body.potencia_cv);
    if (Number.isNaN(potenciaCv)) {
      details.push('potencia_cv é obrigatório');
      potenciaCv = null;
    } else if (potenciaCv <= 0) {
      details.push('potencia_cv deve ser maior que zero');
    }
  }

  let frequenciaHz = null;
  if (isBlank(body.frequencia_hz)) {
    details.push('frequencia_hz é obrigatório');
  } else {
    frequenciaHz = Number(body.frequencia_hz);
    if (!FREQUENCIAS_VALIDAS.includes(frequenciaHz)) {
      details.push('frequencia_hz deve ser 50 ou 60');
    }
  }

  let polos = null;
  if (isBlank(body.polos)) {
    details.push('polos é obrigatório');
  } else {
    polos = Number(body.polos);
    if (!POLOS_VALIDOS.includes(polos)) {
      details.push('polos deve ser 2, 4, 6 ou 8');
    }
  }

  let rotacaoRpm = null;
  if (isBlank(body.rotacao_rpm)) {
    details.push('rotacao_rpm é obrigatório');
  } else {
    rotacaoRpm = Number(body.rotacao_rpm);
    if (Number.isNaN(rotacaoRpm)) {
      details.push('rotacao_rpm é obrigatório');
      rotacaoRpm = null;
    } else if (rotacaoRpm <= 0) {
      details.push('rotacao_rpm deve ser maior que zero');
    }
  }

  const carcaca = isBlank(body.carcaca) ? null : String(body.carcaca).trim();
  const grauProtecao = isBlank(body.grau_protecao) ? null : String(body.grau_protecao).trim();

  let preco = null;
  if (!isBlank(body.preco)) {
    preco = Number(body.preco);
    if (Number.isNaN(preco) || preco < 0) {
      details.push('preco deve ser maior ou igual a zero');
      preco = null;
    }
  }

  return {
    details,
    values: {
      codigo,
      modelo,
      fabricante_id: fabricanteId,
      potencia_cv: potenciaCv,
      tensao,
      frequencia_hz: frequenciaHz,
      polos,
      rotacao_rpm: rotacaoRpm,
      carcaca,
      grau_protecao: grauProtecao,
      preco,
    },
  };
}

module.exports = { validateMotorInput };
