import { spawn } from 'node:child_process';

const port = process.env.PORT ?? '8888';
const warmupRoutes = ['/', '/jobs', '/companies', '/chat', '/profile', '/notifications'];

const nextBin = process.platform === 'win32'
  ? 'node_modules/next/dist/bin/next'
  : 'node_modules/next/dist/bin/next';

const child = spawn(nextBin, ['dev', '-p', port], {
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true,
});

let warmedUp = false;

function pipeOutput(stream, writer) {
  stream.on('data', (chunk) => {
    const text = chunk.toString();
    writer.write(text);
    if (!warmedUp && text.includes('Ready in')) {
      warmedUp = true;
      // 开发态按需编译会导致首次点击路由等待，这里在服务就绪后预热高频路由。
      void warmupRoutesInBackground();
    }
  });
}

async function warmupRoutesInBackground() {
  for (const route of warmupRoutes) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12_000);
    try {
      await fetch(`http://localhost:${port}${route}`, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'x-route-warmup': '1',
        },
      });
      process.stdout.write(`[warmup] ${route}\n`);
    } catch {
      process.stdout.write(`[warmup:skip] ${route}\n`);
    } finally {
      clearTimeout(timer);
    }
  }
}

pipeOutput(child.stdout, process.stdout);
pipeOutput(child.stderr, process.stderr);

function shutdown(signal) {
  child.kill(signal);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
