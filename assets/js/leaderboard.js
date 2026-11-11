(() => {
  const API = '../../api/platform.php';
  const $ = (id) => document.getElementById(id);
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
      const r = await fetch(API + '?action=leaderboard', { credentials: 'same-origin' });
      const d = await r.json();

      if (!r.ok || !d.success) {
        throw Error(d.message || 'Gagal memuat leaderboard');
      }

      const dt = new Date(d.month + '-02T12:00:00');
      $('monthLabel').textContent = dt.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      $('myPoints').textContent = Number(d.my_points).toLocaleString('id-ID');
      $('myRank').textContent = d.my_rank ? '#' + d.my_rank : 'Belum masuk 50 besar';

      const a = d.leaderboard || [];
      $('leaderboardList').innerHTML = a.length
        ? a
            .map((u, i) => `
              <div class="rank-row">
                <div class="rank-number">${i + 1}</div>
                <div>
                  <div class="rank-name">${esc(u.name)}</div>
                  <div class="rank-sub">${i < 3 ? 'Peringkat istimewa' : i < 50 ? 'Top 50' : ''}</div>
                </div>
                <b>${Number(u.points).toLocaleString('id-ID')} poin</b>
              </div>
            `)
            .join('')
        : '<div class="platform-empty"><h3>Belum ada peringkat</h3><p>Mulai ikuti seminar dan kerjakan kuis untuk mengumpulkan poin.</p></div>';
    } catch (e) {
      $('leaderboardList').textContent = e.message;
    }
  })();
})();