const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = true;
const hostname = 'localhost';
const port = 3000;

console.log(`[Debug] Initializing Next.js (Dev: ${dev})...`);

try {
    const app = next({ dev, hostname, port });
    const handle = app.getRequestHandler();

    app.prepare().then(() => {
        createServer(async (req, res) => {
            try {
                const parsedUrl = parse(req.url, true);
                await handle(req, res, parsedUrl);
            } catch (err) {
                console.error('[Debug] Request Error:', err);
                res.statusCode = 500;
                res.end('Internal Server Error');
            }
        }).listen(port, (err) => {
            if (err) throw err;
            console.log(`> [Debug] Ready on http://${hostname}:${port}`);
        });
    }).catch((err) => {
        console.error('[Debug] App Prepare Error:', err);
        process.exit(1);
    });
} catch (err) {
    console.error('[Debug] Initialization Error:', err);
    process.exit(1);
}
