const db = require('../models');
const { Op } = require('sequelize');

exports.listAllJobs = async (req, res) => {
  const jobs = await db.Job.findAll({
    include: [{ model: db.Company, as: 'company', attributes: { exclude: ['password'] } }]
  });
  res.json(jobs);
};

exports.getJob = async (req, res) => {
  const job = await db.Job.findByPk(req.params.id, {
    include: [{ model: db.Company, as: 'company', attributes: { exclude: ['password'] } }]
  });
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
};

exports.searchJobs = async (req, res) => {
  try {
    const { search, location, type, minSalary, maxSalary } = req.query;
    const where = {};

    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }
    if (location) {
      where.location = { [Op.like]: `%${location}%` };
    }
    if (type) {
      where.type = type;
    }
    if (minSalary) {
      where.salary = { ...(where.salary || {}), [Op.gte]: minSalary };
    }
    if (maxSalary) {
      where.salary = { ...(where.salary || {}), [Op.lte]: maxSalary };
    }

    const jobs = await db.Job.findAll({
      where,
      include: [{ model: db.Company, as: 'company', attributes: { exclude: ['password'] } }]
    });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Could not search jobs' });
  }
};

