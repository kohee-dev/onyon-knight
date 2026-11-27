---
titulo: "Convoy a Marte: infraestructura como código con Terraform y Ansible"
licencia: CC-BY-NC-SA-4.0
tipo: caso
horas: 9
resumen: Terraform levanta los campamentos de una colonia en Marte como contenedores Docker y Ansible los deja habitables, hasta reconstruirlo todo con una sola orden.
fuentes:
  - "HashiCorp. Terraform Documentation. https://developer.hashicorp.com/terraform/docs"
  - "kreuzwerker. Docker provider for Terraform. https://registry.terraform.io/providers/kreuzwerker/docker/latest/docs"
  - "Red Hat. Ansible Community Documentation. https://docs.ansible.com/"
---

::: aviso
Para la realización de esta actividad voy a tener los siguientes supuestos:

+ Manejas la terminal de Linux y SSH con soltura.
+ Cada pregunta se apoya en las anteriores: **no te saltes ninguna**, porque la colonia se construye paso a paso.
+ Las preguntas van de menos a más dificultad. Al principio se te dice qué herramienta usar; al final solo se te dice qué hay que conseguir. Si te atascas, **pregunta**.
+ Las explicaciones se redactan con tus propias palabras.
+ Si alguien hace *trampa* o *plagio*, lo sabré.
:::

# Planteamiento

La expedición **Ares** ha llegado a Marte. Primero aterriza un convoy de avanzadilla y su misión es preparar el terreno para el resto de la colonia: plantar una baliza de aterrizaje y levantar varios **campamentos idénticos**. En Marte no hay tiempo para montar cada campamento a mano, y las tormentas de polvo pueden borrar uno en cualquier momento. Por eso toda la colonia se describe **como código**: si un campamento desaparece, se vuelve a levantar igual con una sola orden.

Tú eres la persona responsable de sistemas del convoy. Usarás dos herramientas que se reparten el trabajo:

- **Terraform** *aprovisiona*: crea la red, las imágenes y los contenedores que hacen de campamentos.
- **Ansible** *configura*: entra en cada campamento por SSH y deja instalados la tripulación, los servicios y las tareas programadas.

Todo vivirá en un repositorio Git llamado `convoy-marte`, con una carpeta `terraform/` y otra `ansible/`. Las preguntas se entregan en **dos entregas** (preguntas 1 a 4 y preguntas 5 a 11).

::: nota
**Escenario.** Necesitas un equipo Linux (o WSL2 en Windows) que hará de **nodo de control**, con Docker, Terraform y `ansible-core` instalados. Tu usuario debe poder usar Docker sin `sudo`. Los campamentos se publican en los puertos 2201, 2202… de tu equipo y la baliza en el 8000: si alguno está ocupado, elige otro y anótalo en la entrega.
:::

# Conocimientos previos

Antes de empezar deberías repasar la teoría de [[ansible-teoria|Automatización con Ansible]]. En concreto, necesitas saber:

- Qué es el **inventario** y cuándo usar un comando **ad-hoc** o un **playbook**.
- Qué es la **idempotencia** y cómo se lee el `PLAY RECAP`.
- **Variables**, *facts*, bucles (`loop`), plantillas **Jinja2** y **handlers**.

De Terraform necesitas conocer estas ideas (la [documentación oficial](https://developer.hashicorp.com/terraform/docs) las explica):

- Un **proveedor** (*provider*) es el complemento que sabe hablar con una plataforma (Docker, una nube…). Se descarga del *Registry* de Terraform.
- Un **recurso** (`resource`) es algo que Terraform crea y mantiene; una **variable** (`variable`) es un parámetro y una **salida** (`output`) es un dato que Terraform muestra al terminar.
- El **estado** (`terraform.tfstate`) es la memoria de Terraform: qué recursos creó y cómo eran.
- El ciclo de trabajo es `init` → `plan` → `apply`, y `destroy` para borrarlo todo.

# Cómo entregar el trabajo

El trabajo se entrega en **dos partes**: un repositorio Git más un documento por parte. El plazo y el canal de entrega los indicará el profesorado.

Descarga la plantilla de cada entrega, rellénala con tus respuestas y guárdala con el nombre `entregaN_apellido_nombre.docx` (en minúsculas, sin tildes ni espacios; por ejemplo, `entrega1_garcia_lucia.docx`):

- [Plantilla de la entrega 1 (preguntas 1 a 4)](descarga:convoy-marte-entrega1.docx)
- [Plantilla de la entrega 2 (preguntas 5 a 11)](descarga:convoy-marte-entrega2.docx)

**Qué se entrega y cómo:**

- Cada entrega es un `.docx` dentro de la carpeta `entregas/` del repositorio.
- Al terminar cada parte, haz *commit* y marca el estado con una etiqueta Git: `entrega1` o `entrega2`. Después, sube el repositorio con `git push --tags`.
- Entregas por separado: la segunda no sustituye a la primera, y el repositorio debe conservar las dos etiquetas.

**Reglas de la entrega:**

- Una fila por cada apartado (1a, 1b, 2a…). Si un apartado no tiene resultado, escribe `—`.
- Pega las salidas como **texto**, no como capturas de pantalla. Si una salida es muy larga, pega solo las líneas que piden el enunciado.
- Las explicaciones se redactan con tus propias palabras.
- Los ficheros de Terraform y de Ansible van en el repositorio, no dentro del documento.
- Nunca subas al repositorio la clave privada, el estado de Terraform (`terraform.tfstate`) ni la carpeta `.terraform/`.

**Qué debe contener cada entrega:**

| Entrega | Preguntas | En el repositorio (etiqueta) | Explicaciones que hay que incluir | Evidencia final |
|---------|-----------|------------------------------|-----------------------------------|-----------------|
| 1 | 1 a 4 | `entrega1`: `terraform/` (`versions.tf`, `main.tf`, `variables.tf`, `outputs.tf`, `terraform.tfvars`, `campamentos.tf`, `inventario.tf`, `inventario.tftpl`, `campamento/Dockerfile`, `.terraform.lock.hcl`), `ansible/ansible.cfg`, `.gitignore` | 1e, 1f, 2c, 2d, 2e, 3a, 3f, 4b, 4c, 4d, 4e | La versión de Debian de cada campamento, obtenida desde el nodo de control |
| 2 | 5 a 11 | `entrega2`: `ansible/` (`group_vars/campamentos.yml`, `templates/`, `tripulacion.yml`, `soporte-vital.yml`, `telemetria.yml`, `bitacora-rota.yml`, `bitacora.yml`, `site.yml`), `desplegar.sh`, `README.md` | 5c, 6d, 7c, 8a, 8b, 9a, 9b, 9c, 10a, 10c, 10e | Los grupos a los que pertenece `ana` en cada campamento |

**Cómo se califica:** la actividad vale 10 puntos (5 por entrega, sumando los puntos de cada pregunta). Se valoran los apartados realizados aunque la entrega esté incompleta; una entrega vacía o sin desarrollo evaluable no aporta evidencia.

# Parte 1: el convoy aterriza (Terraform)

## Pregunta 1 — La baliza de aterrizaje *(1 punto)*

Lo primero que hace el convoy es plantar una baliza para que el resto de naves sepan dónde aterrizar.

a) Crea el repositorio Git `convoy-marte` y, dentro, la carpeta `terraform/`. En `terraform/versions.tf` declara que vas a usar el proveedor de Docker de **kreuzwerker**. Busca su página en el *Registry* de Terraform para saber cómo se escribe su origen (`source`) y fija la versión mayor que indique.

b) En `terraform/main.tf` describe tres recursos: una red Docker llamada `red-marte`, la imagen `nginx:alpine` y un contenedor llamado `baliza` que use esa imagen, esté conectado a la red y publique su puerto 80 en el puerto 8000 de tu equipo.

c) Prepara la carpeta con `terraform init`, deja el código bien formateado con `terraform fmt`, comprueba que es válido con `terraform validate` y revisa qué va a hacer con `terraform plan`. Después, créalo con `terraform apply`. Copia la línea `Plan:` y la línea `Apply complete!`.

d) Comprueba que la baliza responde en `http://localhost:8000` y muestra la lista de recursos que Terraform tiene registrados en su estado (pista: `terraform state`).

e) Ejecuta `terraform apply` otra vez. Explica qué ocurre y por qué Terraform no crea un segundo contenedor.

f) `terraform init` ha creado el fichero `.terraform.lock.hcl` y la carpeta `.terraform/`. Explica qué guarda cada uno y cuál de los dos debe subirse a Git.

## Pregunta 2 — Parámetros de la misión *(1 punto)*

El nombre de la misión y el puerto de la baliza no deberían estar escritos a fuego en el código.

a) Crea `terraform/variables.tf` con dos variables documentadas (`description`) y con tipo:

- `mision`, de texto, con valor por defecto `ares`.
- `baliza_puerto`, numérica, con valor por defecto `8000` y una **validación** que solo admita puertos entre 1024 y 65535, con un mensaje de error en español.

Usa `mision` como prefijo de los nombres de la red y de la baliza (`ares-red`, `ares-baliza`) y `baliza_puerto` como puerto publicado.

b) Crea `terraform/outputs.tf` con una salida `url_baliza` que muestre la dirección completa de la baliza.

c) Ejecuta `terraform plan`. Indica qué recursos va a sustituir Terraform y qué cambio concreto obliga a sustituir cada uno. Después aplica los cambios.

d) Crea el fichero `terraform/terraform.tfvars` para que la baliza use el puerto 80. Ejecuta `terraform plan`, copia el error y explica qué lo ha detenido y en qué momento.

e) Cambia el puerto a 8088. Antes de aplicar, explica qué significan en el plan los símbolos `+`, `-`, `~` y `-/+`. Aplica y muestra el valor de la salida `url_baliza`.

## Pregunta 3 — Los campamentos *(1,5 puntos)*

Cada campamento es un contenedor Debian al que se entra por SSH, solo con clave.

**Preparación:** crea `terraform/campamento/Dockerfile` con este contenido. Es la imagen de la que saldrán todos los campamentos:

```dockerfile
FROM debian:trixie-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends openssh-server sudo python3 \
 && rm -rf /var/lib/apt/lists/* \
 && mkdir -p /run/sshd

# Cuenta con la que entra Ansible: sudo sin contraseña y sin contraseña propia
RUN useradd -m -s /bin/bash admin \
 && echo "admin ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/admin \
 && chmod 0440 /etc/sudoers.d/admin \
 && install -d -m 0700 -o admin -g admin /home/admin/.ssh

# Solo se entra con clave: ni contraseñas ni root
RUN printf 'PasswordAuthentication no\nPermitRootLogin no\n' > /etc/ssh/sshd_config.d/marte.conf

EXPOSE 22
CMD ["/usr/sbin/sshd", "-D", "-e"]
```

a) Lee el `Dockerfile` y explica qué servicio arranca el contenedor, cómo entra la cuenta `admin` si no tiene contraseña y qué impide la línea del fichero `marte.conf`.

b) Añade a `versions.tf` los proveedores `hashicorp/tls` y `hashicorp/local`. En un fichero nuevo, `terraform/campamentos.tf`, haz que Terraform genere un par de claves **ED25519** y guarde la clave privada en `claves/convoy` (en la raíz del repositorio) con permisos `0600`, sin que su contenido aparezca en la salida de Terraform.

c) En el mismo fichero:

- Construye la imagen de los campamentos a partir de la carpeta `campamento/`, con el nombre `ares-campamento:1.0` (usa la variable `mision`).
- Añade la variable `numero_campamentos` (por defecto, 2).
- Crea tantos contenedores como diga esa variable, **con un solo recurso**. Cada uno se llama y tiene como nombre de equipo `ares-campamento-1`, `ares-campamento-2`…, está en la red de la misión y publica su puerto 22 en el 2201, 2202… de tu equipo.
- Al crear cada contenedor, copia la clave pública a `/home/admin/.ssh/authorized_keys` (pista: el bloque `upload` del recurso de contenedor).

d) Añade la salida `campamentos`, que muestre el puerto SSH de cada campamento como un mapa `nombre → puerto`. Aplica los cambios y copia esa salida.

e) Entra por SSH en `ares-campamento-1` con la clave del convoy y demuestra que la cuenta `admin` puede actuar como `root`. Después, demuestra que sin esa clave no se puede entrar.

f) Busca en qué otro fichero de tu equipo ha quedado guardada la clave privada, además de `claves/convoy`. Crea el `.gitignore` del repositorio para que no se suba ningún secreto ni ningún fichero que Terraform genera o descarga. Explica qué protege SSH en la comunicación con los campamentos y qué ventaja tiene entrar con clave frente a hacerlo con contraseña.

## Pregunta 4 — Terraform le pasa el testigo a Ansible *(1,5 puntos)*

Terraform sabe qué campamentos existen y en qué puerto escucha cada uno; Ansible necesita saberlo para entrar en ellos. Haz que Terraform escriba el inventario de Ansible.

a) Crea la plantilla `terraform/inventario.tftpl` y, en `terraform/inventario.tf`, un recurso que la rellene y la guarde como `ansible/inventory.ini`. El inventario debe tener un grupo `campamentos` con cada campamento, su dirección y su puerto, y, como variables del grupo, el usuario `admin`, la ruta **absoluta** de la clave del convoy y el intérprete `/usr/bin/python3`. Pista: la función `templatefile` y la directiva `%{ for }` de las plantillas de Terraform.

b) Crea `ansible/ansible.cfg` para que no haga falta indicar el inventario en cada orden y para que Ansible no se detenga por la huella SSH de los campamentos. Explica por qué en esta colonia esa huella cambia a menudo y qué riesgo tendría desactivar esa comprobación en servidores reales.

c) Muestra el inventario como un árbol de grupos y comprueba que Ansible puede trabajar con todos los campamentos. Explica en qué se diferencia esta comprobación del `ping` de red.

d) Sin escribir ningún playbook:

- Averigua la distribución y la versión de sistema de cada campamento.
- Instala el paquete `nano` en todos los campamentos.

Repite la instalación y explica qué cambia en la salida y qué propiedad de Ansible lo provoca.

e) Explica con tus palabras qué parte del trabajo ha hecho Terraform y qué parte va a hacer Ansible a partir de ahora. ¿Por qué no se usa una sola herramienta para todo?

**Evidencia final de la entrega 1:** muestra, desde el nodo de control, la versión de Debian de cada campamento.

# Parte 2: habitar los campamentos (Ansible)

## Pregunta 5 — La tripulación *(1 punto)*

Los campamentos ya están en pie. Ahora llega la tripulación, y alguien se ha colado en el convoy.

**Preparación:** desde la carpeta `ansible/`, crea en todos los campamentos la cuenta del polizón. Tendrás que eliminarla después:

```bash
ansible campamentos -b -m ansible.builtin.user -a "name=polizon"
```

Crea `ansible/group_vars/campamentos.yml` con una lista `tripulantes`. Cada tripulante tiene nombre de cuenta, comentario y lista de grupos:

| Cuenta | Comentario | Grupos |
|--------|------------|--------|
| `ana` | Ana Pérez, comandante | `tripulacion`, `sudo` |
| `bruno` | Bruno Díaz, ingeniero | `tripulacion` |
| `carla` | Carla Ruiz, botánica | `tripulacion` |

Crea el playbook `ansible/tripulacion.yml` que, en todos los campamentos y con elevación de privilegios:

- Cree el grupo `tripulacion`.
- Cree todas las cuentas de la lista con **una sola tarea**, con shell `/bin/bash`, directorio personal y sus grupos, **sin perder los grupos que la cuenta ya tuviera**.
- Expulse al polizón junto con su directorio personal.

a) Ejecuta el playbook dos veces y copia el `PLAY RECAP` de cada ejecución.

b) Demuestra que `ana` puede administrar todos los campamentos y que el polizón ya no existe en ninguno.

c) Explica qué pasaría con los grupos de una cuenta que ya existía si quitaras el parámetro que conserva sus grupos.

## Pregunta 6 — Soporte vital *(1,25 puntos)*

Cada campamento publica un panel de soporte vital con su nombre y su tripulación.

::: nota
Los campamentos son contenedores sin `systemd`. El módulo `ansible.builtin.service` funciona igualmente: detecta que no hay `systemd` y usa los scripts de `/etc/init.d/`.
:::

a) Añade a `group_vars/campamentos.yml` las variables `soporte_titulo` («Soporte vital»), `soporte_puerto` (80) y `soporte_directorio` (`/var/www/soporte`). Crea la carpeta `ansible/templates/` con dos plantillas Jinja2:

- `index.html.j2`: página cuyo título y cabecera muestran `soporte_titulo` y el nombre del campamento, con la distribución y su versión (*facts*) y la lista de la tripulación recorrida con un bucle `for`.
- `soporte.conf.j2`: un bloque `server` de nginx que escucha en `soporte_puerto` como servidor por defecto y sirve `soporte_directorio`.

b) Crea `ansible/soporte-vital.yml`, que instale nginx (sin paquetes recomendados), cree el directorio del panel, quite el sitio por defecto de nginx, despliegue **las dos plantillas con una sola tarea** y deje nginx en marcha. Cualquier cambio en la configuración debe recargar nginx mediante un *handler*, y el playbook debe terminar comprobando que el panel de cada campamento responde y contiene el nombre de ese campamento. Ejecútalo dos veces y copia los dos `PLAY RECAP`.

c) Cambia `soporte_puerto` a 8081, ejecuta el playbook y demuestra que el *handler* se ha ejecutado. Vuelve a dejarlo en 80 y ejecútalo otra vez. Los campamentos no tienen `curl`: consigue desde el nodo de control el contenido del panel de `ares-campamento-1` y copia su línea `<h1>`.

d) Explica por qué el *handler* se ejecuta una sola vez aunque cambien varias tareas, cuándo se ejecuta normalmente y qué tuviste que hacer para que la comprobación final no fallara.

## Pregunta 7 — Telemetría *(0,5 puntos)*

Los campamentos deben registrar su telemetría cada cinco minutos.

Crea `ansible/telemetria.yml`, que instale y deje en marcha `cron` en todos los campamentos y programe, para `root`, una tarea llamada «Registrar telemetría» que cada cinco minutos añada al fichero `/var/log/telemetria.log` la fecha y la hora (en formato `AAAA-MM-DD hh:mm:ss`) seguidas de la salida de `uptime`.

::: aviso
Dos trampas. En una línea de `crontab`, el carácter `%` tiene un significado especial. Además, dentro de un contenedor, `cron` no puede abrir la sesión de la tarea por el módulo PAM `pam_loginuid`: el playbook debe desactivar esa línea en `/etc/pam.d/cron` sin romper la idempotencia.
:::

a) Ejecuta el playbook dos veces y comprueba que la segunda no cambia nada.

b) Muestra la tabla de `cron` de `root` en `ares-campamento-2`.

c) Espera al menos cinco minutos y demuestra que la telemetría se está registrando en todos los campamentos. Explica cómo resolviste el problema del carácter `%`.

## Pregunta 8 — La bitácora del convoy anterior *(0,75 puntos)*

Un convoy anterior dejó este playbook, `ansible/bitacora-rota.yml`, que nunca llegó a funcionar. Cópialo tal cual en tu repositorio:

```yaml
---
- name: Bitácora del convoy
  hosts: campamento
  become: true
  vars:
    bitacora: /var/log/bitacora.log
  tasks:
    - name: Crear la bitácora
      ansible.builtin.copy:
        dest: "{{ bitacora }}"
        content: "Llegada del convoy a {{ inventory_hostname }}\n"
       mode: "0640"

    - name: Instalar htop
      ansible.builtin.apt:
        nombre: htop
        state: present

    - name: Anotar el sol de llegada
      ansible.builtin.lineinfile:
        path: "{{ bitacora }}"
        line: "Sol {{ sol_llegada }}: campamento operativo"
```

a) Copia el fichero como `ansible/bitacora.yml` y arréglalo **de error en error**: usa las herramientas de Ansible para encontrar primero los errores de sintaxis y después los de ejecución. Para cada error, copia el mensaje, explica qué significa y cómo lo has corregido. El convoy llegó el sol 1. No modifiques `bitacora-rota.yml`.

b) Cuando funcione, ejecútalo dos veces. Hay un fallo que no da ningún error: encuéntralo, explica por qué ocurre y corrígelo hasta que la segunda ejecución no cambie nada.

## Pregunta 9 — Ampliar el asentamiento *(0,5 puntos)*

Llega el resto de la expedición: hacen falta cuatro campamentos.

**Preparación:** crea `ansible/site.yml`, que primero espere a que todos los campamentos acepten conexiones (como mucho, 60 segundos) y después importe, por este orden, `tripulacion.yml`, `soporte-vital.yml`, `telemetria.yml` y `bitacora.yml`.

a) Consigue cuatro campamentos **cambiando un solo valor** en tu código. Antes de aplicar, indica qué va a crear, cambiar o destruir Terraform y por qué afecta al inventario.

b) Aplica los cambios y deja los cuatro campamentos configurados con una sola orden de Ansible. Copia el `PLAY RECAP` y explica por qué unos campamentos tienen cambios y otros no.

c) Sin aplicarlo, averigua qué pasaría si redujeras la colonia a tres campamentos: qué campamento desaparecería y por qué ese y no otro. Deja la colonia en cuatro campamentos.

## Pregunta 10 — Tormenta de polvo *(0,75 puntos)*

Una tormenta de polvo arrasa uno de los campamentos.

**Preparación:** simula la tormenta:

```bash
docker rm -f ares-campamento-2
```

a) Sin cambiar nada, averigua qué ha notado Terraform y qué propone hacer.

b) Escribe en la raíz del repositorio el script `desplegar.sh`, que deje la colonia completa (infraestructura y configuración) con una sola orden. Debe funcionar se lance desde la carpeta que se lance, no debe pedir confirmación y debe detenerse en el primer error.

c) Ejecútalo. Copia el `PLAY RECAP` y explica qué ha tenido que hacer Ansible en el campamento reconstruido y por qué.

d) Destruye **toda** la colonia y vuelve a levantarla desde cero con tu script, midiendo cuánto tarda. Después, ejecuta el script otra vez y demuestra que no cambia nada.

e) Compara este procedimiento con reconstruir a mano un campamento y explica qué ventajas tiene describir la infraestructura como código.

## Pregunta 11 — El cuaderno de bitácora de la colonia *(0,25 puntos)*

La colonia ha sobrevivido a su primera tormenta. Antes de que llegue el siguiente convoy, deja escrito todo lo necesario para que otra persona pueda mantenerla sin preguntarte.

a) Escribe `README.md` en la raíz del repositorio con: propósito, requisitos (con versiones), estructura de carpetas, cómo desplegar, ampliar y destruir la colonia, las variables principales y qué ficheros no se suben a Git y por qué.

b) Añade al principio de cada playbook y de `desplegar.sh` un comentario con lo que hace y cómo se ejecuta.

**Evidencia final de la entrega 2:** muestra los grupos a los que pertenece `ana` en cada campamento.
