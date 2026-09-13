import { spawn } from 'node:child_process';

const siteURL = 'https://profitjualan.my.id';

const child = spawn(process.execPath, ['scripts/build.mjs'], {
  cwd: new URL('../', import.meta.url),
  env: { ...process.env, BUILD_DIR: 'dist', SITE_URL: siteURL, BASE_PATH: '/', CUSTOM_DOMAIN: 'profitjualan.my.id' },
  stdio: 'inherit'
});

child.on('exit', code => process.exit(code ?? 1));
