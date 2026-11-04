// Real-Time Server-Sent Events (SSE) Broadcaster
class RealtimeService {
  constructor() {
    this.clients = new Map(); // userId -> Set of response objects
    this.allClients = new Set(); // set of all response objects
  }

  addClient(userId, res) {
    this.allClients.add(res);

    if (userId) {
      if (!this.clients.has(userId)) {
        this.clients.set(userId, new Set());
      }
      this.clients.get(userId).add(res);
    }

    // Keep-alive heartbeat ping every 25s
    const heartbeat = setInterval(() => {
      try {
        res.write(': heartbeat\n\n');
      } catch (err) {
        clearInterval(heartbeat);
      }
    }, 25000);

    return () => {
      clearInterval(heartbeat);
      this.allClients.delete(res);
      if (userId && this.clients.has(userId)) {
        this.clients.get(userId).delete(res);
        if (this.clients.get(userId).size === 0) {
          this.clients.delete(userId);
        }
      }
    };
  }

  // Broadcast to all active sessions
  broadcast(eventType, payload) {
    const message = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const res of this.allClients) {
      try {
        res.write(message);
      } catch (e) {
        this.allClients.delete(res);
      }
    }
  }

  // Send event targeted to a specific user
  sendToUser(userId, eventType, payload) {
    const id = String(userId);
    const userConnections = this.clients.get(id);
    if (!userConnections) return;

    const message = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const res of userConnections) {
      try {
        res.write(message);
      } catch (e) {
        userConnections.delete(res);
      }
    }
  }

  getConnectedCount() {
    return this.allClients.size;
  }
}

const realtimeService = new RealtimeService();
export default realtimeService;

