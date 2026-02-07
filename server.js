const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_PATH = process.env.BASE_PATH || '';

// Load words
const words = JSON.parse(fs.readFileSync(path.join(__dirname, 'words.json'), 'utf8'));

// Get today's word based on server timezone (America/Los_Angeles)
function getTodaysWord(pretendDate) {
  let targetDate;
  if (pretendDate) {
    targetDate = new Date(pretendDate + 'T00:00:00-08:00');
  } else {
    targetDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  }
  
  const dateStr = targetDate.toISOString().split('T')[0];
  const entry = words.find(w => w.date === dateStr);
  
  return entry || { word: 'ERROR', date: dateStr };
}

// Home page - render with today's word embedded (must be before static)
app.get(BASE_PATH + '/', (req, res) => {
  const pretendDate = req.query.pretendDate;
  const { word, date } = getTodaysWord(pretendDate);
  
  let html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
  
  // Inject word into hidden field
  html = html.replace('id="target-word" value=""', `id="target-word" value="${word}"`);
  
  res.send(html);
});

// Static files (after root route)
app.use(BASE_PATH, express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Wordle server running on port ${PORT}`);
  if (BASE_PATH) {
    console.log(`Base path: ${BASE_PATH}`);
  }
});
