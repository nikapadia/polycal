"use client";

import { Button } from "@/components/ui/button";
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
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useAtom } from "jotai";
import { eventsAtom } from "@/lib/hooks";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {useState} from "react";

interface Event {
    event_name: string;
    description: string;
    start_date: Date;
    end_date: Date;
    location?: string;
}

const formSchema = z.object({
    event_name: z.string().min(1),
    description: z.string().min(1),
    location: z.string().optional(),
    start_date: z.date(),
    end_date: z.date(),
});

export function SubmitEvent() {
    const [events, setEvents] = useAtom(eventsAtom);
    const [open, setOpen] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            start_date: new Date(),
            end_date: new Date(),
        },
    });
    async function onSubmit(values: z.infer<typeof formSchema>) {
        // setEvents([...events, values]);
        setOpen(false);
        // make a post request to the api using the values
        const response = await fetch("http://localhost:3001/api/events", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
        });
        if (!response.ok) {
            console.error(response);
        }
    }

	return (
		<>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button className="hidden md:block" variant={"secondary"}>
						Submit Event
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Submit Event</DialogTitle>
						<DialogDescription>
							Submit an event to the calendar. Once submitted, a moderator will review your event.
						</DialogDescription>
					</DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                            control={form.control}
                            name="event_name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Event Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="My cool event" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Input placeholder="My cool event" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                    <Input placeholder="My cool event" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField
                            control={form.control}
                            name="start_date"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Start Date</FormLabel>
                                <FormControl>
                                    <DatePicker {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField
                            control={form.control}
                            name="end_date"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>End Date</FormLabel>
                                <FormControl>
                                    <DatePicker {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}/>

                            {/* <FormField
                            control={form.control}
                            name="calendar"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Calendar</FormLabel>
                                <FormControl>
                                    <Select value={field.value}>
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
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}/> */}
                            <DialogFooter>
                                <Button type="submit">Submit</Button>
                            </DialogFooter>
                        </form>
                    </Form>
				</DialogContent>
			</Dialog>
		</>
	);
}

{/* <div className="grid gap-4 py-4">
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
					</div> */}