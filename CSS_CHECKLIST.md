# CSS and Bootstrap Checklist — Assignment 3

This checklist describes the current Bootstrap version. Source lines refer to the local HTML and CSS files, not the external Bootstrap distribution. It replaces the old Assignment 2 checklist and does not claim that the removed custom CSS techniques are still used.

## Active custom CSS

All eight pages load `css/base.css` after Bootstrap. The legacy `css/daniyar.css` and `css/sandzhar.css` files are not loaded by any current page.

| Technique | File | Lines | Implementation |
|---|---|---|---|
| Root pseudo-class and CSS custom properties | `css/base.css` | 1–9 | `:root` defines Bootstrap colour, body and font variables |
| Type selectors, class selector and grouped selectors | `css/base.css` | 11–16 | `h1`, `h2`, `h3`, `.navbar-brand` share a font family |
| Image proportions and cropping | `css/base.css` | 18–21 | `.card-img-top` uses `aspect-ratio: 4 / 3` and `object-fit: cover` |
| Preformatted text wrapping | `css/base.css` | 23–25 | `pre` uses `white-space: pre-wrap` |

Theme variables affect the Bootstrap rules that use them. They do not replace every component-specific colour, so some buttons, alerts and table colours retain Bootstrap defaults.

## Bootstrap layout and components

| Technique or component | Example file | Lines | Classes or markup | Page author |
|---|---|---|---|---|
| Bootstrap CSS followed by local overrides | `index.html` | 10–11 | External stylesheet links in load order | Daniyar |
| Responsive navigation | `index.html` | 16–30 | `navbar`, `navbar-expand-lg`, toggler and collapse target | Daniyar |
| Mobile navigation JavaScript | `index.html` | 75 | Bootstrap bundle from CDN | Daniyar |
| Responsive page container and heading | `index.html` | 35–36 | `container`, `py-4`, `display-5`, `text-center`, `text-md-start` | Daniyar |
| Responsive image and content columns | `index.html` | 37–46 | `row`, `g-4`, `col-12`, `col-lg-5`, `col-lg-7`, `img-fluid` | Daniyar |
| Nested row and team columns | `index.html` | 48–60 | `row`, `col-12`, `col-md-4`, `h-100` | Daniyar |
| Flexbox and responsive alignment | `index.html` | 69 | `d-flex`, `flex-column`, `flex-md-row`, `justify-content-between`, `align-items-md-center` | Daniyar |
| Responsive float and spacing | `movies.html` | 66–70 | `float-md-start`, `me-md-3`, `mb-3` | Daniyar |
| Responsive table wrapper | `movies.html` | 78–111 | `table-responsive`, `table`, `table-striped`, `table-hover` | Daniyar |
| Responsive gallery and cards | `movies.html` | 119–144 | `row`, `col-12`, `col-md-6`, `col-lg-4`, `card`, `card-body` | Daniyar |
| Form layout and controls | `schedule.html` | 103–169 | `row`, `g-3`, `form-label`, `form-control`, `form-select`, `form-check` | Daniyar |
| Button variants | `schedule.html` | 164–165 | `btn-success`, `btn-outline-secondary`, `btn-sm` | Daniyar |
| Cinema gallery | `cinema.html` | 29–33 | Responsive columns, cards, borders and shadows | Sandzhar |
| Hall information and table | `halls.html` | 29–31 | Responsive columns and `table-responsive` | Sandzhar |
| Hall feedback form | `halls.html` | 36–53 | Fieldset, responsive controls, radios and checkbox | Sandzhar |
| Preformatted code panel | `colophon.html` | 30–34 | `bg-light`, `border`, `rounded-3`, `p-3`, `small` | Sandzhar |
| Visit gallery | `visit.html` | 46–50 | Responsive cards and images | Nauryzbay |
| Service columns and description list | `services.html` | 32–37 | `row`, `col-md-4`, `col-sm-3`, `col-sm-9` | Nauryzbay |
| Feedback controls and disabled button | `services.html` | 50–67 | Form classes, `disabled` and `aria-disabled` | Nauryzbay |

Bootstrap supplies the responsive grid, Flexbox utilities, spacing and component styling. The active custom stylesheet does not implement a CSS Grid layout or the old positioning, pseudo-element and specificity demonstrations. No current page contains an internal style block or inline style attribute.

## Scope and verification

The forms are frontend demonstrations with native browser validation. Their placeholder POST actions have no backend handler; real bookings and feedback delivery are outside the assignment scope.

The rows above identify source examples, not completed browser tests or a guarantee of compliance with every course requirement. Before submission:

- [ ] Validate all HTML files and `css/base.css`.
- [ ] Inspect layouts at 375 px, 768 px and desktop widths.
- [ ] Test the navigation toggler with Bootstrap loaded.
- [ ] Check local links, images, field labels, native validation and reset buttons.
- [ ] Capture the required Movies page screenshots.
- [ ] Update source line references after HTML or CSS changes.
