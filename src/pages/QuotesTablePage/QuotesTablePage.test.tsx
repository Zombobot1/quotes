import { expect, test, afterEach, describe } from "vitest";
import { makeSqliteFakeService } from "@/api/sqliteFakeService";
import { QuotesTablePage } from "./QuotesTablePage";
import { waitFor, screen, cleanup } from "@testing-library/react";
import { getCurrentUserInfo } from "@/api/getCurrentUserInfo";
import {
  type TestOverrides,
  mountComponent,
} from "@/components/utils/testUtils/mountComponent";
import {
  canSee,
  clickByTestId,
  click,
  pressKey,
  typeByTestId,
} from "@/components/utils/testUtils/userActions";

afterEach(cleanup);

describe("page loading states", () => {
  test("renders loading state", async () => {
    mountQuotesPage();
    expect(screen.getByTestId("loading-table"));
  });

  test("renders empty state", async () => {
    mountQuotesPage();
    await canSee("No data");
  });

  test("renders error state", async () => {
    mountQuotesPage({
      override: {
        listQuotes: () => {
          throw new Error("Cannot fetch quotes");
        },
      },
    });

    await canSee("Error");
  });
});

describe("quotes table", () => {
  test("renders quotes with details and accepts a quote", async () => {
    const fakeApiService = makeSqliteFakeService();

    await fakeApiService.createQuote({
      customer_info: getCurrentUserInfo(),
      items: [{ product_name: "Cheese", price: 10, quantity: 2, subtotal: 20 }],
      status: "SENT",
      subtotal: 20,
      total: 22,
      total_tax: 2,
    });
    mountQuotesPage({ fakeApiService });

    await canSee("Tom Smith");

    // check details
    await clickByTestId("quotes-table-row-0");
    await canSee("Cheese");

    // accept quote
    await click("Accept");
    pressKey("Escape");
    await canSee("ACCEPTED");
  });

  test("orders quotes by total", async () => {
    const fakeApiService = makeSqliteFakeService();

    await fakeApiService.createQuote({
      customer_info: getCurrentUserInfo(),
      items: [{ product_name: "Cheese", price: 10, quantity: 2, subtotal: 20 }],
      status: "SENT",
      subtotal: 20,
      total: 22,
      total_tax: 2,
    });
    await fakeApiService.createQuote({
      customer_info: getCurrentUserInfo(),
      items: [{ product_name: "Cheese", price: 10, quantity: 2, subtotal: 20 }],
      status: "SENT",
      subtotal: 20,
      total: 21,
      total_tax: 1,
    });

    mountQuotesPage({ fakeApiService });

    await canSee("$21");

    expect(screen.getByTestId("quotes-table-row-0").textContent).toContain(
      "$22"
    );

    await clickByTestId("total-quotes-table-header");

    await waitFor(() => {
      expect(screen.getByTestId("quotes-table-row-0").textContent).toContain(
        "$21"
      );
    });
  });

  test("filters quotes by several criteria and clears filters", async () => {
    const fakeApiService = makeSqliteFakeService();

    await fakeApiService.createQuote({
      customer_info: getCurrentUserInfo(),
      items: [{ product_name: "Cheese", price: 10, quantity: 2, subtotal: 20 }],
      status: "ACCEPTED",
      subtotal: 20,
      total: 22,
      total_tax: 2,
    });
    await fakeApiService.createQuote({
      customer_info: getCurrentUserInfo(),
      items: [{ product_name: "Cheese", price: 10, quantity: 2, subtotal: 20 }],
      status: "SENT",
      subtotal: 20,
      total: 21,
      total_tax: 1,
    });

    mountQuotesPage({ fakeApiService });

    await canSee("SENT"); // initial rows are visible
    await canSee("ACCEPTED");

    await click("Filter");

    await click("Add Filter");
    await clickByTestId("field-0");
    await clickByTestId("status-field");
    await clickByTestId("select-status-value");
    await clickByTestId("status-value-accepted");

    await waitFor(async () => {
      const table = screen.getByTestId("quotes-table");
      expect(table.textContent?.includes("SENT")).toBe(false);
    });

    await click("Add Filter");
    await clickByTestId("field-1");
    await clickByTestId("total-field");
    await typeByTestId("value-1", "23"); // by default it's >=

    // now table should be empty
    await canSee("No data");

    await click("Clear all");

    await canSee("SENT");
    await canSee("ACCEPTED");
  });
});

describe("quote creation", () => {
  test("creates a new quote", async () => {
    mountQuotesPage();

    await click("Add quote");

    await typeByTestId("product-quantity-0", "1");
    await click("Create Quote");

    await canSee("SENT");
  });

  test("cannot create a quote without products", async () => {
    mountQuotesPage();

    await click("Add quote");
    await click("Create Quote");

    await canSee("Please select at least one product and try again!");
  });
});

const mountQuotesPage = (overrides?: TestOverrides) =>
  mountComponent(<QuotesTablePage />, overrides);
