const fs = require('fs');
const path = require('path');

function walk(dir) {
    let files = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            files = files.concat(walk(file));
        } else {
            if (file.endsWith('route.ts') || file.endsWith('route.js')) {
                files.push(file);
            }
        }
    });
    return files;
}

const apiDir = path.join(process.cwd(), 'app', 'api');
const routes = walk(apiDir);

routes.forEach(route => {
    let content = fs.readFileSync(route, 'utf8');
    if (content.includes("runtime = 'edge'") || content.includes('runtime = "edge"')) {
        console.log(`Updating ${route}...`);
        content = content.replace(/runtime = ['"]edge['"]/g, "runtime = 'nodejs'");
        fs.writeFileSync(route, content);
    }
});
