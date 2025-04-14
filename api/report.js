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
    // 1. Получаем отчёт
    const response = await fetch('https://lponlineshop.site/admin_api/v1/report/build', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        range: { from, to, timezone: "Europe/Moscow" },
        columns: [],
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

    // 3. Обогащаем офферы в отчёте
    rows.forEach(row => {
      const offerId = row.offer?.id;
      if (offerId && offersMap[offerId]) {
        row.offer.name = offersMap[offerId];
      }
    });

    // 4. Собираем summary
    const summary = rows.reduce((acc, row) => {
      acc.conversions += row.conversions ?? 0;
      acc.cost += row.cost ?? 0;
      return acc;
    }, { conversions: 0, cost: 0 });

    summary.cr = summary.conversions ? ((summary.conversions / rows.length) * 100).toFixed(2) : 0;
    summary.cpl = summary.conversions ? (summary.cost / summary.conversions).toFixed(2) : 0;

    res.status(200).json({ rows, summary });
  } catch (err) {
    console.error("Ошибка в report.js:", err);
    res.status(500).json({ error: "Ошибка сервера", details: err.message });
  }
}
