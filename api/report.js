// report.js

export default async function handler(req, res) {

if (req.method !== 'POST') return res.status(405).send('Only POST allowed');

const apiKey = process.env.KEITARO_API_KEY;

const { campaignId, from, to } = req.body;

const headers = {

'Api-Key': apiKey,

'Content-Type': 'application/json',

'Accept': 'application/json'

};

try {

// 1. Получаем отчёт с offer_id

const response = await fetch('https://lponlineshop.site/admin_api/v1/report/build', {

method: 'POST',

headers,

body: JSON.stringify({

range: { from, to, timezone: "Europe/Moscow" },

columns: ["offer_id"],

metrics: ["conversions", "cr", "approve", "cpc", "cpa", "cost"],

grouping: ["offer"],

filters: [{ name: "campaign_id", operator: "EQUALS", expression: String(campaignId) }],

limit: 100

})

});

if (!response.ok) {

const error = await response.text();

return res.status(response.status).send(error);

}

const report = await response.json();

const rows = report.rows || [];

console.log('🟡 Кол-во строк в отчёте:', rows.length);

rows.forEach(r => {

console.log(`🔸 Offer в отчёте:`, typeof r.offer === 'string' ? r.offer : JSON.stringify(r.offer));

});

// 2. Получаем структуру кампании для извлечения имён офферов

const campaignRes = await fetch(`https://lponlineshop.site/admin_api/v1/campaigns/${campaignId}`, { headers });

const campaign = await campaignRes.json();

const offersMap = {};

for (const stream of campaign.streams || []) {

for (const path of stream.paths || []) {

for (const offer of path.offers || []) {

offersMap[offer.id] = offer.name;

}

}

}

// 3. Обогащаем офферы в отчёте и приклеиваем id

rows.forEach(row => {

if (typeof row.offer === 'string') {

row.offer = {

id: row.offer_id ?? null,

name: row.offer

};

}

const offerId = row.offer?.id;

if (offerId && offersMap[offerId]) {

row.offer.name = offersMap[offerId];

console.log(`🟢 Обогащено имя оффера [${offerId}]: ${row.offer.name}`);

} else {

console.warn(`⚠️ Имя не найдено для оффера [${offerId}]`);

}

});

// 4. Финальный summary — если нет в API, считаем вручную
let summary = report.summary;

if (!summary || !summary.cost) {
  summary = rows.reduce((acc, row) => {
    acc.conversions += row.conversions ?? 0;
    acc.cost += row.cost ?? 0;
    acc.crSum += (row.cr ?? 0) * (row.conversions ?? 0);
    acc.approveSum += (row.approve ?? 0) * (row.conversions ?? 0);
    return acc;
  }, { conversions: 0, cost: 0, crSum: 0, approveSum: 0 });

  summary.cr = summary.conversions ? +(summary.crSum / summary.conversions).toFixed(2) : null;
  summary.approve = summary.conversions ? +(summary.approveSum / summary.conversions).toFixed(2) : null;
  summary.cpl = summary.conversions ? +(summary.cost / summary.conversions).toFixed(2) : null;
}

res.status(200).json({ rows, summary });



}

}
