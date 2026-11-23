(function (global) {
  "use strict";

  const STORAGE_KEY = "a1_english_lessons_progress_v2";
  const LEGACY_STORAGE_KEY = "a1_english_lessons_progress_v1";
  const ACTIVITY_TYPES = {
    mcq: "multiple_choice",
    listening: "listening",
    matching: "matching",
    fillBlank: "fill_blank",
    sentenceBuilder: "sentence_builder"
  };

  let memoryState = createEmptyState();
  let memoryOnly = false;

  function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function createEmptyState() {
    return {
      version: 2,
      lessons: {},
      activities: {},
      scores: {},
      xp: 0,
      xpAwards: {}
    };
  }

  function notify(message) {
    if (typeof document !== "undefined" && typeof CustomEvent !== "undefined") {
      document.dispatchEvent(new CustomEvent("lesson-progress-notice", { detail: message }));
    }
  }

  function resolveLesson(lessonId) {
    if (typeof LESSONS_DATA === "undefined" || lessonId === undefined || lessonId === null) return null;
    return LESSONS_DATA.find((lesson) => String(lesson.id) === String(lessonId) || lesson.slug === String(lessonId)) || null;
  }

  function getSlides(lessonId) {
    if (typeof SLIDES_BY_LESSON === "undefined") return null;
    const lesson = resolveLesson(lessonId);
    if (!lesson) return null;
    const slides = SLIDES_BY_LESSON[lesson.id];
    return Array.isArray(slides) ? slides : null;
  }

  function getActivityQuestionCount(slide) {
    if (!slide) return 0;
    if (slide.activityType === "mcq" || slide.activityType === "listening") {
      return Array.isArray(slide.questions) ? slide.questions.length : 0;
    }
    if (slide.activityType === "matching") return Array.isArray(slide.pairs) ? slide.pairs.length : 0;
    if (slide.activityType === "fillBlank") return Array.isArray(slide.items) ? slide.items.length : 0;
    if (slide.activityType === "sentenceBuilder") return Array.isArray(slide.sentences) ? slide.sentences.length : 0;
    return 0;
  }

  function isActivityDataValid(slide) {
    if (!slide || !slide.id || !ACTIVITY_TYPES[slide.activityType]) return false;
    if (slide.activityType === "mcq" || slide.activityType === "listening") {
      return Array.isArray(slide.questions) && slide.questions.length > 0 && slide.questions.every((question) =>
        isObject(question) &&
        typeof question.prompt === "string" &&
        question.prompt.trim().length > 0 &&
        Array.isArray(question.options) &&
        question.options.length > 0 &&
        question.options.every((option) => typeof option === "string" && option.length > 0) &&
        Number.isInteger(question.answer) &&
        question.answer >= 0 &&
        question.answer < question.options.length
      );
    }
    if (slide.activityType === "matching") {
      return Array.isArray(slide.pairs) && slide.pairs.length > 0 && slide.pairs.every((pair) =>
        isObject(pair) &&
        typeof pair.left === "string" && pair.left.trim().length > 0 &&
        typeof pair.right === "string" && pair.right.trim().length > 0
      );
    }
    if (slide.activityType === "fillBlank") {
      return Array.isArray(slide.items) && slide.items.length > 0 && slide.items.every((item) =>
        isObject(item) &&
        typeof item.answer === "string" &&
        Array.isArray(item.options) &&
        item.options.every((option) => typeof option === "string") &&
        item.options.includes(item.answer) &&
        typeof item.before === "string" &&
        typeof item.after === "string"
      );
    }
    return Array.isArray(slide.sentences) && slide.sentences.length > 0 && slide.sentences.every((sentence) =>
      isObject(sentence) &&
      typeof sentence.target === "string" &&
      Array.isArray(sentence.words) &&
      sentence.words.length > 0 &&
      sentence.words.every((word) => typeof word === "string" && word.length > 0) &&
      sentence.words.length === sentence.target.trim().split(/\s+/).length &&
      JSON.stringify(sentence.words.slice().sort()) === JSON.stringify(sentence.target.trim().split(/\s+/).sort())
    );
  }

  function getLessonActivities(lessonId) {
    const slides = getSlides(lessonId);
    if (!slides) return null;
    return slides
      .filter((slide) => slide && slide.type === "activity")
      .map((slide) => {
        const type = ACTIVITY_TYPES[slide.activityType];
        const questionCount = getActivityQuestionCount(slide);
        return {
          id: slide.id,
          type: type || "unknown",
          questionCount,
          valid: isActivityDataValid(slide) && questionCount > 0,
          slide
        };
      });
  }

  function getLessonMetadata(lessonId) {
    const lesson = resolveLesson(lessonId);
    const slides = lesson ? getSlides(lesson.id) : null;
    const activities = lesson ? getLessonActivities(lesson.id) : null;
    if (!lesson || !slides || !activities) return null;
    return {
      id: lesson.slug,
      code: lesson.code,
      title: lesson.title,
      level: lesson.level,
      estimated_time: lesson.estimatedTime,
      objectives: lesson.objectives.slice(),
      activities: activities.map((activity) => ({
        id: activity.id,
        type: activity.type,
        total_questions: activity.questionCount,
        required: true
      })),
      total_slides: slides.length
    };
  }

  function calculateXP(state) {
    const source = state || loadProgressState();
    const awards = isObject(source.xpAwards) ? source.xpAwards : {};
    const awardTotal = Object.keys(awards).reduce((sum, key) => {
      const amount = Number(awards[key]);
      return sum + (Number.isFinite(amount) && amount > 0 ? amount : 0);
    }, 0);
    return awardTotal || Math.max(0, Number(source.xp) || 0);
  }

  function getStoredScore(lessonId, state) {
    const lesson = resolveLesson(lessonId);
    const stored = state.scores[lesson ? lesson.slug : String(lessonId)];
    if (!isObject(stored)) return { correct: 0, total: 0, percentage: 0 };
    const correct = Math.max(0, Number(stored.correct) || 0);
    const total = Math.max(0, Number(stored.total) || 0);
    return {
      correct: Math.min(correct, total),
      total,
      percentage: total ? Math.round((Math.min(correct, total) / total) * 100) : 0
    };
  }

  function calculateLessonScore(lessonId, state) {
    const lesson = resolveLesson(lessonId);
    const source = state || loadProgressState();
    if (!lesson) return { correct: 0, total: 0, percentage: 0 };

    const definitions = getLessonActivities(lesson.id);
    if (!definitions) return getStoredScore(lesson.id, source);

    let correct = 0;
    let total = 0;
    const lessonActivities = isObject(source.activities[lesson.slug])
      ? source.activities[lesson.slug]
      : {};

    definitions.forEach((definition) => {
      total += definition.questionCount;
      const result = lessonActivities[definition.id];
      if (result && result.completed) {
        correct += Math.min(definition.questionCount, Math.max(0, Number(result.correct) || 0));
      }
    });

    return {
      correct,
      total,
      percentage: total ? Math.round((correct / total) * 100) : 0
    };
  }

  function calculateStars(score, completed) {
    if (!completed || !score || !score.total) return 0;
    if (score.percentage >= 80) return 3;
    if (score.percentage >= 50) return 2;
    return 1;
  }

  function isLessonCompleted(lessonId, state) {
    const lesson = resolveLesson(lessonId);
    const slides = lesson ? getSlides(lesson.id) : null;
    const definitions = lesson ? getLessonActivities(lesson.id) : null;
    if (!lesson || !slides || slides.length === 0 || !definitions) return false;
    if (definitions.some((activity) => !activity.valid)) return false;

    const source = state || loadProgressState();
    const progress = source.lessons[lesson.slug];
    if (!progress || !Array.isArray(progress.visitedSlides)) return false;

    const visited = new Set(progress.visitedSlides);
    const everySlideVisited = slides.every((slide, index) => visited.has(index));
    const lessonActivities = isObject(source.activities[lesson.slug])
      ? source.activities[lesson.slug]
      : {};
    const everyActivityCompleted = definitions.every((activity) => {
      const result = lessonActivities[activity.id];
      return Boolean(result && result.completed && result.total === activity.questionCount);
    });

    return everySlideVisited && everyActivityCompleted;
  }

  function normalizeActivityRecord(value, definition) {
    if (!isObject(value)) {
      return {
        id: definition.id,
        type: definition.type,
        completed: false,
        correct: 0,
        total: definition.questionCount,
        percentage: 0,
        attempts: 0,
        completedAt: null,
        responses: [],
        mistakes: []
      };
    }

    const total = definition.questionCount;
    const correct = Math.min(total, Math.max(0, Number(value.correct) || 0));
    return {
      id: definition.id,
      type: definition.type,
      completed: Boolean(value.completed) && Number(value.total) === total,
      correct,
      total,
      percentage: total ? Math.round((correct / total) * 100) : 0,
      attempts: Math.max(0, Math.floor(Number(value.attempts) || 0)),
      completedAt: typeof value.completedAt === "string" ? value.completedAt : null,
      responses: Array.isArray(value.responses) ? value.responses : [],
      mistakes: Array.isArray(value.mistakes) ? value.mistakes : []
    };
  }

  function normalizeState(raw) {
    const candidate = isObject(raw) ? raw : {};
    const state = createEmptyState();
    const knownLessons = typeof LESSONS_DATA === "undefined" ? [] : LESSONS_DATA;

    if (isObject(candidate.lessons)) {
      Object.keys(candidate.lessons).forEach((key) => {
        const lesson = resolveLesson(key);
        if (!lesson || !isObject(candidate.lessons[key])) return;
        const progress = candidate.lessons[key];
        const slides = getSlides(lesson.id);
        const maxSlide = slides && slides.length ? slides.length - 1 : 0;
        const savedVisited = Array.isArray(progress.visitedSlides)
          ? progress.visitedSlides
          : Array.isArray(progress.visited)
            ? progress.visited
            : [];
        state.lessons[lesson.slug] = {
          currentSlide: Math.min(maxSlide, Math.max(0, Math.floor(Number(progress.currentSlide) || 0))),
          visitedSlides: Array.from(new Set(savedVisited.filter((index) =>
            Number.isInteger(index) && index >= 0 && (!slides || index < slides.length)
          ))),
          completed: Boolean(progress.completed),
          startedAt: typeof progress.startedAt === "string" ? progress.startedAt : null,
          completedAt: typeof progress.completedAt === "string" ? progress.completedAt : null
        };
      });
    }

    if (isObject(candidate.activities)) {
      Object.keys(candidate.activities).forEach((key) => {
        const lesson = resolveLesson(key);
        if (!lesson || !isObject(candidate.activities[key])) return;
        const definitions = getLessonActivities(lesson.id);
        const stored = candidate.activities[key];
        const clean = {};
        if (definitions) {
          definitions.forEach((definition) => {
            if (definition.valid && Object.prototype.hasOwnProperty.call(stored, definition.id)) {
              clean[definition.id] = normalizeActivityRecord(stored[definition.id], definition);
            }
          });
        } else {
          Object.keys(stored).forEach((activityId) => {
            if (!isObject(stored[activityId])) return;
            clean[activityId] = stored[activityId];
          });
        }
        state.activities[lesson.slug] = clean;
      });
    }

    if (isObject(candidate.xpAwards)) {
      Object.keys(candidate.xpAwards).forEach((key) => {
        const amount = Number(candidate.xpAwards[key]);
        if (Number.isFinite(amount) && amount > 0) state.xpAwards[key] = amount;
      });
    }

    const legacyXP = Math.max(0, Number(candidate.xp) || 0);
    if (legacyXP > 0 && Object.keys(state.xpAwards).length === 0) {
      state.xpAwards.legacy_import = legacyXP;
    }
    state.xp = calculateXP(state);

    if (isObject(candidate.scores)) {
      Object.keys(candidate.scores).forEach((key) => {
        const lesson = resolveLesson(key);
        if (lesson) state.scores[lesson.slug] = getStoredScore(lesson.id, {
          scores: { [lesson.slug]: candidate.scores[key] }
        });
      });
    }

    knownLessons.forEach((lesson) => {
      const score = calculateLessonScore(lesson.id, state);
      state.scores[lesson.slug] = score;
      const progress = state.lessons[lesson.slug];
      if (progress && progress.completed && !isLessonCompleted(lesson.id, state)) {
        progress.completed = false;
        progress.completedAt = null;
      }
    });

    return state;
  }

  function readStorage(key) {
    if (!global.LessonStorage) {
      notify("Progress storage is unavailable in this browser. Progress will remain only for this visit.");
      memoryOnly = true;
      return { ok: false, value: null };
    }
    const result = global.LessonStorage.read(key);
    if (!result.ok) memoryOnly = true;
    return result;
  }

  function writeStorage(state) {
    memoryState = state;
    if (!global.LessonStorage) {
      notify("Progress storage is unavailable in this browser. Progress will remain only for this visit.");
      memoryOnly = true;
      return false;
    }
    const result = global.LessonStorage.write(STORAGE_KEY, JSON.stringify(state));
    if (!result.ok) memoryOnly = true;
    return result.ok;
  }

  function getQuestionPrompt(slide, index) {
    if (slide.activityType === "mcq" || slide.activityType === "listening") return slide.questions[index].prompt;
    if (slide.activityType === "matching") return slide.pairs[index].left;
    if (slide.activityType === "fillBlank") {
      const item = slide.items[index];
      return `${item.before} ___ ${item.after}`;
    }
    return `Sentence ${index + 1} (${slide.sentences[index].hint})`;
  }

  function evaluateActivity(definition, answers) {
    const slide = definition.slide;
    const expectedCount = definition.questionCount;
    if (!Array.isArray(answers) || answers.length !== expectedCount || answers.some((answer) => answer === null || answer === undefined || answer === "")) {
      return { ok: false, message: "Complete every question before checking your answers." };
    }

    const responses = [];
    for (let index = 0; index < expectedCount; index++) {
      let userAnswer;
      let correctAnswer;
      let correct = false;

      if (slide.activityType === "mcq" || slide.activityType === "listening") {
        const question = slide.questions[index];
        const selected = Number(answers[index]);
        if (!Number.isInteger(selected) || selected < 0 || selected >= question.options.length) {
          return { ok: false, message: "Choose an answer for every question." };
        }
        userAnswer = question.options[selected];
        correctAnswer = question.options[question.answer];
        correct = selected === question.answer;
      } else if (slide.activityType === "matching") {
        const selected = Number(answers[index]);
        if (!Number.isInteger(selected) || selected < 0 || selected >= slide.pairs.length) {
          return { ok: false, message: "Match every pair before continuing." };
        }
        userAnswer = slide.pairs[selected].right;
        correctAnswer = slide.pairs[index].right;
        correct = selected === index;
      } else if (slide.activityType === "fillBlank") {
        const item = slide.items[index];
        userAnswer = String(answers[index]);
        correctAnswer = item.answer;
        correct = userAnswer === item.answer;
      } else if (slide.activityType === "sentenceBuilder") {
        const sentence = slide.sentences[index];
        userAnswer = String(answers[index]);
        correctAnswer = sentence.target;
        correct = userAnswer === sentence.target;
      } else {
        return { ok: false, message: "This activity is not available right now." };
      }

      responses.push({
        question: getQuestionPrompt(slide, index),
        userAnswer,
        correctAnswer,
        correct
      });
    }
    return { ok: true, responses };
  }

  function recomputeScores(state, lessonId) {
    const lesson = resolveLesson(lessonId);
    if (lesson) state.scores[lesson.slug] = calculateLessonScore(lessonId, state);
  }

  function awardOnce(state, key, amount) {
    if (Object.prototype.hasOwnProperty.call(state.xpAwards, key)) return false;
    state.xpAwards[key] = amount;
    state.xp = calculateXP(state);
    return true;
  }

  function markCompletedIfReady(state, lesson) {
    const progress = state.lessons[lesson.slug];
    if (!progress || !isLessonCompleted(lesson.id, state)) return false;
    const wasCompleted = progress.completed;
    progress.completed = true;
    if (!progress.completedAt) progress.completedAt = new Date().toISOString();
    awardOnce(state, `lesson-${lesson.id}-completion`, lesson.xpReward);
    return !wasCompleted;
  }

  function migrateLegacy(raw) {
    const migrated = createEmptyState();
    if (isObject(raw.lessons)) {
      Object.keys(raw.lessons).forEach((key) => {
        const lesson = resolveLesson(key);
        const previous = raw.lessons[key];
        if (!lesson || !isObject(previous)) return;
        migrated.lessons[lesson.slug] = {
          currentSlide: Math.max(0, Math.floor(Number(previous.currentSlide) || 0)),
          visitedSlides: Array.isArray(previous.visited) ? previous.visited : [],
          completed: false,
          startedAt: null,
          completedAt: null
        };
      });
    }

    if (isObject(raw.activityScores)) {
      Object.keys(raw.activityScores).forEach((key) => {
        const match = key.match(/^(\d+)_(.+)$/);
        if (!match) return;
        const lesson = resolveLesson(match[1]);
        const definitions = lesson && getLessonActivities(lesson.id);
        const definition = definitions && definitions.find((item) => item.id === match[2]);
        const oldResult = raw.activityScores[key];
        if (!definition || !definition.valid || !isObject(oldResult)) return;
        const total = definition.questionCount;
        const correct = Math.min(total, Math.max(0, Number(oldResult.correct) || 0));
        const oldMistakes = isObject(raw.mistakes) && Array.isArray(raw.mistakes[lesson.id])
          ? raw.mistakes[lesson.id].filter((mistake) => mistake.slideId === definition.id)
          : [];
        const isMatching = definition.type === "matching";
        const activityResult = normalizeActivityRecord({
          completed: isMatching ? correct === total : true,
          correct,
          total,
          attempts: 1,
          mistakes: oldMistakes.map((mistake) => ({
            question: mistake.prompt || mistake.question || "",
            userAnswer: mistake.userAnswer || "",
            correctAnswer: mistake.correctAnswer || ""
          }))
        }, definition);
        if (!migrated.activities[lesson.slug]) migrated.activities[lesson.slug] = {};
        migrated.activities[lesson.slug][definition.id] = activityResult;
      });
    }

    const oldXP = Math.max(0, Number(raw.xp) || 0);
    if (oldXP > 0) migrated.xpAwards.legacy_import = oldXP;
    migrated.xp = calculateXP(migrated);
    const normalized = normalizeState(migrated);
    Object.keys(normalized.lessons).forEach((key) => {
      const progress = normalized.lessons[key];
      if (progress.completed && !progress.completedAt) progress.completedAt = null;
    });
    notify("Saved progress was upgraded. Your slide progress and XP were retained; older activity scores may not have been available.");
    return normalized;
  }

  function loadProgressState() {
    if (memoryOnly) return memoryState;
    const stored = readStorage(STORAGE_KEY);
    if (!stored.ok) return memoryState;
    const raw = stored.value;
    if (raw !== null) {
      try {
        const parsed = JSON.parse(raw);
        if (isObject(parsed) && parsed.version === 2) {
          memoryState = normalizeState(parsed);
          return memoryState;
        }
        notify("Saved progress was not recognized. A fresh progress record has been started.");
      } catch (error) {
        notify("Saved progress was corrupted and could not be read. A fresh progress record has been started.");
        if (global.LessonStorage && !global.LessonStorage.remove(STORAGE_KEY)) {
          memoryOnly = true;
          memoryState = createEmptyState();
          return memoryState;
        }
      }
    }

    const legacy = readStorage(LEGACY_STORAGE_KEY);
    if (!legacy.ok) return memoryState;
    const legacyRaw = legacy.value;
    if (legacyRaw) {
      try {
        memoryState = migrateLegacy(JSON.parse(legacyRaw));
        writeStorage(memoryState);
        return memoryState;
      } catch (error) {
        notify("Older saved progress could not be upgraded. A fresh progress record has been started.");
      }
    }

    memoryState = createEmptyState();
    return memoryState;
  }

  function saveProgressState(state) {
    const normalized = normalizeState(state);
    normalized.xp = calculateXP(normalized);
    return writeStorage(normalized);
  }

  function recordSlideVisit(lessonId, slideIndex) {
    const lesson = resolveLesson(lessonId);
    const slides = lesson ? getSlides(lesson.id) : null;
    if (!lesson || !slides || !Number.isInteger(slideIndex) || slideIndex < 0 || slideIndex >= slides.length) {
      return { ok: false, message: "This lesson slide is unavailable." };
    }

    const state = loadProgressState();
    const key = lesson.slug;
    if (!state.lessons[key]) {
      state.lessons[key] = {
        currentSlide: 0,
        visitedSlides: [],
        completed: false,
        startedAt: null,
        completedAt: null
      };
    }
    const progress = state.lessons[key];
    if (!progress.startedAt) progress.startedAt = new Date().toISOString();
    progress.currentSlide = slideIndex;
    const firstVisit = !progress.visitedSlides.includes(slideIndex);
    if (firstVisit) progress.visitedSlides.push(slideIndex);
    const xpAwarded = slideIndex > 0 && firstVisit
      ? awardOnce(state, `lesson-${lesson.id}-slide-${slideIndex}`, 5)
      : false;
    markCompletedIfReady(state, lesson);
    recomputeScores(state, lesson.id);
    saveProgressState(state);
    return { ok: true, firstVisit, xpAwarded, completed: state.lessons[key].completed };
  }

  function submitActivity(lessonId, activityId, answers) {
    const lesson = resolveLesson(lessonId);
    const definitions = lesson ? getLessonActivities(lesson.id) : null;
    const definition = definitions && definitions.find((activity) => activity.id === activityId);
    if (!lesson || !definition || !definition.valid) {
      return { ok: false, message: "This activity is unavailable. Return to the lesson list and try again." };
    }

    const evaluation = evaluateActivity(definition, answers);
    if (!evaluation.ok) return evaluation;

    const state = loadProgressState();
    const lessonKey = lesson.slug;
    if (!state.activities[lessonKey]) state.activities[lessonKey] = {};
    const previous = state.activities[lessonKey][definition.id];
    const correct = evaluation.responses.filter((response) => response.correct).length;
    const total = definition.questionCount;
    const mistakes = evaluation.responses
      .filter((response) => !response.correct)
      .map((response) => ({
        question: response.question,
        userAnswer: response.userAnswer,
        correctAnswer: response.correctAnswer
      }));
    const result = {
      id: definition.id,
      type: definition.type,
      completed: true,
      correct,
      total,
      percentage: Math.round((correct / total) * 100),
      attempts: previous ? previous.attempts + 1 : 1,
      completedAt: new Date().toISOString(),
      responses: evaluation.responses,
      mistakes
    };
    state.activities[lessonKey][definition.id] = result;

    const activityXP = correct === total ? 15 : 10;
    const xpAwarded = awardOnce(state, `lesson-${lesson.id}-activity-${definition.id}`, activityXP);
    recomputeScores(state, lesson.id);
    const newlyCompleted = markCompletedIfReady(state, lesson);
    saveProgressState(state);
    return {
      ok: true,
      result,
      lessonScore: state.scores[lessonKey],
      completed: state.lessons[lessonKey] ? state.lessons[lessonKey].completed : false,
      newlyCompleted,
      xpAwarded
    };
  }

  function resetLessonProgress(lessonId) {
    const lesson = resolveLesson(lessonId);
    if (!lesson) return false;
    const state = loadProgressState();
    const key = lesson.slug;
    state.lessons[key] = {
      currentSlide: 0,
      visitedSlides: [],
      completed: false,
      startedAt: null,
      completedAt: null
    };
    delete state.activities[key];
    delete state.scores[key];
    saveProgressState(state);
    return true;
  }

  function calculateGamificationStats(state) {
    const source = state || loadProgressState();
    let totalStars = 0;
    let completedCount = 0;
    (typeof LESSONS_DATA === "undefined" ? [] : LESSONS_DATA).forEach((lesson) => {
      const progress = source.lessons[lesson.slug];
      const completed = Boolean(progress && progress.completed && isLessonCompleted(lesson.id, source));
      if (completed) {
        completedCount++;
        totalStars += calculateStars(calculateLessonScore(lesson.id, source), true);
      }
    });
    const totalXp = calculateXP(source);
    return { totalXp, totalStars, completedCount, level: Math.floor(totalXp / 150) + 1 };
  }

  function getLessonResult(lessonId) {
    const lesson = resolveLesson(lessonId);
    if (!lesson) return null;
    const state = loadProgressState();
    const key = lesson.slug;
    const progress = state.lessons[key] || {};
    const definitions = getLessonActivities(lesson.id) || [];
    const savedActivities = state.activities[key] || {};
    const score = calculateLessonScore(lesson.id, state);
    const activities = definitions.map((definition) => {
      const result = savedActivities[definition.id] || normalizeActivityRecord(null, definition);
      return {
        id: definition.id,
        type: definition.type,
        completed: Boolean(result.completed),
        score: {
          correct: result.correct,
          total: definition.questionCount,
          percentage: result.percentage || 0
        },
        attempts: result.attempts || 0,
        responses: (result.responses || []).map((response) => ({
          question: response.question,
          user_answer: response.userAnswer,
          correct_answer: response.correctAnswer,
          correct: Boolean(response.correct)
        })),
        mistakes: (result.mistakes || []).map((mistake) => ({
          question: mistake.question,
          user_answer: mistake.userAnswer,
          correct_answer: mistake.correctAnswer
        }))
      };
    });
    const mistakes = activities.reduce((all, activity) => all.concat(activity.mistakes.map((mistake) => ({
      activity_id: activity.id,
      type: activity.type,
      question: mistake.question,
      user_answer: mistake.user_answer,
      correct_answer: mistake.correct_answer
    }))), []);
    const xpEarned = Object.keys(state.xpAwards).reduce((sum, awardKey) => {
      if (awardKey.indexOf(`lesson-${lesson.id}-`) !== 0) return sum;
      return sum + state.xpAwards[awardKey];
    }, 0);
    const completed = isLessonCompleted(lesson.id, state);

    return {
      lesson_id: lesson.slug,
      title: lesson.title,
      level: lesson.level,
      completed,
      score,
      stars: calculateStars(score, completed),
      xp_earned: xpEarned,
      mistakes,
      activities,
      total_slides: (getSlides(lesson.id) || []).length,
      visited_slides: Array.isArray(progress.visitedSlides) ? progress.visitedSlides.slice() : [],
      started_at: progress.startedAt || null,
      completed_at: completed ? progress.completedAt || null : null
    };
  }

  function exportProgressData() {
    const state = loadProgressState();
    return {
      version: 2,
      xp: calculateXP(state),
      lessons: (typeof LESSONS_DATA === "undefined" ? [] : LESSONS_DATA)
        .map((lesson) => getLessonResult(lesson.id))
    };
  }

  function validateLesson(lessonId) {
    const lesson = resolveLesson(lessonId);
    const slides = lesson ? getSlides(lesson.id) : null;
    if (!lesson) return { valid: false, message: "This lesson link is invalid. Choose a lesson from the lesson list." };
    if (!slides || slides.length === 0) return { valid: false, message: "This lesson has no slides available yet." };
    if (slides.some((slide) => !slide || !slide.id || !slide.type)) {
      return { valid: false, message: "This lesson contains an incomplete slide and cannot be opened right now." };
    }
    const activities = getLessonActivities(lesson.id) || [];
    const activityIds = activities.map((activity) => activity.id);
    if (activities.some((activity) => !activity.valid) || new Set(activityIds).size !== activityIds.length) {
      return { valid: false, message: "An activity in this lesson is missing its questions or answer data." };
    }
    return { valid: true, lesson, slides };
  }

  global.LessonProgress = Object.freeze({
    loadProgressState,
    saveProgressState,
    calculateLessonScore,
    calculateStars,
    calculateXP,
    calculateGamificationStats,
    getLessonActivities,
    getLessonMetadata,
    getLessonResult,
    exportProgressData,
    isLessonCompleted,
    recordSlideVisit,
    submitActivity,
    resetLessonProgress,
    validateLesson
  });
})(window);
