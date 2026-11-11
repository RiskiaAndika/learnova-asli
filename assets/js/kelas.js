(() => {
    const API = '../../api/classes.php';
    const $ = (id) => document.getElementById(id);
    const form = $('classForm');
    if (!form) {
        return;
    }

    const card = $('classFormCard');
    const list = $('classList');
    const message = $('classFormMessage');
    const saveBtn = $('saveClassBtn');

    const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    }[c]));

    function showForm(show) {
        card.hidden = !show;
        if (show) {
            $('classTitle').focus();
        }
    }

    $('openClassForm').addEventListener('click', () => showForm(true));
    $('closeClassForm').addEventListener('click', () => showForm(false));

    function formatDate(value) {
        if (!value) {
            return 'Jadwal belum ditentukan';
        }

        const d = new Date(String(value).replace(' ', 'T'));
        return Number.isNaN(d.getTime()) ? 'Jadwal belum ditentukan' : d.toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    }

    function renderClasses(items) {
        $('classCount').textContent = `${items.length} kelas`;

        if (!items.length) {
            list.innerHTML = '<div class="card class-empty"><div class="empty-icon">▤</div><h3>Belum ada seminar</h3><p class="muted">Yuk, buat seminar pertamamu dan mulai berbagi ilmu dengan murid.</p><button class="btn" type="button" id="emptyAddBtn">＋ Buat Seminar Pertama</button></div>';
            $('emptyAddBtn').addEventListener('click', () => showForm(true));
            return;
        }

        list.innerHTML = items.map((item) => `<article class="card class-card">
      <div class="class-card-top"><span class="class-status ${item.status === 'published' ? 'is-published' : ''}">${item.status === 'published' ? 'Dipublikasikan' : 'Draft'}</span><span class="class-symbol">▤</span></div>
      <h3>${escapeHTML(item.title)}</h3><p class="class-description">${escapeHTML(item.description || 'Belum ada deskripsi seminar.')}</p>
      <div class="class-meta"><span>◷ ${escapeHTML(formatDate(item.schedule))}</span></div>
      ${item.status === 'published' ? '<p class="publish-note">Seminar sudah tampil di Seminar murid.</p>' : `<button class="btn publish-btn" type="button" data-publish="${Number(item.id)}">Publikasikan ke Seminar</button>`}
    </article>`).join('');

        list.querySelectorAll('[data-publish]').forEach((btn) => btn.addEventListener('click', () => publishClass(btn.dataset.publish, btn)));
    }

    async function loadClasses() {
        list.innerHTML = '<div class="card loading-card">Memuat seminar...</div>';

        try {
            const r = await fetch(API, { credentials: 'same-origin' });
            const d = await r.json();

            if (!r.ok || !d.success) {
                throw new Error(d.message || 'Gagal memuat seminar.');
            }

            renderClasses(d.classes || []);
        } catch (e) {
            list.innerHTML = `<div class="card class-error">${escapeHTML(e.message)}<p class="muted">Periksa koneksi Apache, MySQL, dan database Learnova.</p><button class="btn ghost" id="retryClasses" type="button">Coba Lagi</button></div>`;
            $('retryClasses').addEventListener('click', loadClasses);
        }
    }

    async function publishClass(id, btn) {
        btn.disabled = true;
        btn.textContent = 'Memublikasikan...';

        try {
            const r = await fetch(API, {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'publish', id }),
            });
            const d = await r.json();

            if (!r.ok || !d.success) {
                throw new Error(d.message || 'Gagal memublikasikan seminar.');
            }

            await loadClasses();
        } catch (e) {
            btn.disabled = false;
            btn.textContent = e.message;
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        message.textContent = '';
        saveBtn.disabled = true;
        saveBtn.textContent = 'Menyimpan...';

        try {
            const r = await fetch(API, {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
            });
            const d = await r.json();

            if (!r.ok || !d.success) {
                throw new Error(d.message || 'seminar gagal disimpan.');
            }

            form.reset();
            message.textContent = d.message;
            message.className = 'class-message success';
            await loadClasses();
            setTimeout(() => showForm(false), 1200);
        } catch (e) {
            message.textContent = e.message;
            message.className = 'class-message error';
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Simpan seminar';
        }
    });

    loadClasses();
})();
