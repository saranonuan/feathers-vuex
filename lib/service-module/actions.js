'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = makeServiceActions;
function makeServiceActions(service) {
  var serviceActions = {
    find: function find(_ref) {
      var commit = _ref.commit,
          dispatch = _ref.dispatch,
          getters = _ref.getters;
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      commit('setFindPending');

      var handleResponse = function handleResponse(response) {
        var _params$qid = params.qid,
            qid = _params$qid === undefined ? 'default' : _params$qid,
            query = params.query;


        dispatch('addOrUpdateList', response);
        commit('unsetFindPending');

        // The pagination data will be under `pagination.default` or whatever qid is passed.
        if (response.data) {
          commit('updatePaginationForQuery', { qid: qid, response: response, query: query });
        }

        return response;
      };
      var handleError = function handleError(error) {
        commit('setFindError', error);
        commit('unsetFindPending');
        return Promise.reject(error);
      };

      var request = service.find(params);

      if (service.rx) {
        Object.getPrototypeOf(request).catch(handleError);
      } else {
        request.catch(handleError);
      }

      return request.subscribe ? request.subscribe(handleResponse) : request.then(handleResponse);
    },


    // Two query syntaxes are supported, since actions only receive one argument.
    //   1. Just pass the id: `get(1)`
    //   2. Pass arguments as an array: `get([null, params])`
    get: function get(_ref2, args) {
      var commit = _ref2.commit,
          dispatch = _ref2.dispatch;

      var id = void 0;
      var params = void 0;

      if (Array.isArray(args)) {
        id = args[0];
        params = args[1];
      } else {
        id = args;
      }

      commit('setGetPending');

      return service.get(id, params).then(function (item) {
        dispatch('addOrUpdate', item);
        commit('setCurrent', item);
        commit('unsetGetPending');
        return item;
      }).catch(function (error) {
        commit('setGetError', error);
        commit('unsetGetPending');
        return Promise.reject(error);
      });
    },
    create: function create(_ref3, data) {
      var commit = _ref3.commit,
          dispatch = _ref3.dispatch;

      commit('setCreatePending');

      return service.create(data).then(function (item) {
        dispatch('addOrUpdate', item);
        commit('setCurrent', item);
        commit('unsetCreatePending');
        return item;
      }).catch(function (error) {
        commit('setCreateError', error);
        commit('unsetCreatePending');
        return Promise.reject(error);
      });
    },
    update: function update(_ref4, _ref5) {
      var commit = _ref4.commit,
          dispatch = _ref4.dispatch;

      var _ref6 = _slicedToArray(_ref5, 3),
          id = _ref6[0],
          data = _ref6[1],
          params = _ref6[2];

      commit('setUpdatePending');

      return service.update(id, data, params).then(function (item) {
        dispatch('addOrUpdate', item);
        commit('unsetUpdatePending');
        return item;
      }).catch(function (error) {
        commit('setUpdateError', error);
        commit('unsetUpdatePending');
        return Promise.reject(error);
      });
    },
    patch: function patch(_ref7, _ref8) {
      var commit = _ref7.commit,
          dispatch = _ref7.dispatch;

      var _ref9 = _slicedToArray(_ref8, 3),
          id = _ref9[0],
          data = _ref9[1],
          params = _ref9[2];

      commit('setPatchPending');

      return service.patch(id, data, params).then(function (item) {
        dispatch('addOrUpdate', item);
        commit('unsetPatchPending');
        return item;
      }).catch(function (error) {
        commit('setPatchError', error);
        commit('unsetPatchPending');
        return Promise.reject(error);
      });
    },
    remove: function remove(_ref10, id) {
      var commit = _ref10.commit,
          dispatch = _ref10.dispatch;

      commit('setRemovePending');

      return service.remove(id).then(function (item) {
        commit('removeItem', id);
        commit('unsetRemovePending');
        return item;
      }).catch(function (error) {
        commit('setRemoveError', error);
        commit('unsetRemovePending');
        return Promise.reject(error);
      });
    }
  };

  function checkId(id, item) {
    if (id === undefined) {
      throw new Error('No id found for item. Do you need to customize the `idField`?', item);
    }
  }

  var actions = {
    addOrUpdateList: function addOrUpdateList(_ref11, response) {
      var state = _ref11.state,
          commit = _ref11.commit;

      var list = response.data || response;
      var isPaginated = response.hasOwnProperty('total');
      var toAdd = [];
      var toUpdate = [];
      var toRemove = [];
      var idField = state.idField,
          autoRemove = state.autoRemove;


      if (!isPaginated && autoRemove) {
        // Find IDs from the state which are not in the list
        state.ids.forEach(function (id) {
          if (id !== state.currentId && !list.some(function (item) {
            return item[idField] === id;
          })) {
            toRemove.push(state.keyedById[id]);
          }
        });
      }

      list.forEach(function (item) {
        var id = item[idField];
        var existingItem = state.keyedById[id];

        checkId(id, item);

        existingItem ? toUpdate.push(item) : toAdd.push(item);
      });

      commit('removeItems', toRemove); // commit removal
      commit('addItems', toAdd);
      commit('updateItems', toUpdate);
    },
    addOrUpdate: function addOrUpdate(_ref12, item) {
      var state = _ref12.state,
          commit = _ref12.commit;
      var idField = state.idField;

      var id = item[idField];
      var existingItem = state.keyedById[id];

      checkId(id, item);

      existingItem ? commit('updateItem', item) : commit('addItem', item);
    }
  };
  Object.keys(serviceActions).map(function (method) {
    if (service[method] && typeof service[method] === 'function') {
      actions[method] = serviceActions[method];
    }
  });
  return actions;
}
module.exports = exports['default'];