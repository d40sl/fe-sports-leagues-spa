import type { VercelRequest, VercelResponse } from '@vercel/node'

const SPORTSDB_BASE_URL = 'https://www.thesportsdb.com/api/v1/json'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.SPORTSDB_API_KEY
  if (!apiKey) {
    console.error('SPORTSDB_API_KEY environment variable is not set')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  try {
    const response = await fetch(`${SPORTSDB_BASE_URL}/${apiKey}/all_leagues.php`)

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Upstream API error' })
    }

    const data = await response.json()

    // Cache for 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate')
    return res.status(200).json(data)
  } catch (error) {
    console.error('Failed to fetch leagues:', error)
    return res.status(500).json({ error: 'Failed to fetch leagues' })
  }
}
