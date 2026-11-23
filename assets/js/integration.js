(function (global) {
  "use strict";

  function getCurrentLessonId() {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    return params.get("lesson");
  }

  global.LessonIntegration = Object.freeze({
    exportLessonResult: function (lessonId) {
      return LessonProgress.getLessonResult(lessonId === undefined ? getCurrentLessonId() : lessonId);
    },
    exportProgressData: function () {
      return LessonProgress.exportProgressData();
    }
  });
})(window);
