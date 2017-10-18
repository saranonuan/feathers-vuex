'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initAuth = undefined;

exports.default = function (feathersClient) {
  var globalOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  globalOptions = Object.assign({}, globalDefaults, globalOptions);

  return {
    service: (0, _serviceModule2.default)(feathersClient, globalOptions),
    auth: (0, _authModule2.default)(feathersClient, globalOptions)
  };
};

var _serviceModule = require('./service-module/service-module');

var _serviceModule2 = _interopRequireDefault(_serviceModule);

var _authModule = require('./auth-module/auth-module');

var _authModule2 = _interopRequireDefault(_authModule);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var globalDefaults = {
  idField: 'id', // The field in each record that will contain the id
  autoRemove: false, // automatically remove records missing from responses (only use with feathers-rest)
  nameStyle: 'short' // Determines the source of the module name. 'short', 'path', or 'explicit'
};

exports.initAuth = _utils.initAuth;