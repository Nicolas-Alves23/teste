import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const SKIP_WELCOME_KEY = 'motores_portal_skip_welcome';

/**
 * Pula a tela de boas-vindas quando o usuário já marcou "não mostrar novamente".
 * Sem a flag no localStorage, a tela volta a aparecer a cada acesso — intencional.
 */
export const skipWelcomeGuard: CanActivateFn = () => {
  const router = inject(Router);

  try {
    if (localStorage.getItem(SKIP_WELCOME_KEY) === 'true') {
      return router.parseUrl('/motores');
    }
  } catch {
    // localStorage indisponível (ex.: modo privado) — mostra a tela normalmente
  }

  return true;
};
