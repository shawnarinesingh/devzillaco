module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/home/ubuntu/devzilla/core/build/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var routerRenderer = __webpack_require__(1),
	    alt = __webpack_require__(7),
	    routes = __webpack_require__(5);

	module.exports = routerRenderer(alt, routes);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var Iso = __webpack_require__(2),
	    React = __webpack_require__(3),
	    Router = __webpack_require__(4),
	    routes = __webpack_require__(5);

	function routerRenderer(alt) {
	  if (typeof window === 'undefined') {
	    return function (state, url) {
	      var markup;
	      Router.run(routes, url, function (Handler) {
	        alt.bootstrap(state);
	        var content = React.renderToString(React.createElement(Handler));
	        markup = Iso.render(content, alt.takeSnapshot());
	        alt.flush();
	      });
	      return markup;
	    };
	  } else {
	    Iso.bootstrap(function (state, _, container) {
	      alt.bootstrap(state);
	      Router.run(routes, Router.HistoryLocation, function (Handler) {
	        var node = React.createElement(Handler);
	        React.render(node, container);
	      });
	    });
	  }
	}

	module.exports = routerRenderer;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("iso");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("react");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("react-router");

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(3),
	    $__0=     __webpack_require__(4),Route=$__0.Route,DefaultRoute=$__0.DefaultRoute,
	    App = __webpack_require__(6);

	var routes = (
	  React.createElement(Route, {name: "app", path: "/", handler: App}, 
	    React.createElement(DefaultRoute, {handler: App})
	  )
	);

	module.exports = routes;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(3);

	var App = React.createClass({displayName: "App",
	  render: function () {
	    return (
	      React.createElement("div", null, "Hello, World!")  
	    );
	  }
	});

	module.exports = App;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var Alt = __webpack_require__(8);

	module.exports = new Alt();

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = require("alt");

/***/ }
/******/ ]);