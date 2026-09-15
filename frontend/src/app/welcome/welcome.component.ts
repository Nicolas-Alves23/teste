import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SKIP_WELCOME_KEY } from '../core/guards/skip-welcome.guard';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css',
})
export class WelcomeComponent {
  naoMostrarNovamente = false;

  constructor(private readonly router: Router) {}

  acessar(): void {
    if (this.naoMostrarNovamente) {
      try {
        localStorage.setItem(SKIP_WELCOME_KEY, 'true');
      } catch {
        // ignora se o localStorage não estiver disponível
      }
    }
    this.router.navigate(['/motores']);
  }
}
