import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  getProductsWithPositiveQuantities,
  useListProductsQueryWithQuantity,
  useSetQuantityOnListProductQuery,
} from "./useListProductsQuery";
import type { ProductWithQuantity } from "../../../api/types";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  calculateTotals,
  useCreateQuoteMutation,
} from "./useCreateQuoteMutation";
import { SuspendedRender } from "../../../components/utils/Suspended/SuspendedRender";
import { LoadingTableSkeleton } from "../../../components/utils/LoadingTableSkeleton";
import { useQueryClient } from "@tanstack/react-query";

interface CreateQuoteDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function CreateQuoteDialog({ open, setOpen }: CreateQuoteDialogProps) {
  const queryClient = useQueryClient();
  const [description, setDescription] = useState("");
  const { setQuantity, unsetAllQuantities } =
    useSetQuantityOnListProductQuery();

  const createQuoteMutation = useCreateQuoteMutation({
    onSuccess: () => {
      setOpen(false);
      unsetAllQuantities();
      setDescription("");
    },
  });

  const createQuote = () =>
    createQuoteMutation.mutate({
      description,
      products: getProductsWithPositiveQuantities(queryClient),
    });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl overflow-y-auto max-h-[95svh]">
        <DialogHeader>
          <DialogTitle>Create New Quote</DialogTitle>
        </DialogHeader>
        <SuspendedRender fallback={<LoadingTableSkeleton cols={3} rows={7} />}>
          {() => {
            const { totals, table } = useQuoteCreationState(setQuantity);
            if (!table.getCoreRowModel().rows.length)
              return (
                <Alert variant="destructive">
                  No products found. You cannot create a quote
                </Alert>
              );

            return (
              <>
                <div className="flex flex-col gap-2 mt-4">
                  <Input
                    placeholder="Search products..."
                    value={table.getState().globalFilter}
                    onChange={(e) => {
                      table.setState((old) => ({
                        ...old,
                        globalFilter: e.target.value,
                      }));
                    }}
                    className="max-w-sm"
                  />
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id}>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      Page {table.getState().pagination.pageIndex + 1} of{" "}
                      {table.getPageCount()}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter quote description..."
                  />
                </div>

                <div className="space-y-2 text-right">
                  <div>Subtotal: ${totals.subtotal.toFixed(2)}</div>
                  <div>Tax (10%): ${totals.total_tax.toFixed(2)}</div>
                  <div className="font-bold">
                    Total: ${totals.total.toFixed(2)}
                  </div>
                </div>
              </>
            );
          }}
        </SuspendedRender>

        {createQuoteMutation.isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4 text-destructive-foreground" />
            <AlertTitle className="text-destructive-foreground">
              Error
            </AlertTitle>
            <AlertDescription className="text-destructive-foreground">
              {createQuoteMutation.error instanceof Error
                ? createQuoteMutation.error.message
                : "An error occurred"}
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <div className="w-full flex justify-between">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={createQuote}
              disabled={createQuoteMutation.isPending}
            >
              {createQuoteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Quote"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// since we are using a render function we should extract the state logic into a custom hook.
// In a regular component we would declare this in component function body
function useQuoteCreationState(
  setQuantity: (id: string, value: number) => void
) {
  const { data: products } = useListProductsQueryWithQuantity();
  const selectedProducts = products.filter((p) => p.quantity > 0);
  const totals = calculateTotals(selectedProducts);
  const table = useReactTable({
    data: products,
    ...useProductTableProps(setQuantity),
  });
  return { totals, table };
}

type Result = Omit<
  Parameters<typeof useReactTable<ProductWithQuantity>>[0],
  "data"
>;
function useProductTableProps(
  setQuantity: (id: string, value: number) => void
): Result {
  const columns: ColumnDef<ProductWithQuantity>[] = [
    {
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-4"
          onClick={() => column.toggleSorting()}
        >
          Product
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      accessorKey: "title",
    },
    {
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-4"
          onClick={() => column.toggleSorting()}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      accessorKey: "price",
      cell: ({ row }) => `$${(row.getValue("price") as number).toFixed(2)}`,
    },
    {
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-4"
          onClick={() => column.toggleSorting()}
        >
          Quantity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      accessorKey: "quantity",
      cell: ({ row }) => (
        <Input
          type="number"
          min="0"
          className="w-20"
          value={row.original.quantity}
          onChange={(e) => setQuantity(row.original.id, +e.target.value)}
          data-testid={`product-quantity-${row.index}`}
        />
      ),
    },
  ];

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const fuzzyFilter = (row: any, columnId: string, value: string) => {
    const searchValue = value.toLowerCase();
    const cellValue = String(row.getValue(columnId)).toLowerCase();
    return cellValue.includes(searchValue);
  };

  return {
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: fuzzyFilter,
    initialState: {
      pagination: {
        pageSize: 6,
      },
    },
  };
}
