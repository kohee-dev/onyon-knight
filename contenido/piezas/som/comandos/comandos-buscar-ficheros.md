---
titulo: "Comandos 5: buscar ficheros con find"
tipo: teoria
---

# Comandos 5: buscar ficheros con find

Un servidor tiene miles de ficheros y casi nunca sabes en qué carpeta está el que buscas. `find` los recorre todos y se queda solo con los que cumplen lo que le pides: el nombre, el tipo, el tamaño, el dueño, los permisos. Es la herramienta que más se usa en los retos online.

## Lo mínimo para empezar

`find` se escribe siempre igual: primero **dónde buscar** y después las **condiciones**. Si pones varias condiciones, se tienen que cumplir todas.

```bash
find carpeta condición condición ...
```

| Condición | Qué busca |
|---|---|
| `-name "*.txt"` | nombres que casan con el patrón (distingue mayúsculas) |
| `-iname "*.txt"` | igual, sin distinguir mayúsculas |
| `-type f` | solo ficheros (`-type d` solo carpetas) |
| `-size 33c` | tamaño exacto de 33 bytes |
| `-size +1k` | más de 1 KiB (`-size -1k`, menos) |
| `-user nombre` | ficheros cuyo dueño es ese usuario |
| `-group nombre` | ficheros cuyo grupo es ese |
| `-perm 600` | permisos exactamente `600` |
| `-empty` | ficheros o carpetas vacíos |
| `-maxdepth 1` | no baja más de un nivel de carpetas |

Cosas que debes tener claras:

- **Las comillas** del patrón (`"*.txt"`) son importantes: sin ellas la terminal expandería el `*` antes de que `find` lo vea.
- Los tamaños llevan una unidad: `c` bytes, `k` KiB y `M` MiB. Con `k` y `M` se redondea hacia arriba, y `+` y `-` significan «más que» y «menos que».
- `find` **no ordena** lo que encuentra: el orden puede cambiar de un sistema a otro.
- Una carpeta también tiene tamaño. Por eso, para buscar por tamaño, casi siempre hay que añadir `-type f`.
- Buscar desde `/` recorre sitios a los que no tienes acceso y llena la pantalla de `Permission denied`. Con `2>/dev/null` al final de la orden se descartan esos mensajes de error (en la pieza 7 se explica por qué).

Los ejercicios usan esta carpeta `taller`, que está en el directorio donde ejecutas `find`:

```text
taller
├── a.txt             (3 bytes)
├── grande.dat        (2000 bytes)
├── notas.TXT
├── secreto.key       (permisos 600)
├── docs
│   ├── informe.pdf   (vacío)
│   └── resumen.txt
├── fotos
│   ├── foto1.png     (vacío)
│   ├── foto2.png     (vacío)
│   └── viejas
│       └── foto0.png (vacío)
└── vacio
```

Todo es del usuario `alex`, y todos los ficheros tienen permisos `644` salvo `secreto.key`.

## Ejercicios

### 1. Por nombre

Lee esta orden:

```bash
find taller -name "*.txt"
```

:::pregunta[¿Qué escribe?]
```text
taller/a.txt
taller/docs/resumen.txt
```

`find` baja por todas las carpetas. `notas.TXT` no sale: `-name` distingue mayúsculas y el patrón pide `.txt` en minúscula. El orden puede variar.
:::

### 2. Sin distinguir mayúsculas

Lee esta orden:

```bash
find taller -iname "*.txt"
```

:::pregunta[¿Qué escribe?]
```text
taller/a.txt
taller/docs/resumen.txt
taller/notas.TXT
```

`-iname` ignora las mayúsculas, así que ahora sí aparece `notas.TXT`.
:::

### 3. Solo carpetas

Lee esta orden:

```bash
find taller -type d
```

:::pregunta[¿Qué escribe?]
```text
taller
taller/docs
taller/fotos
taller/fotos/viejas
taller/vacio
```

`-type d` deja solo las carpetas, y la propia `taller` también lo es. Con `-type f` saldrían solo los ficheros.
:::

### 4. Dos condiciones

Lee esta orden:

```bash
find taller -type f -name "foto*"
```

:::pregunta[¿Qué escribe?]
```text
taller/fotos/foto1.png
taller/fotos/foto2.png
taller/fotos/viejas/foto0.png
```

Se tienen que cumplir las dos condiciones: ser fichero **y** llamarse `foto...`. La carpeta `fotos` empieza por `foto` pero no es un fichero, así que no sale.
:::

### 5. Limitar la profundidad

Lee esta orden:

```bash
find taller -maxdepth 1 -type f
```

:::pregunta[¿Qué escribe?]
```text
taller/a.txt
taller/grande.dat
taller/notas.TXT
taller/secreto.key
```

`-maxdepth 1` solo mira el contenido directo de `taller`, sin bajar a `docs` ni a `fotos`.
:::

### 6. Por tamaño

Lee estas dos órdenes:

```bash
find taller -type f -size +1k
find taller -type f -size 3c
```

:::pregunta[¿Qué escribe cada una?]
```text
taller/grande.dat
taller/a.txt
```

`grande.dat` pesa 2000 bytes, que redondeados hacia arriba son 2 KiB, más de 1. `a.txt` pesa justo 3 bytes. Sin `-type f`, `-size +1k` habría encontrado también carpetas, que ocupan 4 KiB.
:::

### 7. Vacíos

Lee esta orden:

```bash
find taller -empty
```

:::pregunta[¿Qué escribe?]
```text
taller/docs/informe.pdf
taller/fotos/foto1.png
taller/fotos/foto2.png
taller/fotos/viejas/foto0.png
taller/vacio
```

Salen los cuatro ficheros de 0 bytes y la carpeta `vacio`. `viejas` no sale porque no está vacía: lleva `foto0.png` dentro.
:::

### 8. Por dueño y por permisos

Lee estas dos órdenes:

```bash
find taller -user root
find taller -type f -perm 600
```

:::pregunta[¿Qué escribe cada una?]
La primera no escribe nada: todo en `taller` es de `alex`, no de `root`. La segunda escribe:

```text
taller/secreto.key
```

`-perm 600` busca los permisos **exactamente** iguales, y los demás ficheros tienen `644`.
:::

### 9. Demasiados errores

Escribes `find / -name "passwd"` y la pantalla se llena de líneas que acaban en `Permission denied`.

:::pregunta[¿Por qué ocurre? ¿Cómo se evita?]
Buscando desde `/`, `find` entra en carpetas del sistema que tu usuario no puede leer, y por cada una escribe un error. El resultado que buscas queda enterrado entre ellos.

```bash
find / -name "passwd" 2>/dev/null
```

`2>/dev/null` manda los mensajes de error a `/dev/null`, el agujero negro de Linux. Lo que se encuentra se sigue escribiendo.
:::

### 10. Escribir una búsqueda

Quieres saber qué ficheros de `taller` terminan en `.png`, estén donde estén, y que sean ficheros.

:::pregunta[Escribe la orden]
```bash
find taller -type f -name "*.png"
```

Encuentra los tres: `foto1.png`, `foto2.png` y `foto0.png`.
:::

## Hazlo tú

Guarda este script como `preparar-5.sh` y ejecútalo con `bash preparar-5.sh`. Necesita `sudo`, así que te pedirá tu contraseña. Crea en `practica` una carpeta `archivo` con tres salas de dos estantes cada una, y cuatro **claves** con la forma `CLAVE-X-0000` escondidas entre muchos ficheros. Hay también ficheros parecidos que no valen: lee la condición con cuidado.

```bash
sudo rm -rf ~/practica/archivo
mkdir -p ~/practica/archivo/{sala1,sala2,sala3}/{estante1,estante2}
cd ~/practica/archivo
for d in sala*/estante*; do
    for n in 1 2 3; do head -c $((100 * n)) /dev/zero > $d/caja$n.dat; done
done
{ echo "CLAVE-A-4401"; printf 'x%.0s' $(seq 1 1020); } > sala2/estante1/pesado.dat
{ echo "CLAVE-X-0000"; printf 'x%.0s' $(seq 1 1021); } > sala1/estante1/parecido1.dat
{ echo "CLAVE-Y-0000"; printf 'x%.0s' $(seq 1 1019); } > sala3/estante1/parecido2.dat
printf 'CLAVE-B-7742\n-------------------\n' > sala3/estante2/inventario.txt
printf 'CLAVE-Z-0000\n---------------------\n' > sala1/estante2/mio.txt
echo "nada interesante" > sala2/estante2/otro-root.txt
echo "CLAVE-C-9135" > sala1/estante2/.nota
echo "esto no es la nota" > sala1/estante2/nota
echo "CLAVE-D-2208" > sala2/estante2/llave.key
chmod 600 sala2/estante2/llave.key
sudo chown root sala3/estante2/inventario.txt sala2/estante2/otro-root.txt
echo "Carpeta ~/practica/archivo preparada"
```

### 11. El fichero pesado

En `archivo` hay un único fichero que pesa **exactamente 1033 bytes**. Encuéntralo y lee su clave (está en la primera línea).

:::pregunta[Escribe las órdenes y la clave]
```bash
cd ~/practica/archivo
find . -type f -size 1033c
head -n 1 sala2/estante1/pesado.dat
```

La clave es `CLAVE-A-4401`. Los ficheros `parecido1.dat` y `parecido2.dat` pesan 1034 y 1032 bytes, y por eso `-size 1033c` los descarta.
:::

### 12. El fichero de root

Hay un fichero que es propiedad de `root` y pesa exactamente 33 bytes. Encuéntralo y lee su clave.

:::pregunta[Escribe las órdenes y la clave]
```bash
find . -type f -user root -size 33c
head -n 1 sala3/estante2/inventario.txt
```

La clave es `CLAVE-B-7742`. Hay otro fichero de `root` (`otro-root.txt`) y otro de 33 bytes (`mio.txt`), pero ninguno cumple las dos condiciones.
:::

### 13. La nota oculta

Alguien escondió una nota en un fichero oculto que se llama `.nota`, en algún sitio del archivo. Encuéntrala sin recorrer las carpetas a mano y lee su clave.

:::pregunta[Escribe las órdenes y la clave]
```bash
find . -name ".nota"
cat sala1/estante2/.nota
```

La clave es `CLAVE-C-9135`. El fichero `nota` (sin punto) es un señuelo.
:::

### 14. La llave privada

Una de las cajas es una llave que solo puede leer su dueño, y por eso tiene permisos distintos de todas las demás. Encuéntrala y lee su clave.

:::pregunta[Escribe las órdenes y la clave]
```bash
find . -type f -perm 600
cat sala2/estante2/llave.key
```

La clave es `CLAVE-D-2208`. Todos los demás ficheros tienen `644`.
:::
