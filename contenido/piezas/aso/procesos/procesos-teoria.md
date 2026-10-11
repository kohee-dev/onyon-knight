---
titulo: "Procesos del sistema"
---

Cada vez que arrancas el ordenador, antes incluso de que veas el escritorio, hay
decenas de programas trabajando: comprueban el hardware, montan los discos,
levantan la red y dejan todo listo para ti. Cada uno de esos programas en marcha
es un **proceso**, y administrarlos —saber cuáles hay, qué hacen, cuánto consumen
y cómo arrancarlos o pararlos— es una de las tareas más cotidianas de cualquier
persona que administre sistemas.

Este documento reúne los **conceptos generales**, comunes a cualquier sistema
operativo. La idea no es que memorices comandos, sino que comprendas el modelo:
una vez que lo tengas claro, las herramientas concretas de cada sistema te
resultarán casi intuitivas.

::: nota
Este tema se divide en tres documentos: estos **conceptos generales**, y luego su
aplicación concreta en **Procesos del sistema en Linux** y en **Procesos del
sistema en Windows**. Los conceptos de fondo (proceso, hilo, estado, prioridad)
son los mismos en ambos; lo que cambia es el vocabulario y las herramientas.
:::



# 1. ¿Qué es un proceso?

Conviene empezar distinguiendo dos palabras que en el lenguaje corriente usamos
casi como sinónimos: **programa** y **proceso**.

Un **programa** es algo *estático*: un archivo guardado en el disco que contiene
instrucciones y datos. Por ejemplo, `/usr/bin/firefox` o `firefox.exe`. Mientras
está ahí parado, no hace nada.

Un **proceso** es ese programa *en ejecución*: lo que ocurre cuando el sistema
carga esas instrucciones en memoria y la CPU empieza a ejecutarlas. Es algo
*dinámico*, vivo, que ocupa recursos y cambia con el tiempo.

::: tip
Una analogía útil: el programa es la **receta** escrita en un libro de cocina, y
el proceso es el acto de **cocinar** ese plato. Una misma receta (programa) puede
estarse cocinando varias veces a la vez en distintas ollas (varios procesos), cada
una en un punto distinto de la elaboración.
:::

De hecho, esa última idea es importante: de un mismo programa puede haber **varios
procesos simultáneos**. Si abres tres ventanas de la calculadora, hay un programa
en disco pero tres procesos independientes en memoria, cada uno con sus propios
datos.

## 1.1 ¿Qué guarda el sistema de cada proceso?

Para gestionar un proceso, el sistema operativo mantiene una ficha interna con
toda su información. En la teoría de sistemas operativos esa ficha se llama
**Bloque de Control de Proceso** (*Process Control Block*, **PCB**). Contiene,
entre otras cosas:

- El **identificador de proceso** o **PID** (*Process ID*): un número único que
  el sistema asigna a cada proceso para poder referirse a él.
- El **identificador del proceso padre** o **PPID**: el PID del proceso que lo
  creó (enseguida veremos que los procesos forman una jerarquía).
- El **estado** actual (en ejecución, esperando, etc.).
- El **contexto de CPU**: el valor de los registros, incluido el contador de
  programa, para poder reanudar el proceso justo donde se quedó.
- El **espacio de direcciones** de memoria que ocupa.
- Las **credenciales**: el usuario y grupo propietarios, que determinan sus
  permisos.
- La lista de **recursos abiertos**: archivos, conexiones de red, dispositivos…

::: nota
Cada sistema implementa esta ficha con su propia estructura interna: en Linux
forma parte de las estructuras del núcleo, y en Windows se denomina **EPROCESS**.
El concepto, sin embargo, es el mismo en todos.
:::

## 1.2 La memoria de un proceso

El espacio de direcciones de un proceso se organiza, a grandes rasgos, en cuatro
regiones que conviene conocer:

| Región | Contiene |
|--------|----------|
| **Código** (*text*) | Las instrucciones del programa. Suele ser de solo lectura. |
| **Datos** | Variables globales y estáticas. |
| **Montículo** (*heap*) | Memoria reservada dinámicamente durante la ejecución. Crece según hace falta. |
| **Pila** (*stack*) | Variables locales y la información de las llamadas a funciones. |

Cada proceso tiene su propio espacio de direcciones y, en condiciones normales,
**no puede leer ni escribir la memoria de otro proceso**. Este aislamiento es una
de las grandes garantías de estabilidad y seguridad del sistema: si un programa
falla y corrompe su memoria, no se lleva por delante a los demás.

## 1.3 Tipos de procesos

No todos los procesos son iguales. Podemos clasificarlos según cómo interactúan
con el usuario y qué papel cumplen:

- **Procesos interactivos**: los lanza una persona desde el terminal o la interfaz
  gráfica y dialogan con ella (un editor de texto, un navegador).
- **Procesos por lotes** (*batch*): se ejecutan sin intervención del usuario,
  normalmente programados para una hora o como parte de una cola de trabajos.
- **Procesos en segundo plano** (*background*): siguen funcionando sin ocupar el
  terminal, a menudo a la espera de eventos.
- **Demonios** (Linux) o **servicios** (Windows): procesos del sistema que se
  ejecutan continuamente en segundo plano para ofrecer una funcionalidad (el
  servidor web, el de impresión, el de SSH…).



# 2. Procesos, hilos y trabajos

El módulo nos pide diferenciar tres conceptos que se confunden con frecuencia:
**proceso**, **hilo** y **trabajo**. Vamos uno por uno.

## 2.1 Hilos de ejecución

Hasta ahora hemos hablado del proceso como si solo pudiera hacer una cosa a la
vez. En realidad, dentro de un proceso pueden existir varios **hilos de ejecución**
(*threads*). Un hilo es la unidad mínima que la CPU planifica y ejecuta: es, si
quieres, un "hilo de actividad" que recorre el código del proceso.

La diferencia clave con un proceso es lo que comparten:

- Los **hilos de un mismo proceso comparten** el código, los datos y el montículo,
  y los recursos abiertos.
- Cada hilo tiene, en cambio, su **propia pila** y su propio contexto de CPU
  (registros, contador de programa).

Esto hace que crear y cambiar entre hilos sea mucho más **ligero y rápido** que
hacerlo entre procesos, y que los hilos puedan comunicarse fácilmente a través de
la memoria que comparten. A cambio, esa comunicación hay que sincronizarla con
cuidado, porque si dos hilos tocan el mismo dato a la vez pueden corromperlo.

::: tip
Piensa en un proceso como una **oficina** (con su mobiliario y archivos
compartidos) y en los hilos como los **empleados** que trabajan dentro: cada uno
hace su tarea en su mesa, pero todos comparten los mismos armarios. Por eso un
navegador moderno puede cargar varias pestañas "a la vez": son hilos (o procesos)
distintos dentro de la misma aplicación.
:::

## 2.2 Trabajos

El término **trabajo** (*job*) procede del mundo de los intérpretes de comandos
(*shells*). Cuando lanzas una orden desde el terminal, la shell la trata como un
trabajo, le asigna un número y te permite controlarlo: enviarlo a segundo plano,
traerlo de vuelta o detenerlo. Un trabajo puede corresponder a un solo proceso o a
**varios procesos encadenados** mediante una tubería (`comando1 | comando2`), que
la shell gestiona como una sola unidad.

Históricamente, en los grandes sistemas por lotes, un "trabajo" era cada tarea que
se enviaba a la cola para ejecutarse cuando hubiera recursos. La idea es la misma:
una unidad de trabajo que el sistema gestiona como un todo.

## 2.3 Resumen comparativo

| | **Proceso** | **Hilo** | **Trabajo** |
|---|---|---|---|
| **Qué es** | Programa en ejecución | Unidad de ejecución dentro de un proceso | Tarea que gestiona la shell o el sistema por lotes |
| **Memoria** | Propia y aislada | Compartida con los hilos del proceso | La de su(s) proceso(s) |
| **Coste de creación** | Alto | Bajo | — (es una agrupación lógica) |
| **Identificador** | PID | TID (*Thread ID*) | Número de trabajo (`%1`, `%2`…) |
| **Aislamiento** | Total entre procesos | Ninguno entre hilos del mismo proceso | — |



# 3. Estados y ciclo de vida de un proceso

Un proceso no está "ejecutándose" todo el tiempo. En realidad pasa la mayor parte
de su vida **esperando**: esperando a la CPU, a que termine una lectura de disco o
a que el usuario pulse una tecla. El sistema operativo modela esa situación
mediante un conjunto de **estados** por los que el proceso va transitando.

## 3.1 Los estados básicos

Aunque cada sistema usa sus propios nombres, el modelo teórico clásico distingue
cinco estados:

- **Nuevo**: el proceso se está creando.
- **Listo** (*ready*): está preparado para ejecutarse y solo espera a que la CPU
  quede libre.
- **En ejecución** (*running*): la CPU está ejecutando sus instrucciones en este
  instante.
- **Bloqueado** o **en espera** (*waiting*/*blocked*): no puede continuar hasta que
  ocurra algún evento (que termine una operación de E/S, que llegue un dato…).
- **Terminado**: ha finalizado y el sistema está liberando sus recursos.

## 3.2 Transiciones entre estados

Los procesos saltan de un estado a otro según unas reglas bien definidas. Estas
son las transiciones fundamentales:

```
        admisión                    elección del planificador
  Nuevo ─────────► Listo ◄───────────────────────────┐
                     │                               │
   planificador ─────┤ (se le asigna la CPU)         │ (vuelve a estar
   le da la CPU      ▼                               │  preparado)
                 En ejecución ──────────────────► Listo
                     │   │                            ▲
       fin /         │   │  pide E/S o espera evento  │  el evento ocurre
       exit()        │   └──────────► Bloqueado ──────┘
                     ▼
                 Terminado
```

Fíjate en un matiz importante: un proceso que está ejecutándose puede volver a
**Listo** sin haber terminado ni haberse bloqueado. Ocurre cuando el planificador
le **retira la CPU** para dársela a otro (porque se le ha agotado su turno o porque
ha llegado otro proceso más prioritario). A esta capacidad de "quitar" la CPU se la
llama **expropiación** o **apropiación** (*preemption*), y es lo que permite que el
sistema reparta el procesador entre muchos procesos dando la sensación de que se
ejecutan a la vez.

## 3.3 Procesos zombi y huérfanos

Dos situaciones particulares que conviene conocer porque aparecen a menudo:

- Un **proceso zombi** es uno que **ya ha terminado** pero cuya entrada sigue en la
  tabla de procesos porque su padre todavía no ha leído su código de salida. No
  consume CPU ni memoria de datos; solo ocupa una entrada. Si se acumulan muchos,
  suele indicar un fallo de programación en el proceso padre.
- Un **proceso huérfano** es aquel cuyo **padre ha muerto antes que él**. Para que
  no quede sin "tutor", el sistema lo **adopta** (en Linux pasa a depender del
  primer proceso del sistema), que se encargará de recoger su salida al terminar.

::: aviso
No confundas zombi con huérfano. El **zombi** ya está muerto y espera a que lo
"entierren"; el **huérfano** sigue vivo, solo que ha perdido a su padre y otro lo
adopta.
:::

---

# 4. Planificación y prioridades

Como en un equipo normal hay muchos más procesos que núcleos de CPU, alguien tiene
que decidir **a quién le toca la CPU y durante cuánto tiempo**. De eso se encarga
el **planificador** (*scheduler*) del sistema operativo.

El planificador reparte la CPU en pequeñas porciones de tiempo llamadas
**quantum** o *time slice*. Cuando un proceso agota su quantum, el planificador lo
devuelve a la cola de listos y le cede la CPU a otro. Todo esto sucede miles de
veces por segundo, tan rápido que percibimos los programas como si funcionaran
simultáneamente. A este reparto se le llama **multitarea apropiativa**, porque el
sistema puede expropiar la CPU a un proceso aunque este no la suelte por su cuenta.

Para decidir el orden, cada proceso tiene una **prioridad**: a mayor prioridad,
antes y más a menudo lo atiende el planificador. Cada sistema gestiona la prioridad
con su propio mecanismo (el valor *nice* en Linux, las clases de prioridad en
Windows), que veremos en los documentos correspondientes.

::: aviso
Subir la prioridad de un proceso no lo hace "más rápido" por arte de magia: solo
hace que el sistema lo atienda antes que a otros. Usado sin criterio puede dejar al
resto del sistema sin CPU y volverlo inestable.
:::



# 5. Interrupciones y excepciones

El procesador no se entera por sí solo de que ha llegado un dato por la red o de
que has pulsado una tecla. El mecanismo que permite a la CPU reaccionar a esos
sucesos son las **interrupciones** y las **excepciones**: son los "avisos" que
hacen que el procesador deje lo que está haciendo y atienda algo más urgente.

- Una **interrupción** (normalmente *hardware*) la genera un dispositivo externo:
  el teclado, la tarjeta de red, el disco… Cuando el dispositivo necesita atención,
  envía una señal y la CPU suspende el proceso actual para ejecutar una pequeña
  rutina de atención (la *Interrupt Service Routine*).
- Una **excepción** (o interrupción *software*) la provoca la propia ejecución del
  programa: una división por cero, un acceso a una dirección de memoria no válida o
  una **llamada al sistema** (*system call*) con la que el proceso pide
  expresamente un servicio al núcleo.

Aquí aparece un concepto esencial: los dos **modos de ejecución**. El procesador
trabaja en **modo usuario** cuando ejecuta el código normal de las aplicaciones, y
cambia a **modo núcleo** (o modo supervisor) cuando atiende una interrupción o una
llamada al sistema, momento en el que tiene acceso completo al hardware. Esta
separación es la que impide que un programa cualquiera toque directamente el
hardware o la memoria de otros: para hacer casi cualquier cosa "real" (leer un
archivo, abrir un socket, crear un proceso) tiene que **pedírselo al núcleo**
mediante una llamada al sistema.

::: nota
Cada vez que un proceso ejecuta una orden como abrir un fichero o crear otro
proceso, por debajo hay una llamada al sistema que provoca un cambio momentáneo a
modo núcleo. Entender esto explica por qué el contador de procesos y la actividad
de la CPU suben aunque "no estés haciendo nada": el sistema está atendiendo
continuamente interrupciones y peticiones.
:::



# 6. La jerarquía de procesos

Una idea central, válida en cualquier sistema: **todo proceso (salvo el primero) lo
crea otro proceso**. El que crea se llama **padre** y el creado, **hijo**; el hijo
guarda en su PPID el PID del padre. El resultado es un **árbol de procesos** que
parte de una única raíz.

- Esa raíz es el **primer proceso** que arranca el sistema, del que descienden
  todos los demás.
- Cuando un proceso termina, su código de salida lo recoge el padre. Si el padre ha
  muerto antes, otro proceso adopta al huérfano (lo vimos en el apartado de
  estados).

La forma concreta de crear procesos (las llamadas al sistema implicadas) y de
terminarlos (señales en Linux, herramientas equivalentes en Windows) se detalla en
los documentos específicos de cada sistema.



# 7. Mapa de equivalencias Linux / Windows

Como verás en los dos documentos siguientes, cada sistema tiene su vocabulario y
sus herramientas, pero la mayoría se corresponden una a una. Esta tabla te sirve de
puente y de chuleta:

| Concepto / tarea | Linux | Windows |
|------------------|-------|---------|
| Primer proceso | `init` / `systemd` (PID 1) | Procesos del sistema (`System`, `smss.exe`…) |
| Procesos en segundo plano | Demonios | Servicios |
| Listar procesos | `ps aux`, `top` | `tasklist`, `Get-Process` |
| Ver en tiempo real | `top`, `htop` | Administrador de tareas |
| Terminar un proceso | `kill`, `pkill` | `taskkill`, `Stop-Process` |
| Cambiar prioridad | `nice`, `renice` | Administrador de tareas / `Start-Process` |
| Ver el árbol de procesos | `pstree` | Process Explorer |
| Información interna | `/proc` | WMI / contadores de rendimiento |
| Gestionar servicios | `systemctl` | `Get-Service` / `services.msc` |



# 8. Documentar los procesos del sistema

Un último apunte, válido para cualquier sistema y que en clase se olvida fácil pero
en un trabajo real es esencial: **documentar**. Conocer los procesos habituales de
un equipo —cuáles son normales, qué hacen y cómo se relacionan— es lo que te
permite, el día de mañana, detectar de un vistazo cuándo algo no encaja.

Una forma sencilla de hacerlo es mantener una tabla (una *línea base* del sistema)
con, al menos, estos campos:

| Proceso / Servicio | Función | Padre / Depende de | ¿Crítico? | Comando de gestión |
|--------------------|---------|--------------------|:---------:|--------------------|
| … | … | … | … | … |

Mantener esta información actualizada es, además, la mejor herramienta de
seguridad: si conoces lo que es normal, lo anormal salta a la vista.



# 9. Resumen

- Un **proceso** es un programa en ejecución; el sistema lo describe con una ficha
  (PCB / EPROCESS) que incluye su **PID**, su estado, su memoria y sus permisos.
- Dentro de un proceso pueden correr varios **hilos**, que comparten memoria y son
  ligeros; un **trabajo** es la unidad que gestiona la shell.
- Los procesos transitan por estados (**listo, en ejecución, bloqueado…**); el
  **planificador** reparte la CPU por turnos y las **prioridades** deciden el orden.
- Los procesos **nacen de otros** formando un árbol cuya raíz es el primer proceso
  del sistema.
- Las **interrupciones y excepciones** permiten al procesador reaccionar a eventos
  y separan el **modo usuario** del **modo núcleo**.
- Administrar procesos incluye **vigilarlos por seguridad** y **documentar** los
  habituales para reconocer lo anómalo.

::: tip
Continúa con los documentos **Procesos del sistema en Linux** y **Procesos del
sistema en Windows**, donde aterrizamos todos estos conceptos en herramientas y
comandos concretos.
:::
