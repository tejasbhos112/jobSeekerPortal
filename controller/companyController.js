const db = require('../models');

exports.me = async (req, res) => {
  const company = await db.Company.findByPk(req.company.id, {
    attributes: { exclude: ['password'] },
    include: [{ model: db.Job, as: 'jobs' }]
  });
  res.json(company);
};

exports.updateProfile = async (req, res) => {
  try {
    
    if (req.body.name !== undefined) req.company.name = req.body.name;
    if (req.body.description !== undefined) req.company.description = req.body.description;
    if (req.body.website !== undefined) req.company.website = req.body.website;
    if (req.body.location !== undefined) req.company.location = req.body.location;

    await req.company.save();
    res.json({ message: 'Profile updated', company: req.company });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};

exports.uploadLogo = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No logo uploaded' });
  req.company.logo = '/uploads/' + req.file.filename;
  await req.company.save();
  res.json({ message: 'Logo uploaded', path: req.company.logo });
};

exports.createJob = async (req, res) => {
  const { title, description, location, salary, type, requirements, deadline } = req.body;
  if (!title || !description)
    return res.status(400).json({ error: 'title and description required' });

  const job = await db.Job.create({
    title, description, location, salary, type, requirements, deadline,
    companyId: req.company.id
  });
  res.status(201).json(job);
};

exports.listMyJobs = async (req, res) => {
  const jobs = await db.Job.findAll({ where: { companyId: req.company.id } });
  res.json(jobs);
};