# JavaScript checklist — Assignments 4–5

Line references describe this implementation and must be updated after source changes. They demonstrate technical coverage, not compliance with the assignment's AI-authorship policy. See `AI_LOG_Assignment_4_5.md` and README submission notes.

| Requirement | Exact file/line | Implementation |
|---|---|---|
| Shared/page-specific scripts | `js/main.js:3`, `js/movies.js:3`, `js/schedule.js:3` | Common helpers and isolated page initialization; script links use defer |
| Strict mode; const/let | `js/data.js:1`, `js/schedule.js:73` | Strict mode in every application file; mutable basket/review state |
| 6+ real objects with 4+ properties | `js/data.js:12` | Seven real site pages, five properties each |
| Arrays, loops, transformations | `js/data.js:40`, `js/main.js:52`, `js/schedule.js:354` | Filter/sort, traversal and mapped confirmation summary |
| Four reusable param/return functions | `js/data.js:22`, `js/data.js:32`, `js/data.js:36`, `js/data.js:53`, `js/data.js:76` | Date, currency, lookup, validation, totals |
| Function calls another | `js/data.js:55`, `js/data.js:76` | Validation/totals call film lookup; date checks call date helpers |
| Arithmetic and conditions | `js/data.js:53`, `js/data.js:76`, `js/data.js:88` | Bounds, quantity × price, departure subtraction |
| Logical operators and strict equality | `js/data.js:41`, `js/data.js:57`, `js/main.js:72` | AND, OR, === and !== in real filters/validation |
| Meaningful Math.random | `js/data.js:84` | Explicit DEMO reference, no security/business promise |
| Repeated DOM rendering + empty states | `js/main.js:41` | Shared renderList creates/replaces children, including table/list empty states |
| Safe user text | `js/main.js:7`, `js/reviews.js:43`, `js/schedule.js:344` | textContent for review and buyer output |
| Catalogue controls/count/reset | `js/movies.js:9`, `js/movies.js:23`, `js/movies.js:70` | Combined search/age/sort, shortlist, result count and reset |
| Shared site feature | `js/main.js:127`, `js/main.js:156` | Reading settings and seven-page search/filter |
| Submit/click/input/change/keydown | `js/schedule.js:307`, `js/main.js:14`, `js/movies.js:78`, `js/main.js:179` | Event listeners; no inline event attributes |
| Hidden/active/selected/error/success | `js/main.js:55`, `js/main.js:62`, `js/movies.js:48`, `js/movies.js:74` | Existing classes and textual/ARIA feedback |
| Visual refresh through JS | `js/main.js:190`, `js/movies.js:35` | Requested redundant buttons removed; page introductions, cards and useful visitor details use existing Bootstrap classes |
| Four-field validation and linked rule | `js/data.js:53`, `js/schedule.js:322` | Trimmed name, email, date, count, consent; age compared with film rating |
| Field errors and focus | `js/main.js:62`, `js/main.js:81`, `js/schedule.js:366` | aria-describedby/invalid, first-error focus, clearing outdated errors |
| Seat-map modal | `js/schedule.js:77`, `js/schedule.js:114`, `js/schedule.js:145`, `js/schedule.js:202` | Dark JavaScript-created 12 × 12 map with curved SVG screen, aisles, row labels, legend, selection count, cancellation and basket transfer |
| Prepared cart container | `js/schedule.js:42`, `js/schedule.js:266` | Existing #order-summary; seats, line totals, quantity, add/increase/decrease/remove/clear |
| Review/confirmation/empty checkout | `js/schedule.js:248`, `js/schedule.js:340`, `js/schedule.js:350` | Edits invalidate review; disabled empty checkout; last-demo summary with seats |
| Booking dates/count/live summary | `js/data.js:53`, `js/schedule.js:255`, `js/schedule.js:307` | Past dates/times, age and conflicting dates rejected; live estimate |
| Reviews | `js/reviews.js:41`, `js/reviews.js:43`, `js/reviews.js:82` | Counter, one card renderer, name/text/category/rating/time, validation, duplicate/edit/delete |
| Other visitor tasks | `js/cinema.js:23`, `js/visit.js:41` | Tailored checklist and departure planner |
| Keyboard/readability | `js/main.js:102`, `js/main.js:115`, `js/main.js:138` | Skip link, real buttons, larger text, focus and responsive classes |
| No CSS/HTML feature edits | `tests/freeze.test.cjs:10` | Regression hashes, excluding only added JS script links; independent midterm comparison still required |
| Tests/evidence | `tests/logic.test.cjs:1`, `tests/browser.cjs:1` | Pure logic tests and Chrome user journeys; see evidence README |
| AI log, commits and tags | `AI_LOG_Assignment_4_5.md:1`, `README.md` | Disclosed AI generation; student commits/tags and policy resolution still outstanding |

The login/password module is not applicable because the project has no authentication pages. No backend, live availability, real transactions or invented reviews are included.
