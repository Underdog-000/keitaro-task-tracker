let tasks = [];

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

function createTask() {
  const name = document.getElementById('testName').value;
  const campaign = document.getElementById('campaignSelect').value;
  const time = new Date().toLocaleTimeString();

  const task = { name, campaign, time, done: false };
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
  const workingEl = document.getElementById('workingTasks');
  const doneEl = document.getElementById('doneTasks');
  workingEl.innerHTML = '';
  doneEl.innerHTML = '';

  tasks.forEach((task, i) => {
    const el = document.createElement('div');
    el.className = 'task-card';
    el.innerHTML = `
      <div><b>${task.name}</b><br/>${task.campaign}</div>
      <div class="actions">
        ${task.done ? `🕒 ${task.time} → ${task.endTime}` 
                    : `<button onclick="completeTask(${i})">Завершить</button>`}
      </div>
    `;
    task.done ? doneEl.appendChild(el) : workingEl.appendChild(el);
  });
}

function toggleColumn(id) {
  const el = document.getElementById(id);
  el.style.display = el.style.display === 'none' ? 'flex' : 'none';
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
