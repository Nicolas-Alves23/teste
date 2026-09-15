import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Motor } from './core/models/motor.model';
import { MotorService } from './core/services/motor.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  motores: Motor[] = [];
  carregando = false;

  constructor(private readonly motorService: MotorService) {}

  ngOnInit(): void {
    this.carregarMotores();
  }

  carregarMotores(): void {
    this.carregando = true;
    this.motorService.listar().subscribe({
      next: (motores) => {
        this.motores = motores;
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
      },
    });
  }
}
