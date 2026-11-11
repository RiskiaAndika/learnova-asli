(() => {
    const API = '../../api/platform.php';
    const $ = (id) => document.getElementById(id);
    const list = $('academyList');
    let classes = [];
    let filter = 'all';
    let pending = null;

    const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    }[c]));

    const money = (v) => 'Rp ' + Number(v || 0).toLocaleString('id-ID');

    async function call(action, data = {}, method = 'POST') {
        const r = await fetch(`${API}?action=${action}`, {
            method,
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            ...(method === 'POST' ? { body: JSON.stringify(data) } : {}),
        });

        const d = await r.json();
        if (!r.ok || !d.success) {
            throw Error(d.message || 'Terjadi kesalahan');
        }

        return d;
    }

    function render() {
        let items = classes.filter((c) => filter === 'all' || (filter === 'joined' ? ['free', 'paid'].includes(c.payment_status) : !c.payment_status));
        $('academyCount').textContent = items.length + ' kelas';

        if (!items.length) {
            list.innerHTML = '<article class="card platform-empty"><h3>Belum ada seminar di sini</h3><p>Coba pilih kategori lain atau tunggu pengajar memublikasikan seminar.</p></article>';
            return;
        }

        list.innerHTML = items.map((c) => {
            let joined = ['free', 'paid'].includes(c.payment_status);
            let isPending = c.payment_status === 'pending';

            return `<article class="card platform-card"><div class="platform-meta"><span class="pill ${c.access_type === 'paid' ? 'orange' : 'green'}">${c.access_type === 'paid' ? 'Berbayar' : 'Gratis'}</span>${joined ? '<span class="pill green">Sudah diikuti</span>' : isPending ? '<span class="pill orange">Menunggu pembayaran</span>' : ''}</div><h3>${esc(c.title)}</h3><p>${esc(c.description || 'Belum ada deskripsi seminar.')}</p><div class="platform-meta"><span>Pengajar: ${esc(c.organizer_name)}</span><span>• ${esc(c.schedule || 'Jadwal menyusul')}</span></div><strong>${c.access_type === 'paid' ? money(c.price) : 'Gratis'}</strong><div class="platform-actions">${joined ? '<span class="pill green">Seminar aktif di Jadwal</span>' : isPending ? `<button class="btn" data-pay="${c.id}">Lanjutkan pembayaran demo</button>` : `<button class="btn" data-join="${c.id}">${c.access_type === 'paid' ? 'Daftar & bayar' : 'Gabung seminar gratis'}</button>`}</div></article>`;
        }).join('');

        list.querySelectorAll('[data-join]').forEach((b) => {
            b.onclick = async () => {
                try {
                    const d = await call('join_class', { class_id: +b.dataset.join });
                    if (d.status === 'joined') {
                        alert(d.message);
                        await load();
                    } else {
                        pending = +b.dataset.join;
                        $('paymentText').textContent = `Pesanan ${d.payment_reference} dibuat dengan total ${money(d.price)}. Untuk pengujian, kamu dapat menyelesaikan pembayaran simulasi.`;
                        $('paymentBox').hidden = false;
                        $('paymentBox').scrollIntoView({ behavior: 'smooth' });
                    }
                } catch (e) {
                    alert(e.message);
                }
            };
        });

        list.querySelectorAll('[data-pay]').forEach((b) => {
            b.onclick = () => {
                pending = +b.dataset.pay;
                $('paymentText').textContent = 'Selesaikan pembayaran simulasi untuk membuka seminar.';
                $('paymentBox').hidden = false;
            };
        });
    }

    async function load() {
        try {
            const d = await call('classes', {}, 'GET');
            classes = d.classes || [];
            render();
        } catch (e) {
            list.innerHTML = `<article class="card platform-error">${esc(e.message)}<p>Pastikan database upgrade telah dijalankan.</p><button class="btn" id="retryAcademy">Coba lagi</button></article>`;
            $('retryAcademy').onclick = load;
        }
    }

    document.querySelectorAll('[data-filter]').forEach((b) => {
        b.onclick = () => {
            filter = b.dataset.filter;
            document.querySelectorAll('[data-filter]').forEach((x) => x.className = 'btn secondary');
            b.className = 'btn';
            render();
        };
    });

    $('demoPay').onclick = async () => {
        if (!pending) {
            return;
        }

        try {
            const d = await call('demo_pay', { class_id: pending });
            alert(d.message);
            $('paymentBox').hidden = true;
            pending = null;
            await load();
        } catch (e) {
            alert(e.message);
        }
    };

    $('cancelPay').onclick = () => {
        $('paymentBox').hidden = true;
        pending = null;
    };

    load();
})();