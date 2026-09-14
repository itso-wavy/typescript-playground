export const RUNNER_DOCUMENT = `<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; connect-src 'none'; worker-src blob:; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><script>
addEventListener('message', (event) => {
  if (event.source !== parent || !event.data || event.data.type !== 'run') return;
  const { nonce, bundle } = event.data;
  let payload;
  try { payload = JSON.parse(String(bundle)); } catch { return; }
  if (!payload || typeof payload.learner !== 'string' || typeof payload.runtime !== 'string') return;
  const capability = '__tinyDevLabCapability_' + crypto.randomUUID().replaceAll('-', '');
  const reporter = '__tinyDevLabReporter_' + crypto.randomUUID().replaceAll('-', '');
  // These bindings are created before learner code so the trusted runtime cannot
  // be redirected through mutable globals such as Object.hasOwn or JSON.stringify.
  const trustedBuiltins = "const Array=globalThis.Array,Object=globalThis.Object,JSON=globalThis.JSON,Number=globalThis.Number,Promise=globalThis.Promise,String=globalThis.String,Boolean=globalThis.Boolean,RegExp=globalThis.RegExp,Map=globalThis.Map,Set=globalThis.Set,Function=globalThis.Function;\\n";
  // Keep each action independent: an unavailable or non-configurable host
  // property must not prevent the remaining worker defenses from being applied.
  const lockdown = "try{Object.freeze(Array)}catch{}try{Object.freeze(Object)}catch{}try{Object.freeze(JSON)}catch{}try{Object.freeze(Number)}catch{}try{Object.freeze(Promise)}catch{}try{Object.freeze(String)}catch{}try{Object.freeze(Boolean)}catch{}try{Object.freeze(RegExp)}catch{}try{Object.freeze(Map)}catch{}try{Object.freeze(Set)}catch{}try{Object.freeze(Function)}catch{}try{Object.freeze(Array.prototype)}catch{}try{Object.freeze(Object.prototype)}catch{}try{Object.freeze(Function.prototype)}catch{}try{Object.freeze(Promise.prototype)}catch{}try{Object.freeze(String.prototype)}catch{}try{Object.freeze(Number.prototype)}catch{}try{Object.freeze(Boolean.prototype)}catch{}try{Object.freeze(RegExp.prototype)}catch{}try{Object.freeze(Map.prototype)}catch{}try{Object.freeze(Set.prototype)}catch{}const __tinyDevLabNetworkDenied=()=>Promise.reject(new Error('network is disabled'));const fetch=__tinyDevLabNetworkDenied;const indexedDB={open(){throw new Error('storage is disabled')}};const WebSocket=undefined,EventSource=undefined,XMLHttpRequest=undefined,importScripts=undefined;try{Object.defineProperty(self,'fetch',{value:fetch,writable:false,configurable:false})}catch{}try{Object.defineProperty(self,'indexedDB',{value:indexedDB,writable:false,configurable:false})}catch{}try{Object.defineProperty(self,'WebSocket',{value:WebSocket,writable:false,configurable:false})}catch{}try{Object.defineProperty(self,'EventSource',{value:EventSource,writable:false,configurable:false})}catch{}try{Object.defineProperty(self,'XMLHttpRequest',{value:XMLHttpRequest,writable:false,configurable:false})}catch{}try{Object.defineProperty(self,'importScripts',{value:importScripts,writable:false,configurable:false})}catch{}\\n";
  const source = "'use strict';const " + capability + '=' + JSON.stringify(nonce) + ';const ' + reporter + '=self.postMessage.bind(self);\\ntry{' + trustedBuiltins + lockdown + payload.learner + '\\n' + payload.runtime.replaceAll('__TRUSTED_RUNNER_CAPABILITY__', capability).replaceAll('__TRUSTED_POST_MESSAGE__', reporter) + '}catch(error){' + reporter + "({type:'result',nonce:" + capability + ",result:{status:'failed',checks:[],logs:[],error:error instanceof Error?error.message:String(error)}})}";
  const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
  const active = new Worker(url);
  let complete = false;
  const finish = (result) => {
    if (complete) return;
    complete = true;
    clearTimeout(deadline);
    active.terminate();
    parent.postMessage({ type: 'result', nonce, result }, '*');
  };
  active.onmessage = (workerEvent) => {
    const data = workerEvent.data;
    if (data && data.type === 'result' && data.nonce === nonce) finish(data.result);
  };
  active.onerror = (error) => finish({ status: 'failed', checks: [], logs: [], error: error.message || 'worker error' });
  const deadline = setTimeout(() => finish({ status: 'timeout', checks: [], logs: [] }), 2000);
  URL.revokeObjectURL(url);
});
</script>`;
