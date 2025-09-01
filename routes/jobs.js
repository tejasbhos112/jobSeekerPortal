const express = require('express');
const ctrl = require('../controller/jobController');

const router = express.Router();

// List all jobs with company info
router.get('/', ctrl.listAllJobs);


// Search/filter jobs
router.get('/search', ctrl.searchJobs);


// Get job details by id
router.get('/:id', ctrl.getJob);




module.exports = router;