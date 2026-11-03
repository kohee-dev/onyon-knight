---
titulo: "Comandos 9: datos codificados y binarios"
tipo: teoria
---

# Comandos 9: datos codificados y binarios

No todo lo que encuentras es texto legible. A veces un fichero guarda su contenido **codificado** (para poder enviarlo por correo o esconderlo un poco) o es un programa binario con unas pocas frases dentro. Esta pieza reúne las herramientas para mirar dentro de esos ficheros y recuperar el texto original.

## Lo mínimo para empezar

| Orden | Qué hace |
|---|---|
| `file fichero` | dice el tipo de contenido: texto, datos, imagen, comprimido... |
| `strings fichero` | escribe las secuencias de texto legible que hay dentro de un fichero binario |
| `base64` | codifica en base64 lo que recibe |
| `base64 -d` | **deco**difica base64 |
| `xxd -p` | escribe lo que recibe en hexadecimal, sin adornos |
| `xxd -r -p` | hace lo contrario: convierte hexadecimal en los datos originales |
| `head -c 4 fichero` | escribe los 4 primeros **bytes** (`tail -c` los últimos) |
| `grep -a texto fichero` | busca en un fichero binario como si fuera texto |

Algunas ideas que necesitas:

- **Base64** representa cualquier dato con letras, números, `+` y `/`, y suele acabar en uno o dos signos `=`. Se reconoce a simple vista y se deshace con `base64 -d`. No es secreto ni cifrado: es solo otro formato.
- **Hexadecimal** escribe cada byte con dos cifras en base 16 (`0` a `9` y `a` a `f`). La letra `A` es `41`, la `B` es `42` y el salto de línea es `0a`. Con `printf '%x\n' 255` obtienes `ff`, y con `printf '%d\n' 0x41` obtienes `65`.
- Cuando un fichero binario tiene texto dentro (el nombre de un autor, un mensaje, una clave), `strings` lo saca sin que `cat` te llene la pantalla de símbolos. `strings` viene en el paquete `binutils`.
- Casi siempre se combinan con tuberías: `strings programa | grep clave`.

Los ejercicios usan estos ficheros:

```text
# bin.dat  (binario: contiene bytes no imprimibles y dos textos)
Hola mundo
clave
```

```text
# txt.dat  (texto, sin salto de línea al final)
abcdefghij
```

## Ejercicios

### 1. Codificar en base64

Lee estas dos órdenes:

```bash
echo hola | base64
echo -n hola | base64
```

:::pregunta[¿Qué escribe cada una?]
```text
aG9sYQo=
aG9sYQ==
```

`echo` añade un salto de línea al final del texto y `-n` lo evita, así que el primero codifica cinco caracteres (`hola` y el salto) y el segundo cuatro. Por eso cambian los signos `=` del final.
:::

### 2. Decodificar

Lee esta orden:

```bash
echo aG9sYQo= | base64 -d
```

:::pregunta[¿Qué escribe?]
```text
hola
```

`-d` deshace la codificación. El salto de línea del final está dentro del propio dato codificado.
:::

### 3. A hexadecimal y vuelta

Lee estas dos órdenes:

```bash
echo AB | xxd -p
echo 41420a | xxd -r -p
```

:::pregunta[¿Qué escribe cada una?]
```text
41420a
AB
```

`A` es `41`, `B` es `42` y el salto de línea que añade `echo` es `0a`. La segunda orden hace el camino inverso.
:::

### 4. Un fichero binario

`bin.dat` mezcla bytes no imprimibles con las palabras `Hola mundo` y `clave`. Lee estas tres órdenes:

```bash
file bin.dat
strings bin.dat
grep -a -o 'Hola mundo' bin.dat
```

:::pregunta[¿Qué escribe cada una?]
```text
bin.dat: data
Hola mundo
clave
Hola mundo
```

`file` no reconoce el formato y dice solo `data`. `strings` saca los textos legibles. `grep -a` busca como si fuera texto, y `-o` escribe solo lo que casa, no la línea entera.
:::

### 5. Pasar de un número a otro

Lee estas tres órdenes:

```bash
printf '%d\n' 0x41
printf '%x\n' 255
echo $((16#ff))
```

:::pregunta[¿Qué escribe cada una?]
```text
65
ff
255
```

`0x41` es el 41 hexadecimal, que son 65 en decimal (el código de la letra `A`). `ff` es 255. `16#ff` le dice a la terminal que `ff` está en base 16.
:::

### 6. Cortar por bytes

Lee estas tres órdenes, con `txt.dat`:

```bash
head -c 4 txt.dat
tail -c 3 txt.dat
wc -c < txt.dat
```

:::pregunta[¿Qué escribe cada una?]
```text
abcd
hij
10
```

`head -c 4` escribe los 4 primeros bytes y `tail -c 3` los 3 últimos. `wc -c` cuenta los bytes. Como el fichero no acaba en salto de línea, la salida de `head` y de `tail` tampoco lo lleva.
:::

### 7. ¿Qué es esto?

Te dan un fichero que parece base64: una sola línea de letras y números que acaba en `==`.

:::pregunta[¿Qué órdenes usas para comprobarlo y para leerlo?]
```bash
file mensaje
base64 -d mensaje
```

`file` dirá `ASCII text`, que es solo texto: no distingue base64 de un texto normal, así que hay que probar. Si `base64 -d` escribe algo legible, era base64; si escribe error o símbolos raros, no.
:::

## Hazlo tú

Guarda este script como `preparar-9.sh` y ejecútalo con `bash preparar-9.sh`. Crea en `practica` una carpeta `cifrados` con cuatro ficheros que esconden una **clave** con la forma `CLAVE-X-0000`.

```bash
rm -rf ~/practica/cifrados
mkdir -p ~/practica/cifrados
cd ~/practica/cifrados
echo "la clave es CLAVE-J-5773" | base64 > mensaje.b64
echo "la clave es CLAVE-K-8821" | xxd -p > mensaje.hex
printf '\000\001\002ruido\000\377\376basura\200\000secreto: CLAVE-L-1357\000\001' > programa.bin
echo "CLAVE-M-9999" | base64 | base64 | base64 > capas.txt
echo "Carpeta ~/practica/cifrados preparada"
```

### 8. Un mensaje en base64

`mensaje.b64` guarda un mensaje en base64. Descodifícalo y escribe la clave.

:::pregunta[Escribe la orden y la clave]
```bash
cd ~/practica/cifrados
base64 -d mensaje.b64
```

El mensaje es `la clave es CLAVE-J-5773`.
:::

### 9. Un mensaje en hexadecimal

`mensaje.hex` guarda otro mensaje, esta vez en hexadecimal. Recupéralo y escribe la clave.

:::pregunta[Escribe la orden y la clave]
```bash
xxd -r -p mensaje.hex
```

El mensaje es `la clave es CLAVE-K-8821`.
:::

### 10. Un programa con una frase dentro

`programa.bin` es un fichero binario. Averigua qué tipo de fichero es **sin** hacerle `cat`, y saca la clave que lleva dentro.

:::pregunta[Escribe las órdenes y la clave]
```bash
file programa.bin
strings programa.bin | grep CLAVE
```

`file` dice `data`. `strings` saca tres textos (`ruido`, `basura` y `secreto: CLAVE-L-1357`) y `grep` se queda con el que lleva la clave: `CLAVE-L-1357`.
:::

### 11. Capas

`capas.txt` guarda una clave que ha sido codificada en base64 **varias veces seguidas**. Recupérala sin guardar ficheros intermedios.

:::pregunta[Escribe la orden y la clave]
```bash
base64 -d capas.txt | base64 -d | base64 -d
```

Se hacen tres decodificaciones encadenadas con tuberías. La clave es `CLAVE-M-9999`. Si te equivocas y decodificas de más, `base64` se queja de una entrada no válida: sabes que has pasado de capa.
:::
