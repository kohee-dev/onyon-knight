---
titulo: "Servicios de Impresion en Windows"
licencia: CC-BY-NC-SA-4.0
---

# 1. Impresora compartida

## 1.1 Rol impresión

* Instalar rol/función de servidor de impresión. Incluir impresión por Internet.


## 1.2 Instalar impresora PDF

Vamos a conectar e instalar localmente una impresora al servidor Windows Server, de modo que estén disponibles para ser accedidas por los clientes del dominio.

En nuestro caso, vamos a instalar un programa que simule una impresora de PDF.

> [Enlaces de interés:](http://www3.gobiernodecanarias.org/medusa/eforma/campus/mod/page/view.php?id=748283)
>
> * [Impresoras virtuales PDF](http://www.genbeta.com/herramientas/impresoras-virtuales-pdf-tres-alternativas-gratuitas-en-espanol)
> * PDF Creator
> * Claw PDF https://github.com/clawsoftware/clawPDF
> * pdf24 https://https://www.pdf24.org/es/
> * doPDF: https://www.dopdf.com/es/
> * BullZIP PDF Printer: http://www.bullzip.com/products/pdf/info.php#Introduction

PDFCreator es una utilidad completamente gratuita con la que podrás crear archivos PDF desde cualquier aplicación, desde el Bloc de notas hasta Word, Excel, etc. Este programa funciona simulando ser una impresora, de esta forma, instalando PDFCreator todas tus aplicaciones con opción para imprimir te permitirán crear archivos PDF en cuestión de segundos.

* Descargar PDFCreator (URL recomendada `www.pdfforge.org/pdfcreator/download`) e instalar.
* En PDFCreator, configurar en `perfiles -> Guardar -> Automático`. Ahí establecemos la carpeta destino.
En esta carpeta su guardarán los archivos que se impriman.

::: aviso 
PDFCreator puede requerir NET FrameWork v4. Esto tarda unos minutos.
:::

## 1.3 Probar la impresora en local

Puedes probar la nueva impresora abriendo el Bloc de notas y creando un fichero luego selecciona imprimir. Cuando finalice el proceso se abrirá un fichero PDF con el resultado de la impresión.

* Probar la impresora local imprimiendo documento `imprimirXXs-local`.

# 2. Compartir por red

## 2.1 En el servidor

Vamos a la MV del servidor.
* Ir al `Administrador de Impresión -> Impresoras`
* Elegir impresora PDFCreator.
    * `Botón derecho -> Propiedades -> Compartir`
    * Como nombre del recurso compartido utilizar `PDFnombrealumnoXX`.

## 2.2 Comprobar desde el cliente

Vamos al cliente:
* Buscar recursos de red del servidor. Si tarda en aparecer ponemos `\\ip-del-servidor` en la barra de navegación.
* Seleccionar impresora -> botón derecho -> conectar.
    * Ponemos usuario/clave del Windows Server.
* Ya tenemos la impresora remota configurada en el cliente.
* Probar la impresora remota imprimiendo documento `imprimirXXw-remoto`. Si tenemos problemas para que aparezca el PDF en el servidor, iniciar el
programa PDFCreator y esperar un poco.

::: tip
Para **buscar archivos** (Por ejemplo PDF) dentro de Windows podemos usar las funcionar de [buscar](https://www.islabit.com/10080/una-mejor-forma-de-buscar-archivos-en-windows-7.html)
:::

# 3. Acceso Web

Realizaremos una configuración para habilitar el acceso web a las impresoras del dominio.

## 3.1 Instalar característica impresión WEB

* Vamos al servidor.
* Nos aseguramos de tener instalado el servicio "Impresión de Internet".

## 3.2 Configurar impresión WEB

En este apartado vamos a volver a agregar la impresora de red remota en el cliente, pero
usando otra forma diferente de localizar la impresora.

Vamos a la MV cliente:
* Abrimos un navegador Web.
* Ponemos URL `http://<ip-del-servidor>/printers` (o `http://<nombre-del-servidor>/printers`)
para que aparezca en nuestro navegador un entorno que permite gestionar las impresoras de dicho equipo, previa autenticación como uno de los usuarios del habilitados para dicho fin (por ejemplo el "Administrador").
* Pincha en la opción propiedades y captura lo que se ve. Apuntar el URL asociado al nombre de red de la impresora para usarlo más adelante.
* Agregar nueva impresora (NO es local) en el SO cliente.
* Crear nueva impresora usando el URL (nombre de red) anterior.

## 3.3 Comprobar desde el navegador

::: nota

**PDF Creator Plus** (YERAY HERNÁNDEZ HERNÁNDEZ)

* [Enlace a las funcionalidades del PDF Creator Plus](https://www.pdfforge.org/pdfcreator/plus)
* Comprobaremos que la versión Free tiene limitaciones.
:::

Vamos a realizar seguidamente una prueba sencilla en tu impresora de red:
* Accede a la configuración de la impresora a través del navegador.
    * Poner en `pausa` los trabajos de impresión de la impresora.
* Ir a MV cliente.
* Probar la impresora remota imprimiendo documento `imprimirXXw-web`.
    * Comprobar que al estar la impresora en pausa, el trabajo aparece en cola de impresión del servidor.
* Finalmente pulsa en reanudar el trabajo para que tu documento se convierta a PDF.
* Si tenemos problemas para que aparezca el PDF en el servidor, iniciar el
programa PDFCreator y esperar un poco.

::: aviso
**Si hay problemas** para acceder a la impresora de red desde el cliente Windows entonces:

* Revisar la configuración de red de la máquina (Incluido la puerta de enlace)
* Reiniciar el servidor Windows Server que contiene la impresora compartida de red.
:::