// =========================
// MiTepuy - Main JS
// =========================

document.addEventListener("DOMContentLoaded", () => {
  const languageToggle = document.getElementById("languageToggle");
  const defaultLanguage = localStorage.getItem("mitepuy_lang") || "es";

  let currentTranslations = {};
  let currentLang = defaultLanguage;

  async function loadTranslations(lang) {
    try {
      const response = await fetch(`./data/${lang}.json`, {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(`No se pudo cargar el idioma: ${lang}`);
      }

      currentTranslations = await response.json();
      currentLang = lang;

      applyTranslations(currentTranslations);
      updateLanguageButton(lang);

      document.documentElement.lang = lang;
      localStorage.setItem("mitepuy_lang", lang);
    } catch (error) {
      console.error("[MiTepuy] Error cargando traducciones:", error);
    }
  }

  function getNestedValue(obj, path) {
    return path.split(".").reduce((acc, key) => {
      return acc && acc[key] !== undefined ? acc[key] : null;
    }, obj);
  }

  function applyTranslations(translations) {
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");
      const value = getNestedValue(translations, key);

      if (value !== null) {
        element.textContent = value;
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      const key = element.getAttribute("data-i18n-placeholder");
      const value = getNestedValue(translations, key);

      if (value !== null) {
        element.setAttribute("placeholder", value);
      }
    });

    document.querySelectorAll("[data-i18n-content]").forEach((element) => {
      const key = element.getAttribute("data-i18n-content");
      const value = getNestedValue(translations, key);

      if (value !== null) {
        element.setAttribute("content", value);
      }
    });

    if (translations.meta?.title) {
      document.title = translations.meta.title;
    }
  }

  function updateLanguageButton(lang) {
    if (!languageToggle) return;

    languageToggle.textContent = lang === "es" ? "EN" : "ES";
  }

  if (languageToggle) {
    languageToggle.addEventListener("click", () => {
      const nextLang = currentLang === "es" ? "en" : "es";
      loadTranslations(nextLang);
    });
  }

  loadTranslations(defaultLanguage);


  // =========================
  // CONTACT FORM
  // =========================

  const contactForm = document.getElementById("contactForm");

  if (contactForm) {

    contactForm.addEventListener("submit", async (event) => {

      event.preventDefault();

      const submitButton = contactForm.querySelector("button[type='submit']");

      submitButton.disabled = true;

      const originalButtonText = submitButton.textContent;

      submitButton.textContent =
        currentLang === "es" ? "Enviando..." : "Sending...";

      try {

        const formData = new FormData(contactForm);

        const response = await fetch("./send-mail.php", {
          method: "POST",
          body: formData
        });

        const result = await response.text();

        if (result.trim() === "success") {

          alert(
            currentLang === "es"
              ? "Mensaje enviado correctamente."
              : "Message sent successfully."
          );

          contactForm.reset();

        } else {

          alert(
            currentLang === "es"
              ? "No se pudo enviar el mensaje."
              : "The message could not be sent."
          );

        }

      } catch (error) {

        console.error("[MiTepuy] Error enviando formulario:", error);

        alert(
          currentLang === "es"
            ? "Ocurrió un error inesperado."
            : "An unexpected error occurred."
        );

      } finally {

        submitButton.disabled = false;

        submitButton.textContent = originalButtonText;

      }

    });

  }


  // =========================
  // HEADER SCROLL EFFECT
  // =========================

  const header = document.querySelector(".site-header");

  if (header) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 40) {
        header.style.background = "rgba(8, 29, 45, 0.94)";
        header.style.borderBottom = "1px solid rgba(255,255,255,0.08)";
      } else {
        header.style.background = "rgba(8, 29, 45, 0.86)";
        header.style.borderBottom = "1px solid rgba(255,255,255,0.18)";
      }
    });
  }


  // =========================
  // AGENTS CAROUSEL — LOOP
  // =========================

  const agentsCarousel = document.querySelector(".agents-carousel");
  const agentsPrev = document.querySelector(".agents-prev");
  const agentsNext = document.querySelector(".agents-next");

  if (agentsCarousel && agentsPrev && agentsNext) {
    const scrollAmount = 260;

    agentsNext.addEventListener("click", () => {
      const maxScroll =
        agentsCarousel.scrollWidth - agentsCarousel.clientWidth;

      if (agentsCarousel.scrollLeft >= maxScroll - 10) {
        agentsCarousel.scrollTo({
          left: 0,
          behavior: "smooth"
        });
      } else {
        agentsCarousel.scrollBy({
          left: scrollAmount,
          behavior: "smooth"
        });
      }
    });

    agentsPrev.addEventListener("click", () => {
      if (agentsCarousel.scrollLeft <= 10) {
        agentsCarousel.scrollTo({
          left: agentsCarousel.scrollWidth,
          behavior: "smooth"
        });
      } else {
        agentsCarousel.scrollBy({
          left: -scrollAmount,
          behavior: "smooth"
        });
      }
    });
  }

  // =========================
  // AGENT FILTERS
  // =========================

  const stateFilter = document.getElementById("stateFilter");
  const cityFilter = document.getElementById("cityFilter");
  const agentCards = document.querySelectorAll(".agent-card");

  function filterAgents() {
    if (!stateFilter || !cityFilter) return;

    const selectedState = stateFilter.value;
    const selectedCity = cityFilter.value;

    agentCards.forEach((card) => {
      const cardState = card.dataset.state;
      const cardCity = card.dataset.city;

      const stateMatch =
        selectedState === "all" || selectedState === cardState;

      const cityMatch =
        selectedCity === "all" || selectedCity === cardCity;

      card.style.display = stateMatch && cityMatch ? "block" : "none";
    });
  }

  if (stateFilter && cityFilter) {
    stateFilter.addEventListener("change", filterAgents);
    cityFilter.addEventListener("change", filterAgents);
  }

  // =========================
  // AGENT MODAL
  // =========================

  const agentModal = document.getElementById("agentModal");
  const modalClose = document.querySelector(".agent-modal-close");
  const openAgentButtons = document.querySelectorAll(".open-agent");

  const modalName = document.getElementById("agentModalName");
  const modalLocation = document.getElementById("agentModalLocation");
  const modalDescription = document.getElementById("agentModalDescription");
  const modalImage = document.getElementById("agentModalImage");
  const modalProfileLink = agentModal?.querySelector(
    "[data-i18n='agent_modal.view_full_profile']"
  );

  const propertiesCarousel = document.getElementById("agentPropertiesCarousel");

  function openAgentModal(agentIndex) {
    const agentsData = currentTranslations.agents_data || [];
    const agent = agentsData[agentIndex];

    if (!agent || !agentModal || !propertiesCarousel) return;

    if (modalName) modalName.textContent = agent.name;
    if (modalLocation) modalLocation.textContent = agent.location;
    if (modalDescription) modalDescription.textContent = agent.description;

    if (modalImage) {
      modalImage.src = agent.image;
      modalImage.alt = agent.name;
    }

    if (modalProfileLink) {
      modalProfileLink.href = agent.profileUrl;
    }

    propertiesCarousel.innerHTML = "";

    agent.properties.forEach((property) => {
      const propertyCard = document.createElement("article");

      propertyCard.classList.add("agent-property-card");

      propertyCard.innerHTML = `
        <img src="${property.image}" alt="${property.title}" />

        <div class="agent-property-info">
          <span>${property.type}</span>

          <h4>${property.title}</h4>

          <p>${property.location}</p>

          <strong>${property.price}</strong>

          <a href="${agent.profileUrl}" class="btn btn-dark">
            ${currentLang === "es" ? "Ver propiedad" : "View property"}
          </a>
        </div>
      `;

      propertiesCarousel.appendChild(propertyCard);
    });

    agentModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  openAgentButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".agent-card");
      const agentIndex = Number(card?.dataset.agent);

      openAgentModal(agentIndex);
    });
  });

  function closeAgentModal() {
    if (!agentModal) return;

    agentModal.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (modalClose) {
    modalClose.addEventListener("click", closeAgentModal);
  }

  if (agentModal) {
    agentModal.addEventListener("click", (event) => {
      if (event.target.classList.contains("agent-modal-overlay")) {
        closeAgentModal();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAgentModal();
    }
  });

  // =========================
  // AGENT PROPERTIES CAROUSEL
  // =========================

const propertiesPrev = document.querySelector(".agent-properties-prev");
const propertiesNext = document.querySelector(".agent-properties-next");

if (propertiesPrev && propertiesNext && propertiesCarousel) {
  const propertyScrollAmount = 320;

  propertiesNext.addEventListener("click", () => {
    const maxScroll =
      propertiesCarousel.scrollWidth - propertiesCarousel.clientWidth;

    if (propertiesCarousel.scrollLeft >= maxScroll - 10) {
      propertiesCarousel.scrollTo({
        left: 0,
        behavior: "smooth"
      });
    } else {
      propertiesCarousel.scrollBy({
        left: propertyScrollAmount,
        behavior: "smooth"
      });
    }
  });

  propertiesPrev.addEventListener("click", () => {
    if (propertiesCarousel.scrollLeft <= 10) {
      propertiesCarousel.scrollTo({
        left: propertiesCarousel.scrollWidth,
        behavior: "smooth"
      });
    } else {
      propertiesCarousel.scrollBy({
        left: -propertyScrollAmount,
        behavior: "smooth"
      });
    }
  });
}

  // =========================
  // HERO LIGHT FOLLOW EFFECT
  // =========================

  const hero = document.querySelector(".hero");

  if (hero) {
    hero.addEventListener("mousemove", (event) => {
      const rect = hero.getBoundingClientRect();

      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      hero.style.setProperty("--mouse-x", `${x}%`);
      hero.style.setProperty("--mouse-y", `${y}%`);
    });

    hero.addEventListener("mouseleave", () => {
      hero.style.setProperty("--mouse-x", "50%");
      hero.style.setProperty("--mouse-y", "50%");
    });
  }

});