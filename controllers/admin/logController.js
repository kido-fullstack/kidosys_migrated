const fs = require('fs');
const readLastLines = require('read-last-lines');
const path = require('path');
const helper = require('../../handlers/helper');

const numberOfLines = 10000000000000000000000000000000000;

exports.checkLogFileExist = (req, res, next) => {
  try {
    let errLogPathSplice = __dirname.split('/')
    errLogPathSplice.splice(-2);
    let errLogFile = `${errLogPathSplice.join('/')}/logs/errorLogs.log`;
    if (fs.existsSync(errLogFile)) {
      req.body.errfilePath = errLogFile;
      next();
    } else {
      return res.status(400).json({ message: "errors log file does not exist!"});
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "check log file controller err - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getAllApiErrorsLogs = async (req, res, next) => {
  try {
    let logArr = [];
    const logs = await readLastLines.read(req.body.errfilePath, numberOfLines);
    const logObjs = logs.split('\n');

    logObjs.forEach(logObj => {
      if (logObj !== undefined && logObj !== null && logObj !== '') {
        logArr.unshift(JSON.parse(logObj))
      }
    });
    // console.log(logArr.length);
    res.render('logs/errorLogs', {logArr});
    delete logArr;
    return;
  } catch (err) {
    helper.errorDetailsForControllers(err, "All error api logs not working", req.originalUrl, req.body, {}, 'api',  __filename);
    next(err);
    return;
  }
};

exports.checkCombinedLogFileExist = (req, res, next) => {
  try {
    let combinedLogPathSplice = __dirname.split('/')
    combinedLogPathSplice.splice(-2);
    let combinedLogPath = `${combinedLogPathSplice.join('/')}/logs/combined.log`;
    if (fs.existsSync(combinedLogPath)) {
      req.body.combinedfilePath = combinedLogPath;
      next();
    } else {
      return res.status(400).json({ message: "combined log file does not exist!"});
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "combined log file exist err - get request", req.originalUrl, req.body, {}, 'api',  __filename);
    next(err);
    return;
  }
};

exports.getAllApiLogs = async (req, res, next) => {
  try {
    let logArr = [];
    const logs = await readLastLines.read(req.body.combinedfilePath, numberOfLines);
    const logObjs = logs.split('\n');

    logObjs.forEach(logObj => {
      if (logObj !== undefined && logObj !== null && logObj !== '') {
        logArr.unshift(JSON.parse(logObj))
      }
    });
    // console.log(logArr.length);
    res.render('logs/combinedLogs', {logArr});
    delete logArr;
    return;
  } catch (err) {
    helper.errorDetailsForControllers(err, "All combined api logs not working", req.originalUrl, req.body, {}, 'api',  __filename);
    next(err);
    return;
  }
};

exports.checkExceptionLogFileExist = (req, res, next) => {
  try {
    let expLogPathSplice = __dirname.split('/')
    expLogPathSplice.splice(-2);
    let expLogFile = `${expLogPathSplice.join('/')}/logs/exceptionErrLogs.log`;
    if (fs.existsSync(expLogFile)) {
      req.body.exceptionfilePath = expLogFile;
      next();
    } else {
      return res.status(400).json({ message: "exception log file does not exist!"});
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "exception log file exist err - middleware err", req.originalUrl, req.body, {}, 'api',  __filename);
    next(err);
    return;
  }
};

exports.getExceptionApiLogs = async (req, res, next) => {
  try {
    let logArr = [];
    const logs = await readLastLines.read(req.body.exceptionfilePath, numberOfLines);
    const logObjs = logs.split('\n');

    logObjs.forEach(logObj => {
      if (logObj !== undefined && logObj !== null && logObj !== '') {
        logArr.unshift(JSON.parse(logObj))
      }
    });
    // console.log(logArr.length);
    res.render('logs/ExceptionLogs', {logArr});
    delete logArr;
    return;
  } catch (err) {
    helper.errorDetailsForControllers(err, "exception log api err - get request", req.originalUrl, req.body, {}, 'api',  __filename);
    next(err);
    return;
  }
};

exports.checkRejectionLogFileExist = (req, res, next) => {
  try {
    let rejLogPathSplice = __dirname.split('/')
    rejLogPathSplice.splice(-2);
    let rejLogFile = `${rejLogPathSplice.join('/')}/logs/rejectionErrLogs.log`;
    if (fs.existsSync(rejLogFile)) {
      req.body.rejfilePath = rejLogFile;
      next();
    } else {
      return res.status(400).json({ message: "combined log file does not exist!"});
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "rejection log file exist err - get request", req.originalUrl, req.body, {}, 'api',  __filename);
    next(err);
    return;
  }
};

exports.getRejectionApiLogs = async (req, res, next) => {
  try {
    let logArr = [];
    const logs = await readLastLines.read(req.body.rejfilePath, numberOfLines);
    const logObjs = logs.split('\n');

    logObjs.forEach(logObj => {
      if (logObj !== undefined && logObj !== null && logObj !== '') {
        logArr.unshift(JSON.parse(logObj))
      }
    });
    // console.log(logArr.length);
    res.render('logs/rejectionLogs', {logArr});
    delete logArr;
    return;
  } catch (err) {
    helper.errorDetailsForControllers(err, "get rejection log api err", req.originalUrl, req.body, {}, 'api',  __filename);
    next(err);
    return;
  }
};