---
titulo: "Automatización de servidores con Ansible"
licencia: CC-BY-NC-SA-4.0
tipo: caso
horas: 9
resumen: Un repositorio Git que automatiza dos nodos con Ansible, de los comandos ad-hoc a un rol con secretos cifrados.
---

::: aviso
Para la realización de esta actividad voy a tener los siguientes supuestos:

+ Manejas la terminal de Linux y SSH con soltura.
+ Cada pregunta se apoya en las anteriores: **no te saltes ninguna**, porque el repositorio se construye paso a paso.
+ Las preguntas van de menos a más dificultad. Si te atascas, **pregunta**.
+ Las explicaciones se redactan con tus propias palabras.
+ Si alguien hace *trampa* o *plagio*, lo sabré.
:::

# Planteamiento

Trabajas como administrador de sistemas y vas a dejar de configurar servidores a mano. Durante la actividad construirás, paso a paso, un repositorio Git con la automatización de dos nodos usando Ansible. Las preguntas van de menos a más dificultad y se entregan en **dos entregas** (preguntas 1 a 5 y preguntas 6 a 10).

Todas las soluciones se escriben en YAML/Ansible. Usa siempre los nombres completos de módulo (por ejemplo, `ansible.builtin.apt`).

::: nota
**Escenario.** Necesitas un nodo de control con `ansible-core` instalado y dos nodos Debian o Ubuntu, `nodo1` y `nodo2`, accesibles por SSH con clave para el usuario `admin`, que puede usar `sudo` sin contraseña. Sustituye las IP por las de tu laboratorio.
:::

# Conocimientos previos

Antes de empezar deberías repasar la teoría de [[ansible-teoria|Automatización con Ansible]]. En concreto, necesitas saber:

- Qué es el **inventario** y cómo se agrupan los nodos.
- Cuándo usar un comando **ad-hoc** y cuándo un **playbook**.
- Qué es la **idempotencia** de un módulo y cómo se lee el `PLAY RECAP`.
- **Variables**, *facts*, bucles (`loop`), condiciones (`when`) y plantillas **Jinja2**.
- **Handlers**, **roles** y **Ansible Vault**.
- Lo básico de **Git**: `commit`, etiquetas (`tag`) y `push`.

# Cómo entregar el trabajo

El trabajo se entrega en **dos partes**: un repositorio Git más un documento por parte. El plazo y el canal de entrega los indicará el profesorado.

Descarga la plantilla de cada entrega, rellénala con tus respuestas y guárdala con el nombre `entregaN_apellido_nombre.docx` (en minúsculas, sin tildes ni espacios; por ejemplo, `entrega1_garcia_lucia.docx`):

- [Plantilla de la entrega 1 (preguntas 1 a 5)](descarga:ansible-entrega1.docx)
- [Plantilla de la entrega 2 (preguntas 6 a 10)](descarga:ansible-entrega2.docx)

**Qué se entrega y cómo:**

- Cada entrega es un `.docx` dentro de la carpeta `entregas/` del repositorio.
- Al terminar cada parte, haz *commit* y marca el estado con una etiqueta Git: `entrega1` o `entrega2`. Después, sube el repositorio con `git push --tags`.
- Entregas por separado: la segunda no sustituye a la primera, y el repositorio debe conservar las dos etiquetas.

**Reglas de la entrega:**

- Una fila por cada apartado (1a, 1b, 2a…). Si un apartado no tiene resultado, escribe `—`.
- Pega las salidas como **texto**, no como capturas de pantalla.
- Las explicaciones se redactan con tus propias palabras.
- Los ficheros de Ansible (`.yml`, `.ini`, `.cfg`, plantillas) van en el repositorio, no dentro del documento.
- Nunca subas la clave de Vault ni ninguna contraseña en claro.

**Qué debe contener cada entrega:**

| Entrega | Preguntas | En el repositorio (etiqueta) | Explicaciones que hay que incluir | Evidencia final |
|---------|-----------|------------------------------|-----------------------------------|-----------------|
| 1 | 1 a 5 | `entrega1`: `inventory.ini`, `ansible.cfg`, `nginx.yml`, `usuarios.yml`, `tareas.yml` | 1e, 1f, 2c, 3c, 3d, 4c, 5c | `ansible servidores -m command -a "id -Gn ana"` |
| 2 | 6 a 10 | `entrega2`: `group_vars/web.yml`, `templates/`, `web.yml`, `original.yml`, `adaptado.yml`, `roles/webserver/`, `site.yml`, `group_vars/db/vault.yml` (cifrado), `secretos.yml`, `.gitignore`, `README.md` | 6d, 6f, 7a, 7b, 8e, 9d, 9e, 10c | `ansible db -b -m command -a "stat -c '%a %U' /etc/aso/db.conf" --ask-vault-pass` |

**Cómo se califica:** la actividad vale 10 puntos (5 por entrega, sumando los puntos de cada pregunta). Se valoran los apartados realizados aunque la entrega esté incompleta; una entrega vacía o sin desarrollo evaluable no aporta evidencia.

# Parte 1: inventario, comandos y primeros playbooks

## Pregunta 1 — Inventario y conectividad *(1 punto)*

a) Crea el repositorio Git `ansible-aso` y, dentro, el fichero `inventory.ini` con tres grupos: `web` (con `nodo1`), `db` (con `nodo2`) y `servidores`, que debe contener a los otros dos grupos. Todos los nodos se gestionan con `ansible_user=admin`.

b) Crea `ansible.cfg` en el repositorio para que no haga falta usar `-i` en cada comando.

c) Muestra la estructura del inventario con `ansible-inventory`.

d) Comprueba la conectividad con el módulo `ping` sobre el grupo `servidores`.

e) Obtén, con el módulo `setup` y su parámetro `filter`, la distribución y la versión de cada nodo. Indica si los nodos son homogéneos.

f) Explica en una o dos frases qué comprueba el módulo `ping` de Ansible y en qué se diferencia del comando `ping` de red.

## Pregunta 2 — Comandos ad-hoc *(1 punto)*

Sin escribir ningún playbook, usa **comandos ad-hoc** sobre el grupo `servidores`:

a) Asegura que el paquete `openssh-server` está instalado (módulo `apt`; necesitarás elevar privilegios con `-b`).

b) Asegura que el servicio `ssh` está iniciado y habilitado en el arranque (módulo `service`).

c) Repite a) y b). Explica qué cambia en la salida respecto a la primera vez y qué propiedad de los módulos de Ansible lo provoca.

d) Comprueba con un comando ad-hoc que el puerto 22 está a la escucha en ambos nodos (pista: `ss -tln` con el módulo `command`).

## Pregunta 3 — Tu primer playbook: nginx *(1 punto)*

Crea el playbook `nginx.yml` para el grupo `web` con elevación de privilegios y estas tareas, todas con nombre descriptivo:

1. Instalar `nginx`.
2. Dejar el servicio `nginx` iniciado y habilitado.
3. Comprobar con el módulo `uri` que `http://localhost` responde con código 200.

a) Comprueba la sintaxis con `--syntax-check` y simula la ejecución con `--check`.

b) Ejecútalo y copia el bloque `PLAY RECAP`.

c) Ejecútalo una segunda vez. Explica qué valor de `changed` aparece y por qué.

d) Explica qué ocurriría con el resto del playbook si la tarea `uri` fallase.

## Pregunta 4 — Usuarios con una sola tarea *(1,5 puntos)*

**Preparación:** crea una cuenta de prueba que luego tendrás que eliminar:

```bash
ansible servidores -b -m ansible.builtin.user -a "name=temporal"
```

Crea el playbook `usuarios.yml` para el grupo `servidores` con elevación de privilegios que:

- Cree el grupo `operadores`.
- Cree las cuentas `ana` (comentario «Ana Pérez»), `luis` («Luis Gómez») y `marta` («Marta Ruiz») con **una sola tarea** que recorra una lista definida en una variable `usuarios`. Cada cuenta tendrá shell `/bin/bash`, directorio personal y pertenecerá al grupo `operadores` **sin perder los demás grupos que ya tuviera**.
- Elimine la cuenta `temporal` junto con su directorio personal.

a) Ejecuta el playbook dos veces y copia el `PLAY RECAP` de cada ejecución.

b) Comprueba con un comando ad-hoc que `ana` pertenece a `operadores` en los dos nodos.

c) Explica qué pasaría con los grupos secundarios de una cuenta existente si omitieras el parámetro que conserva los grupos que ya tenía.

## Pregunta 5 — Tareas programadas con cron *(0,5 puntos)*

Crea el playbook `tareas.yml` para el grupo `db` con elevación de privilegios. Debe programar, con el módulo `cron`, una tarea llamada «Registrar espacio en disco» que, a las 03:30 de lunes a viernes, añada la salida de `df -h /` al fichero `/var/log/espacio_disco.log` con el usuario `root`.

a) Ejecútalo dos veces y comprueba que la segunda no cambia nada.

b) Comprueba con un comando ad-hoc el contenido de la tabla de `cron` de `root` en `nodo2`.

c) Cambia la hora a las 04:00 **sin tocar el nombre de la tarea** y vuelve a ejecutar. Explica por qué se modifica la línea en lugar de añadir otra.

# Parte 2: plantillas, roles y secretos

## Pregunta 6 — Un despliegue web configurable *(1,5 puntos)*

Crea un despliegue web configurable. Puedes partir de `nginx.yml`.

a) Crea `group_vars/web.yml` con las variables `web_titulo`, `web_puerto` (8080), `web_directorio` (`/var/www/aso`) y `web_servicios` (una lista con `nginx` y `ssh`).

b) Crea la carpeta `templates/` con dos plantillas Jinja2:

- `index.html.j2`: página HTML cuyo título y cabecera usan `web_titulo`, que muestra el nombre del nodo y la distribución (un *fact*) y que recorre `web_servicios` con un bucle `for` para mostrarlos en una lista.
- `aso.conf.j2`: fichero de configuración de nginx con un bloque `server` que escucha en `web_puerto` y sirve `web_directorio`.

c) Crea `web.yml` para el grupo `web` que:

- Actualice la caché de `apt` **solo si** la familia del sistema es Debian (`when`).
- Instale `nginx`, cree `web_directorio` y despliegue **las dos plantillas con una sola tarea con bucle**; las plantillas se copian a `web_directorio/index.html` y a `/etc/nginx/conf.d/aso.conf`.
- Deje `nginx` iniciado y habilitado.
- Defina un **handler** «Recargar nginx» que se active solo cuando cambie alguna plantilla.
- Fuerce la ejecución de los handlers pendientes antes de la comprobación (pista: `ansible.builtin.meta` con `flush_handlers`).
- Compruebe con `uri` que la web responde en el puerto `web_puerto`.

d) Ejecútalo dos veces. Indica qué ocurre con el handler en la segunda.

e) Cambia `web_puerto` a 8081, ejecuta de nuevo y comprueba que el handler se ejecuta.

f) Explica por qué el handler se ejecuta una sola vez aunque cambien las dos plantillas, en qué momento se ejecuta normalmente y qué cambia al usar `flush_handlers`.

## Pregunta 7 — Arreglar el playbook de un compañero *(1 punto)*

Un compañero te deja este playbook, `original.yml`, y te pide que lo «arregles»:

```yaml
---
- hosts: web
  tasks:
    - shell: apt-get update && apt-get install -y nginx
      become: true
    - shell: systemctl start nginx
      become: true
    - shell: echo "Servidor de pruebas" > /var/www/html/index.html
      become: true
    - shell: useradd -m webadmin
      become: true
      ignore_errors: true
```

a) Ejecútalo dos veces sobre `nodo1` y anota el `PLAY RECAP` de cada vez.

b) Enumera al menos tres problemas del playbook, justificando cada uno.

c) Adáptalo en un nuevo fichero `adaptado.yml` que haga lo mismo corrigiendo los problemas: módulos de Ansible en lugar de `shell`, elevación de privilegios a nivel de *play*, nombres de tareas, servicio habilitado en el arranque y el mensaje de la página en una variable `web_mensaje`.

d) Ejecuta `adaptado.yml` con `--check --diff` y después de verdad. Comprueba que una segunda ejecución no cambia nada.

## Pregunta 8 — Un rol reutilizable *(1 punto)*

Convierte tu despliegue web en un **rol** reutilizable.

a) Crea el rol `webserver` en `roles/` con `ansible-galaxy role init`.

b) Mueve al rol las tareas, el handler y las plantillas de la pregunta 6 y deja sus variables con valor por defecto en `defaults/main.yml`.

c) Crea `site.yml`, que aplique el rol `webserver` al grupo `web` y sobrescriba `web_titulo` con un valor distinto.

d) Consulta con `ansible-doc ansible.builtin.template` qué parámetro guarda una copia de seguridad del fichero destino antes de sobrescribirlo y úsalo en la tarea que despliega las plantillas.

e) Ejecuta `site.yml`. Si `web_puerto` está definido tanto en `defaults/main.yml` como en `group_vars/web.yml`, indica cuál de los dos valores se aplica y por qué.

## Pregunta 9 — Secretos con Vault *(1 punto)*

La base de datos necesita una contraseña que no puede quedar en claro en el repositorio.

a) Crea `group_vars/db/vault.yml` con la variable `vault_db_password` y cífralo con `ansible-vault`. Usa un fichero `.vault_pass` con la clave de cifrado y añádelo a `.gitignore`.

b) Demuestra que el fichero cifrado no es legible (muestra su primera línea) y que se puede ver su contenido con la clave correcta.

c) Crea `secretos.yml` para el grupo `db` con elevación de privilegios, que cree el directorio `/etc/aso` (modo `0750`) y escriba en `/etc/aso/db.conf` la línea `password=<valor de la variable>` con propietario `root` y modo `0600`. La tarea que usa la contraseña no debe mostrarla en la salida.

d) Ejecútalo con `--vault-password-file .vault_pass`. Después, ejecútalo sin la clave y copia el mensaje de error.

e) Explica qué protege Vault y qué no protege. Indica además qué mecanismo cifra la información que viaja entre el nodo de control y los nodos.

:::aviso
Al estar `group_vars/db/vault.yml` cifrado, **cualquier** comando de Ansible que afecte a `nodo2` necesita desde ahora la clave de Vault (`--vault-password-file .vault_pass` o `--ask-vault-pass`).
:::

## Pregunta 10 — Documentar el repositorio *(0,5 puntos)*

Documenta el repositorio para que otra persona pueda usarlo sin preguntarte.

a) Escribe `README.md` con: propósito del repositorio, requisitos, estructura de ficheros, el comando exacto para ejecutar cada playbook, las variables principales y cómo se gestiona Vault (sin incluir ninguna contraseña).

b) Añade al principio de cada playbook un comentario con lo que hace y cómo se ejecuta.

c) Comprueba la sintaxis de todos los playbooks del repositorio con un único bucle de shell y copia la salida.
