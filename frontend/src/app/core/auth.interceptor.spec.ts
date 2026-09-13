import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authService: { token: () => string | null; logout: () => void };
  let navigateSpy: jasmine.Spy;

  beforeEach(() => {
    authService = { token: () => null, logout: jasmine.createSpy('logout') as unknown as () => void };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: authService },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    navigateSpy = spyOn(TestBed.inject(Router), 'navigateByUrl');
  });

  afterEach(() => httpMock.verify());

  it('logs out and redirects to /login on a 401 response', (done) => {
    httpClient.get('/api/books').subscribe({
      error: () => {
        expect(authService.logout).toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalledWith('/login');
        done();
      },
    });

    const req = httpMock.expectOne('/api/books');
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
  });

  it('does not log out or redirect on a non-401 error', (done) => {
    httpClient.get('/api/books').subscribe({
      error: () => {
        expect(authService.logout).not.toHaveBeenCalled();
        expect(navigateSpy).not.toHaveBeenCalled();
        done();
      },
    });

    const req = httpMock.expectOne('/api/books');
    req.flush({ message: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });
  });
});
