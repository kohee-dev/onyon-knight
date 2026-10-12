---
titulo: "Aventura de Código: Rescate"
tipo: "caso"
horas: 2
---

# Aventura de Código: nadie se queda atrás

Una evacuación de emergencia ha obligado a vuestra nave a abandonar un planeta. Horas después recibís una señal: **un miembro de la tripulación sigue vivo y se ha quedado allí**.

La nave cambia de rumbo. Tardaréis **90 días en llegar al planeta para rescatarlo**. Después os espera un viaje de **720 días**, esta vez con una persona más a bordo.

El rumbo está decidido, pero hay una pregunta pendiente: **¿hay comida suficiente para completar la misión?** Si las reservas de la nave no alcanzan, tendréis que comunicar al compañero cuánta comida falta para que pueda prepararla antes del rescate.

Crearás **`rescate.py`**, un programa que ayude a planificar las provisiones.

::: nota
Esta es una misión ficticia inspirada en la novela *The Martian* de Andy Weir, con tiempos y reglas propios. Simplificamos el consumo para centrarnos en la programación: **cada persona consume una ración completa al día** y todas las raciones son equivalentes. No calcularemos agua, combustible ni pérdidas de alimentos.
:::

## 1. Las reglas de la misión

| Dato fijo | Valor |
| --- | --- |
| Días de viaje después del rescate | 720 |
| Personas que se incorporan en el rescate | 1 |
| Raciones por persona y día | 1 |

Representa estos datos mediante **constantes**.

El programa preguntará:

- El nombre del tripulante que espera el rescate.
- Cuandos dias quedan hasta el rescate.
- Cuántas personas están **actualmente en la nave**, sin contar al compañero abandonado.
- Cuántas raciones quedan en la nave **en el momento de iniciar el regreso hacia el planeta**.

::: aviso
Los 90 días representan todo el tiempo que falta hasta recoger al compañero. **No hay que añadir otros 90 días por separado.** Tras el rescate comienza el viaje de 720 días.
:::

Introduce un número entero positivo de tripulantes y una cantidad entera de raciones suficiente para que quienes van en la nave puedan comer durante los primeros días. Trabajaremos con entradas que cumplen estas condiciones, sin programar todavía su validación.

## 2. Divide el viaje antes de calcular

### Primera etapa: llegar al planeta

Durante los primeros días, solo consumen las reservas de la nave las personas que ya están a bordo.

Calcula las raciones necesarias para esta etapa y las que quedarán en la nave al llegar al planeta.

### Segunda etapa: volver con toda la tripulación

Después del rescate habrá **una persona más**. Calcula el nuevo número de tripulantes y las raciones necesarias para alimentarlos durante **720 días** más.

### El balance de la misión

Calcula:

1. Las raciones que necesita la nave entre las dos etapas.
2. El saldo previsto de raciones al terminar todo el viaje.
3. Si las provisiones iniciales de la nave son suficientes.
4. Si el compañero tendrá que aportar comida al incorporarse.

Las dos últimas respuestas serán valores **`True` o `False`**. 

::: tip
Organiza el cálculo como en un problema de papel: **personas × días × raciones por persona y día**. El número de personas cambia después del rescate.
:::

## 3. Un mensaje para quien espera

El programa mostrará un informe con:

- El nombre del compañero.
- Los tripulantes antes y después del rescate.
- Las raciones consumidas hasta el rescate.
- Las raciones que quedarán a bordo en ese momento.
- Las raciones necesarias para los 720 días posteriores.
- Las raciones totales necesarias para ambas etapas.
- El saldo final previsto, sin añadir todavía comida del planeta.
- Si alcanza la comida de la nave.
- Si el compañero debe aportar comida.

**Un saldo negativo indica cuántas raciones faltan.** Por ejemplo, un saldo de `-270` significa que el compañero debe llevar al menos 270 raciones para completar el viaje. Un saldo de cero significa que la comida alcanza exactamente.

No necesitas mostrar un mensaje distinto según el resultado: utiliza etiquetas fijas, el saldo y los valores booleanos.

### La comida del compañero durante la espera

El tripulante abandonado también debe comer durante los **días anteriores al rescate**. Calcula y muestra las raciones que necesita para sobrevivir en el planeta durante ese tiempo.

::: aviso
**La comida para sobrevivir en el planeta no sale de las reservas de la nave.** Tampoco puede contarse como comida que llevará al embarcar: ya la habrá consumido. Si debe aportar provisiones al viaje, tendrá que disponer de esa cantidad adicional.
:::

## 4. Comprueba el plan de rescate

Supongamos que quedan **5 personas en la nave**, el compañero se llama **Alex**, tendrá que esperar **90 días** y hay **4500 raciones a bordo**.

| Resultado | Valor esperado |
| --- | --- |
| Tripulantes después del rescate | 6 |
| Consumo de la nave durante los primeros 90 días | 450 raciones |
| Reservas de la nave al llegar al planeta | 4050 raciones |
| Comida necesaria para los siguientes 720 días | 4320 raciones |
| Necesidad total de la nave para ambas etapas | 4770 raciones |
| Saldo previsto al terminar, sin aportación adicional | -270 raciones |
| ¿Alcanza la comida de la nave? | False |
| ¿Debe Alex aportar comida? | True |
| Comida que Alex necesita durante la espera en el planeta | 90 raciones |

Alex debe reservar **270 raciones para llevar a la nave**, además de las **90 que consumirá durante la espera**. Necesita disponer de un total de **360 raciones en el planeta**, entre su alimentación previa y su aportación al viaje.

Repite la prueba cambiando únicamente las reservas iniciales de la nave:

| Raciones iniciales | Saldo final previsto | ¿Alcanzan? | ¿Debe aportar comida? |
| --- | --- | --- | --- |
| 4770 | 0 | True | False |
| 5000 | 230 | True | False |

## 5. Entrega el informe de misión

Entrega **`rescate.py`**. Organiza el código en datos, procesamiento y salida, utiliza nombres descriptivos y añade comentarios que expliquen las etapas del cálculo.

Acompaña el archivo con respuestas breves:

1. ¿Por qué no podemos utilizar el mismo número de tripulantes para las dos etapas?
2. ¿Por qué debemos comparar la comida de los 720 días con las reservas que quedan tras el rescate, y no con las reservas iniciales?
3. Si el saldo es negativo, ¿qué representa? ¿Y si es cero?
4. ¿Por qué separamos la comida que el compañero consume durante la espera de la que puede llevar a la nave?

::: tip
Antes de ejecutar el programa, cambia el número de tripulantes y predice cómo variarán las necesidades. Después comprueba tu razonamiento con el código. Tu objetivo no es solo obtener cifras: debes poder explicar el plan de rescate.
:::
