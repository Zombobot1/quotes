import {
  type BaseRecord,
  type FilterableField,
  isDateField,
  isNumberField,
  type Product,
  type Quote,
  type SortableField,
} from "@/api/types";
import { pb } from "./pocketbase";
import { wait } from "@/components/utils/utils";

interface SortBy {
  field: SortableField;
  direction: "asc" | "desc";
}

export interface QuoteFilter {
  field: FilterableField;
  value?: string | number;
  operator: "=" | ">=" | "<=";
}
export type QuoteFilterOperator = QuoteFilter["operator"];

export interface ListQuotesOptions {
  filters?: QuoteFilter[];
  sortBy?: SortBy[];
  pageSize?: number;
  page?: number;
}

export let pocketBaseService = {
  listQuotes: async (options: ListQuotesOptions = {}) => {
    await delayResponseInDev();
    const { requestOptions, pageSize, page } = prepareListOptions(options);
    const result = await pb
      .collection("quotes")
      .getList<Quote>(page, pageSize, requestOptions);

    return {
      items: result.items,
      page: result.page,
      perPage: result.perPage,
      totalItems: result.totalItems,
      totalPages: result.totalPages,
    };
  },
  createQuote: async (data: Omit<Quote, keyof BaseRecord>) => {
    await delayResponseInDev();
    await pb.collection("quotes").create(data);
  },
  listProducts: async () => {
    await delayResponseInDev();
    return pb.collection("products").getFullList<Product>();
  },
  patchQuote: async (id: string, data: Partial<Omit<Quote, "id">>) => {
    await delayResponseInDev();
    pb.collection("quotes").update(id, data);
  },
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function setFakePocketBaseServiceForTests(service: any) {
  pocketBaseService = service;
}

export function prepareListOptions({
  filters = [],
  sortBy = [],
  pageSize = 10,
  page = 1,
}: ListQuotesOptions = {}) {
  const filterConditions: string[] = [];

  for (const filter of filters) {
    if (
      filter.value === undefined ||
      filter.value === "" ||
      Number.isNaN(filter.value)
    )
      continue;

    if (filter.field === "status") {
      filterConditions.push(`status = "${filter.value}"`);
    } else if (isDateField(filter.field)) {
      filterConditions.push(
        `${filter.field} ${filter.operator} "${filter.value}"`
      );
    } else if (isNumberField(filter.field)) {
      filterConditions.push(
        `${filter.field} ${filter.operator} ${filter.value}`
      );
    }
  }

  const sort = sortBy
    .map(
      ({ field, direction }) => `${direction === "desc" ? "-" : "+"}${field}`
    )
    .join(",");

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const requestOptions: Record<string, any> = {};
  if (filterConditions.length > 0)
    requestOptions.filter = filterConditions.join(" && ");
  if (sort) requestOptions.sort = sort;

  return {
    requestOptions,
    pageSize,
    page,
  };
}

const useFakeDelay = import.meta.env.MODE === "development";
const delayResponseInDev = useFakeDelay
  ? () => wait(750)
  : () => Promise.resolve();
