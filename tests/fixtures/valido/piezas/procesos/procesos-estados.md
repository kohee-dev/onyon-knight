---
dificultad: avanzado
titulo: Estados de un proceso
fuentes:
  - "Silberschatz, Operating System Concepts, 10.ª ed."
  - "Stallings, Operating Systems, 9.ª ed."
---

# Estados

Como vimos en [[procesos-concepto]], un proceso pasa por varios estados.

![Diagrama de estados](./img/cpu.png){.mediana}

:::ejercicio
Muestra los procesos con `ps aux`.
:::

```mermaid
flowchart LR
  Listo --> Ejecucion --> Bloqueado --> Listo
```

```bash
ps aux | grep sshd
```
