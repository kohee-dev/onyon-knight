---
titulo: "PowerShell 2: leer ficheros"
tipo: teoria
---

# PowerShell 2: leer ficheros

Casi todo lo que se administra en un sistema está en ficheros de texto: configuraciones, registros, listas de usuarios. Saber **leerlos** desde la terminal, sin abrir el Bloc de notas, es lo que permite revisar un servidor sin pantalla gráfica. Esta pieza reúne los cmdlets para mirar el contenido de un fichero y para medirlo.

## Lo mínimo para empezar

| Cmdlet | Alias | Qué hace |
|---|---|---|
| `Get-Content f` | `cat`, `type`, `gc` | escribe el contenido del fichero, línea a línea |
| `Get-Content f -TotalCount 3` | | solo las **3 primeras** líneas (`-Head` es lo mismo) |
| `Get-Content f -Tail 3` | | solo las **3 últimas** líneas |
| `Get-Content f -Raw` | | el contenido entero como **un solo bloque** de texto |
| `Get-Content f -Wait` | | se queda esperando y escribe lo que se vaya añadiendo (se sale con Ctrl+C) |
| `Measure-Object -Line -Word -Character` | | cuenta líneas, palabras y caracteres de lo que le llega |
| `Get-Item f` | | datos del fichero: tamaño, fecha, atributos |
| `Format-Hex f` | | enseña los bytes del fichero en hexadecimal |

Cuatro ideas para leer bien:

- `Get-Content` no entrega un texto, sino una **lista de líneas**. Por eso `(Get-Content f).Count` cuenta las líneas, y `(Get-Content f)[0]` es la primera. Los números de posición empiezan en **0**, y `[-1]` es la última.
- `Measure-Object` no lee ficheros: mide lo que recibe por una **tubería** (`|`), que verás a fondo en otra pieza. Se usa así: `Get-Content f | Measure-Object -Line`. Ignora las líneas vacías; `.Count` las cuenta todas.
- Los **corchetes** `[` y `]` son comodines en los nombres de ruta. Un fichero llamado `datos[1].txt` no se lee con `Get-Content datos[1].txt`: hay que usar `-LiteralPath`, que toma el nombre tal cual.
- `Get-Content` está pensado para texto. Con un fichero binario (una imagen, un programa) escribe basura. Para mirar los bytes se usa `Format-Hex`.

Los ejercicios usan este fichero, `notas.txt`:

```text
uno
dos
tres
cuatro
cinco
```

## Ejercicios

### 1. Leer entero

Estás en la carpeta donde está `notas.txt`. Lee esta orden:

```powershell
Get-Content notas.txt
```

:::pregunta[¿Qué escribe?]
```text
uno
dos
tres
cuatro
cinco
```

Escribe el fichero completo, una línea por cada línea del fichero.
:::

### 2. Las primeras

Lee esta orden:

```powershell
Get-Content notas.txt -TotalCount 2
```

:::pregunta[¿Qué escribe?]
```text
uno
dos
```

`-TotalCount 2` se queda con las dos primeras líneas y deja de leer. En un fichero enorme es mucho más rápido que leerlo todo.
:::

### 3. Las últimas

Lee esta orden:

```powershell
Get-Content notas.txt -Tail 2
```

:::pregunta[¿Qué escribe?]
```text
cuatro
cinco
```

`-Tail` es la forma de mirar el final de un registro, donde están los sucesos más recientes.
:::

### 4. Contar las líneas

Lee esta orden:

```powershell
(Get-Content notas.txt).Count
```

:::pregunta[¿Qué escribe y por qué hacen falta los paréntesis?]
Escribe `5`.

Los paréntesis ejecutan primero `Get-Content`, que devuelve una lista de cinco líneas, y `.Count` pregunta cuántos elementos tiene esa lista. Sin paréntesis, PowerShell intentaría pasar `.Count` como si fuera un parámetro.
:::

### 5. Una línea concreta

Lee estas órdenes:

```powershell
(Get-Content notas.txt)[1]
(Get-Content notas.txt)[-1]
```

:::pregunta[¿Qué escribe cada una?]
La primera escribe `dos` y la segunda `cinco`.

La posición `1` es la **segunda** línea, porque se empieza a contar en 0. El índice `-1` cuenta desde el final: es la última.
:::

### 6. Medir con una tubería

Lee esta orden:

```powershell
Get-Content notas.txt | Measure-Object -Line -Word -Character
```

:::pregunta[¿Qué tres números salen?]
```text
Lines Words Characters
----- ----- ----------
    5     5         21
```

Hay 5 líneas y 5 palabras. Los caracteres son 21: `3 + 3 + 4 + 6 + 5`, es decir, las letras de cada línea, sin contar los saltos de línea.
:::

### 7. Tres formas de lo mismo

:::pregunta[Escribe tres órdenes distintas que lean `notas.txt` entero]
```powershell
Get-Content notas.txt
cat notas.txt
type notas.txt
```

`cat` y `type` son alias de `Get-Content`: la misma orden con otro nombre, porque quien viene de otro sistema ya conoce esos nombres. Para los scripts conviene escribir el nombre completo.
:::

### 8. Un fichero que no es de texto

Tienes `foto.png` y quieres mirar sus primeros bytes sin estropear la terminal.

:::pregunta[¿Qué cmdlet usas y qué esperas ver al principio?]
```powershell
Format-Hex foto.png
```

Enseña los bytes en hexadecimal junto con su aspecto como texto. Un PNG empieza siempre por los bytes `89 50 4E 47`, que a la derecha se leen como `PNG`. Con `Get-Content` saldría basura, y por eso no se usa con binarios.
:::

## Hazlo tú

Copia este bloque y pégalo en PowerShell. Crea en `practica` una carpeta `lectura` con un registro de 100 líneas, un poema, un fichero con un nombre difícil y un buzón con seis mensajes.

```powershell
$d = "$HOME\practica\lectura"
Remove-Item $d -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $d | Out-Null
$lineas = 1..100 | ForEach-Object { "linea $_ del registro" }
$lineas[9] = "CLAVE: ROBLE-4821"
$lineas[49] = "CLAVE: OLMO-1357"
$lineas[99] = "CLAVE: HAYA-2468"
Set-Content "$d\registro.txt" $lineas
Set-Content "$d\poema.txt" @("Primera linea", "Segunda linea", "Tercera linea")
Set-Content -LiteralPath "$d\datos[1].txt" "CLAVE: PINO-9034"
New-Item -ItemType Directory -Path "$d\buzon" | Out-Null
1..6 | ForEach-Object { Set-Content "$d\buzon\mensaje$_.txt" "mensaje numero $_" }
Write-Host "Carpeta $d preparada"
```

### 9. Primera y última

Escribe la primera y la última línea de `registro.txt`.

:::pregunta[Escribe las órdenes y las dos líneas]
```powershell
cd ~\practica\lectura
Get-Content registro.txt -TotalCount 1
Get-Content registro.txt -Tail 1
```

Salen `linea 1 del registro` y `CLAVE: HAYA-2468`.
:::

### 10. ¿Cuántas líneas?

Averigua cuántas líneas tiene `registro.txt`.

:::pregunta[Escribe la orden y el número]
```powershell
(Get-Content registro.txt).Count
```

Sale `100`. Con `Get-Content registro.txt | Measure-Object -Line` también sale `100`.
:::

### 11. La clave de la línea 10

Hay una clave en la línea 10 de `registro.txt`. Escríbela **sin leer el fichero entero** a ojo.

:::pregunta[Escribe la orden y la clave]
```powershell
(Get-Content registro.txt)[9]
```

Sale `CLAVE: ROBLE-4821`. La línea 10 está en la posición 9, porque se empieza a contar en 0. Otra forma es `Get-Content registro.txt -TotalCount 10`, que escribe diez líneas y la clave es la última.
:::

### 12. El fichero de los corchetes

Lee el contenido de `datos[1].txt`.

:::pregunta[Escribe la orden y el contenido]
```powershell
Get-Content -LiteralPath .\datos[1].txt
```

Sale `CLAVE: PINO-9034`. Con `Get-Content datos[1].txt` falla, porque `[1]` se toma como un comodín que busca `datos1.txt`, y ese fichero no existe.
:::

### 13. El buzón

Averigua cuántos mensajes hay en `buzon` y cuántos bytes ocupan entre todos.

:::pregunta[Escribe las órdenes y los dos números]
```powershell
(Get-ChildItem buzon).Count
Get-ChildItem buzon | Measure-Object -Property Length -Sum
```

Salen `6` mensajes y una suma de `108` bytes: cada fichero tiene 16 caracteres más el salto de línea de Windows, que ocupa 2 bytes.
:::

### 14. El poema

Cuenta las líneas, las palabras y los caracteres de `poema.txt`.

:::pregunta[Escribe la orden y los tres números]
```powershell
Get-Content poema.txt | Measure-Object -Line -Word -Character
```

Salen `3` líneas, `6` palabras y `39` caracteres (tres líneas de 13).
:::
