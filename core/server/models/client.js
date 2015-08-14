var appBookshelf = require('./base'),

    Client,
    Clients;
    
Client = appBookshelf.Model.extend({
  tableName: 'clients'
});

Clients = appBookshelf.Collection.extend({
  model: Client
});

module.exports = {
  Client: appBookshelf.model('Client', Client),
  Clients: appBookshelf.collection('Clients', Clients)
};