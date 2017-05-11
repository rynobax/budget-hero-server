module.exports.respond = function(res, data) {
  Promise.resolve(data)
    .then((e) => res.json(e))
    .catch((e) => res.status(500).json(e))
}
