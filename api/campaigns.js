export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Метод не поддерживается' });
  }

  const KEITARO_URL = 'https://lponlineshop.site/admin_api/v1/campaigns';
  const apiKey = process.env.KEITARO_API_KEY;

  try {
    const response = await fetch(KEITARO_URL, {
      headers: {
        'Api-Key': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Ошибка Keitaro API:", text);
      return res.status(response.status).json({ error: 'Ошибка при получении кампаний' });
    }

    const data = await response.json();

    // Возвращаем только нужные поля
    const compactData = data.map(c => ({
      id: c.id,
      name: c.name,
      group: c.group || null,
      status: c.status
    }));

    return res.status(200).json(compactData);

  } catch (error) {
    console.error("Ошибка в campaigns.js:", error);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера', details: error.message });
  }
}
