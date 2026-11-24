---
titulo: "PowerShell 6: guardar resultados, CSV y copias comprimidas"
tipo: teoria
---

# PowerShell 6: guardar resultados, CSV y copias comprimidas

Un administrador no solo mira cosas: **deja constancia**. Guarda un listado, separa los errores de los resultados, exporta datos para una hoja de cálculo y hace copias comprimidas de lo que importa. Esta pieza reúne lo necesario para sacar resultados de la pantalla y convertirlos en ficheros.

## Lo mínimo para empezar

| Orden | Qué hace |
|---|---|
| `orden > f.txt` | guarda la salida en `f.txt`, **machacando** lo que hubiera |
| `orden >> f.txt` | **añade** la salida al final de `f.txt` |
| `orden 2> e.txt` | guarda solo los **errores** en `e.txt` |
| `orden 2>$null` | tira los errores a la nada, para que no salgan en pantalla |
| `orden *> t.txt` | guarda **todo**: salida, errores y avisos |
| `Out-File f -Append` | igual que `>>`, pero con opciones como `-Encoding` |
| `Set-Content f texto` / `Add-Content f texto` | escribe o añade **texto** a un fichero |
| `Tee-Object -FilePath f` | guarda en `f` lo que pasa **y además** lo deja seguir |
| `Export-Csv f -NoTypeInformation` | guarda los objetos como tabla CSV |
| `Import-Csv f` | lee un CSV y lo convierte en **objetos** |
| `ConvertTo-Json` / `ConvertFrom-Json` | pasa objetos a JSON y al revés |
| `Compress-Archive -Path origen -DestinationPath f.zip` | comprime en un `.zip` |
| `Expand-Archive f.zip -DestinationPath destino` | descomprime un `.zip` |

Ideas que conviene tener claras:

- PowerShell tiene varias **salidas** numeradas: la 1 es la salida normal, la 2 son los errores, la 3 los avisos. Por eso `2>` guarda solo los errores y `*>` las guarda todas.
- Una redirección **no se ve en pantalla**: si mandas la salida a un fichero, la terminal se queda en silencio. Para ver y guardar a la vez se usa `Tee-Object`.
- En Windows PowerShell 5.1, `>` y `Out-File` guardan el texto en **UTF-16**, y `Set-Content` en la codificación antigua del sistema. Eso da problemas al abrir los ficheros en otros programas. Si importa, añade `-Encoding UTF8`.
- `Export-Csv` guarda objetos con **todas sus propiedades**, así que antes se eligen con `Select-Object`. En la versión 5.1, la primera línea del fichero es un comentario `#TYPE ...` salvo que añadas `-NoTypeInformation`.
- `Import-Csv` devuelve objetos cuyas propiedades son **siempre texto**, aunque parezcan números. Para comparar o sumar con cifras hay que convertirlas: `[int]$_.sueldo`.
- `Compress-Archive` no sobrescribe un `.zip` que ya existe, y da error. Con `-Force` lo reemplaza y con `-Update` le añade lo nuevo.

## Ejercicios

### 1. Machacar o añadir

Estás en una carpeta vacía. Lee estas órdenes:

```powershell
"uno" > a.txt
"dos" >> a.txt
"tres" > a.txt
Get-Content a.txt
```

:::pregunta[¿Qué escribe el último `Get-Content`?]
Solo `tres`.

`>` crea el fichero y **borra** lo que hubiera. La primera línea lo crea con `uno`, `>>` añade `dos`, pero la tercera orden vuelve a empezar de cero y deja solo `tres`. Si querías conservar todo, tenías que usar `>>` en la tercera.
:::

### 2. Silencio en pantalla

Lee esta orden:

```powershell
Get-ChildItem > lista.txt
```

:::pregunta[¿Qué escribe en pantalla? ¿Dónde está el listado?]
No escribe nada: la salida entera va a `lista.txt`, y ahí está el listado. Para verlo se lee con `Get-Content lista.txt`.
:::

### 3. Separar los errores

El fichero `empleados.csv` existe y `perdido.txt` no. Lee esta orden:

```powershell
Get-ChildItem empleados.csv, perdido.txt 2> errores.txt
```

:::pregunta[¿Qué se ve en pantalla y qué hay en `errores.txt`?]
En pantalla se ve la fila de `empleados.csv`, que es el resultado correcto. En `errores.txt` queda el mensaje de error por no encontrar `perdido.txt`.

Es la forma de dejar el resultado limpio y guardar los problemas aparte, para revisarlos después.
:::

### 4. Callar los errores

Lee esta orden:

```powershell
Get-ChildItem C:\Windows\System32 -Recurse 2>$null
```

:::pregunta[¿Para qué sirve el `2>$null`?]
Recorrer carpetas del sistema da muchos errores de «acceso denegado» en las que tu usuario no puede abrir. `2>$null` tira todos los mensajes de error y deja en pantalla solo los resultados.

Úsalo con cuidado: también esconde errores que sí querías ver.
:::

### 5. Ver y guardar a la vez

Lee esta orden:

```powershell
Get-ChildItem | Tee-Object -FilePath lista.txt | Measure-Object
```

:::pregunta[¿Qué escribe en pantalla? ¿Qué hay en `lista.txt`?]
En pantalla escribe el recuento de `Measure-Object`: `Count` con el número de elementos. En `lista.txt` queda el listado completo.

`Tee-Object` es como una te de fontanero: guarda una copia y deja pasar el resto por la tubería.
:::

### 6. Exportar a CSV

Estás en una carpeta con `a.txt`, que pesa 100 bytes, y `b.txt`, que pesa 200. Lee esta orden:

```powershell
Get-ChildItem | Select-Object Name, Length | Export-Csv lista.csv -NoTypeInformation
```

:::pregunta[¿Qué contiene `lista.csv`?]
```text
"Name","Length"
"a.txt","100"
"b.txt","200"
```

La primera línea son los nombres de las propiedades. En Windows PowerShell 5.1 todos los valores van entre comillas. Sin `-NoTypeInformation` habría una primera línea más, `#TYPE System.Management.Automation.PSCustomObject`.
:::

### 7. El CSV de vuelta

Lee esta orden:

```powershell
Import-Csv lista.csv | Where-Object { [int]$_.Length -gt 150 }
```

:::pregunta[¿Qué escribe? ¿Para qué sirve `[int]`?]
Escribe la fila de `b.txt`, de 200 bytes.

`Import-Csv` convierte cada fila en un objeto, pero todos sus valores son **texto**. `[int]` lo convierte a número para poder comparar. Sin esa conversión, la comparación se haría entre textos, y con cifras de distinta longitud daría resultados absurdos: como texto, `"9"` es mayor que `"100"`.
:::

### 8. Un objeto como JSON

Lee esta orden:

```powershell
[pscustomobject]@{ nombre = "alex"; edad = 30 } | ConvertTo-Json
```

:::pregunta[¿Qué formato escribe?]
Escribe un texto JSON, con este aspecto:

```text
{
    "nombre":  "alex",
    "edad":  30
}
```

JSON es el formato de intercambio de datos de casi todos los servicios web y de muchas herramientas de administración. `ConvertFrom-Json` hace el camino de vuelta, de texto a objeto.
:::

## Hazlo tú

Copia este bloque y pégalo en PowerShell. Crea en `practica` una carpeta `datos` con un pequeño proyecto y una lista de empleados.

```powershell
$d = "$HOME\practica\datos"
Remove-Item $d -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path "$d\proyecto\src", "$d\proyecto\docs" | Out-Null
Set-Content "$d\proyecto\leeme.txt" "Proyecto de prueba"
Set-Content "$d\proyecto\src\main.txt" "codigo"
Set-Content "$d\proyecto\src\util.txt" "utilidades"
Set-Content "$d\proyecto\docs\manual.txt" "CLAVE-N-4242"
Set-Content "$d\empleados.csv" @("nombre,departamento,sueldo", "ana,ventas,1800", "luis,compras,1500", "marta,ventas,2100", "pablo,soporte,1700", "eva,soporte,1900")
Write-Host "Carpeta $d preparada"
```

### 9. Una lista con final

Guarda en `lista.txt` los nombres de **todo** lo que hay dentro de `proyecto`, con sus subcarpetas, y añade al final una línea `FIN`. Demuestra cuántas líneas tiene.

:::pregunta[Escribe las órdenes y el número]
```powershell
cd ~\practica\datos
Get-ChildItem proyecto -Recurse -Name > lista.txt
"FIN" >> lista.txt
(Get-Content lista.txt).Count
```

Sale `7`: dos carpetas, cuatro ficheros y la línea `FIN`.
:::

### 10. Resultado por un lado, errores por otro

Ejecuta `Get-ChildItem empleados.csv, perdido.txt` de forma que el resultado vaya a `salida.log` y el error a `errores.log`. Demuestra que **los dos** ficheros tienen contenido.

:::pregunta[Escribe las órdenes y la comprobación]
```powershell
Get-ChildItem empleados.csv, perdido.txt > salida.log 2> errores.log
(Get-Item salida.log).Length
(Get-Item errores.log).Length
```

Los dos tamaños salen mayores que cero. En `salida.log` está la fila de `empleados.csv` y en `errores.log` el aviso de que `perdido.txt` no existe.
:::

### 11. Los de ventas

Escribe las filas de los empleados del departamento `ventas`.

:::pregunta[Escribe la orden y los nombres]
```powershell
Import-Csv empleados.csv | Where-Object departamento -eq ventas
```

Salen `ana` y `marta`.
:::

### 12. Los sueldos

Averigua el sueldo medio del departamento `soporte` y los nombres de quienes cobran más de 1750.

:::pregunta[Escribe las órdenes y las respuestas]
```powershell
Import-Csv empleados.csv | Where-Object departamento -eq soporte | Measure-Object sueldo -Average
Import-Csv empleados.csv | Where-Object { [int]$_.sueldo -gt 1750 } | Select-Object -ExpandProperty nombre
```

La media de `soporte` es `1800`, y cobran más de 1750 `ana`, `marta` y `eva`.
:::

### 13. Un CSV nuevo

Crea `ventas.csv` solo con el nombre y el sueldo de los empleados de ventas, y demuestra cuántas líneas tiene.

:::pregunta[Escribe las órdenes y el número]
```powershell
Import-Csv empleados.csv | Where-Object departamento -eq ventas |
    Select-Object nombre, sueldo | Export-Csv ventas.csv -NoTypeInformation
(Get-Content ventas.csv).Count
```

Sale `3`: la cabecera y las dos filas.
:::

### 14. Copia y restauración

Haz una copia comprimida de `proyecto` llamada `proyecto.zip`, restáurala en una carpeta `restaurado` y demuestra que no se ha perdido nada.

:::pregunta[Escribe las órdenes y las comprobaciones]
```powershell
Compress-Archive -Path proyecto -DestinationPath proyecto.zip
Expand-Archive proyecto.zip -DestinationPath restaurado
(Get-ChildItem proyecto -Recurse).Count
(Get-ChildItem restaurado\proyecto -Recurse).Count
Get-Content restaurado\proyecto\docs\manual.txt
```

Los dos recuentos son `6`, y el último fichero contiene `CLAVE-N-4242`. Si repites la primera orden sin `-Force`, da error porque `proyecto.zip` ya existe.
:::
