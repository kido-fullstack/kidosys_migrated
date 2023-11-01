const config = require('../config/')

exports.responseSuccess = (msg, data, code) => {
  let result = {};

  result.message = msg;
  result.data = data || null;
  result.code = code;
  result.success = true;

  return result;
};

exports.responseError = (msg, code, status, path, payload, timestamp) => {
  let result = {};

  if (config.server.devenv == "dev") {
    result.message = msg;
    result.code = code;
    result.status = status;
    result.type = "api";
    result.path = path;
    result.payload = payload || {};
    result.level = "error";
    result.timestamp = timestamp;
  } else {
    result.message = msg;
    result.code = code;
    result.status = status;
    result.type = "api";
    result.level = "error";
    result.timestamp = timestamp;
  }

  return result;
};