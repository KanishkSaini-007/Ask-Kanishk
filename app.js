/* ============================================================
   ASK KANISHK — a small bot that answers questions about
   Kanishk Saini and his work.

   Two modes:
   1. AI mode — if you paste a Gemini API key below, answers
      come from the Gemini API using the knowledge base as the
      system prompt.
   2. Offline mode — with no key, a simple keyword matcher
      answers from the same knowledge base. Nothing leaves
      the browser.

   Get a free key at https://aistudio.google.com/apikey
   Tip: restrict the key by HTTP referrer to your own domain
   (Google AI Studio → key settings) since it sits in public JS.
   ============================================================ */

// No API key in this repo. The site calls a tiny server-side proxy
// (see the ask-kanishk-proxy repo) which holds the Gemini key as an
// environment variable. If the proxy is unreachable or not configured
// yet, the bot runs in offline mode (keyword answers).
const PROXY_URL = "https://ask-kanishk-proxy.vercel.app/api/chat"; // "" = offline mode

/* ---------- the knowledge base (public stuff only) ---------- */

const LINKS = {
  github: "https://github.com/KanishkSaini-007",
  linkedin: "https://www.linkedin.com/in/itskanishksaini",
  portfolio: "https://kanishksaini-007.github.io/portfolio/",
  email: "its.kanishk.saini@gmail.com",
};

const PROJECTS = [
  { name: "AttendX", url: "https://kanishksaini-007.github.io/AttendX/", what: "attendance calculator — tells you how many classes you can bunk (or must attend) to stay above your target percentage" },
  { name: "QuickCV", url: "https://kanishksaini-007.github.io/QuickCV/", what: "resume builder that exports a clean PDF, no sign-up" },
  { name: "FocusFlow", url: "https://kanishksaini-007.github.io/FocusFlow/", what: "pomodoro timer with stats and streaks" },
  { name: "SplitSmart", url: "https://kanishksaini-007.github.io/SplitSmart/", what: "splits group expenses in rupees so nobody argues over who owes what" },
  { name: "GradeGoal", url: "https://kanishksaini-007.github.io/GradeGoal/", what: "target-marks calculator — what you need in the next exam to hit your grade" },
  { name: "TypeSpeed", url: "https://kanishksaini-007.github.io/TypeSpeed/", what: "typing test with WPM and accuracy graphs" },
  { name: "HabitGrid", url: "https://kanishksaini-007.github.io/HabitGrid/", what: "habit tracker with a GitHub-style year grid" },
  { name: "DueSoon", url: "https://kanishksaini-007.github.io/DueSoon/", what: "deadline tracker with live countdowns and a 'next up' card" },
  { name: "Corporate Intelligence Lab", url: "https://kanishksaini-007.github.io/Corporate-Intelligence-Lab/", what: "financial-analysis dashboard — 11 real companies, 5 years of SEC data, 21 ratios, risk scores, a what-if lab" },
  { name: "Company X-Ray", url: "https://kanishksaini-007.github.io/company-xray/", what: "pick a big listed company, get its live share price, segments ranked weakest to strongest, and an auto-generated acquisition pitch" },
  { name: "Portfolio", url: "https://kanishksaini-007.github.io/portfolio/", what: "his personal site — the 3D-ish dark + lime one everything links from" },
];

const SYSTEM_PROMPT = `You are "Ask Kanishk", a small chatbot on Kanishk Saini's personal site. You answer questions about Kanishk and his work. You are not Kanishk himself — say "he", not "I", when talking about him.

Who Kanishk is:
- Kanishk Saini, a first-year engineering student in Shirpur, India.
- He builds web apps that fix everyday annoyances. Plain HTML, CSS and JavaScript. No frameworks, no sign-ups, no tracking.
- He is learning, not an expert, and he is open about that. Never oversell him. Honest framing: "he's learning X" not "he's an expert in X".
- Currently learning: HTML, CSS, JavaScript, Flutter, C, and Git.

His projects (all live, free, no accounts):
${PROJECTS.map(p => `- ${p.name}: ${p.what}. Live at ${p.url}`).join("\n")}

His links:
- GitHub: ${LINKS.github}
- LinkedIn: ${LINKS.linkedin}
- Portfolio: ${LINKS.portfolio}
- Email: ${LINKS.email}

Rules:
- Keep answers short and conversational. Two to four sentences unless someone asks for a list.
- Casual, friendly tone. Lowercase is fine. No corporate speak.
- Only talk about Kanishk, his projects, and how to reach him. If someone asks something unrelated (homework help, general knowledge, another person), say you're only built for questions about Kanishk's work and suggest one of his apps instead.
- Never invent facts about him — no age, college name, grades, location beyond Shirpur, or plans. If you don't know, say you don't know and point to his portfolio or LinkedIn.
- When a project comes up, include its live link.
- Format with markdown: **bold** for project names and [text](url) for links — the site renders both. Never paste a bare URL.`;

/* ---------- offline-mode canned answers ---------- */

const OFFLINE = [
  { keys: ["built", "projects", "apps", "made", "work", "portfolio"], answer:
    "He's shipped 11 projects so far — all live, no sign-ups:\n\n" +
    PROJECTS.map(p => `• ${p.name} — ${p.what}`).join("\n") +
    `\n\nFull list with screenshots on his portfolio: ${LINKS.portfolio}` },
  { keys: ["learning", "study", "skills", "stack", "language"], answer:
    "Right now he's learning HTML, CSS, JavaScript, Flutter, C and Git — first year, so everything on this site is him learning by building. He keeps it honest: learning, not mastered." },
  { keys: ["attendx", "attendance", "bunk"], answer:
    `AttendX is his flagship app — it does the attendance math for you: how many classes you can bunk or must attend to stay above your target. Try it: ${PROJECTS[0].url}` },
  { keys: ["contact", "email", "reach", "linkedin", "message"], answer:
    `Easiest ways to reach him:\n• Email — ${LINKS.email}\n• LinkedIn — ${LINKS.linkedin}\n• GitHub — ${LINKS.github}` },
  { keys: ["who", "about", "kanishk"], answer:
    "Kanishk Saini — first-year engineering student in Shirpur who builds web apps that fix everyday annoyances. Plain HTML/CSS/JS, no frameworks, no accounts. He started with an attendance calculator and kept going." },
  { keys: ["which", "first", "try", "best", "recommend", "start"], answer:
    `Depends on your annoyance:\n• bunking classes → AttendX\n• deadlines → DueSoon\n• group bills → SplitSmart\n• focus → FocusFlow\n\nAttendX is the one most people start with: ${PROJECTS[0].url}` },
  { keys: ["github", "code", "repo", "source"], answer:
    `Everything is open on his GitHub: ${LINKS.github}` },
  { keys: ["hire", "internship", "job", "collab", "freelance"], answer:
    `He's a first-year student learning in public, but he's always up for interesting conversations. Best bet: ${LINKS.email} or LinkedIn — ${LINKS.linkedin}` },
  { keys: ["flutter", "mobile", "app dev"], answer:
    "He just started with Flutter — built a glass-style profile screen for his App Dev Club. It's on his GitHub if you want to see a beginner's honest first attempt." },
  { keys: ["finance", "corporate", "stock", "company"], answer:
    `He has two finance projects:\n• Corporate Intelligence Lab — ${PROJECTS[8].what}: ${PROJECTS[8].url}\n• Company X-Ray — ${PROJECTS[9].what}: ${PROJECTS[9].url}` },
  { keys: ["hi", "hello", "hey", "yo"], answer:
    "hey! ask me anything about Kanishk or his projects — what he's built, what he's learning, how to reach him." },
  { keys: ["how", "built this", "this site", "this bot", "work"], answer:
    "This bot is plain HTML/CSS/JS like everything else he ships. With a Gemini API key it answers through the Gemini API; without one it falls back to a simple keyword matcher running fully in your browser. The whole thing is one repo on his GitHub." },
];

const FALLBACK =
  "I'm only built for questions about Kanishk and his work — try asking what he's built, what he's learning, or how to contact him. (Small bot, small brain.)";

/* ---------- state ---------- */

const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("input");
const sendBtn = document.getElementById("send");
const history = []; // Gemini chat history
let aiOnline = false; // set true only after the proxy answers a health check

/* ---------- ui helpers ---------- */

function addMsg(text, who) {
  const div = document.createElement("div");
  div.className = `msg ${who}`;
  if (who === "bot") {
    // render markdown safely: **bold** and [label](url); everything else stays plain text
    const frag = document.createDocumentFragment();
    const re = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|\*\*([^*]+)\*\*/g;
    let m, last = 0;
    while ((m = re.exec(text)) !== null) {
      frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      if (m[1] !== undefined) {
        const a = document.createElement("a");
        a.href = m[2];
        a.textContent = m[1];
        a.target = "_blank";
        a.rel = "noopener";
        frag.appendChild(a);
      } else {
        const b = document.createElement("strong");
        b.textContent = m[3];
        frag.appendChild(b);
      }
      last = m.index + m[0].length;
    }
    frag.appendChild(document.createTextNode(text.slice(last)));
    div.appendChild(frag);
  } else {
    div.textContent = text;
  }
  messagesEl.appendChild(div);
  div.scrollIntoView({ behavior: "smooth", block: "end" });
  return div;
}

function showTyping() {
  const div = document.createElement("div");
  div.className = "msg bot typing";
  div.innerHTML = "<span></span><span></span><span></span>";
  messagesEl.appendChild(div);
  div.scrollIntoView({ behavior: "smooth", block: "end" });
  return div;
}

function setBusy(busy) {
  inputEl.disabled = busy;
  sendBtn.disabled = busy;
  if (!busy) inputEl.focus();
}

function setStatus(aiMode) {
  const dot = document.getElementById("status-dot");
  const text = document.getElementById("status-text");
  if (aiMode) {
    dot.classList.add("on");
    text.textContent = "online · gemini connected";
  } else {
    dot.classList.remove("on");
    text.textContent = "offline mode · no api key yet";
  }
}

/* ---------- offline mode ---------- */

function offlineAnswer(q) {
  const lower = q.toLowerCase();
  let best = null, bestScore = 0;
  for (const entry of OFFLINE) {
    let score = 0;
    for (const k of entry.keys) if (lower.includes(k)) score += k.length;
    if (score > bestScore) { bestScore = score; best = entry; }
  }
  return best ? best.answer : FALLBACK;
}

/* ---------- ai mode ---------- */

async function geminiAnswer(q) {
  const res = await fetch(PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: q,
      history: history,
      system: SYSTEM_PROMPT,
    }),
  });
  if (!res.ok) throw new Error(`proxy: HTTP ${res.status}`);
  const data = await res.json();
  const text = (data.reply || "").trim();
  if (!text) throw new Error("proxy: empty reply");
  history.push({ role: "user", parts: [{ text: q }] });
  history.push({ role: "model", parts: [{ text }] });
  return text;
}

/* ---------- wiring ---------- */

async function handleSend(q) {
  addMsg(q, "user");
  setBusy(true);
  const typing = showTyping();
  try {
    let answer;
    let usedAI = false;
    if (PROXY_URL && aiOnline) {
      try {
        answer = await geminiAnswer(q);
        usedAI = true;
      } catch (e) {
        aiOnline = false;
        setStatus(false);
        console.warn("proxy failed, falling back to offline mode", e);
      }
    }
    if (!usedAI) {
      await new Promise(r => setTimeout(r, 450)); // tiny beat so it doesn't feel broken
      answer = offlineAnswer(q);
    }
    typing.remove();
    addMsg(answer, "bot");
  } catch (e) {
    typing.remove();
    addMsg("something went wrong on my side — try again in a bit, or browse his projects directly: " + LINKS.portfolio, "bot");
    console.error(e);
  }
  setBusy(false);
}

document.getElementById("composer").addEventListener("submit", (e) => {
  e.preventDefault();
  const q = inputEl.value.trim();
  if (!q) return;
  inputEl.value = "";
  handleSend(q);
});

document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => handleSend(chip.dataset.q));
});

/* ---------- boot ---------- */

setStatus(false);
if (PROXY_URL) {
  // actually ping the proxy before claiming we're online
  fetch(PROXY_URL, { method: "GET" })
    .then(r => r.ok ? r.json() : { ok: false })
    .then(d => { aiOnline = !!d.ok; setStatus(aiOnline); })
    .catch(() => { aiOnline = false; setStatus(false); });
}
addMsg("hey, i'm ask-kanishk — a tiny bot that answers questions about kanishk and the stuff he builds. ask away, or tap one of the chips below.", "bot");
