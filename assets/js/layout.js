/* Learnova app shell: sidebar, topbar, hamburger (mobile), search, dark mode.
   Pakai di halaman: <body data-role="peserta|penyelenggara|admin" data-page="dashboard" data-title="Judul"> */
(function () {
  const I = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    cap: '<path d="M22 10 12 5 2 10l10 5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    quiz: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3 6 1 1 2-2M3 12l1 1 2-2M3 18l1 1 2-2"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v9H5v-9M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/><path d="m3 18 9 5 9-5"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.2 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    moon: '<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2.5.6 4 2.6 4 5"/>'
  };

  const icon = (n) => '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + I[n] + '</svg>';

  const CONFIG = {
    peserta: {
      label: 'Murid',
      groups: [
        { title: 'Utama', items: [['dashboard', 'Beranda', 'home']] },
        {
          title: 'Belajar',
          items: [['academy', 'Seminar', 'cap'], ['jadwal', 'Jadwal', 'calendar'], ['quiz', 'Quiz', 'quiz']]
        },
        {
          title: 'Pencapaian',
          items: [['leaderboard', 'Leaderboard', 'trophy'], ['penukaran', 'Penukaran', 'gift']]
        }
      ],
      hero: ['Fitur Lengkap untuk <span>Belajar</span>', 'Semua fitur dirancang agar kamu mudah mengikuti seminar, mengerjakan kuis, dan mengumpulkan poin.'],
      features: [
        ['academy', 'Seminar', 'Temukan dan ikuti seminar yang tersedia.', 'cap', 'g1'],
        ['jadwal', 'Jadwal', 'Lihat agenda pembelajaran yang akan datang.', 'calendar', 'g2'],
        ['quiz', 'Quiz', 'Uji pemahamanmu dan kumpulkan poin.', 'quiz', 'g3'],
        ['leaderboard', 'Leaderboard', 'Pantau peringkat dan tier bulananmu.', 'trophy', 'g4'],
        ['penukaran', 'Penukaran', 'Tukar poin dengan reward menarik.', 'gift', 'g5']
      ]
    },
    penyelenggara: {
      label: 'Pengajar',
      groups: [
        { title: 'Utama', items: [['dashboard', 'Beranda', 'home']] },
        {
          title: 'Kelola',
          items: [['kelas', 'Kelola Seminar', 'layers'], ['jadwal', 'Jadwal Seminar', 'calendar'], ['kuis', 'Kelola Quiz', 'quiz']]
        }
      ],
      hero: ['Fitur Lengkap untuk <span>Mengajar</span>', 'Buat Seminar, atur jadwal, dan siapkan kuis untuk murid-muridmu dari satu tempat.'],
      features: [
        ['kelas', 'Kelola Seminar', 'Buat, ubah, dan publikasikan seminar.', 'layers', 'g1'],
        ['jadwal', 'Jadwal Seminar', 'Atur jadwal pertemuan Seminarmu.', 'calendar', 'g2'],
        ['kuis', 'Kelola Quiz', 'Susun Quiz dan soal untuk murid.', 'quiz', 'g3']
      ]
    },
    admin: {
      label: 'Admin',
      groups: [{ title: 'Utama', items: [['dashboard', 'Beranda', 'home']] }],
      hero: ['Panel <span>Admin</span> Learnova', 'Pantau aktivitas platform Learnova.'],
      features: []
    }
  };

  const body = document.body;
  const role = body.dataset.role;
  const cfg = CONFIG[role];

  if (!cfg) return;

  const page = body.dataset.page;
  const title = body.dataset.title || 'Beranda';
  const home = '../../login.html';

  /* theme */
  const root = document.documentElement;
  const getTheme = () => {
    try {
      return localStorage.getItem('lv-theme');
    } catch (e) {
      return null;
    }
  };

  const setTheme = (t) => {
    root.dataset.theme = t;
    try {
      localStorage.setItem('lv-theme', t);
    } catch (e) {}
  };

  root.dataset.theme = getTheme() || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  /* build shell */
  const pageContent = body.querySelector('#pageContent');
  const customHTML = pageContent ? pageContent.innerHTML : '';
  const isDash = page === 'dashboard';

  const nav = cfg.groups
    .map((g) =>
      '<span class="side-caption">' + g.title.toUpperCase() + '</span>' +
      g.items
        .map((it) => '<a class="nav-item' + (it[0] === page ? ' active' : '') + '" href="' + it[0] + '.html">' + icon(it[2]) + '<span>' + it[1] + '</span></a>')
        .join('')
    )
    .join('');

  let inner;

  if (isDash) {
    const stats = role === 'peserta'
      ? [
          ['Total poin', 'stat-points', 'star', 'g5'],
          ['Tier bulanan', 'stat-tier', 'trophy', 'g4'],
          ['Poin bulan ini', 'stat-month', 'gift', 'g3']
        ]
      : role === 'penyelenggara'
        ? [
            ['Total seminar', 'stat-classes', 'layers', 'g1'],
            ['Dipublikasikan', 'stat-published', 'calendar', 'g2'],
            ['Draft', 'stat-draft', 'quiz', 'g3']
          ]
        : [];

    inner =
      '<div class="section-head"><p class="eyebrow">HALO, <span id="hello">—</span></p><h2>' + cfg.hero[0] + '</h2><p>' + cfg.hero[1] + '</p></div>' +
      (stats.length
        ? '<div class="stats">' + stats.map((s) => '<div class="card stat"><div class="ico ' + s[3] + '">' + icon(s[2]) + '</div><div><small>' + s[0] + '</small><b id="' + s[1] + '">—</b></div></div>').join('') + '</div>'
        : '') +
      '<div class="features">' + cfg.features.map((f) => '<a class="card feature-card" href="' + f[0] + '.html"><div class="tile ' + f[4] + '">' + icon(f[3]) + '</div><h3>' + f[1] + '</h3><p>' + f[2] + '</p></a>').join('') + '</div>' +
      '<p class="empty" id="noResult">Tidak ada menu yang cocok dengan pencarianmu.</p>';
  } else {
    inner =
      '<h1 class="page-title">' + title + '</h1>' +
      (customHTML.trim() || '<article class="card"><h3>' + title + '</h3><p class="muted">Halaman ini sudah disiapkan. Hubungkan fitur dengan API sesuai kebutuhan pengembangan.</p></article>');
  }

  body.innerHTML =
    '<div class="app">' +
    '<aside class="sidebar" id="sidebar" aria-label="Menu utama">' +
      '<div class="side-head"><a class="brand" href="dashboard.html">' +
      '<img src="../../assets/img/Profil Learnova.png" alt="Logo Learnova">' +
      '<b class="wm">Learnova<span>.</span></b></a>' + 
      '<button class="side-close" id="sideClose" aria-label="Tutup menu">' + icon('close') + '</button></div>' +
      '<nav class="side-scroll">' + nav + '</nav>' +
      '<div class="side-foot">' +
      '<a href="profil.html" class="profile-link">' +
      '<div class="avatar" id="avatar">?</div>' +
      '<div class="who">' +
      '<b id="uname">Memuat…</b>' +
      '<small>Lihat dan edit profil</small>' +
      '</div>' +
  '</a>' +
  '<button class="icon-btn" id="logoutBtn" title="Keluar" aria-label="Keluar">' +
    icon('out') +
  '</button>' +
'</div>' +
    '</aside>' +
    '<div class="scrim" id="scrim"></div>' +
    '<div class="main">' +
      '<header class="top">' +
        '<button class="icon-btn" id="menuBtn" aria-label="Buka menu" aria-controls="sidebar" aria-expanded="false">' + icon('menu') + '</button>' +
        '<div class="search">' + icon('search') + '<input id="q" type="search" placeholder="Cari menu…" autocomplete="off" aria-label="Cari menu"></div>' +
        '<div class="top-right"><span class="role-badge">' + cfg.label + '</span>' +
        '<button class="icon-btn" id="themeBtn" aria-label="Ganti tema"></button></div>' +
      '</header>' +
      '<main class="content">' + inner + '</main>' +
      '<footer>© ' + new Date().getFullYear() + ' Learnova · Belajar, berkembang, raih pencapaianmu.</footer>' +
    '</div>' +
    '<button class="to-top" id="toTop" aria-label="Kembali ke atas">' + icon('up') + '</button></div>';

  const $ = (id) => document.getElementById(id);
  const mobile = () => matchMedia('(max-width:960px)').matches;

  /* hamburger */
  function setMenu(open) {
    if (mobile()) body.classList.toggle('menu-open', open);
    else body.classList.toggle('side-collapsed', !open);
    $('menuBtn').setAttribute('aria-expanded', String(open));
  }

  $('menuBtn').addEventListener('click', () => {
    const open = mobile() ? !body.classList.contains('menu-open') : body.classList.contains('side-collapsed');
    setMenu(open);
  });

  $('sideClose').addEventListener('click', () => setMenu(false));
  $('scrim').addEventListener('click', () => setMenu(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') body.classList.remove('menu-open');
  });

  document.querySelectorAll('.nav-item').forEach((a) => a.addEventListener('click', () => body.classList.remove('menu-open')));
  matchMedia('(max-width:960px)').addEventListener('change', () => {
    body.classList.remove('menu-open');
  });

  /* theme button */
  const paintTheme = () => {
    $('themeBtn').innerHTML = icon(root.dataset.theme === 'dark' ? 'sun' : 'moon');
  };

  paintTheme();
  $('themeBtn').addEventListener('click', () => {
    setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
    paintTheme();
  });

  /* search filters sidebar + feature cards */
  $('q').addEventListener('input', (e) => {
    const v = e.target.value.trim().toLowerCase();
    document.querySelectorAll('.nav-item').forEach((a) => a.classList.toggle('hide', v && !a.textContent.toLowerCase().includes(v)));

    let shown = 0;
    document.querySelectorAll('.feature-card').forEach((c) => {
      const hit = !v || c.textContent.toLowerCase().includes(v);
      c.classList.toggle('hide', !hit);
      if (hit) shown++;
    });

    const nr = $('noResult');
    if (nr) nr.style.display = v && !shown ? 'block' : 'none';
  });

  /* scroll to top */
  addEventListener('scroll', () => $('toTop').classList.toggle('show', scrollY > 300), { passive: true });
  $('toTop').addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  /* logout */
  $('logoutBtn').addEventListener('click', () => {
    fetch('../../api/logout.php', { method: 'POST', credentials: 'same-origin' }).finally(() => {
      location.href = home;
    });
  });

  /* session guard + data */
  const fmt = (n) => Number(n || 0).toLocaleString('id-ID');

  fetch('../../api/session.php', { credentials: 'same-origin' })
    .then((r) => (r.ok ? r.json() : { authenticated: false }))
    .then((s) => {
      if (!s.authenticated) {
        location.href = home;
        return;
      }

      if (s.role !== role) {
        const dest = { peserta: 'peserta', penyelenggara: 'penyelenggara', admin: 'admin' }[s.role];
        location.href = '../' + dest + '/dashboard.html';
        return;
      }

      $('uname').textContent = s.name;
      $('avatar').textContent = (s.name || '?').trim().charAt(0).toUpperCase();

      const h = $('hello');
      if (h) h.textContent = (s.name || '').split(' ')[0].toUpperCase();

      if (isDash && role !== 'admin') {
        fetch('../../api/summary.php', { credentials: 'same-origin' })
          .then((r) => r.json())
          .then((d) => {
            if (!d.success) return;
            const set = (id, v) => {
              const el = $(id);
              if (el) el.textContent = v;
            };

            set('stat-points', fmt(d.points));
            set('stat-month', fmt(d.month_points));
            set('stat-tier', d.tier || '—');
            set('stat-classes', fmt(d.classes));
            set('stat-published', fmt(d.published));
            set('stat-draft', fmt(d.draft));
          })
          .catch(() => {});
      }
    })
    .catch(() => {
      $('uname').textContent = 'Server tidak aktif';
    });
})();
