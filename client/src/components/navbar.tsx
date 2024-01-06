"use client";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarTrigger,
} from "@/components/ui/menubar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel,
  } from "@/components/ui/select"

function AuthButton() {
    const { data: session } = useSession();
    if (session) {
        return (
            <>
                <Menubar className="border-0 p-0">
                    <MenubarMenu>
                        <MenubarTrigger className="p-0 cursor-pointer focus:bg-transparent focus:text-transparent data-[state=open]:bg-transparent data-[state=open]:text-transparent">
                            <img src={session?.user?.image ?? ""} alt="avatar" className="rounded-full w-8 h-8 outline-none"/> <br />
                        </MenubarTrigger>
                        <MenubarContent align="end">
                            <MenubarItem>
                                <a href="/dashboard">
                                    Dashboard
                                </a>
                            </MenubarItem>
                            <MenubarItem>Profile</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem onClick={() => signOut()}>Sign out</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                </Menubar>
            </>

        )
    } else {
        // return <button onClick={() => signIn()}>Sign in</button>
        return (
            <Button onClick={() => signIn()}>Sign in</Button>        
        )
    }
}

export default function Navbar() {
    return (
		<>
			<div className="w-full h-16 px-4 gap-4 flex justify-end items-center border-b">
				<Dialog>
					<DialogTrigger asChild>
						<Button
							className="hidden md:block"
							variant={"secondary"}
						>
							Submit Event
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Submit Event</DialogTitle>
							<DialogDescription>
								Submit an event to the calendar. Click submit
								when you're done.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="name" className="text-right">
									Event name
								</Label>
								<Input
									id="name"
									className="col-span-3"
									placeholder="Name of the event"
									required
								/>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="text" className="text-right">
									Description
								</Label>
								<Input
									id="description"
									className="col-span-3"
									placeholder="Description of the event"
									required
								/>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="text" className="text-right">
									Location
								</Label>
								<Input
									id="location"
									className="col-span-3"
									placeholder="Location of the event (optional)"
									required
								/>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="text" className="text-right">
									Start Date
								</Label>
								<DatePicker />
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="text" className="text-right">
									End Date
								</Label>
								<DatePicker />
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="text" className="text-right">
									Calendar
								</Label>
								<Select>
									<SelectTrigger className="w-[280px]">
										<SelectValue placeholder="Select a calendar" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectItem value="rpi_academic">
												RPI Academic Calendar
											</SelectItem>
											<SelectItem value="rpi_athletics">
												RPI Athletics
											</SelectItem>
											<SelectItem value="club_events">
												Club Events
											</SelectItem>
											<SelectItem value="greek_life">
                                                Greek Life
											</SelectItem>
											<SelectItem value="stugov">
                                                Student Government
											</SelectItem>
											<SelectItem value="stulife">
                                                Student Life
											</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>
						</div>
						<DialogFooter>
							<Button type="submit">Submit</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
				<div className="w-64">
					<Input
						className="focus-visible:ring-0 focus-visible:ring-offset-0"
						placeholder="Search..."
					/>
				</div>
				<AuthButton />
			</div>
		</>
	);
}