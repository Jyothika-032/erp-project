const http = require('http');

function get(path) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:5000/api${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const status = parsed.success === false ? '❌ FAIL' : '✅ OK ';
          resolve(`${status} [${res.statusCode}] ${path}  → ${Array.isArray(parsed.data) ? parsed.data.length + ' records' : parsed.message || parsed.error || 'no array'}`);
        } catch (e) {
          resolve(`⚠️  [${res.statusCode}] ${path}  → parse error`);
        }
      });
    });
    req.on('error', (e) => resolve(`❌ [ERR] ${path}  → ${e.message}`));
    req.setTimeout(5000, () => { req.destroy(); resolve(`⌛ [TIMEOUT] ${path}`); });
  });
}

async function main() {
  console.log('\n=== EduERP API Smoke Test ===\n');
  const endpoints = [
    '/comms-logs',
    '/certificates',
    '/staff',
    '/users',
    '/students',
    '/roles',
    '/role-permissions',
    '/institutions',
    '/dashboard',
    '/payments',
    '/fee-structure',
    '/tc',
    '/placements',
    '/attendance',
    '/batches',
    '/courses',
    '/admissions',
    '/merge-log',
    '/parents',
  ];
  const results = await Promise.all(endpoints.map(get));
  results.forEach(r => console.log(r));
  console.log('\n=== Done ===');
  process.exit();
}
main();
