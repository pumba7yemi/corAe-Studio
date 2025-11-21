// Minimal JavaScript stub for @corae/cims-core
// This file intentionally avoids importing local TypeScript files to
// prevent workspace TypeScript from type-checking unrelated schema code.

function ping() {
  return 'cims-core active (stub)';
}

function emitCimsEvent(evt) {
  // Best-effort logging for the stub environment
  try {
    // eslint-disable-next-line no-console
    console.log('CIMS event (stub):', evt);
  } catch (e) {
    /* ignore */
  }
}

async function send(params) {
  // Minimal validation similar to the TS stub; return a resolved stubbed result
  if (!params || !params.tenantId || !params.senderId || !params.body) {
    throw new Error('Missing required send() params (cims-core stub)');
  }
  return {
    ok: true,
    stub: true,
    threadId: params.threadId || 'stub-thread-1',
    echo: params
  };
}

module.exports = {
  ping,
  emitCimsEvent,
  send
};
