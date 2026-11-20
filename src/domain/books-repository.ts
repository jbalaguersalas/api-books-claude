import type { Book, BookData } from "./book";

export interface BooksRepository {
  findAll(): Promise<Book[]>;
  findById(id: number): Promise<Book | undefined>;
  create(data: BookData): Promise<Book>;
  replace(id: number, data: BookData): Promise<Book | undefined>;
  update(id: number, data: Partial<BookData>): Promise<Book | undefined>;
  remove(id: number): Promise<Book | undefined>;
}
