// Sticky header
(function(){
  const header = document.getElementById('siteHeader');
  if(!header) return;
  const onScroll = () => {
    if(window.scrollY > 8) header.classList.add('is-stuck');
    else header.classList.remove('is-stuck');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});
})();

// Search overlay
(function(){
  const openBtn = document.getElementById('searchBtn');
  const bar = document.getElementById('searchBar');
  const closeBtn = document.getElementById('searchClose');
  const input = document.getElementById('searchInput');
  if(!openBtn || !bar) return;

  openBtn.addEventListener('click', ()=>{
    bar.classList.add('active');
    setTimeout(()=> input && input.focus(), 50);
  });
  closeBtn && closeBtn.addEventListener('click', ()=> bar.classList.remove('active'));
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') bar.classList.remove('active');
  });
})();

// Mobile drawer + submenus
(function(){
  const drawer = document.getElementById('mobileMenu');
  const open = document.getElementById('menuToggle');
  const close = document.getElementById('mobileMenuClose');
  if(!drawer || !open) return;

  const setOpen = (v)=> drawer.classList.toggle('open', v);

  open.addEventListener('click', ()=> setOpen(true));
  close && close.addEventListener('click', ()=> setOpen(false));
  drawer.addEventListener('click', (e)=>{
    if(e.target === drawer) setOpen(false);
  });

  drawer.querySelectorAll('.mobile-nav-toggle').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const sub = btn.nextElementSibling;
      const openNow = sub.style.display === 'block';
      drawer.querySelectorAll('.mobile-submenu').forEach(s=> s.style.display='none');
      sub.style.display = openNow ? 'none' : 'block';
    });
  });

  // Optional convenience
  const mLogin = document.getElementById('mobileLoginBtn');
  const mLogout = document.getElementById('mobileLogoutBtn');
  mLogin && mLogin.addEventListener('click', ()=> window.location.href='/accounts/login/');
  mLogout && mLogout.addEventListener('click', ()=> document.getElementById('logoutBtn')?.click());
})();

// Desktop nav dropdowns on click (along with hover via CSS)
(function(){
  document.querySelectorAll('.nav-dropdown .nav-link').forEach(btn=>{
    const menu = btn.parentElement.querySelector('.dropdown-menu');
    if(!menu) return;
    btn.addEventListener('click', (e)=>{
      e.preventDefault();
      const isOpen = menu.style.display === 'block';
      document.querySelectorAll('.nav-dropdown .dropdown-menu').forEach(m=> m.style.display='none');
      menu.style.display = isOpen ? 'none' : 'block';
    });
    document.addEventListener('click', (e)=>{
      if(!btn.parentElement.contains(e.target)) menu.style.display='none';
    });
  });
})();

// Hero slider with autoplay + dots + arrows
(function(){
  const slider = document.getElementById('heroSlider');
  if(!slider) return;

  const slides = Array.from(slider.querySelectorAll('.hero-slide'));
  const dotsWrap = slider.querySelector('#heroDots');
  const prev = slider.querySelector('#heroPrev');
  const next = slider.querySelector('#heroNext');

  let idx = 0;
  let timer;

  const goto = (i)=>{
    slides.forEach(s=> s.classList.remove('active'));
    idx = (i + slides.length) % slides.length;
    slides[idx].classList.add('active');
    Array.from(dotsWrap.children).forEach((d,k)=> d.classList.toggle('active', k===idx));
  };

  // dots
  slides.forEach((_, i)=>{
    const b = document.createElement('button');
    b.addEventListener('click', ()=> { goto(i); restart(); });
    dotsWrap.appendChild(b);
  });

  const nextSlide = ()=> goto(idx+1);
  const prevSlide = ()=> goto(idx-1);

  const autoplay = ()=> timer = setInterval(nextSlide, 5000);
  const stop = ()=> clearInterval(timer);
  const restart = ()=> { stop(); autoplay(); };

  next && next.addEventListener('click', ()=> { nextSlide(); restart(); });
  prev && prev.addEventListener('click', ()=> { prevSlide(); restart(); });

  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', autoplay);

  goto(0);
  autoplay();
})();

// Product image hover: swap to alt image if provided
(function(){
  document.querySelectorAll('.product-card[data-hover-alt="true"] .product-image img').forEach(img=>{
    const alt = img.getAttribute('data-alt');
    if(!alt) return;
    const orig = img.getAttribute('src');
    img.addEventListener('mouseenter', ()=> img.setAttribute('src', alt));
    img.addEventListener('mouseleave', ()=> img.setAttribute('src', orig));
    img.addEventListener('focus', ()=> img.setAttribute('src', alt));
    img.addEventListener('blur', ()=> img.setAttribute('src', orig));
  });
})();
