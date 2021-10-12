"use strict";

// Helper functions for accessing the line API.
var Parse = require('parse/node').Parse;

const httpsRequest = require('./httpsRequest'); // Returns a promise that fulfills if this user id is valid.


function validateAuthData(authData) {
  return request('profile', authData.access_token).then(response => {
    if (response && response.userId && response.userId === authData.id) {
      return;
    }

    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Line auth is invalid for this user.');
  });
} // Returns a promise that fulfills iff this app id is valid.


function validateAppId() {
  return Promise.resolve();
} // A promisey wrapper for api requests


function request(path, access_token) {
  var options = {
    host: 'api.line.me',
    path: '/v2/' + path,
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + access_token
    }
  };
  return httpsRequest.get(options);
}

module.exports = {
  validateAppId: validateAppId,
  validateAuthData: validateAuthData
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9BZGFwdGVycy9BdXRoL2xpbmUuanMiXSwibmFtZXMiOlsiUGFyc2UiLCJyZXF1aXJlIiwiaHR0cHNSZXF1ZXN0IiwidmFsaWRhdGVBdXRoRGF0YSIsImF1dGhEYXRhIiwicmVxdWVzdCIsImFjY2Vzc190b2tlbiIsInRoZW4iLCJyZXNwb25zZSIsInVzZXJJZCIsImlkIiwiRXJyb3IiLCJPQkpFQ1RfTk9UX0ZPVU5EIiwidmFsaWRhdGVBcHBJZCIsIlByb21pc2UiLCJyZXNvbHZlIiwicGF0aCIsIm9wdGlvbnMiLCJob3N0IiwibWV0aG9kIiwiaGVhZGVycyIsIkF1dGhvcml6YXRpb24iLCJnZXQiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0EsSUFBSUEsS0FBSyxHQUFHQyxPQUFPLENBQUMsWUFBRCxDQUFQLENBQXNCRCxLQUFsQzs7QUFDQSxNQUFNRSxZQUFZLEdBQUdELE9BQU8sQ0FBQyxnQkFBRCxDQUE1QixDLENBRUE7OztBQUNBLFNBQVNFLGdCQUFULENBQTBCQyxRQUExQixFQUFvQztBQUNsQyxTQUFPQyxPQUFPLENBQUMsU0FBRCxFQUFZRCxRQUFRLENBQUNFLFlBQXJCLENBQVAsQ0FBMENDLElBQTFDLENBQStDQyxRQUFRLElBQUk7QUFDaEUsUUFBSUEsUUFBUSxJQUFJQSxRQUFRLENBQUNDLE1BQXJCLElBQStCRCxRQUFRLENBQUNDLE1BQVQsS0FBb0JMLFFBQVEsQ0FBQ00sRUFBaEUsRUFBb0U7QUFDbEU7QUFDRDs7QUFDRCxVQUFNLElBQUlWLEtBQUssQ0FBQ1csS0FBVixDQUFnQlgsS0FBSyxDQUFDVyxLQUFOLENBQVlDLGdCQUE1QixFQUE4QyxxQ0FBOUMsQ0FBTjtBQUNELEdBTE0sQ0FBUDtBQU1ELEMsQ0FFRDs7O0FBQ0EsU0FBU0MsYUFBVCxHQUF5QjtBQUN2QixTQUFPQyxPQUFPLENBQUNDLE9BQVIsRUFBUDtBQUNELEMsQ0FFRDs7O0FBQ0EsU0FBU1YsT0FBVCxDQUFpQlcsSUFBakIsRUFBdUJWLFlBQXZCLEVBQXFDO0FBQ25DLE1BQUlXLE9BQU8sR0FBRztBQUNaQyxJQUFBQSxJQUFJLEVBQUUsYUFETTtBQUVaRixJQUFBQSxJQUFJLEVBQUUsU0FBU0EsSUFGSDtBQUdaRyxJQUFBQSxNQUFNLEVBQUUsS0FISTtBQUlaQyxJQUFBQSxPQUFPLEVBQUU7QUFDUEMsTUFBQUEsYUFBYSxFQUFFLFlBQVlmO0FBRHBCO0FBSkcsR0FBZDtBQVFBLFNBQU9KLFlBQVksQ0FBQ29CLEdBQWIsQ0FBaUJMLE9BQWpCLENBQVA7QUFDRDs7QUFFRE0sTUFBTSxDQUFDQyxPQUFQLEdBQWlCO0FBQ2ZYLEVBQUFBLGFBQWEsRUFBRUEsYUFEQTtBQUVmVixFQUFBQSxnQkFBZ0IsRUFBRUE7QUFGSCxDQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIi8vIEhlbHBlciBmdW5jdGlvbnMgZm9yIGFjY2Vzc2luZyB0aGUgbGluZSBBUEkuXG52YXIgUGFyc2UgPSByZXF1aXJlKCdwYXJzZS9ub2RlJykuUGFyc2U7XG5jb25zdCBodHRwc1JlcXVlc3QgPSByZXF1aXJlKCcuL2h0dHBzUmVxdWVzdCcpO1xuXG4vLyBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IGZ1bGZpbGxzIGlmIHRoaXMgdXNlciBpZCBpcyB2YWxpZC5cbmZ1bmN0aW9uIHZhbGlkYXRlQXV0aERhdGEoYXV0aERhdGEpIHtcbiAgcmV0dXJuIHJlcXVlc3QoJ3Byb2ZpbGUnLCBhdXRoRGF0YS5hY2Nlc3NfdG9rZW4pLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgIGlmIChyZXNwb25zZSAmJiByZXNwb25zZS51c2VySWQgJiYgcmVzcG9uc2UudXNlcklkID09PSBhdXRoRGF0YS5pZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgUGFyc2UuRXJyb3IoUGFyc2UuRXJyb3IuT0JKRUNUX05PVF9GT1VORCwgJ0xpbmUgYXV0aCBpcyBpbnZhbGlkIGZvciB0aGlzIHVzZXIuJyk7XG4gIH0pO1xufVxuXG4vLyBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IGZ1bGZpbGxzIGlmZiB0aGlzIGFwcCBpZCBpcyB2YWxpZC5cbmZ1bmN0aW9uIHZhbGlkYXRlQXBwSWQoKSB7XG4gIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbn1cblxuLy8gQSBwcm9taXNleSB3cmFwcGVyIGZvciBhcGkgcmVxdWVzdHNcbmZ1bmN0aW9uIHJlcXVlc3QocGF0aCwgYWNjZXNzX3Rva2VuKSB7XG4gIHZhciBvcHRpb25zID0ge1xuICAgIGhvc3Q6ICdhcGkubGluZS5tZScsXG4gICAgcGF0aDogJy92Mi8nICsgcGF0aCxcbiAgICBtZXRob2Q6ICdHRVQnLFxuICAgIGhlYWRlcnM6IHtcbiAgICAgIEF1dGhvcml6YXRpb246ICdCZWFyZXIgJyArIGFjY2Vzc190b2tlbixcbiAgICB9LFxuICB9O1xuICByZXR1cm4gaHR0cHNSZXF1ZXN0LmdldChvcHRpb25zKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHZhbGlkYXRlQXBwSWQ6IHZhbGlkYXRlQXBwSWQsXG4gIHZhbGlkYXRlQXV0aERhdGE6IHZhbGlkYXRlQXV0aERhdGEsXG59O1xuIl19