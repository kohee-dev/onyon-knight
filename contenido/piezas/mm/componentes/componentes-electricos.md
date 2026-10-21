---
titulo: "Componentes eléctricos y electrónicos"
licencia: CC-BY-NC-SA-4.0
---

En este tema aprenderemos a **reconocer componentes, explicar para qué sirven y elegir las herramientas adecuadas para trabajar con ellos de forma segura**. Relacionaremos lo aprendido con cables, fuentes de alimentación, placas y otros elementos de los equipos informáticos.

::: nota
Este documento es un **esquema inicial de contenidos**. Las actividades comenzarán con simulaciones en Tinkercad. Las prácticas con componentes reales se concretarán cuando conozcamos el material disponible en el centro.
:::

# 1. Conceptos de electricidad

La electricidad está presente en muchas actividades cotidianas: encender una lámpara, cargar un móvil, utilizar un ordenador o conservar alimentos en un frigorífico.

Para trabajar con equipos informáticos, necesitamos comprender algunas ideas básicas: **de dónde procede la energía eléctrica, cómo circula la corriente y qué magnitudes utilizamos para describirla**.

## 1.1. La electricidad en nuestra vida cotidiana

La electricidad está relacionada con la presencia y el movimiento de **cargas eléctricas**. Podemos observar sus efectos cuando una lámpara emite luz, un motor gira o una resistencia produce calor.

Los aparatos eléctricos utilizan energía eléctrica y la transforman en otras formas de energía:

| Aparato | Transformación que podemos observar |
| --- | --- |
| Lámpara | Produce luz y también calor. |
| Ventilador | Produce movimiento y también calor y sonido. |
| Calefactor | Produce calor. |
| Altavoz | Produce sonido. |

### ¿Cómo se obtiene la energía eléctrica?

La energía eléctrica se obtiene **transformando otras formas de energía**. Según el sistema empleado, podemos aprovechar el movimiento del agua o del viento, la luz solar o la energía de determinados combustibles.

| Instalación | ¿Cómo obtiene energía eléctrica? |
| --- | --- |
| **Central hidroeléctrica** | El agua mueve una turbina conectada a un generador. |
| **Aerogenerador** | El viento mueve las palas y acciona un generador. |
| **Central térmica** | El calor permite producir movimiento que acciona un generador. |
| **Central nuclear** | La energía liberada en las reacciones nucleares produce calor, utilizado para accionar turbinas y generadores. |
| **Panel solar fotovoltaico** | Transforma la energía de la luz directamente en energía eléctrica. |

Una **pila o batería** también puede proporcionar energía eléctrica mediante procesos químicos.

::: nota
**La energía no aparece de la nada: se transforma.** Una batería recargable almacena energía mediante cambios químicos durante la carga y proporciona energía eléctrica durante su utilización.
:::

### ¿Cómo llega hasta los edificios?

En un recorrido simplificado, la energía pasa por estas etapas:

**Generación → transporte → distribución → instalación del edificio → aparatos.**

1. **Generación:** se obtiene energía eléctrica en centrales y otras instalaciones.
2. **Transporte:** se lleva a grandes distancias mediante líneas de alta tensión. Utilizar tensiones elevadas permite reducir las pérdidas durante el transporte.
3. **Distribución:** subestaciones y centros de transformación adaptan la tensión para acercar el suministro a sus lugares de uso.
4. **Instalación del edificio:** la energía llega a los circuitos que alimentan enchufes, iluminación y otros servicios.

::: tip
El ordenador del aula recibe energía a través de un enchufe. Su fuente de alimentación la adapta para proporcionar las tensiones que necesitan sus componentes internos.
:::

## 1.2. La carga eléctrica

La materia está formada por átomos. Para comprender la electricidad nos interesan tres de sus partículas:

- **Protones:** tienen carga positiva.
- **Electrones:** tienen carga negativa.
- **Neutrones:** no tienen carga eléctrica.

Cuando un cuerpo tiene equilibradas sus cargas positivas y negativas, es **eléctricamente neutro**. Si gana o pierde electrones, puede quedar cargado:

- Si **gana electrones**, queda con carga negativa.
- Si **pierde electrones**, queda con carga positiva.

Las cargas interactúan entre sí:

- **Las cargas del mismo signo se repelen.**
- **Las cargas de distinto signo se atraen.**

### Electricidad estática

La **electricidad estática** aparece cuando se acumula un desequilibrio de cargas en un cuerpo.

Por ejemplo, al frotar un globo con determinados tejidos pueden transferirse electrones entre los materiales. El globo cargado puede atraer pequeños trozos de papel.

::: nota
Una descarga electrostática puede afectar a componentes electrónicos sensibles, aunque una persona apenas la perciba. Por eso aprenderemos a manipular las placas y otros componentes con las precauciones adecuadas.
:::

## 1.3. La corriente eléctrica y los materiales

La **corriente eléctrica** es el movimiento ordenado de cargas eléctricas.

En los conductores metálicos, como los cables de cobre, las cargas móviles son los **electrones**. Para mantener una corriente en un circuito sencillo necesitamos una fuente que establezca una diferencia de potencial y un camino conductor cerrado.

### Sentido convencional y movimiento de electrones

En los esquemas utilizamos el **sentido convencional de la corriente**. En el circuito exterior de una pila, se representa desde el polo positivo hacia el negativo.

En un conductor metálico, los electrones se desplazan en sentido contrario: del polo negativo hacia el positivo.

| Sentido | En el circuito exterior de una pila |
| --- | --- |
| **Convencional** | Del polo positivo al negativo. |
| **Movimiento de electrones** | Del polo negativo al positivo. |

::: aviso
No son dos corrientes diferentes. Son dos formas de describir el sentido: la convencional se estableció tomando como referencia cargas positivas. En nuestros esquemas utilizaremos ese sentido, salvo que indiquemos expresamente el movimiento de electrones.
:::

### Conductores, aislantes y semiconductores

Los materiales no permiten el movimiento de cargas con la misma facilidad.

| Tipo de material | Comportamiento básico | Ejemplos |
| --- | --- | --- |
| **Conductor** | Facilita el paso de corriente. | Cobre y aluminio. |
| **Aislante** | Dificulta mucho el paso de corriente en las condiciones para las que está previsto. | Plásticos utilizados para recubrir cables. |
| **Semiconductor** | Su comportamiento eléctrico puede controlarse modificando su composición o ciertas condiciones. | Silicio. |

::: tip
Un cable combina materiales con funciones diferentes: el metal interior conduce la corriente y el recubrimiento aislante ayuda a evitar contactos y conexiones no deseadas.
:::

Los semiconductores se utilizan para fabricar componentes como diodos, transistores y circuitos integrados. Los estudiaremos más adelante.

## 1.4. El circuito eléctrico

Un **circuito eléctrico** es un conjunto de elementos conectados que permite utilizar la energía eléctrica. En un montaje sencillo, la corriente necesita un recorrido cerrado que conecte los terminales de la fuente a través de los componentes.

### Elementos de un circuito

| Elemento | Función | Ejemplos |
| --- | --- | --- |
| **Generador o fuente** | Proporciona energía eléctrica y mantiene una tensión. | Pila o fuente de alimentación. |
| **Receptor** | Transforma la energía eléctrica. | Lámpara, motor o zumbador. |
| **Conductor** | Conecta los elementos y permite el paso de corriente. | Cable de cobre. |
| **Elemento de control** | Permite modificar el funcionamiento del circuito. | Interruptor o pulsador. |
| **Elemento de protección** | Ayuda a limitar las consecuencias de determinadas situaciones anómalas. | Fusible. |

### Circuito abierto y cerrado

Un circuito está **cerrado** cuando existe un recorrido conductor completo. En un montaje correctamente conectado, puede circular corriente por ese recorrido.

Está **abierto** cuando el camino está interrumpido. Por ejemplo, un interruptor abierto impide el paso de corriente por esa rama.

::: tip
En un circuito con una pila, un interruptor y una lámpara, cerrar el interruptor completa el recorrido y permite encender la lámpara. Abrirlo interrumpe la corriente y la lámpara se apaga.
:::

::: aviso
**Circuito abierto no significa ausencia de tensión.** Puede existir tensión entre dos puntos aunque no esté circulando corriente.
:::

### Conexiones en serie y paralelo

En una conexión **en serie**, los componentes se colocan uno después de otro en un mismo recorrido. La corriente que pasa por ellos es la misma. Si se interrumpe ese recorrido, deja de circular corriente por todos sus elementos.

En una conexión **en paralelo**, los componentes se distribuyen en ramas conectadas entre los mismos dos puntos. Las ramas tienen la misma tensión y la corriente se reparte entre ellas. Si se abre una rama, las demás pueden seguir funcionando.

| Conexión | Idea principal |
| --- | --- |
| **Serie** | Un único recorrido para la corriente. |
| **Paralelo** | Varios recorridos o ramas. |

::: nota
Un **cortocircuito** es una conexión de resistencia muy baja que puede permitir una corriente excesiva. No debemos unir directamente los terminales de una pila o fuente mediante un cable.
:::

## 1.5. Tensión, intensidad y resistencia

Para describir un circuito utilizamos tres magnitudes fundamentales:

| Magnitud | Qué describe | Unidad |
| --- | --- | --- |
| **Tensión** | La diferencia de potencial eléctrico entre dos puntos. | Voltio, **V**. |
| **Intensidad** | La cantidad de carga que atraviesa una sección del circuito por unidad de tiempo. | Amperio, **A**. |
| **Resistencia** | La oposición al paso de corriente. | Ohmio, **Ω**. |

### Tensión

La **tensión**, también llamada voltaje, se establece entre dos puntos. Podemos imaginarla como un «impulso» que favorece el movimiento de las cargas cuando hay un camino cerrado.

Una pila marcada con `1,5 V` indica su tensión nominal entre terminales.

### Intensidad

La **intensidad de corriente** indica cuánta carga pasa por un punto del circuito en un tiempo determinado.

Para corrientes pequeñas utilizamos frecuentemente el **miliamperio**:

**1 A = 1000 mA**

Por ejemplo, `0,02 A` equivale a `20 mA`.

### Resistencia

La **resistencia** dificulta el paso de corriente. Si mantenemos la misma tensión, una resistencia mayor permite una corriente menor.

La resistencia depende del material y de características como su longitud, sección y temperatura.

### Ley de Ohm

En una resistencia que cumple la ley de Ohm, la tensión, la intensidad y la resistencia se relacionan así:

**V = I · R**

Donde:

- **V** es la tensión en voltios.
- **I** es la intensidad en amperios.
- **R** es la resistencia en ohmios.

Podemos reorganizar la expresión según lo que necesitemos calcular:

| Queremos calcular… | Utilizamos… |
| --- | --- |
| Tensión | **V = I · R** |
| Intensidad | **I = V / R** |
| Resistencia | **R = V / I** |

### Ejemplo guiado

Conectamos una resistencia de **1000 Ω** a una fuente de **5 V**. ¿Qué corriente circula?

1. Anotamos los datos: `V = 5 V` y `R = 1000 Ω`.
2. Elegimos la fórmula: `I = V / R`.
3. Sustituimos: `I = 5 / 1000`.
4. Calculamos: `I = 0,005 A`.
5. Expresamos el resultado: **5 mA**.

Si cambiamos la resistencia por otra de **2000 Ω**, manteniendo los 5 V:

**I = 5 / 2000 = 0,0025 A = 2,5 mA**

**Al duplicar la resistencia, la corriente se reduce a la mitad.**

::: aviso
No todos los componentes se comportan como una resistencia que cumple la ley de Ohm. No aplicaremos esta relación directamente a un LED como si fuera una resistencia.
:::

## 1.6. Potencia y energía

Aunque están relacionadas, **potencia y energía no significan lo mismo**.

### Potencia eléctrica

La **potencia** indica la rapidez con la que se transforma o transfiere energía. Se mide en **vatios (W)**.

En nuestros circuitos sencillos de corriente continua:

**P = V · I**

Por ejemplo, si un dispositivo funciona a `5 V` y consume `0,2 A`:

**P = 5 · 0,2 = 1 W**

::: nota
La potencia indicada en una fuente de alimentación puede representar su capacidad máxima de suministro. No significa que el equipo consuma siempre esa cantidad.
:::

### Energía consumida

La **energía consumida** depende de la potencia y del tiempo de funcionamiento. Si la potencia se mantiene constante:

**E = P · t**

Si expresamos la potencia en vatios y el tiempo en horas, obtenemos energía en **vatios hora (Wh)**.

Una lámpara de **10 W** encendida durante **3 horas** consume:

**E = 10 · 3 = 30 Wh**

Para cantidades mayores utilizamos el **kilovatio hora (kWh)**:

**1 kWh = 1000 Wh**

Por tanto, `30 Wh` equivalen a `0,03 kWh`.

::: aviso
**W y Wh no son intercambiables.** Los vatios indican potencia; los vatios hora indican energía. Un aparato de menor potencia puede consumir más energía total si permanece encendido durante mucho más tiempo.
:::

## 1.7. Corriente continua y alterna

### Corriente continua

En la **corriente continua (CC)**, la corriente mantiene un mismo sentido. En una fuente de continua, los terminales conservan su polaridad: positivo y negativo.

Es la que encontramos en muchos circuitos alimentados con pilas o baterías. Su valor puede variar; continua no significa necesariamente constante.

### Corriente alterna

En la **corriente alterna (CA)**, el sentido de la corriente cambia periódicamente. La tensión también cambia de polaridad.

Es el tipo de suministro utilizado en la red eléctrica de los edificios.

| Característica | Corriente continua | Corriente alterna |
| --- | --- | --- |
| **Sentido de la corriente** | Se mantiene. | Cambia periódicamente. |
| **Polaridad de la fuente** | Se mantiene. | Cambia periódicamente. |
| **Ejemplo** | Circuito alimentado por una pila. | Alimentación desde la red eléctrica. |

Los cargadores y las fuentes de alimentación de muchos equipos convierten la alimentación de la red en **corriente continua con tensiones adecuadas** para sus circuitos electrónicos.

::: tip
Un portátil puede recibir energía desde su batería o desde un adaptador conectado al enchufe. El adaptador transforma la alimentación de la red para que el equipo pueda utilizarla.
:::

## Actividad inicial: reconocer y explicar un circuito

Observa en Tinkercad un montaje preparado por el docente con una pila, un interruptor y un receptor adecuado.

1. Identifica la fuente, los conductores, el receptor y el elemento de control.
2. Sigue el recorrido que conecta los dos terminales de la fuente.
3. Antes de iniciar la simulación, predice qué sucederá con el interruptor abierto.
4. Cierra el interruptor y comprueba el resultado.
5. Explica qué diferencia hay entre tener tensión y tener corriente.
6. Localiza los valores y unidades que aparecen en la fuente y los componentes.

El objetivo es **reconocer los elementos y explicar lo que ocurre**, utilizando el vocabulario básico del tema.

**Actividad inicial:** identificar los elementos de un circuito y predecir qué sucede al abrirlo o cerrarlo.

## 2. Componentes eléctricos básicos

Un circuito necesita elementos que proporcionen energía, permitan transportarla y controlen su utilización. También puede incorporar componentes que ayuden a protegerlo ante determinadas situaciones anómalas.

En este apartado aprenderemos a **reconocer los componentes eléctricos básicos, explicar su función e interpretar sus datos principales**.

### 2.1. Cables y conectores

Los **cables** permiten conectar los elementos de un circuito y transportar la corriente eléctrica.

Habitualmente están formados por:

- **Un conductor interior**, normalmente metálico, por el que circula la corriente.
- **Un aislamiento**, que recubre el conductor y evita contactos no deseados.
- En algunos cables, **una cubierta exterior** que protege el conjunto de conductores.

El aislamiento no es un elemento decorativo: forma parte de la protección del cable y de quienes lo utilizan.

Los **conectores** permiten unir y separar cables y dispositivos sin tener que realizar una conexión permanente.

::: tip
En un ordenador encontramos cables de alimentación y cables de datos. Algunos, como determinados cables USB, pueden transportar tanto alimentación como información.
:::

#### ¿Qué debemos observar?

Antes de utilizar un cable o conector, revisaremos si presenta:

- Cortes, grietas o partes del conductor expuestas.
- Conectores deformados o piezas sueltas.
- Señales de quemadura o deterioro.
- Uniones improvisadas o aislamiento dañado.

::: aviso
**No utilices un cable deteriorado ni fuerces un conector.** Si no encaja, comprueba su orientación y compatibilidad. Ante daños visibles, avisa al docente.
:::

### 2.2. Pilas y baterías

Las **pilas y baterías** proporcionan energía eléctrica mediante procesos químicos. Se utilizan cuando necesitamos alimentar un dispositivo sin mantenerlo conectado a la red eléctrica.

En el uso cotidiano llamamos **pilas** a muchas unidades pequeñas, como las utilizadas en mandos, y **baterías** a conjuntos como los de un portátil. Sin embargo, el nombre no basta para saber si pueden recargarse: debemos comprobar sus indicaciones.

Sus terminales tienen una **polaridad**:

- **Positivo**, identificado con `+`.
- **Negativo**, identificado con `−`.

Al conectarlas debemos respetar la polaridad indicada en el dispositivo.

#### Datos básicos

| Dato | ¿Qué indica? | Ejemplo |
| --- | --- | --- |
| **Tensión nominal** | La tensión de referencia que proporciona. | `1,5 V` |
| **Capacidad** | Una referencia de la carga que puede suministrar en unas condiciones determinadas. | `2000 mAh` |
| **Tipo y posibilidad de recarga** | La tecnología y las condiciones de utilización. | Recargable o no recargable. |

La capacidad ayuda a comparar la autonomía, pero **no indica por sí sola cuánto durará una batería**: también depende del consumo del aparato y de las condiciones de uso.

::: aviso
No intentes recargar una pila que no esté indicada como recargable. Tampoco unas directamente sus terminales con un conductor: provocarías un cortocircuito.
:::

### 2.3. Fuentes de alimentación

Una **fuente de alimentación** adapta la energía eléctrica para proporcionar las características que necesita un dispositivo.

Por ejemplo, el adaptador de un portátil recibe alimentación de la red y entrega una salida adecuada para el equipo. En un ordenador de sobremesa, la fuente proporciona alimentación a la placa y a otros componentes.

#### Interpretar una etiqueta sencilla

En una fuente podemos encontrar dos grupos de datos:

- **Entrada —Input—:** alimentación que necesita recibir.
- **Salida —Output—:** alimentación que puede proporcionar.

Si una salida está indicada como **`12 V CC, 2 A`**, significa que proporciona una tensión nominal de 12 voltios de corriente continua y puede suministrar hasta 2 amperios en las condiciones especificadas.

**No significa que obligue a circular siempre 2 amperios:** la corriente utilizada depende del dispositivo conectado.

::: aviso
**Que el conector encaje no demuestra que una fuente sea compatible.** También deben coincidir las características necesarias, como tensión, tipo de corriente y polaridad, y disponer de capacidad suficiente para alimentar el equipo. Utilizaremos únicamente las fuentes indicadas por el docente.
:::

### 2.4. Interruptores y pulsadores

Los **interruptores y pulsadores** son elementos de control: permiten abrir o cerrar contactos y modificar el funcionamiento de un circuito.

#### Interruptor

Un interruptor habitual **mantiene la posición seleccionada** hasta que volvemos a accionarlo.

Por ejemplo, el interruptor de una lámpara puede dejar el circuito cerrado y mantenerla encendida.

#### Pulsador

Un pulsador momentáneo **vuelve a su posición de reposo cuando dejamos de presionarlo**.

Puede ser:

- **Normalmente abierto:** en reposo mantiene el contacto abierto y lo cierra al pulsarlo.
- **Normalmente cerrado:** en reposo mantiene el contacto cerrado y lo abre al pulsarlo.

| Elemento | Comportamiento habitual | Ejemplo |
| --- | --- | --- |
| **Interruptor** | Mantiene la posición elegida. | Interruptor de una lámpara. |
| **Pulsador momentáneo** | Recupera su posición al soltarlo. | Pulsador de un timbre. |

::: tip
El botón de encendido de un ordenador puede ser un pulsador que envía una señal a la electrónica de control. Por eso, soltarlo no apaga el equipo: el circuito que recibe la señal decide cómo actuar.
:::

### 2.5. Fusibles

Un **fusible** es un elemento de protección que contiene una parte conductora diseñada para fundirse cuando una corriente excesiva se mantiene durante el tiempo suficiente, según sus características.

Al fundirse, **abre el circuito** e interrumpe el paso de corriente por esa trayectoria.

Existen diferentes formatos: algunos tienen un cuerpo de vidrio, otros de cerámica y otros utilizan una carcasa de plástico.

Entre sus datos pueden aparecer la corriente nominal, la tensión asignada y el tipo de respuesta.

::: aviso
**Un fusible fundido no se repara con un cable ni se sustituye por otro de mayor corriente para evitar que vuelva a fundirse.** Es necesario investigar la causa y utilizar el recambio especificado. Estas intervenciones se realizarán únicamente cuando estén autorizadas y supervisadas.
:::

La apariencia exterior no siempre permite saber si un fusible está en buen estado. Más adelante veremos cómo se comprueba siguiendo el procedimiento adecuado.

### 2.6. Otros elementos de protección

En las instalaciones de los edificios encontramos dispositivos de protección que también conviene reconocer.

| Elemento | Función básica |
| --- | --- |
| **Magnetotérmico** | Interrumpe el circuito ante sobreintensidades, como sobrecargas y cortocircuitos, según sus características. |
| **Diferencial** | Detecta un desequilibrio entre las corrientes que circulan por los conductores que supervisa y desconecta cuando se cumplen sus condiciones de actuación. Ese desequilibrio puede indicar una fuga. |

Para introducirlos, relacionaremos el **magnetotérmico con las sobreintensidades** y el **diferencial con las fugas de corriente**.

::: aviso
**Magnetotérmico y diferencial no cumplen la misma función.** Su presencia tampoco permite manipular una instalación con seguridad por sí sola. En este tema aprenderemos a reconocerlos; no realizaremos intervenciones en cuadros eléctricos.
:::

### 2.7. Símbolos básicos

En un esquema eléctrico, los componentes se representan mediante **símbolos**. Esto permite entender sus conexiones sin dibujar su aspecto físico.

Aprenderemos a reconocer los símbolos de:

- Pila y batería.
- Conductor y unión de conductores.
- Interruptor.
- Pulsador.
- Fusible.
- Receptor sencillo, como una lámpara.

Un mismo componente puede tener diferentes apariencias físicas y mantener la misma función en el esquema.

::: nota
**El esquema muestra las conexiones eléctricas, no necesariamente la posición física de las piezas.** Dos componentes dibujados cerca pueden estar separados en el montaje real.
:::

### Actividad inicial: reconocer y clasificar

Relaciona las fotografías y los símbolos proporcionados por el docente con el nombre y la función de cada componente.

Después, completa una tabla como esta:

| Componente | ¿Para qué sirve? | ¿Qué debemos comprobar antes de utilizarlo? |
| --- | --- | --- |
| Cable | Conectar elementos. | Estado del aislamiento y los conectores. |
| Pila | Proporcionar energía. | Tensión, polaridad y estado. |
| Interruptor | Controlar la apertura y el cierre. | Identificación y estado de sus conexiones. |
| Fusible | Proteger frente a determinadas sobreintensidades. | Tipo y características especificadas. |

Para terminar:

1. Explica la diferencia entre un interruptor y un pulsador.
2. Localiza los datos de entrada y salida en una etiqueta de fuente de alimentación.
3. Clasifica los componentes como **alimentación, conexión, control o protección**.
4. Señala qué daños visibles justificarían dejar de utilizar un componente y avisar al docente.

:::pregunta[¿Qué componente proporciona energía?]
La pila o batería, que proporciona energía eléctrica mediante procesos químicos. En el montaje de Tinkercad, esa función la cumple la fuente de alimentación.
:::

:::pregunta[¿Qué cambia al abrir el interruptor?]
Se interrumpe el recorrido conductor, por lo que el circuito queda abierto y deja de circular corriente: el LED se apaga. Al cerrarlo se completa el recorrido y el LED vuelve a encenderse.
:::

## 3. Componentes electrónicos

Los **componentes electrónicos** permiten controlar y utilizar la corriente eléctrica para realizar funciones como emitir luz, almacenar energía, amplificar señales o procesar información.

Los encontramos en placas base, fuentes de alimentación, tarjetas y muchos otros dispositivos.

En este apartado aprenderemos a **reconocerlos, explicar su función básica e interpretar algunas de sus características**, sin estudiar en detalle su funcionamiento interno.

### 3.1. Componentes pasivos y activos

Podemos establecer una primera distinción:

| Tipo | Idea básica | Ejemplos |
| --- | --- | --- |
| **Pasivos** | Pueden disipar o almacenar energía, pero no proporcionan amplificación de señales. | Resistencias, condensadores y bobinas. |
| **Activos** | Pueden controlar señales y, en circuitos adecuados, amplificarlas utilizando energía de una alimentación. | Transistores y muchos circuitos integrados. |

Los diodos los estudiaremos dentro de los **componentes semiconductores**. Su clasificación como activos o pasivos puede variar según el criterio utilizado.

::: nota
**Activo no significa que produzca energía de la nada.** Para amplificar una señal, un circuito necesita obtener energía de una fuente de alimentación.
:::

### 3.2. Resistencias

Una **resistencia** es un componente que presenta oposición al paso de corriente. Se utiliza, entre otras funciones, para limitar la corriente y establecer tensiones dentro de un circuito.

Su valor se mide en **ohmios (Ω)**. También podemos encontrar:

- **Kiloohmios:** `1 kΩ = 1000 Ω`.
- **Megaohmios:** `1 MΩ = 1 000 000 Ω`.

Las resistencias pueden tener bandas de colores o códigos impresos que indican su valor. Comenzaremos utilizando valores proporcionados por el docente.

Las resistencias fijas habituales **no tienen polaridad**: sus terminales pueden intercambiarse sin cambiar su función.

::: tip
En un circuito sencillo con un LED, colocamos una resistencia en serie para limitar la corriente. Su valor debe elegirse de acuerdo con la alimentación y las características del LED.
:::

Además del valor en ohmios, importa la **potencia que puede disipar**. Una resistencia inadecuada puede calentarse demasiado.

### 3.3. Condensadores

Un **condensador** almacena energía en un campo eléctrico. Puede cargarse y descargarse, y se utiliza en funciones como suavizar variaciones de tensión o filtrar señales.

Su capacidad se mide en **faradios (F)**, aunque normalmente encontraremos unidades más pequeñas:

- Microfaradios: **µF**.
- Nanofaradios: **nF**.
- Picofaradios: **pF**.

Algunos tienen forma cilíndrica; otros son pequeños discos o piezas rectangulares.

#### Polaridad y tensión

Hay condensadores **polarizados**, que deben conectarse respetando sus terminales, y **no polarizados**.

También tienen una tensión asignada que debemos respetar. Para identificarlos, consultaremos sus marcas y la información correspondiente.

::: aviso
**Un condensador puede conservar energía después de desconectar la alimentación.** No abriremos fuentes de alimentación ni intentaremos descargar condensadores con herramientas.
:::

### 3.4. Bobinas

Una **bobina**, o **inductor**, suele estar formada por un conductor enrollado. Al circular corriente, almacena energía en un campo magnético y se opone a los cambios de corriente.

Se utiliza, por ejemplo, en filtros y circuitos de alimentación.

Su magnitud característica es la **inductancia**, medida en **henrios (H)**. En componentes pequeños aparecen valores en milihenrios o microhenrios.

::: tip
En una placa podemos encontrar bobinas cerca de los circuitos que adaptan la alimentación de los componentes. Algunas muestran el hilo enrollado; otras están encapsuladas y no permiten verlo.
:::

Por ahora nos interesa reconocer su aspecto y recordar que **condensadores y bobinas almacenan energía de formas diferentes**.

### 3.5. Materiales semiconductores

Los **semiconductores** son materiales cuyo comportamiento eléctrico puede modificarse de forma controlada. Uno de los más utilizados es el **silicio**.

Permiten fabricar diodos, transistores y circuitos integrados.

#### Intrínsecos y extrínsecos

- **Semiconductor intrínseco:** material semiconductor sin impurezas añadidas intencionadamente para modificar su comportamiento.
- **Semiconductor extrínseco:** material al que se añaden pequeñas cantidades de determinadas impurezas mediante un proceso llamado **dopado**.

El dopado permite obtener dos tipos básicos:

| Tipo | Característica simplificada |
| --- | --- |
| **Tipo N** | Predominan los electrones como portadores móviles de carga. |
| **Tipo P** | Predominan los huecos, que se comportan como portadores positivos. |

Un **hueco** representa la ausencia de un electrón en un lugar donde podría estar. El desplazamiento de electrones entre esos lugares permite describir un movimiento de huecos.

::: aviso
**Tipo P y tipo N no significan que todo el material tenga carga positiva o negativa.** Describen qué portadores predominan. No necesitamos profundizar en su estructura para reconocer los componentes que se fabrican con ellos.
:::

### 3.6. Diodos

Un **diodo** es un componente semiconductor que, en su funcionamiento básico, permite el paso de corriente con mayor facilidad en un sentido que en el contrario.

Sus terminales se llaman:

- **Ánodo (A).**
- **Cátodo (K).**

La orientación importa. En muchos diodos, una banda en el cuerpo identifica el cátodo, aunque siempre debemos comprobar el marcado del componente.

Se utilizan en funciones como convertir corriente alterna en continua dentro de un circuito rectificador o proteger determinados circuitos.

::: nota
El diodo no es una barrera perfecta en cualquier situación. Tiene límites de corriente y tensión que debemos respetar. En los primeros montajes utilizaremos componentes y valores indicados por el docente.
:::

### 3.7. LED

Un **LED** es un diodo que emite luz cuando circula corriente por él en las condiciones adecuadas.

También tiene ánodo y cátodo. En muchos LED de dos patillas nuevos, la patilla larga corresponde al ánodo y el borde plano del encapsulado ayuda a identificar el cátodo. Estas pistas deben comprobarse, especialmente si las patillas están cortadas.

Para utilizar un LED necesitamos:

1. **Respetar su polaridad.**
2. **Limitar la corriente**, normalmente mediante una resistencia en serie en nuestros montajes.
3. **Utilizar una alimentación adecuada.**

::: aviso
**No conectes un LED directamente a una pila o fuente sin comprobar cómo se limitará la corriente.** En nuestras prácticas seguiremos un montaje con una resistencia y valores previamente seleccionados.
:::

::: tip
Los indicadores de encendido de muchos equipos utilizan LED. Su función es transformar parte de la energía eléctrica en luz para mostrar un estado.
:::

### 3.8. Transistores

Un **transistor** es un componente semiconductor que permite controlar una corriente o una señal mediante otra señal de control.

Dos aplicaciones básicas son:

- **Conmutación:** actúa como un interruptor electrónico.
- **Amplificación:** permite obtener una señal de mayor amplitud utilizando energía de la alimentación.

Existen diferentes tipos de transistores, con terminales y formas de funcionamiento distintas.

::: tip
Una señal de control puede hacer que un transistor permita o interrumpa la alimentación de una pequeña carga. Es una forma de controlar un circuito sin accionar un interruptor mecánico.
:::

En este tema nos centraremos en **identificarlo y explicar su función general**, sin calcular sus circuitos internos.

### 3.9. Circuitos integrados

Un **circuito integrado**, o **chip**, reúne numerosos elementos electrónicos y conexiones en una pequeña pieza de material semiconductor.

Puede realizar funciones sencillas, como regular una tensión, o muy complejas, como procesar instrucciones.

Encontramos circuitos integrados en:

- Memorias.
- Procesadores.
- Controladores de dispositivos.
- Circuitos de audio.
- Sistemas de alimentación.

El encapsulado protege el componente y proporciona conexiones con el exterior.

::: aviso
**Dos chips con aspecto parecido pueden tener funciones completamente diferentes.** Para identificarlos, debemos consultar su referencia y la información del fabricante.
:::

### 3.10. Reconocer componentes en una placa

Una **placa de circuito impreso** sostiene los componentes y proporciona conexiones eléctricas mediante pistas conductoras.

Al observar una placa, distinguiremos:

| Elemento | Qué debemos reconocer |
| --- | --- |
| **Componentes** | Resistencias, condensadores, bobinas, diodos y circuitos integrados. |
| **Pistas** | Caminos conductores que conectan partes del circuito. |
| **Puntos de soldadura** | Uniones eléctricas y mecánicas de los componentes. |
| **Conectores** | Puntos para unir la placa con cables u otros elementos. |

No todas las conexiones son visibles: algunas placas tienen varias capas internas.

**La actividad consistirá en localizar y clasificar**, sin desoldar componentes ni manipular placas alimentadas.

### 3.11. La protoboard

Una **protoboard** es una placa de pruebas que permite conectar componentes y cables sin soldarlos.

Sus orificios no son independientes: en su interior existen grupos conectados eléctricamente. En un modelo habitual encontramos:

- **Grupos de contactos en la zona central**, para colocar componentes.
- **Una separación central**, que mantiene aislados los grupos de ambos lados.
- **Líneas laterales de alimentación**, si el modelo las incorpora.

Antes de montar, debemos comprobar cómo están conectados sus puntos. Algunas líneas de alimentación están divididas y no tienen continuidad de un extremo al otro.

::: aviso
**Colocar dos patillas en orificios diferentes no garantiza que estén separadas eléctricamente.** Si pertenecen al mismo grupo interno, estarán conectadas.
:::

### Actividad inicial: encender y controlar un LED

En Tinkercad construiremos un circuito guiado con:

- Una fuente de alimentación.
- Una protoboard.
- Un LED.
- Una resistencia.
- Cables.
- Un interruptor.

#### Pasos

1. Identifica cada componente y explica su función.
2. Observa las conexiones internas de la protoboard.
3. Reproduce el esquema proporcionado por el docente.
4. Comprueba la polaridad del LED y el valor de la resistencia.
5. Inicia la simulación y observa el resultado.
6. Detén la simulación y añade el interruptor.
7. Comprueba qué sucede al abrirlo y cerrarlo.

::: aviso
**La simulación ayuda a comprender el circuito, pero no sustituye las instrucciones de seguridad para trabajar con material real.** Los montajes físicos se realizarán únicamente con los materiales, valores y procedimientos indicados por el docente.
:::

:::pregunta[¿Qué función cumple la resistencia?]
Presenta oposición al paso de corriente y, en este montaje, se coloca en serie con el LED para limitar la corriente.
:::

:::pregunta[¿Por qué importa la orientación del LED?]
Porque tiene ánodo y cátodo, y hay que respetar su polaridad para que funcione. La patilla larga suele ser el ánodo y el borde plano del encapsulado ayuda a identificar el cátodo, pero debe comprobarse.
:::

:::pregunta[¿Qué puntos de la protoboard están conectados entre sí?]
Los orificios de un mismo grupo interno de contactos en la zona central, y las líneas laterales de alimentación. La separación central mantiene aislados los grupos de ambos lados, y algunas líneas de alimentación están divididas y no tienen continuidad de un extremo al otro.
:::

## 4. Instrumentos de medida de magnitudes eléctricas

Para comprobar un circuito no basta con observar sus componentes. Necesitamos **medir sus magnitudes eléctricas** y comparar los resultados con los valores esperados.

Cada instrumento tiene una función:

| Instrumento | Magnitud que mide | Unidad |
| --- | --- | --- |
| **Voltímetro** | Tensión entre dos puntos. | Voltios, **V**. |
| **Amperímetro** | Intensidad de corriente. | Amperios, **A**. |
| **Ohmímetro** | Resistencia. | Ohmios, **Ω**. |

El **multímetro**, también llamado *polímetro*, reúne varias funciones en un mismo aparato. Para utilizarlo correctamente debemos seleccionar la función y conectar las puntas de acuerdo con la medida.

::: aviso
Las prácticas reales se realizarán únicamente en **circuitos de muy baja tensión preparados y supervisados por el docente**, como montajes alimentados con pilas o fuentes de laboratorio adecuadas. No mediremos enchufes ni el interior de fuentes de alimentación de ordenador.
:::

### 4.1. Partes del multímetro

En un multímetro digital encontramos estos elementos:

| Parte | Función |
| --- | --- |
| **Pantalla** | Muestra el resultado, las unidades y otras indicaciones. |
| **Selector** | Permite elegir la magnitud y, en algunos modelos, la escala. |
| **Bornes** | Conexiones donde se introducen los cables de medida. |
| **Puntas de prueba** | Permiten establecer contacto con los puntos del circuito. |

La punta negra se conecta habitualmente al borne **COM**. La punta roja se conecta al borne correspondiente a la función que vamos a utilizar.

Los nombres y límites varían entre modelos. Es frecuente encontrar un borne para tensión y resistencia, y otros para intensidad.

::: aviso
**La punta roja no se conecta siempre al mismo borne.** Antes de medir, debemos revisar las etiquetas y las instrucciones del multímetro utilizado.
:::

### 4.2. Elegir la magnitud y la escala

Antes de conectar el instrumento, debemos responder:

1. **¿Qué queremos medir?** Tensión, resistencia, continuidad o intensidad.
2. **¿Qué valor esperamos aproximadamente?**
3. **¿Qué función, bornes y escala corresponden?**

Para tensión e intensidad también debemos distinguir **corriente continua y alterna**.

Algunos multímetros seleccionan automáticamente la escala. En otros debemos elegirla manualmente. En estos últimos, utilizaremos una escala adecuada al valor esperado, siguiendo las indicaciones del docente.

::: tip
Para medir una pila de aproximadamente `1,5 V` necesitamos la función de tensión continua. No debemos seleccionar amperios ni resistencia: cada función utiliza el instrumento de forma diferente.
:::

### 4.3. Medición de tensión

La **tensión se mide entre dos puntos**. El multímetro se conecta **en paralelo** con el elemento que queremos comprobar, sin interrumpir su conexión.

Para medir una pila:

1. Conectamos las puntas en los bornes adecuados para tensión.
2. Seleccionamos tensión continua y la escala correspondiente.
3. Colocamos la punta roja en el terminal positivo y la negra en el negativo.
4. Leemos el resultado y su unidad.

Si invertimos las puntas, un multímetro digital puede mostrar un signo negativo. Este indica que la polaridad medida es contraria a la referencia de las puntas.

::: nota
**Puede existir tensión aunque no circule corriente por un receptor.** Por ejemplo, podemos medir la tensión de una pila sin conectarla a una lámpara.
:::

### 4.4. Medición de resistencia

Para medir resistencia, seleccionamos la función **Ω** y conectamos las puntas a los extremos del componente.

Esta comprobación se realiza **sin alimentación y sin energía almacenada en el circuito**. El multímetro utiliza una pequeña señal interna para efectuar la medida.

Si la resistencia permanece conectada a otros componentes, estos pueden alterar el resultado. Para medirla de forma aislada puede ser necesario desconectar uno de sus terminales, siguiendo las indicaciones del docente.

::: aviso
**No midas resistencia en un circuito alimentado.** Desconectar la alimentación tampoco garantiza que todos los componentes estén descargados.
:::

Un resultado próximo al valor indicado en la resistencia puede ser normal: los componentes tienen una **tolerancia**, es decir, un margen de variación respecto a su valor nominal.

### 4.5. Comprobación de continuidad

La función de **continuidad** ayuda a comprobar si existe un camino conductor de baja resistencia entre dos puntos. Muchos multímetros emiten un pitido cuando la resistencia está por debajo de un determinado valor.

Se utiliza, por ejemplo, para comprobar:

- Si un cable tiene continuidad entre sus extremos.
- Si un interruptor cierra sus contactos.
- Qué orificios de una protoboard están conectados internamente.

Al igual que la resistencia, se comprueba **sin alimentación y sin energía almacenada**.

::: tip
En un interruptor aislado del circuito, podemos comparar sus dos posiciones. Al cerrarlo, debería existir continuidad entre los contactos correspondientes; al abrirlo, esa conexión se interrumpe.
:::

::: aviso
**El pitido no demuestra que todo un circuito funcione correctamente.** Solo informa de una condición entre los puntos medidos, según el umbral del instrumento.
:::

### 4.6. Medición de intensidad

La intensidad indica cuánta corriente circula por una parte del circuito. Para medirla con un multímetro convencional, este debe formar parte del recorrido de la corriente: se conecta **en serie**.

El procedimiento es diferente al de tensión:

1. Desconectamos la alimentación antes de modificar el montaje.
2. Seleccionamos la función, los bornes y la escala indicados.
3. Abrimos el circuito en el punto elegido e intercalamos el instrumento.
4. El docente comprueba el montaje antes de alimentarlo.
5. Leemos el resultado.
6. Desconectamos de nuevo antes de retirar el instrumento y restaurar el circuito.

::: aviso
**No conectes el multímetro configurado para intensidad directamente entre los terminales de una pila o fuente.** Esa conexión puede provocar un cortocircuito, dañar el instrumento o causar calentamiento.
:::

Después de medir intensidad, devolveremos la punta roja al borne de tensión y resistencia, según el modelo, para evitar dejar preparada una conexión incorrecta para la siguiente medida.

### 4.7. Interpretar los resultados

Una medida debe incluir **el valor y la unidad**.

| Lectura | Interpretación |
| --- | --- |
| `1,48 V` | Tensión de 1,48 voltios. |
| `0,02 A` | Intensidad de 20 miliamperios. |
| `4,7 kΩ` | Resistencia de 4700 ohmios. |

Los símbolos de la pantalla también importan. Una indicación como `OL` puede señalar que se supera el rango o que no existe un camino conductor medible en esa función. Debemos interpretarla según el modo seleccionado y el manual del instrumento.

::: aviso
**No confundas `OL` con cero.** Una resistencia próxima a cero y un circuito abierto representan situaciones muy diferentes.
:::

### 4.8. Errores habituales

| Error | Cómo evitarlo |
| --- | --- |
| Seleccionar una magnitud incorrecta. | Decidir qué queremos medir antes de conectar. |
| Utilizar un borne inadecuado. | Revisar la posición de ambos cables. |
| Confundir continua y alterna. | Identificar el tipo de alimentación del montaje. |
| Medir resistencia o continuidad con alimentación. | Preparar el circuito sin tensión ni energía almacenada. |
| Conectar el amperímetro en paralelo. | Revisar su conexión en serie antes de alimentar. |
| Leer el número sin mirar la unidad. | Anotar siempre valor y unidad. |

### Actividad inicial: medir un circuito simulado

Después de una demostración, utilizaremos un circuito preparado en Tinkercad.

1. Identifica qué magnitud vamos a medir.
2. Predice un resultado aproximado con ayuda del docente.
3. Coloca el instrumento virtual correctamente.
4. Inicia la simulación y anota el resultado con su unidad.
5. Compara la medida con la predicción.
6. Explica por qué la conexión para medir tensión es diferente de la utilizada para medir intensidad.

Para practicar continuidad y resistencia utilizaremos una demostración o un instrumento que disponga de esas funciones.

**Antes de cada medida: magnitud, bornes, conexión y estado del circuito.**

## 5. Herramientas de montaje de componentes y periféricos informáticos

Para montar o desmontar un equipo necesitamos **elegir la herramienta adecuada para cada tarea**. Una herramienta incorrecta puede dañar tornillos, conectores o componentes, aunque aparentemente permita realizar el trabajo.

En este apartado aprenderemos a reconocer las herramientas más habituales y explicar para qué se utilizan.

### 5.1. Destornilladores

Los **destornilladores** permiten apretar y aflojar tornillos. Debemos elegir una punta que coincida con la forma y el tamaño de su cabeza.

| Tipo | Cómo reconocerlo |
| --- | --- |
| **Plano** | Punta recta para tornillos con una ranura. |
| **Phillips** | Punta en cruz. |
| **Torx** | Punta con forma de estrella de seis lóbulos. |
| **De precisión** | Tamaño pequeño para trabajar con tornillos y piezas reducidos. Pueden tener distintas puntas. |

::: aviso
**No todos los tornillos en cruz utilizan la misma punta.** Si la herramienta no encaja correctamente, no debemos forzarla: podemos deteriorar la cabeza y dificultar su extracción.
:::

El apriete debe ser suficiente para sujetar la pieza, sin aplicar una fuerza excesiva que dañe la rosca o el componente.

### 5.2. Alicates y pinzas

Los **alicates** permiten sujetar, doblar o cortar determinados materiales, dependiendo del modelo.

- **Alicates de punta:** ayudan a sujetar piezas pequeñas.
- **Alicates de corte:** permiten cortar materiales adecuados a su capacidad, como ciertos conductores.
- **Pinzas de precisión:** facilitan colocar o recoger elementos pequeños.

::: tip
Para recoger un tornillo suelto en un equipo desconectado, unas pinzas pueden facilitar el acceso. No deben utilizarse para hacer palanca sobre una placa o forzar un conector.
:::

### 5.3. Pelacables y crimpadoras

Un **pelacables** retira parte del aislamiento de un conductor sin dañar su interior. Debe ajustarse al tamaño y tipo de cable.

Una **crimpadora** fija determinados terminales o conectores mediante presión. La herramienta debe ser compatible con el conector y el cable utilizados.

::: nota
**Pelar y crimpar son tareas diferentes.** Pelar permite retirar aislamiento; crimpar permite realizar una unión mecánica y eléctrica mediante un terminal o conector adecuado.
:::

### 5.4. Herramientas y materiales de limpieza

La limpieza debe adaptarse al componente y a las instrucciones del fabricante. Podemos encontrar:

| Material o herramienta | Uso orientativo |
| --- | --- |
| **Paño suave sin pelusa** | Limpiar superficies compatibles. |
| **Brocha adecuada para electrónica** | Retirar polvo de zonas accesibles siguiendo el procedimiento indicado. |
| **Productos específicos** | Limpiar determinadas superficies o contactos cuando estén autorizados para ese uso. |

No todos los productos domésticos son adecuados para pantallas, placas o conectores.

::: aviso
No apliques líquidos directamente sobre el equipo ni utilices un producto sin comprobar su compatibilidad. La limpieza se realizará con el equipo preparado según las indicaciones del docente y del fabricante.
:::

### 5.5. Organización del material

Organizar las piezas facilita el montaje posterior y reduce errores.

Podemos utilizar:

- **Bandejas o recipientes:** para separar tornillos y piezas pequeñas.
- **Etiquetas:** para identificar cables, componentes y procedencia.
- **Fotografías o anotaciones:** para registrar conexiones y orden de desmontaje.
- **Organizadores de herramientas:** para mantener despejada la zona de trabajo.

::: tip
Dos tornillos pueden parecer iguales y tener distinta longitud. Guardarlos según su ubicación evita colocar uno demasiado largo en un punto donde pueda dañar el equipo.
:::

### 5.6. Protección frente a electricidad estática

Las descargas electrostáticas pueden dañar componentes electrónicos sensibles. Para reducir este riesgo se utilizan medios como:

- **Pulseras y superficies de trabajo ESD**, instaladas según el procedimiento del puesto.
- **Embalajes de protección electrostática**, para guardar y transportar componentes.

**ESD** hace referencia a las descargas electrostáticas.

::: aviso
Los medios ESD protegen los componentes frente a electricidad estática. **No son equipos de protección contra una descarga de la red eléctrica.** Su uso debe seguir las instrucciones del docente.
:::

### 5.7. Conservación de las herramientas

Antes y después de utilizarlas debemos comprobar su estado:

- Puntas y filos sin daños que impidan trabajar correctamente.
- Mangos y uniones firmes.
- Ausencia de suciedad que dificulte su uso.
- Almacenamiento ordenado y adecuado.

Una herramienta deteriorada debe retirarse del uso y comunicarse al docente.

### Actividad inicial: elegir la herramienta

Indica qué herramienta o material utilizarías en cada situación y explica por qué:

| Tarea | ¿Qué elegirías? |
| --- | --- |
| Retirar un tornillo Torx de una carcasa. | |
| Sujetar una pieza pequeña sin utilizar los dedos. | |
| Retirar el aislamiento del extremo de un cable. | |
| Fijar un conector mediante presión. | |
| Separar los tornillos de distintas partes de un equipo. | |
| Guardar una placa sensible a descargas electrostáticas. | |

Antes de responder, comprueba **qué operación necesitas realizar y qué características tiene la pieza**.

## 6. Seguridad en el uso de herramientas y componentes

Trabajar con seguridad consiste en **preparar la tarea, utilizar correctamente las herramientas y cuidar los componentes**. Estas medidas ayudan a prevenir lesiones, daños en el equipo y errores durante el montaje.

Si una operación requiere demasiada fuerza o no sabemos cómo realizarla, debemos detenernos y consultar al docente.

### 6.1. Preparar el puesto de trabajo

Antes de comenzar, comprobaremos que disponemos de:

- **Una mesa estable y despejada**, con espacio para el equipo y las piezas.
- **Iluminación suficiente**, para distinguir tornillos, conexiones y etiquetas.
- **Herramientas y materiales organizados**, sin objetos que dificulten los movimientos.
- **Una zona de paso libre**, sin cables ni mochilas que puedan provocar tropiezos.

Los alimentos y las bebidas deben permanecer fuera del puesto de montaje.

::: tip
Antes de abrir un equipo, prepara una bandeja para los tornillos y un lugar donde apoyar las piezas. Evitarás tener que buscar espacio mientras sostienes un componente.
:::

### 6.2. Revisar y utilizar las herramientas

Una herramienta debe ser adecuada para la tarea y encontrarse en buen estado. Antes de utilizarla, revisaremos sus puntas, mangos y uniones.

Durante el trabajo:

- Utilizaremos la punta y el tamaño adecuados para cada tornillo.
- Mantendremos las manos fuera de la trayectoria de corte.
- Apoyaremos las piezas de forma estable.
- Evitaremos utilizar herramientas para funciones distintas de las previstas.
- Mantendremos una postura cómoda, sin esfuerzos innecesarios.

::: aviso
**No utilices un destornillador como palanca ni una herramienta dañada para terminar más rápido.** Puede resbalar, romper una pieza o provocar una lesión.
:::

### 6.3. Manipular placas y componentes

Los componentes informáticos pueden tener contactos delicados, patillas pequeñas y piezas que se dañan al doblarlas o presionarlas.

Para manipularlos:

- Sujetaremos las placas **por sus bordes**, evitando tocar contactos y componentes.
- No apoyaremos piezas pesadas ni herramientas sobre ellas.
- Utilizaremos una superficie adecuada y estable.
- Mantendremos los componentes protegidos mientras no los necesitemos.

Al desmontar, observaremos cómo está fijada cada pieza antes de intentar retirarla.

::: nota
Algunas carcasas y piezas metálicas presentan bordes que pueden cortar. Debemos revisar dónde colocamos las manos y seguir el procedimiento indicado.
:::

### 6.4. Conectar y desconectar sin forzar

Muchos conectores tienen una orientación concreta o incorporan pestañas de retención.

Antes de desconectarlos debemos localizar su sistema de sujeción. Para retirarlos, sujetaremos el **cuerpo del conector**, evitando tirar de los cables.

Al conectarlos, comprobaremos su orientación y alineación.

::: aviso
**Si una pieza no entra con la presión prevista, no sigas apretando.** Puede estar mal orientada, tener una pestaña bloqueada o no ser compatible.
:::

### 6.5. Evitar daños por electricidad estática

Una persona puede acumular carga electrostática al moverse o rozar determinados materiales. Al tocar un componente, esa carga puede descargarse y dañarlo, aunque no se perciba una chispa.

Para reducir este riesgo:

- Prepararemos el puesto con los medios ESD indicados.
- Manipularemos los componentes lo imprescindible.
- Mantendremos las piezas sensibles en embalajes adecuados cuando no se utilicen.
- Seguiremos las instrucciones de uso de pulseras y superficies ESD.

::: aviso
**Una bolsa de plástico corriente no sustituye a un embalaje de protección electrostática.** Utilizaremos el material destinado a proteger componentes electrónicos.
:::

### 6.6. Organizar el desmontaje y el montaje

El orden también forma parte de la seguridad. Una pieza suelta dentro del equipo o un tornillo colocado en un lugar incorrecto pueden provocar daños.

Durante el desmontaje:

1. Registraremos la posición de cables y componentes mediante fotografías o anotaciones.
2. Separaremos los tornillos según su procedencia.
3. Identificaremos las piezas que puedan confundirse.
4. Mantendremos las herramientas apartadas de los componentes desmontados.

Antes de cerrar el equipo, revisaremos que no queden tornillos ni herramientas en su interior y que los cables no estén atrapados ni interfieran con ventiladores.

::: tip
No confíes únicamente en recordar dónde iba cada tornillo. Una bandeja dividida y unas etiquetas facilitan el montaje y permiten comprobar si falta alguna pieza.
:::

### 6.7. Almacenamiento y residuos

Al finalizar, debemos dejar el puesto preparado para la siguiente tarea:

- Guardar las herramientas en su lugar.
- Proteger y etiquetar los componentes que se conservarán.
- Separar las piezas averiadas para evitar que se reutilicen por error.
- Recoger recortes de cable, embalajes y otros restos.
- Depositar pilas, baterías y residuos electrónicos en los recipientes o puntos de recogida establecidos por el centro.

Los componentes dañados o de estado desconocido deben comunicarse al docente antes de almacenarlos o desecharlos.

### Actividad inicial: detectar errores en un puesto de trabajo

Observa una imagen preparada por el docente e identifica situaciones como estas:

- Una bebida junto a una placa.
- Tornillos mezclados o sueltos sobre el equipo.
- Una herramienta deteriorada.
- Un cable que cruza una zona de paso.
- Una placa apoyada de forma inestable.
- Una persona tirando del cable para retirar un conector.

Completa una tabla:

| Situación observada | ¿Qué podría ocurrir? | ¿Cómo la corregirías? |
| --- | --- | --- |
| Bebida junto a una placa. | Un derrame puede dañar el equipo. | Retirar la bebida del puesto. |
| | | |
| | | |

Después, revisa tu propia mesa y explica **qué debes cambiar antes de comenzar a trabajar**.

## 7. Seguridad eléctrica

La electricidad permite utilizar nuestros equipos, pero también puede provocar lesiones, quemaduras y daños materiales si una instalación o un aparato se utiliza incorrectamente.

Para trabajar con seguridad debemos **reconocer los riesgos, respetar los límites de la actividad y detenernos ante cualquier anomalía**.

::: aviso
Estas normas se explicarán **antes de las prácticas**, aunque aparezcan al final del tema. No realizaremos mediciones en enchufes, intervenciones en cuadros eléctricos ni abriremos fuentes de alimentación de ordenador.
:::

### 7.1. Principales riesgos eléctricos

| Riesgo | ¿En qué consiste? | Ejemplo |
| --- | --- | --- |
| **Contacto directo** | Tocar una parte conductora que está normalmente en tensión. | Tocar el conductor expuesto de un cable alimentado. |
| **Contacto indirecto** | Tocar una parte que ha quedado en tensión por un fallo. | Una carcasa metálica afectada por un defecto de aislamiento. |
| **Cortocircuito** | Crear una conexión de resistencia muy baja entre puntos que no deberían estar unidos de esa forma. | Unir directamente los terminales de una pila con un cable. |
| **Sobrecarga** | Exigir a un elemento más corriente de la que puede soportar en las condiciones previstas. | Conectar demasiada carga a una regleta. |

Los cortocircuitos y las sobrecargas pueden provocar calentamiento, deterioro del aislamiento e incendios.

::: aviso
**Que un equipo funcione no demuestra que sea seguro.** Un cable deteriorado puede seguir alimentándolo y, al mismo tiempo, presentar un riesgo.
:::

### 7.2. Apagar no es lo mismo que desconectar

Apagar un equipo mediante su botón o desde el sistema operativo no garantiza que todas sus partes queden sin alimentación.

Antes de una intervención autorizada, seguiremos el procedimiento indicado por el docente:

1. **Detener el funcionamiento del equipo.**
2. **Desconectar las fuentes de alimentación correspondientes.**
3. **Evitar que alguien vuelva a conectarlo durante el trabajo.**
4. **Esperar las comprobaciones e indicaciones necesarias antes de manipularlo.**

Algunos equipos también pueden recibir energía de una batería o de otros dispositivos conectados.

::: aviso
**No comprobaremos la ausencia de tensión tocando conductores ni utilizando herramientas improvisadas.** Las comprobaciones eléctricas que correspondan deben realizarlas las personas preparadas para ello.
:::

### 7.3. Energía almacenada

Desconectar un aparato no elimina necesariamente toda la energía que contiene.

- **Las baterías** siguen siendo una fuente de energía aunque el equipo esté desenchufado.
- **Los condensadores** pueden conservar carga después de desconectar la alimentación.

Por eso, no debemos suponer que esperar unos minutos permite manipular cualquier componente.

::: aviso
**No abriremos fuentes de alimentación, cargadores ni otros equipos con partes internas peligrosas.** Tampoco intentaremos descargar condensadores uniendo sus terminales con un destornillador o un cable.
:::

### 7.4. Puesta a tierra y dispositivos de protección

Las instalaciones incorporan medidas que ayudan a reducir los riesgos. Cada una cumple una función:

| Medida o dispositivo | Función general |
| --- | --- |
| **Aislamiento y envolventes** | Dificultan el contacto con las partes en tensión. |
| **Puesta a tierra de protección** | Conecta determinadas partes metálicas a un sistema de protección que, junto con los dispositivos adecuados, ayuda a actuar ante fallos. |
| **Fusible o magnetotérmico** | Interrumpe el circuito ante determinadas sobreintensidades. |
| **Diferencial** | Detecta determinados desequilibrios de corriente que pueden indicar una fuga y desconecta según sus características. |

**Estas medidas se complementan.** Un diferencial no sustituye a la protección frente a sobrecargas, y un magnetotérmico no protege frente a todas las situaciones de contacto eléctrico.

::: aviso
No anularemos protecciones, retiraremos conexiones de tierra ni sustituiremos fusibles por cables. Si una protección actúa, debemos avisar y averiguar la causa; no reconectaremos repetidamente para intentar que el equipo siga funcionando.
:::

### 7.5. Qué podemos hacer en el aula

Las tareas deben ajustarse a nuestra formación y al material preparado.

| Podemos realizar con autorización y supervisión | No realizaremos |
| --- | --- |
| Simulaciones de circuitos. | Pruebas en enchufes de la red eléctrica. |
| Montajes de muy baja tensión preparados por el docente. | Modificaciones de instalaciones o cuadros eléctricos. |
| Mediciones guiadas en esos montajes. | Apertura o reparación interna de fuentes de alimentación. |
| Inspección visual de cables y componentes accesibles. | Reparaciones improvisadas de cables de red dañados. |
| Montaje de componentes informáticos siguiendo el procedimiento de desconexión. | Manipulación de elementos cuya seguridad no se haya comprobado. |

::: nota
**Una tensión reducida no elimina todos los riesgos.** Una pila o batería puede suministrar corriente suficiente para calentar un conductor si provocamos un cortocircuito.
:::

### 7.6. Cuándo detener la tarea

Debemos parar y avisar al docente si observamos:

- Cables cortados, aislamiento deteriorado o conductores expuestos.
- Olor a quemado, humo o chispas.
- Calentamiento anómalo.
- Líquidos cerca de conexiones eléctricas.
- Baterías hinchadas, dañadas o con fugas.
- Actuación de una protección o comportamiento inesperado del equipo.

No tocaremos un componente para comprobar si quema ni intentaremos localizar una avería con el equipo alimentado.

### 7.7. Actuación ante un incidente

Ante una situación peligrosa:

1. **Detén la actividad y avisa inmediatamente al docente.**
2. **Mantén la distancia e impide que otras personas se acerquen.**
3. **No toques a una persona que pueda seguir en contacto con una fuente eléctrica ni intentes separarla con objetos improvisados.**
4. **Sigue el protocolo de emergencia del centro.** Ante una emergencia, solicita ayuda al **112**.

La desconexión de emergencia debe realizarse únicamente si puede hacerse sin exponerse al peligro. No utilizaremos agua sobre equipos que puedan seguir en tensión.

### Actividad: reconocer y decidir

Para cada situación, explica qué riesgo observas y cómo actuarías:

| Situación | ¿Qué harías? |
| --- | --- |
| Un cable funciona, pero tiene el aislamiento roto. | |
| Una fuente de alimentación está desenchufada y alguien propone abrirla. | |
| Una regleta presenta olor a quemado. | |
| Una batería está hinchada. | |
| Un compañero quiere medir un enchufe con el multímetro del aula. | |

La respuesta debe indicar **qué tarea debemos detener, qué no debemos tocar y a quién avisar**.

### Referencias

- [INSST: riesgo eléctrico](https://www.insst.es/materias/riesgos/seguridad-en-el-trabajo/riesgo-electrico).
- [INSST: guía técnica para la prevención del riesgo eléctrico](https://www.insst.es/documentacion/catalogo-de-publicaciones/guia-tecnica-para-la-evaluacion-y-prevencion-de-los-riesgos-relacionados-con-la-proteccion-frente-al-riesgo-electrico).
