import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.removeItem('accessToken');
  });

  afterEach(() => httpMock.verify());

  it('stores the access token and flips isAuthenticated on login', async () => {
    expect(service.isAuthenticated()).toBe(false);

    const loginPromise = service.login('a@b.com', 'password123');
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({ accessToken: 'token-abc' });

    await Promise.resolve();
    await Promise.resolve();
    const meReq = httpMock.expectOne(`${environment.apiBaseUrl}/auth/me`);
    meReq.flush({ id: 'user-1', email: 'a@b.com', role: 'user', isActive: true });
    await loginPromise;

    expect(service.token()).toBe('token-abc');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('clears the token on logout', async () => {
    localStorage.setItem('accessToken', 'token-abc');
    service = TestBed.inject(AuthService);

    service.logout();

    expect(service.token()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });
});
