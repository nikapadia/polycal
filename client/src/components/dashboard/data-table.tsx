// REFERENCE: https://ui.shadcn.com/docs/components/data-table

import {useState} from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

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
import { DataTablePagination } from "./pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectLabel, SelectGroup } from "@/components/ui/select";
import { Filter, Search } from "lucide-react";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData>[];
	data: TValue[];
}

export function DataTable<TData, TValue>({
	columns,
	data,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [sortBy, setSortBy] = useState<string>("status");

	const table = useReactTable({
		columns,
		data,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
	});

	return (
		<div>
            <div className="flex items-center py-4 gap-3">
                <div className="relative max-w-sm">
                    <Input
                        placeholder="Search..."
                        value={(table.getColumn(sortBy)?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn(sortBy)?.setFilterValue(event.target.value)
                        }
                        className="pl-10" // Add left padding to make room for the icon
                    />
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                </div>
                {/* Make a select for changing the filter */}
                <Select onValueChange={setSortBy} value={sortBy}>
                    <SelectTrigger className="w-48 flex items-center relative">
                        <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <div className="pl-10">
                            <SelectValue placeholder="Filter by" />
                        </div>
                    </SelectTrigger>
                    <SelectContent align="end">
                        <SelectGroup>
                            <SelectLabel>Filter by</SelectLabel>
                            <SelectItem value="title">Event Name</SelectItem>
                            <SelectItem value="location">Location</SelectItem>
                            <SelectItem value="start_date">Start Date</SelectItem>
                            <SelectItem value="end_date">End Date</SelectItem>
                            <SelectItem value="status">Status</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef
															.header,
														header.getContext()
												  )}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-end space-x-2 py-4">
                <DataTablePagination table={table} />
            </div>
		</div>
	);
}
