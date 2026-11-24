---
titulo: "PowerShell 4: buscar ficheros y texto"
tipo: teoria
---

# PowerShell 4: buscar ficheros y texto

En un servidor con miles de ficheros no vas a mirar carpeta por carpeta. Hay dos preguntas que se repiten todos los días: **¿dónde está el fichero que busco?** y **¿en qué fichero aparece este texto?** Esta pieza responde a las dos, con `Get-ChildItem` para lo primero y `Select-String` para lo segundo.

## Lo mínimo para empezar

| Cmdlet | Qué hace |
|---|---|
| `Get-ChildItem -Recurse` | lista una carpeta **y todas las que hay dentro**, hasta el fondo |
| `Get-ChildItem -Filter *.txt` | solo lo que coincide con el patrón (rápido) |
| `Get-ChildItem -Include *.txt, *.log -Recurse` | lo que coincide con alguno de varios patrones |
| `Get-ChildItem -Exclude *.tmp` | todo menos lo que coincide |
| `Get-ChildItem -File` / `-Directory` | solo ficheros / solo carpetas |
| `Get-ChildItem -Hidden` | **solo** lo oculto (`-Force` enseña todo, oculto incluido) |
| `Get-ChildItem -Name` | solo los nombres, sin la tabla de datos |
| `... \| Where-Object Length -gt 1KB` | se queda con lo que cumple una condición |
| `Select-String -Path f -Pattern texto` | busca texto dentro de un fichero |
| `Select-String -SimpleMatch` | busca el texto **tal cual**, sin interpretarlo |
| `Select-String -CaseSensitive` | distingue mayúsculas de minúsculas |
| `Select-String -List` | solo la **primera** coincidencia de cada fichero |
| `Select-String -NotMatch` | las líneas que **no** contienen el texto |

Ideas que conviene tener claras:

- `-Filter` lo aplica el propio sistema de ficheros, y por eso es más rápido. `-Include` lo aplica PowerShell después y **solo funciona con `-Recurse`** o con un comodín en la ruta (`carpeta\*`). Sin eso, `-Include` no devuelve nada, sin dar error.
- `Where-Object` recibe lo que le llega por la tubería (`|`) y deja pasar solo lo que cumple la condición. Los operadores se escriben con letras: `-gt` mayor que, `-lt` menor que, `-eq` igual, `-like` coincide con un patrón. `1KB` vale 1024 bytes, y también existen `MB` y `GB`.
- `Select-String` **no distingue mayúsculas** por defecto, al contrario que la orden `grep` de Linux. Y el texto que buscas se interpreta como una **expresión regular**, donde `.` significa «cualquier carácter». Para buscar un punto de verdad hay que usar `-SimpleMatch`.
- `Select-String` no baja por las carpetas. Para buscar en muchos ficheros le envías la lista con una tubería: `Get-ChildItem -Recurse -File | Select-String texto`.
- Cada coincidencia se escribe como `ruta:número de línea:línea`.

Los ejercicios usan esta carpeta, `tienda`:

```text
tienda
├── pedidos
│   ├── enero.txt      (5 KB)
│   ├── febrero.txt    (2 KB)
│   └── resumen.csv    (800 bytes)
├── fotos
│   └── logo.png       (5 KB)
└── notas.txt          (500 bytes)
```

## Ejercicios

### 1. Todos los `.txt`

Lee esta orden:

```powershell
Get-ChildItem tienda -Recurse -Filter *.txt -Name
```

:::pregunta[¿Qué nombres escribe?]
```text
notas.txt
pedidos\enero.txt
pedidos\febrero.txt
```

`-Recurse` baja por las subcarpetas, `-Filter *.txt` deja solo los que acaban en `.txt` y `-Name` los escribe con su ruta relativa a `tienda`. El orden exacto puede variar.
:::

### 2. El `-Include` que no encuentra nada

Lee esta orden:

```powershell
Get-ChildItem tienda -Include *.txt
```

:::pregunta[¿Qué escribe? ¿Cómo se arregla?]
**No escribe nada**, y tampoco da error. `-Include` solo funciona junto con `-Recurse` o con un comodín al final de la ruta.

Se arregla con `-Filter *.txt`, con `Get-ChildItem tienda\* -Include *.txt` o con `-Recurse -Include *.txt`.
:::

### 3. Solo carpetas

Lee esta orden:

```powershell
Get-ChildItem tienda -Recurse -Directory -Name
```

:::pregunta[¿Qué escribe?]
```text
fotos
pedidos
```

`-Directory` deja solo las carpetas, y por eso no aparece ningún fichero.
:::

### 4. Los ficheros grandes

Lee esta orden:

```powershell
Get-ChildItem tienda -Recurse -File | Where-Object Length -gt 1KB
```

:::pregunta[¿Qué ficheros salen?]
`enero.txt`, `febrero.txt` y `logo.png`.

`Length` es el tamaño en bytes, y `1KB` son 1024. `notas.txt`, de 500 bytes, y `resumen.csv`, de 800, no superan ese límite. `-gt` significa «mayor que»; para «mayor o igual» existe `-ge`.
:::

### 5. Los ficheros antiguos

:::pregunta[Escribe una orden que enseñe los ficheros de `tienda` que no se han modificado en los últimos 30 días]
```powershell
Get-ChildItem tienda -Recurse -File | Where-Object LastWriteTime -lt (Get-Date).AddDays(-30)
```

`LastWriteTime` es la fecha de la última modificación. `(Get-Date).AddDays(-30)` es la fecha de hace 30 días, y `-lt` («menor que») se queda con lo que es anterior. Es el criterio clásico para limpiar registros viejos.
:::

### 6. Buscar texto sin mayúsculas

El fichero `enero.txt` contiene tres líneas:

```text
pedido 1: lapiz
pedido 2: cuaderno ERROR
pedido 3: goma
```

Lee esta orden:

```powershell
Select-String -Path enero.txt -Pattern error
```

:::pregunta[¿Qué escribe? ¿Y con `-CaseSensitive`?]
Escribe `enero.txt:2:pedido 2: cuaderno ERROR`: el nombre del fichero, el número de línea y la línea. Aunque la línea lleva `ERROR` en mayúsculas y se ha buscado `error`, la encuentra, porque `Select-String` no distingue mayúsculas.

Con `-CaseSensitive` no escribe nada, porque `error` en minúsculas no aparece.
:::

### 7. El punto que no es un punto

Un fichero `precios.txt` contiene dos líneas:

```text
total 1.5
total 1x5
```

Lee estas órdenes:

```powershell
Select-String -Path precios.txt -Pattern "1.5"
Select-String -Path precios.txt -Pattern "1.5" -SimpleMatch
```

:::pregunta[¿Qué líneas encuentra cada una?]
La primera encuentra **las dos**: el punto de una expresión regular significa «cualquier carácter», y la `x` encaja. La segunda encuentra solo `total 1.5`, porque `-SimpleMatch` busca el texto tal cual.
:::

### 8. Lo contrario

Lee esta orden:

```powershell
Select-String -Path enero.txt -Pattern error -NotMatch
```

:::pregunta[¿Qué líneas escribe?]
Las líneas 1 y 3: `pedido 1: lapiz` y `pedido 3: goma`, es decir, las que **no** contienen `error`. Sirve para quitar el ruido de un registro y quedarte con lo raro.
:::

## Hazlo tú

Copia este bloque y pégalo en PowerShell. Crea en `practica` una carpeta `buscar` con un pequeño archivo de carpetas y ficheros, con claves escondidas que tendrás que encontrar.

```powershell
$d = "$HOME\practica\buscar"
Remove-Item $d -Recurse -Force -ErrorAction SilentlyContinue
foreach ($r in "archivo\viejo", "archivo\nuevo", "informes\2024", "informes\2025", "tmp") {
    New-Item -ItemType Directory -Path "$d\$r" | Out-Null
}
1..4 | ForEach-Object { Set-Content "$d\archivo\viejo\notas$_.txt" @("texto $_", "nada interesante") }
Set-Content "$d\archivo\viejo\notas3.txt" @("texto 3", "la clave es CLAVE-D-2208")
Set-Content "$d\archivo\nuevo\grande.dat" @("CLAVE-A-4401", ("x" * 2000))
Set-Content "$d\archivo\nuevo\pequeno.dat" "nada"
Set-Content "$d\informes\2024\ventas.txt" @("total 100", "CLAVE-E-5019", "fin")
Set-Content "$d\informes\2025\ventas.txt" @("CLAVE-E-5019", "total 200", "CLAVE-E-5019")
Set-Content "$d\informes\2025\recordatorio.nota" "CLAVE-C-9135"
Set-Content "$d\informes\2024\oculto.txt" "CLAVE-B-7742"
(Get-Item "$d\informes\2024\oculto.txt").Attributes = "Hidden"
Set-Content "$d\tmp\servidor.log" @("inicio correcto", "ERROR disco lleno", "aviso memoria", "error de red", "Error de login", "fin")
Set-Content "$d\tmp\acceso.log" @("usuario entra", "error 404", "usuario sale")
Write-Host "Carpeta $d preparada"
```

### 9. El fichero pesado

Solo un fichero de `buscar` pesa más de 1 KB. Encuéntralo y escribe su primera línea, que es una clave.

:::pregunta[Escribe las órdenes y la clave]
```powershell
cd ~\practica\buscar
Get-ChildItem -Recurse -File | Where-Object Length -gt 1KB
Get-Content archivo\nuevo\grande.dat -TotalCount 1
```

El fichero es `grande.dat` y la clave es `CLAVE-A-4401`.
:::

### 10. El fichero escondido

En `informes` hay un fichero oculto. Encuéntralo y lee la clave que guarda.

:::pregunta[Escribe las órdenes y la clave]
```powershell
Get-ChildItem informes -Recurse -Hidden
Get-Content informes\2024\oculto.txt
```

Sin `-Hidden` o sin `-Force`, `Get-ChildItem` no lo enseña. La clave es `CLAVE-B-7742`.
:::

### 11. Una extensión rara

Hay un único fichero con extensión `.nota`. Encuéntralo sin abrir las carpetas una a una y lee su clave.

:::pregunta[Escribe las órdenes y la clave]
```powershell
Get-ChildItem -Recurse -Filter *.nota
Get-Content informes\2025\recordatorio.nota
```

La clave es `CLAVE-C-9135`.
:::

### 12. Buscar en todo el árbol

Averigua en qué fichero y en qué línea está la clave `CLAVE-D`.

:::pregunta[Escribe la orden y la salida]
```powershell
Get-ChildItem -Recurse -File | Select-String CLAVE-D
```

Sale una línea con la ruta de `archivo\viejo\notas3.txt`, el número `2` y el texto `la clave es CLAVE-D-2208`. Como `Select-String` no baja por las carpetas, se le envía la lista de ficheros por la tubería.
:::

### 13. Contar errores

Cuenta cuántas líneas con la palabra `error` hay en los ficheros `.log`, sin distinguir mayúsculas. Después, cuántas hay escritas **exactamente** `error` en minúsculas.

:::pregunta[Escribe las órdenes y los dos números]
```powershell
(Get-ChildItem tmp -Filter *.log | Select-String error).Count
(Get-ChildItem tmp -Filter *.log | Select-String error -CaseSensitive).Count
```

Salen `4` y `2`. Sin distinguir mayúsculas valen `ERROR disco lleno`, `error de red`, `Error de login` y `error 404`. En minúsculas, solo `error de red` y `error 404`.
:::

### 14. En cuántos ficheros aparece

La clave `CLAVE-E-5019` está repetida. Averigua en **cuántos ficheros** aparece y cuántas líneas la contienen en total.

:::pregunta[Escribe las órdenes y los dos números]
```powershell
(Get-ChildItem -Recurse -File | Select-String CLAVE-E-5019 -List).Count
(Get-ChildItem -Recurse -File | Select-String CLAVE-E-5019).Count
```

Salen `2` y `3`: con `-List` se cuenta una coincidencia por fichero, y sin él se cuentan todas las líneas. Los dos ficheros son los `ventas.txt` de 2024 y 2025.
:::
