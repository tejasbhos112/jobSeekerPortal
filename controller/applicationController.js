

const db = require('../models');
const sendMail = require('../utils/mailer');

exports.applyToJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;

    // Check if job exists
    const job = await db.Job.findByPk(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Check if user has uploaded a resume
    if (!req.user.resumePath) {
      return res.status(400).json({ error: 'Please upload your resume before applying.' });
    }

    // Prevent duplicate applications
    const alreadyApplied = await db.Application.findOne({
      where: { userId: req.user.id, jobId }
    });
    if (alreadyApplied) return res.status(400).json({ error: 'Already applied to this job' });

    // Create application with resume path
    const application = await db.Application.create({
      userId: req.user.id,
      jobId,
      resumePath: req.user.resumePath
    });

    // Send confirmation email to user
    sendMail(
      req.user.email,
      'Job Application Submitted',
      `Hi ${req.user.username},\n\nYou have successfully applied for the job: ${job.title}.\n\nThank you for using Job Portal!`
    ).catch(console.error);

    res.status(201).json({ message: 'Applied successfully', application });
  } catch (err) {
    res.status(500).json({ error: 'Could not apply to job' });
  }

};

exports.listMyApplications = async (req, res) => {
  try {
    const applications = await db.Application.findAll({
      where: { userId: req.user.id },
      include: [{ model: db.Job, as: 'job', include: [{ model: db.Company, as: 'company', attributes: { exclude: ['password'] } }] }]
    });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch applications' });
  }
};



exports.updateStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const allowed = ['applied', 'interview', 'rejected', 'hired'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const application = await db.Application.findByPk(applicationId, {
      include: [
        { model: db.Job, as: 'job' },
        { model: db.User, as: 'user' }
      ]
    });
    if (!application) return res.status(404).json({ error: 'Application not found' });

    // Check if the logged-in company owns the job
    if (application.job.companyId !== req.company.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    application.status = status;
    await application.save();

    // Send notification email to user
    if (application.user && application.user.email) {
      console.log('User email:', application.user && application.user.email);
      await sendMail(
        application.user.email,
        `Your application status for ${application.job.title} has been updated`,
        `Hello ${application.user.username},\n\nYour application status is now: ${status}.\n\nRegards,\n${application.job.companyId}`
      );
    }

    res.json({ message: 'Status updated and user notified', application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update status' });
  }
};