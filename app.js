(() => {
  "use strict";

  const storageKey = "campus-stores.shift.v2";
  const root = document.getElementById("campus-stores");
  const q = (selector) => root.querySelector(selector);
  const requests = [
    {
      id: "RQ-214",
      club: "Film Society",
      event: "Courtyard screening",
      owner: "Isha Rao",
      due: "Fri 8 pm",
      items: ["HDMI projector", "Portable speaker", "USB-C → HDMI adapter"],
      note: "Playback is from a USB-C-only laptop. The host will collect at 4 pm.",
    },
    {
      id: "RQ-209",
      club: "Debate Union",
      event: "Finals rehearsal",
      owner: "Tara Shah",
      due: "Sat 10 am",
      items: ["Wireless microphone"],
      note: "Rehearsal runs into the evening.",
    },
    {
      id: "RQ-217",
      club: "Photo Circle",
      event: "Street portrait walk",
      owner: "Dev Menon",
      due: "Sat noon",
      items: ["Digital camera"],
      note: "Collection on Saturday morning.",
    },
  ];
  const assets = [
    { id: "PR-04", type: "HDMI projector", model: "BenQ MH550", bin: "A2" },
    {
      id: "PR-06",
      type: "HDMI projector",
      model: "Epson EB-X49",
      bin: "Workshop",
      repair: true,
    },
    { id: "SP-02", type: "Portable speaker", model: "JBL Eon One", bin: "B1" },
    { id: "SP-05", type: "Portable speaker", model: "Bose S1", bin: "B2" },
    {
      id: "AD-12",
      type: "USB-C → HDMI adapter",
      model: "Belkin AVC002",
      bin: "C4",
    },
    {
      id: "AD-15",
      type: "USB-C → HDMI adapter",
      model: "Anker A8312",
      bin: "C4",
    },
    { id: "MI-09", type: "Wireless microphone", model: "Shure BLX", bin: "B3" },
    { id: "CA-03", type: "Digital camera", model: "Sony A6400", bin: "D2" },
  ];
  const people = [
    "Isha Rao",
    "Kabir Sen",
    "Leela Das",
    "Tara Shah",
    "Dev Menon",
  ];
  const shifts = [
    {
      time: "Friday · 3:45 pm",
      title: "Pickup at the counter",
      text: "Kabir is here for the Film Society screening. The film starts at four. Can he leave with everything he needs?",
      next: "Move to return time",
    },
    {
      time: "Friday · 7:30 pm",
      title: "The kit comes back in pieces",
      text: "Kabir has brought back the projector and speaker. “Leela still has the adapter. She’ll drop it off tomorrow at nine.” Record the partial return and hand over the open item.",
      next: "Move to next morning",
    },
    {
      time: "Saturday · 9:00 am",
      title: "Morning shift",
      text: "Leela is here with an adapter. Check the handover, match the physical unit ID, and complete its return.",
    },
  ];
  const pages = [
    ["Overview", "package-open"],
    ["Requests", "clipboard-list"],
    ["Inventory", "package"],
    ["Loan register", "book-open"],
    ["Handover", "messages-square"],
    ["Desk book", "messages-square"],
  ];
  const original = () => ({
    version: 2,
    tab: "Overview",
    issueReq: "RQ-214",
    phase: 0,
    selected: "",
    filter: "All items",
    search: "",
    loans: [
      {
        num: 401,
        req: "RQ-209",
        asset: "MI-09",
        who: "Tara Shah",
        due: "Sat 10 am",
        issuedAt: "Friday · 3:30 pm",
        returnedAt: "",
        promise: "",
        handover: "",
        history: [],
      },
    ],
    notes: [],
    editing: false,
    onlyOpen: true,
    notice: "Sample shift · All records are fictional.",
  });
  let s = original();
  const getAsset = (id) => assets.find((x) => x.id === id);
  const getReq = (id) => requests.find((x) => x.id === id);
  const getLoan = (num) => s.loans.find((l) => l.num === Number(num));
  const out = (id) => s.loans.find((l) => l.asset === id && !l.returnedAt);
  const escaped = (x) =>
    String(x ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
    );
  const opts = (list) => list.map(([v, t]) => `<option value="${escaped(v)}">${escaped(t)}</option>`).join("");
  const btn = (label, act, val = "", style = "") =>
    `<button type="button" data-action="${escaped(act)}" data-val="${escaped(val)}" class="${escaped(style)}">${escaped(label)}</button>`;
  const head = (title, sub, control = "") =>
    `<div class="sectionhead"><div><h2>${escaped(title)}</h2><small>${escaped(sub)}</small></div>${control}</div>`;
  const row = (label, sub, right) =>
    `<div class="row"><div><strong>${escaped(label)}</strong><small>${escaped(sub)}</small></div><div>${right}</div></div>`;
  const badge = (t, kind = "") => `<span class="tag ${kind}">${escaped(t)}</span>`;
  const loanRequest = (loan) => getReq(loan.req);
  const outstanding = () => s.loans.filter((l) => !l.returnedAt);
  const fmtWhen = () => shifts[s.phase].time;

  function overview() {
    const available = assets.filter((a) => !a.repair && !out(a.id)).length;
    const issued = outstanding().length;
    const pending = requests.filter((r) => !s.loans.some((l) => l.req === r.id)).length;
    const filmOpen = outstanding().filter((l) => l.req === "RQ-214");
    let html = head("Desk overview", "Equipment position and work that needs attention");
    html += `<div class="metrics"><div class="metric"><span>Available units</span><strong>${available}</strong><small>Ready to issue</small></div><div class="metric"><span>On loan</span><strong>${issued}</strong><small>${new Set(outstanding().map((l) => l.req)).size} active ${new Set(outstanding().map((l) => l.req)).size === 1 ? "loan" : "loans"}</small></div><div class="metric"><span>In repair</span><strong>${assets.filter((a) => a.repair).length}</strong><small>Unavailable</small></div><div class="metric"><span>Unissued requests</span><strong>${pending}</strong><small>Approved forms</small></div></div>`;
    html += `<section class="panel"><div class="sectionhead"><div><h3>Needs attention</h3><small>Outstanding equipment stays visible across shifts</small></div>${btn("Open handover", "tab", "Handover")}</div>`;
    if (!filmOpen.length) html += `<p class="empty">No equipment is outstanding for the Film Society screening.</p>`;
    for (const l of filmOpen) {
      const a = getAsset(l.asset);
      html += row(`${a.id} · ${a.type}`, `${l.who} · ${loanRequest(l).club} · promised ${l.promise || "no time recorded"}`, badge("Outstanding", "warn"));
    }
    html += `</section><section class="panel"><div class="sectionhead"><div><h3>Shift activity</h3><small>${escaped(fmtWhen())}</small></div>${btn("View loan register", "tab", "Loan register")}</div>`;
    html += row("Requests awaiting issue", `${pending} approved ${pending === 1 ? "request" : "requests"} without a loan`, badge(String(pending), pending ? "warn" : "good"));
    html += row("Loan items returned", `${s.loans.filter((l) => l.returnedAt).length} physical units recorded back`, badge(String(s.loans.filter((l) => l.returnedAt).length), "good"));
    return html + `</section>`;
  }

  function requestPage() {
    let html = head("Approved requests", "Student Activities Office · 3 approved forms");
    if (s.selected) {
      const r = getReq(s.selected);
      if (!r) { s.selected = ""; return requestPage(); }
      return html + btn("Back to list", "close") + `<article class="record"><small>${r.id} · Approved</small><h3>${escaped(r.event)}</h3><p>${escaped(r.club)} · Filed by ${escaped(r.owner)}</p><p><b>Return by</b> ${escaped(r.due)}</p><p><b>Approved equipment</b></p><ul>${r.items.map((x) => `<li>${escaped(x)}</li>`).join("")}</ul><p>${escaped(r.note)}</p></article>`;
    }
    return html + requests.map((r) => row(r.event, `${r.id} · ${r.club} · ${r.due}`, btn(s.loans.some((l) => l.req === r.id) ? "View form" : "View form", "request", r.id))).join("");
  }

  function inventory() {
    let html = head("Inventory", "Physical units · search by type, unit ID, model or shelf");
    html += `<div class="toolbar"><label class="search-label">Search inventory<input type="search" data-search placeholder="e.g. AD-12 or adapter" value="${escaped(s.search)}"></label><label>Show <select data-filter>${opts(["All items", "On shelf", "On loan", "In repair"].map((f) => [f, f]))}</select></label></div>`;
    return html + `<div data-inventory-results>${inventoryResults()}</div>`;
  }

  function inventoryResults() {
    let html = "";
    const matching = assets.filter((a) => {
      const status = a.repair ? "In repair" : out(a.id) ? "On loan" : "On shelf";
      return (s.filter === "All items" || s.filter === status) && `${a.id} ${a.type} ${a.model} ${a.bin}`.toLowerCase().includes(s.search.toLowerCase());
    });
    if (!matching.length) html += `<p class="empty">No units match this search. Try a different ID, item type or filter.</p>`;
    for (const a of matching) {
      const loan = out(a.id);
      const status = a.repair ? "In repair" : loan ? "On loan" : "On shelf";
      html += row(`${a.id} · ${a.type}`, `${a.model} · ${a.repair ? "Workshop repair" : loan ? `${loan.who} · ${loan.req}` : `Shelf ${a.bin}`}`, badge(status, status === "On shelf" ? "good" : status === "On loan" ? "warn" : ""));
    }
    return html;
  }

  function register() {
    let html = head("Loan register", "One issue slip per physical unit · returns are recorded independently", s.editing ? btn("Cancel", "cancel") : btn("New issue slip", "new", "", "primary"));
    if (s.editing) {
      const req = getReq(s.issueReq) || requests[0];
      const availableByType = (type) => assets.filter((a) => a.type === type && !a.repair && !out(a.id));
      const requestOptions = requests
        .map((r) => `<option value="${r.id}" ${r.id === req.id ? "selected" : ""}>${r.id} · ${escaped(r.club)}</option>`)
        .join("");
      html += `<form data-issue class="panel"><p class="form-intro">Issue equipment against an approved request. The selected units must be available now.</p><div class="form"><label><span>Approved request</span><select name="req" data-issue-request required>${requestOptions}</select></label><label><span>Collected by</span><select name="who" required><option value="">Select a borrower…</option>${opts(people.map((p) => [p, p]))}</select></label><label><span>Return by</span><select name="due" required>${opts(["Fri 8 pm", "Sat 9 am", "Sat 10 am", "Sat noon"].map((d) => [d, d]))}</select></label><div class="full selection-group"><span>Units to issue <small>Choose at most one unit for each approved equipment type.</small></span>${req.items.map((type) => `<label class="unit-choice"><span>${escaped(type)}</span><select name="asset" data-type="${escaped(type)}"><option value="">Do not issue</option>${opts(availableByType(type).map((a) => [a.id, `${a.id} · ${a.model} · shelf ${a.bin}`]))}</select></label>`).join("")}</div></div><button type="submit" class="primary">Save issue slip</button></form>`;
      return html;
    }
    html += `<div class="buttons">${["Outstanding", "All slips"].map((v, i) => `<button type="button" data-action="scope" data-val="${i}" aria-pressed="${s.onlyOpen === (i === 0)}">${v}</button>`).join("")}</div>`;
    const shown = s.loans.filter((l) => !s.onlyOpen || !l.returnedAt).slice().reverse();
    if (!shown.length) html += `<p class="empty">No ${s.onlyOpen ? "outstanding items" : "loan records"} yet.</p>`;
    for (const l of shown) {
      const r = loanRequest(l), a = getAsset(l.asset);
      html += row(`L-${l.num} · ${a.id} · ${a.type}`, `${r.club} · ${l.who} · ${l.returnedAt ? `Returned ${l.returnedAt}` : `Due ${l.due}`}`, l.returnedAt ? badge("Returned", "good") : btn("Record return", "return", String(l.num)));
      if (!l.returnedAt && (l.promise || l.handover)) html += `<div class="loan-detail">${l.promise ? `<span>Promised return: <b>${escaped(l.promise)}</b></span>` : ""}${l.handover ? `<span>Next shift: ${escaped(l.handover)}</span>` : ""}</div>`;
    }
    return html;
  }

  function returnPage(loan) {
    const a = getAsset(loan.asset), req = loanRequest(loan);
    return head("Record item return", `L-${loan.num} · ${req.club} · ${loan.who}`) + `<div class="record"><h3>${a.id} · ${escaped(a.type)}</h3><p>${escaped(a.model)} · shelf ${escaped(a.bin)}</p><p>Issued to ${escaped(loan.who)} for ${escaped(req.club)}. Due ${escaped(loan.due)}.</p></div><form data-return="${loan.num}" class="panel"><label><span>Received from</span><select name="receivedBy" required><option value="">Select a person…</option>${opts(people.map((p) => [p, p]))}</select></label><label><span>Return time</span><input name="returnedAt" value="${escaped(fmtWhen())}" maxlength="40" required></label><button type="submit" class="primary">Confirm this unit returned</button></form><p class="form-intro">Only this unit will be marked returned. Other items on the same pickup remain open.</p>`;
  }

  function handover() {
    let html = head("Shift handover", "Persistent open items · return to this register after each shift", "");
    const open = outstanding();
    if (!open.length) html += `<div class="empty success-state"><h3>All items are back</h3><p>There are no outstanding physical units to hand over.</p></div>`;
    for (const l of open) {
      const a = getAsset(l.asset), r = loanRequest(l);
      const action = s.phase >= 2 && l.req === "RQ-214" ? btn("Match and return unit", "receive", String(l.num), "primary") : btn("Record partial return", "return", String(l.num));
      html += `<article class="handover-card"><div class="handover-title"><div><small>L-${l.num} · ${escaped(r.club)} · ${escaped(r.event)}</small><h3>${escaped(a.id)} · ${escaped(a.type)}</h3></div>${badge("Outstanding", "warn")}</div><div class="handover-grid"><div><small>Borrower</small><strong>${escaped(l.who)}</strong></div><div><small>Due</small><strong>${escaped(l.due)}</strong></div><div><small>Promised return</small><strong>${escaped(l.promise || "Not recorded")}</strong></div><div><small>Unit location</small><strong>${escaped(a.model)} · ${escaped(a.bin)}</strong></div></div>${l.handover ? `<p class="handover-note"><b>Next shift instruction</b> ${escaped(l.handover)}</p>` : ""}${s.phase === 1 && l.req === "RQ-214" && !l.promise ? `<form data-handover="${l.num}" class="handover-form"><label><span>Promised return time</span><input name="promise" value="Saturday 9:00 am" required maxlength="60"></label><label class="full"><span>Next shift instruction</span><textarea name="handover" rows="2" maxlength="300" required>Leela Das will return the adapter. Match the unit ID to this open loan before recording it.</textarea></label><button type="submit" class="primary">Save handover details</button></form>` : action}</article>`;
    }
    html += `<section class="panel"><div class="sectionhead"><div><h3>Shift notes</h3><small>Notes are stored with the current sample shift</small></div></div>`;
    if (!s.notes.length) html += `<p class="empty">No additional notes yet.</p>`;
    for (const n of s.notes.slice().reverse()) html += `<article class="note-entry"><small>${escaped(shifts[n.phase].time)}</small><p>${escaped(n.text)}</p></article>`;
    html += `<form data-note><label class="full"><span>Note for the next shift</span><textarea name="note" rows="2" maxlength="400" required placeholder="Add a concise instruction for the incoming staff member"></textarea></label><button type="submit">Add handover note</button></form></section>`;
    return html;
  }

  function receivePage(loan) {
    const a = getAsset(loan.asset), req = loanRequest(loan);
    return head("Verify unit at return", `${req.club} · promised ${loan.promise || "Saturday 9:00 am"}`) + `<article class="handover-card"><div class="handover-title"><div><small>L-${loan.num} · ${escaped(loan.who)} · returns for Leela Das</small><h3>Match the physical unit before closing</h3></div>${badge("Still on loan", "warn")}</div><p>Handover says ${escaped(a.type)} · ${escaped(a.model)} · shelf ${escaped(a.bin)}.</p><form data-receive="${loan.num}"><label><span>Physical unit ID on the returned equipment</span><select name="asset" required><option value="">Select the ID from the unit…</option>${opts(assets.filter((x) => x.type === a.type).map((x) => [x.id, `${x.id} · ${x.model}`]))}</select></label><label><span>Received from</span><select name="receivedBy" required><option value="">Select…</option>${opts([["Leela Das", "Leela Das"]])}</select></label><button type="submit" class="primary">Verify and complete return</button></form></article>`;
  }

  function deskbook() {
    const entries = [
      ["Friday · 3:20 pm", "Isha Rao · Film Society", "Kabir Sen is picking up our whole screening kit. Please issue it in his name. I’m setting up in the courtyard."],
      ["Friday · 3:30 pm", "Tara Shah · Debate Union", "Our microphone stays with me overnight. I’ll return it by 10 am Saturday."],
    ];
    if (s.phase >= 1) entries.push(["Friday · 7:30 pm", "Kabir Sen · Film Society", "I brought the projector and speaker. Leela Das has our adapter. She’ll be at the counter at 9 am tomorrow."]);
    let html = head("Desk book", "Original club messages and staff notes for the next shift");
    for (const n of s.notes) entries.push([shifts[n.phase].time, "Counter handover", n.text]);
    for (const [time, author, text] of entries.slice().reverse()) html += `<article class="record"><small>${escaped(time)}</small><h3>${escaped(author)}</h3><p>${escaped(text)}</p></article>`;
    return html + `<form data-note><div class="form"><label class="full"><span>Note for the next shift</span><textarea name="note" rows="2" maxlength="400" required></textarea></label></div><button type="submit">Add handover note</button></form>`;
  }

  const screens = { Overview: overview, Requests: requestPage, Inventory: inventory, "Loan register": register, Handover: handover, "Desk book": deskbook };
  function paint() {
    const phase = shifts[s.phase];
    q("[data-clock]").textContent = phase.time;
    q("[data-shift-title]").textContent = phase.title;
    q("[data-shift]").textContent = phase.text;
    const advance = q('[data-action="advance"]');
    advance.hidden = !phase.next; advance.textContent = phase.next || "";
    q("[data-nav]").innerHTML = pages.map(([n, icon]) => `<button type="button" data-action="tab" data-val="${escaped(n)}" aria-pressed="${s.tab === n}"><svg aria-hidden="true" class="store-icon"><use href="#icon-${icon}"></use></svg>${escaped(n)}${n === "Handover" && outstanding().length ? `<span class="nav-count">${outstanding().length}</span>` : ""}</button>`).join("");
    let view = screens[s.tab]();
    if (s.returning) { const loan = getLoan(s.returning); view = loan && !loan.returnedAt ? returnPage(loan) : view; }
    if (s.receiving) { const loan = getLoan(s.receiving); view = loan && !loan.returnedAt ? receivePage(loan) : view; }
    q("[data-page]").innerHTML = view;
    if (q("[data-filter]")) q("[data-filter]").value = s.filter;
    q("[data-status]").textContent = s.notice;
  }
  function commit(msg) {
    if (msg) s.notice = msg;
    paint();
    try { localStorage.setItem(storageKey, JSON.stringify(s)); }
    catch { q("[data-status]").textContent = `${s.notice} Browser storage is unavailable; progress lasts for this visit.`; }
  }
  const flash = (message) => { q("[data-status]").textContent = message; };

  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-action]"); if (!b) return;
    const v = b.dataset.val;
    switch (b.dataset.action) {
      case "restart": s = original(); break;
      case "advance": if (s.phase < 2) s.phase++; s.returning = ""; s.receiving = ""; s.notice = "Shift time updated."; break;
      case "tab": s.tab = v; s.editing = false; s.selected = ""; s.returning = ""; s.receiving = ""; break;
      case "close": s.selected = ""; break;
      case "request": s.selected = v; break;
      case "new": s.editing = true; break;
      case "cancel": s.editing = false; break;
      case "scope": s.onlyOpen = v === "0"; break;
      case "return": if (!getLoan(v) || getLoan(v).returnedAt) return flash("This item is already returned or its loan could not be found."); s.returning = Number(v); s.receiving = ""; break;
      case "receive": if (!getLoan(v) || getLoan(v).returnedAt) return flash("This item is already returned or its loan could not be found."); s.receiving = Number(v); s.returning = ""; break;
    }
    commit();
  });
  root.addEventListener("change", (e) => {
    if (e.target.matches("[data-issue-request]")) {
      s.issueReq = e.target.value;
      commit("Approved equipment list updated for the selected request.");
    }
    if (e.target.matches("[data-filter]")) { s.filter = e.target.value; commit(); }
    if (e.target.matches("[data-search]")) { s.search = e.target.value.trim(); commit(); }
  });
  root.addEventListener("input", (e) => {
    if (e.target.matches("[data-search]")) {
      s.search = e.target.value;
      q("[data-inventory-results]").innerHTML = inventoryResults();
      try {
        localStorage.setItem(storageKey, JSON.stringify(s));
      } catch {
        flash("Search works for this visit; browser storage is unavailable.");
      }
    }
  });
  root.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target, form = new FormData(f);
    if (f.matches("[data-handover]")) {
      const loan = getLoan(f.dataset.handover), promise = String(form.get("promise") || "").trim(), note = String(form.get("handover") || "").trim();
      if (!loan || loan.returnedAt || !promise || !note) return flash("Add a promised return time and next shift instruction for an open item.");
      loan.promise = promise; loan.handover = note; loan.history.push({ action: "Handover recorded", at: fmtWhen() }); s.tab = "Handover"; commit(`Handover saved for ${loan.asset}; it remains outstanding.`); return;
    }
    if (f.matches("[data-return]")) {
      const loan = getLoan(f.dataset.return), receivedBy = String(form.get("receivedBy") || ""), returnedAt = String(form.get("returnedAt") || "").trim();
      if (!loan || loan.returnedAt) return flash("This item is already returned. No inventory change was made.");
      if (!people.includes(receivedBy) || !returnedAt) return flash("Choose a staff or borrower name and enter the return time.");
      loan.returnedAt = returnedAt; loan.history.push({ action: "Returned", at: returnedAt, by: receivedBy }); s.returning = "";
      const remaining = s.loans.some((l) => l.num !== loan.num && l.req === loan.req && !l.returnedAt);
      commit(remaining ? `${loan.asset} returned. Other items on this pickup remain outstanding.` : `${loan.asset} returned to stock. Loan item L-${loan.num} closed.`); return;
    }
    if (f.matches("[data-receive]")) {
      const loan = getLoan(f.dataset.receive), assetId = String(form.get("asset") || ""), by = String(form.get("receivedBy") || "");
      if (!loan || loan.returnedAt) return flash("This item is already returned. No inventory change was made.");
      if (assetId !== loan.asset) return flash("Unit ID does not match the outstanding loan. Check the handover record and try again.");
      if (by !== "Leela Das" && by !== loan.who) return flash("Select the person who handed over this unit.");
      loan.returnedAt = fmtWhen(); loan.history.push({ action: "Verified and returned", at: fmtWhen(), by }); s.receiving = "";
      commit(`${assetId} matched the handover and returned to stock. Loan item L-${loan.num} closed.`); return;
    }
    if (f.matches("[data-note]")) {
      const text = String(form.get("note") || "").trim(); if (!text) return flash("Enter a note before saving it.");
      s.notes.push({ phase: s.phase, text }); commit("Handover note saved."); return;
    }
    if (!f.matches("[data-issue]")) return;
    const reqId = String(form.get("req") || ""), who = String(form.get("who") || ""), due = String(form.get("due") || ""), req = getReq(reqId);
    const chosen = form.getAll("asset").map(String).filter(Boolean);
    const units = chosen.map(getAsset);
    if (!req || !people.includes(who) || !due || !chosen.length) return flash("Choose an approved request, borrower, return time and at least one unit.");
    if (units.some((a) => !a || a.repair || out(a.id) || !req.items.includes(a.type)) || new Set(chosen).size !== chosen.length) return flash("One or more selected units are unavailable, duplicated or outside this approved request. Review the issue slip.");
    if (units.some((a) => s.loans.some((l) => l.req === reqId && !l.returnedAt && getAsset(l.asset).type === a.type))) return flash("An item of that approved type is already outstanding for this request.");
    const firstNum = Math.max(401, ...s.loans.map((l) => l.num)) + 1;
    for (let i = 0; i < units.length; i++) s.loans.push({ num: firstNum + i, req: reqId, asset: units[i].id, who, due, issuedAt: fmtWhen(), returnedAt: "", promise: "", handover: "", history: [] });
    s.editing = false; s.tab = "Loan register"; s.onlyOpen = true;
    commit(`Issued ${units.length} ${units.length === 1 ? "unit" : "units"} to ${who} on ${reqId}. Each unit has its own return record.`);
  });

  function validState(d) {
    return d && d.version === 2 && Object.hasOwn(screens, d.tab) && Number.isInteger(d.phase) && d.phase >= 0 && d.phase < shifts.length && getReq(d.issueReq) && (d.selected === "" || !!getReq(d.selected)) && Array.isArray(d.notes) && d.notes.every((n) => n && Number.isInteger(n.phase) && shifts[n.phase] && typeof n.text === "string") && Array.isArray(d.loans) && d.loans.length > 0 && d.loans.every((l) => l && Number.isInteger(l.num) && getReq(l.req) && getAsset(l.asset) && people.includes(l.who) && typeof l.due === "string" && typeof l.returnedAt === "string" && typeof l.promise === "string" && typeof l.handover === "string" && Array.isArray(l.history)) && new Set(d.loans.map((l) => l.num)).size === d.loans.length && new Set(d.loans.filter((l) => !l.returnedAt).map((l) => l.asset)).size === d.loans.filter((l) => !l.returnedAt).length && ["All items", "On shelf", "On loan", "In repair"].includes(d.filter) && typeof d.search === "string";
  }
  paint();
  try { const raw = localStorage.getItem(storageKey); if (raw) { const parsed = JSON.parse(raw); if (validState(parsed)) { s = { ...original(), ...parsed, notes: parsed.notes.map((n) => ({ ...n })), loans: parsed.loans.map((l) => ({ ...l, history: l.history.map((h) => ({ ...h })) })) }; paint(); } else { s.notice = "Saved shift data was invalid; a fresh sample shift is ready."; paint(); } } }
  catch { s.notice = "Saved shift data could not be read; a fresh sample shift is ready."; paint(); }
})();
