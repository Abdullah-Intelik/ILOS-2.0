## Build: UBL Architecture + ILOS Overlay (High-Res)

Prerequisites
- Docker Desktop running
- Files in this repo:
  - `ilos-backend-2.0/docs/HRMS-UBL.pdf` (copied from the uploaded PDF)
  - `ilos-backend-2.0/docs/ARCHITECTURE.mmd` (ILOS architecture panel source)

Steps (run from repo root)
1) Convert the first page of the UBL PDF to a high-resolution PNG:
```bash
docker run --rm -v "$PWD":/work dpokidov/imagemagick:7.1.1-13 magick -density 300 \
  /work/ilos-backend-2.0/docs/HRMS-UBL.pdf[0] -resize 3000x -quality 95 \
  /work/ilos-backend-2.0/docs/HRMS-UBL-base.png
```

2) Render the ILOS panel (Mermaid) to transparent PNG:
```bash
docker run --rm -v "$PWD":/data ghcr.io/mermaid-js/mermaid-cli/mermaid-cli:10.9.1 \
  -i ilos-backend-2.0/docs/ARCHITECTURE.mmd \
  -o ilos-backend-2.0/docs/ILOS-PANEL.png \
  -b transparent -w 1800 -s 2
```

3) Compose side-by-side: UBL base (left) + ILOS panel (right):
```bash
docker run --rm -v "$PWD":/work dpokidov/imagemagick:7.1.1-13 magick \
  /work/ilos-backend-2.0/docs/HRMS-UBL-base.png \
  /work/ilos-backend-2.0/docs/ILOS-PANEL.png +append \
  /work/ilos-backend-2.0/docs/HRMS-UBL-with-ILOS.png
```

Outputs
- `ilos-backend-2.0/docs/HRMS-UBL-base.png` — high-res UBL page 1
- `ilos-backend-2.0/docs/ILOS-PANEL.png` — transparent ILOS panel
- `ilos-backend-2.0/docs/HRMS-UBL-with-ILOS.png` — final deliverable

Notes
- If you prefer overlay instead of side-by-side, replace step 3 with `composite` and specify `-gravity` and `-geometry` to position the panel on top of the base image.
