(() => {
  const API = '../../api/platform.php';
  const $ = (id) => document.getElementById(id);
  const form = $('quizForm');
  const list = $('quizList');
  let qn = 0;

  const esc = (v) =>
    String(v ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));

  async function get(action) {
    const r = await fetch(API + '?action=' + action, { credentials: 'same-origin' });
    const d = await r.json();
    if (!r.ok || !d.success) throw Error(d.message || 'Gagal memuat data');
    return d;
  }

  async function post(action, data) {
    const r = await fetch(API + '?action=' + action, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const d = await r.json();
    if (!r.ok || !d.success) throw Error(d.message || 'Gagal');
    return d;
  }

  function addQuestion() {
    const n = ++qn;
    const el = document.createElement('section');
    el.className = 'quiz-question';
    el.innerHTML = `
      <div class="platform-intro">
        <h3>Soal ${n}</h3>
        <button type="button" class="btn danger remove-question">Hapus</button>
      </div>
      <div class="field">
        <label>Pertanyaan</label>
        <textarea class="q-text" rows="2" required></textarea>
      </div>
      <div class="platform-form-row">
        ${['A', 'B', 'C', 'D']
          .map(
            (k) => `
              <div class="field">
                <label>Pilihan ${k}</label>
                <input class="q-${k}" required>
              </div>
            `
          )
          .join('')}
      </div>
      <div class="field">
        <label>Jawaban benar</label>
        <select class="q-correct">
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
      </div>
    `;

    el.querySelector('.remove-question').onclick = () => el.remove();
    $('questionList').appendChild(el);
  }

  $('showQuizForm').onclick = () => {
    form.hidden = false;
    form.scrollIntoView({ behavior: 'smooth' });
  };
  $('cancelQuiz').onclick = () => (form.hidden = true);
  $('addQuestion').onclick = addQuestion;

  async function load() {
    try {
      const [c, q] = await Promise.all([get('classes'), get('quizzes')]);
      const own = c.classes || [];

      $('quizClass').innerHTML = own
        .map((x) => `<option value="${x.id}">${esc(x.title)}</option>`)
        .join('');

      if (!own.length) {
        $('quizClass').innerHTML = '<option value="">Buat kelas terlebih dahulu</option>';
      }

      $('quizCount').textContent = (q.quizzes || []).length + ' kuis';

      if (!q.quizzes.length) {
        list.innerHTML = '<article class="card platform-empty"><h3>Belum ada kuis</h3><p>Buat kuis pertama untuk kelasmu.</p></article>';
      } else {
        list.innerHTML = q.quizzes
          .map(
            (x) => `
              <article class="card platform-card">
                <span class="pill ${x.is_published == 1 ? 'green' : 'orange'}">${x.is_published == 1 ? 'Dipublikasikan' : 'Draft'}</span>
                <h3>${esc(x.title)}</h3>
                <p>${esc(x.description || '')}</p>
                <div class="platform-meta">
                  <span>Kelas: ${esc(x.class_title)}</span>
                  <span>• ${x.question_count} soal</span>
                </div>
                ${x.is_published == 1 ? '<span class="pill green">Tayang untuk murid</span>' : `<button class="btn" data-publish="${x.id}">Publikasikan kuis</button>`}
              </article>
            `
          )
          .join('');

        list.querySelectorAll('[data-publish]').forEach((b) =>
          b.onclick = async () => {
            try {
              await post('publish_quiz', { id: +b.dataset.publish });
              await load();
            } catch (e) {
              alert(e.message);
            }
          }
        );
      }
    } catch (e) {
      list.innerHTML = `<article class="card platform-error">${esc(e.message)}<p>Pastikan kamu sudah membuat kelas dan menjalankan migrasi database.</p></article>`;
    }
  }

  form.onsubmit = async (e) => {
    e.preventDefault();
    const questions = [...document.querySelectorAll('.quiz-question')].map((el) => ({
      question: el.querySelector('.q-text').value,
      A: el.querySelector('.q-A').value,
      B: el.querySelector('.q-B').value,
      C: el.querySelector('.q-C').value,
      D: el.querySelector('.q-D').value,
      correct: el.querySelector('.q-correct').value
    }));

    const data = Object.fromEntries(new FormData(form));
    data.questions = questions;

    try {
      await post('create_quiz', data);
      $('quizMessage').textContent = 'Kuis tersimpan sebagai draft.';
      $('quizMessage').className = 'platform-message success';
      form.reset();
      $('questionList').innerHTML = '';
      qn = 0;
      addQuestion();
      form.hidden = true;
      await load();
    } catch (e) {
      $('quizMessage').textContent = e.message;
      $('quizMessage').className = 'platform-message error';
    }
  };

  addQuestion();
  load();
})();
