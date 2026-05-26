/* =========================================================
   MITEPUY — AGENT TEMPLATE JS
   Descripción:
   Motor global reutilizable para perfiles de agentes.
   Maneja menú móvil, cambio de idioma y carga de textos
   desde ./data/es.json y ./data/en.json.
========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const state = {
    lang: localStorage.getItem("mitepuy_lang") || "es",
    translations: {},
  };

  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const menuClose = document.querySelector("[data-menu-close]");
  const langToggle = document.querySelector("[data-lang-toggle]");
  const langMenu = document.querySelector("[data-lang-menu]");
  const currentLang = document.querySelector("[data-current-lang]");
  const langButtons = document.querySelectorAll("[data-lang]");

  /* =========================================================
     MOBILE MENU
  ========================================================= */

  function openMobileMenu() {
    if (!mobileMenu) return;

    mobileMenu.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeMobileMenu() {
    if (!mobileMenu) return;

    mobileMenu.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", openMobileMenu);
  }

  if (menuClose) {
    menuClose.addEventListener("click", closeMobileMenu);
  }

  if (mobileMenu) {
    mobileMenu.addEventListener("click", (event) => {
      if (event.target === mobileMenu) {
        closeMobileMenu();
      }
    });
  }

  document
    .querySelectorAll(".agent-mobile-nav a, .agent-mobile-cta")
    .forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });

  /* =========================================================
     LANGUAGE MENU
  ========================================================= */

  function toggleLanguageMenu() {
    if (!langMenu) return;

    langMenu.classList.toggle("is-open");
  }

  function closeLanguageMenu() {
    if (!langMenu) return;

    langMenu.classList.remove("is-open");
  }

  if (langToggle) {
    langToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleLanguageMenu();
    });
  }

  document.addEventListener("click", closeLanguageMenu);

  /* =========================================================
     DATA LOADING
  ========================================================= */

  async function loadTranslations(lang) {
    try {
      const response = await fetch(`./data/${lang}.json`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`No se pudo cargar ./data/${lang}.json`);
      }

      state.translations = await response.json();
      state.lang = lang;

      localStorage.setItem("mitepuy_lang", lang);

      applyTranslations();
      setupWhatsAppLink();
      renderProperties();
      renderServices();
      renderAbout();
      renderTestimonials();
      renderContact();
      updateLanguageUI();
    } catch (error) {
      console.error("[MiTepuy] Error cargando traducciones:", error);
    }
  }

  /* =========================================================
     TRANSLATION ENGINE
  ========================================================= */

  function getValueByPath(object, path) {
    return path.split(".").reduce((accumulator, key) => {
      return accumulator && accumulator[key] !== undefined
        ? accumulator[key]
        : null;
    }, object);
  }

  function applyTranslations() {
    document.documentElement.lang = state.lang;

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");
      const value = getValueByPath(state.translations, key);

      if (value !== null) {
        element.textContent = value;
      }
    });

    document.querySelectorAll("[data-i18n-content]").forEach((element) => {
      const key = element.getAttribute("data-i18n-content");
      const value = getValueByPath(state.translations, key);

      if (value !== null) {
        element.setAttribute("content", value);
      }
    });

    document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
      const key = element.getAttribute("data-i18n-alt");
      const value = getValueByPath(state.translations, key);

      if (value !== null) {
        element.setAttribute("alt", value);
      }
    });
  }

  function updateLanguageUI() {
    if (currentLang) {
      currentLang.textContent = state.lang.toUpperCase();
    }

    langButtons.forEach((button) => {
      const buttonLang = button.getAttribute("data-lang");

      button.classList.toggle("is-active", buttonLang === state.lang);
    });
  }

  langButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedLang = button.getAttribute("data-lang");

      if (!selectedLang || selectedLang === state.lang) {
        closeLanguageMenu();
        return;
      }

      loadTranslations(selectedLang);
      closeLanguageMenu();
    });
  });

  /* =========================================================
    HERO SOCIAL LINKS
    Descripción:
    Abre enlaces sociales del agente desde atributos dinámicos.
    ========================================================= */

  document.querySelectorAll("[data-social-link]").forEach((link) => {
    const url = link.getAttribute("href");

    if (!url || url === "#") {
      link.setAttribute("aria-disabled", "true");
      link.addEventListener("click", (event) => {
        event.preventDefault();
      });
    }
  });

  /* =========================================================
      YOUTUBE MODAL
      Descripción:
      En desktop abre video en modal.
      En mobile abre el enlace directamente.
    ========================================================= */

  const youtubeTrigger = document.querySelector("[data-youtube-modal-trigger]");
  const youtubeModal = document.querySelector("[data-youtube-modal]");
  const youtubeFrame = document.querySelector("[data-youtube-frame]");
  const youtubeCloseButtons = document.querySelectorAll(
    "[data-youtube-modal-close]",
  );

  function openYoutubeModal(event) {
    if (!youtubeTrigger || !youtubeModal || !youtubeFrame) return;

    event.preventDefault();

    const videoUrl = youtubeTrigger.getAttribute("data-youtube-url");

    if (!videoUrl) return;

    youtubeFrame.setAttribute("src", `${videoUrl}?autoplay=1`);
    youtubeModal.classList.add("is-open");
    youtubeModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeYoutubeModal() {
    if (!youtubeModal || !youtubeFrame) return;

    youtubeModal.classList.remove("is-open");
    youtubeModal.setAttribute("aria-hidden", "true");
    youtubeFrame.setAttribute("src", "");
    document.body.style.overflow = "";
  }

  if (youtubeTrigger) {
    youtubeTrigger.addEventListener("click", openYoutubeModal);
  }

  youtubeCloseButtons.forEach((button) => {
    button.addEventListener("click", closeYoutubeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeYoutubeModal();
    }
  });

  /* =========================================================
      WHATSAPP DYNAMIC LINK
    ========================================================= */

  function setupWhatsAppLink() {
    const whatsappButton = document.querySelector("[data-whatsapp-link]");

    if (!whatsappButton) return;

    const whatsappData = state.translations.whatsapp;

    if (!whatsappData) return;

    const number = whatsappData.number;
    const message = encodeURIComponent(whatsappData.message);

    whatsappButton.setAttribute(
      "href",
      `https://wa.me/${number}?text=${message}`,
    );
  }


  /* =========================================================
   PROPERTIES RENDER / SLIDER / MODAL
========================================================= */

function renderProperties() {
  const track = document.querySelector(".agent-properties-track");
  const pagination = document.querySelector(".agent-properties-pagination");

  if (!track || !state.translations.properties?.items) return;

  const properties = state.translations.properties.items;
  const labels = state.translations.properties.labels;

  track.innerHTML = properties
    .map((property, index) => {
      return `
        <!-- =========================================================
             PROPERTY CARD ${index + 1} — ${property.title}
        ========================================================= -->

        <article class="agent-property-card" data-property-index="${index}">
          <div class="agent-property-media">
            <img
              src="${property.image}"
              alt="${property.title}"
              class="agent-property-image"
              loading="lazy"
            />

            <span class="agent-property-badge">
              ${property.status}
            </span>
          </div>

          <div class="agent-property-body">
            <h3 class="agent-property-title">${property.title}</h3>

            <p class="agent-property-location">${property.location}</p>

            <p class="agent-property-price">${property.price}</p>

            <div class="agent-property-specs">

              <!-- BEDS -->
              <div class="agent-property-spec">
                <img
                  src="../../assets/icons/accesorios/bed-sign-svgrepo-com.svg"
                  alt="Beds"
                />

                <span>
                  <strong>${property.beds}</strong>

                  <small>
                    ${state.translations.properties.labels.beds}
                  </small>
                </span>
              </div>

              <!-- BATHS -->
              <div class="agent-property-spec">
                <img
                  src="../../assets/icons/accesorios/bathtub-svgrepo-com.svg"
                  alt="Baths"
                />

                <span>
                  <strong>${property.baths}</strong>

                  <small>
                    ${state.translations.properties.labels.baths}
                  </small>
                </span>
              </div>

              <!-- AREA -->
              <div class="agent-property-spec">
                <img
                  src="../../assets/icons/accesorios/ruler-svgrepo-com.svg"
                  alt="Area"
                />

                <span>
                  <strong>${property.area}</strong>

                  <small>m²</small>
                </span>
              </div>

            </div>
          </div>
        </article>

        <!-- =========================================================
             END PROPERTY CARD ${index + 1} — ${property.title}
        ========================================================= -->
      `;
    })
    .join("");

  if (pagination) {
    const totalSlides = Math.ceil(properties.length / getVisibleCardsCount());

    pagination.innerHTML = Array.from({ length: totalSlides })
      .map((_, index) => {
        return `
          <button
            class="${index === 0 ? "active" : ""}"
            type="button"
            data-slide="${index}"
            aria-label="Slide ${index + 1}"
          ></button>
        `;
      })
      .join("");
  }

  setupPropertiesModal();
  setupPropertiesSlider();
}


function renderServices() {
  const servicesGrid = document.querySelector("[data-services-grid]");

  if (!servicesGrid || !state.translations.services?.items) return;

  const services = state.translations.services.items;

  servicesGrid.innerHTML = services
    .map((service, index) => {
      return `
        <article class="agent-service-card" data-service-index="${index}">
          <div class="agent-service-icon-wrap">
            <img
              src="${service.icon}"
              alt="${service.title}"
              class="agent-service-icon"
              loading="lazy"
            />
          </div>

          <div class="agent-service-body">
            <h3 class="agent-service-title">${service.title}</h3>

            <p class="agent-service-description">
              ${service.description}
            </p>
          </div>
        </article>
      `;
    })
    .join("");

  setupServicesModal();
}


function renderAbout() {
  const about = state.translations.about;

  if (!about) return;

  const statsContainer = document.querySelector("[data-about-stats]");

  if (statsContainer && Array.isArray(about.stats)) {
    statsContainer.innerHTML = about.stats
      .map((stat) => {
        return `
          <div class="agent-about-stat">
            <img src="${stat.icon}" alt="${stat.label}" loading="lazy" />

            <div>
              <strong>${stat.value}</strong>
              <span>${stat.label}</span>
              <small>${stat.description}</small>
            </div>
          </div>
        `;
      })
      .join("");
  }
}


function renderTestimonials() {
  const testimonials = state.translations.testimonials;

  if (!testimonials) return;

  const items = Array.isArray(testimonials.items) ? testimonials.items : [];

  const reviewsCount = items.length;

  const totalRating = items.reduce((acc, item) => {
    return acc + (Number(item.rating) || 0);
  }, 0);

  const averageRating = reviewsCount > 0 ? totalRating / reviewsCount : 0;

  const ratingElement = document.querySelector("[data-testimonials-rating]");
  const starsElement = document.querySelector("[data-testimonials-stars]");
  const reviewsLabelElement = document.querySelector(
    "[data-i18n='testimonials.reviews_label']"
  );
  const trackElement = document.querySelector("[data-testimonials-track]");
  const dotsElement = document.querySelector("[data-testimonials-dots]");

  if (ratingElement) {
    ratingElement.textContent = averageRating.toFixed(1);
  }

  if (reviewsLabelElement) {
    const reviewsTemplate =
      testimonials.reviews_label_dynamic || "";

    reviewsLabelElement.textContent =
      reviewsTemplate.replace("{count}", reviewsCount);
  }

  if (starsElement) {
    const fullStars = Math.round(averageRating);

    starsElement.innerHTML = "";

    for (let i = 0; i < 5; i++) {
      const star = document.createElement("span");

      star.className = "agent-testimonials-star";
      star.innerHTML = "★";

      if (i < fullStars) {
        star.classList.add("is-filled");
      }

      starsElement.appendChild(star);
    }
  }

  if (trackElement) {
    trackElement.innerHTML = items
      .map((item, index) => {
        const itemRating = Number(item.rating) || 0;

        const stars = Array.from({ length: 5 })
          .map((_, starIndex) => {
            return starIndex < itemRating ? "★" : "☆";
          })
          .join("");

        return `
          <article
            class="agent-testimonial-card"
            data-testimonial-index="${index}"
          >
            <div class="agent-testimonial-top">
              <div class="agent-testimonial-user">
                <img
                  src="${item.photo}"
                  alt="${item.name}"
                  class="agent-testimonial-photo"
                  loading="lazy"
                />

                <div>
                  <h3>${item.name}</h3>
                  <span>${item.location}</span>

                  <div class="agent-testimonial-stars">
                    ${stars}
                  </div>
                </div>
              </div>

              <div class="agent-testimonial-quote">
                “
              </div>
            </div>

            <p class="agent-testimonial-text">
              ${item.text}
            </p>

            <div class="agent-testimonial-tag">
              <img
                src="${item.icon}"
                alt="${item.tag}"
                loading="lazy"
              />

              <span>${item.tag}</span>
            </div>
          </article>
        `;
      })
      .join("");
  }

  if (dotsElement) {
    dotsElement.innerHTML = items
      .map((_, index) => {
        return `
          <button
            class="agent-testimonials-dot ${index === 0 ? "is-active" : ""}"
            type="button"
            data-testimonials-dot="${index}"
            aria-label="Ir al testimonio ${index + 1}"
          ></button>
        `;
      })
      .join("");
  }

  setupTestimonialsCarousel();
}


/* =========================================================
   CONTACT RENDER
========================================================= */

function renderContact() {
  const contact = state.translations.contact;

  if (!contact) return;

  const whatsappLink = document.querySelector("[data-contact-whatsapp]");
  const whatsappLabel = document.querySelector("[data-contact-whatsapp-label]");
  const whatsappDescription = document.querySelector(
    "[data-contact-whatsapp-description]"
  );

  const phoneLink = document.querySelector("[data-contact-phone]");
  const phoneEyebrow = document.querySelector("[data-contact-phone-eyebrow]");
  const phoneLabel = document.querySelector("[data-contact-phone-label]");
  const phoneNumber = document.querySelector("[data-contact-phone-number]");

  const benefitsContainer = document.querySelector("[data-contact-benefits]");
  const directContainer = document.querySelector("[data-contact-direct]");

  if (contact.whatsapp) {
    if (whatsappLink) {
      const number =
        contact.whatsapp.number ||
        state.translations.whatsapp?.number ||
        "";

      const message =
        contact.whatsapp.message ||
        state.translations.whatsapp?.message ||
        "";

      const cleanNumber = String(number).replace(/\D/g, "");
      const encodedMessage = encodeURIComponent(message);

      whatsappLink.href = cleanNumber
        ? `https://wa.me/${cleanNumber}?text=${encodedMessage}`
        : "#";

      whatsappLink.setAttribute("target", "_blank");
      whatsappLink.setAttribute("rel", "noopener noreferrer");
    }

    if (whatsappLabel) {
      whatsappLabel.textContent = contact.whatsapp.label || "";
    }

    if (whatsappDescription) {
      whatsappDescription.textContent = contact.whatsapp.description || "";
    }
  }

  if (contact.phone_cta) {
    if (phoneLink) {
      phoneLink.href = contact.phone_cta.url || "#";
    }

    if (phoneEyebrow) {
      phoneEyebrow.textContent = contact.phone_cta.eyebrow || "";
    }

    if (phoneLabel) {
      phoneLabel.textContent = contact.phone_cta.label || "";
    }

    if (phoneNumber) {
      phoneNumber.textContent = contact.phone_cta.number || "";
    }
  }

  if (benefitsContainer && Array.isArray(contact.benefits)) {
    benefitsContainer.innerHTML = contact.benefits
      .map((benefit) => {
        return `
          <div class="agent-contact-benefit">
            <img
              src="${benefit.icon}"
              alt="${benefit.title}"
              loading="lazy"
            />

            <div>
              <strong>${benefit.title}</strong>
              <span>${benefit.description}</span>
            </div>
          </div>
        `;
      })
      .join("");
  }

  if (directContainer && Array.isArray(contact.direct)) {
    directContainer.innerHTML = contact.direct
      .map((item) => {
        return `
          <a
            href="${item.href || "#"}"
            class="agent-contact-direct-item"
          >
            <img
              src="${item.icon}"
              alt="${item.title}"
              loading="lazy"
            />

            <div>
              <strong>${item.title}</strong>
              <span>${String(item.value).replace(/\n/g, "<br />")}</span>
            </div>
          </a>
        `;
      })
      .join("");
  }
}


function setupTestimonialsCarousel() {
  const track = document.querySelector("[data-testimonials-track]");
  const prevButton = document.querySelector("[data-testimonials-prev]");
  const nextButton = document.querySelector("[data-testimonials-next]");
  const dots = document.querySelectorAll("[data-testimonials-dot]");

  if (!track) return;

  const cards = track.querySelectorAll(".agent-testimonial-card");

  if (!cards.length) return;

  let currentIndex = 0;

  function getVisibleCards() {
    return window.innerWidth <= 980 ? 1 : 4;
  }

  function getMaxIndex() {
    return Math.max(0, cards.length - getVisibleCards());
  }

  function updateDots(index) {
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  }

  function scrollToCard(index) {
    const maxIndex = getMaxIndex();

    currentIndex = Math.max(0, Math.min(index, maxIndex));

    const cardWidth = cards[0].offsetWidth;
    const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;

    track.scrollTo({
      left: currentIndex * (cardWidth + gap),
      behavior: "smooth",
    });

    updateDots(currentIndex);
  }

  if (prevButton) {
    prevButton.onclick = () => {
      const nextIndex =
        currentIndex === 0 ? getMaxIndex() : currentIndex - 1;

      scrollToCard(nextIndex);
    };
  }

  if (nextButton) {
    nextButton.onclick = () => {
      const nextIndex =
        currentIndex === getMaxIndex() ? 0 : currentIndex + 1;

      scrollToCard(nextIndex);
    };
  }

  dots.forEach((dot) => {
    dot.onclick = () => {
      const index = Number(dot.getAttribute("data-testimonials-dot"));

      scrollToCard(index);
    };
  });

  track.addEventListener("scroll", () => {
    const cardWidth = cards[0].offsetWidth;
    const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;
    const index = Math.round(track.scrollLeft / (cardWidth + gap));

    currentIndex = Math.max(0, Math.min(index, getMaxIndex()));

    updateDots(currentIndex);
  });

  window.addEventListener("resize", () => {
    scrollToCard(currentIndex);
  });

  updateDots(0);
}


function setupServicesModal() {
  const cards = document.querySelectorAll(".agent-service-card");
  const modal = document.querySelector("[data-service-modal]");

  if (!modal || !state.translations.services?.items) return;

  const services = state.translations.services.items;

  const modalIcon = document.querySelector("[data-service-modal-icon]");
  const modalTitle = document.querySelector("[data-service-modal-title]");
  const modalDescription = document.querySelector(
    "[data-service-modal-description]"
  );

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const index = Number(card.getAttribute("data-service-index"));
      const service = services[index];

      if (!service) return;
        const serviceBackgrounds = [
          "../../assets/global/icons/servicios/casa_back.png",
          "../../assets/global/icons/servicios/llave_back.png",
          "../../assets/global/icons/servicios/edificio_back.png",
          "../../assets/global/icons/servicios/metrica_back.png",
          "../../assets/global/icons/servicios/documento_back.png",
          "../../assets/global/icons/servicios/mano_back.png",
        ];

        const backgroundImage = serviceBackgrounds[index];

        if (backgroundImage) {
          modal.style.setProperty(
            "--service-modal-bg",
            `url("${backgroundImage}")`
          );
        }

      if (modalIcon) {
        modalIcon.src = service.icon;
        modalIcon.alt = service.title;
      }

      if (modalTitle) modalTitle.textContent = service.title;

      if (modalDescription) {
        modalDescription.textContent = service.extended_description;
      }

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });
  });
}


function closeServiceModal() {
  const modal = document.querySelector("[data-service-modal]");

  if (!modal) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.querySelectorAll("[data-service-modal-close]").forEach((button) => {
  button.addEventListener("click", closeServiceModal);
});


function getVisibleCardsCount() {
  if (window.matchMedia("(max-width: 768px)").matches) return 1;
  if (window.matchMedia("(max-width: 1180px)").matches) return 2;
  return 3;
}

function setupPropertiesSlider() {
  const track = document.querySelector(".agent-properties-track");
  const leftArrow = document.querySelector(".agent-properties-arrow-left");
  const rightArrow = document.querySelector(".agent-properties-arrow-right");
  const dots = document.querySelectorAll(".agent-properties-pagination button");

  if (!track) return;

  const cards = Array.from(track.querySelectorAll(".agent-property-card"));

  if (!cards.length) return;

  let currentSlide = 0;

  function getScrollAmount() {
    const card = cards[0];
    const gap = Number.parseInt(getComputedStyle(track).gap, 10) || 24;

    return card.offsetWidth + gap;
  }

  function getMaxSlide() {
    return Math.max(0, dots.length - 1);
  }

  function updateDots(index) {
    dots.forEach((dot) => {
      dot.classList.remove("active");
    });

    if (dots[index]) {
      dots[index].classList.add("active");
    }
  }

  function goToSlide(index) {
    const maxSlide = getMaxSlide();

    if (index < 0) {
      currentSlide = maxSlide;
    } else if (index > maxSlide) {
      currentSlide = 0;
    } else {
      currentSlide = index;
    }

    const visibleCards = getVisibleCardsCount();
    const cardStep = getScrollAmount();
    const targetLeft = currentSlide * visibleCards * cardStep;

    track.scrollTo({
      left: targetLeft,
      behavior: "smooth",
    });

    updateDots(currentSlide);
  }

  if (leftArrow) {
    leftArrow.onclick = () => {
      goToSlide(currentSlide - 1);
    };
  }

  if (rightArrow) {
    rightArrow.onclick = () => {
      goToSlide(currentSlide + 1);
    };
  }

  dots.forEach((dot, index) => {
    dot.onclick = () => {
      goToSlide(index);
    };
  });

  track.addEventListener("scroll", () => {
    const visibleCards = getVisibleCardsCount();
    const cardStep = getScrollAmount();
    const estimatedSlide = Math.round(track.scrollLeft / (visibleCards * cardStep));

    currentSlide = Math.min(Math.max(estimatedSlide, 0), getMaxSlide());

    updateDots(currentSlide);
  });

  updateDots(0);
}

function setupPropertiesModal() {
  const cards = document.querySelectorAll(".agent-property-card");
  const modal = document.querySelector("[data-property-modal]");

  if (!modal || !state.translations.properties?.items) return;

  const properties = state.translations.properties.items;

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const index = Number(card.getAttribute("data-property-index"));
      const property = properties[index];

      if (!property) return;

      const modalImage = document.querySelector("[data-property-modal-image]");
      const modalStatus = document.querySelector("[data-property-modal-status]");
      const modalTitle = document.querySelector("[data-property-modal-title]");
      const modalPrice = document.querySelector("[data-property-modal-price]");
      const modalLocation = document.querySelector(
        "[data-property-modal-location]"
      );
      const modalBeds = document.querySelector("[data-property-modal-beds]");
      const modalBaths = document.querySelector("[data-property-modal-baths]");
      const modalArea = document.querySelector("[data-property-modal-area]");
      const modalDescription = document.querySelector(
        "[data-property-modal-description]"
      );
      const modalWhatsapp = document.querySelector(
        "[data-property-modal-whatsapp]"
      );

      if (modalImage) {
        modalImage.src = property.image;
        modalImage.alt = property.title;
      }

      setupPropertyModalGallery(property);

      if (modalStatus) modalStatus.textContent = property.status;
      if (modalTitle) modalTitle.textContent = property.title;
      if (modalPrice) modalPrice.textContent = property.price;
      if (modalLocation) modalLocation.textContent = property.location;
      if (modalBeds) modalBeds.textContent = property.beds;
      if (modalBaths) modalBaths.textContent = property.baths;
      if (modalArea) modalArea.textContent = property.area;
      if (modalDescription) modalDescription.textContent = property.description;

      const number = state.translations.whatsapp?.number;
      const message = encodeURIComponent(property.whatsapp_message || "");

      if (modalWhatsapp && number) {
        modalWhatsapp.href = `https://wa.me/${number}?text=${message}`;
        modalWhatsapp.target = "_blank";
        modalWhatsapp.rel = "noopener noreferrer";
      }

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });
  });
}

function setupPropertyModalGallery(property) {
  const modalImage = document.querySelector("[data-property-modal-image]");
  const thumbnailsContainer = document.querySelector(
    "[data-property-modal-thumbnails]",
  );
  const prevButton = document.querySelector("[data-property-gallery-prev]");
  const nextButton = document.querySelector("[data-property-gallery-next]");

  if (!modalImage || !thumbnailsContainer) return;

  const gallery =
    Array.isArray(property.gallery) && property.gallery.length > 0
      ? property.gallery
      : [property.image];

  const thumbnails =
    Array.isArray(property.thumbnails) && property.thumbnails.length > 0
      ? property.thumbnails
      : gallery;

  let currentIndex = 0;

  function updateGallery(index) {
    currentIndex = index;

    modalImage.src = gallery[currentIndex];
    modalImage.alt = `${property.title} — Imagen ${currentIndex + 1}`;

    thumbnailsContainer.querySelectorAll("button").forEach((button, i) => {
      button.classList.toggle("is-active", i === currentIndex);
    });

    const activeThumbnail = thumbnailsContainer.querySelector(
      "button.is-active",
    );

    if (activeThumbnail) {
      activeThumbnail.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }

  thumbnailsContainer.innerHTML = gallery
    .map((image, index) => {
      const thumbnailImage = thumbnails[index] || image;

      return `
        <button
          type="button"
          class="${index === 0 ? "is-active" : ""}"
          data-gallery-index="${index}"
          aria-label="Ver imagen ${index + 1}"
        >
          <img
            src="${thumbnailImage}"
            alt="${property.title} — Miniatura ${index + 1}"
            loading="lazy"
          />
        </button>
      `;
    })
    .join("");

  thumbnailsContainer.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.getAttribute("data-gallery-index"));
      updateGallery(index);
    });
  });

  if (prevButton) {
    prevButton.onclick = () => {
      const nextIndex =
        currentIndex === 0 ? gallery.length - 1 : currentIndex - 1;

      updateGallery(nextIndex);
    };
  }

  if (nextButton) {
    nextButton.onclick = () => {
      const nextIndex =
        currentIndex === gallery.length - 1 ? 0 : currentIndex + 1;

      updateGallery(nextIndex);
    };
  }

  updateGallery(0);
}

function closePropertyModal() {
  const modal = document.querySelector("[data-property-modal]");

  if (!modal) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.querySelectorAll("[data-property-modal-close]").forEach((button) => {
  button.addEventListener("click", closePropertyModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeYoutubeModal();
    closePropertyModal();
    closeServiceModal();
  }
});

/* =========================================================
   MOBILE SMART HEADER
========================================================= */

function setupMobileSmartHeader() {
  const header = document.querySelector(".agent-header");

  if (!header) return;

  let lastScrollY = window.scrollY;
  const mobileBreakpoint = 768;
  const minScroll = 80;

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    const isMobile = window.innerWidth <= mobileBreakpoint;

    if (!isMobile) {
      header.classList.remove("is-hidden-mobile");
      return;
    }

    if (currentScrollY <= minScroll) {
      header.classList.remove("is-hidden-mobile");
      lastScrollY = currentScrollY;
      return;
    }

    if (currentScrollY > lastScrollY) {
      header.classList.add("is-hidden-mobile");
    } else {
      header.classList.remove("is-hidden-mobile");
    }

    lastScrollY = currentScrollY;
  });
}

/* =========================================================
   INIT
========================================================= */

loadTranslations(state.lang);
setupMobileSmartHeader();
});

/* =========================================================
   END MITEPUY — AGENT TEMPLATE JS
========================================================= */