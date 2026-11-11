(() => {
  const API = '../../api/platform.php';
  const $ = (id) => document.getElementById(id);
  const form = $('classForm');
  const list = $('classList');
  let editing = null;

  const esc = (v) =>
    String(v ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));

  const money = (v) => 'Rp ' + Number(v || 0).toLocaleString('id-ID');

  async function call(action, data = {}, method = 'POST') {
    const r = await fetch(`${API}?action=${action}`, {
      method,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      ...(method === 'POST' ? { body: JSON.stringify(data) } : {})
    });
    const d = await r.json();
    if (!r.ok || !d.success) throw Error(d.message || 'Terjadi kesalahan');
    return d;
  }

  function openForm(item) {
    form.hidden = false;
    form.reset();
    editing = item?.id || null;

    $('formTitle').textContent = editing ? 'Edit seminar' : 'Buat seminar baru';
    form.elements.title.value = item?.title || '';
    form.elements.description.value = item?.description || '';
    form.elements.schedule.value = item?.schedule ? item.schedule.replace(' ', 'T').slice(0, 16) : '';
    form.elements.access_type.value = item?.access_type || 'free';
    form.elements.price.value = item?.price || '';
    $('priceField').hidden = form.elements.access_type.value !== 'paid';
    form.scrollIntoView({ behavior: 'smooth' });
  }

  $('showForm').onclick = () => openForm();
  $('cancelForm').onclick = () => {
    form.hidden = true;
    editing = null;
  };
  $('accessType').onchange = () => {
    $('priceField').hidden = $('accessType').value !== 'paid';
  };

  async function load() {
    try {
      const d = await call('classes', {}, 'GET');
      const items = d.classes || [];
      $('classCount').textContent = items.length + ' seminar';

      if (!items.length) {
        list.innerHTML = '<article class="card platform-empty"><h3>Belum ada seminar</h3><p>Buat seminar pertamamu untuk mulai mengajar.</p></article>';
        return;
      }

      list.innerHTML = items
        .map(
          (c) => `
            <article class="card platform-card">
              <div class="platform-meta">
                <span class="pill ${c.status === 'published' ? 'green' : 'orange'}">${c.status === 'published' ? 'Dipublikasikan' : 'Draft'}</span>
                <span class="pill">${c.access_type === 'paid' ? 'Berbayar' : 'Gratis'}</span>
              </div>
              <h3>${esc(c.title)}</h3>
              <p>${esc(c.description || 'Belum ada deskripsi.')}</p>
              <div class="platform-meta">
                <span>${c.access_type === 'paid' ? money(c.price) : 'Gratis'}</span>
                <span>• ${esc(c.schedule || 'Jadwal belum ditentukan')}</span>
                <span>• ${c.student_count} murid</span>
              </div>
              <div class="platform-actions">
                <button class="btn secondary" data-edit="${c.id}">Edit</button>
                ${c.status !== 'published' ? `<button class="btn" data-publish="${c.id}">Publikasikan</button>` : '<span class="pill green">Tampil di Seminar</span>'}
                <button class="btn danger" data-delete="${c.id}">Hapus</button>
              </div>
            </article>
          `
        )
        .join('');

      list.querySelectorAll('[data-edit]').forEach((b) => b.onclick = () => openForm(items.find((c) => c.id == b.dataset.edit)));
      list.querySelectorAll('[data-publish]').forEach((b) =>
        b.onclick = async () => {
          try {
            await call('publish_class', { id: +b.dataset.publish });
            await load();
          } catch (e) {
            alert(e.message);
          }
        }
      );
      list.querySelectorAll('[data-delete]').forEach((b) =>
        b.onclick = async () => {
          if (!confirm('Hapus seminar ini? Kuis dan keanggotaan terkait juga akan terhapus.')) return;
          try {
            await call('delete_class', { id: +b.dataset.delete });
            await load();
          } catch (e) {
            alert(e.message);
          }
        }
      );
    } catch (e) {
      list.innerHTML = `<article class="card platform-error">${esc(e.message)}<p>Pastikan database-upgrade.sql sudah dijalankan.</p><button class="btn" id="retry">Coba lagi</button></article>`;
      $('retry').onclick = load;
    }
  }

  form.onsubmit = async (e) => {
    e.preventDefault();
    const b = $('saveClass');
    b.disabled = true;
    b.textContent = 'Menyimpan...';

    const data = Object.fromEntries(new FormData(form));
    try {
      await call(editing ? 'update_class' : 'create_class', {
        ...data,
        id: editing,
        price: Number(data.price || 0)
      });
      $('formMessage').textContent = 'seminar berhasil disimpan.';
      $('formMessage').className = 'platform-message success';
      form.hidden = true;
      editing = null;
      await load();
    } catch (err) {
      $('formMessage').textContent = err.message;
      $('formMessage').className = 'platform-message error';
    } finally {
      b.disabled = false;
      b.textContent = 'Simpan Seminar';
    }
  };

  load();
})();
