---
titulo: "La gira de la Garnier · Fase 2: configuración"
licencia: CC-BY-NC-SA-4.0
tipo: caso
horas: 10
resumen: Ansible crea las cuentas y grupos, publica una página por servidor con plantillas y handlers, programa una tarea con registro, reutiliza un rol de Galaxy y cifra los secretos con Vault.
---

:::nota[Fase 2 de 4]
Parte del encargo [[gira-garnier|La gira de la Garnier]]. Esta fase la **lidera un miembro**; las respuestas y evidencias van en `docs/fase2.md`. Anterior: [[gira-garnier-fase1|Fase 1 · Infraestructura]].
:::

**Punto de partida:** los cuatro servidores de la fase 1 en marcha y respondiendo a Ansible.

**Punto de llegada:** un `ansible/site.yml` que deja los cuatro servidores configurados (cuentas, servicio web, tarea programada, Git y secretos) y que, ejecutado por segunda vez, termina con `changed=0` en todos.

Usad siempre el nombre completo de los módulos (`ansible.builtin.user`, no `user`). Cada playbook empieza con un comentario que dice qué hace y cómo se ejecuta.

# Conceptos

## 2.1 — Leer antes de ejecutar

Un compañero propone este playbook para crear la cuenta de María:

```yaml
- name: Cuenta de María
  hosts: secciones
  become: true
  tasks:
    - name: Crear a María
      ansible.builtin.shell: useradd -m -G cuerdas maria
```

a) ¿Qué ocurre la **primera** vez que se ejecuta? ¿Y la **segunda**? Justificadlo.

b) Reescribidlo para que sea idempotente y explicad qué significa eso con el `PLAY RECAP` de dos ejecuciones seguidas.

Y este fragmento de Terraform:

```hcl
resource "docker_container" "nodo" {
  count = length(var.secciones)
  name  = "garnier-${var.secciones[count.index]}"
  # ...
}
```

c) Si `secciones` pasa de `["cuerdas", "madera", "metales", "percusion"]` a `["madera", "metales", "percusion"]` (se quita la primera), ¿qué propondrá el plan? ¿Qué pasaría con lo que hubiera configurado Ansible dentro de esos servidores? Comprobadlo con `terraform plan` (sin aplicarlo) y pegad la línea `Plan:`.

# Tareas

## 2.2 — Pasar lista

Antes de configurar nada, hay que saber qué hay. Con **órdenes ad-hoc** (sin playbooks), obtened de los cuatro servidores a la vez:

a) La versión de Debian, usando los *facts*.

b) El espacio libre en `/` y la memoria disponible.

c) Si existe la cuenta `herme` en cada uno.

**Evidencias:** cada orden y su salida. ¿Por qué tiene `herme` una cuenta en servidores recién creados?

## 2.3 — Los músicos *(imprescindible)*

Esta es la plantilla de la orquesta:

| Cuenta | Nombre completo | Grupos |
|---|---|---|
| `maria` | María, violín | `cuerdas` |
| `jay` | Jay, clarinete | `madera` |
| `raul` | Raul, trompeta | `metales` |
| `octavio` | Octavio, timbales | `percusion` |
| `andrea` | Andrea, directora | `director`, `acceso-remoto` |

Escribid `ansible/musicos.yml`. Los datos van en `ansible/group_vars/secciones/vars.yml`, no dentro de las tareas.

a) Cread los grupos `cuerdas`, `madera`, `metales`, `percusion`, `director` y `acceso-remoto`, y las cinco cuentas, con **una sola tarea** para todas las cuentas.

b) La cuenta `herme` no debe existir en ningún servidor, ni su carpeta personal.

c) Los miembros del grupo `director` pueden usar `sudo` (con su contraseña). El fichero de `sudoers` debe **validarse antes** de instalarse: un error ahí deja el servidor sin administración.

d) Solo los miembros de `acceso-remoto` pueden entrar por SSH. Cuidado: Ansible entra como `admin`. Pensad en qué orden tienen que ir las tareas para no quedaros fuera, y haced que el servicio SSH solo se recargue si su configuración cambia.

**Evidencias:** la salida de `id andrea` y de `id maria` en los cuatro servidores, y la de la comprobación de que `herme` no existe.

## 2.4 — Las partituras *(imprescindible)*

Cada servidor publica una página web con **su** partitura: el nombre de su sección, su nombre de máquina, su versión de Debian y la lista de músicos de esa sección.

a) Escribid `ansible/partituras.yml`: instala nginx sin paquetes recomendados, quita el sitio por defecto y despliega con **plantillas Jinja2** la página (en `/srv/partitura`) y la configuración de nginx. Una sola plantilla de página sirve para las cuatro secciones.

b) nginx solo debe recargarse si cambia alguno de esos ficheros.

c) La última tarea comprueba **desde la estación** que la página de cada servidor responde y contiene el nombre de su sección. Si no, el playbook falla.

**Evidencias:** la salida de la comprobación y el código HTML que devuelve `garnier-cuerdas`. Ejecutad el playbook dos veces: ¿cuántas veces se recarga nginx en cada una? ¿Por qué?

## 2.5 — El registro del ensayo *(imprescindible)*

Cada minuto, cada servidor apunta en `/var/log/ensayo.log` una línea con la fecha y la hora, su nombre y cuántos músicos tienen carpeta en `/home`.

a) Escribid `ansible/ensayo-diario.yml` para que lo programe con el módulo de Ansible adecuado, no editando `crontab` a mano.

b) Esperad dos minutos y comprobad que el registro crece. Si no crece, el problema no está en vuestra línea de `cron`: investigad qué dice el sistema cuando `cron` intenta ejecutar la tarea dentro de un contenedor (pista: los módulos PAM de `/etc/pam.d/cron`). Corregidlo **también con Ansible**.

c) Documentad la tarea en el `README.md`, en una tabla de tareas programadas: dónde se ejecuta, cuándo, con qué usuario, qué hace y dónde deja el registro.

**Evidencias:** la salida de `crontab -l` de root en un servidor y las dos últimas líneas de `/var/log/ensayo.log` de los cuatro.

## 2.6 — Un arreglo de otro compositor

No hace falta escribir todo desde cero. Instalad Git en los cuatro servidores con un **rol de Ansible Galaxy** mantenido por la comunidad.

a) Elegid el rol y justificad la elección: autor, descargas, fecha de la última versión.

b) Declaradlo en `ansible/requirements.yml` con la **versión fijada** e instaladlo desde ese fichero. Los roles descargados no se suben a Git.

c) Leed el `defaults/main.yml` del rol y explicad dos variables que permita cambiar.

d) Aplicadlo con un playbook `ansible/archivo.yml`.

**Evidencias:** `requirements.yml` y la versión de Git en cada servidor.

## 2.7 — La caja fuerte *(imprescindible)*

La directora necesita una contraseña para usar `sudo`, y esa contraseña no puede estar en claro en el repositorio.

a) Guardad la contraseña en `ansible/group_vars/secciones/vault.yml`, cifrado con Ansible Vault. La contraseña de Vault va en `/datos/vault-pass`, con permisos `600`, y `ansible.cfg` la usa sin pedirla.

b) Asignad la contraseña a `andrea` desde `musicos.yml`. La tarea **no debe mostrar** la contraseña en la salida, y una segunda ejecución no debe volver a cambiarla. Si la cambia cada vez, investigad qué hace `password_hash` con la *sal* (*salt*).

c) ¿Cómo comparte el grupo la contraseña de Vault sin subirla al repositorio?

**Evidencias:** las tres primeras líneas de `vault.yml` tal como están en Git, y la prueba de que `andrea` puede usar `sudo` en un servidor con esa contraseña.

## 2.8 — Toda la orquesta a la vez *(imprescindible)*

Escribid `ansible/site.yml`, que espera a que los servidores acepten SSH y después importa, en orden, todos los playbooks de esta fase.

**Evidencias:** el `PLAY RECAP` de dos ejecuciones seguidas de `site.yml`. En la segunda, `changed=0` en los cuatro servidores. Si alguna tarea sale como `changed` cada vez, encontrad por qué y corregidla.

# Al terminar la fase

- La PR de la fase está fusionada en `main`, revisada por otro miembro.
- La hoja de control tiene las filas de esta fase.
- Evidencia final en `docs/fase2.md`, ejecutada en la estación:

```bash
ansible-playbook ansible/site.yml
ansible secciones -a "id andrea"
```

El `PLAY RECAP` debe terminar con `changed=0 ... failed=0` en los cuatro servidores, y `andrea` debe aparecer en los grupos `director` y `acceso-remoto`.

Siguiente: [[gira-garnier-fase3|Fase 3 · Operación]].
