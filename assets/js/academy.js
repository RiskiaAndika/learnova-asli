(() => {
    const list = document.getElementById('academyList');
    if (!list) {
        return;
    }

    const API = '../../api/classes.php';
    const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    }[c]));

    function dateLabel(value) {
        if (!value) {
            return 'Jadwal belum ditentukan';
        }

        const d = new Date(String(value).replace(' ', 'T'));
        return Number.isNaN(d.getTime()) ? 'Jadwal belum ditentukan' : d.toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    }

    async function load() {
        list.innerHTML = '<div class="card loading-card">Memuat seminar...</div>';

        try {
            const r = await fetch(API, { credentials: 'same-origin' });
            const d = await r.json();

            if (!r.ok || !d.success) {
                throw new Error(d.message || 'Tidak dapat memuat seminar.');
            }

            const items = d.classes || [];
            document.getElementById('academyCount').textContent = `${items.length} seminar`;

            if (!items.length) {
                list.innerHTML = '<div class="card class-empty"><div class="empty-icon">▤</div><h3>Belum ada seminar tersedia</h3><p class="muted">Belum ada pengajar yang memublikasikan seminar. Coba cek lagi nanti.</p></div>';
                return;
            }

            list.innerHTML = items.map((c) => `<article class="card class-card">
        <div class="class-card-top"><span class="class-status is-published">Seminar tersedia</span><span class="class-symbol">▤</span></div>
        <h3>${esc(c.title)}</h3><p class="class-description">${esc(c.description || 'Belum ada deskripsi seminar.')}</p>
        <div class="class-meta"><div>Pengajar: <strong>${esc(c.organizer_name || 'Pengajar Learnova')}</strong></div><div style="margin-top:7px">◷ ${esc(dateLabel(c.schedule))}</div></div>
      </article>`).join('');
        } catch (e) {
            list.innerHTML = `<div class="card class-error">${esc(e.message)}<p class="muted">Pastikan kamu login sebagai murid dan server database berjalan.</p><button class="btn ghost" id="academyRetry" type="button">Coba Lagi</button></div>`;
            document.getElementById('academyRetry').addEventListener('click', load);
        }
    }

    load();
})();
