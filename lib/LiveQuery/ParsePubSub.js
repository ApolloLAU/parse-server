"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParsePubSub = void 0;

var _AdapterLoader = require("../Adapters/AdapterLoader");

var _EventEmitterPubSub = require("../Adapters/PubSub/EventEmitterPubSub");

var _RedisPubSub = require("../Adapters/PubSub/RedisPubSub");

const ParsePubSub = {};
exports.ParsePubSub = ParsePubSub;

function useRedis(config) {
  const redisURL = config.redisURL;
  return typeof redisURL !== 'undefined' && redisURL !== '';
}

ParsePubSub.createPublisher = function (config) {
  if (useRedis(config)) {
    return _RedisPubSub.RedisPubSub.createPublisher(config);
  } else {
    const adapter = (0, _AdapterLoader.loadAdapter)(config.pubSubAdapter, _EventEmitterPubSub.EventEmitterPubSub, config);

    if (typeof adapter.createPublisher !== 'function') {
      throw 'pubSubAdapter should have createPublisher()';
    }

    return adapter.createPublisher(config);
  }
};

ParsePubSub.createSubscriber = function (config) {
  if (useRedis(config)) {
    return _RedisPubSub.RedisPubSub.createSubscriber(config);
  } else {
    const adapter = (0, _AdapterLoader.loadAdapter)(config.pubSubAdapter, _EventEmitterPubSub.EventEmitterPubSub, config);

    if (typeof adapter.createSubscriber !== 'function') {
      throw 'pubSubAdapter should have createSubscriber()';
    }

    return adapter.createSubscriber(config);
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9MaXZlUXVlcnkvUGFyc2VQdWJTdWIuanMiXSwibmFtZXMiOlsiUGFyc2VQdWJTdWIiLCJ1c2VSZWRpcyIsImNvbmZpZyIsInJlZGlzVVJMIiwiY3JlYXRlUHVibGlzaGVyIiwiUmVkaXNQdWJTdWIiLCJhZGFwdGVyIiwicHViU3ViQWRhcHRlciIsIkV2ZW50RW1pdHRlclB1YlN1YiIsImNyZWF0ZVN1YnNjcmliZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFFQTs7QUFFQSxNQUFNQSxXQUFXLEdBQUcsRUFBcEI7OztBQUVBLFNBQVNDLFFBQVQsQ0FBa0JDLE1BQWxCLEVBQXdDO0FBQ3RDLFFBQU1DLFFBQVEsR0FBR0QsTUFBTSxDQUFDQyxRQUF4QjtBQUNBLFNBQU8sT0FBT0EsUUFBUCxLQUFvQixXQUFwQixJQUFtQ0EsUUFBUSxLQUFLLEVBQXZEO0FBQ0Q7O0FBRURILFdBQVcsQ0FBQ0ksZUFBWixHQUE4QixVQUFVRixNQUFWLEVBQTRCO0FBQ3hELE1BQUlELFFBQVEsQ0FBQ0MsTUFBRCxDQUFaLEVBQXNCO0FBQ3BCLFdBQU9HLHlCQUFZRCxlQUFaLENBQTRCRixNQUE1QixDQUFQO0FBQ0QsR0FGRCxNQUVPO0FBQ0wsVUFBTUksT0FBTyxHQUFHLGdDQUFZSixNQUFNLENBQUNLLGFBQW5CLEVBQWtDQyxzQ0FBbEMsRUFBc0ROLE1BQXRELENBQWhCOztBQUNBLFFBQUksT0FBT0ksT0FBTyxDQUFDRixlQUFmLEtBQW1DLFVBQXZDLEVBQW1EO0FBQ2pELFlBQU0sNkNBQU47QUFDRDs7QUFDRCxXQUFPRSxPQUFPLENBQUNGLGVBQVIsQ0FBd0JGLE1BQXhCLENBQVA7QUFDRDtBQUNGLENBVkQ7O0FBWUFGLFdBQVcsQ0FBQ1MsZ0JBQVosR0FBK0IsVUFBVVAsTUFBVixFQUE2QjtBQUMxRCxNQUFJRCxRQUFRLENBQUNDLE1BQUQsQ0FBWixFQUFzQjtBQUNwQixXQUFPRyx5QkFBWUksZ0JBQVosQ0FBNkJQLE1BQTdCLENBQVA7QUFDRCxHQUZELE1BRU87QUFDTCxVQUFNSSxPQUFPLEdBQUcsZ0NBQVlKLE1BQU0sQ0FBQ0ssYUFBbkIsRUFBa0NDLHNDQUFsQyxFQUFzRE4sTUFBdEQsQ0FBaEI7O0FBQ0EsUUFBSSxPQUFPSSxPQUFPLENBQUNHLGdCQUFmLEtBQW9DLFVBQXhDLEVBQW9EO0FBQ2xELFlBQU0sOENBQU47QUFDRDs7QUFDRCxXQUFPSCxPQUFPLENBQUNHLGdCQUFSLENBQXlCUCxNQUF6QixDQUFQO0FBQ0Q7QUFDRixDQVZEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbG9hZEFkYXB0ZXIgfSBmcm9tICcuLi9BZGFwdGVycy9BZGFwdGVyTG9hZGVyJztcbmltcG9ydCB7IEV2ZW50RW1pdHRlclB1YlN1YiB9IGZyb20gJy4uL0FkYXB0ZXJzL1B1YlN1Yi9FdmVudEVtaXR0ZXJQdWJTdWInO1xuXG5pbXBvcnQgeyBSZWRpc1B1YlN1YiB9IGZyb20gJy4uL0FkYXB0ZXJzL1B1YlN1Yi9SZWRpc1B1YlN1Yic7XG5cbmNvbnN0IFBhcnNlUHViU3ViID0ge307XG5cbmZ1bmN0aW9uIHVzZVJlZGlzKGNvbmZpZzogYW55KTogYm9vbGVhbiB7XG4gIGNvbnN0IHJlZGlzVVJMID0gY29uZmlnLnJlZGlzVVJMO1xuICByZXR1cm4gdHlwZW9mIHJlZGlzVVJMICE9PSAndW5kZWZpbmVkJyAmJiByZWRpc1VSTCAhPT0gJyc7XG59XG5cblBhcnNlUHViU3ViLmNyZWF0ZVB1Ymxpc2hlciA9IGZ1bmN0aW9uIChjb25maWc6IGFueSk6IGFueSB7XG4gIGlmICh1c2VSZWRpcyhjb25maWcpKSB7XG4gICAgcmV0dXJuIFJlZGlzUHViU3ViLmNyZWF0ZVB1Ymxpc2hlcihjb25maWcpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGFkYXB0ZXIgPSBsb2FkQWRhcHRlcihjb25maWcucHViU3ViQWRhcHRlciwgRXZlbnRFbWl0dGVyUHViU3ViLCBjb25maWcpO1xuICAgIGlmICh0eXBlb2YgYWRhcHRlci5jcmVhdGVQdWJsaXNoZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93ICdwdWJTdWJBZGFwdGVyIHNob3VsZCBoYXZlIGNyZWF0ZVB1Ymxpc2hlcigpJztcbiAgICB9XG4gICAgcmV0dXJuIGFkYXB0ZXIuY3JlYXRlUHVibGlzaGVyKGNvbmZpZyk7XG4gIH1cbn07XG5cblBhcnNlUHViU3ViLmNyZWF0ZVN1YnNjcmliZXIgPSBmdW5jdGlvbiAoY29uZmlnOiBhbnkpOiB2b2lkIHtcbiAgaWYgKHVzZVJlZGlzKGNvbmZpZykpIHtcbiAgICByZXR1cm4gUmVkaXNQdWJTdWIuY3JlYXRlU3Vic2NyaWJlcihjb25maWcpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGFkYXB0ZXIgPSBsb2FkQWRhcHRlcihjb25maWcucHViU3ViQWRhcHRlciwgRXZlbnRFbWl0dGVyUHViU3ViLCBjb25maWcpO1xuICAgIGlmICh0eXBlb2YgYWRhcHRlci5jcmVhdGVTdWJzY3JpYmVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyAncHViU3ViQWRhcHRlciBzaG91bGQgaGF2ZSBjcmVhdGVTdWJzY3JpYmVyKCknO1xuICAgIH1cbiAgICByZXR1cm4gYWRhcHRlci5jcmVhdGVTdWJzY3JpYmVyKGNvbmZpZyk7XG4gIH1cbn07XG5cbmV4cG9ydCB7IFBhcnNlUHViU3ViIH07XG4iXX0=