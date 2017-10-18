"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = setupAuthState;
function setupAuthState(_ref) {
  var userService = _ref.userService;

  var state = {
    accessToken: undefined, // The JWT
    payload: undefined, // The JWT payload

    isAuthenticatePending: false,
    isLogoutPending: false,

    errorOnAuthenticate: undefined,
    errorOnLogout: undefined
    // If a userService string was passed, add a user attribute
  };if (userService) {
    Object.assign(state, { userService: userService, user: undefined });
  }
  return state;
}
module.exports = exports["default"];