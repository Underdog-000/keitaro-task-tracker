export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Only POST allowed');

  const apiKey = process.env.KEITARO_API_KEY;
  const { campaignId, from, to } = req.body;

  const response = await fetch('https://lponlineshop.site/admin_api/v1/report/build', {
    method: 'POST',
    headers: {
      'Api-Key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      range: {
        from,
        to,
        timezone: "Europe/Moscow"
      },
      columns: [],
      metrics: [
        "conversions", "cr", "approve", "cpc", "cpa", "cost"
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

  const data = await response.json();
  res.status(200).json(data);
}
