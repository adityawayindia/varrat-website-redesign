/* Reusable Odisha-inspired motif: a tiled rosette pattern plus a slowly turning wheel.
   Usage: <div class="motif" data-motif data-stroke="rgba(255,255,255,.16)"
               data-dot="rgba(255,140,120,.55)" data-wheel-stroke="rgba(255,255,255,.22)"></div>
   Put it inside any position:relative section. Add data-wheel="false" to hide the wheel. */
(function () {
  var NS = 'http://www.w3.org/2000/svg', uid = 0;
  var f = function (n) { return n.toFixed(1); };

  function el(name, attrs, parent) {
    var node = document.createElementNS(NS, name);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }

  function build(host) {
    var stroke = host.dataset.stroke || 'rgba(255,255,255,0.16)';
    var dot = host.dataset.dot || 'rgba(255,140,120,0.55)';
    var wheelStroke = host.dataset.wheelStroke || 'rgba(255,255,255,0.22)';
    var id = 'motif-tile-' + (++uid);

    /* tiled rosette */
    var tile = el('svg', { 'class': 'motif__tile', 'aria-hidden': 'true' }, host);
    var defs = el('defs', {}, tile);
    var pat = el('pattern', { id: id, width: 120, height: 120, patternUnits: 'userSpaceOnUse' }, defs);
    var g = el('g', { fill: 'none', stroke: stroke, 'stroke-width': 1.2 }, pat);
    el('circle', { cx: 60, cy: 60, r: 5 }, g);
    el('circle', { cx: 60, cy: 60, r: 20 }, g);
    for (var i = 0; i < 8; i++) {
      var a = i * Math.PI / 4;
      el('path', { d: 'M' + f(60 + Math.cos(a) * 5) + ' ' + f(60 + Math.sin(a) * 5) + 'L' + f(60 + Math.cos(a) * 20) + ' ' + f(60 + Math.sin(a) * 20) }, g);
      el('circle', { cx: f(60 + Math.cos(a) * 30), cy: f(60 + Math.sin(a) * 30), r: i % 2 ? 3 : 5 }, g);
    }
    el('path', { d: 'M60 6l6 6-6 6-6-6z M6 60l6 6-6 6-6-6z M114 60l6 6-6 6-6-6z M60 102l6 6-6 6-6-6z' }, g);
    [[0, 0], [120, 0], [0, 120], [120, 120]].forEach(function (p) {
      el('circle', { cx: p[0], cy: p[1], r: 3, fill: dot }, pat);
    });
    el('rect', { width: '100%', height: '100%', fill: 'url(#' + id + ')' }, tile);

    /* turning wheel */
    if (host.dataset.wheel !== 'false') {
      var w = el('svg', { 'class': 'motif__wheel', viewBox: '0 0 520 520', fill: 'none', stroke: wheelStroke, 'stroke-width': 2, 'aria-hidden': 'true' }, host);
      el('circle', { cx: 260, cy: 260, r: 250 }, w);
      el('circle', { cx: 260, cy: 260, r: 236, 'stroke-dasharray': '2 9' }, w);
      el('circle', { cx: 260, cy: 260, r: 170 }, w);
      el('circle', { cx: 260, cy: 260, r: 70 }, w);
      el('circle', { cx: 260, cy: 260, r: 26 }, w);
      /* tree growth rings between the hub and the spokes */
      var rings = el('g', { 'stroke-width': 1.4, opacity: 0.7 }, w);
      [88, 104, 119, 134, 148, 160].forEach(function (r, k) {
        var d = '', n = 48;
        for (var m = 0; m <= n; m++) {
          var q = m / n * Math.PI * 2, rr = r + Math.sin(q * 3 + k * 1.7) * 2.6 + Math.sin(q * 5 + k) * 1.6;
          d += (m ? 'L' : 'M') + f(260 + 4 + Math.cos(q) * rr) + ' ' + f(260 - 3 + Math.sin(q) * rr);
        }
        el('path', { d: d + 'Z' }, rings);
      });
      for (var j = 0; j < 24; j++) {
        var b = j * Math.PI / 12, c = b + Math.PI / 24;
        el('path', { d: 'M' + f(260 + Math.cos(b) * 70) + ' ' + f(260 + Math.sin(b) * 70) + 'L' + f(260 + Math.cos(b) * 170) + ' ' + f(260 + Math.sin(b) * 170) }, w);
        el('circle', { cx: f(260 + Math.cos(c) * 205), cy: f(260 + Math.sin(c) * 205), r: 7 }, w);
      }
    }
  }

  document.querySelectorAll('[data-motif]').forEach(build);
})();
