(() => {
  const API = '../../api/platform.php';
  const $ = (id) => document.getElementById(id);
  const list = $('studentQuizList');

  let current = null;
  let questions = [];
  let answers = {};
  let index = 0;
  let timer = null;
  let seconds = 20;
  let locked = false;
  let feedbackTimer = null;

  const esc = (v) =>
    String(v ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));

  async function get(action, id) {
    const r = await fetch(`${API}?action=${action}${id ? '&id=' + id : ''}`, { credentials: 'same-origin' });
    const d = await r.json();
    if (!r.ok || !d.success) throw Error(d.message || 'Gagal');
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

  function stopClocks() {
    if (timer) clearInterval(timer);
    if (feedbackTimer) clearTimeout(feedbackTimer);
    timer = null;
    feedbackTimer = null;
  }

  function renderTimer() {
    const el = $('questionTimer');
    if (el) {
      el.textContent = seconds + 's';
      el.classList.toggle('urgent', seconds <= 5);
    }
  }

  function renderQuestion() {
    stopClocks();
    locked = false;
    seconds = 20;

    const q = questions[index];
    const keys = ['A', 'B', 'C', 'D'];

    $('questionArea').innerHTML = `
      <div class="quiz-progress-row">
        <span>SOAL ${index + 1} DARI ${questions.length}</span>
        <span class="quiz-timer" id="questionTimer">20s</span>
      </div>
      <div class="quiz-progress"><i style="width:${((index + 1) / questions.length) * 100}%"></i></div>
      <section class="timed-question">
        <h3>${esc(q.question)}</h3>
        <div class="timed-options">
          ${keys
            .map(
              (k) => `
                <button type="button" class="timed-option" data-answer="${k}">
                  <span class="option-letter">${k}</span>
                  <span>${esc(q['option_' + k.toLowerCase()])}</span>
                </button>
              `
            )
            .join('')}
        </div>
      </section>
      <div id="answerFeedback" class="answer-feedback" aria-live="polite"></div>
      <p class="quiz-time-hint">Pilih jawaban sebelum waktu habis. Setiap soal memiliki waktu 20 detik.</p>
    `;

    $('questionArea')
      .querySelectorAll('[data-answer]')
      .forEach((b) => b.addEventListener('click', () => choose(b.dataset.answer)));

    renderTimer();
    timer = setInterval(() => {
      seconds--;
      renderTimer();
      if (seconds <= 0) {
        stopClocks();
        choose(null, true);
      }
    }, 1000);
  }

  async function choose(answer, timedOut = false) {
    if (locked) return;
    locked = true;
    stopClocks();

    const q = questions[index];
    $('questionArea').querySelectorAll('[data-answer]').forEach((b) => (b.disabled = true));

    const feedback = $('answerFeedback');
    feedback.className = 'answer-feedback';
    feedback.textContent = 'Memeriksa jawaban...';

    try {
      const check = await post('check_quiz_answer', {
        quiz_id: current,
        question_id: q.id,
        answer
      });

      const correctOption = String(check.correct_option || '').trim().toUpperCase();
      const right = !!check.is_correct;

      if (answer !== null) answers[String(q.id)] = answer;

      $('questionArea').querySelectorAll('[data-answer]').forEach((b) => {
        if (b.dataset.answer === correctOption) b.classList.add('correct');
        else if (b.dataset.answer === answer) b.classList.add('incorrect');
      });

      feedback.className = 'answer-feedback ' + (right ? 'is-correct' : 'is-wrong');
      feedback.innerHTML = right
        ? '<strong>✓ Jawaban benar!</strong><span>+10 poin reward</span>'
        : timedOut
          ? '<strong>Waktu habis!</strong><span>0 poin reward · Jawaban dianggap salah</span>'
          : '<strong>✕ Jawaban belum tepat</strong><span>0 poin reward</span>';

      feedbackTimer = setTimeout(() => {
        index++;
        if (index < questions.length) renderQuestion();
        else submitAttempt();
      }, 1500);
    } catch (e) {
      locked = false;
      feedback.className = 'answer-feedback is-wrong';
      feedback.innerHTML = `<strong>Gagal memeriksa jawaban</strong><span>${esc(e.message)}. Silakan pilih lagi.</span>`;
      $('questionArea').querySelectorAll('[data-answer]').forEach((b) => (b.disabled = false));
      timer = setInterval(() => {
        seconds--;
        renderTimer();
        if (seconds <= 0) {
          stopClocks();
          choose(null, true);
        }
      }, 1000);
    }
  }

  async function submitAttempt() {
    stopClocks();
    $('questionArea').innerHTML = '<div class="quiz-submit-loading">Menghitung hasil kuis...</div>';

    try {
      const d = await post('submit_quiz', { quiz_id: current, answers });
      $('questionArea').innerHTML = '';
      $('quizResult').innerHTML = `
        <div class="quiz-final-result">
          <div class="result-icon">🏆</div>
          <span class="quiz-kicker">KUIS SELESAI</span>
          <h2>Kerja bagus!</h2>
          <div class="result-score">${d.score}<small>/100</small></div>
          <div class="result-stats">
            <div><strong>${d.correct_count}</strong><span>Benar</span></div>
            <div><strong>${d.total_questions - d.correct_count}</strong><span>Salah / kosong</span></div>
            <div><strong>+${d.points_awarded}</strong><span>Poin reward</span></div>
          </div>
          <p>Poin reward sudah ditambahkan ke akunmu.</p>
          <button class="btn" id="backToQuizList" type="button">Kembali ke daftar kuis</button>
        </div>
      `;

      $('backToQuizList').onclick = () => {
        $('quizPanel').hidden = true;
        load();
      };

      await load();
    } catch (e) {
      $('questionArea').innerHTML = `
        <div class="platform-error">
          ${esc(e.message)}
          <p>Jawaban belum berhasil dikirim. Silakan coba lagi.</p>
          <button class="btn" id="retrySubmit" type="button">Coba kirim lagi</button>
        </div>
      `;
      $('retrySubmit').onclick = submitAttempt;
    }
  }

  async function load() {
    try {
      const d = await get('quizzes');
      const a = d.quizzes || [];
      $('quizCount').textContent = a.length + ' kuis';

      if (!a.length) {
        list.innerHTML = '<article class="card platform-empty"><h3>Belum ada kuis tersedia</h3><p>Ikuti seminar yang memiliki kuis untuk mulai mengerjakan.</p><a class="btn" href="academy.html">Cari seminar</a></article>';
        return;
      }

      list.innerHTML = a
        .map(
          (q) => `
            <article class="card platform-card">
              <span class="pill ${q.submitted_at ? 'green' : 'orange'}">${q.submitted_at ? 'Selesai dikerjakan' : 'Belum dikerjakan'}</span>
              <h3>${esc(q.title)}</h3>
              <p>${esc(q.description || '')}</p>
              <div class="platform-meta">
                <span>Seminar: ${esc(q.class_title)}</span>
                <span>• ${q.question_count} soal</span>
              </div>
              ${q.submitted_at ? `<p>Nilai: <strong>${q.score}/100</strong> · Reward: <strong>+${q.points_awarded} poin</strong></p>` : `<button class="btn" data-start="${q.id}">Kerjakan kuis</button>`}
            </article>
          `
        )
        .join('');

      list.querySelectorAll('[data-start]').forEach((b) => (b.onclick = () => start(+b.dataset.start)));
    } catch (e) {
      list.innerHTML = `<article class="card platform-error">${esc(e.message)}</article>`;
    }
  }

  async function start(id) {
    try {
      const d = await get('quiz_detail', id);
      if (d.attempt) {
        alert('Kuis ini sudah pernah dikerjakan.');
        return;
      }

      current = id;
      questions = d.questions || [];
      answers = {};
      index = 0;

      if (!questions.length) throw Error('Kuis belum memiliki soal.');

      $('quizTitle').textContent = d.quiz.title;
      $('quizDescription').textContent = d.quiz.class_title + ' · ' + questions.length + ' soal · 20 detik per soal';
      $('quizResult').innerHTML = '';
      $('quizPanel').hidden = false;
      renderQuestion();
      $('quizPanel').scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
      alert(e.message);
    }
  }

  $('closeQuiz').onclick = () => {
    if (!confirm('Keluar dari kuis? Progres jawaban yang belum dikirim akan hilang.')) return;
    stopClocks();
    $('quizPanel').hidden = true;
    current = null;
  };

  window.addEventListener('beforeunload', stopClocks);
  load();
})();
