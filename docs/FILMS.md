# Filmproduktion

Film 01–03 finns i `films/part_a.py`, 04–06 i `films/part_b.py`. Varje grupp har ett renderverktyg. Filmerna är fristående originalproduktioner för åk 7, inspirerade av visuell matematisk förklaring och det accepterade Manim-upplägget i Kemilabbet. Inga externa scener eller bokuppgifter har kopierats.

## Krav

- Python med `manim==0.22.1` och NumPy.
- FFmpeg och FFprobe i PATH.
- TeX Live eller motsvarande med `latex`, `dvisvgm`, `babel` svenska, `lmodern`, `amsmath`, `amssymb`, `mathtools` och `xcolor`.

```sh
python3 -m venv .venv
. .venv/bin/activate
pip install -r films/requirements.txt
python films/render_a.py
python films/render_b.py
python scripts/verify_site.py
```

Renderverktygen hanterar Manim, originalmusik, MP4-slutmix, undertexter och affischer. Sätt `MANIM_PYTHON` om en annan befintlig miljö ska användas. En rendering kan ta lång tid; låt verktyget avslutas innan resultatet används.

| Film | Innehåll |
| --- | --- |
| 01-uttryck | Variabel, multiplikation, insättning och uttrycksvärde |
| 02-monster | Växande och fast del, figurnummer och en generell regel |
| 03-forenkla | Liknande termer, tecken, nollpar och värdebevarande |
| 04-ekvationer | Likhet, samma operation i båda leden och kontroll |
| 05-problem | Variabelns betydelse, ekvation, lösning, enhet och rimlighet |
| 06-bada-led | Samla x-termer, en lösning, ingen lösning och alla värden |

Allt hörbart ljud är originalmusik utan tal. Förklaringen finns som LaTeX i bilden. VTT är ett valbart textspår och visas inte automatiskt ovanpå den inbrända texten. Native webbvideokontroller kan pausa, spola och justera ljud.

Tekniska referenser: [Manim Community](https://docs.manim.community/en/stable/), [TransformMatchingTex](https://docs.manim.community/en/stable/reference/manim.animation.transform_matching_parts.TransformMatchingTex.html), [KaTeX i webbläsaren](https://katex.org/docs/browser.html).
