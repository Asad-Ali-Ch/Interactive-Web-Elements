//  GLOBAL STATE & DOM MUTATION TRACKER

let totalInteractions = 0;
let totalMutations    = 0;

const domCount        = document.getElementById('dom-count');
const pulseDot        = document.getElementById('pulse-dot');
const heroInteractions = document.getElementById('hero-interactions');
const heroMutations   = document.getElementById('hero-mutations');
const domTextEl       = document.querySelector('.dom-text');

function registerMutation(description) {
  totalMutations++;
  totalInteractions++;
  domCount.textContent        = totalMutations + ' mutation' + (totalMutations !== 1 ? 's' : '');
  heroInteractions.textContent = totalInteractions;
  heroMutations.textContent   = totalMutations;
  domTextEl.innerHTML         = '<strong>DOM</strong> · ' + description;

  // Pulse animation — remove and re-add class to restart
  pulseDot.classList.remove('pulse');
  void pulseDot.offsetWidth; // force reflow
  pulseDot.classList.add('pulse');
}


// ══════════════════════════════════════════
//  COMPONENT 1 — DARK MODE TOGGLE
// ══════════════════════════════════════════
const themeToggle = document.getElementById('theme-toggle');
const themeLabel  = document.getElementById('theme-label');
const themeThumb  = document.getElementById('theme-thumb');

let isDark = false;

themeToggle.addEventListener('click', function () {
  isDark = !isDark;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  themeToggle.classList.toggle('active', isDark);
  themeLabel.textContent = isDark ? 'Dark' : 'Light';
  themeThumb.textContent = isDark ? '☀️' : '🌙';
  registerMutation('data-theme → "' + (isDark ? 'dark' : 'light') + '" on &lt;html&gt;');
});


// ══════════════════════════════════════════
//  COMPONENT 2 — CLICK COUNTER
// ══════════════════════════════════════════
const countDisplay = document.getElementById('count-display');
let count = 0;

function setCount(n) {
  count = n;
  countDisplay.textContent = count;

  // Reset classes then re-apply
  countDisplay.classList.remove('bump', 'red', 'green');
  void countDisplay.offsetWidth; // force reflow to restart animation
  countDisplay.classList.add('bump');

  if (count < 0) countDisplay.classList.add('red');
  if (count > 0) countDisplay.classList.add('green');

  registerMutation('counter.textContent → ' + count);
}

document.getElementById('btn-inc').addEventListener('click', () => setCount(count + 1));
document.getElementById('btn-dec').addEventListener('click', () => setCount(count - 1));
document.getElementById('btn-reset').addEventListener('click', () => setCount(0));


// ══════════════════════════════════════════
//  COMPONENT 3 — LIVE WRITER
// ══════════════════════════════════════════
const charTextarea = document.getElementById('char-textarea');
const charCount    = document.getElementById('char-count');
const charWords    = document.getElementById('char-words');
const charBar      = document.getElementById('char-bar');
const MAX_CHARS    = 200;

charTextarea.addEventListener('input', function () {
  const len   = this.value.length;
  const words = this.value.trim() === '' ? 0 : this.value.trim().split(/\s+/).length;
  const pct   = (len / MAX_CHARS) * 100;

  charCount.textContent = len + ' / ' + MAX_CHARS;
  charWords.textContent = words + ' word' + (words !== 1 ? 's' : '');
  charBar.style.width   = pct + '%';

  charBar.classList.remove('warn', 'over');
  if (pct >= 100) charBar.classList.add('over');
  else if (pct >= 75) charBar.classList.add('warn');

  registerMutation('char-count.textContent → "' + len + '/' + MAX_CHARS + '"');
});

document.getElementById('btn-clear-text').addEventListener('click', function () {
  charTextarea.value = '';
  charTextarea.dispatchEvent(new Event('input'));
});


// ══════════════════════════════════════════
//  COMPONENT 4 — TASK MANAGER
// ══════════════════════════════════════════
const taskInput  = document.getElementById('task-input');
const taskList   = document.getElementById('task-list');
const taskStats  = document.getElementById('task-stats');
const btnAddTask = document.getElementById('btn-add-task');

let tasks = [
  { text: 'Study DOM manipulation',       done: false },
  { text: 'Build event listeners',        done: false },
  { text: 'Manage state with variables',  done: false }
];

function renderTasks() {
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    taskStats.textContent = 'No tasks yet';
    return;
  }

  tasks.forEach(function (task, i) {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.done ? ' done' : '');

    // Checkbox button
    const checkBtn = document.createElement('button');
    checkBtn.className   = 'task-check';
    checkBtn.textContent = task.done ? '✓' : '';
    checkBtn.setAttribute('aria-label', 'Toggle task');
    checkBtn.addEventListener('click', function () {
      tasks[i].done = !tasks[i].done;
      renderTasks();
      registerMutation('task[' + i + '].classList → "' + (tasks[i].done ? 'done' : 'active') + '"');
    });

    // Text span
    const span = document.createElement('span');
    span.className   = 'task-text';
    span.textContent = task.text;

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className   = 'task-del';
    delBtn.textContent = '✕';
    delBtn.setAttribute('aria-label', 'Delete task');
    delBtn.addEventListener('click', function () {
      tasks.splice(i, 1);
      renderTasks();
      registerMutation('task-list → removed "' + task.text.slice(0, 20) + '"');
    });

    li.appendChild(checkBtn);
    li.appendChild(span);
    li.appendChild(delBtn);
    taskList.appendChild(li);
  });

  const done  = tasks.filter(t => t.done).length;
  const total = tasks.length;
  taskStats.textContent = done + ' of ' + total + ' task' + (total !== 1 ? 's' : '') + ' complete';
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;
  tasks.push({ text: text, done: false });
  taskInput.value = '';
  renderTasks();
  registerMutation('task-list → appendChild "' + text.slice(0, 24) + '"');
}

btnAddTask.addEventListener('click', addTask);
taskInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') addTask();
});

renderTasks(); // Initial render


// ══════════════════════════════════════════
//  COMPONENT 5 — ACCORDION FAQ
// ══════════════════════════════════════════
const accItems = document.querySelectorAll('.acc-item');

accItems.forEach(function (item) {
  const trigger = item.querySelector('.acc-trigger');

  trigger.addEventListener('click', function () {
    const isOpen = item.classList.contains('open');
    const idx    = item.dataset.index;

    // Close all panels first
    accItems.forEach(i => i.classList.remove('open'));

    // Open clicked one if it wasn't already open
    if (!isOpen) {
      item.classList.add('open');
      registerMutation('acc-item[' + idx + '].classList → "open"');
    } else {
      registerMutation('acc-item[' + idx + '].classList → closed');
    }
  });
});


// ══════════════════════════════════════════
//  COMPONENT 6 — COLOR THEME PICKER
// ══════════════════════════════════════════
const swatches     = document.querySelectorAll('.swatch');
const colorPreview = document.getElementById('color-preview');
const previewName  = document.getElementById('preview-name');
const previewHex   = document.getElementById('preview-hex');

swatches.forEach(function (swatch) {
  swatch.addEventListener('click', function () {
    // Deactivate all swatches
    swatches.forEach(s => s.classList.remove('active'));
    swatch.classList.add('active');

    const color = swatch.dataset.bg;
    const name  = swatch.dataset.name;

    // Update CSS custom property globally
    document.documentElement.style.setProperty('--teal', color);
    document.documentElement.style.setProperty('--teal2', color);

    colorPreview.style.background = color;
    previewName.textContent        = name;
    previewHex.textContent         = color + ' · Active accent color';

    registerMutation('--teal CSS var → "' + color + '" (' + name + ')');
  });
});
