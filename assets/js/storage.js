(function (global) {
  "use strict";

  function notify(message) {
    if (typeof document !== "undefined" && typeof CustomEvent !== "undefined") {
      document.dispatchEvent(new CustomEvent("lesson-progress-notice", { detail: message }));
    }
  }

  function read(key) {
    try {
      if (!global.localStorage) throw new Error("localStorage unavailable");
      return { ok: true, value: global.localStorage.getItem(key) };
    } catch (error) {
      notify("Progress storage is unavailable in this browser. Progress will remain only for this visit.");
      return { ok: false, value: null };
    }
  }

  function write(key, value) {
    try {
      if (!global.localStorage) throw new Error("localStorage unavailable");
      global.localStorage.setItem(key, value);
      return { ok: true };
    } catch (error) {
      notify("Progress could not be saved in this browser. Keep this page open to retain it for now.");
      return { ok: false };
    }
  }

  function remove(key) {
    try {
      if (!global.localStorage) throw new Error("localStorage unavailable");
      global.localStorage.removeItem(key);
      return true;
    } catch (error) {
      notify("Unreadable saved progress could not be removed from this browser.");
      return false;
    }
  }

  global.LessonStorage = Object.freeze({ read, write, remove });
})(window);
