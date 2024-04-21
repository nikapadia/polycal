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
import { Checkbox } from "@/components/ui/checkbox";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState } from "react";
import { set, parse } from "date-fns";

const formSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    location: z.string().optional(),
    start_date: z.date(),
    end_date: z.date(),
    all_day: z.boolean(),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    status: z.enum(["pending", "approved", "rejected"]).optional(),
});

export function SubmitEvent() {
    const [open, setOpen] = useState(false);
    const currentTime: Date = new Date();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            start_date: currentTime,
            end_date: currentTime,
            start_time: `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`,
            end_time: `${(currentTime.getHours()+1).toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`,
        },
    });
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setOpen(false);
        let event = {
            title: values.title,
            user_id: 1,
            description: values.description,
            location: values.location,
            start_date: "",
            end_date: "",
            status: "pending",
            flags: {
                all_day: values.all_day,
            }
        };
        let start_date;   
        let start_time = values.start_time ? values.start_time.split(":").map(Number) : [0, 0];
        start_date = set(values.start_date, { hours: start_time[0], minutes: start_time[1], seconds: 0, milliseconds: 0 });
        event.start_date = start_date.toISOString();

        let end_date;
        let end_time = values.end_time ? values.end_time.split(":").map(Number) : [0, 0];
        end_date = set(values.end_date, { hours: end_time[0], minutes: end_time[1], seconds: 0, milliseconds: 0 });
        event.end_date = end_date.toISOString();

        // console.log(event);
        const response = await fetch("http://localhost:8080/queue", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(event),
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
                            name="title"
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
                                    <Input placeholder="Describe your event" {...field} />
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
                                    <Input placeholder="Where is your event?" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}/>
                            <div className="flex items-center">
                                <FormField
                                control={form.control}
                                name="start_date"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel className="pr-2">Start</FormLabel>
                                    <FormControl>
                                        <DatePicker {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField
                                control={form.control}
                                name="start_time"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormControl>
                                        <input type="time" {...field} value={field.value ? field.value.toString() : ''} className="mt-2 pl-2" />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                            <div className="flex items-center">
                                <FormField
                                control={form.control}
                                name="end_date"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel className="pr-2">End</FormLabel>
                                    <FormControl>
                                        <DatePicker {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField
                                control={form.control}
                                name="end_time"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormControl>
                                        <input type="time" {...field} value={field.value ? field.value.toString() : ''} className="mt-2 pl-2" />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                            <FormField
                            control={form.control}
                            name="all_day"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>All Day</FormLabel>
                                <FormControl>
                                    <input className="ml-2" type="checkbox" {...field} value={field.value ? "true" : "false"}/>
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
                            {/* Somewhat temporary error message display */}
                            {Object.values(form.formState.errors).map((error, index) => {
                                if (error.message !== "Required") { // Don't show required error messages
                                    return <div className="text-[#ef4343]" key={index}>{error.message}</div>
                                }
                            })}
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
