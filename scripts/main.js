(() => {
  /* GLOBAL VARIABLES */
  let projects = [];
  let currentDetailProject = null;
  let currentDetailImageIndex = 0;
  let isAnimating = false;

  /* TOUCH SWIPE VARIABLES */
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  /* DOM ELEMENTS */
  const verticalCarousel = document.getElementById("vertical-carousel");
  const detailView = document.getElementById("detail-view");
  const detailOverlay = document.getElementById("detail-overlay");
  const closeDetailBtn = document.getElementById("close-detail");
  const detailCaption = document.getElementById("detail-caption");
  const aboutLink = document.getElementById("about-link");
  const projectNavigator = document.getElementById("project-navigator");

  /* FETCH PROJECTS.JSON */
  fetch("projects.json")
    .then(res => res.json())
    .then(data => {
      projects = data;
      buildVerticalCarousel();
    })
    .catch(err => console.error("Error loading projects.json:", err));

  /* BUILD VERTICAL CAROUSEL */
  function buildVerticalCarousel() {
    verticalCarousel.innerHTML = "";
    const fragment = document.createDocumentFragment();

    // Add intro card
    const introCard = document.createElement("div");
    introCard.className = "project-card intro-card";
    introCard.innerHTML = `
      <div class="intro-text">
        <div class="intro-scroll">
        FRONTSEAT STRATEGIES IS A FULL-SERVICE DESIGN AGENCY.
        <br>
          SCROLL DOWN TO VIEW OUR PROJECTS
        </div>
      </div>
    `;
    fragment.appendChild(introCard);

    // Add project cards
    projects.forEach((project, index) => {
      if (!project.images || project.images.length === 0) return;

      const card = document.createElement("div");
      card.className = "project-card";
      card.dataset.projectIndex = index;

      const img = document.createElement("img");
      img.src = project.images[0].src;
      img.alt = project.title;
      img.loading = index > 2 ? "lazy" : "eager";

      const title = document.createElement("div");
      title.className = "project-title";
      title.textContent = project.title;

      card.appendChild(img);
      card.appendChild(title);
      card.addEventListener("click", () => openDetailView(index));

      fragment.appendChild(card);
    });

    verticalCarousel.appendChild(fragment);

    // Build project navigator after carousel is built
    buildProjectNavigator();
  }

  /* OPEN DETAIL VIEW */
  function openDetailView(projectIndex) {
    currentDetailProject = projectIndex;
    currentDetailImageIndex = 0;

    // Find the clicked project card
    const clickedCard = document.querySelector(`.project-card[data-project-index="${projectIndex}"]`);

    if (clickedCard) {
      // Scroll the card to center of viewport
      clickedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Wait for scroll animation to complete, then open detail view
      setTimeout(() => {
        const project = projects[currentDetailProject];
        const carousel = document.getElementById('detail-carousel');

        // Clear carousel
        carousel.innerHTML = '';

        // Create all image elements
        project.images.forEach((imageData, index) => {
          const img = document.createElement('img');
          img.className = 'detail-carousel-image';
          img.src = imageData.src;
          img.alt = imageData.caption || project.title;
          img.dataset.index = index;

          // Add mousemove handler for cursor change
          img.addEventListener('mousemove', (e) => {
            const imgIndex = parseInt(e.target.dataset.index);

            // If not the current image, show pointer cursor
            if (imgIndex !== currentDetailImageIndex) {
              e.target.style.cursor = 'pointer';
              return;
            }

            // For current image, check left/right half
            const rect = e.target.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            const isLeftHalf = x < width / 2;

            if (isLeftHalf && currentDetailImageIndex > 0) {
              e.target.style.cursor = 'w-resize'; // Left arrow cursor
            } else if (!isLeftHalf && currentDetailImageIndex < project.images.length - 1) {
              e.target.style.cursor = 'e-resize'; // Right arrow cursor
            } else {
              e.target.style.cursor = 'default';
            }
          });

          // Add click handler to navigate
          img.addEventListener('click', (e) => {
            e.stopPropagation();
            const clickedIndex = parseInt(e.target.dataset.index);

            // If clicking on current image, check left/right half
            if (clickedIndex === currentDetailImageIndex) {
              const rect = e.target.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const width = rect.width;
              const isLeftHalf = x < width / 2;

              if (isLeftHalf && currentDetailImageIndex > 0) {
                showPreviousDetailImage();
              } else if (!isLeftHalf && currentDetailImageIndex < project.images.length - 1) {
                showNextDetailImage();
              }
            } else if (clickedIndex > currentDetailImageIndex) {
              showNextDetailImage();
            } else if (clickedIndex < currentDetailImageIndex) {
              showPreviousDetailImage();
            }
          });

          carousel.appendChild(img);
        });

        // Position carousel to center first image
        // Center offset = (100vw - 80vw) / 2 = 10vw
        carousel.style.transition = 'none';
        carousel.style.transform = 'translateX(10vw)';

        // Update caption
        updateCaption();

        // Hide about link and project navigator
        aboutLink.style.opacity = '0';
        aboutLink.style.pointerEvents = 'none';
        projectNavigator.style.opacity = '0';
        projectNavigator.style.pointerEvents = 'none';

        // Show detail view with transition
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            detailView.classList.add("active");
            document.body.style.overflow = "hidden";
            // Re-enable carousel transitions
            setTimeout(() => {
              carousel.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            }, 50);
          });
        });
      }, 500);
    }
  }

  /* CLOSE DETAIL VIEW */
  function closeDetailView() {
    detailView.classList.remove("active");

    // Show about link and project navigator
    aboutLink.style.opacity = '';
    aboutLink.style.pointerEvents = '';
    projectNavigator.style.opacity = '';
    projectNavigator.style.pointerEvents = '';

    // Wait for transition to complete before resetting
    setTimeout(() => {
      document.body.style.overflow = "";
      currentDetailProject = null;
      currentDetailImageIndex = 0;
      isAnimating = false;

      // Reset carousel
      const carousel = document.getElementById('detail-carousel');
      carousel.innerHTML = '';
      carousel.style.transition = 'none';
      carousel.style.transform = 'translateX(10vw)';
    }, 600);
  }

  /* UPDATE CAPTION */
  function updateCaption() {
    if (currentDetailProject === null) return;

    const project = projects[currentDetailProject];
    const currentImageData = project.images[currentDetailImageIndex];
    detailCaption.textContent = currentImageData.caption || project.title;
  }

  /* NAVIGATE DETAIL VIEW */
  function showNextDetailImage() {
    if (currentDetailProject === null || isAnimating) return;

    const project = projects[currentDetailProject];
    if (currentDetailImageIndex >= project.images.length - 1) return; // At last image

    isAnimating = true;
    currentDetailImageIndex++;

    const carousel = document.getElementById('detail-carousel');
    const slideDistance = 82; // 80vw + 2rem gap
    const centerOffset = 10; // (100vw - 80vw) / 2
    const offset = centerOffset - (currentDetailImageIndex * slideDistance);

    carousel.style.transform = `translateX(${offset}vw)`;
    updateCaption();

    // Reset animation flag after transition
    setTimeout(() => {
      isAnimating = false;
    }, 500);
  }

  function showPreviousDetailImage() {
    if (currentDetailProject === null || isAnimating) return;

    if (currentDetailImageIndex <= 0) return; // At first image

    isAnimating = true;
    currentDetailImageIndex--;

    const carousel = document.getElementById('detail-carousel');
    const slideDistance = 82; // 80vw + 2rem gap
    const centerOffset = 10; // (100vw - 80vw) / 2
    const offset = centerOffset - (currentDetailImageIndex * slideDistance);

    carousel.style.transform = `translateX(${offset}vw)`;
    updateCaption();

    // Reset animation flag after transition
    setTimeout(() => {
      isAnimating = false;
    }, 500);
  }

  /* EVENT LISTENERS */
  closeDetailBtn.addEventListener("click", closeDetailView);
  detailOverlay.addEventListener("click", closeDetailView);

  /* TOUCH SWIPE HANDLERS FOR DETAIL VIEW */
  const detailCarousel = document.getElementById('detail-carousel');

  detailCarousel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  detailCarousel.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const minSwipeDistance = 50; // Minimum swipe distance in pixels

    // Check if horizontal swipe is dominant and exceeds minimum distance
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX < 0) {
        // Swipe left -> next image
        showNextDetailImage();
      } else {
        // Swipe right -> previous image
        showPreviousDetailImage();
      }
    }
  }

  /* KEYBOARD NAVIGATION */
  document.addEventListener("keydown", (e) => {
    if (!detailView.classList.contains("active")) return;

    if (e.key === "Escape") {
      closeDetailView();
    } else if (e.key === "ArrowRight") {
      showNextDetailImage();
    } else if (e.key === "ArrowLeft") {
      showPreviousDetailImage();
    }
  });

  /* ABOUT LINK */
  aboutLink.addEventListener("click", () => {
    alert("Frontseat Strategies is a full-service design agency.\nOur services are invite-only.");
  });

  /* BUILD PROJECT NAVIGATOR */
  function buildProjectNavigator() {
    projectNavigator.innerHTML = "";

    projects.forEach((_, index) => {
      const navItem = document.createElement("div");
      navItem.className = "project-nav-item";
      navItem.textContent = index + 1;
      navItem.dataset.projectIndex = index;

      navItem.addEventListener("click", () => {
        const targetCard = document.querySelector(`.project-card[data-project-index="${index}"]`);
        if (targetCard) {
          targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });

      projectNavigator.appendChild(navItem);
    });

    // Setup IntersectionObserver for automatic navigation
    setupNavigatorObserver();
  }

  /* SETUP INTERSECTION OBSERVER FOR NAVIGATOR */
  function setupNavigatorObserver() {
    // Observer options: detect when project card is in the center of viewport
    const options = {
      root: null,
      rootMargin: '-45% 0px -45% 0px', // Only trigger when in center 10% of viewport
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const projectIndex = parseInt(entry.target.dataset.projectIndex);
          updateActiveNavigator(projectIndex);
        }
      });
    }, options);

    // Observe all project cards
    const projectCards = document.querySelectorAll('.project-card[data-project-index]');
    projectCards.forEach(card => observer.observe(card));
  }

  /* UPDATE ACTIVE NAVIGATOR */
  function updateActiveNavigator(activeIndex) {
    const navItems = document.querySelectorAll('.project-nav-item');
    navItems.forEach((item) => {
      const itemIndex = parseInt(item.dataset.projectIndex);
      if (itemIndex === activeIndex) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  /* PREVENT DEFAULT BEHAVIORS */
  document.addEventListener("contextmenu", e => e.preventDefault());
})();
