function errorHandler(err, req, res, next) {
  console.error("🔥 Error:", err);
  const status = err.statusCode || 500;
  res.status(status).json({
    ok: false,
    message: err.message || "Erro interno."
  });
}

module.exports = { errorHandler };
