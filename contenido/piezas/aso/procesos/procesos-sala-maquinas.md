---
titulo: "Sala de máquinas"
borrador: true
---

::: aviso
Para la realización de esta actividad voy a tener los siguientes supuestos:

+ Eres capaz de leer y entender oraciones **largas** y comprender **lo que hay que hacer**.
+ Manejas la consola con soltura y te tomas en serio la actividad.
+ Cada apartado se corrige de forma *individual*; documenta cada paso con su captura.
+ Estamos tratando situaciones que no hemos visto en profundidad en clase, así que **no tengas miedo en preguntar**.
+ Apunta los comandos que uses: te servirán más adelante.
+ Si alguien hace *trampa* o *plagio*, lo sabré.
:::

# El encargo

Acabas de incorporarte como **técnico de sistemas** en *Will ol' Wisp*, una pequeña empresa de transporte. Tu compañero veterano se marcha de vacaciones y te deja a cargo del servidor de la empresa: una máquina con **Windows Server** que da servicio a toda la oficina.

Antes de irse, te deja una nota pegada en el monitor:

> *"El servidor va bien, pero llevo meses queriendo dejar la documentación en
> condiciones y nunca encuentro el momento. Encárgate tú: quiero saber qué está
> corriendo ahí dentro, que los servicios importantes estén en marcha, y que si
> algo se descontrola sepas pararlo. Te he dejado un par de cosas a medio resolver,
> a ver si las cazas. Cualquier duda, mi teléfono lo tienes. — Will."*

Tu trabajo en esta práctica es, sencillamente, **ponerte al mando de la sala de máquinas**: conocer el servidor, dejar su documentación lista y resolver las dos incidencias que te ha dejado tu compañero.

::: nota
Necesitas un **Windows Server** (vale una máquina virtual) sobre el que tengas permisos de administrador. Todas las tareas se pueden hacer con las herramientas que trae el propio sistema; solo en la última usarás *Process Explorer*, que es gratuito.
:::


# Conocimientos previos

Antes de empezar deberías repasar la teoría **Procesos del sistema** (general) y **Procesos del sistema en Windows**. En concreto, necesitas saber:

- Qué es un **proceso** y un **servicio**, y en qué se diferencian.
- Qué información identifica a un proceso: **PID**, **PPID**, usuario, ruta del
  ejecutable.
- Manejo básico de la consola: abrir el **Símbolo del sistema** y **PowerShell**
  como administrador.
- Las herramientas de procesos de Windows: **Administrador de tareas**, `tasklist`,
  `taskkill`, `Get-Process`, `Stop-Process`.
- Las herramientas de servicios: la consola **Servicios** (`services.msc`),
  `Get-Service`, `Start-Service` / `Stop-Service` / `Restart-Service`.
- La idea de **clase de prioridad** de un proceso.

# Dia 1: Reconocimiento del terreno

Antes de tocar nada, hay que saber qué hay. Un buen administrador nunca trabaja a ciegas.

## Tarea 1.1 — Inventario de procesos

Abre una consola y lista todos los procesos del servidor de dos formas distintas:

1. Con el **Símbolo del sistema**, usando `tasklist`.
2. Con **PowerShell**, usando `Get-Process`.

Después, obtén con PowerShell la lista de procesos **ordenada por consumo de CPU**, de mayor a menor, para ver qué proceso es el más pesado en la máquina.

::: aviso
> Entrega: capturas de ambos listados y del listado ordenado, y una frase explicando qué diferencia ves entre la salida de `tasklist` y la de `Get-Process`.
:::

## Tarea 1.2 — El árbol de procesos

Abre el **Administrador de tareas** y, en la pestaña *Detalles*, identifica tres procesos cualesquiera y anota su **PID**. Después, abre la pestaña *Procesos* y localiza una aplicación que tenga varios procesos "colgando" de ella (por ejemplo, un navegador).

::: aviso
> Entrega: una captura señalando la relación **padre–hijo** que hayas encontrado, y una explicación de por qué crees que esa aplicación lanza varios procesos.
:::


# Día 2: La línea base del servidor

La nota de Will era clara: quiere la documentación en condiciones. Vas a construir la **línea base** (*baseline*) del servidor: el inventario de los procesos y servicios habituales, para que cualquiera —incluido tu yo del futuro— pueda distinguir de un vistazo lo normal de lo anormal.

## Tarea 2.1 — Identifica los procesos del sistema

De tu inventario del Día 1, localiza al menos **cinco procesos propios de Windows** (por ejemplo `services.exe`, `svchost.exe`, `csrss.exe`, `winlogon.exe`, `lsass.exe`) y averigua para qué sirve cada uno. Comprueba además la **ruta** desde la que se ejecutan (deberían estar en `C:\Windows\System32` o similar).

## Tarea 2.2 — La tabla de línea base

Construye una tabla con los procesos y servicios relevantes del servidor. Debe incluir, como mínimo, los cinco procesos del sistema anteriores y los servicios que veas en marcha. Usa estos campos:

| Proceso / Servicio | Función | Ruta del ejecutable | ¿Crítico? | Cómo se gestiona |
|:--------------------|:---------:|:---------------------|:---------:|:------------------:|
| `lsass.exe` | … | `C:\Windows\System32\…` | Sí | … |
| … | … | … | … | … |

::: aviso
> Entrega: la tabla completa (mínimo 8 filas). Esta tabla es la pieza central de la práctica: cuídala.
:::

# Día 3: Los servicios al mando

Los **servicios** son los demonios de Windows: trabajan en segundo plano dando funcionalidad. Vamos a practicar su gestión con uno que casi todos los servidores tienen, la **Cola de impresión** (*Print Spooler*, servicio `Spooler`).

## Tarea 3.1 — Estado de un servicio

Consulta el estado del servicio `Spooler` de dos maneras:

1. Con la consola gráfica de **Servicios** (`services.msc`).
2. Con **PowerShell** (`Get-Service`).

## Tarea 3.2 — Parar, arrancar y reiniciar

Desde PowerShell (como administrador):

1. **Detén** el servicio `Spooler`.
2. Comprueba que efectivamente está detenido.
3. **Reinícialo**.
4. Comprueba que vuelve a estar en ejecución.

::: aviso
> Entrega: la secuencia de comandos y capturas del estado del servicio en cada paso (en marcha → detenido → en marcha).
:::

# Día 4: Las incidencias de tu compañero

Aquí están las "dos cosas a medio resolver" que mencionaba la nota. Resuélvelas como lo haría un profesional: identifica primero, actúa después.

## Incidencia 1 — Un proceso desbocado

Tu compañero dejó un proceso de prueba consumiendo recursos sin control. Para **simularlo**, abre PowerShell como administrador y lanza un proceso que mantenga un núcleo de CPU ocupado:

```powershell
# Lanza una carga artificial en segundo plano (bucle infinito)
Start-Process powershell -ArgumentList '-NoProfile','-Command','while($true){}'
```

Ahora ponte en la piel del administrador que se encuentra el servidor lento:

1. Abre el **Administrador de tareas** y localiza el proceso que está disparando la
   CPU.
2. Identifícalo bien: anota su **PID** y comprueba su **ruta** (no vaya a ser uno
   legítimo).
3. **Termínalo** desde la línea de comandos con `taskkill` (o `Stop-Process`),
   usando su PID.
4. Verifica que la CPU vuelve a la normalidad.

::: aviso
> Entrega: captura del proceso disparando la CPU, el comando con el que lo terminaste y una captura del sistema ya estabilizado.
:::

## Incidencia 2 — Un servicio que debería estar en marcha

Tu compañero dejó el servicio `Spooler` configurado para **no** arrancar solo, y la
oficina se queja de que "las impresoras no van por las mañanas". Tu misión:

1. Comprueba el **tipo de inicio** actual del servicio `Spooler` (en `services.msc`,
   columna *Tipo de inicio*).
2. Cámbialo a **Automático**, para que arranque siempre con el servidor.
3. Asegúrate de que el servicio queda **en ejecución** ahora mismo.

::: aviso
> Entrega: capturas del tipo de inicio antes y después del cambio, y del estado del servicio en ejecución.
:::


# Acto 5: Un poco de orden (prioridades)

Tu compañero te ha pedido que una tarea pesada de copias de seguridad **no moleste** al resto del servidor durante el horario de oficina.

1. Lanza de nuevo un proceso cualquiera (por ejemplo, el Bloc de notas: `notepad.exe`).
2. En el **Administrador de tareas**, pestaña *Detalles*, cámbiale la **clase de prioridad** a **Por debajo de lo normal** o **Baja**.
3. Explica con tus palabras qué efecto tiene ese cambio sobre el reparto de CPU y por qué tiene sentido para una tarea de copias de seguridad.

> Entrega: captura del cambio de prioridad y tu explicación.

::: aviso
Recuerda: **nunca** uses la clase *Tiempo real* en un servidor por curiosidad. Puede dejar la máquina sin responder.
:::

# Entrega final

Reúne en un único documento, en este orden:

1. Las capturas y respuestas de cada tarea, **numeradas** como en el enunciado.
2. La **tabla de línea base** del Acto 2, que es la pieza más importante.
3. Un **breve diario de incidencias** (medio folio) en el que cuentes, como si fuera un parte de trabajo real, qué le pasaba al servidor en cada incidencia, cómo lo diagnosticaste y cómo lo resolviste.

::: tip
Un buen parte de incidencias responde siempre a tres preguntas: **¿qué pasaba?**, **¿cómo lo supe?** y **¿qué hice para arreglarlo?**. Si tus respuestas contestan a esas tres, vas bien encaminado.
:::

# Criterios de evaluación cubiertos

Esta práctica trabaja los siguientes criterios del RA2 (*Administra procesos del sistema*):

- **a)** Reconocimiento de procesos, tipos y estados (Día 1 y 2).
- **d)** Manipulación y terminación de procesos (Incidencia 1, Día 5).
- **e)** Identificación de procesos por su ruta y datos (Día 1, 2 y 4).
- **f)** Uso de herramientas gráficas y comandos de seguimiento (toda la práctica).
- **g)** Servicios del sistema y su arranque (Día 3, Incidencia 2).
- **i)** Documentación de los procesos habituales del sistema (Día 2, entrega final).
