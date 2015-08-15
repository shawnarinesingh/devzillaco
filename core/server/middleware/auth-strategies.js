var passport = require('passport'),
    BearerStrategy = require('passport-http-bearer').Strategy,
    ClientPasswordStrategy = require('passport-oath2-client-password').Strategy,
    models = require('../models');

/**
 * ClientPasswordStrategy
 * 
 * This strategy is used to authenticate registered OAuth clients. It is
 * employed to protect the `token` endpoint, which consumers use to obtain
 * access tokens.  The OAuth 2.0 specification suggests that clients use the
 * HTTP Basic scheme to authenticate (not implemented yet).
 */