const express = require('express');
const router = express.Router();
const accountController = require('../../../controllers/admin/accountController');
const courseController = require('../../../controllers/admin/courseController');

router.get('/all',
  courseController.allCourses
);

router.get('/add',
  courseController.getAddCourse
);

router.post('/add',
  courseController.postAddCourse
);

router.get('/edit/:course_id',
  courseController.getEditCourse
);

router.post('/edit/:course_id',
  courseController.postEditCourse
);

module.exports = router;