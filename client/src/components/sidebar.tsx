"use client";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";

export function Sidebar() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    return (
        <>
            <div className="flex flex-col justify-between h-full">
                <div className="basis-0 grow shrink">
                    <Calendar showOutsideDays fixedWeeks mode="single" selected={date} onSelect={setDate}/>
                    <div className="p-3">
                        <h1 className="text-2xl font-bold pb-1">Calendars</h1>
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <input type="checkbox" />
                                <Label>RPI Academic Calendar</Label>
                            </div>
                            <div className="flex gap-2">
                                <input type="checkbox" />
                                <Label>RPI Athletics</Label>
                            </div>
                            <div className="flex gap-2">
                                <input type="checkbox" />
                                <Label>Club Events</Label>
                            </div>
                            <div className="flex gap-2">
                                <input type="checkbox" />
                                <Label>Student Government</Label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-3 text-center basis-0 grow shrink">
                    <h3 className="text-xs font-normal text-neutral-600 tracking-tight"><a className="text-blue-600" href="https://github.com/nikapadia/polycal" target="_blank">Source Code</a></h3>
                </div>
            </div>
        </>
    )
};