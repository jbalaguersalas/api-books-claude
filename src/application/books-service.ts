import type { Book, BookData } from "../domain/book";
import type { BooksRepository } from "../domain/books-repository";

export type Input = Record<string, unknown>;

// Error de validación: el servicio lo lanza y index.ts lo convierte en un 400
export class ValidationError extends Error {
  readonly errors?: Record<string, string>;

  constructor(message: string, errors?: Record<string, string>) {
    super(message);
    this.errors = errors;
  }
}

const TEXT_FIELDS = ["author", "country", "imageLink", "language", "link", "title"] as const;
const EDITABLE_FIELDS = [...TEXT_FIELDS, "pages", "year"] as const;

export class BooksService {
  private readonly repository: BooksRepository;

  // Inyección: el servicio recibe el repositorio, no lo crea
  constructor(repository: BooksRepository) {
    this.repository = repository;
  }

  async list(query: Input): Promise<Book[]> {
    const books = await this.repository.findAll();
    const filteredBooks = books.filter((book) => matchesAllFilters(book, query));
    return applyLimit(filteredBooks, query.limit);
  }

  getById(id: number): Promise<Book | undefined> {
    return this.repository.findById(id);
  }

  async create(body: Input): Promise<Book> {
    throwIfInvalid(validateBook(body));
    return this.repository.create(toBookData(body));
  }

  async replace(id: number, body: Input): Promise<Book | undefined> {
    if (!(await this.repository.findById(id))) return undefined; // primero el 404
    throwIfInvalid(validateBook(body));
    return this.repository.replace(id, toBookData(body));
  }

  async update(id: number, body: Input): Promise<Book | undefined> {
    if (!(await this.repository.findById(id))) return undefined; // primero el 404

    if (!EDITABLE_FIELDS.some((field) => body[field] !== undefined)) {
      throw new ValidationError(`Hay que enviar al menos un campo: ${EDITABLE_FIELDS.join(", ")}`);
    }

    throwIfInvalid(validateBook(body, { partial: true }));
    return this.repository.update(id, toPartialBookData(body));
  }

  remove(id: number): Promise<Book | undefined> {
    return this.repository.remove(id);
  }
}

function throwIfInvalid(errors: Record<string, string>): void {
  if (Object.keys(errors).length > 0) {
    throw new ValidationError("Hay campos no válidos", errors);
  }
}

function validateBook(body: Input, { partial = false } = {}): Record<string, string> {
  const errors: Record<string, string> = {};
  const shouldCheck = (field: string) => !partial || body[field] !== undefined;

  for (const field of TEXT_FIELDS) {
    if (!shouldCheck(field)) continue;
    const value = body[field];
    if (typeof value !== "string" || value.trim() === "") {
      errors[field] = "Debe ser un texto no vacío";
    }
  }

  if (shouldCheck("pages") && (!Number.isSafeInteger(body.pages) || (body.pages as number) <= 0)) {
    errors.pages = "Debe ser un número entero mayor que 0";
  }

  if (
    shouldCheck("year") &&
    (!Number.isSafeInteger(body.year) || (body.year as number) > new Date().getFullYear())
  ) {
    errors.year = "Debe ser un número entero no posterior al año actual";
  }

  return errors;
}

function toBookData(body: Input): BookData {
  return {
    author: (body.author as string).trim(),
    country: (body.country as string).trim(),
    imageLink: (body.imageLink as string).trim(),
    language: (body.language as string).trim(),
    link: (body.link as string).trim(),
    title: (body.title as string).trim(),
    pages: body.pages as number,
    year: body.year as number,
  };
}

function toPartialBookData(body: Input): Partial<BookData> {
  const data: Partial<BookData> = {};
  for (const field of TEXT_FIELDS) {
    if (body[field] !== undefined) data[field] = (body[field] as string).trim();
  }
  if (body.pages !== undefined) data.pages = body.pages as number;
  if (body.year !== undefined) data.year = body.year as number;
  return data;
}

function matchesAllFilters(book: Book, query: Input): boolean {
  return (
    matchesText(book.author, query.author) &&
    matchesText(book.country, query.country) &&
    matchesText(book.language, query.language) &&
    matchesText(book.title, query.title) &&
    matchesText(book.link, query.link) &&
    matchesText(book.imageLink, query.imageLink) &&
    matchesNumber(book.pages, query, "pages") &&
    matchesNumber(book.year, query, "year")
  );
}

function matchesText(bookValue: string, search: unknown): boolean {
  if (typeof search !== "string") return true;
  return bookValue.toLowerCase().includes(search.toLowerCase());
}

function matchesNumber(bookValue: number, query: Input, field: string): boolean {
  const equal = parseNumber(query[field]);
  const greaterThan = parseNumber(query[`${field}_gt`]);
  const greaterOrEqual = parseNumber(query[`${field}_gte`]);
  const lessThan = parseNumber(query[`${field}_lt`]);
  const lessOrEqual = parseNumber(query[`${field}_lte`]);

  if (equal !== undefined && bookValue !== equal) return false;
  if (greaterThan !== undefined && bookValue <= greaterThan) return false;
  if (greaterOrEqual !== undefined && bookValue < greaterOrEqual) return false;
  if (lessThan !== undefined && bookValue >= lessThan) return false;
  if (lessOrEqual !== undefined && bookValue > lessOrEqual) return false;
  return true;
}

function applyLimit(books: Book[], limitParam: unknown): Book[] {
  const limit = parseNumber(limitParam);
  if (limit === undefined || limit < 0) return books;
  return books.slice(0, limit);
}

function parseNumber(value: unknown): number | undefined {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}
