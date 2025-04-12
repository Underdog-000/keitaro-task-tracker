
let tasks = [];
let currentTask = null;

function openModal() {
  document.getElementById('taskModal').classList.remove('hidden');
}
function closeModal() {
  document.getElementById('taskModal').classList.add('hidden');
}
function openSettings() {
  document.getElementById('settingsModal').classList.remove('hidden');
}
function closeSettings() {
  document.getElementById('settingsModal').classList.add('hidden');
}

function startTask() {
  const name = document.getElementById('testName').value;
  const campaign = document.getElementById('campaignSelect').value;
  const startTime = new Date().toLocaleTimeString();

  const task = { name, campaign, startTime, done: false };
  tasks.push(task);
  renderTasks();
  closeModal();
}

function completeTask(index) {
  tasks[index].done = true;
  tasks[index].endTime = new Date().toLocaleTimeString();
  renderTasks();
}

function renderTasks() {
  const activeEl = document.getElementById('active-tasks');
  const doneEl = document.getElementById('done-tasks');
  activeEl.innerHTML = '';
  doneEl.innerHTML = '';

  tasks.forEach((task, index) => {
    const el = document.createElement('div');
    el.textContent = `${task.name} (${task.campaign}) [${task.startTime}]`;

    if (task.done) {
      el.textContent += ` → ${task.endTime}`;
      doneEl.appendChild(el);
    } else {
      const btn = document.createElement('button');
      btn.textContent = 'Завершить';
      btn.onclick = () => completeTask(index);
      el.appendChild(btn);
      activeEl.appendChild(el);
    }
  });
}

function saveApiKey() {
  const key = document.getElementById('apiKeyInput').value;
  localStorage.setItem('keitaro_api_key', key);
  alert('Ключ сохранён');
}

function logout() {
  localStorage.removeItem('keitaro_api_key');
  alert('Вы вышли');
}
