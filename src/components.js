// --- PRELOADER INJECTION ---
(function injectPreloader() {
  // Check if we are on the home page (index.html, inicio.html, or /)
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const isHomePage = currentPath === 'index.html' || currentPath === 'inicio.html' || currentPath === '';
  if (!isHomePage) return;

  const preloaderHTML = `
  <div id="preloader" class="preloader">
    <div class="preloader-content">
      <div class="preloader-logo-wrapper">
         <svg class="preloader-svg" viewBox="0 0 64 64" width="80" height="80">
           <path d="M32,2 C18,16 10,28 10,40 C10,52 20,62 32,62 C44,62 54,52 54,40 C54,28 46,16 32,2 Z" fill="none" stroke="#18AAA0" stroke-width="3" stroke-dasharray="10 5" class="spinner-track"></path>
           <path d="M32,10 C32,10 20,24 20,38 C20,46 25,52 32,52 C39,52 44,46 44,38 C44,24 32,10 32,10 Z" fill="#18AAA0" class="pulsing-leaf"></path>
           <path d="M32,20 L32,48" stroke="#1E4D4D" stroke-width="2" stroke-linecap="round"></path>
           <path d="M32,32 Q26,38 24,36" stroke="#1E4D4D" stroke-width="2" stroke-linecap="round" fill="none"></path>
           <path d="M32,26 Q38,32 40,30" stroke="#1E4D4D" stroke-width="2" stroke-linecap="round" fill="none"></path>
           <path d="M32,38 Q38,44 40,42" stroke="#1E4D4D" stroke-width="2" stroke-linecap="round" fill="none"></path>
         </svg>
      </div>
      <h2 class="preloader-text">Paraná Ecoturismo</h2>
      <div class="preloader-bar">
        <div class="preloader-progress"></div>
      </div>
    </div>
  </div>
  `;
  if (document.body) {
    document.body.insertAdjacentHTML('afterbegin', preloaderHTML);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      document.body.insertAdjacentHTML('afterbegin', preloaderHTML);
    });
  }

  const startTime = Date.now();
  const MIN_PRELOADER_TIME = 1800; // 1.8 seconds minimum to match CSS progress bar animation

  // Remove preloader on load
  const removePreloader = () => {
    const elapsed = Date.now() - startTime;
    const delay = Math.max(0, MIN_PRELOADER_TIME - elapsed);

    setTimeout(() => {
      const preloader = document.getElementById('preloader');
      if (preloader && !preloader.classList.contains('fade-out')) {
        preloader.classList.add('fade-out');
        setTimeout(() => preloader.remove(), 600);
      }
    }, delay);
  };

  window.addEventListener('load', removePreloader);
  // Safety timeout
  setTimeout(removePreloader, 4000);
})();

document.addEventListener('DOMContentLoaded', () => {
  // Load Navbar
  const navbarContainer = document.getElementById('navbar');
  if (navbarContainer) {
    fetch('components/navbar.html')
      .then(res => {
        if (!res.ok) throw new Error('Navbar response not OK');
        return res.text();
      })
      .then(html => {
        navbarContainer.innerHTML = html;
        initNavbar();
      })
      .catch(err => console.error('Failed to load navbar:', err));
  }

  // Load Footer
  const footerContainer = document.getElementById('footer');
  if (footerContainer) {
    fetch('components/footer.html')
      .then(res => {
        if (!res.ok) throw new Error('Footer response not OK');
        return res.text();
      })
      .then(html => {
        footerContainer.innerHTML = html;
      })
      .catch(err => console.error('Failed to load footer:', err));
  }

  // Initialize Scroll Animations
  initScrollAnimations();

  // Inject Floating WhatsApp Button
  injectFloatingWhatsApp();

  // Initialize Contact Form Submission Handler
  initContactForm();

  // Build premium interactive gallery at the top of detail pages
  buildPremiumGallery();

  // Initialize Gallery Lightbox click-to-expand
  initLightbox();
});

function initNavbar() {
  const toggleBtn = document.getElementById('menu-toggle-btn');
  const navMenu = document.getElementById('nav-menu-bar');

  if (toggleBtn && navMenu) {
    // Create and append backdrop overlay dynamically if it doesn't exist yet
    let overlay = document.getElementById('nav-menu-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'nav-menu-overlay';
      overlay.className = 'nav-overlay';
      document.body.appendChild(overlay);
    }

    const openMenu = () => {
      toggleBtn.setAttribute('aria-expanded', 'true');
      navMenu.classList.add('open');
      toggleBtn.classList.add('active');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      toggleBtn.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('open');
      toggleBtn.classList.remove('active');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    };

    toggleBtn.addEventListener('click', () => {
      const isOpen = navMenu.classList.contains('open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close menu when clicking outside (on the backdrop overlay)
    overlay.addEventListener('click', closeMenu);

    // Close menu when pressing Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        closeMenu();
      }
    });
  }

  // Highlight active page
  let currentPath = window.location.pathname.split('/').pop() || 'index.html';
  
  // If Vite dev server routes without trailing .html in address bar, normalise it
  if (currentPath === '') currentPath = 'index.html';
  if (!currentPath.includes('.')) currentPath = currentPath + '.html';

  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath) {
      link.classList.add('active');
    }
  });

  // Sticky header transition on scroll
  const header = document.querySelector('.site-header');
  if (header) {
    // Set initial scroll state in case page is refreshed while scrolled
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    }
    
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }
}

function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  
  if (elements.length === 0) {
    // If no explicit classes, auto-target common containers to slide them up nicely on scroll
    const autoElements = document.querySelectorAll('.section, .card-aventura, .feature-card, .testimonial-card, .text-content, .img-frame, .specs-container, .contact-info-card, .contact-form');
    autoElements.forEach((el) => {
      el.classList.add('animate-on-scroll');
      
      // Stagger delay for elements inside grids/flex rows
      if (el.classList.contains('card-aventura') || el.classList.contains('feature-card') || el.classList.contains('testimonial-card')) {
        const siblingIndex = Array.from(el.parentNode.children).indexOf(el);
        if (siblingIndex > 0) {
          el.classList.add(`delay-${Math.min(siblingIndex, 4)}`);
        }
      }
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}

function injectFloatingWhatsApp() {
  const whatsappURL = "https://api.whatsapp.com/send?phone=554196252186&text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20as%20aventuras.";
  const btnHTML = `
    <a href="${whatsappURL}" target="_blank" rel="noopener noreferrer" class="whatsapp-floating-btn" aria-label="Fale conosco no WhatsApp">
      <svg viewBox="0 0 448 512" width="28" height="28" fill="currentColor">
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L3 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
      </svg>
    </a>
  `;
  document.body.insertAdjacentHTML('beforeend', btnHTML);
}

function initContactForm() {
  const form = document.getElementById('contact-us-form');
  if (!form) return;

  // Inject Toast HTML markup
  const toastHTML = `
    <div id="toast-alert" class="toast-notification">
      <span id="toast-icon" class="toast-icon">✓</span>
      <span id="toast-message" class="toast-message">Mensagem enviada com sucesso!</span>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', toastHTML);

  const toast = document.getElementById('toast-alert');
  const toastIcon = document.getElementById('toast-icon');
  const toastMsg = document.getElementById('toast-message');

  const showToast = (message, isError = false) => {
    toastMsg.textContent = message;
    if (isError) {
      toast.classList.add('error');
      toastIcon.textContent = '❌';
    } else {
      toast.classList.remove('error');
      toastIcon.textContent = '✓';
    }
    toast.classList.add('active');
    setTimeout(() => {
      toast.classList.remove('active');
    }, 5000);
  };

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;

    const formData = new FormData(form);
    const data = {
      access_key: '28671378-bc57-427a-8261-217a652b583e',
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      subject: formData.get('subject'),
      message: formData.get('message')
    };

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(async (response) => {
      let json = await response.json();
      if (response.status == 200) {
        showToast('Mensagem enviada com sucesso!');
        form.reset();
      } else {
        console.error(response);
        showToast(json.message || 'Erro ao enviar a mensagem. Tente novamente.', true);
      }
    })
    .catch(error => {
      console.error(error);
      showToast('Erro de rede. Verifique sua conexão.', true);
    })
    .then(() => {
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
    });
  });
}

// Build and Inject Premium Interactive Gallery at the Top
function buildPremiumGallery() {
  const detailLayout = document.querySelector('.detail-layout');
  if (!detailLayout) return;

  // Find all gallery images inside .img-frame
  const originalFrames = Array.from(document.querySelectorAll('.text-content .img-frame'));
  const originalImages = Array.from(document.querySelectorAll('.text-content .img-frame img'));
  if (originalImages.length === 0) return;

  // Extract sources and alts
  const images = originalImages.map(img => ({
    src: img.src,
    alt: img.alt || 'Foto do Roteiro'
  }));

  // Find and remove gallery headings
  const headings = Array.from(document.querySelectorAll('.text-content h3'));
  const galleryHeading = headings.find(h => h.textContent.toLowerCase().includes('galeria'));
  if (galleryHeading) {
    galleryHeading.remove();
  }

  // Remove the old image frames
  originalFrames.forEach(frame => frame.remove());

  // Also remove the parent grid if it's left empty
  const textContent = document.querySelector('.text-content');
  if (textContent) {
    const divs = Array.from(textContent.querySelectorAll('div'));
    divs.forEach(div => {
      if (div.children.length === 0 && div.textContent.trim() === '') {
        div.remove();
      }
    });
  }

  // Create premium-gallery elements
  const premiumGallery = document.createElement('div');
  premiumGallery.className = 'premium-gallery';
  
  premiumGallery.innerHTML = `
    <div class="gallery-main-viewer">
      <button class="gallery-nav-btn prev-btn" aria-label="Anterior">&#10094;</button>
      <img class="gallery-active-image" src="${images[0].src}" alt="${images[0].alt}" data-index="0">
      <button class="gallery-nav-btn next-btn" aria-label="Próximo">&#10095;</button>
    </div>
    <div class="gallery-thumbnails"></div>
  `;

  const thumbnailsContainer = premiumGallery.querySelector('.gallery-thumbnails');
  images.forEach((img, idx) => {
    const thumb = document.createElement('div');
    thumb.className = `gallery-thumb-item ${idx === 0 ? 'active' : ''}`;
    thumb.innerHTML = `<img src="${img.src}" alt="Miniatura ${idx + 1}">`;
    thumb.addEventListener('click', () => setActiveImage(idx));
    thumbnailsContainer.appendChild(thumb);
  });

  const activeImage = premiumGallery.querySelector('.gallery-active-image');
  const prevBtn = premiumGallery.querySelector('.prev-btn');
  const nextBtn = premiumGallery.querySelector('.next-btn');

  let currentIndex = 0;

  function setActiveImage(idx) {
    currentIndex = idx;
    activeImage.src = images[idx].src;
    activeImage.alt = images[idx].alt;
    activeImage.setAttribute('data-index', idx);

    // Update active class on thumbnails
    const thumbs = Array.from(thumbnailsContainer.querySelectorAll('.gallery-thumb-item'));
    thumbs.forEach((t, i) => {
      if (i === idx) {
        t.classList.add('active');
        t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        t.classList.remove('active');
      }
    });
  }

  // Prev / Next actions
  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) prevIdx = images.length - 1;
    setActiveImage(prevIdx);
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    let nextIdx = currentIndex + 1;
    if (nextIdx >= images.length) nextIdx = 0;
    setActiveImage(nextIdx);
  });

  // Hide arrows if only 1 image
  if (images.length <= 1) {
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
  }

  // Inject at the beginning of the container, before detailLayout
  detailLayout.parentNode.insertBefore(premiumGallery, detailLayout);
}

// Initialize Lightbox Gallery on Click
function initLightbox() {
  const activeImg = document.querySelector('.gallery-active-image');
  const thumbs = Array.from(document.querySelectorAll('.gallery-thumb-item img'));
  
  // If there's no premium gallery, check for original gallery structure
  const originalImages = Array.from(document.querySelectorAll('.img-frame img, .gallery img'));
  
  const imagesList = thumbs.length > 0 ? thumbs : originalImages;
  if (imagesList.length === 0) return;

  // Create lightbox markup dynamically if it doesn't exist yet
  let lightbox = document.getElementById('global-lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'global-lightbox';
    lightbox.className = 'lightbox-modal';
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <button class="lightbox-close" aria-label="Fechar">&times;</button>
        <button class="lightbox-prev" aria-label="Anterior">&#10094;</button>
        <img class="lightbox-image" src="" alt="Imagem Expandida">
        <button class="lightbox-next" aria-label="Próximo">&#10095;</button>
      </div>
    `;
    document.body.appendChild(lightbox);
  }

  const lightboxImg = lightbox.querySelector('.lightbox-image');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');
  
  let currentIndex = 0;

  const showImage = (index) => {
    if (index < 0 || index >= imagesList.length) return;
    currentIndex = index;
    const clickedImg = imagesList[index];
    lightboxImg.src = clickedImg.src;
    lightboxImg.alt = clickedImg.alt || 'Imagem Expandida';

    // Show/hide navigation arrows based on count
    if (imagesList.length <= 1) {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
    } else {
      prevBtn.style.display = 'block';
      nextBtn.style.display = 'block';
    }
  };

  // If we have an active main image viewer, clicking it opens the lightbox at its current index
  if (activeImg) {
    activeImg.addEventListener('click', () => {
      const idx = parseInt(activeImg.getAttribute('data-index') || '0', 10);
      showImage(idx);
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden'; // Lock background scrolling
    });
  } else {
    // Fallback: click directly on images in standard layout
    imagesList.forEach((img, idx) => {
      img.addEventListener('click', () => {
        showImage(idx);
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });
  }

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = ''; // Restore background scrolling
  };

  closeBtn.addEventListener('click', closeLightbox);
  
  // Close on clicking backdrop
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
      closeLightbox();
    }
  });

  // Prev / Next button actions
  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) prevIdx = imagesList.length - 1;
    showImage(prevIdx);
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    let nextIdx = currentIndex + 1;
    if (nextIdx >= imagesList.length) nextIdx = 0;
    showImage(nextIdx);
  });

  // Keyboard navigation support
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevBtn.click();
    if (e.key === 'ArrowRight') nextBtn.click();
  });
}





