---
titulo: "Gatos: los gatos de Elpis"
licencia: CC-BY-NC-SA-4.0
tipo: caso
horas: 5
---

# Elpis · Expediente 01: los gatos desaparecidos

En Elpis, los comerciantes colocan pequeñas figuras de gatos en sus escaparates. Algunas sirven para sujetar recibos en las mesas; otras llevan décadas acompañando a sus propietarios y vigilando las tiendas. Durante la última semana han desaparecido varias estatuillas en distintos lugares del distrito 6. No hay ningun rastro de la desaparición. El detective **Andrea Windrose** recibe el encargo de investigar todas estas desapariciones.. 

Para avanzar, Andrea necesita un registro fiable. Tu trabajo será preparar y administrar **el directorio de lugares y personas de Elpis** con la esperanza de encontrar alguna pista que permita reconstruir lo ocurrido.

::: tip
Elpis será el escenario común de nuestras investigaciones. Andrea Windrose es el detective que coordina los casos; tú su fiel ayudante encargado de administrar los servicios que necesita para resolverlos. 
:::

::: nota
*La investigación, los oficios y los datos de contacto son ficticios.*
:::

# 1. Resultados de aprendizaje

Al terminar podrás consultar entradas y atributos, dar de alta lugares y personas, automatizar una importación, eliminar registros incorrectos y modificar datos. El último expediente reunirá todas esas operaciones.

Trabajaremos con **OpenLDAP y las herramientas de terminal**: `ldapsearch`, `ldapadd`, `ldapmodify` y `ldapdelete`. Guardaremos los cambios en archivos LDIF y verificaremos su efecto mediante consultas.

**Una entrada LDAP no es automáticamente una cuenta local del servidor.** No utilizaremos `useradd` ni configuraremos el inicio de sesión de Linux con las personas de esta práctica. El directorio tampoco almacenará archivos dentro de supuestos directorios personales.

# 2. Preparación: el archivo municipal

Utiliza la máquina GNU/Linux preparada para la asignatura. Antes de empezar, anota la distribución y versión del laboratorio utilizado.

```bash
sudo apt update
sudo apt install slapd ldap-utils
```

Si trabajas sobre una instalación nueva, configura el sufijo indicado con ayuda del docente. No reconfigures una instancia que contenga otras prácticas sin conservar sus datos.

| Dato | Valor del laboratorio |
| --- | --- |
| Dominio lógico | `elpis.anhidro` |
| DN base | `dc=elpis,dc=anhidro` |
| DN de administración previsto | `cn=admin,dc=elpis,dc=anhidro` |
| URI de las operaciones iniciales | `ldap://localhost` |

En Debian/Ubuntu, el asistente `sudo dpkg-reconfigure slapd` permite preparar el dominio de una instalación nueva. El docente verificará la base y el DN administrativo resultantes. La base debe existir antes de cargar las unidades organizativas.

Realiza inicialmente las operaciones **en la terminal del servidor**, contra `localhost`. No envíes la contraseña administrativa mediante LDAP sin cifrar por una red. Si utilizas un cliente remoto, configura y verifica previamente TLS.

::: aviso
Utiliza `-W` para introducir la contraseña de forma interactiva. No la escribas dentro de scripts, archivos LDIF o comandos con `-w`. No necesitas MySQL para almacenar este directorio: OpenLDAP dispone de su propio backend.
:::

## 2.1. Estructura común de Elpis

Elpis se distribuye siguiendo la siguiente estructura. 

```text
dc=elpis,dc=anhidro
├── ou=lugares
│   └── ou=distrito6
│       ├── ou=archivo
│       ├── ou=mercado
│       ├── ou=muelle
│       └── ou=taller
└── ou=personas
    ├── uid=andrea.windrose
    └── ...
```

Los lugares se representarán como unidades organizativas (`organizationalUnit`); las personas, como `inetOrgPerson`. Mantendremos las personas en una rama común, aunque cambien de lugar de trabajo. Su atributo `ou` registrará el identificador del lugar al que están asociadas.

| Entrada | Atributos que utilizaremos |
| --- | --- |
| Lugar | `ou`, `description`, `telephoneNumber` |
| Persona | `uid`, `cn`, `sn`, `givenName`, `mail`, `telephoneNumber`, `ou`, `description` |

Los nombres y apellidos pueden contener tildes. Los identificadores y archivos se escribirán sin espacios ni tildes para facilitar los primeros comandos. Guarda los LDIF en UTF-8 y separa las entradas con una línea en blanco.

::: nota
El atributo `ou: mercado` de una persona es un dato descriptivo. **No crea una relación automática ni una clave foránea** con `ou=mercado,ou=distrito6,ou=lugares,...`. Tendrás que comprobar su coherencia.
:::

# 3. Caso I: una ciudad, cuatro fuentes

Andrea visita el archivo, el mercado, el muelle y un taller. Cada responsable le entrega una ficha. Antes de buscar sospechosos necesita ordenar esta información.

## Datos recopilados

Despues de un duro dia de trabajo Andrea obtiene los siguientes datos.

| Identificador del lugar | Descripción inicial | Teléfono |
| --- | --- | --- |
| archivo | Archivo de Amaurota | +34 900 000 101 |
| mercado | Mercado de la Selva Oscura | +34 900 000 102 |
| muelle | Oficina del Muelle del Anhidro | +34 900 000 103 |
| taller | Taller de restauración del Empíreo | +34 900 000 104 |

| UID | Nombre completo | Nombre | Apellido | Lugar | Correo | Teléfono |
| --- | --- | --- | --- | --- | --- | --- |
| andrea.windrose | Andrea Windrose | Andrea | Windrose | archivo | andrea.windrose@elpisdetective.am | +34 900 001 001 |
| raphael.hythloday | Raphael Hythloday | Raphael | Hythloday | archivo | raphael.hythloday@amaurotarchive.am | +34 900 001 002 |
| dante.alighieri | Dante Alighieri | Dante | Alighieri | mercado | dante.alighieri@selvaoscura.am | +34 900 001 003 |
| thomas.more | Thomas More | Thomas | More | muelle | thomas.more@muelleanhidro.am | +34 900 001 004 |
| beatrice.portinari | Beatrice Portinari | Beatrice | Portinari | taller | beatrice.portinari@talleresempireo.am | +34 900 001 005 |

1. Crea `base.ldif` con las ramas `lugares` y `personas`, el contenedor `distrito6` dentro de `lugares` y las cuatro unidades de los lugares dentro del distrito.
2. Crea `personas.ldif` con las cinco personas. Utiliza `objectClass: inetOrgPerson` e incluye los atributos obligatorios `cn` y `sn`, además de los datos de la tabla.
3. Importa ambos archivos mediante `ldapadd`, en ese orden.
4. Consulta los lugares y las personas. Comprueba que no has creado entradas duplicadas.

Patrón de importación, adaptando el nombre del archivo:

```bash
ldapadd -x -H ldap://localhost -D 'cn=admin,dc=elpis,dc=anhidro' -W -f base.ldif
```

## Consulta de información

Prepara `consultas.txt` con los comandos y sus resultados:

- Personas asociadas al mercado: mostrar UID, nombre y correo.
- Datos de contacto de Thomas More.
- Lugares con un teléfono registrado.
- Personas cuyo apellido comience por `H`.
- Los cuatro lugares inmediatamente inferiores a `ou=distrito6,ou=lugares,dc=elpis,dc=anhidro`, utilizando ámbito `one`.

En cada consulta indica **base, ámbito, filtro y atributos solicitados**. Guarda también una consulta completa de la rama como evidencia inicial.

::: tip
Consulta con la misma identidad administrativa para obtener resultados comparables. Que una búsqueda anónima no muestre datos no demuestra que las entradas no existan: puede deberse a los permisos.
:::

**Entrega del caso:** los dos LDIF y el archivo de consultas. Deben existir cuatro lugares y cinco personas.

# 4. Caso II: un nuevo contacto

Publio Virgilio Marón, conocido como Virgilio, llega al despacho de Andrea. Es su contacto en el Mercado de la Selva Oscura: conoce sus pasajes y a quienes trabajan en ellos. Vio una caja marcada con un gato azul junto a un puesto cerrado y se ofrece a orientar al detective en sus primeras pesquisas. Su ficha todavía no figura en el archivo.

Crea `alta-testigo.ldif` con estos datos:

| Atributo | Valor |
| --- | --- |
| `uid` | `virgilio.maron` |
| `cn` | Publio Virgilio Marón |
| `givenName` | Publio Virgilio |
| `sn` | Marón |
| `mail` | virgilio.maron@selvaoscura.am |
| `telephoneNumber` | +34 900 001 006 |
| `ou` | mercado |
| `description` | Testigo del caso de los gatos azules |

Importa la entrada y comprueba su DN y todos sus atributos. Repite la búsqueda de personas del mercado: ahora deben aparecer Dante y Virgilio.

**Entrega del caso:** LDIF, comando de alta y consulta de verificación. Deben existir seis personas.

# 5. Caso III: La guardia nocturna

El muelle entrega cuatro fichas pendientes de digitalizar. Andrea necesita incorporar el lote completo y no quiere copiar cada registro a mano.

Guarda estos datos como `turno-noche.csv`, con separador `;`:

```csv
uid;givenName;sn;mail;telephoneNumber;ou
ada.luna;Ada;Luna;ada.luna@guardianocturna.am;+34 900 001 007;muelle
omar.rios;Omar;Ríos;omar.rios@guardianocturna.am;+34 900 001 008;muelle
eva.lago;Eva;Lago;eva.lago@guardianocturna.am;+34 900 001 009;mercado
teo.mar;Teo;Mar;teo.mar@guardianocturna.am;+34 900 001 010;taller
```

Desarrolla `importar-personas.py` o `importar-personas.sh` para:

1. Leer el archivo omitiendo la cabecera.
2. Comprobar campos obligatorios y UID repetidos dentro del lote.
3. Consultar si los UID ya existen antes de preparar el alta.
4. Generar `importacion.ldif`, construyendo `cn` a partir del nombre y apellido.
5. Añadir solo las personas nuevas mediante `ldapadd`.
6. Mostrar cuántas entradas ha añadido, omitido o no ha podido importar.

Puedes separar la generación y la ejecución en dos fases para revisar el LDIF antes de aplicarlo. Las credenciales se introducirán de forma interactiva al realizar las operaciones LDAP.

::: nota
El script debe reconocer el formato de este CSV de práctica. Si quieres admitir textos arbitrarios, deberás contemplar el escape de DN y las reglas LDIF, incluidos valores que requieran Base64. No basta con concatenar cualquier texto recibido.
:::

Ejecuta el procedimiento una segunda vez. **No debe duplicar entradas ni modificar las existentes sin avisar previamente.** Una importación por lotes puede completarse solo parcialmente: registra los errores y verifica el estado real antes de reintentar.

**Entrega del caso:** CSV, script, LDIF generado y resultados de las dos ejecuciones. Tras la primera importación correcta deben existir diez personas; tras la segunda, también diez.

## Caso III.2: Consulta de clientes

Dante Alighieri quiere comprobar qué datos personales conserva el despacho de Andrea sobre él. No necesita consultar los teléfonos de otros afectados ni las anotaciones internas de la investigación.

Andrea autoriza la consulta desde un equipo cliente, pero establece una condición: cada persona podrá consultar únicamente su propia ficha y los atributos autorizados.

### Preparación

Utilizaremos una segunda máquina con las herramientas cliente de LDAP. El docente facilitará la dirección del servidor, la identidad de prueba y los elementos necesarios para establecer una conexión protegida mediante TLS.

No utilizarás la cuenta administrativa para realizar estas comprobaciones.

### Elaboración

1. Conéctate al servidor desde la máquina cliente utilizando la identidad de Dante.
2. Consulta su nombre, correo, teléfono y lugar asociado.
3. Amplía la búsqueda para solicitar todas las personas del directorio. Comprueba que únicamente puedes consultar tu propia ficha.
4. Intenta consultar expresamente la ficha de Beatrice. No debes obtener sus datos.
5. Solicita las anotaciones internas de tu propia ficha. Tampoco deben mostrarse.
6. Intenta modificar tu teléfono. La operación debe ser rechazada: tienes permiso de consulta, no de modificación.
7. Repite las consultas con una segunda identidad facilitada por el docente y compara los resultados.

::: aviso
**Un filtro de búsqueda no protege la información.** Cualquier cliente puede cambiarlo. Es el servidor quien debe aplicar los permisos según la identidad autenticada.
:::

### Entrega

Recoge los comandos, la identidad utilizada y los resultados en `acceso-cliente.md`, sin incluir contraseñas.

Explica:

- ¿Qué diferencia hay entre identificarte y tener permiso para consultar?
- ¿Por qué cambiar el filtro no permite ver otras fichas?
- ¿Por qué consultar tu información no implica poder modificarla?

# 6. Caso IV: Siguiendo el rastro

Una revisión detecta una ficha que no corresponde a ninguna persona. Alguien intentó registrar a «Testigo Fantasma» como empleado del muelle. Andrea autoriza retirar únicamente ese registro de prueba, conservando constancia de la operación.

Para reproducir el incidente, crea primero esta entrada ficticia mediante un LDIF:

- DN: `uid=testigo.fantasma,ou=personas,dc=elpis,dc=anhidro`.
- Clase: `inetOrgPerson`.
- `uid`: `testigo.fantasma`.
- `cn`: `Testigo Fantasma`.
- `sn`: `Fantasma`.
- `ou`: `muelle`.
- `description`: `Registro de prueba incorrecto; baja autorizada en expediente 01`.

Después:

1. Consulta el DN exacto y conserva sus atributos en `antes-baja.ldif`, usando `ldapsearch -LLL` para guardar una salida LDIF sin comentarios de presentación.
2. Elimina **solo esa entrada** mediante `ldapdelete`.
3. Comprueba su ausencia y que las diez personas válidas siguen presentes.
4. Registra el comando y el motivo de la baja en `baja.txt`.

::: aviso
No programes borrados periódicos ni selecciones una persona por tener el UID más alto. La baja corresponde a **un DN concreto y una decisión documentada**. Conserva las evidencias fuera de la rama que vas a modificar.
:::

# 7. Caso V: Errores en la informacion.

El número de Thomas More estaba mal transcrito. Además, Beatrice Portinari ha pasado a trabajar en el archivo y Virgilio facilita un segundo teléfono de contacto.

Prepara `07-modificaciones.ldif` con operaciones `changetype: modify`:

| Entrada | Operación solicitada |
| --- | --- |
| `thomas.more` | Reemplazar el teléfono por `+34 900 002 004`. |
| `beatrice.portinari` | Reemplazar `ou: taller` por `ou: archivo`.  |
| `beatrice.portinari` | Reemplazar `mail:beatrice.portinari@talleresempireo.am` por `mail:beatrice.portinari@amaurotarchive.am`.  |
| `virgilio.maron` | Añadir el teléfono `+34 900 002 006`, conservando el anterior. |
| `virgilio.maron` | Eliminar únicamente el valor de descripción `Testigo del caso de los gatos azules`. |

Aplica el archivo con `ldapmodify` y verifica los cambios mediante búsquedas. Virgilio debe conservar sus dos teléfonos y Beatrice debe aparecer en la consulta de personas del archivo.

::: tip
Cambiar el atributo `ou` de Beatrice no cambia su DN: sigue dentro de `ou=personas`. Mover o renombrar una entrada es una operación distinta y no es necesario para este caso.
:::

**Entrega del caso:** LDIF, comandos y comparación antes/después. Deben seguir existiendo diez personas.

# 8. Caso final: El almacén del gato azul

La caja vista por Virgilio ha aparecido en un almacén sin registrar. Dentro hay figuras de distintos comercios y varias fichas de reparto. Andrea necesita que actualices el directorio, incorpores los testimonios y retires un registro falso antes de devolver los objetos.

Este expediente se realiza **sobre el estado final de los casos anteriores**. No empieces desde un directorio vacío.

## 8.1. Recopilar

Exporta el estado inicial de las ramas de personas y lugares. Obtén una lista de contactos del mercado y del muelle, sin incluir otros lugares. Conserva UID, nombre, teléfonos y correo.

## 8.2. Incorporar el nuevo lugar

Crea `ou=almacen,ou=distrito6,ou=lugares,dc=elpis,dc=anhidro`, con descripción `Almacén del Muelle` y teléfono `+34 900 000 105`.

## 8.3. Automatizar las nuevas altas

Utiliza tu script del caso III con este lote:

```csv
uid;givenName;sn;mail;telephoneNumber;ou
lina.ortiz;Lina;Ortiz;lina.ortiz@elpis.am;+34 900 001 011;almacen
dario.vera;Darío;Vera;dario.vera@elpis.am;+34 900 001 012;almacen
sara.niebla;Sara;Niebla;sara.niebla@elpis.am;+34 900 001 013;mercado
```

Comprueba que las tres entradas son nuevas y que repetir el lote no las duplica.

## 8.4. Corregir y retirar

- Sustituye el teléfono de Lina por `+34 900 003 011`.
- Actualiza la descripción del almacén a `Almacén del Muelle; inventario revisado por Andrea Windrose`.
- Añade a Darío la descripción `Responsable de la devolución de las figuras`.
- Crea, consulta, documenta y elimina una ficha ficticia `uid=repartidor.falso` en la rama de personas, con `cn: Repartidor Falso`, `sn: Falso` y `ou: almacen`. Su existencia permite practicar una baja independiente de los casos anteriores.

## 8.5. Cerrar el expediente

Genera consultas que demuestren:

- Existen **cinco lugares y trece personas** válidas.
- Lina y Darío están asociados al almacén.
- El teléfono anterior de Lina ya no figura en su entrada.
- La descripción del almacén está actualizada.
- `repartidor.falso` y `testigo.fantasma` no existen.
- Las modificaciones de Thomas, Beatrice y Virgilio siguen presentes.

Los recuentos deben filtrar por las clases o ramas adecuadas, sin contar la base ni los contenedores como personas o lugares finales.

**Entrega:** una carpeta `expediente-01` con los CSV, scripts, LDIF, consultas y un `informe.md` que explique el orden de las operaciones, las incidencias y las verificaciones. Conserva el código de salida de las operaciones y no ocultes una importación parcial.

::: nota
La consulta LDAP acredita el estado del registro, no la culpabilidad de una persona. Andrea necesita datos fiables para continuar la investigación; las conclusiones del caso no deben confundirse con los resultados técnicos de una búsqueda.
:::

## Cierre

Las figuras han sido recuperadas y Andrea puede organizar su devolución. Cuando parece que el trabajo ha terminado, Virgilio descubre una pequeña marca azul en la base de uno de los gatos: un círculo incompleto atravesado por tres líneas.

Las demás figuras tienen la misma marca. No aparece en las fotografías que conservan sus propietarios.

Dentro de una caja, Andrea encuentra una hoja con los nombres del archivo, el mercado, el muelle y el taller. Junto a cada lugar hay una fecha. La última corresponde a mañana y señala un edificio que no aparece en este expediente.

Andrea vuelve a abrir su cuaderno. Alguien ha reunido las figuras, ha observado los movimientos del distrito y ha conseguido que todos mirasen hacia el almacén.

**Expediente 01: objetos recuperados; autoría y finalidad pendientes.**

::: nota
Conserva las evidencias de este expediente. En próximas investigaciones podrían aparecer datos que permitan interpretar lo que hoy parece un detalle sin importancia.
:::

# 9. Criterios de revisión

| Aspecto | Evidencia |
| --- | --- |
| Organización del directorio | DN y clases coherentes; lugares y personas separados. |
| Consultas | Base, ámbito, filtro y atributos correctamente elegidos. |
| Altas | LDIF válido y verificación posterior. |
| Automatización | Lectura de CSV, tratamiento de duplicados y registro de resultados. |
| Bajas | DN exacto, evidencia previa y comprobación posterior. |
| Modificaciones | Uso correcto de add, replace y delete sobre atributos. |
| Caso integrado | Estado final consistente y documentación reproducible. |

TLS, replicación, autenticación del sistema operativo y gestores gráficos podrán trabajarse en actividades específicas de Elpis. No son requisitos de este expediente, cuyo objetivo es administrar entradas del directorio desde terminal.
