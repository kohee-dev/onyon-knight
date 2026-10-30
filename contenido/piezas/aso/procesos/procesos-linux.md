---
titulo: "Procesos del sistema en Linux"
licencia: CC-BY-NC-SA-4.0
---

Este documento aterriza en **GNU/Linux** los conceptos generales del tema. Damos
por sabido qué es un proceso, un hilo, un estado o el planificador; aquí veremos
los **estados concretos, las prioridades, las señales, el sistema `/proc`, las
herramientas y la secuencia de arranque** tal y como funcionan en Linux.

::: nota
Si aún no tienes claros los conceptos de fondo, repasa antes el documento
**Procesos del sistema** (general). Aquí nos centramos en lo específico de Linux.
:::


# 1. Estados de un proceso en Linux

En Linux puedes ver el estado de cada proceso en la columna `STAT` de `ps` o `S` de
`top`. Los códigos más habituales son:

| Código | Significado |
|--------|-------------|
| `R` | *Running* o ejecutable (en ejecución o en cola de listos). |
| `S` | *Sleeping*: durmiendo, esperando un evento (espera interrumpible). |
| `D` | Espera **ininterrumpible**, normalmente de E/S de disco. No se puede matar fácilmente. |
| `T` | Detenido (*stopped*), por ejemplo tras `Ctrl+Z` o una señal `SIGSTOP`. |
| `Z` | *Zombie*: ha terminado pero su padre aún no ha recogido su código de salida. |

A esos códigos `ps` les añade modificadores útiles: `s` (líder de sesión), `+`
(en primer plano), `l` (multihilo), `<` (prioridad alta) o `N` (prioridad baja),
entre otros. Así, un `Ss` indica un proceso durmiendo que además es líder de su
sesión, y un `R+` uno ejecutándose en primer plano.


# 2. Prioridades: el valor *nice*

En Linux la prioridad de los procesos normales se controla con el valor **nice**,
que va de **-20** (máxima prioridad, "nada amable" con los demás) a **+19** (mínima
prioridad, muy "amable", cede paso a todos). El valor por defecto es **0**.

- Estableces el *nice* al lanzar un proceso:

  ```bash
  nice -n 10 ./tarea_pesada.sh      # arranca con prioridad baja (nice 10)
  ```

- Lo cambias en uno ya en marcha con `renice`:

  ```bash
  renice -n 5 -p 1234               # cambia el nice del PID 1234 a 5
  ```

- Solo el administrador (`root`) puede asignar prioridades **más altas** (valores
  negativos); un usuario normal solo puede **rebajar** la suya.

Por encima de los procesos normales, Linux dispone de clases de **tiempo real**
(`SCHED_FIFO`, `SCHED_RR`) para tareas críticas, pero quedan fuera del uso
cotidiano de administración.


# 3. Crear, manipular y terminar procesos

## 3.1 La jerarquía: `init` / `systemd` y `pstree`

En Linux el árbol de procesos tiene siempre la misma raíz: **`init`/`systemd`**,
que ocupa el **PID 1** y es el antepasado de todos los demás. Cuando un proceso
queda huérfano, es este PID 1 quien lo adopta. Puedes ver el árbol completo con:

```bash
pstree -p        # muestra la jerarquía con los PID
```

## 3.2 Crear procesos: `fork` y `exec`

La creación sigue el modelo clásico de UNIX:

- La llamada **`fork()`** crea un proceso hijo que es una **copia** del padre.
- La llamada **`exec()`** sustituye el programa del proceso por otro distinto.

La combinación `fork()` + `exec()` es la forma habitual de lanzar un programa: el
shell se duplica con `fork()` y, en el hijo, carga con `exec()` el comando que has
escrito. El padre suele esperar al hijo con **`wait()`** para recoger su resultado.

## 3.3 Procesos en primer y segundo plano

Desde el terminal puedes controlar dónde se ejecuta un trabajo:

| Acción | Cómo |
|--------|------|
| Lanzar en segundo plano | Añadir `&` al final: `comando &` |
| Suspender el de primer plano | `Ctrl + Z` |
| Ver los trabajos | `jobs` |
| Traer a primer plano | `fg %1` |
| Reanudar en segundo plano | `bg %1` |
| Que sobreviva al cierre del terminal | `nohup comando &` |

## 3.4 Terminar un proceso: las señales

En Linux los procesos se controlan y se terminan enviándoles **señales**, que son
avisos que el sistema entrega al proceso. Las más importantes para administrar:

| Señal | Número | Qué hace |
|-------|:---:|----------|
| `SIGTERM` | 15 | Pide al proceso que **termine ordenadamente**. Es la opción por defecto y la recomendada: deja que el proceso cierre archivos y limpie antes de salir. |
| `SIGKILL` | 9 | **Mata** el proceso de inmediato. No se puede ignorar ni capturar, pero no le da ocasión de limpiar. Último recurso. |
| `SIGHUP` | 1 | Originalmente "se cortó la terminal"; muchos demonios la usan para **recargar su configuración**. |
| `SIGSTOP` | 19 | **Detiene** (pausa) el proceso. |
| `SIGCONT` | 18 | **Reanuda** un proceso detenido. |
| `SIGINT` | 2 | Interrupción desde teclado (`Ctrl + C`). |

Se envían con:

```bash
kill 1234            # envía SIGTERM al PID 1234
kill -9 1234         # envía SIGKILL (forzar)
kill -HUP 1234       # recarga configuración (demonios)
pkill firefox        # por nombre
killall firefox      # mata todas las instancias por nombre
```

::: tip
Regla de oro: prueba **siempre** primero con `SIGTERM` (un `kill` normal) y reserva
`SIGKILL` (`kill -9`) para cuando el proceso no responde. Matar con `-9` a lo bruto
puede dejar archivos a medio escribir o bloqueos sin liberar.
:::



# 4. Los procesos como archivos: `/proc`

Una de las ideas más elegantes de UNIX es que **"todo es un archivo"**, y los
procesos no son una excepción. En Linux existe un sistema de archivos especial,
montado en **`/proc`**, que no ocupa disco: es un **sistema de archivos virtual**
que el núcleo genera al vuelo para mostrar su estado interno.

Dentro de `/proc` hay una carpeta por cada proceso, **nombrada con su PID**. Por
ejemplo, en `/proc/1/` encontrarás información del proceso `systemd`. Algunos
archivos útiles dentro de `/proc/<PID>/`:

| Archivo | Contiene |
|---------|----------|
| `status` | Estado, PID, PPID, usuario, memoria, en formato legible. |
| `cmdline` | La línea de comandos completa con la que se lanzó. |
| `cwd` | Enlace al directorio de trabajo actual. |
| `exe` | Enlace al ejecutable que está corriendo. |
| `fd/` | Los descriptores de archivos abiertos por el proceso. |

Esto explica por qué herramientas como `ps` o `top` no necesitan "magia": se
limitan a **leer `/proc`**. Es también un recurso valioso para investigar un
proceso sospechoso, como veremos en el apartado de seguridad.

```bash
cat /proc/1/status        # información del proceso 1 (systemd)
readlink /proc/1234/exe   # ruta real del ejecutable del PID 1234
```

# 5. Herramientas de gestión y supervisión

## 5.1 Línea de comandos

- **`ps`** — fotografía de los procesos en un instante. Muy usado: `ps aux`
  (todos, con usuario y consumo) o `ps -ef`.
- **`top`** — vista **en tiempo real**, que se actualiza sola, con consumo de CPU
  y memoria. **`htop`** es una versión más cómoda y coloreada (se instala aparte).
- **`pgrep` / `pidof`** — buscan el PID de un proceso por su nombre.
- **`kill` / `pkill` / `killall`** — envían señales (terminar, parar, reanudar…).
- **`nice` / `renice`** — fijan o cambian la prioridad.
- **`jobs` / `fg` / `bg`** — control de trabajos del terminal.
- **`pstree`** — muestra el árbol de procesos.

```bash
ps aux                    # todos los procesos con consumo
ps aux | grep apache      # filtrar por nombre
top                       # monitor en tiempo real
pgrep -l sshd             # PID y nombre de sshd
```

## 5.2 Herramientas gráficas

- **Monitor del sistema de GNOME** (`gnome-system-monitor`): lista de procesos,
  consumo y la opción de finalizarlos o cambiarles la prioridad con el ratón.
- **Monitor del sistema de KDE** (*System Monitor* / *ksysguard*): equivalente en
  el escritorio KDE Plasma.



# 6. Secuencia de arranque en GNU/Linux

Para administrar bien un sistema hay que entender **qué procesos se ponen en marcha
al encender el equipo y en qué orden**, porque muchos problemas (un servicio que no
levanta, un arranque lento) se diagnostican ahí. A grandes rasgos:

1. **Firmware (BIOS/UEFI)**: comprueba el hardware (POST) y busca un dispositivo de
   arranque.
2. **Gestor de arranque** (*bootloader*, normalmente **GRUB**): carga el núcleo
   (*kernel*) de Linux en memoria.
3. **Núcleo**: inicializa el hardware esencial, monta el sistema de archivos raíz y
   lanza el primer proceso.
4. **`init` / `systemd` (PID 1)**: es el **primer proceso en espacio de usuario** y
   el padre de todos los demás. Se encarga de arrancar el resto de servicios.
5. **Servicios y objetivos**: `systemd` levanta los **demonios** necesarios según
   el **objetivo** (*target*) configurado (por ejemplo, con o sin interfaz gráfica)
   hasta dejar el sistema listo y mostrar el inicio de sesión.



# 7. Demonios y su gestión con `systemd`

Los **demonios** son los procesos que se ejecutan de forma continua en segundo
plano, sin interfaz, para ofrecer una funcionalidad. Por convención, muchos
terminan en **`d`**: `sshd` (acceso remoto), `cupsd` (impresión), `httpd` (web),
`crond` (tareas programadas).

En los sistemas actuales se gestionan con **`systemd`** a través de la orden
`systemctl`:

| Tarea | Comando |
|-------|---------|
| Ver el estado | `systemctl status sshd` |
| Arrancar | `systemctl start sshd` |
| Parar | `systemctl stop sshd` |
| Reiniciar | `systemctl restart sshd` |
| Recargar configuración | `systemctl reload sshd` |
| Activar al inicio | `systemctl enable sshd` |
| Desactivar al inicio | `systemctl disable sshd` |

::: nota
Aquí se ve por qué este tema es la base de todo el módulo: los servicios de
directorio, de impresión o de acceso remoto que verás en otras unidades **son
demonios**, y administrarlos consiste, en buena parte, en arrancarlos, pararlos,
configurarlos y vigilar su estado con `systemctl`.
:::

## Crear tu propio demonio

Un demonio no es más que un programa que `systemd` mantiene en marcha. Para que
`systemd` lo gestione necesitas dos cosas: el **programa** y una **unidad**
(*unit*), un fichero de texto que le explica cómo arrancarlo.

**El programa.** Con `systemd` no hace falta "desprenderse" de la terminal: el
programa se queda en **primer plano** y `systemd` lo lanza en segundo plano por ti.
Lo que escriba por su salida estándar queda registrado en el diario del sistema
(se lee con `journalctl -u nombre`). Un demonio bien hecho responde a dos señales:

- `SIGHUP`: recargar su configuración sin pararse.
- `SIGTERM`: terminar de forma ordenada cuando se lo piden.

**La unidad.** Es un fichero `nombre.service` que se guarda en
`/etc/systemd/system/` y tiene tres secciones:

| Sección | Qué cuenta | Opciones habituales |
|---------|-----------|---------------------|
| `[Unit]` | Qué es y de qué depende | `Description=`, `After=` |
| `[Service]` | Cómo se ejecuta | `ExecStart=` (programa), `ExecReload=` (qué hacer en `reload`), `User=`, `Restart=` |
| `[Install]` | Cuándo se activa | `WantedBy=multi-user.target` (en el arranque normal) |

`User=` indica con qué usuario se ejecuta: conviene uno **sin privilegios** que ya
exista (se crea uno de servicio con `useradd --system`). Por ejemplo, la unidad de
un demonio ficticio `reloj`:

```ini
[Unit]
Description=Reloj de ejemplo

[Service]
ExecStart=/usr/local/bin/reloj.sh
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
User=reloj

[Install]
WantedBy=multi-user.target
```

Cada vez que **crees o cambies** una unidad, `systemd` debe volver a leerla con
`systemctl daemon-reload`. Después ya puedes usar `start`, `reload` y `enable` como
con cualquier otro demonio.

**La política de reinicio.** `Restart=` indica qué hace `systemd` cuando el proceso
termina: con `no` (por defecto) no hace nada; con `on-failure` lo relanza si
termina con un código de salida distinto de `0` o lo mata una señal brusca (por
ejemplo `SIGKILL`; `SIGTERM`, `SIGHUP` y `SIGINT` cuentan como salida limpia si el
programa sale con `0`); con `always` lo relanza **siempre**, aunque haya terminado
bien.

::: aviso
Si un demonio tiene `Restart=always`, **matarlo con `kill` no sirve**: `systemd`
lo vuelve a arrancar en cuanto termina. Para pararlo hay que decírselo a `systemd`:

- `systemctl stop nombre` lo detiene ahora, pero volverá en el siguiente arranque.
- `systemctl disable nombre` evita que arranque con el sistema, pero no lo detiene
  si ya está en marcha: hacen falta **las dos órdenes**.
- `systemctl mask nombre` lo bloquea del todo (ni se activa ni se puede arrancar a
  mano) hasta que lo desbloquees con `unmask`. Solo funciona con unidades que
  instaló un paquete; si el fichero `.service` lo has creado tú en
  `/etc/systemd/system/`, `mask` se niega.
:::

Para leer el diario de un demonio hace falta ser administrador:
`sudo journalctl -u nombre`.



# 8. Seguridad: detectar procesos sospechosos en Linux

El malware, los mineros de criptomonedas o un programa mal configurado se
manifiestan, casi siempre, como un proceso que no debería estar ahí o que consume
recursos de forma anómala. Algunas pautas específicas de Linux:

- **Vigila el consumo** con `top`/`htop`: un proceso desconocido con la CPU o la red
  al máximo es la señal de alarma más típica.
- **Comprueba de dónde sale**: con `readlink /proc/<PID>/exe` ves la ruta real del
  ejecutable. Un proceso que corre desde `/tmp` o desde la carpeta de un usuario es
  muy sospechoso.
- **Revisa el padre** (`ps -o ppid= -p <PID>`): saber quién lo lanzó ayuda a
  entender si es legítimo.
- **Desconfía de nombres camuflados**: imitar nombres del sistema con pequeñas
  variaciones es un truco clásico.
- **Actúa con cabeza**: si confirmas que es malicioso, aíslalo (corta la red),
  termínalo y analiza el equipo; no te limites a matarlo, porque muchos se
  reinician a través de un servicio o una tarea de `cron`.

::: aviso
Cuidado al terminar procesos del sistema: matar uno legítimo (por ejemplo
`systemd` o un demonio crítico) puede colgar o reiniciar el equipo. Si no estás
seguro de qué es un proceso, **investígalo antes de actuar**.
:::



# 9. Resumen (Linux)

- Los estados se leen en la columna `STAT` de `ps`: `R`, `S`, `D`, `T`, `Z`.
- La prioridad se controla con el **nice** (`-20` a `19`) mediante `nice` y
  `renice`.
- Los procesos nacen con **`fork`+`exec`** y descienden de **`systemd` (PID 1)**.
- Se controlan con **señales** (`SIGTERM`, `SIGKILL`, `SIGHUP`…) enviadas con
  `kill`, `pkill` o `killall`.
- Linux expone los procesos como archivos en **`/proc`**, base de `ps`, `top`, etc.
- Al arrancar: firmware → GRUB → núcleo → `systemd` → demonios.
- Los **demonios** se gestionan con **`systemctl`**, y conviene vigilar los
  procesos sospechosos con `top`, `/proc` y la ruta del ejecutable.
- Un demonio propio es un programa en primer plano más una **unidad** `.service`
  (`daemon-reload` tras cada cambio). Con `Restart=always`, `kill` no lo para: hay
  que usar `stop` y `disable` (y `mask` si la unidad viene de un paquete).
