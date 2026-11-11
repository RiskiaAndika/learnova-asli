// Login & registrasi (halaman di root: login.html, register.html)
const ROLE_INFO = {
    peserta: {
        hint: 'Masuk untuk mengikuti seminar, mengerjakan kuis, dan mengumpulkan poin.',
        regHint: 'Daftar untuk belajar, mengerjakan kuis, dan menukar poin dengan reward.',
    },
    penyelenggara: {
        hint: 'Masuk untuk mengelola seminar, jadwal, dan kuis untuk murid.',
        regHint: 'Daftar untuk membuat seminar dan kuis bagi murid-muridmu.',
    },
};
const ALIAS = { murid: 'peserta', pengajar: 'penyelenggara' };

async function sendForm(form, endpoint) {
    const data = Object.fromEntries(new FormData(form).entries());
    const msg = form.querySelector('.message');
    const btn = form.querySelector('button.btn');

    msg.className = 'message';
    msg.textContent = '';
    btn.disabled = true;

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await res.json();
        msg.textContent = result.message || 'Selesai';

        if (result.success) {
            msg.classList.add('ok');
            if (result.redirect) {
                setTimeout(() => location.href = result.redirect, 700);
            }
        } else {
            btn.disabled = false;
        }
    } catch (e) {
        msg.textContent = 'Tidak dapat terhubung ke server. Pastikan Apache dan MySQL aktif.';
        btn.disabled = false;
    }
}

function initRoleTabs(form, isRegister) {
    const tabs = document.querySelectorAll('.role-tab');
    const input = form.querySelector('input[name=role]');
    const hint = document.getElementById('roleHint');

    const select = (role) => {
        input.value = role;
        tabs.forEach((t) => {
            const on = t.dataset.role === role;
            t.classList.toggle('active', on);
            t.setAttribute('aria-selected', on);
        });

        hint.textContent = ROLE_INFO[role][isRegister ? 'regHint' : 'hint'];

        const link = document.getElementById('switchLink');
        if (link) {
            link.href = (isRegister ? 'login.html' : 'register.html') + '?role=' + (role === 'peserta' ? 'murid' : 'pengajar');
        }

        form.querySelector('.message').textContent = '';
    };

    tabs.forEach((t) => t.addEventListener('click', () => select(t.dataset.role)));

    const q = new URLSearchParams(location.search).get('role');
    select(ALIAS[q] || (ROLE_INFO[q] ? q : 'peserta'));
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    initRoleTabs(loginForm, false);
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendForm(loginForm, 'api/login.php');
    });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    initRoleTabs(registerForm, true);
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendForm(registerForm, 'api/register.php');
    });
}
