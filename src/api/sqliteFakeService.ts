import init, { type Database } from "@sqlite.org/sqlite-wasm";
import type { Quote, Product, SortableField, BaseRecord } from "./types";
import type { ListQuotesOptions, QuoteFilter } from "./pocketBaseService";

const sqlite3 = await init();

export function makeSqliteFakeService() {
  const db = new sqlite3.oo1.DB(":memory:");
  initTables(db);

  initializeProducts(
    [
      {
        id: "cheese",
        title: "Premium Cheese",
        description: "Delicious cheese for special occasions",
        price: 299.99,
        in_stock: true,
        attributes: {
          color: "yellow",
          weight: "2.5kg",
          dimensions: "30x20x10cm",
        },
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      },
      {
        id: "wine",
        title: "Red Wine",
        description: "Affordable wine for everyday use",
        price: 49.99,
        in_stock: true,
        attributes: {
          color: "red",
        },
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      },
    ],
    db
  );

  return {
    listQuotes: async (options?: ListQuotesOptions) => {
      const quotes: Quote[] = [];

      const where = buildWhereClause(options?.filters);
      const orderBy = buildOrderByClause(options?.sortBy);

      let query = "SELECT * FROM quotes";
      if (where) {
        query += ` ${where}`;
      }
      if (orderBy) {
        query += ` ${orderBy}`;
      }

      db.exec({
        sql: query,
        rowMode: "object",
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        callback: (row: any) => {
          quotes.push({
            ...row,
            customer_info: JSON.parse(row.customer_info),
            items: JSON.parse(row.items),
          });
        },
      });

      return {
        items: quotes,
        page: 1,
        perPage: quotes.length,
        totalItems: quotes.length,
        totalPages: 1,
      };
    },

    createQuote: async (data: Omit<Quote, keyof BaseRecord>) => {
      const now = new Date().toISOString();
      const id = generateId();

      const quote: Quote = {
        ...data,
        id,
        created: now,
        updated: now,
      };

      db.exec(`
      INSERT INTO quotes (
        id, created, updated, customer_info, status,
        items, subtotal, total_tax, total, valid_until, description
      ) VALUES (
        '${quote.id}',
        '${quote.created}',
        '${quote.updated}',
        '${JSON.stringify(quote.customer_info).replace(/'/g, "''")}',
        '${quote.status}',
        '${JSON.stringify(quote.items).replace(/'/g, "''")}',
        ${quote.subtotal},
        ${quote.total_tax},
        ${quote.total},
        ${quote.valid_until ? `'${quote.valid_until}'` : "NULL"},
        ${
          quote.description
            ? `'${quote.description.replace(/'/g, "''")}'`
            : "NULL"
        }
      )
    `);
    },

    listProducts: async () => {
      const products: Product[] = [];

      db.exec({
        sql: "SELECT * FROM products",
        rowMode: "object",
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        callback: (row: any) => {
          products.push({
            ...row,
            in_stock: Boolean(row.in_stock),
            attributes: row.attributes ? JSON.parse(row.attributes) : undefined,
          });
        },
      });

      return products;
    },

    patchQuote: async (id: string, data: Partial<Omit<Quote, "id">>) => {
      const quotes: Quote[] = [];

      db.exec({
        sql: `SELECT * FROM quotes WHERE id = '${id}'`,
        rowMode: "object",
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        callback: (row: any) => {
          quotes.push({
            ...row,
            customer_info: JSON.parse(row.customer_info),
            items: JSON.parse(row.items),
          });
        },
      });

      if (!quotes.length) {
        throw new Error(`Quote with id ${id} not found`);
      }

      const updated: Quote = {
        ...quotes[0],
        ...data,
        updated: new Date().toISOString(),
      };

      db.exec(`
      UPDATE quotes SET
        updated = '${updated.updated}',
        customer_info = '${JSON.stringify(updated.customer_info).replace(
          /'/g,
          "''"
        )}',
        status = '${updated.status}',
        items = '${JSON.stringify(updated.items).replace(/'/g, "''")}',
        subtotal = ${updated.subtotal},
        total_tax = ${updated.total_tax},
        total = ${updated.total},
        valid_until = ${
          updated.valid_until ? `'${updated.valid_until}'` : "NULL"
        },
        description = ${
          updated.description
            ? `'${updated.description.replace(/'/g, "''")}'`
            : "NULL"
        }
      WHERE id = '${id}'
    `);
    },
  };
}

function initTables(db: Database) {
  db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        created TEXT NOT NULL,
        updated TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        in_stock INTEGER DEFAULT 1,
        attributes TEXT
      );

      CREATE TABLE IF NOT EXISTS quotes (
        id TEXT PRIMARY KEY,
        created TEXT NOT NULL,
        updated TEXT NOT NULL,
        customer_info TEXT NOT NULL,
        status TEXT NOT NULL,
        items TEXT NOT NULL,
        subtotal REAL NOT NULL,
        total_tax REAL NOT NULL,
        total REAL NOT NULL,
        valid_until TEXT,
        description TEXT,
        CONSTRAINT status_check CHECK (
          status IN ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED')
        )
      );
    `);
}

function initializeProducts(products: Product[], db: Database) {
  const now = new Date().toISOString();
  const values = products
    .map(
      (product) => `(
    '${product.id}',
    '${now}',
    '${now}',
    '${product.title.replace(/'/g, "''")}',
    ${
      product.description
        ? `'${product.description.replace(/'/g, "''")}'`
        : "NULL"
    },
    ${product.price},
    ${product.in_stock ? 1 : 0},
    ${
      product.attributes
        ? `'${JSON.stringify(product.attributes).replace(/'/g, "''")}'`
        : "NULL"
    }
  )`
    )
    .join(",\n");

  if (values) {
    db.exec(`
      INSERT INTO products (
        id, created, updated, title, description, price, in_stock, attributes
      ) VALUES ${values};
    `);
  }
}

function buildWhereClause(filters?: QuoteFilter[]): string {
  if (!filters?.length) return "";

  const conditions = filters.map((filter) => {
    const value =
      typeof filter.value === "string" ? `'${filter.value}'` : filter.value;

    if (["created", "updated", "valid_until"].includes(filter.field)) {
      return `datetime(${filter.field}) ${filter.operator} datetime('${value}')`;
    }
    return `${filter.field} ${filter.operator} ${value}`;
  });

  return `WHERE ${conditions.join(" AND ")}`;
}

function buildOrderByClause(
  sortBy?: { field: SortableField; direction: "asc" | "desc" }[]
): string {
  if (!sortBy?.length) return "";

  const orderClauses = sortBy.map((sort) => {
    if (["created", "updated", "valid_until"].includes(sort.field)) {
      return `datetime(${sort.field}) ${sort.direction}`;
    }
    return `${sort.field} ${sort.direction}`;
  });

  return `ORDER BY ${orderClauses.join(", ")}`;
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
