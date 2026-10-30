---
titulo: "Academia Amaurot"
licencia: CC-BY-NC-SA-4.0
tipo: caso
horas: 6
borrador: true
---

::: aviso
Para la realización de esta actividad voy a tener los siguientes supuestos:

+ Eres capaz de leer y entender oraciones **largas** y comprender **lo que hay que hacer**.
+ Manejas la terminal de Linux con soltura y te tomas en serio la investigación.
+ Cada apartado se entrega y se corrige de forma *individual* y separada del resto.
+ Estamos tratando situaciones que no hemos visto en profundidad en clase, así que **no tengas miedo en preguntar**.
+ Apunta los comandos que uses: forman parte de tu cuaderno de investigación.
+ Si alguien hace *trampa* o *plagio*, lo sabré.
:::

# El caso

La **Academia Amaurot** es una academia de formación con unos cuantos profesores y muchas aulas. Últimamente algo falla: hay profesores que no dan clase, alumnado que se amontona en las aulas y un servidor que no sabe decir cuál es cuál. La dirección ha recurrido a **Andrea Windrose**, detective habitual de estas prácticas, y Andrea te ha llamado a ti.

> *"Yo sé seguir a una persona por la calle, pero no sé seguir a un proceso por un servidor. Dime quién trabaja, quién no, y quién no debería estar ahí. — A."*

En el servidor, **cada profesor es un proceso**. Andrea irá dejando una pista al empezar cada apartado; el trabajo técnico es lo que viene a continuación.

::: nota
**Escenario.** Necesitas una máquina **GNU/Linux** (vale una VM con Ubuntu Server) donde tengas `sudo`. En los apartados 2 y 3 también necesitas un **Windows** con permisos de administrador. Cada apartado trae un **script de preparación** que crea los profesores: todos son procesos inofensivos con nombre `profe_...`.
:::

# Conocimientos previos

Antes de empezar deberías repasar la teoría de **Procesos del sistema**, **Procesos en Linux** y **Procesos en Windows**. En concreto, necesitas saber:

- Qué es un **proceso**, un **hilo** y un **trabajo** (*job*), y qué estados tiene un proceso.
- Qué es una **interrupción** y qué es una **excepción**.
- Qué datos identifican a un proceso: **PID**, **PPID**, usuario, ejecutable.
- Las herramientas de Linux: `ps`, `top`, `pstree`, `kill`, `nice`, `renice` y el directorio `/proc`.
- Las herramientas de Windows: **Administrador de tareas**, `Get-Process`, `Stop-Process`.
- Lo básico de **Bash**: argumentos (`$1`), condicionales y bucles.

# Cómo entregar el trabajo

Hay **cinco entregas**, una por apartado. Cada una es un **PDF** y, en los apartados que lo piden, un **script**.

- **Plazo:** una semana después de terminar cada apartado.
- **Canal:** aula virtual.
- **PDF:** `entregaN_apellido_nombre.pdf` (en minúsculas, sin tildes ni espacios).
- **Script:** `nombre-del-script_apellido_nombre.sh`, por ejemplo `silenciar_garcia_ana.sh`.

Esta es la plantilla del PDF. Escríbela en el programa que prefieras y expórtala a PDF:

````markdown
# Entrega N — <título del apartado>

**Nombre:** …  **Grupo:** …  **Fecha:** …

| Nº | Orden o procedimiento | Resultado o respuesta |
|----|-----------------------|-----------------------|
| N.1 | `comando` | salida o explicación |
| N.2 | … | … |

## Evidencia final

```text
(pega aquí la salida del comando de evidencia de este apartado)
```
````

**Reglas de la entrega:**

- Una fila por pregunta, con el **número del enunciado**.
- Si no tienes resultado, escribe `—`; no borres la fila.
- Pega las salidas **como texto**. Usa capturas solo cuando el enunciado las pida (herramientas gráficas).
- Las explicaciones, con tus propias palabras.
- Un script que no se ejecuta se corrige como no entregado.

**Qué debe contener cada entrega:**

| Entrega | Ficheros | Además del comando | Evidencia final |
|---------|----------|--------------------|-----------------|
| 1 | PDF | Tus explicaciones de estados, hilos, trabajos e interrupciones | `ps -eo pid,ppid,stat,comm \| grep -E 'profe_\|python3\|defunct'` |
| 2 | PDF | Los datos de `/proc` y las capturas de Windows | `pgrep -a profe_` y, en Windows, `Get-CimInstance Win32_Process \| Where-Object CommandLine -match 'profe_' \| Select-Object ProcessId, Name` |
| 3 | PDF + `silenciar.sh` | Qué señal usaste y por qué | `ps -eo pid,ni,stat,comm \| grep profe_` |
| 4 | PDF + `ancestros.sh` | El árbol y tu explicación | `ps -eo pid,ppid,comm \| grep profe_` |
| 5 | PDF + `inventario.sh` | La tabla de procesos y la evidencia conservada | `ps -eo pid,user,ni,comm \| grep profe_` |

**Cómo se califica:** cada pregunta indica sus puntos y la suma total es de 10. Una entrega no presentada en plazo puntúa 0 en sus preguntas.

# 1. Conceptos

Andrea llega a la academia y pide ver quién está en qué estado. Antes de tocar nada, necesita entender lo que hay.

## Preparación

Guarda este script como `preparar-1.sh` y ejecútalo (`bash preparar-1.sh`):

```bash
#!/bin/bash
D="$HOME/academia/bin"
pkill -f "$HOME/academia/" 2>/dev/null
mkdir -p "$D"

# Cada profesor es una copia de un programa corriente con otro nombre
nombrar() { cp "$(command -v "$1")" "$D/$2"; }
nombrar sleep profe_garcia
nombrar yes profe_lozano
nombrar sleep profe_ibarra
nombrar sleep profe_quiroga

"$D/profe_garcia" 100000 &                  # duerme
"$D/profe_lozano" > /dev/null &             # no para de trabajar
"$D/profe_ibarra" 100000 &                  # lo detienen en seguida
kill -STOP $!
bash -c "sleep 1 & exec $D/profe_quiroga 100000" &   # tiene un hijo que nadie recoge

# El aula magna: un solo proceso con varios hilos
cat > "$HOME/academia/aula_magna.py" <<'EOF'
import threading, time
for _ in range(4):
    threading.Thread(target=time.sleep, args=(100000,), daemon=True).start()
time.sleep(100000)
EOF
python3 "$HOME/academia/aula_magna.py" &

sleep 2
echo "Academia lista. Empieza a investigar."
```

## Pregunta 1.1 — Cuatro profesores, cuatro estados *(1 punto)*

Con `ps -eo pid,ppid,stat,comm | grep profe_` consulta el estado de `profe_garcia`, `profe_lozano`, `profe_ibarra` y `profe_quiroga`. Para cada uno indica la **letra de estado** y qué significa, y en qué fase del ciclo de vida de un proceso (nuevo, listo, en ejecución, bloqueado, parado, terminado) está.

## Pregunta 1.2 — El hijo que no se va *(1 punto)*

Entre los procesos del sistema hay uno en estado `Z` (búscalo con `ps -eo pid,ppid,stat,comm | grep -E ' Z|defunct'`). Indica su **PID**, el de su **padre**, y explica por qué **no se puede eliminar con `kill`** y qué habría que hacer realmente para que desaparezca.

## Pregunta 1.3 — El aula magna *(0,5 puntos)*

`python3 aula_magna.py` es un solo proceso. Comprueba con `ps -o pid,nlwp,comm -p <PID>` y con `ps -L -p <PID>` cuántos **hilos** tiene, y qué identificadores (PID y TID) ves. Explica con tus palabras qué comparten los hilos de un mismo proceso y qué no.

## Pregunta 1.4 — Un trabajo no es un proceso *(0,5 puntos)*

En tu terminal lanza `sleep 600 &` y ejecuta `jobs -l`. Explica la diferencia entre el **número de trabajo** (`[1]`) y el **PID**, y quién gestiona cada uno.

## Pregunta 1.5 — Los avisos del hardware *(0,5 puntos)*

Ejecuta `cat /proc/interrupts` dos veces con unos diez segundos de diferencia. Indica **una línea cuyo contador haya crecido** y qué dispositivo la genera. Explica qué es una **interrupción** y por qué la CPU no tiene que preguntar continuamente si hay novedades.

## Pregunta 1.6 — Un profesor hace algo ilegal *(0,5 puntos)*

Ejecuta `bash -c 'kill -SEGV $$'`. Explica qué ha pasado en términos de **excepción** de la CPU, y la diferencia entre una excepción y una interrupción.

# 2. Comandos comunes

Andrea ya sabe quién es quién. Ahora quiere saber **qué hace cada uno** y **quién se lleva los recursos**. Hablarás en dos idiomas: Linux y Windows.

## Preparación en Linux

Guarda este script como `preparar-2.sh` y ejecútalo:

```bash
#!/bin/bash
D="$HOME/academia/bin"
pkill -f "$HOME/academia/" 2>/dev/null
mkdir -p "$D" "$HOME/academia/aula7"

nombrar() { cp "$(command -v "$1")" "$D/$2"; }
nombrar sleep profe_garcia
nombrar yes profe_lozano
nombrar tail profe_marin

echo "Libro de registro de la academia" > "$HOME/academia/registro.txt"

"$D/profe_garcia" 100000 &
"$D/profe_lozano" > /dev/null &
# profe_marin trabaja desde el aula 7 y tiene abierto el libro de registro
( cd "$HOME/academia/aula7" && exec "$D/profe_marin" -f "$HOME/academia/registro.txt" ) &

sleep 2
echo "Academia lista. Empieza a investigar."
```

## Pregunta 2.1 — El carné de profe_marin *(0,5 puntos)*

Sin usar `ps`, averigua leyendo **`/proc/<PID>/`** (el PID lo obtienes con `pgrep profe_marin`): su **línea de comandos** (`cmdline`), la **ruta de su ejecutable** (`exe`) y su **directorio de trabajo** (`cwd`). Pega los tres comandos y su salida.

## Pregunta 2.2 — Qué tiene entre manos *(0,5 puntos)*

Con `/proc/<PID>/fd` averigua qué **fichero abierto** tiene `profe_marin`, y con `/proc/<PID>/status` su **estado** y su **PPid**. Explica por qué `/proc` se considera "un sistema de archivos como medio lógico" para ver procesos aunque no ocupe espacio en disco.

## Pregunta 2.3 — Quién gasta más *(0,25 puntos)*

Lista los procesos **ordenados por uso de CPU**, de mayor a menor, mostrando solo PID, usuario, %CPU y comando (`ps` con `--sort`). Indica el primero de la lista.

## Pregunta 2.4 — La foto del servidor *(0,25 puntos)*

Ejecuta `top -b -n 1 | head -15`. Indica la **carga media** (*load average*), cuántas tareas hay en cada estado y qué profesor aparece arriba.

## Preparación en Windows

Guarda este script como `preparar-2.ps1` y ejecútalo desde PowerShell como administrador:

```powershell
# Termina los profesores de una preparación anterior (sin tocar esta consola)
Get-CimInstance Win32_Process |
    Where-Object { $_.CommandLine -match 'profe_' -and $_.ProcessId -ne $PID } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force }

# profe_lozano no para de trabajar; profe_garcia duerme
Start-Process powershell -WindowStyle Minimized -ArgumentList '-NoProfile','-Command','while($true){} # profe_lozano'
Start-Process powershell -WindowStyle Minimized -ArgumentList '-NoProfile','-Command','Start-Sleep -Seconds 100000 # profe_garcia'

Start-Sleep -Seconds 2
Write-Host 'Academia lista. Empieza a investigar.'
```

## Pregunta 2.5 — La vista gráfica *(0,25 puntos)*

Abre el **Administrador de tareas**, pestaña *Detalles*, y añade la columna **Línea de comandos**. Localiza a `profe_lozano` y a `profe_garcia`. Entrega **una captura** donde se vea la columna y el uso de CPU de ambos.

## Pregunta 2.6 — La vista de comandos *(0,25 puntos)*

Con PowerShell, obtén el **PID** de `profe_lozano` y `profe_garcia` a partir de su línea de comandos (`Get-CimInstance Win32_Process`) y comprueba cuál de los dos consume CPU (`Get-Process -Id …`). Explica por qué `Get-Process` por sí solo no te basta para distinguirlos.

# 3. Manipulación de procesos

Andrea te encarga ahora **poner orden**: crear, bajar la prioridad y despedir a quien haga falta.

## Preparación en Linux

Guarda este script como `preparar-3.sh` y ejecútalo:

```bash
#!/bin/bash
D="$HOME/academia/bin"
pkill -f "$HOME/academia/" 2>/dev/null
mkdir -p "$D"

nombrar() { cp "$(command -v "$1")" "$D/$2"; }
nombrar yes profe_lozano
nombrar yes profe_vega

"$D/profe_lozano" > /dev/null &
"$D/profe_vega" > /dev/null &

# profe_terco ignora la orden de terminar (SIGTERM)
cat > "$D/profe_terco.sh" <<'EOF'
#!/bin/bash
trap '' TERM
while true; do sleep 1; done
EOF
chmod +x "$D/profe_terco.sh"
"$D/profe_terco.sh" &

sleep 2
echo "Academia lista. Empieza a investigar."
```

## Pregunta 3.1 — Primer plano, segundo plano *(0,2 puntos)*

Lanza `sleep 900` en primer plano, **suspéndelo** con `Ctrl+Z`, **reanúdalo en segundo plano** con `bg`, muéstralo con `jobs -l`, tráelo de vuelta con `fg` y **termínalo** con `Ctrl+C`. Pega la secuencia y la salida de `jobs -l`.

## Pregunta 3.2 — Menos prioridad *(0,2 puntos)*

Lanza `nice -n 5 yes > /dev/null &`. Compáralo en `ps -o pid,ni,comm` con `profe_lozano`. Después, con `renice`, **súbele** el valor de *nice* a `15` y comprueba el cambio. Intenta devolverlo a `5` sin `sudo` y explica qué ocurre y por qué.

## Pregunta 3.3 — Educados y no tanto *(0,2 puntos)*

Termina a `profe_lozano` con **SIGTERM**. Intenta lo mismo con `profe_terco.sh` y comprueba que sigue vivo. Termínalo con **SIGKILL**. Explica por qué existen dos señales y por qué `kill -9` debe ser el último recurso.

## Preparación en Windows

Guarda este script como `preparar-3.ps1` y ejecútalo como administrador:

```powershell
Get-CimInstance Win32_Process |
    Where-Object { $_.CommandLine -match 'profe_' -and $_.ProcessId -ne $PID } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force }

# Dos profesores que no paran de trabajar
Start-Process powershell -WindowStyle Minimized -ArgumentList '-NoProfile','-Command','while($true){} # profe_lozano'
Start-Process powershell -WindowStyle Minimized -ArgumentList '-NoProfile','-Command','while($true){} # profe_vega'

Start-Sleep -Seconds 2
Write-Host 'Academia lista. Empieza a investigar.'
```

## Pregunta 3.4 — En Windows *(0,2 puntos)*

Localiza a `profe_vega` por su línea de comandos y **baja su prioridad** a *Por debajo de lo normal* desde PowerShell (`PriorityClass`). Después **termina** a `profe_lozano` con `Stop-Process`. Pega los comandos y el resultado de `Get-Process -Id …` de ambos. No uses la clase *Tiempo real*.

## Pregunta 3.5 — Un script para despedir *(0,2 puntos)*

Escribe un script **`silenciar.sh`** que reciba como argumento el **nombre** de un proceso y:

1. Si no se le da exactamente un argumento, muestra el uso y sale con código `2`.
2. Si no existe ningún proceso con ese nombre, avisa y sale con código `1`.
3. Si existe, le envía **SIGTERM**, espera 3 segundos y, si sigue vivo, le envía **SIGKILL**.
4. Informa de qué señal ha hecho falta y sale con código `0`.

Pruébalo con `profe_terco.sh` y entrega el script.

# 4. Relaciones entre procesos

Andrea quiere saber **quién responde ante quién**. Todo profesor tiene un jefe, y la cadena llega hasta el director de todo el servidor.

## Preparación

Guarda este script como `preparar-4.sh` y ejecútalo:

```bash
#!/bin/bash
D="$HOME/academia/bin"
pkill -f "$HOME/academia/" 2>/dev/null
mkdir -p "$D"

nombrar() { cp "$(command -v "$1")" "$D/$2"; }
nombrar sleep profe_director
nombrar sleep profe_becario
nombrar sleep profe_garcia

"$D/profe_garcia" 100000 &
# el director lanza al becario y se queda esperando
bash -c "$D/profe_becario 100000 & exec $D/profe_director 100000" &

sleep 2
echo "Academia lista. Empieza a investigar."
```

## Pregunta 4.1 — El organigrama *(0,2 puntos)*

Con `pstree -p` (o `ps -ef --forest`) localiza a `profe_director` y a `profe_becario` y dibuja su cadena de padres hasta el **proceso 1**. ¿Qué es el proceso 1 en tu sistema?

## Pregunta 4.2 — El director se marcha *(0,2 puntos)*

Termina a `profe_director` con `kill`. Consulta de nuevo el **PPID** de `profe_becario`. ¿Cambió? ¿Quién es ahora su padre y por qué el sistema no deja procesos sin padre?

## Pregunta 4.3 — Cómo se abrió la academia *(0,2 puntos)*

Ejecuta `systemd-analyze` y `systemd-analyze critical-chain`. Indica el **tiempo total de arranque** y qué **servicio de la cadena crítica** tardó más.

## Pregunta 4.4 — Quién necesita a quién *(0,2 puntos)*

Con `systemctl list-dependencies cron.service` y `systemctl status cron.service`, indica de qué **unidades depende** el servicio y bajo qué **cgroup** se ejecuta. Explica la diferencia entre `Requires=` y `After=`.

## Pregunta 4.5 — Un script para seguir el rastro *(0,2 puntos)*

Escribe un script **`ancestros.sh`** que reciba un **PID** y muestre su cadena de padres hasta el proceso 1, una línea por proceso (`PID nombre`). Si no recibe un PID, o el proceso no existe, debe salir con código `1` y un mensaje de uso. Pruébalo con `profe_becario` y entrega el script.

# 5. Otros casos

Andrea ha encontrado en la academia un profesor que nadie contrató. Tendrás que reconocerlo, decidir qué hacer sin destruir las pruebas y dejar por escrito qué es normal en este servidor.

## Preparación

Guarda este script como `preparar-5.sh` y ejecútalo:

```bash
#!/bin/bash
D="$HOME/academia/bin"
O="$HOME/academia/.oculto"
pkill -f "$HOME/academia/" 2>/dev/null
mkdir -p "$D" "$O"

nombrar() { cp "$(command -v "$1")" "$D/$2"; }
nombrar sleep profe_garcia
nombrar sleep profe_marin
"$D/profe_garcia" 100000 &
"$D/profe_marin" 100000 &

# Una suplente que nadie contrató: se esconde en una carpeta oculta y borra su ejecutable
cp "$(command -v yes)" "$O/profe_suplente"
nice -n 19 "$O/profe_suplente" > /dev/null &
sleep 1
rm "$O/profe_suplente"

sleep 1
echo "Academia lista. Empieza a investigar."
```

## Pregunta 5.1 — Un profesor sin contrato *(0,5 puntos)*

Hay un proceso `profe_*` que no es como los demás. Averigua, con comandos, **al menos tres evidencias** de que es sospechoso (usuario, ruta de su ejecutable, carpeta desde la que se ejecuta, estado del fichero, prioridad...) y compáralas con las de `profe_garcia`.

## Pregunta 5.2 — Actuar sin destruir pruebas *(0,5 puntos)*

Antes de eliminar al sospechoso, **conserva evidencias**: copia su ejecutable a `~/evidencia_suplente` desde `/proc`, calcula su `sha256sum` y guarda su línea de comandos. Después **termínalo** con la señal adecuada y comprueba que no vuelve. Explica por qué debías copiar el ejecutable **antes** de terminarlo.

## Pregunta 5.3 — El libro de los profesores *(0,5 puntos)*

Documenta los procesos habituales de la academia en una tabla con **al menos 8 filas** (puedes incluir procesos del sistema como `systemd`, `cron`, `sshd`):

| Proceso | Función | Ruta del ejecutable | Usuario | Padre | ¿Crítico? |
|---|---|---|---|---|---|

## Pregunta 5.4 — Un inventario automático *(0,5 puntos)*

Escribe un script **`inventario.sh`** que imprima en **CSV** (con cabecera) un inventario de los procesos del **usuario actual** con las columnas `pid,ppid,usuario,estado,comando,ruta,sospechoso`. La columna `sospechoso` vale `si` si la ruta del ejecutable contiene `(deleted)` o pasa por una carpeta oculta, y `no` en caso contrario. Pruébalo antes y después de terminar al sospechoso y entrega el script.

::: tip
Andrea lo resume así: un buen informe responde siempre a tres preguntas: **¿qué pasaba?**, **¿cómo lo supe?** y **¿qué hice?**.
:::

# Criterios de evaluación cubiertos

Esta práctica trabaja los siguientes criterios del RA2 (*Administra procesos del sistema*):

- **a)** Concepto de proceso, tipos, estados y ciclo de vida (apartado 1).
- **b)** Interrupciones y excepciones (apartado 1).
- **c)** Diferencia entre proceso, hilo y trabajo (apartado 1).
- **d)** Creación, manipulación y terminación de procesos (apartado 3).
- **e)** El sistema de archivos como registro de los procesos (apartado 2).
- **f)** Herramientas gráficas y comandos de seguimiento (apartado 2).
- **g)** Secuencia de arranque y relación entre procesos (apartado 4).
- **h)** Medidas de seguridad ante procesos no identificados (apartado 5).
- **i)** Documentación de los procesos habituales (apartado 5).
