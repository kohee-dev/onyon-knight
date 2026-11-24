---
titulo: "PowerShell 11: decisiones, bucles, funciones y errores"
tipo: teoria
---

# PowerShell 11: decisiones, bucles, funciones y errores

Un script que siempre hace lo mismo sirve de poco. Un script útil **decide** (¿existe la carpeta?, ¿pesa más de lo permitido?), **repite** (haz esto con cada fichero) y **reacciona a los errores** sin romperse a medias. Esta pieza reúne las cuatro herramientas que lo permiten: condiciones, bucles, funciones y control de errores.

## Lo mínimo para empezar

| Elemento | Qué hace |
|---|---|
| `if (cond) { ... } elseif (cond) { ... } else { ... }` | ejecuta un bloque u otro según una condición |
| `switch ($x) { "a" { ... } default { ... } }` | elige entre muchos casos |
| `foreach ($x in $lista) { ... }` | repite el bloque con **cada elemento** de la lista |
| `for ($i = 0; $i -lt 5; $i++) { ... }` | repite un número de veces |
| `while (cond) { ... }` | repite **mientras** la condición sea verdadera |
| `1..5` | la lista de números del 1 al 5 |
| `break` / `continue` | sale del bucle / salta a la siguiente vuelta |
| `function Nombre($a, $b) { ... }` | define una orden propia |
| `try { ... } catch { ... } finally { ... }` | intenta algo y reacciona si falla |
| `exit 1` | termina el script avisando de que falló (`0` es éxito) |
| `Test-Path ruta` | `True` si existe esa ruta, `False` si no |

Los **operadores de comparación** se escriben con letras, no con `<` ni `>`, que en PowerShell son redirecciones:

| Operador | Significa |
|---|---|
| `-eq` / `-ne` | igual / distinto |
| `-gt` / `-ge` | mayor / mayor o igual |
| `-lt` / `-le` | menor / menor o igual |
| `-like "*.txt"` | coincide con un patrón con comodines |
| `-match "^inf"` | coincide con una expresión regular |
| `-in` / `-contains` | está en una lista / la lista contiene |
| `-and` / `-or` / `-not` | y / o / no |

Ideas que conviene tener claras:

- Las comparaciones **no distinguen mayúsculas**: `"Alex" -eq "alex"` es `True`. Para distinguirlas se añade una `c`: `-ceq`, `-clike`.
- La condición de un `if` va entre **paréntesis**, y el bloque entre **llaves**, siempre. `if ($x -gt 5)` es correcto y `if $x > 5` no.
- `foreach (...)` con paréntesis y `in` es una **instrucción** del lenguaje. `ForEach-Object { ... }` es un **cmdlet** que va después de una tubería, y usa `$_`. Hacen cosas parecidas, pero se escriben distinto.
- Una función se llama **sin paréntesis y sin comas**: `Suma 1 2`. Si escribes `Suma(1, 2)`, PowerShell pasa **una lista** `1, 2` como primer argumento y el segundo queda vacío. Es el error más típico de quien viene de otros lenguajes.
- `return` termina la función, pero ojo: **todo lo que escribe** la función sale como resultado, no solo lo que va tras `return`. Por eso las funciones no deben llevar `Write-Output` de más.
- Los errores de PowerShell suelen ser **no terminantes**: el cmdlet avisa y el script sigue. Para que un `catch` los atrape hay que convertirlos en terminantes con `-ErrorAction Stop`, o con `$ErrorActionPreference = "Stop"` al principio del script.
- Dentro de un `catch`, `$_` es el error, y `$_.Exception.Message` es su mensaje.

## Ejercicios

### 1. Decidir

Lee este código:

```powershell
$n = 15
if ($n -gt 20) { "grande" }
elseif ($n -gt 10) { "mediano" }
else { "pequeño" }
```

:::pregunta[¿Qué escribe?]
`mediano`.

Se evalúan las condiciones en orden y se ejecuta el **primer** bloque cuya condición es cierta. 15 no es mayor que 20, pero sí mayor que 10, y ahí se para: el `else` no se llega a mirar.
:::

### 2. Mayúsculas y minúsculas

Lee estas dos líneas:

```powershell
"Alex" -eq "alex"
"Alex" -ceq "alex"
```

:::pregunta[¿Qué escribe cada una?]
`True` y `False`.

`-eq` ignora las mayúsculas y `-ceq` (con `c` de *case*) las distingue. Si comparas contraseñas o claves, usa la versión que distingue.
:::

### 3. Patrones

Lee estas líneas:

```powershell
"informe.txt" -like "*.txt"
"informe.txt" -match "^inf"
"informe.txt" -like "inf"
```

:::pregunta[¿Qué escribe cada una?]
`True`, `True` y `False`.

`-like` usa comodines y compara **todo** el texto: `*.txt` encaja con cualquier cosa que acabe en `.txt`, pero `inf` sin comodín solo encaja con `inf` exacto. `-match` usa una expresión regular y encuentra el texto en **cualquier parte**; `^` significa «al principio».
:::

### 4. Comprobar antes de actuar

Lee este código:

```powershell
if (Test-Path C:\datos) {
    "La carpeta existe"
} else {
    "La carpeta no existe"
}
```

:::pregunta[¿Qué escribe si no hay una carpeta `C:\datos`? ¿Por qué es útil?]
Escribe `La carpeta no existe`. `Test-Path` devuelve `True` o `False` sin dar error, y por eso se usa para **comprobar antes de actuar**: así el script no falla al intentar abrir, copiar o borrar algo que no está.
:::

### 5. Repetir con una lista

Lee este código:

```powershell
foreach ($x in 1..3) {
    "vuelta $x"
}
```

:::pregunta[¿Qué escribe?]
```text
vuelta 1
vuelta 2
vuelta 3
```

`1..3` es la lista `1, 2, 3`, y el bloque se ejecuta una vez con cada elemento, que va tomando el nombre `$x`.
:::

### 6. Repetir con una condición

Lee estos dos bucles:

```powershell
$i = 1
while ($i -le 3) { $i; $i++ }

for ($j = 10; $j -gt 0; $j -= 4) { $j }
```

:::pregunta[¿Qué escribe cada uno?]
El primero escribe `1`, `2` y `3`: mientras `$i` sea menor o igual que 3 lo escribe y lo aumenta (`$i++` suma 1). El segundo escribe `10`, `6` y `2`: arranca en 10 y resta 4 cada vuelta, y al llegar a `-2` ya no se cumple `$j -gt 0`.

Con `while` te puedes olvidar de cambiar la variable y el bucle **no termina nunca**: se corta con **Ctrl+C**.
:::

### 7. Una función

Lee este código:

```powershell
function Suma($a, $b) { return $a + $b }
Suma 3 4
Suma(3, 4)
```

:::pregunta[¿Qué escribe cada llamada?]
`Suma 3 4` escribe `7`. `Suma(3, 4)` **no** escribe `7`: escribe la lista `3, 4` (y quizá una línea vacía), porque el primer argumento es la lista entera y `$b` queda vacío. Sumar una lista y nada da la propia lista.

Las funciones de PowerShell se llaman sin paréntesis y con los argumentos separados por **espacios**.
:::

### 8. El error que no se atrapa

Lee estas dos versiones:

```powershell
try { Get-Content noexiste.txt } catch { "No pude leerlo" }
try { Get-Content noexiste.txt -ErrorAction Stop } catch { "No pude leerlo" }
```

:::pregunta[¿Qué escribe cada una?]
La primera escribe el **error rojo** habitual de PowerShell, y **no** entra en el `catch`. La segunda escribe `No pude leerlo`.

Por defecto, que un fichero no exista es un error **no terminante**, y el `catch` solo atrapa los terminantes. `-ErrorAction Stop` lo convierte en uno. Es el fallo más común al aprender `try/catch` en PowerShell.
:::

## Hazlo tú

Crea los scripts en tu carpeta de pruebas. Los ejercicios 9 a 13 no necesitan preparación.

```powershell
New-Item -ItemType Directory -Force ~\practica\scripts | Out-Null
cd ~\practica\scripts
```

### 9. Pares e impares

Crea `parimpar.ps1`, que escriba los números del 1 al 10 diciendo si cada uno es par o impar, y demuestra cuántos son pares.

:::pregunta[Escribe el script, la orden y el número]
```powershell
@'
foreach ($n in 1..10) {
    if ($n % 2 -eq 0) { "$n es par" } else { "$n es impar" }
}
'@ | Set-Content parimpar.ps1
(.\parimpar.ps1 | Where-Object { $_ -like "*es par" }).Count
```

Salen `5`. El operador `%` da el resto de una división: un número es par si el resto de dividirlo entre 2 es 0.
:::

### 10. ¿Existe?

Crea `existe.ps1`, con un parámetro `Ruta`, que escriba `existe` o `no existe`. Pruébalo con tu carpeta personal y con una que no exista.

:::pregunta[Escribe el script, las órdenes y las salidas]
```powershell
@'
param([string]$Ruta)
if (Test-Path $Ruta) { "existe" } else { "no existe" }
'@ | Set-Content existe.ps1
.\existe.ps1 -Ruta $HOME
.\existe.ps1 -Ruta C:\no\hay\nada
```

Salen `existe` y `no existe`.
:::

### 11. Una tabla de multiplicar

Crea `tabla.ps1`, con un parámetro numérico `N`, que escriba su tabla de multiplicar del 1 al 10 con el formato `3 x 1 = 3`. Ejecútalo con `-N 3` y escribe la última línea.

:::pregunta[Escribe el script, la orden y la última línea]
```powershell
@'
param([int]$N)
for ($i = 1; $i -le 10; $i++) {
    "$N x $i = $($N * $i)"
}
'@ | Set-Content tabla.ps1
.\tabla.ps1 -N 3
```

La última línea es `3 x 10 = 30`.
:::

### 12. Un tamaño que no falla

Mejora `tamano.ps1` de la pieza anterior, y llámalo `tamano2.ps1`. Si la ruta no existe, debe escribir `La ruta no existe` y terminar con código de error `1`. Si la carpeta está vacía, `La carpeta esta vacia`. Si no, los bytes.

:::pregunta[Escribe el script, las órdenes y las salidas]
```powershell
@'
param([string]$Ruta = ".")
if (-not (Test-Path $Ruta)) {
    Write-Output "La ruta no existe"
    exit 1
}
$ficheros = Get-ChildItem $Ruta -Recurse -File
if (-not $ficheros) {
    Write-Output "La carpeta esta vacia"
    exit 0
}
$total = ($ficheros | Measure-Object Length -Sum).Sum
Write-Output "La carpeta ocupa $total bytes"
'@ | Set-Content tamano2.ps1
.\tamano2.ps1 -Ruta C:\no\hay\nada
$LASTEXITCODE
New-Item -ItemType Directory -Force vacia | Out-Null
.\tamano2.ps1 -Ruta vacia
```

Salen `La ruta no existe`, después `1` (el código de salida) y por último `La carpeta esta vacia`. `$LASTEXITCODE` guarda el código con el que terminó el último script: `0` es que todo fue bien, y cualquier otro número, que algo falló.
:::

### 13. Una función propia

Crea `mb.ps1` con una función `Get-Mb` que reciba un número de bytes y devuelva los megabytes redondeados a dos decimales. Usala dos veces dentro del propio script.

:::pregunta[Escribe el script, la orden y las salidas]
```powershell
@'
function Get-Mb($bytes) {
    return [math]::Round($bytes / 1MB, 2)
}
Get-Mb 5242880
Get-Mb 1572864
'@ | Set-Content mb.ps1
.\mb.ps1
```

Salen `5` y `1.5`. La función se **define antes de usarse**: PowerShell lee el script de arriba abajo.
:::

### 14. Un clasificador de descargas

Crea una carpeta caótica de ficheros mezclados con este bloque:

```powershell
$d = "$HOME\practica\caos"
Remove-Item $d -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $d | Out-Null
foreach ($n in "a.txt", "b.txt", "c.txt", "d.jpg", "e.jpg", "f.zip", "g.pdf") {
    New-Item -ItemType File -Path "$d\$n" | Out-Null
}
```

Después escribe `clasificar.ps1`, con un parámetro `Ruta`, que mueva los `.txt` a una carpeta `texto`, los `.jpg` a `imagenes` y todo lo demás a `otros`, creándolas si hace falta. Ejecútalo sobre `caos` y demuestra cuántos ficheros hay en cada carpeta.

:::pregunta[Escribe el script, las órdenes y la salida]
```powershell
@'
param([string]$Ruta)
foreach ($f in Get-ChildItem $Ruta -File) {
    switch ($f.Extension) {
        ".txt"  { $destino = "texto" }
        ".jpg"  { $destino = "imagenes" }
        default { $destino = "otros" }
    }
    New-Item -ItemType Directory -Force "$Ruta\$destino" | Out-Null
    Move-Item $f.FullName "$Ruta\$destino"
}
'@ | Set-Content clasificar.ps1
.\clasificar.ps1 -Ruta $d
Get-ChildItem $d -Directory | ForEach-Object { "$($_.Name): $((Get-ChildItem $_.FullName).Count)" }
```

Salen `imagenes: 2`, `otros: 2` y `texto: 3`. El `switch` elige la carpeta según la extensión, y `default` recoge lo que no encaja en ningún caso: el `.zip` y el `.pdf`. Antes de ejecutar el script sobre carpetas de verdad, prueba con `-WhatIf` en `Move-Item`.
:::
