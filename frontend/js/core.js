// corAe Core — minimal bootstrap + safe store
(() => {
  const KEY = "__corAe_core__";
  if (window[KEY]) return;

  const emit = (type, detail={}) => document.dispatchEvent(new CustomEvent(type, { detail }));
  const store = {
    _s: {},
    set(k, v){ this._s[k]=v; emit("corAe:store:set",{k,v}); },
    get(k, d=null){ return Object.prototype.hasOwnProperty.call(this._s,k)?this._s[k]:d; }
  };

  window[KEY] = { booted: Date.now(), version: "0.1.0", store };
  window.corAe = Object.freeze({
    get version(){ return window[KEY].version; },
    get booted(){ return window[KEY].booted; },
    store
  });

  emit("corAe:core:ready", { version: window[KEY].version });
})();
