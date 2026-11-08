# Assignment 6 jQuery checklist

| Requirement | Location and example |
|---|---|
| Three rewrites and comparison comments | `js/jquery-home.js` (Home search and reading tools), `js/movies.js` (film filters and shortlist), `js/jquery-services.js` (feedback form and review cards). Previous versions: unlinked `js/old-js-version.js`. |
| CDN, order and ready | All seven pages load the full jQuery 3.7.1 CDN build before `js/jquery-reading.js` and any jQuery page script. Each jQuery script initializes with `$(function () { ... })`. |
| Selectors | ID: `$('#movie-list')`; class: `.movie-save`; element: `$('body > header')`; attribute: `[required]`; filter: `option:selected` and `article:first`. |
| Traversal | `.find()`, `.parent()`, `.siblings()` and `.each()` in Services form and review handling; `.closest()` in delegated film and review buttons. |
| Chains | Movie card styling and Home panel creation use chains of three or more methods. `cardFor()` comments explain the card styling chain. |
| Content and attributes | `.text()` for visitor content, `.html()` for a fixed success message, `.val()` for forms, `.attr()` for links/ARIA, `.prop('checked')` for current checkbox state. |
| Appearance | Existing Bootstrap/base classes changed through `.addClass()`, `.removeClass()`, `.toggleClass()` and `.hasClass()`; no new CSS rules. |
| Data-generated content | Home page results come from `CinemaData.pages`; 24 film cards and their detail buttons come from `CinemaData.films`. They are created with `.append()` and absent from the HTML source. |
| Events and delegation | All new feature handlers use `.on()`. Click, input, change, submit and reset occur. Movie save and Services review buttons use delegated handlers on persistent parents. |
| Effects | Home panel: `.slideToggle()`/`.slideUp()`; Movies filters: `.fadeIn()`; Services confirmation: `.slideDown()`; review deletion: `.fadeOut()`. Durations and callbacks are present. |
| Validation | Services feedback checks trimmed name, email, phone, topic, review and consent. Each error appears beside its own field and updates as the field changes. A valid submission resets the form and shows a local review. Browser `required` and input types remain; server validation would be required for a real service. |
| Submission files | jQuery files, unlinked `old-js-version.js`, updated `README.md`, `AI_LOG_Assignment_6.md`. |
| Browser check | The Endterm integration was checked in Chrome at 375, 768 and 1440 px with local copies of the same CDN dependencies. The catalogue filter and shortlist, field-level email and phone validation, and the successful review result were exercised. |

**Repository history:** The previous assignment is recorded in Git. Contribution requirements apply to work and commits by the student team.
