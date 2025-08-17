import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Получаем путь после /api/proxy
    const path = req.url?.replace(/^\/api\/proxy/, '/api') || '';    // Собираем query-параметры
    const queryParams = new URLSearchParams({ ...req.query } as Record<string, string>).toString();
    // Запрос к реальному серверу
    const apiRes = await fetch(`http://109.73.206.144:6969${path}?${queryParams}`);
    const data = await apiRes.json();
    res.status(200).json(data);
}
