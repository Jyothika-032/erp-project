const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5000/api${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ path, status: res.statusCode, success: parsed.success, count: Array.isArray(parsed.data) ? parsed.data.length : 'N/A' });
        } catch (e) {
          resolve({ path, status: res.statusCode, raw: data.slice(0, 100) });
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  const results = await Promise.all([
    get('/comms-logs'),
    get('/certificates'),
    get('/staff'),
    get('/users'),
  ]);
  results.forEach(r => console.log(JSON.stringify(r)));
  process.exit();
}
main();
