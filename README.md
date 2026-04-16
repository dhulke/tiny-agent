# tiny-agent

The shortest readable coding agent that can auto-improve. A single 68-line Node.js file with zero dependencies — it talks to OpenAI, parses `<bash>` tags from the response, executes them, and feeds the output back until the model has a final answer.

It can do anything a bash shell can do, including reading and rewriting its own source code. Ask it to add features, fix bugs, or refactor itself.

## Quickstart (Docker)

```bash
git clone git@github.com:dhulke/tiny-agent.git
cd tiny-agent
echo "OPEN_AI_API_KEY=sk-..." > .env
npm run agent
```

This runs the agent inside an Alpine Linux container. Your API key stays in `.env` (gitignored) and the agent can only touch files inside the container.

## Running locally

```bash
export OPEN_AI_API_KEY=sk-...
node tiny-agent.js
```

When run locally the agent has full access to your machine — it can read, write, and execute anything your user can.

## How it works

1. Reads your input from stdin
2. Sends conversation history to `gpt-4o-mini`
3. If the response contains `<bash>...</bash>`, executes the command and appends the output
4. Repeats step 2–3 until the model responds with plain text
5. Prints the response and waits for the next input

Tools are defined in a simple map — add a key to register a new one. The system prompt is auto-generated from this map.
