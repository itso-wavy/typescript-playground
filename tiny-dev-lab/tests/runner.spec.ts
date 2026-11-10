import { expect, test } from '@playwright/test';

test.setTimeout(10_000);

function payload(learner: string, runtime: string): string { return JSON.stringify({ learner, runtime }); }

async function run(page: import('@playwright/test').Page, bundle: string) {
  await page.goto('/');
  return page.evaluate(async (value) => {
    const modulePath = '/src/runner/browser-runner.ts';
    const { runBundle } = await import(/* @vite-ignore */ modulePath);
    return runBundle(value);
  }, bundle);
}

const trusted = (result: string) => `self.postMessage({type:'result',nonce:__TRUSTED_RUNNER_CAPABILITY__,result:${result}});`;

test('executes a trusted runtime result in an opaque worker', async ({ page }) => {
  const result = await run(page, payload('globalThis.__tinyDevLabLearner={};', trusted("{status:'passed',checks:[{name:'works',passed:true}],logs:[]}")));
  expect(result.status).toBe('passed');
});

test('terminates an endless learner loop', async ({ page }) => {
  const result = await run(page, payload('while(true){}', trusted("{status:'passed',checks:[{name:'unreachable',passed:true}],logs:[]}")));
  expect(result.status).toBe('timeout');
});

test('blocks worker network access', async ({ page }) => {
  const fetchRuntime = "globalThis.ok=false;fetch('https://example.com').then(()=>globalThis.ok=true).catch(()=>undefined);setTimeout(()=>{" + trusted("{status:globalThis.ok===false?'passed':'failed',checks:[{name:'fetch cannot succeed',passed:globalThis.ok===false}],logs:[]}") + '},300);';
  const fetchResult = await run(page, payload('globalThis.__tinyDevLabLearner={};', fetchRuntime));
  expect(fetchResult.status).toBe('passed');
});

test('blocks opaque-origin storage', async ({ page }) => {
  const storageRuntime = "let blocked=false;try{indexedDB.open('x')}catch{blocked=true}setTimeout(()=>{" + trusted("{status:blocked?'passed':'failed',checks:[{name:'storage blocked',passed:blocked}],logs:[]}") + '},50);';
  const storageResult = await run(page, payload('globalThis.__tinyDevLabLearner={};', storageRuntime));
  expect(storageResult.status).toBe('passed');
});

test('does not accept a learner forged parent result', async ({ page }) => {
  const forged = "parent.postMessage({type:'result',nonce:'forged',result:{status:'passed',checks:[{name:'forged',passed:true}],logs:[]}},'*');";
  const result = await run(page, payload(forged, trusted("{status:'failed',checks:[{name:'trusted',passed:false}],logs:[]}")));
  expect(result.status).not.toBe('passed');
});

test('does not let learner code alter trusted result handling', async ({ page }) => {
  const attack = "Array.prototype.every=()=>true;";
  const result = await run(page, payload(attack, trusted("{status:'failed',checks:[{name:'trusted failure',passed:false}],logs:[]}")));
  expect(result.status).toBe('failed');
});
