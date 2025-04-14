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

function saveApiKey() {
  const key = document.getElementById('apiKeyInput').value;
  localStorage.setItem('keitaro_api_key', key);
  alert('Ключ сохранён');
  closeSettings();
  fetchCampaignsAndGroups();
}

function logout() {
  localStorage.removeItem('keitaro_api_key');
  alert('Ключ удалён');
  document.getElementById('groupSelect').innerHTML = '<option>—</option>';
  document.getElementById('campaignList').innerHTML = '';
}

async function fetchCampaignsAndGroups() {
  try {
    const res = await fetch('/api/campaigns');
    if (!res.ok) throw new Error("Ошибка API");
    const data = await res.json();
    allCampaigns = data;

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

async function completeTask(index) {
  const task = tasks[index];
  const endTime = getMoscowTimeString();
  const endISO = new Date().toISOString();

  try {
    const res = await fetch('/api/report', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        campaignId: task.campaignId,
        from: task.startISO,
        to: endISO
      })
    });

    const report = await res.json();

    tasks[index].done = true;
    tasks[index].endTime = endTime;
    tasks[index].report = report;
    renderTasks();
  } catch (err) {
    console.error("Ошибка при завершении задачи:", err);
  }
}

function renderTasks() {
  const workingEl = document.getElementById('workingTasks');
  const doneEl = document.getElementById('doneTasks');
  workingEl.innerHTML = '';
  doneEl.innerHTML = '';

  tasks.forEach((task, i) => {
    const el = document.createElement('div');
    el.className = 'task-card';

    let html = `
      <div><b>${task.name}</b><br/>
           Группа: ${task.group}<br/>
           Гео: ${task.geo}<br/>
           Кампания: ${task.campaignName}
      </div>
      <div class="actions">
        ${task.done
          ? `🕒 ${task.startTime} → ${task.endTime || '—'}`
          : `<button onclick="completeTask(${i})">Завершить</button>`}
      </div>
    `;

    if (task.done && task.report && task.report.rows) {
      html += `<details><summary>📊 Отчёт</summary><div style="font-size: 0.9em; padding-top: 8px;">`;

      const total = task.report.summary || {};
      const conversions = total.conversions ?? 0;
      const cost = total.cost ?? 0;
      const cr = total.cr ?? '—';
      const approve = total.approve ?? '—';
      const cpl = conversions ? (cost / conversions).toFixed(2) : '—';

      html += `
        <b>Кампания:</b><br/>
        Спенд: $${cost} / Лиды: ${conversions}<br/>
        CPL: $${cpl} / CR: ${cr}% / Аппрув: ${approve}%<br/><br/>
        <b>Офферы:</b><br/>
      `;

      task.report.rows.forEach((r, rowIndex) => {
        const id = r.offer?.id;
        if (id && !r.offer?.name) {
          fetch(`/api/offerById?id=${id}`)
            .then(res => res.json())
            .then(data => {
              if (data?.name) {
                r.offer.name = data.name;
                task.report.rows[rowIndex].offer.name = data.name;
                renderTasks();
              }
            })
            .catch(err => console.warn(`Ошибка получения оффера ${id}:`, err));
        }

        const name = r.offer?.name || `Offer #${id}`;
        html += `🔹 [${id}] ${name}<br/>
          Лиды: ${r.conversions ?? 0} / CR: ${r.cr ?? 0}% / CPL: $${r.cpa ?? 0} / Аппрув: ${r.approve ?? 0}%<br/>
          🔗 <a href="https://lponlineshop.site/admin/?object=offers.preview&id=${id}" target="_blank">Промо</a><br/><br/>
        `;
      });

      html += `</div></details>`;
    }

    el.innerHTML = html;

    if (task.done) {
      doneEl.appendChild(el);
    } else {
      workingEl.appendChild(el);
    }
  });
}

function toggleColumn(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const isHidden = getComputedStyle(el).display === 'none';
  el.style.display = isHidden ? 'flex' : 'none';
}

window.addEventListener('DOMContentLoaded', () => {
  const storedKey = localStorage.getItem('keitaro_api_key');
  if (storedKey) {
    document.getElementById('apiKeyInput').value = storedKey;
    fetchCampaignsAndGroups();
  }
});
