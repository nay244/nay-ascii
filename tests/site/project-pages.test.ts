import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { blocksOf, hasMockups, hrefs, mockData, page, visibleText } from "./helpers.ts";

const SLUGS = ["azure", "servicenow", "hyperv", "roluna"];

test("write-ups match the mockup, block by block", { skip: !hasMockups }, () => {
  const { PROJECTS } = mockData("projects-data.js", ["PROJECTS"]);
  for (const p of PROJECTS) {
    const text = visibleText(page(`/projects/${p.id}`));
    for (const block of blocksOf(p.body)) assert.ok(text.includes(block), `${p.id}: ${block}`);
    assert.ok(text.includes(visibleText(p.lede)));
  }
});

test("each banner runs its picked scene", () => {
  const picks = { azure: "project-azure-virtualfw", servicenow: "project-servicenow-dashboard", hyperv: "project-hyperv-move", roluna: "project-roluna-deck" };
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
  for (const s of SLUGS) {
    const html = page(`/projects/${s}`), boxes = [...html.matchAll(/<div[^>]*data-piece=[^>]*>/g)];
    assert.ok(boxes.length >= 2, s);
    for (const [box] of boxes) assert.match(box, /aria-hidden="true"/, s);
    assert.match(html, /font-size:calc\(100cqw/, s);
  }
});

test("Hyper-V keeps what happened apart from the typical plan, and says which is which", () => {
  const text = visibleText(page("/projects/hyperv"));
  for (const q of ["How many VMs", "What was tested", "How did the cutover", "Also missing", "résumé"]) assert.ok(!text.includes(q), q);
  assert.ok(text.includes("Test") && text.includes("phase 2"));
  assert.doesNotMatch(page("/projects/hyperv"), /class="todo"/);
  const [record, plan] = text.split("A typical plan for 200+ production servers");
  assert.ok(plan, "no plan heading");
  assert.ok(record.includes("Zero production downtime"));
  assert.ok(plan.includes("It isn’t a record of this project"));
  for (const heading of ["Plan: know what’s moving", "Test: prove it before production", "Execute: the same runbook every time", "Rollback", "Who does what"]) assert.ok(plan.includes(heading), heading);
});

test("the Hyper-V waves add up to over 200 production servers", () => {
  const sizes = [...visibleText(page("/projects/hyperv")).matchAll(/~(\d+) production/g)].map((m) => Number(m[1]));
  assert.equal(sizes.length, 4);
  assert.ok(sizes.reduce((a, b) => a + b, 0) > 200);
});

test("the pager wraps", () => {
  assert.ok(hrefs(page("/projects/azure")).includes("/projects/servicenow/"));
  assert.ok(hrefs(page("/projects/roluna")).includes("/projects/azure/"));
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
