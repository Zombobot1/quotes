import { useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Database,
} from "lucide-react";
import type { Quote, SortableField } from "../../api/types";
import type { SetState } from "../../lib/types";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { QuoteStatusBadge } from "./QuoteDetailsSheet/QuoteStatusBadge";
import { getRelativeTime } from "../../lib/getRelativeTime";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import type { ListQuotesOptions } from "../../api/pocketBaseService";
import { useVirtualizer } from "@tanstack/react-virtual";

interface QuotesTableProps {
  quotesData: { quotes: Quote[]; totalPages: number };
  options: ListQuotesOptions;
  onOptionsChange: SetState<ListQuotesOptions>;
  open: (id: string) => void;
}

export function QuotesTable({
  quotesData,
  options,
  onOptionsChange,
  open,
}: QuotesTableProps) {
  const columns: ColumnDef<Quote>[] = [
    {
      accessorKey: "customer_info.name",
      // should match button styles for virtualized table
      header: () => (
        <p className="text-sm font-medium h-[40px] flex items-center px-4 leading-none">
          Customer
        </p>
      ),
    },
    {
      accessorKey: "status",
      header: () => (
        <Button
          variant="ghost"
          onClick={(e) => toggleSort("status", e.shiftKey)}
          className="flex items-center gap-2"
        >
          Status
          {renderSortIcon("status")}
        </Button>
      ),
      cell: ({ row }) => <QuoteStatusBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "created",
      header: () => (
        <Button
          variant="ghost"
          onClick={(e) => toggleSort("created", e.shiftKey)}
          className="flex items-center gap-2"
        >
          Created
          {renderSortIcon("created")}
        </Button>
      ),
      cell: ({ row }) => getRelativeTime(row.getValue("created")),
    },
    {
      accessorKey: "total",
      header: () => (
        <Button
          variant="ghost"
          onClick={(e) => toggleSort("total", e.shiftKey)}
          className="flex items-center gap-2"
          data-testid="total-quotes-table-header"
        >
          Total
          {renderSortIcon("total")}
        </Button>
      ),
      cell: ({ row }) => `$${Math.round(row.getValue("total"))}`,
    },
    {
      accessorKey: "subtotal",
      header: () => (
        <Button
          variant="ghost"
          onClick={(e) => toggleSort("subtotal", e.shiftKey)}
          className="flex items-center gap-2"
        >
          Subtotal
          {renderSortIcon("subtotal")}
        </Button>
      ),
      cell: ({ row }) => `$${Math.round(row.getValue("subtotal"))}`,
    },
    {
      accessorKey: "total_tax",
      header: () => (
        <Button
          variant="ghost"
          onClick={(e) => toggleSort("total_tax", e.shiftKey)}
          className="flex items-center gap-2"
        >
          Total Tax
          {renderSortIcon("total_tax")}
        </Button>
      ),
      cell: ({ row }) => `$${Math.round(row.getValue("total_tax"))}`,
    },
    {
      accessorKey: "valid_until",
      header: () => (
        <Button
          variant="ghost"
          onClick={(e) => toggleSort("valid_until", e.shiftKey)}
          className="flex items-center gap-2"
        >
          Valid Until
          {renderSortIcon("valid_until")}
        </Button>
      ),
      cell: ({ row }) =>
        row.getValue("valid_until")
          ? new Date(row.getValue("valid_until")).toLocaleDateString()
          : "N/A",
    },
  ];

  const table = useReactTable({
    data: quotesData.quotes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    manualFiltering: true,
  });

  const { toggleSort, renderSortIcon } = useSortableMethods({
    onOptionsChange,
    options,
  });

  const empty = !table.getRowModel().rows.length;
  if (empty)
    return (
      <EmptyPlaceholder
        title="No data"
        description="No quotes found. Add a new one!"
      />
    );

  // render pagination on top for better UX of virtualized table on mobile
  const pagination = (
    <QuotesTablePagination
      pageSize={options.pageSize}
      page={options.page}
      totalPages={quotesData.totalPages}
      onOptionsChange={onOptionsChange}
    />
  );
  const virtualize = quotesData.quotes.length > 50;

  return (
    <>
      {virtualize && pagination}
      {virtualize ? (
        <VirtualizedTable table={table} openDetails={open} />
      ) : (
        <RegularTable table={table} openDetails={open} />
      )}
      {!virtualize && pagination}
    </>
  );
}

type TableState = ReturnType<typeof useReactTable<Quote>>;
interface TableData {
  table: TableState;
  openDetails: (id: string) => void;
}

function RegularTable({ table, openDetails }: TableData) {
  return (
    <Table data-testid="quotes-table">
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
          <TableRow
            key={row.id}
            onClick={() => openDetails(row.original.id)}
            data-testid={`quotes-table-row-${row.index}`}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function VirtualizedTable({ table, openDetails }: TableData) {
  const ref = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    estimateSize: () => 55,
    getScrollElement: () => ref.current,
    overscan: 5,
  });

  return (
    <div ref={ref} className="overflow-auto relative h-[600px]">
      <table className="grid">
        <thead className="bg-background grid sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="flex w-full">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="flex-1">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody
          className="grid relative"
          style={{ height: rowVirtualizer.getTotalSize() }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = table.getRowModel().rows[virtualRow.index];
            return (
              <tr
                data-index={virtualRow.index}
                key={row.id}
                onClick={() => openDetails(row.original.id)}
                className="flex w-full absolute"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                {row.getVisibleCells().map((cell) => (
                  // wrapped text requires dynamic height calculation, let's truncate it for simplicity
                  <td key={cell.id} className="flex-1 truncate">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface QuotesTablePaginationProps {
  pageSize?: number;
  page?: number;
  totalPages: number;
  onOptionsChange: SetState<ListQuotesOptions>;
}

function QuotesTablePagination({
  onOptionsChange,
  pageSize = 10,
  page = 1,
  totalPages,
}: QuotesTablePaginationProps) {
  const onPageSizeChange = (value: string) =>
    onOptionsChange({ pageSize: Number(value) });

  return (
    <div className="flex items-center justify-between space-x-2 py-4">
      <div className="flex items-center space-x-2">
        <Label htmlFor="show-per-page" className="text-sm font-medium">
          Show per page:
        </Label>
        <Select value={String(pageSize)} onValueChange={onPageSizeChange}>
          <SelectTrigger id="show-per-page" className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOptionsChange({ page: page - 1 })}
          disabled={page === 1}
        >
          <ChevronLeft />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOptionsChange({ page: page + 1 })}
          disabled={page >= totalPages}
        >
          Next
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

function useSortableMethods({
  onOptionsChange,
  options,
}: Pick<QuotesTableProps, "options" | "onOptionsChange">) {
  const toggleSort = (field: SortableField, shiftKey: boolean) => {
    onOptionsChange((prevOptions) => {
      const prevSortBy = prevOptions.sortBy || [];
      let newSortBy = prevSortBy;
      const existingSortingConfigIndex = prevSortBy.findIndex(
        (sort) => sort.field === field
      );
      const existingSortingConfig = prevSortBy[existingSortingConfigIndex];

      if (!shiftKey) {
        // If shift is not pressed, we want to clear other sorts
        if (!existingSortingConfig) newSortBy = [{ field, direction: "asc" }];
        else if (existingSortingConfig.direction === "asc")
          newSortBy = [{ field, direction: "desc" }];
        else if (existingSortingConfig.direction === "desc") newSortBy = [];
      } else {
        // Shift is pressed - maintain multiple sorts
        if (!existingSortingConfig)
          newSortBy = [...prevSortBy, { field, direction: "asc" }];
        else if (existingSortingConfig.direction === "asc") {
          newSortBy = [
            ...prevSortBy.slice(0, existingSortingConfigIndex),
            { field, direction: "desc" },
            ...prevSortBy.slice(existingSortingConfigIndex + 1),
          ];
        } else if (existingSortingConfig.direction === "desc")
          newSortBy = prevSortBy.filter((sort) => sort.field !== field);
      }

      return { ...prevOptions, sortBy: newSortBy };
    });
  };

  const renderSortIcon = (field: SortableField) => {
    const sortingConfig = options.sortBy?.find((sort) => sort.field === field);
    if (!sortingConfig)
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;

    if (sortingConfig.direction === "asc")
      return <ArrowUp className="h-4 w-4" />;
    if (sortingConfig.direction === "desc")
      return <ArrowDown className="h-4 w-4" />;
  };

  return { toggleSort, renderSortIcon };
}

interface EmptyPlaceholderProps {
  title: string;
  description: string;
  action?: React.ReactNode; // ideally we should provide a default action like create a new item, but skipping to simplify
}

export function EmptyPlaceholder({
  title,
  description,
  action,
}: EmptyPlaceholderProps) {
  return (
    <div className="flex w-full h-[80svh] justify-center items-center">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <Database className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-center">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">{description}</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          {action || (
            <Button variant="secondary" onClick={() => location.reload()}>
              Reload Page
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
