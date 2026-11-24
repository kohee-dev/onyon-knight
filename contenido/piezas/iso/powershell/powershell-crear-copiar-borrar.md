---
titulo: "PowerShell 3: crear, copiar, mover y borrar"
tipo: teoria
---

# PowerShell 3: crear, copiar, mover y borrar

Ya sabes moverte y leer. Ahora toca **cambiar** cosas: crear carpetas y ficheros, copiarlos, cambiarlos de sitio y borrarlos. Es lo que se hace todos los días al ordenar un servidor, y donde un descuido sale caro, así que esta pieza termina con un aviso importante.

## Lo mínimo para empezar

| Cmdlet | Alias | Qué hace |
|---|---|---|
| `New-Item -ItemType Directory carpeta` | `mkdir`, `md` | crea una carpeta (y las que falten por el camino) |
| `New-Item -ItemType File fichero` | | crea un fichero vacío |
| `Copy-Item origen destino` | `cp`, `copy` | copia un fichero |
| `Copy-Item carpeta destino -Recurse` | | copia una carpeta con todo lo que lleva dentro |
| `Move-Item origen destino` | `mv`, `move` | **mueve** un fichero o carpeta |
| `Rename-Item origen -NewName nuevo` | `ren` | cambia el nombre, sin moverlo |
| `Remove-Item fichero` | `rm`, `del`, `ri` | borra un fichero |
| `Remove-Item carpeta -Recurse` | | borra una carpeta con todo lo que lleva dentro |

Tres ideas para no equivocarte:

- `Move-Item` hace dos cosas con la misma orden: si el destino es una carpeta que existe, **mueve** dentro de ella; si no existe, **cambia el nombre**. `Rename-Item` solo cambia el nombre y no mueve nunca.
- `Copy-Item` **sobrescribe** el fichero destino si ya existe, sin avisar. `Move-Item` en cambio da un error si el destino existe, salvo que añadas `-Force`.
- `Remove-Item` **no usa la papelera**: lo que borras no se recupera.

Los **comodines** sustituyen parte de un nombre, y a diferencia de otros sistemas los interpreta el propio cmdlet, no la terminal:

| Comodín | Significa |
|---|---|
| `*` | cualquier cosa, incluso nada: `*.txt` son todos los que acaban en `.txt` |
| `?` | exactamente un carácter cualquiera: `foto?.png` |
| `[12]` | uno de los caracteres de la lista: `foto[12].png` |

PowerShell no tiene el `{a,b,c}` de Linux. Para crear varias cosas a la vez se escribe una **lista separada por comas**: `New-Item -ItemType Directory a, b, c`.

:::aviso
`Remove-Item` con un comodín mal escrito puede borrar mucho más de lo que querías. Antes de borrar, añade `-WhatIf`: el cmdlet escribe **qué haría** y no hace nada. También existe `-Confirm`, que pregunta antes de cada borrado. Y si prefieres, ejecuta primero `ls` con **el mismo patrón** y comprueba que salen justo los ficheros que quieres.
:::

Los ejercicios usan estos nombres, siempre dentro de una carpeta de pruebas:

```text
foto1.png  foto2.png  foto3.png
informe-a.pdf  informe-b.pdf
notas.txt  resumen.txt
```

## Ejercicios

### 1. Crear

Estás en una carpeta vacía. Lee estas órdenes:

```powershell
mkdir proyecto
cd proyecto
New-Item -ItemType File a.txt, b.txt
ls
```

:::pregunta[¿Qué nombres aparecen en el último `ls`?]
`a.txt` y `b.txt`.

`mkdir` crea la carpeta, `cd` entra en ella y `New-Item` crea los dos ficheros vacíos, con una lista separada por comas. Cada orden `New-Item` y `mkdir` también escribe en pantalla una tabla con lo que acaba de crear.
:::

### 2. Copiar

Lee estas órdenes:

```powershell
Copy-Item notas.txt copia.txt
ls
```

:::pregunta[¿Qué ficheros hay ahora y qué le ha pasado a `notas.txt`?]
Hay `notas.txt` y `copia.txt`, con el mismo contenido. `notas.txt` sigue donde estaba: copiar no quita nada del origen.
:::

### 3. Mover o renombrar

En una carpeta hay `resumen.txt` y una carpeta `archivo`. Lee estas órdenes:

```powershell
Move-Item resumen.txt archivo
Move-Item notas.txt final.txt
```

:::pregunta[¿Qué hace cada una?]
La primera **mueve** `resumen.txt` dentro de `archivo`, porque `archivo` existe y es una carpeta. La segunda **cambia el nombre** de `notas.txt` a `final.txt`, porque `final.txt` no existe.

Es el mismo cmdlet con dos resultados distintos, según el destino. Si quieres estar seguro de que solo renombras, usa `Rename-Item notas.txt -NewName final.txt`.
:::

### 4. Comodines

Estás en la carpeta de los nombres de ejemplo. Lee estas órdenes:

```powershell
ls foto*.png
ls informe-?.pdf
ls foto[12].png
```

:::pregunta[¿Qué ficheros salen en cada una?]
La primera enseña `foto1.png`, `foto2.png` y `foto3.png`. La segunda, `informe-a.pdf` e `informe-b.pdf`. La tercera, solo `foto1.png` y `foto2.png`: los corchetes aceptan el `1` o el `2`, pero no el `3`.
:::

### 5. Copiar una carpeta dos veces

Hay una carpeta `proyecto` con un fichero `a.txt` dentro y **no existe** la carpeta `copia`. Lee estas órdenes:

```powershell
Copy-Item proyecto copia -Recurse
Copy-Item proyecto copia -Recurse
```

:::pregunta[¿Dónde queda `a.txt` después de cada una?]
Después de la primera queda en `copia\a.txt`: como `copia` no existía, se crea con el contenido de `proyecto`.

Después de la segunda queda además en `copia\proyecto\a.txt`: como `copia` ya existe, PowerShell copia la carpeta **dentro** de ella. Es un fallo muy típico al repetir una copia.
:::

### 6. Borrar una carpeta que no está vacía

Lee esta orden:

```powershell
Remove-Item proyecto
```

:::pregunta[¿Qué ocurre?]
Como `proyecto` tiene cosas dentro y no has puesto `-Recurse`, PowerShell **te pregunta** si de verdad quieres borrar la carpeta y todo lo que contiene, y espera una respuesta (`S` para sí, `N` para no, en un sistema en español).

Para borrarla sin preguntar se escribe `Remove-Item proyecto -Recurse`, y entonces ya no hay marcha atrás.
:::

### 7. Ensayar antes de borrar

Lee esta orden:

```powershell
Remove-Item foto*.png -WhatIf
```

:::pregunta[¿Qué escribe y qué ficheros se borran?]
Escribe tres líneas parecidas a `What if: Performing the operation "Remove File" on target "...\foto1.png"`, una por cada fichero que coincide con el patrón. **No se borra ninguno**.

`-WhatIf` es la forma de ver qué haría una orden peligrosa antes de ejecutarla de verdad. Casi todos los cmdlets que cambian algo lo admiten.
:::

### 8. Crear algo que ya existe

`notas.txt` existe y tiene texto. Lee esta orden:

```powershell
New-Item -ItemType File notas.txt -Force
```

:::pregunta[¿Qué le pasa al contenido de `notas.txt`?]
Se **pierde**: con `-Force`, `New-Item` crea el fichero de nuevo aunque exista, y lo deja vacío. Sin `-Force`, la misma orden da un error y no toca nada. Usa `-Force` solo cuando estés seguro.
:::

## Hazlo tú

Copia este bloque y pégalo en PowerShell. Crea en `practica` una carpeta `ordenar` con una carpeta `descargas` llena de ficheros vacíos mezclados: cuatro fotos, tres PDF, dos canciones y tres temporales.

```powershell
$d = "$HOME\practica\ordenar"
Remove-Item $d -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path "$d\descargas" | Out-Null
$nombres = "foto1.jpg", "foto2.jpg", "foto3.jpg", "foto4.jpg",
           "doc1.pdf", "doc2.pdf", "doc3.pdf",
           "musica1.mp3", "musica2.mp3",
           "temp1.tmp", "temp2.tmp", "temp3.tmp"
foreach ($n in $nombres) {
    New-Item -ItemType File -Path "$d\descargas\$n" | Out-Null
}
Write-Host "Carpeta $d preparada"
```

Tu misión es dejar `descargas` **vacía** y todo lo que valga ordenado en una carpeta `ordenado`. Haz los ejercicios en orden, desde `~\practica\ordenar`.

### 9. Las carpetas de destino

Crea con **una sola orden** las carpetas `ordenado\fotos`, `ordenado\docs` y `ordenado\musica`.

:::pregunta[Escribe la orden y cómo compruebas el resultado]
```powershell
cd ~\practica\ordenar
New-Item -ItemType Directory ordenado\fotos, ordenado\docs, ordenado\musica
ls ordenado
```

Salen las tres carpetas. `New-Item` crea también `ordenado`, que no existía, porque crea las carpetas que falten por el camino.
:::

### 10. Las fotos

Mueve las cuatro fotos a `ordenado\fotos` con una sola orden.

:::pregunta[Escribe la orden y cómo compruebas el resultado]
```powershell
Move-Item descargas\*.jpg ordenado\fotos
ls ordenado\fotos
```

Salen las cuatro `.jpg`, y ya no están en `descargas`.
:::

### 11. Los PDF, copiados

Copia los tres PDF a `ordenado\docs`, **sin quitarlos** de `descargas`.

:::pregunta[Escribe la orden y cómo compruebas el resultado]
```powershell
Copy-Item descargas\*.pdf ordenado\docs
ls descargas
ls ordenado\docs
```

Los tres PDF están en los dos sitios. Los de `descargas` los borrarás al final.
:::

### 12. La música

Mueve las dos canciones a `ordenado\musica` y cambia el nombre de `musica1.mp3` por `cancion.mp3`.

:::pregunta[Escribe las órdenes y cómo compruebas el resultado]
```powershell
Move-Item descargas\*.mp3 ordenado\musica
Rename-Item ordenado\musica\musica1.mp3 -NewName cancion.mp3
ls ordenado\musica
```

Salen `cancion.mp3` y `musica2.mp3`. `Rename-Item` recibe la ruta completa del fichero, pero el nombre nuevo va solo, sin carpeta.
:::

### 13. Los temporales

Borra los tres ficheros `.tmp`, pero **antes** comprueba qué borrarías.

:::pregunta[Escribe las órdenes]
```powershell
Remove-Item descargas\*.tmp -WhatIf
Remove-Item descargas\*.tmp
```

La primera escribe tres líneas con los tres `.tmp` y no borra nada. Si coinciden con lo que esperabas, ejecutas la segunda. `ls descargas\*.tmp` también valía como comprobación previa.
:::

### 14. Dejarlo todo en orden

Vacía `descargas` y demuestra que `ordenado` tiene los nueve ficheros esperados.

:::pregunta[Escribe las órdenes y la salida]
```powershell
Remove-Item descargas\*
ls descargas
(Get-ChildItem ordenado -Recurse -File).Count
```

El `ls descargas` no escribe nada, y el contador escribe `9`: cuatro fotos, tres PDF y dos canciones. `Remove-Item descargas\*` borra el contenido pero deja la carpeta `descargas`. Ten cuidado: el `*` va **dentro** de `descargas\`; sin la carpeta, borrarías lo que haya en la carpeta actual.
:::
