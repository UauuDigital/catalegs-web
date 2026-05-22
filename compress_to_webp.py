#!/usr/bin/env python3
"""
Comprimeix totes les imatges d'una carpeta a WebP amb un màxim de 200KB,
mantenint la màxima qualitat possible. Les imatges originals s'eliminen
si es converteixen a WebP.
"""

import os
import io
import sys
from pathlib import Path
from PIL import Image

SOURCE_DIR = Path("/Users/marcpallares/Desktop/uauu-landing-cataleg/media/finques")
MAX_SIZE_KB = 400
MAX_SIZE_BYTES = MAX_SIZE_KB * 1024
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp"}


def find_best_quality(img: Image.Image, max_bytes: int) -> tuple[int, bytes]:
    """Cerca la qualitat màxima que manté la mida per sota de max_bytes."""
    low, high = 10, 90
    best_quality = low
    best_data = None

    while low <= high:
        mid = (low + high) // 2
        buf = io.BytesIO()
        img.save(buf, format="WEBP", quality=mid, method=6)
        size = buf.tell()

        if size <= max_bytes:
            best_quality = mid
            best_data = buf.getvalue()
            low = mid + 1
        else:
            high = mid - 1

    return best_quality, best_data


def compress_with_resize(img: Image.Image, max_bytes: int) -> tuple[int, bytes, float]:
    """Comprimir + redimensionar si cal per arribar a max_bytes.
    Retorna (qualitat, dades, escala aplicada)."""
    scale = 1.0
    orig_w, orig_h = img.size

    while scale >= 0.05:
        quality, data = find_best_quality(img, max_bytes)
        if data is not None:
            return quality, data, scale

        # Reduïm un 15% i tornem a provar
        scale *= 0.85
        new_w = max(1, int(orig_w * scale))
        new_h = max(1, int(orig_h * scale))
        img = img.resize((new_w, new_h), Image.LANCZOS)

    # Últim recurs: qualitat 10 amb l'escala mínima
    buf = io.BytesIO()
    img.save(buf, format="WEBP", quality=10, method=6)
    return 10, buf.getvalue(), scale


def compress_image(src_path: Path) -> dict:
    """Processa una imatge i retorna info del resultat."""
    result = {"path": src_path, "status": "ok", "message": "", "scale": 1.0}

    try:
        img = Image.open(src_path)

        # Convertim a RGB si cal (PNG amb transparència → RGBA és vàlid per WebP)
        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGBA" if "A" in img.mode else "RGB")

        original_size = src_path.stat().st_size

        quality, webp_data, scale = compress_with_resize(img, MAX_SIZE_BYTES)
        final_size = len(webp_data)

        dest_path = src_path.with_suffix(".webp")
        dest_path.write_bytes(webp_data)

        # Eliminar original si era un format diferent
        if src_path.suffix.lower() != ".webp":
            src_path.unlink()

        result["original_size"] = original_size
        result["final_size"] = final_size
        result["quality"] = quality
        result["scale"] = scale
        result["dest"] = dest_path

    except Exception as e:
        result["status"] = "error"
        result["message"] = str(e)

    return result


def format_kb(n_bytes: int) -> str:
    return f"{n_bytes / 1024:.1f} KB"


def main():
    if not SOURCE_DIR.exists():
        print(f"Error: no existeix la carpeta {SOURCE_DIR}")
        sys.exit(1)

    image_files = [
        p for p in SOURCE_DIR.rglob("*")
        if p.is_file() and p.suffix.lower() in SUPPORTED_EXTENSIONS
    ]

    total = len(image_files)
    print(f"Imatges trobades: {total}")
    print(f"Màxim: {MAX_SIZE_KB} KB | Format destí: WebP\n")

    ok = errors = skipped = 0
    saved_bytes = 0

    for i, path in enumerate(image_files, 1):
        rel = path.relative_to(SOURCE_DIR)
        print(f"[{i}/{total}] {rel} ... ", end="", flush=True)

        res = compress_image(path)

        if res["status"] == "error":
            print(f"ERROR: {res['message']}")
            errors += 1
        else:
            orig_kb = format_kb(res["original_size"])
            final_kb = format_kb(res["final_size"])
            q = res["quality"]
            scale = res["scale"]
            saved = res["original_size"] - res["final_size"]
            saved_bytes += saved
            scale_info = f", escala={scale:.0%}" if scale < 0.99 else ""
            flag = " ⚠ supera 200KB!" if res["final_size"] > MAX_SIZE_BYTES else ""
            print(f"{orig_kb} → {final_kb} (q={q}{scale_info}){flag}")
            ok += 1

    print(f"\n--- Resum ---")
    print(f"OK: {ok}  |  Errors: {errors}")
    print(f"Espai alliberat: {format_kb(saved_bytes)}")


if __name__ == "__main__":
    main()
