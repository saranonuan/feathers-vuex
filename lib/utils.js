'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initAuth = exports.isBrowser = exports.isNode = undefined;
exports.stripSlashes = stripSlashes;
exports.upperCaseFirst = upperCaseFirst;
exports.getShortName = getShortName;
exports.getNameFromPath = getNameFromPath;
exports.getValidPayloadFromToken = getValidPayloadFromToken;
exports.payloadIsValid = payloadIsValid;
exports.readCookie = readCookie;

var _lodash = require('lodash.trim');

var _lodash2 = _interopRequireDefault(_lodash);

var _jwtDecode = require('jwt-decode');

var _jwtDecode2 = _interopRequireDefault(_jwtDecode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function stripSlashes(location) {
  return Array.isArray(location) ? location.map(function (l) {
    return (0, _lodash2.default)(l, '/');
  }) : (0, _lodash2.default)(location, '/');
}

function upperCaseFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getShortName(service) {
  var namespace = stripSlashes(service);
  if (Array.isArray(namespace)) {
    namespace = namespace.slice(-1);
  } else if (namespace.includes('/')) {
    namespace = namespace.slice(namespace.lastIndexOf('/') + 1);
  }
  return namespace;
}

function getNameFromPath(service) {
  return stripSlashes(service);
}

// from https://github.com/iliakan/detect-node
var isNode = exports.isNode = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';

var isBrowser = exports.isBrowser = !isNode;

var authDefaults = {
  commit: undefined,
  req: undefined,
  moduleName: 'auth',
  cookieName: 'feathers-jwt'
};

var initAuth = exports.initAuth = function initAuth(options) {
  var _Object$assign = Object.assign({}, authDefaults, options),
      commit = _Object$assign.commit,
      req = _Object$assign.req,
      moduleName = _Object$assign.moduleName,
      cookieName = _Object$assign.cookieName;

  if (typeof commit !== 'function') {
    throw new Error('You must pass the `commit` function in the `initAuth` function options.');
  }
  if (!req) {
    throw new Error('You must pass the `req` object in the `initAuth` function options.');
  }

  var accessToken = readCookie(req.headers.cookie, cookieName);
  var payload = getValidPayloadFromToken(accessToken);

  if (payload) {
    commit(moduleName + '/setAccessToken', accessToken);
    commit(moduleName + '/setPayload', payload);
  }
  return Promise.resolve(payload);
};

function getValidPayloadFromToken(token) {
  if (token) {
    try {
      var payload = (0, _jwtDecode2.default)(token);
      return payloadIsValid(payload) ? payload : undefined;
    } catch (error) {
      return undefined;
    }
  }
  return undefined;
}

// Pass a decoded payload and it will return a boolean based on if it hasn't expired.
function payloadIsValid(payload) {
  return payload && payload.exp * 1000 > new Date().getTime();
}

// Reads and returns the contents of a cookie with the provided name.
function readCookie(cookies, name) {
  if (!cookies) {
    console.log('no cookies found');
    return undefined;
  }
  var nameEQ = name + '=';
  var ca = cookies.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
}