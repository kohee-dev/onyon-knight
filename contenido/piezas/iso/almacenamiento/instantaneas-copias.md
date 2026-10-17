---
titulo: "Instantáneas y copias de seguridad"
licencia: CC-BY-NC-SA-4.0
---

Tarde o temprano alguien borrará el archivo equivocado, un disco se estropeará o un virus cifrará todo lo que encuentre. Lo que hará que ese día sea un contratiempo o un desastre no es lo que sepas de servidores, sino si tenías copias y si has probado alguna vez a restaurarlas.

## Qué vas a aprender

Al terminar este tema deberías ser capaz de:

- Explicar por qué RAID no es una copia de seguridad y qué amenazas cubre cada protección.
- Distinguir una instantánea de una copia de seguridad.
- Crear, usar y borrar instantáneas en ZFS, y recuperar un fichero o un dataset entero.
- Explicar la diferencia entre copia completa, incremental y diferencial.
- Hacer una copia con `zfs send` y `zfs receive`, y compararla con `rsync` y `tar`.
- Aplicar la regla 3-2-1 y comprobar una copia mediante una restauración.

---

## 1. Amenazas y protecciones

| Amenaza | RAID | Instantáneas | Copia en otro disco del servidor | Copia fuera del servidor |
| --- | :-: | :-: | :-: | :-: |
| Un disco se estropea | Sí | No | Sí | Sí |
| Borras un archivo por error | No | Sí | Sí | Sí |
| Un programa o un virus cifra tus archivos | No | Sí, si el virus no puede borrarlas | A veces | Sí |
| Se rompe el servidor entero (fuente, placa) | No | No | No | Sí |
| Incendio, robo o inundación | No | No | No | Sí, si está en otro lugar |

Ninguna herramienta lo cubre todo, y por eso se combinan. El RAID te da **disponibilidad**, es decir, seguir funcionando cuando falla un disco. Las instantáneas te permiten **deshacer errores** en segundos. Y las copias de seguridad te ayudan a **sobrevivir a los desastres**.

## 2. Instantáneas

Una **instantánea** (*snapshot*) es una foto de un dataset en un momento dado. Se crea en un instante y al principio casi no ocupa espacio. La razón está en el *copy-on-write* de ZFS ([[zfs-pools-datasets]]): como ZFS nunca sobrescribe, la foto solo tiene que "no soltar" los bloques que hay en ese momento. A medida que el dataset cambia, los bloques viejos se quedan retenidos y la instantánea va ocupando espacio.

```bash
sudo zfs snapshot saber/archivo@inicial
```

El nombre tiene dos partes: el dataset y, detrás de la `@`, el nombre de la instantánea. Para verlas:

```bash
zfs list -t snapshot
```

### Recuperar datos

Hay tres formas, de la más suave a la más drástica:

1. **Copiar un fichero.** Cada dataset tiene un directorio oculto, `.zfs/snapshot/`, con una carpeta por instantánea y su contenido tal como estaba. Con `cp` recuperas lo que haga falta:

   ```bash
   cp /saber/archivo/.zfs/snapshot/inicial/manuscritos/carta1.txt /saber/archivo/manuscritos/
   ```

2. **Clonar** la instantánea. `zfs clone` crea un dataset nuevo, que se puede leer y escribir, a partir de la foto. Sirve para probar algo sin tocar el original o para mirar con calma qué había.

3. **Volver atrás** con `zfs rollback`. Devuelve todo el dataset al estado de la instantánea.

   ```bash
   sudo zfs rollback saber/archivo@inicial
   ```

:::aviso[`rollback` es destructivo]
Deshace todos los cambios posteriores a la instantánea y, si hay instantáneas más recientes, obliga a borrarlas (con `-r`). Si solo quieres recuperar un archivo, copia desde `.zfs/snapshot/` y deja el resto como está.
:::

Las instantáneas se borran con `zfs destroy saber/archivo@inicial`. Mientras exista un clon, no podrás borrar la instantánea de la que sale.

### Instantáneas automáticas

Una instantánea hecha a mano no te protege el día que te olvidas de hacerla. Lo habitual es programarlas con `cron` (por ejemplo, cada hora) y **rotarlas**, es decir, borrar las más antiguas para quedarte solo con las últimas. Hay herramientas ya hechas (*sanoid*, *zfs-auto-snapshot*), pero escribir un script sencillo te ayuda a entender cómo funcionan.

:::aviso[Una instantánea no es una copia de seguridad]
Vive en el mismo pool que los datos. Si el pool se pierde, se pierden las dos cosas. Es un complemento excelente de las copias, pero no las sustituye.
:::

## 3. Tipos de copia de seguridad

Una **copia de seguridad** es un duplicado de los datos guardado en otro sitio, para poder recuperarlos si los originales se pierden. Según lo que se copie cada vez, hay tres tipos:

| Tipo | Qué copia | Ventaja | Inconveniente |
| --- | --- | --- | --- |
| Completa | Todo | Restaurar es simple: una sola copia | Tarda y ocupa mucho |
| Incremental | Lo que ha cambiado desde la última copia, sea del tipo que sea | Es rápida y pequeña | Para restaurar necesitas la completa y todas las incrementales, en orden |
| Diferencial | Lo que ha cambiado desde la última completa | Restaurar solo necesita dos piezas | Crece cada día hasta la siguiente completa |

Un esquema típico es hacer una completa cada domingo y una incremental cada noche.

Hay dos conceptos que se usan para decidir cuánto invertir en copias:

- **RPO** (*Recovery Point Objective*): cuántos datos puedes permitirte perder, medido en tiempo. Si haces copia cada noche, tu RPO es de 24 horas.
- **RTO** (*Recovery Time Objective*): cuánto puedes tardar en volver a funcionar después de un desastre.

## 4. La regla 3-2-1

Es la receta clásica, y funciona porque cada número cubre un riesgo distinto:

- **3** copias de los datos: el original y dos más. Cubre que una copia falle justo cuando la necesitas.
- **2** soportes distintos, por ejemplo el disco del servidor y una unidad externa o la nube. Cubre el fallo de un tipo concreto de soporte.
- **1** copia fuera de las instalaciones. Cubre el incendio, el robo o la inundación.

Existe una variante más moderna, la **3-2-1-1-0**. Una de las copias es *inmutable* o está desconectada, de forma que no se puede borrar ni cifrar ni siquiera con una cuenta de administrador, para sobrevivir a un ransomware. Y se verifica que al restaurar hay **0** errores.

:::tip[Una copia que no has restaurado nunca es una esperanza]
Muchas copias fallan justo cuando se necesitan: programadas mal, incompletas, cifradas con una clave perdida. Restaura de forma periódica en una máquina de pruebas.
:::

## 5. Herramientas

### `zfs send` y `zfs receive`

ZFS copia datasets enteros, incluso de un servidor a otro, con dos órdenes encadenadas por una tubería:

```bash
sudo zfs send saber/archivo@copia1 | sudo zfs receive copia/archivo
```

La primera copia es completa. Las siguientes pueden ser **incrementales**: se manda solo lo que cambió entre dos instantáneas.

```bash
sudo zfs send -i @copia1 saber/archivo@copia2 | sudo zfs receive copia/archivo
```

Como ZFS sabe qué bloques han cambiado sin tener que compararlos, es muchísimo más rápido que recorrer los ficheros. Para enviar a otra máquina se pasa por SSH: `zfs send ... | ssh servidor zfs receive ...`.

Tiene algunas particularidades:

- Para una copia incremental, el destino debe tener la instantánea anterior y no haber cambiado desde entonces. Por eso se suele poner el dataset de copia en solo lectura (`readonly=on`).
- Sin la opción `-p`, `zfs send` no manda las propiedades del dataset (cuotas, compresión).
- Un dataset cifrado se puede mandar tal cual, sin descifrarlo, con `zfs send --raw`.

### `rsync`

`rsync` copia fichero a fichero y manda solo la parte que ha cambiado. Funciona con cualquier sistema de ficheros y por SSH, y es muy fácil de entender:

```bash
rsync -a --delete /datos/ /copia/datos/
```

`-a` conserva permisos, fechas y dueños. `--delete` borra en la copia lo que ya no existe en el origen, y cuidado con eso: un borrado accidental se propaga. Con conjuntos grandes es más lento que `zfs send`, porque tiene que recorrerlo todo.

### `tar`

`tar` empaqueta ficheros en un único archivo y, con `-z`, lo comprime. Va bien para copias completas puntuales (`tar -czf copia.tar.gz /datos`), pero por sí solo no hace incrementales de forma cómoda.

### Programas especializados

`restic` y `borg` hacen copias cifradas, comprimidas y deduplicadas (no guardan dos veces lo mismo) y conservan un historial. En Windows Server, el equivalente de serie es **Windows Server Backup**, y para recuperar versiones anteriores de un fichero desde el Explorador se usan las instantáneas de volumen (VSS), que vemos en [[compartir-windows]].

---

## Glosario

| Término | Significado |
| --- | --- |
| Instantánea | Foto de un dataset en un momento, que casi no ocupa espacio al principio |
| Clon | Dataset editable creado a partir de una instantánea |
| Rollback | Volver el dataset al estado de una instantánea |
| Copia completa / incremental / diferencial | Todo / lo cambiado desde la última copia / lo cambiado desde la última completa |
| RPO | Cantidad máxima de datos que se admite perder, medida en tiempo |
| RTO | Tiempo máximo admitido para recuperarse |
| Regla 3-2-1 | Tres copias, en dos soportes, una fuera del sitio |
| Inmutable | Copia que nadie puede modificar ni borrar durante un tiempo |

## Comprueba lo que sabes

:::ejercicio[Repaso]
1. ¿Por qué una instantánea de ZFS casi no ocupa espacio al crearla?
2. Has borrado un archivo por error y tienes una instantánea de ayer. ¿Cuál es la forma menos arriesgada de recuperarlo?
3. ¿Qué hace `zfs rollback` con las instantáneas posteriores?
4. ¿Por qué una instantánea no sustituye a una copia de seguridad?
5. Haces una copia completa el domingo y una incremental cada noche. El jueves se pierde todo. ¿Qué necesitas para restaurar?
6. Haces copia cada noche a las 2:00. ¿Cuál es tu RPO?
7. Explica la regla 3-2-1.
8. ¿Para qué sirve el 0 de la regla 3-2-1-1-0?
9. ¿Qué ventaja tiene `zfs send` frente a `rsync` en un conjunto grande?
10. ¿Por qué `rsync --delete` hay que usarlo con cuidado?
:::

## Fuentes y para saber más

| Apartado | Enlace |
| --- | --- |
| 2. Instantáneas y clones | [Manual de zfs-snapshot](https://openzfs.github.io/openzfs-docs/man/master/8/zfs-snapshot.8.html) |
| 2. Volver atrás | [Manual de zfs-rollback](https://openzfs.github.io/openzfs-docs/man/master/8/zfs-rollback.8.html) |
| 3. Copias de seguridad | [Copia de seguridad](https://es.wikipedia.org/wiki/Copia_de_seguridad) |
| 5. Enviar datasets | [Manual de zfs-send](https://openzfs.github.io/openzfs-docs/man/master/8/zfs-send.8.html) |
| 5. Recibir datasets | [Manual de zfs-receive](https://openzfs.github.io/openzfs-docs/man/master/8/zfs-receive.8.html) |
| 5. `rsync` | [Manual de rsync](https://manpages.debian.org/bookworm/rsync/rsync.1.en.html) |
