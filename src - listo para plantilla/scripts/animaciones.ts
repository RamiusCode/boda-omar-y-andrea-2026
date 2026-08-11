/*
    animaciones.ts — configuración única de GSAP para toda la invitación.

    Antes cada componente importaba GSAP, registraba el plugin y creaba sus
    propios ScrollTrigger dentro de un DOMContentLoaded. Eso multiplicaba el
    trabajo por sección y hacía que el scroll se sintiera trabado.

    Aquí se centraliza:
      · un solo registro del plugin y una sola configuración global
      · triggers con `once: true` → la animación corre UNA vez y el trigger
        se destruye solo, así al volver a bajar el contenido ya está puesto
      · `ignoreMobileResize` → en el móvil, al ocultarse/mostrarse la barra
        del navegador ya no se recalculan todas las posiciones a mitad de scroll
      · respeto de "reducir movimiento" del sistema
*/

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// El cambio de alto por la barra de URL del móvil ya no dispara un refresh
// completo (era el tirón al bajar con el dedo).
ScrollTrigger.config({ ignoreMobileResize: true });

export const animacionReducida =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Configuración base de un disparador por scroll. */
function disparador(elemento: gsap.DOMTarget, start: string) {
    return {
        trigger: elemento,
        start,
        // Se reproduce una sola vez y el trigger se autodestruye:
        // ni "reset" ni "reverse", así la segunda bajada es instantánea.
        once: true,
    };
}

/**
 * Revela un elemento al entrar en pantalla.
 * Solo se animan `opacity` y `transform` (las dos propiedades que el
 * navegador puede componer en GPU sin repintar).
 */
export function revelar(
    objetivo: gsap.TweenTarget,
    desde: gsap.TweenVars,
    hasta: gsap.TweenVars,
    elementoDisparador: gsap.DOMTarget,
    start = "top 85%",
) {
    if (animacionReducida) {
        gsap.set(objetivo, { opacity: 1, clearProps: "transform" });
        return;
    }

    return gsap.fromTo(objetivo, desde, {
        ease: "power2.out",
        ...hasta,
        scrollTrigger: disparador(elementoDisparador, start),
    });
}

/**
 * Línea de tiempo para secciones con varios elementos encadenados.
 * Un único ScrollTrigger para toda la secuencia en lugar de uno por elemento.
 */
export function secuencia(elementoDisparador: gsap.DOMTarget, start = "top 85%") {
    const tl = gsap.timeline({
        defaults: { ease: "power2.out", duration: 0.7 },
        scrollTrigger: animacionReducida
            ? undefined
            : disparador(elementoDisparador, start),
    });

    // Sin scrollTrigger la línea corre al instante; acelerarla la deja
    // directamente en su estado final.
    if (animacionReducida) tl.timeScale(1000);

    return tl;
}

export { gsap, ScrollTrigger };
