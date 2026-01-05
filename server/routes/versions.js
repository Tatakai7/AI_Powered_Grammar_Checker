const express = require('express');
const DocumentVersion = require('../models/DocumentVersion');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to verify token
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Get versions for document
router.get('/:documentId', authenticate, async (req, res) => {
  try {
    const versions = await DocumentVersion.find({ documentId: req.params.documentId }).sort({ versionNumber: -1 });
    res.json(versions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Restore version (create new version with old content)
router.post('/:documentId/restore/:versionId', authenticate, async (req, res) => {
  try {
    const version = await DocumentVersion.findById(req.params.versionId);
    if (!version) return res.status(404).json({ error: 'Version not found' });

    const lastVersion = await DocumentVersion.findOne({ documentId: req.params.documentId }).sort({ versionNumber: -1 });
    const versionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

    const newVersion = new DocumentVersion({
      documentId: req.params.documentId,
      content: version.content,
      versionNumber,
    });
    await newVersion.save();

    res.json(newVersion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
