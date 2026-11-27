---
titulo: "Taller 3: SSH aplicado"
licencia: CC-BY-NC-SA-4.0
resumen: Construir la imagen de los servidores, entrar en uno desde la estación de control con clave, verificar su identidad y simplificar el acceso con ~/.ssh/config.
---

:::nota[Objetivo]
Poner en práctica lo que explica la teoría de [[acceso-remoto|Acceso y administración remota]] en el entorno del encargo: construir la imagen de los servidores de la orquesta y entrar en uno desde la estación de control **solo con clave**, comprobando antes su identidad.

**Duración:** unas 2 horas, en clase. **Necesitas:** el [[taller-docker|taller 2]] hecho (la estación en marcha, la red `garnier` y el volumen `garnier-datos`).
:::

# 1. La imagen de los servidores

Todos los servidores de la orquesta salen de la misma imagen: Debian con un servidor SSH. Crea en el repositorio `terraform/nodo/Dockerfile`:

```dockerfile
FROM debian:trixie-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends openssh-server sudo python3 \
 && rm -rf /var/lib/apt/lists/* \
 && mkdir -p /run/sshd \
 && rm -f /etc/ssh/ssh_host_*

# Cuenta con la que entra Ansible: sudo sin contraseña y sin contraseña propia
RUN useradd -m -s /bin/bash admin \
 && echo "admin ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/admin \
 && chmod 0440 /etc/sudoers.d/admin \
 && install -d -m 0700 -o admin -g admin /home/admin/.ssh

# Cuenta que dejó Herme en la imagen original de la orquesta
RUN useradd -m -s /bin/bash -c "Herme" herme

# Solo se entra con clave: ni contraseñas ni root
RUN printf 'PasswordAuthentication no\nPermitRootLogin no\n' > /etc/ssh/sshd_config.d/garnier.conf

EXPOSE 22
# Cada nodo genera sus propias claves de host al arrancar: si fueran parte de la imagen,
# todos los servidores tendrían la misma identidad SSH.
CMD ["/bin/sh", "-c", "ssh-keygen -A && exec /usr/sbin/sshd -D -e"]
```

Fíjate en tres decisiones de seguridad:

- `PasswordAuthentication no` y `PermitRootLogin no`: solo se entra con clave y nunca como `root`.
- La cuenta `admin` puede usar `sudo` sin contraseña porque no tiene contraseña. Solo se puede usar con la clave.
- Se borran las **claves de host** que el paquete genera al instalarse y se crean al arrancar cada contenedor. Si se quedaran en la imagen, todos los servidores tendrían **la misma identidad**. Robar la clave de uno permitiría hacerse pasar por todos.

Constrúyela y arranca un servidor de prueba en la red `garnier`, **sin publicar ningún puerto**:

```bash
docker build -t garnier-nodo:taller terraform/nodo
docker run -d --name prueba-ssh --hostname prueba-ssh --network garnier garnier-nodo:taller
```

# 2. Un par de claves para la estación

Entra en la estación (`docker exec -it estacion bash`). Las órdenes de los apartados 2 a 5 se ejecutan **dentro** de ella.

```bash
mkdir -p /datos/claves
ssh-keygen -t ed25519 -C "taller-ssh" -f /datos/claves/taller
```

Deja la frase de paso vacía (pulsa Intro dos veces): una clave que va a usar un programa no puede pedir contraseña. Por eso **es tan importante dónde se guarda**: en el volumen, con permisos `600`, y nunca en el repositorio.

```bash
ls -l /datos/claves/
```

`taller` es la clave privada (`-rw-------`). `taller.pub` es la pública, la que se reparte.

# 3. Instalar la clave pública en el servidor

El servidor no acepta contraseñas, así que no sirve `ssh-copy-id`. Desde **fuera** de la estación (en tu terminal), copia la clave pública dentro del servidor:

```bash
docker cp estacion:/datos/claves/taller.pub taller.pub
docker cp taller.pub prueba-ssh:/home/admin/.ssh/authorized_keys
docker exec prueba-ssh chown admin:admin /home/admin/.ssh/authorized_keys
docker exec prueba-ssh chmod 600 /home/admin/.ssh/authorized_keys
```

Se copia con `docker cp` y no con `docker exec ... cat > taller.pub` a propósito: en el PowerShell que trae Windows, `>` guarda el fichero en UTF-16 y con finales de línea de Windows, y SSH no reconoce la clave.

Borra después `taller.pub` de tu carpeta: aunque una clave pública no es secreta, no es parte del repositorio.

En el encargo esto lo hará **Terraform** al crear cada servidor. Hoy lo haces a mano para ver qué ocurre por debajo.

# 4. ¿Es de verdad el servidor que crees? `known_hosts`

Vuelve a la estación y conéctate:

```bash
ssh -i /datos/claves/taller admin@prueba-ssh
```

SSH muestra la **huella** de la clave del servidor y pregunta si confías en ella. Antes de decir que sí, compruébala por otro canal. Desde tu terminal, fuera de la estación:

```bash
docker exec prueba-ssh ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
```

Si las huellas coinciden, escribe `yes`: SSH la guarda en `~/.ssh/known_hosts` y no volverá a preguntar mientras no cambie. Sal con `exit`.

Un script o un playbook no puede contestar a esa pregunta. Por eso, en automatización, las huellas se registran por adelantado:

```bash
ssh-keyscan -t ed25519 prueba-ssh >> ~/.ssh/known_hosts
ssh-keygen -lf ~/.ssh/known_hosts
```

:::pregunta[Destruye `prueba-ssh` y créalo de nuevo con la misma orden `docker run`. Al conectarte, SSH muestra un aviso enorme: `REMOTE HOST IDENTIFICATION HAS CHANGED`. ¿Por qué? ¿Qué harías en un laboratorio y qué harías en producción?]
El contenedor nuevo ha generado **otras claves de host** al arrancar, así que su huella no coincide con la guardada en `known_hosts`. SSH no puede distinguir eso de un ataque *man in the middle*. En el laboratorio, donde los servidores se recrean continuamente, se borra la entrada antigua (`ssh-keygen -R prueba-ssh`) o se desactiva la comprobación (`host_key_checking = False` en Ansible). En producción, se investiga antes de conectar: un cambio de huella inesperado puede ser un ataque.
:::

Si has hecho la prueba, el servidor nuevo tampoco tiene tu clave pública: repite el apartado 3 y borra la huella antigua con `ssh-keygen -R prueba-ssh` antes de seguir.

# 5. Simplificar con `~/.ssh/config`

Escribir `-i /datos/claves/taller admin@...` cada vez es incómodo. Crea en la estación `~/.ssh/config`:

```text
Host prueba-ssh garnier-*
    User admin
    IdentityFile /datos/claves/taller
    IdentitiesOnly yes
```

```bash
chmod 600 ~/.ssh/config
ssh prueba-ssh 'hostname; sudo -n whoami'
```

El patrón `garnier-*` servirá para todos los servidores del encargo. Este fichero vive en la estación y se pierde si la recreas: en el encargo, Ansible tomará estos datos del inventario.

# Comprueba que lo tienes

Antes de recoger, con `prueba-ssh` en marcha y desde la estación:

```bash
ssh prueba-ssh 'hostname; sudo -n whoami'
stat -c '%a %n' /datos/claves/taller
ssh -o PubkeyAuthentication=no prueba-ssh true
ssh root@prueba-ssh true
```

Salida esperada:

```text
prueba-ssh
root
600 /datos/claves/taller
admin@prueba-ssh: Permission denied (publickey).
root@prueba-ssh: Permission denied (publickey).
```

Las dos últimas líneas demuestran que el servidor **rechaza** entrar sin clave y como `root`. Si alguna de las dos te deja entrar, revisa `/etc/ssh/sshd_config.d/garnier.conf` en la imagen.

# Recoger

Desde tu terminal:

```bash
docker rm -f prueba-ssh
```

La clave del taller puede quedarse en el volumen: en el encargo, Terraform generará una propia.
