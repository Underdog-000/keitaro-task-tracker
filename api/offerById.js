export default async function handler(req, res) {
  const { id } = req.query;
  const KEITARO_URL = `https://lponlineshop.site/admin_api/v1/offers/${id}`;
  const apiKey = process.env.KEITARO_API_KEY;

  try {
    const response = await fetch(KEITARO_URL, {
      headers: {
        'Api-Key': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Ошибка Keitaro API' });
    }

    const data = await response.json();
    return res.status(200).json({ name: data.name });
  } catch (error) {
    return res.status(500).json({ error: 'Серверная ошибка при получении оффера' });
  }
}
