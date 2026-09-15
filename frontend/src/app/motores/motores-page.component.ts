import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ApiErrorResponse } from '../core/models/api-error.model';
import { Fabricante } from '../core/models/fabricante.model';
import { Motor, MotorPayload } from '../core/models/motor.model';
import { FabricanteService } from '../core/services/fabricante.service';
import { MotorService } from '../core/services/motor.service';
import { MotorFormComponent } from './motor-form.component';

@Component({
  selector: 'app-motores-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MotorFormComponent],
  templateUrl: './motores-page.component.html',
  styleUrl: './motores-page.component.css',
})
export class MotoresPageComponent implements OnInit, OnDestroy {
  motores: Motor[] = [];
  fabricantes: Fabricante[] = [];

  carregando = false;
  termoBusca = '';

  mostrarFormulario = false;
  motorEmEdicao: Motor | null = null;
  salvando = false;
  erroCodigoDuplicado = false;
  errosServidor: string[] = [];

  motorParaExcluir: Motor | null = null;
  excluindo = false;

  mensagemSucesso: string | null = null;
  mensagemErroGeral: string | null = null;

  private readonly busca$ = new Subject<string>();

  constructor(
    private readonly motorService: MotorService,
    private readonly fabricanteService: FabricanteService
  ) {}

  ngOnInit(): void {
    this.fabricanteService.listar().subscribe({
      next: (fabricantes) => (this.fabricantes = fabricantes),
      error: () => (this.mensagemErroGeral = 'Não foi possível carregar os fabricantes.'),
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
          this.mensagemErroGeral = 'Não foi possível carregar os motores.';
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
        this.mensagemErroGeral = 'Não foi possível carregar os motores.';
      },
    });
  }

  onBuscar(termo: string): void {
    this.termoBusca = termo;
    this.busca$.next(termo);
  }

  abrirFormularioNovo(): void {
    this.motorEmEdicao = null;
    this.erroCodigoDuplicado = false;
    this.errosServidor = [];
    this.mostrarFormulario = true;
  }

  abrirFormularioEdicao(motor: Motor): void {
    this.motorEmEdicao = motor;
    this.erroCodigoDuplicado = false;
    this.errosServidor = [];
    this.mostrarFormulario = true;
  }

  fecharFormulario(): void {
    this.mostrarFormulario = false;
    this.motorEmEdicao = null;
    this.erroCodigoDuplicado = false;
    this.errosServidor = [];
  }

  salvarMotor(payload: MotorPayload): void {
    this.salvando = true;
    this.erroCodigoDuplicado = false;
    this.errosServidor = [];

    const operacao = this.motorEmEdicao
      ? this.motorService.atualizar(this.motorEmEdicao.id, payload)
      : this.motorService.criar(payload);

    operacao.subscribe({
      next: () => {
        this.salvando = false;
        this.mensagemSucesso = this.motorEmEdicao
          ? 'Motor atualizado com sucesso.'
          : 'Motor cadastrado com sucesso.';
        this.fecharFormulario();
        this.carregarMotores();
        this.ocultarMensagemSucesso();
      },
      error: (err: HttpErrorResponse) => {
        this.salvando = false;
        this.tratarErroSalvar(err);
      },
    });
  }

  private tratarErroSalvar(err: HttpErrorResponse): void {
    const corpo = err.error as ApiErrorResponse | undefined;

    if (err.status === 409) {
      this.erroCodigoDuplicado = true;
      return;
    }

    if (err.status === 400 && corpo?.details) {
      this.errosServidor = corpo.details;
      return;
    }

    this.errosServidor = [corpo?.error ?? 'Erro inesperado ao salvar o motor.'];
  }

  pedirConfirmacaoExclusao(motor: Motor): void {
    this.motorParaExcluir = motor;
  }

  cancelarExclusao(): void {
    this.motorParaExcluir = null;
  }

  confirmarExclusao(): void {
    if (!this.motorParaExcluir) return;

    this.excluindo = true;
    const id = this.motorParaExcluir.id;

    this.motorService.excluir(id).subscribe({
      next: () => {
        this.excluindo = false;
        this.motorParaExcluir = null;
        this.mensagemSucesso = 'Motor excluído com sucesso.';
        this.carregarMotores();
        this.ocultarMensagemSucesso();
      },
      error: () => {
        this.excluindo = false;
        this.motorParaExcluir = null;
        this.mensagemErroGeral = 'Não foi possível excluir o motor.';
      },
    });
  }

  private ocultarMensagemSucesso(): void {
    setTimeout(() => (this.mensagemSucesso = null), 3000);
  }
}
