# Dostar Cinema — Assignments 4–5

A seven-page student frontend using HTML, Bootstrap 5.3.3, the existing CSS and plain JavaScript. Visitors can find films, manage a ticket basket, add local reviews and plan a visit. No real payment, reservation or message delivery exists.

## Team and files

| Member | Files |
|---|---|
| Daniyar | Home, Movies, Schedule; `js/data.js`, `js/movies.js`, `js/schedule.js` |
| Sandzhar | Cinema, Halls; `js/cinema.js`, `js/halls.js` |
| Nauryzbay | Visit, Services; `js/visit.js`, `js/services.js` |

This follows existing page ownership and proposes review/defense responsibilities. It is not a claim of individual authorship of generated code. Shared files are `js/main.js` and `js/reviews.js`; see the AI log.

## Page list

| Page | Visitor purpose |
|---|---|
| `index.html` | Choose where to go next |
| `movies.html` | See published films and cinema photos |
| `schedule.html` | View listed sessions and the on-site ticket checkout interface |
| `cinema.html` | Learn about the cinema |
| `halls.html` | See published hall facts and leave review details |
| `visit.html` | Find the cinema and contact details |
| `services.html` | Read about visitor services and enter feedback |

## Three visitor journeys

1. **Find the cinema:** Start on Home - open Visit - read the location and route - open the map or phone link. End: the visitor has directions or a working contact method.
2. **Practice ordering tickets:** Movies → search/filter → choose a film → Schedule receives its session → enter date, quantity and youngest age → open the 2D seat map → choose exactly that many seats → add them to the basket → enter buyer details and consent → review → confirm the demo. Changing details or seats invalidates the review. Confirmation clears the basket and retains a labelled last-demo summary. No real tickets or payments are produced.
3. **Check facilities and contact:** Start on Home - open Cinema - open Halls - open Services - open Visit - use the phone link. End: the visitor has checked the published hall and parking information and can contact the venue.

## Run

Open `index.html` with VS Code Live Server or another static server. No build is needed. Bootstrap CSS and its existing navigation bundle load from jsDelivr and require internet access. Deferred scripts load in order: `data.js`, `main.js`, then the relevant page script.

## Source of current cinema facts

Historical reference for the existing venue and film data: https://ticketon.kz/en/place/dostar-cinema. This is a documentation source only, not part of the visitor checkout journey.
Official cinema website: https://dostarcinema.kz/
Static film examples were checked on 4 October 2026. Current facts were not reverified by this implementation. Confirm with the venue before travel.

## Functionality Plan

| Page | Visitor goal | Function | Expected result | Responsible student |
|---|---|---|---|---|
| All seven | Find a page and read comfortably | Search/category/reset, larger text, skip link | Matching destinations/count/empty state; saved reading preference | Shared team |
| Movies | Find a suitable film | Combined search, age filter, sorting | Matching cards/count/reset and session handoff | Daniyar |
| Movies | Remember films | Save/remove and shortlist filter | Saved film IDs on this device; fallback if storage unavailable | Daniyar |
| Schedule | Practice buying tickets | 2D seat picker, basket, quantity, remove/clear, validation, review/confirm | Chosen seat labels, estimated totals and DEMO reference | Daniyar |
| Cinema | Prepare for different needs | General/family/assistance checklist, progress/reset | Useful preparation steps and relevant links | Sandzhar |
| Halls | Manage a review | Validation, counter, local cards, average rating, sort/edit/delete | Completed local review, with empty/duplicate states | Sandzhar |
| Visit | Decide when to leave | Date/time/travel/buffer calculation | Departure time or an invalid/impossible-plan message | Nauryzbay |
| Services | Prepare visitor feedback | Name/email/topic/message validation, counter, sort/edit/delete | Local feedback card; no email displayed or sent | Nauryzbay |

## Data and rules

- The original three films/posters remain. `CinemaData.pages` supplies seven real objects with five meaningful properties for the shared page search. Extra films or screenings were not invented to reach six objects.
- KZT 1,000 per ticket is a **demo estimate** based on the old starting-price examples, not a verified charge.
- Demo dates range from today through the next 30 days, using the device's local clock. Past session times today are rejected. This range does not assert real cinema availability.
- Demo restrictions: one session per date, 1–10 tickets per session, youngest visitor at least the film's rated age. The 12 × 12 seat map is an illustrative layout created for the assignment. Selected seat labels are part of the local demo basket, but no actual hall is assigned and no seat availability is checked or reserved.
- `Math.random()` contributes to a temporary DEMO reference, not a booking token or security credential.
- Only larger text and shortlist IDs use localStorage. Basket, contact details, notes and reviews stay in page memory and disappear on reload. Nothing is sent to a backend.
- No login page exists, so the conditional login/registration module is not applicable.

## HTML/CSS freeze and existing corrections

Only deferred script links were added to HTML. `css/base.css` is unchanged. Runtime elements use DOM methods and existing Bootstrap/base classes through `classList`; no generated CSS, `element.style`, inline events, jQuery or new runtime framework is used.

Two existing defects are corrected at runtime, without rewriting HTML: Visit's map URL had a newline and stray trailing digit; Halls implied that this demo assigned a hall. `visit.js` removes the malformed suffix (the external destination was not reverified), and `halls.js` replaces the unsupported claim with a contact-the-cinema message. These repairs are not scored features.

Six HTML files already had uncommitted changes when this work began; they were preserved. No `midterm` tag was present in this checkout. `tests/freeze-baseline.json` is a regression baseline reconstructed by removing the added script links; it is **not** independent proof of a midterm revision. Compare with your actual midterm before submission; preserve its real tag.

## Verification and documentation

The follow-up visual refresh removes the redundant navigation buttons identified in the screenshots. Shared JavaScript creates green page introductions with small orange accents, consistent white cards, a quieter footer disclosure, venue facts and service FAQs. Core movie selection, map access, navigation and checkout controls remain available. No HTML/CSS source changes were needed for this refresh.

Run dependency-free checks: `node --test tests/logic.test.cjs tests/freeze.test.cjs`.

`tests/browser.cjs` uses development-only Playwright and installed Chrome. It is not loaded by the website. Run `node tests/browser.cjs` where Playwright is available, or follow `tests/evidence/README.md` manually. The tests do not certify full WCAG compliance or live venue information.

- `JAVASCRIPT_CHECKLIST.md`: requirements mapped to exact source lines.
- `DEFENSE_JS_RU.md`: code explanation and live-change exercises.
- `AI_LOG_Assignment_4_5.md`: honest disclosure of generated implementation.
- `tests/evidence/`: browser evidence and test scope.

## Remaining submission responsibilities

The supplied assignment prohibits AI-written code and documentation. This generated implementation is **not compliant with that authorship rule** as-is; discuss permission with the teacher or produce permitted work independently. Do not claim unaided authorship.

No commits or tags were created. The team must understand the code, confirm actual responsibilities, preserve `midterm`, and create legitimate `assignment-4`/`assignment-5` milestones. Stage 4 logic is separated in `data.js`, but this does not create historical milestones. Meet the meaningful-commit requirement over at least three days: four per team member, or six for an individual. Do not backdate or fabricate contributions.
