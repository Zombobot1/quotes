import type { FC } from "react";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import type { QuoteItem, Quote } from "../../../api/types";
import { useLastNonNull } from "../../../lib/useLastNonNull";
import { Button } from "../../../components/ui/button";
import { usePatchQuoteMutation } from "./usePatchQuoteMutation";
import { Loader2 } from "lucide-react";
import { QuoteStatusBadge } from "./QuoteStatusBadge";
import { Alert } from "../../../components/ui/alert";

interface QuoteDetailsProps {
  quote?: Quote;
  close: () => void;
}

export function QuoteDetailsSheet({ quote, close }: QuoteDetailsProps) {
  const lastOpenedQuote = useLastNonNull(quote); // for sheet closing animation
  const quoteDoDisplay = quote ?? lastOpenedQuote;
  return (
    <Sheet open={!!quote} onOpenChange={close}>
      {quoteDoDisplay && <QuoteDetails quote={quoteDoDisplay} />}
    </Sheet>
  );
}

function QuoteDetails({ quote }: { quote: Quote }) {
  const patchQuoteMutation = usePatchQuoteMutation();
  const acceptQuote = () =>
    patchQuoteMutation.mutate({ id: quote.id, data: { status: "ACCEPTED" } });
  return (
    <SheetContent className="w-[90%] overflow-y-auto sm:max-w-[400px]">
      <SheetHeader>
        <SheetTitle>Quote Details</SheetTitle>
        <SheetDescription>Quote ID: {quote.id}</SheetDescription>
      </SheetHeader>
      <div className="mt-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Status</h3>
            <QuoteStatusBadge status={quote.status} />
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              Created: {formatDate(quote.created)}
            </p>
            <p className="text-sm text-muted-foreground">
              Updated: {formatDate(quote.updated)}
            </p>
          </div>
        </div>

        {/* assuming that only SENT requests could be accepted */}
        {quote.status === "SENT" && (
          <Button className="w-full" onClick={acceptQuote}>
            {patchQuoteMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accepting...
              </>
            ) : (
              "Accept"
            )}
          </Button>
        )}

        {patchQuoteMutation.isError && (
          <Alert variant="destructive">
            {patchQuoteMutation.error instanceof Error
              ? patchQuoteMutation.error.message
              : String(patchQuoteMutation.error)}
          </Alert>
        )}

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
          <pre className="bg-muted p-2 rounded-md text-sm max-w-full overflow-x-auto ">
            {formatJson(quote.customer_info)}
          </pre>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-2">Quote Items</h3>
          <div className="space-y-2">
            {quote.items.map((item, index) => (
              <QuoteItemRow key={index} item={item} />
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between">
            <p className="font-medium">Subtotal</p>
            <p>{formatCurrency(quote.subtotal)}</p>
          </div>
          <div className="flex justify-between">
            <p className="font-medium">Total Tax</p>
            <p>{formatCurrency(quote.total_tax)}</p>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <p>Total</p>
            <p>{formatCurrency(quote.total)}</p>
          </div>
        </div>

        {quote.valid_until && (
          <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-md">
            <p className="text-sm">
              Valid until: {formatDate(quote.valid_until)}
            </p>
          </div>
        )}

        {quote.description && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground">{quote.description}</p>
          </div>
        )}
      </div>
    </SheetContent>
  );
}

const QuoteItemRow: FC<{ item: QuoteItem }> = ({ item }) => (
  <div className="flex justify-between py-2">
    <div className="flex-1">
      <p className="font-medium">{item.product_name}</p>
      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
    </div>
    <div className="text-right">
      <p className="font-medium">
        {formatCurrency(item.price * item.quantity)}
      </p>
      <p className="text-sm text-muted-foreground">
        @ {formatCurrency(item.price)} each
      </p>
    </div>
  </div>
);

const formatDate = (date: string) => format(new Date(date), "PP");
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    amount
  );

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function formatJson(obj: any, indent = 2, level = 0): string {
  const spacing = " ".repeat(level * indent);
  const nextSpacing = " ".repeat((level + 1) * indent);

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const formatValue = (value: any): string => {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "string") return `${value}`;
    if (typeof value === "object") {
      if (Array.isArray(value)) {
        if (value.length === 0) return "[]";
        return `[\n${value
          .map((item) => nextSpacing + formatValue(item))
          .join(",\n")}\n${spacing}]`;
      }
      return formatJson(value, indent, level + 1);
    }
    return String(value);
  };

  const entries = Object.entries(obj);
  if (entries.length === 0) return level === 0 ? "" : "{}";

  const formattedEntries = entries
    .map(([key, value]) => `${spacing}${key}: ${formatValue(value)}`)
    .join(",\n");

  // Don't add braces for top level
  if (level === 0) {
    return formattedEntries;
  }

  return `{\n${formattedEntries}\n${spacing}}`;
}
