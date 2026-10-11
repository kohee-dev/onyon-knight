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

Solo `astro dev` los lee; `astro build` nunca publica contenido privado. Si la carpeta está dentro del repositorio, el servidor de desarrollo se niega a arrancar: se subiría a GitHub.

Diseño: `docs/superpowers/specs/2026-10-11-web-docente-nucleo-design.md`.

## Despliegue

Cada push a `main` ejecuta `.github/workflows/deploy.yml`: pruebas, build (web + PDF) y publicación en
GitHub Pages (`https://<usuario>.github.io/<repo>/`). La caché de PDFs se guarda entre ejecuciones.

Configuración única en GitHub: *Settings → Pages → Source: GitHub Actions*.

Para cambiar de destino (dominio propio, Raspberry Pi…), ajusta `BASE_PATH` y `SITE_URL`, y sustituye el
trabajo `deploy` por un `rsync` de `dist/` al servidor.
