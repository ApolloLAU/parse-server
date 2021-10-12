"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Config = void 0;

var _cache = _interopRequireDefault(require("./cache"));

var _DatabaseController = _interopRequireDefault(require("./Controllers/DatabaseController"));

var _net = _interopRequireDefault(require("net"));

var _Definitions = require("./Options/Definitions");

var _lodash = require("lodash");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// A Config object provides information about how a specific app is
// configured.
// mount is the URL for the root of the API; includes http, domain, etc.
function removeTrailingSlash(str) {
  if (!str) {
    return str;
  }

  if (str.endsWith('/')) {
    str = str.substr(0, str.length - 1);
  }

  return str;
}

class Config {
  static get(applicationId, mount) {
    const cacheInfo = _cache.default.get(applicationId);

    if (!cacheInfo) {
      return;
    }

    const config = new Config();
    config.applicationId = applicationId;
    Object.keys(cacheInfo).forEach(key => {
      if (key == 'databaseController') {
        config.database = new _DatabaseController.default(cacheInfo.databaseController.adapter);
      } else {
        config[key] = cacheInfo[key];
      }
    });
    config.mount = removeTrailingSlash(mount);
    config.generateSessionExpiresAt = config.generateSessionExpiresAt.bind(config);
    config.generateEmailVerifyTokenExpiresAt = config.generateEmailVerifyTokenExpiresAt.bind(config);
    return config;
  }

  static put(serverConfiguration) {
    Config.validate(serverConfiguration);

    _cache.default.put(serverConfiguration.appId, serverConfiguration);

    Config.setupPasswordValidator(serverConfiguration.passwordPolicy);
    return serverConfiguration;
  }

  static validate({
    verifyUserEmails,
    userController,
    appName,
    publicServerURL,
    revokeSessionOnPasswordReset,
    expireInactiveSessions,
    sessionLength,
    maxLimit,
    emailVerifyTokenValidityDuration,
    accountLockout,
    passwordPolicy,
    masterKeyIps,
    masterKey,
    readOnlyMasterKey,
    allowHeaders,
    idempotencyOptions,
    emailVerifyTokenReuseIfValid,
    fileUpload,
    pages,
    security,
    enforcePrivateUsers
  }) {
    if (masterKey === readOnlyMasterKey) {
      throw new Error('masterKey and readOnlyMasterKey should be different');
    }

    const emailAdapter = userController.adapter;

    if (verifyUserEmails) {
      this.validateEmailConfiguration({
        emailAdapter,
        appName,
        publicServerURL,
        emailVerifyTokenValidityDuration,
        emailVerifyTokenReuseIfValid
      });
    }

    this.validateAccountLockoutPolicy(accountLockout);
    this.validatePasswordPolicy(passwordPolicy);
    this.validateFileUploadOptions(fileUpload);

    if (typeof revokeSessionOnPasswordReset !== 'boolean') {
      throw 'revokeSessionOnPasswordReset must be a boolean value';
    }

    if (publicServerURL) {
      if (!publicServerURL.startsWith('http://') && !publicServerURL.startsWith('https://')) {
        throw 'publicServerURL should be a valid HTTPS URL starting with https://';
      }
    }

    this.validateSessionConfiguration(sessionLength, expireInactiveSessions);
    this.validateMasterKeyIps(masterKeyIps);
    this.validateMaxLimit(maxLimit);
    this.validateAllowHeaders(allowHeaders);
    this.validateIdempotencyOptions(idempotencyOptions);
    this.validatePagesOptions(pages);
    this.validateSecurityOptions(security);
    this.validateEnforcePrivateUsers(enforcePrivateUsers);
  }

  static validateEnforcePrivateUsers(enforcePrivateUsers) {
    if (typeof enforcePrivateUsers !== 'boolean') {
      throw 'Parse Server option enforcePrivateUsers must be a boolean.';
    }
  }

  static validateSecurityOptions(security) {
    if (Object.prototype.toString.call(security) !== '[object Object]') {
      throw 'Parse Server option security must be an object.';
    }

    if (security.enableCheck === undefined) {
      security.enableCheck = _Definitions.SecurityOptions.enableCheck.default;
    } else if (!(0, _lodash.isBoolean)(security.enableCheck)) {
      throw 'Parse Server option security.enableCheck must be a boolean.';
    }

    if (security.enableCheckLog === undefined) {
      security.enableCheckLog = _Definitions.SecurityOptions.enableCheckLog.default;
    } else if (!(0, _lodash.isBoolean)(security.enableCheckLog)) {
      throw 'Parse Server option security.enableCheckLog must be a boolean.';
    }
  }

  static validatePagesOptions(pages) {
    if (Object.prototype.toString.call(pages) !== '[object Object]') {
      throw 'Parse Server option pages must be an object.';
    }

    if (pages.enableRouter === undefined) {
      pages.enableRouter = _Definitions.PagesOptions.enableRouter.default;
    } else if (!(0, _lodash.isBoolean)(pages.enableRouter)) {
      throw 'Parse Server option pages.enableRouter must be a boolean.';
    }

    if (pages.enableLocalization === undefined) {
      pages.enableLocalization = _Definitions.PagesOptions.enableLocalization.default;
    } else if (!(0, _lodash.isBoolean)(pages.enableLocalization)) {
      throw 'Parse Server option pages.enableLocalization must be a boolean.';
    }

    if (pages.localizationJsonPath === undefined) {
      pages.localizationJsonPath = _Definitions.PagesOptions.localizationJsonPath.default;
    } else if (!(0, _lodash.isString)(pages.localizationJsonPath)) {
      throw 'Parse Server option pages.localizationJsonPath must be a string.';
    }

    if (pages.localizationFallbackLocale === undefined) {
      pages.localizationFallbackLocale = _Definitions.PagesOptions.localizationFallbackLocale.default;
    } else if (!(0, _lodash.isString)(pages.localizationFallbackLocale)) {
      throw 'Parse Server option pages.localizationFallbackLocale must be a string.';
    }

    if (pages.placeholders === undefined) {
      pages.placeholders = _Definitions.PagesOptions.placeholders.default;
    } else if (Object.prototype.toString.call(pages.placeholders) !== '[object Object]' && typeof pages.placeholders !== 'function') {
      throw 'Parse Server option pages.placeholders must be an object or a function.';
    }

    if (pages.forceRedirect === undefined) {
      pages.forceRedirect = _Definitions.PagesOptions.forceRedirect.default;
    } else if (!(0, _lodash.isBoolean)(pages.forceRedirect)) {
      throw 'Parse Server option pages.forceRedirect must be a boolean.';
    }

    if (pages.pagesPath === undefined) {
      pages.pagesPath = _Definitions.PagesOptions.pagesPath.default;
    } else if (!(0, _lodash.isString)(pages.pagesPath)) {
      throw 'Parse Server option pages.pagesPath must be a string.';
    }

    if (pages.pagesEndpoint === undefined) {
      pages.pagesEndpoint = _Definitions.PagesOptions.pagesEndpoint.default;
    } else if (!(0, _lodash.isString)(pages.pagesEndpoint)) {
      throw 'Parse Server option pages.pagesEndpoint must be a string.';
    }

    if (pages.customUrls === undefined) {
      pages.customUrls = _Definitions.PagesOptions.customUrls.default;
    } else if (Object.prototype.toString.call(pages.customUrls) !== '[object Object]') {
      throw 'Parse Server option pages.customUrls must be an object.';
    }

    if (pages.customRoutes === undefined) {
      pages.customRoutes = _Definitions.PagesOptions.customRoutes.default;
    } else if (!(pages.customRoutes instanceof Array)) {
      throw 'Parse Server option pages.customRoutes must be an array.';
    }
  }

  static validateIdempotencyOptions(idempotencyOptions) {
    if (!idempotencyOptions) {
      return;
    }

    if (idempotencyOptions.ttl === undefined) {
      idempotencyOptions.ttl = _Definitions.IdempotencyOptions.ttl.default;
    } else if (!isNaN(idempotencyOptions.ttl) && idempotencyOptions.ttl <= 0) {
      throw 'idempotency TTL value must be greater than 0 seconds';
    } else if (isNaN(idempotencyOptions.ttl)) {
      throw 'idempotency TTL value must be a number';
    }

    if (!idempotencyOptions.paths) {
      idempotencyOptions.paths = _Definitions.IdempotencyOptions.paths.default;
    } else if (!(idempotencyOptions.paths instanceof Array)) {
      throw 'idempotency paths must be of an array of strings';
    }
  }

  static validateAccountLockoutPolicy(accountLockout) {
    if (accountLockout) {
      if (typeof accountLockout.duration !== 'number' || accountLockout.duration <= 0 || accountLockout.duration > 99999) {
        throw 'Account lockout duration should be greater than 0 and less than 100000';
      }

      if (!Number.isInteger(accountLockout.threshold) || accountLockout.threshold < 1 || accountLockout.threshold > 999) {
        throw 'Account lockout threshold should be an integer greater than 0 and less than 1000';
      }

      if (accountLockout.unlockOnPasswordReset === undefined) {
        accountLockout.unlockOnPasswordReset = _Definitions.AccountLockoutOptions.unlockOnPasswordReset.default;
      } else if (!(0, _lodash.isBoolean)(accountLockout.unlockOnPasswordReset)) {
        throw 'Parse Server option accountLockout.unlockOnPasswordReset must be a boolean.';
      }
    }
  }

  static validatePasswordPolicy(passwordPolicy) {
    if (passwordPolicy) {
      if (passwordPolicy.maxPasswordAge !== undefined && (typeof passwordPolicy.maxPasswordAge !== 'number' || passwordPolicy.maxPasswordAge < 0)) {
        throw 'passwordPolicy.maxPasswordAge must be a positive number';
      }

      if (passwordPolicy.resetTokenValidityDuration !== undefined && (typeof passwordPolicy.resetTokenValidityDuration !== 'number' || passwordPolicy.resetTokenValidityDuration <= 0)) {
        throw 'passwordPolicy.resetTokenValidityDuration must be a positive number';
      }

      if (passwordPolicy.validatorPattern) {
        if (typeof passwordPolicy.validatorPattern === 'string') {
          passwordPolicy.validatorPattern = new RegExp(passwordPolicy.validatorPattern);
        } else if (!(passwordPolicy.validatorPattern instanceof RegExp)) {
          throw 'passwordPolicy.validatorPattern must be a regex string or RegExp object.';
        }
      }

      if (passwordPolicy.validatorCallback && typeof passwordPolicy.validatorCallback !== 'function') {
        throw 'passwordPolicy.validatorCallback must be a function.';
      }

      if (passwordPolicy.doNotAllowUsername && typeof passwordPolicy.doNotAllowUsername !== 'boolean') {
        throw 'passwordPolicy.doNotAllowUsername must be a boolean value.';
      }

      if (passwordPolicy.maxPasswordHistory && (!Number.isInteger(passwordPolicy.maxPasswordHistory) || passwordPolicy.maxPasswordHistory <= 0 || passwordPolicy.maxPasswordHistory > 20)) {
        throw 'passwordPolicy.maxPasswordHistory must be an integer ranging 0 - 20';
      }

      if (passwordPolicy.resetTokenReuseIfValid && typeof passwordPolicy.resetTokenReuseIfValid !== 'boolean') {
        throw 'resetTokenReuseIfValid must be a boolean value';
      }

      if (passwordPolicy.resetTokenReuseIfValid && !passwordPolicy.resetTokenValidityDuration) {
        throw 'You cannot use resetTokenReuseIfValid without resetTokenValidityDuration';
      }
    }
  } // if the passwordPolicy.validatorPattern is configured then setup a callback to process the pattern


  static setupPasswordValidator(passwordPolicy) {
    if (passwordPolicy && passwordPolicy.validatorPattern) {
      passwordPolicy.patternValidator = value => {
        return passwordPolicy.validatorPattern.test(value);
      };
    }
  }

  static validateEmailConfiguration({
    emailAdapter,
    appName,
    publicServerURL,
    emailVerifyTokenValidityDuration,
    emailVerifyTokenReuseIfValid
  }) {
    if (!emailAdapter) {
      throw 'An emailAdapter is required for e-mail verification and password resets.';
    }

    if (typeof appName !== 'string') {
      throw 'An app name is required for e-mail verification and password resets.';
    }

    if (typeof publicServerURL !== 'string') {
      throw 'A public server url is required for e-mail verification and password resets.';
    }

    if (emailVerifyTokenValidityDuration) {
      if (isNaN(emailVerifyTokenValidityDuration)) {
        throw 'Email verify token validity duration must be a valid number.';
      } else if (emailVerifyTokenValidityDuration <= 0) {
        throw 'Email verify token validity duration must be a value greater than 0.';
      }
    }

    if (emailVerifyTokenReuseIfValid && typeof emailVerifyTokenReuseIfValid !== 'boolean') {
      throw 'emailVerifyTokenReuseIfValid must be a boolean value';
    }

    if (emailVerifyTokenReuseIfValid && !emailVerifyTokenValidityDuration) {
      throw 'You cannot use emailVerifyTokenReuseIfValid without emailVerifyTokenValidityDuration';
    }
  }

  static validateFileUploadOptions(fileUpload) {
    try {
      if (fileUpload == null || typeof fileUpload !== 'object' || fileUpload instanceof Array) {
        throw 'fileUpload must be an object value.';
      }
    } catch (e) {
      if (e instanceof ReferenceError) {
        return;
      }

      throw e;
    }

    if (fileUpload.enableForAnonymousUser === undefined) {
      fileUpload.enableForAnonymousUser = _Definitions.FileUploadOptions.enableForAnonymousUser.default;
    } else if (typeof fileUpload.enableForAnonymousUser !== 'boolean') {
      throw 'fileUpload.enableForAnonymousUser must be a boolean value.';
    }

    if (fileUpload.enableForPublic === undefined) {
      fileUpload.enableForPublic = _Definitions.FileUploadOptions.enableForPublic.default;
    } else if (typeof fileUpload.enableForPublic !== 'boolean') {
      throw 'fileUpload.enableForPublic must be a boolean value.';
    }

    if (fileUpload.enableForAuthenticatedUser === undefined) {
      fileUpload.enableForAuthenticatedUser = _Definitions.FileUploadOptions.enableForAuthenticatedUser.default;
    } else if (typeof fileUpload.enableForAuthenticatedUser !== 'boolean') {
      throw 'fileUpload.enableForAuthenticatedUser must be a boolean value.';
    }
  }

  static validateMasterKeyIps(masterKeyIps) {
    for (const ip of masterKeyIps) {
      if (!_net.default.isIP(ip)) {
        throw `Invalid ip in masterKeyIps: ${ip}`;
      }
    }
  }

  get mount() {
    var mount = this._mount;

    if (this.publicServerURL) {
      mount = this.publicServerURL;
    }

    return mount;
  }

  set mount(newValue) {
    this._mount = newValue;
  }

  static validateSessionConfiguration(sessionLength, expireInactiveSessions) {
    if (expireInactiveSessions) {
      if (isNaN(sessionLength)) {
        throw 'Session length must be a valid number.';
      } else if (sessionLength <= 0) {
        throw 'Session length must be a value greater than 0.';
      }
    }
  }

  static validateMaxLimit(maxLimit) {
    if (maxLimit <= 0) {
      throw 'Max limit must be a value greater than 0.';
    }
  }

  static validateAllowHeaders(allowHeaders) {
    if (![null, undefined].includes(allowHeaders)) {
      if (Array.isArray(allowHeaders)) {
        allowHeaders.forEach(header => {
          if (typeof header !== 'string') {
            throw 'Allow headers must only contain strings';
          } else if (!header.trim().length) {
            throw 'Allow headers must not contain empty strings';
          }
        });
      } else {
        throw 'Allow headers must be an array';
      }
    }
  }

  generateEmailVerifyTokenExpiresAt() {
    if (!this.verifyUserEmails || !this.emailVerifyTokenValidityDuration) {
      return undefined;
    }

    var now = new Date();
    return new Date(now.getTime() + this.emailVerifyTokenValidityDuration * 1000);
  }

  generatePasswordResetTokenExpiresAt() {
    if (!this.passwordPolicy || !this.passwordPolicy.resetTokenValidityDuration) {
      return undefined;
    }

    const now = new Date();
    return new Date(now.getTime() + this.passwordPolicy.resetTokenValidityDuration * 1000);
  }

  generateSessionExpiresAt() {
    if (!this.expireInactiveSessions) {
      return undefined;
    }

    var now = new Date();
    return new Date(now.getTime() + this.sessionLength * 1000);
  }

  get invalidLinkURL() {
    return this.customPages.invalidLink || `${this.publicServerURL}/apps/invalid_link.html`;
  }

  get invalidVerificationLinkURL() {
    return this.customPages.invalidVerificationLink || `${this.publicServerURL}/apps/invalid_verification_link.html`;
  }

  get linkSendSuccessURL() {
    return this.customPages.linkSendSuccess || `${this.publicServerURL}/apps/link_send_success.html`;
  }

  get linkSendFailURL() {
    return this.customPages.linkSendFail || `${this.publicServerURL}/apps/link_send_fail.html`;
  }

  get verifyEmailSuccessURL() {
    return this.customPages.verifyEmailSuccess || `${this.publicServerURL}/apps/verify_email_success.html`;
  }

  get choosePasswordURL() {
    return this.customPages.choosePassword || `${this.publicServerURL}/apps/choose_password`;
  }

  get requestResetPasswordURL() {
    return `${this.publicServerURL}/${this.pagesEndpoint}/${this.applicationId}/request_password_reset`;
  }

  get passwordResetSuccessURL() {
    return this.customPages.passwordResetSuccess || `${this.publicServerURL}/apps/password_reset_success.html`;
  }

  get parseFrameURL() {
    return this.customPages.parseFrameURL;
  }

  get verifyEmailURL() {
    return `${this.publicServerURL}/${this.pagesEndpoint}/${this.applicationId}/verify_email`;
  } // TODO: Remove this function once PagesRouter replaces the PublicAPIRouter;
  // the (default) endpoint has to be defined in PagesRouter only.


  get pagesEndpoint() {
    return this.pages && this.pages.enableRouter && this.pages.pagesEndpoint ? this.pages.pagesEndpoint : 'apps';
  }

}

exports.Config = Config;
var _default = Config;
exports.default = _default;
module.exports = Config;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Db25maWcuanMiXSwibmFtZXMiOlsicmVtb3ZlVHJhaWxpbmdTbGFzaCIsInN0ciIsImVuZHNXaXRoIiwic3Vic3RyIiwibGVuZ3RoIiwiQ29uZmlnIiwiZ2V0IiwiYXBwbGljYXRpb25JZCIsIm1vdW50IiwiY2FjaGVJbmZvIiwiQXBwQ2FjaGUiLCJjb25maWciLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsImtleSIsImRhdGFiYXNlIiwiRGF0YWJhc2VDb250cm9sbGVyIiwiZGF0YWJhc2VDb250cm9sbGVyIiwiYWRhcHRlciIsImdlbmVyYXRlU2Vzc2lvbkV4cGlyZXNBdCIsImJpbmQiLCJnZW5lcmF0ZUVtYWlsVmVyaWZ5VG9rZW5FeHBpcmVzQXQiLCJwdXQiLCJzZXJ2ZXJDb25maWd1cmF0aW9uIiwidmFsaWRhdGUiLCJhcHBJZCIsInNldHVwUGFzc3dvcmRWYWxpZGF0b3IiLCJwYXNzd29yZFBvbGljeSIsInZlcmlmeVVzZXJFbWFpbHMiLCJ1c2VyQ29udHJvbGxlciIsImFwcE5hbWUiLCJwdWJsaWNTZXJ2ZXJVUkwiLCJyZXZva2VTZXNzaW9uT25QYXNzd29yZFJlc2V0IiwiZXhwaXJlSW5hY3RpdmVTZXNzaW9ucyIsInNlc3Npb25MZW5ndGgiLCJtYXhMaW1pdCIsImVtYWlsVmVyaWZ5VG9rZW5WYWxpZGl0eUR1cmF0aW9uIiwiYWNjb3VudExvY2tvdXQiLCJtYXN0ZXJLZXlJcHMiLCJtYXN0ZXJLZXkiLCJyZWFkT25seU1hc3RlcktleSIsImFsbG93SGVhZGVycyIsImlkZW1wb3RlbmN5T3B0aW9ucyIsImVtYWlsVmVyaWZ5VG9rZW5SZXVzZUlmVmFsaWQiLCJmaWxlVXBsb2FkIiwicGFnZXMiLCJzZWN1cml0eSIsImVuZm9yY2VQcml2YXRlVXNlcnMiLCJFcnJvciIsImVtYWlsQWRhcHRlciIsInZhbGlkYXRlRW1haWxDb25maWd1cmF0aW9uIiwidmFsaWRhdGVBY2NvdW50TG9ja291dFBvbGljeSIsInZhbGlkYXRlUGFzc3dvcmRQb2xpY3kiLCJ2YWxpZGF0ZUZpbGVVcGxvYWRPcHRpb25zIiwic3RhcnRzV2l0aCIsInZhbGlkYXRlU2Vzc2lvbkNvbmZpZ3VyYXRpb24iLCJ2YWxpZGF0ZU1hc3RlcktleUlwcyIsInZhbGlkYXRlTWF4TGltaXQiLCJ2YWxpZGF0ZUFsbG93SGVhZGVycyIsInZhbGlkYXRlSWRlbXBvdGVuY3lPcHRpb25zIiwidmFsaWRhdGVQYWdlc09wdGlvbnMiLCJ2YWxpZGF0ZVNlY3VyaXR5T3B0aW9ucyIsInZhbGlkYXRlRW5mb3JjZVByaXZhdGVVc2VycyIsInByb3RvdHlwZSIsInRvU3RyaW5nIiwiY2FsbCIsImVuYWJsZUNoZWNrIiwidW5kZWZpbmVkIiwiU2VjdXJpdHlPcHRpb25zIiwiZGVmYXVsdCIsImVuYWJsZUNoZWNrTG9nIiwiZW5hYmxlUm91dGVyIiwiUGFnZXNPcHRpb25zIiwiZW5hYmxlTG9jYWxpemF0aW9uIiwibG9jYWxpemF0aW9uSnNvblBhdGgiLCJsb2NhbGl6YXRpb25GYWxsYmFja0xvY2FsZSIsInBsYWNlaG9sZGVycyIsImZvcmNlUmVkaXJlY3QiLCJwYWdlc1BhdGgiLCJwYWdlc0VuZHBvaW50IiwiY3VzdG9tVXJscyIsImN1c3RvbVJvdXRlcyIsIkFycmF5IiwidHRsIiwiSWRlbXBvdGVuY3lPcHRpb25zIiwiaXNOYU4iLCJwYXRocyIsImR1cmF0aW9uIiwiTnVtYmVyIiwiaXNJbnRlZ2VyIiwidGhyZXNob2xkIiwidW5sb2NrT25QYXNzd29yZFJlc2V0IiwiQWNjb3VudExvY2tvdXRPcHRpb25zIiwibWF4UGFzc3dvcmRBZ2UiLCJyZXNldFRva2VuVmFsaWRpdHlEdXJhdGlvbiIsInZhbGlkYXRvclBhdHRlcm4iLCJSZWdFeHAiLCJ2YWxpZGF0b3JDYWxsYmFjayIsImRvTm90QWxsb3dVc2VybmFtZSIsIm1heFBhc3N3b3JkSGlzdG9yeSIsInJlc2V0VG9rZW5SZXVzZUlmVmFsaWQiLCJwYXR0ZXJuVmFsaWRhdG9yIiwidmFsdWUiLCJ0ZXN0IiwiZSIsIlJlZmVyZW5jZUVycm9yIiwiZW5hYmxlRm9yQW5vbnltb3VzVXNlciIsIkZpbGVVcGxvYWRPcHRpb25zIiwiZW5hYmxlRm9yUHVibGljIiwiZW5hYmxlRm9yQXV0aGVudGljYXRlZFVzZXIiLCJpcCIsIm5ldCIsImlzSVAiLCJfbW91bnQiLCJuZXdWYWx1ZSIsImluY2x1ZGVzIiwiaXNBcnJheSIsImhlYWRlciIsInRyaW0iLCJub3ciLCJEYXRlIiwiZ2V0VGltZSIsImdlbmVyYXRlUGFzc3dvcmRSZXNldFRva2VuRXhwaXJlc0F0IiwiaW52YWxpZExpbmtVUkwiLCJjdXN0b21QYWdlcyIsImludmFsaWRMaW5rIiwiaW52YWxpZFZlcmlmaWNhdGlvbkxpbmtVUkwiLCJpbnZhbGlkVmVyaWZpY2F0aW9uTGluayIsImxpbmtTZW5kU3VjY2Vzc1VSTCIsImxpbmtTZW5kU3VjY2VzcyIsImxpbmtTZW5kRmFpbFVSTCIsImxpbmtTZW5kRmFpbCIsInZlcmlmeUVtYWlsU3VjY2Vzc1VSTCIsInZlcmlmeUVtYWlsU3VjY2VzcyIsImNob29zZVBhc3N3b3JkVVJMIiwiY2hvb3NlUGFzc3dvcmQiLCJyZXF1ZXN0UmVzZXRQYXNzd29yZFVSTCIsInBhc3N3b3JkUmVzZXRTdWNjZXNzVVJMIiwicGFzc3dvcmRSZXNldFN1Y2Nlc3MiLCJwYXJzZUZyYW1lVVJMIiwidmVyaWZ5RW1haWxVUkwiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBSUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBT0E7Ozs7QUFkQTtBQUNBO0FBQ0E7QUFjQSxTQUFTQSxtQkFBVCxDQUE2QkMsR0FBN0IsRUFBa0M7QUFDaEMsTUFBSSxDQUFDQSxHQUFMLEVBQVU7QUFDUixXQUFPQSxHQUFQO0FBQ0Q7O0FBQ0QsTUFBSUEsR0FBRyxDQUFDQyxRQUFKLENBQWEsR0FBYixDQUFKLEVBQXVCO0FBQ3JCRCxJQUFBQSxHQUFHLEdBQUdBLEdBQUcsQ0FBQ0UsTUFBSixDQUFXLENBQVgsRUFBY0YsR0FBRyxDQUFDRyxNQUFKLEdBQWEsQ0FBM0IsQ0FB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LEtBQUtWLFdBQUwsQ0FBaUJXLGNBQWpCLElBQW9DLEdBQUUsS0FBS3hHLGVBQWdCLHVCQUFsRTtBQUNEOztBQUUwQixNQUF2QnlHLHVCQUF1QixHQUFHO0FBQzVCLFdBQVEsR0FBRSxLQUFLekcsZUFBZ0IsSUFBRyxLQUFLZ0QsYUFBYyxJQUFHLEtBQUt6RSxhQUFjLHlCQUEzRTtBQUNEOztBQUUwQixNQUF2Qm1JLHVCQUF1QixHQUFHO0FBQzVCLFdBQ0UsS0FBS2IsV0FBTCxDQUFpQmMsb0JBQWpCLElBQ0MsR0FBRSxLQUFLM0csZUFBZ0IsbUNBRjFCO0FBSUQ7O0FBRWdCLE1BQWI0RyxhQUFhLEdBQUc7QUFDbEIsV0FBTyxLQUFLZixXQUFMLENBQWlCZSxhQUF4QjtBQUNEOztBQUVpQixNQUFkQyxjQUFjLEdBQUc7QUFDbkIsV0FBUSxHQUFFLEtBQUs3RyxlQUFnQixJQUFHLEtBQUtnRCxhQUFjLElBQUcsS0FBS3pFLGFBQWMsZUFBM0U7QUFDRCxHQXJkaUIsQ0F1ZGxCO0FBQ0E7OztBQUNpQixNQUFieUUsYUFBYSxHQUFHO0FBQ2xCLFdBQU8sS0FBS2xDLEtBQUwsSUFBYyxLQUFLQSxLQUFMLENBQVcwQixZQUF6QixJQUF5QyxLQUFLMUIsS0FBTCxDQUFXa0MsYUFBcEQsR0FDSCxLQUFLbEMsS0FBTCxDQUFXa0MsYUFEUixHQUVILE1BRko7QUFHRDs7QUE3ZGlCOzs7ZUFnZUwzRSxNOztBQUNmeUksTUFBTSxDQUFDQyxPQUFQLEdBQWlCMUksTUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBBIENvbmZpZyBvYmplY3QgcHJvdmlkZXMgaW5mb3JtYXRpb24gYWJvdXQgaG93IGEgc3BlY2lmaWMgYXBwIGlzXG4vLyBjb25maWd1cmVkLlxuLy8gbW91bnQgaXMgdGhlIFVSTCBmb3IgdGhlIHJvb3Qgb2YgdGhlIEFQSTsgaW5jbHVkZXMgaHR0cCwgZG9tYWluLCBldGMuXG5cbmltcG9ydCBBcHBDYWNoZSBmcm9tICcuL2NhY2hlJztcbmltcG9ydCBEYXRhYmFzZUNvbnRyb2xsZXIgZnJvbSAnLi9Db250cm9sbGVycy9EYXRhYmFzZUNvbnRyb2xsZXInO1xuaW1wb3J0IG5ldCBmcm9tICduZXQnO1xuaW1wb3J0IHtcbiAgSWRlbXBvdGVuY3lPcHRpb25zLFxuICBGaWxlVXBsb2FkT3B0aW9ucyxcbiAgQWNjb3VudExvY2tvdXRPcHRpb25zLFxuICBQYWdlc09wdGlvbnMsXG4gIFNlY3VyaXR5T3B0aW9ucyxcbn0gZnJvbSAnLi9PcHRpb25zL0RlZmluaXRpb25zJztcbmltcG9ydCB7IGlzQm9vbGVhbiwgaXNTdHJpbmcgfSBmcm9tICdsb2Rhc2gnO1xuXG5mdW5jdGlvbiByZW1vdmVUcmFpbGluZ1NsYXNoKHN0cikge1xuICBpZiAoIXN0cikge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbiAgaWYgKHN0ci5lbmRzV2l0aCgnLycpKSB7XG4gICAgc3RyID0gc3RyLnN1YnN0cigwLCBzdHIubGVuZ3RoIC0gMSk7XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn1cblxuZXhwb3J0IGNsYXNzIENvbmZpZyB7XG4gIHN0YXRpYyBnZXQoYXBwbGljYXRpb25JZDogc3RyaW5nLCBtb3VudDogc3RyaW5nKSB7XG4gICAgY29uc3QgY2FjaGVJbmZvID0gQXBwQ2FjaGUuZ2V0KGFwcGxpY2F0aW9uSWQpO1xuICAgIGlmICghY2FjaGVJbmZvKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGNvbmZpZyA9IG5ldyBDb25maWcoKTtcbiAgICBjb25maWcuYXBwbGljYXRpb25JZCA9IGFwcGxpY2F0aW9uSWQ7XG4gICAgT2JqZWN0LmtleXMoY2FjaGVJbmZvKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICBpZiAoa2V5ID09ICdkYXRhYmFzZUNvbnRyb2xsZXInKSB7XG4gICAgICAgIGNvbmZpZy5kYXRhYmFzZSA9IG5ldyBEYXRhYmFzZUNvbnRyb2xsZXIoY2FjaGVJbmZvLmRhdGFiYXNlQ29udHJvbGxlci5hZGFwdGVyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbmZpZ1trZXldID0gY2FjaGVJbmZvW2tleV07XG4gICAgICB9XG4gICAgfSk7XG4gICAgY29uZmlnLm1vdW50ID0gcmVtb3ZlVHJhaWxpbmdTbGFzaChtb3VudCk7XG4gICAgY29uZmlnLmdlbmVyYXRlU2Vzc2lvbkV4cGlyZXNBdCA9IGNvbmZpZy5nZW5lcmF0ZVNlc3Npb25FeHBpcmVzQXQuYmluZChjb25maWcpO1xuICAgIGNvbmZpZy5nZW5lcmF0ZUVtYWlsVmVyaWZ5VG9rZW5FeHBpcmVzQXQgPSBjb25maWcuZ2VuZXJhdGVFbWFpbFZlcmlmeVRva2VuRXhwaXJlc0F0LmJpbmQoXG4gICAgICBjb25maWdcbiAgICApO1xuICAgIHJldHVybiBjb25maWc7XG4gIH1cblxuICBzdGF0aWMgcHV0KHNlcnZlckNvbmZpZ3VyYXRpb24pIHtcbiAgICBDb25maWcudmFsaWRhdGUoc2VydmVyQ29uZmlndXJhdGlvbik7XG4gICAgQXBwQ2FjaGUucHV0KHNlcnZlckNvbmZpZ3VyYXRpb24uYXBwSWQsIHNlcnZlckNvbmZpZ3VyYXRpb24pO1xuICAgIENvbmZpZy5zZXR1cFBhc3N3b3JkVmFsaWRhdG9yKHNlcnZlckNvbmZpZ3VyYXRpb24ucGFzc3dvcmRQb2xpY3kpO1xuICAgIHJldHVybiBzZXJ2ZXJDb25maWd1cmF0aW9uO1xuICB9XG5cbiAgc3RhdGljIHZhbGlkYXRlKHtcbiAgICB2ZXJpZnlVc2VyRW1haWxzLFxuICAgIHVzZXJDb250cm9sbGVyLFxuICAgIGFwcE5hbWUsXG4gICAgcHVibGljU2VydmVyVVJMLFxuICAgIHJldm9rZVNlc3Npb25PblBhc3N3b3JkUmVzZXQsXG4gICAgZXhwaXJlSW5hY3RpdmVTZXNzaW9ucyxcbiAgICBzZXNzaW9uTGVuZ3RoLFxuICAgIG1heExpbWl0LFxuICAgIGVtYWlsVmVyaWZ5VG9rZW5WYWxpZGl0eUR1cmF0aW9uLFxuICAgIGFjY291bnRMb2Nrb3V0LFxuICAgIHBhc3N3b3JkUG9saWN5LFxuICAgIG1hc3RlcktleUlwcyxcbiAgICBtYXN0ZXJLZXksXG4gICAgcmVhZE9ubHlNYXN0ZXJLZXksXG4gICAgYWxsb3dIZWFkZXJzLFxuICAgIGlkZW1wb3RlbmN5T3B0aW9ucyxcbiAgICBlbWFpbFZlcmlmeVRva2VuUmV1c2VJZlZhbGlkLFxuICAgIGZpbGVVcGxvYWQsXG4gICAgcGFnZXMsXG4gICAgc2VjdXJpdHksXG4gICAgZW5mb3JjZVByaXZhdGVVc2VycyxcbiAgfSkge1xuICAgIGlmIChtYXN0ZXJLZXkgPT09IHJlYWRPbmx5TWFzdGVyS2V5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ21hc3RlcktleSBhbmQgcmVhZE9ubHlNYXN0ZXJLZXkgc2hvdWxkIGJlIGRpZmZlcmVudCcpO1xuICAgIH1cblxuICAgIGNvbnN0IGVtYWlsQWRhcHRlciA9IHVzZXJDb250cm9sbGVyLmFkYXB0ZXI7XG4gICAgaWYgKHZlcmlmeVVzZXJFbWFpbHMpIHtcbiAgICAgIHRoaXMudmFsaWRhdGVFbWFpbENvbmZpZ3VyYXRpb24oe1xuICAgICAgICBlbWFpbEFkYXB0ZXIsXG4gICAgICAgIGFwcE5hbWUsXG4gICAgICAgIHB1YmxpY1NlcnZlclVSTCxcbiAgICAgICAgZW1haWxWZXJpZnlUb2tlblZhbGlkaXR5RHVyYXRpb24sXG4gICAgICAgIGVtYWlsVmVyaWZ5VG9rZW5SZXVzZUlmVmFsaWQsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLnZhbGlkYXRlQWNjb3VudExvY2tvdXRQb2xpY3koYWNjb3VudExvY2tvdXQpO1xuICAgIHRoaXMudmFsaWRhdGVQYXNzd29yZFBvbGljeShwYXNzd29yZFBvbGljeSk7XG4gICAgdGhpcy52YWxpZGF0ZUZpbGVVcGxvYWRPcHRpb25zKGZpbGVVcGxvYWQpO1xuXG4gICAgaWYgKHR5cGVvZiByZXZva2VTZXNzaW9uT25QYXNzd29yZFJlc2V0ICE9PSAnYm9vbGVhbicpIHtcbiAgICAgIHRocm93ICdyZXZva2VTZXNzaW9uT25QYXNzd29yZFJlc2V0IG11c3QgYmUgYSBib29sZWFuIHZhbHVlJztcbiAgICB9XG5cbiAgICBpZiAocHVibGljU2VydmVyVVJMKSB7XG4gICAgICBpZiAoIXB1YmxpY1NlcnZlclVSTC5zdGFydHNXaXRoKCdodHRwOi8vJykgJiYgIXB1YmxpY1NlcnZlclVSTC5zdGFydHNXaXRoKCdodHRwczovLycpKSB7XG4gICAgICAgIHRocm93ICdwdWJsaWNTZXJ2ZXJVUkwgc2hvdWxkIGJlIGEgdmFsaWQgSFRUUFMgVVJMIHN0YXJ0aW5nIHdpdGggaHR0cHM6Ly8nO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnZhbGlkYXRlU2Vzc2lvbkNvbmZpZ3VyYXRpb24oc2Vzc2lvbkxlbmd0aCwgZXhwaXJlSW5hY3RpdmVTZXNzaW9ucyk7XG4gICAgdGhpcy52YWxpZGF0ZU1hc3RlcktleUlwcyhtYXN0ZXJLZXlJcHMpO1xuICAgIHRoaXMudmFsaWRhdGVNYXhMaW1pdChtYXhMaW1pdCk7XG4gICAgdGhpcy52YWxpZGF0ZUFsbG93SGVhZGVycyhhbGxvd0hlYWRlcnMpO1xuICAgIHRoaXMudmFsaWRhdGVJZGVtcG90ZW5jeU9wdGlvbnMoaWRlbXBvdGVuY3lPcHRpb25zKTtcbiAgICB0aGlzLnZhbGlkYXRlUGFnZXNPcHRpb25zKHBhZ2VzKTtcbiAgICB0aGlzLnZhbGlkYXRlU2VjdXJpdHlPcHRpb25zKHNlY3VyaXR5KTtcbiAgICB0aGlzLnZhbGlkYXRlRW5mb3JjZVByaXZhdGVVc2VycyhlbmZvcmNlUHJpdmF0ZVVzZXJzKTtcbiAgfVxuXG4gIHN0YXRpYyB2YWxpZGF0ZUVuZm9yY2VQcml2YXRlVXNlcnMoZW5mb3JjZVByaXZhdGVVc2Vycykge1xuICAgIGlmICh0eXBlb2YgZW5mb3JjZVByaXZhdGVVc2VycyAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICB0aHJvdyAnUGFyc2UgU2VydmVyIG9wdGlvbiBlbmZvcmNlUHJpdmF0ZVVzZXJzIG11c3QgYmUgYSBib29sZWFuLic7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIHZhbGlkYXRlU2VjdXJpdHlPcHRpb25zKHNlY3VyaXR5KSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzZWN1cml0eSkgIT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgICB0aHJvdyAnUGFyc2UgU2VydmVyIG9wdGlvbiBzZWN1cml0eSBtdXN0IGJlIGFuIG9iamVjdC4nO1xuICAgIH1cbiAgICBpZiAoc2VjdXJpdHkuZW5hYmxlQ2hlY2sgPT09IHVuZGVmaW5lZCkge1xuICAgICAgc2VjdXJpdHkuZW5hYmxlQ2hlY2sgPSBTZWN1cml0eU9wdGlvbnMuZW5hYmxlQ2hlY2suZGVmYXVsdDtcbiAgICB9IGVsc2UgaWYgKCFpc0Jvb2xlYW4oc2VjdXJpdHkuZW5hYmxlQ2hlY2spKSB7XG4gICAgICB0aHJvdyAnUGFyc2UgU2VydmVyIG9wdGlvbiBzZWN1cml0eS5lbmFibGVDaGVjayBtdXN0IGJlIGEgYm9vbGVhbi4nO1xuICAgIH1cbiAgICBpZiAoc2VjdXJpdHkuZW5hYmxlQ2hlY2tMb2cgPT09IHVuZGVmaW5lZCkge1xuICAgICAgc2VjdXJpdHkuZW5hYmxlQ2hlY2tMb2cgPSBTZWN1cml0eU9wdGlvbnMuZW5hYmxlQ2hlY2tMb2cuZGVmYXVsdDtcbiAgICB9IGVsc2UgaWYgKCFpc0Jvb2xlYW4oc2VjdXJpdHkuZW5hYmxlQ2hlY2tMb2cpKSB7XG4gICAgICB0aHJvdyAnUGFyc2UgU2VydmVyIG9wdGlvbiBzZWN1cml0eS5lbmFibGVDaGVja0xvZyBtdXN0IGJlIGEgYm9vbGVhbi4nO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyB2YWxpZGF0ZVBhZ2VzT3B0aW9ucyhwYWdlcykge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocGFnZXMpICE9PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgICAgdGhyb3cgJ1BhcnNlIFNlcnZlciBvcHRpb24gcGFnZXMgbXVzdCBiZSBhbiBvYmplY3QuJztcbiAgICB9XG4gICAgaWYgKHBhZ2VzLmVuYWJsZVJvdXRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBwYWdlcy5lbmFibGVSb3V0ZXIgPSBQYWdlc09wdGlvbnMuZW5hYmxlUm91dGVyLmRlZmF1bHQ7XG4gICAgfSBlbHNlIGlmICghaXNCb29sZWFuKHBhZ2VzLmVuYWJsZVJvdXRlcikpIHtcbiAgICAgIHRocm93ICdQYXJzZSBTZXJ2ZXIgb3B0aW9uIHBhZ2VzLmVuYWJsZVJvdXRlciBtdXN0IGJlIGEgYm9vbGVhbi4nO1xuICAgIH1cbiAgICBpZiAocGFnZXMuZW5hYmxlTG9jYWxpemF0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHBhZ2VzLmVuYWJsZUxvY2FsaXphdGlvbiA9IFBhZ2VzT3B0aW9ucy5lbmFibGVMb2NhbGl6YXRpb24uZGVmYXVsdDtcbiAgICB9IGVsc2UgaWYgKCFpc0Jvb2xlYW4ocGFnZXMuZW5hYmxlTG9jYWxpemF0aW9uKSkge1xuICAgICAgdGhyb3cgJ1BhcnNlIFNlcnZlciBvcHRpb24gcGFnZXMuZW5hYmxlTG9jYWxpemF0aW9uIG11c3QgYmUgYSBib29sZWFuLic7XG4gICAgfVxuICAgIGlmIChwYWdlcy5sb2NhbGl6YXRpb25Kc29uUGF0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBwYWdlcy5sb2NhbGl6YXRpb25Kc29uUGF0aCA9IFBhZ2VzT3B0aW9ucy5sb2NhbGl6YXRpb25Kc29uUGF0aC5kZWZhdWx0O1xuICAgIH0gZWxzZSBpZiAoIWlzU3RyaW5nKHBhZ2VzLmxvY2FsaXphdGlvbkpzb25QYXRoKSkge1xuICAgICAgdGhyb3cgJ1BhcnNlIFNlcnZlciBvcHRpb24gcGFnZXMubG9jYWxpemF0aW9uSnNvblBhdGggbXVzdCBiZSBhIHN0cmluZy4nO1xuICAgIH1cbiAgICBpZiAocGFnZXMubG9jYWxpemF0aW9uRmFsbGJhY2tMb2NhbGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcGFnZXMubG9jYWxpemF0aW9uRmFsbGJhY2tMb2NhbGUgPSBQYWdlc09wdGlvbnMubG9jYWxpemF0aW9uRmFsbGJhY2tMb2NhbGUuZGVmYXVsdDtcbiAgICB9IGVsc2UgaWYgKCFpc1N0cmluZyhwYWdlcy5sb2NhbGl6YXRpb25GYWxsYmFja0xvY2FsZSkpIHtcbiAgICAgIHRocm93ICdQYXJzZSBTZXJ2ZXIgb3B0aW9uIHBhZ2VzLmxvY2FsaXphdGlvbkZhbGxiYWNrTG9jYWxlIG11c3QgYmUgYSBzdHJpbmcuJztcbiAgICB9XG4gICAgaWYgKHBhZ2VzLnBsYWNlaG9sZGVycyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBwYWdlcy5wbGFjZWhvbGRlcnMgPSBQYWdlc09wdGlvbnMucGxhY2Vob2xkZXJzLmRlZmF1bHQ7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChwYWdlcy5wbGFjZWhvbGRlcnMpICE9PSAnW29iamVjdCBPYmplY3RdJyAmJlxuICAgICAgdHlwZW9mIHBhZ2VzLnBsYWNlaG9sZGVycyAhPT0gJ2Z1bmN0aW9uJ1xuICAgICkge1xuICAgICAgdGhyb3cgJ1BhcnNlIFNlcnZlciBvcHRpb24gcGFnZXMucGxhY2Vob2xkZXJzIG11c3QgYmUgYW4gb2JqZWN0IG9yIGEgZnVuY3Rpb24uJztcbiAgICB9XG4gICAgaWYgKHBhZ2VzLmZvcmNlUmVkaXJlY3QgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcGFnZXMuZm9yY2VSZWRpcmVjdCA9IFBhZ2VzT3B0aW9ucy5mb3JjZVJlZGlyZWN0LmRlZmF1bHQ7XG4gICAgfSBlbHNlIGlmICghaXNCb29sZWFuKHBhZ2VzLmZvcmNlUmVkaXJlY3QpKSB7XG4gICAgICB0aHJvdyAnUGFyc2UgU2VydmVyIG9wdGlvbiBwYWdlcy5mb3JjZVJlZGlyZWN0IG11c3QgYmUgYSBib29sZWFuLic7XG4gICAgfVxuICAgIGlmIChwYWdlcy5wYWdlc1BhdGggPT09IHVuZGVmaW5lZCkge1xuICAgICAgcGFnZXMucGFnZXNQYXRoID0gUGFnZXNPcHRpb25zLnBhZ2VzUGF0aC5kZWZhdWx0O1xuICAgIH0gZWxzZSBpZiAoIWlzU3RyaW5nKHBhZ2VzLnBhZ2VzUGF0aCkpIHtcbiAgICAgIHRocm93ICdQYXJzZSBTZXJ2ZXIgb3B0aW9uIHBhZ2VzLnBhZ2VzUGF0aCBtdXN0IGJlIGEgc3RyaW5nLic7XG4gICAgfVxuICAgIGlmIChwYWdlcy5wYWdlc0VuZHBvaW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHBhZ2VzLnBhZ2VzRW5kcG9pbnQgPSBQYWdlc09wdGlvbnMucGFnZXNFbmRwb2ludC5kZWZhdWx0O1xuICAgIH0gZWxzZSBpZiAoIWlzU3RyaW5nKHBhZ2VzLnBhZ2VzRW5kcG9pbnQpKSB7XG4gICAgICB0aHJvdyAnUGFyc2UgU2VydmVyIG9wdGlvbiBwYWdlcy5wYWdlc0VuZHBvaW50IG11c3QgYmUgYSBzdHJpbmcuJztcbiAgICB9XG4gICAgaWYgKHBhZ2VzLmN1c3RvbVVybHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcGFnZXMuY3VzdG9tVXJscyA9IFBhZ2VzT3B0aW9ucy5jdXN0b21VcmxzLmRlZmF1bHQ7XG4gICAgfSBlbHNlIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocGFnZXMuY3VzdG9tVXJscykgIT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgICB0aHJvdyAnUGFyc2UgU2VydmVyIG9wdGlvbiBwYWdlcy5jdXN0b21VcmxzIG11c3QgYmUgYW4gb2JqZWN0Lic7XG4gICAgfVxuICAgIGlmIChwYWdlcy5jdXN0b21Sb3V0ZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcGFnZXMuY3VzdG9tUm91dGVzID0gUGFnZXNPcHRpb25zLmN1c3RvbVJvdXRlcy5kZWZhdWx0O1xuICAgIH0gZWxzZSBpZiAoIShwYWdlcy5jdXN0b21Sb3V0ZXMgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgIHRocm93ICdQYXJzZSBTZXJ2ZXIgb3B0aW9uIHBhZ2VzLmN1c3RvbVJvdXRlcyBtdXN0IGJlIGFuIGFycmF5Lic7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIHZhbGlkYXRlSWRlbXBvdGVuY3lPcHRpb25zKGlkZW1wb3RlbmN5T3B0aW9ucykge1xuICAgIGlmICghaWRlbXBvdGVuY3lPcHRpb25zKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChpZGVtcG90ZW5jeU9wdGlvbnMudHRsID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlkZW1wb3RlbmN5T3B0aW9ucy50dGwgPSBJZGVtcG90ZW5jeU9wdGlvbnMudHRsLmRlZmF1bHQ7XG4gICAgfSBlbHNlIGlmICghaXNOYU4oaWRlbXBvdGVuY3lPcHRpb25zLnR0bCkgJiYgaWRlbXBvdGVuY3lPcHRpb25zLnR0bCA8PSAwKSB7XG4gICAgICB0aHJvdyAnaWRlbXBvdGVuY3kgVFRMIHZhbHVlIG11c3QgYmUgZ3JlYXRlciB0aGFuIDAgc2Vjb25kcyc7XG4gICAgfSBlbHNlIGlmIChpc05hTihpZGVtcG90ZW5jeU9wdGlvbnMudHRsKSkge1xuICAgICAgdGhyb3cgJ2lkZW1wb3RlbmN5IFRUTCB2YWx1ZSBtdXN0IGJlIGEgbnVtYmVyJztcbiAgICB9XG4gICAgaWYgKCFpZGVtcG90ZW5jeU9wdGlvbnMucGF0aHMpIHtcbiAgICAgIGlkZW1wb3RlbmN5T3B0aW9ucy5wYXRocyA9IElkZW1wb3RlbmN5T3B0aW9ucy5wYXRocy5kZWZhdWx0O1xuICAgIH0gZWxzZSBpZiAoIShpZGVtcG90ZW5jeU9wdGlvbnMucGF0aHMgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgIHRocm93ICdpZGVtcG90ZW5jeSBwYXRocyBtdXN0IGJlIG9mIGFuIGFycmF5IG9mIHN0cmluZ3MnO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyB2YWxpZGF0ZUFjY291bnRMb2Nrb3V0UG9saWN5KGFjY291bnRMb2Nrb3V0KSB7XG4gICAgaWYgKGFjY291bnRMb2Nrb3V0KSB7XG4gICAgICBpZiAoXG4gICAgICAgIHR5cGVvZiBhY2NvdW50TG9ja291dC5kdXJhdGlvbiAhPT0gJ251bWJlcicgfHxcbiAgICAgICAgYWNjb3VudExvY2tvdXQuZHVyYXRpb24gPD0gMCB8fFxuICAgICAgICBhY2NvdW50TG9ja291dC5kdXJhdGlvbiA+IDk5OTk5XG4gICAgICApIHtcbiAgICAgICAgdGhyb3cgJ0FjY291bnQgbG9ja291dCBkdXJhdGlvbiBzaG91bGQgYmUgZ3JlYXRlciB0aGFuIDAgYW5kIGxlc3MgdGhhbiAxMDAwMDAnO1xuICAgICAgfVxuXG4gICAgICBpZiAoXG4gICAgICAgICFOdW1iZXIuaXNJbnRlZ2VyKGFjY291bnRMb2Nrb3V0LnRocmVzaG9sZCkgfHxcbiAgICAgICAgYWNjb3VudExvY2tvdXQudGhyZXNob2xkIDwgMSB8fFxuICAgICAgICBhY2NvdW50TG9ja291dC50aHJlc2hvbGQgPiA5OTlcbiAgICAgICkge1xuICAgICAgICB0aHJvdyAnQWNjb3VudCBsb2Nrb3V0IHRocmVzaG9sZCBzaG91bGQgYmUgYW4gaW50ZWdlciBncmVhdGVyIHRoYW4gMCBhbmQgbGVzcyB0aGFuIDEwMDAnO1xuICAgICAgfVxuXG4gICAgICBpZiAoYWNjb3VudExvY2tvdXQudW5sb2NrT25QYXNzd29yZFJlc2V0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgYWNjb3VudExvY2tvdXQudW5sb2NrT25QYXNzd29yZFJlc2V0ID0gQWNjb3VudExvY2tvdXRPcHRpb25zLnVubG9ja09uUGFzc3dvcmRSZXNldC5kZWZhdWx0O1xuICAgICAgfSBlbHNlIGlmICghaXNCb29sZWFuKGFjY291bnRMb2Nrb3V0LnVubG9ja09uUGFzc3dvcmRSZXNldCkpIHtcbiAgICAgICAgdGhyb3cgJ1BhcnNlIFNlcnZlciBvcHRpb24gYWNjb3VudExvY2tvdXQudW5sb2NrT25QYXNzd29yZFJlc2V0IG11c3QgYmUgYSBib29sZWFuLic7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIHZhbGlkYXRlUGFzc3dvcmRQb2xpY3kocGFzc3dvcmRQb2xpY3kpIHtcbiAgICBpZiAocGFzc3dvcmRQb2xpY3kpIHtcbiAgICAgIGlmIChcbiAgICAgICAgcGFzc3dvcmRQb2xpY3kubWF4UGFzc3dvcmRBZ2UgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAodHlwZW9mIHBhc3N3b3JkUG9saWN5Lm1heFBhc3N3b3JkQWdlICE9PSAnbnVtYmVyJyB8fCBwYXNzd29yZFBvbGljeS5tYXhQYXNzd29yZEFnZSA8IDApXG4gICAgICApIHtcbiAgICAgICAgdGhyb3cgJ3Bhc3N3b3JkUG9saWN5Lm1heFBhc3N3b3JkQWdlIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInO1xuICAgICAgfVxuXG4gICAgICBpZiAoXG4gICAgICAgIHBhc3N3b3JkUG9saWN5LnJlc2V0VG9rZW5WYWxpZGl0eUR1cmF0aW9uICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgKHR5cGVvZiBwYXNzd29yZFBvbGljeS5yZXNldFRva2VuVmFsaWRpdHlEdXJhdGlvbiAhPT0gJ251bWJlcicgfHxcbiAgICAgICAgICBwYXNzd29yZFBvbGljeS5yZXNldFRva2VuVmFsaWRpdHlEdXJhdGlvbiA8PSAwKVxuICAgICAgKSB7XG4gICAgICAgIHRocm93ICdwYXNzd29yZFBvbGljeS5yZXNldFRva2VuVmFsaWRpdHlEdXJhdGlvbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJztcbiAgICAgIH1cblxuICAgICAgaWYgKHBhc3N3b3JkUG9saWN5LnZhbGlkYXRvclBhdHRlcm4pIHtcbiAgICAgICAgaWYgKHR5cGVvZiBwYXNzd29yZFBvbGljeS52YWxpZGF0b3JQYXR0ZXJuID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHBhc3N3b3JkUG9saWN5LnZhbGlkYXRvclBhdHRlcm4gPSBuZXcgUmVnRXhwKHBhc3N3b3JkUG9saWN5LnZhbGlkYXRvclBhdHRlcm4pO1xuICAgICAgICB9IGVsc2UgaWYgKCEocGFzc3dvcmRQb2xpY3kudmFsaWRhdG9yUGF0dGVybiBpbnN0YW5jZW9mIFJlZ0V4cCkpIHtcbiAgICAgICAgICB0aHJvdyAncGFzc3dvcmRQb2xpY3kudmFsaWRhdG9yUGF0dGVybiBtdXN0IGJlIGEgcmVnZXggc3RyaW5nIG9yIFJlZ0V4cCBvYmplY3QuJztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoXG4gICAgICAgIHBhc3N3b3JkUG9saWN5LnZhbGlkYXRvckNhbGxiYWNrICYmXG4gICAgICAgIHR5cGVvZiBwYXNzd29yZFBvbGljeS52YWxpZGF0b3JDYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJ1xuICAgICAgKSB7XG4gICAgICAgIHRocm93ICdwYXNzd29yZFBvbGljeS52YWxpZGF0b3JDYWxsYmFjayBtdXN0IGJlIGEgZnVuY3Rpb24uJztcbiAgICAgIH1cblxuICAgICAgaWYgKFxuICAgICAgICBwYXNzd29yZFBvbGljeS5kb05vdEFsbG93VXNlcm5hbWUgJiZcbiAgICAgICAgdHlwZW9mIHBhc3N3b3JkUG9saWN5LmRvTm90QWxsb3dVc2VybmFtZSAhPT0gJ2Jvb2xlYW4nXG4gICAgICApIHtcbiAgICAgICAgdGhyb3cgJ3Bhc3N3b3JkUG9saWN5LmRvTm90QWxsb3dVc2VybmFtZSBtdXN0IGJlIGEgYm9vbGVhbiB2YWx1ZS4nO1xuICAgICAgfVxuXG4gICAgICBpZiAoXG4gICAgICAgIHBhc3N3b3JkUG9saWN5Lm1heFBhc3N3b3JkSGlzdG9yeSAmJlxuICAgICAgICAoIU51bWJlci5pc0ludGVnZXIocGFzc3dvcmRQb2xpY3kubWF4UGFzc3dvcmRIaXN0b3J5KSB8fFxuICAgICAgICAgIHBhc3N3b3JkUG9saWN5Lm1heFBhc3N3b3JkSGlzdG9yeSA8PSAwIHx8XG4gICAgICAgICAgcGFzc3dvcmRQb2xpY3kubWF4UGFzc3dvcmRIaXN0b3J5ID4gMjApXG4gICAgICApIHtcbiAgICAgICAgdGhyb3cgJ3Bhc3N3b3JkUG9saWN5Lm1heFBhc3N3b3JkSGlzdG9yeSBtdXN0IGJlIGFuIGludGVnZXIgcmFuZ2luZyAwIC0gMjAnO1xuICAgICAgfVxuXG4gICAgICBpZiAoXG4gICAgICAgIHBhc3N3b3JkUG9saWN5LnJlc2V0VG9rZW5SZXVzZUlmVmFsaWQgJiZcbiAgICAgICAgdHlwZW9mIHBhc3N3b3JkUG9saWN5LnJlc2V0VG9rZW5SZXVzZUlmVmFsaWQgIT09ICdib29sZWFuJ1xuICAgICAgKSB7XG4gICAgICAgIHRocm93ICdyZXNldFRva2VuUmV1c2VJZlZhbGlkIG11c3QgYmUgYSBib29sZWFuIHZhbHVlJztcbiAgICAgIH1cbiAgICAgIGlmIChwYXNzd29yZFBvbGljeS5yZXNldFRva2VuUmV1c2VJZlZhbGlkICYmICFwYXNzd29yZFBvbGljeS5yZXNldFRva2VuVmFsaWRpdHlEdXJhdGlvbikge1xuICAgICAgICB0aHJvdyAnWW91IGNhbm5vdCB1c2UgcmVzZXRUb2tlblJldXNlSWZWYWxpZCB3aXRob3V0IHJlc2V0VG9rZW5WYWxpZGl0eUR1cmF0aW9uJztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBpZiB0aGUgcGFzc3dvcmRQb2xpY3kudmFsaWRhdG9yUGF0dGVybiBpcyBjb25maWd1cmVkIHRoZW4gc2V0dXAgYSBjYWxsYmFjayB0byBwcm9jZXNzIHRoZSBwYXR0ZXJuXG4gIHN0YXRpYyBzZXR1cFBhc3N3b3JkVmFsaWRhdG9yKHBhc3N3b3JkUG9saWN5KSB7XG4gICAgaWYgKHBhc3N3b3JkUG9saWN5ICYmIHBhc3N3b3JkUG9saWN5LnZhbGlkYXRvclBhdHRlcm4pIHtcbiAgICAgIHBhc3N3b3JkUG9saWN5LnBhdHRlcm5WYWxpZGF0b3IgPSB2YWx1ZSA9PiB7XG4gICAgICAgIHJldHVybiBwYXNzd29yZFBvbGljeS52YWxpZGF0b3JQYXR0ZXJuLnRlc3QodmFsdWUpO1xuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgdmFsaWRhdGVFbWFpbENvbmZpZ3VyYXRpb24oe1xuICAgIGVtYWlsQWRhcHRlcixcbiAgICBhcHBOYW1lLFxuICAgIHB1YmxpY1NlcnZlclVSTCxcbiAgICBlbWFpbFZlcmlmeVRva2VuVmFsaWRpdHlEdXJhdGlvbixcbiAgICBlbWFpbFZlcmlmeVRva2VuUmV1c2VJZlZhbGlkLFxuICB9KSB7XG4gICAgaWYgKCFlbWFpbEFkYXB0ZXIpIHtcbiAgICAgIHRocm93ICdBbiBlbWFpbEFkYXB0ZXIgaXMgcmVxdWlyZWQgZm9yIGUtbWFpbCB2ZXJpZmljYXRpb24gYW5kIHBhc3N3b3JkIHJlc2V0cy4nO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGFwcE5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyAnQW4gYXBwIG5hbWUgaXMgcmVxdWlyZWQgZm9yIGUtbWFpbCB2ZXJpZmljYXRpb24gYW5kIHBhc3N3b3JkIHJlc2V0cy4nO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHB1YmxpY1NlcnZlclVSTCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93ICdBIHB1YmxpYyBzZXJ2ZXIgdXJsIGlzIHJlcXVpcmVkIGZvciBlLW1haWwgdmVyaWZpY2F0aW9uIGFuZCBwYXNzd29yZCByZXNldHMuJztcbiAgICB9XG4gICAgaWYgKGVtYWlsVmVyaWZ5VG9rZW5WYWxpZGl0eUR1cmF0aW9uKSB7XG4gICAgICBpZiAoaXNOYU4oZW1haWxWZXJpZnlUb2tlblZhbGlkaXR5RHVyYXRpb24pKSB7XG4gICAgICAgIHRocm93ICdFbWFpbCB2ZXJpZnkgdG9rZW4gdmFsaWRpdHkgZHVyYXRpb24gbXVzdCBiZSBhIHZhbGlkIG51bWJlci4nO1xuICAgICAgfSBlbHNlIGlmIChlbWFpbFZlcmlmeVRva2VuVmFsaWRpdHlEdXJhdGlvbiA8PSAwKSB7XG4gICAgICAgIHRocm93ICdFbWFpbCB2ZXJpZnkgdG9rZW4gdmFsaWRpdHkgZHVyYXRpb24gbXVzdCBiZSBhIHZhbHVlIGdyZWF0ZXIgdGhhbiAwLic7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChlbWFpbFZlcmlmeVRva2VuUmV1c2VJZlZhbGlkICYmIHR5cGVvZiBlbWFpbFZlcmlmeVRva2VuUmV1c2VJZlZhbGlkICE9PSAnYm9vbGVhbicpIHtcbiAgICAgIHRocm93ICdlbWFpbFZlcmlmeVRva2VuUmV1c2VJZlZhbGlkIG11c3QgYmUgYSBib29sZWFuIHZhbHVlJztcbiAgICB9XG4gICAgaWYgKGVtYWlsVmVyaWZ5VG9rZW5SZXVzZUlmVmFsaWQgJiYgIWVtYWlsVmVyaWZ5VG9rZW5WYWxpZGl0eUR1cmF0aW9uKSB7XG4gICAgICB0aHJvdyAnWW91IGNhbm5vdCB1c2UgZW1haWxWZXJpZnlUb2tlblJldXNlSWZWYWxpZCB3aXRob3V0IGVtYWlsVmVyaWZ5VG9rZW5WYWxpZGl0eUR1cmF0aW9uJztcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgdmFsaWRhdGVGaWxlVXBsb2FkT3B0aW9ucyhmaWxlVXBsb2FkKSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChmaWxlVXBsb2FkID09IG51bGwgfHwgdHlwZW9mIGZpbGVVcGxvYWQgIT09ICdvYmplY3QnIHx8IGZpbGVVcGxvYWQgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICB0aHJvdyAnZmlsZVVwbG9hZCBtdXN0IGJlIGFuIG9iamVjdCB2YWx1ZS4nO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlIGluc3RhbmNlb2YgUmVmZXJlbmNlRXJyb3IpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gICAgaWYgKGZpbGVVcGxvYWQuZW5hYmxlRm9yQW5vbnltb3VzVXNlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBmaWxlVXBsb2FkLmVuYWJsZUZvckFub255bW91c1VzZXIgPSBGaWxlVXBsb2FkT3B0aW9ucy5lbmFibGVGb3JBbm9ueW1vdXNVc2VyLmRlZmF1bHQ7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZmlsZVVwbG9hZC5lbmFibGVGb3JBbm9ueW1vdXNVc2VyICE9PSAnYm9vbGVhbicpIHtcbiAgICAgIHRocm93ICdmaWxlVXBsb2FkLmVuYWJsZUZvckFub255bW91c1VzZXIgbXVzdCBiZSBhIGJvb2xlYW4gdmFsdWUuJztcbiAgICB9XG4gICAgaWYgKGZpbGVVcGxvYWQuZW5hYmxlRm9yUHVibGljID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGZpbGVVcGxvYWQuZW5hYmxlRm9yUHVibGljID0gRmlsZVVwbG9hZE9wdGlvbnMuZW5hYmxlRm9yUHVibGljLmRlZmF1bHQ7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZmlsZVVwbG9hZC5lbmFibGVGb3JQdWJsaWMgIT09ICdib29sZWFuJykge1xuICAgICAgdGhyb3cgJ2ZpbGVVcGxvYWQuZW5hYmxlRm9yUHVibGljIG11c3QgYmUgYSBib29sZWFuIHZhbHVlLic7XG4gICAgfVxuICAgIGlmIChmaWxlVXBsb2FkLmVuYWJsZUZvckF1dGhlbnRpY2F0ZWRVc2VyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGZpbGVVcGxvYWQuZW5hYmxlRm9yQXV0aGVudGljYXRlZFVzZXIgPSBGaWxlVXBsb2FkT3B0aW9ucy5lbmFibGVGb3JBdXRoZW50aWNhdGVkVXNlci5kZWZhdWx0O1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGZpbGVVcGxvYWQuZW5hYmxlRm9yQXV0aGVudGljYXRlZFVzZXIgIT09ICdib29sZWFuJykge1xuICAgICAgdGhyb3cgJ2ZpbGVVcGxvYWQuZW5hYmxlRm9yQXV0aGVudGljYXRlZFVzZXIgbXVzdCBiZSBhIGJvb2xlYW4gdmFsdWUuJztcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgdmFsaWRhdGVNYXN0ZXJLZXlJcHMobWFzdGVyS2V5SXBzKSB7XG4gICAgZm9yIChjb25zdCBpcCBvZiBtYXN0ZXJLZXlJcHMpIHtcbiAgICAgIGlmICghbmV0LmlzSVAoaXApKSB7XG4gICAgICAgIHRocm93IGBJbnZhbGlkIGlwIGluIG1hc3RlcktleUlwczogJHtpcH1gO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldCBtb3VudCgpIHtcbiAgICB2YXIgbW91bnQgPSB0aGlzLl9tb3VudDtcbiAgICBpZiAodGhpcy5wdWJsaWNTZXJ2ZXJVUkwpIHtcbiAgICAgIG1vdW50ID0gdGhpcy5wdWJsaWNTZXJ2ZXJVUkw7XG4gICAgfVxuICAgIHJldHVybiBtb3VudDtcbiAgfVxuXG4gIHNldCBtb3VudChuZXdWYWx1ZSkge1xuICAgIHRoaXMuX21vdW50ID0gbmV3VmFsdWU7XG4gIH1cblxuICBzdGF0aWMgdmFsaWRhdGVTZXNzaW9uQ29uZmlndXJhdGlvbihzZXNzaW9uTGVuZ3RoLCBleHBpcmVJbmFjdGl2ZVNlc3Npb25zKSB7XG4gICAgaWYgKGV4cGlyZUluYWN0aXZlU2Vzc2lvbnMpIHtcbiAgICAgIGlmIChpc05hTihzZXNzaW9uTGVuZ3RoKSkge1xuICAgICAgICB0aHJvdyAnU2Vzc2lvbiBsZW5ndGggbXVzdCBiZSBhIHZhbGlkIG51bWJlci4nO1xuICAgICAgfSBlbHNlIGlmIChzZXNzaW9uTGVuZ3RoIDw9IDApIHtcbiAgICAgICAgdGhyb3cgJ1Nlc3Npb24gbGVuZ3RoIG11c3QgYmUgYSB2YWx1ZSBncmVhdGVyIHRoYW4gMC4nO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyB2YWxpZGF0ZU1heExpbWl0KG1heExpbWl0KSB7XG4gICAgaWYgKG1heExpbWl0IDw9IDApIHtcbiAgICAgIHRocm93ICdNYXggbGltaXQgbXVzdCBiZSBhIHZhbHVlIGdyZWF0ZXIgdGhhbiAwLic7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIHZhbGlkYXRlQWxsb3dIZWFkZXJzKGFsbG93SGVhZGVycykge1xuICAgIGlmICghW251bGwsIHVuZGVmaW5lZF0uaW5jbHVkZXMoYWxsb3dIZWFkZXJzKSkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYWxsb3dIZWFkZXJzKSkge1xuICAgICAgICBhbGxvd0hlYWRlcnMuZm9yRWFjaChoZWFkZXIgPT4ge1xuICAgICAgICAgIGlmICh0eXBlb2YgaGVhZGVyICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhyb3cgJ0FsbG93IGhlYWRlcnMgbXVzdCBvbmx5IGNvbnRhaW4gc3RyaW5ncyc7XG4gICAgICAgICAgfSBlbHNlIGlmICghaGVhZGVyLnRyaW0oKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRocm93ICdBbGxvdyBoZWFkZXJzIG11c3Qgbm90IGNvbnRhaW4gZW1wdHkgc3RyaW5ncyc7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93ICdBbGxvdyBoZWFkZXJzIG11c3QgYmUgYW4gYXJyYXknO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdlbmVyYXRlRW1haWxWZXJpZnlUb2tlbkV4cGlyZXNBdCgpIHtcbiAgICBpZiAoIXRoaXMudmVyaWZ5VXNlckVtYWlscyB8fCAhdGhpcy5lbWFpbFZlcmlmeVRva2VuVmFsaWRpdHlEdXJhdGlvbikge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgdmFyIG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgcmV0dXJuIG5ldyBEYXRlKG5vdy5nZXRUaW1lKCkgKyB0aGlzLmVtYWlsVmVyaWZ5VG9rZW5WYWxpZGl0eUR1cmF0aW9uICogMTAwMCk7XG4gIH1cblxuICBnZW5lcmF0ZVBhc3N3b3JkUmVzZXRUb2tlbkV4cGlyZXNBdCgpIHtcbiAgICBpZiAoIXRoaXMucGFzc3dvcmRQb2xpY3kgfHwgIXRoaXMucGFzc3dvcmRQb2xpY3kucmVzZXRUb2tlblZhbGlkaXR5RHVyYXRpb24pIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgcmV0dXJuIG5ldyBEYXRlKG5vdy5nZXRUaW1lKCkgKyB0aGlzLnBhc3N3b3JkUG9saWN5LnJlc2V0VG9rZW5WYWxpZGl0eUR1cmF0aW9uICogMTAwMCk7XG4gIH1cblxuICBnZW5lcmF0ZVNlc3Npb25FeHBpcmVzQXQoKSB7XG4gICAgaWYgKCF0aGlzLmV4cGlyZUluYWN0aXZlU2Vzc2lvbnMpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpO1xuICAgIHJldHVybiBuZXcgRGF0ZShub3cuZ2V0VGltZSgpICsgdGhpcy5zZXNzaW9uTGVuZ3RoICogMTAwMCk7XG4gIH1cblxuICBnZXQgaW52YWxpZExpbmtVUkwoKSB7XG4gICAgcmV0dXJuIHRoaXMuY3VzdG9tUGFnZXMuaW52YWxpZExpbmsgfHwgYCR7dGhpcy5wdWJsaWNTZXJ2ZXJVUkx9L2FwcHMvaW52YWxpZF9saW5rLmh0bWxgO1xuICB9XG5cbiAgZ2V0IGludmFsaWRWZXJpZmljYXRpb25MaW5rVVJMKCkge1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLmN1c3RvbVBhZ2VzLmludmFsaWRWZXJpZmljYXRpb25MaW5rIHx8XG4gICAgICBgJHt0aGlzLnB1YmxpY1NlcnZlclVSTH0vYXBwcy9pbnZhbGlkX3ZlcmlmaWNhdGlvbl9saW5rLmh0bWxgXG4gICAgKTtcbiAgfVxuXG4gIGdldCBsaW5rU2VuZFN1Y2Nlc3NVUkwoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuY3VzdG9tUGFnZXMubGlua1NlbmRTdWNjZXNzIHx8IGAke3RoaXMucHVibGljU2VydmVyVVJMfS9hcHBzL2xpbmtfc2VuZF9zdWNjZXNzLmh0bWxgXG4gICAgKTtcbiAgfVxuXG4gIGdldCBsaW5rU2VuZEZhaWxVUkwoKSB7XG4gICAgcmV0dXJuIHRoaXMuY3VzdG9tUGFnZXMubGlua1NlbmRGYWlsIHx8IGAke3RoaXMucHVibGljU2VydmVyVVJMfS9hcHBzL2xpbmtfc2VuZF9mYWlsLmh0bWxgO1xuICB9XG5cbiAgZ2V0IHZlcmlmeUVtYWlsU3VjY2Vzc1VSTCgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5jdXN0b21QYWdlcy52ZXJpZnlFbWFpbFN1Y2Nlc3MgfHxcbiAgICAgIGAke3RoaXMucHVibGljU2VydmVyVVJMfS9hcHBzL3ZlcmlmeV9lbWFpbF9zdWNjZXNzLmh0bWxgXG4gICAgKTtcbiAgfVxuXG4gIGdldCBjaG9vc2VQYXNzd29yZFVSTCgpIHtcbiAgICByZXR1cm4gdGhpcy5jdXN0b21QYWdlcy5jaG9vc2VQYXNzd29yZCB8fCBgJHt0aGlzLnB1YmxpY1NlcnZlclVSTH0vYXBwcy9jaG9vc2VfcGFzc3dvcmRgO1xuICB9XG5cbiAgZ2V0IHJlcXVlc3RSZXNldFBhc3N3b3JkVVJMKCkge1xuICAgIHJldHVybiBgJHt0aGlzLnB1YmxpY1NlcnZlclVSTH0vJHt0aGlzLnBhZ2VzRW5kcG9pbnR9LyR7dGhpcy5hcHBsaWNhdGlvbklkfS9yZXF1ZXN0X3Bhc3N3b3JkX3Jlc2V0YDtcbiAgfVxuXG4gIGdldCBwYXNzd29yZFJlc2V0U3VjY2Vzc1VSTCgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5jdXN0b21QYWdlcy5wYXNzd29yZFJlc2V0U3VjY2VzcyB8fFxuICAgICAgYCR7dGhpcy5wdWJsaWNTZXJ2ZXJVUkx9L2FwcHMvcGFzc3dvcmRfcmVzZXRfc3VjY2Vzcy5odG1sYFxuICAgICk7XG4gIH1cblxuICBnZXQgcGFyc2VGcmFtZVVSTCgpIHtcbiAgICByZXR1cm4gdGhpcy5jdXN0b21QYWdlcy5wYXJzZUZyYW1lVVJMO1xuICB9XG5cbiAgZ2V0IHZlcmlmeUVtYWlsVVJMKCkge1xuICAgIHJldHVybiBgJHt0aGlzLnB1YmxpY1NlcnZlclVSTH0vJHt0aGlzLnBhZ2VzRW5kcG9pbnR9LyR7dGhpcy5hcHBsaWNhdGlvbklkfS92ZXJpZnlfZW1haWxgO1xuICB9XG5cbiAgLy8gVE9ETzogUmVtb3ZlIHRoaXMgZnVuY3Rpb24gb25jZSBQYWdlc1JvdXRlciByZXBsYWNlcyB0aGUgUHVibGljQVBJUm91dGVyO1xuICAvLyB0aGUgKGRlZmF1bHQpIGVuZHBvaW50IGhhcyB0byBiZSBkZWZpbmVkIGluIFBhZ2VzUm91dGVyIG9ubHkuXG4gIGdldCBwYWdlc0VuZHBvaW50KCkge1xuICAgIHJldHVybiB0aGlzLnBhZ2VzICYmIHRoaXMucGFnZXMuZW5hYmxlUm91dGVyICYmIHRoaXMucGFnZXMucGFnZXNFbmRwb2ludFxuICAgICAgPyB0aGlzLnBhZ2VzLnBhZ2VzRW5kcG9pbnRcbiAgICAgIDogJ2FwcHMnO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENvbmZpZztcbm1vZHVsZS5leHBvcnRzID0gQ29uZmlnO1xuIl19