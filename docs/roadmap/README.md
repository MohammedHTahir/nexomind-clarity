# NexoMind Competitive Roadmap

A phased product roadmap covering ten differentiated features for NexoMind, designed to compete with Rosebud, Mindsera, Reflection, Life Note, and DeepJournal.

## Documents

- **[requirements.md](./requirements.md)** — User stories and EARS-format acceptance criteria for all 10 features plus 6 cross-cutting requirements (phase ordering, feature flags, backwards compatibility, accessibility, compliance, i18n).
- **[design.md](./design.md)** — Architecture, schema additions, edge function changes, and per-phase component design. Includes 10 correctness properties traceable to specific requirements.

## The six phases

| Phase | Theme | Features |
|---|---|---|
| 1 | Quick wins | Anti-Sycophant Toggle (Companion ↔ Challenger), Pattern Interrupt push notifications |
| 2 | Voice & engagement | Voice-First Thought Dump, Sunday Letter from Yourself |
| 3 | Privacy moat | E2EE Private Mode with on-device LLM (introduces Premium+ tier) |
| 4 | Context layer | Wearable + Calendar integration, Living MindMap upgrade |
| 5 | Clinical & safety | Therapist Bridge PDF, Crisis Detection with consented escalation |
| 6 | Identity & stickiness | Mentor Personas + progressive You-Mentor |

Each phase is independently shippable behind feature flags. See `requirements.md` § Phase Dependency Summary for cross-phase interactions, especially around E2EE.

## Status

Requirements and design phases are complete. The implementation tasks phase has not been started — pick up from `design.md` to derive a tasks plan, or branch the work into per-phase specs.
