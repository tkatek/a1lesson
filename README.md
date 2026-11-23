# A1 English Lessons

A standalone, static HTML/CSS/JavaScript learning module for five CEFR A1 lessons. It has no build step, framework, or server dependency. Progress is stored locally in the browser; this project does not authenticate users or communicate with Engame.

## Project structure

```text
index.html
pages/
  lesson.html
  learning.html
assets/
  css/
    style.css
    lessons.css
    player.css
  js/
    lessons.js       Lesson metadata and overview rendering
    slides.js        Slide content and answer keys
    storage.js       Safe browser storage access and user-facing errors
    progress.js      Versioned local state, scoring, completion, XP
    activities.js    Activity UI; submits answers to the progress engine
    player.js        Slide navigation and lesson results
    integration.js   Local export facade for future host integration
  images/
  videos/
tests/
  progress.test.cjs
```

## Run and test

Open `index.html` through a static web server (for example, `python -m http.server`) or use GitHub Pages. Run the state/scoring tests with Node.js:

```text
node --test tests/progress.test.cjs
```

The test suite uses Node’s built-in test runner and does not require installing packages.

## Content and progress

Lesson metadata is maintained in `assets/js/lessons.js`. Slide content and answer keys are in `assets/js/slides.js`. Slide IDs also identify activities; `LessonProgress.getLessonMetadata()` derives each lesson’s activity list and slide count from the content data so those counts are not duplicated.

`assets/js/storage.js` isolates browser storage access and reports read/write failures. `assets/js/progress.js` is the single source of truth for browser progress. It saves version 2 state under `a1_english_lessons_progress_v2`, migrates the former v1 format where possible, safely handles corrupted state, and provides:

- `calculateLessonScore(lessonId)` — latest submitted result for each activity, counted once.
- `calculateStars(score, completed)` — 1–3 stars for completed lessons, based on percentage.
- `calculateXP()` — total XP from one-time award records.
- `isLessonCompleted(lessonId)` — requires every slide to have been visited and every activity to have a submitted result.
- `getLessonResult(lessonId)` — a JSON-compatible lesson result with score, responses, mistakes, activities, timestamps, stars, and XP earned.

Rechecking an activity replaces that activity’s score and response set; it increments its attempt count but does not add another copy to the lesson score. Matching pairs can be changed before checking, so incorrect pairs are included in the submitted result. Replaying a lesson resets its current progress and activity results. Lifetime XP awards are retained so repeating or refreshing cannot earn the same slide, activity, or completion XP again.

## Future host integration

`assets/js/integration.js` exposes `window.LessonIntegration.exportLessonResult(lessonId)` and `window.LessonIntegration.exportProgressData()`. These return local data only: there are no API calls, credentials, authentication, or database access. A future host must authenticate the learner and validate/persist results on its own backend. Browser-stored scores and answer keys are client-side and must not be treated as authoritative by a server.
