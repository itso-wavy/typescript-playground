import { expect, test } from '@playwright/test';

test.setTimeout(10_000);

function payload(learner: string, runtime: string): string {
  return JSON.stringify({ learner, runtime });
}

async function run(page: import('@playwright/test').Page, bundle: string) {
  await page.goto('/');
  return page.evaluate(async (value) => {
    const modulePath = '/src/runner/browser-runner.ts';
    const { runBundle } = await import(/* @vite-ignore */ modulePath);
    return runBundle(value);
  }, bundle);
}

const trusted = (result: string) => `self.postMessage({type:'result',nonce:__TRUSTED_RUNNER_CAPABILITY__,result:${result}});`;

test('rejects a claimed pass without a successful trusted check', async ({ page }) => {
  const result = await run(page, payload('globalThis.__tinyDevLabLearner={};', trusted("{status:'passed',checks:[],logs:[]}")));
  expect(result.status).toBe('failed');
  expect(result.error).toContain('invalid result');
});

test('rejects a claimed pass containing a failed check', async ({ page }) => {
  const result = await run(page, payload('globalThis.__tinyDevLabLearner={};', trusted("{status:'passed',checks:[{name:'tampered',passed:false}],logs:[]}")));
  expect(result.status).toBe('failed');
  expect(result.error).toContain('invalid result');
});

test('rejects malformed runtime payloads before executing them', async ({ page }) => {
  const result = await run(page, '{"learner":1,"runtime":""}');
  expect(result.status).toBe('failed');
  expect(result.error).toContain('invalid runtime bundle');
});

test('terminates an infinite learner loop', async ({ page }) => {
  const result = await run(page, payload('while(true){}', trusted("{status:'passed',checks:[{name:'unreachable',passed:true}],logs:[]}")));
  expect(result.status).toBe('timeout');
});

test('blocks network and import capabilities independently', async ({ page }) => {
  const runtime = "let fetchBlocked=false;let importBlocked=false;fetch('https://example.com').catch(()=>fetchBlocked=true);try{importScripts('https://example.com/attack.js')}catch{importBlocked=true}setTimeout(()=>{" + trusted("{status:fetchBlocked&&importBlocked?'passed':'failed',checks:[{name:'network disabled',passed:fetchBlocked},{name:'imports disabled',passed:importBlocked}],logs:[]}") + '},100);';
  const result = await run(page, payload('void 0;', runtime));
  expect(result.status).toBe('passed');
});

test('blocks indexedDB in the Worker', async ({ page }) => {
  const runtime = "let blocked=false;try{indexedDB.open('attack')}catch{blocked=true}" + trusted("{status:blocked?'passed':'failed',checks:[{name:'storage disabled',passed:blocked}],logs:[]}");
  const result = await run(page, payload('void 0;', runtime));
  expect(result.status).toBe('passed');
});

test('rejects a parent-channel spoof from learner code', async ({ page }) => {
  const learner = "parent.postMessage({type:'result',nonce:'forged',result:{status:'passed',checks:[{name:'forged',passed:true}],logs:[]}},'*');";
  const result = await run(page, payload(learner, trusted("{status:'failed',checks:[{name:'trusted',passed:false}],logs:[]}")));
  expect(result.status).toBe('failed');
});

test('does not let learner code falsify static built-in checks', async ({ page }) => {
  const learner = "const blocked=[];for(const attempt of [()=>Object.hasOwn=(value)=>value.nickname!==undefined,()=>JSON.stringify=()=>'{\\\"forged\\\":true}',()=>Number.isFinite=()=>true,()=>Array.isArray=()=>false]){try{attempt();blocked.push(false)}catch{blocked.push(true)}}globalThis.__tinyDevLabLearner={blocked,patchNickname:(nickname)=>({nickname})};";
  const runtime = "const learner=globalThis.__tinyDevLabLearner;const omitted=learner.patchNickname(undefined);const set=learner.patchNickname('Mina');const bypass=!Object.hasOwn(omitted,'nickname')&&Object.hasOwn(set,'nickname')&&set.nickname==='Mina';const immutable=learner.blocked.length===4&&learner.blocked.every(Boolean);" + trusted("{status:'failed',checks:[{name:'static built-ins immutable',passed:immutable},{name:'invalid patch cannot pass',passed:!bypass}],logs:[]}");
  const result = await run(page, payload(learner, runtime));
  expect(result.status).toBe('failed');
  expect(result.checks).toEqual([
    { name: 'static built-ins immutable', passed: true },
    { name: 'invalid patch cannot pass', passed: true },
  ]);
});
