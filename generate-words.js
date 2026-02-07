#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Common 5-letter words for Wordle
const WORDS = [
  'about', 'above', 'abuse', 'actor', 'acute', 'admit', 'adopt', 'adult', 'after', 'again',
  'agent', 'agree', 'ahead', 'alarm', 'album', 'alert', 'align', 'alike', 'alive', 'allow',
  'alone', 'along', 'alter', 'among', 'anger', 'angle', 'angry', 'apart', 'apple', 'apply',
  'arena', 'argue', 'arise', 'array', 'aside', 'asset', 'audio', 'audit', 'avoid', 'award',
  'aware', 'badly', 'baker', 'bases', 'basic', 'basis', 'beach', 'began', 'begin', 'begun',
  'being', 'below', 'bench', 'billy', 'birth', 'black', 'blade', 'blame', 'blind', 'block',
  'blood', 'board', 'boost', 'booth', 'bound', 'brain', 'brand', 'bread', 'break', 'breed',
  'brief', 'bring', 'broad', 'broke', 'brown', 'build', 'built', 'buyer', 'cable', 'calif',
  'carry', 'catch', 'cause', 'chain', 'chair', 'chart', 'chase', 'cheap', 'check', 'chest',
  'chief', 'child', 'china', 'chose', 'civil', 'claim', 'class', 'clean', 'clear', 'click',
  'clock', 'close', 'coach', 'coast', 'could', 'count', 'court', 'cover', 'craft', 'crash',
  'cream', 'crime', 'cross', 'crowd', 'crown', 'crude', 'curve', 'cycle', 'daily', 'dance',
  'dated', 'dealt', 'death', 'debut', 'delay', 'delta', 'dense', 'depot', 'depth', 'doing',
  'doubt', 'dozen', 'draft', 'drama', 'drank', 'drawn', 'dream', 'dress', 'drill', 'drink',
  'drive', 'drove', 'dying', 'eager', 'early', 'earth', 'eight', 'elect', 'elite', 'empty',
  'enemy', 'enjoy', 'enter', 'entry', 'equal', 'error', 'event', 'every', 'exact', 'exist',
  'extra', 'faith', 'false', 'fault', 'fiber', 'field', 'fifth', 'fifty', 'fight', 'final',
  'first', 'fixed', 'flash', 'fleet', 'floor', 'fluid', 'focus', 'force', 'forth', 'forty',
  'forum', 'found', 'frame', 'frank', 'fraud', 'fresh', 'front', 'fruit', 'fully', 'funny',
  'giant', 'given', 'glass', 'globe', 'going', 'grace', 'grade', 'grand', 'grant', 'grass',
  'great', 'green', 'gross', 'group', 'grown', 'guard', 'guess', 'guest', 'guide', 'happy',
  'harry', 'heart', 'heavy', 'hence', 'henry', 'horse', 'hotel', 'house', 'human', 'ideal',
  'image', 'imply', 'index', 'inner', 'input', 'issue', 'japan', 'jimmy', 'joint', 'jones',
  'judge', 'known', 'label', 'large', 'laser', 'later', 'laugh', 'layer', 'learn', 'lease',
  'least', 'leave', 'legal', 'lemon', 'level', 'lewis', 'light', 'limit', 'links', 'lives',
  'local', 'logic', 'loose', 'lower', 'lucky', 'lunch', 'lying', 'magic', 'major', 'maker',
  'march', 'maria', 'match', 'maybe', 'mayor', 'meant', 'media', 'metal', 'might', 'minor',
  'minus', 'mixed', 'model', 'money', 'month', 'moral', 'motor', 'mount', 'mouse', 'mouth',
  'movie', 'music', 'needs', 'never', 'newly', 'night', 'noise', 'north', 'noted', 'novel',
  'nurse', 'occur', 'ocean', 'offer', 'often', 'order', 'other', 'ought', 'paint', 'panel',
  'paper', 'party', 'peace', 'peter', 'phase', 'phone', 'photo', 'piano', 'piece', 'pilot',
  'pitch', 'place', 'plain', 'plane', 'plant', 'plate', 'point', 'pound', 'power', 'press',
  'price', 'pride', 'prime', 'print', 'prior', 'prize', 'proof', 'proud', 'prove', 'queen',
  'quick', 'quiet', 'quite', 'radio', 'raise', 'range', 'rapid', 'ratio', 'reach', 'ready',
  'refer', 'right', 'rival', 'river', 'robin', 'roger', 'roman', 'rough', 'round', 'route',
  'royal', 'rural', 'scale', 'scene', 'scope', 'score', 'sense', 'serve', 'seven', 'shall',
  'shape', 'share', 'sharp', 'sheet', 'shelf', 'shell', 'shift', 'shine', 'shirt', 'shock',
  'shoot', 'short', 'shown', 'sight', 'since', 'sixth', 'sixty', 'sized', 'skill', 'sleep',
  'slide', 'small', 'smart', 'smile', 'smith', 'smoke', 'solid', 'solve', 'sorry', 'sound',
  'south', 'space', 'spare', 'speak', 'speed', 'spend', 'spent', 'split', 'spoke', 'sport',
  'staff', 'stage', 'stake', 'stand', 'start', 'state', 'steam', 'steel', 'stick', 'still',
  'stock', 'stone', 'stood', 'store', 'storm', 'story', 'strip', 'stuck', 'study', 'stuff',
  'style', 'sugar', 'suite', 'super', 'sweet', 'table', 'taken', 'taste', 'taxes', 'teach',
  'teeth', 'terry', 'texas', 'thank', 'theft', 'their', 'theme', 'there', 'these', 'thick',
  'thing', 'think', 'third', 'those', 'three', 'threw', 'throw', 'tight', 'times', 'title',
  'today', 'topic', 'total', 'touch', 'tough', 'tower', 'track', 'trade', 'train', 'treat',
  'trend', 'trial', 'tried', 'tries', 'truck', 'truly', 'trust', 'truth', 'twice', 'under',
  'undue', 'union', 'unity', 'until', 'upper', 'upset', 'urban', 'usage', 'usual', 'valid',
  'value', 'video', 'virus', 'visit', 'vital', 'vocal', 'voice', 'waste', 'watch', 'water',
  'wheel', 'where', 'which', 'while', 'white', 'whole', 'whose', 'woman', 'women', 'world',
  'worry', 'worse', 'worst', 'worth', 'would', 'wound', 'write', 'wrong', 'wrote', 'young',
  'youth', 'zones'
];

// Shuffle array using Fisher-Yates algorithm
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate 10 years of daily words starting from today
const START_DATE = new Date('2026-02-07T00:00:00-08:00'); // PST
const DAYS = 365 * 10 + 3; // 10 years + 3 leap days

// Create a pool of randomized words (repeat as needed to cover all days)
const repeats = Math.ceil(DAYS / WORDS.length);
const wordPool = [];
for (let i = 0; i < repeats; i++) {
  wordPool.push(...shuffle(WORDS));
}

const wordList = [];

for (let i = 0; i < DAYS; i++) {
  const date = new Date(START_DATE);
  date.setDate(date.getDate() + i);
  
  const dateStr = date.toISOString().split('T')[0];
  const word = wordPool[i].toUpperCase();
  
  wordList.push({ date: dateStr, word });
}

// Write to JSON file
const outputPath = path.join(__dirname, 'words.json');
fs.writeFileSync(outputPath, JSON.stringify(wordList, null, 2));

console.log(`Generated ${wordList.length} words (${(wordList.length / 365).toFixed(1)} years)`);
console.log(`Saved to ${outputPath}`);
