---
titulo: "Procesos del sistema en Windows"
licencia: CC-BY-NC-SA-4.0
---

Este documento aterriza en **Windows** los conceptos generales del tema. Damos por
sabido qué es un proceso, un hilo, un estado o el planificador; aquí veremos los
**tipos, los estados, las clases de prioridad, la creación y terminación, las
herramientas, la secuencia de arranque y los servicios** tal y como funcionan en
Windows.

::: nota
Si aún no tienes claros los conceptos de fondo, repasa antes el documento
**Procesos del sistema** (general). Aquí nos centramos en lo específico de Windows.
:::



# 1. Tipos de procesos en Windows

El Administrador de tareas de Windows clasifica lo que está en marcha en tres
grupos, que conviene reconocer:

- **Aplicaciones**: procesos con ventana e interacción directa con el usuario (un
  navegador, Word…).
- **Procesos en segundo plano**: trabajan sin ventana visible (el agente de
  actualizaciones, utilidades del fabricante…).
- **Procesos de Windows**: los del propio sistema operativo.

Internamente, la estructura del núcleo que describe cada proceso se denomina
**EPROCESS** (es el equivalente al Bloque de Control de Proceso que vimos en la
parte general).



# 2. Estados de un proceso en Windows

Windows maneja los mismos conceptos que el modelo general, con otros nombres.
Internamente un hilo puede estar, por ejemplo, en *Ready* (listo), *Running*
(ejecución), *Waiting* (en espera) o *Terminated* (terminado).

En la interfaz, el Administrador de tareas lo muestra de forma más sencilla,
indicando si un proceso está **en ejecución**, **suspendido** (habitual en
aplicaciones de la Tienda que no tienen el foco, para ahorrar recursos) o **no
responde** (cuando deja de atender la interfaz).



# 3. Prioridades: clases de prioridad

Windows organiza la prioridad en **niveles**. Cada proceso recibe una **clase de
prioridad base** y, dentro de ella, el sistema ajusta dinámicamente la prioridad de
cada hilo según lo que esté haciendo. Las clases, de menor a mayor, son:

| Clase de prioridad | Uso típico |
|--------------------|------------|
| Baja (*Idle*) | Tareas que solo deben correr cuando el equipo está ocioso. |
| Por debajo de lo normal | Procesos poco urgentes. |
| Normal | El valor por defecto de la mayoría de aplicaciones. |
| Por encima de lo normal | Procesos algo más prioritarios. |
| Alta | Tareas que requieren respuesta rápida. |
| Tiempo real | Máxima prioridad; reservada y peligrosa (puede dejar al sistema sin CPU). |

El sistema, además, **sube temporalmente** la prioridad del proceso que tiene la
ventana en primer plano, para que la aplicación con la que trabajas responda mejor.

Puedes cambiar la clase de prioridad:

- Desde el **Administrador de tareas** → pestaña *Detalles* → clic derecho →
  *Establecer prioridad*.
- Con **PowerShell** al lanzar el proceso:

  ```powershell
  Start-Process bloc.exe -Priority Idle
  ```

::: aviso
La clase **Tiempo real** no es "ir más rápido": hace que el proceso se anteponga
incluso a tareas del sistema y puede volver el equipo inestable o irresponsivo.
Úsala solo con un motivo muy claro.
:::



# 4. Crear y terminar procesos

## 4.1 Crear procesos

En Windows la creación de un proceso se hace en **un solo paso** con la función
**`CreateProcess`**, que crea el proceso y carga el programa a la vez (a diferencia
del `fork`+`exec` de Linux). Desde la consola lo haces de forma habitual con:

```powershell
Start-Process notepad.exe          # PowerShell
```
```bat
start notepad.exe                  :: Símbolo del sistema (CMD)
```

El árbol de procesos arranca de los procesos del sistema (`System`, `smss.exe`…) y
desciende hasta los servicios y aplicaciones. El **Process Explorer** muestra ese
árbol con mucha claridad (sangrando cada hijo bajo su padre).

## 4.2 Terminar procesos

| Herramienta | Cómo |
|-------------|------|
| Administrador de tareas | Botón *Finalizar tarea*. |
| Símbolo del sistema | `taskkill /PID 1234` o `taskkill /IM programa.exe` |
| PowerShell | `Stop-Process -Id 1234` o `Stop-Process -Name programa` |

```bat
taskkill /PID 1234            :: por PID
taskkill /IM notepad.exe /F   :: por nombre, forzando (/F)
```

::: tip
Igual que en Linux conviene intentar primero un cierre ordenado, en Windows el
modificador `/F` de `taskkill` (forzar) es el equivalente al "a las malas": úsalo
solo si el proceso no se cierra de forma normal.
:::



# 5. Información de procesos: WMI y contadores

Windows no tiene un `/proc` como Linux, pero ofrece la misma información a través de
otras vías:

- **WMI** (*Windows Management Instrumentation*): una interfaz para consultar el
  estado del sistema. Por ejemplo, `Get-CimInstance Win32_Process` lista los
  procesos con todos sus campos.
- **Contadores de rendimiento**: métricas de CPU, memoria, disco y red por proceso,
  que consultan el Monitor de rendimiento y el de recursos.
- **APIs del sistema**: en las que se apoyan el Administrador de tareas, `tasklist`
  o `Get-Process`.



# 6. Herramientas de gestión y supervisión

## 6.1 Línea de comandos

- **`tasklist`** — lista los procesos (equivalente a `ps`).
- **`taskkill`** — termina procesos por PID o por nombre de imagen.
- **`Get-Process`** (PowerShell) — lista y filtra procesos como objetos.
- **`Stop-Process`** (PowerShell) — termina procesos.

```powershell
tasklist                         # listar procesos
tasklist | findstr chrome        # filtrar por nombre (CMD/PowerShell)
Get-Process | Sort-Object CPU -Descending   # ordenar por consumo de CPU
```

## 6.2 Herramientas gráficas

- **Administrador de tareas** (*Ctrl + Mayús + Esc*): la herramienta principal, con
  pestañas de Procesos, Rendimiento, Inicio y Servicios.
- **Monitor de recursos** (`resmon`): detalle de CPU, memoria, disco y red por
  proceso.
- **Process Explorer** (de Sysinternals, gratuito): un Administrador de tareas
  avanzado que muestra el árbol de procesos, los archivos y claves que cada uno
  tiene abiertos, la firma digital del ejecutable y mucho más.



# 7. Secuencia de arranque en Windows

Para administrar bien un sistema hay que entender **qué procesos se ponen en marcha
al encender el equipo y en qué orden**, porque muchos problemas (un servicio que no
levanta, un arranque lento) se diagnostican ahí. A grandes rasgos:

1. **Firmware (UEFI/BIOS)** y POST (comprobación del hardware).
2. **Administrador de arranque de Windows** (`bootmgr`).
3. **Cargador del sistema operativo** (`winload.exe`), que carga el núcleo
   (`ntoskrnl.exe`).
4. El núcleo arranca el **gestor de sesiones** (`smss.exe`), que a su vez pone en
   marcha `csrss.exe` y `wininit.exe`.
5. **`services.exe`** (el *Administrador de Control de Servicios*) arranca los
   **servicios** de Windows, y `winlogon.exe` presenta el inicio de sesión.



# 8. Servicios de Windows

Los **servicios** son el equivalente a los demonios de Linux: procesos que se
ejecutan de forma continua en segundo plano, sin interfaz, para ofrecer una
funcionalidad. Los gestiona el *Administrador de Control de Servicios* y puedes
administrarlos así:

| Tarea | Consola *Servicios* / PowerShell |
|-------|----------------------------------|
| Ver el estado | `Get-Service` o `services.msc` |
| Arrancar | `Start-Service nombre` |
| Parar | `Stop-Service nombre` |
| Reiniciar | `Restart-Service nombre` |
| Configurar inicio automático | Tipo de inicio "Automático" (en `services.msc`) |

```powershell
Get-Service | Where-Object Status -eq 'Running'   # servicios en marcha
```

::: nota
Aquí se ve por qué este tema es la base de todo el módulo: los servicios de
directorio, de impresión o de acceso remoto que verás en otras unidades **son
servicios de Windows**, y administrarlos consiste, en buena parte, en arrancarlos,
pararlos, configurarlos y vigilar su estado con estas mismas herramientas.
:::



# 9. Seguridad: detectar procesos sospechosos en Windows

El malware, los mineros de criptomonedas o un programa mal configurado se
manifiestan, casi siempre, como un proceso que no debería estar ahí o que consume
recursos de forma anómala. Algunas pautas específicas de Windows:

- **Vigila el consumo** desde el Administrador de tareas: un proceso desconocido con
  la CPU o la red al máximo es la señal de alarma más típica.
- **Comprueba la ruta del ejecutable**: en el Administrador de tareas (columna
  *Ruta de acceso*) o en Process Explorer. Un proceso "de sistema" que se ejecuta
  desde `Descargas` o desde una carpeta temporal es muy sospechoso.
- **Desconfía de los nombres camuflados**: un clásico es imitar nombres legítimos
  con pequeñas variaciones (`svch0st.exe`, `scvhost.exe`) para pasar
  desapercibido.
- **Verifica la firma digital**: Process Explorer puede comprobar si el ejecutable
  está firmado por un editor de confianza.
- **Actúa con cabeza**: si confirmas que es malicioso, aíslalo (corta la red),
  termínalo y analiza el equipo; no te limites a matarlo, porque muchos se
  reinician a través de un servicio o una tarea programada.

::: aviso
Cuidado al terminar procesos del sistema: finalizar uno legítimo (por ejemplo
`csrss.exe`, `wininit.exe` o un servicio crítico) puede colgar o reiniciar el
equipo. Si no estás seguro de qué es un proceso, **investígalo antes de actuar**.
:::



# 10. Resumen (Windows)

- El Administrador de tareas clasifica los procesos en **aplicaciones, segundo
  plano y procesos de Windows**; la estructura interna es **EPROCESS**.
- Los estados se muestran como **en ejecución, suspendido o no responde**.
- La prioridad se gestiona por **clases** (de Baja a Tiempo real), ajustables desde
  el Administrador de tareas o con `Start-Process -Priority`.
- Los procesos se crean con **`CreateProcess`** (`Start-Process`, `start`) y se
  terminan con **`taskkill`** o **`Stop-Process`**.
- La información interna se obtiene vía **WMI** y **contadores de rendimiento** (no
  hay `/proc`).
- Herramientas: **`tasklist`**, **`Get-Process`**, Administrador de tareas, Monitor
  de recursos y **Process Explorer**.
- Al arrancar: firmware → `bootmgr` → `winload` → núcleo → `smss`/`csrss`/`wininit`
  → `services.exe`.
- Los **servicios** (equivalentes a los demonios) se gestionan con `services.msc` o
  los cmdlets `*-Service`; conviene vigilar los procesos sospechosos por su ruta y
  su firma.
