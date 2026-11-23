(function (global) {
  "use strict";

  let currentLessonId = null;
  let currentSlideIndex = 0;
  let zoomLevel = 100;

  document.addEventListener("DOMContentLoaded", initializePlayer);
  document.addEventListener("lesson-progress-updated", updatePlayerHUD);

  function initializePlayer() {
    initThemeToggle();
    initFullscreenToggle();

    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get("lesson");
    const lesson = LESSONS_DATA.find((item) =>
      String(item.id) === requestedId || item.slug === requestedId
    );
    const validation = lesson && LessonProgress.validateLesson(lesson.id);
    if (!lesson || !validation || !validation.valid) {
      showUnavailable(validation ? validation.message : "This lesson link is missing or invalid. Choose a lesson from the lesson list.");
      return;
    }

    currentLessonId = lesson.id;
    const state = LessonProgress.loadProgressState();
    const savedLesson = state.lessons[lesson.slug];
    if (savedLesson && Number.isInteger(savedLesson.currentSlide)) {
      currentSlideIndex = Math.min(Math.max(savedLesson.currentSlide, 0), validation.slides.length - 1);
    }

    populateLessonDropdown();
    bindPlayerEvents();
    updatePlayerHUD();
    loadLessonUI(currentLessonId, currentSlideIndex);
  }

  function showUnavailable(message) {
    const canvas = document.getElementById("slideCanvas");
    setText("headerLessonBadge", "Unavailable");
    setText("sidebarLessonCode", "Lesson unavailable");
    setText("sidebarLessonTitle", "Choose another lesson");
    if (canvas) {
      canvas.innerHTML = `
        <div class="lesson-error-card" role="status">
          <h2>Lesson unavailable</h2>
          <p>${escapeHTML(message)}</p>
          <a class="btn-primary" href="../index.html">Back to Lessons</a>
        </div>
      `;
    }
    ["prevSlideBtn", "nextSlideBtn", "lessonSelect"].forEach((id) => {
      const element = document.getElementById(id);
      if (element) element.disabled = true;
    });
    const list = document.getElementById("slidesList");
    if (list) list.replaceChildren();
    setText("slideCounterText", "Lesson unavailable");
    setText("progressPercentText", "0%");
    const fill = document.getElementById("progressFill");
    if (fill) fill.style.width = "0%";
  }

  function updatePlayerHUD() {
    const stats = LessonProgress.calculateGamificationStats();
    const xpElement = document.getElementById("playerXpText");
    const levelElement = document.getElementById("playerLevelText");
    if (xpElement) xpElement.textContent = `${stats.totalXp} XP`;
    if (levelElement) levelElement.textContent = `Lvl ${stats.level} • A1`;
  }

  function populateLessonDropdown() {
    const select = document.getElementById("lessonSelect");
    if (!select) return;
    select.innerHTML = LESSONS_DATA.map((lesson) =>
      `<option value="${lesson.id}" ${lesson.id === currentLessonId ? "selected" : ""}>${escapeHTML(lesson.code)}: ${escapeHTML(lesson.title)}</option>`
    ).join("");
    select.addEventListener("change", () => {
      switchLesson(Number(select.value));
    });
  }

  function switchLesson(newLessonId) {
    const validation = LessonProgress.validateLesson(newLessonId);
    if (!validation.valid) {
      showUnavailable(validation.message);
      return;
    }

    currentLessonId = validation.lesson.id;
    const state = LessonProgress.loadProgressState();
    const progress = state.lessons[validation.lesson.slug];
    currentSlideIndex = progress ? progress.currentSlide : 0;

    const url = new URL(window.location.href);
    url.searchParams.set("lesson", currentLessonId);
    window.history.replaceState({}, "", url);
    loadLessonUI(currentLessonId, currentSlideIndex);
  }

  function loadLessonUI(lessonId, slideIndex) {
    const validation = LessonProgress.validateLesson(lessonId);
    if (!validation.valid || !Number.isInteger(slideIndex) || !validation.slides[slideIndex]) {
      showUnavailable(validation.valid ? "This slide is unavailable. Choose another lesson." : validation.message);
      return;
    }

    currentLessonId = validation.lesson.id;
    currentSlideIndex = slideIndex;
    const visit = LessonProgress.recordSlideVisit(lessonId, slideIndex);
    if (!visit.ok) {
      showUnavailable(visit.message);
      return;
    }

    const lesson = validation.lesson;
    const slides = validation.slides;
    setText("headerLessonBadge", lesson.code);
    setText("sidebarLessonCode", lesson.code);
    setText("sidebarLessonTitle", lesson.title);

    const select = document.getElementById("lessonSelect");
    if (select) select.value = String(lesson.id);

    if (visit.xpAwarded) showXPPopup(5);
    updatePlayerHUD();
    renderSidebarSlides(slides, slideIndex);
    renderCurrentSlide(slides[slideIndex], lesson, slides.length);
    updateBottomControls(slideIndex, slides.length);
  }

  function renderSidebarSlides(slides, activeIndex) {
    const list = document.getElementById("slidesList");
    if (!list) return;
    const state = LessonProgress.loadProgressState();
    const lesson = LESSONS_DATA.find((item) => item.id === currentLessonId);
    if (!lesson) return;
    const progress = state.lessons[lesson.slug] || { visitedSlides: [] };
    const visited = new Set(progress.visitedSlides || []);

    list.innerHTML = slides.map((slide, index) => `
      <li>
        <button type="button" class="slide-nav-item ${index === activeIndex ? "active" : ""} ${visited.has(index) ? "visited" : ""}" data-slide-index="${index}">
          <span class="slide-num-dot">${index + 1}</span>
          <span class="slide-nav-title">${escapeHTML(slide.title || `Slide ${index + 1}`)}</span>
        </button>
      </li>
    `).join("");

    list.querySelectorAll(".slide-nav-item").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.slideIndex);
        loadLessonUI(currentLessonId, index);
        const sidebar = document.getElementById("slidesSidebar");
        if (sidebar) sidebar.classList.remove("open");
      });
    });
  }

  function getFirstRequiredSlide() {
    const validation = LessonProgress.validateLesson(currentLessonId);
    if (!validation.valid) return null;
    const state = LessonProgress.loadProgressState();
    const progress = state.lessons[validation.lesson.slug] || { visitedSlides: [] };
    const visited = new Set(progress.visitedSlides || []);
    const firstUnvisited = validation.slides.findIndex((slide, index) => !visited.has(index));
    if (firstUnvisited !== -1) return firstUnvisited;

    const activities = LessonProgress.getLessonActivities(currentLessonId) || [];
    const incomplete = activities.find((activity) => {
      const saved = state.activities[validation.lesson.slug] || {};
      return !saved[activity.id] || !saved[activity.id].completed;
    });
    return incomplete ? validation.slides.findIndex((slide) => slide.id === incomplete.id) : null;
  }

  function updateBottomControls(slideIndex, totalSlides) {
    const previous = document.getElementById("prevSlideBtn");
    const next = document.getElementById("nextSlideBtn");
    const nextText = document.getElementById("nextSlideBtnText");
    const counter = document.getElementById("slideCounterText");
    const percentage = document.getElementById("progressPercentText");
    const fill = document.getElementById("progressFill");
    if (!previous || !next || !nextText || !counter || !percentage || !fill) return;

    const state = LessonProgress.loadProgressState();
    const complete = LessonProgress.isLessonCompleted(currentLessonId, state);
    const isLast = slideIndex === totalSlides - 1;
    previous.disabled = slideIndex === 0;
    nextText.textContent = isLast
      ? complete
        ? currentLessonId < LESSONS_DATA.length ? "Next Lesson" : "Finish Course"
        : "Review Required Work"
      : "Next Slide";

    const progress = Math.round(((slideIndex + 1) / totalSlides) * 100);
    counter.textContent = `Slide ${slideIndex + 1} / ${totalSlides}`;
    percentage.textContent = `${progress}%`;
    fill.style.width = `${progress}%`;
    const track = document.getElementById("progressTrack");
    if (track) track.setAttribute("aria-valuenow", String(progress));
  }

  function bindPlayerEvents() {
    const previous = document.getElementById("prevSlideBtn");
    const next = document.getElementById("nextSlideBtn");
    if (previous) {
      previous.addEventListener("click", () => {
        if (currentSlideIndex > 0) loadLessonUI(currentLessonId, currentSlideIndex - 1);
      });
    }
    if (next) next.addEventListener("click", handleNext);

    document.addEventListener("keydown", (event) => {
      if (event.target.isContentEditable || ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(event.target.tagName)) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        if (next && !next.disabled) next.click();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (previous && !previous.disabled) previous.click();
      }
    });

    const viewport = document.getElementById("slideViewport");
    const zoomLabel = document.getElementById("zoomLevelText");
    const applyZoom = () => {
      if (viewport) viewport.style.transform = `scale(${zoomLevel / 100})`;
      if (zoomLabel) zoomLabel.textContent = `${zoomLevel}%`;
    };
    bindClick("zoomInBtn", () => { zoomLevel = Math.min(130, zoomLevel + 10); applyZoom(); });
    bindClick("zoomOutBtn", () => { zoomLevel = Math.max(70, zoomLevel - 10); applyZoom(); });
    bindClick("zoomResetBtn", () => { zoomLevel = 100; applyZoom(); });
    bindClick("toggleSidebarBtn", () => {
      const sidebar = document.getElementById("slidesSidebar");
      if (sidebar) sidebar.classList.toggle("open");
    });
    bindClick("closeSidebarBtn", () => {
      const sidebar = document.getElementById("slidesSidebar");
      if (sidebar) sidebar.classList.remove("open");
    });
    bindClick("closeReviewModal", closeReviewModal);
  }

  function handleNext() {
    const slides = SLIDES_BY_LESSON[currentLessonId] || [];
    if (currentSlideIndex < slides.length - 1) {
      loadLessonUI(currentLessonId, currentSlideIndex + 1);
      return;
    }

    const state = LessonProgress.loadProgressState();
    if (!LessonProgress.isLessonCompleted(currentLessonId, state)) {
      const requiredSlide = getFirstRequiredSlide();
      if (requiredSlide !== null) {
        loadLessonUI(currentLessonId, requiredSlide);
        return;
      }
      showAppNotice("Complete every lesson slide and activity before finishing.");
      return;
    }

    if (currentLessonId < LESSONS_DATA.length) switchLesson(currentLessonId + 1);
    else window.location.href = "../index.html";
  }

  function renderCurrentSlide(slide, lesson, totalSlides) {
    const canvas = document.getElementById("slideCanvas");
    if (!canvas || !slide) {
      showUnavailable("This slide is missing its content.");
      return;
    }
    canvas.style.animation = "none";
    void canvas.offsetWidth;
    canvas.style.animation = "slideEnter 0.25s ease";

    if (slide.type === "intro") {
      const introVisual = lesson.id === 5
        ? getLessonIllustrationSVG(lesson.illustrationKey)
        : `<div class="slide-intro-photo-wrap">${getLessonCardPhoto(lesson, true)}</div>`;
      canvas.innerHTML = `
        <div class="slide-header-bar">
          <span class="slide-tag">Slide 1 of ${totalSlides} • Lesson Intro</span>
          <button type="button" class="audio-btn" data-speak="${escapeAttr(lesson.title + ". " + lesson.intro)}">🔊 Listen</button>
        </div>
        <div class="cover-slide-layout">
          <div>
            <span class="badge-lime">🎮 ${escapeHTML(lesson.code)}</span>
            <h2>${escapeHTML(lesson.title)}</h2>
            <p class="slide-subtitle">${escapeHTML(lesson.intro)}</p>
            <ul class="cover-objectives">
              ${lesson.objectives.map((objective) => `<li><span class="check-dot">✓</span><span>${escapeHTML(objective)}</span></li>`).join("")}
            </ul>
          </div>
          <div class="intro-visual">${introVisual}</div>
        </div>
      `;
    } else if (slide.type === "vocabulary") {
      canvas.innerHTML = `
        <div class="slide-header-bar"><span class="slide-tag">Vocabulary</span><span>Click 🔊 to hear pronunciation</span></div>
        <h2 class="slide-title">${escapeHTML(slide.title)}</h2>
        <p class="slide-subtitle">${escapeHTML(slide.subtitle)}</p>
        <div class="vocab-grid">${slide.items.map((item) => `
          <div class="vocab-card">
            <div class="vocab-emoji">${escapeHTML(item.emoji)}</div>
            <div class="vocab-word">${escapeHTML(item.word)}</div>
            <div class="vocab-example">"${escapeHTML(item.example)}"</div>
            <button type="button" class="audio-btn" data-speak="${escapeAttr(item.word + ". " + item.example)}">🔊 Listen</button>
          </div>
        `).join("")}</div>
      `;
    } else if (slide.type === "dialogue" || slide.type === "imageDialogue") {
      renderDialogueSlide(canvas, slide);
    } else if (slide.type === "video") {
      renderVideoSlide(canvas, slide);
    } else if (slide.type === "grammar") {
      renderGrammarSlide(canvas, slide);
    } else if (slide.type === "activity") {
      LessonActivities.render(canvas, slide, currentLessonId);
    } else if (slide.type === "completion") {
      renderCompletionSlide(canvas, slide, lesson);
    } else {
      canvas.innerHTML = `<p class="feedback-banner error" role="status">This slide type is not available yet.</p>`;
    }

    bindAudioButtons(canvas);
    handleMissingMedia(canvas);
  }

  function renderDialogueSlide(canvas, slide) {
    const lines = Array.isArray(slide.lines) ? slide.lines : [];
    const dialogue = lines.map((line) => line.text).join(" ");
    const image = slide.imageUrl
      ? `<div class="dialogue-image-wrap"><img src="${escapeAttr(slide.imageUrl)}" alt="${escapeAttr(slide.title)}" /></div>`
      : "";
    canvas.innerHTML = `
      <div>
        <div class="slide-header-bar">
          <span class="slide-tag">${slide.imageUrl ? "Image Dialogue" : "Dialogue"}</span>
          ${dialogue ? `<button type="button" class="audio-btn" data-speak="${escapeAttr(dialogue)}">🔊 Listen All</button>` : ""}
        </div>
        <h2 class="slide-title">${escapeHTML(slide.title)}</h2>
        <p class="slide-subtitle">${escapeHTML(slide.subtitle || "")}</p>
        ${image}
        <div class="dialogue-list">
          ${lines.map((line, index) => `
            <div class="dialogue-row ${index % 2 ? "right" : ""}">
              <div class="speaker-avatar">${escapeHTML((line.speaker || "?")[0])}</div>
              <div class="speech-bubble">
                <div class="speech-speaker">${escapeHTML(line.speaker)}</div>
                <div class="speech-text">${escapeHTML(line.text)}</div>
                <button type="button" class="audio-btn" data-speak="${escapeAttr(line.text)}">🔊 Listen</button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  function renderVideoSlide(canvas, slide) {
    const lines = Array.isArray(slide.lines) ? slide.lines : [];
    canvas.innerHTML = `
      <div>
        <h2 class="slide-title">${escapeHTML(slide.title)}</h2>
        <p class="slide-subtitle">${escapeHTML(slide.subtitle || "")}</p>
        <video class="lesson-video" controls playsinline>
          <source src="${escapeAttr(slide.videoUrl || "")}" type="video/mp4" />
          Your browser does not support this video.
        </video>
        ${lines.length ? `<button type="button" class="btn-primary" id="openDialogueModalBtn">📖 Read Dialogue</button>` : ""}
      </div>
    `;
    bindClick("openDialogueModalBtn", () => openDialogueModal(slide.title, lines));
  }

  function renderGrammarSlide(canvas, slide) {
    if (!Array.isArray(slide.headers) || !Array.isArray(slide.rows)) {
      canvas.textContent = "This grammar slide is missing its table data.";
      return;
    }
    canvas.innerHTML = `
      <div>
        <div class="slide-header-bar"><span class="slide-tag">Grammar Focus</span><span class="badge-accent">A1 Rule</span></div>
        <h2 class="slide-title">${escapeHTML(slide.title)}</h2>
        <p class="slide-subtitle">${escapeHTML(slide.subtitle || "")}</p>
        <div class="grammar-table-wrap">
          <table class="grammar-table">
            <thead><tr>${slide.headers.map((header) => `<th>${escapeHTML(header)}</th>`).join("")}</tr></thead>
            <tbody>${slide.rows.map((row) => `
              <tr>${row.map((cell, index) => `<td data-label="${escapeAttr(slide.headers[index] || "")}">${index === 0 ? `<strong>${escapeHTML(cell)}</strong>` : escapeHTML(cell)}</td>`).join("")}</tr>
            `).join("")}</tbody>
          </table>
        </div>
        ${slide.tip ? `<div class="feedback-banner success">💡 Tip: ${escapeHTML(slide.tip)}</div>` : ""}
      </div>
    `;
  }

  function renderCompletionSlide(canvas, slide, lesson) {
    const state = LessonProgress.loadProgressState();
    const result = LessonProgress.getLessonResult(lesson.id);
    const complete = LessonProgress.isLessonCompleted(lesson.id, state);
    const nextLesson = LESSONS_DATA.find((item) => item.id === lesson.id + 1);
    const firstRequiredSlide = getFirstRequiredSlide();
    const pendingSlides = Math.max(0, result.total_slides - result.visited_slides.length);
    const pendingActivities = result.activities.filter((activity) => !activity.completed);

    canvas.innerHTML = `
      <div class="completion-card">
        <div class="trophy-circle">${complete ? "🏆" : "📚"}</div>
        <span class="${complete ? "badge-lime" : "badge-accent"}">${complete ? "Lesson Completed" : "Lesson in Progress"}</span>
        <h2>${escapeHTML(lesson.title)}${complete ? " Complete!" : ""}</h2>
        <div class="completion-stars">${renderStarsString(result.stars)}</div>
        <p class="completion-message">${escapeHTML(complete ? slide.message : "Complete every slide and activity to finish this lesson.")}</p>
        <div class="score-summary-pill">Score: ${result.score.correct} / ${result.score.total} (${result.score.percentage}%) · ${result.stars} / 3 stars</div>
        ${!complete ? `<p class="completion-requirements">${pendingSlides} slide(s) and ${pendingActivities.length} activity(ies) remaining.</p>` : ""}
        <div class="completion-actions">
          ${complete && nextLesson ? `<button type="button" class="btn-primary" id="goNextLessonBtn">Next Lesson: ${escapeHTML(nextLesson.title)} →</button>` : ""}
          ${complete && !nextLesson ? `<a href="../index.html" class="btn-primary">Back to Lessons</a>` : ""}
          ${!complete && firstRequiredSlide !== null ? `<button type="button" class="btn-primary" id="resumeRequiredWorkBtn">Continue Required Work</button>` : ""}
          <button type="button" class="btn-secondary" id="replayLessonBtn">${complete ? "Replay Lesson" : "Restart Lesson"}</button>
          <button type="button" class="btn-secondary" id="openMistakesBtn">Review Mistakes (${result.mistakes.length})</button>
        </div>
      </div>
    `;

    bindClick("goNextLessonBtn", () => switchLesson(lesson.id + 1));
    bindClick("resumeRequiredWorkBtn", () => loadLessonUI(lesson.id, firstRequiredSlide));
    bindClick("replayLessonBtn", () => {
      LessonProgress.resetLessonProgress(lesson.id);
      loadLessonUI(lesson.id, 0);
    });
    bindClick("openMistakesBtn", () => openMistakesModal(result.mistakes));
  }

  function updatePlayerHUD() {
    const stats = LessonProgress.calculateGamificationStats();
    const xpElement = document.getElementById("playerXpText");
    const levelElement = document.getElementById("playerLevelText");
    if (xpElement) xpElement.textContent = `${stats.totalXp} XP`;
    if (levelElement) levelElement.textContent = `Lvl ${stats.level} • A1`;
  }

  function openMistakesModal(mistakes) {
    const modal = document.getElementById("reviewModal");
    const body = document.getElementById("reviewModalBody");
    if (!modal || !body) return;
    body.replaceChildren();
    if (!mistakes.length) {
      const message = document.createElement("p");
      message.textContent = "Great job! There are no mistakes to review.";
      body.appendChild(message);
    } else {
      mistakes.forEach((mistake) => {
        const item = document.createElement("div");
        item.className = "mistake-item";
        const question = document.createElement("strong");
        question.textContent = mistake.question;
        const answer = document.createElement("div");
        answer.textContent = `Your answer: ${mistake.user_answer}`;
        const correct = document.createElement("div");
        correct.textContent = `Correct answer: ${mistake.correct_answer}`;
        item.append(question, answer, correct);
        body.appendChild(item);
      });
    }
    modal.classList.remove("hidden");
  }

  function openDialogueModal(title, lines) {
    const modal = document.getElementById("reviewModal");
    const modalTitle = modal && modal.querySelector(".modal-header h3");
    const body = document.getElementById("reviewModalBody");
    if (!modal || !modalTitle || !body) return;
    modalTitle.textContent = `${title} — Dialogue`;
    body.replaceChildren();
    lines.forEach((line) => {
      const row = document.createElement("div");
      row.className = "mistake-item";
      const speaker = document.createElement("strong");
      speaker.textContent = line.speaker;
      const text = document.createElement("p");
      text.textContent = line.text;
      const speak = document.createElement("button");
      speak.type = "button";
      speak.className = "audio-btn";
      speak.textContent = "🔊 Listen";
      speak.addEventListener("click", () => speakText(line.text, speak));
      row.append(speaker, text, speak);
      body.appendChild(row);
    });
    modal.classList.remove("hidden");
  }

  function closeReviewModal() {
    const modal = document.getElementById("reviewModal");
    if (modal) modal.classList.add("hidden");
  }

  function speakText(text, button) {
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      showAppNotice("Speech playback is not supported by this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.92;
    if (button) {
      button.classList.add("playing");
      utterance.onend = () => button.classList.remove("playing");
      utterance.onerror = () => button.classList.remove("playing");
    }
    window.speechSynthesis.speak(utterance);
  }

  function bindAudioButtons(container) {
    container.querySelectorAll("[data-speak]").forEach((button) => {
      button.addEventListener("click", () => speakText(button.getAttribute("data-speak"), button));
    });
  }

  function handleMissingMedia(container) {
    container.querySelectorAll("img").forEach((image) => {
      image.addEventListener("error", () => {
        image.alt = "Lesson image unavailable";
        image.classList.add("media-unavailable");
      }, { once: true });
    });
    container.querySelectorAll("video").forEach((video) => {
      video.addEventListener("error", () => {
        showAppNotice("The lesson video could not be loaded. You can continue to the next slide.");
      }, { once: true });
    });
  }

  function showXPPopup(amount) {
    const toast = document.getElementById("xpToast");
    if (!toast) return;
    toast.textContent = `+${amount} XP earned`;
    toast.classList.remove("hidden");
    window.setTimeout(() => toast.classList.add("hidden"), 1600);
  }

  function showAppNotice(message) {
    if (typeof global.showAppNotice === "function") global.showAppNotice(message);
  }

  function setText(id, text) {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
  }

  function bindClick(id, handler) {
    const element = document.getElementById(id);
    if (element) element.addEventListener("click", handler);
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function escapeAttr(value) {
    return escapeHTML(value);
  }

  global.LessonPlayer = Object.freeze({
    updateHUD: updatePlayerHUD,
    getCurrentLessonId: () => currentLessonId,
    speakText
  });
})(window);
