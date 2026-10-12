---
titulo: "La tienda de nº 163: creación de vistas"
licencia: CC-BY-NC-SA-4.0
tipo: "caso"
horas: 3
---

*Warnings*
---

Para la realización de esta práctica voy a tener los siguientes supuestos:
+ Conocemos los comandos de git básicos.
+ Tenemos un conocimiento básico de Lenguajes de Marcas.
+ Sabemos leer, interpretar y comprender documentación.
+ Podemos leer oraciones **largas** y comprender aquello que se nos solicita.
+ Nos tomamos en serio lo que estamos haciendo, si no trabajáis, yo tampoco lo haré *(y tendréis un 0 en consecuencia)*.
+ Todos los apartados se evalúan de forma *aislada* en la medida de lo posible.
+ Soy consciente que propongo retos que no deberíais de saber *a priori*, por ello estoy disponible en clase para lo que necesitéis.
+ Estos documentos buscan ayudar a completar las distintas tareas, a estudiar, a comprender y profundizar en los contenidos vistos en clase, bajo ningún concepto están pensados para ser un copia y pega de las tareas propuestas o que puedan sustituir a la realización de las prácticas en clase.
+ Si alguien decide *copiar* o hacer *brujería* lo sabré. 

*Waymarks*
---

:::aviso[Imagen pendiente]
Falta la imagen «Green.png». Se añadirá con su licencia.
:::


Para la realización de la práctica es necesario realizar los siguientes puntos previos:
+ Completar la instalación de Git en el equipo. [Descarga de Git](https://git-scm.com/downloads/win)
+ Tener una versión de Python instalada. *(Recomendable la versión 3.13, aunque se va a realizar el ejercicio con la versión 3.11.9)* [Descarga de Python](https://www.python.org/downloads/)
+ Completar la instalación de PostgreSQL. *(Recomendable la version 17.1)* [Descarga de PostgreSQL](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)
+ Leer Style Guide for Python Code *(PEP 8)* pues haremos referencia a ello en la nomenclatura de variables. [Enlace a PEP 8](https://peps.python.org/pep-0008/)
+ Haber completado la Creación de un módulo con "Práctica 2: Creación de un módulo" de "La tienda de nº 163" y comprender la estructura básica de un módulo.

Como IDE es recomendable el uso de PyCharm, aunque personalmente prefiero usar VSCode por comodidad. Lo dejo a preferencia personal.

Se puede hacer la práctica en Docker exactamente igual, pero la vamos ha realizar de esta forma para comprender por qué se sigue esta estructura.

# Parte I: Diseño de vistas.

Ya con el modulo creado, nº 163 ya puede configurar las vistas para que se muestre toda la información necesaria.

Como hemos establecido previamente, el cliente iba a tener un listado de productos donde se mostrasen los campos de nombre, categoría, la descripción breve y el precio. Todo estos campos han sido previamente creados en la Práctica anterior.

Con el fin de configurar las vistas hay primero que fijarse en este campo dentro del xml:

```xml
<field name="view_mode">list,search,form</field>
```

El campo view_mode va a determinar de que formas posibles podemos visualizar los datos: como una lista, como un formulario o como una búsqueda. 

Independientemente del caso, todas las vistas comparten un esqueleto común.

```xml
    <record id="view_magic_shop_magic_item_TIPO" model="ir.ui.view">
        <field name="name">magicshop.magicitem.TIPO</field>
        <field name="model">magicshop.magicitem</field>
        <field name="arch" type="xml">
            <!--Elemento-->
        </field>
    </record>
```
Primero tendremos una etiqueta `record` donde definiremos el id de la estructura y el modelo al cual pertenece, aunque en este caso siempre sera `ir.ui.model`.

En el interior de `record` se definirán 2 campos, el nombre del `record` y el modelo al cual hace referencia, el cual siempre llamaremos su campo `_name`.

Adicionalmente estableceremos un campo `arch` que definirá la arquitectura *(**arch**, **arch**itecture)* que queremos utilizar en su interior.


## Listas

Una lista va a encargarse de estructurar todos los objetos creados uno encima de otro, mostrando los campos que se le indique. De esta forma el resultado seria algo similar a lo siguiente.

:::aviso[Imagen pendiente]
Falta la imagen «list.png». Se añadirá con su licencia.
:::

Para crear una lista deberemos de hacer lo siguiente: en el campo `arch` definiremos los campos del modelo que queremos que se muestren y en que orden. En nuestro caso primero `item_category`, `item_name`, `sell_value` y `shown_item_description`. Cada uno de estos campos se mostrará por el atributo `String` definido.

En el xml, deberemos definir una etiqueta `List` y en su interior varias etiquetas `field` con un parámetro `name` para indicar que queremos mostrar:

```xml
    <list string="Magic_Item">
        <field name="item_name"/>
    </list>
```
### Ejercicio 1

Completa la estructura para que quede igual que la imagen previa. 

## Formularios

Los formularios tienen una estructura un poco más compleja que las listas, pero también gracias a ello se pueden hacer estructuras más interesantes como esta:

:::aviso[Imagen pendiente]
Falta la imagen «form.png». Se añadirá con su licencia.
:::


Para comprender como se estructura hay que definir las siguientes etiquetas:

### `group`

Define una estructura en columna. Los elementos group se podrán anidar entre ellos para crear estructuras más complejas. Todos los elementos que estén dentro de un grupo de forma inmediata mostrarán un nombre que los defina.

Ejemplo:
```xml
<group>
    <group>
        <field1/>
    </group>
    <group>
        <field2/>
    </group>
</group>
```
Esta estructura nos permitirá crear una columna que en su interior tenga 2 columnas, una con field1 y otra con field2. De esta forma, ambos campos aparecerán en la misma linea.

### `sheet`

Nos permite que la interfaz sea **responsive** (centrada, con márgenes, etc.) En su interior colocaremos elementos `group`.

### `notebook` y `page`
 
Nos permite crear una sección con pestañas. Cada una de las pestañas se define por el elemento hijo `page` y se podrá definir un atributo `string` para definir el nombre de la misma.

**Importante:** El elemento `notebook` no debería ser incluido dentro de un elemento `group`.

Luego hay otros elementos estructurales, pero con estos se puede crear la mayor parte de estructuras. Para más información: [Formularios en Odoo](https://www.odoo.com/documentation/18.0/developer/reference/user_interface/view_architectures.html#form)

Nos quedaría de la siguiente forma:

```xml
<form string="Magic Items">
    <sheet>
        <group>
            <field name="item_name"/>
        </group>
        <notebook>
            <page string="Description">
                <field name="shown_item_description"/>
            </page>
        </notebook>
    </sheet>
</form>
```


### Ejercicio 2

Completa la estructura del código para que quede igual que en la imagen

## Búsqueda

Las búsquedas nos permiten modificar y añadir parámetros a la hora de realizar búsquedas entre los datos.

Funcionan de una forma muy parecida a las listas, tal que habría que añadir un campo `field` para que podamos buscar por el campo que definamos, de tal forma que si no añadimos nada unicamente podremos buscar por `id` pero si añadimos `item_name` también podremos realizar búsquedas por nombre y así.

Ademas nos permite añadir filtros y agrupaciones de elementos por medio de los atributos `domain` y `context`. 

### `domain`

El atributo `domain` nos permite definir una serie de criterios que se utiliza para seleccionar un subconjunto de elementos que los siguen. Por ejemplo un filtro para seleccionar los hombres mayores de edad que sean menores de 40 años:

```xml
<filter name="Hombres mayores de edad"
        domain="['&', ('gender', '=', 'male'), '&', ('age', '>=', 18), ('age', '<', 40)]"
/>
```

Como se puede apreciar los operadores lógicos se encuentran al comienzo de la expresión y la estructura sigue la sintaxis del ejemplo donde se establece campo, operador lógico, valor.

### `context`

El atributo `context` nos permite agrupar los resultados por un nombre concreto del campo. Por ejemplo, la siguiente expresión nos permitiría filtrar los campos por género

```xml
<group expand="1" string="Group By">
    <filter string="Gender" name="gender" context="{'group_by':'gender'}"/>
</group>
```


### Ejercicio 3

Define un filtro que permita seleccionar todos los atributos con categoría `Recovery` y otro que agrupe los objetos por categoría.
