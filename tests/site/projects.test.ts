import assert from "node:assert/strict";
import test from "node:test";
import { getProject, PROJECTS } from "../../src/content/projects/index.ts";
import { hasMockups, hrefs, mockData, page, visibleText } from "./helpers.ts";

test("the list has four cards in order, each with its picked scene", () => {
  const html = page("/projects");
  const links = hrefs(html).filter((h) => /^\/projects\/.+/.test(h));
  assert.deepEqual([...new Set(links)], ["/projects/azure/", "/projects/servicenow/", "/projects/hyperv/", "/projects/roluna/"]);
  for (const piece of ["project-azure-virtualfw", "project-servicenow-dashboard", "project-hyperv-move", "project-roluna-deck"]) assert.match(html, new RegExp(`data-piece="${piece}"`));
  assert.doesNotMatch(html, /data-art=/);
});

test("card copy matches the mockup", { skip: !hasMockups }, () => {
  const { PROJECTS } = mockData("projects-data.js", ["PROJECTS"]);
  const text = visibleText(page("/projects"));
  for (const p of PROJECTS) {
    assert.ok(text.includes(p.title));
    assert.ok(text.includes(p.sum));
  }
});

test("the project data is the mockup's, minus its note and write-up body", { skip: !hasMockups }, () => {
  const { PROJECTS: mock } = mockData("projects-data.js", ["PROJECTS"]);
  assert.deepEqual(
    PROJECTS,
    mock.map((p: any) => ({
      slug: p.id, piece: p.piece, title: p.title, kind: p.kind, sum: p.sum, lede: p.lede, stack: p.stack,
      facts: p.facts.map(([name, value]: string[]) => [name, value.replaceAll("<span>→</span>", "→")]),
    })),
  );
  assert.equal(getProject("hyperv")?.title, "VMware to Hyper-V Migration");
  assert.equal(getProject("nope"), undefined);
});

test("no mock layouts ship", () => assert.doesNotMatch(page("/projects"), /class="ledger"|class="features"|class="letter"/));
