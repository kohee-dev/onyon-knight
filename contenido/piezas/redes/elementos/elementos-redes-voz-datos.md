---
titulo: "Elementos de las redes de voz y datos"
licencia: CC-BY-NC-SA-4.0
---

Para conectar los ordenadores de un aula necesitamos algo más que equipos y cables. También debemos organizar el recorrido del cableado, preparar puntos de conexión y elegir elementos que permitan sujetar y proteger la instalación.

En este tema aprenderemos a **reconocer los elementos de una red, explicar su función y seleccionar materiales para una instalación sencilla**.

## 1. Introducción a las redes

Imagina que tienes una fotografía en el móvil y quieres enviarla a otra persona. O que varias personas necesitan acceder a los mismos documentos desde ordenadores diferentes. Para hacerlo, sus dispositivos necesitan una forma de comunicarse.

Una **red** permite que varios dispositivos se comuniquen y compartan información o recursos. Los dispositivos pueden ser ordenadores, móviles, impresoras, servidores y otros equipos.

### ¿Cómo se conectan los dispositivos?

Podemos distinguir dos formas habituales:

- **Mediante cables:** los dispositivos se conectan utilizando un medio físico, como un cable de red.
- **Mediante conexiones inalámbricas:** intercambian información mediante señales que viajan sin un cable entre ellos, como ocurre con Wi-Fi.

Una misma red puede combinar ambas formas de conexión.

::: tip
Imagina una vivienda con un ordenador conectado al router mediante cable y un móvil conectado por Wi-Fi. Aunque utilizan conexiones diferentes, ambos pueden formar parte de la misma red local.
:::

### ¿Para qué sirve una red?

| Uso | Ejemplo |
| --- | --- |
| **Compartir información** | Acceder desde dos ordenadores a documentos guardados en un equipo que los comparte. |
| **Compartir dispositivos** | Enviar documentos desde varios equipos a una impresora de red. |
| **Acceder a servicios** | Utilizar una aplicación que funciona en otro equipo. |
| **Transmitir voz y vídeo** | Realizar una llamada o una videollamada mediante una aplicación. |

Un **recurso compartido** es un elemento que se pone a disposición de otros dispositivos a través de la red. Puede ser una carpeta, una impresora o un servicio.

Compartir no significa permitir el acceso a cualquiera: pueden ser necesarios una cuenta y los permisos correspondientes.

### ¿Qué es una red local?

Una **red local**, también llamada **LAN**, conecta dispositivos dentro de un entorno limitado, como una vivienda, una oficina o un edificio.

Por ejemplo, una pequeña oficina podría tener tres ordenadores y una impresora conectados a la misma red. Los trabajadores podrían enviar documentos a esa impresora sin conectarla directamente a cada ordenador.

::: nota
Utilizaremos situaciones imaginadas, fotografías y esquemas para reconocer estos elementos. No es necesario disponer físicamente de esa instalación para comprender qué función cumple cada dispositivo.
:::

### ¿Una red necesita Internet?

**No todas las comunicaciones de una red necesitan acceso a Internet.** Los dispositivos pueden utilizar recursos locales si están conectados y configurados para ello.

Internet permite comunicarse con otras redes y acceder a servicios externos. La conexión local y la conexión a Internet son, por tanto, cosas diferentes.

::: tip
En la oficina imaginaria se interrumpe el acceso a Internet, pero la red local sigue funcionando. Los trabajadores podrían seguir utilizando la impresora de red y una carpeta compartida local, aunque no pudieran acceder a una página web externa.
:::

::: aviso
**Estar conectado al Wi-Fi no garantiza tener acceso a Internet.** El dispositivo puede estar conectado a la red local mientras falla la conexión exterior.
:::

### Actividad: imaginar una red

Dibuja una vivienda con estos dispositivos:

- Un router con Wi-Fi y puertos de red.
- Un ordenador conectado mediante cable.
- Un móvil conectado mediante Wi-Fi.
- Una impresora de red conectada mediante cable.

Después:

1. Representa con líneas las conexiones por cable.
2. Señala de otra forma la conexión inalámbrica.
3. Explica qué recurso podrían compartir los dispositivos.
4. Indica qué podría seguir funcionando si se interrumpe Internet, pero la red local permanece operativa.

### 1.1. Instalaciones de voz y datos

### 1.1. Instalaciones de voz y datos

Las instalaciones de comunicaciones permiten transportar información entre dispositivos. Podemos hablar de **instalaciones de datos** y **de voz** según el servicio que ofrecen, aunque ambas funciones pueden compartir una misma red.

#### Instalaciones de datos

Permiten que los equipos intercambien información, como documentos, imágenes o mensajes.

Por ejemplo, imaginemos una oficina con varios ordenadores y un servidor que almacena archivos compartidos. La instalación permite que cada ordenador solicite un documento y reciba su contenido.

Para hacerlo necesita equipos de comunicación y conexiones, que pueden ser cableadas o inalámbricas.

#### Instalaciones de voz

Permiten establecer comunicaciones habladas, como las llamadas telefónicas.

En una instalación de telefonía tradicional podemos encontrar teléfonos conectados mediante un cableado específico para ese servicio. En otras instalaciones, la comunicación de voz utiliza una red de datos.

| Instalación | Uso de ejemplo |
| --- | --- |
| **Datos** | Un ordenador accede a un documento almacenado en un servidor. |
| **Voz** | Una persona llama por teléfono a otra. |
| **Voz y datos sobre una red común** | Los ordenadores intercambian archivos y los teléfonos IP realizan llamadas utilizando la infraestructura de red. |

#### Telefonía IP: voz a través de una red de datos

La **telefonía IP** permite transmitir la voz utilizando redes basadas en el protocolo IP.

Para ello, la voz se representa como información digital y se envía en pequeñas unidades llamadas **paquetes**. En el destino, esa información se procesa para reproducir el sonido.

Podemos utilizar teléfonos IP o aplicaciones de comunicación, junto con los servicios necesarios.

::: tip
Imagina una oficina con dos ordenadores y dos teléfonos IP. Cada dispositivo puede tener su propia conexión al switch, mientras el cableado se organiza en las mismas canalizaciones y el mismo armario de comunicaciones. La infraestructura permite transportar tanto documentos como conversaciones.
:::

::: aviso
**Compartir infraestructura no significa conectar cualquier teléfono a una toma de red.** Los equipos y servicios deben ser compatibles. Un teléfono analógico no se convierte en teléfono IP por conectarlo mediante un cable o adaptador de forma.
:::

#### Seguir el recorrido de la comunicación

Para comprender una instalación, comenzaremos respondiendo tres preguntas:

1. **¿Qué dispositivos se comunican?** Por ejemplo, dos teléfonos o un ordenador y un servidor.
2. **¿Por dónde viaja la información?** Por cables o mediante una conexión inalámbrica.
3. **¿Qué elementos permiten conectarlos?** Tomas, conectores, switches, puntos de acceso y otros elementos que iremos estudiando.

### Actividad: identificar el servicio

Lee estas situaciones e indica si describen transmisión de datos, de voz o de ambas:

- Un ordenador descarga un documento de un servidor.
- Dos personas mantienen una llamada mediante teléfonos IP.
- Una persona participa en una llamada y envía un archivo durante la conversación.

::: nota
En esta clasificación distinguimos **el uso de la comunicación**. Técnicamente, la voz digitalizada también se transmite como datos.
:::

## 2. Elementos de una instalación

### 2.1. Equipos que utilizan y conectan la red

En una red encontramos dispositivos que **utilizan la comunicación** y equipos que **permiten conectar unos dispositivos con otros**.

Para reconocerlos, debemos fijarnos en su función, no únicamente en su aspecto.

#### Ordenadores y dispositivos finales

Los **dispositivos finales** envían o reciben información para realizar una tarea.

Son ejemplos los ordenadores, móviles, impresoras de red y teléfonos IP. Un ordenador puede solicitar un documento, mientras que una impresora recibe los datos necesarios para imprimirlo.

#### Tarjeta o adaptador de red

La **tarjeta de red**, también llamada adaptador de red, proporciona al dispositivo una interfaz para conectarse.

Puede estar integrada en el equipo o añadirse como un componente independiente. Encontramos, por ejemplo:

- **Adaptadores Ethernet:** permiten conectar un cable de red.
- **Adaptadores Wi-Fi:** permiten establecer una conexión inalámbrica.

::: tip
Un portátil puede disponer de Wi-Fi y utilizar también un adaptador Ethernet conectado por USB. Son interfaces diferentes que permiten acceder a la red de distintas formas.
:::

#### Switch o conmutador

Un **switch** permite conectar varios dispositivos dentro de una red local cableada.

Dispone de puertos donde conectamos los cables y dirige la información hacia el puerto correspondiente cuando conoce dónde se encuentra el destinatario.

Por ejemplo, podemos conectar tres ordenadores y una impresora a un switch para que se comuniquen, con la configuración adecuada.

#### Router

Un **router** permite comunicar **redes diferentes**. Examina el destino de la información y utiliza sus rutas para decidir por dónde enviarla.

En una vivienda, suele conectar la red local con la red del proveedor de acceso a Internet. También puede comunicar redes internas sin que esa comunicación tenga que salir a Internet.

::: aviso
**Switch y router no cumplen la misma función básica.** El switch conecta dispositivos dentro de una red local; el router permite comunicar redes diferentes.
:::

#### Punto de acceso

Un **punto de acceso inalámbrico** permite que dispositivos con Wi-Fi se conecten a una red.

Por ejemplo, un móvil puede comunicarse por Wi-Fi con el punto de acceso, que enlaza esa comunicación con el resto de la red.

El punto de acceso puede ser un aparato independiente o formar parte de otro dispositivo.

#### Servidor

Un **servidor** proporciona servicios a otros equipos, llamados **clientes** cuando los utilizan.

Puede ofrecer archivos compartidos, alojar una página web o gestionar otros servicios de red.

No se identifica únicamente por su tamaño o apariencia: **lo que lo convierte en servidor es la función que desempeña**.

::: tip
Imagina un ordenador preparado para compartir una carpeta. Cuando otro equipo solicita un documento de esa carpeta, el primero actúa como servidor de archivos y el segundo como cliente.
:::

### Resumen de funciones

| Elemento | Pregunta que ayuda a reconocerlo |
| --- | --- |
| **Dispositivo final** | ¿Utiliza la red para realizar una tarea? |
| **Adaptador de red** | ¿Proporciona la conexión de ese dispositivo a la red? |
| **Switch** | ¿Conecta varios dispositivos dentro de la red local? |
| **Router** | ¿Permite comunicar redes diferentes? |
| **Punto de acceso** | ¿Permite conectar dispositivos mediante Wi-Fi? |
| **Servidor** | ¿Proporciona un servicio a otros equipos? |

Estas categorías describen funciones y no siempre son excluyentes. Un servidor también es un dispositivo final y necesita un adaptador de red para comunicarse.

### Un aparato puede reunir varias funciones

El equipo que solemos llamar **router doméstico** puede integrar:

- La función de router para comunicar redes.
- Un switch para conectar dispositivos mediante sus puertos Ethernet.
- Un punto de acceso para las conexiones Wi-Fi.

Aunque estén dentro de la misma carcasa, siguen siendo funciones diferentes.

::: nota
**Wi-Fi no significa Internet.** Un móvil puede estar conectado al punto de acceso y no tener acceso a Internet si falla la conexión exterior.
:::

### Actividad: elegir el equipo

Indica qué elemento utilizarías y explica por qué:

1. Conectar cuatro ordenadores mediante cables dentro de una red local.
2. Permitir que un móvil acceda a esa red mediante Wi-Fi.
3. Comunicar la red local con otra red.
4. Guardar documentos para que otros equipos puedan consultarlos.
5. Añadir conexión Ethernet a un ordenador que no dispone de ella.

Puedes resolverlo mediante dibujos o tarjetas con nombres, sin disponer de los equipos físicos.

### 2.2. Cableado, tomas y latiguillos

El **cableado** conecta diferentes puntos de una instalación. En una vivienda, un ordenador puede conectarse directamente al router mediante un cable. En una oficina con varios puestos, resulta útil disponer de conexiones fijas y organizar el cableado en un lugar común.

Imaginemos una oficina donde cada mesa tiene una toma de red cercana y los cables llegan hasta un armario de comunicaciones.

#### Toma de red

Una **toma de red** es un punto fijo de conexión. Puede estar instalada en una pared, una canaleta o una caja preparada para ello.

Permite conectar un equipo sin tener que acceder al cable que recorre el interior de la instalación.

Las tomas suelen identificarse mediante etiquetas para relacionarlas con el punto correspondiente del armario.

#### Latiguillo

Un **latiguillo** es un tramo de cable terminado en conectores, utilizado para realizar una conexión.

En nuestro ejemplo encontramos latiguillos en dos lugares:

- **En el puesto de trabajo:** conectan el ordenador con la toma de red.
- **En el armario:** conectan el panel de parcheo con el switch.

::: tip
Si cambiamos el ordenador de una mesa, podemos desconectar su latiguillo sin modificar el cableado fijo de la oficina.
:::

#### Cableado fijo

El **cableado fijo** recorre la instalación entre la toma del puesto y el punto donde se organiza la conexión, como un panel de parcheo.

Normalmente se conduce mediante tubos, canaletas o bandejas. Está pensado para permanecer instalado, aunque cambiemos los equipos conectados.

No debe quedar expuesto a tirones, aplastamientos o zonas de paso.

#### Panel de parcheo

Un **panel de parcheo** reúne las terminaciones de varios cables de la instalación. Su parte frontal presenta puertos donde conectamos latiguillos; el cableado fijo termina en las conexiones correspondientes del panel.

Esto permite ordenar, identificar y cambiar las conexiones sin manipular continuamente el cableado fijo.

::: tip
Una toma identificada como `P01` puede corresponder al puerto `P01` del panel. Para conectarla a la red, utilizamos un latiguillo entre ese puerto y un puerto del switch. Las etiquetas ayudan a seguir el recorrido.
:::

### Recorrido de una conexión

En una instalación de cobre típica, encontramos:

**Ordenador → latiguillo → toma de red → cableado fijo → panel de parcheo → latiguillo → switch.**

| Elemento | Función en el recorrido |
| --- | --- |
| **Latiguillo del puesto** | Conecta el ordenador con la toma. |
| **Toma de red** | Proporciona un punto de conexión accesible. |
| **Cableado fijo** | Une el puesto con el armario de comunicaciones. |
| **Panel de parcheo** | Organiza y presenta las terminaciones del cableado. |
| **Latiguillo del armario** | Conecta el puerto del panel con el switch. |
| **Switch** | Comunica los dispositivos de la red conectados a él. |

::: aviso
**El panel de parcheo no sustituye al switch.** El panel organiza conexiones físicas; no decide a qué dispositivo enviar la información. Esa función corresponde al switch.
:::

### Actividad: seguir un cable sin tener la instalación delante

Dibuja dos ordenadores, dos tomas de red, un panel de parcheo y un switch.

1. Identifica las tomas como `P01` y `P02`.
2. Relaciona cada toma con un puerto del panel mediante el cableado fijo.
3. Añade los latiguillos de los ordenadores.
4. Añade los latiguillos entre el panel y el switch.
5. Explica qué conexión retirarías para cambiar un ordenador sin modificar la instalación fija.

Utiliza un color para los latiguillos y otro para el cableado fijo.

### 2.3. Conectores y antenas

Para comunicar dispositivos necesitamos puntos por los que la señal pueda entrar y salir. En las conexiones cableadas utilizamos **conectores**; en las inalámbricas intervienen **antenas**.

#### Conectores

Un **conector** permite unir un cable con un equipo o con otro elemento de la instalación. Su forma y sus características dependen del medio de transmisión utilizado.

No basta con que dos piezas se parezcan: **el conector, el cable y el puerto deben ser compatibles**.

| Conector | Dónde podemos encontrarlo | Cómo reconocerlo inicialmente |
| --- | --- | --- |
| **RJ45**, denominación habitual del conector modular de ocho contactos utilizado en Ethernet | Latiguillos y conexiones de redes de cobre. | Contactos metálicos y una pestaña de retención. |
| **LC** | Conexiones de fibra óptica. | Formato pequeño y mecanismo de retención mediante pestaña. |
| **SC** | Conexiones de fibra óptica. | Cuerpo de forma cuadrada y mecanismo de inserción y extracción. |

En una conexión habitual de cobre, el conector del latiguillo se introduce en un **puerto** del equipo o en una **toma de red**.

::: tip
Imagina un latiguillo Ethernet: tiene un conector en cada extremo. Uno puede conectarse al puerto del ordenador y el otro a una toma de pared. La toma continúa el recorrido mediante el cableado fijo de la instalación.
:::

#### Manipulación de conectores

Antes de conectar o desconectar:

- Comprueba que el conector corresponde al puerto.
- Observa su orientación y su mecanismo de retención.
- Sujeta el cuerpo del conector, sin tirar del cable.
- Evita tocar los contactos y los extremos ópticos.
- Detente si encuentras resistencia inesperada.

::: aviso
**No fuerces un conector ni tires del cable para extraerlo.** Puede tener una pestaña que deba liberarse antes de retirarlo.
:::

En fibra óptica, la limpieza y protección de los extremos es especialmente importante. Los conectores deben conservar sus protecciones cuando corresponda y manipularse siguiendo el procedimiento indicado.

::: aviso
**No mires al interior de una fibra o de un puerto óptico.** La señal luminosa puede ser invisible.
:::

#### Antenas

Las **antenas** permiten emitir y recibir ondas electromagnéticas para establecer comunicaciones inalámbricas.

Las encontramos en puntos de acceso, routers con Wi-Fi, móviles y otros dispositivos. Pueden ser:

- **Externas:** visibles fuera de la carcasa.
- **Internas:** integradas dentro del equipo.

Por tanto, un dispositivo puede disponer de conexión inalámbrica aunque no veamos ninguna antena.

::: nota
**La antena no proporciona Internet por sí sola.** Forma parte del sistema que permite la comunicación inalámbrica; también intervienen la electrónica, la configuración y la conexión con el resto de la red.
:::

### Actividad: reconocer conexiones

Utiliza fotografías o dibujos proporcionados por el docente:

1. Localiza un conector RJ45, uno LC y uno SC.
2. Relaciona cada conector con cobre o fibra óptica.
3. Identifica un equipo con antenas externas y otro con antenas internas.
4. Explica qué utilizarías para conectar un portátil mediante Wi-Fi y qué necesitarías para conectar varios ordenadores mediante cable.

No necesitas disponer de los equipos físicos: el objetivo es **reconocer los elementos y relacionarlos con su función**.

## 3. Medios de transmisión

Para enviar información entre dispositivos necesitamos una señal y un medio por el que pueda propagarse. El **medio de transmisión** es el camino que utiliza esa señal.

Podemos distinguir dos grupos:

- **Medios guiados:** la señal sigue un soporte físico, como un cable de cobre o una fibra óptica.
- **Medios no guiados o inalámbricos:** la señal se propaga por el espacio mediante ondas electromagnéticas, como ocurre con Wi-Fi.

::: nota
En todos los casos transmitimos información. Lo que cambia es cómo se representa y transporta: mediante señales eléctricas, luz u ondas de radio.
:::

### 3.1. Cable de pares trenzados de cobre

El cable de **pares trenzados** contiene conductores de cobre aislados, agrupados por parejas y enrollados entre sí. En muchos cables Ethernet habituales encontramos **cuatro pares**, es decir, ocho conductores.

El trenzado ayuda a reducir las interferencias que afectan a la comunicación, incluidas las que pueden producirse entre los propios pares.

Es frecuente en las conexiones entre ordenadores, tomas de red, paneles de parcheo y switches.

#### Partes que podemos reconocer

- **Conductores de cobre:** transportan las señales eléctricas.
- **Aislamiento individual:** separa eléctricamente los conductores.
- **Pares trenzados:** agrupan los conductores de dos en dos.
- **Cubierta exterior:** protege el conjunto.
- **Pantalla, cuando existe:** proporciona protección adicional frente a interferencias.

Algunos cables no tienen pantalla y otros incorporan láminas o mallas alrededor del conjunto o de los pares.

::: aviso
**Apantallado no significa automáticamente mejor para cualquier instalación.** El cable debe elegirse junto con las tomas, conectores y demás elementos compatibles.
:::

#### La categoría del cable

En la cubierta podemos encontrar indicaciones como **Cat 5e** o **Cat 6**. La categoría identifica determinadas prestaciones que debe cumplir el cable.

No necesitamos memorizar todavía todas las categorías y velocidades. Primero aprenderemos a localizar el marcado y distinguirlo de otros datos.

También revisaremos el estado exterior: cortes, aplastamientos, dobleces excesivos o conectores deteriorados pueden afectar al funcionamiento.

::: tip
Imagina que un ordenador se conecta mediante un latiguillo Cat 6, pero el resto del recorrido utiliza otros componentes. No podemos conocer las prestaciones de toda la conexión mirando únicamente ese latiguillo: debemos considerar el conjunto.
:::

### 3.2. Cable coaxial

El **cable coaxial** tiene sus elementos organizados alrededor de un mismo eje. Si observamos un dibujo de su sección, distinguiremos:

1. **Conductor central:** transporta la señal eléctrica.
2. **Aislante:** separa el conductor central de la pantalla.
3. **Pantalla conductora:** rodea el aislante y participa en el funcionamiento eléctrico y la protección de la señal.
4. **Cubierta exterior:** protege el conjunto.

Se utiliza, por ejemplo, en instalaciones de distribución de televisión y en determinados servicios de comunicaciones.

A diferencia del cable de pares trenzados, no contiene varias parejas de conductores enrollados entre sí.

::: tip
Para distinguir ambos en una fotografía de su sección, busca la estructura: **varios pares trenzados** o **un conductor central rodeado de capas**.
:::

::: aviso
**Dos cables de comunicaciones no son intercambiables por cumplir una función general parecida.** Un puerto Ethernet habitual para pares de cobre no admite directamente un cable coaxial.
:::

### 3.3. Fibra óptica

La **fibra óptica** transmite información mediante señales luminosas que se propagan por una fibra.

Podemos reconocer tres partes básicas:

- **Núcleo:** región por la que se guía la luz.
- **Revestimiento óptico:** rodea el núcleo y permite, junto con él, guiar la señal.
- **Protecciones exteriores:** ayudan a proteger la fibra frente a daños.

Un cable de fibra puede contener varias fibras y otros elementos de refuerzo.

#### ¿Dónde se utiliza?

Podemos encontrarla en enlaces entre armarios de comunicaciones, edificios y redes de acceso.

Permite cubrir necesidades de distancia y capacidad que dependen del tipo de fibra y de los equipos utilizados. Además, la señal óptica no se ve afectada por las interferencias electromagnéticas del mismo modo que una señal eléctrica en cobre.

Sin embargo, requiere conectores y equipos ópticos compatibles. También necesita una manipulación cuidadosa: la suciedad en los extremos o una curvatura excesiva pueden perjudicar la comunicación.

#### Monomodo y multimodo

Encontraremos dos familias principales:

| Tipo | Idea introductoria |
| --- | --- |
| **Monomodo** | Está diseñada para guiar un modo de propagación de la luz en sus condiciones de funcionamiento. |
| **Multimodo** | Permite varios modos de propagación de la luz. |

Por ahora interesa **reconocer los nombres y comprobar la compatibilidad**, sin estudiar los detalles de propagación.

::: aviso
**Que dos conectores encajen no garantiza que toda la conexión óptica sea compatible.** También importan el tipo de fibra y las características de los equipos.
:::

::: aviso
**No mires al interior de una fibra ni de un puerto óptico.** La luz utilizada puede ser invisible. En estas actividades trabajaremos con fotografías y esquemas, sin cortar ni manipular fragmentos de fibra.
:::

### 3.4. Medios inalámbricos

En una comunicación inalámbrica, los dispositivos intercambian señales sin un cable que los una directamente. **Wi-Fi utiliza ondas de radio** para comunicar equipos compatibles.

Las antenas permiten emitir y recibir esas señales. Pueden estar integradas dentro del dispositivo o ser visibles en el exterior.

La comunicación puede verse afectada por:

- **La distancia** entre los dispositivos.
- **Los obstáculos**, como paredes y elementos metálicos.
- **Las interferencias** de otras comunicaciones o equipos.
- **Las características y la ubicación** de los dispositivos.

::: tip
En una vivienda imaginaria, el móvil puede funcionar bien cerca del punto de acceso y tener dificultades en una habitación alejada. Entre ambos hay más distancia y varias paredes que afectan a la señal.
:::

::: nota
**Una conexión inalámbrica no elimina todo el cableado de la instalación.** Un punto de acceso puede necesitar un cable de alimentación y una conexión cableada con el resto de la red.
:::

### 3.5. Comparación de los medios

| Medio | Señal utilizada | Qué reconoceremos | Ejemplo de uso |
| --- | --- | --- | --- |
| **Pares trenzados de cobre** | Eléctrica. | Parejas de conductores, categoría y posibles pantallas. | Conectar un ordenador con una toma Ethernet. |
| **Coaxial** | Eléctrica. | Conductor central y capas concéntricas. | Distribuir señales de televisión. |
| **Fibra óptica** | Luminosa. | Tipo de fibra, conectores y equipos ópticos. | Enlazar armarios de comunicaciones. |
| **Inalámbrico** | Ondas de radio, en el caso de Wi-Fi. | Antenas y equipos compatibles. | Conectar un móvil a la red local. |

### 3.6. Elegir un medio

**No existe un medio que sea el mejor para todas las situaciones.** Antes de elegir debemos preguntarnos:

1. **¿Qué equipos queremos conectar?** Sus interfaces deben ser compatibles.
2. **¿Qué distancia debemos cubrir?**
3. **¿Cómo es el recorrido?** Hay que considerar obstáculos, canalizaciones y condiciones del entorno.
4. **¿Qué prestaciones necesitamos?**
5. **¿Qué recursos tenemos para instalar y mantener la conexión?**

La elección debe justificarse con las necesidades de la instalación, no únicamente con el aspecto del cable o con una velocidad anunciada.

### Actividad: reconocer y elegir

A partir de fotografías o dibujos:

1. Identifica un cable de pares trenzados, uno coaxial y uno de fibra óptica.
2. Señala las partes que permiten distinguirlos.
3. Indica qué tipo de señal transporta cada uno.
4. Propón un medio para estas situaciones:
   - Conectar un ordenador fijo a una toma Ethernet cercana.
   - Conectar un móvil mientras se desplaza por una vivienda.
   - Estudiar un enlace entre dos armarios de comunicaciones.
5. Explica qué información adicional necesitarías antes de decidir en el último caso.

**El objetivo es reconocer las opciones y justificar una elección sencilla**, no diseñar todavía una instalación completa.

## 4. Canalizaciones

En una instalación, los cables necesitan un recorrido organizado entre los equipos, las tomas y los armarios de comunicaciones.

Las **canalizaciones** permiten **guiar, organizar y proteger el cableado**. Ayudan a evitar que los cables queden sueltos, reciban golpes o provoquen tropiezos. El grado de protección depende del tipo de canalización y de cómo esté instalada.

::: tip
Imagina una oficina con varias mesas junto a una pared. En lugar de dejar los cables sueltos por el suelo, podemos preparar un recorrido por la pared y situar puntos de conexión cerca de los puestos.
:::

### 4.1. Tubos

Un **tubo** es un conducto cerrado por el que se introduce el cableado. Puede ser rígido o flexible y estar fabricado en diferentes materiales, como plástico o metal.

Se utiliza en recorridos de superficie o empotrados, según el tipo y las condiciones de la instalación.

Para reconocerlo, observaremos:

- Su diámetro y material.
- Si es rígido o flexible.
- Los accesorios que permiten unirlo y cambiar de dirección.
- Los puntos previstos para acceder al cableado.

**Al ser cerrado, debemos planificar cómo introducir y sustituir los cables**, especialmente cuando el recorrido tiene curvas.

### 4.2. Canaletas

Una **canaleta** es un conducto que suele disponer de una base y una tapa desmontable. Se utiliza habitualmente para distribuir cables por la superficie de paredes o puestos de trabajo.

La tapa facilita el acceso al interior para colocar, revisar o sustituir cableado.

Algunos modelos incorporan compartimentos y accesorios para organizar recorridos o integrar cajas y tomas.

::: nota
**No todas las canaletas tienen las mismas características.** Debemos comprobar su capacidad, accesorios y usos previstos antes de seleccionarlas.
:::

### 4.3. Bandejas

Una **bandeja** es un soporte que permite conducir conjuntos de cables. Puede tener una superficie continua, perforada o una estructura de rejilla.

Es habitual en recorridos que concentran bastante cableado. Según el modelo, puede disponer de tapa.

Las bandejas también necesitan soportes y fijaciones adecuados para sostener su propio peso y el de los cables.

::: aviso
**Una bandeja abierta no protege el cableado igual que un conducto cerrado.** Debemos elegirla teniendo en cuenta dónde se instala y a qué condiciones quedarán expuestos los cables.
:::

### 4.4. Comparación de canalizaciones

| Elemento | Cómo reconocerlo | Aspecto que debemos considerar |
| --- | --- | --- |
| **Tubo** | Conducto cerrado, rígido o flexible. | Introducción del cableado, curvas y puntos de acceso. |
| **Canaleta** | Base con tapa habitualmente desmontable. | Capacidad, acceso y accesorios del recorrido. |
| **Bandeja** | Soporte continuo, perforado o de rejilla. | Carga, sujeción y exposición del cableado. |

### 4.5. Accesorios del recorrido

Una instalación no suele consistir en un único tramo recto. Para resolver cambios de dirección y uniones se utilizan accesorios compatibles:

- **Uniones:** conectan tramos.
- **Ángulos o curvas:** permiten cambiar de dirección.
- **Derivaciones:** permiten dividir el recorrido.
- **Tapas finales:** cierran los extremos correspondientes.
- **Soportes y abrazaderas:** sujetan la canalización.

Los accesorios deben mantener la continuidad del recorrido sin dejar bordes que puedan dañar los cables.

### 4.6. Cómo elegir una canalización

Antes de seleccionarla, debemos estudiar la instalación:

| Criterio | Pregunta que debemos responder |
| --- | --- |
| **Cantidad y tamaño de cables** | ¿Cabe el cableado previsto sin comprimirlo? |
| **Posibles ampliaciones** | ¿Se prevé añadir conexiones más adelante? |
| **Recorrido** | ¿Hay esquinas, obstáculos o cambios de dirección? |
| **Entorno** | ¿Estará expuesta a humedad, golpes u otras condiciones? |
| **Acceso** | ¿Cómo podremos revisar o sustituir los cables? |
| **Sujeción** | ¿Qué soportes necesita y dónde se fijarán? |

No debemos elegir una canalización únicamente porque los cables entren físicamente. También hay que respetar las condiciones de instalación y dejar el espacio necesario para trabajar con ellos.

::: tip
Una canaleta que queda completamente llena desde el primer día puede dificultar la colocación de la tapa, el mantenimiento y las ampliaciones. La capacidad debe planificarse antes del montaje.
:::

### 4.7. Cuidar el cableado

Durante la instalación debemos evitar:

- Aplastar cables al colocar tapas.
- Doblarlos excesivamente en esquinas.
- Arrastrarlos sobre bordes que dañen la cubierta.
- Dejarlos sometidos a tirones.
- Utilizar accesorios que no correspondan al sistema elegido.

El **radio de curvatura** describe lo cerrada que es una curva del cable. Cada cable admite unas condiciones de doblado que deben respetarse.

::: aviso
**No debemos forzar un cable para adaptarlo a una esquina.** El recorrido y sus accesorios deben permitir una curva compatible con el cable utilizado.
:::

Los cables de datos y los de alimentación eléctrica también requieren una distribución planificada.

::: aviso
**No introduciremos cables de datos en cualquier canalización eléctrica disponible.** La posibilidad de compartir recorridos y las separaciones necesarias dependen del sistema de instalación y de los requisitos aplicables. No modificaremos instalaciones existentes sin autorización.
:::

### Actividad: elegir un recorrido

Dibuja una oficina imaginaria con cuatro mesas junto a una pared y un armario de comunicaciones en una esquina.

1. Marca el recorrido del cableado desde el armario hasta las mesas.
2. Propón una canalización para ese recorrido.
3. Señala dónde necesitarías uniones, cambios de dirección o derivaciones.
4. Explica cómo accederías a los cables para revisarlos.
5. Indica qué datos faltan para elegir el tamaño y las fijaciones.

Puedes realizar la actividad sobre papel o con una herramienta de dibujo. **Lo importante es justificar la elección y prever un recorrido ordenado y accesible.**

## 5. Cajas y armarios

Una instalación de red necesita lugares adecuados para alojar conexiones y equipos. Las **cajas** y los **armarios** ayudan a protegerlos, mantenerlos organizados y facilitar su revisión.

No cumplen exactamente la misma función: una caja puede alojar una toma o permitir acceder al cableado, mientras que un armario puede reunir las conexiones y los equipos de varios puestos.

### 5.1. Cajas de superficie, empotradas y registros

Las cajas se eligen según **dónde se instalarán y qué deben alojar**.

#### Caja de superficie

Una **caja de superficie** se instala sobre una pared u otro soporte. Su cuerpo queda visible, sin alojarse dentro de un hueco de la pared.

Puede utilizarse, por ejemplo, para colocar una toma de red junto a una canaleta.

#### Caja empotrada

Una **caja empotrada** se coloca en un hueco preparado en el soporte. La parte frontal queda accesible para instalar la tapa o el mecanismo correspondiente.

Este tipo de montaje requiere que exista un espacio adecuado para alojarla.

#### Caja de registro

Una **caja de registro** proporciona un punto de acceso a una parte de la instalación. Facilita tareas como inspeccionar el recorrido o introducir y sustituir cables.

Debe permanecer accesible: ocultarla detrás de un elemento fijo puede dificultar el mantenimiento.

::: nota
**Superficie y empotrada describen cómo se monta una caja; registro describe su función.** Por tanto, una caja de registro puede instalarse en superficie o empotrada.
:::

| Clasificación | Qué debemos observar |
| --- | --- |
| **De superficie** | El cuerpo de la caja está sobre el soporte. |
| **Empotrada** | El cuerpo está alojado en un hueco. |
| **De registro** | Su función es permitir el acceso a una parte de la instalación. |

### 5.2. Cómo elegir una caja

Antes de seleccionarla, debemos comprobar:

- **Qué alojará:** una toma, conexiones u otros elementos previstos.
- **Sus dimensiones:** debe permitir trabajar sin comprimir ni forzar los cables.
- **Las entradas:** deben ser compatibles con las canalizaciones.
- **El montaje:** superficie o empotrado, según la instalación.
- **El entorno:** debe ser adecuada para las condiciones del lugar.
- **La accesibilidad:** debe permitir las revisiones necesarias.

::: tip
Imagina una oficina donde el cableado discurre por una canaleta visible. Una caja de superficie compatible puede permitir instalar una toma junto a una mesa. La elección debe considerar tanto la toma como la entrada de la canaleta.
:::

### 5.3. Armarios de comunicaciones y racks

Un **armario de comunicaciones** permite reunir y organizar equipos y conexiones de red en un lugar preparado para ello.

Un **rack** es una estructura que permite montar equipos y accesorios compatibles. Puede formar parte de un armario cerrado o presentarse como un bastidor abierto.

En el lenguaje habitual se utiliza a veces «rack» para referirse al armario completo, pero conviene reconocer la diferencia entre la estructura de montaje y su envolvente.

#### ¿Qué podemos encontrar dentro?

| Elemento | Función |
| --- | --- |
| **Panel de parcheo** | Agrupa las terminaciones del cableado fijo. |
| **Switch** | Comunica los dispositivos conectados a sus puertos. |
| **Organizadores de cables** | Guían y mantienen ordenados los latiguillos. |
| **Bandejas** | Sostienen equipos que no se fijan directamente a la estructura. |
| **Accesorios de montaje** | Permiten sujetar y organizar los elementos compatibles. |

::: tip
El cableado fijo de varias tomas puede llegar al panel de parcheo de un armario. Desde allí, los latiguillos conectan los puertos del panel con el switch. Las etiquetas y los organizadores ayudan a seguir cada conexión.
:::

### 5.4. Armarios de pared y de suelo

Podemos distinguir dos formas habituales de instalación:

- **Armario mural o de pared:** se fija a un soporte que debe ser adecuado para el peso del conjunto.
- **Armario de suelo:** se apoya sobre el suelo y se instala siguiendo las condiciones de estabilidad y fijación previstas.

No debemos elegir únicamente por el número de equipos. También importan sus dimensiones, su peso y las posibilidades del lugar donde se instalarán.

### 5.5. Criterios de selección

| Criterio | Pregunta que debemos responder |
| --- | --- |
| **Capacidad** | ¿Hay espacio para los equipos, los accesorios y las ampliaciones previstas? |
| **Profundidad** | ¿Caben los equipos y sus conexiones sin forzar los cables? |
| **Carga admisible** | ¿La estructura y su instalación soportan el peso del conjunto? |
| **Acceso** | ¿Podemos conectar, revisar y sustituir los elementos? |
| **Ventilación** | ¿Se pueden evacuar adecuadamente el calor y el aire de los equipos? |
| **Entrada de cables** | ¿El cableado puede llegar y organizarse sin sufrir daños? |
| **Ubicación** | ¿El lugar es adecuado y permite trabajar alrededor del armario? |

::: aviso
**Que un equipo quepa dentro no significa que esté bien instalado.** También necesita una sujeción adecuada, espacio para sus conexiones y las condiciones de ventilación indicadas.
:::

### 5.6. Orden e identificación

Un armario organizado facilita localizar conexiones y reduce errores durante el mantenimiento.

Para ello se utilizan etiquetas, organizadores y una distribución planificada de los equipos. Los latiguillos no deben quedar sometidos a tirones ni bloquear los accesos o las zonas de ventilación.

**El armario no debe utilizarse como almacén de herramientas, embalajes o piezas sueltas.**

### Actividad: reconocer y elegir

A partir de fotografías o dibujos:

1. Distingue una caja de superficie de una empotrada.
2. Explica por qué una caja de registro debe ser accesible.
3. Identifica un panel de parcheo, un switch y un organizador dentro de un armario.
4. Compara un armario mural con uno de suelo.
5. Indica qué datos necesitarías antes de elegir un armario para una oficina imaginaria.

::: tip
Si solo conocemos el número de ordenadores, todavía falta información. Necesitamos saber qué equipos se instalarán en el armario, cuánto ocupan y pesan, y dónde se colocará.
:::

## 6. Elementos de fijación

Las **fijaciones** permiten sujetar canalizaciones, cajas, armarios y cables para que permanezcan en su posición.

Su elección depende tanto del elemento que queremos sujetar como del **soporte**, es decir, la superficie o estructura donde lo instalaremos.

No necesita la misma fijación una canaleta ligera que un armario con equipos. Tampoco se utilizan necesariamente los mismos elementos sobre madera, metal o una pared hueca.

### 6.1. Tornillos

Un **tornillo** permite realizar una unión mediante su rosca. Puede introducirse en una tuerca, en una pieza roscada o en otro material o elemento preparado para recibirlo.

Para reconocer y seleccionar un tornillo debemos observar:

- **La cabeza:** determina la herramienta necesaria.
- **El diámetro y la longitud:** deben ser adecuados para la unión.
- **El tipo de rosca:** debe corresponder al elemento donde se introduce.
- **El material y acabado:** deben ser apropiados para las condiciones de uso.

::: aviso
**Un tornillo más largo o más grueso no es siempre mejor.** Puede sobresalir, dañar una pieza o ser incompatible con la fijación prevista.
:::

### 6.2. Tacos

Un **taco** permite realizar determinadas fijaciones en un soporte, normalmente junto con un tornillo compatible.

Existen tacos diseñados para materiales y situaciones diferentes. Algunos trabajan por expansión; otros utilizan mecanismos específicos para soportes huecos.

Antes de elegirlos debemos conocer el material de la pared o del soporte.

::: tip
Dos paredes pueden tener el mismo aspecto exterior y una composición diferente. Una puede ser maciza y otra hueca. No podemos elegir el taco únicamente por el acabado que vemos.
:::

El taco, el tornillo y el soporte deben formar una **combinación adecuada**, siguiendo las indicaciones del fabricante.

### 6.3. Tuercas y arandelas

Una **tuerca** tiene una rosca interior y se acopla a un tornillo compatible para sujetar piezas.

Una **arandela** se coloca, según el montaje, entre la cabeza del tornillo o la tuerca y la superficie de apoyo. Puede ayudar a repartir la presión y proteger esa superficie.

| Elemento | Función básica |
| --- | --- |
| **Tuerca** | Completar una unión roscada con un tornillo. |
| **Arandela** | Proporcionar una superficie de apoyo adecuada, según el montaje. |

No todas las tuercas y arandelas son iguales. Debemos utilizar las previstas para la unión.

### 6.4. Grapas y abrazaderas

Las **grapas y abrazaderas** permiten sujetar cables, tubos u otros elementos cuando están diseñadas para ese uso.

Su forma y tamaño deben adaptarse a lo que sujetan, manteniéndolo en su posición sin aplastarlo ni dañar su cubierta.

::: aviso
**No utilizaremos grapas de oficina ni fijaciones improvisadas para sujetar cableado.** Una fijación inadecuada puede perforar el aislamiento o deformar el cable.
:::

### 6.5. Bridas

Una **brida** permite agrupar o fijar elementos mediante una cinta y un mecanismo de cierre. Muchas bridas habituales son de plástico y se utilizan una sola vez.

Debemos comprobar su tamaño, resistencia y condiciones de uso. No todas son adecuadas para exteriores ni para soportar las mismas cargas.

Al colocar una brida, la sujeción debe ser suficiente sin comprimir los cables.

::: aviso
**Una brida no debe apretarse hasta deformar el cable.** Tampoco sustituye a los soportes necesarios para sujetar un equipo o un armario.
:::

### 6.6. Cintas de sujeción reutilizables

Las **cintas reutilizables**, como las de cierre por gancho y bucle, permiten agrupar cables y volver a abrir la unión cuando necesitamos modificarla.

Son útiles para mantener ordenados los latiguillos en un armario o un puesto de trabajo.

::: tip
Si añadimos un latiguillo a un grupo organizado con una cinta reutilizable, podemos abrirla, incorporar el cable y cerrarla de nuevo, sin cortar la sujeción anterior.
:::

### 6.7. Cómo elegir una fijación

Antes de seleccionar el material, debemos responder estas preguntas:

| Pregunta | Qué debemos comprobar |
| --- | --- |
| **¿Qué vamos a sujetar?** | Una canaleta, una caja, un tubo, cables o un armario. |
| **¿Sobre qué soporte?** | Material, estado y características de la superficie. |
| **¿Qué carga debe soportar?** | Peso del elemento y de todo su contenido. |
| **¿Cómo se monta?** | Puntos de fijación y accesorios previstos. |
| **¿En qué entorno?** | Condiciones de humedad, exposición u otras necesidades. |
| **¿Qué indica el fabricante?** | Compatibilidad, límites e instrucciones de instalación. |

En un armario debemos considerar **el peso del conjunto equipado**, no solamente el de la estructura vacía.

::: nota
Si desconocemos el material del soporte o la carga prevista, todavía no tenemos información suficiente para elegir la fijación. **Reconocer qué dato falta también forma parte de una selección correcta.**
:::

### 6.8. Reconocer antes de montar

En este tema trabajaremos con fotografías, dibujos y situaciones guiadas. El objetivo es identificar cada fijación y relacionarla con una función.

La perforación y el montaje requieren una preparación específica: revisar el soporte, comprobar posibles instalaciones ocultas y utilizar herramientas y procedimientos adecuados bajo supervisión.

**No perforaremos paredes ni realizaremos fijaciones sobre instalaciones existentes como parte de esta actividad de reconocimiento.**

### Actividad: seleccionar y justificar

Para cada situación, indica qué tipo de fijación estudiarías y qué información necesitas antes de elegir un modelo concreto:

| Situación | Tipo de elemento que podría utilizarse | Información pendiente |
| --- | --- | --- |
| Organizar varios latiguillos que se modificarán con frecuencia. | Cinta reutilizable. | Cantidad y tamaño de los cables. |
| Sujetar un tubo a una superficie. | Abrazadera compatible. | Diámetro del tubo, soporte y condiciones del montaje. |
| Fijar una caja a una pared. | Sistema de tornillos y fijaciones adecuado. | Tipo de pared y puntos de montaje de la caja. |
| Instalar un armario mural. | Sistema de anclaje especificado para el montaje. | Soporte, peso total y requisitos del fabricante. |

Después, explica por qué serían incorrectas estas decisiones:

1. Elegir un taco sin conocer el material de la pared.
2. Apretar una brida hasta marcar la cubierta del cable.
3. Calcular la fijación de un armario contando solo su peso vacío.
4. Utilizar un tornillo porque «se parece» al indicado.

El objetivo es **relacionar la fijación con la pieza, el soporte y las condiciones de uso**, evitando elecciones por apariencia.

[Referencia curricular: BOE, Real Decreto 127/2014, módulo 3016](https://www.boe.es/buscar/doc.php?id=BOE-A-2014-2360).
