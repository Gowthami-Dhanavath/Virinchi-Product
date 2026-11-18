const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
const storage = new Map();

class FormDataStub {
  constructor(form) {
    this.values = form.values;
  }

  get(name) {
    const value = this.values[name];
    return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
  }

  getAll(name) {
    const value = this.values[name];
    return Array.isArray(value) ? value : value == null ? [] : [value];
  }
}

function startApp() {
  const listeners = {};
  const elements = new Map();
  const element = (selector) => {
    if (!elements.has(selector)) {
      elements.set(selector, {
        textContent: "",
        innerHTML: "",
        value: "",
        hidden: false,
        focus() {},
        setSelectionRange() {},
      });
    }
    return elements.get(selector);
  };
  const root = {
    querySelector: element,
    addEventListener(type, handler) {
      listeners[type] = handler;
    },
  };

  vm.runInNewContext(source, {
    document: { getElementById: () => root },
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, String(value)),
    },
    FormData: FormDataStub,
  });

  return {
    elements,
    click(action, value = "") {
      listeners.click({
        target: { closest: () => ({ dataset: { action, val: value } }) },
      });
    },
    change(selector, value) {
      listeners.change({
        target: { matches: (candidate) => candidate === selector, value },
      });
    },
    input(selector, value) {
      listeners.input({
        target: { matches: (candidate) => candidate === selector, value },
      });
    },
    submit(selector, values, dataset = {}) {
      listeners.submit({
        preventDefault() {},
        target: {
          dataset,
          values,
          matches: (candidate) => candidate === selector,
        },
      });
    },
    state() {
      return JSON.parse(storage.get("campus-stores.shift.v2"));
    },
  };
}

let app = startApp();
assert.equal(app.elements.get("[data-shift-title]").textContent, "Pickup at the counter");
assert.match(app.elements.get("[data-page]").innerHTML, /Available units/);

app.click("tab", "Loan register");
app.click("new");
app.change("[data-issue-request]", "RQ-209");
assert.match(app.elements.get("[data-page]").innerHTML, /Wireless microphone/);
assert.doesNotMatch(app.elements.get("[data-page]").innerHTML, /HDMI projector/);
app.change("[data-issue-request]", "RQ-214");
app.submit("[data-issue]", {
  req: "RQ-214",
  who: "Kabir Sen",
  due: "Fri 8 pm",
  asset: ["PR-04", "SP-02", "AD-12"],
});
let state = app.state();
assert.equal(state.loans.filter((loan) => loan.req === "RQ-214").length, 3);
assert.deepEqual(
  state.loans.filter((loan) => loan.req === "RQ-214").map((loan) => loan.asset),
  ["PR-04", "SP-02", "AD-12"],
);
app.click("tab", "Inventory");
app.input("[data-search]", "AD-12");
assert.match(app.elements.get("[data-inventory-results]").innerHTML, /AD-12/);
assert.doesNotMatch(app.elements.get("[data-inventory-results]").innerHTML, /AD-15/);
app.change("[data-filter]", "On loan");
assert.equal(app.state().filter, "On loan");
app.input("[data-search]", "");

app.click("tab", "Loan register");
app.click("new");
app.submit("[data-issue]", {
  req: "RQ-214",
  who: "Leela Das",
  due: "Sat 9 am",
  asset: ["AD-12"],
});
assert.equal(app.state().loans.filter((loan) => loan.req === "RQ-214").length, 3);
assert.match(app.elements.get("[data-status]").textContent, /unavailable/);

app.click("new");
app.submit("[data-issue]", {
  req: "RQ-217",
  who: "Dev Menon",
  due: "Sat noon",
  asset: ["PR-06"],
});
assert.equal(app.state().loans.some((loan) => loan.asset === "PR-06"), false);

app.click("advance");
state = app.state();
assert.equal(state.phase, 1);
const filmLoans = state.loans.filter((loan) => loan.req === "RQ-214");
app.submit(
  "[data-return]",
  { receivedBy: "Kabir Sen", returnedAt: "  " },
  { return: String(filmLoans[0].num) },
);
assert.equal(app.state().loans.find((loan) => loan.asset === "PR-04").returnedAt, "");
for (const loan of filmLoans.slice(0, 2)) {
  app.submit(
    "[data-return]",
    { receivedBy: "Kabir Sen", returnedAt: "Friday · 7:30 pm" },
    { return: String(loan.num) },
  );
}
state = app.state();
assert.equal(
  state.loans.filter((loan) => loan.req === "RQ-214" && !loan.returnedAt).length,
  1,
);
assert.equal(state.loans.find((loan) => loan.asset === "PR-04").returnedAt, "Friday · 7:30 pm");
assert.equal(state.loans.find((loan) => loan.asset === "SP-02").returnedAt, "Friday · 7:30 pm");

const adapter = state.loans.find((loan) => loan.asset === "AD-12");
app.click("tab", "Handover");
app.submit(
  "[data-handover]",
  {
    promise: "Saturday 9:00 am",
    handover: "Leela Das will return the adapter. Match the unit ID before check-in.",
  },
  { handover: String(adapter.num) },
);
assert.equal(app.state().loans.find((loan) => loan.asset === "AD-12").returnedAt, "");

app = startApp();
state = app.state();
assert.equal(state.phase, 1);
assert.equal(state.loans.find((loan) => loan.asset === "AD-12").promise, "Saturday 9:00 am");
assert.match(state.loans.find((loan) => loan.asset === "AD-12").handover, /Leela Das/);

app.click("advance");
app.click("tab", "Handover");
app.click("receive", String(adapter.num));
app.submit(
  "[data-receive]",
  { asset: "AD-15", receivedBy: "Leela Das" },
  { receive: String(adapter.num) },
);
assert.equal(app.state().loans.find((loan) => loan.asset === "AD-12").returnedAt, "");
assert.match(app.elements.get("[data-status]").textContent, /does not match/);

app.submit(
  "[data-receive]",
  { asset: "AD-12", receivedBy: "Leela Das" },
  { receive: String(adapter.num) },
);
assert.notEqual(app.state().loans.find((loan) => loan.asset === "AD-12").returnedAt, "");
app.submit(
  "[data-receive]",
  { asset: "AD-12", receivedBy: "Leela Das" },
  { receive: String(adapter.num) },
);
assert.match(app.elements.get("[data-status]").textContent, /already returned/);
assert.equal(app.state().loans.filter((loan) => loan.req === "RQ-214" && !loan.returnedAt).length, 0);

app.click("restart");
assert.equal(app.state().phase, 0);
assert.equal(app.state().loans.length, 1);
assert.equal(app.state().loans[0].asset, "MI-09");

storage.set("campus-stores.shift.v2", "{broken json");
app = startApp();
assert.match(app.elements.get("[data-status]").textContent, /fresh sample shift/);
assert.equal(app.elements.get("[data-shift-title]").textContent, "Pickup at the counter");

console.log("PASS: pickup, duplicate and repair rejection, partial returns, handover persistence, unit verification, duplicate return prevention, reset, and malformed-storage recovery");
