const mongoose = require('mongoose');
const moment = require('moment');
const { IncomingForm } = require('formidable');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const uuid = require('uuid');
const Media = mongoose.model('Media')
const helper = require('../../handlers/helper');

exports.test = async (req, res, next) => {
  res.send('hey');
};

// exports.getMediaPagee = async (req, res, next) => {
//   try {
//     let perPage = 80;
//     let page = req.query.page || 1;
//     let medias = await Media.find({
//       file_type: {
//         $regex: "image",
//         $options: "$i"
//       }
//     })
//     .sort({
//       createdAt: req.responseAdmin.DESC
//     })
//     .skip(perPage * page - perPage)
//     .limit(perPage);

//     let count = await Media.countDocuments({
//       file_type: {
//         $regex: "image",
//         $options: "$i"
//       }
//     });
//     return res.render('admin/all-media', {
//       title: 'All Media',
//       medias,
//       moment,
//       current: page,
//       pages: Math.ceil(count / perPage)
//     })
//   } catch (err) {
//     helper.errorDetailsForControllers(err, "getMediaPage not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
//     next(err);
//     return;
//   }
// };

exports.getMediaPage = async (req, res, next) => {
  try {
    let perPage = 80;
    let page = req.query.page || 1;
    let medias = await Media.find({})
    .sort({
      createdAt: req.responseAdmin.DESC
    })
    .skip(perPage * page - perPage)
    .limit(perPage);

    let count = await Media.countDocuments();
    return res.render('admin/all-media', {
      title: 'All Media',
      medias,
      moment,
      current: page,
      pages: Math.ceil(count / perPage)
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "getMediaPage not working - get request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};


exports.storeMediaToDB = async (req, res, next) => {
  try {
    let mediaForm = new IncomingForm();
    mediaForm.parse(req, function (err, fields, files) {});
    mediaForm.on('end', function (fields, files) {
      for (let x in this.openedFiles) {
        let name = `${this.openedFiles[x].originalFilename.split('.').shift()}~${crypto.randomBytes(2).toString('hex')}.${this.openedFiles[x].originalFilename.split('.').pop()}`;
        let dest = `./public/uploads/${name}`;
        let data = fs.readFileSync(this.openedFiles[x].filepath);
        fs.writeFileSync(dest, data);
        // fs.unlinkSync(this.openedFiles[x].filepath);
        let img = new Media({
          file_size: this.openedFiles[x].size,
          file_type: this.openedFiles[x].mimetype,
          file_name: `${req.config.siteHeader}://${req.headers.host}/uploads/${name}`,
          file_extension:  this.openedFiles[x].originalFilename.split('.').pop(),
          og_file_name: this.openedFiles[x].originalFilename.split('.').shift()
        });
        img.save()
          .then(done => res.status(200).json(done))
          .catch(e => next(e));
      }
    })
  } catch (err) {
    helper.errorDetailsForControllers(err, "storeMediaToDB not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

const deleteFromFile = (filePath) => {
  return fs.promises.unlink(filePath)
    .then(() => {
      Promise.resolve(`File deleted successfully`);
      return;
    })
    .catch(() => {
      Promise.reject(`Error deleting file`);
      return;
    })
};

exports.deleteFile = async (req, res, next) => {
  try {
    const media = await Media.findOne({ _id: req.body.id });
    if (media) {
      const removeMedia = await Media.findOneAndRemove({
        _id: req.body.id
      }).exec((err, result) => {
        if (err) {
          return res.status(400).json({
            message: req.responseAdmin.SOMETHING_ERR,
            data: null,
            code: 400
          })
        }
        const filePath = path.join(__dirname, "..", "..", "/public/uploads", `${media.file_name.split("/").pop()}`);
        deleteFromFile(filePath)
          .then(result => {
            return res.status(200).json({
              message: req.responseAdmin.FILE_DELETED,
              data: null,
              code: 200
            })
          })
          .catch(err => {
            return res.status(400).json({
              message: req.responseAdmin.SOMETHING_ERR,
              data: null,
              code: 400
            })
          })
      })
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "deleteFile not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};

exports.getLists = async (req, res, next) => {
  try {
    let perPage = 35;
    let page = req.query.page || 1;

    if (req.query.s) {
      // let data = await Media.find({
      //   file_type: { $regex: req.query.file_type, $options: '$i' },
      //   file_name: { $regex: req.query.s, $options: '$i' },
      // })
      let data = await Media.find({
        file_name: { $regex: req.query.s, $options: 'i' },
      })
        .skip(perPage * page - perPage)
        .limit(perPage)
        .sort({ createdAt: req.responseAdmin.DESC });
      let count = await Media.countDocuments({
        file_type: { $regex: req.query.file_type, $options: 'i' },
        file_name: { $regex: req.query.s, $options: 'i' },
			});
      let re = {
        current: req.query.page,
        total: count,
        data: data,
        page: Math.ceil(count / perPage),
      };
      res.send(re);
    } else {
      // let data = await Media.find({ file_type: { $regex: req.query.file_type, $options: '$i' } })
      let data = await Media.find()
        .skip(perPage * page - perPage)
        .limit(perPage)
        .sort({ createdAt: req.responseAdmin.DESC });
      let count = await Media.countDocuments({ file_type: { $regex: req.query.file_type, $options: 'i' } });
      let re = {
        current: req.query.page,
        total: count,
        data: data,
        page: Math.ceil(count / perPage),
      };
      res.send(re);
    }
  } catch (err) {
    helper.errorDetailsForControllers(err, "getLists not working - post request", req.originalUrl, req.body, {}, "redirect", __filename);
    next(err);
    return;
  }
};