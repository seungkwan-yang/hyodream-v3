import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Google Cloud Run/App Engine utilize the PORT environment variable
const port = process.env.PORT || 8080;
const publicDir = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
  // Decode URL in case of Korean paths
  const decodedUrl = decodeURIComponent(req.url || '/');
  
  // Clean request URL path and fallback to index.html
  let filePath = path.join(publicDir, decodedUrl === '/' ? 'index.html' : decodedUrl);

  // Check if file exists, if not serve index.html as a fallback (React SPA Routing)
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      filePath = path.join(publicDir, 'index.html');
    }

    // Ensure it doesn't try to read a directory as a file (fallback to index.html if so)
    fs.stat(filePath, (statErr, stats) => {
      if (statErr || (stats && stats.isDirectory())) {
        filePath = path.join(publicDir, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      fs.readFile(filePath, (readErr, content) => {
        if (readErr) {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('500 Internal Server Error');
        } else {
          // Serve static resources with cache control headers
          const headers = { 'Content-Type': contentType };
          if (ext !== '.html') {
            headers['Cache-Control'] = 'public, max-age=2592000, no-transform'; // 30 Days Cache
          } else {
            headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate'; // No cache for HTML
          }
          res.writeHead(200, headers);
          res.end(content, 'utf-8');
        }
      });
    });
  });
});

server.listen(port, () => {
  console.log(`[HyoDream Production Server] Active on port ${port}`);
  console.log(`Serving assets from: ${publicDir}`);
});
