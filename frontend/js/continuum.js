// "Just Ride" nudges — tiny MVP
(function(){
  let idleTimer;
  const nudge = () => {
    // Gentle nudge to keep moving — expand later with real logic
    console.log("Just Ride: nudge to keep momentum.");
  };
  const reset = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(nudge, 5 * 60 * 1000); // 5 minutes
  };
  ['click','keydown','scroll','mousemove','touchstart'].forEach(evt =>
    window.addEventListener(evt, reset, { passive:true })
  );
  reset();
})();
