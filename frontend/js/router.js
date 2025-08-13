// Context-aware routing (home/work), default merged Continuum
(function(){
  const url = new URL(location.href);
  const ctx = url.searchParams.get('ctx') || 'continuum'; // home | work | continuum
  document.body.dataset.ctx = ctx;
  // Style or load fragments differently later based on ctx
})();
