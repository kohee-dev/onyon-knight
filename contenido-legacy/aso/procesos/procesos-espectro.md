---
titulo: "El Espectro de la Máquina"
licencia: CC-BY-NC-SA-4.0
tipo: caso
horas: 9
borrador: true
---

::: aviso
Para la realización de esta actividad voy a tener los siguientes supuestos:

+ Eres capaz de leer y entender oraciones **largas** y comprender **lo que hay que hacer**.
+ Manejas la terminal de Linux con soltura y te tomas en serio la investigación.
+ Cada apartado se corrige de forma *individual* y separada del resto.
+ Documenta cada hallazgo con su **evidencia** (captura o salida de comando). Un detective sin pruebas no tiene caso.
+ Apunta todos los comandos que uses: forman parte de tu cuaderno de investigación.
+ Estamos ante retos que no hemos trabajado en profundidad en clase; por eso mismo, **no tengas miedo de preguntar**.
+ Si alguien realiza algún tipo de *brujería* o *plagio*, lo sabré.
:::

---

# El caso

Corre el otoño de 188… en **Ravensmoor**, una ciudad gris y brumosa atravesada por
el humo de las fábricas y el rumor del telégrafo. Te has labrado cierta fama como
**detective consultor**: cuando la Policía Metropolitana se topa con un misterio que
escapa a sus métodos, llaman a tu puerta.

Esta mañana, un mensajero empapado por la lluvia te entrega un sobre lacrado. Dentro,
una nota apresurada del **Inspector Holloway**:

> *"Estimado colega: acuda con urgencia a la Oficina Central de Telégrafos. Su Motor
> Analítico —la máquina que cifra y reparte todos los mensajes de la ciudad— se ha
> vuelto loco. Va lento, se calienta, y los operarios juran que «algo» trabaja ahí
> dentro de noche, cuando nadie lo ordena. Lo hemos apagado y encendido sin éxito:
> el intruso siempre regresa. Necesito que averigüe **quién** anda dentro de la
> máquina, **cómo entró** y, sobre todo, **cómo echarlo para siempre**. — H."*

El "Motor Analítico" no es más que el **servidor GNU/Linux** que sostiene las
comunicaciones de Ravensmoor. Y ese "huésped" que regresa una y otra vez es un
**proceso intruso** que alguien ha dejado corriendo. Tu misión, detective, es
clásica en su estructura aunque moderna en sus herramientas: **observar, deducir y
actuar**. Reúne las pistas, identifica al culpable, desmantela sus apoyos y entrega
un informe que cierre el caso ante la Policía Metropolitana.

::: nota
**Escenario.** Necesitas una máquina **GNU/Linux** (vale una VM con Ubuntu Server o
similar) sobre la que tengas privilegios de administrador (`sudo`). Tu profesor
habrá dejado el "intruso" instalado y en marcha antes de que empiece tu turno. Todo
lo que vas a investigar es **inofensivo**: una simulación pensada para aprender, sin
ningún código realmente dañino.
:::

---

# Conocimientos previos

Esta es una práctica **avanzada** de cierre del tema. Antes de empezar debes dominar
la teoría de **Procesos del sistema** (general) y, sobre todo, **Procesos del sistema
en Linux**. En concreto necesitas:

- Qué es un proceso, su **PID** y **PPID**, y la **jerarquía** que parte de
  `systemd` (PID 1).
- Los **estados** de un proceso en `ps` (`R`, `S`, `D`, `T`, `Z`) y qué es un
  **zombi** y un **huérfano**.
- Las **señales** y la diferencia entre `SIGTERM` y `SIGKILL`; uso de `kill`,
  `pkill`, `killall`.
- El sistema de archivos **`/proc`** y sus ficheros por proceso (`cmdline`, `exe`,
  `cwd`, `environ`, `fd/`).
- Herramientas de observación: `ps aux`, `top`/`htop`, `pstree`, y a poder ser
  `lsof`.
- **Demonios y persistencia**: nociones de `systemd` (`systemctl`, unidades y
  *timers*) y de **cron** (`crontab`, `/etc/cron*`).

::: tip
El método del buen detective —y del buen administrador— es siempre el mismo:
**nunca actúes antes de comprender**. Si matas al intruso antes de saber cómo
regresa, solo conseguirás que vuelva más esquivo. Observa primero.
:::

---

# Capítulo I — La escena del crimen

Acabas de llegar a la Oficina de Telégrafos. La máquina resopla, sobrecargada.
Empieza como empieza toda investigación: **observando** sin tocar nada.

## Pista 1.1 — Toma de contacto

Conéctate al servidor y obtén una visión general de la actividad:

1. Lanza `top` (o `htop` si está disponible) y observa qué proceso está
   **disparando la CPU**.
2. Anota su nombre, su **PID**, el **usuario** que lo ejecuta y su consumo.

> Cuaderno: captura de `top` con el sospechoso a la vista y la ficha inicial
> (nombre, PID, usuario, %CPU).

## Pista 1.2 — El retrato del sospechoso

Un buen detective desconfía de las apariencias. Usa `ps` para fijar los datos del
proceso con precisión:

```bash
ps -eo pid,ppid,user,stat,%cpu,etime,comm --sort=-%cpu | head
```

Fíjate especialmente en la columna **`STAT`** (su estado), en **`ETIME`** (cuánto
lleva vivo) y en el **`PPID`** (quién lo engendró). Compara el nombre del proceso con
los procesos legítimos del sistema: ¿te recuerda a alguno **camuflado** con un nombre
parecido?

> Cuaderno: la línea completa del sospechoso y un comentario: ¿por qué su nombre
> resulta sospechoso?, ¿en qué estado se encuentra?

---

# Capítulo II — El interrogatorio (`/proc`)

En Ravensmoor los sospechosos mienten; en Linux, no. Todo proceso deja su confesión
escrita en **`/proc/<PID>/`**. Vamos a interrogar al intruso a través de su
expediente.

Sustituye `<PID>` por el del sospechoso en todos los comandos:

## Pista 2.1 — ¿Con qué orden se le invocó?

```bash
cat /proc/<PID>/cmdline | tr '\0' ' '; echo
```

## Pista 2.2 — ¿Desde dónde opera?

```bash
readlink /proc/<PID>/exe     # ruta real del ejecutable
readlink /proc/<PID>/cwd     # directorio de trabajo
```

Un proceso "del sistema" que se ejecuta desde `/tmp`, `/var/tmp` o el directorio de
un usuario es, casi siempre, un impostor.

## Pista 2.3 — Sus pertenencias

```bash
ls -l /proc/<PID>/fd         # archivos y recursos que tiene abiertos
cat /proc/<PID>/environ | tr '\0' '\n'   # variables de entorno (pueden delatar quién lo lanzó)
```

> Cuaderno: reúne las cuatro evidencias (orden de invocación, ejecutable, directorio
> de trabajo y recursos abiertos). Con ellas, redacta un **primer perfil del intruso**:
> qué es, desde dónde opera y qué está tocando.

---

# Capítulo III — El árbol genealógico

Ningún intruso aparece de la nada: **alguien lo engendró**. Sigue el rastro hacia
arriba por la jerarquía de procesos.

## Pista 3.1 — ¿Quién es su padre?

Mira el **PPID** que anotaste y averigua qué proceso es:

```bash
ps -o pid,ppid,user,comm -p <PPID>
pstree -ps <PID>     # muestra toda la línea de ascendencia hasta PID 1
```

## Pista 3.2 — La deducción

Detente a pensar como un detective. El padre del intruso te dice **cómo llegó a
estar vivo**:

- Si su padre es una **terminal o una shell**, alguien lo lanzó a mano.
- Si su padre es **`systemd` (PID 1)** o un proceso de **cron**, entonces hay un
  **mecanismo automático** que lo mantiene o lo resucita. Esa es la verdadera trama
  del caso.

> Cuaderno: el árbol de ascendencia completo y tu hipótesis: ¿cómo crees que el
> intruso llega a ejecutarse? Anótala; la confirmarás (o no) más adelante.

---

# Capítulo IV — El arresto… y la fuga

Tienes identificado al sospechoso. Es el momento de detenerlo. Pero cuidado: este
intruso es escurridizo.

## Pista 4.1 — El primer intento

Intenta terminarlo **con educación** primero, como manda el oficio:

```bash
kill <PID>          # envía SIGTERM: le pide que termine ordenadamente
```

Comprueba con `ps`/`top` si ha desaparecido. Si sigue ahí, recurre a la fuerza:

```bash
kill -9 <PID>       # SIGKILL: lo mata sin contemplaciones
```

## Pista 4.2 — El regreso del espectro

Espera un minuto y vuelve a mirar la lista de procesos. Si tu hipótesis del Capítulo
III era correcta, el intruso **habrá regresado**… con un **PID distinto**.

Aquí está el corazón del caso: no te enfrentas a un proceso, sino a un proceso **con
respaldo**. Matarlo no basta, porque algo lo está **resucitando**. Un detective
novato seguiría matándolo en bucle toda la noche; tú vas a ir a por **el cómplice que
lo trae de vuelta**.

> Cuaderno: documenta la secuencia (PID antes de matarlo → orden usada → PID nuevo
> tras el regreso) y explica con tus palabras la diferencia entre `SIGTERM` y
> `SIGKILL` y por qué, aun así, ninguna de las dos resolvió el problema.

:::pregunta[¿Por qué el intruso reaparecía con un **PID distinto** cada vez? ¿Qué nos dice eso sobre la relación entre un programa y un proceso?]
Porque cada vez que algo lo relanza se crea un proceso nuevo, y cada proceso recibe su propio PID. El programa es el mismo, pero cada ejecución es una instancia distinta: un programa puede dar lugar a muchos procesos.
:::

:::pregunta[Si al matar al intruso su proceso hubiera quedado en estado **`Z` (zombi)**, ¿qué significaría y de quién sería la "responsabilidad" de recogerlo?]
Significaría que el proceso ya ha terminado pero su padre aún no ha recogido su código de salida. La responsabilidad de recogerlo es de su proceso padre.
:::

---

# Capítulo V — El cómplice oculto

El intruso tiene un protector que lo devuelve a la vida. En un sistema Linux, los
sospechosos habituales de "resucitar" procesos son dos: **cron** (el planificador de
tareas) y **systemd** (que reinicia servicios caídos). Vamos a registrar ambos
escondites.

## Pista 5.1 — Registrando a cron

```bash
crontab -l                 # tareas del usuario actual
sudo crontab -l            # tareas de root
ls -l /etc/cron.d/ /etc/cron.*/   # tareas del sistema
cat /etc/crontab
```

Busca cualquier línea que invoque al intruso o a un script sospechoso, y fíjate en
**cada cuánto** se ejecuta.

## Pista 5.2 — Registrando a systemd

```bash
systemctl list-units --type=service --all | grep -i <pista>
systemctl list-timers --all
systemctl status <servicio_sospechoso>
```

Si encuentras un **servicio** o un ***timer*** que lanza al intruso, examina su
unidad: te dirá qué ejecuta y si está configurado para **reiniciarse solo**
(`Restart=always`) o **arrancar al inicio** (`enabled`).

## Pista 5.3 — Atando cabos

> Cuaderno: identifica **el mecanismo de persistencia** (la tarea de cron o la unidad
> de systemd concreta), copia la línea/unidad que lo delata y explica **cómo**
> resucita al intruso. Confirma o corrige aquí la hipótesis que escribiste en el
> Capítulo III.

:::pregunta[¿Qué ventaja tiene `systemd` con `Restart=always` para un servicio **legítimo**? ¿Por qué esa misma característica es perfecta para un intruso?]
Para un servicio legítimo, `Restart=always` hace que se reinicie solo si cae, sin intervención manual. Esa misma característica resucita al intruso casi al instante tras matarlo, de modo que matar el proceso no basta.
:::

---

# Capítulo VI — Desmantelando la trama

Ahora que conoces toda la red —el intruso **y** su cómplice—, puedes desarticularla
en el orden correcto. El orden importa: si matas al proceso antes de desactivar su
respaldo, volverá.

1. **Neutraliza primero la persistencia.** Según lo que hayas encontrado:
   - Si es **cron**: elimina o comenta la línea responsable (`crontab -e`, o el
     fichero correspondiente en `/etc/cron*`).
   - Si es **systemd**: detén y deshabilita la unidad.

   ```bash
   sudo systemctl stop <servicio>
   sudo systemctl disable <servicio>
   ```

2. **Ahora sí, termina el proceso intruso** que siga vivo (`kill`).

3. **Verifica que el espectro no regresa.** Espera un par de minutos —más que el
   intervalo de cron que descubriste— y confirma con `ps`/`top` que **no reaparece**.

> Cuaderno: la secuencia exacta de comandos con la que desmantelaste la trama y la
> evidencia final de que el sistema ha quedado limpio y con la CPU en calma.

::: aviso
En un sistema real no bastaría con desactivar la persistencia: habría que conservar
las **evidencias**, analizar **cómo entró** el atacante y revisar si dejó otras
puertas. En esta práctica nos detenemos en la neutralización, pero recuérdalo.
:::

:::pregunta[¿Por qué fue importante **desactivar la persistencia antes** de matar el proceso, y no al revés?]
Porque, si se mata el proceso antes de desactivar su respaldo (cron o la unidad de systemd), este lo vuelve a lanzar y el intruso regresa. Primero hay que neutralizar la persistencia, después terminar el proceso y verificar que no reaparece.
:::

---

# Capítulo VII — El informe para la Policía Metropolitana

Un caso no se cierra hasta que está **escrito**. Redacta el informe forense que
entregarás al Inspector Holloway. Debe poder leerlo alguien que no estuvo presente y
entender todo lo ocurrido. Incluye:

1. **Resumen del incidente**: qué le pasaba a la máquina, en una frase.
2. **El sospechoso**: nombre del proceso, ruta del ejecutable, usuario, estado y por
   qué resultaba sospechoso (el camuflaje del nombre, su ubicación…).
3. **Cronología de la investigación**: las pistas que seguiste, en orden, con la
   evidencia de cada una.
4. **El mecanismo de persistencia**: cómo regresaba el intruso (la tarea de cron o la
   unidad de systemd), explicado con claridad.
5. **Las medidas tomadas**: qué hiciste para neutralizarlo, en qué orden y por qué
   ese orden.
6. **Recomendaciones**: dos o tres medidas que propondrías para que esto no vuelva a
   ocurrir.

::: tip
Estructura cada hallazgo como lo haría un detective: **observación → deducción →
prueba**. "Observé que el proceso `kworkerd` consumía el 98 % de CPU; deduje que era
un impostor porque los `kworker` legítimos van entre corchetes y no consumen CPU de
usuario; lo probé comprobando en `/proc` que se ejecutaba desde `/tmp`."
:::

---

# Criterios de evaluación cubiertos

Esta práctica trabaja, de forma integrada, los siguientes criterios del RA2
(*Administra procesos del sistema*):

- **a)** Estados y ciclo de vida del proceso (Capítulos I, IV y preguntas finales).
- **c)** Distinción proceso / programa (regreso con nuevo PID, preguntas finales).
- **d)** Manipulación y terminación de procesos con señales (Capítulos IV y VI).
- **e)** Identificación de procesos a través de `/proc` (Capítulo II).
- **f)** Herramientas de seguimiento: `ps`, `top`/`htop`, `pstree`, `lsof` (toda la práctica).
- **g)** Demonios, `systemd`, cron y la persistencia al arranque (Capítulos V y VI).
- **h)** Detección y neutralización de procesos no identificados (todo el caso).
- **i)** Documentación: el informe forense (Capítulo VII).

---

# ╌╌╌ Apéndice para el profesorado (no repartir al alumnado) ╌╌╌

> Este apéndice describe cómo **desplegar el escenario** antes de la sesión. El
> "intruso" es totalmente **inofensivo**: un script que solo ocupa CPU con un bucle y
> se vuelve a lanzar mediante un mecanismo de persistencia. Elige **una** de las dos
> variantes (cron o systemd) por grupo, o reparte distintas para evitar copias.

## Variante A — Persistencia con cron

El "malware" simulado, ubicado para parecer sospechoso (`/tmp`):

```bash
sudo tee /tmp/kworkerd >/dev/null <<'EOF'
#!/bin/bash
# Proceso intruso SIMULADO e inofensivo: solo consume CPU.
while true; do :; done
EOF
sudo chmod +x /tmp/kworkerd
```

Persistencia: una tarea de cron de root que lo relanza cada minuto **si no está
vivo** (así "revive" tras matarlo):

```bash
echo '* * * * * root pgrep -f /tmp/kworkerd >/dev/null || /tmp/kworkerd &' \
  | sudo tee /etc/cron.d/telegrafo >/dev/null
sudo systemctl restart cron
```

## Variante B — Persistencia con systemd

```bash
sudo tee /tmp/kworkerd >/dev/null <<'EOF'
#!/bin/bash
while true; do :; done
EOF
sudo chmod +x /tmp/kworkerd

sudo tee /etc/systemd/system/telegrafo.service >/dev/null <<'EOF'
[Unit]
Description=Servicio de mantenimiento del telegrafo (SIMULADO)
[Service]
ExecStart=/tmp/kworkerd
Restart=always
[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now telegrafo.service
```

## Limpieza del escenario tras la práctica

```bash
# Variante A
sudo rm -f /etc/cron.d/telegrafo /tmp/kworkerd; sudo systemctl restart cron
# Variante B
sudo systemctl disable --now telegrafo.service
sudo rm -f /etc/systemd/system/telegrafo.service /tmp/kworkerd
sudo systemctl daemon-reload
# En ambos casos, matar cualquier resto:
sudo pkill -f /tmp/kworkerd
```

::: nota
La gracia del caso está en que el alumnado **no** consiga eliminar el intruso solo
con `kill` (Capítulo IV) y se vea obligado a descubrir la persistencia (Capítulo V).
La variante B, con `Restart=always`, resucita el proceso casi al instante; la A lo
hace en el siguiente minuto. Ajusta la dificultad eligiendo una u otra.
:::
