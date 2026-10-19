// Desplegables de la cabecera (patrón disclosure): sin JS, cada lista se ve tal cual.
// Abrir uno cierra los demás; Escape, clic fuera o salir con el foco lo cierran.
const cajas = [...document.querySelectorAll<HTMLElement>('[data-desplegable]')];
const controles = cajas.flatMap((caja) => {
  const boton = caja.querySelector<HTMLButtonElement>('.modulos-boton');
  return boton ? [{ caja, boton }] : [];
});
if (controles.length) document.documentElement.classList.add('con-modulos');

const abierto = (boton: HTMLButtonElement) => boton.getAttribute('aria-expanded') === 'true';
function poner(caja: HTMLElement, boton: HTMLButtonElement, si: boolean, devolverFoco = false) {
  boton.setAttribute('aria-expanded', String(si));
  caja.classList.toggle('modulos-abierto', si);
  if (!si && devolverFoco) boton.focus();
}

for (const { caja, boton } of controles) {
  boton.hidden = false;
  boton.addEventListener('click', () => {
    const si = !abierto(boton);
    for (const o of controles) if (o.boton !== boton) poner(o.caja, o.boton, false);
    poner(caja, boton, si);
  });
  caja.addEventListener('focusout', (e) => {
    if (abierto(boton) && e.relatedTarget && !caja.contains(e.relatedTarget as Node)) poner(caja, boton, false);
  });
}
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  for (const { caja, boton } of controles) if (abierto(boton)) poner(caja, boton, false, true);
});
document.addEventListener('click', (e) => {
  for (const { caja, boton } of controles) if (abierto(boton) && !caja.contains(e.target as Node)) poner(caja, boton, false);
});
