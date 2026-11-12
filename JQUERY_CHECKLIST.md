# Assignment 6 jQuery checklist

| Requirement | Location and example |
|---|---|
| jQuery features and comparison comments | `js/jquery-home.js` (Home featured-films carousel), `js/movies.js` (film filters and shortlist), `js/jquery-services.js` (review form, star ratings and review cards). Previous versions: unlinked `js/old-js-version.js`. |
| CDN, order and ready | All six pages load the full jQuery 3.7.1 CDN build before `js/jquery-reading.js` and any jQuery page script. Each jQuery script initializes with `$(function () { ... })`. |
| Selectors | ID: `$('#movie-list')`; class: `.movie-save`; element: `$('main')`; attribute: `[required]`; filter: `:checked` for the selected rating. |
| Traversal | `.find()`, `.parent()`, `.next()` and `.each()` in the Reviews form and rating controls; `.closest()` in delegated film and review buttons. |
| Chains | Movie card styling and Home carousel creation use chains of three or more methods. `cardFor()` comments explain the card styling chain. |
| Content and attributes | `.text()` for visitor content and form labels, `.val()` for forms, `.attr()` for links and ARIA, and `.prop('checked')` to restore a saved star rating during editing. |
| Appearance | Existing Bootstrap/base classes changed through `.addClass()`, `.removeClass()`, `.toggleClass()` and `.hasClass()`; no new CSS rules. |
| Data-generated content | The featured carousel and the 24 Movies cards come from `CinemaData.films`. They are created with `.append()` and absent from the HTML source. |
| Events and delegation | All new feature handlers use `.on()`. Click, input, change and submit occur. Movie save and Reviews edit/delete buttons use delegated handlers on persistent parents. |
| Effects | Movies filters use `.fadeIn()`. Review deletion uses `.fadeOut()` before refreshing the list. |
| Validation | Reviews requires a signed-in profile, one to five stars and a review of 10–500 characters. Validation messages appear beside the relevant fields. Posting adds a review to the current tab and updates the average rating. |
| Submission files | jQuery files, unlinked `old-js-version.js`, updated `README.md`, `AI_LOG_Assignment_6.md`. |
| Browser check | The Endterm integration was checked in Chrome at 375, 768 and 1440 px with local copies of the same CDN dependencies. Browser checks covered the catalogue and booking flows, as well as sign-in, keyboard and click ratings, and posting, editing and deleting a review. |

**Repository history:** The previous assignment is recorded in Git. Contribution requirements apply to work and commits by the student team.
