---
titulo: Introducción a Vim
tipo: teoria
borrador: true
---

# Introducción a Vim 

Siempre hay una primera vez para todo, incluso para usar *Vim*. Quiero que esta guia sirva, no solo para aprender a moverse por este editor de texto si no tambien para documentar mi progreso en este programa. 

Mi primera experiencia imagino que fue como la de todos, **frustrante**. Entrar a una ventana sin ningun tipo de guia, sin saber como escribir, donde solo aparecen errores de todo tipo y donde si quieres salir en el mejor de los casos no eres capaz y en el peor te aparecen mas errores que te impiden salir es lo que solo se puede considerar diversion tipo 3.

Está claro que únicamente con el uso constante de una herramienta es cuando aprender a usarlarla, pero lo mismo llegas a conocer aproximadamente el 10%: abrir un fichero, hacer 4 cambios, guardar y salir. Aunque todo depende del objetivo, si lo que se busca es conocer, aprender o incluso enseñar el uso de esta herramienta es importante conocer cada entresijo que nos puede proporcionar y comprender en profundidad todas las utilidades que la convierten en uno de los editores de los texto más utilizados en la actualidad. 

# Como instalar Vim

Vamos con lo facil. Vim se encuentra en los repositorios oficiales de Debian y derivados, Fedora y ArchLinux, asi que es tan facil como usar tu gestor de paquetes habitual y descargar Vim. Algo como: 

```bash
sudo apt install vim #Debian
sudo pacman -S vim #ArchLinux
sudo dnf install vim #Fedora
``` 
Vamos a comenzar con los primeros pasos, sin tener que configurar nada, sin tener que entrar en ficheros de ningun tipo. Creando una hoja en blanco con el touch y comenzando a escribir lo que sea. Luego ya bichearemos un poco con la configuración para hacerlo mucho más comodo. Hoy comenzaremos con el movimiento en el editor.

Cuando ya lo hayas instaladdo, entra en Vim. Para ellos tendras que ejecutar la instruccion.

```bash
vim
```

¿Sencillo verdad? Cuando entres deberás recibir un mensaje de bienvenida con una serie de recomendaciones. Os puedo asegurar que no las lei. 

* `:q` nos permite salir del editor siempre que no hayas escrito nada previamente.
* `:help` nos proporciona la ayuda.

Genial, ya podemos abrir y cerrar ficheros.

Ahora si queremos habrir un fichero específico podremos usar la instrucción `vim` seguido del nombre del fichero. Por ejemplo:

```bash
vim fichero.txt
```

Y con esto hemos aprendido lo básico de la instalación y apertura de ficheros. 

