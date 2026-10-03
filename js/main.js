/*  STATE  */
let isDark = true,
    currentUser = null;
let chatHistory = [];

/*  THEME  */
function toggleTheme() {
    isDark = !isDark;
    document.getElementById('htmlRoot').classList.toggle('lm', !isDark);
    // Landing icons
    const si = document.getElementById('suni'),
        mi = document.getElementById('mooni');
    if (si) {
        si.style.display = isDark ? 'none' : 'inline';
        mi.style.display = isDark ? 'inline' : 'none';
    }
    // Dashboard icons
    const dsi = document.getElementById('dbSunI'),
        dmi = document.getElementById('dbMoonI');
    if (dsi) {
        dsi.style.display = isDark ? 'none' : 'inline';
        dmi.style.display = isDark ? 'inline' : 'none';
    }
    // Sync settings toggle
    const dmtog = document.getElementById('darkModeToggle');
    if (dmtog) dmtog.checked = isDark;
    // Update charts
    updateChartColors();
}
document.getElementById('thbtn').addEventListener('click', toggleTheme);

/*  NAVBAR  */
window.addEventListener('scroll', () => document.getElementById('nbar').classList.toggle('scr', scrollY > 40));
let mbOpen = false;
document.getElementById('mbtog').addEventListener('click', () => {
    mbOpen = !mbOpen;
    document.getElementById('mbmenu').classList.toggle('open', mbOpen);
    document.getElementById('barIcon').style.display = mbOpen ? 'none' : 'inline';
    document.getElementById('xIcon').style.display = mbOpen ? 'inline' : 'none';
});
document.querySelectorAll('#mbmenu a, #mbmenu button').forEach(el =>
    el.addEventListener('click', () => {
        mbOpen = false;
        document.getElementById('mbmenu').classList.remove('open');
        document.getElementById('barIcon').style.display = 'inline';
        document.getElementById('xIcon').style.display = 'none';
    })
);

/*  REVEAL  */
const rvObs = new IntersectionObserver(
    entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('in');
    }), {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    }
);
document.querySelectorAll('.rv').forEach(el => rvObs.observe(el));

/*  VIDEO POPUP  */
$('.vidpop').magnificPopup({
    type: 'iframe',
    iframe: {
        patterns: {
            youtube: {
                index: 'youtube.com/',
                id: 'v=',
                src: 'https://www.youtube.com/embed/%id%?autoplay=1&rel=0'
            }
        }
    },
    mainClass: 'mfp-fade',
    removalDelay: 160
});

/*  PRICING TOGGLE  */
document.getElementById('ptog').addEventListener('change', function() {
    const y = this.checked;
    document.getElementById('ptogThumb').style.transform = y ? 'translateX(24px)' : 'translateX(0)';
    document.querySelectorAll('.pv').forEach(el => el.textContent = y ? el.dataset.y : el.dataset.m);
    document.querySelectorAll('.pper').forEach((el, i) => {
        if (i < 2) el.textContent = y ? 'per month, billed yearly' : 'per month, billed monthly';
    });
});

/*  AUTH FUNCTIONS  */
function swTab(t) {
    const isL = t === 'login';
    document.getElementById('fLogin').style.display = isL ? 'block' : 'none';
    document.getElementById('fSignup').style.display = isL ? 'none' : 'block';
    document.getElementById('tabLogin').classList.toggle('on', isL);
    document.getElementById('tabSignup').classList.toggle('on', !isL);
    document.getElementById('loginErr').style.display = 'none';
    document.getElementById('signupErr').style.display = 'none';
}

function showErrLogin(msg) {
    const el = document.getElementById('loginErr');
    document.getElementById('loginErrMsg').textContent = msg;
    el.style.display = 'block';
}

function showErrSignup(msg) {
    const el = document.getElementById('signupErr');
    document.getElementById('signupErrMsg').textContent = msg;
    el.style.display = 'block';
}

function setLoading(btnId, loading) {
    const btn = document.getElementById(btnId);
    if (loading) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Please wait...';
    } else {
        btn.disabled = false;
        if (btnId === 'loginBtn') btn.innerHTML = 'Log In <i class="fa-solid fa-arrow-right ms-1 fa-sm"></i>';
        else btn.innerHTML = 'Create Free Account <i class="fa-solid fa-arrow-right ms-1 fa-sm"></i>';
    }
}

function doLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPass').value;
    document.getElementById('loginErr').style.display = 'none';
    if (!email) return showErrLogin('Please enter your email address.');
    if (!pass) return showErrLogin('Please enter your password.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showErrLogin('Please enter a valid email address.');
    if (pass.length < 6) return showErrLogin('Password must be at least 6 characters.');
    setLoading('loginBtn', true);
    setTimeout(() => {
        setLoading('loginBtn', false);
        const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        loginSuccess({
            name,
            email,
            plan: 'Pro Plan'
        });
    }, 900);
}

function doSignup() {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const pass = document.getElementById('signupPass').value;
    document.getElementById('signupErr').style.display = 'none';
    if (!name) return showErrSignup('Please enter your full name.');
    if (!email) return showErrSignup('Please enter your email address.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showErrSignup('Please enter a valid email address.');
    if (pass.length < 8) return showErrSignup('Password must be at least 8 characters.');
    setLoading('signupBtn', true);
    setTimeout(() => {
        setLoading('signupBtn', false);
        loginSuccess({
            name,
            email,
            plan: 'Starter (Trial)'
        });
    }, 1000);
}

function quickLogin(provider) {
    const names = {
        google: 'Alex Johnson',
        github: 'Dev User'
    };
    const emails = {
        google: 'user@gmail.com',
        github: 'user@github.com'
    };
    // close offcanvas
    bootstrap.Offcanvas.getInstance(document.getElementById('lofc'))?.hide();
    setTimeout(() => loginSuccess({
        name: names[provider],
        email: emails[provider],
        plan: 'Pro Plan'
    }), 300);
}

function loginSuccess(user) {
    currentUser = user;
    chatHistory = [];
    const oc = bootstrap.Offcanvas.getInstance(document.getElementById('lofc'));
    if (oc) oc.hide();
    const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    // topbar
    document.getElementById('userAvatar').textContent = initials;
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userPlan').textContent = user.plan;
    // profile dropdown
    document.getElementById('pdAvatar').textContent = initials;
    document.getElementById('pdName').textContent = user.name;
    document.getElementById('pdEmail').textContent = user.email;
    document.getElementById('pdPlan').textContent = user.plan;
    document.getElementById('pdPlanDetail').textContent = user.plan;
    // greeting + settings
    document.getElementById('greetName').textContent = user.name.split(' ')[0];
    document.getElementById('settingsAvatar').textContent = initials;
    document.getElementById('settingsName').textContent = user.name;
    document.getElementById('settingsEmail').textContent = user.email;
    document.getElementById('profileName').value = user.name;
    document.getElementById('profileEmail').value = user.email;
    // switch view
    document.getElementById('landing').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    window.scrollTo(0, 0);
    setTimeout(() => {
        initOverviewChart();
    }, 200);
}

function doLogout() {
    currentUser = null;
    chatHistory = [];
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('landing').style.display = 'block';
    window.scrollTo(0, 0);
    // reset chat UI
    document.getElementById('chatBody').innerHTML = `
    <div class="d-flex flex-column gap-1">
      <div class="msg msg-ai">ðŸ‘‹ Hi! I'm your NexusAI assistant. I can help you with support analytics, agent configuration, automation workflows, and business insights. What would you like to know?</div>
      <div class="msg-time" style="align-self:flex-start;padding-left:4px">NexusAI Â· Just now</div>
    </div>`;
}

/*  DASHBOARD NAVIGATION  */
function dbNav(section, btn) {
    document.querySelectorAll('.db-nl').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.db-section').forEach(s => s.classList.remove('active'));
    if (btn) btn.classList.add('active');
    // find the correct sidebar button if btn not provided
    if (!btn) {
        document.querySelectorAll('.db-nl').forEach(b => {
            if (b.getAttribute('onclick') && b.getAttribute('onclick').includes("'" + section + "'")) b.classList.add('active');
        });
    }
    const sec = document.getElementById('sec-' + section);
    if (sec) {
        sec.classList.add('active');
        sec.style.animation = 'fadeIn .4s ease';
    }
    // close mobile sidebar + dropdowns
    document.getElementById('dbSidebar').classList.remove('mob-open');
    document.getElementById('notifDropdown')?.classList.remove('open');
    document.getElementById('profileDropdown')?.classList.remove('open');
    const ch = document.getElementById('profileChevron');
    if (ch) ch.style.transform = 'rotate(0deg)';
    // init charts when relevant section shown
    if (section === 'analytics') setTimeout(initAnalyticsChart, 100);
    if (section === 'overview') setTimeout(initOverviewChart, 100);
}

/*  CHARTS  */
let ovChartInst = null,
    anChartInst = null;

function chartColors() {
    return {
        grid: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)',
        ticks: isDark ? '#6b6b8a' : '#7878a0'
    };
}

function initOverviewChart() {
    const ctx = document.getElementById('ovChart');
    if (!ctx) return;
    if (ovChartInst) {
        ovChartInst.destroy();
        ovChartInst = null;
    }
    const c = ctx.getContext('2d');
    const g = c.createLinearGradient(0, 0, 0, 280);
    g.addColorStop(0, 'rgba(139,92,246,0.35)');
    g.addColorStop(1, 'rgba(59,130,246,0.02)');
    const labels = Array.from({
        length: 30
    }, (_, i) => `${i+1}`);
    const data = [420, 480, 510, 440, 600, 580, 720, 690, 750, 810, 780, 860, 820, 900, 940, 880, 960, 1020, 1100, 1080, 1150, 1200, 1180, 1260, 1310, 1280, 1350, 1400, 1460, 1520];
    const {
        grid,
        ticks
    } = chartColors();
    ovChartInst = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Conversations',
                data,
                fill: true,
                backgroundColor: g,
                borderColor: '#8b5cf6',
                borderWidth: 2.5,
                pointRadius: 0,
                pointHoverRadius: 5,
                tension: .42
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(22,22,42,.95)',
                    titleColor: '#a78bfa',
                    bodyColor: '#a8a8c8',
                    borderColor: 'rgba(139,92,246,.3)',
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: c => ' ' + c.parsed.y.toLocaleString() + ' conversations'
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: grid
                    },
                    ticks: {
                        color: ticks,
                        font: {
                            family: 'Space Grotesk',
                            size: 11
                        },
                        maxTicksLimit: 10
                    }
                },
                y: {
                    grid: {
                        color: grid
                    },
                    ticks: {
                        color: ticks,
                        font: {
                            family: 'Space Grotesk',
                            size: 11
                        },
                        callback: v => v >= 1000 ? (v / 1000).toFixed(1) + 'K' : v
                    }
                }
            }
        }
    });
}

function initAnalyticsChart() {
    const ctx = document.getElementById('anChart');
    if (!ctx) return;
    if (anChartInst) {
        anChartInst.destroy();
        anChartInst = null;
    }
    const c = ctx.getContext('2d');
    const g1 = c.createLinearGradient(0, 0, 0, 250);
    g1.addColorStop(0, 'rgba(139,92,246,0.3)');
    g1.addColorStop(1, 'rgba(139,92,246,0.01)');
    const g2 = c.createLinearGradient(0, 0, 0, 250);
    g2.addColorStop(0, 'rgba(52,211,153,0.2)');
    g2.addColorStop(1, 'rgba(52,211,153,0.01)');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const {
        grid,
        ticks
    } = chartColors();
    anChartInst = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                    label: 'Conversations',
                    data: [8200, 9100, 10400, 9800, 11200, 12800, 14100, 15600, 17200, 19000, 21400, 24800],
                    fill: true,
                    backgroundColor: g1,
                    borderColor: '#8b5cf6',
                    borderWidth: 2.5,
                    pointRadius: 3,
                    pointBackgroundColor: '#8b5cf6',
                    tension: .4
                },
                {
                    label: 'Resolved by AI',
                    data: [6560, 7644, 8736, 8330, 9632, 11264, 12408, 13728, 15136, 16720, 18834, 22016],
                    fill: true,
                    backgroundColor: g2,
                    borderColor: '#34d399',
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: '#34d399',
                    tension: .4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: isDark ? '#a8a8c8' : '#3d3d5c',
                        font: {
                            family: 'Space Grotesk',
                            size: 12
                        },
                        boxWidth: 12,
                        borderRadius: 4
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(22,22,42,.95)',
                    titleColor: '#a78bfa',
                    bodyColor: '#a8a8c8',
                    borderColor: 'rgba(139,92,246,.3)',
                    borderWidth: 1,
                    padding: 10
                }
            },
            scales: {
                x: {
                    grid: {
                        color: grid
                    },
                    ticks: {
                        color: ticks,
                        font: {
                            family: 'Space Grotesk',
                            size: 11
                        }
                    }
                },
                y: {
                    grid: {
                        color: grid
                    },
                    ticks: {
                        color: ticks,
                        font: {
                            family: 'Space Grotesk',
                            size: 11
                        },
                        callback: v => v >= 1000 ? (v / 1000).toFixed(1) + 'K' : v
                    }
                }
            }
        }
    });
}

function updateChartColors() {
    [ovChartInst, anChartInst].forEach(ch => {
        if (!ch) return;
        const {
            grid,
            ticks
        } = chartColors();
        ch.options.scales.x.grid.color = grid;
        ch.options.scales.x.ticks.color = ticks;
        ch.options.scales.y.grid.color = grid;
        ch.options.scales.y.ticks.color = ticks;
        if (ch.options.plugins.legend) ch.options.plugins.legend.labels.color = isDark ? '#a8a8c8' : '#3d3d5c';
        ch.update();
    });
}

/*  AI CHAT (Anthropic API)  */
async function sendChat() {
    const inp = document.getElementById('chatInp');
    const msg = inp.value.trim();
    if (!msg) return;
    inp.value = '';
    inp.style.height = 'auto';
    appendMsg(msg, 'user');
    chatHistory.push({
        role: 'user',
        content: msg
    });
    document.getElementById('chatSendBtn').disabled = true;
    const typingId = appendTyping();
    try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                system: `You are NexusAI, an intelligent AI assistant built into the NexusAI business automation platform. The user is ${currentUser?.name || 'a user'} on the ${currentUser?.plan || 'Pro'} plan. You help with: AI agent performance, support ticket analytics, workflow automation suggestions, business metrics insights, and platform usage. Current platform stats: 24.8K conversations today, 98.2% resolution rate, 1.4s avg response, $18.2K monthly savings, 4 active agents. Be concise, professional, and data-driven. Use emojis sparingly.`,
                messages: chatHistory
            })
        });
        removeTyping(typingId);
        if (res.ok) {
            const data = await res.json();
            const reply = data.content?.find(b => b.type === 'text')?.text || 'I could not generate a response.';
            chatHistory.push({
                role: 'assistant',
                content: reply
            });
            appendMsg(reply, 'ai');
        } else {
            appendMsg('âš ï¸ Sorry, I had trouble connecting. Please check your API key or try again.', 'ai');
        }
    } catch (e) {
        removeTyping(typingId);
        appendMsg('âš ï¸ Network error. Please ensure you are connected to the internet.', 'ai');
    }
    document.getElementById('chatSendBtn').disabled = false;
}

function appendMsg(text, role) {
    const body = document.getElementById('chatBody');
    const time = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
    const wrap = document.createElement('div');
    wrap.className = 'd-flex flex-column gap-1';
    wrap.innerHTML = `
    <div class="msg msg-${role}" style="animation:fadeIn .3s ease">${escapeHtml(text).replace(/\n/g,'<br>')}</div>
    <div class="msg-time" style="align-self:${role==='ai'?'flex-start':'flex-end'};padding:0 4px">${role==='ai'?'NexusAI':'You'} Â· ${time}</div>`;
    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
}

let typingCounter = 0;

function appendTyping() {
    const id = 'typ-' + (++typingCounter);
    const body = document.getElementById('chatBody');
    const el = document.createElement('div');
    el.id = id;
    el.className = 'typing-ind';
    el.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return id;
}

function removeTyping(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function clearChat() {
    chatHistory = [];
    document.getElementById('chatBody').innerHTML = `
    <div class="d-flex flex-column gap-1">
      <div class="msg msg-ai">ðŸ‘‹ Hi! I'm your NexusAI assistant. I can help you with support analytics, agent configuration, automation workflows, and business insights. What would you like to know?</div>
      <div class="msg-time" style="align-self:flex-start;padding-left:4px">NexusAI Â· Just now</div>
    </div>`;
}

function quickMsg(msg) {
    document.getElementById('chatInp').value = msg;
    sendChat();
}

function escapeHtml(t) {
    return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/*  AUTO RESIZE TEXTAREA  */
document.getElementById('chatInp')?.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
});

/*  NOTIFICATION DROPDOWN  */
function toggleNotif(e) {
    if (e) e.stopPropagation();
    const nd = document.getElementById('notifDropdown');
    const pd = document.getElementById('profileDropdown');
    pd.classList.remove('open');
    document.getElementById('profileChevron').style.transform = 'rotate(0deg)';
    nd.classList.toggle('open');
}

function markAllRead() {
    document.querySelectorAll('.notif-dot:not(.read)').forEach(d => d.classList.add('read'));
    document.querySelectorAll('.notif-unread').forEach(n => n.classList.remove('notif-unread'));
    document.getElementById('unreadCount').textContent = '0 new';
    document.getElementById('unreadCount').style.background = 'rgba(139,92,246,.1)';
    document.getElementById('unreadCount').style.color = '#a78bfa';
    document.getElementById('notifBadge').style.display = 'none';
}

/*  PROFILE DROPDOWN  */
function toggleProfile(e) {
    if (e) e.stopPropagation();
    const pd = document.getElementById('profileDropdown');
    const nd = document.getElementById('notifDropdown');
    nd.classList.remove('open');
    pd.classList.toggle('open');
    document.getElementById('profileChevron').style.transform =
        pd.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
}

/* Close dropdowns on outside click */
document.addEventListener('click', (e) => {
    if (!document.getElementById('notifWrap')?.contains(e.target))
        document.getElementById('notifDropdown')?.classList.remove('open');
    if (!document.getElementById('profileWrap')?.contains(e.target)) {
        document.getElementById('profileDropdown')?.classList.remove('open');
        const ch = document.getElementById('profileChevron');
        if (ch) ch.style.transform = 'rotate(0deg)';
    }
});

/*  LIVE ACTIVITY TICKER  */
const activities = [
    ['#34d399', 'AI resolved shipping query for customer #4821'],
    ['#8b5cf6', 'Sales agent sent follow-up email to 5 leads'],
    ['#34d399', 'Refund processed automatically â€” $29.99'],
    ['#fbbf24', 'Escalation: account access issue â†’ human agent'],
    ['#60a5fa', 'Data sync completed â€” 28 CRM records updated'],
    ['#34d399', 'Onboarding bot guided new user through setup'],
    ['#8b5cf6', 'Weekly performance report generated and sent'],
    ['#34d399', 'AI resolved 12 billing questions in 8 seconds'],
];
let actIdx = 0;
setInterval(() => {
    const box = document.getElementById('liveActivity');
    if (!box || !document.getElementById('sec-overview').classList.contains('active')) return;
    const [color, text] = activities[actIdx % activities.length];
    actIdx++;
    const times = ['just now', '2s ago', '5s ago', '12s ago'];
    const item = document.createElement('div');
    item.style.cssText = 'display:flex;gap:10px;padding:10px;background:var(--bg3);border-radius:10px;font-size:.78rem;animation:fadeIn .4s ease';
    item.innerHTML = `<span style="width:7px;height:7px;border-radius:50%;background:${color};margin-top:4px;flex-shrink:0"></span><span style="color:var(--tx2)">${text}</span><span style="margin-left:auto;color:var(--tx3);white-space:nowrap">${times[0]}</span>`;
    box.insertBefore(item, box.firstChild);
    if (box.children.length > 5) box.removeChild(box.lastChild);
}, 5000);