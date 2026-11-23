const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const sourceFiles = [
  "assets/js/lessons.js",
  "assets/js/slides.js",
  "assets/js/storage.js",
  "assets/js/progress.js"
];

class MemoryStorage {
  constructor(initial = {}) {
    this.values = new Map(Object.entries(initial));
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }
}

function createApp(storage = new MemoryStorage()) {
  const notices = [];
  const document = {
    addEventListener() {},
    dispatchEvent(event) {
      notices.push(event.detail);
    }
  };
  const window = { localStorage: storage };
  const context = {
    window,
    document,
    CustomEvent: class {
      constructor(type, options) {
        this.type = type;
        this.detail = options.detail;
      }
    },
    URLSearchParams,
    Date,
    JSON,
    Math,
    Number,
    Object,
    Array,
    String,
    Set
  };
  vm.createContext(context);
  sourceFiles.forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
  });
  return { progress: window.LessonProgress, storage, notices, context };
}

function answersFor(activity) {
  const slide = activity.slide;
  if (slide.activityType === "mcq" || slide.activityType === "listening") {
    return slide.questions.map((question) => question.answer);
  }
  if (slide.activityType === "matching") return slide.pairs.map((pair, index) => index);
  if (slide.activityType === "fillBlank") return slide.items.map((item) => item.answer);
  return slide.sentences.map((sentence) => sentence.target);
}

test("all five lessons expose valid, uniquely identified activities and derived slide counts", () => {
  const { progress, context } = createApp();
  const lessons = vm.runInContext("LESSONS_DATA", context);
  const activityIds = new Set();

  assert.equal(lessons.length, 5);
  lessons.forEach((lesson) => {
    const metadata = progress.getLessonMetadata(lesson.id);
    assert.ok(metadata);
    assert.ok(metadata.total_slides > 0);
    assert.equal(metadata.id, lesson.slug);
    progress.getLessonActivities(lesson.id).forEach((activity) => {
      assert.equal(activity.valid, true);
      assert.ok(activity.id);
      assert.ok(!activityIds.has(activity.id));
      activityIds.add(activity.id);
    });
  });
  assert.equal(activityIds.size, 11);
});

test("malformed activity content and duplicate IDs are rejected before a lesson opens", () => {
  const { progress, context } = createApp();
  const slides = vm.runInContext("SLIDES_BY_LESSON[2]", context);
  const sentenceActivity = slides.find((slide) => slide.activityType === "sentenceBuilder");
  sentenceActivity.sentences[0].words = ["unusable"];
  assert.equal(progress.validateLesson("family").valid, false);

  sentenceActivity.sentences[0].words = ["This", "is", "my", "sister."];
  const anotherActivity = slides.find((slide) => slide.type === "activity" && slide.id !== sentenceActivity.id);
  anotherActivity.id = sentenceActivity.id;
  assert.equal(progress.validateLesson("family").valid, false);
});

test("activity retries replace a result without duplicating score or XP", () => {
  const { progress } = createApp();
  const activity = progress.getLessonActivities("family")[0];
  const wrongAnswers = answersFor(activity).map(() => 0);
  const first = progress.submitActivity("family", activity.id, wrongAnswers);
  assert.equal(first.ok, true);

  const correctAnswers = answersFor(activity);
  const retry = progress.submitActivity("family", activity.id, correctAnswers);
  assert.equal(retry.ok, true);
  assert.equal(retry.result.attempts, 2);
  assert.equal(retry.result.correct, activity.questionCount);
  assert.deepEqual(
    JSON.parse(JSON.stringify(retry.lessonScore)),
    { correct: 3, total: 5, percentage: 60 }
  );
  assert.equal(progress.calculateXP(), 10);
});

test("matching activities save partial scores and incorrect pairs", () => {
  const { progress } = createApp();
  const activity = progress.getLessonActivities("greetings").find((item) => item.type === "matching");
  const answers = answersFor(activity);
  answers[0] = (answers[0] + 1) % activity.questionCount;

  const submitted = progress.submitActivity("greetings", activity.id, answers);
  assert.equal(submitted.ok, true);
  assert.equal(submitted.result.correct, activity.questionCount - 1);
  assert.equal(submitted.result.mistakes.length, 1);
  assert.equal(submitted.result.responses[0].correct, false);
});

test("lesson completion requires all slides and every activity", () => {
  const { progress, context } = createApp();
  const lessons = vm.runInContext("LESSONS_DATA", context);
  const lesson = lessons.find((item) => item.slug === "greetings");
  const slides = vm.runInContext(`SLIDES_BY_LESSON[${lesson.id}]`, context);

  slides.forEach((slide, index) => progress.recordSlideVisit(lesson.id, index));
  assert.equal(progress.isLessonCompleted(lesson.id), false);

  const activities = progress.getLessonActivities(lesson.id);
  activities.slice(0, -1).forEach((activity) => {
    progress.submitActivity(lesson.id, activity.id, answersFor(activity));
  });
  assert.equal(progress.isLessonCompleted(lesson.id), false);
  const finalActivity = activities[activities.length - 1];
  progress.submitActivity(lesson.id, finalActivity.id, answersFor(finalActivity));
  assert.equal(progress.isLessonCompleted(lesson.id), true);

  const result = progress.getLessonResult(lesson.id);
  assert.equal(result.lesson_id, "greetings");
  assert.equal(result.completed, true);
  assert.equal(result.score.percentage, 100);
  assert.equal(result.stars, 3);
  assert.ok(result.completed_at);
});

test("every lesson can complete with all source answer keys and retains its state after reload", () => {
  const storage = new MemoryStorage();
  const app = createApp(storage);
  const lessons = vm.runInContext("LESSONS_DATA", app.context);

  lessons.forEach((lesson) => {
    const slides = vm.runInContext(`SLIDES_BY_LESSON[${lesson.id}]`, app.context);
    slides.forEach((slide, index) => app.progress.recordSlideVisit(lesson.id, index));
    app.progress.getLessonActivities(lesson.id).forEach((activity) => {
      assert.equal(app.progress.submitActivity(lesson.id, activity.id, answersFor(activity)).ok, true);
    });
    assert.equal(app.progress.isLessonCompleted(lesson.id), true);
    assert.equal(app.progress.getLessonResult(lesson.id).score.percentage, 100);
  });

  const refreshed = createApp(storage).progress;
  lessons.forEach((lesson) => {
    assert.equal(refreshed.isLessonCompleted(lesson.id), true);
    assert.equal(refreshed.getLessonResult(lesson.id).score.percentage, 100);
  });
});

test("replay resets attempt progress but retains lifetime XP awards", () => {
  const { progress, context } = createApp();
  const lesson = vm.runInContext("LESSONS_DATA[0]", context);
  const slides = vm.runInContext(`SLIDES_BY_LESSON[${lesson.id}]`, context);
  slides.forEach((slide, index) => progress.recordSlideVisit(lesson.id, index));
  progress.getLessonActivities(lesson.id).forEach((activity) => {
    progress.submitActivity(lesson.id, activity.id, answersFor(activity));
  });
  const previousXP = progress.calculateXP();

  assert.equal(progress.resetLessonProgress(lesson.id), true);
  assert.equal(progress.isLessonCompleted(lesson.id), false);
  assert.equal(progress.getLessonResult(lesson.id).score.correct, 0);
  assert.equal(progress.calculateXP(), previousXP);
  assert.equal(progress.loadProgressState().activities.greetings, undefined);
});

test("corrupted storage and unknown lessons fail safely", () => {
  const storage = new MemoryStorage({ a1_english_lessons_progress_v2: "{" });
  const { progress, notices } = createApp(storage);

  assert.equal(progress.getLessonResult("missing"), null);
  assert.deepEqual(
    JSON.parse(JSON.stringify(progress.calculateLessonScore("missing"))),
    { correct: 0, total: 0, percentage: 0 }
  );
  assert.ok(notices.some((message) => message.includes("corrupted")));
  assert.doesNotThrow(() => progress.loadProgressState());
});

test("unavailable storage keeps in-memory progress for the current visit", () => {
  const unavailableStores = [
    {
      getItem() { throw new Error("storage denied"); },
      setItem() { throw new Error("storage denied"); },
      removeItem() { throw new Error("storage denied"); }
    },
    {
      getItem() { return null; },
      setItem() { throw new Error("storage quota exceeded"); },
      removeItem() {}
    }
  ];

  unavailableStores.forEach((storage) => {
    const { progress, notices } = createApp(storage);
    const activity = progress.getLessonActivities("family")[0];
    progress.recordSlideVisit("family", 1);
    assert.equal(progress.submitActivity("family", activity.id, answersFor(activity)).ok, true);

    const result = progress.getLessonResult("family");
    assert.deepEqual(JSON.parse(JSON.stringify(result.visited_slides)), [1]);
    assert.equal(result.activities[0].completed, true);
    assert.ok(notices.some((message) => message.includes("unavailable") || message.includes("could not be saved")));
  });
});

test("legacy progress is migrated without trusting an old completion flag", () => {
  const storage = new MemoryStorage({
    a1_english_lessons_progress_v1: JSON.stringify({
      lessons: { 2: { currentSlide: 2, visited: [0, 1, 2], completed: true } },
      scores: { 2: { correct: 3, total: 3 } },
      mistakes: {},
      xp: 42
    })
  });
  const { progress, notices } = createApp(storage);
  const state = progress.loadProgressState();

  assert.equal(state.lessons.family.currentSlide, 2);
  assert.deepEqual(JSON.parse(JSON.stringify(state.lessons.family.visitedSlides)), [0, 1, 2]);
  assert.equal(progress.calculateXP(), 42);
  assert.equal(progress.isLessonCompleted("family"), false);
  assert.ok(notices.some((message) => message.includes("upgraded")));
  assert.ok(storage.getItem("a1_english_lessons_progress_v2"));
});
