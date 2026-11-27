---
titulo: "La gira de la Garnier · Fase 4: ampliación"
licencia: CC-BY-NC-SA-4.0
tipo: caso
horas: 10
resumen: Semaphore y su PostgreSQL desplegados con Terraform para lanzar, programar y auditar los playbooks desde el navegador, y un Windows gestionado desde Linux por WinRM.
---

:::nota[Fase 4 de 4]
Parte del encargo [[gira-garnier|La gira de la Garnier]]. Esta fase la **lidera un miembro**; las respuestas y evidencias van en `docs/fase4.md`. Anterior: [[gira-garnier-fase3|Fase 3 · Operación]].

Es **obligatoria**, pero no impide aprobar: lo que no hagáis de esta fase no cuenta, y el resto del encargo se evalúa igual.
:::

**Punto de partida:** la infraestructura de las fases 1 a 3, reconstruible con `reconstruir.sh`.

**Punto de llegada:** una consola web desde la que el equipo de guardia lanza y programa los playbooks aprobados sin acceso a la terminal, con historial de quién ejecutó qué; y un Windows configurado desde la estación por WinRM, que queda cerrado al terminar.

# Conceptos

## 4.1 — SSH y WinRM

Comparad SSH y WinRM en una tabla: para qué sistema se pensó cada uno, puertos, si es orientado a sesión, cómo se autentica y cómo cifra. Explicad por qué Ansible no usa SSH ni Python para gestionar Windows.

## 4.2 — ¿Para qué una consola gráfica?

Ya tenéis `cron` en los servidores y podríais lanzar los playbooks desde la terminal.

a) Explicad tres cosas que aporta una herramienta como Semaphore a un **equipo** de sistemas y que `cron` y la terminal no dan.

b) ¿Qué riesgos añade? Pensad en dónde guarda las claves y en quién puede entrar.

# Tareas

## 4.3 — La consola de regiduría

Desplegad con **Terraform** dos contenedores nuevos en la red `garnier`:

- `garnier-regiduria`: **Semaphore** (imagen `semaphoreui/semaphore`, con versión fijada), accesible desde el navegador del anfitrión en `http://localhost:3000`.
- `garnier-archivo`: su base de datos **PostgreSQL** (imagen `postgres`, versión fijada). Para vosotros es una **caja negra**: no hay que administrarla por dentro, pero **no** debe publicar ningún puerto y sus datos deben guardarse en un volumen propio.

Condiciones:

a) Los dos contenedores **solo existen** si una variable `ampliacion` vale `true`. Con su valor por defecto (`false`), el plan de las fases anteriores no cambia. Fijad su valor en `terraform/terraform.tfvars` para que `reconstruir.sh` no los destruya.

b) Las contraseñas (la de la base de datos y la del administrador de Semaphore) las **genera Terraform**. No aparecen escritas en ningún fichero del repositorio ni en la salida del `plan`. La del administrador se puede consultar con `terraform output`.

c) Semaphore lee los playbooks de vuestro repositorio, montado **en solo lectura**. Pista: Terraform corre dentro de la estación, pero la ruta que necesita Docker es la del **anfitrión**. Revisad qué `-e` pusisteis en el `docker run` de la estación.

d) Consultad la documentación de la imagen de Semaphore para saber qué variables de entorno necesita para usar PostgreSQL y crear el administrador.

**Evidencias:** la línea `Apply complete!`, la salida de `curl -s localhost:3000/api/ping` desde el anfitrión, la de `docker port garnier-archivo` y la prueba de que la contraseña no está en el repositorio (`git grep`).

## 4.4 — Lanzar y programar desde el navegador

Entrad en `http://localhost:3000` con el administrador y configurad un proyecto «Gira Garnier»:

a) En el **almacén de claves**, la clave SSH de los servidores y la contraseña de Vault. ¿Dónde y cómo las guarda Semaphore?

b) El **repositorio** (la ruta donde está montado dentro del contenedor), el **inventario** de las cuatro secciones y una **plantilla de tarea** que ejecute `site.yml` con la clave de Vault.

c) Lanzad la plantilla desde el navegador y comprobad que termina bien. Si falla porque no encuentra el rol de Galaxy, pensad dónde lo buscó Ansible en la estación y dónde lo busca aquí.

d) **Programad** la plantilla para que se ejecute cada día a las 9:00.

**Evidencias:** el `PLAY RECAP` de la tarea, copiado de la salida que muestra Semaphore, y la expresión de la programación. Explicad qué ventaja tiene esta programación frente a la tarea de `cron` de la fase 2 y qué inconveniente.

## 4.5 — El equipo de guardia

Cread en Semaphore un usuario `guardia` que **pueda lanzar** las plantillas del proyecto pero **no pueda modificarlas** ni ver las claves.

a) ¿Qué rol le habéis dado y qué permite cada rol de un proyecto de Semaphore?

b) Entrad como `guardia`, lanzad una tarea e intentad editar la plantilla.

c) En el **historial** de tareas, ¿cómo se distingue quién lanzó cada ejecución? ¿Por qué es importante en un equipo?

**Evidencias:** el resultado del intento de edición y una fila del historial con el usuario que la lanzó.

## 4.6 — La taquilla

La taquilla funciona con **Windows**: el propio equipo anfitrión. Hay que gestionarlo desde la estación, igual que los servidores Linux, y cerrarlo al terminar.

a) **Abrirla.** Escribid `windows/activar-winrm.ps1`, que se ejecuta en PowerShell como administrador, activa WinRM por HTTP (5985) con autenticación NTLM, sin autenticación básica ni tráfico sin cifrar, y abre el puerto solo en redes privadas. Ejecutadlo y comprobad el *listener*.

b) **Conectar.** Cread `ansible/inventory-windows.ini` con un grupo `taquilla` que apunte al anfitrión **visto desde un contenedor** (buscad el nombre especial que Docker Desktop da al anfitrión). El usuario y la contraseña de Windows van cifrados con Vault en `ansible/group_vars/taquilla/`.

c) **Configurar.** Escribid `ansible/taquilla.yml` que:
- compruebe la conexión y muestre la versión de Windows;
- cree la cuenta local `impresario`, con su contraseña también en Vault;
- programe en el Programador de tareas un recuento diario a las 20:00 que añada la fecha a `C:\Garnier\recuento.log`;
- compruebe que la tarea programada existe.

Ejecutadlo **dos veces**: la segunda, sin cambios.

d) **Cerrarla.** Escribid `windows/desactivar-winrm.ps1`, que deja WinRM parado y deshabilitado, sin *listener* ni regla de cortafuegos. Ejecutadlo y comprobad que Ansible ya **no** puede conectar.

**Evidencias:** la salida de las dos ejecuciones de `taquilla.yml`, el estado del servicio WinRM tras cerrarlo y el error de Ansible al intentar conectar después.

# Al terminar la fase

- La PR de la fase está fusionada en `main`, revisada por otro miembro.
- La hoja de control tiene las filas de esta fase.
- Evidencia final en `docs/fase4.md`: la salida de `docker ps --format "table {{.Names}}\t{{.Ports}}"` (siete contenedores, y solo Semaphore publica un puerto) y la última fila del historial de Semaphore.

Con esto, la gira está lista. Volved a la [[gira-garnier|portada del encargo]] para la prueba del estreno y la entrega.
