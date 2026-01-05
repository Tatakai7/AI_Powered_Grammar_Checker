const express = require('express');
const Document = require('../models/Document');
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

// Get all documents for user
router.get('/', authenticate, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user.userId }).sort({ updatedAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create document
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, content } = req.body;
    const document = new Document({ title, content, userId: req.user.userId });
    await document.save();

    // Create initial version
    const version = new DocumentVersion({
      documentId: document._id,
      content,
      versionNumber: 1,
    });
    await version.save();

    res.status(201).json(document);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update document
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, content } = req.body;
    const document = await Document.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { title, content, updatedAt: new Date() },
      { new: true }
    );
    if (!document) return res.status(404).json({ error: 'Document not found' });

    // Create new version
    const lastVersion = await DocumentVersion.findOne({ documentId: req.params.id }).sort({ versionNumber: -1 });
    const versionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;
    const version = new DocumentVersion({
      documentId: req.params.id,
      content,
      versionNumber,
    });
    await version.save();

    res.json(document);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete document
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await Document.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    await DocumentVersion.deleteMany({ documentId: req.params.id });
    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
