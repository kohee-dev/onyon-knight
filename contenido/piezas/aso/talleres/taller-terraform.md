---
titulo: "Taller 4: Terraform básico"
licencia: CC-BY-NC-SA-4.0
resumen: Describir un contenedor en código, leer el plan, aplicarlo, cambiarlo, multiplicarlo con count y destruirlo, desde la estación de control.
---

:::nota[Objetivo]
Hacer con las manos el ciclo completo de Terraform que explica la teoría de [[terraform-teoria|Infraestructura como código con Terraform]]: escribir, planificar, aplicar, cambiar y destruir. Lo harás con contenedores sencillos, antes de levantar los servidores de la orquesta en el encargo.

**Duración:** unas 3 horas, en clase. **Necesitas:** el [[taller-docker|taller 2]] hecho (estación en marcha, red `garnier`).
:::

# 1. Una carpeta de pruebas

En el repositorio, crea la carpeta `pruebas/terraform-taller/`. Es solo para el taller: añade `pruebas/` al `.gitignore` o bórrala al terminar.

Todas las órdenes de Terraform se lanzan **dentro de la estación**, en esa carpeta:

```bash
docker exec -it estacion bash
cd /repo/pruebas/terraform-taller
```

Los ficheros los editas en tu editor, en tu equipo: la estación los ve al instante a través de `/repo`.

# 2. Describir lo que quieres

**`versions.tf`**: qué proveedor se usa, con qué versión, y dónde se guarda el estado. El estado va en el volumen, no en el repositorio:

```hcl
terraform {
  required_version = ">= 1.17"

  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }

  backend "local" {
    path = "/datos/taller-terraform.tfstate"
  }
}

provider "docker" {}
```

El proveedor de Docker habla con `/var/run/docker.sock`, el socket que montaste en la estación. Por eso Terraform, desde dentro de un contenedor, puede crear contenedores en tu Docker Desktop.

**`variables.tf`**:

```hcl
variable "nombre" {
  description = "Nombre del contenedor de prueba"
  type        = string
  default     = "taller-web"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]*$", var.nombre))
    error_message = "El nombre solo admite minúsculas, números y guiones, y empieza por letra."
  }
}

variable "copias" {
  description = "Cuántos contenedores iguales se crean"
  type        = number
  default     = 1
}
```

**`main.tf`**: la red ya existe (la creaste a mano), así que se **lee** con `data`; la imagen y el contenedor los **gestiona** Terraform:

```hcl
data "docker_network" "garnier" {
  name = "garnier"
}

resource "docker_image" "nginx" {
  name         = "nginx:1.29"
  keep_locally = true
}

resource "docker_container" "web" {
  count = var.copias
  name  = "${var.nombre}-${count.index + 1}"
  image = docker_image.nginx.image_id

  networks_advanced {
    name = data.docker_network.garnier.name
  }
}
```

**`outputs.tf`**:

```hcl
output "contenedores" {
  description = "Nombres de los contenedores creados"
  value       = docker_container.web[*].name
}
```

`keep_locally = true` evita que `destroy` borre la imagen descargada, que otros contenedores pueden estar usando.

# 3. El ciclo: `init`, `plan`, `apply`

```bash
terraform init
terraform fmt
terraform validate
terraform plan
```

Lee el plan con calma. Debe decir que se crean la imagen y un contenedor:

```text
  # docker_container.web[0] will be created
  # docker_image.nginx will be created
Plan: 2 to add, 0 to change, 0 to destroy.
```

Aplícalo. Terraform vuelve a mostrar el plan y espera que escribas `yes`:

```bash
terraform apply
```

Desde tu terminal, `docker ps` muestra `taller-web-1`. Ahora lanza otra vez `terraform plan`:

```text
No changes. Your infrastructure matches the configuration.
```

Es la **idempotencia**: lo escrito y lo real coinciden, así que no hay nada que hacer.

:::pregunta[Borra el contenedor a mano desde tu terminal (`docker rm -f taller-web-1`) y lanza `terraform plan` en la estación. ¿Qué propone Terraform? ¿Qué te dice esto sobre cambiar a mano algo que gestiona Terraform?]
Propone **crearlo de nuevo** (`1 to add`): Terraform compara el estado con la realidad, detecta que falta y quiere volver a lo escrito. Cualquier cambio manual sobre algo que gestiona Terraform se deshace en el siguiente `apply`. Los cambios se hacen en el código, no a mano.
:::

# 4. Cambiar algo y leer qué implica

Prueba un valor que no cumple la validación:

```bash
terraform plan -var nombre=Mal
```

```text
Error: Invalid value for variable
...
El nombre solo admite minúsculas, números y guiones, y empieza por letra.
```

Terraform se para **antes** de tocar nada. Ahora uno válido:

```bash
terraform plan -var nombre=ensayo
```

```text
  # docker_container.web[0] must be replaced
      ~ name = "taller-web-1" -> "ensayo-1" # forces replacement
Plan: 1 to add, 0 to change, 1 to destroy.
```

Un contenedor no se puede renombrar en sitio: Terraform lo **destruye y lo crea de nuevo** (`-/+`). Si dentro hubiera datos sin volumen, se perderían. Es justo lo que hay que detectar al leer un plan. No lo apliques.

# 5. Muchos iguales con `count`

```bash
terraform apply -var copias=3
terraform output contenedores
terraform state list
```

```text
[
  "taller-web-1",
  "taller-web-2",
  "taller-web-3",
]
data.docker_network.garnier
docker_container.web[0]
docker_container.web[1]
docker_container.web[2]
docker_image.nginx
```

`terraform state list` muestra lo que Terraform **recuerda** haber creado. La red aparece como `data`: la conoce, pero no es suya.

:::pregunta[Con tres copias en marcha, lanza `terraform plan` sin `-var copias=3`. ¿Qué propone y por qué? ¿Cómo evitarías tener que escribir la variable cada vez?]
Propone **destruir** `web[1]` y `web[2]`: sin la variable, `copias` vuelve a su valor por defecto (1) y sobran dos contenedores. Para no depender de acordarse, el valor se fija en un fichero `terraform.tfvars` (`copias = 3`), que Terraform lee solo y que se guarda en Git con el resto del código.
:::

# 6. Destruir

```bash
terraform destroy -var copias=3
```

```text
Destroy complete! Resources: 4 destroyed.
```

Cuatro: los tres contenedores y la imagen, que sale del estado aunque se conserva en Docker por `keep_locally`. La red **no** se destruye, porque no es de Terraform.

# Comprueba que lo tienes

En la estación, dentro de `pruebas/terraform-taller`, con el contenedor por defecto creado (`terraform apply`):

```bash
terraform version
terraform plan
terraform state list
grep -c '"name": "taller-web-1"' /datos/taller-terraform.tfstate
```

Salida esperada:

```text
Terraform v1.17.2
on linux_amd64
...
No changes. Your infrastructure matches the configuration.
...
data.docker_network.garnier
docker_container.web[0]
docker_image.nginx
1
```

La última línea demuestra que el estado está en el volumen (`/datos`) y no en tu repositorio. Al terminar, `terraform destroy` y borra `pruebas/`.
