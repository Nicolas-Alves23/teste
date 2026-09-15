import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Fabricante } from '../core/models/fabricante.model';
import { Motor, MotorPayload } from '../core/models/motor.model';

const FREQUENCIAS = [50, 60];
const POLOS = [2, 4, 6, 8];

@Component({
  selector: 'app-motor-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './motor-form.component.html',
  styleUrl: './motor-form.component.css',
})
export class MotorFormComponent implements OnChanges {
  @Input() motor: Motor | null = null;
  @Input() fabricantes: Fabricante[] = [];
  @Input() salvando = false;
  @Input() erroCodigoDuplicado = false;
  @Input() errosServidor: string[] = [];

  @Output() salvar = new EventEmitter<MotorPayload>();
  @Output() cancelar = new EventEmitter<void>();

  readonly frequencias = FREQUENCIAS;
  readonly polosDisponiveis = POLOS;

  readonly form = this.fb.group({
    codigo: ['', [Validators.required, Validators.maxLength(30)]],
    modelo: ['', [Validators.required, Validators.maxLength(80)]],
    fabricante_id: [null as number | null, [Validators.required]],
    potencia_cv: [null as number | null, [Validators.required, Validators.min(0.01)]],
    tensao: ['', [Validators.required, Validators.maxLength(30)]],
    frequencia_hz: [null as number | null, [Validators.required]],
    polos: [null as number | null, [Validators.required]],
    rotacao_rpm: [null as number | null, [Validators.required, Validators.min(1)]],
    carcaca: ['', [Validators.maxLength(20)]],
    grau_protecao: ['', [Validators.maxLength(10)]],
    preco: [null as number | null, [Validators.min(0)]],
  });

  constructor(private readonly fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['motor']) {
      this.preencherFormulario(this.motor);
    }

    if (changes['erroCodigoDuplicado'] && this.erroCodigoDuplicado) {
      this.form.controls.codigo.setErrors({ duplicado: true });
    }
  }

  get editando(): boolean {
    return this.motor !== null;
  }

  private preencherFormulario(motor: Motor | null): void {
    this.form.reset({
      codigo: motor?.codigo ?? '',
      modelo: motor?.modelo ?? '',
      fabricante_id: motor?.fabricante_id ?? null,
      potencia_cv: motor?.potencia_cv ?? null,
      tensao: motor?.tensao ?? '',
      frequencia_hz: motor?.frequencia_hz ?? null,
      polos: motor?.polos ?? null,
      rotacao_rpm: motor?.rotacao_rpm ?? null,
      carcaca: motor?.carcaca ?? '',
      grau_protecao: motor?.grau_protecao ?? '',
      preco: motor?.preco ?? null,
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valor = this.form.getRawValue();
    this.salvar.emit({
      codigo: (valor.codigo ?? '').trim(),
      modelo: (valor.modelo ?? '').trim(),
      fabricante_id: valor.fabricante_id,
      potencia_cv: valor.potencia_cv,
      tensao: (valor.tensao ?? '').trim(),
      frequencia_hz: valor.frequencia_hz,
      polos: valor.polos,
      rotacao_rpm: valor.rotacao_rpm,
      carcaca: valor.carcaca ? valor.carcaca.trim() : null,
      grau_protecao: valor.grau_protecao ? valor.grau_protecao.trim() : null,
      preco: valor.preco,
    });
  }

  onCancelar(): void {
    this.cancelar.emit();
  }
}
