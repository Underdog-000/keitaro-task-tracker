let tasks = [];
let allCampaigns = [];

function getMoscowTimeString() {
  return new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });
}

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
  fetchCampaignsAndGroups();
}

// 🔓 Выйти / удалить ключ
function logout() {
  localStorage.removeItem('keitaro_api_key');
  alert('Ключ удалён');
  document.getElementById('groupSelect').innerHTML = '<option>—</option>';
  document.getElementById('campaignList').innerHTML = '';
}

// 🔄 Получаем кампании + уникальные группы
async function fetchCampaignsAndGroups() {
  try {
    const res = await fetch('/api/campaigns');
    if (!res.ok) throw new Error("Ошибка API");
    const data = await res.json();
    allCampaigns = data;

    // 🧩 Уникальные группы
    const groupSet = new Set();
    data.forEach(c => {
      if (c.group) groupSet.add(c.group);
    });

    const groupSelect = document.getElementById('groupSelect');
    groupSelect.innerHTML = '';
    Array.from(groupSet).forEach(g => {
      const option = document.createElement('option');
      option.value = g;
      option.textContent = g;
      groupSelect.appendChild(option);
    });

    // 🔍 Кампании с автопоиском
    const datalist = document.getElementById('campaignList');
    datalist.innerHTML = '';
    data.forEach(c => {
      const option = document.createElement('option');
      option.value = `${c.id} — ${c.name}`;
      datalist.appendChild(option);
    });

  } catch (err) {
    alert("Ошибка при получении кампаний/групп");
    console.error(err);
  }
}

// 📋 Создать задачу
function createTask() {
  const name = document.getElementById('testName').value;
  const group = document.getElementById('groupSelect').value;
  const geo = document.getElementById('geoInput').value;
  const campaignRaw = document.getElementById('campaignInput').value;
  const [campaignId, campaignName] = campaignRaw.split(' — ');
  const startTime = getMoscowTimeString();
  const startISO = new Date().toISOString();

  const task = {
    name,
    group,
    geo,
    campaignId,
    campaignName,
    startTime,
    startISO,
    done: false
  };

  tasks.push(task);
  renderTasks();
  closeModal();
}


// ✅ Завершить задачу
function completeTask(index) {
  tasks[index].done = true;
  tasks[index].endTime = getMoscowTimeString();
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
      <div><b>${task.name}</b><br/>
           Группа: ${task.group}<br/>
           Кампания: ${task.campaignName}
      </div>
      <div class="actions">
        ${task.done
          ? `🕒 ${task.startTime} → ${task.endTime}`
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

// ▶️ Автозагрузка при старте страницы
window.addEventListener('DOMContentLoaded', () => {
  const storedKey = localStorage.getItem('keitaro_api_key');
  if (storedKey) {
    document.getElementById('apiKeyInput').value = storedKey;
    fetchCampaignsAndGroups();
  }
});
