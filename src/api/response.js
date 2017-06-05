module.exports.respond = function(res, data) {
  Promise.resolve(data)
    .then((e) => res.json(e))
    .catch((e) => {
      console.log('Error responding: ', e);
      res.status(500).send('Internal server error.')
    });
}
