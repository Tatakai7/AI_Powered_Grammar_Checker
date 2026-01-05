const express = require('express');
const { analyzeText, getSynonyms } = require('../nlp/analyzer');

const router = express.Router();

// Analyze text
router.post('/', async (req, res) => {
  try {
    const { text } = req.body;
    const errors = await analyzeText(text);
    res.json({ errors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get synonyms
router.get('/synonyms/:word', async (req, res) => {
  try {
    const { word } = req.params;
    const synonyms = await getSynonyms(word);
    res.json({ synonyms });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
