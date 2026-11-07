import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { blocksOf, hasMockups, hrefs, mockData, page, visibleText } from "./helpers.ts";

const SLUGS = ["techconcepts", "azure", "servicenow", "hyperv", "roluna"];
// TechConcepts has a banner but no diagram.
const WITH_DIAGRAMS = SLUGS.filter((s) => s !== "techconcepts");

test("write-ups match the mockup, block by block", { skip: !hasMockups }, () => {
  const { PROJECTS } = mockData("projects-data.js", ["PROJECTS"]);
  for (const p of PROJECTS) {
    const text = visibleText(page(`/projects/${p.id}`));
    for (const block of blocksOf(p.body)) assert.ok(text.includes(block), `${p.id}: ${block}`);
    assert.ok(text.includes(visibleText(p.lede)));
  }
});

test("each banner runs its picked scene", () => {
  const picks = { techconcepts: "project-techconcepts-lesson", azure: "project-azure-virtualfw", servicenow: "project-servicenow-dashboard", hyperv: "project-hyperv-move", roluna: "project-roluna-deck" };
  for (const [s, piece] of Object.entries(picks)) assert.match(page(`/projects/${s}`), new RegExp(`data-piece="${piece}"`), s);
});

test("each page has its diagrams", () => {
  const want = {
    azure: ["project-azure", "project-azure-before", "project-azure-after"],
    servicenow: ["project-servicenow", "project-servicenow-stages"],
    hyperv: ["project-hyperv"],
    roluna: ["project-roluna"],
  };
  for (const [s, pieces] of Object.entries(want)) for (const piece of pieces) assert.match(page(`/projects/${s}`), new RegExp(`data-piece="${piece}"`), piece);
});

test("diagram labels are in the HTML, so they read without JavaScript", () => {
  const azure = visibleText(page("/projects/azure"));
  for (const l of ["Azure Migration", "inside zone", "vendor zone", "NETHUB VNET", "3 different next hops", "1 next hop for every spoke: the ILB"]) assert.ok(azure.includes(l), l);
  const sn = page("/projects/servicenow");
  assert.match(sn, /<li[^>]*data-stop="7"/);
  for (const l of ["ServiceNow ETL", "reads via data gateway"]) assert.ok(visibleText(sn).includes(l), l);
  assert.ok(visibleText(page("/projects/hyperv")).includes("zero downtime"));
  assert.ok(visibleText(page("/projects/roluna")).includes("on-demand fallback"));
});

test("diagrams size their text without JavaScript, and art stays hidden from screen readers", () => {
  for (const s of WITH_DIAGRAMS) {
    const html = page(`/projects/${s}`), boxes = [...html.matchAll(/<div[^>]*data-piece=[^>]*>/g)];
    assert.ok(boxes.length >= 2, s);
    for (const [box] of boxes) assert.match(box, /aria-hidden="true"/, s);
    assert.match(html, /font-size:calc\(100cqw/, s);
  }
});

test("the Hyper-V timeline matches the plan, and the plan says its numbers are approximate", () => {
  const text = visibleText(page("/projects/hyperv"));
  for (const q of ["How many VMs", "What was tested", "How did the cutover", "Also missing", "résumé", "typical", "isn’t a record"]) assert.ok(!text.includes(q), q);
  assert.doesNotMatch(page("/projects/hyperv"), /class="todo"/);
  const [timeline, plan] = text.split("The plan for 213 servers");
  assert.ok(plan, "no plan heading");
  for (const step of ["phase 1 · before anything moved", "phase 2 · wave 0, in the lab", "phase 3 · waves 1 to 5", "213 servers in all", "over 200 production servers", "Zero production downtime", "May 2026", "November 14"]) assert.ok(timeline.includes(step), step);
  for (const word of ["inventory", "lab", "waves"]) assert.ok(timeline.includes(word), word);
  assert.ok(plan.includes("roughly how the move was planned, tested and run live"));
  assert.ok(plan.includes("approximate"));
  for (const fact of ["The total of 213 is exact", "The deadline was November 14", "over 180%", "finished in May 2026"]) assert.ok(plan.includes(fact), fact);
  for (const heading of ["Plan: know what’s moving", "Test: prove it before production", "Execute: the same runbook every time", "Rollback", "Who does what"]) assert.ok(plan.includes(heading), heading);
});

test("the Hyper-V waves add up to 213 servers, over 200 of them production", () => {
  const text = visibleText(page("/projects/hyperv"));
  const sizes = [...text.matchAll(/~(\d+) production/g)].map((m) => Number(m[1]));
  assert.equal(sizes.length, 4);
  const production = sizes.reduce((a, b) => a + b, 0);
  assert.ok(production > 200);
  const other = text.match(/Development and test servers\s*~(\d+)/);
  assert.ok(other, "no non-production wave");
  assert.equal(production + Number(other[1]), 213);
});

test("the TechConcepts write-up links to the live site and says what is ready", () => {
  assert.ok(hrefs(page("/projects/techconcepts")).includes("https://techconcepts.naaay-naing.workers.dev"));
  const text = visibleText(page("/projects/techconcepts"));
  for (const lesson of ["How the Internet Works", "Subnetting", "DHCP", "Firewalls"]) assert.ok(text.includes(lesson), lesson);
});

test("the pager wraps", () => {
  assert.ok(hrefs(page("/projects/azure")).includes("/projects/servicenow/"));
  assert.ok(hrefs(page("/projects/roluna")).includes("/projects/techconcepts/"));
});

test("no Partners on project pages", () => {
  for (const s of SLUGS) assert.ok(!/partners/i.test(visibleText(page(`/projects/${s}`))), s);
});

test("Roluna's five screenshots and icon ship", () => {
  const imgs = hrefs(page("/projects/roluna")).filter((h) => h.startsWith("/static/roluna/"));
  assert.equal(new Set(imgs).size, 6);
  for (const i of imgs) assert.ok(existsSync(`out${i}`), i);
});

test("page metadata uses the project title", () => assert.match(page("/projects/azure"), /<title>Azure Firewall Migration · Nay Naing<\/title>/));

test("a project page marks only the projects link as the current page", () => {
  const html = page("/projects/azure");
  assert.equal([...html.matchAll(/aria-current/g)].length, 1);
  const [link] = [...html.matchAll(/<a\b[^>]*aria-current="page"[^>]*>/g)];
  assert.ok(link, "no link is marked");
  assert.match(link[0], /href="\/projects\/"/);
});
