---
titulo: "Active Directory"
licencia: CC-BY-NC-SA-4.0
---

Este es tu material de estudio del bloque. Está escrito para que lo puedas leer con calma y entender no solo *cómo* se hace cada cosa, sino *por qué* se hace así. En el bloque 1 viste que las organizaciones centralizan sus cuentas de usuario en un directorio. Aquí vas a conocer el directorio más extendido del mundo empresarial, [Active Directory](https://es.wikipedia.org/wiki/Active_Directory), y vas a aprender a montarlo y gobernarlo con Windows Server 2022.

Todo lo que ves aquí lo vas a poner en práctica después, construyendo tu propio dominio desde cero. Si lees la teoría con la práctica en mente, verás que muchas piezas que ahora parecen abstractas encajan solas.

# Qué vas a aprender

Al terminar el bloque deberías ser capaz de:

- Explicar qué es un dominio, un controlador de dominio, un árbol y un bosque.
- Distinguir la estructura lógica de Active Directory de la física, y saber dónde guarda sus datos.
- Entender por qué Active Directory depende del DNS y qué papel juegan los registros SRV.
- Instalar el rol de Active Directory y promocionar un servidor a controlador de dominio.
- Unir un equipo cliente al dominio y diferenciar entre iniciar sesión en el dominio o en local.
- Organizar usuarios, equipos, grupos y unidades organizativas, y aplicar la estrategia AGDLP.
- Configurar perfiles, carpetas personales y directivas de grupo, y diagnosticar por qué una directiva no se aplica.
- Delegar tareas de administración sin dar permisos de administrador del dominio.
- Manejar las herramientas de administración, tanto gráficas como de PowerShell.

:::nota
El DNS se estudia a fondo en SER. Aquí solo veremos lo imprescindible para entender por qué Active Directory no funciona sin él.
:::

# 1. Qué es un dominio y qué piezas tiene

En el bloque 1 aprendiste que un **dominio** es un conjunto de equipos que confían en un servidor central de cuentas. Vamos a ponerle nombre a cada una de las piezas, porque a partir de ahora las vas a usar constantemente.

## Dominio y controlador de dominio

El **dominio** es la unidad básica de Active Directory. Es una frontera de administración y de seguridad: dentro de él hay usuarios, equipos y grupos que comparten una misma base de datos de cuentas y unas mismas políticas.

El servidor que guarda esa base de datos y atiende las peticiones de inicio de sesión se llama **controlador de dominio** (*domain controller*, o **DC**). Cuando alguien escribe su usuario y contraseña en un equipo del dominio, ese equipo no comprueba nada por su cuenta: le pregunta al controlador de dominio.

:::tip
En una red real nunca hay un único controlador. Se instalan al menos dos, de forma que si uno falla el otro sigue atendiendo a los usuarios. En las prácticas tendrás uno solo para simplificar, pero conviene que sepas que en producción eso sería una mala idea.
:::

## Árbol y bosque

Una organización pequeña tiene un solo dominio, y con eso le basta. Pero las empresas grandes pueden necesitar varios, por ejemplo uno por país o uno por empresa filial. Active Directory los agrupa así:

- Un **árbol** es un conjunto de dominios que comparten un espacio de nombres continuo. Si el dominio principal es `empresa.com`, un dominio hijo sería `madrid.empresa.com`. Se nota en el nombre, porque el hijo "cuelga" del padre.
- Un **bosque** (*forest*) es un conjunto de uno o más árboles que comparten el mismo esquema y la misma configuración. Es el límite de seguridad más alto de Active Directory. El primer dominio que creas es el **dominio raíz del bosque**.

Piensa en un bosque como una familia extensa. Cada dominio es una casa, y las casas que llevan el mismo apellido forman un árbol. El bosque es toda la familia, incluidos primos con otro apellido.

## Relaciones de confianza

Una **relación de confianza** permite que los usuarios de un dominio accedan a recursos de otro. Dentro de un mismo bosque, las confianzas se crean solas y son transitivas: si A confía en B y B confía en C, entonces A confía en C. Entre bosques distintos hay que crearlas a mano.

Fíjate en un detalle importante: confiar no significa tener permisos. La confianza solo dice "reconozco a tus usuarios". Después hay que darles permisos sobre cada recurso.

## Catálogo global

Cuando hay muchos dominios, buscar un objeto (un usuario, por ejemplo) en todos ellos sería lento. El **catálogo global** (*global catalog*) es una copia parcial de todos los objetos del bosque, con solo los atributos más usados. Sirve para buscar rápido en todo el bosque y para saber a qué grupos universales pertenece un usuario al iniciar sesión. Lo guardan los controladores que se designan para ello, y escucha en los puertos 3268 y 3269.

:::nota[En resumen]
El dominio es la unidad básica y el controlador de dominio es el servidor que guarda las cuentas. Varios dominios con nombres encadenados forman un árbol, y uno o más árboles forman un bosque. Las confianzas permiten reconocer usuarios de otros dominios, y el catálogo global permite buscar en todo el bosque.
:::

:::pregunta[¿Cuál es la diferencia entre un dominio, un árbol y un bosque?]
El dominio es la unidad básica, con su propia base de datos de cuentas. Un árbol es un conjunto de dominios con un espacio de nombres continuo (`empresa.com` y `madrid.empresa.com`). Un bosque agrupa uno o más árboles que comparten esquema y configuración, y es el límite de seguridad más alto.
:::

# 2. Cómo está organizado Active Directory por dentro

Active Directory se puede mirar desde dos puntos de vista distintos: cómo lo organizas tú para administrarlo (parte lógica) y dónde está cada cosa físicamente (parte física).

## Parte lógica

Es lo que ves cuando abres las herramientas de administración:

- **Dominio:** la unidad que ya conoces.
- **Unidades organizativas** (**OU**, de *organizational unit*): contenedores que sirven para ordenar los objetos del dominio. Piensa en carpetas, pero con una diferencia importante: sobre una OU se pueden **aplicar directivas** y **delegar administración**.
- **Objetos:** lo que hay dentro de las OU, es decir, usuarios, equipos, grupos, impresoras...

Cada objeto tiene **atributos**: un usuario tiene nombre, apellidos, nombre de inicio de sesión, teléfono, departamento... Esos atributos son los datos que consultan los demás servicios.

:::aviso
Al crear un dominio, Active Directory trae unos contenedores por defecto, llamados `Users` y `Computers`. **No son OU**. No se les pueden aplicar directivas de grupo directamente. Por eso en una organización bien montada se crean OU propias y se mueven los objetos allí.
:::

## Parte física

Es dónde viven realmente los datos:

- **Controladores de dominio:** los servidores. Cada uno guarda una copia completa de la base de datos del dominio y se mantienen sincronizados entre sí (esto es la *replicación*, que verás al final).
- **Sitios:** representan la red física, normalmente una oficina o una sede conectada con otras por enlaces más lentos. Se usan para que los equipos hablen con el controlador que tengan más cerca y para controlar cuándo se replica entre sedes.

## Dónde se guardan los datos

Hay tres elementos que conviene que reconozcas, porque si un día algo falla tendrás que saber dónde mirar:

| Elemento | Qué es | Dónde está |
| --- | --- | --- |
| **Esquema** | La "plantilla" que define qué tipos de objeto existen y qué atributos puede tener cada uno. Es único para todo el bosque | Dentro de la base de datos |
| **NTDS.dit** | El archivo de la base de datos de Active Directory: cuentas, grupos, contraseñas (cifradas)... | `C:\Windows\NTDS` |
| **SYSVOL** | Carpeta compartida con los archivos que los clientes necesitan descargar: las directivas de grupo y los scripts de inicio de sesión | `C:\Windows\SYSVOL` |

La carpeta SYSVOL se comparte en la red como `\\nombre-del-dominio\SYSVOL`, y también aparece otra llamada `NETLOGON` para los scripts. Cuando un equipo aplica una directiva, la descarga de ahí.

:::tip
Por eso nunca se deben guardar archivos personales ni cosas grandes en SYSVOL. Está pensada para ser pequeña, porque se replica entre todos los controladores.
:::

:::nota[En resumen]
Lógicamente, un dominio contiene OU y objetos. Físicamente, se compone de controladores y sitios. Los datos importantes están en el archivo NTDS.dit (la base de datos) y en la carpeta SYSVOL (directivas y scripts).
:::

:::pregunta[¿Para qué sirve la carpeta SYSVOL y qué se guarda en ella?]
Es una carpeta compartida que se replica entre los controladores de dominio. Guarda las directivas de grupo y los scripts de inicio de sesión, que los clientes descargan de ahí.
:::

:::pregunta[¿Por qué `Users` y `Computers` no sirven para aplicar directivas, y qué se hace en su lugar?]
Porque son contenedores y no unidades organizativas, así que no se les pueden aplicar directivas de grupo directamente. Se crean OU propias y se mueven los objetos allí.
:::

# 3. Active Directory y el DNS

Hay una frase que se repite mucho entre administradores: **"si algo falla en Active Directory, empieza mirando el DNS"**. Y es verdad la mayoría de las veces.

El motivo es sencillo. Cuando un equipo quiere iniciar sesión en el dominio, lo primero que necesita saber es **dónde está el controlador de dominio**. No puede adivinarlo, así que se lo pregunta al DNS.

## Registros SRV

Un nombre normal de DNS (un registro A) responde a "¿qué IP tiene este equipo?". Pero aquí la pregunta es otra: "¿qué equipo ofrece *este servicio* en el dominio?". Para eso existen los **registros SRV**, que indican qué máquina ofrece un servicio concreto y en qué puerto.

Cuando promocionas un servidor a controlador de dominio, este registra automáticamente varios SRV en el DNS, por ejemplo uno que dice "el servicio Kerberos del dominio lo da este servidor" y otro que dice "el servicio LDAP lo da este otro". Los clientes consultan esos registros y así encuentran al DC sin que nadie les diga su IP.

## Qué DNS deben usar los equipos

De aquí sale una regla de oro que vas a aplicar siempre:

- El **controlador de dominio** usa como DNS a sí mismo (porque el servicio DNS suele instalarse en él).
- Los **clientes** usan como DNS el controlador de dominio, y **solo ese**. Si pones también un DNS público como segundo servidor, el cliente a veces preguntará a Google por el dominio, Google no sabrá nada, y el inicio de sesión fallará de forma intermitente y difícil de detectar.
- Para que los clientes sigan teniendo Internet, el DNS del controlador reenvía a un DNS externo las consultas que no sabe resolver. Esto se llama *reenviador*.

## Zonas integradas en Active Directory

Normalmente una zona DNS se guarda en un archivo de texto. Si el DNS está en un controlador de dominio, la zona puede guardarse **dentro de Active Directory**, y se replica junto con todo lo demás. Es lo que se llama una **zona integrada**. La ventaja es que no hay que configurar nada aparte: tienes DNS en todos los controladores y siempre sincronizado.

:::nota
Cómo funciona el DNS por dentro (tipos de zona, registros, consultas recursivas...) es materia de SER. Aquí solo necesitas recordar que Active Directory se apoya en él y que los clientes deben apuntar al DC.
:::

:::nota[En resumen]
Los clientes encuentran el controlador de dominio consultando registros SRV en el DNS. Por eso el DC debe ser también servidor DNS, y los clientes deben usarlo como único DNS. Los problemas de dominio suelen ser problemas de DNS.
:::

:::pregunta[¿Por qué un cliente no puede unirse al dominio si su DNS apunta a un servidor público?]
Porque para encontrar el controlador de dominio necesita consultar los registros SRV que este publica en su DNS, y un servidor público no los conoce. Por eso el cliente debe usar como DNS el controlador de dominio, y solo ese.
:::

# 4. Instalar Active Directory

Crear un dominio se hace en dos pasos que a veces se confunden: **instalar el rol** y **promocionar el servidor**.

## Antes de empezar

El servidor tiene que estar preparado. No hace falta que sea complicado, pero sí ordenado:

1. **Nombre del equipo definitivo.** Cambiarlo después de promocionar es un dolor de cabeza. Elígelo bien (por ejemplo `DC01`) desde el principio.
2. **IP estática.** Un controlador de dominio no puede cambiar de dirección cada vez que arranque. Además, su DNS debe apuntarse a sí mismo.
3. **Sistema actualizado y con la hora correcta.** Lo de la hora te sonará raro ahora, pero lo vas a entender en cuanto hables de Kerberos.
4. **Un nombre de dominio decidido.** Normalmente tiene forma de nombre DNS (`empresa.local`, `empresa.com`...). En una empresa real se suele usar un subdominio de un dominio que ya posea (por ejemplo `ad.empresa.com`), porque usar un sufijo inventado como `.local` puede dar problemas más adelante.

## Instalar el rol y promocionar

En Windows Server las funciones se instalan como **roles y características**. El rol que necesitas se llama **Servicios de dominio de Active Directory** (AD DS). Instalarlo solo pone los archivos en el disco. El servidor todavía no es un controlador de dominio.

El segundo paso es la **promoción**: convertir ese servidor en controlador de dominio. Aquí es donde le dices si va a crear un dominio nuevo, qué nombre tendrá y cuál será la contraseña de recuperación. Se puede hacer desde el asistente gráfico del Administrador del servidor o con PowerShell, con dos órdenes:

```powershell
# 1. Instalar el rol
Install-WindowsFeature AD-Domain-Services -IncludeManagementTools

# 2. Promocionar creando un bosque nuevo
Install-ADDSForest -DomainName "empresa.local" -DomainNetbiosName "EMPRESA"
```

El asistente te irá preguntando varias cosas importantes:

- **Nivel funcional:** determina qué características de Active Directory están disponibles. Cuanto más moderno, más funciones, pero exige que todos los controladores sean de esa versión o posterior. Con Windows Server 2022 el nivel más alto disponible sigue siendo el de Windows Server 2016.
- **Contraseña del modo de restauración (DSRM):** es la contraseña con la que arrancas el controlador en un modo especial para repararlo si la base de datos se estropea. Se guarda aparte de la cuenta de administrador del dominio. Si la pierdes, no hay forma fácil de recuperarla.
- **Nombre NetBIOS:** una versión corta del dominio, de hasta 15 caracteres, que se usa al iniciar sesión (`EMPRESA\usuario`).

Al terminar, el servidor **se reinicia solo**. Cuando vuelve a arrancar ya es un controlador de dominio: ha creado la base de datos, ha registrado los SRV en el DNS, ha creado la carpeta SYSVOL y ha convertido la cuenta de administrador local en la del dominio.

:::aviso
Una vez promocionado, la cuenta `Administrator` del servidor deja de ser local y pasa a ser **Administrador del dominio**, con la misma contraseña que tenía. Ten cuidado con las contraseñas flojas, porque ahora esa cuenta lo controla todo.
:::

:::tip
En las prácticas usarás la versión con interfaz gráfica de Windows Server. En producción es común usar la edición **Server Core**, sin escritorio, que se administra por PowerShell o desde otro equipo. Tiene menos superficie de ataque y consume menos. Los comandos de arriba funcionan igual en las dos.
:::

:::nota[En resumen]
Instalar el rol AD DS pone los archivos; promocionar convierte el servidor en controlador de dominio y crea el dominio. Antes de promocionar necesitas nombre definitivo, IP fija y un nombre de dominio decidido. Guarda bien la contraseña DSRM.
:::

:::pregunta[¿Qué diferencia hay entre instalar el rol AD DS y promocionar el servidor?]
Instalar el rol solo pone los archivos en el disco. La promoción es lo que convierte el servidor en controlador de dominio: crea la base de datos y el dominio, registra los SRV en el DNS y crea SYSVOL.
:::

# 5. Unir equipos al dominio

Tener un dominio sin equipos que lo usen no sirve de mucho. Para que un cliente pase a formar parte, hay que **unirlo al dominio**. Al hacerlo, el equipo recibe su propia cuenta en Active Directory (una cuenta de equipo, en el contenedor `Computers` por defecto) y establece una relación de confianza con el DC.

## Requisitos

Antes de unir un cliente, comprueba tres cosas:

1. **Conectividad.** El cliente tiene que llegar al controlador de dominio por la red. Con un `ping` al DC suele bastar para descartarlo.
2. **DNS correcto.** El cliente debe usar el controlador como servidor DNS. Esta es, con mucha diferencia, la causa más frecuente de que la unión falle ("no se encontró el dominio").
3. **Hora sincronizada.** El protocolo de autenticación que usa Active Directory, [Kerberos](https://es.wikipedia.org/wiki/Kerberos), emite "tickets" que caducan. Si el reloj del cliente se desvía más de cinco minutos del servidor, los tickets se rechazan y el inicio de sesión falla.

Además, el cliente tiene que usar una edición de Windows que permita unirse a un dominio: **Pro, Enterprise o Education**. La edición Home no puede.

:::nota
Un dato curioso: por defecto, cualquier usuario autenticado del dominio puede unir hasta 10 equipos, aunque no sea administrador. Es una cuota que se puede cambiar. En entornos serios se suele restringir.
:::

## Cómo se une

Se puede hacer gráficamente (Configuración, Cuentas, Acceso a trabajo o escuela) o con PowerShell:

```powershell
Add-Computer -DomainName "empresa.local" -Credential EMPRESA\administrador -Restart
```

Te pedirá una cuenta con permiso para unir equipos y reiniciará el cliente.

## Inicio de sesión local frente a dominio

Una vez unido, en la pantalla de inicio de sesión tienes dos opciones:

| | Inicio de sesión de dominio | Inicio de sesión local |
| --- | --- | --- |
| Cómo se escribe | `EMPRESA\andrea` o `andrea@empresa.local` | `.\andrea` o `NOMBRE-EQUIPO\andrea` |
| Quién comprueba la contraseña | El controlador de dominio | El propio equipo |
| Qué cuentas usa | Las del directorio | Las que existen solo en ese equipo |
| Aplica directivas de grupo | Sí | No (solo las locales) |
| Cuándo se usa | Siempre, en el día a día | Para reparaciones, o si el DC no responde |

Si el controlador está apagado, un usuario de dominio *todavía* puede iniciar sesión con las últimas credenciales que usó en ese equipo, porque Windows las guarda en caché. Pero un usuario nuevo, que nunca ha iniciado sesión allí, no podrá.

:::aviso
No clones máquinas virtuales de Windows sin prepararlas con `sysprep` si luego vas a unirlas al dominio. Los clones comparten identificador de seguridad y eso provoca problemas de confianza con el DC. Ya lo viste en el bloque 1.
:::

:::nota[En resumen]
Para unir un equipo necesita conectividad, el DNS apuntando al DC y la hora sincronizada. Con la cuenta de dominio, la contraseña la valida el controlador y se aplican las directivas. Con la local, solo cuenta el propio equipo.
:::

:::pregunta[Un usuario recibe "No se puede iniciar sesión" al intentar entrar en un equipo recién unido y se ha comprobado que el DNS es correcto. ¿Qué otra causa habría que mirar?]
La hora. Kerberos rechaza los tickets si el reloj del cliente se desvía más de cinco minutos respecto al servidor.
:::

# 6. Usuarios, equipos, grupos y OU

Un dominio vacío no tiene gracia. Lo interesante es lo que metes dentro y cómo lo organizas.

## Los objetos principales

- **Usuarios:** representan personas (o servicios). Tienen un nombre de inicio de sesión, contraseña y atributos. Se identifican internamente por un SID, no por su nombre. Si renombras a alguien, sus permisos no se pierden.
- **Equipos:** cada ordenador unido al dominio tiene su propia cuenta, con su propia contraseña que renueva solo cada 30 días.
- **Grupos:** conjuntos de usuarios, equipos u otros grupos. Sirven para dar permisos a muchos de golpe.
- **Unidades organizativas (OU):** contenedores para ordenar todo lo anterior.

## Cómo organizar una OU

La pregunta que más se hace uno al principio es: ¿cómo estructuro mis OU? No hay una única respuesta correcta, pero sí criterios:

- Organiza por **cómo vas a administrar**, no por cómo luce el organigrama. Si quieres aplicar una directiva distinta a los equipos de un aula, necesitas una OU para ellos. Si todos se gestionan igual, no hace falta separarlos.
- Separa **usuarios** de **equipos**, porque las directivas de usuario y de equipo son distintas.
- No hagas árboles muy profundos. Complican las herencias y hacen difícil entender qué se aplica dónde.

:::tip
Cuando crees una OU, el asistente tiene una casilla "Proteger contenedor contra eliminación accidental". Déjala marcada. Evita que un clic torpe borre medio directorio.
:::

## Tipos y ámbitos de grupo

Los grupos de Active Directory se clasifican de dos maneras que no se deben confundir.

**Por tipo** (para qué sirve):

- **Grupos de seguridad:** se usan para asignar permisos. Son los que usarás en el módulo.
- **Grupos de distribución:** solo sirven para listas de correo. No intervienen en permisos.

**Por ámbito** (hasta dónde llegan):

| Ámbito | Quién puede ser miembro | Dónde se puede usar para dar permisos |
| --- | --- | --- |
| **Global** | Cuentas del mismo dominio | En cualquier dominio del bosque |
| **Local de dominio** | Cuentas y grupos de cualquier dominio | Solo en recursos de su propio dominio |
| **Universal** | Cuentas y grupos de cualquier dominio del bosque | En todo el bosque (se guardan en el catálogo global) |

Una forma de recordarlo: los grupos **globales** *agrupan* personas y viajan lejos; los grupos **locales de dominio** *reciben* permisos y se quedan en casa.

## La estrategia AGDLP

Con todo lo anterior se puede montar un sistema ordenado que se conoce por sus siglas, **AGDLP**:

1. **A**ccounts (cuentas): los usuarios y equipos.
2. Se meten en **G**rupos **G**lobales según su *función* (por ejemplo, `GG_Contabilidad`).
3. Esos grupos globales se meten en **G**rupos **L**ocales de **D**ominio según el *recurso y el permiso* (por ejemplo, `DL_Facturas_Modificar`).
4. Al grupo local de dominio se le dan los **P**ermisos sobre el recurso.

Dicho en palabras: **las personas van a grupos de función; los grupos de función van a grupos de permiso; los permisos se dan solo a los grupos de permiso**.

¿Por qué tanto lío? Imagina que Andrea pasa de Contabilidad a Ventas. Si le diste permisos uno a uno sobre veinte carpetas, tendrás que quitárselos todos a mano. Con AGDLP, solo la cambias de grupo global y todo se ajusta solo. Y si mañana quieres cambiar el permiso de una carpeta, tocas un único grupo local de dominio.

:::nota
En el bloque 5 verás cómo se comparten carpetas y la diferencia entre permisos NTFS y permisos de recurso compartido. AGDLP se aplica igual en ambos casos: los permisos se asignan a los grupos locales de dominio.
:::

:::nota[En resumen]
Los usuarios y equipos se ordenan en OU según cómo se administren. Los grupos se clasifican por tipo (seguridad o distribución) y por ámbito (global, local de dominio, universal). La estrategia AGDLP mete cuentas en grupos globales, estos en grupos locales de dominio, y da permisos solo a los locales.
:::

:::pregunta[Explica la estrategia AGDLP con un ejemplo.]
Las cuentas van a grupos globales según su función, estos a grupos locales de dominio según el recurso y el permiso, y los permisos se dan solo a los locales. Por ejemplo, los usuarios de Contabilidad entran en `GG_Contabilidad`, este en `DL_Facturas_Modificar`, y a este último se le dan los permisos de modificación sobre la carpeta Facturas. Si alguien cambia de departamento, solo se cambia su grupo global.
:::

# 7. Perfiles y carpetas personales

Cuando un usuario inicia sesión por primera vez en un equipo, Windows le crea un **perfil**: una carpeta (`C:\Users\andrea`) con su escritorio, documentos, descargas y configuración personal. El problema es que ese perfil está solo en ese equipo. Si Andrea se sienta en otro ordenador del aula, empieza de cero.

En un dominio hay varias formas de resolverlo.

## Perfiles móviles

Con un **perfil móvil** (*roaming profile*), el perfil se guarda en una carpeta compartida del servidor. Al iniciar sesión se copia al equipo, y al cerrar sesión se copia de vuelta. Así Andrea ve lo mismo allí donde se siente.

Funciona, pero tiene un inconveniente: si el perfil es grande (documentos, imágenes, descargas), iniciar y cerrar sesión puede tardar mucho, porque se copia entero cada vez.

## Redirección de carpetas

La **redirección de carpetas** es una alternativa más moderna y casi siempre mejor. En vez de copiar la carpeta de Documentos, Windows hace que *apunte directamente* a una carpeta del servidor. El usuario no nota nada, pero sus archivos nunca están en el equipo, sino en el servidor, y no hay nada que copiar al iniciar sesión. Se configura con una directiva de grupo.

Es lo que suelen usar los centros educativos y las empresas, a menudo combinado con un perfil móvil pequeño, solo para la configuración.

## Carpeta personal y unidades de red

Otra opción es dar a cada usuario una **carpeta personal** en el servidor, que aparece como una unidad de red (por ejemplo `H:`). En su cuenta de Active Directory se indica la ruta y la letra de unidad. Es la forma más sencilla: el usuario guarda sus cosas en `H:` y estén donde estén, las tiene.

## Scripts de inicio de sesión

Un **script de inicio de sesión** es un pequeño programa (de PowerShell o un `.bat`) que se ejecuta automáticamente cuando el usuario entra. Sirve para conectar unidades de red, copiar un archivo o mostrar un mensaje. Los scripts se guardan en la carpeta `NETLOGON` del controlador, y se asocian al usuario o, mejor, mediante una directiva de grupo.

:::tip
Lo habitual hoy es evitar los scripts siempre que se pueda y hacer lo mismo con directivas de grupo, que son más fáciles de mantener y de diagnosticar.
:::

:::nota[En resumen]
Un perfil es la configuración personal del usuario. Los perfiles móviles lo copian al servidor al cerrar sesión; la redirección de carpetas lo evita haciendo que las carpetas apunten directamente al servidor. También hay carpetas personales y scripts de inicio de sesión.
:::

:::pregunta[¿Qué ventaja tiene la redirección de carpetas frente a un perfil móvil?]
No hay que copiar el perfil entero al iniciar y cerrar sesión, porque las carpetas apuntan directamente al servidor. Así el inicio de sesión es más rápido y no viajan perfiles enormes por la red.
:::

# 8. Directivas de grupo (GPO)

Las **directivas de grupo** (*Group Policy Objects*, **GPO**) son, probablemente, lo más potente de Active Directory. Permiten configurar centenares de ajustes de Windows en todos los equipos y usuarios del dominio sin tocar ninguno a mano: fondos de pantalla, restricciones, contraseñas, instalación de programas, cortafuegos...

## Qué es una GPO y cómo se aplica

Una GPO es un conjunto de configuraciones con nombre. Tiene dos partes:

- **Configuración del equipo:** se aplica al arrancar el equipo, sea cual sea el usuario que luego entre.
- **Configuración del usuario:** se aplica al iniciar sesión, sea cual sea el equipo que use.

Por sí sola, una GPO no hace nada. Hay que **vincularla** a un sitio, a un dominio o a una OU. Todos los objetos que estén dentro de ese contenedor recibirán la directiva. Una misma GPO puede vincularse a varios sitios a la vez.

:::nota
Una GPO se almacena en dos sitios: su definición en Active Directory y los archivos de configuración en la carpeta SYSVOL. Por eso un problema de replicación o de SYSVOL puede impedir que una directiva se aplique.
:::

## Orden de aplicación: LSDOU

Cada equipo recibe varias GPO desde distintos niveles, y se aplican en este orden, que conviene saber de memoria:

1. **L**ocal: la directiva del propio equipo.
2. **S**itio: las vinculadas al sitio de Active Directory.
3. **D**ominio: las vinculadas al dominio.
4. **OU**: las vinculadas a las OU, de la más externa a la más interna.

**La última en aplicarse gana** en caso de conflicto. Por eso la directiva de una OU interior sobrescribe la del dominio. Es como las normas de una familia: las reglas generales de la casa se pueden ajustar en tu cuarto.

## Herencia, bloqueo y refuerzo

Por defecto, las directivas se **heredan**: una OU recibe las del dominio y las de sus padres. Hay dos mecanismos para alterar esto:

- **Bloquear herencia:** en una OU se puede indicar que no quiere recibir directivas de niveles superiores.
- **Exigido** (*enforced*): una GPO marcada así no se puede bloquear ni sobrescribir desde abajo. Se usa para normas que sí o sí deben cumplirse.

El exigido tiene prioridad sobre el bloqueo. Si una directiva está exigida y una OU bloquea la herencia, la directiva se aplica igual.

## Filtrado

No siempre quieres que una GPO afecte a todos los objetos de la OU. Hay dos formas de afinar:

- **Filtrado de seguridad:** la GPO solo se aplica a los usuarios, equipos o grupos que tengan permiso de "Aplicar directiva de grupo". Por defecto es "Usuarios autenticados", es decir, a todos. Si lo cambias a un grupo concreto, solo les afectará a ellos.
- **Filtros WMI:** aplican la GPO solo si el equipo cumple una condición, por ejemplo, una versión concreta de Windows.

## Cuándo se aplican los cambios

Los equipos no están vigilando los cambios todo el rato. Refrescan sus directivas:

- Al arrancar el equipo y al iniciar sesión.
- Cada **90 minutos**, con un desfase aleatorio de hasta 30 minutos, en los equipos y servidores normales.
- Cada **5 minutos** en los controladores de dominio.

Para no esperar, puedes forzarlo en el cliente con `gpupdate /force`.

## Diagnóstico

Cuando una directiva no hace lo que esperas, no adivines: pregunta al equipo qué se le ha aplicado. Para eso sirven:

- `gpresult /r`: muestra un resumen en la consola de las GPO aplicadas y de las que se han filtrado, con el motivo.
- `gpresult /h informe.html`: genera un informe completo en HTML, mucho más legible.
- **Resultados de directiva de grupo** (desde la consola de administración): hace lo mismo, pero consultando un equipo remoto.

:::aviso
Los fallos más comunes son tres: la GPO no está vinculada a la OU correcta, el objeto está en otra OU distinta (muy típico: los equipos se quedan en `Computers` y la GPO está vinculada a una OU), o la herencia está bloqueada. Antes de tocar la directiva, comprueba dónde está el objeto.
:::

:::nota[En resumen]
Una GPO es una colección de ajustes que se vincula a un sitio, dominio u OU. Se aplican en orden local, sitio, dominio, OU, y gana la última. Se puede bloquear la herencia, forzar con "exigido" y filtrar por seguridad. Para diagnosticar se usa `gpresult`.
:::

:::pregunta[Una OU tiene una GPO vinculada pero un equipo de esa OU no la aplica. ¿Qué tres cosas revisarías?]
Que el equipo esté realmente en esa OU (y no en `Computers`), que la herencia no esté bloqueada ni el filtrado de seguridad lo excluya, y qué se ha aplicado de verdad, con `gpresult /r` o `gpresult /h`.
:::

:::pregunta[Se vincula una GPO al dominio y otra, distinta, a una OU. Ambas configuran el mismo ajuste con valores distintos. ¿Cuál gana?]
La de la OU, porque la última en aplicarse gana y el orden es local, sitio, dominio, OU. Solo ganaría la del dominio si estuviera marcada como exigida.
:::

# 9. Casos de uso habituales de las GPO

Para que veas la utilidad real, estas son las tareas que casi siempre se resuelven con directivas de grupo.

## Contraseñas y bloqueo de cuentas

La política de contraseñas del dominio decide la longitud mínima, la complejidad, cada cuánto caducan y cuántas se recuerdan para no repetirlas. También se define cuántos intentos fallidos bloquean una cuenta y durante cuánto tiempo.

Hay una particularidad importante: las directivas de contraseñas del dominio **solo funcionan si están en la GPO vinculada a la raíz del dominio** (la *Default Domain Policy*). No sirven si las pones en una OU. Y entonces, ¿cómo se pide una política más estricta para los administradores, por ejemplo? Con las **directivas de contraseña específicas** (*Password Settings Objects*, o PSO), que se aplican a usuarios o grupos concretos y tienen prioridad sobre la del dominio.

:::tip
Una contraseña más larga es mejor que una más rara. Una frase de 16 caracteres es más difícil de adivinar que `P@ssw0rd!`, y más fácil de recordar.
:::

## Restricciones a los usuarios

Es muy común limitar lo que pueden hacer los usuarios: impedir el acceso al Panel de control o al Símbolo del sistema, ocultar unidades, bloquear el USB, fijar el fondo de pantalla, impedir cambiar la hora... Todo esto está en "Configuración del usuario" o "Configuración del equipo" dentro de las plantillas administrativas.

## Unidades de red

En lugar de un script, una GPO puede conectar automáticamente una unidad de red al iniciar sesión, mediante las **preferencias de directiva de grupo**. Estas preferencias se diferencian de las directivas normales en que *proponen* un valor pero el usuario puede cambiarlo, además de permitir cosas como filtrar por grupo.

## Despliegue de software

Una GPO puede instalar programas en los equipos del dominio sin tener que ir uno por uno. Requiere que el programa esté empaquetado como **MSI** (el formato de instalador de Windows) y que esté en una carpeta compartida accesible por todos los equipos. Hay dos modos:

- **Asignado:** si se asigna a un *equipo*, se instala cuando el equipo arranca. Si se asigna a un *usuario*, aparece como instalado y se termina de instalar la primera vez que lo usa.
- **Publicado:** solo para usuarios. Aparece en "Programas y características" y el usuario decide si lo quiere instalar.

:::nota
Este método sigue funcionando, pero hoy en muchas organizaciones se complementa o se sustituye por herramientas de gestión más modernas, como Intune o `winget`. Aun así, entender el despliegue por GPO te ayuda a entender el resto.
:::

:::nota[En resumen]
Las GPO sirven para políticas de contraseñas y bloqueo, restricciones de usuario, unidades de red y despliegue de software. La política de contraseñas del dominio se define en la raíz, y las PSO permiten políticas distintas para grupos concretos.
:::

:::pregunta[¿Por qué la política de contraseñas del dominio no funciona si la creas en una GPO vinculada a una OU, y cómo se aplica una política distinta a un grupo?]
Las directivas de contraseñas del dominio solo funcionan en la GPO vinculada a la raíz del dominio (la *Default Domain Policy*). Para aplicar una política distinta a usuarios o grupos concretos se usa una PSO (directiva de contraseña específica), que tiene prioridad sobre la del dominio.
:::

# 10. Delegación de control

Un error muy común es hacer administrador del dominio a cualquiera que necesite algo de permisos. Un administrador del dominio puede hacer **todo**, desde borrar el directorio hasta leer cualquier información. Si basta con que alguien restablezca contraseñas de un aula, darle todo ese poder es una mala idea.

La **delegación de control** resuelve esto: permite dar a un usuario o grupo permisos **concretos sobre una OU concreta**, y nada más. Por ejemplo:

- Que el grupo `Soporte_Aula1` pueda restablecer contraseñas y desbloquear cuentas **solo en la OU Aula1**.
- Que un responsable de departamento pueda crear usuarios dentro de **su** OU, pero no en otras.

Se hace con un asistente (clic derecho sobre la OU, "Delegar control...") donde eliges a quién delegas y qué tareas puede hacer. Por debajo, lo que hace es modificar los permisos del objeto OU. Para casos más precisos existen la pestaña de seguridad y la herramienta `dsacls`.

Este reparto sigue el principio del **mínimo privilegio**: cada persona debe tener los permisos justos para hacer su trabajo, y ni uno más.

:::tip
Delega siempre a **grupos**, no a personas. Cuando alguien cambia de puesto, solo tienes que cambiarlo de grupo, igual que hacías con AGDLP.
:::

:::nota[En resumen]
Delegar control permite que un grupo realice tareas concretas sobre una OU concreta sin ser administrador del dominio. Aplica el principio de mínimo privilegio y se asigna siempre a grupos.
:::

:::pregunta[¿Qué es la delegación de control y por qué es mejor que hacer administrador a alguien?]
Es dar a un usuario o grupo permisos concretos sobre una OU concreta (por ejemplo, restablecer contraseñas). Respeta el mínimo privilegio, mientras que un administrador del dominio puede hacer cualquier cosa sobre todo el dominio.
:::

# 11. Herramientas de administración

Dispones de varias herramientas para gestionar Active Directory. Merece la pena conocerlas todas, porque cada una sirve para algo distinto.

| Herramienta | Para qué se usa |
| --- | --- |
| **Usuarios y equipos de Active Directory** | Crear y gestionar usuarios, grupos, equipos y OU. Es la que más vas a usar |
| **Administración de directivas de grupo** | Crear, vincular, filtrar y diagnosticar GPO |
| **Centro de administración de Active Directory** | Versión más moderna de la primera, con papelera de reciclaje y directivas de contraseña |
| **Sitios y servicios de Active Directory** | Gestionar sitios y replicación |
| **Dominios y confianzas de Active Directory** | Gestionar relaciones de confianza y niveles funcionales |
| **DNS** | Consultar las zonas y los registros del dominio |
| **Módulo `ActiveDirectory` de PowerShell** | Hacer todo lo anterior desde la consola, con scripts |

## PowerShell

La gran ventaja de [PowerShell](https://es.wikipedia.org/wiki/PowerShell) es que permite automatizar. Crear un usuario con el asistente gráfico es sencillo, pero crear doscientos es una tortura. Con PowerShell, puedes leer una lista de un archivo y crearlos todos de una vez. Algunas órdenes habituales:

```powershell
New-ADOrganizationalUnit -Name "Aula1" -Path "DC=empresa,DC=local"
New-ADUser -Name "Andrea Windrose" -SamAccountName "andrea.windrose" -Path "OU=Aula1,DC=empresa,DC=local" -AccountPassword (Read-Host -AsSecureString) -Enabled $true
New-ADGroup -Name "GG_Aula1" -GroupScope Global -Path "OU=Aula1,DC=empresa,DC=local"
Add-ADGroupMember -Identity "GG_Aula1" -Members "andrea.windrose"
Get-ADUser -Filter * -SearchBase "OU=Aula1,DC=empresa,DC=local"
```

:::nota
En el texto de arriba, `DC=empresa,DC=local` no significa "controlador de dominio": es la forma en que LDAP escribe el nombre del dominio (*domain component*). Lo verás en el bloque de LDAP.
:::

## Administrar a distancia

Casi nunca se administra un servidor sentado delante de él. Las formas habituales son tres:

- **Escritorio remoto (RDP):** te conectas y ves el escritorio del servidor como si estuvieras allí. Usa el puerto 3389.
- **Herramientas de administración remota (RSAT):** son las mismas consolas de arriba, pero instaladas en un cliente (Windows 11, por ejemplo), y que actúan sobre el servidor sin conectarte a su escritorio.
- **PowerShell remoto:** abres una sesión de consola en el servidor desde tu equipo, con `Enter-PSSession` para trabajar de forma interactiva o `Invoke-Command` para lanzar una orden en uno o varios equipos a la vez.

:::nota[En resumen]
Hay consolas gráficas para cada tarea y un módulo de PowerShell que permite automatizarlas. Todas se pueden usar a distancia con RDP, con RSAT o con PowerShell remoto.
:::

# 12. Replicación y roles FSMO

Esta sección es más teórica. No la vas a practicar, pero te ayuda a entender cómo se comporta Active Directory cuando hay más de un controlador.

## Replicación

Si hay varios controladores de dominio, cada uno tiene una copia completa de la base de datos y todos pueden aceptar cambios. Eso se llama **multimaster**: no hay un controlador "principal" al que obligatoriamente haya que escribir. Cuando creas un usuario en un DC, ese cambio se **replica** automáticamente a los demás.

La replicación dentro de una misma sede es casi inmediata. Entre sedes diferentes se programa según lo que se defina en los **sitios**, para no saturar enlaces lentos.

## Roles FSMO

Que no haya un jefe es cierto casi siempre, pero algunas tareas no se pueden hacer a la vez desde dos sitios sin crear conflictos. Para esas, Active Directory reparte cinco **roles de operaciones únicas** (FSMO, *Flexible Single Master Operations*): cada uno lo tiene un solo controlador a la vez.

| Rol | Alcance | Qué hace |
| --- | --- | --- |
| **Maestro de esquema** | Todo el bosque | Es el único que puede modificar el esquema |
| **Maestro de nombres de dominio** | Todo el bosque | Añade o elimina dominios del bosque |
| **Emulador de PDC** | Cada dominio | Es la referencia de hora, gestiona los cambios urgentes de contraseña y los bloqueos |
| **Maestro de RID** | Cada dominio | Reparte rangos de identificadores para crear objetos nuevos |
| **Maestro de infraestructura** | Cada dominio | Mantiene referencias entre dominios |

Al crear el primer controlador, tiene los cinco roles. Si más adelante añades otro, los roles se pueden transferir. Si un DC con roles muere para siempre, se pueden **apoderar** (*seize*) desde otro.

:::tip
De los cinco, el más visible en el día a día es el **emulador de PDC**, porque es el que sincroniza la hora del dominio. Si la hora de un equipo se desvía, se acaban sin poder iniciar sesión por Kerberos, y de ahí vuelven los problemas de la sección 5.
:::

:::nota[En resumen]
Los controladores de dominio replican sus cambios entre sí y todos pueden aceptar escrituras. Cinco tareas delicadas se reparten en roles FSMO, que tiene un único controlador cada uno.
:::

:::pregunta[¿Qué significa que Active Directory sea multimaster, y por qué entonces existen los roles FSMO?]
Que cualquier controlador puede aceptar cambios, que luego se replican a los demás. Los FSMO existen porque cinco tareas no pueden hacerse a la vez desde dos sitios sin provocar conflictos, y por eso las tiene un único controlador cada una.
:::

# Glosario

| Término | Significado |
| --- | --- |
| Active Directory (AD) | Servicio de directorio de Microsoft |
| AD DS | Servicios de dominio de Active Directory: el rol que se instala para crear un dominio |
| Dominio | Unidad básica de AD: una base de datos de cuentas con sus políticas |
| Controlador de dominio (DC) | Servidor que guarda la base de datos del dominio y autentica a los usuarios |
| Árbol | Dominios con un espacio de nombres continuo |
| Bosque | Conjunto de árboles que comparten esquema y configuración |
| Relación de confianza | Acuerdo entre dominios para reconocer los usuarios del otro |
| Catálogo global | Copia parcial de todos los objetos del bosque, para búsquedas rápidas |
| OU | Unidad organizativa: contenedor sobre el que se aplican directivas y se delega |
| Esquema | Definición de los tipos de objeto y atributos que existen en AD |
| NTDS.dit | Archivo de la base de datos de AD |
| SYSVOL | Carpeta compartida con directivas y scripts, que se replica entre controladores |
| Registro SRV | Registro DNS que indica qué equipo ofrece un servicio |
| Kerberos | Protocolo de autenticación basado en tickets que usa AD |
| DSRM | Modo de restauración de servicios de directorio: arranque especial para reparar el DC |
| Grupo global / local de dominio / universal | Ámbitos de grupo: quién puede ser miembro y dónde se pueden usar |
| AGDLP | Estrategia: cuentas, grupos globales, grupos locales de dominio, permisos |
| Perfil móvil | Perfil de usuario almacenado en el servidor y copiado en cada sesión |
| Redirección de carpetas | Hacer que carpetas como Documentos apunten a una ubicación del servidor |
| GPO | Objeto de directiva de grupo: conjunto de ajustes vinculable a sitio, dominio u OU |
| LSDOU | Orden de aplicación de GPO: local, sitio, dominio, OU |
| PSO | Directiva de contraseña específica para usuarios o grupos concretos |
| Delegación de control | Dar permisos concretos sobre una OU a un grupo sin que sea administrador |
| RSAT | Herramientas de administración remota del servidor desde un cliente |
| FSMO | Roles de operaciones únicas de un bosque o de un dominio |

# Fuentes y para saber más

Documentación oficial de Microsoft para ampliar cada apartado del bloque:

| Apartado | Enlace |
| --- | --- |
| 1 y 2. Dominio, bosque y estructura | [Active Directory Domain Services overview](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/get-started/virtual-dc/active-directory-domain-services-overview) |
| 1 y 2. Modelo lógico | [Understanding the Active Directory Logical Model](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/understanding-the-active-directory-logical-model) |
| 1. Catálogo global | [Global Catalog](https://learn.microsoft.com/en-us/windows/win32/ad/global-catalog) |
| 4. Promoción con PowerShell | [Install-ADDSForest](https://learn.microsoft.com/en-us/powershell/module/addsdeployment/install-addsforest?view=windowsserver2022-ps) |
| 4. Asistente de promoción | [AD DS Configuration Wizard Page Descriptions](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/deploy/ad-ds-installation-and-removal-wizard-page-descriptions) |
| 4. Niveles funcionales | [Active Directory Domain Services Functional Levels](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/active-directory-functional-levels) |
| 6. Tipos y ámbitos de grupo | [Active Directory Security Groups](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/understand-security-groups) |
| 5. Tolerancia de hora en Kerberos (5 minutos) | [Maximum tolerance for computer clock synchronization](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/security-policy-settings/maximum-tolerance-for-computer-clock-synchronization) |
| 5. Cuota de equipos que puede unir un usuario | [Default limit to the number of workstations a user can join to the domain](https://learn.microsoft.com/en-us/troubleshoot/windows-server/active-directory/default-workstation-numbers-join-domain) |
| 5. Renovación de la contraseña de equipo (30 días) | [Domain member: Maximum machine account password age](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/security-policy-settings/domain-member-maximum-machine-account-password-age) |
| 1 y 11. Puertos de AD (88, 389, 636, 3268, 3269, 445) | [Active Directory and AD DS port requirements](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/dd772723%28v=ws.10%29) |
| 9. Despliegue de software por GPO (asignado y publicado) | [Software installation overview](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2003/cc783502%28v=ws.10%29) |
| 8. Orden de aplicación y refresco de GPO | [Group Policy processing for Windows](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/group-policy/group-policy-processing) |
| 8. Exigido y bloqueo de herencia | [Enforced vs. Block Inheritance](https://learn.microsoft.com/en-us/archive/blogs/grouppolicy/tales-from-the-community-enforced-vs-block-inheritance) |
| 8. Filtrado de GPO | [Group Policy: Filtering and Permission](https://learn.microsoft.com/en-us/archive/technet-wiki/51876.group-policy-filtering-and-permission) |
| 12. Roles FSMO | [Find servers that hold FSMO roles](https://learn.microsoft.com/en-us/troubleshoot/windows-server/active-directory/find-servers-holding-fsmo-role) |
| 12. Transferir o apoderar roles | [Transfer or seize FSMO roles](https://learn.microsoft.com/en-GB/troubleshoot/windows-server/identity/transfer-or-seize-fsmo-roles-in-ad-ds) |
| General | [Deploy and Manage AD DS (ruta de formación)](https://learn.microsoft.com/en-us/training/paths/deploy-manage-active-directory-domain-services/) |
