---
titulo: "Caso práctico: administración de una empresa"
tipo: caso
horas: 2
borrador: true
---

# Caso práctico: Administración de una Empresa

## 1. Presentación del caso

En este caso práctico analizaremos **cómo gestionar las cuentas y el acceso a los recursos de una pequeña empresa**, en un entorno similar al que utilizamos en clase.

Partiremos de una configuración con **cuentas locales administradas por separado en cada equipo**. Identificaremos las dificultades que aparecen al dar de alta usuarios, cambiar contraseñas y asignar permisos.

Después estudiaremos cómo un **servicio de directorio** puede facilitar estas tareas mediante la gestión centralizada de usuarios y grupos.

## 2. Enunciado

Una empresa dispone de **cinco equipos con Windows**. Queremos organizar las cuentas de usuario y el acceso a la información según las funciones de cada persona.

### 1. Inicio de sesión en los equipos

El **equipo 1** está reservado para Carmen Alonso Díaz, directora de la empresa.

Los **equipos del 2 al 5** pueden ser utilizados por cualquiera de los empleados.

| Equipos | Quién puede iniciar sesión |
| --- | --- |
| **Equipo 1** | Únicamente la directora. |
| **Equipos 2, 3, 4 y 5** | Cualquiera de los empleados. |

Cada persona debe utilizar **su propia cuenta**, identificarse y autenticarse al iniciar sesión, y disponer de un entorno de trabajo personal en los equipos que tenga permitido utilizar.

::: aviso
**No se utilizará una cuenta compartida entre todos los empleados.**

Cada persona debe tener una identidad propia para poder asignarle los accesos correspondientes.
:::

### 2. Información general de la empresa

En el **equipo 1** habrá una carpeta compartida con información general de la empresa.

**Todos los empleados podrán acceder a ella a través de la red.**

::: nota
Acceder a una carpeta compartida por red y **abrir una sesión de trabajo en el equipo que la almacena** son acciones diferentes.

Los empleados podrán consultar la carpeta del equipo 1 sin tener permiso para iniciar sesión localmente en él.
:::

### 3. Carpetas departamentales y personales

El **equipo 5** alojará los recursos compartidos de los departamentos y las carpetas personales de los empleados.

| Recurso | Quién puede acceder | Permisos |
| --- | --- | --- |
| **Ventas** | Miembros del departamento de ventas. | Lectura y escritura. |
| **Almacén** | Miembros del departamento de almacén. | Lectura y escritura. |
| **Carpeta personal** | Únicamente su propietario, entre los empleados. | Lectura y escritura. |

Las carpetas personales se organizarán dentro de un recurso compartido llamado `empleados`. Cada empleado tendrá una carpeta propia, a la que los demás empleados no podrán acceder.

El objetivo es que cada persona pueda acceder a **sus documentos desde cualquiera de los equipos en los que tenga permitido trabajar**.

::: aviso
**Tener una cuenta personal no garantiza que los documentos estén disponibles en todos los equipos.**

En este caso, esa necesidad se resolverá mediante las carpetas compartidas por red.
:::

## 3. Dificultades de administrar cuentas locales

Si resolvemos el caso mediante **cuentas locales**, tendremos que administrar las cuentas y los permisos por separado en cada equipo.

En la configuración planteada, esto supone:

- Crear la cuenta de cada persona en los equipos donde vaya a trabajar.
- Mantener las credenciales coherentes si queremos que utilice el mismo nombre y contraseña en todos ellos.
- Configurar los grupos y permisos necesarios en los equipos que comparten carpetas.
- Restringir el inicio de sesión local en el equipo 1 a la directora, conservando el acceso por red de los empleados a la carpeta general.

### El problema del mantenimiento

El trabajo no termina después de crear las cuentas. Cada alta, baja o cambio puede requerir modificaciones en varios equipos.

::: tip
Un empleado utiliza los equipos del 2 al 5 y cambia la contraseña de su cuenta local en el equipo 2.

Las cuentas de los otros equipos conservan la contraseña anterior. Si queremos mantener la misma contraseña en todos ellos, tendremos que actualizar cada cuenta por separado.
:::

::: aviso
**Dos cuentas locales con el mismo nombre y contraseña siguen siendo cuentas diferentes.**

Cada equipo mantiene su propia cuenta. Cambiarla o deshabilitarla en uno no modifica automáticamente las de los demás.
:::

Esta administración repetida aumenta el trabajo y facilita errores como:

- Olvidar una cuenta activa cuando una persona deja la empresa.
- Mantener permisos que ya no corresponden a su función.
- Configurar contraseñas diferentes entre equipos.
- Aplicar restricciones de forma desigual.

### Hacia una gestión centralizada

Un **servicio de directorio**, como Active Directory, permite centralizar las cuentas y los grupos. Los equipos y servicios integrados pueden utilizar esas identidades, reduciendo la necesidad de mantener cuentas locales duplicadas.

::: nota
**Centralizar las identidades no elimina la configuración de los recursos.**

Seguiremos teniendo que definir los permisos de las carpetas y quién puede iniciar sesión en cada equipo, pero podremos hacerlo utilizando usuarios y grupos del dominio.
:::

## 4. Una solución con un servicio de directorio

Una solución con un servicio de directorio

Un **servicio de directorio como Active Directory** permite centralizar las cuentas de usuario y los grupos. Los equipos integrados en el dominio pueden utilizar esas identidades para autenticar a las personas y aplicar los permisos configurados.

### ¿Cómo lo aplicaríamos en esta empresa?

1. **Crear las cuentas en el dominio.** Cada persona dispondría de una cuenta centralizada para trabajar en los equipos autorizados.
2. **Organizar a los empleados en grupos.** Por ejemplo, `Ventas` y `Almacén`, según su departamento.
3. **Configurar el inicio de sesión.** Solo la directora podría iniciar sesión localmente en el equipo 1; los empleados podrían hacerlo en los equipos del 2 al 5.
4. **Asignar permisos a las carpetas compartidas.** Utilizaríamos los grupos del dominio para las carpetas departamentales y la cuenta de cada empleado para su carpeta personal.

::: tip
Si una persona cambia de ventas a almacén, revisaríamos su pertenencia a los grupos del dominio.

Los recursos cuyos permisos estén asignados a esos grupos utilizarían la nueva pertenencia cuando se actualice la información de acceso de la sesión.
:::

### ¿Qué mejora respecto a las cuentas locales?

La administración de las identidades se realiza en un **punto común**, reduciendo la necesidad de repetir altas, cambios de contraseña y bajas en cada equipo.

::: aviso
**Crear un dominio no configura automáticamente todos los accesos.**

Debemos integrar los equipos y establecer los permisos de las carpetas y las reglas de inicio de sesión. El directorio proporciona las identidades y los grupos con los que aplicaremos esas reglas.
:::


