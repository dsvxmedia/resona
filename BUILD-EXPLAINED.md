# How Resona Was Built — Explained Simply

> **Status: template — not filled in yet.** This gets written for real as the last build step (see `PLAN-LITE.md`, step 12), after the actual application exists and has been tested. Right now this is the outline/skeleton so nothing gets forgotten. Whoever picks this project back up should fill in every `[TO FILL IN]` with what actually happened, in plain language, no jargon left unexplained.

**Goal of this document:** explain the entire project — from the first idea to the finished, live website — so that both a 10-year-old and a hiring manager who's never written code could read it and understand exactly what was built, and *why* every decision was made. No unexplained jargon. Every technical term gets a plain-English definition the first time it shows up.

---

## Part 1: What is this thing, in one paragraph?

[TO FILL IN — one paragraph, imagine explaining to a curious kid: "This is a website where you tell a computer program about a song you want to promote, and it does the job of a whole marketing team by itself: it watches a sample video to understand its vibe, picks the best people to help spread the song, writes them personalized messages, and shows its work the whole time so you can watch it think."]

## Part 2: Why does this exist? (The story)

[TO FILL IN — explain: applying for a job at a company (Influur) that builds AI that helps music labels find TikTok creators to promote songs. Rather than just writing a resume, built a small working version of the same kind of AI system, to prove the skills instead of just claiming them. Explain what Influur does in a sentence a kid would get: "imagine a robot assistant that finds the perfect people on TikTok to help a song become popular, super fast."]

## Part 3: The Plan (before any code was written)

### 3a. Researching the company
[TO FILL IN — what was learned about Influur's product "Pulse," in plain language: it looks at videos and scores creators, not by how many followers they have, but by how well they actually get a song heard; it writes messages to creators automatically; it can find backups if a creator doesn't respond.]

### 3b. Deciding what to build (and what NOT to build)
[TO FILL IN — explain the "lite vs. full" decision in kid-simple terms: "We designed two versions — a big, complete version with everything, and a smaller version that shows the same skills without giving away every idea before a real conversation happens. We built the smaller one first, like showing a sketch instead of the whole painting." Explain WHY: don't want to hand a company your best, most complete ideas for free in a public place before you've even talked to them.]

### 3c. Naming it
[TO FILL IN — why "Resona," what it means, why it avoids using Influur's own product name "Pulse."]

## Part 4: The Building Blocks (technical decisions, explained for everyone)

For each item below: **what it is (plain English) → why we picked it → what would have happened if we picked something else.**

### 4a. "Agents" — what does that even mean?
[TO FILL IN — explain an AI agent like a helpful robot coworker who can use tools (like looking things up, doing math, writing a message) instead of just chatting. Explain "multi-agent" = a team of these robot coworkers, each with one job, managed by a lead robot (the orchestrator) who decides what happens next.]

### 4b. Why more than one AI model?
[TO FILL IN — explain in plain terms: different AI models are good at different jobs, like how you'd hire a translator instead of an accountant to translate a document. Explain which model did which job and why (e.g., "the smart-but-pricier model made the big decisions and looked at the video; the fast-and-cheap model wrote several short messages quickly").]

### 4c. What is "RAG" and "embeddings"? (in plain English)
[TO FILL IN — explain embeddings as turning descriptions into a list of numbers that captures "meaning," so a computer can measure how similar two things are — like a GPS coordinate, but for ideas instead of places. Explain RAG (Retrieval-Augmented Generation) as "look up the most relevant facts first, then let the AI use them to answer" instead of the AI just guessing from memory.]

### 4d. How did it understand a TikTok video?
[TO FILL IN — explain: the program grabbed the video's thumbnail picture and caption, and asked an AI that can "see" pictures to describe the video's style — fast cuts or slow? high energy or chill? What kind of story is it telling? — and turned that into structured tags, the same way a music supervisor would describe a scene.]

### 4e. How did it score and pick creators?
[TO FILL IN — explain the scoring was NOT done by AI guessing, but by a plain math formula the team could see and explain — like a report card with clear categories, not a mystery grade. Explain why: predictable, explainable, and cheaper/faster than asking an AI to do arithmetic.]

### 4f. Where does it run, and how does someone see it live?
[TO FILL IN — explain Vercel (the hosting service, like renting a storefront on the internet so anyone with the link can visit), and that the code lives in a public GitHub repository (a public folder online showing exactly how it was built) linked in the cover letter.]

### 4g. What did we deliberately leave out, and why?
[TO FILL IN — plain-language version of the "cut from lite" list: no permanent memory between visits yet, no database, no "find a replacement creator" feature, no simulated internet outages — explain each cut in one sentence: what it would have added, and why it wasn't necessary to prove the point right now.]

## Part 5: Building It (what actually happened, step by step)

[TO FILL IN as a simple numbered list once built — mirror the steps in PLAN-LITE.md's "Build sequencing" section, but rewritten in plain language, e.g.: "1. Set up the empty project skeleton. 2. Created a pretend list of ~35 TikTok creators with made-up-but-realistic profiles, since we don't have Influur's real data. 3. Built the 'brain' that reads a video's vibe. 4. Built the matching logic. 5. Built the message-writer. 6. Connected everything into one smooth flow you can watch happen live. 7. Built the results page. 8. Tested it and fixed what broke. 9. Put the code on GitHub for anyone to see. 10. Put the website live on the internet."]

## Part 6: Testing (how we know it actually works)

[TO FILL IN — explain in plain language what "QA" (quality assurance / testing) means: pretending to be a real visitor and clicking through the whole thing on purpose to catch anything broken before a real person (a recruiter) sees it. Note the automated browser-testing tool ("gstack") used to click through the site end-to-end. List what was checked and confirmed working.]

## Part 7: What's next / what's saved for later

[TO FILL IN — point back to PLAN-FULL.md conceptually without necessarily publishing its contents: "There's a bigger version of this design ready to go, with more advanced features, that we're saving to talk through directly in an interview rather than publishing."]

## Glossary (plain-English definitions of every technical term used above)

[TO FILL IN as terms get used above — keep this alphabetical and ruthlessly simple. Example starter entries:]
- **Agent** — an AI system that can take actions (not just answer questions), by calling "tools" to look things up or do tasks.
- **API** — a way for two computer programs to talk to each other, like a waiter carrying an order between a customer and a kitchen.
- **Embedding** — a way of turning words or ideas into a list of numbers so a computer can measure how similar two things are.
- **LLM (Large Language Model)** — the technology behind AI chatbots like Claude or ChatGPT; a program trained to understand and generate human language.
- **RAG (Retrieval-Augmented Generation)** — looking up relevant information first, then having the AI use it to respond, instead of relying only on what it already "knows."
- **Repository ("repo")** — a folder of code with a saved history of every change, usually hosted on a site like GitHub.
- **Vector database / vector search** — a way of storing embeddings and quickly finding the "closest" matches to a given one.
