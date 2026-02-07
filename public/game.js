// Game state
let targetWord = '';
let currentRow = 0;
let currentTile = 0;
let gameOver = false;
const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

// Letter tracking for keyboard
const letterStatus = {};

// Keyboard layout
const KEYBOARD = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
];

// Initialize game
async function init() {
  try {
    // Get pretendDate from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const pretendDate = urlParams.get('pretendDate');
    
    // Use relative path to work with BASE_PATH
    const url = pretendDate ? `api/word?pretendDate=${pretendDate}` : 'api/word';
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      showMessage('Error loading word: ' + data.error, false);
      return;
    }
    
    targetWord = data.word;
    document.getElementById('target-word').value = targetWord;
    document.getElementById('date').textContent = formatDate(data.date);
    
    createBoard();
    createKeyboard();
    
    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyPress);
  } catch (err) {
    showMessage('Error loading game: ' + err.message, false);
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

function createBoard() {
  const board = document.getElementById('game-board');
  board.innerHTML = '';
  
  for (let i = 0; i < MAX_GUESSES; i++) {
    const row = document.createElement('div');
    row.className = 'row';
    row.id = `row-${i}`;
    
    for (let j = 0; j < WORD_LENGTH; j++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.id = `tile-${i}-${j}`;
      row.appendChild(tile);
    }
    
    board.appendChild(row);
  }
}

function createKeyboard() {
  const keyboard = document.getElementById('keyboard');
  keyboard.innerHTML = '';
  
  KEYBOARD.forEach(row => {
    const keyboardRow = document.createElement('div');
    keyboardRow.className = 'keyboard-row';
    
    row.forEach(key => {
      const button = document.createElement('button');
      button.className = 'key';
      button.textContent = key;
      button.dataset.key = key;
      
      if (key === 'ENTER' || key === 'BACK') {
        button.classList.add('wide');
      }
      
      button.addEventListener('click', () => handleKeyClick(key));
      keyboardRow.appendChild(button);
    });
    
    keyboard.appendChild(keyboardRow);
  });
}

function handleKeyPress(e) {
  if (gameOver) return;
  
  const key = e.key.toUpperCase();
  
  if (key === 'ENTER') {
    handleKeyClick('ENTER');
  } else if (key === 'BACKSPACE') {
    handleKeyClick('BACK');
  } else if (/^[A-Z]$/.test(key)) {
    handleKeyClick(key);
  }
}

function handleKeyClick(key) {
  if (gameOver) return;
  
  if (key === 'ENTER') {
    submitGuess();
  } else if (key === 'BACK') {
    deleteLetter();
  } else {
    addLetter(key);
  }
}

function addLetter(letter) {
  if (currentTile < WORD_LENGTH) {
    const tile = document.getElementById(`tile-${currentRow}-${currentTile}`);
    tile.textContent = letter;
    tile.classList.add('filled');
    currentTile++;
  }
}

function deleteLetter() {
  if (currentTile > 0) {
    currentTile--;
    const tile = document.getElementById(`tile-${currentRow}-${currentTile}`);
    tile.textContent = '';
    tile.classList.remove('filled');
  }
}

function submitGuess() {
  if (currentTile !== WORD_LENGTH) {
    showMessage('Not enough letters', false);
    return;
  }
  
  // Get current guess
  const guess = [];
  for (let i = 0; i < WORD_LENGTH; i++) {
    const tile = document.getElementById(`tile-${currentRow}-${i}`);
    guess.push(tile.textContent);
  }
  const guessWord = guess.join('');
  
  // Check guess
  checkGuess(guessWord);
}

function checkGuess(guess) {
  const result = [];
  const targetLetters = targetWord.split('');
  const guessLetters = guess.split('');
  
  // First pass: mark correct letters
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      result[i] = 'correct';
      targetLetters[i] = null;
      guessLetters[i] = null;
    }
  }
  
  // Second pass: mark present letters
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessLetters[i] !== null) {
      const index = targetLetters.indexOf(guessLetters[i]);
      if (index !== -1) {
        result[i] = 'present';
        targetLetters[index] = null;
      } else {
        result[i] = 'absent';
      }
    }
  }
  
  // Animate tiles
  for (let i = 0; i < WORD_LENGTH; i++) {
    const tile = document.getElementById(`tile-${currentRow}-${i}`);
    const letter = guess[i];
    
    setTimeout(() => {
      tile.classList.add(result[i]);
      
      // Update keyboard
      updateKeyboard(letter, result[i]);
    }, i * 200);
  }
  
  // Check win/lose
  setTimeout(() => {
    if (guess === targetWord) {
      showMessage('Excellent! You got it!', true);
      gameOver = true;
    } else if (currentRow === MAX_GUESSES - 1) {
      showMessage(`Game over! The word was ${targetWord}`, false);
      gameOver = true;
    } else {
      currentRow++;
      currentTile = 0;
    }
  }, WORD_LENGTH * 200 + 200);
}

function updateKeyboard(letter, status) {
  // Priority: correct > present > absent
  const currentStatus = letterStatus[letter];
  
  if (currentStatus === 'correct') return;
  if (currentStatus === 'present' && status === 'absent') return;
  
  letterStatus[letter] = status;
  
  const key = document.querySelector(`[data-key="${letter}"]`);
  if (key) {
    key.classList.remove('correct', 'present', 'absent');
    key.classList.add(status);
  }
}

function showMessage(text, isWin) {
  const message = document.getElementById('message');
  message.textContent = text;
  message.classList.remove('hidden', 'win', 'lose');
  
  if (isWin) {
    message.classList.add('win');
  } else if (gameOver) {
    message.classList.add('lose');
  }
  
  if (!gameOver) {
    setTimeout(() => {
      message.classList.add('hidden');
    }, 2000);
  }
}

// Start game
init();
