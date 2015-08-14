var appBookshelf  = require('./base'),
    Basetoken       = require('./base/token'),

    Refreshtoken,
    Refreshtokens;

Refreshtoken = Basetoken.extend({
  tableName: 'refreshtokens'
});

Refreshtokens = appBookshelf.Collection.extend({
  model: Refreshtoken
});

module.exports = {
  Refreshtoken: appBookshelf.model('Refreshtoken', Refreshtoken),
  Refreshtokens: appBookshelf.collection('Refreshtokens', Refreshtokens)
};
