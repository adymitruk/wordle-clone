const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Load words
const words = JSON.parse(fs.readFileSync(path.join(__dirname, 'words.json'), 'utf8'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Get today's word based on server timezone (America/Los_Angeles)
app.get('/api/word', (req, res) => {
  try {
    // Check for pretendDate parameter
    let targetDate;
    if (req.query.pretendDate) {
      targetDate = new Date(req.query.pretendDate + 'T00:00:00-08:00');
    } else {
      targetDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    }
    
    const dateStr = targetDate.toISOString().split('T')[0];
    
    // Find word for this date
    const entry = words.find(w => w.date === dateStr);
    
    if (!entry) {
      return res.status(404).json({ error: 'No word found for this date' });
    }
    
    res.json({ word: entry.word, date: dateStr });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Wordle server running on port ${PORT}`);
});
