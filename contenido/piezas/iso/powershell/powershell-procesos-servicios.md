---
titulo: "PowerShell 8: procesos, servicios y registros"
tipo: teoria
---

# PowerShell 8: procesos, servicios y registros

Un equipo en marcha es un conjunto de **programas ejecutándose**. Algunos los has abierto tú, y se llaman **procesos**. Otros arrancan solos con el sistema y trabajan sin ventana, como el que gestiona la impresora o las actualizaciones, y se llaman **servicios**. Administrar un servidor es, en buena parte, saber ver qué corre, pararlo, arrancarlo y consultar qué ha ido mal.

## Lo mínimo para empezar

| Cmdlet | Alias | Qué hace |
|---|---|---|
| `Get-Process` | `ps`, `gps` | lista los procesos en marcha |
| `Get-Process -Name notepad` | | solo los de ese nombre |
| `Start-Process notepad` | | lanza un programa (`-PassThru` devuelve su proceso) |
| `Stop-Process -Id 4321` | `kill` | cierra el proceso con ese número |
| `Stop-Process -Name notepad` | | cierra **todos** los procesos con ese nombre |
| `Wait-Process -Id 4321` | | espera a que termine |
| `Get-Service` | `gsv` | lista los servicios y su estado |
| `Start-Service` / `Stop-Service` / `Restart-Service` | | arranca, para o reinicia un servicio |
| `Set-Service -Name x -StartupType Disabled` | | decide si arranca solo (`Automatic`), a mano (`Manual`) o nunca (`Disabled`) |
| `Start-Job { ... }` | | ejecuta un bloque **en segundo plano** |
| `Get-Job`, `Receive-Job`, `Remove-Job` | | ve, recoge el resultado y borra los trabajos |
| `Get-EventLog -LogName System` | | lee un **registro de sucesos** (en Windows PowerShell 5.1) |

Ideas que conviene tener claras:

- Cada proceso tiene un **número de identificación**, el `Id` o PID, que no se repite mientras vive. Un nombre como `notepad` puede corresponder a varios procesos a la vez, así que `Stop-Process -Name` cierra **todos**. Para cerrar uno concreto se usa `-Id`.
- De un proceso interesan sobre todo `Id`, `ProcessName`, `CPU` (segundos de procesador usados) y `WS` (memoria física que ocupa, en bytes). Son propiedades normales, y se ordenan y se filtran con las tuberías de la pieza 5.
- Un servicio tiene un estado, `Status` (`Running` o `Stopped`), y una forma de arrancar, `StartType`. Parar un servicio no impide que arranque en el próximo inicio: para eso hay que cambiar el `StartType`.
- **Parar o arrancar servicios y cerrar procesos de otras personas exige ser administrador.** Cerrar un proceso tuyo no.
- No cierres procesos del sistema a ciegas. `Stop-Process` con `-WhatIf` enseña qué cerraría sin hacerlo.
- Un **trabajo** (`job`) es una orden que corre a la vez que tú sigues usando la terminal. Cuando termina, `Receive-Job` te entrega lo que escribió.
- Los **registros de sucesos** guardan lo que ha ido pasando: arranques, errores, inicios de sesión. Son el primer sitio al que mirar cuando algo falla. La orden clásica es `Get-EventLog`, y su sucesora, `Get-WinEvent`, es más potente.

## Ejercicios

### 1. Los más pesados

Lee esta orden:

```powershell
Get-Process | Sort-Object WS -Descending | Select-Object -First 3
```

:::pregunta[¿Qué enseña? ¿Qué enseñaría si cambias `WS` por `CPU`?]
Enseña los **tres procesos que más memoria física ocupan**. `WS` (*working set*) es esa memoria en bytes, y `-Descending` pone primero los mayores.

Con `CPU` enseñaría los tres que más tiempo de procesador han gastado en total. Son dos preguntas distintas: uno puede gastar mucha memoria y poca CPU, y al revés.
:::

### 2. Cerrar uno o cerrar todos

Hay tres ventanas del Bloc de notas abiertas, con `Id` 100, 200 y 300. Lee estas órdenes:

```powershell
Stop-Process -Id 200
Stop-Process -Name notepad
```

:::pregunta[¿Qué cierra cada una?]
La primera cierra **solo** el proceso 200. La segunda cierra **todos** los que quedan con el nombre `notepad`: el 100 y el 300.

Por eso es más prudente cerrar por `Id` y comprobar antes con `Get-Process -Name notepad`.
:::

### 3. Ensayar antes de cerrar

Lee esta orden:

```powershell
Stop-Process -Name notepad -WhatIf
```

:::pregunta[¿Qué ocurre?]
Escribe una línea por cada proceso con ese nombre, parecida a `What if: Performing the operation "Stop-Process" on target "notepad (100)"`, y **no cierra ninguno**. Es la comprobación segura antes de una orden que puede afectar a varios procesos.
:::

### 4. Estado de un servicio

Lee esta orden y su salida:

```powershell
Get-Service Spooler
```

```text
Status   Name               DisplayName
------   ----               -----------
Running  Spooler            Cola de impresión
```

:::pregunta[¿Qué te dice? ¿Qué más hay que mirar para saber si arrancará tras un reinicio?]
Que el servicio `Spooler`, el de la cola de impresión, está **en marcha** ahora mismo. Para saber si volverá a arrancar solo hay que mirar el `StartType`:

```powershell
Get-Service Spooler | Select-Object Name, Status, StartType
```

Si dice `Automatic`, arrancará con el sistema. Si dice `Disabled`, no arrancará ni a mano.
:::

### 5. Solo los servicios parados

:::pregunta[Escribe una orden que enseñe solo los servicios que están **parados**]
```powershell
Get-Service | Where-Object Status -eq Stopped
```

`Status` es una propiedad del servicio, y `Where-Object` se queda con los que valen `Stopped`. Es la misma tubería que con ficheros: lo que cambia es el tipo de objeto.
:::

### 6. Parar no es desactivar

Un administrador ejecuta esta orden:

```powershell
Stop-Service Spooler
```

:::pregunta[¿Seguirá parado después de reiniciar el equipo? ¿Qué orden lo impediría?]
**No**: si su `StartType` es `Automatic`, el servicio vuelve a arrancar solo con el sistema. Parar es temporal.

Para que no arranque más se cambia el tipo: `Set-Service Spooler -StartupType Disabled`. Y se vuelve a dejar normal con `-StartupType Automatic`.
:::

### 7. Un trabajo en segundo plano

Lee estas órdenes:

```powershell
$j = Start-Job { Start-Sleep 5; "terminado" }
Get-Job
Wait-Job $j | Out-Null
Receive-Job $j
```

:::pregunta[¿Qué ve cada orden?]
`Start-Job` devuelve el control al instante, sin esperar los 5 segundos. `Get-Job` enseña el trabajo con estado `Running`. `Wait-Job` espera a que acabe (`| Out-Null` oculta su salida), y `Receive-Job` escribe por fin `terminado`.

Sirve para lanzar una tarea larga, como una copia, sin quedarte con la terminal bloqueada.
:::

### 8. Qué ha fallado

Un equipo se ha comportado de forma rara y quieres ver los últimos errores del sistema.

:::pregunta[Escribe la orden]
```powershell
Get-EventLog -LogName System -EntryType Error -Newest 5
```

Enseña los cinco **errores más recientes** del registro `System`, que recoge lo que ocurre en el sistema operativo y los servicios. Cada suceso tiene fecha, origen y mensaje. Hay otros registros: `Application` para los programas y `Security` para los inicios de sesión.
:::

## Hazlo tú

Estos ejercicios no necesitan preparación: usan el Bloc de notas, que viene en todos los Windows. Los ejercicios 13 y 14 se hacen **solo en una máquina virtual o equipo de pruebas**.

### 9. Lanzar y localizar

Lanza el Bloc de notas desde la terminal, guarda su proceso en una variable `$p` y demuestra con su `Id` que está en marcha.

:::pregunta[Escribe las órdenes y cómo lo demuestras]
```powershell
$p = Start-Process notepad -PassThru
$p.Id
Get-Process -Id $p.Id
```

`-PassThru` hace que `Start-Process` te devuelva el proceso en vez de escribir nada. La segunda orden escribe el número, y la tercera enseña el proceso `notepad` con ese número.
:::

### 10. Cerrarlo

Cierra **solo ese** proceso y demuestra que ya no existe.

:::pregunta[Escribe las órdenes y cómo lo demuestras]
```powershell
Stop-Process -Id $p.Id
Get-Process -Id $p.Id -ErrorAction SilentlyContinue
```

La ventana se cierra y la segunda orden **no escribe nada**. Sin `-ErrorAction SilentlyContinue` saldría un error rojo diciendo que no existe un proceso con ese `Id`, que es justo lo que querías comprobar.
:::

### 11. Los tres que más memoria usan

Escribe el nombre y la memoria en **megabytes** de los tres procesos que más memoria ocupan.

:::pregunta[Escribe la orden y la forma de la respuesta]
```powershell
Get-Process | Sort-Object WS -Descending | Select-Object -First 3 Name, @{ Name = "MB"; Expression = { [math]::Round($_.WS / 1MB) } }
```

Salen tres filas con el nombre del proceso y su memoria en MB. Los nombres y las cifras dependen del equipo. La parte entre llaves crea una columna calculada: divide `WS` entre `1MB` y redondea.
:::

### 12. Cuántos servicios hay en marcha

Averigua cuántos servicios están en marcha y cuántos parados.

:::pregunta[Escribe la orden y la forma de la respuesta]
```powershell
Get-Service | Group-Object Status
```

Salen dos grupos, `Running` y `Stopped`, con su número de servicios. Las cifras dependen del equipo, pero normalmente hay más en marcha que parados.
:::

### 13. Parar y arrancar un servicio (administrador, solo en una máquina virtual)

Con PowerShell **como administrador**, para el servicio `Spooler`, demuestra que está parado, vuelve a arrancarlo y demuestra que está en marcha.

:::pregunta[Escribe las órdenes y la salida]
```powershell
Stop-Service Spooler
Get-Service Spooler
Start-Service Spooler
Get-Service Spooler
```

La primera consulta escribe `Stopped` y la segunda `Running`. Sin permisos de administrador, `Stop-Service` falla con un error de acceso denegado.
:::

### 14. Un trabajo y su resultado

Lanza en segundo plano una orden que cuente cuántos procesos hay, y recoge el resultado cuando acabe. Deja la lista de trabajos vacía al terminar.

:::pregunta[Escribe las órdenes y la forma de la respuesta]
```powershell
$j = Start-Job { (Get-Process).Count }
Wait-Job $j | Out-Null
Receive-Job $j
Remove-Job $j
Get-Job
```

`Receive-Job` escribe un número, que depende del equipo. Después de `Remove-Job`, `Get-Job` ya no escribe nada.
:::
