---
titulo: "Aldea de goblins"
licencia: CC-BY-NC-SA-4.0
tipo: caso
horas: 12
---

# Contexto

El Consejo de una aldea goblin ha contratado a Andrea Windrose para poner orden en su censo antes de la Asamblea de otoño: nadie sabe con certeza quién pertenece a cada gremio, quién entra al Tesoro ni por qué el cuaderno de cuentas aparece a veces con tachones ajenos.

Tu trabajo es construir la infraestructura que lo resuelva con un dominio de [Active Directory](https://es.wikipedia.org/wiki/Active_Directory) sobre Windows Server 2022. La práctica se divide en seis fases y cada una termina en un hito que se puede comprobar con un comando o una captura.

::: nota
Además de dejar todo funcionando, debes explicar en tu cuaderno de campo qué hace cada componente que instalas o configuras, cómo funciona y qué alternativas existen. Un servicio instalado sin explicación no cuenta como hito superado.
:::

::: tip
Siempre que puedas, hazlo con PowerShell y guarda el script. En las fases 2, 3 y 5 hay trabajo repetitivo que no merece la pena hacer a mano.
:::

# Entorno

Trabajas con tres máquinas virtuales en una misma red, con direcciones fijas porque aún no existe ningún servidor DHCP.

| Máquina | Sistema | Recursos mínimos | IP |
| --- | --- | --- | --- |
| DC01 | Windows Server 2022 (con interfaz gráfica) | 2 vCPU, 4 GB RAM, 50 GB | 192.168.50.10 |
| CLI01 | Windows 11 Pro o Enterprise | 2 vCPU, 4 GB RAM, 50 GB | 192.168.50.21 |
| CLI02 | Windows 11 Pro o Enterprise | 2 vCPU, 4 GB RAM, 50 GB | 192.168.50.22 |

- **Red:** una red NAT o interna del hipervisor, 192.168.50.0/24, con la puerta de enlace que asigne tu hipervisor.
- **Dominio:** `combe.wiltshire`, con nombre NetBIOS `COMBE`.
- **DNS de los clientes:** siempre 192.168.50.10. Si apuntan a otro servidor, no encontrarán el dominio.

::: aviso
No clones CLI01 para obtener CLI02 sin pasar antes por `sysprep`. Dos equipos con el mismo nombre o identificador dan fallos de unión al dominio difíciles de explicar.
:::

Te entregan además el fichero `censo.csv` con los habitantes de la aldea, que usarás a partir de la fase 2:

```csv
Nombre,Clan,Usuario,Gremio,Rango
Bin,Bin,bin.bin,Consejo,Jefe
Grik,Dientenegro,grik.dientenegro,Mineros,Encargado
Ulg,Martillo,ulg.martillo,Herreros,Encargado
Vexa,Hueso,vexa.hueso,Chamanes,Encargado
Brakka,Cobre,brakka.cobre,Guardia,Encargado
Snuk,Pellejo,snuk.pellejo,Mineros,Raso
Mokk,Raspa,mokk.raspa,Mineros,Raso
Zurta,Ceniza,zurta.ceniza,Herreros,Raso
Tazz,Chispa,tazz.chispa,Herreros,Raso
Pogga,Musgo,pogga.musgo,Chamanes,Raso
Nibsy,Yesca,nibsy.yesca,Chamanes,Raso
Kritch,Tizon,kritch.tizon,Guardia,Raso
Drog,Hollin,drog.hollin,Guardia,Raso
```

# Fase 1. Fundación del dominio

La aldea no existe hasta que DC01 es [controlador de dominio](https://es.wikipedia.org/wiki/Controlador_de_dominio) y responde a las consultas [DNS](https://es.wikipedia.org/wiki/Sistema_de_nombres_de_dominio) de todos los demás.

**Tareas**

1. Configura DC01: nombre de equipo, IP fija y zona horaria correcta.
2. Instala el rol de servicios de dominio de Active Directory (AD DS) y promociona DC01 creando un bosque nuevo con el dominio `combe.wiltshire`.
3. Comprueba que el servidor DNS se ha instalado con el dominio y que tiene un reenviador para resolver nombres de Internet.
4. Configura CLI01 y CLI02 con IP fija y DNS apuntando a DC01.

::: ejercicio
Antes de unir ningún cliente, apunta CLI01 a un DNS distinto e intenta unirlo al dominio. Anota el error y la causa, y vuelve a la configuración correcta.
:::

**Documenta en tu cuaderno de campo**

- Qué es un bosque, un árbol y un dominio, y por qué AD no funciona sin DNS (registros SRV).
- Qué guardan `NTDS.dit` y la carpeta `SYSVOL`.
- Alternativas a hacerlo desde el asistente gráfico: PowerShell (`Install-ADDSForest`). El antiguo `dcpromo` ya no existe en Windows Server 2022.

::: aviso
Guarda la contraseña del modo de restauración de servicios de directorio (DSRM). Sin ella, un controlador dañado no se puede reparar.
:::

**Hito 1:** `Get-ADDomain` muestra `combe.wiltshire`, `nslookup combe.wiltshire` desde CLI01 devuelve la IP de DC01 y `dcdiag` no informa de errores graves.

# Fase 2. Censo de la aldea

Una vez creado el dominio, hay que poblarlo: crear la estructura de unidades organizativas (OU), dar de alta a todos los habitantes del censo y unir los equipos al dominio.

**Estructura de OU que debes crear**

```text
combe.wiltshire
└─ Aldea
   ├─ Consejo
   ├─ Encargados
   ├─ Gremios
   │  ├─ Mineros
   │  ├─ Herreros
   │  ├─ Chamanes
   │  └─ Guardia
   ├─ Grupos
   └─ Equipos
```

**Tareas**

1. Crea la estructura de OU, preferiblemente con un script.
2. Importa `censo.csv` con un único script: el jefe va a Consejo, los encargados a Encargados y los goblins rasos a la OU de su gremio. Cada cuenta lleva nombre de inicio de sesión (UPN) `usuario@combe.wiltshire` y obliga a cambiar la contraseña en el primer acceso.
3. Une CLI01 al dominio y mueve su cuenta de equipo a la OU Equipos.
4. Inicia sesión en CLI01 con un usuario de dominio y comprueba que también puedes entrar con la cuenta local.

::: ejercicio
La aldea acepta a dos nuevos miembros, Rukk Barro (Mineros, Raso) y Fenna Ascua (Chamanes, Raso). Dalos de alta reutilizando tu script con un segundo fichero `nuevos.csv`, sin editar el script. Une CLI02 al dominio para ellos.
:::

**Documenta en tu cuaderno de campo**

- Para qué sirve una OU y en qué se diferencia de un grupo.
- Qué hace el proceso de unión al dominio en el equipo y en el directorio.
- Por qué los equipos nuevos se crean en el contenedor Computers y qué inconvenientes tiene.

::: tip
`Import-Csv` convierte cada fila en un objeto con propiedades llamadas como las columnas, y `New-ADUser` acepta casi todo lo que necesitas por parámetro.
:::

**Hito 2:** `Get-ADUser -Filter *` lista, además de las cuentas del sistema, a los 15 habitantes, cada uno en su OU, y CLI01 y CLI02 aparecen en Equipos y permiten iniciar sesión con usuarios del dominio.

# Fase 3. Gremios y permisos

Cada gremio guarda sus papeles en su carpeta y el Consejo decide quién ve qué, y los permisos se asignan a grupos y nunca a personas sueltas.

**Tareas**

1. Aplica la estrategia AGDLP (cuentas en grupos globales, estos en grupos locales de dominio, y los permisos al grupo local). Todos los grupos van a la OU Grupos y siguen esta nomenclatura:
   - Globales: `GG_Mineros`, `GG_Herreros`, `GG_Chamanes`, `GG_Guardia`, `GG_Encargados` y `GG_Aldea` (que contiene a los cuatro grupos de gremio, anidados).
   - Locales de dominio: uno por cada permiso que necesites, por ejemplo `DL_Mineros_Modificar` o `DL_Plaza_Leer`.
2. Mete a cada habitante en el grupo global de su gremio, con un script, y a los encargados también en `GG_Encargados`.
3. Crea en DC01 la estructura de carpetas `C:\Aldea\Gremios\<gremio>`, `C:\Aldea\Plaza` y `C:\Aldea\Tesoro`, y compártelas.
4. Aplica esta matriz de permisos NTFS:

   | Carpeta | Miembros del gremio | Guardia | Encargados | Resto de la aldea |
   | --- | --- | --- | --- | --- |
   | `Gremios\<gremio>` | Modificar | Solo lectura | Solo en su gremio (Modificar, por pertenecer a él) | Sin acceso |
   | `Plaza` | Solo lectura | Solo lectura | Modificar | Solo lectura |
   | `Tesoro` | Sin acceso | Sin acceso | Modificar | Sin acceso |

5. Haz que quien no tenga acceso a una carpeta ni siquiera la vea en la lista (enumeración basada en acceso).
6. Desde CLI01, conecta como unidad de red `P:` la carpeta Plaza con un usuario del dominio, y comprueba la matriz entrando con un goblin raso, un encargado y alguien de la Guardia.

::: ejercicio
Una carpeta tiene permiso de compartición de lectura y permiso NTFS de modificación para el mismo usuario. Prueba qué ocurre, explica cuál es el permiso efectivo y por qué la práctica habitual es dar a la compartición un permiso amplio y restringir con NTFS.
:::

**Documenta en tu cuaderno de campo**

- Por qué AGDLP y no asignar permisos directamente a usuarios, con un ejemplo de lo que ocurre cuando un goblin cambia de gremio.
- La diferencia entre permisos de compartición y permisos [NTFS](https://es.wikipedia.org/wiki/NTFS), y cómo se combinan.
- Alternativas para centralizar archivos sin usar el controlador de dominio (un servidor miembro dedicado) y por qué conviene.

::: aviso
Al añadir a alguien a un grupo, el cambio no se aplica a una sesión ya abierta. El usuario debe cerrar sesión y volver a entrar para obtener un nuevo token de acceso.
:::

::: aviso
En un entorno real los archivos no se alojan en el controlador de dominio. Aquí se hace así para ahorrar una máquina virtual.
:::

**Hito 3:** la matriz de permisos se cumple con tres usuarios de prueba, y Tesoro no es visible para quien no es encargado.

# Fase 4. Encargados y administración remota

El jefe no puede ocuparse de cada goblin, así que cada encargado gestiona su gremio, y ni el jefe ni los encargados deberían sentarse delante de DC01 para hacerlo.

**Tareas**

1. Crea un grupo `GG_Enc_<gremio>` por cada gremio, con el encargado correspondiente como único miembro.
2. Delega en cada grupo, y no en la persona, el control de la OU de su gremio: restablecer contraseñas y desbloquear cuentas, crear y eliminar usuarios, y modificar la pertenencia al grupo global de su gremio. No debe poder tocar nada fuera de su OU.
3. Instala las herramientas de administración remota (RSAT) de Active Directory en CLI01. Entra con un encargado y comprueba que puede gestionar a su gremio desde ahí, sin iniciar sesión en DC01.
4. Habilita [escritorio remoto](https://es.wikipedia.org/wiki/Protocolo_de_escritorio_remoto) en CLI02 y conéctate desde CLI01 con la cuenta del jefe.
5. Desde CLI01 y con la cuenta del jefe, abre una sesión remota de [PowerShell](https://es.wikipedia.org/wiki/PowerShell) en DC01 y lista los usuarios de la OU Gremios. Después ejecuta el mismo comando en DC01 y CLI02 a la vez.
6. Prueba negativa: con el encargado de los Mineros, intenta restablecer la contraseña de un herrero. Debe fallar, y la captura del error es parte de la evidencia.

::: ejercicio
Snuk Pellejo (Mineros) es ascendido a encargado. Haz el cambio con el menor número de pasos posible y explica qué habría tenido que cambiar si los permisos se hubieran dado a personas sueltas.
:::

**Documenta en tu cuaderno de campo**

- Qué es el principio de mínimo privilegio y por qué delegar es mejor que hacer administradores del dominio a los encargados.
- Diferencias entre RDP, PowerShell remoto (WinRM) y RSAT: qué puertos usa cada uno, qué se administra con cada uno y cuándo conviene uno u otro.
- Alternativas modernas de administración centralizada (Windows Admin Center, por ejemplo).

::: aviso
No metas a los encargados en Domain Admins para que algo «funcione». Si algo falla, el fallo está en la delegación.
:::

::: tip
El asistente de delegación de control sirve para empezar, pero `dsacls` y los permisos del editor de seguridad de la OU te dejan ver qué se ha concedido exactamente.
:::

**Hito 4:** el encargado de cada gremio puede gestionar solo su gremio desde CLI01, el jefe administra DC01 y CLI02 de forma remota, y la prueba negativa queda documentada.

# Fase 5. Directivas de grupo

Las leyes de la aldea se escriben una vez como [directivas de grupo](https://en.wikipedia.org/wiki/Group_Policy) (GPO) y se aplican solas a los equipos y usuarios a los que afectan; esta es la fase más larga de la práctica.

**Tareas**

1. **Contraseñas de la aldea.** Configura la política de contraseñas del dominio: 10 caracteres como mínimo, complejidad activada y bloqueo de la cuenta durante 15 minutos tras 5 intentos fallidos. Compruébalo provocando un bloqueo.
2. **Contraseñas del Consejo y los encargados.** Aplica a estos usuarios una política más estricta (14 caracteres, bloqueo tras 3 intentos) sin afectar al resto. Necesitarás un grupo global para el jefe y una política de contraseñas específica (PSO).
3. **Restricciones para goblins rasos.** Crea la GPO `Ley_Raso`, que impida el acceso al Panel de control y al símbolo del sistema, y enlázala donde afecte a los goblins rasos de todos los gremios pero no a los encargados ni al jefe.
4. **Orden de aplicación.** Crea una GPO `Ley_Aldea` enlazada a la OU Aldea que ponga un fondo de escritorio, y otra `Ley_Mineros` enlazada a la OU Mineros con un fondo distinto. Observa qué fondo ve un minero y por qué. Después prueba a imponer el primero con *Exigido* (Enforced) y a bloquear la herencia en Mineros, y explica cada resultado.
5. **Unidades de red.** Con una GPO de preferencias, conecta `P:` (Plaza) a todos los usuarios y `G:` (la carpeta de su gremio) a cada uno según su grupo.
6. **Software.** El chamán necesita su herramienta en todos los equipos. Comparte `C:\Aldea\Software` con permiso de lectura para los equipos del dominio, copia en ella el instalador MSI de 7-Zip y despliégalo mediante una GPO sobre la OU Equipos. Comprueba la instalación tras reiniciar CLI01.
7. **Diagnóstico.** Genera el informe de resultados de directiva de CLI01 (`gpresult /h informe.html`) y señala en él qué GPO se aplican a cada usuario y cuáles se descartan, con el motivo.

::: ejercicio
Un goblin de la Guardia se queja de que su fondo de escritorio no ha cambiado. Elige tres causas posibles, descártalas en orden con comandos y anota cuál era.
:::

**Documenta en tu cuaderno de campo**

- El orden de aplicación (local, sitio, dominio, OU), la herencia y el filtrado de seguridad frente a enlazar en otra OU.
- Qué parte de una GPO es de equipo y cuál de usuario, y por qué el software se despliega al equipo y el fondo al usuario.
- Por qué el despliegue de software por GPO solo admite paquetes MSI y qué alternativas existen (Intune, winget, herramientas de gestión de endpoints).

::: aviso
Una política de contraseñas enlazada a una OU no afecta a las cuentas del dominio. Solo la del dominio y las PSO tienen ese efecto.
:::

::: aviso
Las directivas de equipo (como el despliegue de software) se aplican en el arranque. Ejecutar `gpupdate /force` no basta, y hay que reiniciar.
:::

::: tip
Si una GPO «no hace nada», comprueba por este orden: dónde está enlazada, en qué OU está el usuario o el equipo, el filtrado de seguridad y si el equipo ha refrescado las directivas.
:::

**Hito 5:** `gpresult` muestra las GPO esperadas para un goblin raso, un encargado y CLI01; las restricciones solo afectan a los rasos; los usuarios ven `P:` y `G:`; y 7-Zip aparece instalado en CLI01 y CLI02 sin tocar los equipos.

# Fase 6 (ampliación). Hogar de cada goblin

Esta fase es opcional y sirve para que cada goblin tenga su espacio personal, accesible desde cualquier equipo del dominio.

**Tareas**

1. Crea la carpeta compartida oculta `Hogares$` en DC01 y, dentro, una carpeta por usuario con permisos para que solo su propietario (y el jefe) acceda a ella.
2. Asigna a todos los usuarios, con un script, una carpeta personal en la unidad `H:` que apunte a `\\DC01\Hogares$\<usuario>`.
3. Redirige la carpeta Documentos de los usuarios a su carpeta personal con una GPO y comprueba que, al entrar en CLI02, ven los mismos documentos que en CLI01.

**Documenta en tu cuaderno de campo**

- La diferencia entre perfil local, perfil móvil y redirección de carpetas, y por qué hoy se prefiere la redirección.
- Por qué una carpeta compartida se oculta añadiendo `$` al nombre y por qué eso no es una medida de seguridad.

# Entrega

Entregas un único paquete con la evidencia de cada hito, y el docente puede comprobar cualquiera de ellos en directo sobre tus máquinas.

| Qué | Contenido |
| --- | --- |
| Cuaderno de campo | Una sección por fase con lo que se pide en «Documenta», en tus propias palabras y con enlaces a las fuentes que hayas usado |
| Scripts | Todos los `.ps1` que hayas escrito, comentados y funcionales sobre un dominio vacío |
| Capturas | Una por hito, más la de la prueba negativa de la fase 4 |
| Informes | `gpresult /h` de CLI01 y salida de `Get-ADOrganizationalUnit`, `Get-ADGroup` y `Get-SmbShare` |

::: nota
Las capturas deben mostrar el nombre del equipo y el usuario con el que estás conectado. Una captura de otra máquina o de un usuario distinto no demuestra el hito.
:::

::: aviso
Si te quedas atrás, pide al docente la máquina de rescate de la fase anterior para no quedarte bloqueado. Esas fases se evalúan como no realizadas, pero podrás seguir con las siguientes.
:::
