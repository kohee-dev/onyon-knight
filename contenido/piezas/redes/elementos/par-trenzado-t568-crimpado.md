---
titulo: "Par trenzado, T568A/B y crimpado de un latiguillo"
tipo: teoria
---

# Par trenzado, T568A/B y crimpado de un latiguillo

Un **latiguillo** es el cable corto que une un equipo con la toma de red o con el panel de parcheo. Casi siempre es un cable de pares trenzados con un conector RJ45 en cada extremo. Fabricarlo con tus manos obliga a saber dos cosas: **en qué orden va cada hilo** (las normas T568A y T568B) y **cómo se fija el conector** (el crimpado). Esta pieza trata de las dos.

## Lo mínimo para empezar

Un cable Ethernet de cobre lleva **8 hilos en 4 pares trenzados**, y un conector RJ45 tiene **8 contactos o pines**, numerados del 1 al 8. Cada hilo va a un pin. Una **norma de cableado** dice qué hilo va a qué pin.

| Pin | T568B | T568A |
|---|---|---|
| 1 | blanco-naranja | blanco-verde |
| 2 | naranja | verde |
| 3 | blanco-verde | blanco-naranja |
| 4 | azul | azul |
| 5 | blanco-azul | blanco-azul |
| 6 | verde | naranja |
| 7 | blanco-marrón | blanco-marrón |
| 8 | marrón | marrón |

Cuatro pares, cuatro colores: **azul**, **naranja**, **verde** y **marrón**. En cada par, un hilo es de color liso y su pareja es blanca con rayas de ese color (blanco-azul, blanco-naranja...).

| Pieza | Qué hace |
|---|---|
| T568B | norma de cableado muy extendida en latiguillos y tomas |
| T568A | la otra norma: intercambia los pares naranja y verde |
| directo | los dos extremos con la **misma** norma |
| cruzado | un extremo en T568A y el otro en T568B |
| tester | comprueba, de un extremo a otro, que cada hilo llega al pin que toca |
| crimpadora | herramienta que aprieta el conector contra el cable |

Qué debes saber:

- **Las dos normas son eléctricamente equivalentes**: ninguna es mejor. Lo importante es usar **la misma en todos los extremos de una instalación**, para que todo el cableado sea coherente.
- T568A y T568B solo se diferencian en los pines **1, 2, 3 y 6**: los pares verde y naranja se cambian de sitio. Los pines 4, 5, 7 y 8 son iguales en las dos.
- **Los pines 3 y 6 pertenecen al mismo par** (el verde en T568B), aunque no son vecinos: el par azul queda en medio, en los pines 4 y 5. Es la parte de la norma que más se equivoca.
- Un cable **directo** (mismos extremos) une equipos de distinto tipo, por ejemplo un ordenador con un switch. Un cable **cruzado** servía para unir dos equipos iguales sin switch. Hoy casi todos los equipos detectan solos el cruce (Auto-MDI-X) y el cruzado se usa muy poco, pero sirve para entender la norma.
- El **trenzado** reduce las interferencias entre pares. Si al preparar el cable se **destrenza de más**, se pierde esa protección: solo se destrenza lo imprescindible para colocar los hilos.
- La **categoría** (Cat 5e, Cat 6, Cat 6a...) va impresa en la cubierta. A grandes rasgos, Cat 5e llega a 1 Gb/s, y Cat 6 y Cat 6a admiten 10 Gb/s (Cat 6, solo en tramos cortos, de unos 55 m). La distancia máxima de un enlace de cobre es de **100 m**.
- Un cable **UTP** no lleva pantalla metálica; en los apantallados la sigla incluye una F (lámina) o una S (malla).

## Ejercicios

### 1. Hilos, pares y pines

Un cable Ethernet habitual de cobre acaba en un conector RJ45.

:::pregunta[¿Cuántos hilos tiene, cómo se agrupan y cuántos pines tiene el conector?]
Tiene **8 hilos** agrupados en **4 pares trenzados** (azul, naranja, verde y marrón). El conector RJ45 tiene **8 pines**, uno para cada hilo.
:::

### 2. ¿Qué norma es?

Un latiguillo tiene este orden de hilos, del pin 1 al pin 8: blanco-naranja, naranja, blanco-verde, azul, blanco-azul, verde, blanco-marrón, marrón.

:::pregunta[¿Es T568A o T568B?]
Es **T568B**: el pin 1 es blanco-naranja y el pin 3, blanco-verde. En T568A los pines 1 y 3 serían al revés.
:::

### 3. Dos pines de T568B

:::pregunta[En T568B, ¿qué hilo va al pin 3 y cuál al pin 6? ¿Qué relación tienen?]
El pin 3 es **blanco-verde** y el pin 6, **verde**. Son los dos hilos del **mismo par**, aunque no están juntos: entre ellos están los pines 4 y 5, del par azul.
:::

### 4. Tres pines de T568A

:::pregunta[En T568A, ¿qué hilo va a los pines 1, 2 y 6?]
Pin 1: **blanco-verde**. Pin 2: **verde**. Pin 6: **naranja**.

En T568A el par verde ocupa los pines 1 y 2, y el naranja se va a los pines 3 y 6.
:::

### 5. Lo que no cambia

:::pregunta[¿Qué pines tienen el mismo hilo en T568A y en T568B? ¿Y cuáles cambian?]
Son iguales los pines **4, 5, 7 y 8** (azul, blanco-azul, blanco-marrón y marrón). Cambian los **1, 2, 3 y 6**, porque se intercambian los pares naranja y verde.
:::

### 6. Colocar los hilos

Vas a crimpar un extremo con la norma T568B. Tienes el cable delante, con los hilos apuntando hacia delante, alejándose de ti.

:::pregunta[¿En qué orden pones los hilos, de izquierda a derecha, y con qué cara del conector hacia arriba?]
De izquierda a derecha, los pines **1 a 8**: blanco-naranja, naranja, blanco-verde, azul, blanco-azul, verde, blanco-marrón, marrón. El conector se introduce con los **contactos hacia arriba** (la pestaña de retención queda debajo).

Comprueba siempre el orden mirando el conector por el lateral transparente antes de crimpar: una vez apretado, no se puede rehacer.
:::

### 7. Directo o cruzado

Se fabrican tres latiguillos:

| Latiguillo | Extremo 1 | Extremo 2 |
|---|---|---|
| a | T568B | T568B |
| b | T568A | T568B |
| c | T568A | T568A |

:::pregunta[¿Cuáles son directos y cuáles cruzados?]
**a** es directo, **b** es cruzado y **c** es también directo. Lo que importa es si los dos extremos son iguales, no cuál de las dos normas se haya usado.
:::

### 8. Adónde llega un hilo

El latiguillo **b** del ejercicio anterior tiene el extremo 1 en T568A.

:::pregunta[El hilo blanco-verde sale del pin 1 del extremo 1. ¿A qué pin llega en el extremo 2?]
Llega al **pin 3**, porque en T568B el blanco-verde es el pin 3. Con el mismo razonamiento, el pin 2 del extremo 1 (verde) llega al pin 6, y los pines 3 y 6 llegan a los pines 1 y 2. Los pines 4, 5, 7 y 8 no cambian.
:::

### 9. El par partido

Un alumno prepara los dos extremos de un cable con este orden, que parece correcto porque no repite colores: blanco-naranja, naranja, blanco-verde, verde, azul, blanco-azul, blanco-marrón, marrón. Pasa el tester y todos los pines se encienden en orden.

:::pregunta[¿Está bien hecho el cable?]
No. El tester solo comprueba que **cada hilo llega al mismo pin** en los dos extremos, y eso se cumple. Pero el orden de los pines 3 a 6 es incorrecto: el verde está en los pines 3 y 4 y el azul, en el 5 y el 6, así que los pares reales quedan **partidos**. El cable funciona al principio, pero con interferencias, y falla con más distancia o más velocidad.

Un tester sencillo no detecta un **par partido**. Se evita comparando el orden con la tabla de la norma antes de crimpar.
:::

### 10. Leer la cubierta

La cubierta de un cable lleva impreso: `CAT 6 U/UTP 4P 23AWG`.

:::pregunta[¿Qué categoría tiene y qué indica «UTP»?]
Es **Cat 6**. «UTP» significa que es de pares trenzados **sin pantalla** metálica. «4P» son los cuatro pares y «23AWG» el calibre del conductor.
:::

### 11. Destrenzar de más

Un compañero deja destrenzados 5 cm de cada par «para trabajar más cómodo».

:::pregunta[¿Qué problema crea y cuánto debería quedar destrenzado?]
Se pierde la protección del trenzado y aumentan las interferencias entre pares (la **diafonía**), con lo que el enlace puede ir más lento o dar errores. Se destrenza **solo lo necesario**, unos 13 mm como máximo, justo hasta donde llegan los contactos del conector.
:::

### 12. El tester, con un fallo

Pruebas un latiguillo directo con el tester. Las luces del extremo remoto se encienden en este orden: 1, 2, 4, 5, 6, 7, 8. La luz del 3 no se enciende.

:::pregunta[¿Qué ocurre y qué hay que revisar?]
El **hilo del pin 3 no hace contacto** en alguno de los dos extremos. Lo normal es que no haya llegado hasta el fondo del conector, o que el corte no fuera a ras y un hilo haya quedado más corto. Se corta el conector y se rehace el extremo.
:::

### 13. El tester, con un cruzado

Pruebas el latiguillo **b** (T568A en un extremo y T568B en el otro). El tester envía la señal por los pines 1, 2, 3, 4, 5, 6, 7 y 8, en ese orden.

:::pregunta[¿En qué orden se encienden las luces del extremo remoto?]
```text
3 6 1 4 5 2 7 8
```

El pin 1 llega al 3, el 2 al 6, el 3 al 1 y el 6 al 2; los demás no cambian. Si pruebas un cruzado y las luces salen 1 a 8, es que ese cable es en realidad directo.
:::

## Guía de crimpado

Material: cable de pares trenzados, conectores RJ45, crimpadora con cuchilla, pelacables y tester. Los latiguillos suelen hacerse con cable flexible y los conectores adecuados para él.

1. **Corta el cable** a la longitud que quieras, con corte limpio y recto.
2. **Pela la cubierta** unos 2 o 3 cm. No cortes los hilos de dentro: gira el pelacables alrededor del cable, sin apretar de más.
3. **Separa los 4 pares y destrénzalos** lo justo. Elimina el hilo o cordón de tracción que pueda haber.
4. **Ordena los hilos** según la norma (por ejemplo, T568B), de izquierda a derecha, y alísalos con los dedos.
5. **Corta a ras** todos los hilos a la vez, de manera que sobresalgan unos 12 mm desde el borde de la cubierta.
6. **Introduce los hilos** en el conector con los contactos hacia arriba, empujando hasta el fondo. Mira el extremo: se ven los **ocho extremos de cobre al fondo** y la cubierta entra en el conector pasada la zona de sujeción.
7. **Crimpa** con la crimpadora, apretando firme hasta el final.
8. **Haz el otro extremo** con la misma norma (directo) o con la contraria (cruzado).
9. **Comprueba con el tester** y compara el orden de las luces con el esperado.

::: aviso
**Revisa el orden antes de crimpar.** Un conector crimpado no se puede reutilizar: si te equivocas, se corta y se hace de nuevo.
:::

::: tip
Los fallos más habituales: hilos que no llegan al fondo, cubierta que no entra en el conector (el cable se suelta al tirar de él), corte irregular y par azul mal colocado en los pines 4 y 5.
:::

## Hazlo tú

Trabajad con un cable de unos 30 a 50 cm por persona. Anota en cada ejercicio qué mostró el tester.

### 14. La norma de memoria

Sin mirar la tabla, escribe el orden de los 8 hilos de T568A, del pin 1 al pin 8. Después comprueba con la tabla.

:::pregunta[Solución]
blanco-verde, verde, blanco-naranja, azul, blanco-azul, naranja, blanco-marrón, marrón.

Truco: T568A es T568B con los pares naranja y verde cambiados de sitio. Pines 4, 5, 7 y 8 sin tocar.
:::

### 15. Un latiguillo directo

Fabrica un latiguillo con T568B en los dos extremos y compruébalo con el tester.

:::pregunta[Solución]
Sigue la guía con T568B en los dos extremos. El tester debe encender las luces **1 2 3 4 5 6 7 8** en el extremo remoto, en el mismo orden que en el principal. Si una no se enciende, revisa el extremo donde ese hilo no llegó al fondo y rehaz el conector.
:::

### 16. Un latiguillo cruzado

Fabrica un latiguillo cruzado: T568A en un extremo y T568B en el otro. Antes de probarlo, escribe qué orden de luces esperas.

:::pregunta[Solución]
El tester debe mostrar **3 6 1 4 5 2 7 8** en el extremo remoto. Si sale 1 a 8, un extremo tiene la norma equivocada.
:::

### 17. Diagnóstico

Te entregan un latiguillo que «no va» y no sabes quién lo hizo. Con el tester, la luz del pin 5 no se enciende; el resto, sí.

Escribe qué mirarías primero, qué harías después y cómo comprobarías el arreglo.

:::pregunta[Solución]
Orden razonable: 1) mirar los dos conectores a contraluz, para ver si los ocho hilos llegan al fondo y si el del pin 5 (blanco-azul) está más corto o mal puesto; 2) cortar el extremo defectuoso, pelar de nuevo y rehacerlo con la norma; 3) volver a probar con el tester y comprobar que las ocho luces salen en orden.
:::
