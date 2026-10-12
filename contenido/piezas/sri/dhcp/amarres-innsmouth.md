---
titulo: "Amarres: el puerto de Innsmouth"
licencia: CC-BY-NC-SA-4.0
tipo: "caso"
horas: 10
---

# Expediente 1: Amarres

El Puerto de Innsmouth reabre sus tres dársenas después de meses de obras. Hasta ahora los amarres se repartían en una pizarra que colgaba en la puerta de la capitanía: el patrón que llegaba buscaba un hueco libre y apuntaba el nombre de su barco. El sistema era sencillo, pero dependía de que todo el mundo apuntara bien, y raro era la semana en que dos barcos no acababan discutiendo por el mismo amarre.

Esdras Martin, que rige el puerto, no quiere volver a la pizarra. Ha llamado al detective Andrea Windrose para que el puerto reparta los amarres por sí solo y para que quede constancia de quién ha amarrado, dónde y cuánto tiempo.

Andrea ha aceptado el encargo, aunque no solo por hacerle un favor a Esdras. Hace unos días, el vigilante de noche vio entrar un barco sin bandera en la Dársena Este. Estuvo allí unos minutos y se fue. En la pizarra no apuntó nada, claro. Andrea quiere que la próxima vez quede escrito.

Tu trabajo será montar la red del puerto: un router que reparta la configuración a los barcos de las tres dársenas mediante DHCP y un par de scripts que ayuden a Andrea a leer lo que pasa en ella.

::: tip
Innsmouth es el escenario de los expedientes de SRI. Andrea Windrose es el detective que coordina los casos y tú, su ayudante, administras los servicios que necesita. Este es el primer expediente de la serie de SRI.
:::

::: nota
*La investigación, los oficios y los datos son ficticios. Las direcciones y nombres de red pertenecen a un laboratorio aislado.*
:::

# 1. Resultados de aprendizaje

Al terminar el expediente sabrás explicar qué es una concesión DHCP, cómo la consigue un equipo y en qué se diferencia una reserva de una dirección dinámica. Montarás un router Debian con **Kea DHCPv4** que da servicio a tres subredes, generarás sus reservas con un script y analizarás su registro de concesiones con otro.

# 2. Concesión DHCP

Cuando un barco llega al puerto, la capitanía no le regala un amarre: le da permiso para usarlo durante un tiempo. Si quiere quedarse más, tiene que pedir una prórroga antes de que el permiso termine. Si se marcha, el amarre queda libre para el siguiente.

Una dirección obtenida por DHCP funciona igual. El servidor no la entrega para siempre, la **presta** durante un tiempo: eso es una **concesión** (*lease*). El servidor apunta qué dirección ha prestado, a qué equipo, identificado por su MAC, y hasta cuándo.

A lo largo del expediente usaremos el puerto para hablar de DHCP. Esta es la equivalencia:

| En el puerto | En DHCP |
| --- | --- |
| La capitanía | El servidor DHCP (Kea) |
| Una dársena | Una subred |
| Los amarres libres | El rango de direcciones dinámicas (*pool*) |
| El permiso de amarre | La concesión |
| Un amarre fijo, con el nombre pintado | Una reserva |
| La matrícula del barco | La dirección MAC |
| El libro de amarres | El registro de concesiones de Kea |

::: nota
En una red real las concesiones duran horas o días. En el laboratorio las dejaremos en **10 minutos** (600 segundos) para poder ver en clase cómo se renuevan y cómo caducan.
:::

::: ejercicio
**E1.** Un compañero dice que DHCP «asigna una IP a cada ordenador». Explica qué le falta a esa frase usando la palabra *concesión*.
:::

# 3. Mensajes DORA

Un barco que entra por primera vez no sabe dónde está la capitanía ni qué amarre le toca. Lo único que puede hacer es preguntar en voz alta, para que le oiga quien sea. A partir de ahí la conversación tiene siempre cuatro pasos, y sus iniciales forman la palabra **DORA**:

| Mensaje | Lo envía | A quién | Qué dice |
| --- | --- | --- | --- |
| DHCPDISCOVER | El cliente | A todos (*broadcast*) | ¿Hay algún servidor? Necesito configuración. |
| DHCPOFFER | El servidor | Al cliente o a todos | Te ofrezco esta dirección, con estas opciones. |
| DHCPREQUEST | El cliente | A todos (*broadcast*) | Acepto la oferta de este servidor. |
| DHCPACK | El servidor | Al cliente o a todos | Confirmado. La concesión empieza ahora. |

Hasta que llega el ACK, el cliente no puede usar la dirección. Una oferta es solo una oferta.

::: nota
El cliente pregunta por *broadcast* porque todavía no tiene dirección y no sabe cuál es la del servidor. Ese mensaje llega a todos los equipos de su subred, pero **no atraviesa los routers**.

El REQUEST también va a todos por una razón: si dos servidores hubieran hecho una oferta, el que no ha sido elegido tiene que enterarse para guardar su dirección para otro cliente.
:::

::: ejercicio
**E2.** Ordena estos mensajes e indica quién envía cada uno: 
    
    + «Acepto el 104»
    + «Confirmado hasta las 10:40»
    + «¿Hay alguna capitanía?»
    + «Te ofrezco el 104»
:::

::: ejercicio
**E3.** Un cliente ha recibido un OFFER, pero el ACK no llega nunca. ¿Puede usar la dirección? ¿Qué crees que hará después?
:::

# 4. Renovación y caducidad

Un barco que ya tiene amarre no repite todo el proceso para quedarse. Le basta con pedir la prórroga a su capitanía. DHCP lo hace en dos momentos, que se calculan sobre la duración de la concesión:

| Momento | Con 600 segundos | Qué hace el cliente | Mensajes |
| --- | --- | --- | --- |
| T1 (50 %) | 300 s | Pide la renovación a su servidor | REQUEST y ACK, directos al servidor |
| T2 (87,5 %) | 525 s | Su servidor no contesta: pregunta a cualquiera | REQUEST y ACK por *broadcast* |
| Fin (100 %) | 600 s | Nadie ha contestado: deja la dirección | Vuelve a empezar con DISCOVER |

Renovar son dos mensajes, no cuatro. El cliente ya sabe qué dirección tiene y quién se la dio, así que no necesita preguntar a todos ni esperar ofertas.

Cuando un barco se va avisando, el amarre queda libre en ese momento. En DHCP ese aviso es el mensaje **DHCPRELEASE**. Si el cliente se va sin avisar, por ejemplo porque se apaga de golpe, la dirección sigue reservada a su nombre hasta que caduca la concesión.

::: ejercicio
**E4.** Calcula T1 y T2 para una concesión de una hora y para una de ocho horas. ¿Qué ganas y qué pierdes con concesiones cortas en una red con muchos equipos que entran y salen?
:::

# 5. Reservas

Hay barcos que necesitan amarrar siempre en el mismo sitio: la lancha de la capitanía, el barco de la lonja o la lancha de Andrea. Todo el puerto sabe dónde encontrarlos. En DHCP esto es una **reserva**: el servidor reconoce al equipo por su MAC y le entrega siempre la misma dirección.

| | Dirección dinámica | Reserva | Configuración manual |
| --- | --- | --- | --- |
| Quién elige la dirección | El servidor, del rango | El servidor, según la MAC | El propio equipo |
| Recibe puerta de enlace y DNS | Sí | Sí | No, hay que escribirlos |
| Queda en el registro del servidor | Sí | Sí | No |

::: aviso
Una reserva no debe estar dentro del rango dinámico. Si el `.105` forma parte del rango y además está reservado, el servidor puede habérselo dado ya a otro equipo cuando llegue el que lo tenía reservado. En este expediente las reservas van entre el `.2` y el `.99` de cada dársena, fuera del rango.
:::

::: ejercicio
**E5.** Un barco se amarra a mano en el `.105` de la Dársena Norte sin pasar por la capitanía. Más tarde llega otro y la capitanía le ofrece el `.105`. ¿Qué ocurre? ¿Por qué el libro de amarres no sirve para evitarlo?
:::

# 6. Esquema de red

El router, al que en el puerto llaman **la bocana**, es un Debian 13 con cuatro adaptadores de red en VirtualBox: uno hacia fuera, que en el puerto es el río, y uno para cada dársena. Las dársenas son redes internas de VirtualBox.

| Equipo | Adaptador | Red de VirtualBox | Dirección |
| --- | --- | --- | --- |
| R1 · salida | 1.º (`enp0s3`) | NAT | La que dé VirtualBox |
| R1 · Dársena Norte | 2.º (`enp0s8`) | `PUERTO-NORTE` | `192.168.10.1/24` |
| R1 · Dársena Sur | 3.º (`enp0s9`) | `PUERTO-SUR` | `192.168.20.1/24` |
| R1 · Dársena Este | 4.º (`enp0s10`) | `PUERTO-ESTE` | `192.168.30.1/24` |
| `n1` a `n4` | 1 adaptador | `PUERTO-NORTE` | Por DHCP |
| `s1` a `s4` | 1 adaptador | `PUERTO-SUR` | Por DHCP |
| `e1` a `e4` | 1 adaptador | `PUERTO-ESTE` | Por DHCP |

Lo que tiene que repartir la capitanía en cada dársena:

| | Norte | Sur | Este |
| --- | --- | --- | --- |
| Subred | `192.168.10.0/24` | `192.168.20.0/24` | `192.168.30.0/24` |
| Rango dinámico | `.100` a `.119` | `.100` a `.119` | `.100` a `.119` |
| Puerta de enlace | `.1` | `.1` | `.1` |
| Dominio | `norte.innsmouth.anhidro` | `sur.innsmouth.anhidro` | `este.innsmouth.anhidro` |
| Amarre fijo | `n1` (capitanía) en `.10` | `s1` (lonja) en `.10` | `e1` (Andrea) en `.10` |

En las tres dársenas los servidores DNS son `9.9.9.9` y `1.1.1.1`, y la concesión dura 600 segundos, con T1 a los 300 y T2 a los 525.

::: nota
VirtualBox permite configurar cuatro adaptadores desde la ventana de cada máquina, justo los que necesita R1. Los nombres de las interfaces pueden cambiar en tu equipo: compruébalos con `ip -br link` y usa los tuyos.
:::

::: ejercicio
**E6.** Kea va a atender tres subredes desde la misma máquina. Cuando llega un DISCOVER, el cliente todavía no tiene dirección. ¿Cómo sabe Kea de qué dársena viene? ¿Haría falta un agente de retransmisión (*relay*) en este puerto? ¿En qué caso haría falta?
:::

# 7. Caso I: router y NAT

Esdras le enseña a Andrea el edificio de la bocana. Por ahí tiene que pasar todo lo que entra y sale del puerto, así que ahí irá R1.

Prepara R1 para que cumpla estas condiciones:

1. Las tres interfaces de las dársenas tienen su dirección fija y se levantan al arrancar. La de salida sigue recibiendo su dirección de VirtualBox.
2. Un barco de una dársena puede comunicarse con uno de otra: R1 reenvía paquetes IPv4, y el cambio se mantiene después de reiniciar.
3. Los barcos de las tres dársenas salen a Internet por `enp0s3` mediante NAT con `nftables`, y la regla se carga al arrancar.

Para comprobarlo, `ip -br a` debe mostrar las cuatro interfaces con su dirección, `sysctl net.ipv4.ip_forward` debe devolver `1` y `sudo nft list ruleset` debe mostrar la regla de enmascaramiento. Reinicia R1 y repite las tres comprobaciones.

::: aviso
Debian 13 ya no lee `/etc/sysctl.conf`. El reenvío se activa con un archivo propio dentro de `/etc/sysctl.d/` y se aplica con `sudo sysctl --system`.
:::

::: tip
Para escribir en un archivo del sistema desde una tubería, usa `sudo tee`. Con `sudo echo ... > archivo` la redirección la hace tu usuario, no root, y obtendrás «Permiso denegado».
:::

::: nota
En `/etc/network/interfaces`, `auto` levanta la interfaz siempre durante el arranque y `allow-hotplug` la levanta cuando el sistema la detecta. Para las dársenas te interesa `auto`: Kea necesita que estén levantadas cuando arranque.
:::

**Entrega del caso:** `/etc/network/interfaces`, el archivo de `/etc/sysctl.d/`, `/etc/nftables.conf` y las tres comprobaciones después de reiniciar.

# 8. Caso II: servidor Kea

Con la bocana lista, falta la capitanía. Instala el paquete `kea-dhcp4-server`, guarda una copia del archivo de configuración original y escribe tu propio `/etc/kea/kea-dhcp4.conf` con las tres dársenas.

De momento no incluyas los amarres fijos: los generarás en el caso siguiente. Todo lo demás de la tabla del apartado 6 sí debe estar. El servidor solo puede escuchar en las interfaces de las dársenas, nunca en la de salida, y las concesiones se guardan en `/var/lib/kea/kea-leases4.csv`.

Antes de reiniciar el servicio comprueba siempre la configuración:

```bash
sudo kea-dhcp4 -t /etc/kea/kea-dhcp4.conf
```

Después reinicia `kea-dhcp4-server` y revisa su registro con `journalctl`. Debe indicar que escucha en `enp0s8`, `enp0s9` y `enp0s10`.

::: aviso
Los errores que más se repiten con Kea:

- Una coma de más al final de una lista o una coma que falta entre dos subredes.
- Indicar en una subred una interfaz que no existe. Kea no arranca.
- Guardar las concesiones fuera de `/var/lib/kea`. Desde la versión 2.6.3 Kea rechaza esa ruta.
- Poner `"*"` en `interfaces`: el servidor también respondería por la salida a Internet.
:::

::: tip
Kea admite comentarios con `//`. Comenta cada bloque diciendo a qué dársena corresponde: dentro de un mes lo agradecerás.
:::

::: ejercicio
**E7.** Los servidores DNS son los mismos en las tres dársenas, pero la puerta de enlace cambia. ¿Dónde has puesto cada opción en el archivo y por qué?
:::

**Entrega del caso:** `kea-dhcp4.conf` comentado, la salida de `kea-dhcp4 -t` y el fragmento del registro donde se ven las interfaces.

# 9. Caso III: clientes y reservas

## Los barcos

Doce barcos esperan para entrar. No hace falta instalar doce sistemas: instala un cliente Debian 13 mínimo, sin entorno gráfico y con 512 MB de RAM, y crea el resto como **clones enlazados**, generando direcciones MAC nuevas en cada uno. Cambia el nombre de cada clon con `hostnamectl` y conecta cada uno a la red interna de su dársena.

::: aviso
Al clonar, todos los barcos salen con la misma matrícula interna. Si dos clones envían a Kea el mismo identificador de cliente, el servidor cree que son el mismo equipo y les da la misma dirección. Regenera el identificador en cada clon:

```bash
sudo rm -f /etc/machine-id /var/lib/dbus/machine-id
sudo systemd-machine-id-setup
sudo reboot
```
:::

::: tip
No necesitas los doce encendidos a la vez. Arranca unos pocos, comprueba y apágalos: Kea guarda en su registro lo que ha pasado.
:::

## Los amarres fijos

Esdras te pasa la lista de barcos con amarre fijo en un CSV. Es corta, pero la lista crecerá y no quiere que nadie vuelva a copiar direcciones a mano. Guárdala como `amarres-fijos.csv`:

```csv
nombre;matricula;darsena;amarre
capitania;08:00:27:0A:00:01;norte;10
lonja;08-00-27-0b-00-01;sur;10
windrose;0800270c0001;este;10
```

Como ves, cada uno ha escrito la matrícula a su manera. Desarrolla `alta-reservas.py` para que:

1. Lea uno o varios CSV con esa cabecera.
2. Acepte la matrícula escrita con dos puntos, con guiones o sin separadores, y la escriba siempre como `08:00:27:0a:00:01`.
3. Rechace, explicando el motivo, las filas con un nombre que no sirva como nombre de equipo, una matrícula mal escrita, una dársena que no existe, un amarre fuera de `2-254` o **dentro del rango dinámico**.
4. Rechace también matrículas, nombres o amarres repetidos.
5. Genere un archivo de reservas por dársena (`reservas-norte.json`, `reservas-sur.json` y `reservas-este.json`) con el formato que espera Kea.
6. Termine con un resumen de reservas generadas y filas rechazadas.

Kea puede leer un trozo de su configuración desde otro archivo. Copia los tres JSON a `/etc/kea/` y, en cada subred, añade:

```json
"reservations": <?include "/etc/kea/reservas-norte.json"?>
```

cambiando el nombre de la dársena en cada una. Comprueba la configuración con `kea-dhcp4 -t` y reinicia el servicio.

Por último, pon a `n1`, `s1` y `e1` en VirtualBox la MAC de su reserva (`0800270A0001`, `0800270B0001` y `0800270C0001`).

::: nota
El script solo prepara los archivos. Revísalos antes de copiarlos a `/etc/kea/` y deja que `kea-dhcp4 -t` tenga la última palabra.
:::

**Entrega del caso:** `amarres-fijos.csv`, `alta-reservas.py`, los tres JSON generados y la salida del script.

# 10. Caso IV: registro de concesiones

Esdras quiere ver que funciona antes de descolgar la pizarra.

Desde un barco de cada dársena y desde los tres amarres fijos, comprueba la dirección, la puerta de enlace y los DNS recibidos (`ip -br a`, `ip route`, `cat /etc/resolv.conf`). Haz `ping` a la puerta de enlace, a un barco de **otra** dársena y a `9.9.9.9`, y resuelve un nombre con `getent hosts debian.org`.

En R1, abre el registro de concesiones:

```bash
sudo column -s, -t < /var/lib/kea/kea-leases4.csv | less -S
```

Después captura un intercambio DORA completo de un barco de la Dársena Sur. Para que el barco vuelva a pedir configuración, desactiva y activa su interfaz:

```bash
sudo tcpdump -ni enp0s9 -vv 'udp port 67 or udp port 68'   # en R1
sudo ifdown enp0s3 && sudo ifup enp0s3                    # en el barco
```

Deja ese barco encendido más de cinco minutos y captura también una renovación.

::: nota
Cada fila del registro es un apunte. Las columnas que más vas a usar son `address` (dirección), `hwaddr` (MAC), `valid_lifetime` (duración en segundos), `expire` (cuándo caduca, en segundos desde 1970), `subnet_id` (la dársena) y `hostname`. Kea **añade** una fila cada vez que concede o renueva, así que un mismo barco aparece varias veces. Para ver `expire` como fecha: `date -d @1790990530`.
:::

::: ejercicio
**E8.** En tu captura, señala los cuatro mensajes DORA y anota la dirección de origen y de destino de cada uno. ¿Cuáles van a `255.255.255.255`?
:::

::: ejercicio
**E9.** En la renovación, ¿cuántos mensajes hay y a qué dirección van? ¿Cuántas filas nuevas aparecen en el registro?
:::

::: ejercicio
**E10.** Apaga un barco con `sudo poweroff` y otro desconectando el cable en VirtualBox. ¿Qué diferencia ves en el registro?
:::

**Entrega del caso:** capturas de las comprobaciones (una por dársena y una por amarre fijo, con el nombre del barco visible) y de los dos intercambios.

# 11. Caso V: análisis de concesiones

Esa misma noche Esdras le da a Andrea una copia del registro de la madrugada del **3 de octubre**, cuando el vigilante vio el barco sin bandera. Guárdala como `amarres-2026-10-03.csv`:

```csv
address,hwaddr,client_id,valid_lifetime,expire,subnet_id,fqdn_fwd,fqdn_rev,hostname,state,user_context,pool_id
192.168.10.10,08:00:27:0a:00:01,01:08:00:27:0a:00:01,600,1790989800,10,0,0,capitania,0,,0
192.168.20.101,08:00:27:0b:00:02,01:08:00:27:0b:00:02,600,1790989860,20,0,0,s2,0,,0
192.168.30.102,08:00:27:0c:00:03,01:08:00:27:0c:00:03,600,1790989980,30,0,0,e3,0,,0
192.168.10.10,08:00:27:0a:00:01,01:08:00:27:0a:00:01,600,1790990100,10,0,0,capitania,0,,0
192.168.20.101,08:00:27:0b:00:02,01:08:00:27:0b:00:02,600,1790990160,20,0,0,s2,0,,0
192.168.30.102,08:00:27:0c:00:03,01:08:00:27:0c:00:03,0,1790989740,30,0,0,e3,0,,0
192.168.10.10,08:00:27:0a:00:01,01:08:00:27:0a:00:01,600,1790990400,10,0,0,capitania,0,,0
192.168.20.101,08:00:27:0b:00:02,01:08:00:27:0b:00:02,600,1790990460,20,0,0,s2,0,,0
192.168.30.104,02:7a:1c:44:9e:03,,600,1790990530,30,0,0,,0,,0
192.168.30.104,02:7a:1c:44:9e:03,,600,1790990530,30,0,0,,2,,0
192.168.30.101,08:00:27:0c:00:02,01:08:00:27:0c:00:02,600,1790991240,30,0,0,e2,0,,0
```

Andrea no quiere leerlo a ojo, ni este ni los que vendrán. Desarrolla `informe-concesiones.py`, que reciba un archivo de concesiones de Kea y, opcionalmente, una hora (`--hora "2026-10-03 03:15"`), y muestre:

1. Cuántos amarres del rango dinámico están ocupados en cada dársena a esa hora.
2. Una línea por barco: nombre, MAC, dársena, dirección, hora de llegada, número de renovaciones y cómo se fue (avisando, por caducidad o si sigue amarrado).
3. Una sección de alertas con los barcos sin nombre y los que tienen una MAC que no pertenece a la flota.

::: nota
Para interpretar el registro:

- La hora de llegada es `expire` menos `valid_lifetime`.
- Una fila con `valid_lifetime` a **0** significa que el cliente liberó la dirección (RELEASE).
- `state` **2** significa que la concesión caducó y Kea recuperó la dirección.
- Las horas son las de Innsmouth, zona `Europe/Madrid`.
:::

::: tip
Los barcos del puerto tienen matrículas que empiezan por `08:00:27`, el prefijo de VirtualBox. Fíjate también en el primer byte de la MAC: si su segundo bit menos significativo vale 1, la dirección es **administrada localmente**. No la ha asignado ningún fabricante.
:::

Pasa el script por el archivo del 3 de octubre y por el registro de tu propio puerto. Con lo que obtengas, escribe un informe breve para Andrea que responda: qué barco es el que vio el vigilante, en qué dársena y en qué amarre estuvo, a qué hora llegó, si llegó a renovar, si avisó al irse y qué tiene de raro su matrícula.

Para terminar, reprodúcelo. Crea un barco 13 en la Dársena Este con la MAC `027A1C449E03`, sin nombre de equipo. Conéctalo dos minutos y quítale el cable. Comprueba que tu script lo detecta.

::: ejercicio
**E11.** Propón dos medidas para que un barco desconocido no consiga amarre en la Dársena Este. ¿Qué problema tendría cada una para los barcos que sí son del puerto?
:::

**Entrega del caso:** `informe-concesiones.py`, su salida con los dos archivos y el informe para Andrea.

# 12. Rango agotado

Este apartado es opcional. Reduce el rango de la Dársena Este a dos direcciones (`.100` y `.101`) y conecta `e2`, `e3` y `e4`. ¿Qué le pasa al tercero? ¿Recibe una oferta? ¿Qué aparece en el registro de Kea y qué muestra tu informe? Explica cómo lo resolverías sin ampliar el rango.

::: aviso
Al terminar, deja el rango como estaba. Si quieres empezar con el registro limpio, para el servicio, vacía el archivo con `sudo truncate -s0 /var/lib/kea/kea-leases4.csv` y vuelve a arrancarlo. En un servidor de verdad, nunca.
:::

# 13. Caso final: nueva flota

Una semana después, Esdras manda la lista de barcos que van a tener amarre fijo en la Dársena Este a partir del lunes. La ha rellenado a mano alguien de la oficina:

```csv
nombre;matricula;darsena;amarre
aurora;08:00:27:0c:00:11;este;11
estrella;08:00:27:0c:00:12;este;12
gaviota;08:00:27:0c:00:13;este;105
tritón;08:00:27:0c:00:14;este;13
marea;08:00:27:0c:00:01;este;14
bruma;08:00:27:0c:00:15;oeste;15
```

Guárdala como `flota-este.csv` y da de alta los amarres con tu script, junto con `amarres-fijos.csv`. Solo deben entrar los que estén bien. Para cada fila rechazada, escribe a Esdras una línea explicando qué falla y qué tendría que corregir.

Aplica las nuevas reservas en Kea, comprueba la configuración y reinicia el servicio. Crea al menos uno de los barcos nuevos con su MAC, conéctalo y comprueba que recibe su amarre. Termina pasando tu informe por el registro para confirmar que el barco sin bandera no ha vuelto.

**Entrega del caso:** la salida del script, los mensajes para Esdras, el nuevo `reservas-este.json`, la comprobación del barco nuevo y el último informe.

## Cierre

Con el informe delante, la historia de esa noche se puede contar con bastante precisión. A las 03:12 un barco sin nombre entró en la Dársena Este y pidió amarre como cualquier otro. La capitanía le dio el 104. No llegó a pedir la prórroga de los cinco minutos y tampoco avisó al irse: su permiso caducó solo, diez minutos después. Su matrícula no es de ningún astillero.

Hay algo más que Andrea no apunta en el informe. A las 03:12 la marea estaba en su punto más bajo, y con tan poca agua en la Dársena Este no entra ni una barca de remos.

Andrea cierra el cuaderno y se queda un rato mirando por la ventana de la bocana.

—No vino a amarrar —dice al final—. Vino a ver qué le contestábamos.

Esdras pregunta qué puede querer saber alguien que ni siquiera da su nombre. Andrea no responde. Piensa en la columna `hostname`, vacía, y en que en Innsmouth todo el mundo tiene un nombre. Salvo quien no quiere que se lo pregunten.

**Expediente 01: puerto automatizado. El barco sin bandera sigue sin identificar.**

# 14. Entrega

Una memoria en PDF con las entregas de cada caso, las respuestas de los ejercicios E1 a E11 y, si lo haces, el apartado de rango agotado. Adjunta aparte los dos scripts y los CSV.

# 15. Criterios de revisión

| Aspecto | Qué se revisa |
| --- | --- |
| Conceptos | Explica con precisión concesión, DORA, renovación, caducidad, liberación y reserva. |
| Router | Direcciones, reenvío y NAT correctos y persistentes tras reiniciar. |
| Servidor | Tres subredes según los requisitos; solo atiende las dársenas. |
| Clientes | Los barcos reciben la configuración de su dársena y las reservas funcionan. |
| `alta-reservas.py` | Normaliza las MAC, rechaza cada error con su motivo y genera JSON que Kea acepta. |
| `informe-concesiones.py` | Interpreta bien el registro: llegadas, renovaciones, salidas y alertas. |
| Investigación | El informe para Andrea se apoya solo en los datos y justifica cada conclusión. |

# 16. Recursos

| Recurso | Para qué consultarlo |
| --- | --- |
| Teoría DHCP (UD 1) | DORA, concesiones, reservas y opciones. |
| Kea DHCP: introducción y preparación de la práctica (UD 1) | Estructura del archivo y comandos de Kea. |
| [Manual DHCPv4 de Kea 2.6.3](https://kea.readthedocs.io/en/kea-2.6.3/arm/dhcp4-srv.html) | Interfaces, subredes, opciones, reservas y registro de concesiones. |
| [Inclusión de archivos en la configuración](https://kea.readthedocs.io/en/kea-2.6.3/arm/config.html) | Cómo funciona `<?include ...?>`. |
| [RFC 2131](https://www.rfc-editor.org/rfc/rfc2131) | Especificación de DHCP. |
