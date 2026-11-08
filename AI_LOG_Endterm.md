# AI assistance log — Endterm

## 2026-11-08

**Student request:** Check the endterm brief, then improve the existing Dostar Cinema site so it feels complete and convenient while following the freeze rules.

**AI assistance used:**

- Compared the existing implementation with the endterm requirements.
- Identified that the main Schedule form validated email but did not collect or validate a phone number.
- Added a reusable phone validator, a JavaScript-created phone field, a clear-shortlist action and a copyable demo-order summary.
- Reused existing Bootstrap classes and did not add HTML markup, CSS rules or inline event handlers.
- Removed experimental Home hover/zoom code that changed inline styles, was not keyboard-equivalent and did not support the visitor journey.
- Ran JavaScript syntax checks and a local Chrome pass on all seven pages at desktop and mobile widths.
- Tested the Movies saved-film clear flow and the complete Schedule flow with two seats, review, confirmation and clipboard copy.
- Added three films from supplied screenshots, downloaded their local posters from public film listings and made the demo price depend on the selected session.
- Audited repeated page-navigation buttons after midterm feedback and removed duplicated routes through JavaScript while keeping primary task actions and the shared navigation.
- Split repeated film sessions and checkout into an eight-page flow: Movies → Schedule → Booking. Renamed the visible checkout result as a local order summary and kept its no-reservation notice accurate.
- Reworked Schedule into a film-grouped three-column table using JavaScript and existing Bootstrap classes, then checked desktop and mobile views.
- Removed the unnecessary Booking order-notes control from the rendered page and from validation and review text.
- Simplified Booking into visible steps and removed redundant reset/edit controls; tested that changing buyer details invalidates the previous review.
- Aligned the labels for the main visitor route across Home, Movies, Schedule, Booking and Visit; checked all eight pages on desktop and mobile widths.
- Replaced the malformed Visit map URL with the 2GIS location link supplied by the student and removed the old runtime URL repair.

**Files changed with AI assistance:**

- `js/data.js`
- `js/jquery-services.js`
- `js/jquery-home.js`
- `js/main.js`, `js/cinema.js`
- `booking.html`
- `visit.html`, `js/visit.js`
- `js/movies.js`
- `js/schedule.js`
- `images/cat-in-the-hat.jpg`, `images/qudiret.jpg`, `images/little-demons.webp`
- `README.md`
- `QUALITY_PASS.md`
- `AI_LOG_Endterm.md`

All changes remain a frontend student demo. No real payment, message, ticket or seat reservation is created.
