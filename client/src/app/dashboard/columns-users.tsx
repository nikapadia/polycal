"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, User } from "lucide-react"
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

export type User = {
    id: number;
    first_name: string;
    last_name: string;
    email: Date;
    created_at: Date;
};

export const ColumnsUsers: ColumnDef<User>[] = [
    {
        id: "actions",
        cell: ({ row }) => {
            const user = row.original
       
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
                    onClick={() => navigator.clipboard.writeText(user.id.toString())}
                  >
                    Copy user ID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>View user</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          },
    },
    {
        accessorKey: "first_name",
        header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent hover:text-gray-900"
              >
                First Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            )
        },
        cell: ({ row }) => {
            const user = row.original
            return (
                <div className="flex flex-col min-w-96 max-w-96 overflow-hidden">
                    <TooltipProvider delayDuration={200}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="truncate">{user.first_name}</span>
                            </TooltipTrigger>
                            <TooltipContent align="start" className="max-w-96">
                                <span>{user.first_name}</span>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <span className="text-gray-500 text-xs">User ID: {user.id}</span>
                </div>
            )
          },
    },
    {
        accessorKey: "last_name",
        header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent hover:text-gray-900"
              >
                Last Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            )
        },
        cell: ({ row }) => {
            const user = row.original
            return (
                <div className="flex flex-col min-w-96 max-w-96 overflow-hidden">
                    <TooltipProvider delayDuration={200}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="truncate">{user.last_name}</span>
                            </TooltipTrigger>
                            <TooltipContent align="start" className="max-w-96">
                                <span>{user.last_name}</span>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )
          },
    },
    {
        accessorKey: "email",
        header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent hover:text-gray-900"
              >
                Email
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            )
        },
        cell: ({ row }) => {
            const user = row.original
            return (
                <div className="flex flex-col max-w-52 overflow-hidden">
                    <TooltipProvider delayDuration={200}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="truncate">{user.email.toString()}</span>
                            </TooltipTrigger>
                            <TooltipContent align="start" className="">
                                <span>{user.email.toString()}</span>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )
          }
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent hover:text-gray-900"
              >
                Created At
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
                                <span>{format(event.created_at, "eee, PPp")}</span>
                            </TooltipTrigger>
                            <TooltipContent align="start" className="">
                                <span>{format(event.created_at, "PPPPpppp")}</span>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )
        }
    }
];