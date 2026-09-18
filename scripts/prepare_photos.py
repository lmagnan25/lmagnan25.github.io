"""Make responsive, correctly oriented WebP copies without altering the sources.

Run from any directory with Python and Pillow installed. Images are not
retouched or color graded. EXIF (including GPS) is omitted from web copies.
"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "photos"
OUTPUT.mkdir(parents=True, exist_ok=True)

# The dog photograph is deliberately excluded from the public gallery.
EXCLUDED = {"IMG_0425"}

for source in sorted((ROOT / "Photos").iterdir()):
    if source.stem in EXCLUDED:
        continue
    if source.suffix.lower() not in {".jpg", ".jpeg", ".png"}:
        continue
    with Image.open(source) as raw:
        photo = ImageOps.exif_transpose(raw).convert("RGB")
        for requested in (480, 960, 1600):
            width = min(requested, photo.width)
            height = round(photo.height * width / photo.width)
            output = photo.resize((width, height), Image.Resampling.LANCZOS)
            output.save(OUTPUT / f"{source.stem}-{requested}.webp", "WEBP", quality=84, method=6)
    print(source.name)
