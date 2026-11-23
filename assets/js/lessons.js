const LESSONS_DATA = [
  {
    id: 1,
    code: "LESSON 01",
    slug: "greetings",
    title: "Greetings & Introductions",
    shortDesc: "Learn how to say hello, ask how someone is, and introduce yourself politely.",
    intro: "Welcome to your first EnGame English lesson! Learn everyday greetings, polite responses, and simple questions to introduce yourself to new friends.",
    xpReward: 100,
    level: "A1",
    estimatedTime: 10,
    objectives: [
      "Use common greetings for morning, afternoon, and evening.",
      "Ask and answer 'How are you?' naturally.",
      "Introduce your name, age, and country in simple sentences."
    ],
    illustrationKey: "greetings"
  },
  {
    id: 2,
    code: "LESSON 02",
    slug: "family",
    title: "Family",
    shortDesc: "Discover vocabulary for family members and talk about your relatives.",
    intro: "Family is an essential everyday topic in English. Learn the names of close and extended family members and practice describing your family with clear A1 sentences.",
    xpReward: 120,
    level: "A1",
    estimatedTime: 12,
    objectives: [
      "Identify nine key family members in English.",
      "Describe your family using 'This is my...' and 'I have...'.",
      "Understand short spoken descriptions of family members."
    ],
    illustrationKey: "family"
  },
  {
    id: 3,
    code: "LESSON 03",
    slug: "home",
    title: "Home & Daily Life",
    shortDesc: "Explore rooms in a house, home objects, and everyday daily routines.",
    intro: "Learn how to talk about where you live and what you do every day. Practice naming rooms, household furniture, daily actions, and basic time expressions.",
    xpReward: 140,
    level: "A1",
    estimatedTime: 14,
    objectives: [
      "Name common rooms and furniture inside a house.",
      "Describe your daily routine from morning to night.",
      "Use simple time expressions like 'at 7 o'clock' and 'in the morning'."
    ],
    illustrationKey: "home"
  },
  {
    id: 4,
    code: "LESSON 04",
    slug: "clothes",
    title: "Clothes",
    shortDesc: "Learn clothing vocabulary, colors, and how to say what people are wearing.",
    intro: "What are you wearing today? In this lesson, you will learn 10 essential clothing words, combine them with colors, and describe outfits.",
    xpReward: 120,
    level: "A1",
    estimatedTime: 12,
    objectives: [
      "Recognize and pronounce 10 everyday clothing items.",
      "Combine colors with clothes (e.g., 'a red T-shirt').",
      "Say what you and others are wearing using 'I'm wearing...'."
    ],
    illustrationKey: "clothes"
  },
  {
    id: 5,
    code: "LESSON 05",
    slug: "grammar",
    title: "Basic Grammar",
    shortDesc: "Master subject pronouns, the verb 'to be', positive/negative forms, and 'a / an'.",
    intro: "Build a strong foundation in English grammar. Learn how to connect subject pronouns with 'am, is, are', form negative sentences, and choose between 'a' and 'an'.",
    xpReward: 160,
    level: "A1",
    estimatedTime: 15,
    objectives: [
      "Use all seven subject pronouns (I, You, He, She, It, We, They).",
      "Conjugate the verb 'to be' in positive and negative sentences.",
      "Correctly use the articles 'a' and 'an' before nouns."
    ],
    illustrationKey: "grammar"
  }
];

function getLessonCardPhoto(lesson, isSubPage = false) {
  const prefix = isSubPage ? "../assets/images/" : "assets/images/";
  const photos = {
    greetings: `${prefix}card-lesson-01.jpg.jfif`,
    family: `${prefix}card-lesson-02.jpg.jfif`,
    home: `${prefix}card-lesson-03.jpg.jfif`,
    clothes: `${prefix}card-lesson-04.jpg.jfif`,
    grammar: `${prefix}card-lesson-05.jpg.jfif`
  };
  const src = photos[lesson.illustrationKey] || photos.greetings;
  return `<img src="${src}" alt="${lesson.title}" class="lesson-cover-photo" loading="lazy" />`;
}

function getLessonIllustrationSVG(key) {
  const svgs = {
    greetings: `
      <svg viewBox="0 0 260 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="18" y="16" width="224" height="128" rx="20" fill="#E8F7F4"/>
        <circle cx="82" cy="68" r="22" fill="#126E62"/>
        <path d="M52 132C52 112 65 98 82 98C99 98 112 112 112 132" fill="#19A991"/>
        <circle cx="178" cy="68" r="22" fill="#19A991"/>
        <path d="M148 132C148 112 161 98 178 98C195 98 208 112 208 132" fill="#126E62"/>
        <rect x="92" y="22" width="76" height="30" rx="15" fill="#B8FF4A"/>
        <text x="130" y="41" text-anchor="middle" fill="#201A2B" font-family="Poppins, sans-serif" font-weight="800" font-size="13">Hello! 👋</text>
      </svg>`,
    family: `
      <svg viewBox="0 0 260 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="18" y="16" width="224" height="128" rx="20" fill="#E8F7F4"/>
        <circle cx="72" cy="64" r="18" fill="#126E62"/>
        <path d="M48 130C48 112 58 98 72 98C86 98 96 112 96 130" fill="#19A991"/>
        <circle cx="188" cy="64" r="18" fill="#19A991"/>
        <path d="M164 130C164 112 174 98 188 98C202 98 212 112 212 130" fill="#126E62"/>
        <circle cx="130" cy="80" r="14" fill="#B8FF4A"/>
        <path d="M110 130C110 116 118 106 130 106C142 106 150 116 150 130" fill="#49BFAE"/>
        <path d="M130 30L135 41L147 41L137 48L141 59L130 52L119 59L123 48L113 41L125 41Z" fill="#B8FF4A" stroke="#126E62" stroke-width="1.5"/>
      </svg>`,
    home: `
      <svg viewBox="0 0 260 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="18" y="16" width="224" height="128" rx="20" fill="#E8F7F4"/>
        <polygon points="130,26 64,76 196,76" fill="#19A991"/>
        <rect x="80" y="76" width="100" height="60" rx="8" fill="#FFFFFF" stroke="#126E62" stroke-width="3"/>
        <rect x="118" y="98" width="24" height="38" rx="4" fill="#126E62"/>
        <rect x="90" y="90" width="18" height="18" rx="4" fill="#B8FF4A"/>
        <rect x="152" y="90" width="18" height="18" rx="4" fill="#B8FF4A"/>
      </svg>`,
    clothes: `
      <svg viewBox="0 0 260 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="18" y="16" width="224" height="128" rx="20" fill="#E8F7F4"/>
        <path d="M74 46L98 34H122L146 46L134 68L122 62V124H98V62L86 68L74 46Z" fill="#19A991"/>
        <path d="M154 54H186L194 124H146L154 54Z" fill="#B8FF4A" stroke="#126E62" stroke-width="2"/>
        <circle cx="110" cy="42" r="7" fill="#DFFF9A"/>
      </svg>`,
    grammar: `
      <svg viewBox="0 0 260 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="18" y="16" width="224" height="128" rx="20" fill="#E8F7F4"/>
        <rect x="44" y="36" width="52" height="34" rx="10" fill="#126E62"/>
        <text x="70" y="57" text-anchor="middle" fill="#FFFFFF" font-family="Poppins, sans-serif" font-weight="800" font-size="13">I / She</text>
        <rect x="104" y="36" width="52" height="34" rx="10" fill="#19A991"/>
        <text x="130" y="57" text-anchor="middle" fill="#201A2B" font-family="Poppins, sans-serif" font-weight="800" font-size="13">am / is</text>
        <rect x="164" y="36" width="52" height="34" rx="10" fill="#B8FF4A"/>
        <text x="190" y="57" text-anchor="middle" fill="#201A2B" font-family="Poppins, sans-serif" font-weight="800" font-size="13">a / an</text>
        <rect x="60" y="86" width="140" height="36" rx="12" fill="#FFFFFF" stroke="#19A991" stroke-width="2"/>
        <text x="130" y="109" text-anchor="middle" fill="#126E62" font-family="Poppins, sans-serif" font-weight="800" font-size="13">I am happy. ⚡</text>
      </svg>`
  };
  return svgs[key] || svgs.greetings;
}

function renderStarsString(stars) {
  const filled = "★".repeat(stars);
  const empty = "☆".repeat(3 - stars);
  return filled + empty;
}

function showAppNotice(message) {
  const notice = document.getElementById("appNotice");
  if (!notice || !message) return;
  notice.textContent = message;
  notice.classList.remove("hidden");
}

document.addEventListener("lesson-progress-notice", (event) => {
  showAppNotice(event.detail);
});

function updateHeaderHUD() {
  const stats = LessonProgress.calculateGamificationStats();
  const xpEl = document.getElementById("headerXpText");
  const lvlEl = document.getElementById("headerLevelText");
  if (xpEl) xpEl.textContent = `${stats.totalXp} XP`;
  if (lvlEl) lvlEl.textContent = `Lvl ${stats.level} • A1`;
}
function initThemeToggle() {
  if (typeof window.matchMedia !== "function") return;
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const applySystemTheme = (isDark) => {
    if (isDark) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  };

  applySystemTheme(mediaQuery.matches);
  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", (e) => applySystemTheme(e.matches));
  } else if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener((e) => applySystemTheme(e.matches));
  }
}

function initFullscreenToggle() {
  const btn = document.getElementById("fullscreenBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      if (typeof document.documentElement.requestFullscreen !== "function") {
        showAppNotice("Fullscreen is not supported by this browser.");
        return;
      }
      document.documentElement.requestFullscreen().catch(() => {
        showAppNotice("Fullscreen could not be enabled.");
      });
    } else {
      if (typeof document.exitFullscreen !== "function") {
        showAppNotice("Fullscreen could not be closed.");
        return;
      }
      document.exitFullscreen().catch(() => {
        showAppNotice("Fullscreen could not be closed.");
      });
    }
  });
}

function renderAchievementsStrip(stats) {
  const strip = document.getElementById("achievementsStrip");
  if (!strip) return;

  const achievements = [
    {
      icon: "🚀",
      title: "First Step",
      desc: "Start your A1 English journey",
      unlocked: stats.totalXp >= 10 || stats.completedCount >= 1
    },
    {
      icon: "⚡",
      title: "XP Collector",
      desc: "Reach 150 XP & Level 2",
      unlocked: stats.totalXp >= 150
    },
    {
      icon: "⭐",
      title: "Star Learner",
      desc: "Earn 6+ lesson stars",
      unlocked: stats.totalStars >= 6
    },
    {
      icon: "👑",
      title: "A1 Graduate",
      desc: "Complete all 5 A1 lessons",
      unlocked: stats.completedCount >= 5
    }
  ];

  strip.innerHTML = achievements
    .map(
      (a) => `
      <div class="achievement-badge ${a.unlocked ? "unlocked" : ""}">
        <div class="ach-icon">${a.icon}</div>
        <div class="ach-info">
          <strong>${a.title} ${a.unlocked ? "✓" : ""}</strong>
          <span>${a.desc}</span>
        </div>
      </div>`
    )
    .join("");
}

function renderLessonsGrid() {
  const grid = document.getElementById("lessonsGrid");
  if (!grid) return;

  const state = LessonProgress.loadProgressState();
  const stats = LessonProgress.calculateGamificationStats(state);

  renderAchievementsStrip(stats);

  grid.innerHTML = LESSONS_DATA.map((lesson) => {
    const lessonProg = state.lessons[lesson.slug] || {};
    const metadata = LessonProgress.getLessonMetadata(lesson.id);
    const isDone = LessonProgress.isLessonCompleted(lesson.id, state);
    const currentSlide = lessonProg.currentSlide || 0;
    const stars = LessonProgress.calculateStars(
      LessonProgress.calculateLessonScore(lesson.id, state),
      isDone
    );

    let statusBadge = `<span class="lesson-status-tag status-new">Ready</span>`;
    let btnLabel = "Start Lesson";

    if (isDone) {
      statusBadge = `<span class="lesson-status-tag status-completed">Completed ✓</span>`;
      btnLabel = "Replay Lesson";
    } else if (lessonProg.startedAt) {
      statusBadge = `<span class="lesson-status-tag status-inprogress">Slide ${currentSlide + 1} / ${metadata.total_slides}</span>`;
      btnLabel = "Continue Lesson";
    }

    return `
      <article class="lesson-card">
        <div>
          <div class="lesson-card-top">
            <span class="lesson-num-badge">${lesson.code}</span>
            <span class="lesson-stars" title="${stars} / 3 Stars">${renderStarsString(stars)}</span>
            ${statusBadge}
          </div>
          <div class="lesson-illustration-box">
            ${getLessonCardPhoto(lesson, false)}
          </div>
          <h3>${lesson.title}</h3>
          <p>${lesson.shortDesc}</p>
        </div>
        <div>
          <div class="lesson-card-meta">
            <span class="slides-pill">📑 ${metadata.total_slides} Slides</span>
            <span>⏱ ${lesson.estimatedTime} mins</span>
          </div>
          <a href="pages/lesson.html?lesson=${lesson.id}" class="btn-primary">
            <span>${btnLabel}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </a>
        </div>
      </article>
    `;
  }).join("");

  updateHeaderHUD();
  const completedEl = document.getElementById("completedCount");
  const starsEl = document.getElementById("bannerStarsCount");
  const bannerXpEl = document.getElementById("bannerXpCount");
  const overallText = document.getElementById("overallProgressText");

  if (completedEl) completedEl.textContent = `${stats.completedCount}/${LESSONS_DATA.length}`;
  if (starsEl) starsEl.textContent = `${stats.totalStars} ★`;
  if (bannerXpEl) bannerXpEl.textContent = `${stats.totalXp} XP`;
  if (overallText) overallText.textContent = `${stats.completedCount} / ${LESSONS_DATA.length} Done`;
}

function renderLessonIntroduction() {
  const container = document.getElementById("lessonIntroContainer");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const lessonParam = params.get("lesson");
  const lesson = LESSONS_DATA.find((item) =>
    String(item.id) === lessonParam || item.slug === lessonParam
  );
  if (!lesson || !LessonProgress.validateLesson(lesson.id).valid) {
    container.innerHTML = `
      <section class="lesson-intro-card lesson-error-card" role="status">
        <div class="lesson-intro-content">
          <h2>Lesson unavailable</h2>
          <p class="lesson-intro-desc">This lesson link is missing or invalid. Choose an available lesson to continue.</p>
          <a href="../index.html" class="btn-primary">Back to Lessons</a>
        </div>
      </section>
    `;
    return;
  }

  const state = LessonProgress.loadProgressState();
  const saved = state.lessons[lesson.slug] || {};
  const metadata = LessonProgress.getLessonMetadata(lesson.id);
  const completed = LessonProgress.isLessonCompleted(lesson.id, state);
  const stars = LessonProgress.calculateStars(
    LessonProgress.calculateLessonScore(lesson.id, state),
    completed
  );

  const objectivesHTML = lesson.objectives
    .map((obj) => `<li><span class="check-dot">✓</span><span>${obj}</span></li>`)
    .join("");

  const startText = saved.startedAt && !completed
    ? `Continue Learning (Slide ${saved.currentSlide + 1})`
    : completed ? "Replay Lesson" : "Start Learning";

  container.innerHTML = `
    <div class="lesson-intro-card">
      <div class="lesson-intro-content">
        <div>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <span class="badge-accent">${lesson.code} • ${lesson.level}</span>
            <span class="lesson-stars">${renderStarsString(stars)}</span>
          </div>
          <h2>${lesson.title}</h2>
          <p class="lesson-intro-desc">${lesson.intro}</p>

          <div class="objectives-box">
            <h3>Lesson Objectives</h3>
            <ul class="objectives-list">
              ${objectivesHTML}
            </ul>
          </div>
        </div>

        <div class="intro-actions">
          <a href="learning.html?lesson=${lesson.id}" class="btn-primary">
            <span>${startText}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </a>
          <a href="../index.html" class="btn-secondary">Back to Lessons</a>
        </div>
      </div>

      <div class="lesson-intro-visual">
        ${getLessonCardPhoto(lesson, true)}
        <div class="visual-meta-pills">
          <span class="visual-pill">📑 ${metadata.total_slides} Slides</span>
          <span class="visual-pill">⏱ ${lesson.estimatedTime} mins</span>
        </div>
      </div>
    </div>
  `;
}