# Ask Kanishk

A small chatbot that lives on my portfolio and answers questions about me and the stuff I build.

**Live:** https://kanishksaini-007.github.io/Ask-Kanishk/

## Why

Saw a friend's AI chatbot project and wanted one of my own — but built by me, not a one-click template deploy. So this is a from-scratch version: one page, plain HTML/CSS/JS, same dark + lime look as the rest of my apps.

## How it works

Two modes:

1. **AI mode** — the site calls a tiny serverless proxy ([ask-kanishk-proxy](https://github.com/KanishkSaini-007/ask-kanishk-proxy)) which holds my Gemini API key as an environment variable and forwards the question to the Gemini API. The key never touches this repo or the browser.
2. **Offline mode** — if the proxy is unreachable, a simple keyword matcher answers from the same knowledge base. Nothing leaves the browser.

The bot only answers questions about me and my projects. Ask it homework questions and it will politely refuse.

## What I learned building this

- Why API keys don't belong in frontend code (my first key got auto-revoked within minutes of pushing it — GitHub secret scanning reported it and Google killed it)
- Splitting a project into a static frontend + a serverless proxy
- Calling an LLM API with chat history and a system prompt
- Designing a chat UI from scratch (typing indicator, suggestion chips, sticky composer)
- Being honest in the UI: the header literally shows whether the AI is connected or it's in offline mode

## Stack

HTML · CSS · JavaScript · Vercel serverless function · Gemini API

---

*Built while learning. Not a template.*
