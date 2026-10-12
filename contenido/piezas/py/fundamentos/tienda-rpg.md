---
titulo: "Tienda de RPG"
tipo: "caso"
horas: 2
---

# La tienda del aventurero

La noche cae sobre Dalaman. Antes de cruzar las puertas de la ciudad, tu personaje entra en una tienda para comprar provisiones. Las monedas son limitadas: conviene comprobar el coste del inventario antes de pagar.

Tu misión es crear un programa llamado **`tienda.py`** que calcule el precio de la compra y compruebe si puedes permitírtela.

## 1. El puesto del mercader

| Objeto | Precio por unidad |
| --- | --- |
| Poción de curación | 3 monedas |
| Éter | 12 monedas |
| Pluma de Fénix | 52 monedas |

Estos precios serán **constantes** del programa. Utiliza nombres descriptivos en mayúsculas para identificarlos.

El programa preguntará:

- El nombre del personaje.
- Cuántas monedas lleva.
- Cuántas pociones quiere comprar.
- Cuántos éter quiere comprar.
- Cuántas plumas quiere comprar.

::: nota
Introduce cantidades enteras no negativas. En esta práctica damos por válidas las respuestas: aprenderemos a comprobar las entradas más adelante.
:::

## 2. Las cuentas de la compra

A partir de los datos, calcula:

1. El coste de todas las pociones.
2. El coste de todas las flechas.
3. El coste total de la compra.
4. El saldo que quedaría al descontar el coste total de las monedas disponibles.
5. Si el personaje tiene suficientes monedas, mediante una comparación que produzca **`True` o `False`**.

Muestra un resumen con el nombre del personaje y todos los resultados. Cada cantidad debe ir acompañada de una etiqueta que permita entenderla.

::: aviso
**El saldo puede ser negativo.** Eso significa que faltan monedas para realizar la compra. El programa calcula una compra prevista; no necesita impedirla.
:::

## 3. Organiza tu programa

Separa el código en **datos, procesamiento y salida**. Utiliza:

- `input()` para solicitar los datos.
- `int()` para convertir las cantidades en enteros.
- Variables con nombres descriptivos en `snake_case`.
- Constantes para los precios.
- Operadores aritméticos y una comparación.
- `print()` para presentar los resultados.
- Al menos un comentario que explique una decisión o finalidad.

No necesitas condiciones, bucles ni funciones propias.

## 4. Pon a prueba la tienda

Con el personaje **Cecil**, 100 monedas, 4 pociones, 2 éter y 1 pluma, el resultado debería comunicar lo siguiente. No es necesario copiar exactamente la salida:

```text
Personaje: Cecil
Coste de las pociones: 12 monedas
Coste de los éter: 24 monedas
Coste de las plumas: 52 monedas
Coste total: 88 monedas
Saldo previsto: 12 monedas
¿Puedes pagar la compra?: True
```

Comprueba también estos casos manteniendo la misma compra:

| Monedas disponibles | Coste total | Saldo previsto | ¿Puede pagar? |
| --- | --- | --- | --- |
| 50 | 78 | -28 | False |
| 78 | 78 | 0 | True |

::: tip
Si tienes exactamente las monedas necesarias, también puedes pagar. Revisa qué operador de comparación representa correctamente esta situación.
:::

## 5. Entrega y explicación

Entrega **`tienda.py`** y responde brevemente:

1. ¿Por qué conviertes las cantidades que devuelve `input()`?
2. ¿Qué valores has tratado como constantes?
3. ¿Qué significa un saldo negativo?

::: tip
Cuando funcione, personaliza el nombre de la tienda y sus mensajes. Puedes cambiar los objetos y los precios, pero vuelve a calcular los resultados esperados para comprobar tu versión.
:::
