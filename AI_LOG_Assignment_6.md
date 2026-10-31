# AI Assistance Log — Assignment 6

**Project:** Dostar Cinema  
**Date:** 31 October 2026  
**Topic:** jQuery selectors, traversal, events, effects and form validation

This entry records the AI-assisted implementation and browser checks for Assignment 6. The questions below are study questions prepared from the code and are useful for explaining it during the defense. They are not presented as questions previously asked by a student.

## 1. Why use `$(function () { ... })`?

It waits until the document is ready before selecting the page controls. The jQuery CDN script loads first, and the page script runs after it. Without this order, `$` may be undefined.

**In this project:** The Home, Movies and Services jQuery files all initialize inside `$(function () { ... })`.

## 2. Why delegate the save-film click to `#movie-list`?

Filtering replaces the film cards. A listener attached directly to the old save button disappears with that button. The list remains in the page, so `$('#movie-list').on('click', '.movie-save', handler)` catches clicks from newly created buttons.

**In this project:** The Movies shortlist uses delegation. The Services review cards use the same pattern for edit and delete.

## 3. What do `.text()` and `.html()` do differently?

`.text()` inserts literal text, so a visitor's input is never interpreted as markup. `.html()` parses markup. Use `.html()` only for fixed, trusted markup.

**In this project:** Review names and messages use `.text()`. The fixed success message uses `.html()` for a bold opening.

## 4. Why use `.prop('checked')` instead of `.attr('checked')`?

`.prop('checked')` reads or changes the checkbox's current state. `.attr('checked')` reflects the attribute written in the original markup and may not match what the visitor has selected.

**In this project:** Services checks consent with `.prop('checked')` and sets it while editing a local review.

## 5. What does the movie-card method chain do?

`attr()` connects the card to its heading for accessibility, `addClass()` applies the shared white card style, and `toggleClass()` marks a saved film. Chaining applies these steps to the same card without selecting it again.

**In this project:** The chain appears in `cardFor()` in `js/movies.js`.

## 6. Why call `event.preventDefault()` on feedback submission?

The reviews stay only in page memory. A normal form submission would navigate or reload, clearing them. The handler prevents navigation, validates every field, and adds a card only when every check passes.

**In this project:** Services shows a message beside each invalid field and checks name, email, phone, topic, review text and consent.

## 7. Why is client-side validation insufficient for a real service?

A visitor can bypass browser code or send a request directly. A real server must validate data again before storing or acting on it. This site has no server and does not send reviews or contact details.

**In this project:** The form keeps `required` and field types, but all reviews remain local to the current tab.

## 8. Why do the effects have durations and callbacks?

The Home tools slide open so the search does not crowd the page until needed. Movie cards fade during filter changes. The review confirmation slides into view after saving. A callback updates focus or data after an animation finishes, avoiding a change halfway through the effect.

**In this project:** The Home panel, Movies list and Services review cards use effects triggered by visitor actions.

## Checks performed

The JavaScript files passed syntax checks. A headless Chrome pass opened all seven pages with CDN access and reported no page errors. It exercised the Home search, Movies filter and save button, Services field errors, valid local review and deletion, and checked that the Home tools do not appear on the other pages.

## 9. Why keep films and showtimes separate?

One film can have several listed times, so each film stores its poster, age rating, language, price and an array of times once. `CinemaData.showtimes` expands those times into distinct session IDs for the Schedule form. This keeps the Movies cards grouped by film while each time can be selected and priced independently.

**In this project:** The three supplied film examples produce 12 session choices. The 00:15 session is marked as after midnight on the following calendar day.
