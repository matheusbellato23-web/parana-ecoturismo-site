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

  // Format list paragraphs into clean check/bullet lists
  formatListsToBullets();

  // Remove duplicate services included from content (since it's in the sidebar)
  removeDuplicateServicesFromContent();

  // Reposition the pricing/tariff table to the top of detail content area
  repositionTariffTable();

  // Reposition specifications grid to a clean sidebar summary box
  repositionSpecsToSidebar();

  // Move the services included list to the main column for a balanced layout
  // repositionServicesToMainContent();

  // Update sidebar text to guide users to the pricing table
  updateSidebarBookingText();

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
      <div class="gallery-blur-bg" style="background-image: url('${images[0].src}');"></div>
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
  const blurBg = premiumGallery.querySelector('.gallery-blur-bg');
  const prevBtn = premiumGallery.querySelector('.prev-btn');
  const nextBtn = premiumGallery.querySelector('.next-btn');

  let currentIndex = 0;

  function setActiveImage(idx) {
    currentIndex = idx;
    activeImage.src = images[idx].src;
    activeImage.alt = images[idx].alt;
    activeImage.setAttribute('data-index', idx);
    if (blurBg) {
      blurBg.style.backgroundImage = `url('${images[idx].src}')`;
    }

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

// Format single list paragraphs into a styled bulleted list (ul class="list-checked")
function formatListsToBullets() {
  const textContent = document.querySelector('.text-content');
  if (!textContent) return;

  const children = Array.from(textContent.children);
  let activeList = null;
  const elementsToRemove = [];

  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    
    if (el.tagName === 'P') {
      const text = el.textContent.trim();
      
      // Check if this paragraph is a list header (ends with a colon ':')
      if (text.endsWith(':')) {
        // Create a new ul list directly after this header
        activeList = document.createElement('ul');
        activeList.className = 'list-checked';
        activeList.style.marginTop = '10px';
        activeList.style.marginBottom = '25px';
        activeList.style.paddingLeft = '20px';
        
        el.parentNode.insertBefore(activeList, el.nextSibling);
        continue;
      }
      
      // If collecting list items
      if (activeList) {
        const isListItem = text.endsWith(';') || text.endsWith('…') || (text.length < 100 && !text.endsWith(':') && !text.includes('<h3>'));
        if (isListItem) {
          const li = document.createElement('li');
          li.textContent = text;
          li.style.marginBottom = '8px';
          li.style.color = 'var(--text-dark)';
          activeList.appendChild(li);
          elementsToRemove.push(el);
        } else {
          activeList = null;
        }
      }
    } else if (el.tagName === 'H3' || el.tagName === 'H2' || el.classList.contains('specs-container') || el.classList.contains('table-responsive')) {
      activeList = null;
    }
  }

  elementsToRemove.forEach(el => el.remove());
}

// Reposition the pricing/tariff table to the top of detail content area, directly below description intro
function repositionTariffTable() {
  const textContent = document.querySelector('.text-content');
  if (!textContent) return;

  const tableContainer = textContent.querySelector('.table-responsive') || textContent.querySelector('.tarifa-table');
  const headings = Array.from(textContent.querySelectorAll('h3'));
  const tariffHeading = headings.find(h => h.textContent.toLowerCase().includes('tarifa'));

  if (tableContainer && tariffHeading) {
    const paragraphs = Array.from(textContent.querySelectorAll(':scope > p'));
    const firstHeading = textContent.querySelector('h3');
    
    const introParagraphs = paragraphs.filter(p => {
      if (firstHeading && (p.compareDocumentPosition(firstHeading) & Node.DOCUMENT_POSITION_PRECEDING)) {
        return false;
      }
      const text = p.textContent.trim();
      return !text.endsWith(';') && !text.toLowerCase().includes('serviços');
    });

    const insertAfter = introParagraphs.length > 0 ? introParagraphs[introParagraphs.length - 1] : textContent.querySelector('h2');
    
    if (insertAfter) {
      const parent = insertAfter.parentNode;
      parent.insertBefore(tariffHeading, nextSiblingElement(insertAfter));
      parent.insertBefore(tableContainer, nextSiblingElement(tariffHeading));
      tableContainer.style.marginBottom = '35px';
    }
  }
}

// Helper function to safely get the next element sibling
function nextSiblingElement(el) {
  let sibling = el.nextSibling;
  while (sibling && sibling.nodeType !== 1) {
    sibling = sibling.nextSibling;
  }
  return sibling;
}

// Update sidebar booking text to reference the prices table
function updateSidebarBookingText() {
  const sidebarBoxes = Array.from(document.querySelectorAll('.sidebar-box'));
  const bookingBox = sidebarBoxes.find(box => box.querySelector('h3')?.textContent.includes('Reservas'));
  if (bookingBox) {
    const pElements = Array.from(bookingBox.querySelectorAll('p'));
    const textParagraph = pElements.find(p => p.textContent.includes('WhatsApp'));
    if (textParagraph) {
      const hasTable = document.querySelector('.tarifa-table') !== null;
      if (hasTable) {
        textParagraph.textContent = 'Escolha o melhor valor para o seu grupo na tabela de tarifas ao lado e agende as datas da sua aventura pelo WhatsApp.';
      } else {
        textParagraph.textContent = 'Entre em contato conosco pelo WhatsApp para obter valores e agendar as datas do seu grupo.';
      }
    }
  }
}

// Remove duplicate services included from content (since it's in the sidebar)
function removeDuplicateServicesFromContent() {
  const textContent = document.querySelector('.text-content');
  if (!textContent) return;

  const paragraphs = Array.from(textContent.querySelectorAll('p'));
  const servicesHeader = paragraphs.find(p => {
    const text = p.textContent.toLowerCase();
    return text.includes('serviços incluídos') || text.includes('serviços inclusos') || text.includes('serviço incluído');
  });

  if (servicesHeader) {
    let next = servicesHeader.nextElementSibling;
    servicesHeader.remove();
    if (next && (next.tagName === 'UL' || next.tagName === 'P')) {
      next.remove();
    }
  }
}

// Reposition specifications grid to a clean sidebar summary box
function repositionSpecsToSidebar() {
  const textContent = document.querySelector('.text-content');
  const sidebar = document.querySelector('.detail-layout > div:last-child');
  if (!textContent || !sidebar) return;

  const specsContainer = textContent.querySelector('.specs-container');
  if (!specsContainer) return;

  // Extract all spec cards
  const cards = Array.from(specsContainer.querySelectorAll('.spec-card'));
  if (cards.length === 0) return;

  const specsList = [];
  cards.forEach(card => {
    const label = card.querySelector('.spec-label')?.textContent.trim();
    const value = card.querySelector('.spec-value')?.textContent.trim();
    if (label && value) {
      specsList.push({ label, value });
    }
  });

  // Create new sidebar box
  const specsBox = document.createElement('div');
  specsBox.className = 'sidebar-box';
  
  let listItemsHTML = '';
  specsList.forEach(spec => {
    let cleanLabel = spec.label;
    if (cleanLabel.toLowerCase() === 'condicionamento físico') cleanLabel = 'Condicionamento';
    if (cleanLabel.toLowerCase() === 'duração da atividade') cleanLabel = 'Duração';
    
    listItemsHTML += `
      <li style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eef5f4; font-size: 0.88rem; align-items: flex-start; gap: 10px;">
        <span style="font-weight: 600; color: var(--secondary); flex-shrink: 0;">${cleanLabel}</span>
        <span style="color: var(--text-dark); text-align: right; word-break: break-word;">${spec.value}</span>
      </li>
    `;
  });

  specsBox.innerHTML = `
    <h3 style="font-size: 1.25rem; margin-bottom: 15px; color: var(--secondary); border-bottom: 2px solid #eef5f4; padding-bottom: 10px;">Resumo da Atividade</h3>
    <ul style="list-style: none; padding: 0; margin: 0;">
      ${listItemsHTML}
    </ul>
  `;

  // Insert at the top of the sidebar
  sidebar.insertBefore(specsBox, sidebar.firstChild);

  // Remove original specs container
  specsContainer.remove();
}

// Move the "Serviços Inclusos" box from the sidebar to the main content area for a better layout
function repositionServicesToMainContent() {
  const textContent = document.querySelector('.text-content');
  const sidebar = document.querySelector('.detail-layout > div:last-child');
  if (!textContent || !sidebar) return;

  const sidebarBoxes = Array.from(sidebar.querySelectorAll('.sidebar-box'));
  const servicesBox = sidebarBoxes.find(box => {
    const h3Text = box.querySelector('h3')?.textContent.toLowerCase() || '';
    return h3Text.includes('serviço') || h3Text.includes('incluso');
  });

  if (servicesBox) {
    // Find the Tariff heading or table to insert the services box right before it
    const tarifaTable = textContent.querySelector('.table-responsive') || textContent.querySelector('.tarifa-table');
    const headings = Array.from(textContent.querySelectorAll('h3'));
    const tariffHeading = headings.find(h => h.textContent.toLowerCase().includes('tarifa'));

    // Apply main content styling class
    servicesBox.classList.remove('sidebar-box');
    servicesBox.classList.add('services-main-box');

    // Remove any stray list items like "Tarifas" if they exist
    const strayTarifasLi = Array.from(servicesBox.querySelectorAll('li')).find(li => li.textContent.trim().toLowerCase() === 'tarifas');
    if (strayTarifasLi) {
      strayTarifasLi.remove();
    }

    if (tariffHeading) {
      textContent.insertBefore(servicesBox, tariffHeading);
    } else if (tarifaTable) {
      textContent.insertBefore(servicesBox, tarifaTable);
    } else {
      textContent.appendChild(servicesBox);
    }
  }
}

// --- DYNAMIC INTERACTIVE FALLING LEAVES INJECTION ---
function initFallingLeaves() {
  if (document.querySelector('.falling-leaves-container')) return;

  // Create leaf container attached directly to document.body for whole-page flow
  const leafContainer = document.createElement('div');
  leafContainer.className = 'falling-leaves-container';
  document.body.appendChild(leafContainer);

  const leafSVGs = [
    // Teal Leaf 1
    `<svg viewBox="0 0 24 24" fill="#18AAA0"><path d="M17,8C8,20 2,21 2,21C2,21 3,15 15,6C17,4.5 21,3 21,3C21,3 19.5,7 17,8Z"/></svg>`,
    // Forest Green Leaf 2
    `<svg viewBox="0 0 24 24" fill="#1E4D4D"><path d="M2,22C2,22 3,16 12,12C21,8 22,2 22,2C22,2 16,3 12,12C8,21 2,22 2,22Z"/></svg>`,
    // Light Leaf Accent 3
    `<svg viewBox="0 0 24 24" fill="#88D4D0"><path d="M12,2 C17.5,7.5 22,12 22,12 C22,12 17.5,16.5 12,22 C6.5,16.5 2,12 2,12 C2,12 6.5,7.5 12,2 Z"/></svg>`
  ];

  const maxLeaves = 22;
  for (let i = 0; i < maxLeaves; i++) {
    createLeaf(leafContainer, leafSVGs);
  }
}

function createLeaf(container, svgs) {
  const leaf = document.createElement('div');
  leaf.className = 'falling-leaf';
  
  // Random leaf shape
  leaf.innerHTML = svgs[Math.floor(Math.random() * svgs.length)];
  
  // Random horizontal positioning, animation duration and delay
  const startX = Math.random() * 100; // in %
  const duration = 7 + Math.random() * 9; // 7s to 16s
  const delay = Math.random() * -18; // start immediately spread out
  const size = 16 + Math.random() * 18; // 16px to 34px
  
  leaf.style.left = `${startX}%`;
  leaf.style.width = `${size}px`;
  leaf.style.height = `${size}px`;
  leaf.style.animationDuration = `${duration}s`;
  leaf.style.animationDelay = `${delay}s`;
  
  container.appendChild(leaf);
  
  // Restart leaf position once animation finishes
  leaf.addEventListener('animationiteration', () => {
    leaf.style.left = `${Math.random() * 100}%`;
  });
}

// Call on load
document.addEventListener('DOMContentLoaded', () => {
  initFallingLeaves();
});







