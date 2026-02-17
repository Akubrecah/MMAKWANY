/**
 * Mmakwany Guest House — Site-Wide Interactive Logic
 * Provides client-side functionality for all pages using localStorage.
 * No backend needed — everything is simulated for a production-ready demo.
 */

(function () {
  'use strict';

  // ──────────────────────────────────────────────────────
  // 1. AUTH MODULE (localStorage)
  // ──────────────────────────────────────────────────────
  const Auth = {
    KEY: 'mmakwany_user',

    getUser() {
      try { return JSON.parse(localStorage.getItem(this.KEY)); } catch { return null; }
    },

    login(email, name) {
      const user = {
        email: email || 'guest@mmakwany.co.ke',
        name: name || 'Guest User',
        points: 2450,
        memberSince: new Date().toISOString(),
        bookings: [],
        tickets: []
      };
      localStorage.setItem(this.KEY, JSON.stringify(user));
      return user;
    },

    logout() {
      localStorage.removeItem(this.KEY);
      window.location.href = 'index.html';
    },

    isLoggedIn() {
      return !!this.getUser();
    },

    updateUser(updates) {
      const user = this.getUser();
      if (user) {
        Object.assign(user, updates);
        localStorage.setItem(this.KEY, JSON.stringify(user));
      }
      return user;
    },

    addBooking(booking) {
      const user = this.getUser();
      if (user) {
        user.bookings = user.bookings || [];
        user.bookings.push({ ...booking, id: 'BK-' + Date.now(), date: new Date().toISOString() });
        localStorage.setItem(this.KEY, JSON.stringify(user));
      }
    },

    addTicket(ticket) {
      const user = this.getUser();
      if (user) {
        user.tickets = user.tickets || [];
        user.tickets.push({ ...ticket, id: 'TK-' + Date.now() });
        localStorage.setItem(this.KEY, JSON.stringify(user));
      }
    }
  };

  // ──────────────────────────────────────────────────────
  // 2. TOAST NOTIFICATION SYSTEM
  // ──────────────────────────────────────────────────────
  function showToast(message, type = 'success') {
    const colors = {
      success: 'bg-emerald-500',
      error: 'bg-red-500',
      info: 'bg-blue-500',
      warning: 'bg-amber-500'
    };
    const toast = document.createElement('div');
    toast.className = `fixed top-6 right-6 z-[9999] ${colors[type]} text-white px-6 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2 transition-all duration-500 translate-x-0 opacity-100`;
    toast.innerHTML = `<span class="material-symbols-outlined text-lg">${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'info'}</span>${message}`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100px)'; }, 2500);
    setTimeout(() => toast.remove(), 3000);
  }

  // ──────────────────────────────────────────────────────
  // 3. UPDATE AUTH UI IN HEADER
  // ──────────────────────────────────────────────────────
  function updateHeaderAuth() {
    const user = Auth.getUser();
    const loginBtn = document.querySelector('a[href="login.html"]');
    if (loginBtn && user) {
      loginBtn.innerHTML = `
        <span class="material-symbols-outlined text-sm">person</span>
        <span class="text-sm font-medium">${user.name.split(' ')[0]}</span>
      `;
      loginBtn.href = '#';
      loginBtn.onclick = function (e) {
        e.preventDefault();
        if (confirm('Log out of Mmakwany Guest House?')) Auth.logout();
      };
    }
  }

  // ──────────────────────────────────────────────────────
  // 4. ROOM BOOKING LOGIC
  // ──────────────────────────────────────────────────────
  function initRoomBooking() {
    if (!window.location.pathname.includes('room-booking')) return;

    document.querySelectorAll('button').forEach(btn => {
      if (btn.textContent.trim().includes('Book Now') || btn.textContent.trim().includes('Reserve')) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          const card = btn.closest('[class*="rounded"]') || btn.parentElement;
          const title = card?.querySelector('h3, h2')?.textContent || 'Room';
          const price = card?.querySelector('[class*="font-bold"]')?.textContent || 'KES 12,000';

          Auth.addBooking({ type: 'room', title, price, status: 'confirmed' });
          showToast(`${title} booked successfully!`);
          setTimeout(() => window.location.href = 'guest-dashboard.html', 1500);
        });
      }
    });

    // Date picker interactions
    document.querySelectorAll('input[type="date"]').forEach(input => {
      input.addEventListener('change', () => showToast('Dates updated', 'info'));
    });
  }

  // ──────────────────────────────────────────────────────
  // 5. POINTS SHOP LOGIC
  // ──────────────────────────────────────────────────────
  function initPointsShop() {
    if (!window.location.pathname.includes('points-shop')) return;

    document.querySelectorAll('button').forEach(btn => {
      if (btn.textContent.trim().includes('Redeem') || btn.textContent.trim().includes('Claim')) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          const user = Auth.getUser();
          const card = btn.closest('[class*="rounded"]') || btn.parentElement;
          const reward = card?.querySelector('h3, h2, p')?.textContent || 'Reward';

          if (!user) {
            showToast('Please log in to redeem rewards', 'warning');
            setTimeout(() => window.location.href = 'login.html', 1500);
            return;
          }

          const pointsCost = parseInt(btn.textContent.replace(/\D/g, '')) || 500;
          if (user.points >= pointsCost) {
            Auth.updateUser({ points: user.points - pointsCost });
            showToast(`Redeemed: ${reward} (${pointsCost} pts deducted)`);
            btn.textContent = '✓ Redeemed';
            btn.disabled = true;
            btn.classList.add('opacity-50');
          } else {
            showToast(`Not enough points (need ${pointsCost}, have ${user.points})`, 'error');
          }
        });
      }
    });
  }

  // ──────────────────────────────────────────────────────
  // 6. LOGIN FORM LOGIC
  // ──────────────────────────────────────────────────────
  function initLogin() {
    if (!window.location.pathname.includes('login')) return;

    const form = document.querySelector('form') || document.querySelector('[class*="space-y"]');
    if (!form) return;

    // Find sign-in buttons
    document.querySelectorAll('button').forEach(btn => {
      const text = btn.textContent.trim().toLowerCase();
      if (text.includes('sign in') || text.includes('login') || text.includes('log in')) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          const emailInput = document.querySelector('input[type="email"]');
          const email = emailInput?.value || 'guest@mmakwany.co.ke';
          Auth.login(email, 'Guest User');
          showToast('Welcome to Mmakwany Guest House!');
          setTimeout(() => window.location.href = 'index.html', 1200);
        });
      }
      if (text.includes('create') || text.includes('register') || text.includes('sign up')) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          const emailInput = document.querySelector('input[type="email"]');
          const nameInput = document.querySelector('input[type="text"]') || emailInput;
          Auth.login(emailInput?.value || 'new@mmakwany.co.ke', nameInput?.value || 'New Guest');
          showToast('Account created! Welcome aboard.');
          setTimeout(() => window.location.href = 'index.html', 1200);
        });
      }
    });

    // Social login buttons
    document.querySelectorAll('button').forEach(btn => {
      const text = btn.textContent.trim().toLowerCase();
      if (text.includes('google') || text.includes('apple') || text.includes('facebook')) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          Auth.login('social@mmakwany.co.ke', 'Social User');
          showToast(`Signed in with ${text.replace('continue with ', '').replace('sign in with ', '')}!`);
          setTimeout(() => window.location.href = 'index.html', 1200);
        });
      }
    });
  }

  // ──────────────────────────────────────────────────────
  // 7. GUEST DASHBOARD / CATERING MENU LOGIC
  // ──────────────────────────────────────────────────────
  function initGuestDashboard() {
    if (!window.location.pathname.includes('guest-dashboard')) return;

    const menuGrid = document.getElementById('menu-grid');
    const menuCards = menuGrid ? menuGrid.querySelectorAll('.menu-card') : [];
    const guestCount = 200;
    const menuPrices = {
      'Swahili Coastal Buffet': 4500,
      'Continental Executive': 3000,
      'Vegan Garden Harvest': 2800,
      'Savory Cocktail Bites': 1500,
      'Executive Power Lunch': 3500,
      'Morning Pastry Board': 2000,
    };

    // ── Tab Filtering ──
    const tabs = document.querySelectorAll('nav.flex.space-x-8 button, nav.-mb-px button');
    const tabMap = { 'all': null, 'breakfast': 'breakfast', 'lunch': 'lunch', 'dinner': 'dinner', 'snacks & drinks': 'snacks' };

    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        tabs.forEach(function(t) {
          t.classList.remove('border-primary', 'text-primary', 'font-bold');
          t.classList.add('border-transparent', 'text-gray-500', 'font-medium');
        });
        tab.classList.add('border-primary', 'text-primary', 'font-bold');
        tab.classList.remove('border-transparent', 'text-gray-500', 'font-medium');

        var cat = tabMap[tab.textContent.trim().toLowerCase()];
        var vis = 0;
        menuCards.forEach(function(card, idx) {
          if (!cat || card.dataset.category === cat) {
            card.style.display = '';
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            setTimeout(function() {
              card.style.transition = 'opacity 0.3s, transform 0.3s';
              card.style.opacity = '1';
              card.style.transform = '';
            }, idx * 60);
            vis++;
          } else {
            card.style.display = 'none';
          }
        });
        showToast(tab.textContent.trim() + ': ' + vis + ' menu' + (vis !== 1 ? 's' : '') + ' available', 'info');
      });
    });

    // ── Menu Selection ──
    var sidebarMenuName = document.querySelector('.bg-primary\\/5 .font-bold.text-gray-900');
    var totalEstimate = document.querySelector('.text-xl.font-black.text-primary');
    var priceRows = document.querySelectorAll('.space-y-3 .font-semibold');

    function updateSidebar(name, price) {
      if (sidebarMenuName) sidebarMenuName.textContent = name;
      if (priceRows[0]) priceRows[0].textContent = 'KES ' + price.toLocaleString();
      if (totalEstimate) totalEstimate.textContent = 'KES ' + (price * guestCount).toLocaleString();
    }

    function selectCard(card) {
      menuCards.forEach(function(c) {
        c.classList.remove('ring-2', 'ring-primary/20');
        c.classList.add('border-gray-100');
        c.classList.remove('border-primary/30');
        var chk = c.querySelector('.bg-primary.text-white.p-1.rounded-full');
        if (chk) chk.remove();
        var btn = c.querySelector('button');
        if (btn) {
          btn.textContent = 'Select This Menu';
          btn.classList.remove('bg-primary', 'text-white');
          btn.classList.add('border-2', 'border-primary', 'text-primary');
        }
        var ttl = c.querySelector('h3');
        if (ttl) ttl.classList.remove('text-primary');
      });

      card.classList.add('ring-2', 'ring-primary/20');
      card.classList.remove('border-gray-100');
      card.classList.add('border-primary/30');
      var imgC = card.querySelector('.relative.h-48');
      if (imgC && !imgC.querySelector('.bg-primary.text-white.p-1.rounded-full')) {
        var ck = document.createElement('div');
        ck.className = 'absolute top-3 right-3 bg-primary text-white p-1 rounded-full shadow-lg';
        ck.innerHTML = '<span class="material-symbols-outlined text-sm block">check</span>';
        imgC.appendChild(ck);
      }
      var btn = card.querySelector('button');
      if (btn) { btn.textContent = 'Selected'; btn.classList.add('bg-primary', 'text-white'); btn.classList.remove('border-2', 'border-primary', 'text-primary'); }
      var title = card.querySelector('h3');
      if (title) {
        title.classList.add('text-primary');
        var nm = title.textContent.trim();
        var pr = menuPrices[nm] || 3000;
        updateSidebar(nm, pr);
        showToast('\u2705 ' + nm + ' selected \u2014 KES ' + (pr * guestCount).toLocaleString() + ' total');
      }
    }

    menuCards.forEach(function(card) {
      var btn = card.querySelector('button');
      if (btn) btn.addEventListener('click', function(e) { e.stopPropagation(); selectCard(card); });
      card.style.cursor = 'pointer';
      card.addEventListener('click', function() { selectCard(card); });
    });

    // ── Save & Continue ──
    var saveBtn = document.querySelector('button.bg-primary.text-white.rounded-xl.font-bold.text-lg');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        var selMenu = sidebarMenuName ? sidebarMenuName.textContent : 'Not selected';
        var total = totalEstimate ? totalEstimate.textContent : '';
        var dietary = document.querySelector('textarea') ? document.querySelector('textarea').value.trim() : 'None';
        var ov = document.createElement('div');
        ov.className = 'fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center';
        ov.innerHTML = '<div class="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl" style="animation: slideUp 0.3s ease"><style>@keyframes slideUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}</style><div class="text-center mb-6"><div class="size-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"><span class="material-symbols-outlined text-primary !text-3xl">restaurant_menu</span></div><h3 class="text-xl font-bold">Confirm Catering Selection</h3></div><div class="space-y-3 mb-6 bg-gray-50 rounded-xl p-4"><div class="flex justify-between text-sm"><span class="text-gray-500">Menu</span><span class="font-bold">' + selMenu + '</span></div><div class="flex justify-between text-sm"><span class="text-gray-500">Guests</span><span class="font-semibold">' + guestCount + '</span></div><div class="flex justify-between text-sm"><span class="text-gray-500">Total</span><span class="font-black text-primary">' + total + '</span></div><div class="flex justify-between text-sm"><span class="text-gray-500">Dietary</span><span class="font-medium text-right max-w-[60%] truncate">' + (dietary || 'None') + '</span></div></div><div class="flex gap-3"><button class="cat-cancel flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-100">Go Back</button><button class="cat-confirm flex-1 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 shadow-lg">Confirm</button></div></div>';
        ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
        ov.querySelector('.cat-cancel').addEventListener('click', function() { ov.remove(); });
        ov.querySelector('.cat-confirm').addEventListener('click', function() {
          var cb = ov.querySelector('.cat-confirm');
          cb.innerHTML = '<span class="material-symbols-outlined animate-spin !text-lg">progress_activity</span>';
          cb.disabled = true;
          setTimeout(function() {
            ov.remove();
            showToast('\uD83C\uDF89 Catering order confirmed! ' + selMenu + ' for ' + guestCount + ' guests.');
            saveBtn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Saved!';
            saveBtn.classList.add('bg-green-600');
            setTimeout(function() { saveBtn.innerHTML = 'Save &amp; Continue <span class="material-symbols-outlined">arrow_forward</span>'; saveBtn.classList.remove('bg-green-600'); }, 3000);
          }, 1200);
        });
        document.body.appendChild(ov);
      });
    }

    // ── Breadcrumb links ──
    var bcrumbs = document.querySelectorAll('nav.flex.mb-6 a');
    if (bcrumbs[0]) bcrumbs[0].href = 'index.html';
    if (bcrumbs[1]) { bcrumbs[1].href = '#'; bcrumbs[1].addEventListener('click', function(e) { e.preventDefault(); showToast('My Event dashboard \u2014 Coming soon!', 'info'); }); }

    // ── Logout ──
    document.querySelectorAll('button').forEach(function(el) {
      if (el.textContent.trim().toLowerCase() === 'logout') {
        el.addEventListener('click', function(e) {
          e.preventDefault();
          if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('nexusUser');
            showToast('Logged out successfully');
            setTimeout(function() { window.location.href = 'index.html'; }, 800);
          }
        });
      }
    });

    // ── Footer links ──
    var fmap = { 'Properties': 'room-booking.html', 'Events': 'index.html' };
    document.querySelectorAll('footer a').forEach(function(a) {
      var l = a.textContent.trim();
      if (fmap[l]) { a.href = fmap[l]; }
      else if (a.href.endsWith('#')) { a.addEventListener('click', function(e) { e.preventDefault(); showToast(l + ' \u2014 Coming soon!', 'info'); }); }
    });
  }

  // ──────────────────────────────────────────────────────
  // 8. ADMIN DASHBOARD LOGIC
  // ──────────────────────────────────────────────────────
  function initAdminDashboard() {
    if (!window.location.pathname.includes('admin-dashboard')) return;

    // Quick action buttons
    document.querySelectorAll('button, a').forEach(el => {
      const text = el.textContent.trim().toLowerCase();
      if (text.includes('gate scanner') || text.includes('scanner')) {
        el.addEventListener('click', (e) => { e.preventDefault(); window.location.href = 'guest-scan.html'; });
      }
      if (text.includes('housekeeping')) {
        el.addEventListener('click', (e) => { e.preventDefault(); window.location.href = 'housekeeping.html'; });
      }
      if (text.includes('financial') || text.includes('report')) {
        el.addEventListener('click', (e) => { e.preventDefault(); window.location.href = 'financial-report.html'; });
      }
      if (text.includes('staff') || text.includes('communication')) {
        el.addEventListener('click', (e) => { e.preventDefault(); window.location.href = 'staff-comm.html'; });
      }
      if (text.includes('purchasing') || text.includes('procurement')) {
        el.addEventListener('click', (e) => { e.preventDefault(); window.location.href = 'purchasing.html'; });
      }
    });

    // Live KPI counter animation
    document.querySelectorAll('[class*="text-3xl"], [class*="text-4xl"]').forEach(el => {
      const text = el.textContent.trim();
      if (/^\d/.test(text) || text.startsWith('KES') || text.startsWith('$')) {
        const target = parseInt(text.replace(/[^0-9]/g, ''));
        if (target > 0 && target < 1000000) {
          let current = 0;
          const step = Math.ceil(target / 40);
          const prefix = text.match(/^[^\d]*/)?.[0] || '';
          const suffix = text.match(/[^\d]*$/)?.[0] || '';
          const interval = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(interval); }
            el.textContent = prefix + current.toLocaleString() + suffix;
          }, 30);
        }
      }
    });
  }

  // ──────────────────────────────────────────────────────
  // 9. HALL CONFIGURATOR ENHANCED LOGIC
  // ──────────────────────────────────────────────────────
  function initHallConfigurator() {
    if (!window.location.pathname.includes('hall-configurator')) return;

    // Tab navigation (if tabs exist)
    document.querySelectorAll('[role="tab"], .tab-btn').forEach(tab => {
      tab.addEventListener('click', function () {
        document.querySelectorAll('[role="tab"], .tab-btn').forEach(t => t.classList.remove('border-primary', 'text-primary'));
        tab.classList.add('border-primary', 'text-primary');
      });
    });
  }

  // ──────────────────────────────────────────────────────
  // 10. GUEST SCAN LOGIC
  // ──────────────────────────────────────────────────────
  function initGuestScan() {
    if (!window.location.pathname.includes('guest-scan')) return;

    document.querySelectorAll('button').forEach(btn => {
      const text = btn.textContent.trim().toLowerCase();
      if (text.includes('scan') || text.includes('check in') || text.includes('verify')) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          btn.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span> Scanning...';
          setTimeout(() => {
            btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Guest Verified';
            showToast('Guest #MGH-4821 checked in successfully!');
          }, 1500);
        });
      }
    });
  }

  // ──────────────────────────────────────────────────────
  // 11. FINANCIAL REPORT LOGIC
  // ──────────────────────────────────────────────────────
  function initFinancialReport() {
    if (!window.location.pathname.includes('financial-report')) return;

    document.querySelectorAll('button').forEach(btn => {
      const text = btn.textContent.trim().toLowerCase();
      if (text.includes('generate') || text.includes('download') || text.includes('export')) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          btn.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span> Generating...';
          setTimeout(() => {
            btn.innerHTML = '<span class="material-symbols-outlined">download_done</span> Report Ready';
            showToast('Financial report generated. Download starting...');
            setTimeout(() => window.print(), 500);
          }, 2000);
        });
      }
    });
  }

  // ──────────────────────────────────────────────────────
  // 12. HOUSEKEEPING DASHBOARD LOGIC
  // ──────────────────────────────────────────────────────
  function initHousekeeping() {
    if (!window.location.pathname.includes('housekeeping')) return;

    document.querySelectorAll('button').forEach(btn => {
      const text = btn.textContent.trim().toLowerCase();
      if (text.includes('mark') || text.includes('clean') || text.includes('complete') || text.includes('assign')) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          const row = btn.closest('tr, [class*="rounded"], [class*="border"]');
          if (row) {
            row.style.opacity = '0.5';
            row.style.textDecoration = 'line-through';
          }
          btn.textContent = '✓ Done';
          btn.disabled = true;
          showToast('Task marked as complete');
        });
      }
    });
  }

  // ──────────────────────────────────────────────────────
  // 13. PURCHASING / PROCUREMENT LOGIC
  // ──────────────────────────────────────────────────────
  function initPurchasing() {
    if (!window.location.pathname.includes('purchasing')) return;

    document.querySelectorAll('button').forEach(btn => {
      const text = btn.textContent.trim().toLowerCase();
      if (text.includes('approve') || text.includes('order') || text.includes('submit')) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          showToast('Purchase order approved & submitted');
          btn.textContent = '✓ Approved';
          btn.disabled = true;
          btn.classList.add('opacity-50');
        });
      }
      if (text.includes('reject') || text.includes('decline')) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          showToast('Purchase order rejected', 'warning');
          btn.textContent = '✗ Rejected';
          btn.disabled = true;
        });
      }
    });
  }

  // ──────────────────────────────────────────────────────
  // 14. STAFF COMM CENTER LOGIC
  // ──────────────────────────────────────────────────────
  function initStaffComm() {
    if (!window.location.pathname.includes('staff-comm')) return;

    // Send message functionality
    const inputFields = document.querySelectorAll('input[type="text"], textarea');
    const sendBtns = document.querySelectorAll('button');

    sendBtns.forEach(btn => {
      const text = btn.textContent.trim().toLowerCase();
      if (text.includes('send') || btn.querySelector('[class*="send"]')) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          const input = document.querySelector('input[type="text"], textarea');
          if (input && input.value.trim()) {
            showToast('Message sent to team');
            input.value = '';
          } else {
            showToast('Please type a message', 'warning');
          }
        });
      }
    });
  }

  // ──────────────────────────────────────────────────────
  // 15. EVENT TICKET LOGIC
  // ──────────────────────────────────────────────────────
  function initEventTicket() {
    if (!window.location.pathname.includes('event-ticket')) return;

    document.querySelectorAll('button').forEach(btn => {
      const text = btn.textContent.trim().toLowerCase();
      if (text.includes('wallet') || text.includes('add to')) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          showToast('Event pass added to your wallet!');
        });
      }
      if (text.includes('share') || text.includes('send')) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          if (navigator.share) {
            navigator.share({ title: 'Mmakwany Guest House Event Pass', text: 'My event ticket' });
          } else {
            showToast('Link copied to clipboard!');
          }
        });
      }
    });
  }

  // ──────────────────────────────────────────────────────
  // 16. SEARCH FUNCTIONALITY (Global)
  // ──────────────────────────────────────────────────────
  function initSearch() {
    document.querySelectorAll('button').forEach(btn => {
      if (btn.querySelector('.material-symbols-outlined')?.textContent === 'search') {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const overlay = document.createElement('div');
          overlay.className = 'fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-24';
          overlay.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden">
              <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                <span class="material-symbols-outlined text-slate-400">search</span>
                <input type="text" placeholder="Search halls, rooms, events..." class="flex-1 text-lg outline-none" autofocus>
                <button onclick="this.closest('.fixed').remove()" class="text-slate-400 hover:text-slate-600">
                  <span class="material-symbols-outlined">close</span>
                </button>
              </div>
              <div class="p-4 text-sm text-slate-500">
                <p class="font-medium text-xs uppercase tracking-wider text-slate-400 mb-3">Quick Links</p>
                <a href="room-booking.html" class="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg"><span class="material-symbols-outlined text-primary">hotel</span>Room Booking</a>
                <a href="hall-configurator.html" class="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg"><span class="material-symbols-outlined text-primary">meeting_room</span>Hall Configurator</a>
                <a href="guest-dashboard.html" class="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg"><span class="material-symbols-outlined text-primary">restaurant</span>Catering Menu</a>
                <a href="points-shop.html" class="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg"><span class="material-symbols-outlined text-primary">redeem</span>Rewards Shop</a>
              </div>
            </div>
          `;
          overlay.addEventListener('click', (ev) => { if (ev.target === overlay) overlay.remove(); });
          document.body.appendChild(overlay);
          overlay.querySelector('input').focus();
        });
      }
    });
  }

  // ──────────────────────────────────────────────────────
  // 17. MOBILE HAMBURGER MENU
  // ──────────────────────────────────────────────────────
  function initMobileMenu() {
    const header = document.getElementById('site-header');
    if (!header) return;

    const nav = header.querySelector('nav');
    if (!nav) return;

    // Create hamburger button
    const burger = document.createElement('button');
    burger.className = 'md:hidden p-2 text-slate-600 hover:text-primary transition-colors';
    burger.innerHTML = '<span class="material-symbols-outlined">menu</span>';
    header.querySelector('.max-w-7xl')?.appendChild(burger);

    burger.addEventListener('click', () => {
      if (nav.classList.contains('hidden')) {
        nav.classList.remove('hidden');
        nav.classList.add('flex', 'flex-col', 'absolute', 'top-full', 'left-0', 'right-0', 'bg-white', 'border-b', 'border-gray-100', 'p-4', 'shadow-lg', 'z-50');
        burger.innerHTML = '<span class="material-symbols-outlined">close</span>';
      } else {
        nav.classList.add('hidden');
        nav.classList.remove('flex', 'flex-col', 'absolute', 'top-full', 'left-0', 'right-0', 'bg-white', 'border-b', 'border-gray-100', 'p-4', 'shadow-lg', 'z-50');
        burger.innerHTML = '<span class="material-symbols-outlined">menu</span>';
      }
    });
  }

  // ──────────────────────────────────────────────────────
  // 18. FILTER / TAB / CHIP SYSTEM (Universal)
  // ──────────────────────────────────────────────────────

  /**
   * Initializes tab-based filtering on guest-dashboard.html
   * Tabs: All, Breakfast, Lunch, Dinner, Snacks & Drinks
   */
  function initCateringFilters() {
    if (!window.location.pathname.includes('guest-dashboard')) return;

    const tabNav = document.querySelector('nav.flex.space-x-8');
    if (!tabNav) return;

    const tabs = tabNav.querySelectorAll('button');
    const grid = document.getElementById('menu-grid');
    if (!grid) return;

    const cards = grid.querySelectorAll('.menu-card');

    const categoryMap = {
      'all': null,
      'breakfast': 'breakfast',
      'lunch': 'lunch',
      'dinner': 'dinner',
      'snacks & drinks': 'snacks',
      'snacks': 'snacks'
    };

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Update active tab styling
        tabs.forEach(t => {
          t.classList.remove('border-primary', 'text-primary', 'border-b-2', 'font-bold');
          t.classList.add('border-transparent', 'text-gray-500');
        });
        tab.classList.remove('border-transparent', 'text-gray-500');
        tab.classList.add('border-primary', 'text-primary', 'border-b-2', 'font-bold');

        // Filter cards
        const filterText = tab.textContent.trim().toLowerCase();
        const category = categoryMap[filterText] || null;

        cards.forEach(card => {
          if (!category || card.dataset.category === category) {
            card.style.display = '';
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            requestAnimationFrame(() => {
              card.style.transition = 'opacity 0.3s, transform 0.3s';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            });
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /**
   * Initializes chip/pill filtering on points-shop.html
   * Chips: All, Room Upgrades, Dining Vouchers, Event Add-ons, Exclusive Experiences
   */
  function initPointsFilters() {
    if (!window.location.pathname.includes('points-shop')) return;

    const filterContainer = document.querySelector('.flex.items-center.gap-3.mb-10');
    if (!filterContainer) return;

    const chips = filterContainer.querySelectorAll('button');
    const grid = document.getElementById('rewards-grid');
    if (!grid) return;

    const cards = grid.querySelectorAll('.reward-card');

    const chipMap = {
      'all': null,
      'room upgrades': 'room-upgrade',
      'dining vouchers': 'dining',
      'event add-ons': 'events',
      'exclusive experiences': 'experiences'
    };

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        // Update active chip styling
        chips.forEach(c => {
          c.classList.remove('bg-primary', 'text-white', 'shadow-md');
          c.classList.add('bg-white', 'text-text-main', 'border', 'border-gray-200');
        });
        chip.classList.remove('bg-white', 'text-text-main', 'border', 'border-gray-200');
        chip.classList.add('bg-primary', 'text-white', 'shadow-md');

        // Filter cards
        const filterText = chip.textContent.trim().toLowerCase().replace(/\s+/g, ' ');
        let category = null;
        for (const key of Object.keys(chipMap)) {
          if (filterText.includes(key)) { category = chipMap[key]; break; }
        }

        let visibleCount = 0;
        cards.forEach((card, idx) => {
          if (!category || card.dataset.category === category) {
            card.style.display = '';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
              card.style.transition = 'opacity 0.3s, transform 0.3s';
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            }, idx * 60);
            visibleCount++;
          } else {
            card.style.display = 'none';
          }
        });

        showToast(`Showing ${visibleCount} reward${visibleCount !== 1 ? 's' : ''}`, 'info');
      });
    });
  }

  /**
   * Initializes room-booking.html — full page interactivity
   */
  function initRoomFilters() {
    if (!window.location.pathname.includes('room-booking')) return;

    var roomGrid = document.getElementById('room-grid');

    // ── 1. Hero Search Bar ──
    var heroInputs = document.querySelectorAll('section .rounded-full input[type="text"]');
    var searchBtn = document.querySelector('section .rounded-full button');
    var dateInput = heroInputs[0];
    var guestInput = heroInputs[1];

    if (dateInput) dateInput.addEventListener('focus', function() { dateInput.placeholder = 'e.g. Feb 20 \u2013 Feb 23'; });
    if (guestInput) guestInput.addEventListener('focus', function() { guestInput.placeholder = 'e.g. 2 Adults, 1 Child'; });
    if (searchBtn) {
      searchBtn.addEventListener('click', function() {
        var d = dateInput ? dateInput.value.trim() : '';
        var g = guestInput ? guestInput.value.trim() : '';
        if (!d && !g) { showToast('Please enter check-in dates or guest count', 'warning'); if (dateInput) dateInput.focus(); return; }
        var msg = 'Searching';
        if (d) msg += ' for ' + d;
        if (g) msg += ' \u2022 ' + g;
        showToast(msg + ' \u2014 3 rooms match!', 'info');
        var rg = document.getElementById('room-grid');
        if (rg) rg.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    // ── 2. Grid / List View Toggle ──
    var viewBtns = document.querySelectorAll('.flex.gap-2 button');
    if (viewBtns.length >= 2 && roomGrid) {
      var gridBtn = viewBtns[0];
      var listBtn = viewBtns[1];
      gridBtn.addEventListener('click', function() {
        roomGrid.classList.remove('grid-cols-1');
        roomGrid.classList.add('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
        var gi = gridBtn.querySelector('.material-symbols-outlined'); if (gi) gi.classList.remove('text-slate-400');
        var li = listBtn.querySelector('.material-symbols-outlined'); if (li) li.classList.add('text-slate-400');
        roomGrid.querySelectorAll('.room-card').forEach(function(c) { c.classList.remove('flex-row'); c.classList.add('flex-col'); var iw = c.querySelector('div[class*="aspect"]'); if (iw) { iw.style.width = ''; iw.style.minHeight = ''; } });
        showToast('Grid view', 'info');
      });
      listBtn.addEventListener('click', function() {
        roomGrid.classList.remove('md:grid-cols-2', 'lg:grid-cols-3');
        roomGrid.classList.add('grid-cols-1');
        var li = listBtn.querySelector('.material-symbols-outlined'); if (li) li.classList.remove('text-slate-400');
        var gi = gridBtn.querySelector('.material-symbols-outlined'); if (gi) gi.classList.add('text-slate-400');
        roomGrid.querySelectorAll('.room-card').forEach(function(c) { c.classList.add('flex-row'); c.classList.remove('flex-col'); var iw = c.querySelector('div[class*="aspect"]'); if (iw) { iw.style.width = '280px'; iw.style.minHeight = '100%'; } });
        showToast('List view', 'info');
      });
    }

    // ── 3. Sidebar checkbox filters ──
    var checkboxes = document.querySelectorAll('aside input[type="checkbox"]');
    var roomCards = roomGrid ? roomGrid.querySelectorAll('.room-card') : [];
    var resultText = document.querySelector('.flex-1.space-y-8 p');

    checkboxes.forEach(function(cb) {
      cb.addEventListener('change', function() {
        var checkedLabels = [];
        checkboxes.forEach(function(box) {
          if (box.checked) {
            var sp = box.closest('label') ? box.closest('label').querySelector('span') : null;
            if (sp) checkedLabels.push(sp.textContent.trim().toLowerCase());
          }
        });
        if (checkedLabels.length === 0) {
          roomCards.forEach(function(c) { c.style.display = ''; });
          if (resultText) resultText.textContent = 'Showing top 3 premium matches for your stay';
          showToast('Showing all rooms', 'info');
          return;
        }
        var vis = 0;
        roomCards.forEach(function(card, idx) {
          var combined = ((card.dataset.type || '') + ' ' + (card.dataset.amenities || '')).toLowerCase();
          var match = checkedLabels.some(function(l) { return combined.indexOf(l.split(' ')[0]) >= 0; });
          if (match) { card.style.display = ''; card.style.opacity = '0'; card.style.transform = 'translateY(10px)'; setTimeout(function() { card.style.transition = 'opacity 0.3s, transform 0.3s'; card.style.opacity = '1'; card.style.transform = ''; }, idx * 80); vis++; }
          else { card.style.display = 'none'; }
        });
        if (resultText) resultText.textContent = 'Showing ' + vis + ' room' + (vis !== 1 ? 's' : '') + ' for your filters';
        showToast('Showing ' + vis + ' room' + (vis !== 1 ? 's' : ''), 'info');
      });
    });

    // ── 4. Price range slider (drag) ──
    var sliderTrack = document.querySelector('aside .h-1\\.5');
    var sliderDots = document.querySelectorAll('aside .size-5.bg-white.border-2');
    var priceLabels = document.querySelectorAll('aside .flex.justify-between span');
    if (sliderTrack && sliderDots.length === 2) {
      var minPos = 25, maxPos = 75;
      var activeFill = sliderTrack.querySelector('div');
      function updateSlider() {
        if (activeFill) { activeFill.style.left = minPos + '%'; activeFill.style.right = (100 - maxPos) + '%'; }
        sliderDots[0].style.left = minPos + '%'; sliderDots[1].style.right = (100 - maxPos) + '%'; sliderDots[1].style.left = 'auto';
        var mn = Math.round(5000 + (minPos / 100) * 95000);
        var mx = Math.round(5000 + (maxPos / 100) * 95000);
        if (priceLabels[0]) priceLabels[0].textContent = mn.toLocaleString();
        if (priceLabels[1]) priceLabels[1].textContent = mx >= 95000 ? '100,000+' : mx.toLocaleString();
      }
      sliderDots.forEach(function(dot, idx) {
        dot.style.cursor = 'grab';
        dot.addEventListener('mousedown', function(e) {
          e.preventDefault(); dot.style.cursor = 'grabbing';
          var rect = sliderTrack.getBoundingClientRect();
          function onM(ev) {
            var pct = Math.max(0, Math.min(100, ((ev.clientX - rect.left) / rect.width) * 100));
            if (idx === 0) minPos = Math.min(pct, maxPos - 5); else maxPos = Math.max(pct, minPos + 5);
            updateSlider();
          }
          function onU() {
            dot.style.cursor = 'grab'; document.removeEventListener('mousemove', onM); document.removeEventListener('mouseup', onU);
            var mn = Math.round(5000 + (minPos / 100) * 95000); var mx = Math.round(5000 + (maxPos / 100) * 95000);
            showToast('Price: KES ' + mn.toLocaleString() + ' \u2013 ' + (mx >= 95000 ? '100,000+' : 'KES ' + mx.toLocaleString()), 'info');
          }
          document.addEventListener('mousemove', onM); document.addEventListener('mouseup', onU);
        });
      });
    }

    // ── 5. Book Now — Confirmation Modal ──
    var roomInfo = [
      { name: 'Deluxe Room', price: 'KES 15,000', badge: 'Available' },
      { name: 'Executive Suite', price: 'KES 25,000', badge: 'Popular' },
      { name: 'Presidential Suite', price: 'KES 50,000', badge: 'Exclusive' }
    ];
    document.querySelectorAll('.room-card').forEach(function(card, idx) {
      var bookBtn = card.querySelector('button');
      if (!bookBtn) return;
      bookBtn.removeAttribute('onclick');
      bookBtn.addEventListener('click', function() {
        var info = roomInfo[idx] || { name: 'Room', price: '', badge: '' };
        var dates = dateInput ? dateInput.value.trim() : ''; if (!dates) dates = 'Select dates';
        var guests = guestInput ? guestInput.value.trim() : ''; if (!guests) guests = '2 Adults';
        var ov = document.createElement('div');
        ov.className = 'fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center';
        ov.innerHTML = '<style>@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}</style><div class="bg-white dark:bg-slate-900 rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl border border-slate-100 dark:border-white/10" style="animation:slideUp 0.3s ease"><div class="flex items-center gap-3 mb-6"><div class="size-12 bg-primary/10 rounded-full flex items-center justify-center"><span class="material-symbols-outlined text-primary !text-2xl">hotel</span></div><div><h3 class="text-xl font-bold">' + info.name + '</h3><span class="text-sm text-primary font-semibold">' + info.badge + '</span></div></div><div class="space-y-4 mb-6"><div class="flex justify-between py-3 border-b border-slate-100"><span class="text-sm text-slate-500">Rate per night</span><span class="text-sm font-bold text-amber-600">' + info.price + '</span></div><div class="flex justify-between py-3 border-b border-slate-100"><span class="text-sm text-slate-500">Dates</span><span class="text-sm font-semibold">' + dates + '</span></div><div class="flex justify-between py-3 border-b border-slate-100"><span class="text-sm text-slate-500">Guests</span><span class="text-sm font-semibold">' + guests + '</span></div><div><label class="text-xs font-bold text-slate-400 uppercase">Special Requests</label><textarea class="mt-2 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:ring-primary" rows="2" placeholder="e.g. Late check-in, extra pillows..."></textarea></div></div><div class="flex gap-3"><button class="bk-cancel flex-1 py-3 border border-slate-200 text-slate-600 rounded-full text-sm font-semibold hover:bg-slate-100">Cancel</button><button class="bk-confirm flex-1 py-3 bg-primary text-white rounded-full text-sm font-bold hover:bg-primary/90 shadow-lg">Confirm Booking</button></div></div>';
        ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
        ov.querySelector('.bk-cancel').addEventListener('click', function() { ov.remove(); });
        ov.querySelector('.bk-confirm').addEventListener('click', function() {
          var cb = ov.querySelector('.bk-confirm');
          cb.innerHTML = '<span class="material-symbols-outlined animate-spin !text-lg">progress_activity</span>';
          cb.disabled = true;
          setTimeout(function() {
            ov.remove();
            showToast('\u2705 ' + info.name + ' booked! Confirmation sent to your email.');
            card.style.outline = '3px solid #0d968b'; card.style.outlineOffset = '2px';
            setTimeout(function() { card.style.outline = ''; card.style.outlineOffset = ''; }, 2000);
          }, 1200);
        });
        document.body.appendChild(ov);
      });
    });

    // ── 6. Floating Chat Widget ──
    var chatBtn = document.querySelector('button.fixed.bottom-8.right-8');
    if (chatBtn) {
      var chatOpen = false, chatBox = null;
      chatBtn.addEventListener('click', function() {
        if (chatOpen && chatBox) { chatBox.remove(); chatOpen = false; return; }
        chatBox = document.createElement('div');
        chatBox.className = 'fixed bottom-28 right-8 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 z-50 overflow-hidden';
        chatBox.style.animation = 'slideUp 0.3s ease';
        chatBox.innerHTML = '<style>@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}</style><div class="bg-primary px-5 py-4 flex items-center justify-between"><div><h4 class="text-white font-bold text-sm">Mmakwany Concierge</h4><span class="text-white/70 text-xs flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-green-300"></span> Online</span></div><button class="chat-x text-white/80 hover:text-white"><span class="material-symbols-outlined">close</span></button></div><div class="p-4 h-48 overflow-y-auto space-y-3 bg-slate-50" id="chat-msgs"><div class="flex gap-2"><div class="size-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold shrink-0">MG</div><div class="bg-white rounded-xl rounded-tl-none px-3 py-2 text-sm text-slate-700 shadow-sm">Welcome to Mmakwany! \uD83C\uDFE8 How can I help?</div></div></div><div class="p-3 border-t border-slate-200 flex gap-2"><input type="text" id="chat-in" placeholder="Type a message..." class="flex-1 bg-slate-100 border-0 rounded-full px-4 py-2 text-sm focus:ring-primary"><button class="chat-snd size-9 bg-primary text-white rounded-full flex items-center justify-center"><span class="material-symbols-outlined !text-lg">send</span></button></div>';
        chatBox.querySelector('.chat-x').addEventListener('click', function() { chatBox.remove(); chatOpen = false; });
        var replies = ['Our Deluxe Room starts at KES 15,000/night with breakfast! \uD83C\uDF73','Check-in is at 14:00 and check-out at 11:00.','We offer free airport transfers for suite bookings! \u2708\uFE0F','Our spa opens 7 AM \u2013 10 PM daily.','Yes! We have family rooms. Shall I check availability?','The infinity pool is open 6 AM \u2013 9 PM.','I\'ll connect you with reservations!'];
        var ri = 0;
        function sendC() {
          var inp = chatBox.querySelector('#chat-in'); var m = inp ? inp.value.trim() : ''; if (!m) return;
          var msgs = chatBox.querySelector('#chat-msgs');
          msgs.innerHTML += '<div class="flex gap-2 justify-end"><div class="bg-primary text-white rounded-xl rounded-tr-none px-3 py-2 text-sm shadow-sm max-w-[80%]">' + m + '</div></div>';
          inp.value = ''; msgs.scrollTop = msgs.scrollHeight;
          setTimeout(function() {
            msgs.innerHTML += '<div class="flex gap-2"><div class="size-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold shrink-0">MG</div><div class="bg-white rounded-xl rounded-tl-none px-3 py-2 text-sm text-slate-700 shadow-sm">' + replies[ri % replies.length] + '</div></div>';
            ri++; msgs.scrollTop = msgs.scrollHeight;
          }, 800 + Math.random() * 600);
        }
        chatBox.querySelector('.chat-snd').addEventListener('click', sendC);
        chatBox.querySelector('#chat-in').addEventListener('keypress', function(e) { if (e.key === 'Enter') sendC(); });
        document.body.appendChild(chatBox); chatOpen = true;
      });
    }

    // ── 7. Newsletter ──
    var nlInput = document.querySelector('footer input[type="email"]');
    var nlBtn = document.querySelector('footer button.material-symbols-outlined');
    if (nlBtn) {
      nlBtn.addEventListener('click', function() {
        var email = nlInput ? nlInput.value.trim() : '';
        if (!email || email.indexOf('@') < 0) { showToast('Please enter a valid email', 'warning'); if (nlInput) nlInput.focus(); return; }
        nlBtn.textContent = 'check'; nlBtn.classList.add('bg-green-500'); if (nlInput) nlInput.value = '';
        showToast('\uD83C\uDF89 Welcome! Exclusive offers sent to ' + email);
        setTimeout(function() { nlBtn.textContent = 'send'; nlBtn.classList.remove('bg-green-500'); }, 3000);
      });
      if (nlInput) nlInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') nlBtn.click(); });
    }

    // ── 8. Fix "Nexus Experience" ──
    document.querySelectorAll('h2').forEach(function(h) { if (h.textContent.indexOf('Nexus') >= 0) h.textContent = 'The Mmakwany Experience'; });

    // ── 9. Experience cards click ──
    document.querySelectorAll('.h-96.rounded-2xl.cursor-pointer').forEach(function(card) {
      card.addEventListener('click', function() {
        var t = card.querySelector('h4'); var d = card.querySelector('p');
        showToast((t ? t.textContent : 'Amenity') + ': ' + (d ? d.textContent : ''), 'info');
      });
    });

    // ── 10. Footer links ──
    var flinks = { 'Rooms & Suites': 'room-booking.html', 'Dining Experiences': 'guest-dashboard.html', 'Special Offers': 'points-shop.html' };
    document.querySelectorAll('footer a').forEach(function(a) {
      var l = a.textContent.trim();
      if (flinks[l]) a.href = flinks[l];
      else if (a.getAttribute('href') === '#') a.addEventListener('click', function(e) { e.preventDefault(); showToast(l + ' \u2014 Coming soon!', 'info'); });
    });
  }

  /**
   * Initializes event-halls.html tabs/filters
   */
  function initEventHallFilters() {
    if (!window.location.pathname.includes('event-halls')) return;

    // Find tab-like navigation
    const tabs = document.querySelectorAll('nav button, .flex button');
    const hallCards = document.querySelectorAll('.hall-card, [data-category]');

    // Make tab buttons work even if they have generic text
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Toggle active state for any tab group
        const parent = tab.parentElement;
        if (parent) {
          parent.querySelectorAll('button').forEach(t => {
            t.classList.remove('border-primary', 'text-primary', 'bg-primary', 'text-white');
          });
          tab.classList.add('border-primary', 'text-primary');
        }
      });
    });
  }

  // ──────────────────────────────────────────────────────
  // 19. GLOBAL IMAGE REPLACEMENT (Google → Local)
  // ──────────────────────────────────────────────────────

  /**
   * Replaces all external Google-hosted images with local alternatives.
   * Maps image context (alt text, parent content) to available local images.
   */
  function replaceExternalImages() {
    const localImages = [
      'images/courtyard.jpeg',
      'images/restaurant.jpeg',
      'images/conference.jpeg',
      'images/guest-room.jpeg',
      'images/lounge.jpeg'
    ];

    // Map context keywords to best-fit local images
    const contextMap = {
      // Room/Hotel related
      'room': 'images/guest-room.jpeg',
      'suite': 'images/guest-room.jpeg',
      'hotel': 'images/guest-room.jpeg',
      'bed': 'images/guest-room.jpeg',
      'deluxe': 'images/guest-room.jpeg',
      'executive': 'images/guest-room.jpeg',
      'presidential': 'images/guest-room.jpeg',
      'luxury': 'images/guest-room.jpeg',
      'accommodation': 'images/guest-room.jpeg',
      'housekeeping': 'images/guest-room.jpeg',
      // Food/Dining related
      'dining': 'images/restaurant.jpeg',
      'restaurant': 'images/restaurant.jpeg',
      'food': 'images/restaurant.jpeg',
      'meal': 'images/restaurant.jpeg',
      'buffet': 'images/restaurant.jpeg',
      'breakfast': 'images/restaurant.jpeg',
      'lunch': 'images/restaurant.jpeg',
      'dinner': 'images/restaurant.jpeg',
      'pastry': 'images/restaurant.jpeg',
      'gourmet': 'images/restaurant.jpeg',
      'cocktail': 'images/restaurant.jpeg',
      'champagne': 'images/restaurant.jpeg',
      'catering': 'images/restaurant.jpeg',
      // Conference/Event related
      'conference': 'images/conference.jpeg',
      'meeting': 'images/conference.jpeg',
      'hall': 'images/conference.jpeg',
      'event': 'images/conference.jpeg',
      'ballroom': 'images/conference.jpeg',
      'projector': 'images/conference.jpeg',
      'theater': 'images/conference.jpeg',
      'boardroom': 'images/conference.jpeg',
      'stage': 'images/conference.jpeg',
      // Outdoor/Nature
      'pool': 'images/courtyard.jpeg',
      'garden': 'images/courtyard.jpeg',
      'outdoor': 'images/courtyard.jpeg',
      'spa': 'images/courtyard.jpeg',
      'wellness': 'images/courtyard.jpeg',
      'infinity': 'images/courtyard.jpeg',
      'panoramic': 'images/courtyard.jpeg',
      'city': 'images/courtyard.jpeg',
      'view': 'images/courtyard.jpeg',
      'tour': 'images/courtyard.jpeg',
      'park': 'images/courtyard.jpeg',
      'nature': 'images/courtyard.jpeg',
      // Default/Portrait/Lounge
      'person': 'images/lounge.jpeg',
      'staff': 'images/lounge.jpeg',
      'portrait': 'images/lounge.jpeg',
      'avatar': 'images/lounge.jpeg',
      'team': 'images/lounge.jpeg',
      'guest': 'images/lounge.jpeg'
    };

    function getLocalImage(imgElement) {
      const alt = (imgElement.alt || '').toLowerCase();
      const dataAlt = (imgElement.dataset.alt || '').toLowerCase();
      const context = alt + ' ' + dataAlt;

      for (const [keyword, localPath] of Object.entries(contextMap)) {
        if (context.includes(keyword)) return localPath;
      }

      // Fallback: cycle through images based on index
      const allImages = document.querySelectorAll('img[src*="googleusercontent"], img[src*="lh3.google"]');
      const idx = Array.from(allImages).indexOf(imgElement);
      return localImages[idx % localImages.length];
    }

    // Replace all Google-hosted images
    document.querySelectorAll('img').forEach(img => {
      const src = img.src || img.getAttribute('src') || '';
      if (src.includes('googleusercontent') || src.includes('lh3.google') || src.includes('aida-public')) {
        const localSrc = getLocalImage(img);
        img.src = localSrc;
        img.setAttribute('src', localSrc);
      }
    });

    // Also check background images in style attributes
    document.querySelectorAll('[style*="googleusercontent"], [style*="lh3.google"]').forEach(el => {
      el.style.backgroundImage = `url('images/courtyard.jpeg')`;
    });
  }

  // ──────────────────────────────────────────────────────
  // 20. EVENT COORDINATOR DASHBOARD
  // ──────────────────────────────────────────────────────

  function initEventCoordinator() {
    if (!window.location.pathname.includes('event-coordinator')) return;

    // ── Live Countdown Timer ──
    const timerDigits = document.querySelectorAll('.text-3xl.font-mono.font-bold');
    if (timerDigits.length === 3) {
      let totalSeconds = parseInt(timerDigits[0].textContent) * 3600 +
                         parseInt(timerDigits[1].textContent) * 60 +
                         parseInt(timerDigits[2].textContent);

      setInterval(() => {
        if (totalSeconds <= 0) return;
        totalSeconds--;
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        timerDigits[0].textContent = String(h).padStart(2, '0');
        timerDigits[1].textContent = String(m).padStart(2, '0');
        timerDigits[2].textContent = String(s).padStart(2, '0');
      }, 1000);
    }

    // ── Sidebar Navigation ──
    const sidebarLinks = document.querySelectorAll('aside nav a');
    sidebarLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        sidebarLinks.forEach(l => {
          l.classList.remove('bg-surface-highlight');
          l.classList.add('hover:bg-surface-highlight/50');
          l.querySelector('.material-symbols-outlined')?.classList.remove('text-primary');
          l.querySelector('.material-symbols-outlined')?.classList.add('text-gray-400');
        });
        link.classList.add('bg-surface-highlight');
        link.classList.remove('hover:bg-surface-highlight/50');
        link.querySelector('.material-symbols-outlined')?.classList.add('text-primary');
        link.querySelector('.material-symbols-outlined')?.classList.remove('text-gray-400');

        const section = link.querySelector('span:last-child')?.textContent?.trim();
        showToast(`Switched to ${section}`, 'info');
      });
    });

    // ── Venue Switcher (Main Wing / Garden Wing radio buttons) ──
    const venueLabels = document.querySelectorAll('label:has(input[name="venue"])');
    venueLabels.forEach(label => {
      label.addEventListener('click', () => {
        venueLabels.forEach(l => {
          l.classList.remove('bg-background-dark', 'shadow-sm', 'text-white');
          l.classList.add('text-gray-400');
        });
        label.classList.add('bg-background-dark', 'shadow-sm', 'text-white');
        label.classList.remove('text-gray-400');
        const venue = label.querySelector('span')?.textContent?.trim();
        showToast(`Viewing: ${venue}`, 'info');
      });
    });

    // ── Logistics Checklist (interactive checkboxes) ──
    const checklistContainer = document.querySelector('.flex.flex-col.gap-1');
    const completionCounter = document.querySelector('span.text-xs.font-medium.text-gray-400');

    function updateChecklistCount() {
      if (!checklistContainer || !completionCounter) return;
      const allCheckboxes = checklistContainer.querySelectorAll('input[type="checkbox"]');
      const checked = Array.from(allCheckboxes).filter(cb => cb.checked).length;
      completionCounter.textContent = `${checked}/${allCheckboxes.length} Completed`;
    }

    if (checklistContainer) {
      checklistContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
          const label = cb.closest('label');
          const textSpan = label?.querySelector('span.text-sm:not(.material-symbols-outlined), div .text-sm');
          if (textSpan && !textSpan.closest('div.flex-col')) {
            if (cb.checked) {
              textSpan.classList.add('line-through', 'text-gray-500');
              textSpan.classList.remove('text-white');
            } else {
              textSpan.classList.remove('line-through', 'text-gray-500');
              textSpan.classList.add('text-white');
            }
          }
          // Clear urgent styling when checked
          if (cb.checked && label?.classList.contains('bg-orange-900/10')) {
            label.classList.remove('bg-orange-900/10', 'border-orange-900/30');
            label.classList.add('hover:bg-surface-highlight/30');
            cb.classList.remove('border-orange-500');
            cb.classList.add('border-gray-500');
            const urgentText = label.querySelector('.text-orange-400');
            if (urgentText) urgentText.style.display = 'none';
          }
          updateChecklistCount();
          showToast(cb.checked ? 'Task completed ✓' : 'Task reopened');
        });
      });
    }

    // ── Add Checklist Item ──
    const addChecklistBtn = document.querySelector('button.text-primary.text-xs');
    if (addChecklistBtn && checklistContainer) {
      addChecklistBtn.addEventListener('click', () => {
        const newItem = document.createElement('label');
        newItem.className = 'group flex items-center gap-3 p-2 rounded-lg hover:bg-surface-highlight/30 cursor-pointer transition-colors animate-pulse';
        newItem.innerHTML = `
          <div class="relative flex items-center justify-center">
            <input type="checkbox" class="peer h-5 w-5 cursor-pointer appearance-none rounded border border-primary bg-transparent checked:border-primary checked:bg-primary transition-all">
            <span class="material-symbols-outlined absolute pointer-events-none opacity-0 peer-checked:opacity-100 text-white text-[16px]">check</span>
          </div>
          <span class="text-white text-sm font-medium">New Task — Click to edit</span>
        `;
        checklistContainer.appendChild(newItem);
        setTimeout(() => newItem.classList.remove('animate-pulse'), 1000);

        // Wire up the new checkbox
        newItem.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
          const span = newItem.querySelector('span.text-sm:not(.material-symbols-outlined)');
          if (e.target.checked) {
            span.classList.add('line-through', 'text-gray-500');
            span.classList.remove('text-white');
          } else {
            span.classList.remove('line-through', 'text-gray-500');
            span.classList.add('text-white');
          }
          updateChecklistCount();
          showToast(e.target.checked ? 'Task completed ✓' : 'Task reopened');
        });

        updateChecklistCount();
        showToast('New checklist item added', 'info');
      });
    }

    // ── New Incident Button ──
    const incidentBtn = document.querySelector('button:has(.material-symbols-outlined)');
    document.querySelectorAll('header button').forEach(btn => {
      if (btn.textContent.includes('New Incident')) {
        btn.addEventListener('click', () => {
          const overlay = document.createElement('div');
          overlay.className = 'fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center';
          overlay.innerHTML = `
            <div class="bg-[#1a241d] rounded-2xl border border-[#28392e] p-6 w-full max-w-md mx-4 shadow-2xl">
              <h3 class="text-white text-lg font-bold mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-red-400">warning</span>
                Report New Incident
              </h3>
              <div class="space-y-4">
                <div>
                  <label class="text-gray-400 text-xs font-medium mb-1 block">Incident Type</label>
                  <select class="w-full bg-[#111813] border border-[#28392e] rounded-lg px-3 py-2 text-white text-sm">
                    <option>Equipment Malfunction</option>
                    <option>Security Alert</option>
                    <option>Medical Emergency</option>
                    <option>VIP Request</option>
                    <option>Catering Issue</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label class="text-gray-400 text-xs font-medium mb-1 block">Location</label>
                  <input type="text" placeholder="e.g. Main Hall, Gate B" class="w-full bg-[#111813] border border-[#28392e] rounded-lg px-3 py-2 text-white text-sm">
                </div>
                <div>
                  <label class="text-gray-400 text-xs font-medium mb-1 block">Description</label>
                  <textarea rows="3" placeholder="Brief description of the incident..." class="w-full bg-[#111813] border border-[#28392e] rounded-lg px-3 py-2 text-white text-sm resize-none"></textarea>
                </div>
                <div class="flex gap-3 pt-2">
                  <button class="incident-cancel flex-1 bg-transparent border border-[#28392e] text-gray-400 py-2 rounded-lg text-sm font-medium hover:bg-[#28392e] transition-colors">Cancel</button>
                  <button class="incident-submit flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-bold transition-colors">Report Incident</button>
                </div>
              </div>
            </div>
          `;
          overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
          overlay.querySelector('.incident-cancel').addEventListener('click', () => overlay.remove());
          overlay.querySelector('.incident-submit').addEventListener('click', () => {
            overlay.remove();
            showToast('🚨 Incident reported — Team notified', 'warning');
          });
          document.body.appendChild(overlay);
        });
      }
    });

    // ── Notification Bell ──
    document.querySelectorAll('header button').forEach(btn => {
      if (btn.querySelector('[class*="notifications"]')) {
        btn.addEventListener('click', () => {
          const dot = btn.querySelector('.bg-red-500');
          if (dot) dot.style.display = 'none';
          showToast('3 new updates: VIP arriving in 5m, Catering ready, AV check pending', 'info');
        });
      }
    });

    // ── Quick Comms Floating Bar ──
    document.querySelectorAll('.rounded-full button').forEach(btn => {
      const text = btn.textContent.trim().toLowerCase();
      if (text.includes('floor manager')) {
        btn.addEventListener('click', () => {
          showToast('📡 Connecting to Floor Manager on Channel 1...');
          setTimeout(() => showToast('🎤 Floor Manager: "Copy that. On my way."', 'info'), 1500);
        });
      }
      if (text.includes('lead chef')) {
        btn.addEventListener('click', () => {
          showToast('📡 Connecting to Lead Chef on Channel 3...');
          setTimeout(() => showToast('🎤 Chef: "Lunch prep at 90%. Ready in 10 minutes."', 'info'), 1500);
        });
      }
    });

    // ── Staff View All ──
    document.querySelectorAll('button').forEach(btn => {
      if (btn.textContent.trim() === 'View All') {
        btn.addEventListener('click', () => {
          showToast('Showing full staff roster (12 members deployed)', 'info');
        });
      }
    });

    // ── Sign Out ──
    document.querySelectorAll('button').forEach(btn => {
      if (btn.textContent.trim().includes('Sign Out')) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          if (confirm('Sign out of Event Coordinator Dashboard?')) {
            showToast('Signed out successfully');
            setTimeout(() => window.location.href = 'index.html', 1200);
          }
        });
      }
    });

    // ── More Options (3 dots) ──
    document.querySelectorAll('button').forEach(btn => {
      if (btn.querySelector('[class*="more_horiz"]')) {
        btn.addEventListener('click', () => {
          showToast('Event settings: Schedule, Vendors, Budget, Reports', 'info');
        });
      }
    });
  }

  // ──────────────────────────────────────────────────────
  // 21. PROFILE EDITOR (GLOBAL)
  // ──────────────────────────────────────────────────────
  function initProfileEditor() {
    // Load saved profile
    var profile = JSON.parse(localStorage.getItem('mmakwanyProfile') || '{}');
    var defaultProfile = {
      name: profile.name || 'Guest User',
      email: profile.email || 'guest@mmakwany.co.ke',
      phone: profile.phone || '+254 700 000 000',
      avatar: profile.avatar || ''
    };

    // Find all avatar elements — broad selector to catch avatars on any page
    var avatarEls = document.querySelectorAll('.rounded-full[style*="background-image"], img.rounded-full, .size-8.rounded-full, .size-10.rounded-full, .w-8.h-8.rounded-full, .w-10.h-10.rounded-full');
    avatarEls.forEach(function(av) {
      av.style.cursor = 'pointer';
      av.title = 'Click to edit profile';
      av.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openProfileModal();
      });
    });

    // Also hook into any button/link that contains "Social" or person icon as profile trigger
    document.querySelectorAll('button, a').forEach(function(el) {
      var txt = el.textContent.trim().toLowerCase();
      if (txt === 'social' || txt === 'account' || txt === 'profile') {
        el.style.cursor = 'pointer';
        el.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          openProfileModal();
        });
      }
    });
    // Hook person_outline / account_circle icons in header
    document.querySelectorAll('.material-symbols-outlined').forEach(function(icon) {
      var t = icon.textContent.trim();
      if (t === 'person' || t === 'account_circle' || t === 'person_outline') {
        var parent = icon.closest('button') || icon.closest('a') || icon;
        parent.style.cursor = 'pointer';
        parent.title = 'Edit profile';
        parent.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          openProfileModal();
        });
      }
    });

    function openProfileModal() {
      var p = JSON.parse(localStorage.getItem('mmakwanyProfile') || '{}');
      var n = p.name || defaultProfile.name;
      var em = p.email || defaultProfile.email;
      var ph = p.phone || defaultProfile.phone;
      var av = p.avatar || '';

      var ov = document.createElement('div');
      ov.className = 'fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center';
      ov.innerHTML = '<style>@keyframes slideUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}</style>'
        + '<div class="bg-white dark:bg-slate-900 rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl border border-slate-100 dark:border-white/10" style="animation:slideUp 0.3s ease">'
        + '<div class="text-center mb-6">'
        + '<div class="relative inline-block">'
        + '<div class="size-20 rounded-full bg-primary/10 border-4 border-primary/20 mx-auto flex items-center justify-center overflow-hidden" id="prof-avatar">'
        + (av ? '<img src="' + av + '" class="w-full h-full object-cover">' : '<span class="material-symbols-outlined text-primary !text-4xl">person</span>')
        + '</div>'
        + '<label class="absolute bottom-0 right-0 size-7 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary/90 transition-all">'
        + '<span class="material-symbols-outlined text-white !text-sm">photo_camera</span>'
        + '<input type="file" accept="image/*" class="hidden" id="prof-upload">'
        + '</label>'
        + '</div>'
        + '<h3 class="text-xl font-bold mt-3 text-slate-900 dark:text-white">Edit Profile</h3>'
        + '<p class="text-sm text-slate-500">Update your personal information</p>'
        + '</div>'
        + '<div class="space-y-4 mb-6">'
        + '<div><label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>'
        + '<input type="text" id="prof-name" value="' + n + '" class="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-primary focus:border-primary"></div>'
        + '<div><label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>'
        + '<input type="email" id="prof-email" value="' + em + '" class="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-primary focus:border-primary"></div>'
        + '<div><label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>'
        + '<input type="tel" id="prof-phone" value="' + ph + '" class="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-primary focus:border-primary"></div>'
        + '</div>'
        + '<div class="flex gap-3">'
        + '<button class="prof-cancel flex-1 py-3 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 rounded-full text-sm font-semibold hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">Cancel</button>'
        + '<button class="prof-save flex-1 py-3 bg-primary text-white rounded-full text-sm font-bold hover:bg-primary/90 transition-all shadow-lg">Save Profile</button>'
        + '</div>'
        + '</div>';

      ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
      ov.querySelector('.prof-cancel').addEventListener('click', function() { ov.remove(); });

      // Avatar upload
      var uploadInput = ov.querySelector('#prof-upload');
      var avatarPreview = ov.querySelector('#prof-avatar');
      if (uploadInput) {
        uploadInput.addEventListener('change', function(e) {
          var file = e.target.files[0];
          if (!file) return;
          var reader = new FileReader();
          reader.onload = function(ev) {
            avatarPreview.innerHTML = '<img src="' + ev.target.result + '" class="w-full h-full object-cover">';
            avatarPreview.dataset.newAvatar = ev.target.result;
          };
          reader.readAsDataURL(file);
        });
      }

      // Save profile
      ov.querySelector('.prof-save').addEventListener('click', function() {
        var newName = ov.querySelector('#prof-name').value.trim();
        var newEmail = ov.querySelector('#prof-email').value.trim();
        var newPhone = ov.querySelector('#prof-phone').value.trim();
        var newAvatar = avatarPreview.dataset.newAvatar || p.avatar || '';

        if (!newName) { showToast('Please enter your name', 'warning'); return; }
        if (!newEmail || newEmail.indexOf('@') < 0) { showToast('Please enter a valid email', 'warning'); return; }

        var saved = { name: newName, email: newEmail, phone: newPhone, avatar: newAvatar };
        localStorage.setItem('mmakwanyProfile', JSON.stringify(saved));

        // Update avatars on page
        if (newAvatar) {
          avatarEls.forEach(function(el) {
            if (el.tagName === 'IMG') { el.src = newAvatar; }
            else { el.style.backgroundImage = 'url(' + newAvatar + ')'; }
          });
        }

        var saveB = ov.querySelector('.prof-save');
        saveB.innerHTML = '<span class="material-symbols-outlined animate-spin !text-lg">progress_activity</span>';
        saveB.disabled = true;
        setTimeout(function() {
          ov.remove();
          showToast('✅ Profile updated! Welcome, ' + newName);
        }, 800);
      });

      document.body.appendChild(ov);
    }
  }

  // ──────────────────────────────────────────────────────
  // INIT ALL
  // ──────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    // Core UI
    updateHeaderAuth();
    initSearch();
    initMobileMenu();

    // Page-specific logic
    initLogin();
    initRoomBooking();
    initPointsShop();
    initGuestDashboard();
    initAdminDashboard();
    initHallConfigurator();
    initGuestScan();
    initFinancialReport();
    initHousekeeping();
    initPurchasing();
    initStaffComm();
    initEventTicket();

    // Filters & Tabs
    initCateringFilters();
    initPointsFilters();
    initRoomFilters();
    initEventHallFilters();

    // Event coordinator
    initEventCoordinator();

    // Profile editing (global)
    initProfileEditor();

    // Global image replacement (runs on every page)
    replaceExternalImages();
  });

  // Expose Auth globally for inline use
  window.MmakwanyAuth = Auth;
})();
