'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = servicePluginInit;

var _utils = require('../utils');

var _state = require('./state');

var _state2 = _interopRequireDefault(_state);

var _getters = require('./getters');

var _getters2 = _interopRequireDefault(_getters);

var _mutations = require('./mutations');

var _mutations2 = _interopRequireDefault(_mutations);

var _actions = require('./actions');

var _actions2 = _interopRequireDefault(_actions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaults = {
  idField: 'id', // The field in each record that will contain the id
  autoRemove: false, // automatically remove records missing from responses (only use with feathers-rest)
  nameStyle: 'short', // Determines the source of the module name. 'short', 'path', or 'explicit'
  enableEvents: true, // Listens to socket.io events when available
  state: {}, // for custom state
  getters: {}, // for custom getters
  mutations: {}, // for custom mutations
  actions: {} // for custom actions
};

function servicePluginInit(feathersClient) {
  var globalOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (!feathersClient || !feathersClient.service) {
    throw new Error('You must provide a Feathers Client instance to feathers-vuex');
  }

  globalOptions = Object.assign({}, defaults, globalOptions);

  return function createServiceModule(servicePath) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (!feathersClient || !feathersClient.service) {
      throw new Error('You must provide a service path or object to create a feathers-vuex service module');
    }

    options = Object.assign({}, globalOptions, options);
    var _options = options,
        idField = _options.idField,
        autoRemove = _options.autoRemove,
        nameStyle = _options.nameStyle;


    if (typeof servicePath !== 'string') {
      throw new Error('The first argument to setup a feathers-vuex service must be a string');
    }

    var service = feathersClient.service(servicePath);
    if (!service) {
      throw new Error('No service was found. Please configure a transport plugin on the Feathers Client. Make sure you use the client version of the transport, like `feathers-socketio/client` or `feathers-rest/client`.');
    }
    var paginate = service.hasOwnProperty('paginate') && service.paginate.hasOwnProperty('default');

    var defaultState = (0, _state2.default)(servicePath, { idField: idField, autoRemove: autoRemove, paginate: paginate });
    var defaultGetters = (0, _getters2.default)(servicePath);
    var defaultMutations = (0, _mutations2.default)(servicePath);
    var defaultActions = (0, _actions2.default)(service);

    return function setupStore(store) {
      var nameStyles = {
        short: _utils.getShortName,
        path: _utils.getNameFromPath
      };
      var namespace = options.namespace || nameStyles[nameStyle](servicePath);

      store.registerModule(namespace, {
        namespaced: true,
        state: Object.assign({}, defaultState, options.state),
        getters: Object.assign({}, defaultGetters, options.getters),
        mutations: Object.assign({}, defaultMutations, options.mutations),
        actions: Object.assign({}, defaultActions, options.actions)
      });

      if (options.enableEvents) {
        // Listen to socket events when available.
        service.on('created', function (item) {
          return store.commit(namespace + '/addItem', item);
        });
        service.on('updated', function (item) {
          return store.commit(namespace + '/updateItem', item);
        });
        service.on('patched', function (item) {
          return store.commit(namespace + '/updateItem', item);
        });
        service.on('removed', function (item) {
          return store.commit(namespace + '/removeItem', item);
        });
      }
    };
  };
}
module.exports = exports['default'];