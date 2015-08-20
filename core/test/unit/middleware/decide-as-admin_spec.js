// /*globals describe, beforeEach, afterEach, it*/
// /*jshint expr:true*/
// var should          = require('should'),
//     sinon           = require('sinon'),
//     decideIsAdmin   = require('../../../server/middleware/decide-is-admin');

// // To stop jshint complaining
// should.equal(true, true);

// describe('Middleware: decideIsAdmin', function () {
//   var sandbox,
//       res,
//       req,
//       next;

//   beforeEach(function () {
//     sandbox = sinon.sandbox.create();

//     next = sinon.spy();
//     res = sinon.spy();
//     req = {};
//   });

//   afterEach(function () {
//     sandbox.restore();
//   });

//   it('sets the isAdmin flag if the url contains /admin/.', function (done) {
//     var trueUrls = [
//           '/admin/',
//           '/admin/foo?bar=foo'
//         ],
//         falseUrls = [
//           '/admin',
//           'admin/',
//           '/foobar/admin',
//           '/things/admin/foo'
//         ];

//     trueUrls.forEach(function (url) {
//       res = sinon.spy();
//       next = sinon.spy();
//       req.url = url;

//       decideIsAdmin(req, res, next);
//       res.isAdmin.should.be.exactly(true);
//       next.calledOnce.should.be.exactly(true);
//     });

//     falseUrls.forEach(function (url) {
//       res = sinon.spy();
//       next = sinon.spy();
//       req.url = url;

//       decideIsAdmin(req, res, next);
//       res.isAdmin.should.be.exactly(false);
//       next.calledOnce.should.be.exactly(true);
//     });

//     done();
//   });
// })