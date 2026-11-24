---
titulo: "PowerShell 5: tuberías y objetos"
tipo: teoria
---

# PowerShell 5: tuberías y objetos

Hasta ahora has usado cada cmdlet por separado. Lo que hace potente a PowerShell es **encadenarlos**: la salida de uno entra en el siguiente, y así se filtra, se ordena y se cuenta sin escribir un programa. Hay además una diferencia enorme con otras terminales: PowerShell no se pasa **texto** entre órdenes, sino **objetos**, que tienen propiedades con nombre. Entender eso es entender PowerShell.

## Lo mínimo para empezar

La **tubería** es la barra vertical `|`. Lo que sale del cmdlet de la izquierda entra en el de la derecha.

| Cmdlet | Alias | Qué hace |
|---|---|---|
| `Get-Member` | `gm` | enseña las **propiedades y métodos** de lo que le llega |
| `Where-Object` | `where`, `?` | deja pasar solo lo que cumple una condición |
| `Sort-Object` | `sort` | ordena por una propiedad (`-Descending` al revés) |
| `Select-Object` | `select` | elige propiedades, o los primeros y últimos (`-First`, `-Last`) |
| `Select-Object -ExpandProperty P` | | saca el **valor** de una propiedad, como texto o número llano |
| `Measure-Object` | `measure` | cuenta, suma, hace la media y busca el máximo y el mínimo |
| `Group-Object` | `group` | agrupa por una propiedad y cuenta cada grupo |
| `ForEach-Object` | `foreach`, `%` | ejecuta un bloque de código para **cada** elemento |
| `Format-Table` | `ft` | muestra el resultado como tabla (`-AutoSize` la ajusta) |
| `Format-List` | `fl` | muestra cada elemento con una propiedad por línea (`fl *` enseña todas) |

Ideas que conviene tener claras:

- Un **objeto** es una cosa con **propiedades**: un fichero tiene `Name`, `Length`, `Extension`, `LastWriteTime`... Cuando haces `Get-ChildItem`, lo que sale es una lista de objetos, y la tabla que ves es solo una forma de mostrarlos. Con `Get-ChildItem | Get-Member` ves todo lo que tienen.
- Por eso se ordena o se filtra **por el nombre de la propiedad**, sin cortar texto en columnas: `Sort-Object Length`, `Where-Object Extension -eq ".txt"`.
- Para condiciones más largas se usa un **bloque de código** entre llaves, y `$_` es «el elemento actual»: `Where-Object { $_.Length -gt 1000 -and $_.Extension -ne ".png" }`. Los operadores se escriben con letras: `-eq` igual, `-ne` distinto, `-gt` mayor, `-lt` menor, `-like` con comodines, `-and` y `-or` para combinar.
- `Select-Object Name` deja un **objeto** con una sola propiedad. `Select-Object -ExpandProperty Name` deja solo el **valor** de esa propiedad, por ejemplo los nombres como texto. A menudo hace falta lo segundo para seguir tratándolos.
- Los cmdlets `Format-*` van **siempre al final**: convierten los objetos en algo que se ve, y después ya no se puede seguir filtrando ni ordenando.

Los ejercicios usan esta carpeta, con los tamaños en bytes:

```text
Name         Length   Extension
informe.txt     300   .txt
datos.csv      1200   .csv
foto.png       5000   .png
notas.txt        80   .txt
log1.log        700   .log
```

## Ejercicios

### 1. Ordenar

Lee esta orden:

```powershell
Get-ChildItem | Sort-Object Length
```

:::pregunta[¿En qué orden salen los ficheros?]
`notas.txt`, `informe.txt`, `log1.log`, `datos.csv`, `foto.png`.

Ordena de menor a mayor por la propiedad `Length`, que es el tamaño. Se ordena por **número**, así que `80` va antes que `300`, algo que con texto no pasaría.
:::

### 2. Los dos mayores

Lee esta orden:

```powershell
Get-ChildItem | Sort-Object Length -Descending | Select-Object -First 2
```

:::pregunta[¿Qué ficheros salen?]
`foto.png` y `datos.csv`.

Se ordena de mayor a menor y `-First 2` se queda con los dos primeros. Es la receta para encontrar «lo que más ocupa». Para los últimos hay `-Last`.
:::

### 3. Filtrar

Lee esta orden:

```powershell
Get-ChildItem | Where-Object Extension -eq ".txt"
```

:::pregunta[¿Qué ficheros salen?]
`informe.txt` y `notas.txt`.

`Where-Object` deja pasar solo los objetos cuya propiedad `Extension` es igual a `.txt`.
:::

### 4. Objeto o valor

Lee estas dos órdenes:

```powershell
Get-ChildItem | Select-Object Name
Get-ChildItem | Select-Object -ExpandProperty Name
```

:::pregunta[¿En qué se diferencia lo que escriben?]
La primera escribe una **tabla** con una columna `Name` y los cinco nombres debajo: sigue siendo una lista de objetos, ahora con una sola propiedad. La segunda escribe los cinco nombres **como texto llano**, sin cabecera.

Si vas a pasar los nombres a otra orden que espera texto, necesitas `-ExpandProperty`.
:::

### 5. Medir

Lee esta orden:

```powershell
Get-ChildItem | Measure-Object Length -Sum -Average -Maximum
```

:::pregunta[¿Qué valores salen?]
`Count` 5, `Sum` 7280, `Average` 1456 y `Maximum` 5000.

La suma es `300 + 1200 + 5000 + 80 + 700`, y la media es esa suma entre 5. Sirve para saber cuánto ocupa una carpeta entera.
:::

### 6. Qué propiedades tiene

Quieres filtrar los ficheros por su fecha de creación, pero no recuerdas cómo se llama la propiedad.

:::pregunta[¿Qué orden te lo dice?]
```powershell
Get-ChildItem | Get-Member -MemberType Property
```

Enseña todas las propiedades de los objetos: `Name`, `Length`, `Extension`, `CreationTime`, `LastWriteTime`, `Attributes`... La que buscabas es `CreationTime`. `Get-Member` es la herramienta para explorar cualquier cmdlet que no conozcas.
:::

### 7. Condiciones combinadas

Lee esta orden:

```powershell
Get-ChildItem | Where-Object { $_.Length -gt 1000 -and $_.Extension -ne ".png" }
```

:::pregunta[¿Qué ficheros salen?]
Solo `datos.csv`.

`foto.png` pesa más de 1000 bytes pero se descarta porque es `.png`. Entre llaves, `$_` es el fichero que se está mirando en cada vuelta, y `-and` exige que se cumplan las dos condiciones.
:::

### 8. Agrupar

Lee esta orden:

```powershell
Get-ChildItem | Group-Object Extension
```

:::pregunta[¿Qué grupos y qué recuentos salen?]
Salen cuatro grupos: `.txt` con 2 elementos, y `.csv`, `.png` y `.log` con 1 cada uno.

`Group-Object` reúne los objetos que comparten el valor de la propiedad y cuenta cuántos hay. Es la forma de responder a «¿cuántos de cada tipo?».
:::

## Hazlo tú

Copia este bloque y pégalo en PowerShell. Crea en `practica` una carpeta `objetos` con seis ficheros de tamaño exacto, para que las cuentas salgan siempre igual.

```powershell
$d = "$HOME\practica\objetos"
Remove-Item $d -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $d | Out-Null
function Crear($nombre, $bytes) {
    [System.IO.File]::WriteAllText("$d\$nombre", ("x" * $bytes))
}
Crear "a.txt" 100
Crear "b.txt" 3000
Crear "c.log" 50
Crear "d.log" 700
Crear "e.txt" 1500
Crear "f.csv" 20
Write-Host "Carpeta $d preparada"
```

### 9. El más grande

Averigua el nombre del fichero que más ocupa.

:::pregunta[Escribe la orden y el nombre]
```powershell
cd ~\practica\objetos
Get-ChildItem | Sort-Object Length -Descending | Select-Object -First 1
```

Es `b.txt`, con 3000 bytes.
:::

### 10. Los dos más pequeños

Escribe solo los **nombres** de los dos ficheros más pequeños, como texto llano.

:::pregunta[Escribe la orden y los nombres]
```powershell
Get-ChildItem | Sort-Object Length | Select-Object -First 2 -ExpandProperty Name
```

Salen `f.csv` (20 bytes) y `c.log` (50 bytes).
:::

### 11. Solo los registros

Escribe los nombres de los ficheros `.log`.

:::pregunta[Escribe la orden y los nombres]
```powershell
Get-ChildItem | Where-Object Extension -eq ".log" | Select-Object -ExpandProperty Name
```

Salen `c.log` y `d.log`. Con `Get-ChildItem *.log -Name` se llega al mismo resultado, pero así practicas la tubería.
:::

### 12. Lo que ocupa todo

Averigua cuántos bytes ocupan entre todos los ficheros de la carpeta.

:::pregunta[Escribe la orden y el número]
```powershell
Get-ChildItem | Measure-Object Length -Sum
```

La suma es `5370`: `100 + 3000 + 50 + 700 + 1500 + 20`.
:::

### 13. Cuántos de cada tipo

Averigua cuántos ficheros hay de cada extensión.

:::pregunta[Escribe la orden y los recuentos]
```powershell
Get-ChildItem | Group-Object Extension
```

Salen `.txt` con 3, `.log` con 2 y `.csv` con 1.
:::

### 14. Una frase por fichero

Escribe una frase como `a.txt pesa 100 bytes` para cada fichero de la carpeta.

:::pregunta[Escribe la orden y las dos primeras frases]
```powershell
Get-ChildItem | ForEach-Object { "$($_.Name) pesa $($_.Length) bytes" }
```

Salen seis frases; las dos primeras son `a.txt pesa 100 bytes` y `b.txt pesa 3000 bytes`. Dentro de unas comillas dobles, `$($_.Name)` inserta el valor de una propiedad: los paréntesis con `$` delante son necesarios cuando es una propiedad y no una variable sola.
:::
