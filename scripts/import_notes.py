# One-time import of the study notes from nay-quartz into src/content/notes/<series>/<slug>.md.
#
#   python3 -I scripts/import_notes.py <folder with language-learning.md, wgu.md, azure.md and knowledge-base.md>
#
# nay-quartz keeps each series as one long page. This splits it into one Markdown file per note, resolves its
# [[wikilinks]] to the site's own URLs and leaves the rest as Markdown for src/lib/notes.ts to render. After this
# runs the files in this repo are the source of truth, so it won't run again over notes that already exist.
# The rules come from .superpowers/brainstorm/build_notes.py, which built the mockup's notes.
import json, re, sys
from pathlib import Path

FILES = {"japanese": "language-learning", "wgu": "wgu", "az900": "azure", "data": "knowledge-base"}
# The tags a note may use. A "<" that starts any other tag, such as a literal <verb>, is escaped so it stays text.
ALLOWED = r"(?:ruby|rt|rp|b|i|u|em|strong|br|a|details|summary|center|sub|sup|span|kbd)"
ALIAS = {"58465ab9": "Japanese Learning Loop", "9f88358f": "Japanese Learning Resources"}
# Two slugs hold Japanese characters; these keep every URL plain ASCII.
SLUG_FIX = {"gikun-義訓": "gikun", "japanese-sentence-structure-だ-explained": "japanese-sentence-structure-da-explained"}
OUT = Path(__file__).resolve().parent.parent / "src" / "content" / "notes"


def slugify(s):
    s = re.sub(r"<[^>]+>", "", s).lower().replace("'", "").replace("’", "")
    s = re.sub(r"[^\w\s-]", "", s, flags=re.U)
    return re.sub(r"\s", "-", s.strip())


key = lambda s: re.sub(r"-+", "-", s.lower())


def url_slug(title):
    slug = re.sub(r"-+", "-", slugify(title))
    return SLUG_FIX.get(slug, slug)


HEADING = re.compile(r"^(#{1,6})\s+(.*?)\s*#*\s*$")
NAMED = re.compile(r'<a name="([^"]+)">(.*?)</a>')


def heading_id(raw):
    # The id src/lib/notes.ts gives this heading: the name of an anchor inside it, otherwise the slug of its text.
    named = NAMED.search(raw)
    return named.group(1) if named else slugify(raw)


def split_notes(folder):
    notes = {}
    for sid, name in FILES.items():
        text = (folder / f"{name}.md").read_text(encoding="utf-8")
        notes[sid] = []
        for part in re.split(r'<div class="article-header">', text)[1:]:
            title = re.search(r"<h1>(.*?)</h1>", part, re.S).group(1).strip()
            body = part.split("</div>", 1)[1]
            body = re.sub(r"^\s*#\s+.*\n", "", body, count=1)                 # the repeated title
            body = re.sub(r"(\n\s*(---|<hr\s*/?>)\s*)+\s*$", "\n", body)        # the separator before the next note
            notes[sid].append({"title": title, "slug": url_slug(title), "lookup": key(slugify(title)), "body": body})
    return notes


def build_index(notes):
    # Every note and heading, by the name a wikilink could use for it.
    index = {}
    for sid, ns in notes.items():
        for i, n in enumerate(ns):
            index.setdefault((sid, n["lookup"]), (sid, i, None))
    for sid, ns in notes.items():
        for i, n in enumerate(ns):
            for line in n["body"].split("\n"):
                m = HEADING.match(line)
                if m:
                    hid = heading_id(m.group(2))
                    index.setdefault((sid, key(slugify(m.group(2)))), (sid, i, hid))
    return index


class Links:
    def __init__(self, notes):
        self.notes, self.index = notes, build_index(notes)
        self.by_title = {n["lookup"]: (sid, i) for sid, ns in notes.items() for i, n in enumerate(ns)}
        self.resolved, self.unresolved = 0, []

    def href(self, sid, i, frag=None):
        return f"/blog/{sid}/{self.notes[sid][i]['slug']}/" + (f"#{frag}" if frag else "")

    def convert(self, match):
        target, alias = match.group(1).strip(), match.group(2)
        text = alias or target
        file, _, frag = target.partition("#")
        sid = next((k for k, v in FILES.items() if v == file), None)
        hit = None
        if sid and frag:
            hit = self.index.get((sid, key(frag))) or next(
                (v for k, v in self.index.items() if k[0] == sid and v[2] is None and k[1].startswith(key(frag))), None)
        if not hit:
            name = ALIAS.get(target) or alias or ""
            found = self.by_title.get(key(slugify(name)))
            hit = found and (found[0], found[1], None)
        if hit:
            self.resolved += 1
            return f"[{text}]({self.href(*hit)})"
        self.unresolved.append(target)
        return text


CODE = re.compile(r"`[^`\n]+`")
WIKILINK = re.compile(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]")
COMMENT = re.compile(r"<!--.*?-->", re.S)
# A "<" that opens or closes a tag which isn't one of ALLOWED. A line holding only <hr /> is a rule, so it stays.
OTHER_TAG = re.compile(rf"<(?!/?{ALLOWED}\b)(?=/?[A-Za-z])", re.I)
HR_LINE = re.compile(r"^\s*<hr\s*/?>\s*$")
LIST_LINE = re.compile(r"^\s*([*+-]|\d+[.)])\s+")
IMAGE_LINE = re.compile(r"^(?:!\[[^\]]*\]\([^)\s]+\)\s*)+$")
END_BR = re.compile(r"</br\s*>", re.I)


def pin_heading(line, stats):
    # Turning a heading's wikilink into a link would change its id, so it keeps the id nay-quartz gave it, by name.
    m = HEADING.match(line)
    if not m or not WIKILINK.search(m.group(2)) or NAMED.search(m.group(2)):
        return line
    stats["pinned"] += 1
    return f'{m.group(1)} <a name="{slugify(m.group(2))}">{m.group(2)}</a>'


def unglue_images(lines, stats):
    # An image on a line of its own, straight under a list item, would be read as part of that item. The mockup
    # showed it as a figure below the list, so a blank line goes between them.
    out = []
    for line in lines:
        prev = out[-1] if out else ""
        if IMAGE_LINE.match(line) and prev.strip() and (LIST_LINE.match(prev) or prev[0] in " \t"):
            out.append("")
            stats["unglued"] += 1
        out.append(line)
    return out


def convert_body(body, links, stats):
    body, dropped = COMMENT.subn("", body)
    stats["comments"] += dropped
    body, ends = END_BR.subn("<br>", body)                 # "</br>" is a typo for a line break
    stats["end_br"] += ends
    lines = [pin_heading(line, stats) for line in body.split("\n")]
    body = "\n".join(unglue_images(lines, stats))

    def prose(text):
        text = WIKILINK.sub(links.convert, text)
        out = []
        for line in text.split("\n"):
            escaped, n = (line, 0) if HR_LINE.match(line) else OTHER_TAG.subn("&lt;", line)
            stats["escaped"] += n
            out.append(escaped)
        return "\n".join(out)

    out, at = [], 0
    for m in CODE.finditer(body):                    # code spans stay exactly as written
        out.append(prose(body[at:m.start()]))
        out.append(m.group(0))
        at = m.end()
    out.append(prose(body[at:]))
    return "".join(out)


def drop_index(body):
    # Learning to Output opens with a hand-written index; the page's own contents list replaces it.
    return re.subn(r"^###\s+Index:\s*\n.*?(?=^#{1,6}\s|\Z)", "", body, count=1, flags=re.M | re.S)


def main(folder):
    if OUT.exists() and any(OUT.rglob("*.md")):
        sys.exit(f"{OUT} already holds notes. This import is one-time: the notes are edited in the repo now.")
    notes = split_notes(folder)
    links = Links(notes)
    stats = {"comments": 0, "escaped": 0, "index": 0, "pinned": 0, "unglued": 0, "end_br": 0}
    for sid, ns in notes.items():
        (OUT / sid).mkdir(parents=True, exist_ok=True)
        slugs = [n["slug"] for n in ns]
        assert len(set(slugs)) == len(slugs), f"{sid} has two notes with one slug"
        for n in ns:
            body, removed = drop_index(n["body"])
            stats["index"] += removed
            text = convert_body(body, links, stats).strip() + "\n"
            (OUT / sid / f"{n['slug']}.md").write_text(text, encoding="utf-8")

    print("notes", {sid: len(ns) for sid, ns in notes.items()})
    print("links resolved", links.resolved, "unresolved", len(links.unresolved), sorted(set(links.unresolved)))
    print("html comments dropped", stats["comments"], "| tags escaped", stats["escaped"], "| index sections removed", stats["index"], "| headings with a pinned id", stats["pinned"])
    print("images moved off a list item", stats["unglued"], "| </br> fixed", stats["end_br"])
    # The titles and slugs in order, for building src/content/blog.ts once.
    print("manifest", json.dumps({sid: [[n["title"], n["slug"]] for n in ns] for sid, ns in notes.items()}, ensure_ascii=False))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("usage: python3 -I scripts/import_notes.py <folder with the four nay-quartz pages>")
    main(Path(sys.argv[1]))
