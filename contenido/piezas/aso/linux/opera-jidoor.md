---
titulo: "La Ópera de Jidoor"
tipo: caso
horas: 10
---

*Warnings*

Para la realización de esta actividad voy a tener los siguientes supuestos:
- Eres capaz de leer y entender oraciones **largas** y eres capaz de comprender **lo que hay que hacer**.
- Eres capaz de manejar rutas relativas y absolutas con precisión y te tomas en serio la actividad. Si no realizas las rutas correctamente, no voy a hacer mi trabajo *(tendrás un 0 en el apartado)*
- Cada actividad va a ser corregida de forma *individual* y separada del resto de actividades.
- Soy consciente de que estamos tratando retos que no hemos trabajado en profundidad en clase, por ello mismo no tengáis miedo en hacer preguntas.
- Cuando hagáis comandos, recomiendo encarecidamente apuntarlos puesto que serán relevantes más adelante.
- Si alguien realiza algún tipo de *brujeria* o *plagio* lo sabré.



:::aviso[Imagen pendiente]
Falta la imagen «opera.jpg» (UODM). Se añadirá con su licencia.
:::

*Bienvenidos a Jidoor para una NOCHE MÁGICA*

El Impresario os ha contratado para la preparación del retorno triunfal al mundo de la ópera de Maria en la obra **María y Draco** justo cuando os avisa de que tiene un **gran problema**. Han informatizado toda la orquesta y el público está listo para su regreso, pero está cundiendo el **caos** absoluto entre todos los artistas: se han perdido instrumentos, encargados de seguridad han desaparecido, los músicos están desconcertados y la artista principal esta bajo la amenaza de que puede ser secuestrada. La actuación es esta misma noche, asi que el tiempo apremia.

La situación es la siguiente, tenemos una serie de instrumentos *(usuarios)* y una serie de carpetas en los atriles (`/srv/jidoor/opera`) que contienen las partituras que tienen que tocar. Pero por desgracia unos músicos son muy torpes con las partituras y están entrando cuando no les toca o están tocando lo que no es, *¡TODO ES EL CAOS!*

# Usuarios

Los usuarios que se han de crear o verificar en los sistemas son los siguientes:
- Oboe
- Clarinete
- Flauta
- Guitarra
- Corno
- Cello
- Contrabajo
- Sistro
- Timbal
- Conductor

# Grupos

Los grupos de la orquesta son los siguientes:

- Cuerda
- Viento_metal
- Viento_madera
- Percusión
- Conductor
- Orquesta: Al que perteneceran todos los instrumentos.
- Artistas: Al que perteneceran Maria, Ralse, Draco y el Narrador.

Los instrumentos se dividen en los siguientes grupos de la siguiente forma:

| Instrumentos  | Cuerda    |    Viento_madera  |  Viento_metal |   Percusión   |  Conductor     |
|  :----------: | :-------: | :-------------:   | :-----------: | :----------:  | :---------:   | 
|Oboe||X||||
|   Clarinete   |           |     X             |               |               |               |  
|   Corno       |           |                   |       X       |               |               |  
|   Flauta      |           |                   |       X       |               |               |  
|   Cello       |    X      |                   |               |               |               | 
|   Contrabajo  |    X      |                   |               |               |               | 
|   Guitarra    |    X      |                   |               |               |               | 
|   Sistro      |           |                   |               |       X       |               | 
|   Timbal      |           |                   |               |       X       |               | 
|   Conductor    |           |                   |               |               |  X            |


## Tarea 1: Vista interna

Haz un script que añada los usuarios y grupos necesarios para configurar el sistema.

Permite establecer las contraseñas de los usuarios de una forma *desantedida*.

Para cada usuario, el sistema deberá comprobar si ha sido creado ya, y si está creado deberá mandar un mensaje personalizado indicando que se ha saltado la creación de ese usuario.

Es una muy buena idea crear un fichero que contenga todos los usuarios.

## Tarea 1: Vista de los espectadores

Con el fin de que los asistentes puedan ver el espectáculo, se ha pensado crear un usuario `espectador` que pueda acceder por medio de SSH a la maquina para conocer el programa.

Para la configuración de este usuario se ha de configurar **OpenSSH Server Service** puesto que es necesario para cumplir con los requisitos.

- Antes de pedir la contraseña al usuario se deberá mostrar el `Banner` que podréis encontrar en el fichero `banner.txt`, deberéis colocarlo en la carpeta `etc/`.

- En el evento en el que el usuario haga sesión, deberá poder hacer una única acción.
    * Mostrar una lista de las **obras** a interpretar y automáticamente deberá expulsar al usuario del sistema.

# Acto I: Obertura

El concierto cuenta con un trabajo, localizado en:
- Orquesta: Carpeta `/srv/jidoor/opera/Il_barbiere_di_Siviglia/orquesta`
- Artistas: Carpeta `/srv/jidoor/opera/Il_barbiere_di_Siviglia/artistas`


En cada una de las carpetas están las partituras de cada uno de los instrumentos y artistas explicados previamente, las cuales vamos a *simular* con un `.txt` que contiene el nombre del instrumento y su nombre será su nombre propio. 

**Ejemplo**
Para el usuario `Oboe` en la obra *Il barbiere di Siviglia* (`/usr/sor/Il_barbiere_di_Siviglia`) deberá existir un archivo llamado `Oboe.txt` y el contenido del archivo será el nombre del usuario (`Oboe`)

Las demandas del conductor son las siguientes:
1. Cada instrumento puede leer y escribir *únicamente* en su partitura.
2. Cada grupo de instrumentos puede *leer* aquello en su grupo pero no *escribir*.
3. El conductor de orquesta puede leer y escribir en TODAS las partituras. (Por eso es el conductor)
4. Los artistas no pueden leer las partituras de las orquesta y viceversa.

## Tarea 2: Creación de partituras

Haz un script llamado `act01.sh` con las ordenes necesarias. Usar variables para almacenar los paths e implementar bucles es buena idea.

# Acto II: Aria di Mezzo Carattere

El primer acto ha conseguido salir adelante, pero hay un problema mayor, alguien ha tirado todas las carpetas al suelo y han quedado mezcladas las partituras y documentos de la obra, ademas The Impresario ha decidido que es peligroso que María actúe, menos mal que Celes Chere ha decidido sustituir a María durante su acto. Como Draco ha terminado la Obertura únicamente habría que gestionar las partituras de `Aria di Mezzo Carattere`

El director de orquesta te encarga que rápidamente ordenes todos los documentos en su lugar, pero para hacerlo correctamente pueden darse cuatro casos que se han de solucionar.

1. La carpeta de un determinado instrumento no tiene partituras: Entonces se deberá formar la siguiente estructura en el directorio `$HOME` del usuario.

*Ejemplo para el usuario Oboe*

````bash
Oboe/
    Oboe.txt
    Acto I/
        Oboe_1.txt
    Acto II/
        Oboe_2.txt
    Acto III/
        Oboe_3.txt
    Acto IV/
        Oboe_4.txt
````

2. Comprobar si el usuario esta en la carpeta correcta y si tiene los permisos establecidos correctamente.

**Ejemplo de uso**
```` 
$ ./act02.sh Oboe Test

> *Test 1: El usuario Oboe existe
> *Test 2: Error, Oboe.txt no existe o no puede ser leído.
> --Acto_I/ existe
> --Acto_I/Oboe_1.txt existe y puede ser leído por Oboe
> *Error Acto_II/ no existe
> *Error Acto_II/Oboe_2.txt no existe o no puede ser leído por Oboe
> --Acto_III/ existe 
> --Acto_III/Oboe_3.txt existe y puede ser leído por Oboe
> --Acto_IV/ existe
> *Error Acto_IV/Oboe_4.txt no puede ser leído por Oboe
.
.
.
````
3. En el caso de encontrar una carpeta alterada limpiar la directorios y subdirectorios de su interior SIEMPRE que lo haga un usuario dentro del mismo grupo musical. 

4. Añadir el usuario Celes, modificar sus permisos para que coincidan con los de Maria, crea un directorio que sea una copia del de Maria y cambia el nombre del fichero de `Maria.txt` a `Celes.txt` pero que permanezcan los contenidos del fichero que tenia previamente.

## Tarea 3

Realizar un Script llamado `act02.sh` que reciba 2 parámetros siendo el primero un **Usuario Válido** del sistema, si no lo fuere deberá mostrar un mensaje de error. El segundo parámetro deberá de ser una de las siguientes palabras.

1. `Restablecer`
2. `Probar`
3. `Limpiar`

En el caso de Probar y Limpiar se deberá comenzar desde el directorio con el mismo nombre que el usuario. Por supuesto, el argumento Restablecer se encargará del caso 1, Probar del caso 2, Limpiar del caso 3.

Es buena idea comenzar pudiendo **Limpiar** una carpeta por si hay errores con el resto de operaciones.

Adicionalmente crea un Script llamado `celes.sh` que borre al usuario María y cree al usuario Celes y otro usuario Locke, además deberá preparar el archivo con la partitura. Si se llama utilizando la opción `-g` o `--guion` deberá mostrar todo el guión (lo podrás encontrar en `/srv/script.txt`)con una pausa de 2 segundos entre líneas


# Acto III: Wedding Waltz ~ Duel

Afortunadamente la actuación de Celes ha salido a la perfección gracias a tu colaboración, aunque misteriosamente están desapareciendo las partituras de todos los actos.

## Tarea 4

Haz un script llamado `act03.sh` que cree a un usuario Locke si no existe y que acepte un argumento que puede ser:

+ Todo (`--all`)
+ Acto 1 (`--01`)
+ Acto 2 (`--02`)
+ Acto 3 (`--03`)
+ Acto 4 (`--04`)

El script deberá borrar todos los ficheros y carpetas del acto indicado o todo. Si se le pasa un argumento deberá de dar un mensaje de aviso indicando que no se le ha pasado un argumento válido.

`act03.sh` deberá ejecutarse cada 10 minutos con un argumento aleatorio.

Adicionalmente crea un script `act03_locke.sh` que se ejecute cada 15 minutos y que ejecute act02.sh con Probar, Limpiar y Restablecer con todos los usuarios, ademas deberá enviar un mensaje indicando que ha restaurado.

# Acto IV: Finale

Locke ha descubierto que Ultros ha estado intentando sabotear la Opera. Durante el final ha robado varios instrumentos o ha descoordinado los distintos grupos de la orquesta. 

## Tarea 5

Crea un script llamado `finale.sh` que pueda aceptar 2 argumentos.

El primer argumento deberá ser:

+ instrumentos (`--instruments`/`-i`)
+ grupos (`--groups`/`-g`)
+ partituras (`--partitures`/`-p`)

El segundo argumento deberá ser un usuario, grupo o acto.

Debe aceptar tanto **-g** como **--group** para grupos e igual para instrumentos y partituras.

Si el argumento es instrumentos el script deberá para el usuario indicado:

+ Comprobar si existe.
+ Borrar su directorio `Home`.
+ Eliminarlo de shadow y passwd.
+ Mostrar mensajes de cada operación.

Si el argumento es grupos el script deberá para el grupo seleccionado dentro de la orquesta:

+ Comprobar si el grupo existe, si no existe mostrará un mensaje y avanzará al siguiente grupo.
+ Extraer todos los usuarios que pertenezcan al grupo del grupo y eliminarlos.
+ Eliminar el grupo.
+ Mostrar mensajes de cada operación.

Si el usuario es partituras deberá borrar todas las partituras del acto indicado.

`finale.sh` deberá crear a un usuario llamado Ultros y borrar un instrumento o grupo existente aleatorio. Prepara una tarea con el `crontab` para que se ejecute una vez cada minuto. Si se ejecuta cuando no hay instrumentos o grupos deberá crear a un usuario Setzer y borrar al usuario Celes, Locke y Ultros, además deberá imprimir: 

***Pista**: usa logger*
>*"María ha sido secuestrada!"*

Crea `finale-locke.sh` para que cree los usuarios que no existan antes de que se ejecute `act03-locke.sh`

# Tarea 6

Corrige los scripts y envíalos por Esemtia junto con una guía de cada uno de los actos como pdf. Mucho ánimo.


::: nota
Recuerda que tienes que subir los .sh creados 
:::

::: tip
Esto es un consejo
:::

::: aviso
Esto es un aviso
:::

















