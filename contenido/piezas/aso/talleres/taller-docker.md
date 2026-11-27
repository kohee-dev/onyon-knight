---
titulo: "Taller 2: Docker desde cero"
licencia: CC-BY-NC-SA-4.0
resumen: Ejecutar, construir y conectar contenedores, y terminar con la estación de control del encargo construida y en marcha.
---

:::nota[Objetivo]
Aprender lo justo de Docker para el encargo [[gira-garnier|La gira de la Garnier]]: ejecutar contenedores, construir imágenes con un `Dockerfile`, conectarlos en una red y guardar datos en volúmenes. Al terminar tendrás en marcha la **estación de control**, el contenedor desde el que dirigirás toda la infraestructura.

**Duración:** unas 3 horas, en clase. **Necesitas:** el [[taller-git|taller 1]] hecho (Docker Desktop instalado y el repositorio clonado).
:::

:::aviso[Qué terminal usar en Windows]
Usa **PowerShell** para las órdenes de Docker. Git Bash transforma las rutas que empiezan por `/` (convierte `/repo` en `C:/Program Files/Git/repo`) y los montajes fallan de formas muy raras. Donde una orden cambia entre PowerShell y Bash, se indican las dos.
:::

# 1. Contenedores e imágenes

Una **imagen** es una plantilla de solo lectura con un sistema de ficheros y un programa que arrancar (por ejemplo, Debian con nginx). Un **contenedor** es una imagen en ejecución, con su propia capa donde escribe. De una imagen salen tantos contenedores como quieras, y todos son iguales al arrancar.

Comparado con una máquina virtual, un contenedor no lleva un sistema operativo completo: comparte el núcleo del anfitrión. Por eso arranca en un segundo y ocupa megas en vez de gigas. En Windows y Mac, Docker Desktop mantiene una pequeña máquina virtual Linux donde corren los contenedores.

```bash
docker run --rm hello-world
```

`run` descarga la imagen si no la tienes, crea un contenedor y lo arranca. `--rm` lo borra al terminar.

# 2. Un servidor web en un contenedor

```bash
docker run -d --name prueba-web -p 8080:80 nginx:1.29
```

| Opción | Significado |
|---|---|
| `-d` | En segundo plano (*detached*) |
| `--name prueba-web` | Nombre del contenedor (si no, Docker inventa uno) |
| `-p 8080:80` | El puerto 8080 del anfitrión lleva al 80 del contenedor |
| `nginx:1.29` | Imagen y **etiqueta** (versión). Sin etiqueta se usa `latest`, que cambia sin avisar |

Abre `http://localhost:8080` en el navegador. Después prueba estas órdenes:

| Orden | Qué hace |
|---|---|
| `docker ps` | Contenedores en marcha (`-a`: también los parados) |
| `docker logs prueba-web` | Lo que ha escrito el programa del contenedor |
| `docker exec -it prueba-web bash` | Abre una terminal **dentro** del contenedor (sal con `exit`) |
| `docker exec prueba-web cat /etc/os-release` | Ejecuta una orden dentro sin abrir terminal |
| `docker stop prueba-web` / `docker start prueba-web` | Parar y arrancar |
| `docker rm -f prueba-web` | Borrar (aunque esté en marcha) |
| `docker images` | Imágenes descargadas |

:::pregunta[Dentro de `prueba-web`, crea un fichero con `docker exec prueba-web touch /tmp/hola`. Borra el contenedor y crea otro igual con la misma orden `docker run`. ¿Sigue existiendo `/tmp/hola`? ¿Por qué?]
No. Cada contenedor tiene su propia capa de escritura, que se borra con él. El contenedor nuevo sale de la imagen, que no ha cambiado. Para que unos datos sobrevivan al contenedor hay que guardarlos en un **volumen** (apartado 4).
:::

# 3. Construir una imagen propia: el `Dockerfile`

Un `Dockerfile` es la receta de una imagen: parte de otra (`FROM`) y añade pasos. Crea una carpeta `mi-web` con un `index.html` cualquiera y este `Dockerfile`:

```dockerfile
FROM nginx:1.29
COPY index.html /usr/share/nginx/html/index.html
```

```bash
docker build -t mi-web:1.0 mi-web
docker run -d --name mi-web -p 8081:80 mi-web:1.0
```

En `http://localhost:8081` aparece tu página.

| Instrucción | Para qué |
|---|---|
| `FROM` | Imagen de partida |
| `RUN` | Ejecutar una orden al construir (instalar paquetes, crear usuarios) |
| `COPY` | Copiar ficheros de la carpeta a la imagen |
| `ENV` | Variable de entorno |
| `ARG` | Variable que solo existe al construir |
| `WORKDIR` | Carpeta de trabajo |
| `EXPOSE` | Documenta en qué puerto escucha |
| `CMD` | Qué se ejecuta al arrancar el contenedor |

Cada `RUN` añade una **capa**. Por eso se encadenan órdenes con `&&` y se borra la caché de `apt` en el mismo paso: si no, la imagen arrastra ficheros inútiles.

# 4. Redes y volúmenes

**Redes.** Los contenedores de una misma red definida por el usuario se ven entre sí **por su nombre**, sin publicar puertos en el anfitrión:

```bash
docker network create garnier
docker run -d --name web1 --network garnier nginx:1.29
docker run --rm --network garnier debian:trixie-slim getent hosts web1
```

La última orden responde con la IP de `web1`: Docker hace de DNS dentro de la red. Así trabajará la infraestructura del encargo: los servidores **no publican puertos**, y solo se llega a ellos desde dentro de la red.

**Volúmenes.** Guardan datos fuera de los contenedores; sobreviven aunque estos se borren:

```bash
docker volume create garnier-datos
docker run --rm -v garnier-datos:/datos debian:trixie-slim sh -c 'echo hola > /datos/prueba'
docker run --rm -v garnier-datos:/datos debian:trixie-slim cat /datos/prueba
```

**Montar una carpeta del anfitrión** (*bind mount*) también es posible: `-v "<ruta del anfitrión>":/ruta`. Lo usarás para que la estación vea el repositorio. Pero cuidado, porque los permisos de los ficheros de Windows no se traducen bien: dentro del contenedor todos aparecen con `777`. Por eso **las claves privadas no se guardan nunca en la carpeta montada**, sino en el volumen. SSH se niega a usar una clave que cualquiera puede leer.

Limpia lo que has creado (la red y el volumen se quedan):

```bash
docker rm -f web1 prueba-web mi-web
```

# 5. La estación de control

La estación de control es un contenedor con **Terraform** y **Ansible** instalados, desde el que gestionaréis toda la infraestructura. Así todo el grupo trabaja con las mismas versiones, sea cual sea su sistema.

En el repositorio, crea `estacion/Dockerfile` con este contenido (y borra `estacion/.gitkeep`):

```dockerfile
# Estación de control de la gira: desde aquí se dirige toda la infraestructura.
FROM debian:trixie-slim

ARG TARGETARCH
ARG TERRAFORM_VERSION=1.17.2

RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl unzip git openssh-client python3 python3-venv \
 && rm -rf /var/lib/apt/lists/*

# Terraform: el binario de la arquitectura del equipo (amd64 en el aula, arm64 en un Mac)
RUN curl -fsSL -o /tmp/terraform.zip \
      "https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_${TARGETARCH}.zip" \
 && unzip -q /tmp/terraform.zip terraform -d /usr/local/bin \
 && rm /tmp/terraform.zip

# Ansible en un entorno virtual, con versiones fijadas
RUN python3 -m venv /opt/ansible \
 && /opt/ansible/bin/pip install --no-cache-dir "ansible-core==2.22.*" "pywinrm==0.5.*" "ansible-lint==25.*" "passlib==1.7.*"
ENV PATH="/opt/ansible/bin:${PATH}"
RUN ansible-galaxy collection install ansible.windows community.windows

# En Windows la carpeta montada es escribible por todos y Ansible ignoraría su ansible.cfg:
# se le indica explícitamente cuál usar.
ENV ANSIBLE_CONFIG=/repo/ansible/ansible.cfg

WORKDIR /repo
CMD ["sleep", "infinity"]
```

Desde la carpeta del repositorio, constrúyela y arráncala:

```bash
docker build -t estacion-control estacion
```

En **PowerShell**:

```powershell
docker run -d --name estacion --network garnier -e TF_VAR_repo_anfitrion="${PWD}" -v "${PWD}:/repo" -v garnier-datos:/datos -v /var/run/docker.sock:/var/run/docker.sock estacion-control
```

En **Bash** (Mac, Linux):

```bash
docker run -d --name estacion --network garnier -e TF_VAR_repo_anfitrion="$PWD" -v "$PWD":/repo -v garnier-datos:/datos -v /var/run/docker.sock:/var/run/docker.sock estacion-control
```

| Montaje | Para qué |
|---|---|
| `"${PWD}:/repo"` | El repositorio, para editarlo en tu editor y usarlo desde la estación |
| `garnier-datos:/datos` | Claves, estado de Terraform y contraseña de Vault: lo que **no** va a Git |
| `/var/run/docker.sock` | El *socket* de Docker: permite a Terraform, desde dentro, crear contenedores en tu Docker Desktop |
| `TF_VAR_repo_anfitrion` | La ruta del repositorio en tu equipo; la necesitará Terraform en la fase 4 |

:::aviso[El socket de Docker es la llave maestra]
Quien puede hablar con `/var/run/docker.sock` puede crear un contenedor que monte el disco entero del anfitrión: **equivale a ser administrador del equipo**. Se monta solo en la estación de control, que es vuestra, y nunca en un servidor expuesto. En la fase 1 del encargo tendréis que justificar este riesgo.
:::

Para trabajar dentro de la estación:

```bash
docker exec -it estacion bash
```

Si apagas el equipo, la estación se para. Vuelve a arrancarla con `docker start estacion`. Si cambias el `Dockerfile`, hay que reconstruir y recrear el contenedor: `docker rm -f estacion`, `docker build` y el `docker run` de nuevo. El volumen conserva los datos.

Haz *commit* del `Dockerfile` en una rama y abre la PR para que la revise otro miembro.

# Comprueba que lo tienes

```bash
docker version --format "Cliente {{.Client.Version}} · Servidor {{.Server.Version}}"
docker network ls --filter name=garnier --format "{{.Name}} {{.Driver}}"
docker exec estacion terraform version
docker exec estacion ansible --version
```

Salida esperada (las versiones de Docker pueden variar; las de Terraform y Ansible, no):

```text
Cliente 28.5.1 · Servidor 28.5.1
garnier bridge
Terraform v1.17.2
on linux_amd64
ansible [core 2.22.0]
...
```

En un Mac con procesador Apple, Terraform dirá `on linux_arm64`: es la misma versión compilada para otra arquitectura.
