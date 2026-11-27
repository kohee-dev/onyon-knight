---
titulo: "La gira de la Garnier · Fase 3: operación"
licencia: CC-BY-NC-SA-4.0
tipo: caso
horas: 10
resumen: Diagnosticar y documentar un incidente provocado a propósito, pasar los controles de calidad, reconstruir toda la infraestructura con un solo script y dejarla documentada para otra persona.
---

:::nota[Fase 3 de 4]
Parte del encargo [[gira-garnier|La gira de la Garnier]]. Esta fase la **lidera un miembro**; las respuestas y evidencias van en `docs/fase3.md`. Anterior: [[gira-garnier-fase2|Fase 2 · Configuración]].
:::

**Punto de partida:** `site.yml` configura los cuatro servidores y una segunda ejecución termina con `changed=0`.

**Punto de llegada:** un repositorio que pasa los controles de calidad, una orden que destruye y reconstruye los servidores idénticos, un informe de incidente y un `README.md` con el que otra persona puede operar la infraestructura sin preguntaros.

# Conceptos

## 3.1 — Probar por capas

Para cada herramienta, explicad **qué tipo de error** detecta y **cuál no**, y en qué momento del trabajo la usaríais: `ansible-playbook --syntax-check`, `ansible-playbook --check --diff`, `ansible-playbook -v` (y `-vvv`), `ansible-lint`, `terraform validate` y `terraform plan`.

Terminad con el orden en que las lanzaríais antes de aprobar una *pull request*.

# Tareas

## 3.2 — El incidente *(imprescindible)*

Esta tarea se juega en dos tiempos.

**Primer tiempo: Herme.** El miembro que lideró la **fase 2** hace de Herme. Sin contárselo al resto, crea una rama, modifica `ansible/partituras.yml` con estos tres cambios y abre una *pull request* titulada «Mejora del rendimiento de las partituras»:

1. Escribe mal el nombre de un módulo de una tarea (por ejemplo, le quita la última letra).
2. Cambia el destino de la **página** de la partitura a `/var/www/html/index.html`, una carpeta que vuestro nginx no sirve.
3. Borra la tarea que comprueba desde la estación que la página responde.

Herme anota en un papel qué ha cambiado y no lo dice hasta el final.

**Segundo tiempo: el equipo.** El líder de esta fase revisa la PR **sin mirar el diff línea a línea**: solo con las herramientas del apartado 3.1, en la rama de Herme y contra los servidores.

a) Encontrad **cada uno** de los fallos. Para cada uno, indicad qué herramienta lo ha delatado y pegad la salida que lo demuestra.

b) Uno de los fallos haría que el playbook terminara **sin ningún error** y, aun así, la orquesta no sonaría. ¿Cuál? ¿Por qué no lo detecta una ejecución normal?

c) Rechazad la PR con un comentario en GitHub que explique los fallos. Si Herme llegó a fusionar algo, revertidlo.

d) Escribid el informe en `docs/incidente.md`: qué pasó, cómo se detectó, causa, impacto que habría tenido y **cómo evitáis que se repita**. Al menos una de las medidas debe ser técnica, no solo «tener cuidado».

## 3.3 — Controles de calidad

Antes de que un cambio entre en `main`, el código debe pasar estos controles:

a) `terraform fmt -check` y `terraform validate` sin errores.

b) `ansible-lint` con el perfil más estricto (`production`), configurado en un fichero `.ansible-lint` en `ansible/` que excluya los roles descargados. Corregid **todos** los avisos sin desactivar reglas. Si alguno no se puede corregir, justificadlo.

c) Una segunda ejecución de `site.yml` con `changed=0`.

**Evidencias:** la última línea de `ansible-lint` y la salida de los otros controles.

## 3.4 — Reconstruir con una orden *(imprescindible)*

Una hora antes del estreno, un servidor ha quedado inservible. No hay tiempo para arreglarlo a mano.

a) Escribid `reconstruir.sh` en la raíz del repositorio. Se ejecuta dentro de la estación, destruye **solo los servidores**, los vuelve a crear y los configura enteros. **No** debe tocar la red `garnier`, el volumen `garnier-datos`, la estación ni, en la fase 4, la consola de regiduría. Si cualquier paso falla, el script debe pararse en ese momento.

b) Ejecutadlo. Después, ejecutad `site.yml` otra vez.

c) Explicad cómo habéis conseguido que Terraform destruya solo los servidores y qué otro recurso se ha destruido y recreado con ellos (y por qué).

**Evidencias:** las líneas `Destroy complete!` y `Apply complete!`, el `PLAY RECAP` de la reconstrucción y el de la ejecución posterior (`changed=0`).

## 3.5 — Que lo pueda operar otra persona *(imprescindible)*

El `README.md` es lo que leerá la persona de guardia a las tres de la mañana. Debe tener, como mínimo:

- **Arquitectura:** qué contenedores hay, en qué red, qué puertos y dónde vive cada dato. Un esquema en texto basta.
- **Puesta en marcha y despliegue:** desde un equipo limpio hasta la orquesta sonando, con las órdenes exactas.
- **Qué hace cada playbook** y cada script.
- **Tareas programadas:** la tabla de la fase 2.
- **Secretos:** dónde está cada uno y cómo se consigue, sin escribir ninguno.
- ***Runbook*:** al menos cinco síntomas reales que os hayan pasado durante el encargo (`UNREACHABLE`, `Permission denied`, puertos ocupados, finales de línea, Vault…), con qué los causa y qué hacer.
- El **reparto de fases** y el **enlace al vídeo**.

**Prueba de fuego:** un miembro que **no** haya liderado la fase 1 clona el repositorio en una carpeta nueva, borra su estación, su red y su volumen, y levanta todo siguiendo **solo** el `README.md`. Apuntad en `docs/fase3.md` cada punto en que tuvo que preguntar o adivinar, y corregid el `README.md` hasta que no haga falta.

# Al terminar la fase

- La PR de la fase está fusionada en `main`, revisada por otro miembro.
- La hoja de control tiene las filas de esta fase.
- Evidencia final en `docs/fase3.md`, ejecutada en la estación:

```bash
./reconstruir.sh
ansible-playbook ansible/site.yml
```

La reconstrucción termina sin fallos y la segunda orden con `changed=0` en los cuatro servidores.

Siguiente: [[gira-garnier-fase4|Fase 4 · Ampliación]].
