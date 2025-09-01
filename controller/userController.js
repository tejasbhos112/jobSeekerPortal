const db = require('../models');

exports.me = async (req, res) => {
  const user = await db.User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] },
    include: ['skills','experiences','educations','certifications','projects']
  });
  res.json(user);
};

exports.updateProfile = async (req, res) => {
  try {
    if (req.body.headline !== undefined) req.user.headline = req.body.headline;
    if (req.body.location !== undefined) req.user.location = req.body.location;
    if (req.body.phone !== undefined) req.user.phone = req.body.phone;
    if (req.body.sociallinks !== undefined) req.user.sociallinks = req.body.sociallinks;

    await req.user.save();
    
    res.json({message:"profile updated successfully!",data:user});
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
}

exports.uploadResume = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No resume uploaded' });
  req.user.resumePath = '/uploads/' + req.file.filename;
  await req.user.save();
  res.json({ message: 'Resume uploaded', path: req.user.resumePath });
};

exports.uploadPhoto = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No photo uploaded' });
  req.user.profilePicture = '/uploads/' + req.file.filename;
  await req.user.save();
  res.json({ message: 'Photo uploaded', path: req.user.profilePicture });
}