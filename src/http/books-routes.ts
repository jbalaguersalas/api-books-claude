import { Router } from "express";
import type { Response } from "express";
import type { BooksService } from "../application/books-service";

// Inyección: las rutas reciben el servicio, no lo crean
export function createBooksRouter(service: BooksService): Router {
  const router = Router();

  router.get("/", async (req, res) => {
    res.json(await service.list(req.query));
  });

  router.get("/:id", async (req, res) => {
    const id = parseId(req.params.id);
    if (id === undefined) return sendInvalidId(res);

    const book = await service.getById(id);
    if (!book) return sendNotFound(res, id);

    res.json(book);
  });

  router.post("/", async (req, res) => {
    const newBook = await service.create(req.body ?? {});
    res.status(201).json(newBook);
  });

  router.put("/:id", async (req, res) => {
    const id = parseId(req.params.id);
    if (id === undefined) return sendInvalidId(res);

    const book = await service.replace(id, req.body ?? {});
    if (!book) return sendNotFound(res, id);

    res.json(book);
  });

  router.patch("/:id", async (req, res) => {
    const id = parseId(req.params.id);
    if (id === undefined) return sendInvalidId(res);

    const book = await service.update(id, req.body ?? {});
    if (!book) return sendNotFound(res, id);

    res.json(book);
  });

  router.delete("/:id", async (req, res) => {
    const id = parseId(req.params.id);
    if (id === undefined) return sendInvalidId(res);

    const book = await service.remove(id);
    if (!book) return sendNotFound(res, id);

    res.json(book);
  });

  return router;
}

function sendInvalidId(res: Response): void {
  res.status(400).json({ error: "El id debe ser un número entero" });
}

function sendNotFound(res: Response, id: number): void {
  res.status(404).json({ error: `No existe ningún libro con id ${id}` });
}

// Solo acepta dígitos: rechaza "abc", "1.5", "-1"...
function parseId(raw: string): number | undefined {
  return /^\d+$/.test(raw) ? Number(raw) : undefined;
}
