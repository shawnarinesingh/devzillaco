var passport = require('passport'),
    BearerStrategy = require('passport-http-bearer').Strategy,
    ClientPasswordStrategy = require('passport-oath2-client-password').Strategy,
    models = require('../models');
