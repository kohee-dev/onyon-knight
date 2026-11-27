---
titulo: "Taller 1: puesta a punto y Git en equipo"
licencia: CC-BY-NC-SA-4.0
resumen: Docker Desktop y Git instalados, y el repositorio del grupo en GitHub con su primera rama revisada y fusionada.
---

:::nota[Objetivo]
Dejar el equipo listo para el encargo [[gira-garnier|La gira de la Garnier]] y aprender a trabajar **en grupo** sobre un mismo repositorio: ramas, *pull requests* y revisión entre compañeros. Es como funciona cualquier equipo de sistemas: nadie cambia nada sin que otra persona lo revise.

**Duración:** unas 2 horas, en clase.
:::

:::aviso[Antes de empezar]
- Trabajáis en **grupos de 4**. Cada persona hace este taller en **su** equipo: en Navidad cada uno tendrá que levantar la infraestructura en el suyo.
- Necesitas permisos de administrador en el equipo y una cuenta de correo para GitHub.
:::

# 1. Instalar las herramientas

Instala lo siguiente en este orden. En Windows, acepta las opciones por defecto salvo donde se indique.

| Herramienta | Para qué | Dónde |
|---|---|---|
| **Docker Desktop** | Ejecutar los contenedores de la infraestructura | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/). En Windows, deja marcada la opción **Use WSL 2**. Reinicia si lo pide |
| **Git** | Control de versiones | [git-scm.com](https://git-scm.com/downloads). En Windows trae **Git Bash**, una terminal con las órdenes de Linux |
| **Visual Studio Code** (u otro editor) | Editar los ficheros | [code.visualstudio.com](https://code.visualstudio.com/) |

Al terminar, abre una terminal (PowerShell o Git Bash en Windows, Terminal en Mac o Linux) y comprueba:

```bash
docker --version
git --version
```

Si `docker` no se encuentra, abre Docker Desktop y espera a que diga *Engine running*.

:::aviso[Si Docker Desktop no arranca en Windows]
El motivo más habitual es que la **virtualización** está desactivada en la BIOS/UEFI (Intel VT-x o AMD-V) o que falta WSL. En PowerShell como administrador, `wsl --install` instala lo necesario. Después hay que reiniciar.
:::

# 2. Identificarse en Git

Git apunta en cada *commit* quién lo hizo. **La autoría de los commits es una de las evidencias de tu trabajo individual**, así que configúrala con tu nombre real y el correo de tu cuenta de GitHub:

```bash
git config --global user.name "María García"
git config --global user.email "maria.garcia@example.com"
git config --global init.defaultBranch main
```

Si en un equipo compartido aparecen commits con el nombre de otra persona, no cuentan como tuyos.

# 3. El repositorio del grupo en GitHub

**Una sola persona del grupo** lo crea; el resto espera la invitación.

1. Crea una cuenta en [github.com](https://github.com/) si no la tienes (cada miembro, la suya).
2. *New repository* → nombre `gira-garnier`, **privado**, marcando *Add a README file*.
3. *Settings → Collaborators → Add people*: invita a los otros tres miembros y al profesor.
4. Los demás aceptan la invitación desde el correo o desde GitHub.

Cada miembro **clona** el repositorio en su equipo. Copia la dirección del botón verde *Code* (pestaña HTTPS):

```bash
git clone https://github.com/<usuario>/gira-garnier.git
cd gira-garnier
```

La primera vez que hagas `push`, Git abrirá el navegador para que inicies sesión en GitHub.

# 4. El ciclo básico: cambiar, preparar, confirmar, subir

Git guarda «fotos» del proyecto llamadas **commits**. Entre que cambias un fichero y lo subes hay tres pasos:

| Orden | Qué hace |
|---|---|
| `git status` | Muestra qué ha cambiado y qué está preparado |
| `git add <fichero>` | Prepara un cambio para el siguiente commit |
| `git commit -m "mensaje"` | Crea el commit con lo preparado |
| `git push` | Sube tus commits a GitHub |
| `git pull` | Trae los commits que han subido los demás |
| `git log --oneline --graph` | Muestra el historial |

Un buen mensaje de commit dice **qué** cambia en una línea corta: `docs: añade la arquitectura al README`, no `cambios` ni `asdf`.

# 5. Trabajar con ramas y *pull requests*

En el encargo nadie sube cambios directamente a `main`. Se trabaja así:

1. Crear una **rama** para la tarea.
2. Hacer commits en ella y subirla.
3. Abrir una ***pull request*** (PR) en GitHub: una petición para fusionar la rama en `main`.
4. **Otro miembro la revisa**: lee los cambios, comenta y, si está bien, la aprueba.
5. Se fusiona y todos hacen `git pull`.

Vais a hacer la primera ahora. **Una persona** prepara la estructura del repositorio:

```bash
git switch -c fase0/estructura
mkdir estacion terraform ansible docs
```

Git no guarda carpetas vacías. Crea dentro de cada una un fichero vacío `.gitkeep`, que se borrará cuando la carpeta tenga contenido real.

Crea en la raíz un fichero **`.gitignore`**: lo que Git no debe guardar nunca. Ahí van ficheros que se regeneran y, sobre todo, **secretos**:

```text
# Generado por Terraform
terraform/.terraform/
*.tfstate
*.tfstate.*
ansible/inventory.ini
ansible/roles/
# Secretos: nunca en el repositorio
claves/
.vault-pass
```

Y un fichero **`.gitattributes`**. En Windows, Git convierte los finales de línea al formato de Windows (CRLF), y los scripts de Bash y los ficheros que leerá Linux dejan de funcionar. Este fichero lo evita:

```text
*.sh  text eol=lf
*.yml text eol=lf
*.j2  text eol=lf
*.tf  text eol=lf
*.cfg text eol=lf
Dockerfile text eol=lf
```

Sube la rama:

```bash
git add .
git commit -m "chore: estructura del repositorio"
git push -u origin fase0/estructura
```

En GitHub aparecerá el aviso *Compare & pull request*. Ábrela con un título y una descripción de lo que hace y, en *Reviewers*, elige a un compañero.

**El compañero revisa:** pestaña *Files changed*, comprueba que `.gitignore` incluye el estado de Terraform y las claves, y pulsa *Review changes → Approve*. Después, *Merge pull request*.

Todos actualizan su copia:

```bash
git switch main
git pull
```

:::tip[Turnaos]
Que cada miembro haga al menos una PR durante el taller (por ejemplo, añadir su nombre y su fase al README) y revise la de otro. Durante el encargo será la norma: **cada fase tiene un líder, y su PR la revisa otro miembro.**
:::

# 6. Si dos personas tocan lo mismo: conflictos

Si dos ramas cambian las mismas líneas de un fichero, Git no sabe con cuál quedarse y marca un **conflicto**:

```text
<<<<<<< HEAD
Líder de la fase 1: María
=======
Líder de la fase 1: Jay
>>>>>>> fase1/lider
```

Se resuelve editando el fichero para dejar el texto correcto (sin las marcas), y después:

```bash
git add README.md
git commit
```

Para evitar conflictos: ramas cortas, `git pull` antes de empezar a trabajar y cada miembro en ficheros distintos cuando se pueda.

:::pregunta[¿Por qué `*.tfstate` y `claves/` están en `.gitignore`, y qué pasaría si alguien sube una clave privada a GitHub por error aunque luego la borre en otro commit?]
Porque contienen **secretos**: la clave privada de acceso a los servidores (y el estado de Terraform la guarda en claro). Borrarla en un commit posterior **no basta**: sigue en el historial y cualquiera con acceso al repositorio puede recuperarla. Hay que dar la clave por comprometida y generar otra.
:::

# Comprueba que lo tienes

En la carpeta del repositorio, con `main` actualizado:

```bash
git --version
git log --oneline --graph
git status
git check-ignore -v terraform/terraform.tfstate
```

Salida esperada (los identificadores y la versión cambian):

```text
git version 2.54.0
*   c69ee58 Merge pull request #1 from garnier/fase0/estructura
|\
| * 9ec875a chore: estructura del repositorio
|/
* 7d2d34f Initial commit
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
.gitignore:3:*.tfstate	terraform/terraform.tfstate
```

Si `git check-ignore` no muestra nada, el estado de Terraform **no** está ignorado: revisa el `.gitignore` antes de seguir.
