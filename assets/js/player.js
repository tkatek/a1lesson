let currentLessonId = 1;
let currentSlideIndex = 0;
let zoomLevel = 100;

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initFullscreenToggle();

  const params = new URLSearchParams(window.location.search);
  const requestedLesson = parseInt(params.get("lesson"), 10);
  if (requestedLesson && SLIDES_BY_LESSON[requestedLesson]) {
    currentLessonId = requestedLesson;
  }

  const state = loadProgressState();
  const savedLesson = state.lessons[currentLessonId];
  if (savedLesson && typeof savedLesson.currentSlide === "number") {
    const maxIdx = SLIDES_BY_LESSON[currentLessonId].length - 1;
    currentSlideIndex = Math.min(Math.max(0, savedLesson.currentSlide), maxIdx);
  }

  populateLessonDropdown();
  bindPlayerEvents();
  updatePlayerHUD();
  loadLessonUI(currentLessonId, currentSlideIndex, false);
});

function updatePlayerHUD() {
  const state = loadProgressState();
  const stats = calculateGamificationStats(state);
  const xpEl = document.getElementById("playerXpText");
  const lvlEl = document.getElementById("playerLevelText");
  if (xpEl) xpEl.textContent = `${stats.totalXp} XP`;
  if (lvlEl) lvlEl.textContent = `Lvl ${stats.level} • A1`;
}

function awardXP(amount, reasonText) {
  const state = loadProgressState();
  state.xp = (state.xp || 0) + amount;
  saveProgressState(state);
  updatePlayerHUD();
}

function populateLessonDropdown() {
  const select = document.getElementById("lessonSelect");
  if (!select) return;
  select.innerHTML = LESSONS_DATA.map(
    (l) => `<option value="${l.id}" ${l.id === currentLessonId ? "selected" : ""}>${l.code}: ${l.title}</option>`
  ).join("");

  select.addEventListener("change", (e) => {
    const newId = parseInt(e.target.value, 10);
    switchLesson(newId);
  });
}

function switchLesson(newLessonId) {
  currentLessonId = newLessonId;
  const state = loadProgressState();
  const saved = state.lessons[newLessonId];
  currentSlideIndex = saved && !saved.completed ? (saved.currentSlide || 0) : 0;

  const url = new URL(window.location);
  url.searchParams.set("lesson", newLessonId);
  window.history.replaceState({}, "", url);

  loadLessonUI(currentLessonId, currentSlideIndex, false);
}

function loadLessonUI(lessonId, slideIdx, grantSlideXP = false) {
  const lessonMeta = LESSONS_DATA.find((l) => l.id === lessonId) || LESSONS_DATA[0];
  const slides = SLIDES_BY_LESSON[lessonId] || [];

  document.getElementById("headerLessonBadge").textContent = lessonMeta.code;
  document.getElementById("sidebarLessonCode").textContent = lessonMeta.code;
  document.getElementById("sidebarLessonTitle").textContent = lessonMeta.title;

  const select = document.getElementById("lessonSelect");
  if (select) select.value = lessonId;

  currentSlideIndex = slideIdx;
  saveSlideProgress(lessonId, slideIdx, slides.length, grantSlideXP);
  renderSidebarSlides(slides, slideIdx);
  renderCurrentSlide(slides[slideIdx], lessonMeta, slides.length);
  updateBottomControls(slideIdx, slides.length);
}

function saveSlideProgress(lessonId, slideIdx, totalSlides, grantSlideXP) {
  const state = loadProgressState();
  if (!state.lessons[lessonId]) {
    state.lessons[lessonId] = { currentSlide: 0, visited: [], completed: false };
  }
  const entry = state.lessons[lessonId];
  entry.currentSlide = slideIdx;

  const isFirstVisit = !entry.visited.includes(slideIdx);
  if (isFirstVisit) {
    entry.visited.push(slideIdx);
  }

  let xpAdded = 0;
  let toastMsg = "";

  if (grantSlideXP && isFirstVisit) {
    xpAdded += 5;
    toastMsg = "Slide Completed";
  }

  if (slideIdx === totalSlides - 1 && !entry.completed) {
    entry.completed = true;
    const lessonMeta = LESSONS_DATA.find((l) => l.id === lessonId);
    xpAdded += lessonMeta ? lessonMeta.xpReward : 50;
    toastMsg = "Lesson Complete!";
  }

  saveProgressState(state);

  if (xpAdded > 0) {
    awardXP(xpAdded, toastMsg);
  } else {
    updatePlayerHUD();
  }
}

function renderSidebarSlides(slides, activeIdx) {
  const list = document.getElementById("slidesList");
  const state = loadProgressState();
  const visited = (state.lessons[currentLessonId] && state.lessons[currentLessonId].visited) || [];

  list.innerHTML = slides
    .map((slide, idx) => {
      const isActive = idx === activeIdx;
      const isVisited = visited.includes(idx);
      return `
        <li>
          <button class="slide-nav-item ${isActive ? "active" : ""} ${isVisited ? "visited" : ""}" data-slide-idx="${idx}">
            <span class="slide-num-dot">${idx + 1}</span>
            <span class="slide-nav-title">${slide.title}</span>
          </button>
        </li>
      `;
    })
    .join("");

  list.querySelectorAll(".slide-nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-slide-idx"), 10);
      loadLessonUI(currentLessonId, idx, true);
      document.getElementById("slidesSidebar").classList.remove("open");
    });
  });
}

function updateBottomControls(slideIdx, totalSlides) {
  const prevBtn = document.getElementById("prevSlideBtn");
  const nextBtn = document.getElementById("nextSlideBtn");
  const nextBtnText = document.getElementById("nextSlideBtnText");
  const counterText = document.getElementById("slideCounterText");
  const percentText = document.getElementById("progressPercentText");
  const progressFill = document.getElementById("progressFill");

  prevBtn.disabled = slideIdx === 0;

  if (slideIdx === totalSlides - 1) {
    nextBtnText.textContent = currentLessonId < LESSONS_DATA.length ? "Next Lesson" : "Finish Course";
  } else {
    nextBtnText.textContent = "Next Slide";
  }

  const pct = Math.round(((slideIdx + 1) / totalSlides) * 100);
  counterText.textContent = `Slide ${slideIdx + 1} / ${totalSlides}`;
  percentText.textContent = `${pct}%`;
  progressFill.style.width = `${pct}%`;
}

function bindPlayerEvents() {
  document.getElementById("prevSlideBtn").addEventListener("click", () => {
    if (currentSlideIndex > 0) {
      loadLessonUI(currentLessonId, currentSlideIndex - 1, false);
    }
  });

  document.getElementById("nextSlideBtn").addEventListener("click", () => {
    const slides = SLIDES_BY_LESSON[currentLessonId] || [];
    if (currentSlideIndex < slides.length - 1) {
      loadLessonUI(currentLessonId, currentSlideIndex + 1, true);
    } else if (currentLessonId < LESSONS_DATA.length) {
      switchLesson(currentLessonId + 1);
    } else {
      window.location.href = "../index.html";
    }
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
    if (e.key === "ArrowRight") {
      document.getElementById("nextSlideBtn").click();
    } else if (e.key === "ArrowLeft") {
      document.getElementById("prevSlideBtn").click();
    }
  });

  // Zoom Controls
  const viewport = document.getElementById("slideViewport");
  const zoomLabel = document.getElementById("zoomLevelText");
  const applyZoom = () => {
    viewport.style.transform = `scale(${zoomLevel / 100})`;
    zoomLabel.textContent = `${zoomLevel}%`;
  };

  document.getElementById("zoomInBtn").addEventListener("click", () => {
    zoomLevel = Math.min(130, zoomLevel + 10);
    applyZoom();
  });

  document.getElementById("zoomOutBtn").addEventListener("click", () => {
    zoomLevel = Math.max(70, zoomLevel - 10);
    applyZoom();
  });

  document.getElementById("zoomResetBtn").addEventListener("click", () => {
    zoomLevel = 100;
    applyZoom();
  });

  // Mobile sidebar drawer
  const sidebar = document.getElementById("slidesSidebar");
  document.getElementById("toggleSidebarBtn").addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });
  document.getElementById("closeSidebarBtn").addEventListener("click", () => {
    sidebar.classList.remove("open");
  });

  // Review mistakes modal
  document.getElementById("closeReviewModal").addEventListener("click", () => {
    document.getElementById("reviewModal").classList.add("hidden");
  });
}

function speakText(text, btnEl) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.92;

  if (btnEl) {
    btnEl.classList.add("playing");
    utterance.onend = () => btnEl.classList.remove("playing");
    utterance.onerror = () => btnEl.classList.remove("playing");
  }
  window.speechSynthesis.speak(utterance);
}

function openDialogueModal(title, dialogueLines) {
  const modal = document.getElementById("reviewModal");
  const modalTitle = modal.querySelector(".modal-header h3");
  const body = document.getElementById("reviewModalBody");

  modalTitle.textContent = `📖 ${title} — Dialogue`;
  body.innerHTML = `
    <div class="dialogue-list" style="display:flex;flex-direction:column;gap:8px;">
      ${dialogueLines
        .map(
          (line, idx) => `
        <div class="dialogue-row ${idx % 2 === 1 ? "right" : ""}" style="gap:8px;align-items:center;">
          <div class="speaker-avatar" style="width:28px;height:28px;font-size:0.8rem;flex-shrink:0;">${line.speaker[0]}</div>
          <div class="speech-bubble" style="max-width:85%;padding:7px 12px;display:flex;align-items:center;justify-content:space-between;gap:10px;">
            <div>
              <div class="speech-speaker" style="font-size:0.74rem;margin-bottom:2px;">${line.speaker}</div>
              <div class="speech-text" style="font-size:0.88rem;line-height:1.25;">${line.text}</div>
            </div>
            <button class="audio-btn modal-speak-btn" style="padding:4px 9px;font-size:0.75rem;flex-shrink:0;" data-speak="${escapeAttr(line.text)}">🔊</button>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;

  body.querySelectorAll(".modal-speak-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      speakText(btn.getAttribute("data-speak"), btn);
    });
  });

  modal.classList.remove("hidden");
}

function renderCurrentSlide(slide, lessonMeta, totalSlides) {
  const canvas = document.getElementById("slideCanvas");
  canvas.style.animation = "none";
  void canvas.offsetWidth;
  canvas.style.animation = "slideEnter 0.25s ease";

  if (slide.type === "intro") {
    const introVisual =
      lessonMeta.id === 5
        ? getLessonIllustrationSVG(lessonMeta.illustrationKey)
        : `<div class="slide-intro-photo-wrap" style="border-radius:20px;overflow:hidden;box-shadow:var(--shadow-md);aspect-ratio:16/10;max-width:360px;margin:0 auto;">
             ${getLessonCardPhoto(lessonMeta, true)}
           </div>`;

    canvas.innerHTML = `
      <div class="slide-header-bar">
        <span class="slide-tag">Slide 1 of ${totalSlides} • Lesson Intro</span>
        <button class="audio-btn" data-speak="${escapeAttr(lessonMeta.title + ". " + lessonMeta.intro)}">🔊 Listen</button>
      </div>
      <div class="cover-slide-layout">
        <div>
          <span class="badge-lime">🎮 ${lessonMeta.code}</span>
          <h2>${lessonMeta.title}</h2>
          <p class="slide-subtitle">${lessonMeta.intro}</p>
          <ul class="cover-objectives">
            ${lessonMeta.objectives.map((o) => `<li><span class="check-dot">✓</span><span>${o}</span></li>`).join("")}
          </ul>
        </div>
        <div style="text-align:center;">
          ${introVisual}
        </div>
      </div>
      <div></div>
    `;
  } else if (slide.type === "vocabulary") {
    canvas.innerHTML = `
      <div>
        <div class="slide-header-bar">
          <span class="slide-tag">Vocabulary</span>
          <span style="font-size:0.82rem;color:var(--text-muted);font-weight:700;">Click 🔊 to hear pronunciation</span>
        </div>
        <h2 class="slide-title">${slide.title}</h2>
        <p class="slide-subtitle">${slide.subtitle}</p>
        <div class="vocab-grid">
          ${slide.items
            .map(
              (item) => `
            <div class="vocab-card">
              <div class="vocab-emoji">${item.emoji}</div>
              <div class="vocab-word">${item.word}</div>
              <div class="vocab-example">"${item.example}"</div>
              <button class="audio-btn" data-speak="${escapeAttr(item.word + ". " + item.example)}">🔊 Listen</button>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
      <div></div>
    `;
  } else if (slide.type === "dialogue") {
    const dialogueLines = slide.lines || [];
    const fullDialogue = dialogueLines.map((l) => l.text).join(" ");
    canvas.innerHTML = `
      <div>
        <div class="slide-header-bar" style="margin-bottom:4px;">
          <span class="slide-tag">💬 Dialogue</span>
          ${
            fullDialogue
              ? `<button class="audio-btn" style="padding:5px 12px;font-size:0.8rem;" data-speak="${escapeAttr(fullDialogue)}">🔊 Listen All</button>`
              : ``
          }
        </div>
        <h2 class="slide-title" style="font-size:1.35rem;margin-bottom:2px;">${slide.title}</h2>
        <p class="slide-subtitle" style="font-size:0.86rem;margin-bottom:10px;">${slide.subtitle}</p>
        <div class="dialogue-list" style="display:flex;flex-direction:column;gap:6px;max-width:740px;margin:0 auto;">
          ${dialogueLines
            .map(
              (line, idx) => `
            <div class="dialogue-row ${idx % 2 === 1 ? "right" : ""}" style="gap:8px;align-items:center;">
              <div class="speaker-avatar" style="width:28px;height:28px;font-size:0.8rem;flex-shrink:0;">${line.speaker[0]}</div>
              <div class="speech-bubble" style="padding:6px 12px;max-width:78%;display:flex;align-items:center;justify-content:space-between;gap:12px;">
                <div>
                  <div class="speech-speaker" style="font-size:0.74rem;margin-bottom:1px;">${line.speaker}</div>
                  <div class="speech-text" style="font-size:0.88rem;line-height:1.25;">${line.text}</div>
                </div>
                <button class="audio-btn" style="padding:4px 9px;font-size:0.75rem;flex-shrink:0;" data-speak="${escapeAttr(line.text)}">🔊 Listen</button>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
      <div></div>
    `;
  } else if (slide.type === "imageDialogue") {
    const dialogueLines = slide.lines || [];
    const fullAudio = dialogueLines.map((l) => l.text).join(" ");
    canvas.innerHTML = `
      <div>
        <h2 class="slide-title">${slide.title}</h2>
        <p class="slide-subtitle">${slide.subtitle}</p>
        <div style="width:fit-content;max-width:100%;margin:20px auto;border-radius:18px;overflow:hidden;border:2px solid var(--border-color);box-shadow:var(--shadow-md);line-height:0;">
          <img src="${slide.imageUrl}" alt="${escapeAttr(slide.title)}" style="width:auto;max-width:100%;height:auto;max-height:53vh;object-fit:contain;display:block;" />
        </div>
        <div style="margin-top:18px;display:flex;justify-content:center;align-items:center;gap:18px;flex-wrap:wrap;">
          ${
            fullAudio
              ? `<button class="audio-btn" id="playSceneAudioBtn" data-speak="${escapeAttr(fullAudio)}" style="padding:10px 20px;font-size:0.95rem;">🔊 Listen to Scene</button>`
              : ""
          }
          ${
            dialogueLines.length
              ? `<button class="btn-primary" id="openDialogueModalBtn" style="padding:10px 22px;font-size:0.95rem;">📖 Read Dialogue</button>`
              : ""
          }
        </div>
      </div>
      <div></div>
    `;

    const openDialogueBtn = document.getElementById("openDialogueModalBtn");
    if (openDialogueBtn) {
      openDialogueBtn.addEventListener("click", () => {
        openDialogueModal(slide.title, dialogueLines);
      });
    }
  } else if (slide.type === "video") {
    const dialogueLines = slide.lines || (slide.transcript ? [{ speaker: "Dialogue", text: slide.transcript }] : []);
    canvas.innerHTML = `
      <div>
        <h2 class="slide-title">${slide.title}</h2>
        <p class="slide-subtitle">${slide.subtitle}</p>
        <div style="border-radius:18px;overflow:hidden;border:2px solid var(--border-color);background:#000;box-shadow:var(--shadow-md);">
          <video controls playsinline style="width:100%;max-height:270px;display:block;transform:scale(1.12);transform-origin:center center;" poster="${slide.poster || ''}">
            <source src="${slide.videoUrl}" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        ${
          dialogueLines.length
            ? `<div style="margin-top:14px;display:flex;justify-content:center;">
                <button class="btn-primary" id="openDialogueModalBtn" style="padding:10px 22px;font-size:0.95rem;">📖 Read Dialogue</button>
              </div>`
            : ""
        }
      </div>
      <div></div>
    `;

    const openDialogueBtn = document.getElementById("openDialogueModalBtn");
    if (openDialogueBtn) {
      openDialogueBtn.addEventListener("click", () => {
        openDialogueModal(slide.title, dialogueLines);
      });
    }
  } else if (slide.type === "grammar") {
    canvas.innerHTML = `
      <div>
        <div class="slide-header-bar">
          <span class="slide-tag">Grammar Focus</span>
          <span class="badge-accent">A1 Rule</span>
        </div>
        <h2 class="slide-title">${slide.title}</h2>
        <p class="slide-subtitle">${slide.subtitle}</p>
        <table class="grammar-table">
          <thead>
            <tr>
              ${slide.headers.map((h) => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${slide.rows
              .map(
                (row) => `
              <tr>
                ${row.map((cell, cIdx) => `<td data-label="${escapeAttr(slide.headers[cIdx])}">${cIdx === 0 ? `<strong>${cell}</strong>` : cell}</td>`).join("")}
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        ${slide.tip ? `<div class="feedback-banner success">💡 Tip: ${slide.tip}</div>` : ""}
      </div>
      <div></div>
    `;
  } else if (slide.type === "activity") {
    renderActivitySlide(canvas, slide, currentLessonId);
  } else if (slide.type === "completion") {
    renderCompletionSlide(canvas, slide, lessonMeta);
  }

  // Bind audio buttons on the rendered slide
  canvas.querySelectorAll("[data-speak]").forEach((btn) => {
    btn.addEventListener("click", () => {
      speakText(btn.getAttribute("data-speak"), btn);
    });
  });
}

function renderCompletionSlide(canvas, slide, lessonMeta) {
  const state = loadProgressState();
  const stats = calculateGamificationStats(state);
  const score = state.scores[lessonMeta.id] || { correct: 0, total: 0 };
  const mistakes = state.mistakes[lessonMeta.id] || [];
  const stars = getLessonStars(lessonMeta.id, state);
  const nextLesson = LESSONS_DATA.find((l) => l.id === lessonMeta.id + 1);

  canvas.innerHTML = `
    <div class="completion-card">
      <div class="trophy-circle">🏆</div>
      <span class="badge-lime">Lesson Completed</span>
      <h2 style="font-size:1.95rem;color:var(--deep-purple);">${lessonMeta.title} Complete!</h2>
      <div style="font-size:1.65rem;color:#F59E0B;letter-spacing:4px;">${renderStarsString(stars)}</div>
      <p style="color:var(--text-muted);max-width:520px;">${slide.message}</p>

      <div class="score-summary-pill">
        Level ${stats.level} &nbsp;|&nbsp; Practice Score: ${score.correct} / ${score.total}
      </div>

      <div class="completion-actions">
        ${
          nextLesson
            ? `<button class="btn-primary" id="goNextLessonBtn">Next Lesson: ${nextLesson.title} →</button>`
            : `<a href="../index.html" class="btn-primary">All Lessons Completed! Back to Hub</a>`
        }
        <button class="btn-secondary" id="replayLessonBtn">Replay Lesson</button>
        <button class="btn-secondary" id="openMistakesBtn">Review Mistakes (${mistakes.length})</button>
      </div>
    </div>
  `;

  const nextBtn = document.getElementById("goNextLessonBtn");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => switchLesson(lessonMeta.id + 1));
  }

  document.getElementById("replayLessonBtn").addEventListener("click", () => {
    const st = loadProgressState();
    st.lessons[lessonMeta.id] = { currentSlide: 0, visited: [0], completed: false };
    st.scores[lessonMeta.id] = { correct: 0, total: 0 };
    st.mistakes[lessonMeta.id] = [];
    saveProgressState(st);
    loadLessonUI(lessonMeta.id, 0, false);
  });

  document.getElementById("openMistakesBtn").addEventListener("click", () => {
    const modal = document.getElementById("reviewModal");
    const body = document.getElementById("reviewModalBody");
    if (mistakes.length === 0) {
      body.innerHTML = `<p style="color:var(--green-success);font-weight:800;">🎉 Great job! You have zero mistakes recorded in this lesson.</p>`;
    } else {
      body.innerHTML = mistakes
        .map(
          (m) => `
        <div class="mistake-item">
          <div style="font-weight:800;margin-bottom:4px;">${m.prompt}</div>
          <div style="font-size:0.86rem;color:var(--red-accent);">Your answer: ${m.userAnswer}</div>
          <div style="font-size:0.86rem;color:var(--green-success);font-weight:800;">Correct answer: ${m.correctAnswer}</div>
        </div>
      `
        )
        .join("");
    }
    modal.classList.remove("hidden");
  });
}

function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}