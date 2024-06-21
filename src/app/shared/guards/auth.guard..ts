
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SessionService } from '../services/session.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const sessionService: SessionService = inject(SessionService);
  const router: Router = inject(Router);
  if (sessionService.isAuthenticated()) {
    return true
  }
  return router.navigate(["/login"]);;
};
