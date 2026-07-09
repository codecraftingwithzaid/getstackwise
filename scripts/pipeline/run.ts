/**
 * Full pipeline orchestrator — runs Stages 1-4 in sequence.
 * Stage 5 (monitoring) runs on its own weekly schedule.
 *
 * Run: npm run pipeline:run
 *
 * GUARDRAILS enforced by the individual stages:
 *  - Stage 3 quality gate cannot be bypassed.
 *  - Stage 4 caps publishing at 1-2 posts/day.
 */
import { loadEnv } from './lib';

loadEnv();

async function main() {
  console.log('=== Content pipeline: full run ===');

  // Each stage runs as its own process so a failure in one is isolated.
  await runStage('stage1-trends');
  await runStage('stage2-draft');
  await runStage('stage3-quality-gate');
  await runStage('stage4-publish');

  console.log('\n=== Pipeline run complete ===');
}

async function runStage(name: string) {
  const { spawnSync } = await import('node:child_process');
  console.log(`\n>>> Running ${name}`);
  const res = spawnSync('npx', ['tsx', `scripts/pipeline/${name}.ts`], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (res.status !== 0) {
    console.warn(`[run] ${name} exited with code ${res.status}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
