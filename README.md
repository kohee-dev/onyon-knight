# Onyon Knight

Web docente estática (Astro). Los apuntes son **piezas** Markdown pequeñas y
combinables; cada **módulo** es un índice YAML que las ordena en unidades. Cada
unidad se publica como página web y como PDF.

## Uso diario

```bash
npm install
npm run dev      # http://localhost:4321
npm test
npm run build    # web + PDFs en dist/
```

## Dónde se escribe

- `contenido/piezas/**/<id>.md`: apuntes. El id es el nombre del archivo.
- `contenido/piezas/**/img/<imagen>` + `<imagen>.yml`: imagen y su ficha de licencia (obligatoria).
- `contenido/modulos/<id>.yml`: índice del módulo (unidades → piezas).

## Apuntes privados

Viven **fuera del repo**. Indica su carpeta con `ONYON_PRIVADO`:

```bash
ONYON_PRIVADO=../onyon-privado npm run dev
```

Solo `astro dev` los lee; `astro build` nunca publica contenido privado.

Diseño: `docs/superpowers/specs/2026-10-11-web-docente-nucleo-design.md`.
