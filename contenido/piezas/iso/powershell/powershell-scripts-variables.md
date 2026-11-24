---
titulo: "PowerShell 10: tus primeros scripts"
tipo: teoria
---

# PowerShell 10: tus primeros scripts

Un **script** es un fichero de texto con órdenes de PowerShell, una detrás de otra, que se ejecutan de golpe. Es lo que convierte lo que hacías a mano en algo repetible: lo escribes una vez, lo ejecutas cien. En esta pieza escribes y ejecutas tus primeros scripts, y aprendes lo mínimo de variables y parámetros para que no hagan siempre lo mismo.

## Lo mínimo para empezar

Un script PowerShell es un fichero con extensión **`.ps1`**. Se puede escribir con el Bloc de notas (`notepad hola.ps1`) o con cualquier editor de texto.

| Orden o elemento | Qué hace |
|---|---|
| `.\hola.ps1` | ejecuta el script `hola.ps1` de la carpeta actual |
| `Get-ExecutionPolicy` | dice qué política de ejecución de scripts hay |
| `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` | permite ejecutar tus propios scripts |
| `# texto` | un **comentario**: PowerShell lo ignora |
| `$nombre = "alex"` | guarda un valor en una **variable** |
| `"Hola $nombre"` | texto con comillas dobles: **sustituye** las variables |
| `'Hola $nombre'` | texto con comillas simples: **literal**, no sustituye |
| `"Son $($a + $b)"` | dentro del texto, evalúa una expresión |
| `param([string]$Nombre)` | declara los **parámetros** del script (va la primera) |
| `Write-Output x` | escribe `x` como **salida** del script |
| `Write-Host x` | escribe `x` en pantalla, y nada más |
| `Read-Host "Pregunta"` | pide un valor por teclado |

Ideas que conviene tener claras:

- Por seguridad, Windows trae los scripts **bloqueados**: la política de ejecución es `Restricted` y ningún `.ps1` se ejecuta. Se cambia para **tu usuario** con `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`, que no necesita ser administrador. No es una barrera de seguridad real, sino un freno contra ejecuciones accidentales.
- PowerShell **no ejecuta lo que hay en la carpeta actual** si no se lo dices. `hola.ps1` falla, `.\hola.ps1` funciona: el `.\` es «de esta carpeta».
- Las variables empiezan siempre por `$`. Pueden llevar un **tipo**: `[int]$edad = 30`. Con `.GetType().Name` ves el tipo de cualquier valor.
- Los tipos importan en las cuentas: `5 + 5` son `10`, pero `"5" + "5"` es el texto `55`. Con un texto a la izquierda, el `+` **concatena**, y con un número a la izquierda, **suma**.
- Una **lista** se escribe con comas (`$a = "x", "y", "z"`), se lee por posición (`$a[0]`, desde 0, y `$a[-1]` es la última), se cuenta con `.Count` y se amplía con `+=`.
- Algunas variables **ya existen**: `$HOME` (tu carpeta personal), `$PWD` (la carpeta actual), `$env:USERNAME` y `$env:COMPUTERNAME`.
- `Write-Output` envía el valor a la **tubería** del script, y se puede redirigir a un fichero. `Write-Host` solo lo enseña en pantalla: una redirección con `>` no lo captura. Para un script que devuelva datos, usa `Write-Output` (o simplemente escribe el valor, que es lo mismo).

Los ejercicios 7 y 12 usan este script, `saludo.ps1`:

```powershell
param([string]$Nombre = "mundo", [int]$Edad = 0)
Write-Output "Hola, $Nombre. El año que viene tendrás $($Edad + 1)."
```

## Ejercicios

### 1. El script que no arranca

Acabas de instalar Windows y escribes un script `hola.ps1` con una sola línea. Al ejecutarlo con `.\hola.ps1` sale un error rojo que dice que la ejecución de scripts está deshabilitada en este sistema.

:::pregunta[¿Por qué ocurre? ¿Cómo lo compruebas y cómo lo arreglas?]
Porque la **política de ejecución** es `Restricted`, la que trae Windows de fábrica, y no deja ejecutar ningún script.

```powershell
Get-ExecutionPolicy
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

La primera escribe `Restricted`. La segunda lo cambia solo para tu usuario, sin pedir ser administrador, y te pregunta si estás seguro. `RemoteSigned` deja ejecutar los scripts que has escrito tú, y pide firma a los que vienen de Internet.
:::

### 2. Falta el punto y la barra

El script `hola.ps1` está en la carpeta actual y escribes:

```powershell
hola.ps1
```

:::pregunta[¿Qué ocurre y qué escribes en su lugar?]
Falla con un error que dice que `hola.ps1` no se reconoce como nombre de un cmdlet, función, script o programa. PowerShell, por seguridad, no busca en la carpeta actual los programas que escribes.

Se escribe `.\hola.ps1`, con el punto y la barra: `.` es la carpeta actual y `\` la separa del nombre.
:::

### 3. Comillas dobles y simples

Lee estas órdenes:

```powershell
$n = "Alex"
"Hola $n"
'Hola $n'
```

:::pregunta[¿Qué escribe cada una de las dos últimas?]
La segunda línea escribe `Hola Alex`: con comillas dobles se sustituye la variable. La tercera escribe `Hola $n`, literalmente: con comillas simples no se sustituye nada.

Úsalas a propósito: dobles para meter variables y simples cuando quieres el texto tal cual, por ejemplo en una expresión regular.
:::

### 4. Operaciones dentro del texto

Lee estas órdenes:

```powershell
$edad = 30
"Tienes $edad+1 años"
"Tienes $($edad + 1) años"
```

:::pregunta[¿Qué escribe cada una?]
La primera escribe `Tienes 30+1 años`: la variable se sustituye y lo demás es texto. La segunda escribe `Tienes 31 años`: `$( ... )` evalúa lo que hay dentro y pone el resultado.
:::

### 5. Sumar o juntar

Lee estas cuatro líneas:

```powershell
5 + 5
"5" + "5"
"5" + 5
5 + "5"
```

:::pregunta[¿Qué escribe cada una?]
`10`, `55`, `55` y `10`.

Manda el tipo del valor de la **izquierda**: si es un texto, el `+` junta textos, y convierte el otro valor a texto; si es un número, suma, y convierte el otro a número. Es una fuente típica de errores con datos que vienen de un fichero, donde todo es texto.
:::

### 6. Listas

Lee estas órdenes:

```powershell
$a = "x", "y", "z"
$a[1]
$a.Count
$a[-1]
$a += "w"
$a.Count
```

:::pregunta[¿Qué escribe cada línea que escribe algo?]
`y`, `3`, `z` y `4`.

La posición `1` es la segunda, porque se empieza en 0. `[-1]` es la última. `+=` añade un elemento, y la lista pasa a tener 4.
:::

### 7. Parámetros

Con el script `saludo.ps1` de la teoría, lee estas dos órdenes:

```powershell
.\saludo.ps1 -Nombre Ana -Edad 20
.\saludo.ps1
```

:::pregunta[¿Qué escribe cada una?]
La primera escribe `Hola, Ana. El año que viene tendrás 21.` La segunda escribe `Hola, mundo. El año que viene tendrás 1.`

Cuando no pasas un parámetro, el script usa el valor por defecto que declaró: `"mundo"` y `0`. `[int]` hace que `Edad` sea un número, y por eso `$Edad + 1` suma.
:::

### 8. Pantalla o salida

Un script `s.ps1` contiene estas dos líneas:

```powershell
Write-Host "Esto va a la pantalla"
Write-Output "Esto va a la salida"
```

Lo ejecutas con `.\s.ps1 > r.txt`.

:::pregunta[¿Qué se ve en pantalla y qué hay en `r.txt`?]
En pantalla se ve `Esto va a la pantalla`. En `r.txt` queda solo `Esto va a la salida`.

`Write-Host` escribe directamente en la ventana y no pasa por la salida del script, por eso la redirección no lo recoge. Si quieres que algo se pueda guardar, enviarlo a otra orden o usarlo en otro script, usa `Write-Output`.
:::

## Hazlo tú

Estos ejercicios no necesitan preparación: los scripts los creas tú, en una carpeta propia. Empieza por crearla.

```powershell
New-Item -ItemType Directory -Force ~\practica\scripts | Out-Null
cd ~\practica\scripts
```

### 9. Desbloquear los scripts

Comprueba qué política de ejecución tienes y, si hace falta, cámbiala para tu usuario a `RemoteSigned`. Demuestra el resultado.

:::pregunta[Escribe las órdenes y la salida]
```powershell
Get-ExecutionPolicy
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
Get-ExecutionPolicy -Scope CurrentUser
```

La última escribe `RemoteSigned`. Si ya la tenías así, no hace falta cambiar nada. Si una directiva de grupo del aula la controla, el cambio puede no tener efecto: pídele al profesorado otra solución.
:::

### 10. Hola

Crea un script `hola.ps1` que escriba `Hola desde un script` y ejecútalo.

:::pregunta[Escribe las órdenes y la salida]
```powershell
Set-Content hola.ps1 'Write-Output "Hola desde un script"'
.\hola.ps1
```

Sale `Hola desde un script`. `Set-Content` crea el fichero con esa línea. Puedes crearlo también con `notepad hola.ps1`.
:::

### 11. Quién y dónde soy

Crea un script `info.ps1` que escriba tres líneas: el nombre del equipo, el del usuario y la carpeta desde la que se ejecuta. Ejecútalo.

:::pregunta[Escribe el script y cómo lo ejecutas]
```powershell
@'
Write-Output "Equipo: $env:COMPUTERNAME"
Write-Output "Usuario: $env:USERNAME"
Write-Output "Carpeta: $($PWD.Path)"
'@ | Set-Content info.ps1
.\info.ps1
```

Salen tres líneas, por ejemplo `Equipo: PC1`, `Usuario: alex` y `Carpeta: C:\Users\alex\practica\scripts`. Los textos entre `@'` y `'@` se escriben tal cual, sin sustituir variables, y por eso el script guardado contiene `$env:COMPUTERNAME` sin cambiar. Dentro de `$( ... )` va `$PWD.Path` para que se sustituya solo la ruta.
:::

### 12. Un saludo con parámetros

Crea el script `saludo.ps1` de la teoría y ejecútalo dos veces: con tu nombre y tu edad, y sin parámetros.

:::pregunta[Escribe las órdenes y las dos salidas]
```powershell
@'
param([string]$Nombre = "mundo", [int]$Edad = 0)
Write-Output "Hola, $Nombre. El año que viene tendrás $($Edad + 1)."
'@ | Set-Content saludo.ps1 -Encoding UTF8
.\saludo.ps1 -Nombre Ana -Edad 20
.\saludo.ps1
```

Salen `Hola, Ana. El año que viene tendrás 21.` y `Hola, mundo. El año que viene tendrás 1.` El `-Encoding UTF8` evita que la `ñ` y la tilde salgan rotas, porque el script tiene letras con acento.
:::

### 13. Una calculadora

Crea `calc.ps1`, con dos parámetros numéricos `A` y `B`, que escriba su suma, su producto y su división redondeada a dos decimales. Ejecútalo con `-A 7 -B 3`.

:::pregunta[Escribe el script, la orden y la salida]
```powershell
@'
param([int]$A, [int]$B)
Write-Output "Suma: $($A + $B)"
Write-Output "Producto: $($A * $B)"
Write-Output "Division: $([math]::Round($A / $B, 2))"
'@ | Set-Content calc.ps1
.\calc.ps1 -A 7 -B 3
```

Salen `Suma: 10`, `Producto: 21` y `Division: 2.33`. Con `B` igual a 0 la división falla: eso se arregla en la pieza siguiente.
:::

### 14. Cuánto ocupa una carpeta

Crea `tamano.ps1`, con un parámetro `Ruta` que por defecto sea la carpeta actual, que escriba cuántos **bytes** ocupan los ficheros de esa ruta, con todas sus subcarpetas. Pruébalo con `~\practica\objetos`, si hiciste la pieza 5, o con cualquier carpeta que tenga ficheros.

:::pregunta[Escribe el script, la orden y la salida]
```powershell
@'
param([string]$Ruta = ".")
$total = (Get-ChildItem $Ruta -Recurse -File | Measure-Object Length -Sum).Sum
Write-Output "La carpeta ocupa $total bytes"
'@ | Set-Content tamano.ps1
.\tamano.ps1 -Ruta ~\practica\objetos
```

Con la carpeta de la pieza 5 sale `La carpeta ocupa 5370 bytes`. Con otra carpeta la cifra cambia. Si la carpeta está **vacía**, `$total` queda sin valor y el mensaje sale incompleto: se arregla con una condición, que verás a continuación.
:::
