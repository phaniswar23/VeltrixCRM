import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { spawn } from 'child_process';
import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function checkPort(port, host = 'localhost') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(500);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

function autoBackendPlugin() {
  let backendProc = null;

  const startBackend = () => {
    if (backendProc && !backendProc.killed) {
      return;
    }
    console.log('\x1b[33m[Vite]\x1b[0m Starting backend Express server on port 5050 with --watch...');
    const serverEntry = path.join(rootDir, 'server', 'index.js');

    backendProc = spawn('node', ['--watch', serverEntry], {
      cwd: rootDir,
      stdio: 'inherit',
      env: { ...process.env },
    });

    backendProc.on('error', (err) => {
      console.error('\x1b[31m[Backend Start Error]\x1b[0m Failed to start backend:', err.message);
    });

    backendProc.on('exit', () => {
      backendProc = null;
    });
  };

  const killBackend = () => {
    if (backendProc && !backendProc.killed) {
      try {
        backendProc.kill('SIGINT');
      } catch (e) {
        // Ignored
      }
    }
  };

  process.on('exit', killBackend);
  process.on('SIGINT', killBackend);
  process.on('SIGTERM', killBackend);

  return {
    name: 'auto-backend-server',
    async configureServer(server) {
      // Check on server boot
      const isRunning = (await checkPort(5050, 'localhost')) || (await checkPort(5050, '127.0.0.1'));
      if (isRunning) {
        console.log('\x1b[36m[Vite]\x1b[0m Backend server is already active on http://localhost:5050');
      } else {
        startBackend();
      }

      // Self-healing check on /api requests
      server.middlewares.use(async (req, res, next) => {
        if (req.url && (req.url.startsWith('/api') || req.url === '/health')) {
          const alive = (await checkPort(5050, 'localhost')) || (await checkPort(5050, '127.0.0.1'));
          if (!alive) {
            startBackend();
          }
        }
        next();
      });

      server.httpServer?.on('close', killBackend);
    },
  };
}

export default defineConfig({
  plugins: [react(), autoBackendPlugin()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            console.error('\x1b[31m[Vite Proxy Error]\x1b[0m Backend on port 5050 initializing/unreachable:', err.message);
            if (!res.headersSent && res.writeHead) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  message:
                    'Backend server is initializing or restarting on port 5050. Please wait a couple of seconds and retry.',
                })
              );
            }
          });
        },
      },
    },
  },
});
