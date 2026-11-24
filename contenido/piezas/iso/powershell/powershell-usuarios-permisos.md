---
titulo: "PowerShell 7: usuarios, grupos y permisos"
tipo: teoria
---

# PowerShell 7: usuarios, grupos y permisos

En un sistema con varias personas, lo primero que hay que saber es **quién eres**, y lo segundo, **qué puede hacer cada cual**. Esta pieza trata las cuentas de usuario y los grupos locales de Windows, y los permisos de ficheros y carpetas (NTFS), que es donde se decide quién lee, quién escribe y quién no entra.

## Lo mínimo para empezar

| Orden | Qué hace |
|---|---|
| `whoami` | escribe tu usuario, con el nombre del equipo delante |
| `whoami /groups` | escribe los **grupos** a los que perteneces |
| `Get-LocalUser` | lista los usuarios locales y si están habilitados |
| `Get-LocalGroup` | lista los grupos locales |
| `Get-LocalGroupMember -Group Administradores` | lista quién pertenece a un grupo |
| `New-LocalUser -Name pedro -Password $clave` | crea un usuario local (necesita ser administrador) |
| `Add-LocalGroupMember -Group Usuarios -Member pedro` | mete a un usuario en un grupo |
| `Disable-LocalUser pedro` / `Remove-LocalUser pedro` | desactiva / borra un usuario |
| `icacls fichero` | enseña los permisos de un fichero o carpeta |
| `icacls f /grant usuario:R` | **da** un permiso |
| `icacls f /deny usuario:W` | **deniega** un permiso |
| `icacls f /remove usuario` | quita lo concedido a ese usuario |
| `icacls f /inheritance:r` | corta la **herencia** de la carpeta de arriba |
| `Get-Acl f` | lo mismo, como un objeto de PowerShell |

Los permisos de `icacls` se escriben con letras:

| Letra | Significa |
|---|---|
| `F` | control total |
| `M` | modificar (leer, escribir y borrar) |
| `RX` | leer y ejecutar |
| `R` | solo leer |
| `W` | solo escribir |

Y la salida de `icacls` lleva a veces unas marcas entre paréntesis: `(I)` quiere decir que el permiso **se hereda** de la carpeta contenedora, y `(OI)(CI)` que se aplica a los ficheros y a las carpetas que haya dentro.

Ideas que conviene tener claras:

- Los permisos de una carpeta **se heredan** por defecto a todo lo que contiene. Para dar un trato distinto a un fichero hay que cortar esa herencia con `/inheritance:r`, y después conceder lo que haga falta.
- Una **denegación gana siempre** a una concesión: si alguien tiene `Modificar` por un grupo pero una regla le deniega `Escribir`, no podrá escribir.
- Los nombres de los grupos cambian con el idioma del sistema: `Administrators` y `Users` en inglés son `Administradores` y `Usuarios` en español. Para escribir órdenes que valgan en cualquier idioma se usa el **SID** del grupo precedido de un asterisco: `*S-1-5-32-545` es siempre «Usuarios» y `*S-1-5-32-544` es siempre «Administradores».
- Crear usuarios, cambiar grupos y tocar permisos ajenos exige abrir PowerShell **como administrador** (clic derecho → *Ejecutar como administrador*). Sin eso, las órdenes fallan con «acceso denegado».
- Con `icacls` y una variable, hay una trampa: `"$env:USERNAME:F"` no funciona, porque PowerShell cree que `USERNAME:F` es el nombre de la variable. Se escribe `"${env:USERNAME}:F"`, con llaves.
- Una contraseña **no se escribe en claro** dentro de una orden ni de un script: queda en el historial y en el fichero. `Read-Host -AsSecureString` la pide por teclado sin mostrarla.

Los ejercicios usan esta salida de ejemplo, sobre el fichero `nomina.txt` del equipo `PC1`:

```text
nomina.txt BUILTIN\Administrators:(I)(F)
           NT AUTHORITY\SYSTEM:(I)(F)
           PC1\alex:(I)(M)
           BUILTIN\Users:(I)(RX)
```

## Ejercicios

### 1. Leer los permisos

Mira la salida de ejemplo de `icacls nomina.txt`.

:::pregunta[¿Quién puede modificar el fichero? ¿Y quién solo leerlo?]
Pueden modificarlo `Administrators` y `SYSTEM` (con control total) y `alex` (con `M`, modificar). El grupo `Users` solo puede **leer y ejecutar** (`RX`), no modificar.

La marca `(I)` en todas las líneas indica que los permisos son **heredados** de la carpeta donde está el fichero.
:::

### 2. Dar un permiso

Lee esta orden:

```powershell
icacls nomina.txt /grant "*S-1-5-32-545:M"
```

:::pregunta[¿Qué cambia?]
Concede el permiso de **modificar** al grupo `Users` (el SID `S-1-5-32-545`), que hasta ahora solo podía leer. Se añade como permiso explícito, junto al heredado.

Usar el SID en vez del nombre hace que la orden funcione igual en un Windows en español o en inglés.
:::

### 3. Cortar la herencia

Lee esta orden:

```powershell
icacls nomina.txt /inheritance:r
```

:::pregunta[¿Qué ocurre con las cuatro líneas de la salida de ejemplo? ¿Qué peligro tiene?]
La `r` es de *remove*: elimina todos los permisos **heredados**, es decir, las cuatro líneas, que son todas `(I)`. El fichero se queda **sin ningún permiso**.

El peligro es dejar el fichero inaccesible para todos, incluido tú. Por eso la orden se completa con una concesión: `icacls nomina.txt /inheritance:r /grant:r "${env:USERNAME}:F"` corta la herencia y deja solo tu usuario con control total.
:::

### 4. Denegar gana

La usuaria `alex` pertenece al grupo `Users`, que tiene `RX`, y tiene además `M` a título personal. Alguien ejecuta:

```powershell
icacls nomina.txt /deny "alex:W"
```

:::pregunta[¿Puede `alex` seguir modificando el fichero?]
**No**. La denegación de escritura tiene prioridad sobre cualquier concesión, aunque `alex` tenga `M` por su cuenta. Aun así podría seguir leyéndolo.

Para devolverle el permiso se quita la denegación con `icacls nomina.txt /remove:d alex`, donde `:d` indica «las denegaciones».
:::

### 5. Quién eres

Lee estas órdenes:

```powershell
whoami
$env:USERNAME
```

:::pregunta[¿Qué escribe cada una?]
La primera escribe `pc1\alex`: el nombre del equipo y el del usuario. La segunda escribe solo `alex`.

Es importante la diferencia cuando el usuario es de un dominio: `dominio\usuario` y `equipo\usuario` son cuentas distintas aunque se llamen igual.
:::

### 6. Los usuarios del equipo

Lee esta salida de `Get-LocalUser`:

```text
Name               Enabled Description
----               ------- -----------
Administrador      False   Cuenta integrada para la administración del equipo
alex               True
Invitado           False   Cuenta integrada para el acceso como invitado
pedro              False
```

:::pregunta[¿Qué usuarios pueden iniciar sesión? ¿Qué orden te da solo esos?]
Solo `alex`, porque es el único con `Enabled` en `True`. Los demás están **deshabilitados**: existen, pero no pueden entrar.

```powershell
Get-LocalUser | Where-Object Enabled
```

Deshabilitar una cuenta (`Disable-LocalUser`) es mejor que borrarla cuando una persona se va temporalmente, porque conserva su identidad y sus permisos.
:::

### 7. Crear un usuario sin dejar la contraseña a la vista

Un compañero propone esta orden para crear al usuario `pedro`:

```powershell
New-LocalUser -Name pedro -Password (ConvertTo-SecureString "Abc12345" -AsPlainText -Force)
```

:::pregunta[¿Qué problema tiene y cómo se evita?]
La contraseña queda **escrita en claro** en la propia orden, y por tanto en el historial de la terminal y en cualquier script donde la copies. Cualquiera que lea ese fichero la conoce.

Se evita pidiéndola por teclado, sin mostrarla:

```powershell
$clave = Read-Host "Contraseña" -AsSecureString
New-LocalUser -Name pedro -Password $clave
```
:::

### 8. Grupos

Lee estas órdenes:

```powershell
Add-LocalGroupMember -Group Usuarios -Member pedro
Get-LocalGroupMember -Group Usuarios
```

:::pregunta[¿Qué hacen? ¿Qué hace falta para que funcionen?]
La primera mete a `pedro` en el grupo `Usuarios`, y la segunda lista a todos los miembros de ese grupo, que ahora incluye a `pedro`.

Hace falta abrir PowerShell **como administrador** para la primera, y que el grupo se llame `Usuarios`: en un Windows en inglés se llama `Users`.
:::

## Hazlo tú

Copia este bloque y pégalo en PowerShell. Crea en `practica` una carpeta `permisos` con dos ficheros. Los ejercicios 9 a 13 se hacen con tu usuario normal, sin permisos de administrador.

```powershell
$d = "$HOME\practica\permisos"
Remove-Item $d -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $d | Out-Null
Set-Content "$d\secreto.txt" "contenido reservado"
Set-Content "$d\publico.txt" "contenido abierto"
Write-Host "Carpeta $d preparada"
```

### 9. Mirar los permisos

Escribe los permisos de `secreto.txt` y di qué tres entradas ves.

:::pregunta[Escribe la orden y las entradas]
```powershell
cd ~\practica\permisos
icacls secreto.txt
```

Salen tres entradas heredadas de tu carpeta personal, con control total `(F)`: el grupo de administradores, `NT AUTHORITY\SYSTEM` y tu usuario.
:::

### 10. Solo para ti

Deja `secreto.txt` de forma que **solo tu usuario** tenga acceso, con control total, y demuéstralo.

:::pregunta[Escribe las órdenes y la salida]
```powershell
icacls secreto.txt /inheritance:r /grant:r "${env:USERNAME}:F"
icacls secreto.txt
```

La segunda orden escribe una única línea: tu usuario con `(F)`, y ninguna marca `(I)`. Los administradores y `SYSTEM` ya no tienen acceso por herencia.
:::

### 11. Lectura para todos

Concede a **todos los usuarios** (el grupo `Users`) permiso de solo lectura sobre `publico.txt`, sin usar el nombre del grupo, y demuéstralo.

:::pregunta[Escribe las órdenes y la salida]
```powershell
icacls publico.txt /grant "*S-1-5-32-545:R"
icacls publico.txt
```

Aparece una línea nueva con `BUILTIN\Users` (o `BUILTIN\Usuarios` en español) y `(R)`, que es un permiso explícito, sin `(I)`.
:::

### 12. Prohibirte a ti mismo

Deniega la **escritura** de tu propio usuario sobre `publico.txt`, comprueba que ya no puedes añadirle una línea, y después arréglalo.

:::pregunta[Escribe las órdenes y lo que ocurre]
```powershell
icacls publico.txt /deny "${env:USERNAME}:W"
Add-Content publico.txt "otra linea"
icacls publico.txt /remove:d $env:USERNAME
Add-Content publico.txt "otra linea"
```

El primer `Add-Content` falla con un error de **acceso denegado**, porque la denegación gana a cualquier concesión. Después de quitar la denegación con `/remove:d`, el segundo funciona.
:::

### 13. El propietario

Averigua quién es el **propietario** de `secreto.txt`.

:::pregunta[Escribe la orden y la respuesta]
```powershell
(Get-Acl secreto.txt).Owner
```

Escribe tu usuario con el nombre del equipo, algo como `PC1\alex`. El propietario puede cambiar los permisos del fichero aunque se los haya quitado a sí mismo, y por eso no te quedas fuera por cortar la herencia.
:::

### 14. Un usuario nuevo (solo en una máquina virtual)

**Hazlo solo en una máquina virtual o en un equipo de pruebas**, con PowerShell abierto como administrador. Crea el usuario `alumno1` con una contraseña pedida por teclado, mételo en el grupo de usuarios, y demuestra que existe. Después **bórralo**.

:::pregunta[Escribe las órdenes y la comprobación]
```powershell
$clave = Read-Host "Contraseña" -AsSecureString
New-LocalUser -Name alumno1 -Password $clave
Add-LocalGroupMember -SID S-1-5-32-545 -Member alumno1
Get-LocalUser alumno1
Get-LocalGroupMember -SID S-1-5-32-545
Remove-LocalUser alumno1
```

`Get-LocalUser` enseña a `alumno1` con `Enabled` en `True`, y el grupo lo lista entre sus miembros. Con `-SID` la orden vale en cualquier idioma. La última orden deja el equipo como estaba.
:::
