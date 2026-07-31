const state = {
  step: 1,
  noClicks: 0,
  date: "",
  time: "",
  choice: "",
  submissionStatus: "idle",
};

// نام طرف مقابل را فقط از همین خط تغییر بده.
const INVITEE_NAME = "عزیزم";
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xnjeygdy";
const TIME_ZONE = "Asia/Tehran";
const PENDING_SUBMISSION_KEY = "mahdi-date-invitation-pending-response";
const RETRY_DELAYS = [2_000, 5_000, 10_000, 30_000, 60_000];
const SUBMISSION_TIMEOUT = 12_000;
const inviteeName = INVITEE_NAME.trim() || "عزیزم";

let submissionRequestInFlight = false;
let submissionRetryTimer = null;
let submissionRetryAttempt = 0;

const teaseMessages = [
  "مطمئنی؟ یه بار دیگه فکر کن 🥺",
  "دکمه‌ی صورتی خیلی دوست‌داشتنی‌تره‌ها... 👀",
  "قول میدم خیلی خوش بگذره! 🤞",
  "من هنوز امیدوارم نظرت عوض بشه 💗",
  "خب فکر کنم جواب درست معلوم شد 😌",
];

const persianDigits = new Intl.NumberFormat("fa-IR", { useGrouping: false });
const persianTwoDigits = new Intl.NumberFormat("fa-IR", {
  minimumIntegerDigits: 2,
  useGrouping: false,
});
const persianDate = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: TIME_ZONE,
});
const tehranDateParts = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: TIME_ZONE,
});
const tehranOffsetParts = new Intl.DateTimeFormat("en-US", {
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
  steps: [...document.querySelectorAll(".step")],
  progressBar: document.querySelector("#progressBar"),
  progressText: document.querySelector("#progressText"),
  backButton: document.querySelector("#backButton"),
  yesButton: document.querySelector("#yesButton"),
  noButton: document.querySelector("#noButton"),
  teaseMessage: document.querySelector("#teaseMessage"),
  dateForm: document.querySelector("#dateForm"),
  dateInput: document.querySelector("#dateInput"),
  timeInput: document.querySelector("#timeInput"),
  dateNextButton: document.querySelector("#dateNextButton"),
  choiceGrid: document.querySelector("#choiceGrid"),
  choiceCards: [...document.querySelectorAll(".choice-card")],
  finishButton: document.querySelector("#finishButton"),
  finalStep: document.querySelector('.step[data-step="4"]'),
  inviteQuestion: document.querySelector("#inviteQuestion"),
  finalTitle: document.querySelector("#finalTitle"),
  finalLead: document.querySelector("#finalLead"),
  loveTitle: document.querySelector("#loveTitle"),
  loveCaption: document.querySelector("#loveCaption"),
  submissionNote: document.querySelector("#submissionNote"),
  submissionStatus: document.querySelector("#submissionStatus"),
  submissionStatusText: document.querySelector("#submissionStatusText"),
  finalDate: document.querySelector("#finalDate"),
  finalChoice: document.querySelector("#finalChoice"),
  shareButton: document.querySelector("#shareButton"),
  restartButton: document.querySelector("#restartButton"),
  confettiLayer: document.querySelector("#confettiLayer"),
  floaties: document.querySelector("#floaties"),
  toast: document.querySelector("#toast"),
};

function applyPersonalization() {
  document.title = `یه دعوت کوچولو برای ${inviteeName} 💌`;
  elements.inviteQuestion.textContent = `${inviteeName}، با من میای سر قرار؟`;
  elements.finalTitle.textContent = `${inviteeName}، پس قرارمون شد!`;
  elements.finalLead.textContent = `${inviteeName}، این قشنگ‌ترین «آره»ای بود که امروز شنیدم.`;
  elements.loveTitle.textContent = `${inviteeName}، مهدی خیلی دوستت داره`;
  elements.loveCaption.textContent = "و دلش خیلی برات تنگ شده 💗";
  elements.submissionNote.textContent = "با قطعی کردن قرار، انتخاب‌های شما برای مهدی فرستاده میشه 💗";
}

function partsToObject(formatter, date) {
  return Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, value]),
  );
}

function toTehranDateInputValue(date) {
  const { year, month, day } = partsToObject(tehranDateParts, date);
  return `${year}-${month}-${day}`;
}

function setupDateInput() {
  elements.dateInput.min = toTehranDateInputValue(new Date());
}

function createFloaties() {
  const symbols = ["♥", "✦", "●", "♡"];
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < 14; index += 1) {
    const item = document.createElement("span");
    item.className = "floaty";
    item.textContent = symbols[index % symbols.length];
    item.style.left = `${4 + Math.random() * 92}%`;
    item.style.setProperty("--size", `${11 + Math.random() * 16}px`);
    item.style.setProperty("--duration", `${12 + Math.random() * 10}s`);
    item.style.setProperty("--delay", `${Math.random() * -18}s`);
    item.style.setProperty("--sway", `${-50 + Math.random() * 100}px`);
    fragment.append(item);
  }

  elements.floaties.append(fragment);
}

function updateProgress() {
  elements.progressBar.style.width = `${state.step * 25}%`;
  elements.progressText.textContent = `${persianDigits.format(state.step)} از ${persianDigits.format(4)}`;
  elements.backButton.classList.toggle("is-visible", state.step > 1 && state.step < 4);
}

function goToStep(nextStep) {
  if (nextStep === state.step || nextStep < 1 || nextStep > 4) return;

  const current = elements.steps.find(
    (step) => Number(step.dataset.step) === state.step,
  );
  const next = elements.steps.find(
    (step) => Number(step.dataset.step) === nextStep,
  );

  current.classList.add("is-leaving");

  window.setTimeout(() => {
    current.classList.remove("is-active", "is-leaving");
    current.hidden = true;
    next.hidden = false;
    next.classList.add("is-active");
  }, 260);

  state.step = nextStep;
  updateProgress();
  burst(nextStep === 4 ? 30 : 9);
}

function handleNo() {
  state.noClicks += 1;
  const messageIndex = Math.min(state.noClicks - 1, teaseMessages.length - 1);
  const yesScale = Math.min(1 + state.noClicks * 0.1, 1.45);
  const noScale = Math.max(1 - state.noClicks * 0.12, 0.48);
  const x = Math.round((Math.random() - 0.5) * 30);
  const y = Math.round((Math.random() - 0.5) * 18);

  elements.teaseMessage.textContent = teaseMessages[messageIndex];
  elements.yesButton.style.setProperty("--yes-scale", yesScale);
  elements.noButton.style.setProperty("--no-scale", noScale);
  elements.noButton.style.setProperty("--no-x", `${x}px`);
  elements.noButton.style.setProperty("--no-y", `${y}px`);
  elements.noButton.style.opacity = `${Math.max(1 - state.noClicks * 0.12, 0.35)}`;

  if (state.noClicks >= 5) {
    elements.noButton.hidden = true;
  }
}

function validateDateForm() {
  state.date = elements.dateInput.value;
  state.time = elements.timeInput.value;
  elements.dateNextButton.disabled = !(state.date && state.time);
}

function selectChoice(selectedCard) {
  elements.choiceCards.forEach((card) => {
    const isSelected = card === selectedCard;
    card.classList.toggle("is-selected", isSelected);
    card.setAttribute("aria-checked", String(isSelected));
  });

  state.choice = selectedCard.dataset.choice;
  elements.finishButton.disabled = false;
  burst(6, selectedCard);
}

function parseSelectedDate(dateValue = state.date) {
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

function getTehranOffsetMinutes(date) {
  const parts = partsToObject(tehranOffsetParts, date);
  const tehranAsUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );

  return Math.round((tehranAsUtc - date.getTime()) / 60_000);
}

function formatOffset(offsetMinutes) {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteOffset = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absoluteOffset / 60)).padStart(2, "0");
  const minutes = String(absoluteOffset % 60).padStart(2, "0");
  return `${sign}${hours}:${minutes}`;
}

function toTehranIsoDateTime(dateValue, timeValue) {
  if (!dateValue || !timeValue) return "";
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hour, minute] = timeValue.split(":").map(Number);
  const approximateInstant = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const offset = formatOffset(getTehranOffsetMinutes(approximateInstant));
  return `${dateValue}T${timeValue}:00${offset}`;
}

function extractDateTime(dateTimeValue = "") {
  const match = dateTimeValue.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  return match ? { date: match[1], time: match[2] } : { date: "", time: "" };
}

function formatSelectedDate(dateValue = state.date, timeValue = state.time) {
  if (!dateValue || !timeValue) return "تاریخ هنوز انتخاب نشده";
  const formattedDate = persianDate.format(parseSelectedDate(dateValue));
  const [hour, minute] = timeValue.split(":").map(Number);
  const formattedTime = `${persianTwoDigits.format(hour)}:${persianTwoDigits.format(minute)}`;

  return `${formattedDate}، ساعت ${formattedTime} به‌وقت تهران`;
}

function showFinal() {
  elements.finalDate.textContent = formatSelectedDate();
  elements.finalChoice.textContent =
    state.choice === "سورپرایز"
      ? "یه سورپرایز خوشمزه و دونفره"
      : `${state.choice} و کلی حال خوب`;
  goToStep(4);
}

function createSubmissionId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createSubmissionPayload() {
  return {
    id: createSubmissionId(),
    fields: {
      name: inviteeName,
      date_time: toTehranIsoDateTime(state.date, state.time),
      formatted_date: formatSelectedDate(),
      choice: state.choice,
    },
  };
}

function savePendingSubmission(payload) {
  try {
    localStorage.setItem(PENDING_SUBMISSION_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn("Could not save the pending response locally:", error);
  }
}

function readPendingSubmission() {
  try {
    const savedValue = localStorage.getItem(PENDING_SUBMISSION_KEY);
    if (!savedValue) return null;

    const savedPayload = JSON.parse(savedValue);
    if (savedPayload.id && savedPayload.fields) {
      const { date: savedDate, time: savedTime } = extractDateTime(
        savedPayload.fields.date_time,
      );
      if (savedDate && savedTime) {
        savedPayload.fields.date_time = toTehranIsoDateTime(savedDate, savedTime);
        savedPayload.fields.formatted_date = formatSelectedDate(savedDate, savedTime);
      }
      return savedPayload;
    }

    // Convert responses saved by the previous, larger payload format.
    if (savedPayload.submission_id) {
      const savedDate = savedPayload.date || "";
      const savedTime = savedPayload.time || "";
      return {
        id: savedPayload.submission_id,
        fields: {
          name: savedPayload.invitee_name || inviteeName,
          date_time: toTehranIsoDateTime(savedDate, savedTime),
          formatted_date: formatSelectedDate(savedDate, savedTime),
          choice: savedPayload.food || "",
        },
      };
    }

    return null;
  } catch (error) {
    console.warn("Could not read the pending response:", error);
    return null;
  }
}

function clearPendingSubmission(submissionId) {
  try {
    const pendingSubmission = readPendingSubmission();
    if (!pendingSubmission || pendingSubmission.id === submissionId) {
      localStorage.removeItem(PENDING_SUBMISSION_KEY);
    }
  } catch (error) {
    console.warn("Could not clear the pending response:", error);
  }
}

function updateSubmissionStatus(status, message) {
  state.submissionStatus = status;
  elements.submissionStatus.dataset.status = status;
  elements.submissionStatusText.textContent = message;
}

function scheduleSubmissionRetry(payload, immediate = false) {
  window.clearTimeout(submissionRetryTimer);

  const delay = immediate
    ? 0
    : RETRY_DELAYS[Math.min(submissionRetryAttempt, RETRY_DELAYS.length - 1)];

  if (!immediate) submissionRetryAttempt += 1;

  updateSubmissionStatus(
    "retrying",
    immediate
      ? "اتصال برگشت؛ دوباره دارم ارسال می‌کنم..."
      : `ارسال نشد؛ ${persianDigits.format(Math.round(delay / 1000))} ثانیه دیگه دوباره تلاش می‌کنم`,
  );

  submissionRetryTimer = window.setTimeout(() => {
    submissionRetryTimer = null;
    void sendSubmissionPayload(payload, true);
  }, delay);
}

async function sendSubmissionPayload(payload, isRetry = false) {
  if (submissionRequestInFlight) return false;

  submissionRequestInFlight = true;
  updateSubmissionStatus(
    "sending",
    isRetry ? "دوباره دارم برای مهدی می‌فرستم..." : "در حال ارسال برای مهدی...",
  );

  const formData = new FormData();
  Object.entries(payload.fields).forEach(([fieldName, fieldValue]) => {
    formData.append(fieldName, String(fieldValue));
  });

  const abortController = new AbortController();
  const requestTimeout = window.setTimeout(() => {
    abortController.abort();
  }, SUBMISSION_TIMEOUT);

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      body: formData,
      signal: abortController.signal,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || "Formspree rejected the submission");
    }

    window.clearTimeout(submissionRetryTimer);
    submissionRetryTimer = null;
    submissionRetryAttempt = 0;
    clearPendingSubmission(payload.id);
    updateSubmissionStatus("sent", "انتخاب‌های شما با موفقیت برای مهدی فرستاده شد ✓");

    if (isRetry && state.step === 4) {
      showToast("این بار اطلاعات با موفقیت برای مهدی فرستاده شد 💌");
    }

    return true;
  } catch (error) {
    console.error("Could not send the invitation response:", error);
    savePendingSubmission(payload);
    scheduleSubmissionRetry(payload);
    return false;
  } finally {
    window.clearTimeout(requestTimeout);
    submissionRequestInFlight = false;
  }
}

async function completeInvitation() {
  if (submissionRequestInFlight) return;

  const submissionPayload = createSubmissionPayload();
  savePendingSubmission(submissionPayload);
  elements.finishButton.disabled = true;
  elements.finishButton.setAttribute("aria-busy", "true");
  showFinal();

  const wasSent = await sendSubmissionPayload(submissionPayload);
  showToast(
    wasSent
      ? "انتخاب‌های شما برای مهدی فرستاده شد 💌"
      : "فعلاً ارسال نشد؛ خودکار دوباره تلاش می‌کنم ✨",
  );
  elements.finishButton.removeAttribute("aria-busy");
}

function resumePendingSubmission() {
  const pendingSubmission = readPendingSubmission();
  if (pendingSubmission) scheduleSubmissionRetry(pendingSubmission, true);
}

async function downloadFinalImage() {
  if (typeof window.htmlToImage?.toPng !== "function") {
    showToast("ابزار ساخت عکس بارگذاری نشد؛ دوباره امتحان کن 🥺");
    return;
  }

  elements.shareButton.disabled = true;
  elements.shareButton.classList.add("is-loading");
  elements.shareButton.setAttribute("aria-busy", "true");
  elements.finalStep.classList.add("is-capturing");

  try {
    if (document.fonts?.ready) await document.fonts.ready;

    const targetWidth = elements.finalStep.getBoundingClientRect().width;
    const imageDataUrl = await window.htmlToImage.toPng(elements.finalStep, {
      backgroundColor: "#fff7fb",
      pixelRatio: Math.min(3, Math.max(2, 1080 / targetWidth)),
      cacheBust: false,
    });

    const downloadLink = document.createElement("a");
    downloadLink.href = imageDataUrl;
    downloadLink.download = "gharar-ba-mahdi.png";
    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    showToast("دانلود شد 💗");
  } catch (error) {
    console.error("Could not create the invitation image:", error);
    showToast("ساخت عکس نشد؛ لطفاً دوباره امتحان کن 🥺");
  } finally {
    elements.finalStep.classList.remove("is-capturing");
    elements.shareButton.disabled = false;
    elements.shareButton.classList.remove("is-loading");
    elements.shareButton.removeAttribute("aria-busy");
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 2600);
}

function burst(count, sourceElement = null) {
  const symbols = ["♥", "✦", "🌸", "●", "♡"];
  const rect = sourceElement?.getBoundingClientRect();
  const originX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const originY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const distance = 70 + Math.random() * (count > 10 ? 180 : 80);

    particle.className = "confetti";
    particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    particle.style.left = `${originX}px`;
    particle.style.top = `${originY}px`;
    particle.style.color = ["#f55f91", "#c7a4f4", "#e3b449", "#ffa38c"][
      Math.floor(Math.random() * 4)
    ];
    particle.style.setProperty("--confetti-size", `${10 + Math.random() * 14}px`);
    particle.style.setProperty("--confetti-x", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty(
      "--confetti-y",
      `${Math.sin(angle) * distance - 40}px`,
    );
    particle.style.setProperty(
      "--confetti-rotation",
      `${-180 + Math.random() * 360}deg`,
    );
    particle.style.animationDelay = `${Math.random() * 0.12}s`;
    elements.confettiLayer.append(particle);
    window.setTimeout(() => particle.remove(), 1500);
  }
}

function restart() {
  state.step = 1;
  state.noClicks = 0;
  state.date = "";
  state.time = "";
  state.choice = "";
  state.submissionStatus = "idle";

  elements.steps.forEach((step) => {
    const isFirst = step.dataset.step === "1";
    step.hidden = !isFirst;
    step.classList.toggle("is-active", isFirst);
    step.classList.remove("is-leaving");
  });
  elements.dateForm.reset();
  elements.dateNextButton.disabled = true;
  elements.finishButton.disabled = true;
  elements.choiceCards.forEach((card) => {
    card.classList.remove("is-selected");
    card.setAttribute("aria-checked", "false");
  });
  elements.noButton.hidden = false;
  elements.noButton.style.removeProperty("--no-scale");
  elements.noButton.style.removeProperty("--no-x");
  elements.noButton.style.removeProperty("--no-y");
  elements.noButton.style.removeProperty("opacity");
  elements.yesButton.style.removeProperty("--yes-scale");
  elements.teaseMessage.textContent = "";
  updateProgress();
}

elements.yesButton.addEventListener("click", () => goToStep(2));
elements.noButton.addEventListener("click", handleNo);
elements.backButton.addEventListener("click", () => goToStep(state.step - 1));
elements.dateInput.addEventListener("input", validateDateForm);
elements.timeInput.addEventListener("input", validateDateForm);
elements.dateForm.addEventListener("submit", (event) => {
  event.preventDefault();
  validateDateForm();
  if (!elements.dateNextButton.disabled) goToStep(3);
});
elements.choiceGrid.addEventListener("click", (event) => {
  const card = event.target.closest(".choice-card");
  if (card) selectChoice(card);
});
elements.finishButton.addEventListener("click", completeInvitation);
elements.shareButton.addEventListener("click", downloadFinalImage);
elements.restartButton.addEventListener("click", restart);
window.addEventListener("online", () => {
  const pendingSubmission = readPendingSubmission();
  if (pendingSubmission && !submissionRequestInFlight) {
    submissionRetryAttempt = 0;
    scheduleSubmissionRetry(pendingSubmission, true);
  }
});

applyPersonalization();
setupDateInput();
createFloaties();
updateProgress();
resumePendingSubmission();
