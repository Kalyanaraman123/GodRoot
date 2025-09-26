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

      // collect data
      var formData = new FormData(form);

      // prefer jQuery if available
      if (window.jQuery) {
        // Use jQuery POST and reload on success
        window.jQuery.post(form.action, new URLSearchParams([...formData]).toString())
          .done(function (resp) {
            alert('Added to cart');
            location.reload();
          })
          .fail(function () {
            alert('Could not add to cart (try again).');
          });
        return;
      }

      // Vanilla fallback using fetch
      fetch(form.action, {
        method: form.method ? form.method.toUpperCase() : 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          // For fetch, do NOT set Content-Type here when using FormData
        },
        body: formData,
        credentials: 'same-origin'
      })
      .then(function (r) {
        if (!r.ok) throw new Error('Network response not ok');
        return r.json().catch(function(){ return {}; });
      })
      .then(function (data) {
        // best-effort feedback
        try { alert('Added to cart'); } catch (e) {}
        // reload to update cart display; you can update DOM instead for nicer UX
        location.reload();
      })
      .catch(function () {
        alert('Could not add to cart (try again).');
      });
    }

    // Attach submit listeners: delegate for dynamic forms
    // For jQuery, delegation is handled separately below for convenience.
    if (!window.jQuery) {
      // vanilla delegation for forms with action including /cart/add
      document.addEventListener('submit', function (ev) {
        // If the event is from a form element, call handler
        handleCartFormSubmit(ev);
      }, true);
    } else {
      // jQuery delegation (works even if forms are added dynamically)
      (function($){
        $(document).on('submit', 'form[action*="/cart/add"]', function (e) {
          e.preventDefault();
          var $form = $(this);
          var url = $form.attr('action');
          var data = $form.serialize();
          $.post(url, data)
            .done(function(resp){
              alert('Added to cart');
              location.reload();
            })
            .fail(function(){
              alert('Could not add to cart');
            });
        });
      })(window.jQuery);
    }


    /* -----------------------
       2) Modal (quick view) handlers
       - Closes on close-btn, outside click, or ESC
       - Defines window.openQuick() and window.closeQuick()
       ----------------------- */
    var modal = document.getElementById('quickModal');
    if (modal) {
      var modalCard = modal.querySelector('.modal-card') || modal.querySelector('.modal-inner') || null;

      // ensure closeQuick exists globally for inline onclick handlers
      window.closeQuick = function closeQuick() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        try { document.body.style.overflow = ''; } catch (e) {}
      };

      window.openQuick = function openQuick(opts) {
        opts = opts || {};
        var img = opts.img, title = opts.title, price = opts.price, desc = opts.desc;
        if (img) {
          var i = modal.querySelector('#qimg');
          if (i) i.src = img;
        }
        if (title) {
          var t = modal.querySelector('#qtitle');
          if (t) t.innerText = title;
        }
        if (price) {
          var p = modal.querySelector('#qprice');
          if (p) p.innerText = price;
        }
        if (desc) {
          var d = modal.querySelector('#qdesc');
          if (d) d.innerText = desc;
        }
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        try { document.body.style.overflow = 'hidden'; } catch (e) {}
      };

      // attach any internal close buttons
      var closeBtns = modal.querySelectorAll('.close-btn, .btn.close, .btn[aria-label="Close"]');
      closeBtns.forEach(function(b){ b.addEventListener('click', window.closeQuick); });

      // backdrop click closes when clicking outside modalCard
      modal.addEventListener('click', function(ev){
        if (ev.target === modal) window.closeQuick();
      });

      // ESC key closes modal
      document.addEventListener('keydown', function(ev){
        if ((ev.key === 'Escape' || ev.key === 'Esc') && modal.classList.contains('open')) {
          window.closeQuick();
        }
      });

      // defensive: if modal left open on load, lock scroll
      if (modal.classList.contains('open')) {
        try { document.body.style.overflow = 'hidden'; } catch (e) {}
      }
    } // end modal exists


    /* -----------------------
       3) Hamburger / drawer behavior (if present)
       ----------------------- */
    var hamburgerBtn = document.getElementById('hamburgerBtn');
    var drawer = document.getElementById('drawer');
    var hamburgerDropdown = document.getElementById('hamburgerDropdown');

    if (hamburgerBtn) {
      hamburgerBtn.addEventListener('click', function () {
        var isMobile = window.innerWidth <= 880;
        if (isMobile) {
          if (drawer) {
            var open = drawer.classList.toggle('open');
            drawer.setAttribute('aria-hidden', !open);
            hamburgerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
          }
        } else {
          if (hamburgerDropdown) {
            var opend = hamburgerDropdown.classList.toggle('open');
            hamburgerDropdown.setAttribute('aria-hidden', !opend);
            hamburgerBtn.setAttribute('aria-expanded', opend ? 'true' : 'false');
          }
        }
      });
    }

    // close drawer/dropdown on outside click
    document.addEventListener('click', function(e){
      var t = e.target;
      if (drawer && !drawer.contains(t) && hamburgerBtn && !hamburgerBtn.contains(t) && hamburgerDropdown && !hamburgerDropdown.contains(t)) {
        drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true');
        hamburgerDropdown.classList.remove('open'); hamburgerDropdown.setAttribute('aria-hidden', 'true');
        if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded','false');
      }
    });

    // close drawer/dropdown on resize crossing breakpoint
    window.addEventListener('resize', function(){
      if (!drawer || !hamburgerDropdown) return;
      if (window.innerWidth <= 880) {
        hamburgerDropdown.classList.remove('open'); hamburgerDropdown.setAttribute('aria-hidden','true');
      } else {
        drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true');
      }
    });

  }); // end ready
})(); // end IIFE
