function requireFields(obj, fields) {
  for (const k of fields) {
    if (obj[k] === undefined || obj[k] === null || obj[k] === "") {
      const err = new Error(`Campo obrigatório: ${k}`);
      err.statusCode = 400;
      throw err;
    }
  }
}

module.exports = { requireFields };
