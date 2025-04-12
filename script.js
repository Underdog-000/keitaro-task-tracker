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

// 📥 Сохранить API ключ
function saveApiKey() {
  const key = document.getElementById('apiKeyInput').value;
  localStorage.setItem('keitaro_api_key', key);
  alert('Ключ сохранён');
  closeSettings();
  fetchCampaigns();
}

// 🔓 Выйти / удалить ключ
function logout() {
  localStorage.removeItem('keitaro_api_key');
  alert('Ключ удалён');
  document.getElementById('campaignSelect').innerHTML = '<option>Кампания 1</option>';
}

// 📋 Создать задачу
function createTask() {
  const name = document.getElementById('testName').value;
  const campaignId = document.getElementById('campaignSelect').value;
  const campaignName = document.getElementById('campaignSelect').selectedOptions[0].textContent;
  const time = new Date().toLocaleTimeString();

  const task = { name, campaignId, campaignName, time, done: false };
  tasks.push(task);
  renderTasks();
  closeModal();
}

// ✅ Завершить задачу
function completeTask(index) {
  tasks[index].done = true;
  tasks[index].endTime = new Date().toLocaleTimeString();
  renderTasks();
}

// 🧱 Отрисовка задач
function renderTasks() {
  const workingEl = document.getElementById('workingTasks');
  const doneEl = document.getElementById('doneTasks');
  workingEl.innerHTML = '';
  doneEl.innerHTML = '';

  tasks.forEach((task, i) => {
    const el = document.createElement('div');
    el.className = 'task-card';
    el.innerHTML = `
      <div><b>${task.name}</b><br/>${task.campaignName}</div>
      <div class="actions">
        ${task.done ? `🕒 ${task.time} → ${task.endTime}` 
                    : `<button onclick="completeTask(${i})">Завершить</button>`}
      </div>
    `;
    task.done ? doneEl.appendChild(el) : workingEl.appendChild(el);
  });
}

// ⬇️ Скрыть/раскрыть колонки
function toggleColumn(id) {
  const el = document.getElementById(id);
  el.style.display = el.style.display === 'none' ? 'flex' : 'none';
}

// 🌐 Получить список кампаний из serverless-функции
async function fetchCampaigns() {
  try {
    const res = await fetch('/api/campaigns');
    if (!res.ok) throw new Error("Ошибка API");
    const data = await res.json();

    const select = document.getElementById('campaignSelect');
    select.innerHTML = '';
    data.forEach(c => {
      const option = document.createElement('option');
      option.value = c.id;
      option.textContent = c.name;
      select.appendChild(option);
    });

  } catch (err) {
    alert("Ошибка при получении кампаний");
    console.error(err);
  }
}

// ▶️ Автозагрузка при старте страницы
window.addEventListener('DOMContentLoaded', () => {
  const storedKey = localStorage.getItem('keitaro_api_key');
  if (storedKey) {
    document.getElementById('apiKeyInput').value = storedKey;
    fetchCampaigns();
  }
});
