module.exports.respond = function(res, data) {
  Promise.resolve(data)
    .then((e) => res.json({
      success: true,
      data: e
    }))
    .catch((e) => res.json({
      success: false,
      error: e
    }))
}
