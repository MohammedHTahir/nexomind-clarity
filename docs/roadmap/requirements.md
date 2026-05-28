# Requirements Document

## Introduction

This spec defines a phased competitive roadmap for NexoMind, an AI-powered journaling product focused on helping overthinkers achieve mental clarity. The roadmap covers ten differentiated features delivered across six sequential phases. Each phase is independently shippable behind feature flags, builds on prior phases where dependencies exist, and must align with existing infrastructure (Vite + React + Supabase + Stripe + PWA push) without breaking backwards compatibility with existing journal entries and analyses.

The phases are ordered to maximize early competitive impact (Phase 1 quick wins) before investing in deeper differentiators (Phase 3 privacy moat, Phase 5 clinical safety). Tier gating spans Free, Premium ($9.99/mo or $95/yr), and a new Premium+ tier introduced in Phase 3 for privacy-grade features.

## Glossary

- **NexoMind**: The journaling product encompassing the web app, PWA, edge functions, and database.
- **User**: An authenticated end-user of NexoMind with an active session.
- **Journal_Entry**: A single textual or voice-derived journal record persisted in the `journal_entries` table.
- **Journal_Analysis**: The AI analysis row in `journal_analysis` linked to a Journal_Entry, containing fields such as `cognitive_patterns`, `distortions_or_biases`, `clarity_insight`, `intensity_score`, and `clarity_score`.
- **Reflection_Mode**: The conversational stance used by the AI when responding to entries; one of `companion` (default, supportive) or `challenger` (named cognitive distortions, evidence pushback).
- **Pattern_Interrupt**: A push or in-app notification triggered when a recurring distortion or theme is detected across recent entries.
- **Voice_Entry**: A Journal_Entry created from an audio recording up to 60 seconds, with both transcript and acoustic features.
- **Acoustic_Features**: Numerical signals derived from a voice recording, specifically pace (words per minute), hesitation ratio (silence + filler tokens / total duration), and tonal variability (pitch standard deviation).
- **Sunday_Letter**: A weekly synthesized letter delivered via email, push, and in-app inbox summarizing the user's prior week of entries.
- **E2EE_Mode**: A per-user setting where Journal_Entry plaintext is encrypted client-side with a key derived from a user secret and never transmitted in plaintext to the server.
- **On_Device_LLM**: A small language model executed inside the user's browser or OS (e.g., Gemini Nano via Chrome Prompt API, Apple Intelligence) used to analyze E2EE entries locally.
- **Context_Signal**: A read-only data point ingested from a connected source (Apple Health, Oura, Google Fit, calendar) attached to a Journal_Entry as metadata.
- **MindMap**: The existing `react-force-graph-2d` visualization in the MindMap page; "Living MindMap" refers to the upgraded variant defined in this spec.
- **MindMap_Node**: An entity (person, theme, emotion, decision) extracted from a Journal_Analysis and persisted as a graph node.
- **Therapist_Brief**: A PDF artifact summarizing the last 30 days of journaling for sharing with a clinician.
- **Crisis_Signal**: A combined score derived from voice biomarkers and text patterns indicating elevated risk; only computed when the user has opted in.
- **Trusted_Contact**: A user-designated person (name + phone or email) reachable as part of consented crisis escalation.
- **Mentor_Persona**: A predefined or personalized AI voice/style used for reflections, e.g., Stoic, CBT therapist, no-bs friend, journaling coach, future self.
- **You_Mentor**: A progressively personalized Mentor_Persona trained on a user's own historical entries.
- **Free_Tier**: User without active Stripe subscription; capped at 3 reflections per week.
- **Premium_Tier**: User with active "Premium" Stripe subscription ($9.99/mo or $95/yr).
- **Premium_Plus_Tier**: A new tier introduced in Phase 3 that includes E2EE_Mode and Phase 4+ advanced context features.
- **Feature_Flag**: A server-evaluated boolean (or percentage rollout) keyed by feature name and user identifier used to gate exposure of any roadmap feature.
- **Phase**: A grouping of one or more roadmap features that ship together as an independently releasable increment.

## Requirements

### Cross-Cutting Requirement A: Phase Ordering and Independent Shippability

**User Story:** As the NexoMind product team, I want each phase to be independently shippable, so that we can release value incrementally without coupling unrelated features.

#### Acceptance Criteria

1. THE NexoMind SHALL deliver each phase, defined as production deployment accessible to end users, in the order: Phase 1, Phase 2, Phase 3, Phase 4, Phase 5, Phase 6.
2. IF a feature in Phase N depends on a feature in Phase M, THEN THE NexoMind SHALL ensure M is strictly less than N.
3. IF a feature within a later phase fails its documented acceptance criteria and is therefore not ready, THEN THE NexoMind SHALL still be able to release prior phases without removing, reverting, or disabling code, configuration, or data already shipped to production.
4. THE NexoMind SHALL produce, before Phase 1 implementation begins, a written dependency graph listing every one of the ten roadmap features with its assigned phase and the identifiers of any features it depends on.
5. WHEN a phase is released to general availability, THE NexoMind SHALL run the prior-phase regression test suite against the new build and SHALL block GA if any prior-phase regression test fails.

### Cross-Cutting Requirement B: Feature Flags for Staged Rollout

**User Story:** As a NexoMind operator, I want every roadmap feature behind a feature flag, so that I can enable, percent-roll, or kill features without redeploys.

#### Acceptance Criteria

1. THE NexoMind SHALL gate every feature defined in this spec behind a Feature_Flag evaluated at runtime per User per request.
2. WHEN a Feature_Flag for a User evaluates to disabled, THE NexoMind SHALL render no UI affordance, route, or API surface introduced by that feature for that User, and SHALL not return errors related to the feature's absence.
3. WHEN a Feature_Flag is configured for percentage rollout, THE NexoMind SHALL evaluate inclusion deterministically using a stable hash of the user identifier and the flag key, such that the same User always receives the same evaluation for that flag across sessions and devices until the configuration changes.
4. IF a Feature_Flag evaluation does not return within 250 milliseconds or returns an error, THEN THE NexoMind SHALL treat the flag as disabled for that evaluation and SHALL log the failure for operator review.
5. THE NexoMind SHALL expose to client code only the Feature_Flag values for features the User is eligible to see and SHALL not transmit flag values for features the User is not eligible for.

### Cross-Cutting Requirement C: Backwards Compatibility

**User Story:** As an existing NexoMind user, I want my historical entries and analyses to keep working, so that the roadmap never invalidates my journal.

#### Acceptance Criteria

1. THE NexoMind SHALL retain every existing row in `journal_entries` and `journal_analysis` and SHALL NOT drop, rename, or narrow the data type of any column currently read by the Journal, Insights, MindMap, or Dashboard pages.
2. WHEN a roadmap migration adds a new column to `journal_entries` or `journal_analysis`, THE NexoMind SHALL define the column as nullable or supply a default value so that every pre-existing row remains readable by the Journal, Insights, MindMap, and Dashboard pages without further modification.
3. WHERE a roadmap feature changes the shape of an existing AI output, THE NexoMind SHALL tag each stored output with a schema version identifier and SHALL render outputs of any prior version in the Journal, Insights, MindMap, and Dashboard pages without raising an error.
4. IF a User has no data for a newly added feature, THEN THE NexoMind SHALL render an empty-state view containing a textual message identifying the feature and SHALL NOT display an error indicator, throw an unhandled exception, or leave the page blank.
5. IF a roadmap migration fails to apply or leaves any existing row unreadable by the Journal, Insights, MindMap, or Dashboard pages, THEN THE NexoMind SHALL roll back the migration, preserve the prior schema and data unchanged, and surface an error indication to the operator.

### Cross-Cutting Requirement D: Accessibility (WCAG 2.1 AA)

**User Story:** As a User who relies on assistive technology, I want roadmap features to remain accessible, so that I can use NexoMind on equal terms.

#### Acceptance Criteria

1. THE NexoMind SHALL conform to all WCAG 2.1 Level A and Level AA success criteria applicable to web content on every UI surface introduced by this roadmap, with conformance evidenced by zero critical or serious violations reported by an automated accessibility scan plus a keyboard-only manual pass on each new surface.
2. THE NexoMind SHALL provide a non-empty text alternative for every non-decorative image introduced by this roadmap and SHALL provide a synchronized text transcript or captions for any audio-only or video content introduced by this roadmap; decorative images SHALL be marked so assistive technology ignores them.
3. WHEN a feature introduces a new interactive control, THE NexoMind SHALL make the control reachable via sequential keyboard navigation in a logical reading order, operable using standard keys (Enter or Space for activation, Arrow keys for selection within composite widgets, Escape to dismiss overlays), and free of keyboard traps such that focus can always move away from the control using standard keys.
4. WHEN any new interactive control receives keyboard focus, THE NexoMind SHALL display a visible focus indicator that meets a contrast ratio of at least 3:1 against the adjacent background.
5. THE NexoMind SHALL maintain a contrast ratio of at least 4.5:1 for normal text, at least 3:1 for large text (18pt or larger, or 14pt or larger when bold), and at least 3:1 for meaningful non-text UI components and graphical objects on all new surfaces.
6. WHERE a feature uses motion or animation as a primary affordance, AND WHEN the user's `prefers-reduced-motion` setting is set to `reduce`, THE NexoMind SHALL either disable the motion or replace it with a non-motion alternative that conveys the same information while preserving the underlying functionality.
7. IF an introduced UI surface fails any applicable WCAG 2.1 Level AA success criterion during verification, THEN THE NexoMind SHALL block release of that surface and SHALL surface the failing criterion identifier and the affected element to the development team.

### Cross-Cutting Requirement E: Compliance Posture and Disclaimers

**User Story:** As a User concerned about safety and legal scope, I want NexoMind to be clear that it is not therapy or a medical device, so that I can use it with accurate expectations.

#### Acceptance Criteria

1. THE NexoMind SHALL display, in the Settings page and in the footer of every authenticated page introduced by this roadmap, a disclaimer stating that NexoMind is not a medical device, not therapy, and not a substitute for professional care.
2. WHEN a User first navigates to any Phase 5 feature surface, THE NexoMind SHALL present a Phase-5-specific disclaimer screen stating that the feature does not provide diagnosis, treatment, or emergency response, and SHALL require the User to acknowledge the disclaimer before proceeding to the feature.
3. THE NexoMind SHALL display, on the Phase-5 disclaimer screen, locale-appropriate professional and emergency resource links (988 Suicide and Crisis Lifeline for en-US locale; Samaritans for en-GB locale; the locale-appropriate equivalent or a fallback international resource list otherwise).
4. IF a regulatory regime applicable to a User's locale would classify a feature as a medical device or restricted service, THEN THE NexoMind SHALL block enablement of that feature for that User and SHALL display a message indicating the feature is unavailable in their region pending compliance review.
5. THE NexoMind SHALL persist, per User and per Phase 5 feature, a record of acceptance of the Phase-5 disclaimer including the User identifier, the feature identifier, the disclaimer version, and the acceptance timestamp, prior to enabling crisis-related logic for that User.

### Cross-Cutting Requirement F: Internationalization Readiness

**User Story:** As a future non-English User, I want roadmap features to be ready for localization, so that NexoMind can expand beyond en-US without rework.

#### Acceptance Criteria

1. THE NexoMind SHALL externalize every user-facing string introduced by this roadmap (visible text, headings, button labels, form placeholders, validation and error messages, tooltips, notification and toast text, and ARIA or accessibility labels) into a translatable resource layer keyed by a stable string identifier, with no hard-coded user-facing string literals remaining in component source files.
2. THE NexoMind SHALL ship en-US copy for 100% of the externalized string keys defined for roadmap features at launch, such that no key resolves at runtime to an empty value, the raw key identifier, or an untranslated placeholder token.
3. WHERE a roadmap feature renders dates, times, numbers, durations, percentages, or relative time values, THE NexoMind SHALL produce the rendered output through a locale-aware formatter that consumes the active locale and outputs text matching that locale's conventions for digit grouping, decimal separators, date and time component ordering, and unit labels.
4. IF no localization resource is available for the User's preferred locale, THEN THE NexoMind SHALL render the corresponding en-US string for every affected key and SHALL preserve the original component layout (no text overflow beyond the parent container's bounding box, no clipping or truncation of interactive controls, no overlap with adjacent UI elements, and no horizontal scrollbars introduced on viewports of 320 px width or greater).
5. IF an individual string key has no translation in the User's preferred locale while other keys for that locale resolve successfully, THEN THE NexoMind SHALL fall back to the en-US value for only that specific key without altering the locale used to resolve other rendered strings or locale-aware formatters on the same view.

---

## Phase 1 — Quick Wins (Prompt Engineering and Existing Infra)

### Requirement 1: Anti-Sycophant Toggle (Companion ↔ Challenger Mode)

**User Story:** As an overthinker who notices the AI just agreeing with me, I want to switch the AI between a supportive companion and a direct challenger that names my distortions, so that I get pushback when I need it instead of an echo chamber.

#### Acceptance Criteria

1. THE NexoMind SHALL expose a Reflection_Mode setting in Settings with the values `companion` and `challenger`.
2. THE NexoMind SHALL default Reflection_Mode to `companion` for all existing and new Users on first read of an unset value.
3. WHEN a User changes Reflection_Mode, THE NexoMind SHALL persist the new value and apply it to every `analyze-journal` invocation that begins more than 2 seconds after persistence completes, without requiring a page reload.
4. IF persistence of a Reflection_Mode change fails, THEN THE NexoMind SHALL retain the prior value, surface an error indication to the User, and not apply the failed change to subsequent `analyze-journal` invocations.
5. WHILE Reflection_Mode is `challenger`, THE `analyze-journal` edge function SHALL include in the system prompt instructions to (a) explicitly name detected cognitive distortions from the existing taxonomy when supported by the Journal_Entry content, (b) avoid validating language that is not supported by the Journal_Entry content, and (c) include at least one concrete reframe in the resulting `clarity_insight`.
6. WHEN a Journal_Analysis is produced, THE NexoMind SHALL annotate the analysis with the active `reflection_mode` value (`companion` or `challenger`).
7. THE NexoMind SHALL make Reflection_Mode available to Free_Tier, Premium_Tier, and Premium_Plus_Tier Users with no tier-based gating on the toggle itself.
8. WHILE Reflection_Mode is `challenger`, THE NexoMind SHALL display a one-line in-app notice on the entry result surface, positioned with the Journal_Analysis output, scoped to that result, and dismissible by the User without changing the Reflection_Mode setting.
9. THE NexoMind SHALL record per-analysis the active `reflection_mode` value and SHALL track adoption rate of `challenger` mode and 7-day retention delta between Users whose most recent analyses were predominantly `challenger` versus predominantly `companion`.
10. IF Reflection_Mode is unset or returns an invalid value at read time, THEN THE NexoMind SHALL fall back to `companion` and SHALL log the fallback event for operator review.

### Requirement 2: Pattern Interrupt Push Notifications

**User Story:** As a User who keeps falling into the same loop, I want NexoMind to notice the pattern across my entries and nudge me with a reframe, so that I can break out of recurring distortions.

#### Acceptance Criteria

1. WHEN a Journal_Analysis is written for a User, THE NexoMind SHALL evaluate the User's last 7 Journal_Analyses within a rolling 14-day window and SHALL detect Pattern_Interrupt candidates based on recurrence of `cognitive_patterns` or `distortions_or_biases` values across those analyses.
2. THE NexoMind SHALL define the Pattern_Interrupt recurrence threshold as the same distortion or pattern label appearing in at least 3 of the last 7 Journal_Analyses within the rolling 14-day window.
3. WHEN a Pattern_Interrupt threshold is met AND the User has at least one row in `push_subscriptions` whose endpoint has been validated within the prior 30 days, THE `send-push-notification` edge function SHALL deliver, within 60 seconds of detection, a contextual reframing push referencing the recurring distortion by name with a body of at most 180 characters and SHALL exclude any raw Journal_Entry plaintext, email address, or User identifier from the payload.
4. THE NexoMind SHALL rate-limit Pattern_Interrupt pushes to at most 1 per User per rolling 24-hour window and at most 3 per User per rolling 7-day window; suppressed notifications SHALL fall back to in-app banner delivery on the next authenticated session.
5. IF the User has no validated `push_subscriptions` row OR has disabled push notifications at the OS or app level, THEN THE NexoMind SHALL surface the Pattern_Interrupt as an in-app banner within 2 seconds of the next authenticated session start, and the banner SHALL persist until the User dismisses it or 7 days elapse, whichever comes first.
6. THE NexoMind SHALL provide a Settings toggle to opt out of Pattern_Interrupt notifications independently of other push categories, defaulting to enabled for Premium_Tier and Premium_Plus_Tier and to "in-app banner only" for Free_Tier.
7. WHERE the User is on Free_Tier, THE NexoMind SHALL surface Pattern_Interrupt only as in-app banners and SHALL NOT deliver Pattern_Interrupt push notifications regardless of `push_subscriptions` state.
8. THE NexoMind SHALL track Pattern_Interrupt push tap-through rate, banner click-through rate, and 7-day retention delta between Users who received at least one Pattern_Interrupt and the matched control as success metrics.

---

## Phase 2 — Voice and Engagement

### Requirement 3: Voice-First Thought Dump

**User Story:** As an overthinker who can talk faster than I type, I want to record up to 60 seconds of voice and have NexoMind transcribe it and read my pace, hesitation, and tone, so that the reflection accounts for how I sounded, not just what I wrote.

#### Acceptance Criteria

1. THE NexoMind SHALL provide a voice-entry control on the Journal page that records audio with a minimum duration of 3 seconds and a maximum of 60 seconds.
2. WHEN a User activates the voice-entry control, THE NexoMind SHALL request microphone permission and SHALL not begin recording until permission is granted.
3. IF microphone permission is denied, THEN THE NexoMind SHALL display, within 1 second, a non-blocking message explaining the permission requirement and SHALL only retry permission on a subsequent explicit User activation of the voice-entry control.
4. WHEN a recording reaches 60 seconds, THE NexoMind SHALL stop recording automatically and present a preview offering Submit, Re-record, and Discard options before any data leaves the client.
5. IF a recording duration is less than the 3-second minimum at stop time, THEN THE NexoMind SHALL discard the recording and SHALL display a non-blocking message indicating the minimum duration.
6. WHEN a User submits a Voice_Entry, THE NexoMind SHALL transcribe the audio to text and SHALL compute Acoustic_Features defined as: pace = (transcript word count / recording duration in minutes), hesitation ratio = (silence duration + filler-token duration) / total recording duration, and tonal variability = standard deviation of pitch in Hz across the recording.
7. IF transcription fails, THEN THE NexoMind SHALL preserve the recording on-device, allow the User to retry submission, and SHALL not create a Journal_Entry for the failed submission.
8. WHEN transcription and Acoustic_Features extraction succeed, THE NexoMind SHALL persist the transcript as the Journal_Entry text and the Acoustic_Features as structured fields linked to the Journal_Analysis.
9. THE `analyze-journal` edge function SHALL incorporate Acoustic_Features into the system prompt context such that the resulting `clarity_insight` references at least one of pace, hesitation, or tonal variability when the values are present.
10. THE NexoMind SHALL retain raw audio only for the duration required to produce the transcript and Acoustic_Features and SHALL delete raw audio within 24 hours of successful processing.
11. WHERE the User has E2EE_Mode enabled (Phase 3), THE NexoMind SHALL perform transcription and Acoustic_Features extraction client-side and SHALL NOT upload raw audio to any server.
12. WHERE the User is on Free_Tier, THE NexoMind SHALL show an upsell preview limited to a 15-second demo without persistence; WHERE the User is on Premium_Tier or Premium_Plus_Tier, THE NexoMind SHALL allow full Voice_Entry.
13. WHILE recording is active, THE NexoMind SHALL display a visible recording indicator showing elapsed seconds and a Stop control activatable by mouse, touch, Enter, or Space.
14. IF the User's browser or device does not support audio recording or transcription, THEN THE NexoMind SHALL hide the voice-entry control and SHALL display a brief unsupported-device message in its place.
15. THE NexoMind SHALL track Voice_Entry weekly active rate and 30-day retention delta between Voice_Entry Users and a matched cohort of text-only Users as success metrics.

### Requirement 4: Sunday Letter from Yourself

**User Story:** As a User who forgets last week by Wednesday, I want a weekly letter that synthesizes my themes, decisions, and what to revisit, so that I can see the arc of my week without re-reading every entry.

#### Acceptance Criteria

1. THE NexoMind SHALL generate at most one Sunday_Letter per opted-in User per calendar week, where a calendar week is defined as Monday 00:00 through Sunday 23:59 in the User's local timezone, and where opted-in is defined as the User having enabled the Sunday_Letter feature in Settings.
2. THE NexoMind SHALL deliver the Sunday_Letter via in-app inbox, optional email, and optional push, where each channel is independently toggleable in Settings and where the in-app inbox is the authoritative record of delivery.
3. THE Sunday_Letter SHALL include up to 5 dominant themes (each appearing in at least 2 Journal_Entries in the prior 7 days), up to 3 recurring distortions (each appearing in at least 2 Journal_Analyses in the prior 7 days), up to 3 decisions made or pending, and up to 3 prompts to revisit, derived from the User's Journal_Analyses, with a total length between 200 and 800 words.
4. IF a User has fewer than 2 Journal_Entries in the prior 7 days, THEN THE NexoMind SHALL skip Sunday_Letter generation for that week and SHALL deliver to the in-app inbox a single low-effort prompt of 1 to 2 sentences.
5. THE NexoMind SHALL deliver the Sunday_Letter at a User-configurable local time on Sunday between 06:00 and 22:00 in 30-minute increments, defaulting to 09:00 in the User's local timezone.
6. WHERE the User has E2EE_Mode enabled, THE NexoMind SHALL synthesize the Sunday_Letter on-device using On_Device_LLM and SHALL NOT transmit Journal_Entry plaintext to any server.
7. THE NexoMind SHALL gate the weekly Sunday_Letter to Premium_Tier and Premium_Plus_Tier; WHERE the User is on Free_Tier, THE NexoMind SHALL deliver a monthly version covering the prior 30 days instead of weekly.
8. THE NexoMind SHALL exclude raw Journal_Entry plaintext from email and push channels and SHALL include only the synthesized Sunday_Letter content.
9. IF Sunday_Letter generation fails for a User in a given week, THEN THE NexoMind SHALL retry with exponential backoff up to 3 times within 6 hours of the configured delivery time, and SHALL post a non-error fallback notice to the in-app inbox if all retries fail; the fallback notice SHALL NOT contain Journal_Entry plaintext.
10. IF an optional channel (email or push) fails to deliver after retry, THEN THE NexoMind SHALL preserve the in-app inbox entry as the authoritative record and SHALL not block subsequent week generation.
11. THE NexoMind SHALL track Sunday_Letter open rate, in-app inbox click-through rate, and 30-day retention delta for opted-in Users as success metrics.

---

## Phase 3 — Privacy Moat

### Requirement 5: E2EE Private Mode with On-Device Analysis

**User Story:** As a User writing about things I would never want a server to see, I want my entries encrypted on my device and analyzed by an on-device model, so that even NexoMind cannot read my journal.

#### Acceptance Criteria

1. THE NexoMind SHALL provide an E2EE_Mode toggle in Settings, default off, accessible only to Users on Premium_Plus_Tier.
2. WHEN a User enables E2EE_Mode for the first time, THE NexoMind SHALL guide the User through supplying or generating a user secret of at least 12 characters, SHALL derive a per-user encryption key client-side using a key-derivation function documented in the in-app security disclosure, and SHALL ensure the user secret and derived key are never transmitted to or persisted by NexoMind servers.
3. WHILE E2EE_Mode is enabled, THE NexoMind SHALL encrypt Journal_Entry plaintext on the client device before transmission and SHALL persist only ciphertext on the server.
4. WHILE E2EE_Mode is enabled, THE NexoMind SHALL perform Journal_Analysis using an On_Device_LLM and SHALL persist on the server only those analysis fields the User has explicitly enabled via a per-field opt-in control, encrypted with the per-user encryption key.
5. WHEN a User initiates E2EE_Mode enablement, THE NexoMind SHALL display an irrecoverability disclosure stating that loss of the user secret will result in permanent inability to decrypt journal data, and SHALL require the User to confirm this acknowledgment via an explicit confirmation action before activation completes.
6. IF a User loses access to the user secret while E2EE_Mode is enabled, THEN THE NexoMind SHALL be unable to recover plaintext journal data and SHALL not offer any server-side recovery path.
7. IF On_Device_LLM is detected as unavailable on the User's current device or browser at the time of enablement, THEN THE NexoMind SHALL block E2EE_Mode activation and SHALL display a message identifying the supported On_Device_LLMs and the reason activation is blocked.
8. WHILE E2EE_Mode is enabled, THE NexoMind SHALL exclude E2EE_Mode Journal_Entry data from every feature that requires server-side plaintext access, including Pattern_Interrupt server-side scan, and SHALL execute the equivalent logic on the client device for every such feature whose required plaintext and analysis outputs are available locally.
9. IF a feature requiring server-side plaintext access has no client-side equivalent available locally, THEN THE NexoMind SHALL disable that feature for E2EE_Mode entries and SHALL display a message indicating the feature is unavailable while E2EE_Mode is enabled.
10. THE NexoMind SHALL gate E2EE_Mode access to Users on Premium_Plus_Tier and SHALL make Premium_Plus_Tier purchasable through the existing Stripe integration.
11. THE NexoMind SHALL display the disclosure text "even we can't read your journal" within the Settings E2EE_Mode section together with a plain-language summary of the cryptographic guarantees provided and the limits of those guarantees as documented in the in-app security disclosure.
12. THE NexoMind SHALL list, in the in-app E2EE_Mode disclosure and in public marketing copy, every On_Device_LLM supported by name and platform, including Gemini Nano via Chrome Prompt API on Chromium-based browsers and Apple Intelligence on iOS and macOS.
13. IF an On_Device_LLM becomes unavailable while E2EE_Mode is enabled, THEN THE NexoMind SHALL pause Journal_Analysis, SHALL not route analysis to any server-side model, and SHALL notify the User that analysis is paused until an On_Device_LLM is available again.
14. THE NexoMind SHALL record E2EE_Mode adoption rate among Premium_Plus_Tier Users on a calendar-monthly basis and SHALL record qualitative trust indicators including NPS score and the count of E2EE_Mode-related support tickets within the same monthly reporting period.

---

## Phase 4 — Context Layer

### Requirement 6: Wearable and Calendar Integration

**User Story:** As a User whose mood tracks with my sleep, HRV, and meeting load, I want NexoMind to factor in those signals automatically, so that reflections account for context I would otherwise have to type out.

#### Acceptance Criteria

1. THE NexoMind SHALL provide an Integrations panel in Settings supporting Apple Health, Oura, Google Fit, and read-only calendar connections (Google and Apple).
2. WHEN a User connects a source, THE NexoMind SHALL request only the minimum scopes required for sleep duration, HRV, and calendar event metadata (event count and aggregate duration always; event titles only when User has not enabled title masking).
3. WHEN a Journal_Entry is created AND at least one source is connected, THE NexoMind SHALL attach available Context_Signals from the prior 24 hours as structured metadata on the Journal_Analysis.
4. THE `analyze-journal` edge function SHALL incorporate available Context_Signals into the system prompt context so that reflections can reference sleep, HRV, or meeting load.
5. IF no Context_Signals are available for a Journal_Entry, THEN THE NexoMind SHALL produce reflections using the same pipeline as Users with no integrations connected, with no references to missing data.
6. IF a connected source returns an error or rate-limit response, THEN THE NexoMind SHALL retry with exponential backoff up to 3 attempts over a window not exceeding 30 seconds and SHALL fall back silently to "no context this entry" without surfacing the error to the User.
7. THE NexoMind SHALL bound any Context_Signals fetch attempt to a 5-second total timeout per Journal_Entry creation, beyond which the entry SHALL proceed without Context_Signals.
8. THE NexoMind SHALL allow the User to disconnect any source at any time and SHALL purge cached Context_Signals tied to that source within 24 hours of disconnect.
9. WHERE the User has enabled calendar event title masking, THE NexoMind SHALL pass only event count and aggregate duration to the AI, never event titles.
10. THE NexoMind SHALL gate wearable and calendar integration to Premium_Tier and Premium_Plus_Tier; WHERE the User is on Free_Tier, THE NexoMind SHALL hide the Integrations panel.
11. THE NexoMind SHALL track integration connect rate and entries-with-context proportion as success metrics.

### Requirement 7: Living MindMap Upgrade

**User Story:** As a User trying to see how my themes evolve, I want every entry to add nodes for people, themes, emotions, and decisions to a persistent MindMap, so that I can click any node and see how that thread evolved across all my entries.

#### Acceptance Criteria

1. WHEN a Journal_Analysis is produced, THE NexoMind SHALL extract up to 50 MindMap_Node candidates of types `person`, `theme`, `emotion`, and `decision`, where each node label is between 1 and 80 characters.
2. IF MindMap_Node extraction fails for a Journal_Analysis, THEN THE NexoMind SHALL persist the Journal_Analysis without nodes, log the extraction failure for operator review, and continue rendering the existing MindMap unchanged.
3. THE NexoMind SHALL persist MindMap_Nodes and edges in tables that scale to at least 10,000 nodes per User and SHALL apply incremental graph updates within 500 milliseconds of a new Journal_Analysis without full re-render.
4. THE NexoMind SHALL semantically deduplicate MindMap_Nodes such that variants of the same concept (e.g., "anxiety", "anxious") collapse to a single node, using cosine similarity on embeddings with a threshold of at least 0.85.
5. WHEN a User clicks a MindMap_Node, THE NexoMind SHALL display, within 1 second, a side panel listing every Journal_Entry referencing that node in reverse chronological order, with an excerpt of up to 200 characters and the Journal_Analysis summary for each.
6. THE NexoMind SHALL render the Living MindMap using the existing `react-force-graph-2d` component at a sustained frame rate of at least 30 fps and a pan or zoom response time below 100 milliseconds for graphs of up to 1,000 nodes.
7. WHILE a User has more than 1,000 MindMap_Nodes, THE NexoMind SHALL apply a relevance filter or zoom-to-cluster behavior such that the initial view remains within the frame-rate and response-time bounds in criterion 6.
8. WHERE a User has no MindMap_Nodes, THE NexoMind SHALL preserve the existing MindMap behavior unchanged, with no empty-state error.
9. WHERE the User is on Premium_Tier or Premium_Plus_Tier, THE NexoMind SHALL enable Living MindMap; WHERE the User is on Free_Tier, THE NexoMind SHALL render the existing MindMap without semantic memory and without the upgraded node-click side panel.
10. WHERE the User has E2EE_Mode enabled, THE NexoMind SHALL extract and store MindMap_Nodes client-side and SHALL not store node labels in plaintext server-side.
11. THE NexoMind SHALL track MindMap weekly active usage rate and node-click-to-entry-open rate as success metrics.

---

## Phase 5 — Clinical and Safety

### Requirement 8: Therapist Bridge

**User Story:** As a User in therapy, I want a one-tap export of the last 30 days as a clinical brief I can bring to my next session, so that I do not have to summarize a month of entries from memory.

#### Acceptance Criteria

1. THE NexoMind SHALL provide a "Therapist Bridge" action that generates a Therapist_Brief PDF covering the rolling 30-day window ending at the generation timestamp.
2. THE Therapist_Brief SHALL include: dominant themes (up to 5), recurring distortions (up to 3), a mood arc plotting `intensity_score` and `clarity_score` over the 30-day window, 3 to 5 representative Journal_Entries selected by the AI based on highest absolute deviation from the User's running averages, and a one-page summary of at most 500 words.
3. WHEN the User invokes Therapist Bridge, THE NexoMind SHALL display, within 30 seconds, a preview that allows the User to redact any individual entry from inclusion and SHALL require explicit User confirmation before producing the final PDF.
4. THE NexoMind SHALL provide a "Bring to your next session" UX allowing the User to schedule a reminder between 1 hour and 7 days in the future, tied to a calendar event or local notification.
5. THE Therapist_Brief PDF SHALL include the Phase-5 disclaimer required by Cross-Cutting Requirement E and a footer indicating "Generated by NexoMind on YYYY-MM-DD".
6. WHERE the User has E2EE_Mode enabled, THE NexoMind SHALL generate the Therapist_Brief on-device and SHALL NOT transmit Journal_Entry plaintext to the server.
7. WHERE the User is on Premium_Tier or Premium_Plus_Tier, THE NexoMind SHALL enable Therapist Bridge; WHERE the User is on Free_Tier, THE NexoMind SHALL display Therapist Bridge as a locked feature with an upsell affordance.
8. THE NexoMind SHALL not transmit the Therapist_Brief to any third party automatically; export SHALL be User-initiated only via download or share-sheet.
9. IF the User has fewer than 3 Journal_Entries in the prior 30 days, THEN THE NexoMind SHALL block Therapist_Brief generation and SHALL display a message indicating insufficient data.
10. IF Therapist_Brief generation fails or exceeds the 30-second timeout, THEN THE NexoMind SHALL surface an error indication, SHALL not produce a partial PDF, and SHALL allow the User to retry.
11. THE NexoMind SHALL track Therapist Bridge generation rate among Users who self-identify as in therapy as a success metric.

### Requirement 9: Crisis Detection with Consented Escalation

**User Story:** As a User who sometimes hits a hard moment, I want an opt-in safety net that quietly watches for danger signals and surfaces 988, Samaritans, or my trusted contact when things look bad, so that I have a soft handoff before I spiral.

#### Acceptance Criteria

1. THE NexoMind SHALL provide an opt-in Crisis Detection setting, default off, with a three-step consent flow comprising: (a) Phase-5 disclaimer acknowledgment, (b) explanation of detection signals and false-positive possibility, and (c) explicit opt-in confirmation; all three steps SHALL be required before activation.
2. WHILE Crisis Detection is enabled, THE NexoMind SHALL compute a Crisis_Signal per Journal_Entry within 10 seconds of submission, combining text patterns and, where available, voice biomarkers from the corresponding Voice_Entry.
3. THE NexoMind SHALL define and document a Crisis_Signal threshold during the design phase that has been reviewed and approved in writing by a clinical advisor prior to GA launch.
4. WHEN a Crisis_Signal exceeds the threshold, THE NexoMind SHALL surface, within 5 seconds of detection, an in-app card offering: 988 (en-US default), Samaritans (en-GB locale), the locale-appropriate equivalent or fallback international resource list otherwise, and the User's Trusted_Contact if configured.
5. IF the User has configured a Trusted_Contact and explicitly opts into automatic notification at the time of escalation, THEN THE NexoMind SHALL send a pre-defined message of at most 280 characters to the Trusted_Contact containing only the User's chosen alert text and SHALL NOT include Journal_Entry plaintext, the Crisis_Signal score, or biomarker data.
6. THE NexoMind SHALL never auto-contact emergency services and SHALL never share Journal_Entry plaintext with any third party without explicit per-event User consent.
7. IF Crisis Detection is disabled, THEN THE NexoMind SHALL not compute Crisis_Signal for new entries and SHALL purge biomarker-derived risk fields from existing rows within 24 hours.
8. WHEN a User dismisses an escalation as not relevant, THE NexoMind SHALL log the dismissal as false-positive feedback and SHALL incorporate the feedback into post-launch threshold tuning.
9. IF regulatory review for Crisis Detection has not been recorded for the User's locale per Cross-Cutting Requirement E, THEN THE NexoMind SHALL block activation attempts and SHALL display a message indicating the feature is unavailable in the User's region pending compliance review.
10. WHERE the User is on Premium_Tier or Premium_Plus_Tier, THE NexoMind SHALL enable Crisis Detection; WHERE the User is on Free_Tier, THE NexoMind SHALL allow access to a static resource list (988, Samaritans, locale-appropriate alternatives) without invoking any detection logic.
11. THE NexoMind SHALL track precision and recall of Crisis_Signal against User-confirmed events and SHALL report these metrics to the clinical advisor at least once per calendar quarter as a success metric.

---

## Phase 6 — Identity and Stickiness

### Requirement 10: Mentor Personas with Progressive You-Mentor

**User Story:** As a User who wants reflections in a specific voice, I want to choose between curated mentors like Stoic, CBT therapist, no-bs friend, journaling coach, and future self, and over time grow a personalized "you-mentor" trained on my own voice, so that NexoMind feels like a companion that gets sharper the more I use it.

#### Acceptance Criteria

1. THE NexoMind SHALL ship at least 5 and at most 10 hand-curated Mentor_Personas at launch, including Stoic, CBT therapist, no-bs friend, journaling coach, and future self, where each Mentor_Persona declares a `compatible_modes` attribute indicating whether it supports Reflection_Mode `companion`, `challenger`, or both.
2. THE NexoMind SHALL allow the User to select an active Mentor_Persona for the current session from the available Mentor_Persona list and SHALL allow the User to set a default Mentor_Persona in Settings that is auto-applied at the start of every new session until explicitly changed.
3. WHILE a Mentor_Persona is active for the session, THE `analyze-journal` edge function SHALL compose the system prompt by combining the active Mentor_Persona definition with the active Reflection_Mode setting from Phase 1, where Reflection_Mode determines reflection intent (companion vs challenger) and Mentor_Persona determines voice and vocabulary, and SHALL complete prompt composition within 500 milliseconds before issuing the model call.
4. WHERE the User has accumulated at least 30 Journal_Entries with non-empty content, THE NexoMind SHALL make the You_Mentor option available for selection; otherwise THE NexoMind SHALL display You_Mentor as locked with an indication of the remaining number of Journal_Entries required.
5. WHILE You_Mentor is active, THE NexoMind SHALL compose the system prompt using a personalization profile derived from the User's most recent 30 to 200 Journal_Entries, where the profile contains at minimum top recurring themes, dominant vocabulary markers, and preferred reframe style, and SHALL refresh the profile after every 10 newly added Journal_Entries.
6. WHEN the User opens the You_Mentor profile view, THE NexoMind SHALL display all stored personalization profile fields within 2 seconds and SHALL allow the User to edit or remove any field, with edits persisted before the next prompt composition.
7. WHERE the User has E2EE_Mode enabled, THE NexoMind SHALL derive the You_Mentor personalization profile on-device using only locally decrypted Journal_Entries and SHALL not transmit any profile field value in plaintext to server-side components.
8. IF the active Mentor_Persona's `compatible_modes` does not include the active Reflection_Mode, THEN THE NexoMind SHALL display a one-line notice to the User indicating that Reflection_Mode behavior is being enforced, AND SHALL compose the system prompt such that Reflection_Mode rules govern reflection intent while only the Mentor_Persona's voice and vocabulary attributes are applied.
9. WHERE the User is on Free_Tier, THE NexoMind SHALL allow access to all curated Mentor_Personas but SHALL permit at most 1 Mentor_Persona switch per rolling 7-day window and SHALL block the You_Mentor option; WHERE the User is on Premium_Tier or Premium_Plus_Tier, THE NexoMind SHALL allow unlimited Mentor_Persona switches and SHALL permit You_Mentor selection once eligibility from criterion 4 is met.
10. IF loading the active Mentor_Persona definition or You_Mentor personalization profile fails, THEN THE NexoMind SHALL fall back to the default curated Mentor_Persona, SHALL display an error indication that personalization is temporarily unavailable, and SHALL preserve the User's prior Mentor_Persona selection without overwriting it.
11. THE NexoMind SHALL track Mentor_Persona switch frequency per User per week, You_Mentor adoption rate among Users meeting the eligibility threshold in criterion 4, and the 30-day and 60-day retention delta between You_Mentor Users and default-persona Users, and SHALL update these metrics at least once every 24 hours.

---

## Phase Dependency Summary

- Phase 1 has no dependencies.
- Phase 2 Requirement 3 (Voice-First) is independent of prior phases; Requirement 4 (Sunday Letter) depends on the existing journal pipeline only.
- Phase 3 Requirement 5 (E2EE) depends on no prior phase but interacts with: Phase 1 Requirement 2 (Pattern_Interrupt server-side scan exclusion), Phase 2 Requirement 3 (Voice transcription on-device), Phase 4 Requirement 7 (MindMap_Node extraction client-side), Phase 5 Requirement 8 (Therapist_Brief on-device generation), and Phase 6 Requirement 10 (You_Mentor profile derivation on-device).
- Phase 4 Requirement 6 (Wearables/Calendar) is independent of prior phases; Requirement 7 (Living MindMap) depends on the existing MindMap and journal pipeline.
- Phase 5 Requirement 8 (Therapist Bridge) depends on existing `journal_analysis` fields; Requirement 9 (Crisis Detection) depends on Phase 2 Voice for the voice biomarker component but SHALL function in text-only mode if Voice is disabled or unavailable.
- Phase 6 Requirement 10 (Mentor Personas) is independent at launch; You_Mentor personalization depends on accumulated Journal_Entries and interacts with Phase 1 Reflection_Mode and Phase 3 E2EE_Mode.
