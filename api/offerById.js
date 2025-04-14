export default async function handler(req, res) {
  const { id } = req.query;
  const apiKey = process.env.KEITARO_API_KEY;
  const BASE_URL = 'https://lponlineshop.site/admin_api/v1';

  if (!id || !apiKey) {
    return res.status(400).json({ error: 'Missing offer ID or API key' });
  }

  try {
    const response = await fetch(`${BASE_URL}/offers/${id}`, {
      headers: {
        'Api-Key': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).send(errorText);
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: 'Ошибка запроса к Keitaro', details: err.message });
  }
}
