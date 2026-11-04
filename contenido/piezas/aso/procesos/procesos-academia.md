---
titulo: "Procesos en GNU/Linux y Windows"
licencia: CC-BY-NC-SA-4.0
tipo: caso
horas: 8
borrador: false
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

# Planteamiento

Un servidor de una academia funciona mal: no se sabe qué procesos están trabajando, cuáles consumen más de la cuenta ni cuáles no deberían estar. Tu tarea es investigarlo y corregirlo desde dentro del sistema.

En el servidor, **cada profesor es un proceso**. Al principio de la práctica se te indica qué herramienta usar; según avances, los enunciados solo dicen qué hay que lograr.

::: nota
**Escenario.** Necesitas una máquina **GNU/Linux con `systemd`** (vale una VM con Ubuntu Server) donde tengas `sudo`. En los apartados 2 y 3 también necesitas un **Windows** con permisos de administrador. Cada apartado trae un **script de preparación** que crea los profesores: todos son procesos inofensivos con nombre `profe_...`.
:::

# Conocimientos previos

Antes de empezar deberías repasar la teoría de **Procesos del sistema**, **Procesos en Linux** (incluida la creación de un demonio propio) y **Procesos en Windows**. En concreto, necesitas saber:

- Qué es un **proceso**, un **hilo** y un **trabajo** (*job*), y qué estados tiene un proceso.
- Qué es una **interrupción** y qué es una **excepción**.
- Qué datos identifican a un proceso: **PID**, **PPID**, usuario, ejecutable.
- Las herramientas de Linux: `ps`, `top`, `pstree`, `kill`, `pkill`, `nice`, `renice`, `jobs`, `systemctl`, `journalctl` y el directorio `/proc`.
- Las herramientas de Windows: **Administrador de tareas**, `Get-Process`, `Get-CimInstance`, `Stop-Process`.
- Lo básico de **Bash**: argumentos (`$1`), condicionales, bucles y `trap`.

# Cómo entregar el trabajo

Hay **seis entregas**, una por apartado. Cada una es un **PDF** y, en los apartados que lo piden, uno o más **ficheros**.

- **Plazo:** una semana después de terminar cada apartado.
- **Canal:** aula virtual.
- **PDF:** `entregaN_apellido_nombre.pdf` (en minúsculas, sin tildes ni espacios).
- **Ficheros:** `nombre-del-fichero_apellido_nombre.extensión`, por ejemplo `silenciar_garcia_ana.sh`.

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
(pega aquí la salida que demuestra cómo ha quedado el sistema)
```
````

**Reglas de la entrega:**

- Una fila por pregunta, con el **número del enunciado**.
- Si no tienes resultado, escribe `—`; no borres la fila.
- Pega las salidas **como texto**. Usa capturas solo cuando el enunciado las pida (herramientas gráficas).
- Las explicaciones, con tus propias palabras.
- Un script que no se ejecuta se corrige como no entregado.

**Qué debe contener cada entrega.** La evidencia final es la salida de **un comando que elijas tú** y que demuestre lo que se pide:

| Entrega | Ficheros | Además de la evidencia | La evidencia final debe mostrar |
|---------|----------|--------------------|---------------------------------|
| 1 | PDF | Tus explicaciones de estados, hilos, trabajos e interrupciones | Los profesores con su estado, y el proceso zombi con su padre |
| 2 | PDF | Los datos de `/proc` y las capturas de Windows | Los profesores activos en Linux con su PID y, en Windows, los dos procesos de PowerShell con su línea de comandos |
| 3 | PDF + `silenciar.sh` | Qué señal usaste y por qué | Los profesores que quedan, con su PID, su prioridad (*nice*) y su estado |
| 4 | PDF + `ancestros.sh` | El árbol y tu explicación | Los profesores que quedan, con su PID y su padre |
| 5 | PDF + `inventario.sh` | La tabla de procesos y la evidencia conservada | Los profesores que quedan, con su PID, usuario y prioridad |
| 6 | PDF + `timbre.sh` + `timbre.service` | Tus explicaciones de cada orden | Si el demonio de Alex está parado, deshabilitado y sin procesos, y si el servicio `timbre` está activo y habilitado |

**Cómo se califica:** cada pregunta indica sus puntos y la suma total es de 10. Una entrega no presentada en plazo puntúa 0 en sus preguntas.

# 1. Conceptos

Primero hay que identificar el estado de cada proceso antes de modificar nada. En este apartado se te dice qué herramienta usar.

## Preparación

Guarda este script como `preparar-1.sh` y ejecútalo (`bash preparar-1.sh`):

```bash
D="$HOME/academia/bin"
pkill -KILL -f "^(/bin/bash |python3 )?$HOME/academia/" 2>/dev/null
mkdir -p "$D"

# Cada profesor es una copia de un programa corriente con otro nombre
nombrar() { cp "$(command -v "$1")" "$D/$2"; }
nombrar sleep profe_alex
nombrar yes profe_raul
nombrar sleep profe_irene
nombrar sleep profe_nuria

"$D/profe_alex" 100000 &                  # duerme
"$D/profe_raul" > /dev/null &             # no para de trabajar
"$D/profe_irene" 100000 &                  # lo detienen en seguida
sleep 0.5                                   # espera a que arranque antes de detenerlo
kill -STOP $!
bash -c "sleep 1 & exec $D/profe_nuria 100000" &   # tiene un hijo que nadie recoge

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

## Pregunta 1.1 — Cuatro profesores, cuatro estados *(0,5 puntos)*

Con `ps` consulta el estado de `profe_alex`, `profe_raul`, `profe_irene` y `profe_nuria`. Para cada uno indica la **letra de estado** y qué significa, y en qué fase del ciclo de vida de un proceso (nuevo, listo, en ejecución, bloqueado, parado, terminado) está.

## Pregunta 1.2 — El hijo que no se va *(0,5 puntos)*

Entre los procesos del sistema hay uno en estado `Z`, que `ps` no muestra bajo el nombre de ningún profesor. Encuéntralo con `ps`. Indica su **PID**, el de su **padre**, y explica por qué **no se puede eliminar con `kill`** y qué habría que hacer realmente para que desaparezca.

## Pregunta 1.3 — El aula magna *(0,25 puntos)*

`python3 aula_magna.py` es un solo proceso. Con `ps` comprueba cuántos **hilos** tiene y qué identificadores (PID y TID) ves. Explica con tus palabras qué comparten los hilos de un mismo proceso y qué no.

## Pregunta 1.4 — Un trabajo no es un proceso *(0,25 puntos)*

En tu terminal deja un proceso corriendo en segundo plano y consulta tus trabajos con `jobs`. Explica la diferencia entre el **número de trabajo** (`[1]`) y el **PID**, y quién gestiona cada uno.

## Pregunta 1.5 — Los avisos del hardware *(0,25 puntos)*

Lee `/proc/interrupts` dos veces con unos diez segundos de diferencia. Indica **una línea cuyo contador haya crecido** y qué dispositivo la genera. Explica qué es una **interrupción** y por qué la CPU no tiene que preguntar continuamente si hay novedades.

## Pregunta 1.6 — Un profesor hace algo ilegal *(0,25 puntos)*

Provoca una **violación de segmento** en una shell hija (la herramienta es `kill`). Explica qué ha pasado en términos de **excepción** de la CPU, y la diferencia entre una excepción y una interrupción.

# 2. Comandos comunes

Ahora toca averiguar qué hace cada proceso y cuáles consumen más recursos, contrastando lo que dice su nombre con lo que muestra el sistema por dentro. Trabajarás en Linux y en Windows. Se siguen nombrando las herramientas, pero ya no las opciones.

## Preparación en Linux

Guarda este script como `preparar-2.sh` y ejecútalo:

```bash
D="$HOME/academia/bin"
pkill -KILL -f "^(/bin/bash |python3 )?$HOME/academia/" 2>/dev/null
mkdir -p "$D" "$HOME/academia/aula7"

nombrar() { cp "$(command -v "$1")" "$D/$2"; }
nombrar sleep profe_alex
nombrar yes profe_raul
nombrar tail profe_alicia

echo "Libro de registro de la academia" > "$HOME/academia/registro.txt"

"$D/profe_alex" 100000 &
"$D/profe_raul" > /dev/null &
# profe_alicia trabaja desde el aula 7 y tiene abierto el libro de registro
( cd "$HOME/academia/aula7" && exec "$D/profe_alicia" -f "$HOME/academia/registro.txt" ) &

sleep 2
echo "Academia lista. Empieza a investigar."
```

## Pregunta 2.1 — El carné de profe_alicia *(0,5 puntos)*

Sin usar `ps`, averigua leyendo el directorio de `/proc` de `profe_alicia` su **línea de comandos**, la **ruta de su ejecutable** y su **directorio de trabajo**. Pega los comandos y su salida.

## Pregunta 2.2 — Qué tiene entre manos *(0,5 puntos)*

Con `/proc` averigua qué **fichero abierto** tiene `profe_alicia`, su **estado** y quién es su **padre**. Explica por qué `/proc` se considera "un sistema de archivos como medio lógico" para ver procesos aunque no ocupe espacio en disco.

## Pregunta 2.3 — Quién gasta más *(0,25 puntos)*

Con `ps`, lista los procesos **ordenados por uso de CPU**, de mayor a menor, mostrando solo PID, usuario, porcentaje de CPU y nombre. Indica el primero de la lista.

## Pregunta 2.4 — La foto del servidor *(0,25 puntos)*

Con `top` en modo no interactivo (una sola vuelta), indica la **carga media** (*load average*), cuántas tareas hay en cada estado y qué profesor aparece arriba.

## Preparación en Windows

Guarda este script como `preparar-2.ps1` y ejecútalo desde PowerShell como administrador:

```powershell
# Termina los profesores de una preparación anterior (sin tocar esta consola)
Get-CimInstance Win32_Process |
    Where-Object { $_.CommandLine -match 'profe_' -and $_.ProcessId -ne $PID } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force }

# profe_raul no para de trabajar; profe_alex duerme
Start-Process powershell -WindowStyle Minimized -ArgumentList '-NoProfile','-Command','while($true){} # profe_raul'
Start-Process powershell -WindowStyle Minimized -ArgumentList '-NoProfile','-Command','Start-Sleep -Seconds 100000 # profe_alex'

Start-Sleep -Seconds 2
Write-Host 'Academia lista. Empieza a investigar.'
```

## Pregunta 2.5 — La vista gráfica *(0,25 puntos)*

Abre el **Administrador de tareas**, pestaña *Detalles*, y añade la columna **Línea de comandos**. Localiza a `profe_raul` y a `profe_alex`. Entrega **una captura** donde se vea la columna y el uso de CPU de ambos.

## Pregunta 2.6 — La vista de comandos *(0,25 puntos)*

Con PowerShell (`Get-CimInstance` sobre `Win32_Process`), obtén el **PID** de `profe_raul` y `profe_alex` a partir de su línea de comandos y comprueba con `Get-Process` cuál de los dos consume CPU. Explica por qué `Get-Process` por sí solo no te basta para distinguirlos.

# 3. Manipulación de procesos

Hay que controlar los procesos sin dañar el sistema: bajar la prioridad de los que consumen de más y terminar los que no responden a una orden normal. Desde aquí los enunciados solo dicen **qué hay que lograr**.

## Preparación en Linux

Guarda este script como `preparar-3.sh` y ejecútalo:

```bash
D="$HOME/academia/bin"
pkill -KILL -f "^(/bin/bash |python3 )?$HOME/academia/" 2>/dev/null
mkdir -p "$D"

nombrar() { cp "$(command -v "$1")" "$D/$2"; }
nombrar yes profe_raul
nombrar yes profe_valentin

"$D/profe_raul" > /dev/null &
"$D/profe_valentin" > /dev/null &

# profe_alex ignora la orden de terminar (SIGTERM)
cat > "$D/profe_alex.sh" <<'EOF'
#!/bin/bash
trap '' TERM
while true; do sleep 1; done
EOF
chmod +x "$D/profe_alex.sh"
"$D/profe_alex.sh" &

sleep 2
echo "Academia lista. Empieza a investigar."
```

## Pregunta 3.1 — Primer plano, segundo plano *(0,3 puntos)*

Lanza un proceso que dure unos quince minutos en primer plano, **suspéndelo**, **reanúdalo en segundo plano**, comprueba que figura entre tus trabajos, tráelo de vuelta a primer plano y **termínalo**. Pega la secuencia de órdenes y la prueba de cada paso.

## Pregunta 3.2 — Menos prioridad *(0,3 puntos)*

Lanza un proceso cualquiera que consuma CPU (en los scripts de preparación tienes ideas) con una **prioridad menor que la normal**. Después, **cede aún más prioridad** y comprueba que no puedes recuperar la que tenías sin ser administrador. Explica por qué existe esa asimetría.

## Pregunta 3.3 — Educados y no tanto *(0,3 puntos)*

Termina a `profe_raul` de la forma **ordenada**. Haz lo mismo con `profe_alex.sh` y comprueba qué ocurre; si no obedece, **fuérzalo**. Explica por qué existen dos formas de terminar un proceso y cuál debe ser el último recurso.

## Preparación en Windows

Guarda este script como `preparar-3.ps1` y ejecútalo como administrador:

```powershell
Get-CimInstance Win32_Process |
    Where-Object { $_.CommandLine -match 'profe_' -and $_.ProcessId -ne $PID } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force }

# Dos profesores que no paran de trabajar
Start-Process powershell -WindowStyle Minimized -ArgumentList '-NoProfile','-Command','while($true){} # profe_raul'
Start-Process powershell -WindowStyle Minimized -ArgumentList '-NoProfile','-Command','while($true){} # profe_valentin'

Start-Sleep -Seconds 2
Write-Host 'Academia lista. Empieza a investigar.'
```

## Pregunta 3.4 — En Windows *(0,3 puntos)*

Localiza a `profe_valentin` por su línea de comandos y **baja su prioridad** a *Por debajo de lo normal*. Después **termina** a `profe_raul`. Demuestra el estado final de ambos. No uses la clase *Tiempo real*.

## Pregunta 3.5 — Un script para despedir *(0,3 puntos)*

Escribe un script **`silenciar.sh`** que reciba como argumento el **nombre** de un proceso y:

1. Si no se le da exactamente un argumento, muestra el uso y sale con código `2`.
2. Si no existe ningún proceso con ese nombre, avisa y sale con código `1`.
3. Si existe, le envía la señal para que termine de forma ordenada, espera 3 segundos y, si sigue vivo, lo fuerza.
4. Informa de qué ha hecho falta y sale con código `0`.

Pruébalo con `profe_alex.sh` y entrega el script.

# 4. Relaciones entre procesos

Hay que conocer las relaciones de dependencia entre procesos, porque si falla uno, caen los que cuelgan de él. Un proceso padre lanza a un hijo y espera; cuando el padre termina antes, el hijo sigue ejecutándose sin él.

## Preparación

Guarda este script como `preparar-4.sh` y ejecútalo:

```bash
D="$HOME/academia/bin"
pkill -KILL -f "^(/bin/bash |python3 )?$HOME/academia/" 2>/dev/null
mkdir -p "$D"

nombrar() { cp "$(command -v "$1")" "$D/$2"; }
nombrar sleep profe_director
nombrar sleep profe_becario
nombrar sleep profe_alex

"$D/profe_alex" 100000 &
# el director lanza al becario y se queda esperando
bash -c "$D/profe_becario 100000 & exec $D/profe_director 100000" &

sleep 2
echo "Academia lista. Empieza a investigar."
```

## Pregunta 4.1 — El organigrama *(0,3 puntos)*

Muestra la cadena de padres de `profe_director` y de `profe_becario` hasta el **proceso 1**. ¿Qué es el proceso 1 en tu sistema?

## Pregunta 4.2 — El director se marcha *(0,3 puntos)*

Haz que `profe_director` deje de existir y averigua qué ha pasado con el **padre** de `profe_becario`. ¿Cambió? ¿Quién es ahora y por qué el sistema no deja procesos sin padre?

## Pregunta 4.3 — Cómo se abrió la academia *(0,3 puntos)*

Averigua el **tiempo total de arranque** del sistema y qué **unidad de la cadena crítica** tardó más.

## Pregunta 4.4 — Quién necesita a quién *(0,3 puntos)*

Averigua de qué unidades **depende** el servicio `cron` y bajo qué **cgroup** se ejecuta. Explica la diferencia entre `Requires=` y `After=`.

## Pregunta 4.5 — Un script para seguir el rastro *(0,3 puntos)*

Escribe un script **`ancestros.sh`** que reciba un **PID** y muestre su cadena de padres hasta el proceso 1, una línea por proceso (`PID nombre`). Si no recibe un PID, o el proceso no existe, debe salir con código `1` y un mensaje de uso. Pruébalo con `profe_becario` y entrega el script.

# 5. Otros casos

Aparece un proceso que nadie ha lanzado: se ejecuta desde una carpeta oculta y ha borrado su ejecutable. Hay que reconocerlo, decidir qué hacer sin destruir las pruebas y dejar por escrito qué es normal en este servidor.

## Preparación

Guarda este script como `preparar-5.sh` y ejecútalo:

```bash
D="$HOME/academia/bin"
O="$HOME/academia/.oculto"
pkill -KILL -f "^(/bin/bash |python3 )?$HOME/academia/" 2>/dev/null
mkdir -p "$D" "$O"

nombrar() { cp "$(command -v "$1")" "$D/$2"; }
nombrar sleep profe_alex
nombrar sleep profe_alicia
"$D/profe_alex" 100000 &
"$D/profe_alicia" 100000 &

# Una suplente que nadie contrató: se esconde en una carpeta oculta y borra su ejecutable
cp "$(command -v yes)" "$O/profe_suplente"
echo "Cubro la clase de A." > "$O/nota.txt"
nice -n 19 "$O/profe_suplente" > /dev/null &
sleep 1
rm "$O/profe_suplente"

sleep 1
echo "Academia lista. Empieza a investigar."
```

## Pregunta 5.1 — Un profesor sin contrato *(0,4 puntos)*

Hay un proceso `profe_*` que no es como los demás. Averigua **al menos tres evidencias** de que es sospechoso (usuario, ejecutable, estado del fichero, prioridad...) y compáralas con las de `profe_alex`. Mira también qué hay en su carpeta.

## Pregunta 5.2 — Actuar sin destruir pruebas *(0,4 puntos)*

Antes de eliminar al sospechoso, **conserva evidencias**: su ejecutable en `~/evidencia_suplente`, la huella (*hash*) de ese fichero y su línea de comandos. Después **termínalo** y comprueba que no vuelve. Explica por qué debías conservar el ejecutable **antes** de terminarlo.

## Pregunta 5.3 — El libro de los profesores *(0,35 puntos)*

Documenta los procesos habituales de la academia en una tabla con **al menos 8 filas** (puedes incluir procesos del sistema como `systemd`, `cron`, `sshd`):

| Proceso | Función | Ruta del ejecutable | Usuario | Padre | ¿Crítico? |
|---|---|---|---|---|---|

## Pregunta 5.4 — Un inventario automático *(0,35 puntos)*

Escribe un script **`inventario.sh`** que imprima en **CSV** (con cabecera) un inventario de los procesos del **usuario actual** con las columnas `pid,ppid,usuario,estado,comando,ruta,sospechoso`. La columna `sospechoso` vale `si` si la ruta del ejecutable contiene `(deleted)` o pasa por una carpeta oculta, y `no` en caso contrario. Pruébalo antes y después de terminar al sospechoso y entrega el script.

# 6. Demonios

Algo consume recursos de forma continua: un demonio que alguien dejó configurado y que se relanza cuando se mata. Hay que identificarlo, pararlo del todo y, como el servidor sigue necesitando un servicio que marque las horas, escribir uno nuevo que funcione correctamente.

::: aviso
Un demonio mal despedido sigue corriendo. En este apartado vas a crear y a parar servicios de verdad en tu sistema: hazlo en una **máquina de pruebas**, no en tu equipo personal.
:::

## Preparación

Guarda este script como `preparar-6.sh` y ejecútalo. Crea el usuario `bedel` (sin privilegios), el fichero de configuración `/etc/academia/timbre.conf` (que contiene `INTERVALO=5`) y deja funcionando el demonio que frena la academia:

```bash
# Deja el sistema limpio de un intento anterior, crea la configuración del timbre y deja corriendo el demonio de Alex
[ -d /run/systemd/system ] || { echo "Este sistema no usa systemd: necesitas un Ubuntu con systemd."; exit 1; }
for u in conjuro timbre; do
    sudo systemctl unmask $u.service 2>/dev/null
    sudo systemctl disable --now $u.service 2>/dev/null
done
sudo rm -f /etc/systemd/system/conjuro.service /etc/systemd/system/timbre.service /usr/local/bin/conjuro.sh /usr/local/bin/timbre.sh
sudo systemctl daemon-reload

# Usuario del sistema, sin privilegios, con el que se ejecutarán los demonios
id bedel >/dev/null 2>&1 || sudo useradd --system --no-create-home --shell /usr/sbin/nologin bedel

sudo mkdir -p /etc/academia
echo 'INTERVALO=5' | sudo tee /etc/academia/timbre.conf > /dev/null

# El demonio que invocó Alex: trabaja a base de consumir CPU y systemd lo relanza siempre
sudo tee /usr/local/bin/conjuro.sh > /dev/null <<'FIN'
#!/bin/bash
while true; do :; done
FIN
sudo chmod +x /usr/local/bin/conjuro.sh
sudo tee /etc/systemd/system/conjuro.service > /dev/null <<'FIN'
[Unit]
Description=Demonio invocado por Alex para que trabaje por él

[Service]
User=bedel
ExecStart=/usr/local/bin/conjuro.sh
Nice=10
CPUQuota=50%
Restart=always

[Install]
WantedBy=multi-user.target
FIN
sudo systemctl daemon-reload
sudo systemctl enable --now conjuro.service

echo "Academia lista. Empieza a investigar."
```

## Pregunta 6.1 — Quién frena la academia *(0,25 puntos)*

Averigua qué proceso consume más CPU, qué servicio de `systemd` lo gestiona, con qué usuario se ejecuta y qué dice su descripción sobre quién lo invocó. Demuéstralo con la salida de los comandos.

## Pregunta 6.2 — No se deja matar *(0,25 puntos)*

Termina el proceso del demonio **con una señal**, primero de forma ordenada y después forzada (el proceso no es tuyo: necesitarás privilegios). Demuestra qué ocurre con su PID y con su estado tras cada intento y **explica por qué**.

## Pregunta 6.3 — Cerrar la puerta *(0,25 puntos)*

**Páralo del todo**: que ya no consuma CPU, que no vuelva a arrancar en el próximo arranque del sistema y que no quede ningún proceso del demonio. Demuestra las tres cosas. Explica qué hace cada orden que usaste, y qué ocurre si intentas bloquear la unidad del todo (que ni siquiera se pueda arrancar a mano) cuando su fichero `.service` está en `/etc/systemd/system`.

## Pregunta 6.4 — El demonio nuevo *(0,25 puntos)*

Escribe el demonio **`timbre.sh`** y guárdalo en `/usr/local/bin/timbre.sh` con permiso de ejecución. Debe:

1. Leer `INTERVALO` de `/etc/academia/timbre.conf` y escribir `Suena el timbre` cada `INTERVALO` segundos.
2. Al recibir la señal de **recarga**, volver a leer la configuración y escribir `Configuración cargada: intervalo de Ns`.
3. Al recibir la señal de **terminar**, escribir `Fin de la jornada` y salir con código `0`.

Las señales deben atenderse **al instante**, sin esperar a que acabe la pausa entre dos timbrazos. Pruébalo **a mano**, en primer plano, sin `systemd`: cambia el intervalo, recárgalo y termínalo, enseñando la salida de cada paso. Entrega el script.

## Pregunta 6.5 — Bien atado *(0,25 puntos)*

Escribe la unidad **`timbre.service`** para que `systemd` gestione el demonio nuevo. Debe ejecutarlo con el usuario `bedel`, permitir **recargar** su configuración, activarse en el **arranque normal** y relanzarse **solo si falla**, no cuando se le pide terminar. Regístrala, arráncala y activa el servicio. Demuestra su estado y las últimas líneas de su diario (necesitas ser administrador). Entrega la unidad.

## Pregunta 6.6 — Cambiar el intervalo sin parar *(0,25 puntos)*

Cambia `INTERVALO` a `1` y haz que el demonio lo aplique **sin pararlo**. Demuestra con el diario que la configuración se recargó y con el PID que es **el mismo proceso**.

::: tip
Un buen informe responde siempre a tres preguntas: **¿qué pasaba?**, **¿cómo lo supe?** y **¿qué hice?**.
:::

# Criterios de evaluación cubiertos

Esta práctica trabaja los siguientes criterios del RA2 (*Administra procesos del sistema*):

- **a)** Concepto de proceso, tipos, estados y ciclo de vida (apartado 1).
- **b)** Interrupciones y excepciones (apartado 1).
- **c)** Diferencia entre proceso, hilo y trabajo (apartado 1).
- **d)** Creación, manipulación y terminación de procesos (apartados 3 y 6).
- **e)** El sistema de archivos como registro de los procesos (apartado 2).
- **f)** Herramientas gráficas y comandos de seguimiento (apartado 2).
- **g)** Secuencia de arranque y relación entre procesos (apartados 4 y 6).
- **h)** Medidas de seguridad ante procesos no identificados (apartado 5).
- **i)** Documentación de los procesos habituales (apartado 5).
