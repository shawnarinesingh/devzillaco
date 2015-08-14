var appBookshelf  = require('./base'),
    Basetoken     = require('./base/token'),
    
    Accesstoken,
    Accesstokens;

Accesstoken = Basetoken.extend({
  tableName: 'accesstokens'
});

Accesstokens = appBookshelf.Collection.extend({
  model: Accesstoken
});

module.exports = {
  Accesstoken: appBookshelf.model('Accesstoken', Accesstoken),
  Accesstokens: appBookshelf.collection('Accesstokens', Accesstokens)
};