import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BooksService } from './books.service';
import { environment } from '../../environments/environment';

describe('BooksService', () => {
  let service: BooksService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(BooksService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads books with their ranking into the books signal', async () => {
    const loadPromise = service.load();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/books`);
    req.flush([{ id: 'book-1', title: 'Dune', ranking: { categoryRank: 1, categoryTotal: 1, overallRank: 1, overallTotal: 1 } }]);
    await loadPromise;

    expect(service.books()[0].title).toBe('Dune');
    expect(service.books()[0].ranking?.categoryRank).toBe(1);
  });

  it('posts form data to create a book and reloads the list', async () => {
    const formData = new FormData();
    formData.append('title', 'Dune');
    formData.append('author', 'Herbert');

    const createPromise = service.create(formData);
    const createReq = httpMock.expectOne(`${environment.apiBaseUrl}/books`);
    expect(createReq.request.method).toBe('POST');
    createReq.flush({ id: 'book-1', title: 'Dune' });
    await Promise.resolve();
    await Promise.resolve();
    const reloadReq = httpMock.expectOne(`${environment.apiBaseUrl}/books`);
    reloadReq.flush([{ id: 'book-1', title: 'Dune', ranking: null }]);
    await createPromise;

    expect(service.books().length).toBe(1);
  });
});
