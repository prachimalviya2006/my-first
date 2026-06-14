/**
 * EcoTrace – charts.js
 * Lightweight canvas-based charts (no external library needed)
 */

const Charts = (() => {
  const FONT   = "'Space Grotesk', 'Inter', sans-serif";
  const COLORS = { grid:'#E8EEEB', text:'#636E72', line:'#52B788', bg:'rgba(82,183,136,0.08)' };

  // ── Helpers ──────────────────────────────────────────────────────────────
  function getDpr() { return Math.min(window.devicePixelRatio || 1, 2); }

  function setupCanvas(canvas) {
    const dpr = getDpr();
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, w: rect.width, h: rect.height };
  }

  function roundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ── Line Chart (Monthly Trend) ────────────────────────────────────────────
  function drawTrendChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    canvas.style.width  = '100%';
    canvas.style.height = '160px';

    setTimeout(() => {
      const { ctx, w, h } = setupCanvas(canvas);
      const pad = { top: 16, right: 16, bottom: 36, left: 44 };
      const chartW = w - pad.left - pad.right;
      const chartH = h - pad.top - pad.bottom;

      const allVals = [...data.thisYear, ...data.lastYear];
      const maxV = Math.max(...allVals) * 1.1;
      const minV = Math.min(...allVals) * 0.85;
      const range = maxV - minV;

      function xPos(i) { return pad.left + (i / (data.labels.length - 1)) * chartW; }
      function yPos(v) { return pad.top + chartH - ((v - minV) / range) * chartH; }

      // Grid lines
      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = pad.top + (i / 4) * chartH;
        ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + chartW, y); ctx.stroke();
        const val = maxV - (i / 4) * range;
        ctx.fillStyle = COLORS.text;
        ctx.font = `10px ${FONT}`;
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(val), pad.left - 6, y + 4);
      }

      // Area fill – thisYear
      ctx.beginPath();
      ctx.moveTo(xPos(0), yPos(data.thisYear[0]));
      data.thisYear.forEach((v, i) => ctx.lineTo(xPos(i), yPos(v)));
      ctx.lineTo(xPos(data.thisYear.length - 1), pad.top + chartH);
      ctx.lineTo(xPos(0), pad.top + chartH);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
      grad.addColorStop(0, 'rgba(82,183,136,0.22)');
      grad.addColorStop(1, 'rgba(82,183,136,0.00)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Line – lastYear
      ctx.beginPath();
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 3]);
      data.lastYear.forEach((v, i) => i === 0 ? ctx.moveTo(xPos(i), yPos(v)) : ctx.lineTo(xPos(i), yPos(v)));
      ctx.stroke();
      ctx.setLineDash([]);

      // Line – thisYear
      ctx.beginPath();
      ctx.strokeStyle = '#52B788';
      ctx.lineWidth = 2.5;
      data.thisYear.forEach((v, i) => i === 0 ? ctx.moveTo(xPos(i), yPos(v)) : ctx.lineTo(xPos(i), yPos(v)));
      ctx.stroke();

      // Dots – thisYear
      data.thisYear.forEach((v, i) => {
        ctx.beginPath();
        ctx.arc(xPos(i), yPos(v), 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#52B788';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // X labels
      ctx.fillStyle = COLORS.text;
      ctx.font = `10px ${FONT}`;
      ctx.textAlign = 'center';
      data.labels.forEach((lbl, i) => {
        ctx.fillText(lbl, xPos(i), h - 10);
      });
    }, 50);
  }

  // ── Donut Chart (Breakdown) ───────────────────────────────────────────────
  function drawBreakdownChart(canvasId, legendId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    canvas.style.width  = '100%';
    canvas.style.height = '160px';

    setTimeout(() => {
      const { ctx, w, h } = setupCanvas(canvas);
      const cx = w / 2, cy = h / 2;
      const r  = Math.min(w, h) * 0.4;
      const ir = r * 0.58;

      const total = data.values.reduce((a, b) => a + b, 0) || 1;
      let startAngle = -Math.PI / 2;

      data.values.forEach((val, i) => {
        const slice = (val / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startAngle, startAngle + slice);
        ctx.closePath();
        ctx.fillStyle = data.colors[i];
        ctx.fill();
        startAngle += slice;
      });

      // Inner hole
      ctx.beginPath();
      ctx.arc(cx, cy, ir, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      // Center label
      ctx.fillStyle = '#1B4332';
      ctx.font = `bold 14px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CO₂e', cx, cy + 1);

      // Legend
      const legend = document.getElementById(legendId);
      if (legend) {
        legend.innerHTML = data.labels.map((lbl, i) => `
          <div class="breakdown-legend-item">
            <div class="legend-swatch" style="background:${data.colors[i]}"></div>
            <span>${lbl}</span>
          </div>`).join('');
      }
    }, 50);
  }

  // ── Horizontal Bar Chart (Comparison) ────────────────────────────────────
  function drawComparisonChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    canvas.style.width  = '100%';
    canvas.style.height = '200px';

    setTimeout(() => {
      const { ctx, w, h } = setupCanvas(canvas);
      const pad = { top: 8, right: 60, bottom: 8, left: 100 };
      const chartW = w - pad.left - pad.right;
      const chartH = h - pad.top - pad.bottom;
      const maxV = Math.max(...data.values) * 1.15;
      const n = data.labels.length;
      const barH = Math.min(28, (chartH / n) * 0.6);
      const rowH = chartH / n;

      data.values.forEach((val, i) => {
        const y = pad.top + i * rowH + (rowH - barH) / 2;
        const bw = (val / maxV) * chartW;

        // Track
        roundedRect(ctx, pad.left, y, chartW, barH, barH / 2);
        ctx.fillStyle = '#F0F4F2';
        ctx.fill();

        // Bar
        if (bw > barH) {
          roundedRect(ctx, pad.left, y, bw, barH, barH / 2);
        } else {
          ctx.beginPath();
          ctx.arc(pad.left + barH / 2, y + barH / 2, barH / 2, 0, Math.PI * 2);
          ctx.closePath();
        }
        ctx.fillStyle = data.colors[i];
        ctx.fill();

        // Label
        ctx.fillStyle = '#2D3436';
        ctx.font = `500 11px ${FONT}`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(data.labels[i], pad.left - 8, y + barH / 2);

        // Value
        ctx.fillStyle = data.colors[i];
        ctx.font = `700 11px ${FONT}`;
        ctx.textAlign = 'left';
        ctx.fillText(`${val}t`, pad.left + bw + 6, y + barH / 2);
      });
    }, 50);
  }

  // ── Public API ────────────────────────────────────────────────────────────
  return { drawTrendChart, drawBreakdownChart, drawComparisonChart };
})();