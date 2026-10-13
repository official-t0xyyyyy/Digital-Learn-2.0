/* Add the deployed Apps Script /exec URL here to enable Google Sheets logging. */
const SHEET_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbyFEliEtVWQ9go6kLhSWquPG3sHgSy9YV2-EBlfyC5cKqL_lq9MPjtFKJQLjH4khQw/exec";
const STORAGE_KEY = "digital_learn_2_profile_v1";
let profile = null,
  currentModule = null;
const modules = {
  digilocker: {
    title: "DigiLocker basics",
    body: `<p><strong>What it is:</strong> DigiLocker is a Government of India digital platform for accessing and sharing digital documents from participating issuers.</p><ol><li>Open the <a href="https://www.digilocker.gov.in/" target="_blank" rel="noopener">official DigiLocker website</a> or official app listing.</li><li>Follow the current sign-in or account creation instructions shown by the official service.</li><li>Look for documents under issued documents or the relevant issuer; availability depends on issuer and records.</li><li>Review the recipient and consent screen carefully before sharing a document.</li></ol><p><strong>Safety tip:</strong> Never tell anyone your OTP or account PIN. Avoid unexpected login links.</p>`,
  },
  aadhaar: {
    title: "Aadhaar services",
    body: `<p><strong>What it is:</strong> UIDAI is the authority responsible for Aadhaar. Its website provides information and links to available services.</p><ol><li>Start at <a href="https://uidai.gov.in/" target="_blank" rel="noopener">uidai.gov.in</a> and choose the service you need.</li><li>Read eligibility, document requirements and any applicable fee before starting.</li><li>Use the official portal or an authorised centre for updates or downloads.</li><li>Keep an acknowledgement or service request number if one is provided.</li></ol><p><strong>Safety tip:</strong> Do not share Aadhaar details or OTPs with unknown callers.</p>`,
  },
  pan: {
    title: "PAN services",
    body: `<p><strong>What it is:</strong> PAN is used for tax-related and specified financial identification in India.</p><ol><li>Start at the <a href="https://www.incometax.gov.in/iec/foportal/" target="_blank" rel="noopener">Income Tax e-Filing portal</a> or an authorised PAN service provider.</li><li>Confirm whether you need a new PAN, correction, reprint or another service.</li><li>Check current document requirements, charges and application tracking instructions.</li><li>Keep your acknowledgement number for tracking.</li></ol><p><strong>Safety tip:</strong> Check the web address and be cautious of unsolicited offers promising guaranteed approval.</p>`,
  },
};
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  setTimeout(() => t.classList.add("hidden"), 3200);
}
async function sendToSheet(payload) {
  if (!SHEET_WEB_APP_URL) {
    document.getElementById("sheetStatus").textContent =
      "Google Sheets: not configured — follow SETUP.md";
    return false;
  }
  try {
    await fetch(SHEET_WEB_APP_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    document.getElementById("sheetStatus").textContent =
      "Google Sheets: event submitted (verify in spreadsheet)";
    return true;
  } catch (e) {
    document.getElementById("sheetStatus").textContent =
      "Google Sheets: submission failed; local progress is saved";
    return false;
  }
}
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}
function render() {
  document.getElementById("registerScreen").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  const first = profile.fullName.trim().split(/\s+/)[0];
  document.getElementById("welcomeTitle").textContent =
    `Hey ${first}! Welcome!!!`;
  document.getElementById("avatar").textContent = first.charAt(0).toUpperCase();
  document.getElementById("miniAvatar").textContent = first
    .charAt(0)
    .toUpperCase();
  document.getElementById("userChipName").textContent = first;
  progress();
}
function progress() {
  const n = profile.completedModules.length,
    pct = Math.round((n / 3) * 100);
  document.getElementById("modulesDone").textContent = `${n}/3`;
  document.getElementById("progressText").textContent = `${pct}% complete`;
  document.getElementById("progressFill").style.width = pct + "%";
  document.getElementById("progressBar").setAttribute("aria-valuenow", pct);
  document.getElementById("bestScore").textContent =
    profile.latestScore === null ? "—" : `${profile.latestScore}/10`;
  document.getElementById("learningStatus").textContent =
    n === 3 ? "Completed"
    : n ? "In progress"
    : "Getting started";
}
document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!document.getElementById("consent").checked) return;
    profile = {
      fullName: document
        .getElementById("fullName")
        .value.trim()
        .replace(/\s+/g, " ")
        .slice(0, 100),
      ageGroup: document.getElementById("ageGroup").value,
      education: document.getElementById("education").value,
      completedModules: [],
      latestScore: null,
      registeredAt: new Date().toISOString(),
    };
    save();
    render();
    await sendToSheet({ type: "registration", ...profile });
    toast("Welcome to Digital Learn 2.0!");
  });
function openModule(id) {
  currentModule = id;
  const m = modules[id];
  document.getElementById("modalTitle").textContent = m.title;
  document.getElementById("modalBody").innerHTML = m.body;
  document.getElementById("completeModule").textContent =
    profile.completedModules.includes(id) ?
      "Module completed ✓"
    : "Mark module complete ✓";
  document.getElementById("moduleModal").classList.remove("hidden");
}
function closeModule() {
  document.getElementById("moduleModal").classList.add("hidden");
}
document
  .getElementById("completeModule")
  .addEventListener("click", async () => {
    if (!profile.completedModules.includes(currentModule)) {
      profile.completedModules.push(currentModule);
      save();
      progress();
      await sendToSheet({
        type: "module_completion",
        fullName: profile.fullName,
        module: currentModule,
        completedAt: new Date().toISOString(),
        completedModules: profile.completedModules.join(","),
      });
      toast("Module marked complete!");
    }
    closeModule();
  });
document.getElementById("quizForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!profile) {
    toast("Please register before taking the quiz.");
    return;
  }

  const f = new FormData(e.target);

  const answers = {
    q1: "a",
    q2: "b",
    q3: "a",
    q4: "a",
    q5: "b",
    q6: "a",
    q7: "b",
    q8: "a",
    q9: "b",
    q10: "a",
  };

  let score = 0;

  for (const [question, correctAnswer] of Object.entries(answers)) {
    if (f.get(question) === correctAnswer) {
      score++;
    }
  }

  const total = Object.keys(answers).length;

  profile.latestScore = score;
  save();
  progress();

  const r = document.getElementById("quizResult");
  r.className = "result";
  r.textContent = `You scored ${score} out of ${total}. ${
    score === total
      ? "Excellent work! You have a strong understanding of digital services."
      : score >= 7
        ? "Good job! Review the topics you missed to strengthen your knowledge."
        : "Keep learning! Review the modules and try again."
  }`;

  await sendToSheet({
    type: "quiz_score",
    fullName: profile.fullName,
    score,
    total,
    submittedAt: new Date().toISOString(),
  });
});
document.getElementById("generatePassword").addEventListener("click", () => {
  const name = document.getElementById("aadhaarName").value.trim(),
    year = document.getElementById("birthYear").value.trim(),
    out = document.getElementById("passwordOutput");
  if (name.replace(/\s/g, "").length < 4 || !/^\d{4}$/.test(year)) {
    out.textContent =
      "Enter a name with at least 4 letters and a 4-digit birth year.";
    return;
  }
  out.textContent = name.replace(/\s/g, "").slice(0, 4).toUpperCase() + year;
});
document.getElementById("copyPassword").addEventListener("click", async () => {
  const t = document.getElementById("passwordOutput").textContent;
  if (!t || t.includes("appear") || t.startsWith("Enter a name")) {
    toast("Generate a password first.");
    return;
  }
  try {
    await navigator.clipboard.writeText(t);
    toast("Password copied.");
  } catch (e) {
    toast("Copy unavailable here. Select the password and copy it manually.");
  }
});
document.getElementById("resetProfile").addEventListener("click", () => {
  if (
    confirm(
      "Reset this browser's profile and progress? This will not delete entries already in Google Sheets.",
    )
  ) {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
});
document.querySelectorAll(".nav button").forEach((b) =>
  b.addEventListener("click", () => {
    document
      .querySelectorAll(".nav button")
      .forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    const target = document.getElementById(b.dataset.target);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("crumbTitle").textContent = b.textContent.trim();
  }),
);
document.getElementById("mobileNavBtn").addEventListener("click", () => {
  const choice = prompt(
    "Go to: 1 Dashboard, 2 Learning modules, 3 Quiz, 4 Official links, 5 PDF password helper, 6 FAQ",
  );
  const map = {
    1: "overview",
    2: "learning",
    3: "quizSection",
    4: "quickLinks",
    5: "passwordTool",
    6: "faqSection",
  };
  if (map[choice])
    document.getElementById(map[choice]).scrollIntoView({ behavior: "smooth" });
});
try {
  const s = localStorage.getItem(STORAGE_KEY);
  if (s) {
    profile = JSON.parse(s);
    if (profile && profile.fullName && Array.isArray(profile.completedModules))
      render();
  }
} catch (e) {
  localStorage.removeItem(STORAGE_KEY);
}
