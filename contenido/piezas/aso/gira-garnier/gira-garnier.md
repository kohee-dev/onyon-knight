---
titulo: "La gira de la Garnier"
licencia: CC-BY-NC-SA-4.0
tipo: caso
horas: 40
resumen: Encargo en grupo de cuatro fases. Terraform levanta los servidores de la orquesta, Ansible los configura, se opera como un equipo de sistemas real y se termina gestionando Windows y una consola gráfica.
fuentes:
  - "HashiCorp. Terraform Documentation. https://developer.hashicorp.com/terraform/docs"
  - "kreuzwerker. Docker provider for Terraform. https://registry.terraform.io/providers/kreuzwerker/docker/latest/docs"
  - "Red Hat. Ansible Community Documentation. https://docs.ansible.com/"
  - "Semaphore UI. Documentation. https://docs.semaphoreui.com/"
---

::: aviso
Para la realización de este encargo voy a tener los siguientes supuestos:

+ Habéis hecho los cinco talleres de la unidad: [[taller-git|Git]], [[taller-docker|Docker]], [[taller-ssh|SSH]], [[taller-terraform|Terraform]] y [[taller-ansible|Ansible]].
+ Trabajáis en **grupos de 4**, y cada fase tiene una persona que la **lidera**.
+ Cada fase se apoya en las anteriores: **no os saltéis ninguna**.
+ Las tareas van de menos a más dificultad. Al principio se os dice qué herramienta usar; al final, solo qué hay que conseguir. Si os atascáis, **preguntad**.
+ Las explicaciones se redactan con vuestras propias palabras.
+ Si alguien hace *trampa* o *plagio*, lo sabré.
:::

# Planteamiento

¿Os acordáis de la **Orquesta de la Ópera Garnier**? El **Impresario** ha conseguido lo que parecía imposible: una **gira** por los grandes teatros de Europa. Pero una orquesta de gira no puede depender de que cada noche alguien monte el escenario a mano, atril por atril, y rece para que todo suene igual que la noche anterior.

El Impresario os contrata a vosotros. Necesita que la orquesta pueda **levantarse entera en cualquier teatro con una sola orden**, que suene **idéntica** cada noche y que, si algo se rompe una hora antes del estreno, se pueda **reconstruir** sin pánico. Y no se ha olvidado de **Herme**, el músico que saboteó la primera producción: quiere a alguien vigilando que no vuelva a pasar.

Así se monta la orquesta:

| En la orquesta | Qué es en vuestra infraestructura |
|---|---|
| El **podio del director**, desde donde se dirige todo | La **estación de control**: un contenedor con Terraform y Ansible |
| Las **cuatro secciones**: cuerdas, viento madera, viento metal y percusión | Cuatro **servidores** Debian: `garnier-cuerdas`, `garnier-madera`, `garnier-metales`, `garnier-percusion` |
| Los **músicos** y la sección a la que pertenecen | **Cuentas** de usuario y sus **grupos** |
| La **directora**, la única que puede dar órdenes a toda la orquesta | La cuenta con **`sudo`** |
| Las **partituras**: la misma obra, cada sección con la suya | **Plantillas** que generan la configuración de cada servidor |
| El **afinado**: solo se reafina si cambia la partitura | ***Handlers***: un servicio solo se recarga si cambia su configuración |
| El **ensayo diario** y su libro de ensayos | Una **tarea programada** que deja registro |
| La **caja fuerte** de los contratos | **Ansible Vault** |
| Un **arreglo de otro compositor** que la orquesta toca tal cual | Un **rol de Ansible Galaxy** |
| La **taquilla** del teatro, que funciona con otro sistema | Un **Windows** gestionado por WinRM |
| La **consola de regiduría**, desde donde se lanzan las entradas sin subir al escenario | **Semaphore**, un panel web para Ansible, con su base de datos |

El estreno de la gira es el **lunes 18 de enero de 2027**. Esa noche, la orquesta tiene que sonar.

# El encargo

Sois el **equipo de sistemas** de la gira. Todo vuestro trabajo vive en un **repositorio privado de GitHub** del grupo, con el profesor invitado. Lo que no está en el repositorio, no existe.

El encargo tiene **cuatro fases**. Cada una empieza con unas **preguntas de conceptos**, que se responden razonando, y sigue con las **tareas prácticas**. Las tareas marcadas como **imprescindibles** son el núcleo del encargo.

1. [[gira-garnier-fase1|Fase 1 · Infraestructura]]: Terraform levanta los cuatro servidores, su clave de acceso y el inventario.
2. [[gira-garnier-fase2|Fase 2 · Configuración]]: Ansible crea las cuentas, publica las partituras, programa el ensayo y guarda los secretos.
3. [[gira-garnier-fase3|Fase 3 · Operación]]: se resuelve un incidente, se revisa la calidad, se reconstruye todo con una orden y se documenta.
4. [[gira-garnier-fase4|Fase 4 · Ampliación]]: se gestiona un Windows desde Linux y se despliega una consola gráfica para lanzar y programar las tareas.

La **fase 4 es obligatoria**, pero no impide aprobar: un grupo que no la termine puede aprobar con las fases 1 a 3.

**Material que necesitáis:** la teoría de [[acceso-remoto|acceso y administración remota]], [[terraform-teoria|Terraform]] y [[ansible-teoria|Ansible]], y los cinco talleres.

# Organización del grupo

- **Un líder por fase.** Cada miembro lidera una fase: la reparte, hace la mayor parte, la explica en el vídeo y responde de ella. Decidid el reparto el primer día y escribidlo en el `README.md`.
- **Nada entra en `main` sin revisión.** Cada tarea se hace en una rama y se fusiona con una *pull request* que **revisa otro miembro** del grupo. Cada miembro revisa, al menos, la PR de otra fase.
- **Cada uno con su cuenta.** Los commits y las PR se hacen desde la cuenta de GitHub de quien hace el trabajo. Es una de las evidencias de vuestro trabajo individual.
- **Cada uno lo levanta en su equipo.** Durante las vacaciones, cada miembro debe poder clonar el repositorio y levantar la infraestructura en su propio equipo. Es la mejor prueba de que está bien hecho. Quien no tenga un Windows para la fase 4 la hace con el de otro miembro.

# Calendario

| Cuándo | Qué |
|---|---|
| Del 30 de noviembre al 18 de diciembre | Talleres en clase |
| **Viernes 18 de diciembre** | **Punto de control** en clase: el repositorio tiene commits de los cuatro miembros, la estación de control está construida y Terraform levanta los servidores. Es apto o no apto, sin nota, y sirve para que nadie se vaya de vacaciones sin arrancar |
| Vacaciones | Fases 1 a 4. Calculad unas **10 horas por persona** |
| **Lunes 18 de enero de 2027** | **Entrega final** |
| Del 19 al domingo 24 de enero | Se admite la entrega, con una **nota máxima de 8** |

# Cómo entregar el trabajo

Se entrega **el repositorio**. El último *commit* en `main` antes de la fecha es la entrega. Marcadlo con la etiqueta `entrega` y subidla:

```bash
git tag entrega
git push origin entrega
```

**Qué tiene que haber en el repositorio:**

| Fichero o carpeta | Contenido |
|---|---|
| `estacion/`, `terraform/`, `ansible/` y los scripts | Todo el código de la infraestructura |
| `README.md` | La documentación del proyecto (se pide en la fase 3), el reparto de fases y el **enlace al vídeo** |
| `docs/fase1.md` … `docs/fase4.md` | Las respuestas a las preguntas de conceptos y las **evidencias** que pide cada fase |
| `docs/incidente.md` | El informe del incidente de la fase 3 |
| `docs/hoja-control.docx` | La **hoja de control del trabajo en grupo** |

**Reglas de la entrega:**

- En cada `docs/faseN.md`, una sección por pregunta o tarea, con el mismo número que en el enunciado. Si algo no lo habéis hecho, escribidlo: `Sin hacer`.
- Las salidas de las órdenes se pegan como **texto**, en bloques de código, no como capturas. Si una salida es muy larga, pegad solo las líneas que pide el enunciado.
- Las explicaciones se redactan con vuestras propias palabras.
- **Nunca** subáis la clave privada, el estado de Terraform, la contraseña de Vault ni la carpeta `.terraform/`. Un secreto en el historial de Git está filtrado aunque se borre después.

**La hoja de control.** Descargad la [plantilla de la hoja de control](descarga:gira-garnier-hoja-control.docx) y guardadla en `docs/`. Cada vez que alguien trabaja, apunta una fila: fecha, miembro, fase, tarea, horas y el *commit* o la PR donde está ese trabajo. Se rellena **a lo largo** del encargo, no la última noche.

**El vídeo.** Un vídeo por grupo, de unos **15 minutos**. Cada miembro explica **con su voz** la fase que ha liderado: qué hace, cómo lo habéis resuelto y una demostración de que funciona. Subidlo como vídeo no listado (o donde indique el profesorado) y poned el enlace en el `README.md`.

**Nota individual.** La nota del trabajo es la del grupo, pero se ajusta a cada miembro según tres evidencias: tener *commits* y *pull requests* propios, aparecer explicando en el vídeo y figurar en la hoja de control.

| Evidencias de un miembro que faltan | Su nota |
|---|---|
| Ninguna | La del grupo |
| Una | El 80 % de la del grupo |
| Dos | El 50 % de la del grupo |
| Las tres | 0 |

# El estreno

Cuando las cuatro fases estén terminadas, haced la prueba que haría el Impresario la tarde del estreno: un miembro que **no** haya tocado la fase 1 clona el repositorio en un equipo limpio, sigue el `README.md` y levanta la orquesta entera. Si suena sin que nadie le ayude, la gira está lista.

Y Herme… Herme seguirá intentándolo. Pero esta vez cada cambio pasa por una revisión, cada servidor se puede reconstruir en minutos y cada ensayo queda registrado. **Esta vez, la orquesta suena.**
