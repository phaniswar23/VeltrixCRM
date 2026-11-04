import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import realtimeService from '../services/realtimeService.js';

const router = express.Router();

router.get('/stream', async (req, res) => {
  let token = req.query.token;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  let user = null;
  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'veltrix_crm_super_secure_jwt_secret_key_2026'
      );
      user = await User.findById(decoded.id).select('-password');
    } catch (err) {
      // Allow anonymous connection or reject
    }
  }

  // Set SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': '*',
  });

  res.write(': connected\n\n');

  // Send initial ping with connection metadata
  const initialPayload = {
    connected: true,
    user: user ? { id: user._id, name: user.name, role: user.role } : null,
    timestamp: new Date().toISOString(),
  };
  res.write(`event: INITIAL_SYNC\ndata: ${JSON.stringify(initialPayload)}\n\n`);

  const cleanup = realtimeService.addClient(user ? String(user._id) : null, res);

  req.on('close', () => {
    cleanup();
  });
});

export default router;

