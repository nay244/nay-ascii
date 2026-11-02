# Nay Naing's portfolio

A static Next.js site with a home page, projects, a career timeline, and a blog of write-ups and notes.

It needs Node 26 or later. Run `npm run dev` to work on it, and `npm run verify` to build it and run every check.
`npm run verify` also needs a local, gitignored `.private-terms.txt` unless `CI` is set.

It's served from [nay244.github.io/nay-ascii](https://nay244.github.io/nay-ascii/). Set `NEXT_PUBLIC_BASE_PATH=/nay-ascii` to build for that path, as the manual deploy workflow does.

The art is drawn with [ascii-magic-art](src/lib/art/vendor/ascii-magic/LICENSE) (MIT).

The Japanese notes were written by Morg, from [Morg Systems](https://morg.systems/Japanese).
