import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { LocationListComponent } from './location-list';
import { LocationFormComponent } from './location-form';
import { BookFormComponent } from '../books/book-form';
import { LocationRow, LocationsService } from '../../core/locations.service';
import { BookRow, BooksService } from '../../core/books.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';

function location(id: string, name: string, parentLocationId: string | null = null): LocationRow {
  return { id, name, parentLocationId, latitude: null, longitude: null, photoPath: null };
}

describe('Location browsing', () => {
  let locations: LocationsService;
  let books: { books: ReturnType<typeof signal<BookRow[]>>; loading: ReturnType<typeof signal<boolean>>;
    error: ReturnType<typeof signal<string | null>>; load: jasmine.Spy; categorySuggestions: jasmine.Spy; subcategorySuggestions: jasmine.Spy };
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    books = {
      books: signal([
        { id: 'b1', title: 'At home', author: 'Author', locationId: 'home', tags: [] },
        { id: 'b2', title: 'On the shelf', author: 'Author', locationId: 'shelf', tags: ['History'] },
        { id: 'b3', title: 'In the box', author: 'Author', locationId: 'box', tags: [], isbn13: '9781234567897' },
        { id: 'b4', title: 'Elsewhere', author: 'Author', locationId: 'garage', tags: [] },
      ] as unknown as BookRow[]),
      loading: signal(false), error: signal<string | null>(null), load: jasmine.createSpy().and.resolveTo(),
      categorySuggestions: jasmine.createSpy().and.resolveTo([]), subcategorySuggestions: jasmine.createSpy().and.resolveTo([]),
    };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withXhr()), provideNoopAnimations(),
        provideRouter([
          { path: 'locations', component: LocationListComponent },
          { path: 'locations/new', component: LocationFormComponent },
          { path: 'locations/:id/edit', component: LocationFormComponent },
          { path: 'locations/:id', component: LocationListComponent },
          { path: 'books/new', component: BookFormComponent },
        ]),
        { provide: BooksService, useValue: books },
        { provide: ConfirmDialogService, useValue: { confirm: jasmine.createSpy().and.resolveTo(true) } },
      ],
    });
    locations = TestBed.inject(LocationsService);
    locations.locations.set([
      location('home', 'Home'), location('shelf', 'Bookshelf', 'home'),
      location('box', 'Box', 'shelf'), location('garage', 'Garage'),
    ]);
    spyOn(locations, 'load').and.resolveTo();
    harness = await RouterTestingHarness.create();
  });

  const cardNames = (element: HTMLElement) => Array.from(element.querySelectorAll('.location-summary h3'))
    .map((card) => card.textContent!.replace('chevron_right', '').trim());

  it('shows only top-level places, with counts including nested books', async () => {
    await harness.navigateByUrl('/locations', LocationListComponent);
    expect(cardNames(harness.routeNativeElement!)).toEqual(['Garage', 'Home']);
    expect(harness.routeNativeElement!.textContent).toContain('3 books, including locations inside');
  });

  it('opens Home then its shelf using the same route component, with correct breadcrumbs', async () => {
    await harness.navigateByUrl('/locations/home', LocationListComponent);
    expect(cardNames(harness.routeNativeElement!)).toEqual(['Bookshelf']);
    expect(harness.routeNativeElement!.querySelectorAll('.book-link').length).toBe(3);
    await harness.navigateByUrl('/locations/shelf', LocationListComponent);
    expect(cardNames(harness.routeNativeElement!)).toEqual(['Box']);
    expect(harness.routeNativeElement!.querySelectorAll('.book-link').length).toBe(2);
    expect(harness.routeNativeElement!.querySelector('.breadcrumbs')!.textContent).toContain('Home');
    expect(harness.routeNativeElement!.querySelector('[aria-current="page"]')!.textContent).toContain('Bookshelf');
  });

  it('filters direct books separately and searches tags or ISBN only within the location', async () => {
    const component = await harness.navigateByUrl('/locations/home', LocationListComponent);
    component.includeChildren.set(false);
    harness.detectChanges();
    expect(harness.routeNativeElement!.querySelectorAll('.book-link').length).toBe(1);
    component.includeChildren.set(true);
    component.search.set('history');
    harness.detectChanges();
    expect(harness.routeNativeElement!.querySelector('.book-link')!.textContent).toContain('On the shelf');
    component.search.set('9781234567897');
    harness.detectChanges();
    expect(harness.routeNativeElement!.querySelector('.book-link')!.textContent).toContain('In the box');
    component.search.set('Elsewhere');
    harness.detectChanges();
    expect(harness.routeNativeElement!.querySelectorAll('.book-link').length).toBe(0);
    expect(harness.routeNativeElement!.textContent).toContain('No books match your search');
  });

  it('offers creation links with the current location already selected', async () => {
    await harness.navigateByUrl('/locations/home', LocationListComponent);
    expect(harness.routeNativeElement!.querySelector('a[href="/locations/new?parentLocationId=home"]')).not.toBeNull();
    expect(harness.routeNativeElement!.querySelector('a[href="/books/new?locationId=home"]')).not.toBeNull();
    const form = await harness.navigateByUrl('/locations/new?parentLocationId=home', LocationFormComponent);
    expect(form.parentLocationId()).toBe('home');
    const bookForm = await harness.navigateByUrl('/books/new?locationId=shelf', BookFormComponent);
    await Promise.resolve();
    expect(bookForm.locationId()).toBe('shelf');
  });

  it('returns to the parent after creating a shelf', async () => {
    const create = spyOn(locations, 'create').and.resolveTo();
    const form = await harness.navigateByUrl('/locations/new?parentLocationId=home', LocationFormComponent);
    form.name.set('New shelf');
    await form.submit();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(create.calls.mostRecent().args[0].get('parentLocationId')).toBe('home');
    expect(harness.routeNativeElement!.querySelector('h1')!.textContent).toBe('Home');
  });

  it('shows an explicit not-found state for missing or inaccessible locations', async () => {
    await harness.navigateByUrl('/locations/missing', LocationListComponent);
    expect(harness.routeNativeElement!.textContent).toContain('Location not found');
    expect(harness.routeNativeElement!.querySelector('.location-books')).toBeNull();
  });

  it('keeps folders usable when books fail and does not present false zero counts', async () => {
    books.error.set('Could not load your books.');
    await harness.navigateByUrl('/locations/home', LocationListComponent);
    expect(cardNames(harness.routeNativeElement!)).toEqual(['Bookshelf']);
    expect(harness.routeNativeElement!.textContent).toContain('Book counts are unavailable');
    expect(harness.routeNativeElement!.textContent).not.toContain('0 books');
  });

  it('reports a failed deletion without removing the location', async () => {
    spyOn(locations, 'delete').and.rejectWith(new Error('offline'));
    const component = await harness.navigateByUrl('/locations/home', LocationListComponent);
    await component.deleteLocation(locations.findById('shelf')!);
    harness.detectChanges();
    expect(harness.routeNativeElement!.textContent).toContain('Could not delete "Bookshelf"');
    expect(cardNames(harness.routeNativeElement!)).toEqual(['Bookshelf']);
    expect(component.deletingId()).toBeNull();
  });
});
