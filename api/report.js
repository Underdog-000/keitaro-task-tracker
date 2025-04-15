module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Only POST allowed');

  const apiKey = process.env.KEITARO_API_KEY;
  const { campaignId, from, to } = req.body;

  const headers = {
    'Api-Key': apiKey,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  try {
    // 1. Получаем отчёт с нужными метриками
    const response = await fetch('https://lponlineshop.site/admin_api/v1/report/build', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        range: { from, to, timezone: "Europe/Moscow" },
        columns: ["offer_id"],
        metrics: [
          "conversions", "cr", "approve", "cpc", "cpa", "cost", "sale_revenue"
        ],
        grouping: ["offer"],
        filters: [{
          name: "campaign_id",
          operator: "EQUALS",
          expression: String(campaignId)
        }],
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

    // 2. Получаем структуру кампании для имён офферов
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

    // 3. Обогащаем офферы в rows
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

    // 4. Финальный summary — используем то, что есть, fallback не нужен
    const summary = report.summary || {};

    res.status(200).json({ rows, summary });
  } catch (err) {
    console.error("Ошибка в report.js:", err);
    res.status(500).json({ error: "Ошибка сервера", details: err.message });
  }
};
