import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const target = process.env.PERF_APP_DIR || path.join(root, '.performance', 'app');
fs.mkdirSync(target, { recursive: true });
for (const entry of process.env.PERF_APP_DIR ? [] : ['app', 'components', 'lib', 'public', 'package.json', 'tsconfig.json', 'postcss.config.mjs', 'next-env.d.ts', '.gitignore']) {
  fs.cpSync(path.join(root, entry), path.join(target, entry), { recursive: true, preserveTimestamps: true });
}
if (!fs.existsSync(path.join(target, 'node_modules'))) fs.symlinkSync(path.join(root, 'node_modules'), path.join(target, 'node_modules'), 'junction');
const config = fs.readFileSync(path.join(process.env.PERF_APP_DIR || root, 'next.config.ts'), 'utf8');
const instrumentedConfig = config.includes("compiler.hooks.done.tap('PerformanceStats'") ? config : config.replace('export default nextConfig;', `
const previousWebpack = nextConfig.webpack;
nextConfig.webpack = (config, context) => {
  if (!context.isServer) {
    config.plugins.push({ apply(compiler: any) {
      compiler.hooks.done.tap('PerformanceStats', (stats: any) => {
        require('node:fs').writeFileSync(require('node:path').join(process.cwd(), 'client-stats.json'), JSON.stringify(stats.toJson({ all: false, assets: true, cachedAssets: true, chunks: true, modules: true, cachedModules: true, nestedModules: true, chunkModules: true, ids: true, groupModulesByAttributes: false, groupModulesByCacheStatus: false, groupModulesByType: false, modulesSpace: Infinity, chunkModulesSpace: Infinity, nestedModulesSpace: Infinity, reasons: false })));
      });
    }});
  }
  return previousWebpack ? previousWebpack(config, context) : config;
};
export default nextConfig;`);
const configPath = path.join(target, 'next.config.ts');
if (!fs.existsSync(configPath) || fs.readFileSync(configPath, 'utf8') !== instrumentedConfig) fs.writeFileSync(configPath, instrumentedConfig);
const result = spawnSync(process.execPath, [path.join(root, 'node_modules/next/dist/bin/next'), 'build'], { cwd: target, stdio: 'inherit', env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' } });
process.exitCode = result.status ?? 1;
