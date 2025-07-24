// ==================== PERFORMANCE & UTILITIES ====================
// Debounce function for performance
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for performance
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};

// Lazy loading for images
const lazyLoadImages = () => {
  const images = document.querySelectorAll('img[loading="lazy"]');
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
};

// ==================== GLOBAL VARIABLES ====================
// Sidebar & Theme
const sidebarToggleBtns = document.querySelectorAll(".sidebar-toggle");
const sidebar = document.querySelector(".sidebar");
const searchForm = document.querySelector(".search-form");
const themeToggleBtn = document.querySelector(".theme-toggle");
const themeIcon = themeToggleBtn.querySelector(".theme-icon");
const menuLinks = document.querySelectorAll(".menu-link");
const contentSections = document.querySelectorAll(".content-section");

// Section state management
const sectionState = {
  currentSection: 'profile-section',
  initialized: new Set(['profile-section']),
  loading: new Set()
};

// Memory Game - Original Version
const cardsContainer = document.querySelector(".cards");
let matched = 0;
let cardOne, cardTwo;
let disableDeck = false;
const cards = Array.from({ length: 8 }, (_, i) => `img-${i+1}.png`)
  .flatMap(img => [img, img]);

// Drawing App
let drawingApp = null;

// Piano App
let pianoApp = null;

// Photo Editor
let photoEditor = null;

// Hangman Game - Global scope for proper cleanup
let hangmanGame = {
  currentWord: '',
  correctLetters: [],
  wrongGuessCount: 0,
  maxGuesses: 6,
  wordList: [
    { word: "javascript", hint: "Programming language for web development" },
    { word: "hangman", hint: "Popular word guessing game" },
    { word: "coding", hint: "Writing computer programs" },
    { word: "website", hint: "A collection of web pages" },
    { word: "computer", hint: "Electronic device for processing data" },
    { word: "software", hint: "Computer programs and applications" },
    { word: "developer", hint: "Person who creates software" },
    { word: "algorithm", hint: "Step-by-step problem solving procedure" },
    { word: "function", hint: "Reusable block of code" },
    { word: "variable", hint: "Container for storing data" }
  ],
  elements: {
    wordDisplay: null,
    guessesText: null,
    keyboard: null,
    hangmanImage: null,
    gameModal: null,
    playAgainBtn: null,
    hintText: null
  }
};

// ==================== MEMORY GAME FUNCTIONS - ORIGINAL VERSION ====================
const createCards = () => {
  const cardsContainer = document.querySelector(".cards");
  if (!cardsContainer) return;
  
  const shuffledCards = [...cards].sort(() => Math.random() > 0.5 ? 1 : -1);
  
  cardsContainer.innerHTML = shuffledCards.map(card => `
    <li class="card">
      <div class="view front-view">
        <img src="images/que_icon.svg" alt="icon" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'color:white;font-size:24px;\\'>?</div>'">
      </div>
      <div class="view back-view">
        <img src="images/${card}" alt="card-img" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'color:white;font-size:20px;\\'>IMG</div>'">
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

// ==================== LAZY LOADING SECTIONS ====================
const SectionManager = {
  // Initialize a section lazily
  async initSection(sectionId) {
    if (sectionState.loading.has(sectionId)) return;
    if (sectionState.initialized.has(sectionId)) return;

    sectionState.loading.add(sectionId);
    
    try {
      // Show loading state
      this.showLoadingState(sectionId);

      // Initialize based on section
      switch(sectionId) {
        case 'skills-section':
          await this.initSkillsSection();
          break;
        case 'game-section':
          await this.initMemoryGame();
          break;
        case 'drawing-section':
          await this.initDrawingApp();
          break;
        case 'piano-section':
          await this.initPianoApp();
          break;
        case 'photo-editor-section':
          await this.initPhotoEditor();
          break;
        case 'hangman-section':
          await this.initHangmanGame();
          break;
      }

      sectionState.initialized.add(sectionId);
    } catch (error) {
      console.error(`Failed to initialize ${sectionId}:`, error);
    } finally {
      sectionState.loading.delete(sectionId);
      this.hideLoadingState(sectionId);
    }
  },

  showLoadingState(sectionId) {
    const section = document.querySelector(`.${sectionId}`);
    if (section) {
      section.classList.add('loading');
      
      // Add loading spinner if not exists
      if (!section.querySelector('.loading-spinner')) {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.style.cssText = 'margin: 50px auto; display: block;';
        section.appendChild(spinner);
      }
    }
  },

  hideLoadingState(sectionId) {
    const section = document.querySelector(`.${sectionId}`);
    if (section) {
      section.classList.remove('loading');
      const spinner = section.querySelector('.loading-spinner');
      if (spinner) spinner.remove();
    }
  },

  // Skills section initialization
  async initSkillsSection() {
    // Load Swiper if not loaded
    if (!window.Swiper) {
      await this.loadScript('https://unpkg.com/swiper/swiper-bundle.min.js');
    }
    
    // Initialize Swiper
    if (window.Swiper && !document.querySelector('.swiper-container-initialized')) {
      new Swiper('.card-wrapper', {
        loop: true,
        spaceBetween: 30,
        grabCursor: true,
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
        },
        autoplay: {
          delay: 3000,
          disableOnInteraction: false,
        }
      });
    }
  },

  // Memory game initialization - Original Version
async initMemoryGame() {
  initMemoryGame();
},

  // Drawing app initialization
  async initDrawingApp() {
    if (drawingApp) return;

    const canvas = document.querySelector(".drawing-section canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    
    drawingApp = {
      canvas,
      ctx,
      isDrawing: false,
      selectedTool: "brush",
      brushWidth: 5,
      selectedColor: "#000",
      prevMouseX: 0,
      prevMouseY: 0,
      snapshot: null,

      init() {
        this.setupCanvas();
        this.setupTools();
        this.setupEventListeners();
      },

      setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.setCanvasBackground();
      },

      setCanvasBackground() {
        this.ctx.fillStyle = "#fff";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.selectedColor;
      },

      setupTools() {
        const toolBtns = document.querySelectorAll(".drawing-section .tool");
        const colorBtns = document.querySelectorAll(".drawing-section .colors .option");
        const sizeSlider = document.querySelector(".drawing-section #size-slider");
        const colorPicker = document.querySelector(".drawing-section #color-picker");

        toolBtns.forEach(btn => {
          btn.addEventListener("click", () => {
            document.querySelector(".drawing-section .tool.active")?.classList.remove("active");
            btn.classList.add("active");
            this.selectedTool = btn.id;
          });
        });

        colorBtns.forEach(btn => {
          btn.addEventListener("click", () => {
            document.querySelector(".drawing-section .option.selected")?.classList.remove("selected");
            btn.classList.add("selected");
            
            if (btn.querySelector('#color-picker')) return;
            this.selectedColor = window.getComputedStyle(btn).backgroundColor;
          });
        });

        if (sizeSlider) {
          sizeSlider.addEventListener("change", () => {
            this.brushWidth = sizeSlider.value;
          });
        }

        if (colorPicker) {
          colorPicker.addEventListener("change", () => {
            const parentOption = colorPicker.closest('.option');
            parentOption.style.background = colorPicker.value;
            parentOption.click();
          });
        }
      },

      setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener("mousedown", this.startDraw.bind(this));
        this.canvas.addEventListener("mousemove", this.drawing.bind(this));
        this.canvas.addEventListener("mouseup", () => this.isDrawing = false);

        // Touch events for mobile
        this.canvas.addEventListener("touchstart", this.handleTouch.bind(this));
        this.canvas.addEventListener("touchmove", this.handleTouch.bind(this));
        this.canvas.addEventListener("touchend", () => this.isDrawing = false);

        // Buttons
        const clearBtn = document.querySelector(".drawing-section .clear-canvas");
        const saveBtn = document.querySelector(".drawing-section .save-img");

        if (clearBtn) {
          clearBtn.addEventListener("click", () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.setCanvasBackground();
          });
        }

        if (saveBtn) {
          saveBtn.addEventListener("click", () => {
            const link = document.createElement("a");
            link.download = `drawing-${Date.now()}.jpg`;
            link.href = this.canvas.toDataURL();
            link.click();
          });
        }
      },

      handleTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                         e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        
        mouseEvent.offsetX = touch.clientX - rect.left;
        mouseEvent.offsetY = touch.clientY - rect.top;
        
        if (e.type === 'touchstart') this.startDraw(mouseEvent);
        else if (e.type === 'touchmove') this.drawing(mouseEvent);
      },

      startDraw(e) {
        this.isDrawing = true;
        this.prevMouseX = e.offsetX;
        this.prevMouseY = e.offsetY;
        this.ctx.beginPath();
        this.ctx.lineWidth = this.brushWidth;
        this.ctx.strokeStyle = this.selectedTool === "eraser" ? "#fff" : this.selectedColor;
        this.ctx.fillStyle = this.selectedColor;
        this.snapshot = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      },

      drawing(e) {
        if(!this.isDrawing) return;
        this.ctx.putImageData(this.snapshot, 0, 0);

        if(this.selectedTool === "brush" || this.selectedTool === "eraser") {
          this.ctx.lineTo(e.offsetX, e.offsetY);
          this.ctx.stroke();
        } else if(this.selectedTool === "rectangle"){
          this.drawRect(e);
        } else if(this.selectedTool === "circle"){
          this.drawCircle(e);
        } else if(this.selectedTool === "triangle"){
          this.drawTriangle(e);
        }
      },

      drawRect(e) {
        const fillColor = document.querySelector(".drawing-section #fill-color");
        if(!fillColor?.checked) {
          return this.ctx.strokeRect(e.offsetX, e.offsetY, this.prevMouseX - e.offsetX, this.prevMouseY - e.offsetY);
        }
        this.ctx.fillRect(e.offsetX, e.offsetY, this.prevMouseX - e.offsetX, this.prevMouseY - e.offsetY);
      },

      drawCircle(e) {
        this.ctx.beginPath();
        let radius = Math.sqrt(Math.pow((this.prevMouseX - e.offsetX), 2) + Math.pow((this.prevMouseY - e.offsetY), 2));
        this.ctx.arc(this.prevMouseX, this.prevMouseY, radius, 0, 2 * Math.PI);
        const fillColor = document.querySelector(".drawing-section #fill-color");
        fillColor?.checked ? this.ctx.fill() : this.ctx.stroke();
      },

      drawTriangle(e) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.prevMouseX, this.prevMouseY);
        this.ctx.lineTo(e.offsetX, e.offsetY);
        this.ctx.lineTo(this.prevMouseX * 2 - e.offsetX, e.offsetY);
        this.ctx.closePath();
        const fillColor = document.querySelector(".drawing-section #fill-color");
        fillColor?.checked ? this.ctx.fill() : this.ctx.stroke();
      }
    };

    drawingApp.init();
  },

  // Piano app initialization
  async initPianoApp() {
    if (pianoApp) return;

    pianoApp = {
      keys: document.querySelectorAll(".piano-keys .key"),
      volumeSlider: document.querySelector(".piano-container #volume-control"),
      keysCheckbox: document.querySelector(".piano-container #show-keys"),
      allKeys: [],
      audio: new Audio(),

      init() {
        this.setupKeys();
        this.setupControls();
        this.setupKeyboardEvents();
      },

      setupKeys() {
        this.keys.forEach(key => {
          this.allKeys.push(key.dataset.key);
          key.addEventListener("click", () => this.playTune(key.dataset.key));
          
          // Keyboard accessibility
          key.addEventListener("keydown", (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              this.playTune(key.dataset.key);
            }
          });
        });
      },

      setupControls() {
        if (this.volumeSlider) {
          this.volumeSlider.addEventListener("input", (e) => {
            this.audio.volume = e.target.value;
          });
        }

        if (this.keysCheckbox) {
          this.keysCheckbox.addEventListener("change", () => {
            this.keys.forEach(key => key.classList.toggle("hide"));
          });
        }
      },

      setupKeyboardEvents() {
        // Remove any existing event listeners
        document.removeEventListener("keydown", this.handleKeyPress);
        document.addEventListener("keydown", this.handleKeyPress.bind(this));
      },

      handleKeyPress(e) {
        if (!document.querySelector(".piano-section.active-section")) return;
        if (this.allKeys.includes(e.key)) {
          e.preventDefault();
          this.playTune(e.key);
        }
      },

      playTune(key) {
        this.audio.src = `tunes/${key}.wav`;
        this.audio.play().catch(e => console.log("Audio play failed:", e));

        const clickedKey = document.querySelector(`[data-key="${key}"]`);
        if (clickedKey) {
          clickedKey.classList.add("active");
          setTimeout(() => clickedKey.classList.remove("active"), 150);
        }
      }
    };

    pianoApp.init();
  },

  // Photo editor initialization
  async initPhotoEditor() {
    if (photoEditor) return;

    photoEditor = {
      fileInput: document.querySelector(".photo-editor-section .file-input"),
      filterOptions: document.querySelectorAll(".photo-editor-section .filter button"),
      filterName: document.querySelector(".photo-editor-section .filter-info .name"),
      filterValue: document.querySelector(".photo-editor-section .filter-info .value"),
      filterSlider: document.querySelector(".photo-editor-section .slider input"),
      rotateOptions: document.querySelectorAll(".photo-editor-section .rotate button"),
      previewImg: document.querySelector(".photo-editor-section .preview-img img"),
      resetFilterBtn: document.querySelector(".photo-editor-section .reset-filter"),
      chooseImgBtn: document.querySelector(".photo-editor-section .choose-img"),
      saveImgBtn: document.querySelector(".photo-editor-section .save-img"),
      
      brightness: "100",
      saturation: "100", 
      inversion: "0",
      grayscale: "0",
      rotate: 0,
      flipHorizontal: 1,
      flipVertical: 1,

      init() {
        this.setupEventListeners();
      },

      setupEventListeners() {
        this.filterSlider?.addEventListener("input", this.updateFilter.bind(this));
        this.resetFilterBtn?.addEventListener("click", this.resetFilter.bind(this));
        this.saveImgBtn?.addEventListener("click", this.saveImage.bind(this));
        this.fileInput?.addEventListener("change", this.loadImage.bind(this));
        this.chooseImgBtn?.addEventListener("click", () => this.fileInput?.click());

        this.filterOptions.forEach(option => {
          option.addEventListener("click", this.selectFilter.bind(this, option));
        });

        this.rotateOptions.forEach(option => {
          option.addEventListener("click", this.handleRotate.bind(this, option));
        });
      },

      selectFilter(option) {
        document.querySelector(".photo-editor-section .filter .active")?.classList.remove("active");
        option.classList.add("active");
        this.filterName.innerText = option.innerText;

        const filterMap = {
          brightness: { max: "200", value: this.brightness },
          saturation: { max: "200", value: this.saturation },
          inversion: { max: "100", value: this.inversion },
          grayscale: { max: "100", value: this.grayscale }
        };

        const filter = filterMap[option.id];
        if (filter) {
          this.filterSlider.max = filter.max;
          this.filterSlider.value = filter.value;
          this.filterValue.innerText = `${filter.value}%`;
        }
      },

      updateFilter() {
        this.filterValue.innerText = `${this.filterSlider.value}%`;
        const selectedFilter = document.querySelector(".photo-editor-section .filter .active");

        switch(selectedFilter.id) {
          case "brightness": this.brightness = this.filterSlider.value; break;
          case "saturation": this.saturation = this.filterSlider.value; break;
          case "inversion": this.inversion = this.filterSlider.value; break;
          case "grayscale": this.grayscale = this.filterSlider.value; break;
        }
        this.applyFilter();
      },

      handleRotate(option) {
        switch(option.id) {
          case "left": this.rotate -= 90; break;
          case "right": this.rotate += 90; break;
          case "horizontal": this.flipHorizontal = this.flipHorizontal === 1 ? -1 : 1; break;
          case "vertical": this.flipVertical = this.flipVertical === 1 ? -1 : 1; break;
        }
        this.applyFilter();
      },

      applyFilter() {
        if (!this.previewImg) return;
        this.previewImg.style.transform = `rotate(${this.rotate}deg) scale(${this.flipHorizontal}, ${this.flipVertical})`;
        this.previewImg.style.filter = `brightness(${this.brightness}%) saturate(${this.saturation}%) invert(${this.inversion}%) grayscale(${this.grayscale}%)`;
      },

      loadImage() {
        const file = this.fileInput.files[0];
        if(!file) return;
        
        this.previewImg.src = URL.createObjectURL(file);
        this.previewImg.addEventListener("load", () => {
          this.resetFilter();
          document.querySelector(".photo-editor-section .container")?.classList.remove("disable");
        });
      },

      resetFilter() {
        this.brightness = "100";
        this.saturation = "100";
        this.inversion = "0";
        this.grayscale = "0";
        this.rotate = 0;
        this.flipHorizontal = 1;
        this.flipVertical = 1;
        this.filterOptions[0]?.click();
        this.applyFilter();
      },

      saveImage() {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = this.previewImg.naturalWidth;
        canvas.height = this.previewImg.naturalHeight;
        
        ctx.filter = `brightness(${this.brightness}%) saturate(${this.saturation}%) invert(${this.inversion}%) grayscale(${this.grayscale}%)`;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        if(this.rotate !== 0) {
          ctx.rotate(this.rotate * Math.PI / 180);
        }
        ctx.scale(this.flipHorizontal, this.flipVertical);
        ctx.drawImage(this.previewImg, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
        
        const link = document.createElement("a");
        link.download = "edited-image.jpg";
        link.href = canvas.toDataURL();
        link.click();
      }
    };

    photoEditor.init();
  },

  // Hangman game initialization
  async initHangmanGame() {
    // Always reinitialize to ensure clean state
    this.setupHangmanElements();
    this.resetHangmanGame();
    this.setupHangmanEventListeners();
    this.getRandomWord();
  },

  setupHangmanElements() {
    hangmanGame.elements = {
      wordDisplay: document.querySelector(".hangman-section .word-display"),
      guessesText: document.querySelector(".hangman-section .guesses-text b"),
      keyboard: document.querySelector(".hangman-section .keyboard"),
      hangmanImage: document.querySelector(".hangman-section .hangman-box img"),
      gameModal: document.querySelector(".hangman-section .game-modal"),
      playAgainBtn: document.querySelector(".hangman-section .play-again"),
      hintText: document.querySelector(".hangman-section .hint-text b")
    };
  },

  setupHangmanEventListeners() {
    // Remove existing event listeners to prevent duplicates
    document.removeEventListener("keydown", this.handleHangmanKeyPress);
    document.addEventListener("keydown", this.handleHangmanKeyPress.bind(this));

    // Play again button
    if (hangmanGame.elements.playAgainBtn) {
      hangmanGame.elements.playAgainBtn.replaceWith(hangmanGame.elements.playAgainBtn.cloneNode(true));
      hangmanGame.elements.playAgainBtn = document.querySelector(".hangman-section .play-again");
      hangmanGame.elements.playAgainBtn.addEventListener("click", this.getRandomWord.bind(this));
    }
  },

  handleHangmanKeyPress(e) {
    if (!document.querySelector(".hangman-section.active-section")) return;
    
    const key = e.key.toLowerCase();
    if (/^[a-z]$/.test(key) && hangmanGame.elements.keyboard) {
      const buttons = hangmanGame.elements.keyboard.querySelectorAll("button");
      const button = Array.from(buttons).find(
        btn => btn.textContent === key && !btn.disabled
      );
      if (button) {
        e.preventDefault();
        this.processGuess(button, key);
      }
    }
  },

  resetHangmanGame() {
    hangmanGame.correctLetters = [];
    hangmanGame.wrongGuessCount = 0;
    
    if (hangmanGame.elements.hangmanImage) {
      hangmanGame.elements.hangmanImage.src = "images/hangman-0.svg";
    }
    
    if (hangmanGame.elements.guessesText) {
      hangmanGame.elements.guessesText.innerText = `${hangmanGame.wrongGuessCount} / ${hangmanGame.maxGuesses}`;
    }
    
    if (hangmanGame.elements.gameModal) {
      hangmanGame.elements.gameModal.classList.remove("show");
    }
    
    this.createKeyboard();
    this.updateWordDisplay();
  },

  createKeyboard() {
    if (!hangmanGame.elements.keyboard) return;
    
    hangmanGame.elements.keyboard.innerHTML = '';
    for (let i = 97; i <= 122; i++) {
      const button = document.createElement("button");
      const letter = String.fromCharCode(i);
      button.innerText = letter;
      button.setAttribute('aria-label', `Letter ${letter}`);
      hangmanGame.elements.keyboard.appendChild(button);
      
      // Clone to remove existing event listeners
      const newButton = button.cloneNode(true);
      button.replaceWith(newButton);
      newButton.addEventListener("click", () => this.processGuess(newButton, letter));
    }
  },

  getRandomWord() {
    const randomIndex = Math.floor(Math.random() * hangmanGame.wordList.length);
    const { word, hint } = hangmanGame.wordList[randomIndex];
    hangmanGame.currentWord = word.toLowerCase();
    
    if (hangmanGame.elements.hintText) {
      hangmanGame.elements.hintText.innerText = hint;
    }
    
    this.resetHangmanGame();
  },

  updateWordDisplay() {
    if (!hangmanGame.elements.wordDisplay) return;
    
    hangmanGame.elements.wordDisplay.innerHTML = hangmanGame.currentWord
      .split("")
      .map(() => '<li class="letter"></li>')
      .join("");
  },

  processGuess(button, letter) {
    if (!hangmanGame.currentWord) return;
    
    button.disabled = true;
    
    if (hangmanGame.currentWord.includes(letter)) {
      [...hangmanGame.currentWord].forEach((char, index) => {
        if (char === letter) {
          hangmanGame.correctLetters.push(letter);
          const letterElements = hangmanGame.elements.wordDisplay.querySelectorAll("li");
          if (letterElements[index]) {
            letterElements[index].innerText = letter;
            letterElements[index].classList.add("guessed");
          }
        }
      });
    } else {
      hangmanGame.wrongGuessCount++;
      if (hangmanGame.elements.hangmanImage) {
        hangmanGame.elements.hangmanImage.src = `images/hangman-${hangmanGame.wrongGuessCount}.svg`;
      }
    }
    
    if (hangmanGame.elements.guessesText) {
      hangmanGame.elements.guessesText.innerText = `${hangmanGame.wrongGuessCount} / ${hangmanGame.maxGuesses}`;
    }

    // Check win/lose conditions
    if (hangmanGame.wrongGuessCount === hangmanGame.maxGuesses) {
      this.gameOver(false);
    } else if (hangmanGame.correctLetters.length === hangmanGame.currentWord.length) {
      this.gameOver(true);
    }
  },

  gameOver(isVictory) {
    if (!hangmanGame.elements.gameModal) return;
    
    const modalImg = hangmanGame.elements.gameModal.querySelector("img");
    const modalTitle = hangmanGame.elements.gameModal.querySelector("h4");
    const modalContent = hangmanGame.elements.gameModal.querySelector("p");
    
    if (modalImg) {
      modalImg.src = `images/${isVictory ? 'victory' : 'lost'}.gif`;
    }
    
    if (modalTitle) {
      modalTitle.innerText = isVictory ? 'Congratulations!' : 'Game Over!';
    }
    
    if (modalContent) {
      const resultText = isVictory ? 'You found the word:' : 'The correct word was:';
      modalContent.innerHTML = `${resultText} <b>${hangmanGame.currentWord}</b>`;
    }
    
    hangmanGame.elements.gameModal.classList.add("show");
    
    // Focus management for accessibility
    setTimeout(() => {
      hangmanGame.elements.playAgainBtn?.focus();
    }, 100);
  },

  // Utility function to load external scripts
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
};

// ==================== THEME & SIDEBAR MANAGEMENT ====================
const ThemeManager = {
  init() {
    this.applySavedTheme();
    this.setupEventListeners();
  },

  updateThemeIcon() {
    const isDark = document.body.classList.contains("dark-theme");
    themeIcon.textContent = sidebar.classList.contains("collapsed") 
      ? (isDark ? "light_mode" : "dark_mode") 
      : "dark_mode";
  },

  applySavedTheme() {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDarkTheme = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
    
    document.body.classList.toggle("dark-theme", shouldUseDarkTheme);
    this.updateThemeIcon();
  },

  setupEventListeners() {
    themeToggleBtn.addEventListener("click", () => {
      const isDark = document.body.classList.toggle("dark-theme");
      localStorage.setItem("theme", isDark ? "dark" : "light");
      this.updateThemeIcon();
    });

    // Listen for system theme changes
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        document.body.classList.toggle("dark-theme", e.matches);
        this.updateThemeIcon();
      }
    });
  }
};

// ==================== NAVIGATION MANAGEMENT ====================
const NavigationManager = {
  init() {
    this.setupSidebarToggles();
    this.setupMenuNavigation();
    this.setupSearchForm();
    this.setupResponsive();
  },

  setupSidebarToggles() {
    sidebarToggleBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
        ThemeManager.updateThemeIcon();
      });
    });
  },

  setupMenuNavigation() {
    menuLinks.forEach(link => {
      link.addEventListener("click", async function(e) {
        e.preventDefault();
        
        // Update active states
        menuLinks.forEach(l => {
          l.classList.remove("active");
          l.setAttribute('aria-pressed', 'false');
        });
        this.classList.add("active");
        this.setAttribute('aria-pressed', 'true');
        
        const sectionId = this.getAttribute("data-section");
        await NavigationManager.showSection(sectionId);
      });
    });
  },

  async showSection(sectionId) {
    // Don't switch if already current and initialized
    if (sectionState.currentSection === sectionId && sectionState.initialized.has(sectionId)) {
      return;
    }

    // Hide all sections immediately
    contentSections.forEach(section => {
      section.style.display = "none";
      section.classList.remove("active-section");
    });

    // Hide all modals
    document.querySelectorAll('.game-modal').forEach(modal => {
      modal.classList.remove('show');
    });

    // Clean up previous section
    this.cleanupSection(sectionState.currentSection);

    // Show target section
    const targetSection = document.querySelector(`.${sectionId}`);
    if (targetSection) {
      targetSection.style.display = "block";
      
      // Small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 50));
      
      targetSection.classList.add("active-section");
      sectionState.currentSection = sectionId;

      // Initialize section if needed
      await SectionManager.initSection(sectionId);
    }
  },

  cleanupSection(sectionId) {
    switch(sectionId) {
      case 'piano-section':
        // Stop any playing audio
        if (pianoApp?.audio) {
          pianoApp.audio.pause();
          pianoApp.audio.currentTime = 0;
        }
        break;
      case 'hangman-section':
        // Hide modal and reset keyboard events
        if (hangmanGame.elements.gameModal) {
          hangmanGame.elements.gameModal.classList.remove('show');
        }
        break;
      case 'drawing-section':
        // Clear any ongoing drawing
        if (drawingApp) {
          drawingApp.isDrawing = false;
        }
        break;
    }
  },

  setupSearchForm() {
    searchForm.addEventListener("click", () => {
      if (sidebar.classList.contains("collapsed") && window.innerWidth <= 768) {
        sidebar.classList.remove("collapsed");
        const input = searchForm.querySelector("input");
        setTimeout(() => input?.focus(), 300);
      }
    });

    // Add search functionality
    const searchInput = searchForm.querySelector("input");
    if (searchInput) {
      searchInput.addEventListener("input", debounce((e) => {
        const query = e.target.value.toLowerCase();
        this.handleSearch(query);
      }, 300));
    }
  },

  handleSearch(query) {
    if (!query) return;
    
    const searchableContent = {
      'profile-section': ['profile', 'about', 'info', 'personal'],
      'skills-section': ['skills', 'programming', 'web development', 'database'],
      'game-section': ['memory', 'game', 'cards', 'match'],
      'drawing-section': ['drawing', 'canvas', 'paint', 'art'],
      'piano-section': ['piano', 'music', 'keys', 'sound'],
      'photo-editor-section': ['photo', 'editor', 'image', 'filter'],
      'hangman-section': ['hangman', 'word', 'guess', 'letters']
    };

    for (const [sectionId, keywords] of Object.entries(searchableContent)) {
      if (keywords.some(keyword => keyword.includes(query))) {
        const menuLink = document.querySelector(`[data-section="${sectionId}"]`);
        if (menuLink) {
          menuLink.click();
          break;
        }
      }
    }
  },

  setupResponsive() {
    const handleResize = throttle(() => {
      if (window.innerWidth > 768) {
        sidebar.classList.remove("collapsed");
      } else if (!document.body.classList.contains("collapsed")) {
        sidebar.classList.add("collapsed");
      }
      ThemeManager.updateThemeIcon();
    }, 100);

    window.addEventListener("resize", handleResize);
    
    // Initial check
    if (window.innerWidth > 768) {
      sidebar.classList.remove("collapsed");
    }
  }
};

// ==================== APPLICATION INITIALIZATION ====================
const App = {
  async init() {
    try {
      // Initialize core systems
      ThemeManager.init();
      NavigationManager.init();
      
      // Setup lazy loading
      lazyLoadImages();
      
      // Initialize profile section (default)
      sectionState.initialized.add('profile-section');
      
      // Preload critical sections
      await this.preloadCriticalSections();
      
      // Setup performance monitoring
      this.setupPerformanceMonitoring();
      
      console.log("Application initialized successfully");
    } catch (error) {
      console.error("Failed to initialize application:", error);
    }
  },

  async preloadCriticalSections() {
    // Preload sections that users commonly visit first
    const criticalSections = ['skills-section'];
    
    for (const sectionId of criticalSections) {
      try {
        await SectionManager.initSection(sectionId);
      } catch (error) {
        console.warn(`Failed to preload ${sectionId}:`, error);
      }
    }
  },

  setupPerformanceMonitoring() {
    // Monitor section switching performance
    let sectionSwitchStart = 0;
    
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'section-switch') {
          console.log(`Section switch took: ${entry.duration}ms`);
        }
      }
    });
    
    observer.observe({ entryTypes: ['measure'] });

    // Track long tasks
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.warn(`Long task detected: ${entry.duration}ms`);
        }
      });
      
      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Longtask API not supported
      }
    }
  }
};

// ==================== EVENT LISTENERS & INITIALIZATION ====================
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});

// Handle page visibility changes for performance
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // Pause any ongoing animations or processes
    if (pianoApp?.audio) {
      pianoApp.audio.pause();
    }
  }
});

// Handle before unload for cleanup
window.addEventListener("beforeunload", () => {
  // Cleanup any ongoing processes
  if (drawingApp?.isDrawing) {
    drawingApp.isDrawing = false;
  }
});

// Error handling
window.addEventListener("error", (e) => {
  console.error("Global error:", e.error);
});

window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled promise rejection:", e.reason);
});