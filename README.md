# Campus Stores

Campus Stores is an offline, browser-based sample application for a campus media equipment desk. It helps staff issue individually identified equipment, record returns, and hand open items to the next shift.

## Problem and product decisions

The original flow connected an approved request to physical unit IDs, but recording a return immediately closed that unit's slip. The Film Society scenario needs staff to return the projector and speaker on Friday while keeping the adapter loan open for Leela's Saturday return.

This version keeps one loan record per physical unit and records each return independently. The outstanding item remains visible in the Handover view with its borrower, club, due time, promised return, unit ID, and next-shift instruction. Saturday staff must match the ID before completing the return. A mismatch leaves the loan and inventory unchanged. This keeps the original vanilla application and browser storage model while making the exception visible and actionable.

## What is included

- An operational overview with live available, on-loan, repair, unissued-request, and return counts.
- Approved request detail and equipment issue records with request, borrower, due time, and physical units.
- Searchable inventory with availability, loan, and repair filters.
- Item-level returns that preserve other outstanding equipment.
- A persistent Handover view with loan-linked promises and instructions, alongside the original Desk book.
- A three-step sample shift, offline local storage, malformed-data recovery, and a restartable sample dataset.
- The completed Candidate response in the app's **Candidate brief**, including the proposed real-counter measurement. No user research or live results are claimed.

## Technical notes

The app uses semantic HTML, CSS, and vanilla JavaScript without runtime dependencies or a backend. The sample catalog and approved requests are defined in `app.js`; a versioned state object in browser `localStorage` preserves the current shift. Each active physical unit can have only one open loan. Return history, promise, and handover instruction live on the corresponding item record. The Restart sample shift action restores the original microphone loan and scenario starting point.

This is a fictional single-browser sample, not a multi-staff system of record. Browser storage is local to that browser profile and is not synchronized. Return time and promise fields are staff-entered text rather than a validated calendar or clock. The scenario's names, stock, requests, and timestamps are sample data.

## Run locally

Open `index.html` in a modern browser. The app and its bundled icons work offline. For local HTTP, run this from the repository folder and visit `http://localhost:8000`:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

## Verification performed

Run the dependency-free state-path harness with `node tests/state-path.test.js`. It exercises initial loading, request-specific equipment selection, inventory search and filtering, issue of the three Film Society units to Kabir, duplicate and repair-unit rejection, invalid return input, Friday returns of PR-04 and SP-02 while AD-12 remains open, saved promise and instruction, state restoration after reloading the app, wrong-ID rejection, Saturday AD-12 check-in, duplicate-return prevention, sample reset, and malformed local-storage recovery. All listed assertions passed. `node --check app.js`, `node --check tests/state-path.test.js`, and `git diff --check` also passed.

The application was not visually exercised in a browser at desktop or mobile sizes in this run, so responsive presentation still needs a browser review.

## Source and licenses

- `index.html` contains the desk shell, bundled icons, and Candidate brief.
- `app.js` contains the fictional records, state handling, and interactions.
- `styles.css` defines the interface and responsive layouts.
- `tests/state-path.test.js` exercises the principal loan and handover state transitions without external packages.
- Third-party icon license notices are in [third-party/lucide-LICENSE.txt](third-party/lucide-LICENSE.txt).


