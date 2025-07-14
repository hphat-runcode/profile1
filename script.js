// ==================== GLOBAL VARIABLES ====================
// Sidebar & Theme
const sidebarToggleBtns = document.querySelectorAll(".sidebar-toggle");
const sidebar = document.querySelector(".sidebar");
const searchForm = document.querySelector(".search-form");
const themeToggleBtn = document.querySelector(".theme-toggle");
const themeIcon = themeToggleBtn.querySelector(".theme-icon");
const menuLinks = document.querySelectorAll(".menu-link");
const contentSections = document.querySelectorAll(".content-section");

// Memory Game
const cardsContainer = document.querySelector(".cards");
let matched = 0;
let cardOne, cardTwo;
let disableDeck = false;
const cards = Array.from({ length: 8 }, (_, i) => `img-${i+1}.png`)
  .flatMap(img => [img, img]);

// Drawing App
const canvas = document.querySelector("canvas");
const toolBtns = document.querySelectorAll(".tool");
const fillColor = document.querySelector("#fill-color");
const sizeSlider = document.querySelector("#size-slider");
const colorBtns = document.querySelectorAll(".colors .option");
const colorPicker = document.querySelector("#color-picker");
const clearCanvasBtn = document.querySelector(".clear-canvas");
const saveImgBtn = document.querySelector(".save-img");
const ctx = canvas.getContext("2d");
let prevMouseX, prevMouseY, snapshot;
let isDrawing = false;
let selectedTool = "brush";
let brushWidth = 5;
let selectedColor = "#000";

// ==================== SIDEBAR & THEME FUNCTIONS ====================
const updateThemeIcon = () => {
  const isDark = document.body.classList.contains("dark-theme");
  themeIcon.textContent = sidebar.classList.contains("collapsed") 
    ? (isDark ? "light_mode" : "dark_mode") 
    : "dark_mode";
};

const applySavedTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const shouldUseDarkTheme = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
  
  document.body.classList.toggle("dark-theme", shouldUseDarkTheme);
  updateThemeIcon();
};

// ==================== SECTION NAVIGATION ====================
const showSection = (sectionId) => {
  // Hide all sections
  contentSections.forEach(section => {
    section.style.display = "none";
    section.classList.remove("active-section");
  });
  
  // Show selected section
  const activeSection = document.querySelector(`.${sectionId}`);
  if (activeSection) {
    activeSection.style.display = "block";
    activeSection.classList.add("active-section");
    
    // Initialize section specific elements
    if (sectionId === "drawing-section") {
      initDrawingCanvas();
    } else if (sectionId === "game-section") {
      initMemoryGame();
    }
  }
};

const initSectionNavigation = () => {
  menuLinks.forEach(link => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      
      // Update active menu
      menuLinks.forEach(l => l.classList.remove("active"));
      this.classList.add("active");
      
      // Show corresponding section
      const sectionId = this.getAttribute("data-section");
      showSection(sectionId);
    });
  });
  
  // Show profile section by default
  document.querySelector(".menu-link.active").click();
};

// ==================== MEMORY GAME FUNCTIONS ====================
const createCards = () => {
  const shuffledCards = [...cards].sort(() => Math.random() > 0.5 ? 1 : -1);
  
  cardsContainer.innerHTML = shuffledCards.map(card => `
    <li class="card">
      <div class="view front-view">
        <img src="images/que_icon.svg" alt="icon">
      </div>
      <div class="view back-view">
        <img src="images/${card}" alt="card-img">
      </div>
    </li>
  `).join("");
  
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", flipCard);
  });
};

const flipCard = ({target: clickedCard}) => {
  if(cardOne !== clickedCard && !disableDeck && !clickedCard.classList.contains("flip")) {
    clickedCard.classList.add("flip");
    
    if(!cardOne) {
      return cardOne = clickedCard;
    }
    
    cardTwo = clickedCard;
    disableDeck = true;
    
    const cardOneImg = cardOne.querySelector(".back-view img").src;
    const cardTwoImg = cardTwo.querySelector(".back-view img").src;
    matchCards(cardOneImg, cardTwoImg);
  }
};

const matchCards = (img1, img2) => {
  if(img1 === img2) {
    matched++;
    
    if(matched === 8) {
      setTimeout(() => {
        createCards();
        matched = 0;
      }, 1000);
    }
    
    cardOne.removeEventListener("click", flipCard);
    cardTwo.removeEventListener("click", flipCard);
    cardOne = cardTwo = "";
    return disableDeck = false;
  }
  
  setTimeout(() => {
    cardOne.classList.add("shake");
    cardTwo.classList.add("shake");
  }, 400);

  setTimeout(() => {
    cardOne.classList.remove("shake", "flip");
    cardTwo.classList.remove("shake", "flip");
    cardOne = cardTwo = "";
    disableDeck = false;
  }, 1200);
};

const initMemoryGame = () => {
  createCards();
  matched = 0;
};

// ==================== DRAWING APP FUNCTIONS ====================
const setCanvasBackground = () => {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = selectedColor;
};

const drawRect = (e) => {
  if(!fillColor.checked) {
    return ctx.strokeRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
  }
  ctx.fillRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
};

const drawCircle = (e) => {
  ctx.beginPath();
  let radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX), 2) + Math.pow((prevMouseY - e.offsetY), 2));
  ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
  fillColor.checked ? ctx.fill() : ctx.stroke();
};

const drawTriangle = (e) => {
  ctx.beginPath();
  ctx.moveTo(prevMouseX, prevMouseY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
  ctx.closePath();
  fillColor.checked ? ctx.fill() : ctx.stroke();
};

const startDraw = (e) => {
  isDrawing = true;
  prevMouseX = e.offsetX;
  prevMouseY = e.offsetY;
  ctx.beginPath();
  ctx.lineWidth = brushWidth;
  ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
  ctx.fillStyle = selectedColor;
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
};

const drawing = (e) => {
  if(!isDrawing) return;
  ctx.putImageData(snapshot, 0, 0);

  if(selectedTool === "brush" || selectedTool === "eraser") {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  } else if(selectedTool === "rectangle"){
    drawRect(e);
  } else if(selectedTool === "circle"){
    drawCircle(e);
  } else if(selectedTool === "triangle"){
    drawTriangle(e);
  }
};

const initDrawingTools = () => {
  toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelector(".tool.active").classList.remove("active");
      btn.classList.add("active");
      selectedTool = btn.id;
    });
  });

  colorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelector(".option.selected").classList.remove("selected");
      btn.classList.add("selected");
      selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    });
  });

  sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value);

  colorPicker.addEventListener("change", () => {
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
  });

  clearCanvasBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
  });

  saveImgBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `drawing-${Date.now()}.jpg`;
    link.href = canvas.toDataURL();
    link.click();
  });

  canvas.addEventListener("mousedown", startDraw);
  canvas.addEventListener("mousemove", drawing);
  canvas.addEventListener("mouseup", () => isDrawing = false);
};

const initDrawingCanvas = () => {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  setCanvasBackground();
};

// ==================== SWIPER SLIDER ====================
const initSwiperSlider = () => {
  const swiper = new Swiper('.card-wrapper', {
    loop: true,
    spaceBetween: 30,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      dynamicBullets: true
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    breakpoints: {
      0: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 }
    }
  });
};

// ==================== INITIALIZATION ====================
const initApp = () => {
  // Apply saved theme
  applySavedTheme();
  
  // Theme toggle
  themeToggleBtn.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    updateThemeIcon();
  });

  // Sidebar toggle
  sidebarToggleBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      updateThemeIcon();
    });
  });

  // Search form
  searchForm.addEventListener("click", () => {
    if (sidebar.classList.contains("collapsed") && window.innerWidth <= 768) {
      sidebar.classList.remove("collapsed");
      searchForm.querySelector("input").focus();
    }
  });

  // Initialize section navigation
  initSectionNavigation();
  
  // Initialize Swiper slider
  initSwiperSlider();
  
  // Initialize Drawing App
  initDrawingTools();
  
  // Initialize Memory Game
  initMemoryGame();
  
  // Expand sidebar on large screens
  if (window.innerWidth > 768) sidebar.classList.remove("collapsed");
};

// Start the app when DOM is loaded
document.addEventListener("DOMContentLoaded", initApp);

// Responsive adjustments
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    sidebar.classList.remove("collapsed");
  } else if (!document.body.classList.contains("collapsed")) {
    sidebar.classList.add("collapsed");
  }
  updateThemeIcon();
});