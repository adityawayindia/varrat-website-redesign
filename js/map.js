/* Odisha district map. Boundaries: udit-001/india-maps-data (district GeoJSON), drawn with d3-geo. */
(function () {
  var NGO = [['Kendrapara', 'Kendrapara'], ['Kendujhar', 'Keonjhar'], ['Jajpur', 'Jajpur'], ['Bhadrak', 'Bhadrak'], ['Khordha', 'Khordha'], ['Cuttack', 'Cuttack'],
    ['Balasore', 'Balasore'], ['Mayurbhanj', 'Mayurbhanj'], ['Dhenkanal', 'Dhenkanal'], ['Jagatsinghpur', 'Jagatsinghpur'], ['Puri', 'Puri']];
  var idx = {}, label = {};
  NGO.forEach(function (n, i) { idx[n[0]] = i; label[n[0]] = n[1]; });
  var tip = document.getElementById('tip'), wrap = document.getElementById('wrap');
  var W = 620, H = 640;

  fetch('https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@2884453/geojson/states/odisha.geojson')
    .then(function (r) { return r.json(); })
    .then(function (g) {
      var svg = d3.select('#map').attr('viewBox', '0 0 ' + W + ' ' + H);
      var proj = d3.geoMercator().fitExtent([[24, 24], [W - 24, H - 56]], g), path = d3.geoPath(proj);
      var isOn = function (d) { return d.properties.district in idx; };
      var cur = {k: 1, x: 0, y: 0}, zoomG = svg.append('g');
      var feats = g.features.slice().sort(function (a, b) { return isOn(a) - isOn(b); });

      function show(name, x, y) {
        var r = wrap.getBoundingClientRect(), s = Math.min(r.width / W, r.height / H);
        tip.textContent = name;
        x = x * cur.k + cur.x; y = y * cur.k + cur.y;
        tip.style.left = (r.width / 2 + (x - W / 2) * s) + 'px';
        tip.style.top = (r.height / 2 + (y - H / 2) * s) + 'px';
        tip.style.opacity = 1;
      }
      function hide() { tip.style.opacity = 0; }

      var shapes = zoomG.append('g').selectAll('path').data(feats).join('path')
        .attr('d', path).style('vector-effect', 'non-scaling-stroke').attr('class', function (d) { return 'd ' + (isOn(d) ? 'on' : 'off'); })
        .on('mouseenter', function (e, d) {
          var c = path.centroid(d);
          show(isOn(d) ? label[d.properties.district] + ' · Varrat' : d.properties.district, c[0], c[1]);
        }).on('mouseleave', hide);

      var pins = zoomG.append('g').style('opacity', 0).style('pointer-events', 'none').selectAll('g').data(feats.filter(isOn)).join('g').attr('class', 'pin')
        .attr('transform', function (d) { var c = path.centroid(d); return 'translate(' + c[0] + ',' + c[1] + ')'; });
      pins.append('rect').attr('class', 'trunk').attr('x', -2.5).attr('y', 4).attr('width', 5).attr('height', 12).attr('rx', 2);
      pins.append('circle').attr('class', 'canopy').attr('cx', 0).attr('cy', -6).attr('r', 13);
      pins.append('text').attr('y', -6).text(function (d) { return String(idx[d.properties.district] + 1).padStart(2, '0'); });
      pins.on('mouseenter', function (e, d) { var c = path.centroid(d); show(label[d.properties.district], c[0], c[1]); }).on('mouseleave', hide);

      /* zoom target: bounds of Varrat districts */
      var on = g.features.filter(isOn), x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      on.forEach(function (f) { var b = path.bounds(f); x0 = Math.min(x0, b[0][0]); y0 = Math.min(y0, b[0][1]); x1 = Math.max(x1, b[1][0]); y1 = Math.max(y1, b[1][1]); });
      var bw = W - 48, bh = H - 80, K = Math.min(bw / (x1 - x0), bh / (y1 - y0));
      var TX = 24 + (bw - K * (x1 - x0)) / 2 - K * x0, TY = 24 + (bh - K * (y1 - y0)) / 2 - K * y0;
      pins.attr('transform', function (d) { var c = path.centroid(d); return 'translate(' + c[0] + ',' + c[1] + ') scale(' + (1 / K) + ')'; });
      function apply() { zoomG.attr('transform', 'translate(' + cur.x + ',' + cur.y + ') scale(' + cur.k + ')'); }
      function zoomIn() {
        zoomG.interrupt(); pins.interrupt();
        zoomG.transition().delay(900).duration(2200).ease(d3.easeCubicInOut).tween('z', function () {
          var ik = d3.interpolateNumber(cur.k, K), ix = d3.interpolateNumber(cur.x, TX), iy = d3.interpolateNumber(cur.y, TY);
          return function (t) { cur = {k: ik(t), x: ix(t), y: iy(t)}; apply(); };
        }).on('end', function () { pins.style('pointer-events', null).transition().duration(500).style('opacity', 1); });
      }
      function reset() { zoomG.interrupt(); pins.interrupt().style('opacity', 0).style('pointer-events', 'none'); cur = {k: 1, x: 0, y: 0}; apply(); }
      new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? zoomIn() : reset(); }); }, {threshold: 0.5}).observe(wrap);

      /* the host page sends {type:'hl', i} when a district in the list is hovered */
      window.addEventListener('message', function (e) {
        if (!e.data || e.data.type !== 'hl') return;
        var i = e.data.i;
        shapes.classed('hl', function (d) { return isOn(d) && idx[d.properties.district] === i; });
        pins.classed('hl', function (d) { return idx[d.properties.district] === i; });
        if (i >= 0) {
          var d = feats.find(function (f) { return idx[f.properties.district] === i; }), c = path.centroid(d);
          show(label[d.properties.district], c[0], c[1]);
        } else hide();
      });
    })
    .catch(function () { document.getElementById('err').style.display = 'flex'; });
})();
