# API de libros con Express

Código que hicimos en clase en el bootcamp de Full Stack de The Bridge.

Es una API de un catálogo de libros hecha con Express y TypeScript. Los libros se guardan en memoria: arranca con los de `src/data/books.json` y los cambios se pierden al reiniciar.

En esta clase practicamos cómo trabajar con un agente de código en un proyecto. Antes de escribir nada, el repo ya tenía las normas del proyecto (código en inglés, ramas `feature/...`, no instalar librerías sin preguntar) y un documento de requisitos en [`docs/prd-books.md`](docs/prd-books.md) con qué tiene que hacer la API y cuándo se da por terminada. Cada funcionalidad entró por su rama y su pull request. También dejamos guardada una tarea para el agente que inventa libros de prueba con títulos absurdos, como "Croquetas asíncronas".

## Rutas

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/api/books` | Lista de libros con filtros |
| GET | `/api/books/:id` | Un libro |
| POST | `/api/books` | Crea un libro (201) |
| PUT | `/api/books/:id` | Sustituye el libro entero, con todos los campos |
| PATCH | `/api/books/:id` | Cambia solo los campos que envías (al menos uno) |
| DELETE | `/api/books/:id` | Borra el libro y lo devuelve (200) |

Un libro tiene `title`, `author`, `country`, `language`, `imageLink`, `link`, `pages` y `year`. El `id` lo pone la API.

Los filtros de `GET /api/books`:

- Texto, busca dentro del campo sin mirar mayúsculas: `?author=`, `?title=`, `?country=`, `?language=`...
- Números: `?pages=`, `?pages_gt=`, `?pages_gte=`, `?pages_lt=`, `?pages_lte=` y lo mismo con `year`.
- `?limit=10` para quedarte con los primeros.

Por ejemplo, `/api/books?country=chi&pages_gte=200&limit=5`.

Si el id no es un número entero la API contesta 400, y si el libro no existe, 404. Al crear o editar un libro con campos mal, devuelve un error por cada campo.

## Cómo arrancarlo

```bash
npm install
npm run dev        # http://localhost:3000/api/books
npm run typecheck  # comprobar tipos
```

No necesita base de datos ni `.env`.

## Qué vimos en clase

**Separar las rutas de los datos.** Las rutas no tocan el array de libros. Hablan con una interfaz, `BooksStorage`, y la clase `BooksStorageInMemory` es la que guarda los libros. Para pasar a MongoDB bastaría con escribir otra clase con los mismos métodos y cambiar una línea en las rutas.

**La diferencia entre PUT y PATCH.** PUT sustituye el libro entero y pide todos los campos. PATCH solo cambia lo que llega y valida cada campo con las mismas reglas que al crear.

**A no fiarme de lo que llega en la URL.** El id solo vale si son dígitos, así que `1.0`, `0x1` o `1e2` dan 400. Y en los filtros, `Number(" ")` daría 0, por eso los parámetros en blanco se ignoran.

## Tecnologías

- **Express 5** con TypeScript
- **tsx** para arrancar en desarrollo
