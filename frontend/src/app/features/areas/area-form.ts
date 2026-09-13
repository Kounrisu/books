import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AreasService } from '../../core/areas.service';

const KIND_OPTIONS = ['genre', 'media_type', 'subject', 'learning_project', 'research_project', 'custom'];
const STATUS_OPTIONS = ['planned', 'active', 'paused', 'completed', 'reference'];

@Component({
  selector: 'app-area-form',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './area-form.html',
  styleUrl: './area-form.scss',
})
export class AreaFormComponent implements OnInit {
  private readonly areasService = inject(AreasService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly areaId = signal<string | null>(null);
  protected readonly kindOptions = KIND_OPTIONS;
  protected readonly statusOptions = STATUS_OPTIONS;

  readonly title = signal('');
  readonly kind = signal('genre');
  readonly description = signal('');
  readonly objectives = signal('');
  readonly notes = signal('');
  readonly status = signal('active');
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }
    this.areaId.set(id);
    if (this.areasService.areas().length === 0) {
      await this.areasService.load();
    }
    const area = this.areasService.findById(id);
    if (!area) {
      this.error.set('This area could not be found.');
      return;
    }
    this.title.set(area.title);
    this.kind.set(area.kind);
    this.description.set(area.description ?? '');
    this.objectives.set(area.objectives ?? '');
    this.notes.set(area.notes ?? '');
    this.status.set(area.status);
  }

  protected isEditing(): boolean {
    return this.areaId() !== null;
  }

  async submit(): Promise<void> {
    this.error.set(null);
    this.submitting.set(true);
    try {
      const input = {
        title: this.title(),
        kind: this.kind(),
        description: this.description() || undefined,
        objectives: this.objectives() || undefined,
        notes: this.notes() || undefined,
        status: this.status(),
      };
      const id = this.areaId();
      if (id) {
        await this.areasService.update(id, input);
        this.router.navigateByUrl(`/areas/${id}`);
      } else {
        await this.areasService.create(input);
        this.router.navigateByUrl('/areas');
      }
    } catch {
      this.error.set('Could not save this area. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }
}
