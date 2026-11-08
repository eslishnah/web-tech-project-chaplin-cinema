# Quality pass

Check another team member's pages at least two days before the deadline. Write only findings you actually observed and fixed.

The local Chrome rows document technical checks only; they do not replace the required endterm check by another team member.

| Date | Tester | Page | Problem found | Fix and commit |
|---|---|---|---|---|
| 2026-10-02 | Sandzhar | movies.html | Not enough information about the movies and available sessions | Added more details and clearer information |
| 2026-10-03 | Daniyar | halls.html | Hall information was too general | Added more details about halls, seats and facilities |
| 2026-10-03 | Nauryzbay | cinema.html | Some important information about the cinema was missing | Added missing details and improved the page content |
| 2026-10-03 | Sandzhar | schedule.html | The schedule section did not clearly explain what the visitor should do next | Added clearer instructions and ticket information |
| 2026-10-02 | Daniyar | visit.html | Contact and location information was not detailed enough | Added clearer contact and location details |
| 2026-10-02 | Nauryzbay | services.html | Some service descriptions were too short | Added more detailed descriptions for visitor services |
| 2026-10-03 | Sandzhar | index.html | The Home page did not clearly guide visitors to the main sections | Improved links and descriptions for the main sections |
| 2026-10-03 | Sandzhar | schedule.html, movies.html, index.html, services.html | The first HTML-only booking draft could not calculate or finish a demo order | Replaced by the JavaScript basket, seat map, validation, calculated estimate and explicit demo confirmation |
| 2026-11-08 | Local Chrome QA | all seven pages | Checked for script errors and document overflow at desktop and mobile widths | No console/page errors and no horizontal document overflow at 1280 × 800 or 390 × 844 |
| 2026-11-08 | Local Chrome QA | movies.html | A saved shortlist could be changed one film at a time but not cleared in one action | Added a JavaScript-created Clear saved films control with disabled and status states; save and clear flow passed |
| 2026-11-08 | Local Chrome QA | schedule.html | The main buyer form did not collect a phone number and the finished demo was difficult to reuse | Added JavaScript-created phone validation and a disabled-until-complete Copy demo summary action; full two-seat flow passed |
| 2026-11-08 | Local Chrome QA | Services, Halls, Schedule, Cinema | Repeated page links crowded the content and duplicated the main navigation | Removed duplicate route buttons, the Services navigation table and checklist action links through JavaScript; all seven pages opened without script errors |
| 2026-11-08 | Local Chrome QA | Movies, Schedule, Booking | Movies and Schedule repeated the same showtimes and the order form made Schedule long | Split the journey into film catalogue, session selection and local order summary; checked the link with a selected film and session at 1280 px and 390 px, and completed one order summary |
| 2026-11-08 | Local Chrome QA | Schedule | The plain session table made films hard to scan; a card layout repeated the Movies page and required too much scrolling | Grouped sessions in a detailed table with compact film headings; checked 6 film groups, 19 session links, no script errors and no table or document overflow at 390 px |
| 2026-11-08 | Local Chrome QA | Booking | Review, prepare, reset and copy controls were visible together before their actions were relevant | Staged the actions, removed redundant form reset and edit link, and placed Copy beside the finished result; checked initial, seat selection, review, changed details and completed summary at 1280 px and 390 px |
