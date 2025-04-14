export default async function handler(req, res) {
  const KEITARO_URL = 'https://lponlineshop.site/admin_api/v1/campaign_groups';
  const apiKey = process.env.KEITARO_API_KEY;

  const response = await fetch(KEITARO_URL, {
    headers: {
      'Api-Key': apiKey,
      'Accept': 'application/json'
    }
  });

  const data = await response.json();
  return res.status(200).json(data);
}
