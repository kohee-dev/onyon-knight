---
titulo: "Procesos y concurrencia"
licencia: CC-BY-NC-SA-4.0
fuentes:
  - "Vicente Martínez (IES Doctor Balmis), «1.1 Procesos, programas, hilos», «1.2 Concurrencia» y «1.3 Procesos en el SO», CC BY-NC-SA 4.0: https://psp2dam.github.io/psp_sources/es/"
  - "Luis del Moral Martínez, «01. Programación multiproceso» (v. 20.10), CC BY-NC-SA 4.0"
  - "Cambios en la adaptación «Procesos y concurrencia»: apartados repetidos unificados, explicaciones reformuladas, esquemas reconstruidos en texto, erratas de conceptos, comandos y cálculos corregidas, y figuras originales sustituidas por esquemas y tablas editables"
---

# 1. De un programa a un proceso

Cuando abrimos una aplicación, el sistema operativo no se limita a leer su archivo: debe preparar memoria, recursos y un contexto en el que ejecutar sus instrucciones.

Un **programa** es un conjunto de instrucciones que describe cómo realizar una tarea. Podemos verlo como una transformación de datos de entrada en resultados. Mientras está almacenado, es una entidad pasiva.

Un **proceso** es una instancia de un programa en ejecución. Es una entidad activa: tiene un estado, recursos asignados y una posición dentro de la ejecución del programa.

| Programa | Proceso |
| --- | --- |
| Instrucciones almacenadas. | Instancia activa de esas instrucciones. |
| Puede existir sin ejecutarse. | Tiene un ciclo de vida. |
| Un mismo programa puede ejecutarse varias veces. | Cada instancia tiene su identidad y contexto. |

Si iniciamos dos veces una aplicación de consola, normalmente obtenemos dos procesos distintos que ejecutan el mismo programa. Una aplicación también puede crear varios procesos para repartir sus tareas, como hacen muchos navegadores.

::: aviso
**Programa, aplicación, ventana y proceso no mantienen una correspondencia uno a uno.** Una aplicación puede utilizar varios procesos, y un proceso puede funcionar sin mostrar ninguna ventana.
:::

## 1.1. Qué necesita un proceso

Para ejecutarse, un proceso necesita código, datos y un contexto de ejecución. Entre la información relevante encontramos:

- **Código ejecutable:** las instrucciones que se ejecutan.
- **Espacio de direcciones:** las regiones de memoria que puede utilizar.
- **Datos y memoria dinámica:** valores y objetos con los que trabaja.
- **Pila:** llamadas pendientes, variables locales y otra información de ejecución.
- **Contador de programa y registros:** permiten saber por dónde continúa cada flujo de ejecución.
- **Recursos abiertos:** archivos, conexiones y otros objetos gestionados por el sistema.

El sistema mantiene estructuras de control, habitualmente explicadas mediante el **PCB** (*Process Control Block* o bloque de control de proceso), con datos como identificador, estado, planificación y recursos. En sistemas con varios hilos, parte del contexto de ejecución se mantiene por hilo.

# 2. El sistema operativo y la gestión de procesos

El **kernel** administra los recursos del sistema y ofrece mecanismos controlados para utilizarlos mediante **llamadas al sistema**. Crear procesos, esperar a que terminen o acceder a dispositivos son operaciones que requieren su intervención.

Cuando deja de ejecutarse una tarea y pasa a ejecutarse otra, hay que guardar el contexto necesario y recuperar el de la siguiente. Este trabajo se denomina **cambio de contexto**. Hace posible compartir el procesador, pero consume tiempo y recursos.

## 2.1. Identidad y relaciones entre procesos

En Linux utilizamos dos identificadores importantes:

| Identificador | Significado |
| --- | --- |
| **PID** | Identifica un proceso dentro del espacio de identificadores correspondiente. |
| **PPID** | Identifica a su proceso padre. |

El **padre** crea otro proceso, llamado **hijo**. Ambos pueden seguir ejecutándose y el padre puede esperar la terminación del hijo o intercambiar información con él.

En un sistema Linux habitual, el primer proceso de usuario tiene PID 1 y cumple la función de inicialización; con frecuencia es `systemd`. Cuando un proceso queda huérfano, puede ser adoptado por un proceso encargado de recoger descendientes o por el proceso de inicialización correspondiente.

::: nota
Los comandos internos del shell, como `cd`, no necesitan crear un proceso externo para funcionar. Ejecutar una orden en una terminal no implica siempre crear un proceso nuevo.
:::

## 2.2. Estados de un proceso

Utilizaremos este modelo didáctico de cinco estados:

| Estado | Qué significa |
| --- | --- |
| **Nuevo** | Se está creando el proceso y preparando sus recursos. |
| **Listo o preparado** | Puede ejecutarse, pero espera tiempo de procesador. |
| **En ejecución** | Está ejecutando instrucciones en una unidad de ejecución. |
| **Bloqueado o en espera** | Espera un evento, datos o un recurso; todavía no puede continuar. |
| **Terminado** | Ha finalizado su ejecución. |

```text
Nuevo ──admisión──> Listo ──selección──> En ejecución ──fin──> Terminado
                     ^                     |
                     |<──fin de turno──────|
                     |                     |
                     |                  espera de E/S
                     |                     v
                     └──evento resuelto── Bloqueado
```

**Listo y bloqueado no significan lo mismo.** Un proceso listo solo necesita que le concedan CPU. Uno bloqueado necesita que ocurra algo antes de poder ejecutarse.

Cuando termina una operación de entrada/salida, el proceso vuelve a la cola de preparados. No pasa necesariamente a ejecutarse inmediatamente.

::: tip
Una aplicación pide un dato por teclado. Mientras espera, puede estar bloqueada y dejar libre el procesador para otros trabajos. Cuando recibe el dato, vuelve a estar preparada para continuar.
:::

El modelo es una simplificación. Los sistemas reales presentan otros estados y matices. En Unix, un **zombi** es un proceso que ya ha terminado pero conserva información mínima, como su estado de salida, hasta que el padre u otro proceso responsable la recoge. No está ejecutando instrucciones.

:::pregunta[Explica por qué un proceso bloqueado no debe ocupar CPU esperando activamente.]
Un proceso bloqueado espera un evento, datos o un recurso y todavía no puede continuar, así que usar la CPU no le haría avanzar. Al estar bloqueado deja libre el procesador para otros trabajos, y vuelve a la cola de preparados cuando el evento se resuelve.
:::

# 3. Observar y controlar procesos

## 3.1. En GNU/Linux

Los siguientes comandos se ejecutan en una terminal Linux. Los PID y los resultados serán distintos en cada equipo.

```bash
# Identificadores del shell y de su padre, en Bash.
echo $$
echo $PPID

# Procesos con información ampliada.
ps -ef

# Selección de columnas y representación jerárquica.
ps -eo pid,ppid,stat,ni,comm --forest

# PID de los procesos que ejecutan este programa, si existen.
pidof bash

# Vista que se actualiza durante la ejecución; se sale con q.
top
```

`ps` muestra una instantánea. `top` actualiza la información periódicamente. `pidof` devuelve identificadores, no los nombres de los procesos.

### Señales

Las **señales** notifican eventos a procesos. `kill` sirve para enviarlas; su nombre no significa que todas las señales terminen el proceso.

Podemos practicar con un proceso creado por nosotros desde Bash:

```bash
sleep 120 &
pid_prueba=$!
ps -p "$pid_prueba" -o pid,ppid,stat,comm
kill -TERM "$pid_prueba"
wait "$pid_prueba"
```

`&` inicia el trabajo en segundo plano y `$!` permite obtener su PID. `SIGTERM` solicita la terminación y puede ser gestionada por el programa. `SIGKILL`, enviada con `kill -KILL PID` o `kill -9 PID`, fuerza la terminación y no permite ejecutar una rutina propia de limpieza.

::: aviso
Practica sobre los procesos que has creado. **`kill -9 PID` y `kill 9 PID` no son equivalentes:** el guion forma parte de la opción que selecciona la señal.
:::

### Prioridad

El valor **nice** influye en la prioridad de planificación de procesos ordinarios. En Linux suele ir de `-20` a `19`: un valor menor favorece al proceso frente a otros de la misma clase de planificación.

```bash
nice -n 10 sleep 60
```

Un usuario puede normalmente reducir la prioridad de sus procesos aumentando su valor nice. Elevarla suele requerir privilegios. **Modificar nice no garantiza una velocidad concreta**, porque también influyen la carga y los recursos que necesita el programa.

## 3.2. En Windows

El Administrador de tareas permite consultar procesos, consumo y PID. Desde la consola también podemos utilizar:

```bat
tasklist
tasklist /svc /fi "imagename eq svchost.exe"
```

Para finalizar un proceso de prueba identificado previamente se puede utilizar `taskkill /PID PID_REAL`; `/F` solicita finalización forzada. Sustituye `PID_REAL` por el identificador de tu proceso de prueba.

`taskkill` no es una interfaz general equivalente al envío de todas las señales de Unix. Los mecanismos disponibles dependen del sistema operativo.

:::pregunta[Localiza el PID y PPID de un proceso propio y explica su relación.]
Con `echo $$` y `echo $PPID` se obtienen el PID del shell y el de su padre; también se ven con `ps -eo pid,ppid,stat,ni,comm --forest`. El PID identifica al proceso y el PPID identifica a su padre, el proceso que lo creó.
:::

# 4. Planificación: quién utiliza el procesador

El **planificador** decide qué tarea preparada recibe tiempo de CPU. El sistema organiza la información mediante colas de preparados y de espera de eventos o dispositivos.

En el modelo clásico distinguimos:

- **Planificación a largo plazo:** admisión de nuevos trabajos y control del grado de multiprogramación.
- **Planificación a corto plazo:** selección frecuente de la siguiente tarea que va a ejecutarse.

Una política **sin desalojo** permite continuar hasta que la tarea termine o se bloquee. Una política **con desalojo o apropiativa** puede retirarle la CPU antes, por ejemplo al agotarse un turno o cuando aparece una tarea de mayor prioridad.

## 4.1. Criterios de comparación

| Criterio | Qué mide |
| --- | --- |
| **Tiempo de espera** | Tiempo en la cola de preparados, esperando CPU. |
| **Tiempo de retorno** | Tiempo entre la llegada y la finalización. |
| **Tiempo de respuesta inicial** | Tiempo hasta recibir por primera vez atención de CPU en nuestros ejercicios. |
| **Utilización de CPU** | Proporción del tiempo disponible que permanece ocupada. |
| **Productividad o throughput** | Trabajos completados por unidad de tiempo. |

El tiempo bloqueado por E/S forma parte del retorno, pero no del tiempo de espera en la cola de preparados. En ejercicios sin E/S, el tiempo de espera es el retorno menos el tiempo de CPU requerido.

## 4.2. Algoritmos básicos

| Algoritmo | Criterio | Aspecto que debemos vigilar |
| --- | --- | --- |
| **FCFS o FIFO** | Atiende por orden de llegada. | Un trabajo largo puede retrasar a muchos cortos. |
| **SJF** | Selecciona el trabajo preparado con menor ráfaga de CPU estimada. | Hay que estimar su duración; los largos pueden sufrir inanición. |
| **Prioridades** | Selecciona la tarea preparada de mayor prioridad. | Las de baja prioridad pueden quedar relegadas. |
| **Round Robin** | Reparte turnos de hasta un quantum entre los preparados. | Un quantum pequeño aumenta cambios de contexto; uno grande retrasa la respuesta de otros. |

La **inanición** consiste en esperar indefinidamente porque otras tareas reciben siempre preferencia. Una medida posible es aumentar gradualmente la prioridad de las que llevan mucho tiempo esperando.

SJF puede estudiarse sin desalojo; su variante apropiativa elige el menor tiempo restante. Las prioridades también pueden aplicarse con o sin desalojo. Los planificadores reales combinan criterios y no deben identificarse automáticamente con uno de estos modelos simplificados.

## 4.3. Ejemplo comparado

Supondremos una CPU, ausencia de E/S y cambios de contexto de coste cero. **Un número menor indica mayor prioridad** en este ejemplo.

| Proceso | Llegada | Tiempo de CPU | Prioridad |
| --- | --- | --- | --- |
| P1 | 0 | 10 | 5 |
| P2 | 1 | 6 | 10 |
| P3 | 2 | 3 | 7 |

### FCFS

```text
0          10      16   19
|    P1     |  P2   | P3 |
```

P2 espera de 1 a 10: nueve unidades. P3 espera de 2 a 16: catorce.

| Proceso | Finalización | Espera | Retorno |
| --- | --- | --- | --- |
| P1 | 10 | 0 | 10 |
| P2 | 16 | 9 | 15 |
| P3 | 19 | 14 | 17 |
| **Media** | — | **7,67** | **14** |

### SJF sin desalojo y prioridades sin desalojo

En el instante 0 solo ha llegado P1, por lo que comienza y termina antes de seleccionar otro. Después, SJF elige P3 por ser más corto. La política de prioridades también selecciona P3 antes que P2 con los valores dados.

```text
0          10   13      19
|    P1     | P3 |  P2   |
```

| Proceso | Finalización | Espera | Retorno |
| --- | --- | --- | --- |
| P1 | 10 | 0 | 10 |
| P2 | 19 | 12 | 18 |
| P3 | 13 | 8 | 11 |
| **Media** | — | **6,67** | **13** |

### Round Robin con quantum 2

Para resolver los empates, incorporamos las llegadas de un instante antes de volver a encolar el proceso cuyo turno termina en ese instante.

| Intervalo | Proceso |
| --- | --- |
| 0–2 | P1 |
| 2–4 | P2 |
| 4–6 | P3 |
| 6–8 | P1 |
| 8–10 | P2 |
| 10–11 | P3, termina |
| 11–13 | P1 |
| 13–15 | P2, termina |
| 15–17 | P1 |
| 17–19 | P1, termina |

| Proceso | Finalización | Espera | Retorno |
| --- | --- | --- | --- |
| P1 | 19 | 9 | 19 |
| P2 | 15 | 8 | 14 |
| P3 | 11 | 6 | 9 |
| **Media** | — | **7,67** | **14** |

Los tres modelos mantienen ocupada la CPU durante 19 unidades. La productividad es `3 / 19 ≈ 0,158` procesos por unidad de tiempo. Round Robin no mejora aquí la espera media frente a FCFS, pero permite que todos reciban CPU antes de que termine P1.

### Qué cambia con dos unidades de ejecución

Con FCFS, P1 puede ejecutarse de 0 a 10 en una unidad y P2 de 1 a 7 en otra. P3 espera desde 2 hasta 7 y termina en 10. El retorno medio es 8, la espera media es aproximadamente 1,67, la utilización conjunta es `19 / (2 × 10) = 95 %` y la productividad es `3 / 10 = 0,3`.

::: aviso
Los resultados dependen del modelo y de las reglas de desempate. **No basta con memorizar una tabla:** dibuja primero los intervalos y calcula después llegada, finalización y espera.
:::

## 4.4. Procesos que se bloquean por entrada/salida

Los procesos reales alternan ráfagas de CPU con esperas. Mientras uno espera una lectura, otro puede avanzar.

Ejemplo: P1 y P2 llegan en 0. P1 necesita dos unidades de CPU, tres de E/S y una última de CPU. P2 necesita cuatro unidades de CPU. Con FCFS sin desalojo:

```text
CPU: 0–2 P1 | 2–6 P2 | 6–7 P1
E/S:          2–5 P1
```

En 5, P1 vuelve a estar listo, pero espera hasta que P2 termina en 6. **Finalizar la E/S no equivale a recuperar inmediatamente la CPU.**

:::pregunta[Dibuja la planificación FCFS y Round Robin del ejemplo sin consultar la solución.]
FCFS: P1 de 0 a 10, P2 de 10 a 16 y P3 de 16 a 19. Round Robin con quantum 2: P1 0–2, P2 2–4, P3 4–6, P1 6–8, P2 8–10, P3 10–11 (termina), P1 11–13, P2 13–15 (termina), P1 15–19 (termina).
:::

# 5. Concurrencia y paralelismo

La **concurrencia** permite que varias tareas progresen durante periodos que se solapan. La **ejecución paralela** implica que se ejecutan instrucciones de distintas tareas al mismo tiempo en diferentes unidades de ejecución.

```text
Secuencial:       CPU 1: A A A B B B
Concurrente:     CPU 1: A B A B A B
Paralelo:        CPU 1: A A A
                 CPU 2: B B B
```

En una única unidad de ejecución podemos obtener concurrencia alternando tareas. Con varios núcleos también podemos realizar trabajo en paralelo. El sistema combina ambos comportamientos según las tareas preparadas.

No confundamos los **hilos de un programa** con los **procesadores lógicos** que anuncia una CPU. Una máquina de 8 núcleos y 16 procesadores lógicos puede mantener miles de hilos de software, aunque no ejecuta todos simultáneamente. Los procesadores lógicos de un mismo núcleo comparten recursos.

## 5.1. Para qué sirve

La concurrencia ayuda a mantener una interfaz sensible, atender varios clientes y aprovechar tiempos de espera de E/S. Separar tareas puede mejorar la organización y el aislamiento de fallos. El paralelismo puede acelerar trabajos que puedan dividirse, como procesar lotes de imágenes o realizar simulaciones.

Pero también introduce costes: creación y coordinación, consumo de memoria, comunicación y mayor dificultad de depuración. **Más tareas o más núcleos no garantizan una mejora proporcional**, especialmente si existen dependencias o un recurso compartido limita el trabajo.

# 6. Hilos y servicios

Un **hilo** es un flujo de ejecución dentro de un proceso. Un proceso tiene al menos uno y puede contener varios. Cada hilo dispone de su estado de ejecución y su pila, mientras comparte con otros hilos del proceso recursos como la memoria y los archivos abiertos.

| Aspecto | Procesos | Hilos de un mismo proceso |
| --- | --- | --- |
| Memoria | Espacios de direcciones separados por defecto. | Comparten el espacio del proceso. |
| Comunicación | Requieren mecanismos IPC. | Pueden acceder a datos comunes, con sincronización cuando proceda. |
| Aislamiento | Generalmente mayor. | Un fallo puede afectar al proceso completo. |
| Coste | Crear y gestionar procesos suele ser más costoso. | Suelen ser unidades más ligeras. |

El modelo de gestión de hilos depende de la plataforma: existen hilos planificados por el SO y otros gestionados por un entorno de ejecución. No podemos afirmar que todos los hilos sean gestionados únicamente por el programa.

En Java estudiaremos más adelante `Thread` y `Runnable`. Una aplicación concurrente también puede estar formada por **varios procesos monohilo**, sin que cada uno deba ser multihilo.

Un **servicio** ofrece una funcionalidad a otros programas. Puede iniciarse durante el arranque o bajo demanda y suele trabajar sin interacción directa con el usuario. Puede utilizar varios procesos, varios hilos o un modelo basado en eventos; ser servicio no obliga a utilizar un diseño concreto.

:::pregunta[Distingue un programa, dos procesos del mismo programa y dos hilos de un proceso.]
Un programa son instrucciones almacenadas, una entidad pasiva. Dos procesos del mismo programa son dos instancias en ejecución, cada una con su identidad y contexto. Dos hilos de un proceso son flujos de ejecución dentro de un mismo proceso: cada uno tiene su pila, pero comparten la memoria y los archivos abiertos.
:::

# 7. Comunicación, coordinación y datos compartidos

Los procesos pueden **colaborar** para resolver un problema y **competir** por CPU, memoria o dispositivos. Necesitan mecanismos para intercambiar datos y coordinar sus acciones.

- **Comunicación:** transmite información mediante tuberías, mensajes, sockets o memoria compartida, entre otros mecanismos.
- **Sincronización:** establece cuándo puede continuar una tarea o acceder a un recurso.
- **Exclusión mutua:** evita accesos simultáneos incompatibles a una sección crítica.

Una **sección crítica** es una parte del programa que accede a un recurso compartido que necesita protección. La exclusión mutua es una solución de coordinación, no el nombre del error.

## 7.1. Condiciones de carrera

Supongamos que dos tareas comparten `contador`, inicialmente a cero, y ambas lo incrementan. Incrementar implica conceptualmente leer, sumar y escribir. Puede ocurrir:

| Paso | Tarea A | Tarea B |
| --- | --- | --- |
| 1 | Lee 0. | |
| 2 | | Lee 0. |
| 3 | Calcula y escribe 1. | |
| 4 | | Calcula y escribe 1. |

El resultado es 1 en lugar de 2. Es una **actualización perdida** provocada por una ejecución sin la coordinación necesaria. No se soluciona suponiendo que una tarea «normalmente termina antes».

En el ejemplo original de dos tareas que ejecutan cinco incrementos cada una, la ejecución secuencial produce 10. Si comparten el contador y trabajan concurrentemente sin protección, no puede garantizarse ese resultado.

::: nota
Las palabras `cobegin` y `coend` que aparecen en algunos esquemas son **pseudocódigo**, no instrucciones de Java. Representan el inicio concurrente y la espera de las tareas.
:::

En programación concurrente existe un **orden parcial**: cada tarea conserva su secuencia y la sincronización impone relaciones entre tareas. Un orden de mensajes diferente no es necesariamente un error; sí lo es incumplir el resultado o las restricciones exigidas.

La **comunicación síncrona** coordina a los participantes en un punto del intercambio; una operación puede bloquearse hasta cumplir su condición. En una comunicación asíncrona, el envío puede completarse antes de que el receptor procese el mensaje. El comportamiento concreto depende de la API, los buffers y el protocolo.

Otros problemas son el **interbloqueo**, cuando varias tareas esperan recursos retenidos entre sí, y la inanición. Diseñar el orden de acceso y las esperas forma parte del programa.

## 7.2. Condiciones de Bernstein

Podemos analizar dependencias de datos mediante dos conjuntos para cada tarea `Si`:

- `L(Si)`: variables que lee.
- `E(Si)`: variables que escribe.

Para considerar independientes dos tareas respecto a estos accesos, deben cumplirse:

```text
L(Si) ∩ E(Sj) = ∅
E(Si) ∩ L(Sj) = ∅
E(Si) ∩ E(Sj) = ∅
```

No debe haber una escritura que interfiera con una lectura de la otra tarea, ni dos escrituras sobre el mismo dato. Leer un dato común no impide por sí mismo la concurrencia.

| Sentencia | Lecturas | Escrituras |
| --- | --- | --- |
| S1: `a = x + y` | x, y | a |
| S2: `b = z - 1` | z | b |
| S3: `c = a - b` | a, b | c |
| S4: `w = c + 1` | c | w |

S1 y S2 pueden realizarse concurrentemente si no hay otras dependencias. S3 necesita sus resultados y S4 necesita el de S3:

```text
S1 ──┐
     ├──> S3 ──> S4
S2 ──┘
```

::: aviso
Aunque S1 y S4 no compartan variables directamente, **S4 depende indirectamente de S1 a través de S3**. Hay que estudiar el conjunto del programa, no solo una pareja aislada. Las condiciones tampoco sustituyen el análisis de archivos, red y otros efectos externos.
:::

:::pregunta[Explica por qué `contador++` puede necesitar protección cuando se comparte.]
Incrementar implica leer, sumar y escribir. Si dos tareas leen el mismo valor antes de que la otra escriba, una actualización se pierde (el resultado es 1 en lugar de 2). Una sección crítica así necesita exclusión mutua.
:::

:::pregunta[Justifica el orden S1/S2 → S3 → S4 mediante sus lecturas y escrituras.]
S1 (lee x, y; escribe a) y S2 (lee z; escribe b) no comparten lecturas ni escrituras, así que pueden ir concurrentemente. S3 lee a y b, que escriben S1 y S2, por lo que debe ir después; y S4 lee c, que escribe S3, por lo que va al final.
:::

# 8. Sistemas distribuidos

En un **sistema distribuido**, los componentes se ejecutan en distintos equipos y se coordinan mediante comunicaciones. Por ejemplo, una aplicación puede separar la interfaz, el procesamiento de pedidos y el almacenamiento en diferentes servidores.

Estos sistemas permiten compartir recursos, repartir carga y crecer incorporando equipos. El **escalado vertical** aumenta los recursos de una máquina; el **horizontal** añade máquinas o instancias.

La distribución introduce retos propios: latencia, pérdida de conectividad, seguridad y fallos parciales. No podemos suponer un reloj perfectamente compartido ni que un componente caído implique que todos los demás se hayan detenido.

::: aviso
**Los fallos pueden ser independientes, pero sus efectos pueden propagarse.** La alta disponibilidad requiere diseño; distribuir una aplicación no la hace tolerante a fallos automáticamente.
:::

La comunicación puede apoyarse en sockets, llamadas a procedimientos remotos (**RPC**) o invocación remota de objetos, como **RMI** en Java. Las simulaciones científicas y el procesamiento de grandes volúmenes de datos son ámbitos habituales. El material complementario presenta **PVM, Parallel Virtual Machine**, como referencia histórica de entornos de computación paralela y distribuida.

:::pregunta[Indica una ventaja y un coste de distribuir una aplicación entre equipos.]
Una ventaja es compartir recursos, repartir carga y crecer añadiendo equipos (escalado horizontal). Un coste son los retos propios de la distribución: latencia, pérdida de conectividad, seguridad y fallos parciales.
:::

# 9. Ampliación: procesos Unix desde C

UD1 presenta las interfaces de C que ayudan a entender qué hay debajo de las herramientas de alto nivel. No es necesario dominarlas para comenzar con `ProcessBuilder`.

| Interfaz | Función |
| --- | --- |
| `fork()` | Crea un hijo. Devuelve 0 en el hijo, el PID del hijo en el padre y -1 si falla. |
| Familia `exec`, como `execl()` | Sustituye la imagen del proceso por otro programa; no crea otro PID por sí sola. |
| `system()` | Solicita la ejecución de una orden mediante un intérprete de comandos. |
| `pipe()` | Crea los extremos de lectura y escritura de una tubería. |
| `read()` y `write()` | Leen y escriben bytes mediante descriptores. |
| `close()` | Cierra un descriptor. |
| `wait()` y `waitpid()` | Esperan o recogen información de terminación de hijos. |
| `sigaction()` / `signal()` | Configuran el tratamiento de señales, con diferencias de interfaz. |
| `kill()` | Envía una señal. |
| `pause()` y `sleep()` | Permiten esperar una señal o suspender la ejecución durante un intervalo. |

Tras `fork()`, padre e hijo tienen espacios de memoria separados, aunque el sistema pueda optimizar la copia. Los descriptores heredados pueden referirse a recursos comunes. Una tubería ordinaria es un canal de bytes, no un archivo de disco; para comunicación bidireccional se pueden utilizar dos tuberías.

::: aviso
`execl()` no concede privilegios de administrador por sí mismo. Además, una lectura de una tubería vacía puede esperar si siguen abiertos extremos de escritura, o devolver fin de archivo si ya no queda ningún escritor.
:::
