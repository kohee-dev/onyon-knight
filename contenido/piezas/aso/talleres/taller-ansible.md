---
titulo: "Taller 5: Ansible básico"
licencia: CC-BY-NC-SA-4.0
resumen: Inventario, comandos ad-hoc y un primer playbook idempotente contra dos servidores de prueba, desde la estación de control.
---

:::nota[Objetivo]
Dar los primeros pasos con Ansible, siguiendo la teoría de [[ansible-teoria|Automatización con Ansible]]: escribir un inventario, lanzar órdenes a varios servidores a la vez y escribir un playbook que se pueda ejecutar las veces que haga falta sin romper nada. Es el último taller antes del encargo.

**Duración:** unas 4 horas, en clase. **Necesitas:** los talleres [[taller-docker|2]] y [[taller-ssh|3]] hechos (la estación, la imagen `garnier-nodo:taller` y la clave `/datos/claves/taller`).
:::

# 1. Dos servidores de prueba

Desde tu terminal, arranca dos servidores y dales la clave pública del taller 3:

```bash
docker run -d --name prueba-1 --hostname prueba-1 --network garnier garnier-nodo:taller
docker run -d --name prueba-2 --hostname prueba-2 --network garnier garnier-nodo:taller
docker cp estacion:/datos/claves/taller.pub taller.pub
docker cp taller.pub prueba-1:/home/admin/.ssh/authorized_keys
docker cp taller.pub prueba-2:/home/admin/.ssh/authorized_keys
docker exec prueba-1 sh -c "chown admin:admin /home/admin/.ssh/authorized_keys && chmod 600 /home/admin/.ssh/authorized_keys"
docker exec prueba-2 sh -c "chown admin:admin /home/admin/.ssh/authorized_keys && chmod 600 /home/admin/.ssh/authorized_keys"
```

Borra `taller.pub` de tu carpeta. En el encargo, todo esto lo hará Terraform.

# 2. Inventario y `ansible.cfg`

En el repositorio, crea `pruebas/ansible-taller/` con dos ficheros.

**`inventory.ini`**: qué servidores hay, en qué grupos y cómo se entra:

```ini
[pruebas]
prueba-1
prueba-2

[pruebas:vars]
ansible_user=admin
ansible_ssh_private_key_file=/datos/claves/taller
```

**`ansible.cfg`**: opciones para no repetirlas en cada orden:

```ini
[defaults]
inventory = ./inventory.ini
host_key_checking = False
interpreter_python = /usr/bin/python3
```

`host_key_checking = False` es razonable aquí porque los servidores de prueba se destruyen y se recrean con claves de host nuevas (lo viste en el taller 3).

La estación tiene fijada la variable `ANSIBLE_CONFIG` para que, en el encargo, use `ansible/ansible.cfg` aunque la carpeta montada desde Windows tenga permisos `777`. Para el taller, apúntala a esta carpeta:

```bash
docker exec -it estacion bash
cd /repo/pruebas/ansible-taller
export ANSIBLE_CONFIG=$PWD/ansible.cfg
ansible --version | grep "config file"
ansible-inventory --graph
```

# 3. Órdenes ad-hoc: una orden, todos los servidores

```bash
ansible all -m ansible.builtin.ping
```

```text
prueba-1 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
prueba-2 | SUCCESS => {
...
```

`ping` no es el `ping` de red: comprueba que Ansible entra por SSH y que hay Python en el servidor. Prueba también:

| Orden | Qué hace |
|---|---|
| `ansible all -m ansible.builtin.setup -a "filter=ansible_distribution*"` | Lee los *facts*: datos del sistema que Ansible descubre solo |
| `ansible all -a "whoami"` | Ejecuta una orden (módulo `command` por defecto) |
| `ansible all -b -a "whoami"` | La misma, con `sudo` (`-b`, *become*) |
| `ansible prueba-1 -a "df -h /"` | Solo en un servidor |

Ahora intenta instalar un paquete **sin** `-b`:

```bash
ansible all -m ansible.builtin.apt -a "name=tree state=present update_cache=true"
```

Falla con `Permission denied`: instalar paquetes exige privilegios. Repite con `-b` y lánzalo **otra vez**: la segunda dice `SUCCESS` con `"changed": false`. El paquete ya está y Ansible no hace nada. Esa es la **idempotencia**.

:::pregunta[¿Por qué `ansible all -a "whoami"` dice `CHANGED` cada vez que lo ejecutas, aunque no cambie nada, y `apt` no?]
Porque `command` ejecuta una orden cualquiera y Ansible no puede saber si ha cambiado algo, así que siempre informa `CHANGED`. Los módulos específicos como `apt` comprueban el estado antes de actuar y solo informan de un cambio cuando lo hacen. Por eso se prefieren los módulos específicos a `command` o `shell`.
:::

# 4. Tu primer playbook

Un playbook describe **cómo debe quedar** un grupo de servidores. Crea `primer-playbook.yml`:

```yaml
---
# primer-playbook.yml — Instala htop y deja un mensaje de bienvenida en los servidores de prueba.
# Uso: ansible-playbook primer-playbook.yml
- name: Primer playbook de la orquesta
  hosts: pruebas
  become: true
  tasks:
    - name: Instalar htop
      ansible.builtin.apt:
        name: htop
        state: present
        update_cache: true
        cache_valid_time: 3600

    - name: Escribir el mensaje de bienvenida
      ansible.builtin.copy:
        dest: /etc/motd
        content: "Servidor de pruebas de la Orquesta de la Garnier. Gestionado por Ansible.\n"
        mode: "0644"
```

Compruébalo y ejecútalo **dos veces**:

```bash
ansible-playbook primer-playbook.yml --syntax-check
ansible-playbook primer-playbook.yml
ansible-playbook primer-playbook.yml
```

Fíjate en el `PLAY RECAP` de cada una:

```text
prueba-1 : ok=3    changed=2    unreachable=0    failed=0  ...
prueba-1 : ok=3    changed=0    unreachable=0    failed=0  ...
```

La primera vez cambia dos cosas; la segunda, **ninguna**. Un playbook bien escrito siempre termina así: es la prueba de que describe un estado y no una lista de pasos.

:::pregunta[Cambia el texto del mensaje de bienvenida y ejecuta el playbook con `--check --diff`. ¿Qué muestra? ¿Ha cambiado algo en los servidores?]
Muestra la diferencia entre el `/etc/motd` actual y el nuevo (líneas con `-` y `+`) y marca la tarea como `changed`, pero **no cambia nada**: `--check` simula. Es lo que se hace antes de aplicar un cambio en servidores reales.
:::

# Comprueba que lo tienes

Antes de recoger, con los dos servidores en marcha, en la estación y dentro de `pruebas/ansible-taller` con `ANSIBLE_CONFIG` exportada:

```bash
ansible --version | grep "config file"
ansible all -m ansible.builtin.ping
ansible-playbook primer-playbook.yml
ansible pruebas -a "cat /etc/motd"
```

Salida esperada (el orden de los servidores puede variar):

```text
  config file = /repo/pruebas/ansible-taller/ansible.cfg
prueba-1 | SUCCESS => { ... "ping": "pong" }
prueba-2 | SUCCESS => { ... "ping": "pong" }
...
PLAY RECAP *********************************************************************
prueba-1                   : ok=3    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
prueba-2                   : ok=3    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
prueba-1 | CHANGED | rc=0 >>
Servidor de pruebas de la Orquesta de la Garnier. Gestionado por Ansible.
prueba-2 | CHANGED | rc=0 >>
Servidor de pruebas de la Orquesta de la Garnier. Gestionado por Ansible.
```

`changed=0` en el `PLAY RECAP` es lo importante: el playbook ya se había aplicado y no queda nada por hacer.

# Recoger

Desde tu terminal:

```bash
docker rm -f prueba-1 prueba-2
```

Borra la carpeta `pruebas/` del repositorio (o deja que la ignore el `.gitignore`).
