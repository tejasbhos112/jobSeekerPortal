const express = require('express');
const auth = require('../middleware/auth');
const ctrl = require('../controller/applicationController');
const companyAuth = require('../middleware/companyAuth');

const router = express.Router();


router.post('/jobs/:jobId/apply', auth, ctrl.applyToJob);


router.get('/my', auth, ctrl.listMyApplications);



router.put('/:applicationId/status', companyAuth, ctrl.updateStatus);


module.exports = router;