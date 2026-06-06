import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

const SEED_TEMPLATES = [
  {
    name: 'URL Shortener', description: 'Design a URL shortening service like TinyURL', difficulty: 'medium',
    requirements: JSON.stringify(['Generate unique short URLs', 'Handle 100M URLs/month', 'Redirect in <100ms', 'Track analytics', 'Support custom aliases']),
    architecture: JSON.stringify({ components: ['Web Server (Load Balancer)', 'Application Service', 'Cache (Redis)', 'Database (PostgreSQL)', 'Analytics Pipeline (Kafka)'], dataFlow: 'Client → Load Balancer → App Server → Cache → DB' }),
    considerations: JSON.stringify(['Key generation strategy (Base62)', 'Cache TTL for hot URLs', 'Database sharding by URL hash', 'Rate limiting per user']),
  },
  {
    name: 'Chat System', description: 'Design a real-time chat application like WhatsApp', difficulty: 'hard',
    requirements: JSON.stringify(['Real-time messaging', 'Group chats', 'Media sharing', 'Online presence', 'End-to-end encryption', 'Message sync across devices']),
    architecture: JSON.stringify({ components: ['WebSocket Servers', 'Message Queue (Kafka)', 'Database (Cassandra)', 'Cache (Redis)', 'CDN for Media', 'Notification Service'], dataFlow: 'Client (WebSocket) → Chat Service → Message Queue → DB' }),
    considerations: JSON.stringify(['WebSocket connection management', 'Message ordering and dedup', 'Last-seen timestamp scaling', 'Media upload/storage strategy']),
  },
  {
    name: 'E-Commerce Platform', description: 'Design an e-commerce platform like Amazon', difficulty: 'hard',
    requirements: JSON.stringify(['Product catalog with search', 'Shopping cart', 'Order processing', 'Payment integration', 'Inventory management', 'Recommendations']),
    architecture: JSON.stringify({ components: ['Frontend (CDN)', 'API Gateway', 'Product Service', 'Order Service', 'Payment Service', 'Inventory Service', 'Search (Elasticsearch)', 'DB per service'], dataFlow: 'Client → API Gateway → Microservices → DBs' }),
    considerations: JSON.stringify(['Database per service pattern', 'Eventual consistency for orders', 'Two-phase commit for payments', 'Search indexing strategy']),
  },
];

export const getTemplates = async (_req: AuthRequest, res: Response) => {
  try {
    const dbTemplates = await prisma.systemDesignTemplate.findMany({ where: { isPublic: true }, orderBy: { createdAt: 'desc' } });
    res.json([...SEED_TEMPLATES, ...dbTemplates]);
  } catch { res.status(500).json({ error: 'Failed to get templates.' }); }
};

export const getTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const dbTemplates = await prisma.systemDesignTemplate.findMany();
    const all = [...SEED_TEMPLATES, ...dbTemplates];
    const template = all[parseInt(String(req.params.id))];
    if (!template) return res.status(404).json({ error: 'Template not found.' });
    res.json(template);
  } catch { res.status(500).json({ error: 'Failed to get template.' }); }
};

export const saveTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, difficulty, requirements, architecture, considerations } = req.body;
    const template = await prisma.systemDesignTemplate.create({
      data: { name, description, difficulty, requirements: JSON.stringify(requirements), architecture: JSON.stringify(architecture), considerations: JSON.stringify(considerations), userId: req.user!.id },
    });
    res.json(template);
  } catch { res.status(500).json({ error: 'Failed to save template.' }); }
};
