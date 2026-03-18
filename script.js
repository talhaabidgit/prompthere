// ============================================================
// DOMContentLoaded — Runs after the page is fully loaded
// ============================================================
document.addEventListener("DOMContentLoaded", () => {

  // ----------------------------
  // Dark Mode Toggle
  // ----------------------------
  const toggle = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("theme");

  // Apply saved theme on page load
  if (savedTheme) {
    document.body.setAttribute("data-theme", savedTheme);
    toggle.checked = savedTheme === "dark";
  }

  // Update theme and save preference on toggle change
  toggle.addEventListener("change", () => {
    const theme = toggle.checked ? "dark" : "light";
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  });


  // ----------------------------
  // Current Year in Footer
  // ----------------------------
  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();


  // ----------------------------
  // Hero Text Typewriter Effect
  // ----------------------------
  const heroMessages = [
    "Stop wasting time figuring out what to ask AI.",
    "Discover powerful ready-to-use prompts.",
    "Use prompts for ChatGPT, coding, marketing, writing and more.",
    "Curated for quality and completely free.",
    "Copy and use prompts instantly."
  ];

  const heroElement   = document.getElementById("hero-text");
  const TYPING_SPEED  = 50;    // ms per character
  const MESSAGE_DELAY = 2000;  // ms pause after each full message

  let heroIndex = 0;
  let charIndex = 0;

  function typeHeroMessage() {
    // Loop back to the first message when all are done
    if (heroIndex >= heroMessages.length) heroIndex = 0;

    const currentMessage = heroMessages[heroIndex];

    if (charIndex < currentMessage.length) {
      // Type next character
      heroElement.innerHTML += currentMessage.charAt(charIndex);
      charIndex++;
      setTimeout(typeHeroMessage, TYPING_SPEED);
    } else {
      // Message complete — pause, clear, then move to next
      setTimeout(() => {
        heroElement.innerHTML = "";
        charIndex = 0;
        heroIndex++;
        typeHeroMessage();
      }, MESSAGE_DELAY);
    }
  }

  // Only run typewriter if the hero element exists (index page only)
  if (heroElement) typeHeroMessage();


  // ----------------------------
  // Popup — Show Only Once
  // ----------------------------
  const popup         = document.getElementById("popup");
  const closePopupBtn = document.getElementById("close-popup");

  if (popup && closePopupBtn) {
    // Show popup only if not already seen
    if (!localStorage.getItem("popupShown")) {
      popup.style.display = "flex";
      localStorage.setItem("popupShown", "true");
    }

    closePopupBtn.addEventListener("click", () => {
      popup.style.display = "none";
    });
  }


  // ----------------------------
  // Mobile Hamburger Drawer
  // ----------------------------
  const hamburgerBtn  = document.getElementById("hamburger");
  const drawer        = document.getElementById("drawer");
  const drawerOverlay = document.getElementById("drawer-overlay");
  const drawerClose   = document.getElementById("drawer-close");

  // Open drawer
  function openDrawer() {
    drawer.classList.add("open");
    drawerOverlay.classList.add("open");
    document.body.style.overflow = "hidden"; // prevent background scroll
  }

  // Close drawer
  function closeDrawer() {
    drawer.classList.remove("open");
    drawerOverlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  if (hamburgerBtn)  hamburgerBtn.addEventListener("click", openDrawer);
  if (drawerClose)   drawerClose.addEventListener("click", closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener("click", closeDrawer);

  // Close drawer when any nav link inside it is clicked
  if (drawer) {
    drawer.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", closeDrawer);
    });
  }

});


// ============================================================
// Prompts Page Logic
// ============================================================

const promptGrid = document.getElementById("prompt-grid");

if (promptGrid) {

  const searchInput    = document.getElementById("search");
  const categorySelect = document.getElementById("category");
  const loadMoreBtn    = document.getElementById("load-more");

  let prompts      = [];
  let currentIndex = 0;
  const PAGE_SIZE  = 10;


  // Load prompts from JSON file
  fetch("data/prompts.json")
    .then(res => res.json())
    .then(data => {
      prompts = data;
      renderPrompts();
    });


  // ----------------------------
  // Render Prompt Cards
  // ----------------------------
  function renderPrompts(reset = true) {

    // Reset grid and index on new search/filter
    if (reset) {
      promptGrid.innerHTML = "";
      currentIndex = 0;
    }

    const searchValue      = searchInput.value.toLowerCase();
    const selectedCategory = categorySelect.value;

    // Filter by search text and selected category
    const filtered = prompts.filter(p =>
      (p.title.toLowerCase().includes(searchValue) ||
       p.description.toLowerCase().includes(searchValue)) &&
      (selectedCategory === "" || p.category === selectedCategory)
    );

    // Get the current page slice
    const slice = filtered.slice(currentIndex, currentIndex + PAGE_SIZE);

    // Create and append a card for each prompt
    slice.forEach(p => {
      const card = document.createElement("div");
      card.classList.add("prompt-card");

      // Escape single quotes in prompt text for inline onclick handler
      

      // --- PREMIUM vs FREE card rendering ---
      card.innerHTML = `
        <h3>${p.title}</h3>
        ${p.premium ? '<span class="premium-badge">⭐ Premium</span>' : ''}
        <p>${p.description}</p>
        <div class="prompt-buttons">
          ${p.premium
            ? `<button class="unlock-btn" onclick="startUnlock('${p.slug}')">🔓 Unlock to View</button>`
            : `<a href="prompt.html?slug=${p.slug}" class="view-btn">View</a>`
          }
        </div>
      `;

      promptGrid.appendChild(card);
    });

    currentIndex += PAGE_SIZE;

    // Hide "Load More" if all prompts are shown
    loadMoreBtn.style.display = currentIndex >= filtered.length ? "none" : "block";
  }


  // ----------------------------
  // Event Listeners
  // ----------------------------
  searchInput.addEventListener("input",     () => renderPrompts());
  categorySelect.addEventListener("change", () => renderPrompts());
  loadMoreBtn.addEventListener("click",     () => renderPrompts(false));


}


// ============================================================
// Best / Featured Prompts (Homepage Section)
// ============================================================

async function loadBestPrompts() {

  const bestContainer = document.getElementById("bestPrompts");
  if (!bestContainer) return; // Exit if section doesn't exist on this page

  const response = await fetch("data/prompts.json");
  const prompts  = await response.json();

  // Get up to 5 featured prompts
  const featuredPrompts = prompts
    .filter(p => p.featured === true)
    .slice(0, 5);

  featuredPrompts.forEach(prompt => {
    const card = document.createElement("div");
    card.classList.add("prompt-card");

    card.innerHTML = `
      <h3>${prompt.title}</h3>
      <p>${prompt.description}</p>
      <div class="prompt-actions">
        <a href="prompt.html?slug=${prompt.slug}" class="view-btn">View Prompt</a>
      </div>
    `;

    bestContainer.appendChild(card);
  });
}

loadBestPrompts();


// ============================================================
// Premium Prompt Gate — Ad Countdown + One-Time Unlock
// ============================================================

function startUnlock(slug) {

  // Fire the ad (add your HilltopAds trigger here when ready)
  fireAd();

  // Build the countdown overlay modal
  const overlay = document.createElement("div");
  overlay.classList.add("ad-overlay");

  overlay.innerHTML = `
    <div class="ad-modal">
      <h3>Unlocking Prompt</h3>
      <p>Please wait while the ad loads. You will be redirected automatically.</p>
      <div class="ad-countdown" id="countdown-number">10</div>
      <span class="ad-cancel" id="ad-cancel">Cancel</span>
    </div>
  `;

  document.body.appendChild(overlay);

  // Lock background scroll while modal is open
  document.body.style.overflow = "hidden";

  // Countdown from 10
  let seconds = 10;
  const countdownEl = document.getElementById("countdown-number");

  const timer = setInterval(() => {
    seconds--;
    countdownEl.textContent = seconds;

    if (seconds <= 0) {
      clearInterval(timer);

      // Save one-time unlock token then redirect to prompt page
      sessionStorage.setItem("unlocked_" + slug, "true");
      window.location.href = "prompt.html?slug=" + slug;
    }
  }, 1000);

  // Cancel — close modal and stop timer
  document.getElementById("ad-cancel").addEventListener("click", () => {
    clearInterval(timer);
    document.body.removeChild(overlay);
    document.body.style.overflow = "";
  });
}


// Placeholder — add your HilltopAds popunder trigger
// inside this function when you get your account
function fireAd() {
  // TODO: add HilltopAds trigger here when ready
  // Example: window.open("your-hilltopads-link", "_blank");
}
