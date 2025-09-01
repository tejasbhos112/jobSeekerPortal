const express = require('express');
const companyAuth = require('../middleware/companyAuth');
const ctrl = require('../controller/companyController');
const upload = require('../utils/upload');

const router = express.Router();

router.get('/me', companyAuth, ctrl.me);
router.put('/me', companyAuth, ctrl.updateProfile);
router.post('/logo', companyAuth, upload.single('logo'), ctrl.uploadLogo);

router.post('/jobs', companyAuth, ctrl.createJob);
router.get('/jobs', companyAuth, ctrl.listMyJobs);

module.exports = router;