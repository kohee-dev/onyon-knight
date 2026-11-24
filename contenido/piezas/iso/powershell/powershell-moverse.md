---
titulo: "PowerShell 1: moverse por el sistema"
tipo: teoria
---

# PowerShell 1: moverse por el sistema

**PowerShell** es la terminal de administración de Windows: una ventana donde escribes órdenes y el sistema las ejecuta. Lo primero que necesitas saber es dónde estás y cómo ir a otra carpeta. Esta pieza es la base de todas las demás de la serie.

Para abrirla, pulsa el botón de inicio, escribe `PowerShell` y ábrela. La serie está pensada para **Windows PowerShell 5.1**, que viene instalado en todos los Windows de escritorio y de servidor.

## Lo mínimo para empezar

Cuando abres la terminal ves una línea que termina en `>`, el **prompt**, algo como `PS C:\Users\alex>`. Todo lo que escribes va detrás y se ejecuta al pulsar Intro.

A diferencia de otros sistemas, las órdenes de PowerShell se llaman **cmdlets** y tienen siempre la forma `Verbo-Nombre`. Casi todas tienen además un **alias** corto, y los más usados se parecen a las órdenes clásicas de cmd y de Linux.

| Cmdlet | Alias | Qué hace |
|---|---|---|
| `Get-Location` | `pwd`, `gl` | escribe la carpeta en la que estás (su **ruta completa**) |
| `Get-ChildItem` | `ls`, `dir`, `gci` | lista lo que hay en la carpeta actual |
| `Get-ChildItem carpeta` | `ls carpeta` | lista lo que hay en esa carpeta, sin entrar en ella |
| `Get-ChildItem -Force` | `ls -Force` | lista también lo **oculto** y lo del sistema |
| `Set-Location carpeta` | `cd carpeta` | entra en esa carpeta |
| `Set-Location ..` | `cd ..` | sube a la carpeta de arriba |
| `Set-Location ~` | `cd ~` | va a tu carpeta personal |
| `Clear-Host` | `cls`, `clear` | limpia la pantalla |
| `Get-Help cmdlet` | `help cmdlet` | enseña la ayuda de un cmdlet |
| `Get-Command patrón` | | busca cmdlets por nombre: `Get-Command *Item*` |

Algunas ideas que se repiten en todo Windows:

- Las carpetas forman un **árbol por unidades**: `C:\` es la raíz del disco principal y `D:\` sería otro disco o una memoria USB. Tu carpeta personal es algo como `C:\Users\alex`, y se escribe también `~` o `$HOME`.
- Una ruta que empieza por una unidad (`C:\...`) es **absoluta**: vale desde cualquier sitio. Una ruta que no la lleva es **relativa**: se cuenta desde la carpeta en la que estás.
- `.` es la carpeta actual y `..` es la de arriba, así que `..\musica` significa «sube y entra en `musica`».
- Windows **no distingue mayúsculas de minúsculas**: `Documentos` y `documentos` son la misma carpeta.
- PowerShell acepta la barra `\` y la barra `/` en las rutas. En esta serie usamos `\`, que es la de Windows.
- Si una ruta lleva **espacios**, escríbela entre comillas: `cd "Mis documentos"`.
- Con la tecla **Tab** el sistema completa el nombre que estás escribiendo, y con la flecha **arriba** recuperas la orden anterior. Úsalas siempre.
- `Get-Help Get-ChildItem -Examples` enseña ejemplos de uso, y `Get-Help Get-ChildItem -Online` abre la ayuda en el navegador.

Los ejercicios usan esta carpeta personal de ejemplo, la del usuario `alex`:

```text
C:\Users\alex
├── Descargas
│   └── foto.png
├── Documentos
│   ├── Cartas
│   │   ├── carta1.txt
│   │   └── carta2.txt
│   ├── borrador.txt   (oculto)
│   └── notas.txt
└── Musica
```

## Ejercicios

### 1. Bajar por las carpetas

Estás en `C:\Users\alex`. Lee estas órdenes:

```powershell
cd Documentos
cd Cartas
pwd
```

:::pregunta[¿Qué escribe `pwd`?]
```text
Path
----
C:\Users\alex\Documentos\Cartas
```

Cada `cd` entra en una carpeta que está dentro de la actual, y `pwd` escribe la ruta completa de donde has terminado.
:::

### 2. Subir

Sigues en `C:\Users\alex\Documentos\Cartas`. Lee estas órdenes:

```powershell
cd ..
cd ..
pwd
```

:::pregunta[¿Qué ruta escribe `pwd`?]
`C:\Users\alex`

Cada `cd ..` sube un nivel: primero a `Documentos` y después a `alex`.
:::

### 3. Una ruta que no existe

Estás en `C:\Users\alex`. Lee esta orden:

```powershell
cd \Documentos
```

:::pregunta[¿Qué ocurre? ¿Cuál es la ruta correcta?]
Falla con un error rojo parecido a `Cannot find path 'C:\Documentos' because it does not exist` (el idioma depende del sistema) y te quedas donde estabas.

La barra del principio hace la ruta relativa a la **raíz de la unidad actual**: busca `Documentos` dentro de `C:\`, y allí no está. Desde `C:\Users\alex` bastaba `cd Documentos`, o `cd C:\Users\alex\Documentos` con la ruta absoluta.
:::

### 4. Volver a casa

Estás en `C:\Users\alex\Documentos\Cartas`. Lee estas órdenes:

```powershell
cd ~
pwd
cd $HOME
pwd
```

:::pregunta[¿Qué ruta escribe cada `pwd`?]
Las dos escriben `C:\Users\alex`.

`~` y `$HOME` son dos formas de nombrar tu carpeta personal, así que cualquiera de las dos te lleva a casa desde cualquier sitio. Ojo: en PowerShell 5.1, `cd` sin nada detrás **no** te lleva a casa, solo escribe dónde estás.
:::

### 5. Cambiar de unidad

Estás en `C:\Users\alex`. Lee estas órdenes:

```powershell
cd D:\
pwd
C:
pwd
```

:::pregunta[¿Qué escribe cada `pwd`?]
La primera escribe `D:\` y la segunda `C:\Users\alex`.

Cada unidad recuerda la última carpeta en la que estuviste. Escribir solo `C:` vuelve a esa carpeta, no a la raíz del disco. (Si el equipo no tiene unidad `D:`, el primer `cd` falla.)
:::

### 6. Mirar sin entrar

Estás en `C:\Users\alex`. Lee estas órdenes:

```powershell
ls Documentos
ls -Force Documentos
```

:::pregunta[¿Qué nombres salen en cada una?]
La primera enseña `Cartas` y `notas.txt`. La segunda enseña además `borrador.txt`, que es un fichero oculto.

`ls` esconde lo que tiene el atributo **oculto**. `-Force` lo enseña. En Windows lo oculto no depende del nombre del fichero, sino de un atributo que se le pone aparte.
:::

### 7. Tres caminos a la misma carpeta

Estás en `C:\Users\alex\Descargas` y quieres ir a `C:\Users\alex\Documentos\Cartas`.

:::pregunta[Escribe tres órdenes `cd` distintas que lleguen a ella]
```powershell
cd C:\Users\alex\Documentos\Cartas
cd ..\Documentos\Cartas
cd ~\Documentos\Cartas
```

La primera es absoluta. La segunda es relativa: sube a `alex` y baja por `Documentos`. La tercera usa `~` como atajo de `C:\Users\alex`.
:::

### 8. Una carpeta con espacios

Hay una carpeta que se llama `Mis cartas`. Escribes:

```powershell
cd Mis cartas
```

:::pregunta[¿Por qué falla? ¿Cómo se arregla?]
Falla porque PowerShell separa las palabras por los espacios: entiende `cd Mis` con un argumento de más, y da un error.

Se arregla con comillas: `cd "Mis cartas"`. Otra forma es escribir `cd Mis` y pulsar **Tab**, que completa el nombre y añade las comillas solo.
:::

## Hazlo tú

Ahora a la terminal. Copia este bloque, pégalo en PowerShell y pulsa Intro. Crea una carpeta `practica` en tu carpeta personal, con esta forma:

```text
practica
├── almacen
│   ├── pasillo1
│   ├── pasillo2   (con ficheros dentro, tres de ellos ocultos)
│   └── pasillo3
└── oficina
    ├── contabilidad
    │   ├── 2024
    │   └── 2025
    ├── rrhh
    └── ventas
```

```powershell
$p = "$HOME\practica"
Remove-Item $p -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path "$p\almacen\pasillo1", "$p\almacen\pasillo2", "$p\almacen\pasillo3" | Out-Null
New-Item -ItemType Directory -Path "$p\oficina\contabilidad\2024", "$p\oficina\contabilidad\2025", "$p\oficina\rrhh", "$p\oficina\ventas" | Out-Null
foreach ($n in "pieza1.txt", "pieza2.txt") {
    New-Item -ItemType File -Path "$p\almacen\pasillo2\$n" | Out-Null
}
foreach ($n in "secreto1.txt", "secreto2.txt", "secreto3.txt") {
    $f = New-Item -ItemType File -Path "$p\almacen\pasillo2\$n"
    $f.Attributes = "Hidden"
}
Write-Host "Carpeta $p preparada"
```

Todavía no sabes qué hace cada línea, y no hace falta: las iremos viendo en las piezas siguientes. Cuando termines, vuelve a ejecutarlo solo si quieres empezar de cero, porque **borra `practica` entera**.

### 9. A la carpeta de prácticas

Ve a la carpeta `practica` y demuestra con una orden que estás en ella.

:::pregunta[Escribe las órdenes y la salida]
```powershell
cd ~\practica
pwd
```

Sale la ruta completa, algo como `C:\Users\alex\practica`.
:::

### 10. El pasillo 3

Sin cambiar de carpeta, entra en `almacen\pasillo3` y escribe su ruta completa.

:::pregunta[Escribe las órdenes y la salida]
```powershell
cd almacen\pasillo3
pwd
```

Sale `C:\Users\alex\practica\almacen\pasillo3`. Como la ruta empieza sin unidad, se cuenta desde `practica`, donde estabas.
:::

### 11. Contar carpetas

¿Cuántas carpetas hay dentro de `oficina`? Averígualo con una orden, sin contarlas a ojo.

:::pregunta[Escribe la orden y la respuesta]
```powershell
(Get-ChildItem ~\practica\oficina -Directory).Count
```

Sale `3`: `contabilidad`, `rrhh` y `ventas`. Los paréntesis hacen que `Count` cuente los resultados del `ls`, y `-Directory` deja solo las carpetas. Sin él también saldría `3`, porque no hay ficheros, pero es mejor decir qué quieres contar.
:::

### 12. Lo escondido

En `almacen\pasillo2` hay ficheros ocultos. Averigua cuántos son y cómo se llaman.

:::pregunta[Escribe la orden y la respuesta]
```powershell
Get-ChildItem ~\practica\almacen\pasillo2 -Force -Hidden
```

Salen tres ficheros: `secreto1.txt`, `secreto2.txt` y `secreto3.txt`. `-Hidden` deja **solo** los ocultos. Con `-Force` a secas saldrían los cinco ficheros.
:::

### 13. Volver sin escribir la ruta

Estás en `pasillo3`. Vuelve a `practica` con **una sola orden** y sin escribir `practica`.

:::pregunta[Escribe la orden y cómo compruebas dónde estás]
```powershell
cd ..\..
pwd
```

Cada `..` sube un nivel: de `pasillo3` a `almacen` y de `almacen` a `practica`. Valía también `cd ../..` con barras normales.
:::

### 14. Ayuda sin salir de la terminal

Averigua, usando solo la terminal, qué hace el parámetro `-Recurse` de `Get-ChildItem`.

:::pregunta[Escribe la orden y lo que descubres]
```powershell
Get-Help Get-ChildItem -Parameter Recurse
```

La ayuda dice que lista también el contenido de las subcarpetas, es decir, que baja por todo el árbol. Lo usarás mucho en la pieza de búsquedas.
:::
