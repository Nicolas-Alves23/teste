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
  motorEmEdicao: Motor | null = null;
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
    this.motorEmEdicao = null;
    this.mostrarFormulario = true;
  }

  abrirFormularioEdicao(motor: Motor): void {
    this.motorEmEdicao = motor;
    this.mostrarFormulario = true;
  }

  fecharFormulario(): void {
    this.mostrarFormulario = false;
    this.motorEmEdicao = null;
  }

  salvarMotor(payload: MotorPayload): void {
    this.salvando = true;

    const operacao = this.motorEmEdicao
      ? this.motorService.atualizar(this.motorEmEdicao.id, payload)
      : this.motorService.criar(payload);

    operacao.subscribe({
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
