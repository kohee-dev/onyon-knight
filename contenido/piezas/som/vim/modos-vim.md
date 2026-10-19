---
titulo: Los modos de Vim
tipo: teoria
borrador: true
---

# Aprendizaje de Vim

Hay muchas zonas para empezar a aprender el editor Vim. Por proponer recomendaciones `vimtutor` es un buen punto para comenzar, los manuales de `:help` listan todo lo que vayas a necesitar independientemente del caso, el tutorial de [Aprende Vim](https://victorhck.github.io/aprende-vim) o el de [Atareao con Linux](https://atareao.es/tutorial/vim) son recusos excelentes en castellano, pero busco proporcionar un enfoque distinto para utilizar en mi práctica docente. 

Siempre he visto el aprendizaje de este tipo de herramientas, *igual que la enseñanza de Linux*, como una coleccion de comandos que los alumnos tienen que memorizar para aprender a usar algo. Pero una vez te sales de ese esquema es cuando comienza el aprendizaje. Solo cuando tienes que solucionar un problema, cuando se rompe algo que usas en tu dia a dia o cuando comienzas a realizar tareas cotidianas es cuando comienzas a ver el sentido a aquellas pequeñas piezas modulares que antes no servian para nada. Por ello voy a intentar centrarme en situaciones en las que sirve el trabajo mas que en pequeños *tips* sobre como solucionar problemas concretos cada vez más raros.

# Vim

Vim ofrece varios modos con los que trabajar: tenemos el modo de inserción que es el que utilizamos para introducir texto, este le retomaremos más adelante, luego tenemos el modo normal que nos servirá para entrar en los distintos modos y para movernos por el documento y, por ultimo, el modo de linea de comandos.

Bien, con todo esto dicho, hay una forma sencilla de moverse entre modos. En el modo normal pulsaremos la tecla `i` para entrar en el modo de inserción y la tecla `:` para entrar en el modo de linea de comandos.

Una vez estemos en cada modo con la tecla `Esc` podremos volver de vuelta al modo normal. 

Ahora vamos con la parte importante ahora. Ya sabes añadir texto, y ahora querras salir del editor. Para guardar los cambios hay que escribir en el modo normal lo siguiente:

```vim
:write
```

Aunque tambien puedes escribir `:w`, es lo mismo. Si no has creado un archivo previamente tendrás que darle un nombre, cosa que podrás hacer con:

```vim
:w fichero.txt
```

¿Y si quieres guardar y salir?

```vim
:wq
```

Con q de quit. ¿Y si solo quieres salir sin guardar los cambios?

```vim
:q!
```
Es el comando de salir añadiendo `!` para forzar la salida. Muy sencillo. 

Hay muchas otras formas pero con esto es suficiente para hacer pequeños experimentos.
