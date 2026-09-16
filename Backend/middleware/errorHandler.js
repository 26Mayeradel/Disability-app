// Any error not already handled by a controller ends up here. We log the
// real details on the server and only ever send a generic Arabic message to
// the client — no stack traces, SQL errors, or internal details.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(err);

  if (res.headersSent) return next(err);

  res.status(500).json({ message: "حدث خطأ غير متوقع في الخادم، يرجى المحاولة لاحقًا" });
}

function notFoundHandler(req, res) {
  res.status(404).json({ message: "المسار المطلوب غير موجود" });
}

module.exports = { errorHandler, notFoundHandler };
