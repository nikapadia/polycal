"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";
import {format} from "date-fns";

export type Event = {
    id: number;
    title: string;
    description: string;
    start_date: Date;
    end_date: Date;
    location?: string;
    status?: string;
    all_day?: boolean;
};

export const ColumnsEvents: ColumnDef<Event>[] = [
    {
        id: "actions",
        cell: ({ row }) => {
            const event = row.original
       
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(event.id.toString())}
                  >
                    Copy event ID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>View user</DropdownMenuItem>
                  <DropdownMenuItem>View event details</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          },
    },
    {
        header: "Event Name",
        accessorKey: "title",
        cell: ({ row }) => {
            const event = row.original
            return (
                <div className="flex flex-col min-w-96 max-w-96 overflow-hidden">
                    <TooltipProvider delayDuration={200}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="truncate">{event.title}</span>
                            </TooltipTrigger>
                            <TooltipContent align="start" className="max-w-96">
                                <span>{event.title}</span>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <span className="text-gray-500 text-xs">Event ID: {event.id}</span>
                </div>
            )
          },
    },
    {
        header: "Description",
        accessorKey: "description",
        cell: ({ row }) => {
            const event = row.original
            return (
                <div className="flex flex-col min-w-96 max-w-96 overflow-hidden">
                    <TooltipProvider delayDuration={200}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="truncate">{event.description}</span>
                            </TooltipTrigger>
                            <TooltipContent align="start" className="max-w-96">
                                <span>{event.description}</span>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )
          },
    },
    {
        accessorKey: "start_date",
        header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent hover:text-gray-900"
              >
                Start Date
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            )
        },
        cell: ({ row }) => {
            const event = row.original
            return (
                <div className="flex flex-col max-w-52 overflow-hidden">
                    <TooltipProvider delayDuration={200}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="truncate">{format(event.start_date, "eee, PPp")}</span>
                            </TooltipTrigger>
                            <TooltipContent align="start" className="">
                                <span>{format(event.start_date, "PPPPpppp")}</span>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )
          }
    },
    {
        accessorKey: "end_date",
        header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent hover:text-gray-900"
              >
                End Date
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            )
        },
        cell: ({ row }) => {
            const event = row.original
            return (
                <div className="flex flex-col max-w-52 overflow-hidden">
                    <TooltipProvider delayDuration={200}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>{format(event.end_date, "eee, PPp")}</span>
                            </TooltipTrigger>
                            <TooltipContent align="start" className="">
                                <span>{format(event.end_date, "PPPPpppp")}</span>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )
          }
    },
    {
        header: "Location",
        accessorKey: "location",
        cell: ({ row }) => {
            const event = row.original
            return (
                <div className="flex flex-col max-w-52 overflow-hidden">
                    <TooltipProvider delayDuration={200}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="truncate">{event.location}</span>
                            </TooltipTrigger>
                            <TooltipContent align="start" className="max-w-96">
                                <span>{event.location}</span>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )
          },
    },
    {
        accessorKey: "status",
        header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent hover:text-gray-900"
              >
                Status
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            )
        },
        cell: ({ row }) => {
            const event = row.original
            return (
                <div className="flex flex-col max-w-32 overflow-hidden">
                    <TooltipProvider delayDuration={200}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>{event.status}</span>
                            </TooltipTrigger>
                            <TooltipContent align="start" className="">
                                <span>{event.status}</span>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )
          }
    },
];