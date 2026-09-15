import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Motor } from './core/models/motor.model';
import { MotorService } from './core/services/motor.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  motores: Motor[] = [];
  carregando = false;
  termoBusca = '';

  private readonly busca$ = new Subject<string>();

  constructor(private readonly motorService: MotorService) {}

  ngOnInit(): void {
    this.busca$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((termo) => {
          this.carregando = true;
          return this.motorService.listar(termo);
        })
      )
      .subscribe({
        next: (motores) => {
          this.motores = motores;
          this.carregando = false;
        },
        error: () => {
          this.carregando = false;
        },
      });

    this.carregarMotores();
  }

  ngOnDestroy(): void {
    this.busca$.complete();
  }

  carregarMotores(): void {
    this.carregando = true;
    this.motorService.listar(this.termoBusca).subscribe({
      next: (motores) => {
        this.motores = motores;
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
      },
    });
  }

  onBuscar(termo: string): void {
    this.termoBusca = termo;
    this.busca$.next(termo);
  }
}
