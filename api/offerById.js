export default async function handler(req, res) {
  const { id } = req.query;
  const apiKey = process.env.KEITARO_API_KEY;

  if (!id) {
    return res.status(400).json({ error: 'Не указан ID оффера' });
  }

  try {
    const response = await fetch(`https://lponlineshop.site/admin_api/v1/offers/${id}`, {
      headers: {
        'Api-Key': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Ошибка при получении оффера' });
    }

    const data = await response.json();
    return res.status(200).json({ name: data.name });
  } catch (error) {
    return res.status(500).json({ error: 'Серверная ошибка при получении оффера' });
  }
}
