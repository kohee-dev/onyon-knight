---
titulo: "La gira de la Garnier · Fase 1: infraestructura"
licencia: CC-BY-NC-SA-4.0
tipo: caso
horas: 10
resumen: Terraform levanta desde la estación de control cuatro servidores Debian sin puertos publicados, con una clave ED25519 y el inventario de Ansible generado.
---

:::nota[Fase 1 de 4]
Parte del encargo [[gira-garnier|La gira de la Garnier]]. Antes de empezar, leed allí la organización del grupo y cómo se entrega. Esta fase la **lidera un miembro**; las respuestas y evidencias van en `docs/fase1.md`.
:::

**Punto de partida:** el repositorio del grupo con la estructura del [[taller-git|taller 1]], la estación de control en marcha ([[taller-docker|taller 2]]) y la imagen de los servidores en `terraform/nodo/Dockerfile` ([[taller-ssh|taller 3]]).

**Punto de llegada:** cuatro servidores `garnier-cuerdas`, `garnier-madera`, `garnier-metales` y `garnier-percusion` en la red `garnier`, sin ningún puerto publicado en el anfitrión, accesibles por SSH solo con una clave que genera Terraform, y un inventario de Ansible que se escribe solo.

Todas las órdenes de Terraform y Ansible se lanzan **dentro de la estación** (`docker exec -it estacion bash`).

# Conceptos

Responded en `docs/fase1.md`, con vuestras palabras y pensando en **esta** infraestructura, no en general.

## 1.1 — Por qué automatizar

Imaginad que el Impresario os pide montar los cuatro servidores **a mano**, uno a uno, cada vez que la gira llega a un teatro nuevo.

a) Describid tres problemas concretos que tendríais en la tercera ciudad de la gira.

b) Para cada uno, explicad cómo lo evita describir la infraestructura como código.

## 1.2 — Dos herramientas, dos trabajos

a) Explicad qué parte del encargo hace Terraform y qué parte hace Ansible. Usad ejemplos de vuestra infraestructura.

b) ¿Por qué no basta con una de las dos? Dad un ejemplo de algo que sería incómodo o inseguro hacer con Terraform y otro con Ansible.

c) Alguien del grupo propone hacerlo todo con **Docker Compose**. ¿Qué partes del encargo podríais hacer con Compose y cuáles no? Si los cuatro servidores fueran máquinas virtuales o servidores de una empresa, ¿qué parte de vuestro trabajo seguiría sirviendo y qué tendríais que cambiar?

## 1.3 — Cómo se llega a cada máquina

En vuestra infraestructura se administra a distancia de varias formas.

a) Haced una tabla con estas comunicaciones: la estación crea contenedores, la estación configura los servidores, un navegador abre la consola de regiduría (fase 4) y la estación gestiona el Windows de la taquilla (fase 4). Para cada una, indicad el **método o protocolo**, el **puerto** o canal, y si está **cifrado**.

b) Explicad la diferencia entre un servicio **orientado a sesión** y uno **no orientado a sesión**, y clasificad los de vuestra tabla.

## 1.4 — Claves, no contraseñas

a) Explicad por qué los servidores solo admiten acceso con **clave** y no con contraseña. Dad dos razones.

b) ¿Por qué ED25519 y no RSA? ¿Qué parte del par de claves está en cada servidor y cuál no debe salir nunca del volumen `garnier-datos`?

c) La estación monta `/var/run/docker.sock`. Explicad qué podría hacer alguien que consiguiera ejecutar órdenes dentro de la estación y qué medidas lo limitan en vuestro caso.

# Tareas

## 1.5 — La estación de control *(imprescindible)*

La estación ya está construida desde el taller 2. Ahora hay que dejarla **documentada** para que cualquier miembro la pueda reproducir.

a) En el `README.md`, sección «Puesta en marcha», escribid las órdenes exactas para construir la estación, crear la red `garnier` y el volumen `garnier-datos`, y arrancarla. Dad la versión de PowerShell y la de Bash.

b) Explicad en `docs/fase1.md` para qué sirve cada `-v` y cada `-e` de la orden `docker run`.

c) El `Dockerfile` fija las versiones de Terraform y de `ansible-core`. Explicad qué problema evita y qué pasaría si se usara `latest`.

**Evidencia:** la salida de `terraform version` y la primera línea de `ansible --version` ejecutadas en la estación.

## 1.6 — Los cuatro servidores *(imprescindible)*

En `terraform/`, describid la infraestructura. Repartidla en ficheros por tema (`versions.tf`, `variables.tf`, `nodos.tf`, `outputs.tf`…).

a) **Proveedores y estado.** Usad los proveedores `kreuzwerker/docker` (3.x), `hashicorp/tls` (4.x) y `hashicorp/local` (2.x). El estado de Terraform debe guardarse en `/datos/terraform.tfstate`, nunca dentro del repositorio.

b) **Variables.** Una variable `secciones` (lista de texto) con las cuatro secciones por defecto y **dos validaciones** con mensaje en español: que haya entre 1 y 6 secciones, y que cada una se escriba solo con minúsculas sin tildes.

c) **La red.** La red `garnier` ya existe porque la creasteis a mano. Terraform debe usarla, **no crearla ni poder destruirla**.

d) **La clave.** Terraform genera un par de claves **ED25519** y guarda la privada en `/datos/claves/garnier` con permisos `600`.

e) **Los servidores.** Un contenedor por sección, a partir de la imagen de `terraform/nodo/`. Cada uno se llama y tiene por *hostname* `garnier-<sección>`, está en la red `garnier`, **no publica ningún puerto** y recibe la clave pública en `/home/admin/.ssh/authorized_keys`. Si cambia el `Dockerfile` de la imagen, Terraform debe reconstruirla (pista: mirad el argumento `triggers` del recurso de imagen).

f) **Salida.** Un `output` con la lista de nombres de los servidores.

Lanzad `init`, `fmt`, `validate`, `plan` y `apply`. Lanzad `apply` **otra vez**.

**Evidencias:** la línea `Plan:` del primer plan, la línea `Apply complete!` de cada `apply` y la salida de `docker port garnier-cuerdas` (ejecutada fuera de la estación). Explicad por qué la segunda ejecución no crea nada y qué demuestra que `docker port` no muestre nada.

## 1.7 — El inventario se escribe solo *(imprescindible)*

Nadie debería copiar a mano los nombres de los servidores en el inventario de Ansible: si mañana hay seis secciones, se olvidaría alguno.

a) Haced que Terraform genere `ansible/inventory.ini` a partir de una plantilla. Debe tener un grupo `secciones` con un servidor por línea y, para el grupo, el usuario `admin` y la clave de `/datos/claves/garnier`. Añadid `ansible/inventory.ini` al `.gitignore`. ¿Por qué no se sube?

b) Cread `ansible/ansible.cfg` con, al menos, la ruta del inventario. Si desactiváis la comprobación de la clave del servidor, justificad por qué es aceptable **aquí** y no lo sería en producción.

c) Comprobad con Ansible que los cuatro servidores responden.

**Evidencias:** el contenido de `ansible/inventory.ini` y la salida de la comprobación.

## 1.8 — Que nadie entre por donde no debe

Demostrad con órdenes, desde la estación, que:

a) No se puede entrar en un servidor **sin clave** ni como **root**.

b) La clave privada tiene permisos `600` y **no** está en el repositorio. Probadlo con Git, no basta con decir que está en `.gitignore`.

c) Cada servidor tiene **su propia identidad SSH**. Comparad la huella de la clave de host de dos servidores y explicad por qué sería grave que coincidieran.

**Evidencias:** las órdenes y sus salidas.

# Al terminar la fase

- La PR de la fase está fusionada en `main`, revisada por otro miembro.
- La hoja de control tiene las filas de esta fase.
- Evidencia final en `docs/fase1.md`, ejecutada en la estación:

```bash
terraform -chdir=terraform output nodos
ansible secciones -m ansible.builtin.ping
```

Debe salir la lista con los cuatro servidores y cuatro `SUCCESS`.

Siguiente: [[gira-garnier-fase2|Fase 2 · Configuración]].
