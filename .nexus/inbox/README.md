# Inbox — How To Use

Drop your raw input here. AI reads these files at the start of every session.

## Files

| File | What to put here |
|------|-----------------|
| `ideas.md` | Raw feature ideas, brainstorms, product directions — write naturally, AI will structure it |
| `bugs.md` | Error messages, stack traces, steps to reproduce — paste the exact error |
| `requests.md` | Specific feature or change requests — "I want X because Y" |
| `questions.md` | Technical questions you need answered |

## How AI Processes The Inbox

1. AI reads all inbox files at session start
2. Routes each item to the correct room (per ROUTING.md)
3. Produces outputs in `.nexus/outbox/`
4. Marks processed items with `[PROCESSED: date]` or `[PENDING: reason]`

## Formatting — Just Write Naturally

No special format required for ideas or questions. For bugs, this helps:

```
## Bug: [short description]
Error: [paste exact error message]
What I was doing: [describe the action]
Expected: [what should have happened]
Actual: [what actually happened]
Environment: [dev / staging / production, browser/OS if relevant]
```

## Rules

- Never delete inbox items yourself until AI marks them `[PROCESSED]`
- It's fine to drop multiple items at once — AI handles all of them
- For urgent issues, start your AI session message with: "URGENT: check inbox/bugs.md"
- Items marked `[PENDING]` need more information — see the note AI left for what's needed
