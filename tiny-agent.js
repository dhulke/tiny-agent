#!/usr/bin/env node
const { execSync } = require("node:child_process");
const rl = require("node:readline");

const tools = {
  bash: {
    desc: "Run a bash command; returns stdout+stderr.",
    run: (cmd) => {
      try {
        return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
      } catch (e) {
        return (e.stdout || "") + (e.stderr || "") + `\n[exit ${e.status}]`;
      }
    },
  },
};

function formatTools(tools) {
  return Object.entries(tools).map(([n, t]) => `- ${n}: ${t.desc}`).join("\n");
}

const sys = "You are a tiny coding agent. To use a tool, emit "
  + "`<name>input</name>`. The runtime parses these tags, "
  + "runs the tool, and replies with "
  + "`<name-output>...</name-output>`. After seeing tool "
  + "output, either call another tool or give a final text "
  + `answer. Tools:\n${formatTools(tools)}`;

const history = [{ role: "system", content: sys }];

async function chat() {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPEN_AI_API_KEY}`,
    },
    body: JSON.stringify({ model: "gpt-4o-mini", messages: history }),
  });
  return (await r.json()).choices[0].message.content;
}

function parseToolCalls(msg) {
  return [...msg.matchAll(/<(\w+)>([\s\S]*?)<\/\1>/g)].filter((m) => tools[m[1]]);
}

function formatToolResponses(calls) {
  return calls.map((m) =>
    `<${m[1]}-output>\n`
    + tools[m[1]].run(m[2].trim())
    + `\n</${m[1]}-output>`
  ).join("\n");
}

const io = rl.createInterface({ input: process.stdin, output: process.stdout, prompt: "you > " });
io.prompt();
io.on("line", async (line) => {
  history.push({ role: "user", content: line });
  while (true) {
    const msg = await chat();
    history.push({ role: "assistant", content: msg });
    const calls = parseToolCalls(msg);
    if (!calls.length) { console.log("agent > " + msg); break; }
    const out = formatToolResponses(calls);
    history.push({ role: "user", content: out });
  }
  io.prompt();
});
