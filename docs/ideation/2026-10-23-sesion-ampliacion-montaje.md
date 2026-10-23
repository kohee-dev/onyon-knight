# Ideación: sesión de ampliación/repaso de montaje de sobremesas

Fecha: 2026-10-23

## Subject

**Foco:** una sesión pendiente de ampliación/repaso en el módulo 3029 «Montaje y mantenimiento de sistemas y componentes informáticos» (Grado Básico, 1.º). El alumnado está aprendiendo a montar y desmontar correctamente ordenadores de sobremesa.

**Puntos clave del contexto:**

- `contenido/modulos/mm.yml` tiene dos unidades: ut1 `componentes-electricos` y ut2 `componentes-sistemas-microinformaticos`.
- `componentes-electricos.md` (CE) ya trae las herramientas (§5, l.929), la seguridad (§6, l.1044), «Organizar el desmontaje y el montaje» (§6.6, cabecera l.1125, texto l.1127-1139), la actividad de errores en el puesto (l.1154-1170) y la seguridad eléctrica (§7, l.1175). Límite explícito: no se abren fuentes de alimentación ni se miden enchufes (CE:779, CE:1227).
- `componentes-sistemas-microinformaticos.md` (CS) cubre caja y fuente (l.90-180), placa base y cabeceras del panel frontal (l.183-262), procesador y refrigeración (l.269-357), RAM (l.360-427), almacenamiento (l.427), BIOS/UEFI (l.572-600), la ficha E19 (l.615) y las ampliaciones A1-A5 (l.635-657).
- **Hueco detectado:** las cinco ampliaciones actuales son de papel (cálculo, investigación o compra online). Ninguna práctica física de montaje paso a paso ni de diagnóstico.
- Los apuntes se publican en web y PDF, y existen «casos» con historia (`tipo: caso`, `horas`). Ninguno está en `mm`.

**Cómo se ha hecho:** cuatro generadores por marcos (dolor, inversión/automatización, apalancamiento, supuestos/analogía/restricciones), fusión y un verificador independiente que comprobó las citas en los archivos. Las citas de CE van desfasadas unas 2 líneas respecto a lo que citaron los generadores; aquí se usan las líneas verificadas.

**Aviso común a todas las ideas con equipos encendidos:** los apuntes no cubren encender un equipo con la caja abierta ni rehacer cableado con tensión. Fija una norma: se enchufa y se enciende solo con la caja cerrada o con el docente delante, y se apaga y desconecta antes de volver a tocar (CE:1200, «Apagar no es lo mismo que desconectar»).

## Ranked ideas

### 1. Remontaje a ciegas con hoja de registro y auditoría cruzada

**Resumen.** La pareja A desmonta un sobremesa y deja un registro (fotos de cada paso, bandeja de tornillos dividida y etiquetada, esquema de cables con su destino). La pareja B, que no ha visto el desmontaje, remonta usando solo esa hoja. Una tercera mirada (o la pareja A) audita el resultado con una lista de verificación de una página (tornillos sobrantes, cables atrapados cerca de ventiladores, RAM con clic en ambos extremos, CPU_FAN conectado, panel frontal completo) y cierra con un cuadre de tornillos: entraron los mismos que salieron. Se comparan los huecos del registro. Al final queda una plantilla reutilizable.

**Base.**
- `direct:` CE:1131-1134 «Registraremos la posición de cables y componentes mediante fotografías o anotaciones. Separaremos los tornillos según su procedencia» y CE:1139 «No confíes únicamente en recordar dónde iba cada tornillo».
- `direct:` CE:1136 «Antes de cerrar el equipo, revisaremos que no queden tornillos ni herramientas en su interior y que los cables no estén atrapados ni interfieran con ventiladores». Es la casilla final ya redactada.
- `direct:` CE:1127 «Una pieza suelta dentro del equipo o un tornillo colocado en un lugar incorrecto pueden provocar daños».
- `external:` el recuento de gasas e instrumental antes del cierre figura en la Lista de Verificación de Seguridad de la Cirugía de la OMS (2008), que inspira el cuadre.
- `reasoned:` si quien remonta no puede preguntar al autor, cualquier hueco del registro se hace visible. Se pasa de memorizar una regla a haber sufrido su ausencia.

**Por qué importa.** Es la más pegada a lo que ya están haciendo (montar y desmontar) y convierte el consejo de §6.6 en comportamiento observable y evaluable.

**Tamaño.** M. Riesgo de tiempo: desmontar + registrar + remontar + auditar no cabe entero en 50-60 min. Usa equipos ya abiertos a medias o quita el cuadre.

**Take it further.**
```
/supermatt:grill-with-docs Quiero diseñar una sesión de ampliación/repaso de 55-60 min para el módulo 3029 (Grado Básico, 1.º): "remontaje a ciegas". Una pareja desmonta un sobremesa y deja una hoja de registro (fotos, tornillos por procedencia, cables con destino); otra pareja remonta solo con esa hoja; se audita con una lista de verificación de una página y un cuadre de tornillos; la mejor hoja queda como plantilla del repo. Base: contenido/piezas/mm/componentes/componentes-electricos.md:1131-1134 (registrar con fotos y separar tornillos), :1136 (revisar antes de cerrar que no queden tornillos ni cables atrapados) y :1139 (tip de la bandeja dividida); en el apunte no hay ninguna actividad que ponga esto a prueba. Importa porque convierte §6.6 en una práctica evaluable. Ayúdame a decidir tiempos, número de equipos, qué entra en la plantilla y cómo evaluarlo.
```

### 2. Taller de averías sembradas

**Resumen.** Antes de la clase, el docente deja 4-5 equipos con fallos de montaje plausibles y reversibles: RAM a medio encajar, cabecera del panel frontal sin conectar o en el sitio equivocado, CPU_FAN o el cable de 24 pines sueltos, cable SATA de datos desenchufado. El alumnado rota por puestos de 8-10 min con una ficha «síntoma → hipótesis → qué compruebo primero → qué era» y repara. Cada avería resuelta pasa a un banco de averías reutilizable.

**Base.**
- `direct:` CS:259 «Nunca conectes una en el sitio de la otra» (USB 2.0 frente a HD_AUDIO) y la tabla de cabeceras CS:245-257. Existe el error clásico solo como texto; el ejercicio E8 (CS:262-266) lo trata en teoría.
- `direct:` CS:635-657, las ampliaciones A1-A5, que no incluyen ninguna práctica de diagnóstico.
- `reasoned:` razonar de síntoma a causa distingue montar con receta de entender el equipo. Un fallo ya fabricado enseña el orden de comprobación (alimentación, conexión, asiento) más rápido que repetir un montaje correcto.

**Por qué importa.** Cubre un hueco real de los apuntes (nada de diagnóstico) y el banco de averías se reutiliza cada curso a coste casi nulo.

**Tamaño.** M. Matices de la verificación: un POWER SW/RESET mal puesto no produce síntoma fiable («no arranca»), solo el LED falla; reencajar RAM o CPU repetidamente desgasta ranuras (usa fallos que no impliquen eso); definir el protocolo de encendido (aviso común arriba).

**Take it further.**
```
/supermatt:grill-with-docs Quiero diseñar un "taller de averías sembradas" para una sesión de ampliación de 50 min del módulo 3029 (Grado Básico, 1.º). El docente deja 4-5 sobremesas con fallos de montaje reversibles (RAM a medio encajar, cabecera del panel frontal mal puesta, CPU_FAN o 24 pines sueltos, SATA flojo) y el alumnado rota por puestos con una ficha síntoma→hipótesis→comprobación→causa. Base: contenido/piezas/mm/microinformatica/componentes-sistemas-microinformaticos.md:245-259 (cabeceras y aviso de no confundir USB 2.0 con HD_AUDIO) y :635-657 (las ampliaciones son todas de papel, sin diagnóstico); respeta el límite de seguridad de componentes-electricos.md:779 y :1227 (no se abren fuentes). Importa porque cubre el hueco de diagnóstico y deja un banco de averías reutilizable. Ayúdame a elegir qué averías dan un síntoma fiable, el protocolo de encendido y el formato de la ficha.
```

### 3. Puesto trampa físico (y su versión invertida)

**Resumen.** El docente monta una mesa con errores reales (bebida junto a la placa, tornillos mezclados, cable que tira de un conector, herramienta deteriorada, placa apoyada de forma inestable, pulsera ESD sin conectar) y el alumnado rellena la tabla situación/qué podría ocurrir/cómo corregirla. Variante: cada pareja esconde 3 errores en su mesa y la pareja vecina los audita; se puntúa el hallazgo y la dificultad del error escondido.

**Base.**
- `direct:` CE:1154-1170, la «Actividad inicial: detectar errores en un puesto de trabajo» con su tabla de tres columnas, hoy con una imagen preparada (CE:1155).
- `reasoned:` crear el error exige conocer la norma y detectarlo la aplica.

**Por qué importa.** Es la idea más barata: reutiliza una plantilla ya escrita y repasa seguridad antes de manipular nada. Ojo: la pulsera ESD no figura en la lista original del apunte (ESD está en §5.6, CE:1005).

**Tamaño.** S. Dura 25-40 min; sirve de calentamiento antes de la 1 o la 2.

**Take it further.**
```
/supermatt:grill-with-docs Quiero convertir la actividad "detectar errores en un puesto de trabajo" en una práctica física de 30-40 min para el módulo 3029 (Grado Básico, 1.º). Ahora se hace con una imagen; la idea es montar una mesa con errores reales o que cada pareja esconda 3 errores y otra los audite, usando la tabla situación/qué podría ocurrir/cómo corregirla. Base: contenido/piezas/mm/componentes/componentes-electricos.md:1154-1170 (actividad y tabla actuales) y :1005 (ESD). Importa porque es un repaso de seguridad barato y la plantilla ya existe. Ayúdame a elegir los errores, cómo puntuar y cómo encajarlo como calentamiento de otra práctica.
```

### 4. Estaciones rotativas de gesto crítico (para pocos equipos)

**Resumen.** Con pocos equipos, el grupo rota por 3 estaciones de unos 12 min: (a) RAM, sacar y colocar módulos hasta oír el clic sin fuerza y reconocer la muesca DDR4/DDR5; (b) disipador, una gota de pasta del tamaño de un guisante, apretar en cruz y ver la huella; (c) cabeceras del panel frontal sobre una placa vieja con una guía impresa. Una cuarta (el A5 en papel) puede absorber al grupo que espera.

**Base.**
- `direct:` CS:353 «menos es más: basta con una gota del tamaño de un guisante»; CS:357 (E11) «atornillar el disipador en cruz»; CS:403 sobre la muesca que impide pinchar DDR5 en DDR4.
- `reasoned:` un único equipo entero para 15-20 personas deja a la mayoría mirando; estaciones cortas y paralelas reparten el tiempo de manos en cada pieza.

**Por qué importa.** Resuelve la falta de equipos y hace que cada alumno repita el gesto crítico de cada pieza.

**Tamaño.** M. Tiempos: 4 estaciones de 12 min no dejan margen para cambios; usa 3 estaciones de 10-12 min. Material: placas, CPU y disipadores retirados.

**Take it further.**
```
/supermatt:grill-with-docs Quiero preparar una sesión de ampliación del módulo 3029 (Grado Básico, 1.º) con rotación por 3 estaciones de ~12 min cuando hay pocos equipos: RAM (clic y muesca DDR4/DDR5), disipador (gota de pasta del tamaño de un guisante, apriete en cruz) y cabeceras del panel frontal sobre una placa vieja. Base: contenido/piezas/mm/microinformatica/componentes-sistemas-microinformaticos.md:353 (pasta térmica), :357 (E11, apretar en cruz) y :403 (muesca DDR5/DDR4). Importa porque da a todo el grupo tiempo de manos en el gesto crítico de cada pieza. Ayúdame a decidir el material mínimo, la guía de cada estación y cómo comprobar que cada alumno lo ha hecho bien.
```

### 5. Deducir el orden de montaje con una ficha de decisión

**Resumen.** En lugar de dar pasos numerados, el docente entrega las piezas y una ficha con solo preguntas de control (¿qué lo bloquea?, ¿qué cable lo alimenta?, ¿qué lo identifica?). Cada pareja escribe el orden de montaje que deduce con el manual de la placa. Otra pareja lo ejecuta al pie de la letra y se ve dónde falla (por ejemplo, la CPU y su refrigeración antes de fijar la placa a la caja).

**Base.**
- `direct:` CE:1127 «El orden también forma parte de la seguridad», tratado hoy como lista fija.
- `reasoned:` un procedimiento dado se sigue sin entenderlo; uno que se escribe y se prueba con otra pareja expone los huecos de razonamiento y se transfiere a un equipo distinto.

**Por qué importa.** Pasa el repaso de «recordar pasos» a «entender por qué ese orden».

**Tamaño.** M. Deducir el orden sin apoyo es difícil para Grado Básico: hace falta el manual de la placa (CS:209 lo recomienda) y, si hace falta, pistas escalonadas.

**Take it further.**
```
/supermatt:grill-with-docs Quiero diseñar una actividad de ampliación del módulo 3029 (Grado Básico, 1.º) en la que el alumnado deduzca el orden de montaje de un sobremesa con una ficha de preguntas de control (en vez de pasos numerados) y otra pareja lo ejecute al pie de la letra para ver dónde falla. Base: contenido/piezas/mm/componentes/componentes-electricos.md:1127 ("El orden también forma parte de la seguridad", hoy como lista fija); apoyo en el manual de la placa (componentes-sistemas-microinformaticos.md:209). Importa porque convierte el repaso en entender por qué ese orden. Ayúdame a ajustar la dificultad para Grado Básico y a escribir la ficha.
```

### 6. Avería sembrada que se convierte en caso publicado («El PC que no arranca»)

**Resumen.** Combina el taller de averías (idea 2) con un caso del repo. La sesión se plantea como historia con cliente ficticio y un equipo con 2-3 averías encadenadas; lo que el alumnado anota (hipótesis, pruebas, fallos) es el borrador de un caso `tipo: caso` con `horas`, que el docente redacta después y que ya se puede dar cada curso.

**Base.**
- `direct:` `contenido/piezas/psp/multihilo/problema-barbero.md:1-9`, cabecera con `tipo: caso`, `horas: 3`, `resumen` y `fuentes`, y `# El encargo` en l.11; el README describe los casos como «ejercicios completos de principio a fin, casi siempre dentro de una historia».
- `direct:` CS:635-657, no hay ningún caso ni práctica de diagnóstico en `mm`.
- `reasoned:` el repo publica en web y PDF, así que cada caso es material que no se prepara dos veces.

**Por qué importa.** Convierte una hora de aula en un activo permanente del repo.

**Tamaño.** L (el trabajo de redacción es posterior al aula). Hay 9 casos en el repo y ninguno en `mm`, así que sería el primero de esa carpeta; confirma que `mm` lo admite sin ajustes.

**Take it further.**
```
/supermatt:grill-with-docs Quiero convertir una sesión de averías sembradas en un caso práctico publicable para el módulo 3029 (Grado Básico, 1.º): "El PC que no arranca", con cliente ficticio y 2-3 averías encadenadas. Base: el formato de caso de contenido/piezas/psp/multihilo/problema-barbero.md:1-11 (tipo: caso, horas, resumen, fuentes, "# El encargo"), que no existe todavía en contenido/piezas/mm; y el hueco de diagnóstico de contenido/piezas/mm/microinformatica/componentes-sistemas-microinformaticos.md:635-657. Importa porque la sesión produciría un caso reutilizable cada curso. Ayúdame a definir las averías, el hilo narrativo, las horas y cómo registrar en clase lo que luego será el borrador.
```

### 7. «PC humano»: montaje sin equipos, con instructor ciego

**Resumen.** Sin ningún ordenador: un alumno hace de instructor ciego (solo da órdenes verbales) y otro de manos, que monta con tarjetas de piezas impresas (placa, RAM, CPU, ventilador, fuente, cables con las cabeceras rotuladas). Luego se invierten los roles. Hay que describir sin jerga ambigua («el conector de 24 patillas, el más ancho»).

**Base.**
- `direct:` CS:90, CS:147 y CS:183 definen el vocabulario (caja y fuente, conectores, placa base) que la actividad hace practicar.
- `reasoned:` describir un montaje sin señalar obliga a nombrar cada pieza y su conector y a recordar el orden; es el mecanismo del ejercicio de comunicación referencial, de uso común en la didáctica de lenguas.

**Por qué importa.** Es el plan B si faltan equipos o el aula no deja desmontar, y refuerza el vocabulario de la ut2 sin abrir una caja.

**Tamaño.** S. 45 min y un juego de tarjetas impreso por mesa. Es un repaso de vocabulario, no de destreza manual; no sustituye a la 1 o la 2.

**Take it further.**
```
/supermatt:grill-with-docs Quiero preparar un plan B de repaso para el módulo 3029 (Grado Básico, 1.º) para cuando no hay equipos: un "PC humano" en el que un alumno da órdenes verbales sin señalar (instructor ciego) y otro monta con tarjetas de piezas impresas, y luego se invierten. Base: el vocabulario de contenido/piezas/mm/microinformatica/componentes-sistemas-microinformaticos.md:90, :147 y :183 (caja, conectores de la fuente, placa base); el mecanismo es el de la comunicación referencial. Importa porque da una sesión de repaso sin equipos. Ayúdame a diseñar las tarjetas, las reglas y cómo evaluarlo.
```

## Cut

| Idea | Motivo |
| --- | --- |
| Montaje/desmontaje guiado por fotos y bandeja (dolor 1), Desmontaje a ciegas (inversión 1), «Montar el manual» (supuestos 1), Ficha de registro reutilizable (apalancamiento 1), Registro autorrellenable (inversión 5) | Duplicado de la 1, que las absorbe |
| Rúbrica de una página evaluada entre iguales (apalancamiento 2), Montaje con «errores a la vista» entre compañeros (dolor 4) | Duplicado de la 1 (es su fase de auditoría) |
| Cuadre de tornillos tipo quirófano (supuestos 3) | Se integra en la 1: sola solapa con la bandeja de CE:1139 |
| Experimento de lista «de memoria» frente a «llamada y respuesta» (aviación) | Base débil: con 2 errores sembrados y pocas parejas no hay datos comparables; es una demostración, no una medida |
| Aprendizaje por enseñanza / puzle de Aronson | Un jigsaw completo no cabe con calidad en 50-60 min con Grado Básico; deja huecos sin corregir |
| Protocolo de apagado en voz alta (dolor 6) | Ya cubierto en parte (CE:1200 y CS:13) y poco novedoso; «pulsar el botón para descargar» no está en los apuntes y exige validación del docente. Úsalo como rutina de arranque dentro de otras ideas |
| Carrera de boxes, un equipo por persona (supuestos 6) | Inviable: exige tantos equipos como alumnos y puntuar el tiempo incentiva saltarse CE:1136 |
| A5 (800 €) llevado a piezas reales | Débil: A5 es un ejercicio de tienda online; las piezas del aula no coinciden con las elegidas. Mejor una tabla de compatibilidad sobre el inventario real |
| Ficha E19 de entrada y salida | Débil: E19 pide fuente, refrigeración y ranuras libres, que CPU-Z y msinfo32 no muestran; antes/después idénticas solo prueban que arranca, no que el montaje sea correcto |
| Cacería de errores (dolor 2) y puesto invertido (inversión 6) | Duplicado de la 3, que las absorbe |
| Combinación: averías + experimento de listas | Depende del experimento, descartado |
| Combinación: remontaje + ficha E19 | Depende de la E19, descartada |
| Combinación: estaciones + avería sembrada | Absorbida por la 4 (una estación con equipo averiado) |
