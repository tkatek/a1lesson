(function (global) {
  "use strict";

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function notifyProgressUpdated() {
    document.dispatchEvent(new CustomEvent("lesson-progress-updated"));
  }

  function setFeedback(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.className = `feedback-banner ${type}`;
    element.setAttribute("role", "status");
  }

  function renderActivitySlide(canvas, slide, lessonId) {
    if (!canvas || !slide || !slide.id) {
      if (canvas) canvas.textContent = "This activity is unavailable.";
      return;
    }

    switch (slide.activityType) {
      case "mcq":
      case "listening":
        renderChoiceActivity(canvas, slide, lessonId);
        break;
      case "matching":
        renderMatchingActivity(canvas, slide, lessonId);
        break;
      case "fillBlank":
        renderFillBlankActivity(canvas, slide, lessonId);
        break;
      case "sentenceBuilder":
        renderSentenceBuilderActivity(canvas, slide, lessonId);
        break;
      default:
        canvas.innerHTML = `<p class="feedback-banner error" role="status">This activity type is not available yet.</p>`;
    }
  }

  function renderActivityHeader(slide, type) {
    return `
      <div class="slide-header-bar">
        <span class="slide-tag">${type}</span>
      </div>
      <h2 class="slide-title">${escapeHTML(slide.title)}</h2>
      <p class="slide-subtitle">${escapeHTML(slide.instruction || "")}</p>
    `;
  }

  function renderChoiceActivity(canvas, slide, lessonId) {
    if (!Array.isArray(slide.questions) || !slide.questions.length) {
      canvas.textContent = "This activity has no questions available.";
      return;
    }

    const selected = Array(slide.questions.length).fill(null);
    const typeLabel = slide.activityType === "listening" ? "Listening Activity" : "Multiple Choice";
    canvas.innerHTML = `
      <div>
        ${renderActivityHeader(slide, typeLabel)}
        <div class="activity-box">
          ${slide.questions.map((question, questionIndex) => `
            <section class="quiz-question-card" data-question="${questionIndex}">
              <div class="quiz-prompt">
                <span>${questionIndex + 1}. ${escapeHTML(question.prompt)}</span>
                ${question.audioText ? `<button type="button" class="audio-btn" data-speak="${escapeHTML(question.audioText)}">🔊 Listen</button>` : ""}
              </div>
              <div class="options-row">
                ${question.options.map((option, optionIndex) => `
                  <button type="button" class="option-btn" data-question="${questionIndex}" data-option="${optionIndex}">
                    ${escapeHTML(option)}
                  </button>
                `).join("")}
              </div>
            </section>
          `).join("")}
        </div>
      </div>
      <div class="activity-footer">
        <div id="activityFeedback" aria-live="polite"></div>
        <div class="activity-actions">
          <button type="button" class="btn-secondary" id="resetActivityBtn">Reset Answers</button>
          <button type="button" class="btn-primary" id="checkActivityBtn">Check Answers</button>
        </div>
      </div>
    `;

    canvas.querySelectorAll(".option-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const questionIndex = Number(button.dataset.question);
        selected[questionIndex] = Number(button.dataset.option);
        canvas.querySelectorAll(`.option-btn[data-question="${questionIndex}"]`).forEach((option) => {
          option.classList.remove("selected", "correct", "wrong");
        });
        button.classList.add("selected");
      });
    });

    document.getElementById("checkActivityBtn").addEventListener("click", () => {
      const submitted = LessonProgress.submitActivity(lessonId, slide.id, selected);
      const feedback = document.getElementById("activityFeedback");
      if (!submitted.ok) {
        setFeedback(feedback, submitted.message, "error");
        return;
      }

      submitted.result.responses.forEach((response, questionIndex) => {
        canvas.querySelectorAll(`.option-btn[data-question="${questionIndex}"]`).forEach((option) => {
          const optionIndex = Number(option.dataset.option);
          option.classList.remove("selected", "correct", "wrong");
          if (optionIndex === slide.questions[questionIndex].answer) option.classList.add("correct");
          if (optionIndex === selected[questionIndex] && !response.correct) option.classList.add("wrong");
        });
      });

      const score = submitted.result;
      setFeedback(feedback, `${score.correct}/${score.total} correct. Your latest activity result has been saved.`, score.correct === score.total ? "success" : "error");
      notifyProgressUpdated();
    });

    document.getElementById("resetActivityBtn").addEventListener("click", () => {
      renderChoiceActivity(canvas, slide, lessonId);
    });
    bindAudioButtons(canvas);
  }

  function renderMatchingActivity(canvas, slide, lessonId) {
    if (!Array.isArray(slide.pairs) || !slide.pairs.length) {
      canvas.textContent = "This activity has no matching pairs available.";
      return;
    }

    let selectedLeft = null;
    const matches = Array(slide.pairs.length).fill(null);
    let checkedResponses = null;
    const rightOrder = slide.pairs
      .map((pair, index) => ({ text: pair.right, index }))
      .sort((left, right) => left.text.localeCompare(right.text));

    canvas.innerHTML = `
      <div>
        ${renderActivityHeader(slide, "Matching Activity")}
        <div class="matching-grid">
          <div class="match-col" id="matchLeftCol">
            ${slide.pairs.map((pair, index) => `
              <button type="button" class="match-item" data-side="left" data-index="${index}">
                ${escapeHTML(pair.left)}
              </button>
            `).join("")}
          </div>
          <div class="match-col" id="matchRightCol">
            ${rightOrder.map((pair) => `
              <button type="button" class="match-item" data-side="right" data-index="${pair.index}">
                ${escapeHTML(pair.text)}
              </button>
            `).join("")}
          </div>
        </div>
      </div>
      <div class="activity-footer">
        <div id="activityFeedback" aria-live="polite"></div>
        <div class="activity-actions">
          <button type="button" class="btn-secondary" id="resetActivityBtn">Reset Pairs</button>
          <button type="button" class="btn-primary" id="checkActivityBtn">Check Matches</button>
        </div>
      </div>
    `;

    const leftButtons = canvas.querySelectorAll('[data-side="left"]');
    const rightButtons = canvas.querySelectorAll('[data-side="right"]');

    function renderMatches() {
      leftButtons.forEach((button, index) => {
        button.classList.remove("selected", "assigned", "matched", "wrong");
        if (matches[index] !== null) {
          const response = checkedResponses && checkedResponses[index];
          button.classList.add(response ? (response.correct ? "matched" : "wrong") : "assigned");
        }
        if (index === selectedLeft) button.classList.add("selected");
      });

      rightButtons.forEach((button) => {
        const index = Number(button.dataset.index);
        const owner = matches.indexOf(index);
        button.classList.remove("assigned", "matched", "wrong");
        if (owner !== -1) {
          const response = checkedResponses && checkedResponses[owner];
          button.classList.add(response ? (response.correct ? "matched" : "wrong") : "assigned");
        }
      });
    }

    leftButtons.forEach((button) => {
      button.addEventListener("click", () => {
        selectedLeft = Number(button.dataset.index);
        renderMatches();
      });
    });

    rightButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (selectedLeft === null) return;
        const rightIndex = Number(button.dataset.index);
        const previousOwner = matches.findIndex((value, index) => value === rightIndex && index !== selectedLeft);
        if (previousOwner !== -1) matches[previousOwner] = null;
        matches[selectedLeft] = rightIndex;
        selectedLeft = null;
        checkedResponses = null;
        renderMatches();
        const assignedCount = matches.filter((match) => match !== null).length;
        setFeedback(document.getElementById("activityFeedback"), `${assignedCount}/${slide.pairs.length} pairs selected. Check your answers when ready.`, "success");
      });
    });

    document.getElementById("checkActivityBtn").addEventListener("click", () => {
      const submitted = LessonProgress.submitActivity(lessonId, slide.id, matches);
      const feedback = document.getElementById("activityFeedback");
      if (!submitted.ok) {
        setFeedback(feedback, submitted.message, "error");
        return;
      }

      checkedResponses = submitted.result.responses;
      renderMatches();
      const score = submitted.result;
      setFeedback(feedback, `${score.correct}/${score.total} correct. Your latest activity result has been saved.`, score.correct === score.total ? "success" : "error");
      notifyProgressUpdated();
    });

    document.getElementById("resetActivityBtn").addEventListener("click", () => {
      renderMatchingActivity(canvas, slide, lessonId);
    });
  }

  function renderFillBlankActivity(canvas, slide, lessonId) {
    if (!Array.isArray(slide.items) || !slide.items.length) {
      canvas.textContent = "This activity has no questions available.";
      return;
    }

    canvas.innerHTML = `
      <div>
        ${renderActivityHeader(slide, "Fill in the Blank")}
        <div class="activity-box">
          ${slide.items.map((item, index) => `
            <div class="blank-row">
              <span>${index + 1}. ${escapeHTML(item.before)}</span>
              <select class="blank-select" data-answer="${index}" aria-label="Answer for question ${index + 1}">
                <option value="">-- choose --</option>
                ${item.options.map((option) => `<option value="${escapeHTML(option)}">${escapeHTML(option)}</option>`).join("")}
              </select>
              <span>${escapeHTML(item.after)}</span>
            </div>
          `).join("")}
        </div>
      </div>
      <div class="activity-footer">
        <div id="activityFeedback" aria-live="polite"></div>
        <div class="activity-actions">
          <button type="button" class="btn-secondary" id="resetActivityBtn">Reset Answers</button>
          <button type="button" class="btn-primary" id="checkActivityBtn">Check Answers</button>
        </div>
      </div>
    `;

    document.getElementById("checkActivityBtn").addEventListener("click", () => {
      const answers = Array.from(canvas.querySelectorAll(".blank-select")).map((select) => select.value);
      const submitted = LessonProgress.submitActivity(lessonId, slide.id, answers);
      const feedback = document.getElementById("activityFeedback");
      if (!submitted.ok) {
        setFeedback(feedback, submitted.message, "error");
        return;
      }

      submitted.result.responses.forEach((response, index) => {
        const select = canvas.querySelector(`.blank-select[data-answer="${index}"]`);
        select.classList.toggle("correct", response.correct);
        select.classList.toggle("wrong", !response.correct);
      });
      setFeedback(feedback, `${submitted.result.correct}/${submitted.result.total} correct. Your latest activity result has been saved.`, submitted.result.correct === submitted.result.total ? "success" : "error");
      notifyProgressUpdated();
    });

    document.getElementById("resetActivityBtn").addEventListener("click", () => {
      renderFillBlankActivity(canvas, slide, lessonId);
    });
  }

  function renderSentenceBuilderActivity(canvas, slide, lessonId) {
    if (!Array.isArray(slide.sentences) || !slide.sentences.length) {
      canvas.textContent = "This activity has no sentences available.";
      return;
    }

    const built = slide.sentences.map(() => []);
    canvas.innerHTML = `
      <div>
        ${renderActivityHeader(slide, "Sentence Builder")}
        <div class="activity-box">
          ${slide.sentences.map((sentence, sentenceIndex) => `
            <section class="quiz-question-card">
              <div class="sentence-hint">Sentence ${sentenceIndex + 1}: ${escapeHTML(sentence.hint)}</div>
              <div class="sentence-dropzone" id="dropzone-${sentenceIndex}" aria-live="polite">Choose words below to build the sentence.</div>
              <div class="word-bank" id="wordbank-${sentenceIndex}">
                ${sentence.words.map((word, wordIndex) => `
                  <button type="button" class="word-chip" data-sentence="${sentenceIndex}" data-word="${wordIndex}">
                    ${escapeHTML(word)}
                  </button>
                `).join("")}
              </div>
            </section>
          `).join("")}
        </div>
      </div>
      <div class="activity-footer">
        <div id="activityFeedback" aria-live="polite"></div>
        <div class="activity-actions">
          <button type="button" class="btn-secondary" id="resetActivityBtn">Clear All</button>
          <button type="button" class="btn-primary" id="checkActivityBtn">Check Sentences</button>
        </div>
      </div>
    `;

    function renderDropzone(sentenceIndex) {
      const zone = document.getElementById(`dropzone-${sentenceIndex}`);
      zone.innerHTML = built[sentenceIndex].length
        ? built[sentenceIndex].map((item, position) => `
            <button type="button" class="word-chip placed" data-remove-position="${position}" aria-label="Remove ${escapeHTML(item.word)}">
              ${escapeHTML(item.word)} ✕
            </button>
          `).join("")
        : "Choose words below to build the sentence.";
    }

    canvas.querySelectorAll(".word-chip").forEach((button) => {
      button.addEventListener("click", () => {
        const sentenceIndex = Number(button.dataset.sentence);
        const wordIndex = Number(button.dataset.word);
        if (button.disabled) return;
        button.disabled = true;
        built[sentenceIndex].push({
          word: slide.sentences[sentenceIndex].words[wordIndex],
          wordIndex
        });
        renderDropzone(sentenceIndex);
      });
    });

    canvas.querySelectorAll(".sentence-dropzone").forEach((zone, sentenceIndex) => {
      zone.addEventListener("click", (event) => {
        const removeButton = event.target.closest("[data-remove-position]");
        if (!removeButton) return;
        const position = Number(removeButton.dataset.removePosition);
        const removed = built[sentenceIndex].splice(position, 1)[0];
        if (!removed) return;
        const button = canvas.querySelector(`.word-chip[data-sentence="${sentenceIndex}"][data-word="${removed.wordIndex}"]`);
        if (button) button.disabled = false;
        renderDropzone(sentenceIndex);
      });
    });

    document.getElementById("checkActivityBtn").addEventListener("click", () => {
      const answers = built.map((sentence) => sentence.map((item) => item.word).join(" "));
      const submitted = LessonProgress.submitActivity(lessonId, slide.id, answers);
      const feedback = document.getElementById("activityFeedback");
      if (!submitted.ok) {
        setFeedback(feedback, submitted.message, "error");
        return;
      }

      submitted.result.responses.forEach((response, index) => {
        const zone = document.getElementById(`dropzone-${index}`);
        zone.classList.toggle("correct", response.correct);
        zone.classList.toggle("wrong", !response.correct);
      });
      setFeedback(feedback, `${submitted.result.correct}/${submitted.result.total} sentences correct. Your latest activity result has been saved.`, submitted.result.correct === submitted.result.total ? "success" : "error");
      notifyProgressUpdated();
    });

    document.getElementById("resetActivityBtn").addEventListener("click", () => {
      renderSentenceBuilderActivity(canvas, slide, lessonId);
    });
  }

  function bindAudioButtons(canvas) {
    canvas.querySelectorAll("[data-speak]").forEach((button) => {
      button.addEventListener("click", () => {
        const text = button.getAttribute("data-speak");
        if (global.LessonPlayer) global.LessonPlayer.speakText(text, button);
      });
    });
  }

  global.LessonActivities = Object.freeze({ render: renderActivitySlide });
})(window);
