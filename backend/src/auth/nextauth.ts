// Placeholder NextAuth config (to be wired into Next frontend)
import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({message: 'NextAuth placeholder'})
}
