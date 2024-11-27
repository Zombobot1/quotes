import { useListQuotes } from "./useListQuotes";
import { useState } from "react";
import { QuotesTable } from "./QuotesTable";
import { QuotesFilterPopover } from "./QuotesFilter";
import { Button } from "../../components/ui/button";
import { CirclePlus, Loader2 } from "lucide-react";
import { QuoteDetailsSheet } from "./QuoteDetailsSheet/QuoteDetailsSheet";
import { CreateQuoteDialog } from "./CreateQuoteDialog/CreateQuoteDialog";
import { LoadingTableSkeleton } from "../../components/utils/LoadingTableSkeleton";
import { SuspendedQuery } from "../../components/utils/Suspended/SuspendedQuery";
import type { ListQuotesOptions } from "../../api/pocketBaseService";
import { useDebounce } from "@/components/utils/hooks/useDebounce";
import { deepEqual } from "fast-equals";

export function QuotesTablePage() {
  const [options, setOptions] = useState<ListQuotesOptions>({});
  const debouncedOptions = useDebounce(options);
  const [openedQuoteId, setOpenedQuoteId] = useState("");

  const [createQuoteDialogIsOpen, setCreateQuoteDialogIsOpen] = useState(false);

  const quotesQuery = useListQuotes(debouncedOptions);

  const openedQuote = openedQuoteId
    ? quotesQuery.data?.items.find((quote) => quote.id === openedQuoteId)
    : undefined;

  const isRefetching = quotesQuery.isFetching && !quotesQuery.isLoading;
  const isRefetchingPlanned = !deepEqual(options, debouncedOptions);
  const isFetching = isRefetching || isRefetchingPlanned;

  return (
    <div className="container mx-auto p-4 md:p-10">
      <h1 className="text-2xl font-bold mb-5">
        Quotes{" "}
        {isFetching ? <Loader2 className="inline h-6 w-6 animate-spin" /> : ""}
      </h1>
      <SuspendedQuery query={quotesQuery} fallback={<LoadingTableSkeleton />}>
        {(quotesData) => {
          return (
            <>
              <div className="flex justify-between mb-2 md:mb-4">
                <QuotesFilterPopover
                  options={options}
                  onOptionsChange={setOptions}
                />
                <Button onClick={() => setCreateQuoteDialogIsOpen(true)}>
                  <CirclePlus />
                  Add quote
                </Button>
              </div>
              <QuotesTable
                quotesData={{
                  quotes: quotesData.items,
                  totalPages: quotesData.totalPages,
                }}
                options={options}
                onOptionsChange={setOptions}
                open={setOpenedQuoteId}
              />
              <QuoteDetailsSheet
                quote={openedQuote}
                close={() => setOpenedQuoteId("")}
              />
              <CreateQuoteDialog
                open={createQuoteDialogIsOpen}
                setOpen={setCreateQuoteDialogIsOpen}
              />
            </>
          );
        }}
      </SuspendedQuery>
    </div>
  );
}
