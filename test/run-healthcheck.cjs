const { spawn } = require('child_process');
const axios = require('axios');

const SERVER_CMD = 'node';
const SERVER_ARGS = ['dist/server.cjs'];
const PORT = process.env.PORT || 8080;

function waitForServer(url, timeout = 10000, interval = 250) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    (function check() {
      axios.get(url).then(res => resolve(res)).catch(err => {
        if (Date.now() - start >= timeout) return reject(new Error('Timeout waiting for server'));
        setTimeout(check, interval);
      });
    })();
  });
}

(async () => {
  console.log('Starting server for healthcheck...');
  const child = spawn(SERVER_CMD, SERVER_ARGS, { stdio: ['ignore', 'pipe', 'pipe'], env: {...process.env, PORT: PORT} });

  child.stdout.on('data', (d) => process.stdout.write(d));
  child.stderr.on('data', (d) => process.stderr.write(d));

  try {
    const url = `http://127.0.0.1:${PORT}/api/health`;
    await waitForServer(url, 15000);
    const resp = await axios.get(url);
    if (resp.status === 200) {
      console.log('Healthcheck passed:', resp.data);
      child.kill('SIGTERM');
      process.exit(0);
    } else {
      console.error('Healthcheck failed, status:', resp.status);
      child.kill('SIGTERM');
      process.exit(2);
    }
  } catch (err) {
    console.error('Healthcheck error:', err.message || err);
    child.kill('SIGTERM');
    process.exit(2);
  }
})();
