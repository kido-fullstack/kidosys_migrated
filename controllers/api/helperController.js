const fs = require("fs");
const path = require('path');
const helper = require('../../handlers/helper');

exports.test = (req, res, next) => {
  return res.json({
    message: 'helper API working'
  })
};

exports.removePDFromEntirely = (req, res, next) => {
  try {
    let filePath = path.join(__dirname, '..', '..', 'public', 'admin', 'uploads', 'pdf', `${req.body.file}.pdf`);

    fs.unlink(filePath, (err, data) => {
      if (err) {
        helper.errorDetailsForControllers(err, "remove pdf from common file - post request", req.originalUrl, req.body, {}, "api", __filename);
        next(err);
        return;
      }
      return res.status(200).json({
        message: 'success',
        code: 200
      })
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "remove pdf from common file - post request", req.originalUrl, req.body, {}, "api", __filename);
    next(err);
    return;
  }
};