import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Fabricante } from './core/models/fabricante.model';
import { Motor, MotorPayload } from './core/models/motor.model';
import { FabricanteService } from './core/services/fabricante.service';
import { MotorService } from './core/services/motor.service';
import { MotorFormComponent } from './motores/motor-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MotorFormComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  motores: Motor[] = [];
  fabricantes: Fabricante[] = [];
  carregando = false;
  termoBusca = '';

  mostrarFormulario = false;
  salvando = false;

  private readonly busca$ = new Subject<string>();

  constructor(
    private readonly motorService: MotorService,
    private readonly fabricanteService: FabricanteService
  ) {}

  ngOnInit(): void {
    this.fabricanteService.listar().subscribe({
      next: (fabricantes) => (this.fabricantes = fabricantes),
    });

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

  abrirFormularioNovo(): void {
    this.mostrarFormulario = true;
  }

  fecharFormulario(): void {
    this.mostrarFormulario = false;
  }

  salvarMotor(payload: MotorPayload): void {
    this.salvando = true;

    this.motorService.criar(payload).subscribe({
      next: () => {
        this.salvando = false;
        this.fecharFormulario();
        this.carregarMotores();
      },
      error: () => {
        this.salvando = false;
      },
    });
  }
}
