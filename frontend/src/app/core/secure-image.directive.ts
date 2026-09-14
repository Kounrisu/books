import { Directive, ElementRef, Input, OnChanges, OnDestroy, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/**
 * Uploaded media is served from an authenticated endpoint (private, per-user
 * ownership check), not a public static folder — so a plain `<img src>`
 * can't reach it (the browser won't attach our bearer token to that
 * request). This directive fetches the image through HttpClient (which the
 * auth interceptor does attach the token to) and points the element at the
 * resulting object URL instead.
 */
@Directive({
  selector: 'img[appSecureSrc]',
  standalone: true,
})
export class SecureImageDirective implements OnChanges, OnDestroy {
  @Input('appSecureSrc') src: string | null | undefined;

  private readonly http = inject(HttpClient);
  private readonly el = inject(ElementRef<HTMLImageElement>);
  private objectUrl: string | null = null;

  ngOnChanges(): void {
    this.revoke();
    if (!this.src) {
      this.el.nativeElement.removeAttribute('src');
      return;
    }
    const requested = this.src;
    this.http.get(requested, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        if (this.src !== requested) return;
        this.objectUrl = URL.createObjectURL(blob);
        this.el.nativeElement.src = this.objectUrl;
      },
      error: () => {
        if (this.src !== requested) return;
        this.el.nativeElement.removeAttribute('src');
      },
    });
  }

  ngOnDestroy(): void {
    this.revoke();
  }

  private revoke(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }
}
