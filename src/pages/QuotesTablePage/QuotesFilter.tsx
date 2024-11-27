import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, PlusCircle, X } from "lucide-react";
import { pluralize } from "@/lib/utils";
import type { SetState } from "../../lib/types";
import type {
  ListQuotesOptions,
  QuoteFilterOperator,
  QuoteFilter,
} from "../../api/pocketBaseService";
import { isDateField } from "../../api/types";

interface QuotesFilterProps {
  options: ListQuotesOptions;
  onOptionsChange: SetState<ListQuotesOptions>;
}

export function QuotesFilterPopover({
  options,
  onOptionsChange,
}: QuotesFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { clearFilters, addFilter, removeFilter, patchFilter, onFieldChange } =
    useFilterUpdateMethods(onOptionsChange, setIsOpen);
  const activeFiltersCount = options.filters?.length ?? 0;

  const patchFilterValue = (
    filed: string,
    index: number,
    value: string | number
  ) => {
    if (["total", "subtotal", "total_tax"].includes(filed))
      value = Number.parseFloat(value as string);
    patchFilter(index, { value });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[150px] justify-start">
          <Filter className="mr-2 h-4 w-4" />
          {activeFiltersCount > 0
            ? `${activeFiltersCount} ${pluralize(activeFiltersCount, "filter")}`
            : "Filter"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-4" align="start">
        <div className="space-y-4">
          {(options.filters ?? []).map((filter, index) => (
            <div key={index} className="flex items-end space-x-2">
              <div className="flex-1">
                <Label htmlFor={`field-${index}`} className="sr-only">
                  Field
                </Label>
                <Select
                  onValueChange={(field) => onFieldChange(index, field)}
                  value={filter.field}
                >
                  <SelectTrigger
                    id={`field-${index}`}
                    data-testid={`field-${index}`}
                  >
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created">Created</SelectItem>
                    <SelectItem value="status" data-testid="status-field">
                      Status
                    </SelectItem>
                    <SelectItem value="updated">Updated</SelectItem>
                    <SelectItem value="subtotal">Subtotal</SelectItem>
                    <SelectItem value="total" data-testid="total-field">
                      Total
                    </SelectItem>
                    <SelectItem value="total_tax">Total Tax</SelectItem>
                    <SelectItem value="valid_until">Valid Until</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {filter.field !== "status" && (
                <div className="w-[80px]">
                  <Label htmlFor={`operator-${index}`} className="sr-only">
                    Operator
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      patchFilter(index, {
                        operator: value as QuoteFilterOperator,
                      })
                    }
                    value={filter.operator}
                  >
                    <SelectTrigger id={`operator-${index}`}>
                      <SelectValue placeholder="Op" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=">=">{">="}</SelectItem>
                      <SelectItem value="<=">{"<="}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex-1">
                <Label htmlFor={`value-${index}`} className="sr-only">
                  Value
                </Label>
                {filter.field === "status" ? (
                  <Select
                    onValueChange={(value) => patchFilter(index, { value })}
                    value={filter.value as string}
                  >
                    <SelectTrigger id={`value-${index}`}>
                      <SelectValue
                        placeholder="Select status"
                        data-testid="select-status-value"
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="SENT">Sent</SelectItem>
                      <SelectItem
                        value="ACCEPTED"
                        data-testid="status-value-accepted"
                      >
                        Accepted
                      </SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                      <SelectItem value="EXPIRED">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={`value-${index}`}
                    data-testid={`value-${index}`}
                    type={isDateField(filter.field) ? "date" : "number"}
                    onChange={(e) =>
                      patchFilterValue(filter.field, index, e.target.value)
                    }
                    value={filter.value}
                  />
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFilter(index)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove filter</span>
              </Button>
            </div>
          ))}
          <div className="flex justify-between items-center">
            <div className="">
              {activeFiltersCount > 0 ? (
                <Button onClick={clearFilters} variant="outline" size="sm">
                  <X className="mr-2 h-4 w-4" />
                  Clear all
                </Button>
              ) : (
                <p className="text-center">No filters applied</p>
              )}
            </div>
            <Button onClick={addFilter} variant="secondary" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Filter
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function useFilterUpdateMethods(
  onOptionsChange: QuotesFilterProps["onOptionsChange"],
  setIsOpen: (isOpen: boolean) => void
) {
  const clearFilters = () => {
    onOptionsChange((prev) => ({ ...prev, filters: [] }));
    setIsOpen(false);
  };

  const addFilter = () => {
    onOptionsChange((prev) => {
      const filters = prev.filters ?? [];
      return {
        ...prev,
        filters: [
          ...filters,
          { field: "created", operator: ">=", value: undefined },
        ],
      };
    });
  };

  const removeFilter = (index: number) => {
    onOptionsChange((prev) => {
      const filters = prev.filters ?? [];
      return { ...prev, filters: filters.filter((_, i) => i !== index) };
    });
  };

  const patchFilter = (index: number, patch: Partial<QuoteFilter>) => {
    onOptionsChange((prev) => {
      const filters = prev.filters ?? [];
      return {
        ...prev,
        filters: filters.map((filter, i) =>
          i === index ? { ...filter, ...patch } : filter
        ),
      };
    });
  };

  const onFieldChange = (index: number, fieldName: string) => {
    const field = fieldName as QuoteFilter["field"];
    if (field === "status")
      patchFilter(index, {
        field,
        operator: "=",
      });
    // unlike other fields, status can only be equal
    else patchFilter(index, { field });
  };

  return { clearFilters, addFilter, removeFilter, patchFilter, onFieldChange };
}
