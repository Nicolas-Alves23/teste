import { Routes } from '@angular/router';
import { skipWelcomeGuard } from './core/guards/skip-welcome.guard';
import { MotoresPageComponent } from './motores/motores-page.component';
import { WelcomeComponent } from './welcome/welcome.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent, canActivate: [skipWelcomeGuard] },
  { path: 'motores', component: MotoresPageComponent },
  { path: '**', redirectTo: '' },
];
