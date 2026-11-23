// Audio & Speech Synthesis Controller (Local file first, falls back to Web Speech API)
function speakEnglish(text, localAudioPath = "", btnEl = null) {
  if (btnEl) btnEl.classList.add("speaking");
  const clearBtn = () => {
    if (btnEl) btnEl.classList.remove("speaking");
  };

  if (localAudioPath) {
    const audio = new Audio(localAudioPath);
    audio.onended = clearBtn;
    audio.onerror = () => runTTS(text, clearBtn);
    audio.play().catch(() => runTTS(text, clearBtn));
  } else {
    runTTS(text, clearBtn);
  }
}

function runTTS(text, onDone) {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.92;
    utterance.onend = onDone;
    utterance.onerror = onDone;
    window.speechSynthesis.speak(utterance);
  } else {
    setTimeout(onDone, 700);
  }
}

function renderAudioButton(text, audioSrc = "", label = "Listen", iconOnly = false) {
  const safeText = text.replace(/"/g, "&quot;");
  const safeSrc = (audioSrc || "").replace(/"/g, "&quot;");
  if (iconOnly) {
    return `
      <button type="button" class="audio-btn icon-only" data-speak="${safeText}" data-audio="${safeSrc}" title="Listen" aria-label="Listen">
        🔊
      </button>`;
  }
  return `
    <button type="button" class="audio-btn" data-speak="${safeText}" data-audio="${safeSrc}">
      <span>🔊</span>
      <span>${label}</span>
    </button>`;
}

// Render Slide by Type
function renderSlideHTML(slide, lesson, playerState) {
  const headerHTML = `
    <div class="slide-header-bar">
      <div>
        <span class="slide-tag">${lesson.code} • Slide ${slide.number}</span>
        <h2 class="slide-title">${slide.title}</h2>
        ${slide.subtitle ? `<p class="slide-subtitle">${slide.subtitle}</p>` : ""}
      </div>
    </div>
  `;

  switch (slide.type) {
    case "hero":
      return `
        <div class="hero-slide-grid">
          <div class="hero-visual">
            ${getLessonIllustrationSVG(slide.illustration)}
          </div>
          <div class="hero-text">
            <span class="badge-accent">${lesson.code} • Slide ${slide.number}</span>
            <h2>${slide.heading}</h2>
            <p>${slide.description}</p>
            <div class="hero-actions">
              ${renderAudioButton(slide.audioText, slide.audioSrc, "Listen to Intro")}
              <button type="button" class="btn-primary" id="heroStartBtn">
                <span>${slide.ctaText || "Continue"}</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      `;

    case "vocab":
      return `
        ${headerHTML}
        <div class="vocab-grid">
          ${slide.cards
            .map(
              (c) => `
              <div class="vocab-card">
                <div class="vocab-icon">${c.icon}</div>
                <div class="vocab-word">${c.word}</div>
                <div class="vocab-hint">${c.hint}</div>
                ${renderAudioButton(c.word, c.audio, "Listen")}
              </div>`
            )
            .join("")}
        </div>
      `;

    case "phrases_match":
      return `
        ${headerHTML}
        <div class="two-col-board">
          <div class="phrase-list">
            ${slide.phrases
              .map(
                (p) => `
                <div class="phrase-row">
                  <div>
                    <strong>${p.text}</strong>
                    <span>${p.note}</span>
                  </div>
                  ${renderAudioButton(p.text, "", "", true)}
                </div>`
              )
              .join("")}
          </div>
          <div class="match-box" id="matchingActivity">
            <h4>Quick Match: Tap a left phrase, then its match</h4>
            <div class="match-columns">
              <div class="match-col" id="matchLeftCol"></div>
              <div class="match-col" id="matchRightCol"></div>
            </div>
            <div id="matchFeedback"></div>
          </div>
        </div>
      `;

    case "dialogue":
      return `
        ${headerHTML}
        <div class="dialogue-feed">
          ${slide.lines
            .map(
              (line) => `
              <div class="bubble-row ${line.side}">
                <div class="avatar-badge">${line.initials}</div>
                <div class="chat-bubble">
                  <div>
                    <span class="speaker-name">${line.speaker}</span>
                    <div class="bubble-text">${line.text}</div>
                  </div>
                  ${renderAudioButton(line.text, "", "", true)}
                </div>
              </div>`
            )
            .join("")}
        </div>
      `;

    case "dialogue_challenge":
    case "picture_id":
    case "listening":
    case "quiz":
      return `
        ${headerHTML}
        <div id="interactiveChallengeRoot"></div>
      `;

    case "family_tree":
      return `
        ${headerHTML}
        <div class="vocab-grid">
          ${slide.sentences
            .map(
              (s) => `
              <div class="vocab-card">
                <div class="vocab-icon">${s.icon}</div>
                <div class="vocab-word">${s.text}</div>
                <div class="vocab-hint">${s.role}</div>
                ${renderAudioButton(s.text, "", "Pronounce")}
              </div>`
            )
            .join("")}
        </div>
      `;

    case "sentence_builder":
      return `
        ${headerHTML}
        <div id="sentenceBuilderRoot"></div>
      `;

    case "house_rooms":
      return `
        ${headerHTML}
        <div class="house-map-grid" id="houseRoomsGrid">
          ${slide.rooms
            .map(
              (r, i) => `
              <button type="button" class="room-tile ${i === 0 ? "active" : ""}" data-room-idx="${i}">
                <span class="room-emoji">${r.emoji}</span>
                <strong>${r.name}</strong>
              </button>`
            )
            .join("")}
        </div>
        <div class="room-detail-bar" id="roomDetailBar">
          <div>
            <strong id="roomTitleText">${slide.rooms[0].name}</strong>:
            <span id="roomSentenceText">${slide.rooms[0].sentence}</span>
          </div>
          <div id="roomAudioWrap">
            ${renderAudioButton(slide.rooms[0].sentence, "", "Listen")}
          </div>
        </div>
      `;

    case "time_expressions":
      return `
        ${headerHTML}
        <div class="vocab-grid">
          ${slide.items
            .map(
              (t) => `
              <div class="vocab-card">
                <div class="vocab-icon">${t.icon}</div>
                <div class="vocab-word">${t.expr}</div>
                <div class="vocab-hint"><strong>${t.example}</strong><br/>${t.rule}</div>
                ${renderAudioButton(t.example, "", "Listen")}
              </div>`
            )
            .join("")}
        </div>
      `;

    case "sequence_order":
      return `
        ${headerHTML}
        <div id="sequenceOrderRoot"></div>
      `;

    case "wearing_examples":
      return `
        ${headerHTML}
        <div class="vocab-grid">
          ${slide.examples
            .map(
              (ex) => `
              <div class="vocab-card">
                <div class="vocab-icon">${ex.icon}</div>
                <span class="lesson-num-badge">${ex.character}</span>
                <div class="vocab-word">${ex.sentence}</div>
                ${renderAudioButton(ex.sentence, "", "Listen")}
              </div>`
            )
            .join("")}
        </div>
      `;

    case "dress_character":
      return `
        ${headerHTML}
        <div id="dressCharacterRoot"></div>
      `;

    case "grammar_table":
      return `
        ${headerHTML}
        <div class="phrase-list">
          ${slide.rows
            .map(
              (r) => `
              <div class="phrase-row">
                <div>
                  <strong>${r.pronoun} <span style="color:var(--red-accent)">${r.verb}</span></strong>
                  <span>Example: ${r.example}</span>
                </div>
                ${renderAudioButton(r.example, "", "Listen")}
              </div>`
            )
            .join("")}
        </div>
      `;

    case "pos_neg":
      return `
        ${headerHTML}
        <div class="phrase-list">
          ${slide.pairs
            .map(
              (p) => `
              <div class="phrase-row">
                <div>
                  <strong style="color:var(--green-success)">✓ ${p.positive}</strong>
                  <span>${p.tip}</span>
                </div>
                <div>
                  <strong style="color:var(--red-accent)">✕ ${p.negative}</strong>
                </div>
                ${renderAudioButton(`${p.positive} ${p.negative}`, "", "Listen")}
              </div>`
            )
            .join("")}
        </div>
      `;

    case "articles":
      return `
        ${headerHTML}
        <div class="vocab-grid">
          ${slide.cards
            .map(
              (c) => `
              <div class="vocab-card">
                <span class="badge-accent">${c.article}</span>
                <div class="vocab-icon">${c.icon}</div>
                <div class="vocab-word">${c.word}</div>
                <div class="vocab-hint">${c.rule}</div>
                ${renderAudioButton(c.word, "", "Listen")}
              </div>`
            )
            .join("")}
        </div>
      `;

    case "fill_blanks":
      return `
        ${headerHTML}
        <div id="fillBlanksRoot"></div>
      `;

    case "complete":
      return renderCompletionSlide(slide, lesson, playerState);

    case "final_congrats":
      return renderFinalCongratsSlide(slide, playerState);

    default:
      return `${headerHTML}<p>Slide content ready.</p>`;
  }
}

function renderCompletionSlide(slide, lesson, playerState) {
  const scoreData = playerState.scores[lesson.id] || { correct: 0, total: 5 };
  const pct = scoreData.total > 0 ? Math.round((scoreData.correct / scoreData.total) * 100) : 100;
  return `
    <div class="complete-card">
      <div class="trophy-circle">🏆</div>
      <span class="badge-accent">${lesson.code} Completed</span>
      <h2 class="slide-title" style="margin-top:10px;">Congratulations!</h2>
      <p class="slide-subtitle">${slide.message}</p>

      <div class="score-summary-grid">
        <div class="score-stat">
          <strong>${pct}%</strong>
          <span>Final Score</span>
        </div>
        <div class="score-stat">
          <strong>${scoreData.correct} / ${scoreData.total}</strong>
          <span>Correct Answers</span>
        </div>
        <div class="score-stat">
          <strong>${lesson.slideCount}</strong>
          <span>Slides Completed</span>
        </div>
      </div>

      <div class="complete-actions">
        <button type="button" class="btn-secondary" id="reviewMistakesBtn">Review Mistakes</button>
        <a href="learning.html?lesson=${slide.nextLessonId}" class="btn-primary">Next Lesson →</a>
      </div>
    </div>
  `;
}

function renderFinalCongratsSlide(slide, playerState) {
  const fullState = loadProgressState();
  const completedLessons = Object.values(fullState.lessons || {}).filter((l) => l.completed).length;
  let totalCorrect = 0;
  let totalQuestions = 0;
  Object.values(playerState.scores || {}).forEach((s) => {
    totalCorrect += s.correct || 0;
    totalQuestions += s.total || 0;
  });
  const avgPct = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 100;

  return `
    <div class="complete-card">
      <div class="trophy-circle">🎓</div>
      <span class="badge-accent">A1 Beginner Track Complete</span>
      <h2 class="slide-title" style="margin-top:10px;">Congratulations!</h2>
      <p class="slide-subtitle">${slide.message}</p>

      <div class="score-summary-grid">
        <div class="score-stat">
          <strong>${Math.max(completedLessons, 1)} / 5</strong>
          <span>Total Lessons</span>
        </div>
        <div class="score-stat">
          <strong>${avgPct}%</strong>
          <span>Total Score</span>
        </div>
        <div class="score-stat">
          <strong>A1</strong>
          <span>Level Achieved</span>
        </div>
      </div>

      <div class="complete-actions">
        <button type="button" class="btn-secondary" id="reviewMistakesBtn">Review Mistakes</button>
        <a href="learning.html?lesson=1" class="btn-secondary">Review Lessons</a>
        <a href="../index.html" class="btn-primary">Return to Lessons</a>
      </div>
    </div>
  `;
}

// Mount Interactive Event Handlers After Slide Renders
function mountSlideInteractions(slide, lesson, callbacks) {
  // Bind all audio buttons
  document.querySelectorAll("[data-speak]").forEach((btn) => {
    btn.addEventListener("click", () => {
      speakEnglish(btn.getAttribute("data-speak"), btn.getAttribute("data-audio"), btn);
    });
  });

  // Hero start button
  const heroStart = document.getElementById("heroStartBtn");
  if (heroStart) {
    heroStart.addEventListener("click", () => callbacks.goNext());
  }

  // Matching activity
  if (slide.type === "phrases_match") {
    initMatchingActivity(slide.pairs);
  }

  // Step-by-step MCQ / Listening / Picture ID / Quiz
  if (["dialogue_challenge", "picture_id", "listening", "quiz"].includes(slide.type)) {
    initStepQuizActivity(slide, lesson, callbacks);
  }

  // Sentence Builder
  if (slide.type === "sentence_builder") {
    initSentenceBuilder(slide.sentences);
  }

  // House clickable rooms
  if (slide.type === "house_rooms") {
    document.querySelectorAll(".room-tile").forEach((tile) => {
      tile.addEventListener("click", () => {
        document.querySelectorAll(".room-tile").forEach((t) => t.classList.remove("active"));
        tile.classList.add("active");
        const room = slide.rooms[parseInt(tile.dataset.roomIdx, 10)];
        document.getElementById("roomTitleText").textContent = room.name;
        document.getElementById("roomSentenceText").textContent = room.sentence;
        const wrap = document.getElementById("roomAudioWrap");
        wrap.innerHTML = renderAudioButton(room.sentence, "", "Listen");
        wrap.querySelector("button").addEventListener("click", (e) => {
          speakEnglish(room.sentence, "", e.currentTarget);
        });
        speakEnglish(room.name);
      });
    });
  }

  // Sequence ordering
  if (slide.type === "sequence_order") {
    initSequenceOrder(slide.correctOrder);
  }

  // Dress character
  if (slide.type === "dress_character") {
    initDressCharacter(slide);
  }

  // Fill in the blanks
  if (slide.type === "fill_blanks") {
    initFillBlanks(slide.items);
  }

  // Review mistakes modal
  const reviewBtn = document.getElementById("reviewMistakesBtn");
  if (reviewBtn) {
    reviewBtn.addEventListener("click", () => callbacks.openMistakesModal());
  }
}

function initMatchingActivity(pairs) {
  const leftCol = document.getElementById("matchLeftCol");
  const rightCol = document.getElementById("matchRightCol");
  const feedback = document.getElementById("matchFeedback");
  if (!leftCol || !rightCol) return;

  let selectedLeft = null;
  let matchedCount = 0;
  const rightItems = [...pairs].map((p, idx) => ({ text: p.right, idx })).sort(() => Math.random() - 0.5);

  leftCol.innerHTML = pairs
    .map((p, idx) => `<button type="button" class="match-chip" data-left="${idx}">${p.left}</button>`)
    .join("");
  rightCol.innerHTML = rightItems
    .map((r) => `<button type="button" class="match-chip" data-right="${r.idx}">${r.text}</button>`)
    .join("");

  leftCol.querySelectorAll(".match-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("matched")) return;
      leftCol.querySelectorAll(".match-chip").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedLeft = btn;
    });
  });

  rightCol.querySelectorAll(".match-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!selectedLeft || btn.classList.contains("matched")) return;
      const lIdx = selectedLeft.dataset.left;
      const rIdx = btn.dataset.right;
      if (lIdx === rIdx) {
        selectedLeft.classList.remove("selected");
        selectedLeft.classList.add("matched");
        btn.classList.add("matched");
        selectedLeft = null;
        matchedCount++;
        feedback.innerHTML = `<div class="feedback-banner success">Great match! (${matchedCount}/${pairs.length})</div>`;
      } else {
        feedback.innerHTML = `<div class="feedback-banner error">Not quite — try matching again!</div>`;
      }
    });
  });
}

function initStepQuizActivity(slide, lesson, callbacks) {
  const root = document.getElementById("interactiveChallengeRoot");
  if (!root) return;

  const items = slide.steps || slide.items || slide.tasks || slide.questions || [];
  let idx = 0;
  let correctCount = 0;
  const mistakes = [];

  function renderStep() {
    const item = items[idx];
    const promptText = item.prompt || item.clue || item.question || item.q;
    const isQuiz = slide.type === "quiz";

    root.innerHTML = `
      <div class="challenge-card">
        <div class="prompt-banner">
          <span>${item.icon ? `<strong style="font-size:1.4rem;margin-right:8px;">${item.icon}</strong>` : ""}${promptText}</span>
          ${item.audioText ? renderAudioButton(item.audioText, "", "Play Audio") : ""}
        </div>
        <div class="options-grid">
          ${item.options
            .map(
              (opt, oIdx) => `
              <button type="button" class="option-btn" data-opt="${oIdx}">
                <span>${String.fromCharCode(65 + oIdx)}.</span>
                <span>${opt}</span>
              </button>`
            )
            .join("")}
        </div>
        <div id="stepFeedbackArea"></div>
        <div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:0.82rem;font-weight:700;color:var(--text-muted);">Item ${idx + 1} of ${items.length}</span>
          <button type="button" class="btn-primary hidden" id="nextStepItemBtn">
            ${idx < items.length - 1 ? "Next Question →" : "See Results ✓"}
          </button>
        </div>
      </div>
    `;

    root.querySelectorAll("[data-speak]").forEach((b) => {
      b.addEventListener("click", () => speakEnglish(b.dataset.speak, "", b));
    });

    let answered = false;
    root.querySelectorAll(".option-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (answered) return;
        answered = true;
        const chosen = parseInt(btn.dataset.opt, 10);
        const isRight = chosen === item.answer;

        root.querySelectorAll(".option-btn").forEach((b, bIdx) => {
          b.disabled = true;
          if (bIdx === item.answer) b.classList.add("correct");
          else if (bIdx === chosen && !isRight) b.classList.add("wrong");
        });

        const fb = document.getElementById("stepFeedbackArea");
        if (isRight) {
          correctCount++;
          fb.innerHTML = `<div class="feedback-banner success">✓ Correct! ${item.explanation || ""}</div>`;
        } else {
          mistakes.push({
            question: promptText,
            yourAnswer: item.options[chosen],
            correctAnswer: item.options[item.answer],
            explanation: item.explanation || ""
          });
          fb.innerHTML = `<div class="feedback-banner error">✕ Incorrect. ${item.explanation || ""}</div>`;
        }

        const nextBtn = document.getElementById("nextStepItemBtn");
        nextBtn.classList.remove("hidden");
        nextBtn.addEventListener("click", () => {
          if (idx < items.length - 1) {
            idx++;
            renderStep();
          } else {
            if (isQuiz) {
              callbacks.recordQuizScore(lesson.id, correctCount, items.length, mistakes);
            }
            root.innerHTML = `
              <div class="challenge-card" style="text-align:center;">
                <h3 style="color:var(--navy);margin-bottom:6px;">Activity Complete!</h3>
                <p style="font-weight:700;color:var(--primary-blue);margin-bottom:14px;">
                  You scored ${correctCount} out of ${items.length}.
                </p>
                <button type="button" class="btn-secondary" id="retryActivityBtn">Practice Again</button>
              </div>
            `;
            document.getElementById("retryActivityBtn").addEventListener("click", () => {
              idx = 0;
              correctCount = 0;
              mistakes.length = 0;
              renderStep();
            });
          }
        });
      });
    });
  }

  renderStep();
}

function initSentenceBuilder(sentences) {
  const root = document.getElementById("sentenceBuilderRoot");
  if (!root) return;
  let sIdx = 0;

  function renderBuilder() {
    const current = sentences[sIdx];
    const shuffled = [...current.words].sort(() => Math.random() - 0.5);
    let built = [];

    root.innerHTML = `
      <div class="challenge-card">
        <div class="prompt-banner">
          <span>Sentence ${sIdx + 1}/${sentences.length}: <em>${current.hint}</em></span>
        </div>
        <div class="sentence-dropzone" id="dropZone"><span style="color:var(--text-muted);font-size:0.86rem;">Click words below to build the sentence...</span></div>
        <div class="word-bank" id="wordBank">
          ${shuffled.map((w, i) => `<button type="button" class="word-token" data-widx="${i}" data-word="${w}">${w}</button>`).join("")}
        </div>
        <div style="display:flex;gap:10px;">
          <button type="button" class="btn-primary" id="checkSentenceBtn">Check Sentence</button>
          <button type="button" class="btn-secondary" id="clearSentenceBtn">Clear</button>
        </div>
        <div id="builderFeedback"></div>
      </div>
    `;

    const dropZone = document.getElementById("dropZone");
    const wordBank = document.getElementById("wordBank");

    function updateDropZone() {
      if (built.length === 0) {
        dropZone.innerHTML = `<span style="color:var(--text-muted);font-size:0.86rem;">Click words below to build the sentence...</span>`;
      } else {
        dropZone.innerHTML = built.map((item) => `<span class="word-token placed">${item.word}</span>`).join("");
      }
    }

    wordBank.querySelectorAll(".word-token").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        btn.disabled = true;
        btn.style.opacity = "0.4";
        built.push({ idx: btn.dataset.widx, word: btn.dataset.word });
        updateDropZone();
      });
    });

    document.getElementById("clearSentenceBtn").addEventListener("click", () => {
      built = [];
      wordBank.querySelectorAll(".word-token").forEach((b) => {
        b.disabled = false;
        b.style.opacity = "1";
      });
      updateDropZone();
      document.getElementById("builderFeedback").innerHTML = "";
    });

    document.getElementById("checkSentenceBtn").addEventListener("click", () => {
      const attempt = built.map((b) => b.word).join(" ");
      const target = current.words.join(" ");
      const fb = document.getElementById("builderFeedback");
      if (attempt === target) {
        speakEnglish(target);
        fb.innerHTML = `
          <div class="feedback-banner success">
            ✓ Perfect! "${target}"
            ${sIdx < sentences.length - 1 ? `<button type="button" class="btn-primary" id="nextSentenceBtn" style="margin-left:12px;padding:6px 14px;">Next →</button>` : ""}
          </div>`;
        const nextBtn = document.getElementById("nextSentenceBtn");
        if (nextBtn) {
          nextBtn.addEventListener("click", () => {
            sIdx++;
            renderBuilder();
          });
        }
      } else {
        fb.innerHTML = `<div class="feedback-banner error">✕ Not quite right. Check the word order and try again!</div>`;
      }
    });
  }

  renderBuilder();
}

function initSequenceOrder(correctOrder) {
  const root = document.getElementById("sequenceOrderRoot");
  if (!root) return;

  const shuffled = [...correctOrder].sort(() => Math.random() - 0.5);
  let chosen = [];

  function render() {
    root.innerHTML = `
      <div class="challenge-card">
        <div class="sentence-dropzone">
          ${
            chosen.length
              ? chosen.map((c) => `<span class="word-token placed">${c}</span>`).join("")
              : `<span style="color:var(--text-muted);font-size:0.86rem;">Tap the routine actions in chronological order (morning to night)...</span>`
          }
        </div>
        <div class="word-bank">
          ${shuffled
            .map(
              (item) => `
              <button type="button" class="word-token" ${chosen.includes(item) ? "disabled style='opacity:0.4'" : ""} data-seq="${item}">
                ${item}
              </button>`
            )
            .join("")}
        </div>
        <div style="display:flex;gap:10px;">
          <button type="button" class="btn-primary" id="checkSeqBtn">Check Order</button>
          <button type="button" class="btn-secondary" id="resetSeqBtn">Reset</button>
        </div>
        <div id="seqFeedback"></div>
      </div>
    `;

    root.querySelectorAll("[data-seq]").forEach((btn) => {
      btn.addEventListener("click", () => {
        chosen.push(btn.dataset.seq);
        render();
      });
    });

    document.getElementById("resetSeqBtn").addEventListener("click", () => {
      chosen = [];
      render();
    });

    document.getElementById("checkSeqBtn").addEventListener("click", () => {
      const fb = document.getElementById("seqFeedback");
      const isRight = chosen.length === correctOrder.length && chosen.every((v, i) => v === correctOrder[i]);
      if (isRight) {
        fb.innerHTML = `<div class="feedback-banner success">✓ Excellent! Your daily routine is in the exact right order.</div>`;
      } else {
        fb.innerHTML = `<div class="feedback-banner error">✕ Select all 6 steps from Wake up to Go to bed in order.</div>`;
      }
    });
  }

  render();
}

function initDressCharacter(slide) {
  const root = document.getElementById("dressCharacterRoot");
  if (!root) return;
  let picked = { top: "", bottom: "", shoes: "" };

  root.innerHTML = `
    <div class="challenge-card">
      <div class="prompt-banner"><span>${slide.mission}</span></div>
      <div class="two-col-board">
        <div class="phrase-list">
          <div>
            <strong>1. Top:</strong>
            <div class="word-bank" style="margin-top:6px;">
              ${slide.choices.tops.map((t) => `<button type="button" class="word-token" data-part="top" data-val="${t}">${t}</button>`).join("")}
            </div>
          </div>
          <div>
            <strong>2. Bottom:</strong>
            <div class="word-bank" style="margin-top:6px;">
              ${slide.choices.bottoms.map((b) => `<button type="button" class="word-token" data-part="bottom" data-val="${b}">${b}</button>`).join("")}
            </div>
          </div>
          <div>
            <strong>3. Footwear:</strong>
            <div class="word-bank" style="margin-top:6px;">
              ${slide.choices.shoes.map((s) => `<button type="button" class="word-token" data-part="shoes" data-val="${s}">${s}</button>`).join("")}
            </div>
          </div>
        </div>
        <div class="vocab-card" style="justify-content:center;">
          <div style="font-size:2.6rem;">🧑</div>
          <strong>Adam's Outfit</strong>
          <p id="outfitPreview" style="font-size:0.88rem;color:var(--text-muted);">Select items on the left...</p>
          <button type="button" class="btn-primary" id="checkOutfitBtn">Check Outfit</button>
          <div id="outfitFeedback"></div>
        </div>
      </div>
    </div>
  `;

  root.querySelectorAll("[data-part]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const part = btn.dataset.part;
      picked[part] = btn.dataset.val;
      root.querySelectorAll(`[data-part="${part}"]`).forEach((b) => b.classList.remove("placed"));
      btn.classList.add("placed");
      document.getElementById("outfitPreview").textContent =
        `${picked.top || "?"} • ${picked.bottom || "?"} • ${picked.shoes || "?"}`;
    });
  });

  document.getElementById("checkOutfitBtn").addEventListener("click", () => {
    const fb = document.getElementById("outfitFeedback");
    if (
      picked.top === slide.target.top &&
      picked.bottom === slide.target.bottom &&
      picked.shoes === slide.target.shoes
    ) {
      speakEnglish("Adam is wearing a blue T-shirt, black trousers, and red shoes.");
      fb.innerHTML = `<div class="feedback-banner success">✓ Great job! Adam is dressed properly.</div>`;
    } else {
      fb.innerHTML = `<div class="feedback-banner error">✕ Check the mission instructions and try again!</div>`;
    }
  });
}

function initFillBlanks(items) {
  const root = document.getElementById("fillBlanksRoot");
  if (!root) return;

  root.innerHTML = `
    <div class="challenge-card">
      <div class="phrase-list">
        ${items
          .map(
            (item, i) => `
            <div class="phrase-row">
              <div>
                <strong>${item.before}</strong>
                <select class="blank-select" data-blank-idx="${i}">
                  <option value="">-- choose --</option>
                  ${item.options.map((o) => `<option value="${o}">${o}</option>`).join("")}
                </select>
                <strong>${item.after}</strong>
              </div>
              <span id="blankMark-${i}" style="font-weight:800;"></span>
            </div>`
          )
          .join("")}
      </div>
      <div style="margin-top:14px;">
        <button type="button" class="btn-primary" id="checkBlanksBtn">Check Answers</button>
      </div>
      <div id="blanksSummary"></div>
    </div>
  `;

  document.getElementById("checkBlanksBtn").addEventListener("click", () => {
    let score = 0;
    items.forEach((item, i) => {
      const sel = root.querySelector(`[data-blank-idx="${i}"]`);
      const mark = document.getElementById(`blankMark-${i}`);
      if (sel.value === item.answer) {
        score++;
        mark.textContent = "✓";
        mark.style.color = "var(--green-success)";
      } else {
        mark.textContent = `✕ (${item.answer})`;
        mark.style.color = "var(--red-accent)";
      }
    });
    const summary = document.getElementById("blanksSummary");
    summary.innerHTML = `<div class="feedback-banner ${score === items.length ? "success" : "error"}">You got ${score} out of ${items.length} correct!</div>`;
  });
}
function recordActivityResult(lessonId, slideId, correctCount, totalCount, mistakeItems) {
  const state = loadProgressState();
  if (!state.activityScores) state.activityScores = {};
  const key = `${lessonId}_${slideId}`;
  const isFirstClear = !state.activityScores[key];
  state.activityScores[key] = { correct: correctCount, total: totalCount };

  let sumCorrect = 0;
  let sumTotal = 0;
  Object.keys(state.activityScores).forEach((k) => {
    if (k.startsWith(`${lessonId}_`)) {
      sumCorrect += state.activityScores[k].correct;
      sumTotal += state.activityScores[k].total;
    }
  });
  state.scores[lessonId] = { correct: sumCorrect, total: sumTotal };

  if (!state.mistakes[lessonId]) state.mistakes[lessonId] = [];
  state.mistakes[lessonId] = state.mistakes[lessonId].filter((m) => m.slideId !== slideId);
  mistakeItems.forEach((m) => {
    state.mistakes[lessonId].push({ slideId, ...m });
  });

  saveProgressState(state);

  if (isFirstClear && correctCount > 0 && typeof awardXP === "function") {
    const bonus = correctCount === totalCount ? 15 : 10;
    awardXP(bonus, correctCount === totalCount ? "Perfect Activity!" : "Activity Checked");
  }
}

function renderActivitySlide(canvas, slide, lessonId) {
  if (slide.activityType === "mcq" || slide.activityType === "listening") {
    renderMCQActivity(canvas, slide, lessonId);
  } else if (slide.activityType === "matching") {
    renderMatchingActivity(canvas, slide, lessonId);
  } else if (slide.activityType === "fillBlank") {
    renderFillBlankActivity(canvas, slide, lessonId);
  } else if (slide.activityType === "sentenceBuilder") {
    renderSentenceBuilderActivity(canvas, slide, lessonId);
  }
}

/* 1. Multiple Choice & Listening Quiz */
function renderMCQActivity(canvas, slide, lessonId) {
  const selectedAnswers = {};

  canvas.innerHTML = `
    <div>
      <div class="slide-header-bar">
        <span class="slide-tag">${slide.activityType === "listening" ? "🎧 Listening Activity" : "⚡ Practice Quiz"}</span>
        <span class="badge-lime">+15 XP</span>
      </div>
      <h2 class="slide-title">${slide.title}</h2>
      <p class="slide-subtitle">${slide.instruction}</p>

      <div class="activity-box">
        ${slide.questions
          .map(
            (q, qIdx) => `
          <div class="quiz-question-card" data-qidx="${qIdx}">
            <div class="quiz-prompt">
              <span>${qIdx + 1}. ${q.prompt}</span>
              ${q.audioText ? `<button class="audio-btn" data-speak="${escapeAttr(q.audioText)}">🔊 Listen</button>` : ""}
            </div>
            <div class="options-row">
              ${q.options
                .map(
                  (opt, oIdx) => `
                <button class="option-btn" data-qidx="${qIdx}" data-oidx="${oIdx}">${opt}</button>
              `
                )
                .join("")}
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    </div>

    <div class="activity-footer">
      <div id="mcqFeedback"></div>
      <div style="display:flex;gap:10px;">
        <button class="btn-secondary" id="resetMcqBtn">Reset</button>
        <button class="btn-primary" id="checkMcqBtn">Check Answers</button>
      </div>
    </div>
  `;

  canvas.querySelectorAll(".option-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const qIdx = parseInt(btn.getAttribute("data-qidx"), 10);
      const oIdx = parseInt(btn.getAttribute("data-oidx"), 10);
      selectedAnswers[qIdx] = oIdx;

      canvas.querySelectorAll(`.option-btn[data-qidx="${qIdx}"]`).forEach((b) => {
        b.classList.remove("selected", "correct", "wrong");
      });
      btn.classList.add("selected");
    });
  });

  document.getElementById("checkMcqBtn").addEventListener("click", () => {
    let correctCount = 0;
    const mistakes = [];

    slide.questions.forEach((q, qIdx) => {
      const chosen = selectedAnswers[qIdx];
      const buttons = canvas.querySelectorAll(`.option-btn[data-qidx="${qIdx}"]`);
      buttons.forEach((b, idx) => {
        b.classList.remove("selected", "correct", "wrong");
        if (idx === q.answer) b.classList.add("correct");
        if (chosen === idx && chosen !== q.answer) b.classList.add("wrong");
      });

      if (chosen === q.answer) {
        correctCount++;
      } else {
        mistakes.push({
          prompt: q.prompt,
          userAnswer: chosen !== undefined ? q.options[chosen] : "No answer selected",
          correctAnswer: q.options[q.answer]
        });
      }
    });

    recordActivityResult(lessonId, slide.id, correctCount, slide.questions.length, mistakes);
    const fb = document.getElementById("mcqFeedback");
    const allRight = correctCount === slide.questions.length;
    fb.innerHTML = `<div class="feedback-banner ${allRight ? "success" : "error"}">
      ${allRight ? `🎉 Excellent! ${correctCount}/${slide.questions.length} correct!` : `You got ${correctCount}/${slide.questions.length}. Green shows the correct answer.`}
    </div>`;
  });

  document.getElementById("resetMcqBtn").addEventListener("click", () => {
    renderMCQActivity(canvas, slide, lessonId);
  });
}

/* 2. Matching Activity */
function renderMatchingActivity(canvas, slide, lessonId) {
  let selectedLeft = null;
  const matchedIndices = new Set();
  const rightItems = slide.pairs
    .map((p, idx) => ({ text: p.right, origIdx: idx }))
    .sort((a, b) => a.text.localeCompare(b.text));

  canvas.innerHTML = `
    <div>
      <div class="slide-header-bar">
        <span class="slide-tag">🔗 Matching Activity</span>
        <span class="badge-lime">+15 XP</span>
      </div>
      <h2 class="slide-title">${slide.title}</h2>
      <p class="slide-subtitle">${slide.instruction}</p>

      <div class="matching-grid">
        <div class="match-col" id="matchLeftCol">
          ${slide.pairs
            .map(
              (p, idx) => `
            <button class="match-item" data-side="left" data-idx="${idx}">
              <span>${p.left}</span>
              <span>•</span>
            </button>
          `
            )
            .join("")}
        </div>
        <div class="match-col" id="matchRightCol">
          ${rightItems
            .map(
              (r) => `
            <button class="match-item" data-side="right" data-idx="${r.origIdx}">
              <span>${r.text}</span>
            </button>
          `
            )
            .join("")}
        </div>
      </div>
    </div>

    <div class="activity-footer">
      <div id="matchFeedback"></div>
      <button class="btn-secondary" id="resetMatchBtn">Reset Pairs</button>
    </div>
  `;

  const leftBtns = canvas.querySelectorAll('[data-side="left"]');
  const rightBtns = canvas.querySelectorAll('[data-side="right"]');

  leftBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-idx"), 10);
      if (matchedIndices.has(idx)) return;
      leftBtns.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedLeft = idx;
    });
  });

  rightBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (selectedLeft === null) return;
      const rightIdx = parseInt(btn.getAttribute("data-idx"), 10);
      if (matchedIndices.has(rightIdx)) return;

      const leftBtn = canvas.querySelector(`[data-side="left"][data-idx="${selectedLeft}"]`);

      if (selectedLeft === rightIdx) {
        matchedIndices.add(rightIdx);
        leftBtn.classList.remove("selected");
        leftBtn.classList.add("matched");
        btn.classList.add("matched");
        selectedLeft = null;

        recordActivityResult(lessonId, slide.id, matchedIndices.size, slide.pairs.length, []);
        if (matchedIndices.size === slide.pairs.length) {
          document.getElementById("matchFeedback").innerHTML =
            `<div class="feedback-banner success">🎉 All pairs matched! Great job!</div>`;
        }
      } else {
        btn.classList.add("shake");
        setTimeout(() => btn.classList.remove("shake"), 450);
      }
    });
  });

  document.getElementById("resetMatchBtn").addEventListener("click", () => {
    renderMatchingActivity(canvas, slide, lessonId);
  });
}

/* 3. Fill in the Blank Activity */
function renderFillBlankActivity(canvas, slide, lessonId) {
  canvas.innerHTML = `
    <div>
      <div class="slide-header-bar">
        <span class="slide-tag">✏️ Fill in the Blank</span>
        <span class="badge-lime">+15 XP</span>
      </div>
      <h2 class="slide-title">${slide.title}</h2>
      <p class="slide-subtitle">${slide.instruction}</p>

      <div class="activity-box">
        ${slide.items
          .map(
            (item, idx) => `
          <div class="blank-row">
            <span>${idx + 1}. ${item.before}</span>
            <select class="blank-select" data-bidx="${idx}">
              <option value="">-- choose --</option>
              ${item.options.map((opt) => `<option value="${opt}">${opt}</option>`).join("")}
            </select>
            <span>${item.after}</span>
          </div>
        `
          )
          .join("")}
      </div>
    </div>

    <div class="activity-footer">
      <div id="blankFeedback"></div>
      <div style="display:flex;gap:10px;">
        <button class="btn-secondary" id="resetBlankBtn">Reset</button>
        <button class="btn-primary" id="checkBlankBtn">Check Answers</button>
      </div>
    </div>
  `;

  document.getElementById("checkBlankBtn").addEventListener("click", () => {
    let correctCount = 0;
    const mistakes = [];

    slide.items.forEach((item, idx) => {
      const sel = canvas.querySelector(`.blank-select[data-bidx="${idx}"]`);
      const val = sel.value;
      sel.classList.remove("correct", "wrong");

      if (val === item.answer) {
        correctCount++;
        sel.classList.add("correct");
      } else {
        sel.classList.add("wrong");
        mistakes.push({
          prompt: `${item.before} ___ ${item.after}`,
          userAnswer: val || "(blank)",
          correctAnswer: item.answer
        });
      }
    });

    recordActivityResult(lessonId, slide.id, correctCount, slide.items.length, mistakes);
    const allRight = correctCount === slide.items.length;
    document.getElementById("blankFeedback").innerHTML = `
      <div class="feedback-banner ${allRight ? "success" : "error"}">
        ${allRight ? `🎉 Perfect! ${correctCount}/${slide.items.length} correct!` : `${correctCount}/${slide.items.length} correct. Check the red boxes and try again.`}
      </div>
    `;
  });

  document.getElementById("resetBlankBtn").addEventListener("click", () => {
    renderFillBlankActivity(canvas, slide, lessonId);
  });
}

/* 4. Sentence Builder Activity */
function renderSentenceBuilderActivity(canvas, slide, lessonId) {
  const userSentences = slide.sentences.map(() => []);

  canvas.innerHTML = `
    <div>
      <div class="slide-header-bar">
        <span class="slide-tag">🧩 Sentence Builder</span>
        <span class="badge-lime">+15 XP</span>
      </div>
      <h2 class="slide-title">${slide.title}</h2>
      <p class="slide-subtitle">${slide.instruction}</p>

      <div class="activity-box">
        ${slide.sentences
          .map(
            (s, sIdx) => `
          <div class="quiz-question-card" data-sidx="${sIdx}">
            <div style="font-size:0.85rem;font-weight:800;color:var(--text-muted);margin-bottom:6px;">
              Sentence ${sIdx + 1} (${s.hint}):
            </div>
            <div class="sentence-dropzone" id="dropzone_${sIdx}">
              <span style="color:var(--text-muted);font-size:0.85rem;">Click words below to build the sentence...</span>
            </div>
            <div class="word-bank" id="bank_${sIdx}">
              ${s.words
                .map(
                  (w, wIdx) => `
                <button class="word-chip" data-sidx="${sIdx}" data-widx="${wIdx}" data-word="${escapeAttr(w)}">${w}</button>
              `
                )
                .join("")}
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    </div>

    <div class="activity-footer">
      <div id="builderFeedback"></div>
      <div style="display:flex;gap:10px;">
        <button class="btn-secondary" id="resetBuilderBtn">Clear All</button>
        <button class="btn-primary" id="checkBuilderBtn">Check Sentences</button>
      </div>
    </div>
  `;

  function refreshDropzone(sIdx) {
    const zone = document.getElementById(`dropzone_${sIdx}`);
    const chosen = userSentences[sIdx];
    if (chosen.length === 0) {
      zone.innerHTML = `<span style="color:var(--text-muted);font-size:0.85rem;">Click words below to build the sentence...</span>`;
      return;
    }
    zone.innerHTML = chosen
      .map(
        (item, pos) => `
        <button class="word-chip" style="background:var(--primary-purple);color:#201A2B;" data-remove-sidx="${sIdx}" data-pos="${pos}">
          ${item.word} ✕
        </button>
      `
      )
      .join("");

    zone.querySelectorAll("[data-remove-sidx]").forEach((remBtn) => {
      remBtn.addEventListener("click", () => {
        const pos = parseInt(remBtn.getAttribute("data-pos"), 10);
        const removed = userSentences[sIdx].splice(pos, 1)[0];
        const origChip = canvas.querySelector(`.word-chip[data-sidx="${sIdx}"][data-widx="${removed.wIdx}"]`);
        if (origChip) origChip.disabled = false;
        refreshDropzone(sIdx);
      });
    });
  }

  canvas.querySelectorAll(".word-bank .word-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const sIdx = parseInt(chip.getAttribute("data-sidx"), 10);
      const wIdx = parseInt(chip.getAttribute("data-widx"), 10);
      const word = chip.getAttribute("data-word");
      chip.disabled = true;
      userSentences[sIdx].push({ word, wIdx });
      refreshDropzone(sIdx);
    });
  });

  document.getElementById("checkBuilderBtn").addEventListener("click", () => {
    let correctCount = 0;
    const mistakes = [];

    slide.sentences.forEach((s, sIdx) => {
      const built = userSentences[sIdx].map((x) => x.word).join(" ");
      const zone = document.getElementById(`dropzone_${sIdx}`);
      if (built === s.target) {
        correctCount++;
        zone.style.borderColor = "var(--green-success)";
      } else {
        zone.style.borderColor = "var(--red-accent)";
        mistakes.push({
          prompt: `Sentence ${sIdx + 1} (${s.hint})`,
          userAnswer: built || "(empty)",
          correctAnswer: s.target
        });
      }
    });

    recordActivityResult(lessonId, slide.id, correctCount, slide.sentences.length, mistakes);
    const allRight = correctCount === slide.sentences.length;
    document.getElementById("builderFeedback").innerHTML = `
      <div class="feedback-banner ${allRight ? "success" : "error"}">
        ${allRight ? `🎉 Well done! All sentences are correct!` : `${correctCount}/${slide.sentences.length} correct. Click a placed word to remove and reorder.`}
      </div>
    `;
  });

  document.getElementById("resetBuilderBtn").addEventListener("click", () => {
    renderSentenceBuilderActivity(canvas, slide, lessonId);
  });
}