// site.js — combined handlers for cart forms + modal + hamburger behavior
(function () {
  // ---------- DOM ready ----------
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    /* -----------------------
       1) AJAX cart add handler
       - If jQuery present use $.post fallback to reload
       - Otherwise use fetch() to POST form data
       ----------------------- */
    function handleCartFormSubmit(e) {
      var form = e.target;
      if (!form || !form.action) return;
      
      // Only handle our cart forms (URL starts with /cart/add/ or /cart/add)
      if (!form.action.includes('/cart/add')) return;

      e.preventDefault();

      // Collect data
      var formData = new FormData(form);

      // Prefer jQuery if available
      if (window.jQuery) {
        // Use jQuery POST and reload on success
        window.jQuery.post(form.action, window.jQuery.param(Object.fromEntries(formData)))
          .done(function (resp) {
            showNotification('Added to cart');
            // Update cart count without full page reload for better UX
            updateCartCount();
          })
          .fail(function () {
            showNotification('Could not add to cart (try again).', 'error');
          });
        return;
      }

      // Vanilla fallback using fetch
      fetch(form.action, {
        method: form.method ? form.method.toUpperCase() : 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: formData,
        credentials: 'same-origin'
      })
      .then(function (r) {
        if (!r.ok) throw new Error('Network response not ok');
        return r.json().catch(function(){ return {}; });
      })
      .then(function (data) {
        showNotification('Added to cart');
        updateCartCount();
      })
      .catch(function () {
        showNotification('Could not add to cart (try again).', 'error');
      });
    }

    // Simple notification function
    function showNotification(message, type = 'success') {
      // Remove existing notification
      var existingNotification = document.querySelector('.cart-notification');
      if (existingNotification) {
        existingNotification.remove();
      }

      var notification = document.createElement('div');
      notification.className = 'cart-notification ' + type;
      notification.textContent = message;
      notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'error' ? '#ff4444' : '#000'};
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
      `;

      document.body.appendChild(notification);

      // Auto remove after 3 seconds
      setTimeout(function() {
        if (notification.parentNode) {
          notification.style.animation = 'slideOut 0.3s ease';
          setTimeout(function() {
            if (notification.parentNode) notification.remove();
          }, 300);
        }
      }, 3000);
    }

    // Update cart count function
    function updateCartCount() {
      // You can implement AJAX cart count update here
      // For now, we'll do a soft reload of the page
      setTimeout(function() {
        // Instead of full page reload, you can fetch cart data and update the count
        // This is a simplified version - you might want to implement proper cart API
        var cartBadge = document.querySelector('.icon-badge');
        if (cartBadge) {
          var currentCount = parseInt(cartBadge.textContent) || 0;
          cartBadge.textContent = currentCount + 1;
        }
      }, 500);
    }

    // Add CSS for animations
    var style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    // Attach submit listeners
    document.addEventListener('submit', function (ev) {
      if (ev.target && ev.target.action && ev.target.action.includes('/cart/add')) {
        handleCartFormSubmit(ev);
      }
    }, true);

    /* -----------------------
       2) Modal (quick view) handlers
       ----------------------- */
    var modal = document.getElementById('quickModal');
    if (modal) {
      var modalCard = modal.querySelector('.modal-card') || modal.querySelector('.modal-inner');

      // Global close function
      window.closeQuick = function closeQuick() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      };

      // Global open function
      window.openQuick = function openQuick(opts) {
        opts = opts || {};
        var img = opts.img, title = opts.title, price = opts.price, desc = opts.desc;
        
        if (img) {
          var i = modal.querySelector('#qimg');
          if (i) i.src = img;
        }
        if (title) {
          var t = modal.querySelector('#qtitle');
          if (t) t.textContent = title;
        }
        if (price) {
          var p = modal.querySelector('#qprice');
          if (p) p.textContent = price;
        }
        if (desc) {
          var d = modal.querySelector('#qdesc');
          if (d) d.textContent = desc;
        }
        
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      };

      // Close buttons
      var closeBtns = modal.querySelectorAll('.close-btn, .btn.close, [aria-label="Close"]');
      closeBtns.forEach(function(b){ 
        b.addEventListener('click', window.closeQuick); 
      });

      // Backdrop click
      modal.addEventListener('click', function(ev){
        if (ev.target === modal) window.closeQuick();
      });

      // ESC key
      document.addEventListener('keydown', function(ev){
        if ((ev.key === 'Escape' || ev.key === 'Esc') && modal.classList.contains('open')) {
          window.closeQuick();
        }
      });
    }

    /* -----------------------
       3) Search modal functionality
       ----------------------- */
    var searchBtn = document.getElementById('searchBtn');
    var searchModal = document.getElementById('searchModal');
    var searchClose = document.getElementById('searchClose');

    if (searchBtn && searchModal) {
      searchBtn.addEventListener('click', function() {
        searchModal.style.display = 'flex';
        searchModal.setAttribute('aria-hidden', 'false');
        // Focus on search input when opened
        var searchInput = searchModal.querySelector('input');
        if (searchInput) searchInput.focus();
      });

      if (searchClose) {
        searchClose.addEventListener('click', function() {
          searchModal.style.display = 'none';
          searchModal.setAttribute('aria-hidden', 'true');
        });
      }

      // Close when clicking outside
      searchModal.addEventListener('click', function(e) {
        if (e.target === searchModal) {
          searchModal.style.display = 'none';
          searchModal.setAttribute('aria-hidden', 'true');
        }
      });

      // ESC key to close search modal
      document.addEventListener('keydown', function(e) {
        if ((e.key === 'Escape' || e.key === 'Esc') && searchModal.style.display === 'flex') {
          searchModal.style.display = 'none';
          searchModal.setAttribute('aria-hidden', 'true');
        }
      });
    }

    /* -----------------------
       4) Hamburger / drawer behavior
       ----------------------- */
       const hamburgerBtn = document.getElementById('hamburgerBtn');
    const drawer = document.getElementById('drawer');
    const drawerClose = document.getElementById('drawerClose');
    const hamburgerDropdown = document.getElementById('hamburgerDropdown');

    // Function to close all menus
    function closeAllMenus() {
      if (drawer) {
        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
      }
      if (hamburgerDropdown) {
        hamburgerDropdown.classList.remove('open');
        hamburgerDropdown.setAttribute('aria-hidden', 'true');
      }
      if (hamburgerBtn) {
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      }
      document.body.style.overflow = '';
    }

    // Hamburger button click
    if (hamburgerBtn) {
      hamburgerBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
          // Mobile: toggle drawer
          if (drawer) {
            const isOpen = drawer.classList.contains('open');
            closeAllMenus();
            if (!isOpen) {
              drawer.classList.add('open');
              drawer.setAttribute('aria-hidden', 'false');
              hamburgerBtn.setAttribute('aria-expanded', 'true');
              document.body.style.overflow = 'hidden';
            }
          }
        } else {
          // Desktop: toggle dropdown
          if (hamburgerDropdown) {
            const isOpen = hamburgerDropdown.classList.contains('open');
            closeAllMenus();
            if (!isOpen) {
              hamburgerDropdown.classList.add('open');
              hamburgerDropdown.setAttribute('aria-hidden', 'false');
              hamburgerBtn.setAttribute('aria-expanded', 'true');
            }
          }
        }
      });
    }

    // Close drawer button
    if (drawerClose) {
      drawerClose.addEventListener('click', closeAllMenus);
    }

    // Close menus when clicking outside
    document.addEventListener('click', function(e) {
      if (!drawer?.contains(e.target) && 
          !hamburgerBtn?.contains(e.target) && 
          !hamburgerDropdown?.contains(e.target)) {
        closeAllMenus();
      }
    });

    // Close on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeAllMenus();
      }
    });

    // Close appropriate menu on resize
    window.addEventListener('resize', function() {
      closeAllMenus();
    });

    /* -----------------------
       5) Login/Logout functionality
       ----------------------- */
    var logoutBtn = document.getElementById('logoutBtn');
    var drawerLogout = document.getElementById('drawerLogout');
    var loginBtn = document.getElementById('loginBtn');
    var drawerLogin = document.getElementById('drawerLogin');

    function handleLogout() {
      window.location.href = '/accounts/logout/';
    }

    function handleLogin() {
      window.location.href = '/accounts/login/';
    }

    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (drawerLogout) drawerLogout.addEventListener('click', handleLogout);
    if (loginBtn) loginBtn.addEventListener('click', handleLogin);
    if (drawerLogin) drawerLogin.addEventListener('click', handleLogin);

    /* -----------------------
       6) Smooth scrolling for anchor links
       ----------------------- */
    document.addEventListener('click', function(e) {
      if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        var target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });

    /* -----------------------
       7) Product card hover effects enhancement
       ----------------------- */
    var productCards = document.querySelectorAll('.product-card');
    productCards.forEach(function(card) {
      card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
      });
      
      card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
      });
    });

  }); // end ready

})(); // end IIFE