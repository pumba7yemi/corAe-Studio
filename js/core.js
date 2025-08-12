// corAe Core Bootstrap (Always-Wins guard)
(() => {
  const CORE_KEY = "__corAe_core__";
  if (window[CORE_KEY]) return;        // prevent double-load
  window[CORE_KEY] = { booted: Date.now(), version: "0.1.0", state: {} };

  const emit = (type, detail={}) => document.dispatchEvent(new CustomEvent(type, { detail }));
  emit("corAe:core:ready", { version: window[CORE_KEY].version });

  // Minimal safe store
  const store = {
    _s: {},
    set(k, v){ this._s[k]=v; emit("corAe:store:set",{k,v}); },
    get(k, d=null){ return Object.prototype.hasOwnProperty.call(this._s,k)?this._s[k]:d; }
  };
  window.corAe = Object.freeze({
    get version(){ return window[CORE_KEY].version; },
    get booted(){ return window[CORE_KEY].booted; },
    store
  });
})();
