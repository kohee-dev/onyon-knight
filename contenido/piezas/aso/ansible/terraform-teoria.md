---
titulo: "Infraestructura como código con Terraform"
licencia: CC-BY-NC-SA-4.0
---

# 1. Qué es Terraform y para qué sirve

Antes de configurar un servidor hay que **tenerlo**: crear la máquina o el contenedor, su red, su disco, sus claves de acceso. Hacerlo a mano en una consola web o con órdenes sueltas tiene los mismos problemas que configurar a mano: nadie recuerda qué se hizo, cada entorno sale un poco distinto y reconstruirlo tras un desastre lleva horas.

**Terraform** resuelve esa parte. Es una herramienta de **infraestructura como código**: describes en ficheros de texto **qué infraestructura quieres** (cuatro contenedores Debian en tal red, con tal clave) y Terraform se encarga de crearla, cambiarla o destruirla para que la realidad coincida con lo escrito. Los ficheros se guardan en Git, se revisan y se aplican igual en cualquier equipo.

Terraform es **declarativo**: no le dices «crea un contenedor», le dices «debe existir este contenedor». Si ya existe y coincide, no hace nada; si falta, lo crea; si sobra, lo destruye.

**Terraform y Ansible no compiten, se complementan:**

| | Terraform | Ansible |
|---|---|---|
| Para qué | **Crear** la infraestructura: máquinas, contenedores, redes, discos, DNS | **Configurar** lo que hay dentro: paquetes, cuentas, servicios, ficheros |
| Cómo habla con el destino | Con la API del proveedor (Docker, AWS, Azure, Proxmox…) | Por SSH o WinRM, entrando en cada equipo |
| Recuerda lo que creó | Sí, en un fichero de **estado** | No: comprueba el estado real en cada ejecución |
| Lenguaje | HCL (ficheros `.tf`) | YAML |

El flujo habitual en una empresa: **Terraform levanta los servidores y genera el inventario; Ansible los configura.** Es lo que harás en el encargo de esta unidad.

# 2. El flujo de trabajo: `init`, `plan`, `apply`, `destroy`

Un proyecto de Terraform es una carpeta con ficheros `.tf`. Terraform lee todos los de la carpeta como si fueran uno; repartirlos en varios ficheros es solo para ordenarlos.

| Orden | Qué hace |
|---|---|
| `terraform init` | Prepara la carpeta: descarga los proveedores que se usan. Se lanza una vez al empezar y cada vez que se añade un proveedor |
| `terraform fmt` | Da formato a los ficheros (sangría, alineación) |
| `terraform validate` | Comprueba que la configuración es correcta, sin tocar nada |
| `terraform plan` | Compara lo escrito con lo que existe y **muestra qué haría**, sin hacerlo |
| `terraform apply` | Muestra el plan, pide confirmación y lo ejecuta |
| `terraform destroy` | Destruye todo lo que gestiona el proyecto |
| `terraform output` | Muestra los valores de salida |

**Leer un plan.** Es lo más importante que harás con Terraform: el plan dice exactamente qué va a cambiar. Cada recurso lleva un símbolo:

| Símbolo | Significado |
|---|---|
| `+` | Se crea |
| `-` | Se destruye |
| `~` | Se modifica sin destruirlo |
| `-/+` | Se destruye y se vuelve a crear (cuidado: se pierde lo que hubiera dentro) |

Y al final, el resumen:

```text
Plan: 4 to add, 0 to change, 0 to destroy.
```

::: aviso
En un equipo de trabajo, **nadie lanza `apply` sin haber leído el `plan`**. Un `-/+` inesperado sobre una base de datos es un incidente grave. Si el plan dice algo que no esperabas, para y averigua por qué.
:::

Si se lanza `apply` dos veces seguidas sin cambiar nada, la segunda debe decir `0 added, 0 changed, 0 destroyed`: la infraestructura ya coincide con lo escrito.

# 3. Proveedores y recursos

Terraform no sabe crear nada por sí mismo: usa **proveedores** (*providers*), complementos que hablan con la API de cada plataforma. Hay proveedores para Docker, AWS, Azure, Proxmox, GitHub, Cloudflare y cientos más. Se declaran en un bloque `terraform` con su versión:

```hcl
# versions.tf
terraform {
  required_version = ">= 1.17"

  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {}
```

`~> 3.0` significa «cualquier 3.x, pero no la 4.0»: se aceptan correcciones, no cambios que rompan. `terraform init` descarga la versión elegida y la apunta en `.terraform.lock.hcl`. Ese fichero **sí se sube a Git**, para que todo el equipo use exactamente la misma. La carpeta `.terraform/`, con los binarios descargados, no se sube.

Un **recurso** es cada cosa que Terraform gestiona. Se escribe con su tipo y un nombre local:

```hcl
resource "docker_image" "nodo" {
  name = "garnier-nodo:1.0"

  build {
    context = "${path.module}/nodo"   # carpeta con el Dockerfile
  }
}

resource "docker_container" "web" {
  name  = "prueba-web"
  image = docker_image.nodo.image_id
}
```

- `docker_container` es el **tipo** (lo define el proveedor) y `web` el **nombre local**, que solo sirve dentro del proyecto.
- Para usar un atributo de otro recurso se escribe `tipo.nombre.atributo`: `docker_image.nodo.image_id`.
- Esa referencia crea una **dependencia**: Terraform construye primero la imagen y luego el contenedor, sin que se lo digas.

Cada proveedor documenta sus recursos y atributos en el [registro de Terraform](https://registry.terraform.io/).

# 4. Variables, validación y salidas

Los valores que pueden cambiar no se escriben dentro de los recursos: van en **variables**.

```hcl
# variables.tf
variable "secciones" {
  description = "Secciones de la orquesta: un nodo por sección"
  type        = list(string)
  default     = ["cuerdas", "madera", "metales", "percusion"]

  validation {
    condition     = length(var.secciones) >= 1 && length(var.secciones) <= 6
    error_message = "Debe haber entre 1 y 6 secciones."
  }
}
```

Se usan como `var.secciones`. El bloque `validation` rechaza valores absurdos **antes** de tocar nada, con un mensaje claro.

Dónde se da valor a una variable, de menor a mayor prioridad (cada una gana a las anteriores):

1. El `default` de la propia variable.
2. Variables de entorno `TF_VAR_<nombre>`: `export TF_VAR_ampliacion=true`.
3. Un fichero `terraform.tfvars` en la carpeta (se lee solo).
4. Ficheros `*.auto.tfvars`.
5. En la orden: `terraform apply -var 'ampliacion=true'`.

Ojo con el orden: si una variable está en `terraform.tfvars`, una `TF_VAR_` con otro valor **no tiene efecto**.

Las **salidas** (*outputs*) muestran datos al terminar y permiten consultarlos después:

```hcl
# outputs.tf
output "nodos" {
  description = "Nombres de los nodos"
  value       = docker_container.nodo[*].name
}

output "clave_consola" {
  value     = random_password.consola.result
  sensitive = true    # no se imprime en pantalla
}
```

```bash
terraform output nodos
terraform output -raw clave_consola
```

Una variable o salida marcada como `sensitive` no aparece en el plan ni en la pantalla. Pero **sí se guarda en el estado**, como se ve en el apartado 7.

# 5. Fuentes de datos: usar lo que ya existe

No todo lo crea Terraform. Una **fuente de datos** (`data`) lee algo que ya existe para usarlo, sin gestionarlo:

```hcl
# La red se creó a mano (docker network create garnier); Terraform solo la usa.
data "docker_network" "garnier" {
  name = "garnier"
}

resource "docker_container" "nodo" {
  # ...
  networks_advanced {
    name = data.docker_network.garnier.name
  }
}
```

La diferencia importa: `terraform destroy` borra los recursos, pero **nunca** lo que se lee con `data`.

# 6. Muchos recursos iguales: `count` y plantillas

**`count`** crea varias copias de un recurso. Dentro, `count.index` vale 0, 1, 2…:

```hcl
resource "docker_container" "nodo" {
  count    = length(var.secciones)
  name     = "garnier-${var.secciones[count.index]}"
  hostname = "garnier-${var.secciones[count.index]}"
  image    = docker_image.nodo.image_id
}
```

Con cuatro secciones salen `docker_container.nodo[0]` … `docker_container.nodo[3]`. Para referirse a todos a la vez se usa `[*]`: `docker_container.nodo[*].name` es la lista de nombres.

**Interpolación y expresiones.** Dentro de una cadena, `${...}` inserta un valor. Hay funciones (`length`, `upper`, `join`, `file`, `filesha1`…) y condiciones con `condición ? si : no`:

```hcl
locals {
  consola = var.ampliacion ? 1 : 0    # un recurso que solo existe si se pide
}
```

**`templatefile`** rellena una plantilla con valores de Terraform. Es la forma de que Terraform **genere el inventario de Ansible** con los nodos que acaba de crear:

```text
# inventario.ini.tftpl
[secciones]
%{ for nombre in nodos ~}
${nombre}
%{ endfor ~}
```

```hcl
resource "local_file" "inventario" {
  filename = "${path.module}/../ansible/inventory.ini"
  content  = templatefile("${path.module}/inventario.ini.tftpl", {
    nodos = docker_container.nodo[*].name
  })
}
```

Si mañana hay seis secciones, el inventario sale con seis nodos sin tocarlo a mano.

::: pregunta[Con `secciones = ["cuerdas", "metales"]`, ¿qué recursos crea el bloque `docker_container.nodo` de arriba y cómo se llaman los contenedores? ¿Qué mostraría el plan si después añades `"madera"` al final de la lista?]
Crea `docker_container.nodo[0]` (contenedor `garnier-cuerdas`) y `docker_container.nodo[1]` (`garnier-metales`). Al añadir `"madera"` al final, el plan crea `nodo[2]` (`garnier-madera`) y los otros dos no cambian. Si el proyecto genera el inventario con `local_file`, este se sustituye para incluir el nodo nuevo: `Plan: 2 to add, 0 to change, 1 to destroy`. Si se añadiera **al principio**, cambiarían los índices de todos y Terraform propondría recrearlos: con `count`, el orden de la lista importa.
:::

# 7. El estado: qué es y por qué es delicado

Terraform apunta en un fichero de **estado** (`terraform.tfstate`, en JSON) todo lo que ha creado: cada recurso, su identificador real y **todos sus atributos**. Así sabe, en el siguiente `plan`, qué existe ya y qué hay que cambiar.

```bash
terraform state list                      # qué recursos gestiona
terraform state show docker_container.nodo[0]
```

**El estado contiene secretos en claro.** Si Terraform genera una clave privada o una contraseña, aunque el recurso o la salida estén marcados como `sensitive`, el valor completo queda dentro del estado:

```hcl
resource "tls_private_key" "garnier" {
  algorithm = "ED25519"
}
```

Si además se guarda en un fichero con `local_sensitive_file`, el contenido de ese fichero también queda en el estado. En la infraestructura del encargo:

```bash
grep -c "BEGIN OPENSSH PRIVATE KEY" /datos/terraform.tfstate   # 2: la del recurso de clave y la del fichero
```

Por eso:

- **El estado nunca se sube a Git.** En `.gitignore`: `*.tfstate` y `*.tfstate.*`.
- Se guarda en un sitio protegido. En un proyecto individual basta con un fichero fuera del repositorio. En equipos se usa un **backend remoto** compartido y cifrado (un *bucket* S3, Terraform Cloud…), que además bloquea el estado mientras alguien hace `apply`.
- Se indica en el bloque `terraform`:

```hcl
terraform {
  backend "local" {
    path = "/datos/terraform.tfstate"   # en un volumen, fuera del repositorio
  }
}
```

Si se pierde el estado, Terraform «olvida» lo que creó: el siguiente `apply` intentará crearlo todo otra vez y chocará con lo que ya existe.

# 8. Cambiar solo una parte

A veces no quieres aplicar todo el proyecto:

| Orden | Para qué |
|---|---|
| `terraform apply -replace='docker_container.nodo[2]'` | Destruir y recrear un recurso concreto (por ejemplo, un nodo que ha quedado mal) |
| `terraform destroy -target='docker_container.nodo'` | Destruir solo esos recursos y lo que dependa de ellos |
| `terraform apply -var 'ampliacion=true'` | Aplicar con otro valor de una variable |

`-target` es una herramienta para casos concretos, como reconstruir los nodos sin tocar el resto. No sustituye a tener el proyecto bien dividido.

**Reconstruir cuando cambia algo que Terraform no ve.** Terraform compara atributos, no el contenido de una carpeta. Si cambias el `Dockerfile`, la imagen no se reconstruye sola. El atributo `triggers` del recurso de imagen lo arregla:

```hcl
resource "docker_image" "nodo" {
  name = "garnier-nodo:1.0"
  build {
    context = "${path.module}/nodo"
  }
  triggers = {
    dockerfile = filesha1("${path.module}/nodo/Dockerfile")
  }
}
```

# 9. Buenas prácticas y errores frecuentes

**Buenas prácticas:**

- Un fichero por tema: `versions.tf`, `variables.tf`, `outputs.tf` y uno por cada grupo de recursos.
- Versiones fijadas de Terraform y de cada proveedor; `.terraform.lock.hcl` en Git.
- `terraform fmt` y `terraform validate` antes de cada *commit*.
- **Leer siempre el `plan`** antes del `apply`.
- Variables con `description` y, si tiene sentido, `validation`.
- Ningún secreto en los `.tf` ni en Git; el estado fuera del repositorio.

**Errores frecuentes:**

| Mensaje o síntoma | Causa habitual | Qué hacer |
|---|---|---|
| `Inconsistent dependency lock file` o `provider not installed` | Falta `terraform init` o se cambió un proveedor | `terraform init` (o `init -upgrade`) |
| `Reference to undeclared resource` | Nombre mal escrito en una referencia | Revisar `tipo.nombre` |
| `Invalid value for variable` | No se cumple una `validation` | Leer el `error_message` |
| `Conflict. The container name ... is already in use` | Existe un contenedor con ese nombre que Terraform no gestiona | Borrarlo a mano o importarlo; comprobar que no se ha perdido el estado |
| `Cannot connect to the Docker daemon` | Docker no está en marcha o no se ve su socket | Arrancar Docker; revisar el montaje de `/var/run/docker.sock` |
| El plan quiere recrear algo que no has tocado | Ha cambiado un atributo que obliga a recrear, o el orden de una lista con `count` | Leer qué atributo lleva `# forces replacement` |

# 10. Chuleta y relación con el encargo

| Quiero… | Orden |
|---|---|
| Preparar la carpeta | `terraform init` |
| Formatear y validar | `terraform fmt -recursive && terraform validate` |
| Ver qué cambiaría | `terraform plan` |
| Aplicar | `terraform apply` |
| Aplicar sin pregunta (scripts) | `terraform apply -auto-approve` |
| Aplicar con otra variable | `terraform apply -var 'nombre=valor'` |
| Ver las salidas | `terraform output`, `terraform output -raw nombre` |
| Ver qué gestiona | `terraform state list` |
| Recrear un recurso | `terraform apply -replace='tipo.nombre[0]'` |
| Destruirlo todo | `terraform destroy` |
| Trabajar en otra carpeta | `terraform -chdir=terraform plan` |

En el encargo [[gira-garnier|La gira de la Garnier]], Terraform es el protagonista de la **fase 1** (levantar los nodos, la clave y el inventario). En la **fase 4** se usa de nuevo para añadir la consola gráfica y su base de datos.

**Fuente oficial:** la documentación está en [developer.hashicorp.com/terraform](https://developer.hashicorp.com/terraform/docs) y la de cada proveedor en el [registro de Terraform](https://registry.terraform.io/).
