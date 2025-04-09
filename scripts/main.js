(() => {
  /* GLOBAL VARIABLES */
  let projects = [];
  let currentProjectIndex = 0;
  let currentImageIndex = 0;
  let infoVisible = false; // tracks if info section is visible

  /* DOM ELEMENTS */
  const projectNumbersContainer = document.getElementById("project-numbers");
  const hoverThumb = document.getElementById("project-hover-thumbnail");
  const mainImage = document.getElementById("main-image");
  const imageCaption = document.getElementById("image-caption");
  const fullscreenContainer = document.getElementById("fullscreen-container");
  const overviewContainer = document.getElementById("overview-container");
  const overviewGrid = document.getElementById("overview-grid");
  const studioToggle = document.getElementById("studio-toggle"); // Upper-left: Studio MHK / Back
  const viewToggle = document.getElementById("view-toggle");     // Upper-right: (View All) / (Back)
  const scrollContainer = document.getElementById("scroll-container");
  const overviewCaption = document.getElementById("overview-caption");

  /* FETCH PROJECTS.JSON */
  fetch("projects.json")
    .then(res => res.json())
    .then(data => {
      projects = data;
      buildProjectNumbers();
      buildOverviewGrid();
      if (projects.length && projects[0].images?.length) {
        showImage(0, 0);
      }
    })
    .catch(err => console.error("Error loading projects.json:", err));

  /* Prevent default behaviors */
  document.addEventListener("contextmenu", e => e.preventDefault());
  let lastTouchEnd = 0;
  document.addEventListener("touchend", e => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
  }, false);
  fullscreenContainer.addEventListener("dblclick", e => e.preventDefault());

  /* Change mouse cursor based on horizontal position */
  fullscreenContainer.addEventListener("mousemove", e => {
    const containerWidth = fullscreenContainer.offsetWidth;
    fullscreenContainer.style.cursor = (e.clientX < containerWidth / 2) ? "w-resize" : "e-resize";
  });

  /* BUILD PROJECT NUMBERS using DocumentFragment */
  function buildProjectNumbers() {
    projectNumbersContainer.innerHTML = "";
    const frag = document.createDocumentFragment();
    projects.forEach((project, index) => {
      const span = document.createElement("span");
      span.className = "project-number";
      span.dataset.projectIndex = index;
      span.textContent = project.number;
      span.addEventListener("mouseover", () => {
        hoverThumb.src = project.thumb;
        hoverThumb.style.display = "block";
      });
      span.addEventListener("mousemove", e => {
        hoverThumb.style.top = `${e.pageY + 20}px`;
        hoverThumb.style.left = `${e.pageX + 20}px`;
      });
      span.addEventListener("mouseout", () => {
        hoverThumb.style.display = "none";
      });
      span.addEventListener("click", () => showImage(index, 0));
      frag.appendChild(span);
    });
    projectNumbersContainer.appendChild(frag);
  }

  /* BUILD OVERVIEW GRID - Continuous grid of all thumbnails */
  function buildOverviewGrid() {
    overviewGrid.innerHTML = "";
    const frag = document.createDocumentFragment();
    projects.forEach((project, pIndex) => {
      project.images.forEach((imgData, iIndex) => {
        const thumb = document.createElement("img");
        thumb.src = imgData.src;
        thumb.alt = imgData.caption || "Project Image";
        thumb.loading = "lazy";
        thumb.dataset.projectIndex = pIndex;
        thumb.dataset.imageIndex = iIndex;
        thumb.addEventListener("click", () => {
          exitOverviewMode();
          showImage(pIndex, iIndex);
        });
        thumb.addEventListener("mouseenter", () => {
          overviewGrid.querySelectorAll("img").forEach(t => {
            t.style.opacity = (t.dataset.projectIndex === thumb.dataset.projectIndex) ? "1" : "0.2";
          });
          overviewCaption.textContent = `${projects[pIndex].title} | ${projects[pIndex].date}`;
          overviewCaption.style.opacity = "1";
        });
        thumb.addEventListener("mouseleave", () => {
          overviewGrid.querySelectorAll("img").forEach(t => t.style.opacity = "1");
          overviewCaption.style.opacity = "0";
        });
        frag.appendChild(thumb);
      });
    });
    overviewGrid.appendChild(frag);
  }

  /* Utility: Format caption so that only uppercase letters get a random color */
  function formatCaption(caption) {
    const palette = ["rgb(200, 255, 0)", "rgb(247, 57, 19)", "rgb(19, 133, 247)", "rgb(255, 251, 0)"];
    return caption.replace(/[A-Z]/g, letter => {
      const randomColor = palette[Math.floor(Math.random() * palette.length)];
      return `<span style="color: ${randomColor};">${letter}</span>`;
    });
  }

  /* SHOW A SPECIFIC IMAGE */
  function showImage(projectIndex, imageIndex) {
    currentProjectIndex = projectIndex;
    currentImageIndex = imageIndex;
    const project = projects[projectIndex];
    if (!project) return;
    const imageData = project.images[imageIndex];
    if (!imageData) return;
    mainImage.src = imageData.src;
    // Process caption: only wrap uppercase letters
    imageCaption.innerHTML = formatCaption(imageData.caption || "");
    updateProjectNumberHighlight();
  }

  /* HIGHLIGHT CURRENT PROJECT NUMBER - Persistent random color */
  function updateProjectNumberHighlight() {
    document.querySelectorAll(".project-number").forEach(num => num.classList.remove("active"));
    const active = document.querySelector(`.project-number[data-project-index="${currentProjectIndex}"]`);
    if (active) {
      active.classList.add("active");
      const palette = ["rgb(254, 254, 254)"];
      if (!active.dataset.activeColor) {
        active.dataset.activeColor = palette[Math.floor(Math.random() * palette.length)];
      }
      active.style.color = active.dataset.activeColor;

    }
  }

  /* Navigation: left/right click */
  fullscreenContainer.addEventListener("click", e => {
    const containerWidth = fullscreenContainer.offsetWidth;
    e.clientX < containerWidth / 2 ? showPreviousImage() : showNextImage();
  });

  function showNextImage() {
    let projIndex = currentProjectIndex;
    let imgIndex = currentImageIndex + 1;
    if (imgIndex >= projects[projIndex].images.length) {
      imgIndex = 0;
      projIndex = (projIndex + 1) % projects.length;
    }
    showImage(projIndex, imgIndex);
  }

  function showPreviousImage() {
    let projIndex = currentProjectIndex;
    let imgIndex = currentImageIndex - 1;
    if (imgIndex < 0) {
      projIndex = (projIndex - 1 + projects.length) % projects.length;
      imgIndex = projects[projIndex].images.length - 1;
    }
    showImage(projIndex, imgIndex);
  }

  /* Touch swipe for mobile */
  let touchStartX = 0;
  fullscreenContainer.addEventListener("touchstart", e => {
    touchStartX = e.touches[0].clientX;
  });
  fullscreenContainer.addEventListener("touchend", e => {
    const diff = e.changedTouches[0].clientX - touchStartX;
    diff > 50 ? showPreviousImage() : diff < -50 && showNextImage();
  });

  /* KEYBOARD NAVIGATION: left/right arrow keys */
  document.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") {
      showNextImage();
    } else if (e.key === "ArrowLeft") {
      showPreviousImage();
    }
  });

  /* TOGGLE OVERVIEW MODE via viewToggle (upper-right) */
  viewToggle.addEventListener("click", () => {
    if (!overviewContainer.classList.contains("active")) {
      overviewContainer.classList.add("active");
      viewToggle.textContent = "(Back)";
      viewToggle.classList.add("back");
      // Hide Studio MHK and project numbers during overview mode
      studioToggle.style.display = "none";
      projectNumbersContainer.style.display = "none";
    } else {
      exitOverviewMode();
    }
  });

  function exitOverviewMode() {
    overviewContainer.classList.remove("active");
    viewToggle.textContent = "(View All)";
    viewToggle.classList.remove("back");
    // Restore Studio MHK and project numbers
    studioToggle.style.display = "";
    projectNumbersContainer.style.display = "";
  }

  /* TOGGLE INFO SECTION via studioToggle (upper-left) using scroll animation */
  studioToggle.addEventListener("click", () => {
    if (!infoVisible) {
      scrollContainer.style.transform = "translateY(-100vh)";
      // When info section is active, remove the icon (just show text "Back")
      studioToggle.textContent = "Back";
      studioToggle.style.color = "#000"; // Force Back to be black
      studioToggle.classList.add("back");
      infoVisible = true;
      // Hide viewToggle and project numbers while in info mode
      viewToggle.style.display = "none";
      projectNumbersContainer.style.display = "none";
    } else {
      scrollContainer.style.transform = "translateY(0)";
      studioToggle.innerHTML = '<span class="studio-icon">⛐</span> Backseat Studio';
      studioToggle.classList.remove("back");
      studioToggle.style.color = "";
      infoVisible = false;
      viewToggle.style.display = "";
      projectNumbersContainer.style.display = "";
    }
  });

  /* SPLASH ANIMATION REMOVAL */
  const splash = document.getElementById("splash");
  if (splash) {
    splash.addEventListener("animationend", e => {
      if (e.animationName === "splashMove") {
        splash.remove();
      }
    });
  }
})();
