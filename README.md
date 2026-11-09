# Mork project generator

Static project generator for https://generator.mork-optimization.com/. It downloads a Mork template
from GitHub, substitutes the project name, and creates a ZIP in the browser. There is no build step.

## Local preview

```sh
python3 -m http.server 8766 --bind 127.0.0.1
```

Open http://127.0.0.1:8766. Generation needs access to the GitHub API and raw file downloads.
`generator.js` and the bundled FileSaver/JSZip libraries implement generation. The form preserves their
input IDs and `generateProject()` entry point; browser form validation requires a name beginning with
an uppercase letter, followed by letters, numbers, or underscores.

## Visual identity

The local logo and `css/styles.css` follow the homepage's `BRAND.md` in the `mork-optimization/web`
repository. Use the same cream, ink, and terracotta palette, serif display headings, sans-serif form
labels, and visible keyboard focus. The form and generation log use white surfaces for readability.
The primary button is terracotta; green is reserved for success states. Bootstrap is no longer needed
for this layout. Keep canonical links, logo, and navigation aligned with the homepage and documentation.

Check desktop, tablet, and 390/320px mobile layouts before publishing, along with keyboard submission,
invalid and empty names, version selection, generation logs, and ZIP downloads. Preserve `CNAME`.

The updated screenshot in the main Mork repository (`docs/quickstart/generator.png`) shows the local
form before generation, with real release options fetched from GitHub (0.22 selected, 9 November 2026).
