(() => {
  const API = '../../api/platform.php';
  const list = document.getElementById('scheduleList');

  if (!list) return;

  const esc = (v) =>
    String(v ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));

  (async () => {
    try {
      const r = await fetch(API + '?action=schedules', { credentials: 'same-origin' });
      const d = await r.json();

      if (!r.ok || !d.success) {
        throw Error(d.message || 'Gagal memuat jadwal.');
      }

      const a = d.schedules || [];
      if (!a.length) {
        list.innerHTML = '<article class="card platform-empty"><h3>Belum ada jadwal</h3><p>Jadwal seminar akan muncul di sini setelah seminar dibuat dan diikuti.</p></article>';
        return;
      }

      list.innerHTML = a
        .map((x) => {
          let dt = x.schedule ? new Date(String(x.schedule).replace(' ', 'T')) : null;
          return `
            <article class="card platform-card">
              <span class="pill green">${dt && !isNaN(dt) ? dt.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Jadwal'}</span>
              <h3>${esc(x.title)}</h3>
              <p>${esc(x.description || '')}</p>
              <div class="platform-meta">
                <span>◷ ${dt && !isNaN(dt) ? dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Waktu belum ditentukan'}</span>
                ${x.organizer_name ? `<span>• Pengajar: ${esc(x.organizer_name)}</span>` : ''}
              </div>
            </article>
          `;
        })
        .join('');
    } catch (e) {
      list.innerHTML = `<article class="card platform-error">${esc(e.message)}</article>`;
    }
  })();
})();
