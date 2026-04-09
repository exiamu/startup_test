# VISION.md — Project Vision
<!-- Fill this in at project start. Lock it after the first architect session. -->
<!-- Once LOCKED: never change without creating a new ADR in DECISIONS.md explaining why. -->
<!-- Status: [DRAFT / LOCKED] -->

## Status: DRAFT — substantive working draft as of 2026-04-07

---

## The Problem We Are Solving
Builders lose momentum because AI-assisted development is fragmented. Context gets lost between tools, architecture drifts, prompts are rewritten from scratch, and there is no durable operating layer that can move an idea from rough concept to production without constantly rebuilding process.

This project exists to create a reusable Jarvis-style operating system for execution: a portable, room-based AI workflow plus a control surface that can be dropped into new or existing projects and immediately help plan, build, review, document, and ship.

## Who We Are Solving It For
Primary users are ambitious solo builders, startup operators, and small product teams who want senior-level execution systems without hiring a full cross-functional team up front.

Secondary users are consultants, technical founders, and operators who need one reusable framework that can support many project types: scripts, internal tools, SaaS apps, business automations, and production software products.

## What Success Looks Like (6 months)
- [ ] A portable `.nexus` package can be dropped into both greenfield and brownfield repos and produce a usable working baseline with minimal manual setup
- [ ] `jarvis-ui` provides a reliable mission-control experience over `.nexus` and supports daily workflow management without becoming a second source of truth
- [ ] The system can take at least one real project from idea through implementation using the full room, handoff, review, and documentation workflow

## The North Star Metric
Number of real projects that move from idea to production-ready execution inside the NEXUS + Jarvis workflow without requiring an external process system.

## What This Project Is NOT
- Not a generic chat wrapper with pretty styling but weak process control
- Not a replacement for human approval on strategic, legal, security, or irreversible decisions
- Not a one-project-only scaffold; portability across many project types is part of the product itself

## The Unique Value Proposition
NEXUS + Jarvis gives a solo builder or small team a portable, high-discipline AI operating layer that behaves like a coordinated top-tier startup team instead of disconnected assistants.

---
<!-- Lock this file by changing Status to LOCKED and adding: -->
<!-- LOCKED: [DATE] — approved by [owner] -->
<!-- After locking, record the lock as an ADR in production/vault/DECISIONS.md -->
