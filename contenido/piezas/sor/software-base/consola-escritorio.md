---
titulo: "De la consola al escritorio"
licencia: CC-BY-NC-SA-4.0
---

Si has llegado hasta aquí, tienes un Arch Linux instalado a mano que arranca y te deja entrar como `root`. Poco más. No hay red, no hay más usuario que el administrador y, desde luego, nada parecido a un escritorio con ventanas. Es un sistema operativo en el sentido más estricto: funciona, pero todavía no sirve para trabajar.

En esta práctica vas a convertirlo en un equipo de escritorio completo. Primero le darás red, después un usuario para el día a día, luego el escritorio KDE Plasma y, para terminar, un aspecto muy parecido al de un Mac.

No se trata de copiar órdenes hasta que salga algo bonito. Antes de instalar cada pieza vas a entender qué problema resuelve, cómo hace su trabajo y qué otras opciones había. Esa es la diferencia entre alguien que sabe seguir un tutorial y un técnico: el técnico, cuando llega a un equipo montado de otra forma, reconoce las piezas y sabe dónde mirar.

# 1. Efecto IKEA

En 2011, los investigadores Michael Norton, Daniel Mochon y Dan Ariely pidieron a un grupo de personas que montaran una caja de IKEA. A otro grupo le enseñaron la misma caja, ya montada. Después preguntaron a todos cuánto pagarían por ella. Quienes la habían montado ofrecieron bastante más que quienes la recibieron hecha, aunque la caja era idéntica.

Repitieron el experimento con figuras de origami y el resultado fue el mismo: los participantes valoraban sus propias figuras, torpes y arrugadas, casi tanto como las que había doblado un experto. Lo llamaron **[efecto IKEA](https://es.wikipedia.org/wiki/Efecto_IKEA)**: valoramos más lo que hemos construido con nuestras manos.

El estudio tenía una segunda parte, menos conocida y más importante para nosotros. Cuando la tarea se quedaba a medias, porque el montaje no se podía completar o porque se deshacía lo hecho antes de acabar, el efecto **desaparecía**. El esfuerzo solo se convierte en aprecio si termina en algo que funciona.

Esta práctica está pensada a partir de esa idea:

- **Montas tú cada pieza.** Otras distribuciones traen la red, el usuario y el escritorio ya resueltos. En Arch los añades uno a uno, y por eso sabrás qué hace cada uno y dónde buscar cuando falle.
- **Cada parte termina en algo que funciona.** Primero la red, luego el usuario, el escritorio y el aspecto final. Comprobarás cada parte antes de pasar a la siguiente.
- **Las instantáneas te protegen de quedarte a medias.** Si algo se rompe, vuelves al último punto bueno en lugar de empezar de cero.

::: nota
El efecto IKEA también tiene una cara menos amable: tendemos a sobrevalorar lo nuestro. Que tu escritorio te encante no significa que sea la mejor opción para una empresa. Lo pensarás en el apartado 9.
:::

::: tip
Referencia: Norton, M. I., Mochon, D. y Ariely, D. (2012). *The IKEA effect: When labor leads to love*. Journal of Consumer Psychology, 22(3), 453-460.
:::

# 2. Resultados de aprendizaje

Al terminar la práctica deberías ser capaz de:

1. Explicar qué datos necesita un equipo para comunicarse y qué programa se encarga de ponérselos.
2. Configurar la red con `systemd-networkd` y, si falla, encontrar en qué punto se rompe.
3. Instalar programas con `pacman`, crear usuarios y darles permisos de administración con `sudo`.
4. Distinguir las piezas que forman un entorno gráfico en Linux e instalar KDE Plasma.
5. Pasar la red de un gestor a otro sin quedarte sin conexión.
6. Personalizar el escritorio y opinar con criterio sobre cuándo conviene hacerlo.

| Parte | Contenido | Sesión |
| --- | --- | --- |
| Preparación | Máquina virtual e instantánea inicial | 1 |
| Red | `systemd-networkd` y `systemd-resolved` | 1 y 2 |
| Usuario | `pacman`, usuarios, grupos y `sudo` | 2 |
| Escritorio | Piezas del entorno gráfico, Wayland y KDE Plasma | 3 |
| NetworkManager | Cambio de gestor de red | 4 |
| Estilo macOS | Temas, barra superior y dock | 4 y 5 |
| Comparativa | Preguntas de reflexión | 5 |

Cada sesión dura 55 minutos. Las explicaciones de cada apartado las leeremos y comentaremos en clase antes de pasar a los pasos.

# 3. Preparación

## Máquina virtual

Un escritorio completo pide bastante más que una consola de texto, así que antes de empezar conviene darle a la máquina virtual algo más de margen. Con la máquina **apagada**, abre su configuración en VirtualBox y comprueba estos ajustes:

| Apartado | Ajuste |
| --- | --- |
| Sistema → Placa base | Memoria base: 4096 MB o más |
| Sistema → Procesador | 2 CPU o más |
| Pantalla → Pantalla | Controlador gráfico VMSVGA, 128 MB de memoria de vídeo |
| Red → Adaptador 1 | Habilitado, conectado a NAT |
| Disco | Al menos 10 GB libres para el escritorio |

Toma la instantánea `01-recien-instalado` (**Instantáneas → Tomar**).

::: aviso
Haz una instantánea **al terminar cada parte**, con el nombre que se indica en cada apartado. Si algo se rompe y no sabes qué ha sido, restaura la última y repite desde ahí: es mucho más rápido que buscar el fallo a ciegas.
:::

## Trabajar en la consola

Hasta que tengas escritorio, todo será texto. Al principio se hace lento, pero con cuatro atajos se gana mucha soltura:

| Acción | Cómo |
| --- | --- |
| Completar un nombre de archivo u orden | Escribe las primeras letras y pulsa `Tab` |
| Repetir una orden anterior | Flecha arriba |
| Cancelar una orden que no termina | `Ctrl+C` |
| Saber dónde estás y quién eres | `pwd` y `whoami` |
| Capturar la pantalla sin escritorio | En VirtualBox, **Ver → Tomar captura de pantalla** |

::: aviso
Copia los comandos tal cual, respetando espacios, mayúsculas y símbolos. Cuando veas `enp0s3` o `tunombre`, sustitúyelos por **tu** dato.
:::

## Punto de partida

Arranca la máquina, entra como `root` y cuenta cuántos programas tiene ahora mismo el sistema:

```bash
pacman -Q | wc -l
```

`pacman -Q` saca la lista de paquetes instalados, uno por línea, y `wc -l` cuenta las líneas. Saldrá un número entre 100 y 200, más o menos. **Apúntalo**: cuando instales el escritorio volverás a contar y te sorprenderá la diferencia.

# 4. Red con systemd-networkd

## Parámetros de red

Piensa en cómo funciona el correo postal. Para que una carta llegue, necesitas una dirección. Si va a otra ciudad, la dejas en la oficina de correos y ellos se encargan del resto. Y si solo sabes el nombre de la persona, necesitas una guía que te diga dónde vive. Una red funciona igual, y por eso todo equipo necesita tres datos:

- **[Dirección IP](https://es.wikipedia.org/wiki/Dirección_IP) y prefijo**, por ejemplo `10.0.2.15/24`. La IP es la dirección del equipo. El [prefijo](https://es.wikipedia.org/wiki/Classless_Inter-Domain_Routing) (`/24`) indica qué parte de esa dirección corresponde a la red, y así el equipo sabe qué otros equipos tiene «en su calle» y con cuáles tiene que hablar a través de otro.
- **[Puerta de enlace](https://es.wikipedia.org/wiki/Puerta_de_enlace)**, por ejemplo `10.0.2.2`. Es la oficina de correos: el equipo al que se entrega todo lo que va fuera de la propia red, por ejemplo a Internet. Normalmente es el router.
- **Servidor [DNS](https://es.wikipedia.org/wiki/Sistema_de_nombres_de_dominio)**, por ejemplo `10.0.2.3`. Es la guía: traduce nombres como `archlinux.org` a la dirección IP del servidor. Sin DNS podrías llegar a cualquier sitio, pero tendrías que saberte las direcciones de memoria.

Esos datos se pueden escribir a mano o pedir a la red. Escribirlos a mano es la **configuración estática**: tiene sentido en un servidor, porque los demás equipos tienen que saber siempre dónde encontrarlo. Pedirlos a la red es usar **[DHCP](https://es.wikipedia.org/wiki/Protocolo_de_configuración_dinámica_de_host)**: un servidor de la red te presta una dirección libre y te dice cuál es la puerta de enlace y el DNS. Es lo que hace tu móvil cada vez que se conecta a una Wi-Fi nueva, y lo que usarás aquí.

En tu máquina virtual, con la red en modo [NAT](https://es.wikipedia.org/wiki/Traducción_de_direcciones_de_red), el propio VirtualBox se hace pasar por router, servidor DHCP y servidor DNS. Por eso las direcciones `10.0.2.x` serán casi iguales en todos los ordenadores del aula.

::: nota
Que la interfaz tenga dirección IP no significa que haya Internet. Puede faltar la puerta de enlace o fallar el DNS. Por eso, cuando una red no funciona, se revisa por orden: primero la dirección, luego la ruta, después el DNS y, al final, el servicio que intentas usar.
:::

## Nombres de las interfaces

Cada tarjeta de red tiene un nombre en el sistema. Hace años se llamaban `eth0`, `eth1`… según el orden en que el sistema las detectaba al arrancar, y eso daba problemas: si añadías una tarjeta, los nombres podían intercambiarse y la configuración se aplicaba a la que no era. Hoy Linux usa **[nombres predecibles](https://en.wikipedia.org/wiki/Consistent_Network_Device_Naming)**, que dependen de dónde está conectada la tarjeta y, por tanto, no cambian:

| Nombre | Cómo se lee |
| --- | --- |
| `lo` | La interfaz de [bucle local](https://es.wikipedia.org/wiki/Loopback) (*loopback*). No es una tarjeta: es el propio equipo hablando consigo mismo, y siempre está |
| `enp0s3` | Ethernet (`en`), en el bus PCI 0 (`p0`), ranura 3 (`s3`). Es el nombre habitual en VirtualBox |
| `wlp2s0` | Una tarjeta inalámbrica (`wl`) en el bus 2, ranura 0 |

## Gestor de red

El [núcleo](https://es.wikipedia.org/wiki/Núcleo_(informática)) de Linux sabe hablar con la tarjeta de red, pero no toma decisiones: no sabe si tiene que pedir una dirección por DHCP, qué ruta usar o a qué DNS preguntar. Alguien tiene que hacer ese trabajo al arrancar, y repetirlo cada vez que se desconecta el cable o caduca la dirección prestada. Ese alguien es el **gestor de red**, un programa que se queda funcionando en segundo plano mientras el equipo está encendido.

Casi todas las distribuciones traen uno ya configurado, y por eso nunca te habías tenido que preocupar. Arch no: te deja el sistema sin red y que elijas tú. Cada sistema tiene sus costumbres:

| Sistema | Gestor habitual | Dónde se configura |
| --- | --- | --- |
| Arch Linux | `systemd-networkd` o NetworkManager, a elegir | Archivos `.network`, o `nmcli` |
| Debian | `ifupdown` | El archivo `/etc/network/interfaces` |
| Ubuntu | Netplan, que no aplica nada por sí mismo: traduce su configuración para `systemd-networkd` o NetworkManager | Archivos YAML en `/etc/netplan/` |
| Red Hat, Fedora | NetworkManager | `nmcli`, `nmtui` |
| Windows | Servicios de red de Windows | Configuración, `netsh` o PowerShell |
| macOS | `configd` | Ajustes del Sistema o la orden `networksetup` |

::: aviso
**Una interfaz, un gestor.** Si dos gestores intentan configurar la misma tarjeta, se pelean: uno pone una dirección y el otro la quita, desaparecen rutas o el DNS deja de responder. Antes de activar uno hay que desactivar el otro. Lo harás en el apartado 7.
:::

## systemd-networkd

En esta primera parte usarás `systemd-networkd`, el gestor de red que forma parte de **[systemd](https://es.wikipedia.org/wiki/Systemd)**. systemd es el primer programa que arranca en tu Arch y el que se encarga de poner en marcha y vigilar todo lo demás. Como ya está instalado, no hace falta descargar nada, y eso es justo lo que necesitamos: sin red, no podríamos.

Su forma de trabajar es muy sencilla. Al arrancar, busca archivos con extensión `.network` en la carpeta `/etc/systemd/network/`. Cada archivo tiene dos partes:

- Una sección `[Match]`, que dice a qué interfaz se refiere. Por ejemplo, `Name=enp0s3`.
- Una sección `[Network]`, que dice qué hacer con ella. Por ejemplo, `DHCP=yes` para pedir la configuración a la red.

Si hay varios archivos, los lee por orden alfabético y a cada interfaz le aplica el primero que encaja. Por eso es costumbre empezar el nombre con un número, como `20-cableada.network`: así decides tú el orden. Una vez configurada la interfaz, `systemd-networkd` la sigue vigilando: si se desconecta el cable o hay que renovar la dirección, vuelve a actuar.

Al tenerlo todo en archivos de texto, es fácil de copiar de un equipo a otro, de revisar y de automatizar. Por eso se usa tanto en servidores y máquinas virtuales. A cambio, no tiene ninguna ventana para configurarlo y, si quieres conectarte a una Wi-Fi, necesita la ayuda de otro programa.

## systemd-resolved

Que el equipo sepa qué servidor DNS usar no significa que los programas sepan preguntarle. De eso se encarga otro componente de systemd, `systemd-resolved`. Recibe de `systemd-networkd` la lista de servidores DNS, atiende las preguntas de los programas («¿qué IP tiene `archlinux.org`?») y recuerda las respuestas durante un rato, para no tener que preguntar lo mismo dos veces.

Queda un detalle. Desde hace décadas, los programas de Linux miran el archivo `/etc/resolv.conf` para saber a quién preguntar los nombres. En lugar de cambiar todos los programas, se convierte ese archivo en un **enlace** al que genera `systemd-resolved`. Ese archivo dice: «pregunta a `127.0.0.53`», que es una dirección del propio equipo donde está escuchando `systemd-resolved`. Así, cualquier programa acaba preguntándole a él sin saberlo.

No es la única forma de hacerlo. Lo más simple es escribir a mano en `/etc/resolv.conf` una línea `nameserver` con la IP del DNS, pero si cambias de red tendrás que cambiarla tú. En el extremo contrario, programas como `dnsmasq` o `unbound` son servidores DNS completos que, además de servir al propio equipo, pueden dar servicio a toda una red. En Windows, este papel lo cumple el servicio Cliente DNS.

## Servicios de systemd

`systemd-networkd` y `systemd-resolved` son **servicios**: programas que se ejecutan en [segundo plano](https://es.wikipedia.org/wiki/Daemon_(informática)), sin ventana, y que nadie abre a mano. En Linux se manejan con la orden `systemctl`, y hay dos ideas que conviene no confundir:

- **Arrancar** (`start`) pone el servicio en marcha ahora mismo. Si reinicias, no vuelve.
- **Habilitar** (`enable`) deja apuntado que debe arrancar en cada inicio, pero no lo arranca en ese momento.

Normalmente quieres las dos cosas, y por eso existe `enable --now`. Estas son las órdenes que más vas a usar:

| Orden | Qué hace |
| --- | --- |
| `systemctl enable --now servicio` | Lo arranca y lo deja habilitado para siempre |
| `systemctl status servicio` | Dice si está funcionando y muestra sus últimos mensajes |
| `systemctl disable --now servicio` | Lo detiene y evita que vuelva a arrancar |

::: nota
En Windows existe lo mismo: la consola **Servicios** (`services.msc`), donde cada servicio tiene un tipo de inicio «Automático», «Manual» o «Deshabilitado». En macOS los servicios los gestiona `launchd`.
:::

## Observar

Antes de cambiar nada, mira cómo está la red:

```bash
ip link
ip address
ping -c 3 archlinux.org
```

`ip link` te enseñará dos interfaces. La primera es `lo`. La segunda es tu tarjeta de red: **apunta su nombre exacto**, porque lo vas a necesitar. En este documento la llamaremos `enp0s3`.

Verás que la tarjeta no tiene ninguna línea `inet` con una dirección IPv4 y que el `ping` falla porque no consigue resolver el nombre. Tiene sentido: la tarjeta está ahí, pero nadie le ha dado una dirección.

**[Captura 1]** salida de `ip address` y del `ping`.

**Pregunta 1.** ¿Cómo se llama tu interfaz de red (no la `lo`)? Explica qué significa cada parte del nombre.

**Pregunta 2.** ¿Tiene dirección IPv4? ¿Qué error da el `ping`?

## Archivo de configuración

Aquí aparece el primer problema curioso: no tienes ningún editor de texto instalado y, sin red, no puedes instalarlo. La solución es escribir el archivo directamente desde la terminal. Escribe el bloque completo, pulsando `Intro` al final de cada línea:

```bash
cat > /etc/systemd/network/20-cableada.network << 'EOF'
[Match]
Name=enp0s3

[Network]
DHCP=yes
EOF
```

Mientras escribes, la consola pone `>` al principio de cada línea: te está diciendo que sigue esperando el final. Cuando escribes `EOF`, guarda el archivo. Comprueba que ha quedado bien:

```bash
cat /etc/systemd/network/20-cableada.network
```

Deben aparecer exactamente cinco líneas, sin `EOF`.

::: nota
`cat > archivo << 'EOF'` le dice a la terminal: «todo lo que escriba a partir de ahora, hasta una línea que ponga `EOF`, guárdalo en este archivo». Si te equivocas, no pasa nada: vuelve a escribir el bloque entero y el archivo se sobrescribe.
:::

## Activar los servicios

```bash
systemctl enable --now systemd-networkd systemd-resolved
ln -sf ../run/systemd/resolve/stub-resolv.conf /etc/resolv.conf
```

La primera orden arranca los dos servicios y los deja habilitados para los próximos arranques. La segunda convierte `/etc/resolv.conf` en el enlace del que hablábamos. Puedes comprobarlo con `ls -l /etc/resolv.conf`: verás una flecha que apunta a `../run/systemd/resolve/stub-resolv.conf`.

## Diagnóstico por pasos

Ahora toca comprobar que todo funciona, y hacerlo con orden. Si saltas directamente al `ping` y falla, no sabrás si el problema está en la dirección, en la ruta o en el DNS. Ejecuta estas órdenes una a una:

| Orden | Qué tienes que ver |
| --- | --- |
| `networkctl` | Tu interfaz con OPERATIONAL `routable` y SETUP `configured`: `systemd-networkd` la ha configurado y tiene salida |
| `ip address` | Una línea `inet 10.0.2.15/24` o parecida: ya tienes dirección |
| `ip route` | Una línea `default via 10.0.2.2`: esa es tu puerta de enlace |
| `resolvectl status` | En tu interfaz, `Current DNS Server` con una dirección: ya sabes a quién preguntar los nombres |
| `ping -c 3 archlinux.org` | Tres respuestas y `0% packet loss`: todo funciona de principio a fin |

**[Captura 2]** salida de `networkctl`, `ip route` y el `ping` correcto.

Completa en tu memoria esta tabla:

| Dato | Valor en tu máquina |
| --- | --- |
| Dirección IP y prefijo | |
| Puerta de enlace | |
| Servidor DNS | |

**Pregunta 3.** ¿Qué indica `networkctl` en la columna SETUP de tu interfaz? ¿Quién le ha dado la dirección IP?

::: aviso
- **SETUP `unmanaged`**: `systemd-networkd` no reconoce la interfaz como suya. Casi siempre es que el nombre de `Name=` no coincide con el de tu tarjeta. Corrígelo y ejecuta `networkctl reload`.
- **SETUP `configuring` durante mucho rato**: está pidiendo dirección y nadie le contesta. Revisa que el adaptador de la máquina virtual está en NAT y con el cable conectado.
- **Hay IP pero el `ping` falla**: la red funciona, pero los nombres no se resuelven. Repite el enlace de `/etc/resolv.conf` y mira si `systemd-resolved` está funcionando con `systemctl status systemd-resolved`.
:::

## Persistencia

Una configuración que se pierde al reiniciar no sirve de mucho. Compruébalo:

```bash
reboot
```

Vuelve a entrar como `root` y repite `ping -c 3 archlinux.org`. Debe funcionar sin que hagas nada.

**Pregunta 4.** ¿Funciona la red tras reiniciar? ¿Qué parte de la orden `systemctl enable --now` lo ha hecho posible?

Toma la instantánea `02-red-networkd`.

::: ejercicio
**IP estática.** Prueba a configurar la dirección a mano en lugar de pedirla por DHCP, con los valores que te dé el docente:

```bash
cat > /etc/systemd/network/20-cableada.network << 'EOF'
[Match]
Name=enp0s3

[Network]
Address=10.0.2.15/24
Gateway=10.0.2.2
DNS=10.0.2.3
EOF
```

Aplica el cambio con `networkctl reload` (si no cambia nada, `systemctl restart systemd-networkd`) y comprueba que sigue habiendo Internet. Fíjate en que ahora tienes que escribir tú los tres datos que antes te daba el DHCP. Al terminar, **vuelve a dejar `DHCP=yes`**.
:::

# 5. Usuario y sudo

## pacman

En Windows, para instalar un programa sueles buscarlo en Internet, descargar un instalador y pulsar «Siguiente» varias veces. En Linux lo normal es pedírselo al **[gestor de paquetes](https://es.wikipedia.org/wiki/Sistema_de_gestión_de_paquetes)**, que es algo así como una tienda de aplicaciones para todo el sistema: le dices el nombre del programa y él lo busca, lo descarga, lo instala y, más adelante, lo mantiene actualizado.

Su trabajo más valioso es el que no se ve: las **dependencias**. Casi ningún programa funciona solo. Firefox, por ejemplo, necesita decenas de bibliotecas para dibujar ventanas, reproducir vídeo o cifrar conexiones. El gestor de paquetes sabe qué necesita cada programa y lo instala todo de una vez, sin que tengas que preocuparte.

En Arch, el gestor de paquetes es `pacman`, creado expresamente para [Arch Linux](https://es.wikipedia.org/wiki/Arch_Linux), y funciona así:

- Los programas están en **repositorios**, servidores de Internet con miles de paquetes ya preparados. Hay copias del mismo repositorio en todo el mundo (*mirrors*), y la lista de las que usa tu equipo está en `/etc/pacman.d/mirrorlist`.
- `pacman` guarda una copia del catálogo de cada repositorio y una lista de todo lo que tienes instalado. Por eso `pacman -Q` responde al instante, sin conectarse a nada.
- Cada paquete llega **[firmado](https://es.wikipedia.org/wiki/Firma_digital)** por la persona que lo preparó. Antes de instalar, `pacman` comprueba la firma con las claves del paquete `archlinux-keyring`. Si alguien hubiera modificado el paquete por el camino, la firma no cuadraría y `pacman` se negaría a instalarlo.

Estas son las órdenes que vas a usar:

| Orden | Qué hace |
| --- | --- |
| `pacman -Syu` | Descarga el catálogo actualizado (`-y`) y actualiza todo lo que tengas instalado (`-u`) |
| `pacman -S paquete` | Instala un paquete y todo lo que necesita |
| `pacman -Ss texto` | Busca paquetes por nombre o descripción |
| `pacman -Q` | Lista lo que tienes instalado |
| `pacman -R paquete` | Desinstala un paquete |

::: aviso
En Arch no se hacen **actualizaciones parciales**. Si descargas el catálogo nuevo (`-Sy`) e instalas un programa sin actualizar el resto, ese programa llegará pensado para bibliotecas más nuevas que las que tienes, y puede no arrancar o romper otros. Actualiza siempre todo con `-Syu`.
:::

Cada familia de distribuciones tiene su propio gestor, y la idea es la misma en todos: [`apt`](https://es.wikipedia.org/wiki/Advanced_Packaging_Tool) en Debian y Ubuntu, `dnf` en Fedora y Red Hat, `zypper` en openSUSE. Además existen [Flatpak](https://es.wikipedia.org/wiki/Flatpak) y [Snap](https://en.wikipedia.org/wiki/Snap_(software)), que funcionan en cualquier distribución porque cada aplicación lleva dentro sus propias bibliotecas. Windows tiene [`winget`](https://en.wikipedia.org/wiki/Windows_Package_Manager) y la Microsoft Store, y en macOS, además de la App Store, mucha gente usa [Homebrew](https://en.wikipedia.org/wiki/Homebrew_(package_manager)) para las herramientas de terminal.

## Actualizar el sistema

Ahora que hay red, lo primero es poner el sistema al día e instalar dos herramientas:

```bash
pacman -Syu
pacman -S sudo nano
```

Responde `S` o pulsa `Intro` cuando pregunte. `sudo` lo necesitarás enseguida y `nano` es un editor de texto sencillo para la terminal: se maneja con las flechas y los atajos aparecen en la parte de abajo.

::: aviso
Si aparece un error de firmas o claves (*invalid or corrupted package*, *unknown trust*), es que tu llavero de claves es más antiguo que algunos paquetes. Actualízalo primero y repite:

```bash
pacman -Sy archlinux-keyring
pacman -Syu
```
:::

## Usuarios y grupos

Linux nació como sistema **[multiusuario](https://es.wikipedia.org/wiki/Multiusuario)**: varias personas usando el mismo equipo, cada una con su cuenta, su carpeta y sus permisos, sin poder tocar lo de los demás. Además de las cuentas de personas, hay cuentas para los servicios. Por ejemplo, `systemd-networkd` no funciona como `root`, sino con su propia cuenta `systemd-network`, que solo puede hacer lo que necesita. Si alguien encontrara un fallo en ese servicio, no tendría el sistema entero a su alcance.

Toda esa información está en tres archivos de texto:

| Archivo | Qué guarda |
| --- | --- |
| `/etc/passwd` | Una línea por cuenta: nombre, número de usuario (UID), carpeta personal y programa que se abre al entrar |
| `/etc/shadow` | Las contraseñas, guardadas de forma que no se pueden leer. Solo `root` tiene acceso |
| `/etc/group` | Los grupos y quién pertenece a cada uno |

Los **grupos** sirven para dar permisos a varias personas a la vez, en lugar de una a una. El grupo `wheel` es, por tradición, el de las personas que pueden administrar el equipo.

Hasta ahora has hecho todo como [`root`](https://es.wikipedia.org/wiki/Superusuario), el administrador. `root` puede hacer cualquier cosa sin que el sistema le pregunte nada, y eso es justo lo peligroso. Un error al teclear una ruta puede borrar medio sistema, y cualquier programa que ejecutes como `root` también puede hacerlo todo, incluido uno que tenga un fallo de seguridad. Por eso, para el día a día, se usa una cuenta normal.

## Crear el usuario

Crea tu usuario en minúsculas, sin espacios ni tildes:

```bash
useradd -m -G wheel tunombre
passwd tunombre
```

`-m` crea su carpeta personal en `/home/tunombre` y `-G wheel` lo mete en el grupo de administradores. Al escribir la contraseña no verás nada en pantalla, ni siquiera asteriscos: es normal, para que nadie pueda contar cuántas letras tiene.

Comprueba con `id tunombre` que aparece `wheel` entre sus grupos.

## sudo

Si tu usuario no es `root`, ¿cómo vas a instalar programas o cambiar la configuración? Para eso está [`sudo`](https://es.wikipedia.org/wiki/Sudo). Escribes `sudo` delante de una orden y esa orden concreta se ejecuta como `root`. La siguiente, si no lleva `sudo`, vuelve a ser tuya. Es como tener la llave del cuarto de mantenimiento: entras, haces lo que tienes que hacer y sales.

Por dentro funciona así:

- Lee sus normas en `/etc/sudoers`. Cada norma dice quién puede usar `sudo`, para qué órdenes y como qué usuario.
- Te pide **tu** contraseña, no la de `root`. No quiere saber si conoces la clave del administrador, sino comprobar que la persona que está tecleando eres tú y no alguien que ha encontrado tu sesión abierta.
- Durante unos minutos no te la vuelve a pedir, para no hacerse pesado.
- Apunta cada orden en el registro del sistema. Si algo se rompe, siempre se puede saber quién ejecutó qué.

La alternativa clásica es [`su`](https://es.wikipedia.org/wiki/Su_(Unix)), que te convierte en `root` hasta que escribes `exit`. El problema es que pide la contraseña de `root`, así que todo el que administre el equipo tiene que conocerla, y mientras dura la sesión todo lo que haces tiene permisos totales. Hay otras opciones más modernas, como [`doas`](https://en.wikipedia.org/wiki/Doas), una versión más pequeña de `sudo` que viene de OpenBSD, o `run0`, la propuesta de systemd. En Windows, la idea equivalente es el [Control de cuentas de usuario](https://es.wikipedia.org/wiki/Control_de_cuentas_de_usuario): esa ventana que se oscurece y te pregunta si quieres permitir que un programa haga cambios en el equipo. macOS pide la contraseña de un administrador y, en su terminal, también usa `sudo`.

## Permitir sudo al grupo wheel

Por defecto, `sudo` no deja a nadie hacer nada. Tienes que darle permiso al grupo `wheel`:

```bash
EDITOR=nano visudo
```

Busca la línea `# %wheel ALL=(ALL:ALL) ALL` y borra la almohadilla y el espacio del principio. Debe quedar `%wheel ALL=(ALL:ALL) ALL`. Guarda con `Ctrl+O` e `Intro` y sal con `Ctrl+X`.

La almohadilla convierte una línea en comentario, es decir, en una línea que el programa ignora. Al quitarla, activas la norma, que se lee así: «los miembros del grupo `wheel` (`%wheel`), desde cualquier equipo (el primer `ALL`), pueden ejecutar como cualquier usuario y grupo (`(ALL:ALL)`) cualquier orden (el último `ALL`)».

::: aviso
Hay otra línea parecida que termina en `NOPASSWD: ALL`. **No es esa**: permitiría usar `sudo` sin escribir la contraseña, y cualquiera que se sentara en tu sesión podría hacer lo que quisiera.
:::

::: nota
Este archivo se edita siempre con `visudo`, nunca abriéndolo directamente. `visudo` comprueba que lo que has escrito es correcto antes de guardarlo. Si guardaras un error, `sudo` dejaría de funcionar y podrías quedarte sin forma de administrar el equipo. Si `visudo` avisa de un `syntax error`, pulsa `e` para volver a editar.
:::

Prueba el resultado entrando como tu usuario:

```bash
su - tunombre
sudo whoami
exit
```

Te pedirá **tu** contraseña y `sudo whoami` debe responder `root`: durante esa orden, eras el administrador. Con `exit` vuelves a la sesión de `root`.

**Pregunta 5.** ¿Qué responde `sudo whoami`? ¿Por qué no conviene trabajar siempre como `root`? ¿Qué ventaja tiene `sudo` frente a `su`?

# 6. KDE Plasma

## Piezas del entorno gráfico

Puede parecer raro, pero un sistema operativo no necesita ventanas para funcionar. La mayoría de servidores de Internet no tienen escritorio: se administran por terminal, muchas veces a distancia. Así gastan menos memoria y tienen menos programas que actualizar y que pueden fallar. La interfaz gráfica es **una capa más** que se pone encima del sistema cuando hace falta.

En Windows y macOS esa capa viene de serie y forma un bloque: no puedes cambiar el escritorio de Windows por otro. En Linux, en cambio, el escritorio está hecho de piezas que se pueden combinar como un Lego, y cada una tiene varias alternativas:

- El **protocolo gráfico** es el idioma en el que las aplicaciones piden dibujar en pantalla y reciben lo que haces con el teclado y el ratón. Hay dos: X11 y Wayland.
- El **compositor**, o [gestor de ventanas](https://es.wikipedia.org/wiki/Gestor_de_ventanas), decide dónde va cada ventana, le pone su barra de título y combina todas en la imagen final, con sus sombras y animaciones. En KDE se llama [KWin](https://es.wikipedia.org/wiki/KWin); en GNOME, Mutter.
- El **[entorno de escritorio](https://es.wikipedia.org/wiki/Entorno_de_escritorio)** es el conjunto completo que usas: paneles, menú de aplicaciones, ajustes, gestor de archivos y un montón de programas que comparten aspecto. KDE Plasma, GNOME, Xfce o Cinnamon son entornos de escritorio.
- El **[gestor de inicio de sesión](https://en.wikipedia.org/wiki/X_display_manager)** es la pantalla donde escribes tu usuario y tu contraseña antes de entrar.
- La **biblioteca gráfica** (*toolkit*) es la caja de herramientas con la que los programadores construyen botones, menús y casillas. KDE usa [Qt](https://es.wikipedia.org/wiki/Qt_(biblioteca)); GNOME y Xfce usan [GTK](https://es.wikipedia.org/wiki/GTK). Por eso una aplicación de GNOME se ve un poco distinta dentro de Plasma: está hecha con otras piezas.

## X11 y Wayland

**[X11](https://es.wikipedia.org/wiki/Sistema_de_ventanas_X)** es el sistema gráfico clásico de Unix. Nació en los años 80, cuando lo normal era trabajar en un terminal conectado a un ordenador central, y por eso su diseño es curioso: hay un programa intermediario, el servidor X, al que todas las aplicaciones le piden que dibuje por ellas. Ha funcionado durante cuarenta años, pero arrastra problemas difíciles de arreglar. El más serio es que cualquier aplicación puede espiar a las demás: leer lo que tecleas en otra ventana o capturar su contenido.

**[Wayland](https://es.wikipedia.org/wiki/Wayland_(protocolo))** es su sustituto. Elimina al intermediario: cada aplicación dibuja su propia ventana y se la entrega ya terminada al compositor, que la coloca en pantalla. Cada aplicación solo ve lo suyo, así que es bastante más seguro, y además se lleva mejor con las pantallas actuales, por ejemplo cuando conectas un monitor 4K junto a otro normal. Las aplicaciones antiguas que solo saben hablar X11 siguen funcionando gracias a **XWayland**, una pieza que hace de traductor.

::: nota
KDE [ha anunciado](https://blogs.kde.org/2025/11/26/going-all-in-on-a-wayland-future/) que, a partir de Plasma 6.8, la sesión X11 deja de existir y Plasma será solo Wayland. En la práctica usarás la sesión Wayland, que ya es la que se abre por defecto.
:::

## KDE Plasma

[KDE Plasma](https://es.wikipedia.org/wiki/KDE_Plasma_6) es, junto a [GNOME](https://es.wikipedia.org/wiki/GNOME), el entorno de escritorio más usado en Linux. Es el que lleva, por ejemplo, la consola [Steam Deck](https://es.wikipedia.org/wiki/Steam_Deck) cuando la pasas a modo escritorio. Está construido con la biblioteca Qt y lo forman varias piezas que irás reconociendo:

- **KWin** es su compositor. Coloca las ventanas, dibuja sus barras de título y aplica los efectos. En una sesión Wayland, además, hace de servidor gráfico.
- **Plasma Shell** dibuja todo lo que no es una ventana: el fondo, los paneles, el menú y los pequeños elementos gráficos, como el reloj o el icono de red.
- **Preferencias del sistema** es el panel desde el que se configura todo.
- Las **aplicaciones de KDE**, como Dolphin, Konsole o Kate, comparten unas bibliotecas comunes, KDE Frameworks, y por eso se ven y se comportan igual.

Lo que hace especial a Plasma es que casi todo se puede cambiar: mover paneles, añadir o quitar elementos, cambiar el aspecto de las ventanas, los iconos, los atajos… Para un usuario que quiere tocar poco puede ser abrumador, pero para esta práctica es perfecto.

Hay muchas otras opciones, y cada una encaja con un tipo de usuario. **GNOME**, el escritorio por defecto de Ubuntu y Fedora, apuesta por lo contrario: pocas opciones y una forma de trabajar muy pensada, que se amplía con extensiones. **[Xfce](https://es.wikipedia.org/wiki/Xfce)**, **[LXQt](https://es.wikipedia.org/wiki/LXQt)** y **[MATE](https://es.wikipedia.org/wiki/MATE)** son ligeros y van bien en equipos con pocos recursos. **[Cinnamon](https://es.wikipedia.org/wiki/Cinnamon)**, el de Linux Mint, tiene un aspecto clásico que recuerda a Windows. Y luego están los [gestores de ventanas en mosaico](https://en.wikipedia.org/wiki/Tiling_window_manager), como **[i3](https://es.wikipedia.org/wiki/I3_(gestor_de_ventanas))**, **[Sway](https://en.wikipedia.org/wiki/Sway_(window_manager))** o **[Hyprland](https://en.wikipedia.org/wiki/Hyprland)**: las ventanas no se solapan, sino que se reparten la pantalla automáticamente, y todo se maneja con el teclado. Son muy rápidos una vez aprendes los atajos, y muy populares entre programadores.

## Instalación

```bash
pacman -S plasma-meta konsole dolphin kate firefox noto-fonts
```

| Paquete | Qué es |
| --- | --- |
| `plasma-meta` | El escritorio Plasma completo: KWin, Plasma Shell, los ajustes y el gestor de inicio de sesión |
| `konsole` | La terminal de KDE |
| `dolphin` | El gestor de archivos, equivalente al Explorador de Windows o al Finder de macOS |
| `kate` | Un editor de texto con resaltado de código |
| `firefox` | El navegador |
| `noto-fonts` | Una familia de tipografías que cubre casi todos los idiomas, para que los textos no aparezcan como cuadraditos |

Si `pacman` pregunta qué proveedor quieres para algún paquete, pulsa `Intro` para aceptar el que propone. La descarga tarda un rato: buen momento para releer la parte de X11 y Wayland.

::: nota
`plasma-meta` es un **metapaquete**: no contiene ningún programa, solo una lista de los paquetes que forman Plasma. Instalarlo es como pedir «el escritorio completo» sin tener que nombrar una a una sus decenas de piezas. Otras distribuciones tienen lo mismo con otros nombres, como `kde-standard` en Debian.
:::

## Utilidades de invitado

Una [máquina virtual](https://es.wikipedia.org/wiki/Máquina_virtual) no sabe que es virtual: cree que tiene una tarjeta gráfica y un monitor reales. Por eso, sin ayuda, la pantalla se queda con una resolución fija aunque hagas la ventana más grande, y no puedes copiar texto del ordenador real a la máquina. Las **utilidades de invitado** son un pequeño servicio que se comunica con [VirtualBox](https://es.wikipedia.org/wiki/VirtualBox) y resuelve esas cosas: ajusta la resolución al tamaño de la ventana, comparte el portapapeles y permite usar carpetas compartidas.

```bash
pacman -S virtualbox-guest-utils
systemctl enable vboxservice
```

Cada programa de virtualización tiene las suyas: `open-vm-tools` en VMware, `spice-vdagent` y `qemu-guest-agent` en QEMU con virt-manager, o el paquete `hyperv` en Hyper-V. Si la máquina virtual fuera un Windows, se instalarían las Guest Additions desde el menú **Dispositivos** de VirtualBox.

## Gestor de inicio de sesión

El **gestor de inicio de sesión** (*display manager*) es el primer programa gráfico que verás al arrancar. Te muestra la pantalla de acceso, comprueba tu contraseña y, si es correcta, abre el escritorio con tu usuario. Si tienes varios escritorios instalados, también te deja elegir cuál quieres usar.

Plasma trae el suyo, **[Plasma Login Manager](https://invent.kde.org/plasma/plasma-login-manager)**, que se pone en marcha con el servicio `plasmalogin`. Hasta hace poco, KDE usaba **[SDDM](https://en.wikipedia.org/wiki/Simple_Desktop_Display_Manager)**, que todavía encontrarás en muchos equipos. GNOME usa **[GDM](https://en.wikipedia.org/wiki/GNOME_Display_Manager)** y muchos escritorios ligeros, **[LightDM](https://es.wikipedia.org/wiki/LightDM)**. Incluso se puede prescindir de él: entrar por la consola de texto, como has hecho hasta ahora, y arrancar el escritorio a mano con `startplasma-wayland`.

```bash
systemctl enable plasmalogin
pacman -Q | wc -l
reboot
```

Fíjate en que esta vez solo usamos `enable`, sin `--now`. No queremos que aparezca la pantalla de acceso en mitad de lo que estamos haciendo: queremos que esté ahí en el próximo arranque. Antes de reiniciar, apunta el número de paquetes.

Al reiniciar aparecerá la pantalla de inicio de sesión de Plasma. Si puedes elegir sesión, usa **Plasma (Wayland)**, y entra con **tu usuario**, no con `root`.

**[Captura 3]** el escritorio recién instalado.

Abre Konsole desde el menú de aplicaciones y ejecuta:

```bash
echo $XDG_SESSION_TYPE
```

**Pregunta 6.** ¿Cuántos paquetes ha añadido el escritorio? ¿Qué te dice eso sobre por qué muchos servidores no llevan interfaz gráfica?

**Pregunta 7.** ¿Qué responde `echo $XDG_SESSION_TYPE`? ¿Qué diferencia hay entre una sesión X11 y una Wayland?

::: aviso
Si la pantalla se queda negra, pulsa `Ctrl+Alt+F3`, entra como `root` y avisa al docente. Volverás al escritorio con `Ctrl+Alt+F1` o `Ctrl+Alt+F2`.
:::

Toma la instantánea `03-kde-instalado`.

# 7. NetworkManager

## Dos gestores de red

Haz clic en el icono de red de la bandeja del sistema, abajo a la derecha, y abre cualquier página en Firefox. Verás algo raro: Firefox navega sin problemas, pero el icono dice que no hay ninguna conexión.

No es un fallo. El icono de red de Plasma no gestiona la red: es solo una ventana para darle órdenes a **[NetworkManager](https://es.wikipedia.org/wiki/NetworkManager)**, otro gestor de red. Y tu red la sigue llevando `systemd-networkd`, con el que el icono no sabe hablar. Es como tener el mando de una tele en la mano mientras la que está encendida es otra.

**Pregunta 8.** ¿Por qué el icono no puede gestionar la red, si la red funciona?

## Cómo funciona NetworkManager

NetworkManager es el gestor de red que llevan casi todos los equipos de escritorio con Linux. Está pensado para equipos que se mueven: un portátil que por la mañana está en la Wi-Fi del instituto, por la tarde en la de casa y de camino usa los datos del móvil.

En lugar de archivos por interfaz, trabaja con **conexiones**: perfiles con nombre que recuerdan cómo conectarse a una red concreta, como «Wi-Fi de casa» o «Cableada del instituto», con su contraseña y su configuración. Se guardan en `/etc/NetworkManager/system-connections/`. Cuando NetworkManager detecta una red que ya conoce, activa su conexión solo. Si enchufas un cable y no tiene ninguna conexión guardada, crea una que pide la configuración por DHCP.

NetworkManager no tiene ventana propia. Es un servicio, y los programas le hablan a través de **[D-Bus](https://es.wikipedia.org/wiki/D-Bus)**, el sistema que usan los programas de Linux para enviarse mensajes entre sí. Gracias a eso puede haber varios «mandos» para el mismo servicio: `nmcli` para la terminal, `nmtui` con menús de texto, el icono de red de Plasma (`plasma-nm`) o el de GNOME. Todos hacen lo mismo de distinta forma.

Comparado con `systemd-networkd`, gana en comodidad y pierde en sencillez:

| | systemd-networkd | NetworkManager |
| --- | --- | --- |
| Cómo se configura | Archivos `.network` | Conexiones, desde `nmcli`, `nmtui` o el escritorio |
| Dónde encaja | Servidores, máquinas virtuales, equipos que no cambian de red | Escritorios y portátiles |
| Icono en el escritorio | No tiene | Sí, en Plasma y GNOME |
| Wi-Fi y VPN | Necesita programas aparte | Lo gestiona todo él |
| Consumo | Muy bajo | Algo mayor |

Hay más opciones: **ConnMan**, pensado para aparatos pequeños como televisores o coches, o **`iwd`**, de Intel, que solo se ocupa de la Wi-Fi y se puede combinar con cualquiera de los anteriores.

## Cambio de gestor

Vas a pasar la red de `systemd-networkd` a NetworkManager. Abre Konsole e instálalo, si no está ya:

```bash
sudo pacman -S --needed networkmanager
```

`--needed` le dice a `pacman` que no lo reinstale si ya estaba, que es posible porque `plasma-meta` suele traerlo. Ahora viene el momento delicado. Escribe esta orden **en una sola línea**:

```bash
sudo systemctl disable --now systemd-networkd.service systemd-networkd.socket systemd-networkd-wait-online.service && sudo systemctl enable --now NetworkManager
```

La primera mitad detiene y deshabilita `systemd-networkd`. El `&&` significa «si lo anterior ha salido bien, sigue», y la segunda mitad arranca y habilita NetworkManager. ¿Por qué todo en una línea? Porque en cuanto se detiene el primer gestor te quedas sin red. Si escribieras las dos órdenes por separado y te equivocaras en la segunda, tendrías un equipo sin conexión y sin forma fácil de instalar nada para arreglarlo.

Quizá te preguntes por qué se desactivan tres cosas y no una. `systemd-networkd` tiene, además del servicio, un *socket* que lo despierta si alguien lo llama, y un servicio auxiliar que hace esperar al arranque hasta que haya red. Si solo desactivaras el servicio, el *socket* podría volver a arrancarlo y tendrías a los dos gestores peleando.

::: aviso
**No desactives `systemd-resolved`.** NetworkManager lo detecta y lo usa para el DNS. Solo cambia quién configura la tarjeta, no quién resuelve los nombres.
:::

## Comprobación

| Orden | Qué tienes que ver |
| --- | --- |
| `nmcli device` | Tu interfaz en estado `connected` con una conexión cableada |
| `networkctl` | Tu interfaz en SETUP `unmanaged`: `systemd-networkd` ya no se ocupa de ella |
| `systemctl is-active systemd-networkd NetworkManager` | `inactive` y `active`, en ese orden |
| Icono de red | La conexión cableada aparece como conectada |

**[Captura 4]** `nmcli device` y el icono de red mostrando la conexión.

**Pregunta 9.** ¿Qué dice ahora `networkctl` en la columna SETUP? ¿Por qué?

**Pregunta 10.** ¿Qué gestor de red elegirías para un servidor web y cuál para el portátil de un comercial que viaja? Justifica las dos respuestas.

Toma la instantánea `04-networkmanager`.

# 8. Estilo macOS

## Capas de la personalización

Antes de ponerte a cambiar cosas, conviene saber cómo está organizado el aspecto de Plasma. No es un único «tema»: son varias capas que se cambian por separado. Si sabes qué capa controla qué, sabrás dónde tocar para conseguir lo que quieres.

- El **tema global** es un paquete que cambia varias capas a la vez: colores, aspecto de los paneles, barras de título, cursores e, incluso, la colocación de los paneles. Es la forma rápida de cambiar de estilo.
- Los **colores** son la paleta que usan todas las aplicaciones: fondo de las ventanas, texto, selección…
- El **estilo de Plasma** es el aspecto de los paneles, el menú y los elementos gráficos del escritorio.
- La **decoración de ventanas** es la barra de título con sus botones. La dibuja KWin, no la aplicación.
- El **estilo de las aplicaciones** es el aspecto de los botones, casillas y pestañas dentro de cada programa. El de serie se llama Brisa.
- Los **iconos** siguen un estándar común a todos los escritorios de Linux, así que un tema de iconos sirve en Plasma, en GNOME o en Xfce.
- Las **tipografías** las gestiona [`fontconfig`](https://en.wikipedia.org/wiki/Fontconfig), que también es común a todo Linux.
- Los **paneles y elementos gráficos** son las barras, menús, relojes y docks, y los dibuja Plasma Shell.

Todo lo que descargas desde el botón **Obtener nuevos…** viene de la [tienda de KDE](https://store.kde.org) y se guarda en tu carpeta personal, dentro de `~/.local/share/`. Eso tiene una consecuencia importante: solo te afecta a ti. Si otra persona entra en el mismo equipo con su usuario, verá el escritorio original.

::: nota
Usaremos temas libres, con licencia GPL. Imitar un **estilo** está permitido, pero no usaremos el logotipo de Apple ni sus tipografías, que son propiedad de Apple.
:::

::: tip
Otros sistemas lo enfocan de forma muy distinta. En GNOME, casi todo lo que no está en los ajustes se consigue con **extensiones** y con la herramienta **Retoques** (*GNOME Tweaks*). En Windows puedes cambiar el fondo, los colores, el modo claro u oscuro y algunas opciones de la barra de tareas. En macOS, el fondo, el color de acento y poco más del Dock: la apariencia la decide Apple.
:::

## Tema global

1. **Colores y temas → Tema global → Obtener nuevos…**
2. Busca `WhiteSur` e instala **WhiteSur** (claro) o **WhiteSur-dark** (oscuro).
3. Selecciónalo y pulsa **Aplicar**.
4. Si aparece una ventana con casillas, **desmarca** la de la disposición del escritorio. Los paneles los vas a montar tú.

## Iconos y tipografía

1. **Colores y temas → Iconos → Obtener nuevos…**: instala y aplica **WhiteSur icon theme**.
2. Instala una tipografía libre parecida a la de macOS con `sudo pacman -S inter-font`.
3. **Texto y tipos de letra → Tipos de letra**: elige **Inter** como tipo de letra general.

::: nota
Fíjate en que has instalado dos cosas por caminos distintos. Los iconos vienen de la tienda de KDE y solo los tiene tu usuario. La tipografía la has instalado con `pacman`, para todo el sistema. Las dos formas son válidas, pero lo que instala `pacman` se actualiza junto con el resto del sistema, y lo de la tienda tienes que actualizarlo tú.
:::

## Barra superior

En macOS, los menús de la aplicación que estás usando no están dentro de su ventana, sino arriba del todo, en la barra de la pantalla. Plasma puede hacer lo mismo con el **menú global**: las aplicaciones envían su menú por D-Bus y un elemento de la barra lo muestra. Funciona con las aplicaciones de KDE y con muchas otras, aunque no con todas. Firefox, por ejemplo, seguirá teniendo sus menús dentro de la ventana.

1. Clic derecho en el escritorio → **Entrar en modo de edición**.
2. Abre la configuración del panel inferior. Cambia su **posición a Arriba** y la altura a unos 28 píxeles.
3. Elimina el **gestor de tareas** de ese panel.
4. Añade el elemento gráfico **Menú global** junto al lanzador de aplicaciones.
5. Añade un **Espaciador flexible** para que la bandeja del sistema y el reloj queden a la derecha.

Abre Dolphin o Kate: sus menús deben aparecer en la barra superior.

## Dock

En Plasma, el dock no es un programa especial: es un panel más, como la barra que acabas de mover, con un elemento que muestra los iconos de las aplicaciones. Existen docks independientes, como Plank o Latte Dock (este último ya no se mantiene), pero con los paneles de Plasma no hacen falta.

1. En modo de edición: **Añadir panel → Panel vacío**.
2. Configúralo **abajo**, **centrado**, con anchura **Ajustar al contenido** y la opción **Flotante** activada.
3. Añade el elemento **Gestor de tareas de solo iconos**.
4. En **Visibilidad**, elige **Esquivar ventanas** u **Ocultar automáticamente**.
5. Abre Dolphin, Konsole, Kate, Firefox y Preferencias del sistema. En el dock, clic derecho sobre cada icono → **Fijar al gestor de tareas**.

## Botones de las ventanas

Como la barra de título la dibuja KWin y no cada aplicación, basta con un cambio para que los botones se muevan de sitio en todas las ventanas a la vez.

**Colores y temas → Decoraciones de ventanas → Configurar los botones de la barra de título**. Arrastra cerrar, minimizar y maximizar al lado **izquierdo** y pulsa **Aplicar**.

## Animación al minimizar

En un Mac, cuando minimizas una ventana, no desaparece sin más: se estrecha y se escurre hacia el Dock como el genio que vuelve a su lámpara. Apple lo llama efecto **genio**, y Plasma tiene uno casi idéntico, la **Lámpara mágica**.

Estas animaciones las hace KWin. Como es el compositor, recibe la imagen de cada ventana y decide cómo pintarla en pantalla, así que puede deformarla, encogerla o moverla sin que la aplicación se entere. Plasma trae de serie otra animación para minimizar, **Encoger** (*Squash*), y solo puede haber una activa: al elegir una se desactiva la otra.

1. **Preferencias del sistema → Gestión de ventanas → Efectos del escritorio**.
2. Busca el apartado de animaciones al minimizar y marca **Lámpara mágica**. Si **Encoger** sigue marcada, desmárcala.
3. Pulsa **Aplicar**.
4. Minimiza una ventana: debe escurrirse hacia su icono en el dock.

::: tip
Junto a cada efecto hay un botón para configurarlo. En la Lámpara mágica puedes cambiar la duración de la animación: si te parece lenta, bájala un poco.
:::

## Terminal translúcida

Otro detalle muy de macOS es ver el fondo del escritorio a través de la terminal. Para conseguirlo, Konsole tiene que pintar su fondo con **transparencia**.

Cada píxel de una imagen tiene, además de su color, un valor de **opacidad** (el canal alfa): cuánto deja ver lo que hay detrás. Una aplicación puede pintar su ventana con un fondo al 80 % de opacidad, pero alguien tiene que mezclar después esa ventana con lo que hay debajo. Ese alguien es, otra vez, el compositor. Por eso, en los sistemas sin compositor, las ventanas transparentes se ven negras o con el fondo congelado. Si además activas el **desenfoque**, KWin difumina lo que hay detrás para que el texto se siga leyendo bien, igual que hace macOS.

1. Abre Konsole y ve a **Preferencias → Editar el perfil actual…** (o **Gestionar perfiles…** y edita el que uses).
2. En **Apariencia**, selecciona el esquema de colores que te guste y pulsa **Editar…**
3. Mueve el control de **Transparencia del fondo** a un valor entre el 15 % y el 25 %.
4. Marca **Desenfocar el fondo** y acepta.
5. Comprueba que el efecto **Desenfoque** (*Blur*) está activo en **Efectos del escritorio**.

Pon la terminal encima del fondo de pantalla: debes ver el fondo difuminado detrás del texto.

::: aviso
Con mucha transparencia el texto se vuelve difícil de leer, sobre todo con fondos claros. Más del 30 % suele ser demasiado. Si no ves el desenfoque, revisa que el efecto **Desenfoque** está activado en KWin.
:::

::: nota
Los nombres de los menús de Konsole pueden variar un poco según la versión. Si no encuentras la opción, busca «transparencia» en la ventana de edición del perfil.
:::

## Fuente y colores de la terminal

Ya tienes una terminal translúcida, pero el texto sigue con la letra y los colores de serie. Hay varias capas en las que se puede cambiar su aspecto, y conviene no mezclarlas:

- **Konsole**, el programa que dibuja la ventana de la terminal, decide la **fuente** y la **paleta de colores**.
- La **shell**, `bash`, es el programa que interpreta tus órdenes dentro de esa ventana. Ella decide cómo es el **prompt**, el texto que aparece antes de cada orden (`tunombre@archlinux:~$`).
- Cada **programa** decide qué partes de su salida pinta de color. `ls` pinta las carpetas de un color y los archivos de otro, por ejemplo.

### Cómo llegan los colores a la terminal

Una terminal solo recibe texto. Para pedirle colores, los programas mezclan con el texto unas secuencias especiales, los **[códigos de escape ANSI](https://es.wikipedia.org/wiki/Código_escape_ANSI)**, que la terminal no muestra sino que interpreta como órdenes: «a partir de aquí, rojo», «a partir de aquí, negrita», «vuelve a lo normal». Pruébalo:

```bash
printf '\e[31mrojo\e[0m normal \e[1;32mverde en negrita\e[0m\n'
```

`\e[31m` significa «texto rojo», `\e[1;32m` «negrita y verde» y `\e[0m` «vuelve al formato normal». Hay ocho colores básicos, del 30 al 37, y sus versiones brillantes, del 90 al 97.

Lo interesante es que el código no dice qué rojo exacto usar: solo dice «el color número 1». Qué tono de rojo se ve lo decide la **paleta** de la terminal. Por eso, si cambias el esquema de colores de Konsole, cambian a la vez los colores de todos los programas.

### Fuente

Las terminales usan fuentes **[monoespaciadas](https://es.wikipedia.org/wiki/Fuente_monoespaciada)**: todas las letras ocupan el mismo ancho, de forma que las columnas de texto quedan alineadas. Es imprescindible para leer tablas como la de `ip address` o código con sangrías.

Instala un par de fuentes pensadas para programar:

```bash
sudo pacman -S ttf-jetbrains-mono ttf-fira-code
```

1. En Konsole: **Preferencias → Editar el perfil actual… → Apariencia**.
2. Junto a **Tipo de letra**, pulsa **Elegir…**
3. Elige **JetBrains Mono** o **Fira Code** y un tamaño entre 11 y 13.
4. Acepta y comprueba el resultado.

::: tip
Fira Code y JetBrains Mono tienen **ligaduras**: algunas combinaciones como `->`, `!=` o `>=` se dibujan como un único símbolo. A mucha gente le gusta para programar y a otra le despista. Si no te convence, desactívalas en la misma pestaña de Apariencia.
:::

### Esquema de colores

1. En la misma pestaña **Apariencia**, verás la lista de esquemas de colores. Prueba varios: Konsole muestra una vista previa.
2. Para descargar más, pulsa **Obtener nuevos…** Hay esquemas muy populares, como Dracula, Nord o Solarized.
3. Para retocar uno, selecciónalo y pulsa **Editar…** Puedes cambiar el color del fondo, del texto y de cada uno de los colores numerados.

Konsole guarda los perfiles y los esquemas en tu carpeta personal: `~/.local/share/konsole/`. Cada perfil es un archivo `.profile` y cada esquema, un `.colorscheme`. Como son archivos de texto, puedes copiarlos a otro equipo para llevarte tu terminal.

### Prompt de colores

El prompt lo define la variable `PS1` de `bash`. Para cambiarlo de forma permanente se edita el archivo `~/.bashrc`, que `bash` lee cada vez que abres una terminal:

```bash
nano ~/.bashrc
```

Busca la línea que empieza por `PS1=` y sustitúyela por esta:

```bash
PS1='\[\e[1;32m\]\u@\h\[\e[0m\]:\[\e[1;34m\]\w\[\e[0m\]\$ '
```

Se lee así: en verde y negrita, tu usuario (`\u`), una arroba y el nombre del equipo (`\h`); vuelta a normal y dos puntos; en azul y negrita, la carpeta en la que estás (`\w`); y por último `$`, que se convierte en `#` si eres `root`. Los `\[` y `\]` rodean los códigos de color para que `bash` no los cuente como letras al calcular la longitud de la línea.

Guarda, cierra y abre una terminal nueva, o ejecuta `source ~/.bashrc`, para ver el cambio.

::: nota
En el `~/.bashrc` de Arch ya viene la línea `alias ls='ls --color=auto'`. Un **alias** es un atajo: cada vez que escribes `ls`, `bash` ejecuta en realidad `ls --color=auto`, y por eso ves las carpetas en azul. Puedes hacer lo mismo con `grep` añadiendo `alias grep='grep --color=auto'`, para que resalte en color lo que encuentra.
:::

::: aviso
Si te equivocas con las comillas al escribir `PS1`, el prompt puede salir roto o con códigos raros. No pasa nada: vuelve a editar `~/.bashrc`, corrige la línea y abre otra terminal.
:::

::: ejercicio
**Alternativas.** Konsole no es la única terminal: [Alacritty](https://github.com/alacritty/alacritty) y [Kitty](https://sw.kovidgoyal.net/kitty/) son muy rápidas y se configuran con un archivo de texto. Tampoco `bash` es la única shell: **zsh** y **fish** traen más colores y autocompletado de serie. Y existen generadores de prompt como [Starship](https://starship.rs/), que funcionan en cualquier shell. Instala uno de ellos con `pacman` y explica en la memoria qué cambia respecto a lo que tenías.
:::

## Detalles finales

- Pulsa `Alt+Espacio` para abrir **KRunner**, el buscador de Plasma. Es el equivalente a Spotlight en macOS: escribe el nombre de una aplicación y pulsa `Intro`. También hace cálculos y convierte unidades.
- Clic derecho en el escritorio → **Configurar el escritorio y el fondo de pantalla** para elegir un fondo.

**[Captura 5]** el escritorio terminado, con Konsole abierta y translúcida sobre el fondo, con tu fuente, tu esquema de colores y tu prompt, y la barra superior y el dock visibles.

Toma la instantánea `05-estilo-macos`.

::: tip
Si el escritorio se ve raro tras aplicar un tema, vuelve al tema **Brisa** en Tema global y sigue con los paneles. El aspecto lo puedes ajustar al final.
:::

::: ejercicio
**Kvantum.** Los botones, casillas y pestañas de las aplicaciones de KDE se dibujan con un «estilo», que por defecto es Brisa. Brisa está programado: para cambiarlo habría que tocar código. **[Kvantum](https://github.com/tsujan/Kvantum)** es un estilo distinto que se define con imágenes SVG, así que cualquiera puede diseñar un tema para él sin programar. Por eso hay temas de Kvantum que imitan casi cualquier cosa.

1. Instala `sudo pacman -S kvantum`.
2. En la tienda de KDE (store.kde.org), busca **WhiteSur Kvantum** y sigue sus instrucciones.
3. Abre el **Gestor de Kvantum** y selecciona el tema.
4. En **Colores y temas → Estilo de las aplicaciones**, elige **kvantum**.

Abre Dolphin antes y después del cambio y compara los botones.
:::

# 9. Comparativa

**Pregunta 11.** Completa la tabla con «Sí», «No» o «Limitado».

| ¿Se puede cambiar…? | KDE Plasma | Windows | macOS |
| --- | :---: | :---: | :---: |
| La posición de la barra de tareas o del dock | | | |
| El tema completo de ventanas y controles | | | |
| La posición de los botones de las ventanas | | | |
| El gestor de inicio de sesión | | | |
| Usar el sistema sin interfaz gráfica | | | |

**Pregunta 12.** Tu sistema se parece a macOS, pero ¿lo es? Haz una tabla con cinco componentes de tu sistema (núcleo, gestor de red, gestor de paquetes, protocolo gráfico, entorno de escritorio…) y, al lado, el que cumple esa función en macOS.

**Pregunta 13.** Eres el técnico de una empresa con 50 puestos. ¿Dejarías que cada empleado personalizase su escritorio como has hecho tú? Razona la respuesta. Piensa también en el efecto IKEA: ¿te influye haberlo montado tú?

**Pregunta 14.** Nombra un entorno de escritorio ligero y un gestor de ventanas en mosaico. ¿Para qué tipo de equipo o usuario recomendarías cada uno?

# 10. Problemas frecuentes

| Situación | Qué hacer |
| --- | --- |
| Has roto algo y no sabes qué | Apaga la máquina, restaura la última instantánea y repite desde ese punto |
| Una orden da `command not found` | Revisa cómo la has escrito. Si está bien, puede que falte el paquete: búscalo con `pacman -Ss` |
| `Permission denied` con tu usuario | Te falta `sudo` delante de la orden |
| `pacman` dice que la base de datos está bloqueada | Hay otro `pacman` en marcha. Espera a que termine y no borres archivos de bloqueo sin consultar al docente |
| Un servicio no arranca | `systemctl status servicio` te enseña sus últimos mensajes y `journalctl -u servicio`, todos |
| Algo falla dos veces seguidas | Avisa al docente antes de probar soluciones por tu cuenta |

# 11. Entrega

Entrega una memoria en PDF con el nombre `<MÓDULO>-Arch-KDE-Apellido-Nombre.pdf` (por ejemplo, `SOR-Arch-KDE-Apellido-Nombre.pdf`). Debe incluir las cinco capturas y las respuestas a las catorce preguntas.

Antes de entregar, comprueba que tienes:

- [ ] Red con `systemd-networkd` funcionando y persistente (capturas 1 y 2).
- [ ] Usuario propio con `sudo` funcionando.
- [ ] KDE Plasma instalado y sesión Wayland iniciada con tu usuario (captura 3).
- [ ] Red gestionada por NetworkManager, sin `systemd-networkd` activo (captura 4).
- [ ] Escritorio con barra superior, menú global, dock, botones a la izquierda, Lámpara mágica y Konsole translúcida con fuente, colores y prompt personalizados (captura 5).
- [ ] Respuestas a las preguntas 1 a 14.
