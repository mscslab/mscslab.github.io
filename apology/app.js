const INVITEE_NAME = "عزیزم";
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xnjeygdy";
const TIME_ZONE = "Asia/Tehran";
const PENDING_ANSWERS_KEY = "mahdi-apology-pending-answers-v1";
const RETRY_DELAYS = [2_000, 5_000, 10_000, 30_000, 60_000];
const REQUEST_TIMEOUT = 12_000;
const inviteeName = INVITEE_NAME.trim() || "عزیزم";

const questions = [
  {
    id: "continue",
    label: "سوال ۱",
    prompt: "الان دوست داری این فرم رو ادامه بدی؟",
    type: "choice",
    required: true,
    options: [
      { label: "آره", value: "آره", action: "continue" },
      {
        label: "نه، فعلاً آمادگی ندارم",
        value: "نه، فعلاً آمادگی ندارم",
        action: "stop",
      },
    ],
  },
  {
    id: "feeling",
    label: "سوال ۲",
    prompt: "الان حالت نسبت به من بیشتر شبیه کدومه؟",
    type: "choice",
    options: [
      { label: "هنوز خیلی ناراحتم." },
      { label: "دلخورم ولی آروم‌تر شدم." },
      { label: "گیجم و نمی‌دونم چی حس می‌کنم." },
      { label: "دلم برات تنگ شده." },
      { label: "ترجیح میدم چیزی نگم." },
    ],
  },
  {
    id: "main_reason",
    label: "سوال ۳",
    prompt: "دلیل اصلی ناراحتیت چی بود؟",
    type: "text",
    placeholder: "هرچقدر که دلت می‌خواد برام بنویس…",
  },
  {
    id: "my_mistake",
    label: "سوال ۴",
    prompt: "فکر می‌کنی من کجای ماجرا اشتباه کردم؟",
    type: "text",
    placeholder: "قول میدم با دقت بخونمش…",
  },
  {
    id: "space_or_talk",
    label: "سوال ۵",
    prompt: "دوست داری الان بهت فضا بدم یا ترجیح میدی با هم حرف بزنیم؟",
    type: "choice",
    options: [
      { label: "فعلاً فقط زمان می‌خوام." },
      { label: "بعداً حرف بزنیم." },
      { label: "اگر تو شروع کنی، حرف می‌زنم." },
      { label: "همین الان دلم می‌خواد صحبت کنیم." },
      { label: "مطمئن نیستم." },
    ],
  },
  {
    id: "breakup_meaning",
    label: "سوال ۶",
    prompt: "وقتی گفتی «کات کنیم»، واقعاً منظورت تموم شدن رابطه بود؟",
    type: "choice",
    options: [
      { label: "بله." },
      { label: "نه، از شدت ناراحتی گفتم." },
      { label: "خودم هم نمی‌دونم." },
      { label: "ترجیح میدم جواب ندم." },
    ],
  },
  {
    id: "still_important",
    label: "سوال ۷",
    prompt: "الان هنوز برات مهمم؟",
    type: "choice",
    options: [
      { label: "خیلی." },
      { label: "تا حدی." },
      { label: "نمی‌دونم." },
      { label: "نه." },
    ],
  },
  {
    id: "one_change",
    label: "سوال ۸",
    prompt: "اگر بخوای فقط یک چیز از من تغییر کنه، اون چیه؟",
    type: "text",
    placeholder: "اون چیزی که بیشتر از همه برات مهمه…",
  },
  {
    id: "expected_action",
    label: "سوال ۹",
    prompt: "از من انتظار داری الان چه کاری انجام بدم؟",
    type: "choice",
    options: [
      { label: "فعلاً هیچ کاری نکنم." },
      { label: "فقط عذرخواهی کنم." },
      { label: "صبر کنم." },
      { label: "تلاش کنم باهات صحبت کنم." },
      { label: "هر چیز دیگه…", other: true },
    ],
  },
  {
    id: "one_sentence",
    label: "سوال ۱۰",
    prompt: "اگر بخوام فقط یه جمله بهت بگم، دوست داری کدوم باشه؟",
    type: "choice",
    options: [
      { label: "فقط می‌خوام بگم متأسفم." },
      { label: "دلم برات تنگ شده." },
      { label: "حاضرم اشتباهم رو جبران کنم." },
      { label: "فقط امیدوارم حالت خوب باشه." },
    ],
  },
  {
    id: "final_words",
    label: "سوال آخر ❤️",
    prompt:
      "هر چیزی توی دلت هست، حتی اگر ناراحت‌کننده باشه، اینجا بنویس.",
    hint: "قول میدم فقط بخونم و سعی کنم بفهممت، نه اینکه بحث کنم.",
    type: "text",
    long: true,
    placeholder: "اینجا می‌تونی بدون نگرانی هر چیزی که توی دلت هست بنویسی…",
  },
];

const persianNumber = new Intl.NumberFormat("fa-IR", { useGrouping: false });
const tehranPartsFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
  timeZone: TIME_ZONE,
});

const elements = {
  screen: document.querySelector("#screen"),
  progressBar: document.querySelector("#progressBar"),
  progressText: document.querySelector("#progressText"),
  floatingShapes: document.querySelector("#floatingShapes"),
  toast: document.querySelector("#toast"),
};

let currentQuestionIndex = -1;
let selectedOptionIndex = -1;
let transitionInProgress = false;
let pendingAnswers = readPendingAnswers();
let requestInFlight = false;
let retryTimer = null;
let retryAttempt = 0;
let sentAnswerCount = 0;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createFloatingShapes() {
  const symbols = ["♡", "✦", "·", "○"];
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < 12; index += 1) {
    const shape = document.createElement("span");
    shape.textContent = symbols[index % symbols.length];
    shape.style.left = `${4 + Math.random() * 92}%`;
    shape.style.setProperty("--size", `${10 + Math.random() * 13}px`);
    shape.style.setProperty("--duration", `${17 + Math.random() * 12}s`);
    shape.style.setProperty("--delay", `${-Math.random() * 24}s`);
    shape.style.setProperty("--drift", `${-35 + Math.random() * 70}px`);
    fragment.append(shape);
  }

  elements.floatingShapes.append(fragment);
}

function updateProgress(index = currentQuestionIndex, customText = "") {
  if (index < 0) {
    elements.progressBar.style.width = "0%";
    elements.progressText.textContent = customText || "یه شروع آروم";
    return;
  }

  const completed = Math.min(index + 1, questions.length);
  elements.progressBar.style.width = `${(completed / questions.length) * 100}%`;
  elements.progressText.textContent =
    customText ||
    `سوال ${persianNumber.format(completed)} از ${persianNumber.format(questions.length)}`;
}

function transitionTo(renderNext) {
  if (transitionInProgress) return;
  transitionInProgress = true;
  elements.screen.classList.remove("is-entering");
  elements.screen.classList.add("is-leaving");

  window.setTimeout(() => {
    renderNext();
    elements.screen.classList.remove("is-leaving");
    void elements.screen.offsetWidth;
    elements.screen.classList.add("is-entering");
    window.scrollTo({ top: 0, behavior: "smooth" });

    window.setTimeout(() => {
      elements.screen.classList.remove("is-entering");
      transitionInProgress = false;
    }, 470);
  }, 245);
}

function renderIntro() {
  currentQuestionIndex = -1;
  updateProgress();
  elements.screen.innerHTML = `
    <div class="intro-art" aria-hidden="true">
      <span class="intro-art__heart">♡</span>
      <span class="intro-art__spark intro-art__spark--one">✦</span>
      <span class="intro-art__spark intro-art__spark--two">✦</span>
    </div>
    <span class="eyebrow">یه حرف از ته دل…</span>
    <h1>سلام ${escapeHtml(inviteeName)}…</h1>
    <div class="intro-copy">
      <p>اول از همه می‌خوام بابت اتفاقی که افتاد ازت معذرت بخوام. می‌دونم شاید الان ناراحت، خسته یا حتی عصبانی باشی و کاملاً به احساست احترام می‌ذارم.</p>
      <p>این فرم رو نساختم که قانعت کنم، بحث راه بندازم یا ازت جواب خاصی بگیرم. فقط چون الان راه ارتباطمون بسته شده، خواستم یه راه آروم بذارم که اگه دلت خواست، بدون فشار هر چیزی که توی دلت هست رو بهم بگی.</p>
      <p class="intro-copy__soft">اگه هیچ حوصله‌ای نداری، می‌تونی همین‌جا ببندیش و هیچ اشکالی هم نداره. فقط ممنونم که تا اینجا خوندی. 🤍</p>
    </div>
    <div class="actions">
      <button class="primary-button" id="startButton" type="button">اگه آمادگی داری، آروم شروع کنیم</button>
    </div>
    <p class="gentle-note">هیچ پاسخ اجباری‌ای وجود نداره.</p>
    ${renderSendState()}
  `;

  document.querySelector("#startButton").addEventListener("click", () => {
    transitionTo(() => renderQuestion(0));
  });
  updateSendState();
}

function renderQuestion(index) {
  currentQuestionIndex = index;
  selectedOptionIndex = -1;
  const question = questions[index];
  updateProgress(index);

  const answerControl =
    question.type === "choice"
      ? `
        <div class="options" id="options" role="radiogroup" aria-label="${escapeHtml(question.prompt)}">
          ${question.options
            .map(
              (option, optionIndex) => `
                <button
                  class="option"
                  type="button"
                  role="radio"
                  aria-checked="false"
                  data-option-index="${optionIndex}"
                >${escapeHtml(option.label)}</button>
              `,
            )
            .join("")}
        </div>
        <input
          class="other-answer"
          id="otherAnswer"
          type="text"
          maxlength="700"
          placeholder="هر چیز دیگه‌ای که توی ذهنته…"
          hidden
        />
      `
      : `
        <textarea
          class="answer-box${question.long ? " answer-box--long" : ""}"
          id="textAnswer"
          maxlength="5000"
          placeholder="${escapeHtml(question.placeholder)}"
        ></textarea>
      `;

  elements.screen.innerHTML = `
    <form id="questionForm">
      <span class="question-number">${escapeHtml(question.label)}</span>
      <h2>${escapeHtml(question.prompt)}</h2>
      <p class="question-hint">${escapeHtml(question.hint || "هر جوابی که واقعاً حس می‌کنی، برای من قابل احترامه.")}</p>
      ${answerControl}
      <div class="actions">
        <button class="primary-button" id="submitAnswer" type="submit" disabled>
          ${index === questions.length - 1 ? "ثبت پاسخ آخر" : "ثبت و ادامه"}
        </button>
        ${question.required ? "" : '<button class="skip-button" id="skipQuestion" type="button">فعلاً از این سوال می‌گذرم</button>'}
      </div>
      ${renderSendState()}
    </form>
  `;

  bindQuestionEvents(question);
  updateSendState();
}

function bindQuestionEvents(question) {
  const form = document.querySelector("#questionForm");
  const submitButton = document.querySelector("#submitAnswer");
  const textAnswer = document.querySelector("#textAnswer");
  const otherAnswer = document.querySelector("#otherAnswer");

  if (question.type === "choice") {
    document.querySelector("#options").addEventListener("click", (event) => {
      const selectedButton = event.target.closest(".option");
      if (!selectedButton) return;

      selectedOptionIndex = Number(selectedButton.dataset.optionIndex);
      document.querySelectorAll(".option").forEach((optionButton) => {
        const isSelected = optionButton === selectedButton;
        optionButton.classList.toggle("is-selected", isSelected);
        optionButton.setAttribute("aria-checked", String(isSelected));
      });

      const selectedOption = question.options[selectedOptionIndex];
      otherAnswer.hidden = !selectedOption.other;
      if (selectedOption.other) {
        submitButton.disabled = !otherAnswer.value.trim();
        otherAnswer.focus();
      } else {
        submitButton.disabled = false;
      }
    });

    otherAnswer.addEventListener("input", () => {
      const selectedOption = question.options[selectedOptionIndex];
      if (selectedOption?.other) submitButton.disabled = !otherAnswer.value.trim();
    });
  } else {
    textAnswer.addEventListener("input", () => {
      submitButton.disabled = !textAnswer.value.trim();
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const answer = getCurrentAnswer(question);
    if (!answer) return;

    queueAnswer(question, answer);
    const selectedAction = question.options?.[selectedOptionIndex]?.action;

    if (selectedAction === "stop") {
      transitionTo(renderNotReadyEnding);
    } else if (currentQuestionIndex === questions.length - 1) {
      transitionTo(renderFinalEnding);
    } else {
      transitionTo(() => renderQuestion(currentQuestionIndex + 1));
    }
  });

  document.querySelector("#skipQuestion")?.addEventListener("click", () => {
    if (currentQuestionIndex === questions.length - 1) {
      transitionTo(renderFinalEnding);
    } else {
      transitionTo(() => renderQuestion(currentQuestionIndex + 1));
    }
  });
}

function getCurrentAnswer(question) {
  if (question.type === "text") {
    return document.querySelector("#textAnswer").value.trim();
  }

  const option = question.options[selectedOptionIndex];
  if (!option) return "";
  if (!option.other) return option.value || option.label;

  const customAnswer = document.querySelector("#otherAnswer").value.trim();
  return customAnswer ? `هر چیز دیگه: ${customAnswer}` : "";
}

function renderNotReadyEnding() {
  updateProgress(questions.length - 1, "به تصمیمت احترام می‌ذارم");
  elements.screen.innerHTML = `
    <div class="ending-art" aria-hidden="true">
      <span class="ending-art__heart">🤍</span>
      <span class="ending-art__spark ending-art__spark--one">✦</span>
      <span class="ending-art__spark ending-art__spark--two">·</span>
    </div>
    <span class="eyebrow">کاملاً قابل احترامه</span>
    <h2>ممنون که همین‌قدر همراه شدی.</h2>
    <div class="ending-copy">
      <p>لازم نیست الان ادامه بدی یا چیزی رو توضیح بدی.</p>
      <p class="ending-promise">بهت زمان و فضا میدم. امیدوارم هر وقت و هر طور که برای خودت بهتره، حالت آروم‌تر بشه. 🤍</p>
    </div>
    ${renderSendState()}
  `;
  updateSendState();
}

function renderFinalEnding() {
  updateProgress(questions.length - 1, "ممنون که حرف‌هات رو گفتی");
  elements.screen.innerHTML = `
    <div class="ending-art" aria-hidden="true">
      <span class="ending-art__heart">♡</span>
      <span class="ending-art__spark ending-art__spark--one">✦</span>
      <span class="ending-art__spark ending-art__spark--two">✦</span>
    </div>
    <span class="eyebrow">ممنون که وقت گذاشتی 🤍</span>
    <h2>حرف‌هات برای من ارزشمنده.</h2>
    <div class="ending-copy">
      <p>مهم نیست جواب‌هات چی بودن؛ همین که خوندی یا پرش کردی برام ارزشمنده.</p>
      <p class="ending-promise">قول نمی‌دم آدم بی‌اشتباهی باشم، ولی قول می‌دم اگر فرصتی باشه، بیشتر از قبل سعی کنم بفهممت و اشتباهاتم رو جبران کنم.</p>
      <p>اگر هم الان فقط به زمان نیاز داری، به تصمیمت احترام می‌ذارم.</p>
    </div>
    ${renderSendState()}
  `;
  updateSendState();
}

function partsToObject(formatter, date) {
  return Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, value]),
  );
}

function formatOffset(offsetMinutes) {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteOffset = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absoluteOffset / 60)).padStart(2, "0");
  const minutes = String(absoluteOffset % 60).padStart(2, "0");
  return `${sign}${hours}:${minutes}`;
}

function getTehranTimestamp() {
  const now = new Date();
  const parts = partsToObject(tehranPartsFormatter, now);
  const tehranAsUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  const offsetMinutes = Math.round((tehranAsUtc - now.getTime()) / 60_000);

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${formatOffset(offsetMinutes)}`;
}

function createAnswerId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createAnswerPayload(question, answer) {
  return {
    id: createAnswerId(),
    fields: {
      _subject: `پاسخ ${question.label} از ${inviteeName}`,
      name: inviteeName,
      question: `${question.label}: ${question.prompt}`,
      answer,
      answered_at: getTehranTimestamp(),
    },
  };
}

function queueAnswer(question, answer) {
  pendingAnswers.push(createAnswerPayload(question, answer));
  savePendingAnswers();
  updateSendState("pending");
  void processPendingAnswers();
}

function readPendingAnswers() {
  try {
    const savedValue = localStorage.getItem(PENDING_ANSWERS_KEY);
    if (!savedValue) return [];
    const savedAnswers = JSON.parse(savedValue);
    return Array.isArray(savedAnswers) ? savedAnswers : [];
  } catch (error) {
    console.warn("Could not read pending apology answers:", error);
    return [];
  }
}

function savePendingAnswers() {
  try {
    localStorage.setItem(PENDING_ANSWERS_KEY, JSON.stringify(pendingAnswers));
  } catch (error) {
    console.warn("Could not save pending apology answers:", error);
  }
}

async function processPendingAnswers() {
  if (requestInFlight || retryTimer || pendingAnswers.length === 0) {
    updateSendState();
    return;
  }

  requestInFlight = true;
  updateSendState("pending");
  const payload = pendingAnswers[0];
  const formData = new FormData();
  Object.entries(payload.fields).forEach(([fieldName, fieldValue]) => {
    formData.append(fieldName, String(fieldValue));
  });

  const abortController = new AbortController();
  const requestTimeout = window.setTimeout(() => abortController.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      body: formData,
      signal: abortController.signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || "Formspree rejected the answer");
    }

    if (pendingAnswers[0]?.id === payload.id) pendingAnswers.shift();
    savePendingAnswers();
    retryAttempt = 0;
    sentAnswerCount += 1;
    showToast("پاسخت خصوصی برای مهدی فرستاده شد 🤍");
  } catch (error) {
    console.error("Could not send an apology answer:", error);
    scheduleRetry();
  } finally {
    window.clearTimeout(requestTimeout);
    requestInFlight = false;
    updateSendState();
  }

  if (!retryTimer && pendingAnswers.length > 0) {
    void processPendingAnswers();
  }
}

function scheduleRetry() {
  if (retryTimer) return;
  const delay = RETRY_DELAYS[Math.min(retryAttempt, RETRY_DELAYS.length - 1)];
  retryAttempt += 1;
  updateSendState("retrying");

  retryTimer = window.setTimeout(() => {
    retryTimer = null;
    void processPendingAnswers();
  }, delay);
}

function renderSendState() {
  return `
    <div class="send-state" id="sendState" data-state="idle" role="status" aria-live="polite">
      <span class="send-state__dot" aria-hidden="true"></span>
      <span id="sendStateText">پاسخ‌ها فقط برای مهدی فرستاده میشن</span>
    </div>
  `;
}

function updateSendState(forcedState = "") {
  const sendState = document.querySelector("#sendState");
  const sendStateText = document.querySelector("#sendStateText");
  if (!sendState || !sendStateText) return;

  if (forcedState === "retrying" || (retryTimer && pendingAnswers.length > 0)) {
    sendState.dataset.state = "retrying";
    sendStateText.textContent = "اتصال برقرار نیست؛ پاسخ‌ها محفوظن و دوباره تلاش می‌کنم";
  } else if (pendingAnswers.length > 0 || requestInFlight || forcedState === "pending") {
    sendState.dataset.state = "pending";
    sendStateText.textContent = `${persianNumber.format(pendingAnswers.length)} پاسخ در حال ارسال…`;
  } else if (sentAnswerCount > 0) {
    sendState.dataset.state = "sent";
    sendStateText.textContent = "همهٔ پاسخ‌های ثبت‌شده برای مهدی فرستاده شدن ✓";
  } else {
    sendState.dataset.state = "idle";
    sendStateText.textContent = "پاسخ‌ها فقط برای مهدی فرستاده میشن";
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 2400);
}

window.addEventListener("online", () => {
  window.clearTimeout(retryTimer);
  retryTimer = null;
  retryAttempt = 0;
  void processPendingAnswers();
});

document.title = `یه حرف از ته دل برای ${inviteeName}…`;
createFloatingShapes();
renderIntro();
void processPendingAnswers();
