/**
 * Mmakwany Guest House — Shared Header & Footer Component
 * Injects a consistent navigation and footer across all guest-facing pages.
 * Usage: <script src="components.js"></script> at end of <body>
 */

(function () {
  // Determine which nav link is "active" based on the current filename
  const page = window.location.pathname.split('/').pop() || 'index.html';

  function navClass(targetPage) {
    if (page === targetPage) {
      return 'text-sm font-semibold text-primary relative after:absolute after:bottom-[-20px] after:left-0 after:w-full after:h-0.5 after:bg-primary';
    }
    return 'text-sm font-medium text-slate-600 hover:text-primary transition-colors';
  }

  // ─── HEADER ──────────────────────────────────────────
  const headerHTML = `
<header id="site-header" class="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 lg:px-12 py-4">
  <div class="max-w-7xl mx-auto flex items-center justify-between">
    <a href="index.html" class="flex items-center gap-2 text-primary no-underline">
      <div class="w-8 h-8">
        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
        </svg>
      </div>
      <span class="text-xl font-bold tracking-tight text-slate-900">Mmakwany Guest House</span>
    </a>
    <nav class="hidden md:flex items-center gap-8">
      <a class="${navClass('room-booking.html')}" href="room-booking.html">Stays</a>
      <a class="${navClass('index.html')}" href="index.html">Events</a>
      <a class="${navClass('guest-dashboard.html')}" href="guest-dashboard.html">Catering</a>
      <a class="${navClass('points-shop.html')}" href="points-shop.html">Rewards</a>
    </nav>
    <div class="flex items-center gap-3">
      <button class="p-2 text-slate-400 hover:text-primary transition-colors">
        <span class="material-symbols-outlined">search</span>
      </button>
      <a class="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors" href="login.html">
        <span class="material-symbols-outlined text-sm">person</span>
        <span class="text-sm font-medium">Log in</span>
      </a>
    </div>
  </div>
</header>`;

  // ─── FOOTER ──────────────────────────────────────────
  const footerHTML = `
<footer id="site-footer" class="bg-white border-t border-gray-100 py-12 px-6 lg:px-12">
  <div class="max-w-7xl mx-auto">
    <div class="flex flex-col md:flex-row justify-between items-center gap-8">
      <a href="index.html" class="flex items-center gap-2 text-primary grayscale opacity-70 no-underline">
        <div class="w-6 h-6">
          <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
          </svg>
        </div>
        <span class="text-lg font-bold tracking-tight text-slate-900">Mmakwany Guest House</span>
      </a>
      <div class="flex gap-8 text-sm text-slate-500">
        <a class="hover:text-primary" href="#">About</a>
        <a class="hover:text-primary" href="#">Privacy</a>
        <a class="hover:text-primary" href="#">Terms</a>
        <a class="hover:text-primary" href="#">Support</a>
      </div>
      <div class="flex gap-4">
        <a class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-slate-400 hover:text-primary transition-colors" href="#">
          <span class="material-symbols-outlined !text-lg">public</span>
        </a>
        <a class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-slate-400 hover:text-primary transition-colors" href="#">
          <span class="material-symbols-outlined !text-lg">mail</span>
        </a>
      </div>
    </div>
    <div class="mt-8 pt-8 border-t border-gray-50 text-center text-[10px] uppercase tracking-widest text-slate-400 font-medium">
      © 2024 Mmakwany Guest House Hospitality Group. All rights reserved.
    </div>
  </div>
</footer>`;

  // ─── INJECTION ───────────────────────────────────────
  // Replace existing header
  const existingHeader = document.querySelector('header');
  if (existingHeader) {
    existingHeader.outerHTML = headerHTML;
  } else {
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
  }

  // Replace existing footer
  const existingFooter = document.querySelector('footer');
  if (existingFooter) {
    existingFooter.outerHTML = footerHTML;
  } else {
    document.body.insertAdjacentHTML('beforeend', footerHTML);
  }
})();
