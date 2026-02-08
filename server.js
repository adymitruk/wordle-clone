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
  let dateStr;
  
  if (pretendDate) {
    dateStr = pretendDate;
  } else {
    // Get current date in PST timezone
    const now = new Date();
    const pstDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    const year = pstDate.getFullYear();
    const month = String(pstDate.getMonth() + 1).padStart(2, '0');
    const day = String(pstDate.getDate()).padStart(2, '0');
    dateStr = `${year}-${month}-${day}`;
  }
  
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
  
  // Inject date
  html = html.replace('<p id="date"></p>', `<p id="date">${formatDate(date)}</p>`);
  
  res.send(html);
});

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00-08:00'); // Noon PST to avoid timezone issues
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone: 'America/Los_Angeles'
  });
}

// Static files (after root route)
app.use(BASE_PATH, express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Wordle server running on port ${PORT}`);
  if (BASE_PATH) {
    console.log(`Base path: ${BASE_PATH}`);
  }
});
