import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LocationsService } from './locations.service';
import { environment } from '../../environments/environment';

describe('LocationsService', () => {
  let service: LocationsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(LocationsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads locations into the locations signal', async () => {
    const loadPromise = service.load();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/locations`);
    req.flush([{ id: 'loc-1', name: 'Garage' }]);
    await loadPromise;

    expect(service.locations()).toEqual([{ id: 'loc-1', name: 'Garage' }] as any);
  });

  it('posts form data to create a location and reloads the list', async () => {
    const formData = new FormData();
    formData.append('name', 'Garage');

    const createPromise = service.create(formData);
    const createReq = httpMock.expectOne(`${environment.apiBaseUrl}/locations`);
    expect(createReq.request.method).toBe('POST');
    createReq.flush({ id: 'loc-1', name: 'Garage' });
    await Promise.resolve();
    await Promise.resolve();
    const reloadReq = httpMock.expectOne(`${environment.apiBaseUrl}/locations`);
    reloadReq.flush([{ id: 'loc-1', name: 'Garage' }]);
    await createPromise;

    expect(service.locations()).toEqual([{ id: 'loc-1', name: 'Garage' }] as any);
  });
});
