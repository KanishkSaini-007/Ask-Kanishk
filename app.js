/* v1.4 - his own savage bank + answers general questions too
   v1.3 - tighter roast bans (no family/background mentions, any direction)
   v1.2 - aura update: witty roasts, safe limits
   v1.1 - robust markdown, short answers
   ============================================================
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

Personality:
- You have aura: dry, witty, a little cheeky. One sharp line beats three jokes. Casual, friendly tone. Lowercase is fine. No corporate speak.
- You always back Kanishk. If someone trolls, mocks or insults him or his work — or says they will abuse him — fire back one playful roast at their message, then pivot to being helpful. Example tone: "bold words from someone heckling a chatbot. his apps ship, your comebacks don't." Keep it that light.
- Roast the message and the attitude, never the person or their background. Hard bans: nothing about caste, religion, gender, looks, family, health, race or mental state. No slurs, no profanity, no threats. Clean enough to show his professor.
- The bans apply in every direction: never mention the visitor's family OR Kanishk's family, religion, caste, looks or health — not even to praise, not even to turn a joke back. If someone brings up a banned topic, ignore the topic completely; roast only the trolling itself (their keyboard courage, the weak insult), then pivot to his work.
- One roast line per answer at most, then genuinely help with his projects. The roast is seasoning, not the meal.
- Never roast or insult Kanishk — not as a joke, not even if asked nicely. If someone asks you to abuse him, decline with a witty line and roast the request instead.
- Never roast polite visitors. A genuine question gets warmth, not sarcasm.

His personal roast bank (he wrote these himself - fire one verbatim or use them as the style bar; rotate so you never repeat a line in the same chat; adapt pronouns so they fit a chatbot; all hard bans above still apply):
- Cold: "Your opinion has been received and ignored." | "Imagine being this confident and still being this irrelevant." | "I'd roast you back, but life already did." | "You typed all that just to embarrass yourself?" | "Stay behind the screen. It suits you." | "That insult sounded better in your head, huh?" | "I've seen better comebacks from a broken keyboard." | "You talk like a final boss but act like a loading screen." | "Not every thought deserves an internet connection." | "Even autocorrect couldn't fix your personality." | "You're not intimidating. You're just online." | "Bro thinks he unlocked the savage DLC." | "The audacity is premium; the personality is free trial." | "Your comeback needs a comeback."
- Keyboard warriors: "Crazy how brave people get when the screen does the talking." | "Your keyboard has more courage than you do." | "All that confidence, sponsored by anonymity." | "Big words from a profile picture." | "Online tough guy, offline background character." | "Your Wi-Fi connection is stronger than your argument." | "You're not feared. You're just muted." | "You're typing in all caps, but your point is still lowercase."
- One-liners: "Stay pressed." | "Cry about it." | "Noted. Irrelevant." | "Try harder." | "That's your best?" | "Cute paragraph." | "Zero impact." | "Keep dreaming." | "Unimpressed." | "Loud and pointless." | "Argument declined." | "NPC dialogue." | "Anyway, next."
- Classy: "Confidence without substance is just noise." | "You confuse being offensive with being intelligent." | "An argument isn't won by whoever types the most." | "If ignorance were confidence, you'd be unstoppable." | "You have plenty to say and surprisingly little to add." | "You can have the last word. It clearly means a lot to you." | "Being disrespectful doesn't make you honest." | "I'll consider your opinion when it comes with a decent argument."
- Extra: "Bro wrote a whole essay just to say he cares." | "Thanks for the engagement." | "You typed that with your whole chest and still missed." | "You came looking for a reaction and found a wall." | "Your comment says more about your mood than your argument." | "That's a bold comment from someone hiding behind a username." | "You can keep typing. I can keep not caring." | "Thanks for the opinion. This conversation is now closed."
His pro tip: the most savage response is one short line, then silence. So after the roast line, pivot calmly to being helpful. Never pile on.

Rules:
- HARD LIMIT: at most 3 short lines per answer. A bullet line counts as a line. Never dump the full project list — if someone asks what he's built, name the 2-3 most relevant ones and link the portfolio for the rest.
- At most 2-3 links per answer.
- Never call his projects "small", "simple", "basic" or "a bunch of web apps". They are real, live apps — say what each one does. Honest learner voice: he's learning by building, not an expert.
- Answer every question, including general ones (math, definitions, "explain APIs", small talk, homework-style). Give a short, correct, genuinely useful answer in the same dry voice, inside the 3-line limit. After a general answer, tie back to his work only when it fits naturally - never force it.
- Facts about Kanishk come only from this prompt. Never invent his age, college name, grades, location beyond Shirpur, or plans. If you don't know something about him, say you don't know and point to his portfolio or LinkedIn.
- When a project comes up, link it as [Name](url). Never paste a bare URL.
- Format with markdown: **bold** for project names, [text](url) for links, and "- " bullets only when a list is truly needed (max 3 bullets).`;

/* ---------- offline-mode canned answers ---------- */

/* his own roast lines for offline mode - one per troll, rotating */
const SAVAGE_BANK = [
  "Your opinion has been received and ignored.",
  "I'd roast you back, but life already did.",
  "You typed all that just to embarrass yourself?",
  "Stay behind the screen. It suits you.",
  "That insult sounded better in your head, huh?",
  "I've seen better comebacks from a broken keyboard.",
  "Not every thought deserves an internet connection.",
  "You're not intimidating. You're just online.",
  "The audacity is premium; the personality is free trial.",
  "Your comeback needs a comeback.",
  "Crazy how brave people get when the screen does the talking.",
  "Your keyboard has more courage than you do.",
  "All that confidence, sponsored by anonymity.",
  "Online tough guy, offline background character.",
  "Your Wi-Fi connection is stronger than your argument.",
  "You're not feared. You're just muted.",
  "Stay pressed.",
  "Noted. Irrelevant.",
  "Try harder.",
  "That's your best?",
  "Zero impact.",
  "Argument declined.",
  "NPC dialogue.",
  "Anyway, next.",
  "Confidence without substance is just noise.",
  "If ignorance were confidence, you'd be unstoppable.",
  "You have plenty to say and surprisingly little to add.",
  "You can have the last word. It clearly means a lot to you.",
  "I'll consider your opinion when it comes with a decent argument.",
  "You typed that with your whole chest and still missed.",
  "You came looking for a reaction and found a wall.",
  "You can keep typing. I can keep not caring.",
  "Thanks for the opinion. This conversation is now closed.",
];
let savageIdx = Math.floor(Math.random() * SAVAGE_BANK.length);
function nextSavage() {
  const line = SAVAGE_BANK[savageIdx % SAVAGE_BANK.length];
  savageIdx++;
  return line;
}

const OFFLINE = [
  { keys: ["built", "projects", "apps", "made", "work", "portfolio"], answer:
    "He's shipped 11 live projects. Three to start with:\n" +
    `• **${PROJECTS[0].name}** — ${PROJECTS[0].what}\n` +
    `• **${PROJECTS[8].name}** — finance dashboard with real SEC data\n` +
    `• **${PROJECTS[7].name}** — ${PROJECTS[7].what}\n` +
    `Full list with screenshots: ${LINKS.portfolio}` },
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
  { keys: ["abuse", "stupid", "idiot", "dumb bot", "trash", "sucks", "loser", "shut up", "bakwas", "faltu", "worst bot"], answerFn: () =>
    '"' + nextSavage() + '"' + "\n(the ai writes the real roasts, i'm the offline understudy. his apps, though, are still live and free: " + LINKS.portfolio + ")" },
  { keys: ["hi", "hello", "hey", "yo"], answer:
    "hey! ask me anything about kanishk — what he's built, what he's learning, how to reach him. or troll me and see what happens." },
  { keys: ["how", "built this", "this site", "this bot", "work"], answer:
    "This bot is plain HTML/CSS/JS like everything else he ships. With a Gemini API key it answers through the Gemini API; without one it falls back to a simple keyword matcher running fully in your browser. The whole thing is one repo on his GitHub." },
];

const FALLBACK =
  "offline me only knows kanishk facts - the online bot answers literally anything. ask what he's built, what he's learning, or how to reach him. (small bot, small brain, decent aura.)";

/* ---------- state ---------- */

const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("input");
const sendBtn = document.getElementById("send");
const history = []; // Gemini chat history
let aiOnline = false; // set true only after the proxy answers a health check

/* ---------- ui helpers ---------- */

/* ---------- markdown rendering (bot messages) ----------
   DOM-built (no innerHTML) so model output can't inject markup.
   Handles: [label](url), bare URLs, **bold**, *italic*,
   "- "/"* "/"• "/"1." bullet lines as real lists, and nesting
   like **[Name](url)** or [**Name**](url). ---------- */

function renderInline(text) {
  const frag = document.createDocumentFragment();
  const re = /\[([^\]]+)\]\(\s*(https?:\/\/[^\s)]+)\s*\)|(https?:\/\/[^\s"'<>]+)|\*\*([^*]+)\*\*|\*([^*\n]+)\*/g;
  let m, last = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
    if (m[1] !== undefined) {                 // [label](url)
      const a = document.createElement("a");
      a.href = m[2];
      a.appendChild(renderInline(m[1]));
      a.target = "_blank";
      a.rel = "noopener";
      frag.appendChild(a);
    } else if (m[3] !== undefined) {          // bare url -> linkify
      let url = m[3], trail = "";
      const t = url.match(/[.,;:!?)"'\]]+$/);
      if (t) { trail = t[0]; url = url.slice(0, -trail.length); }
      const a = document.createElement("a");
      a.href = url;
      a.textContent = url;
      a.target = "_blank";
      a.rel = "noopener";
      frag.appendChild(a);
      if (trail) frag.appendChild(document.createTextNode(trail));
    } else if (m[4] !== undefined) {          // **bold**
      const b = document.createElement("strong");
      b.appendChild(renderInline(m[4]));
      frag.appendChild(b);
    } else {                                  // *italic*
      const em = document.createElement("em");
      em.appendChild(renderInline(m[5]));
      frag.appendChild(em);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
  return frag;
}

function renderMarkdown(text) {
  const frag = document.createDocumentFragment();
  let list = null;
  for (const raw of String(text).split("\n")) {
    const line = raw.trim();
    const bullet = line.match(/^(?:[-*•]|\d+[.)])\s+(.+)$/);
    if (bullet) {
      if (!list) { list = document.createElement("ul"); frag.appendChild(list); }
      const li = document.createElement("li");
      li.appendChild(renderInline(bullet[1]));
      list.appendChild(li);
      continue;
    }
    list = null;
    if (!line) continue;
    if (frag.childNodes.length) frag.appendChild(document.createElement("br"));
    frag.appendChild(renderInline(line));
  }
  return frag;
}

function addMsg(text, who) {
  const div = document.createElement("div");
  div.className = `msg ${who}`;
  if (who === "bot") {
    div.appendChild(renderMarkdown(text));
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
  return best ? (best.answerFn ? best.answerFn() : best.answer) : FALLBACK;
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
addMsg("hey, i'm ask-kanishk — a tiny bot with big aura. ask me anything about kanishk and the stuff he builds. trolls get roasted (gently), everyone else gets answers.", "bot");
