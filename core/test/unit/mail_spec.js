/*globals describe, afterEach, it*/
/*jshint expr:true*/
var should          = require('should'),
    Promise         = require('bluebird'),
    
    // Stuff we are testing
    mailer          = require('../../server/mail'),
    config          = require('../../server/config'),
    
    SMTP;

// Mock SMTP config
SMTP = {
  transport: 'SMTP',
  options: {
    service: 'Gmail',
    auth: {
      user: 'nil',
      pass: '123'
    }
  }
};

describe('Mail', function () {
  afterEach(function () {
    config.set({mail: null});
  });
  
  it('should attach mail provider to app instance', function () {
    should.exist(mailer);
    mailer.should.have.property('init');
    mailer.should.have.property('transport');
    mailer.should.have.property('send').and.be.a.function;
  });
  
  it('should setup SMTP transport on initialization', function (done) {
    config.set({mail: SMTP});
    mailer.init().then(function () {
      mailer.should.have.property('transport');
      mailer.transport.transportType.should.eql('SMTP');
      mailer.transport.sendMail.should.be.a.function;
      done();
    }).catch(done);
  });
  
  it('should fallback to direct if config is empty', function (done) {
    config.set({mail: {}});
    mailer.init().then(function () {
      mailer.should.have.property('transport');
      mailer.transport.transportType.should.eql('DIRECT');
      done();
    }).catch(done);
  });
  
  it('should fail to send messages when given insufficient data', function (done) {
    Promise.settle([
      mailer.send(),
      mailer.send({}),
      mailer.send({subject: '123'}),
      mailer.send({subject: '', html: '123'})
    ]).then(function (descriptors) {
      descriptors.forEach(function (d) {
        d.isRejected().should.be.true;
        d.reason().should.be.an.instanceOf(Error);
        d.reason().message.should.eql('Email Error: Incomplete message data.');
      });
      done();
    }).catch(done);
  });
  
  it('should use from address as configured in config.js', function () {
    config.set({
      mail: {
        from: '"Name" <static@example.com>'
      }
    });
    mailer.from().should.equal('"Title" <static@example.com>');
  });
  
  it('should fall back to [title] <devzilla@[url]> as from address', function () {
    // Standard domain
    
  });
  
  it('should use mail.from if both from and fromaddress are present', function () {
    
  });
  
  it('should attach title if from or fromaddress are only email addresses', function () {
    
  });
  
});