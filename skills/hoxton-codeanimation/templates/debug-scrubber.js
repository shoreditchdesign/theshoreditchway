/* =====================================================================
   debug-scrubber.js — DEV-ONLY drop-in for GSAP walkthrough animations
   (same code as the fenced block at the end of starter.html)

   CONTRACT
   - Paste inside its own <script> block AFTER the animation script, fenced
     with the "DEV-ONLY — delete this whole <script> block..." comment
     (copy the fence from starter.html verbatim).
   - Needs two globals from the animation script (top-level `var`, not
     let/const inside a closure, so they live on window):
       master       a gsap.timeline — the whole piece
       sceneLabels  { navKey: 'labelName', ... } — every labelName must be
                    a label on `master` (master.addLabel). Order of keys =
                    order of the numbered scene buttons.
   - Only READS those two. Nothing in the animation may depend on this
     block, so deleting it for handoff is one contiguous cut.
   - Inert unless the URL has ?debug (any value). Then:
       &t=<seconds>     lands paused at that exact time
       &speed=<rate>    overrides master.timeScale()
     "copy link" writes filename?debug=1&t=..&speed=.. to the clipboard
     (falls back to window.prompt when the clipboard is blocked).
   - Times shown/seeked are master-timeline seconds (pre-timeScale), so a
     deep link is stable whatever the playback speed.
   - Requires gsap core loaded (uses gsap.ticker).
   ===================================================================== */
// Dev scrubber — hidden unless ?debug=1. Deep-link with &t=<seconds>
// (auto-pauses at that exact frame) and/or &speed=<rate>. "copy link"
// captures the current time+speed into the URL for round-tripping.
// Contract: needs a global `master` (gsap timeline) and `sceneLabels`
// ({navKey: 'labelName'}); scene buttons are generated from sceneLabels.
(function(){
  var params = new URLSearchParams(location.search);
  if (!params.has('debug')) return;

  var speedParam = parseFloat(params.get('speed'));
  if (!isNaN(speedParam) && speedParam > 0) master.timeScale(speedParam);

  var tParam = parseFloat(params.get('t'));
  if (!isNaN(tParam)) { master.pause(); master.seek(Math.min(Math.max(tParam, 0), master.duration()), false); }

  var style = document.createElement('style');
  style.textContent =
    '#dev-scrubber{position:fixed;left:0;right:0;bottom:0;z-index:9999;display:flex;align-items:center;gap:10px;'+
    'padding:8px 14px;background:rgba(20,20,22,.92);backdrop-filter:blur(6px);'+
    'font:12px/1.4 -apple-system,BlinkMacSystemFont,system-ui,sans-serif;color:#eee;}'+
    '#dev-scrubber input[type=range]{flex:1;accent-color:#16E6FF;}'+
    '#dev-scrubber button{background:#2a2a2e;color:#eee;border:1px solid #444;border-radius:5px;padding:4px 10px;cursor:pointer;font:inherit;}'+
    '#dev-scrubber button:hover{background:#3a3a3f;}'+
    '#dev-scrubber button.active{background:#0B7285;border-color:#16E6FF;}'+
    '#dev-scrubber input[type=number]{background:#1a1a1c;color:#eee;border:1px solid #444;border-radius:4px;padding:3px 4px;font:inherit;}'+
    '#dev-scrubber #dv-time{font-variant-numeric:tabular-nums;white-space:nowrap;}'+
    '#dev-scrubber .dv-scenes{display:flex;gap:3px;}';
  document.head.appendChild(style);

  var sceneButtons = Object.keys(sceneLabels).map(function(k, i){
    return '<button data-scene="'+k+'" type="button" title="'+k+'">'+(i+1)+'</button>';
  }).join('');

  var bar = document.createElement('div');
  bar.id = 'dev-scrubber';
  bar.innerHTML =
    '<button id="dv-play" type="button" title="play/pause"></button>'+
    '<input id="dv-seek" type="range" min="0" step="0.01">'+
    '<span id="dv-time">0.00 / 0.00</span>'+
    '<label>speed <input id="dv-speed" type="number" step="0.05" min="0.05" style="width:52px"></label>'+
    '<span class="dv-scenes">'+ sceneButtons +'</span>'+
    '<button id="dv-copy" type="button">copy link</button>';
  document.body.appendChild(bar);

  var playBtn = bar.querySelector('#dv-play');
  var seek = bar.querySelector('#dv-seek');
  var timeLabel = bar.querySelector('#dv-time');
  var speedInput = bar.querySelector('#dv-speed');
  var copyBtn = bar.querySelector('#dv-copy');
  var dur = master.duration();
  var scrubbing = false;

  seek.max = dur;
  speedInput.value = master.timeScale();

  function fmt(n){ return n.toFixed(2); }
  function activeScene(){
    var t = master.time(), best = null;
    Object.keys(sceneLabels).forEach(function(k){
      var lt = master.labels[sceneLabels[k]];
      if (lt !== undefined && lt <= t + 0.001) best = k;
    });
    return best;
  }
  function syncUI(){
    if (!scrubbing) seek.value = master.time();
    timeLabel.textContent = fmt(master.time()) + ' / ' + fmt(dur);
    playBtn.textContent = master.paused() ? '▶' : '⏸';
    var scene = activeScene();
    bar.querySelectorAll('.dv-scenes button').forEach(function(b){
      b.classList.toggle('active', b.getAttribute('data-scene') === scene);
    });
  }

  seek.addEventListener('pointerdown', function(){ scrubbing = true; master.pause(); });
  seek.addEventListener('input', function(){ master.seek(parseFloat(seek.value), false); syncUI(); });
  seek.addEventListener('pointerup', function(){ scrubbing = false; });

  playBtn.addEventListener('click', function(){
    if (master.paused()) master.play(); else master.pause();
    syncUI();
  });

  speedInput.addEventListener('change', function(){
    var v = parseFloat(speedInput.value);
    if (v > 0) master.timeScale(v);
  });

  bar.querySelectorAll('.dv-scenes button').forEach(function(b){
    b.addEventListener('click', function(){
      master.pause();
      master.seek(sceneLabels[b.getAttribute('data-scene')], false);
      syncUI();
    });
  });

  copyBtn.addEventListener('click', function(){
    var url = new URL(location.href);
    url.searchParams.set('debug', '1');
    url.searchParams.set('t', master.time().toFixed(3));
    url.searchParams.set('speed', master.timeScale());
    // filename + query only — not the full directory path, this'll differ
    // per machine/host anyway (local server, file://, WordPress, ...)
    var str = url.pathname.split('/').pop() + url.search;
    navigator.clipboard.writeText(str).then(function(){
      copyBtn.textContent = 'copied!';
      setTimeout(function(){ copyBtn.textContent = 'copy link'; }, 1000);
    }).catch(function(){
      window.prompt('Clipboard blocked — copy manually:', str); // e.g. file:// or denied permission
    });
  });

  gsap.ticker.add(syncUI);
  syncUI();
})();
