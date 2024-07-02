"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
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
} from "./table";
import { useUpdateTask } from "@/hooks/useTasks";
import { useLiveBlockTasks } from "@/hooks/useLiveBlockTasks";
import { useMemo, useState } from "react";
import { getColumns } from "../../components/ui/columns";

import { DataTablePagination } from "./data-table-pagination";
import { useTasks } from "@/hooks/useTasks";
import { NoData } from "../NotData";
import { useEventListener } from "@/lib/liveblocks";
import { useUsers } from "@/hooks/useUser";
// import { DataTableToolbar } from "./data-table-toolbar";

interface DataTableProps<TData, TValue> {}

export function DataTable<TData, TValue>({}: DataTableProps<TData, TValue>) {
  const updateTask = useUpdateTask();
  const [listData, setListData] = useState<any>([]);
  const { createTask: liveBlockCreate } = useLiveBlockTasks();
  const { data: userData } = useUsers();
  const onUpdate = React.useCallback(
    (data: { id: string; data: any }) => {
      setListData((prev: any) => {
        return prev.map((item: any) => {
          if (item.id === data.id) {
            return {
              ...item,
              ...data.data,
            };
          }
          return item;
        });
      });
      updateTask.mutate(
        {
          id: data.id,
          data: data.data,
        },
        {
          onSuccess: (responseData) => {
            liveBlockCreate(responseData);
          },
        }
      );
    },
    [setListData, updateTask, liveBlockCreate]
  );
  const columns = useMemo<any>(
    () => getColumns(onUpdate, userData),
    [onUpdate, userData]
  );
  const { data, isLoading, error, refetch } = useTasks();

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  React.useEffect(() => {
    if (data) {
      data.sort((a: any, b: any) => a.title.localeCompare(b.title));
      setListData(data);
    }
  }, [data]);

  useEventListener(({ event }) => {
    if (event.type === "TASK_CREATED") {
      refetch();
    }
  });

  const table = useReactTable({
    data: listData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    initialState: {
      sorting: [
        {
          id: "title",
          desc: false,
        },
      ],
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });
  if (isLoading) return <div>Loading...</div>;
  if (error || listData.length == 0) return <NoData />;
  return (
    <div className="space-y-4">
      {/* <DataTableToolbar table={table} /> */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
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
      <DataTablePagination table={table} />
    </div>
  );
}
