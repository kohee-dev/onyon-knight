---
titulo: "PowerShell 12: automatizar copias, registros y tareas programadas"
tipo: teoria
---

# PowerShell 12: automatizar copias, registros y tareas programadas

Todo lo anterior converge aquí. Un administrador no hace una copia de seguridad a mano cada noche: escribe un **script** que la hace, que **deja constancia** de lo que hizo, que **borra las copias viejas** y que el sistema lanza solo a una hora fija. Esta pieza junta lo aprendido en una tarea real, y añade las dos piezas que faltan: el registro (*log*) y las **tareas programadas**.

## Lo mínimo para empezar

| Elemento | Qué hace |
|---|---|
| `Get-Date -Format "yyyyMMdd-HHmmss"` | la fecha y hora como texto, por ejemplo `20261124-030000` |
| `Add-Content log.txt "texto"` | **añade** una línea al final de un fichero (lo crea si no existe) |
| `$PSScriptRoot` | la carpeta donde está el propio script |
| `param([switch]$Simular)` | un parámetro que no lleva valor: si lo escribes, vale `True` |
| `(Get-Date).AddDays(-7)` | la fecha de hace 7 días |
| `Compress-Archive -Path "ruta\*" -DestinationPath f.zip` | comprime **el contenido** de una carpeta |
| `New-ScheduledTaskAction -Execute x -Argument y` | **qué** ejecuta una tarea programada |
| `New-ScheduledTaskTrigger -Daily -At 3am` | **cuándo** (también `-Weekly -DaysOfWeek Monday`) |
| `Register-ScheduledTask -TaskName n -Action a -Trigger t` | da de alta la tarea |
| `Get-ScheduledTask`, `Get-ScheduledTaskInfo` | ver las tareas y cómo les fue |
| `Start-ScheduledTask`, `Unregister-ScheduledTask` | lanzar una tarea ya, o borrarla |

Ideas que conviene tener claras:

- Un script de copias tiene siempre las mismas partes: **comprobar** que el origen existe, **crear** la copia con un nombre que lleve la fecha (para no machacar la anterior), **anotar** en un registro lo que ha pasado, y **limpiar** las copias que ya no hacen falta. Es el principio de un plan de copias que se puede automatizar.
- Una tarea programada **no se ejecuta en la carpeta de tu script**: su carpeta de trabajo suele ser la de sistema. Si el script usa rutas relativas como `.\copia.log`, escribirá donde no esperas. Por eso se usa `$PSScriptRoot`, que siempre apunta a la carpeta del script, o rutas absolutas.
- Una tarea programada ejecuta un **programa con argumentos**, no un script directamente: el programa es `powershell.exe` y el argumento es `-File "ruta\script.ps1"`. Se añade `-NoProfile` para que arranque limpio y `-ExecutionPolicy Bypass` para que la política de ejecución no la bloquee.
- Si el script lleva una ruta con **espacios**, hay que protegerla con comillas dentro de las comillas. En PowerShell, dentro de comillas dobles, una comilla doble se escribe con el acento grave: `` `" ``.
- Crear una tarea programada exige abrir PowerShell **como administrador**. Una tarea creada puede ejecutarse aunque no haya nadie con la sesión iniciada solo si se le da un usuario y una contraseña.
- Antes de ejecutar un script que **crea o borra cosas**, dale a mano la posibilidad de **simular**: un parámetro `-Simular` que solo escribe lo que haría. Es la versión propia de `-WhatIf`.
- Para saber si una tarea terminó bien se mira `LastTaskResult`: `0` es correcto, y `267011` quiere decir que **todavía no se ha ejecutado**.

## Ejercicios

### 1. Nombres con fecha

Lee esta orden, ejecutada el 24 de noviembre de 2026 a las 03:00:05:

```powershell
"copia-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"
```

:::pregunta[¿Qué escribe y por qué se pone la fecha en el nombre?]
`copia-20261124-030005.zip`.

Con la fecha en el nombre, cada copia es un fichero **distinto** y no se machaca la anterior. Además, al ordenar por nombre, quedan ordenadas por antigüedad. Se escribe año, mes y día en ese orden, porque es lo que hace que el orden alfabético y el cronológico coincidan.
:::

### 2. Escribir un registro

Lee este código:

```powershell
function Escribir-Log($mensaje) {
    Add-Content "$PSScriptRoot\copia.log" "$(Get-Date -Format 'HH:mm:ss') $mensaje"
}
Escribir-Log "inicio"
Escribir-Log "fin"
```

:::pregunta[¿Qué hay en `copia.log`? ¿Por qué `Add-Content` y no `Set-Content`?]
Dos líneas, algo como `03:00:05 inicio` y `03:00:07 fin`, cada una con su hora.

`Add-Content` **añade** al final, y `Set-Content` **sustituye** todo el contenido. Un registro debe acumular lo que va pasando: con `Set-Content` solo quedaría la última línea.
:::

### 3. Quitar lo viejo

Lee esta orden:

```powershell
Get-ChildItem copias -Filter *.zip |
    Where-Object LastWriteTime -lt (Get-Date).AddDays(-7) |
    Remove-Item -WhatIf
```

:::pregunta[¿Qué hace? ¿Qué cambia si quitas `-WhatIf`?]
Escribe qué borraría de entre las copias `.zip` que llevan **más de 7 días** sin modificarse, pero no borra nada.

Sin `-WhatIf`, los borra de verdad. Es la **política de retención**: se guardan las últimas copias y se descartan las antiguas, para no llenar el disco. Se prueba siempre con `-WhatIf` antes.
:::

### 4. El parámetro que se enciende

Un script `altas.ps1` empieza así:

```powershell
param([string]$Archivo, [switch]$Simular)
```

:::pregunta[¿Qué valor tiene `$Simular` en `.\altas.ps1 -Archivo u.csv` y en `.\altas.ps1 -Archivo u.csv -Simular`?]
`False` en la primera y `True` en la segunda.

Un parámetro `[switch]` no lleva valor: con solo escribirlo está **activado**, y si no se escribe, desactivado. Es la forma habitual de poner opciones del tipo «sí o no» a un script.
:::

### 5. Cuándo se ejecuta

Lee esta orden:

```powershell
New-ScheduledTaskTrigger -Daily -At 3am
```

:::pregunta[¿Qué describe? ¿Qué más hace falta para tener una tarea programada?]
Describe **cuándo**: todos los días a las 3:00. No crea nada por sí sola.

Hacen falta una **acción** (`New-ScheduledTaskAction`: qué se ejecuta) y registrar la tarea (`Register-ScheduledTask`), que une una con otra y le da un nombre.
:::

### 6. El script que escribe donde no toca

Un script de copias escribe su registro con esta línea:

```powershell
Add-Content .\copia.log "copia hecha"
```

Funciona perfectamente a mano, pero cuando lo lanza una tarea programada, no aparece ningún `copia.log` en la carpeta del script.

:::pregunta[¿Por qué ocurre y cómo se arregla?]
Porque `.\` significa «la carpeta de trabajo», y la de una tarea programada **no** es la carpeta del script: suele ser una carpeta del sistema. El registro se escribe allí, donde nadie lo mira.

Se arregla con la carpeta del propio script: `Add-Content "$PSScriptRoot\copia.log" "copia hecha"`, o con una ruta absoluta.
:::

### 7. Cómo le fue a una tarea

Lee esta orden y su salida:

```powershell
Get-ScheduledTaskInfo -TaskName "Copia diaria"
```

```text
LastRunTime        : 24/11/2026 3:00:00
LastTaskResult     : 0
NextRunTime        : 25/11/2026 3:00:00
```

:::pregunta[¿Qué te dice? ¿Qué te diría un `LastTaskResult` de 267011?]
Que la tarea se ejecutó anoche a las 3:00, terminó **bien** (`0`) y volverá a ejecutarse mañana a la misma hora.

Un `267011` significa que la tarea **todavía no se ha ejecutado nunca**. Cualquier otro número distinto de `0` indica que falló, y es el primer dato que se mira al investigar una copia que no se hizo.
:::

### 8. Crear usuarios desde una lista

Un script recorre un CSV de nuevos empleados y ejecuta `New-LocalUser` para cada uno. Un día se ejecuta dos veces seguidas y la segunda vez falla.

:::pregunta[¿Por qué falla? ¿Cómo lo evitas dentro del script?]
Porque los usuarios **ya existen** de la primera vez, y `New-LocalUser` da error al intentar crear uno que existe.

Se comprueba antes de crear:

```powershell
if (Get-LocalUser -Name $u.usuario -ErrorAction SilentlyContinue) {
    Write-Output "El usuario $($u.usuario) ya existe"
} else {
    New-LocalUser -Name $u.usuario -NoPassword | Out-Null
}
```

Un buen script de automatización se puede ejecutar dos veces sin romper nada.
:::

## Hazlo tú

Copia este bloque y pégalo en PowerShell. Crea en `practica` una carpeta `automatizar` con unos datos que copiar, una carpeta vacía para las copias y una lista de empleados. Los scripts que escribas en los ejercicios los guardarás en esa misma carpeta.

```powershell
$d = "$HOME\practica\automatizar"
Remove-Item $d -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path "$d\datos", "$d\copias" | Out-Null
Set-Content "$d\datos\clientes.txt" @("ana", "luis", "marta")
Set-Content "$d\datos\pedidos.txt" @("pedido 1", "pedido 2")
Set-Content "$d\usuarios.csv" @("usuario,nombre,grupo", "ana,Ana Gil,ventas", "luis,Luis Paz,compras", "marta,Marta Ruiz,ventas")
cd $d
Write-Host "Carpeta $d preparada"
```

El ejercicio 13 se hace **solo en una máquina virtual o equipo de pruebas**, con PowerShell como administrador.

### 9. Un script de copia

Crea `copia.ps1`, con parámetros `Origen` y `Destino`. Debe comprobar que el origen existe (si no, anotarlo en el registro y terminar con código `1`), crear una copia comprimida con la fecha en el nombre y anotar en `copia.log` el inicio y el resultado. Ejecútalo y demuestra que hay una copia y dos líneas de registro.

:::pregunta[Escribe el script, las órdenes y la comprobación]
```powershell
@'
param([string]$Origen, [string]$Destino)
$log = "$PSScriptRoot\copia.log"
function Escribir-Log($mensaje) {
    Add-Content $log "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') $mensaje"
}
Escribir-Log "Inicio de la copia de $Origen"
if (-not (Test-Path $Origen)) {
    Escribir-Log "ERROR: no existe $Origen"
    exit 1
}
New-Item -ItemType Directory -Force $Destino | Out-Null
$zip = "$Destino\copia-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"
Compress-Archive -Path "$Origen\*" -DestinationPath $zip
Escribir-Log "Copia creada: $zip"
'@ | Set-Content copia.ps1
.\copia.ps1 -Origen "$d\datos" -Destino "$d\copias"
(Get-ChildItem copias).Count
(Get-Content copia.log).Count
```

Salen `1` copia y `2` líneas de registro. Una de ellas dice `Inicio de la copia` y la otra, `Copia creada` con la ruta del `.zip`.
:::

### 10. Dos copias y un fallo

Ejecuta el script otra vez, esperando 2 segundos para que el nombre cambie, y después con un origen que no existe. Demuestra el número de copias, el código de salida y las líneas del registro.

:::pregunta[Escribe las órdenes y la comprobación]
```powershell
Start-Sleep 2
.\copia.ps1 -Origen "$d\datos" -Destino "$d\copias"
.\copia.ps1 -Origen "$d\nada" -Destino "$d\copias"
$LASTEXITCODE
(Get-ChildItem copias).Count
Get-Content copia.log
```

Salen `1` como código de salida del último intento, `2` copias y un registro de **6** líneas: dos de la primera ejecución, dos de la segunda, y dos de la tercera, que termina con `ERROR: no existe`. El fallo queda anotado aunque nadie esté mirando.
:::

### 11. Limpiar las viejas

Escribe `limpiar.ps1`, con parámetros `Ruta` y `Dias` (por defecto 7), que borre los `.zip` más antiguos de `Dias` días y escriba cuáles. Para probarlo, **envejece** una de tus copias 10 días y demuestra que solo se borra esa.

:::pregunta[Escribe el script, las órdenes y la comprobación]
```powershell
@'
param([string]$Ruta, [int]$Dias = 7)
$limite = (Get-Date).AddDays(-$Dias)
$viejos = Get-ChildItem $Ruta -Filter *.zip | Where-Object LastWriteTime -lt $limite
foreach ($v in $viejos) {
    Remove-Item $v.FullName
    Write-Output "Borrado $($v.Name)"
}
'@ | Set-Content limpiar.ps1
(Get-ChildItem copias | Select-Object -First 1).LastWriteTime = (Get-Date).AddDays(-10)
.\limpiar.ps1 -Ruta copias
(Get-ChildItem copias).Count
```

Sale una línea `Borrado copia-...zip` y después `1`: queda una sola copia, la reciente.
:::

### 12. Altas en modo simulación

Crea `altas.ps1`, con un parámetro `Archivo` y un `[switch]` `Simular`. Debe recorrer el CSV y, con `-Simular`, escribir qué haría con cada usuario, sin crear ninguno. Ejecútalo con `-Simular` y demuestra cuántas líneas escribe.

:::pregunta[Escribe el script, la orden y la salida]
```powershell
@'
param([string]$Archivo, [switch]$Simular)
foreach ($u in Import-Csv $Archivo) {
    if ($Simular) {
        Write-Output "Crearia el usuario $($u.usuario) en el grupo $($u.grupo)"
    } else {
        New-LocalUser -Name $u.usuario -FullName $u.nombre -NoPassword | Out-Null
        Write-Output "Creado $($u.usuario)"
    }
}
'@ | Set-Content altas.ps1
.\altas.ps1 -Archivo usuarios.csv -Simular
```

Salen tres líneas, una por empleado, como `Crearia el usuario ana en el grupo ventas`, y no se crea ninguna cuenta. Sin `-Simular`, el script crearía las tres cuentas y necesita permisos de administrador. **No lo ejecutes sin `-Simular` fuera de una máquina virtual.**
:::

### 13. Programarlo (administrador, solo en una máquina virtual)

Registra una tarea `Copia diaria de prueba` que ejecute tu `copia.ps1` todos los días a las 3:00. En lugar de esperar a las tres, lánzala ahora, comprueba que terminó bien y que hay una copia nueva, y bórrala al acabar.

:::pregunta[Escribe las órdenes y la comprobación]
```powershell
$accion = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$d\copia.ps1`" -Origen `"$d\datos`" -Destino `"$d\copias`""
$disparador = New-ScheduledTaskTrigger -Daily -At 3am
Register-ScheduledTask -TaskName "Copia diaria de prueba" -Action $accion -Trigger $disparador
Start-ScheduledTask -TaskName "Copia diaria de prueba"
Start-Sleep 5
(Get-ScheduledTaskInfo -TaskName "Copia diaria de prueba").LastTaskResult
(Get-ChildItem "$d\copias").Count
Unregister-ScheduledTask -TaskName "Copia diaria de prueba" -Confirm:$false
```

`LastTaskResult` es `0` y hay una copia más que antes: dos, si hiciste el ejercicio 11. Si sale `267011`, la tarea aún no había terminado: espera unos segundos y vuelve a mirarlo. La última orden la borra sin preguntar, y por eso `-Confirm:$false`.
:::

### 14. Un informe de las copias

Escribe `informe.ps1`, con un parámetro `Ruta`, que guarde en `informe.csv`, junto al script, el nombre, el tamaño en megabytes (con 3 decimales) y la fecha de cada `.zip` de esa carpeta. Ejecútalo sobre `copias` y demuestra cuántas líneas tiene.

:::pregunta[Escribe el script, la orden y la comprobación]
```powershell
@'
param([string]$Ruta)
Get-ChildItem $Ruta -Filter *.zip |
    Select-Object Name, @{ Name = "MB"; Expression = { [math]::Round($_.Length / 1MB, 3) } }, LastWriteTime |
    Export-Csv "$PSScriptRoot\informe.csv" -NoTypeInformation
'@ | Set-Content informe.ps1
.\informe.ps1 -Ruta copias
(Get-Content informe.csv).Count
```

El número de líneas es el de copias más uno, por la cabecera: `2` si solo queda una copia, `3` si hiciste el ejercicio 13. Es el tipo de dato que se envía cada semana a quien pide cuentas de las copias.
:::
