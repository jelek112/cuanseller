import { spawn } from 'node:child_process';

const repository = process.env.GITHUB_REPOSITORY || '';
const [owner, repo] = repository.split('/');
const configuredURL = process.env.SITE_URL?.replace(/\/$/, '');
const repositoryName = repo || 'cuanseller';
const pagesOwner = owner?.toLowerCase() || 'jelek112';
const basePath = `/${repositoryName}/`;
const siteURL = configuredURL || `https://${pagesOwner}.github.io/${repositoryName}`;

const child = spawn(process.execPath, ['scripts/build.mjs'], {
  cwd: new URL('../', import.meta.url),
  env: { ...process.env, BUILD_DIR: 'dist', SITE_URL: siteURL, BASE_PATH: basePath },
  stdio: 'inherit'
});

child.on('exit', code => process.exit(code ?? 1));
