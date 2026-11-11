(() => {
  const API = '../../api/platform.php';
  const $ = (id) => document.getElementById(id);
  const list = $('rewardList');
  const esc = (v) =>
    String(v ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));

  async function load() {
    try {
      const r = await fetch(API + '?action=rewards', { credentials: 'same-origin' });
      const d = await r.json();

      if (!r.ok || !d.success) {
        throw Error(d.message || 'Gagal memuat reward');
      }

      $('rewardBalance').textContent = Number(d.balance).toLocaleString('id-ID');
      list.innerHTML = (d.rewards || [])
        .map(
          (x) => `
            <article class="card platform-card">
              <span class="pill green">Voucher diskon seminar</span>
              <h3>${esc(x.name)}</h3>
              <p>${esc(x.description)}</p>
              <div class="platform-meta">
                <b>${Number(x.points_required).toLocaleString('id-ID')} poin</b>
              </div>
              <button class="btn" data-redeem="${x.id}" ${d.balance < x.points_required ? 'disabled' : ''}>Tukarkan poin</button>
            </article>
          `
        )
        .join('') || '<article class="card platform-empty">Belum ada voucher tersedia.</article>';

      list.querySelectorAll('[data-redeem]').forEach((b) => {
        b.onclick = async () => {
          if (!confirm('Tukarkan poin untuk voucher ini?')) return;

          try {
            const rr = await fetch(API + '?action=redeem', {
              method: 'POST',
              credentials: 'same-origin',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reward_id: +b.dataset.redeem })
            });
            const dd = await rr.json();

            if (!rr.ok || !dd.success) {
              throw Error(dd.message || 'Penukaran gagal');
            }

            alert(dd.message + '\nKode voucher: ' + dd.voucher_code);
            await load();
          } catch (e) {
            alert(e.message);
          }
        };
      });

      const h = d.history || [];
      $('rewardHistory').innerHTML = h.length
        ? `<div class="table-wrap"><table class="platform-table"><thead><tr><th>Voucher</th><th>Kode</th><th>Status</th><th>Tanggal</th></tr></thead><tbody>${h
            .map(
              (x) => `
                <tr>
                  <td>${esc(x.name)}</td>
                  <td><span class="voucher-code">${esc(x.voucher_code || '-')}</span></td>
                  <td>${esc(x.status)}</td>
                  <td>${esc(x.created_at)}</td>
                </tr>
              `
            )
            .join('')}</tbody></table></div>`
        : 'Belum ada penukaran.';
    } catch (e) {
      list.innerHTML = `<article class="card platform-error">${esc(e.message)}<p>Jalankan database-upgrade.sql terlebih dahulu.</p></article>`;
    }
  }

  load();
})();
