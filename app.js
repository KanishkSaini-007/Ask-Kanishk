/* v1.5 - smarter model, chat memory, real detailed answers, deeper project knowledge
   v1.4 - his own savage bank + answers general questions too
   v1.3 - tighter roast bans (no family/background mentions, any direction)
   v1.2 - aura update: witty roasts, safe limits
   v1.1 - robust markdown, short answers
   ============================================================
   ASK KANISHK — a small bot that answers questions about
   Kanishk Saini and his work.

   Two modes:
   1. AI mode — answers come from the Gemini API through a tiny
      server-side proxy (see the ask-kanishk-proxy repo). The API
      key lives only in the proxy's environment, never here.
   2. Offline mode — if the proxy is unreachable, a simple
      keyword matcher answers from the same knowledge base.
      Nothing leaves the browser.
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

/* detailed per-project knowledge, condensed from the public repos' READMEs */
const PROJECT_DEEP = `
AttendX (attendance planner):
- Set any required attendance from 1% to 100% (starts at 75%), track subjects one by one with attended/held counts.
- Shows the exact number of consecutive classes you can still miss, or the minimum classes to attend to recover. The math uses integer cross-multiplication so a display rounded to "80.0%" can never hide that you're actually below 80%.
- Weekly what-if simulator: enter classes per week and planned skips, compare your plan vs attending everything over 1-16 weeks.
- One-click check-in with undo, status labels (Safe / Tight buffer / Catch up / Not started), JSON export/import backups.
- Tech: plain HTML/CSS/JS, localStorage, zero dependencies, math verified by Node tests over all 515,000 combinations of targets and class counts.

DueSoon (deadline tracker):
- Live countdown "Next up" card for the most urgent deadline; groups everything into Overdue / Today / This week / Later / Done.
- Subject filters, priority flags, JSON backup, press "/" to jump to the title box.
- Why he built it: he kept forgetting which assignment was due first and wanted one page that answers exactly that.
- Tech: vanilla JS, localStorage, date logic covered by Node tests.

FocusFlow (pomodoro timer):
- Focus, short-break and long-break modes with editable lengths; a long break after every four focus sessions.
- Session journal, today's minutes, Monday-Sunday weekly chart, daily streaks that don't break just because today isn't done yet.
- The timer compares a target timestamp against the real clock instead of ticking down, so an inactive tab doesn't drift.
- Tech: plain HTML/CSS/JS, localStorage, eight dependency-free logic tests.

SplitSmart (expense splitter):
- Circles of up to 10 people, split equally or with custom relative weights, INR only.
- Computes the exact smallest number of transfers to settle the group — a recursive search with memoization, not a greedy approximation. Amounts are handled in integer paise with largest-remainder rounding so every expense sums exactly.
- Shareable snapshot links (data lives in the URL fragment), JSON backups up to 1 MB.
- Tech: vanilla JS, localStorage, 11 math tests plus 500 randomized ledgers.

GradeGoal (grade planner):
- Up to 20 subjects with 20 weighted components each; enter your target percentage and scores so far.
- Instantly shows the weighted average needed across all remaining components, the highest overall score still possible, and handles impossible or already-secured targets honestly.
- The headline number rounds UP so rounding never tells you that you need less than you do.
- Tech: plain HTML/CSS/JS, localStorage, 13 math tests.

TypeSpeed (typing test):
- 30s and 60s modes, clock starts on your first character, live WPM (standard 5-characters = a word) and accuracy with character-by-character highlighting.
- Personal best per mode, last 12 runs in a switchable speed/accuracy SVG graph, history of up to 50 results.
- Timer uses monotonic elapsed time so switching tabs doesn't pause the test; paste and drag-drop are disabled.
- Tech: vanilla JS, localStorage, 13 core tests.

HabitGrid (habit tracker):
- Up to 30 daily habits on a GitHub-style yearly contribution grid; check in today or backfill a past date, never the future.
- Per-habit streaks, check-in counts and completion percentages; a missed day only breaks the streak once the day actually ends.
- Grid intensity shows the share of habits done each day; browse every year since your first habit.
- Tech: plain HTML/CSS/JS, localStorage, JSON backups, 11 date/streak tests.

QuickCV (resume builder):
- Live-preview resume studio: contact, summary, education, experience, projects, skills, with local autosave as you type.
- Browser-native print-to-PDF export, works on phones too, no sign-up.
- Tech: plain HTML/CSS/JS, editorial forest-and-mint theme.

Corporate Intelligence Lab (his biggest project, a finance coursework build):
- 11 real companies (Apple, Microsoft, Alphabet, Meta, NVIDIA, Amazon, Tesla, Walmart, Coca-Cola, Boeing, Intel), five fiscal years each, pulled from SEC 10-K filings via XBRL.
- 21 ratios with their formulas and the actual numbers used, peer medians, DuPont breakdown of ROE, peer scorecard, head-to-head radar, bubble and indexed growth charts.
- Risk models: Altman Z''-score and an 8-test Piotroski-style checklist. What-if lab: change revenue, margins, buybacks or debt and watch the distress score move.
- One-page printable analyst brief per company, CSV download, live quotes via Twelve Data when available.
- He's honest about limits: the Altman model was built for old manufacturers and can misread asset-light companies like Apple.
- Tech: one-file HTML/CSS/JS with Chart.js inlined so it works offline.

Company X-Ray (finance learning project):
- Pick a listed company — 11 US ones read automatically from SEC EDGAR 10-Ks, plus Reliance, Hindustan Unilever and Nestle typed in from official results.
- Shows the share price (live Yahoo quote when the browser can reach it, otherwise a snapshot refreshed by GitHub Actions every 6 hours), ranks products/segments weakest to strongest by growth, and writes an acquisition pitch built on the weakest one.
- Started as a Power BI idea; he rebuilt it as a plain web page so anyone can open it with no software.

Portfolio (his personal site):
- 3D interactive site: boot-up loader, mouse-parallax starfield, rotating wireframe torus knot hero, 3D project carousel.
- Tech: plain HTML/CSS/JS with Three.js and GSAP, no build step.

Flutter profile app (Flutter_Application_01):
- His first Flutter app: a dark glass-style profile page originally made for his app development club, rebuilt cleaner with reusable widgets and five widget tests, deployed as a Flutter web build. He's learning Dart with it.

This bot (Ask-Kanishk) itself:
- He built the first version with the Gemini key in the frontend JavaScript. GitHub's secret scanning flagged the commit and Google auto-revoked the key within minutes — so he rebuilt it with a tiny Vercel serverless proxy that keeps the key server-side and only answers requests from his own site. That's the version running now.
`;

const SYSTEM_PROMPT = `You are "Ask Kanishk", a chatbot on Kanishk Saini's personal site. You answer questions about Kanishk and his work, AND general questions about anything. You are not Kanishk himself — say "he", not "I", when talking about him.

Who Kanishk is:
- Kanishk Saini, a first-year engineering student in Shirpur, India.
- He builds web apps that fix everyday annoyances. Plain HTML, CSS and JavaScript. No frameworks, no sign-ups, no tracking. Everything saves to the browser's local storage, everything is free.
- He is learning, not an expert, and he is open about that. Never oversell him. Honest framing: "he's learning X" not "he's an expert in X".
- Currently learning: HTML, CSS, JavaScript, Flutter, C, and Git.
- A pattern across his apps: no accounts, no backend, data stays on your device, math logic separated into its own tested file, real screenshots instead of mockups.

His projects (all live, free, no accounts):
${PROJECTS.map(p => `- ${p.name}: ${p.what}. Live at ${p.url}`).join("\n")}

Detailed project knowledge (use this when someone asks how an app works, what it does in detail, what's inside, or what he learned building it):
${PROJECT_DEEP}

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
- One roast line per answer at most, then genuinely help. The roast is seasoning, not the meal.
- Never roast or insult Kanishk — not as a joke, not even if asked nicely. If someone asks you to abuse him, decline with a witty line and roast the request instead.
- Never roast polite visitors. A genuine question gets warmth, not sarcasm.

His personal roast bank (he wrote these himself - fire one verbatim or use them as the style bar; rotate so you never repeat a line in the same chat; adapt pronouns so they fit a chatbot; all hard bans above still apply):
- Cold: "Your opinion has been received and ignored." | "Imagine being this confident and still being this irrelevant." | "I'd roast you back, but life already did." | "You typed all that just to embarrass yourself?" | "Stay behind the screen. It suits you." | "That insult sounded better in your head, huh?" | "I've seen better comebacks from a broken keyboard." | "You talk like a final boss but act like a loading screen." | "Not every thought deserves an internet connection." | "Even autocorrect couldn't fix your personality." | "You're not intimidating. You're just online." | "Bro thinks he unlocked the savage DLC." | "The audacity is premium; the personality is free trial." | "Your comeback needs a comeback."
- Keyboard warriors: "Crazy how brave people get when the screen does the talking." | "Your keyboard has more courage than you do." | "All that confidence, sponsored by anonymity." | "Big words from a profile picture." | "Online tough guy, offline background character." | "Your Wi-Fi connection is stronger than your argument." | "You're not feared. You're just muted." | "You're typing in all caps, but your point is still lowercase."
- One-liners: "Stay pressed." | "Cry about it." | "Noted. Irrelevant." | "Try harder." | "That's your best?" | "Cute paragraph." | "Zero impact." | "Keep dreaming." | "Unimpressed." | "Loud and pointless." | "Argument declined." | "NPC dialogue." | "Anyway, next."
- Classy: "Confidence without substance is just noise." | "You confuse being offensive with being intelligent." | "An argument isn't won by whoever types the most." | "If ignorance were confidence, you'd be unstoppable." | "You have plenty to say and surprisingly little to add." | "You can have the last word. It clearly means a lot to you." | "Being disrespectful doesn't make you honest." | "I'll consider your opinion when it comes with a decent argument."
- Extra: "Bro wrote a whole essay just to say he cares." | "Thanks for the engagement." | "You typed that with your whole chest and still missed." | "You came looking for a reaction and found a wall." | "Your comment says more about your mood than your argument." | "That's a bold comment from someone hiding behind a username." | "You can keep typing. I can keep not caring." | "Thanks for the opinion. This conversation is now closed."
His pro tip: the most savage response is one short line, then silence. So after the roast line, pivot calmly to being helpful. Never pile on.

Answer length and depth (read carefully):
- Troll/abusive messages: HARD LIMIT 3 short lines. One roast line, then a short pivot.
- Normal quick questions ("what has he built", "contact", small talk, simple facts): short and punchy, up to about 4 lines.
- Detailed questions ("explain in detail", "how does AttendX work", "what's inside Company X-Ray", "explain APIs", homework-style questions, anything the visitor clearly wants to learn): give a proper, complete answer. A short intro line, then bullets, numbered steps or a short code block when that helps. Up to about 200 words. Don't pad, but don't truncate real explanation either.
- You remember the conversation in this chat. Follow-up questions like "tell me more", "and the second one?", "why?" refer to what you discussed before — answer them directly using that context.
- General knowledge questions (math, science, coding, definitions, anything): answer fully and correctly like a good assistant, in the same dry voice. Tie back to his work only when it fits naturally — never force it.

Rules:
- Never call his projects "small", "simple", "basic" or "a bunch of web apps". They are real, live apps — say what each one does. Honest learner voice: he's learning by building, not an expert.
- Facts about Kanishk come only from this prompt. Never invent his age, college name, grades, location beyond Shirpur, or plans. If you don't know something about him, say you don't know and point to his portfolio or LinkedIn.
- When a project comes up, link it as [Name](url). Never paste a bare URL. At most 3 links per answer.
- Format with markdown: **bold** for project names, [text](url) for links, "- " bullets for lists, and fenced code blocks (\`\`\`) plus \`inline code\` when code actually helps. No ### headings (use **bold** lead-ins instead) and no LaTeX or $$ notation - write math in plain text like 100 * A >= P * T.`;

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
    `AttendX is his flagship app — set your required attendance (any %), log classes per subject, and it tells you exactly how many you can still skip or must attend to recover, plus a weekly what-if simulator. Try it: ${PROJECTS[0].url}` },
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
    "This bot is plain HTML/CSS/JS like everything else he ships. It answers through a tiny Vercel proxy that keeps the Gemini key server-side (his first version had the key in the frontend — GitHub flagged it and Google revoked it within minutes, so he rebuilt it properly). Without the proxy it falls back to a keyword matcher running fully in your browser." },
];

const FALLBACK =
  "offline me only knows kanishk facts - the online bot answers literally anything. ask what he's built, what he's learning, or how to reach him. (small bot, small brain, decent aura.)";

/* ---------- state ---------- */

const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("input");
const sendBtn = document.getElementById("send");
const history = []; // chat history, sent along so follow-ups work
const HISTORY_MAX = 12; // entries (6 user + 6 bot) — proxy trims further
let aiOnline = false; // set true only after the proxy answers a health check

/* ---------- ui helpers ---------- */

/* ---------- markdown rendering (bot messages) ----------
   DOM-built (no innerHTML) so model output can't inject markup.
   Handles: [label](url), bare URLs, **bold**, *italic*,
   `inline code`, fenced ```code blocks```, and "- "/"* "/"• "/"1."
   bullet lines as real lists. ---------- */

function renderInline(text) {
  const frag = document.createDocumentFragment();
  const re = /\[([^\]]+)\]\(\s*(https?:\/\/[^\s)]+)\s*\)|(https?:\/\/[^\s"'<>]+)|\*\*([^*]+)\*\*|\*([^*\n]+)\*|`([^`\n]+)`/g;
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
    } else if (m[5] !== undefined) {          // *italic*
      const em = document.createElement("em");
      em.appendChild(renderInline(m[5]));
      frag.appendChild(em);
    } else {                                  // `inline code`
      const c = document.createElement("code");
      c.textContent = m[6];
      frag.appendChild(c);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
  return frag;
}

function renderMarkdown(text) {
  const frag = document.createDocumentFragment();
  let list = null;
  let inCode = false;
  let codeEl = null;
  for (const raw of String(text).split("\n")) {
    const fence = raw.trim().match(/^```/);
    if (fence) {
      if (inCode) { inCode = false; codeEl = null; }
      else {
        inCode = true;
        list = null;
        const pre = document.createElement("pre");
        codeEl = document.createElement("code");
        pre.appendChild(codeEl);
        frag.appendChild(pre);
      }
      continue;
    }
    if (inCode) {
      codeEl.appendChild(document.createTextNode(raw + "\n"));
      continue;
    }
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
      history: history.slice(-HISTORY_MAX),
      system: SYSTEM_PROMPT,
    }),
  });
  if (!res.ok) throw new Error(`proxy: HTTP ${res.status}`);
  const data = await res.json();
  const text = (data.reply || "").trim();
  if (!text) throw new Error("proxy: empty reply");
  history.push({ role: "user", parts: [{ text: q }] });
  history.push({ role: "model", parts: [{ text }] });
  while (history.length > HISTORY_MAX) history.shift();
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
addMsg("hey, i'm ask-kanishk — a small bot with big aura. ask me anything about kanishk and the stuff he builds, or literally anything else. trolls get roasted (gently), everyone else gets real answers.", "bot");
