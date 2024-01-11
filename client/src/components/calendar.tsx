"use client"

import {format, getMinutes} from 'date-fns';
import TestData from "../server/events.json";
import { AlignLeft, MapPin, CalendarIcon, CircleDashed, XCircle } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";  
import { useState } from 'react';
import tinycolor from 'tinycolor2';

interface CalendarEvent {
    id: number;
    user_id: number;
    event_name: string;
    description: string;
    start_date: string;
    end_date: string;
    all_day: boolean;
    location: string;
    created_at: string;
    status: string;
    calendar_group: string;
    color: string;
}

function CalendarHeader() {
    return (
        <>
            <div className="flex h-5 text-center">
                <div className="grow flex-shrink basis-0 border-r border-l border-t">
                    <span className="text-[11px] text-gray-500 uppercase">Sun</span>
                </div>
                <div className="grow flex-shrink basis-0 border-r border-t">
                    <span className="text-[11px] text-gray-500 uppercase">Mon</span>
                </div>
                <div className="grow flex-shrink basis-0 border-r border-t">
                    <span className="text-[11px] text-gray-500 uppercase">Tue</span>
                </div>
                <div className="grow flex-shrink basis-0 border-r border-t">
                    <span className="text-[11px] text-gray-500 uppercase">Wed</span>
                </div>
                <div className="grow flex-shrink basis-0 border-r border-t">
                    <span className="text-[11px] text-gray-500 uppercase">Thu</span>
                </div>
                <div className="grow flex-shrink basis-0 border-r border-t">
                    <span className="text-[11px] text-gray-500 uppercase">Fri</span>
                </div>
                <div className="grow flex-shrink basis-0 border-r border-t">
                    <span className="text-[11px] text-gray-500 uppercase">Sat</span>
                </div>
            </div>
        </>
    )

}

function CalendarCellHeader({start, end}: {start: Date, end: Date}) {
    const dates = [];
    for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        dates.push(new Date(dt));
    }
    return (
        <>
            <div className="inset-0 flex text-center">
                {dates.map((date, index) => (
                    <div key={index} className={`grow flex-shrink basis-0 border-l ${index === dates.length - 1 ? 'border-r' : ''}`}>
                        <span className="text-xs">
                            {date.getDate() === 1 ? format(date, 'MMM d') : format(date, 'd')}
                        </span>
                    </div>
                ))}
            </div>
        </>
    )    
}

function CalendarCell({date}: {date: Date}) {
    const [isOpen, setIsOpen] = useState(false);

    // go through testData and find events that have the same month, year and day as date
    const events = TestData.filter((event) => {
        const eventDate = new Date(event.start_date);
        return eventDate.getFullYear() === date.getFullYear() && eventDate.getMonth() === date.getMonth() && eventDate.getDate() === date.getDate();
    });
    // convert events to CalendarEvent[]
    const calendarEvents = events.map((event) => {
        return event as CalendarEvent;
    });

    const maxEventsToShow = 4;
    const additionalEvents = calendarEvents.length - maxEventsToShow;

    return (
        <>
            <div className="flex flex-col grow flex-shrink basis-0 border-l w-[14.29%]" role="gridcell">
                {calendarEvents.slice(0, maxEventsToShow).map((event, index) => (
                    <CalendarEvent key={event.id || index} event={event} />
                ))}
                {/* Overflow */}
                {additionalEvents > 0 && (
                    <Popover>
                        <PopoverTrigger>
                        <div className="h-6 box-border pr-2 top-0 w-full select-none" role="note">
                                <div className="h-[22px] px-2 text-gray-700 text-xs font-semibold leading-5 rounded flex items-center hover:bg-[#f1f3f4]" role="button">
                                    {additionalEvents} more
                            </div>
                        </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-96" side="bottom" sideOffset={-145}>
                            <div className="flex relative">
                                <div className="space-y-2 w-full">
                                    <h4 className="font-medium leading-none">
                                        {format(date, 'EEEE, MMMM do')}
                                    </h4>
                                    <div className="flex flex-col grow flex-shrink basis-0">
                                        {calendarEvents.map((event, index) => (
                                            <CalendarEvent key={event.id || index} event={event} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
            </div>
        </>
    )

}


function CalendarEvent({ event }: { event: CalendarEvent }) {
    function styleCalendarEvent() {
        if (event.status === 'rejected') {
            let color = tinycolor(event.color ?? "#d50000").darken(30).toHex();
            return `repeating-linear-gradient(
                -45deg,
                ${event.color ?? "#d50000"},
                ${event.color ?? "#d50000"} 10px,
                #${color} 10px,
                #${color} 20px
            )`
        } else if (event.status === 'pending') {
            let color = tinycolor(event.color ?? "#d50000").lighten(30).toHex();
            return `repeating-linear-gradient(
                45deg,
                ${event.color ?? "#d50000"},
                ${event.color ?? "#d50000"} 10px,
                #${color} 10px,
                #${color} 20px
            )`
        } else {
            return event.color ?? "#d50000"
        }
    }
    const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<Popover>
				<PopoverTrigger>
					<div className="h-6 box-border pr-2 top-0 w-full select-none" role="note">
                        {event.all_day && (
                            <div className="h-[22px] px-2 text-white text-xs leading-5 rounded flex items-center hover:brightness-[95%]" style={{ background: styleCalendarEvent()}} role="button" >
                                <span className="flex items-center overflow-hidden">
                                    {event.status === 'pending' && <CircleDashed className="h-5 w-5 mr-2" strokeWidth="2px" />}
                                    {event.status === 'rejected' && <XCircle className="h-5 w-5 mr-2" strokeWidth="2px" />}
                                    <span className="text-xs whitespace-nowrap overflow-hidden font-medium">
                                        {event.event_name}
                                    </span>
                                </span>
                            </div>
                        )}
                        {!event.all_day && (
                            <div className="h-[22px] px-2 text-xs leading-5 rounded flex items-center hover:bg-neutral-100" role="button">
                                <span className="flex items-center overflow-hidden">
                                    {event.status === 'pending' && <CircleDashed className="h-5 w-5 mr-2" strokeWidth="2px" />}
                                    {event.status === 'rejected' && <XCircle className="h-5 w-5 mr-2" strokeWidth="2px" />}
                                    <div className="flex items-center grow-0 shrink-0 basis-0 justify-center mr-[6px]">
                                        <div className="rounded-lg border-4" style={{borderColor: event.color}}></div>
                                    </div>
                                    <span className="text-xs font-normal mr-1">
                                        {format(new Date(event.start_date), getMinutes(new Date(event.start_date)) === 0 ? 'haaa' : 'h:maaa')}
                                    </span>
                                    <span className="text-xs whitespace-nowrap overflow-hidden font-medium">
                                        {event.event_name}
                                    </span>
                                </span>
                            </div>      
                        )}
					</div>
				</PopoverTrigger>
				<PopoverContent className="w-96" side="right" align="start">
					<div className="grid gap-4">
						<div className="space-y-2">
							<h4 className="font-medium leading-5">
								{event.event_name}
							</h4>
                            <span className="text-sm text-muted-foreground">
                                {format(new Date(event.start_date), 'EEEE, MMMM d')}
                                {!event.all_day ? ` ⋅ ${format(new Date(event.start_date), "h:mmaaa")} – ${format(new Date(event.end_date), "h:mmaaa")} ` : ''} 
                                {/* {new Date(event.start_date).getMinutes() !== new Date(event.end_date).getMinutes() ? ' - ' + format(new Date(event.end_date), 'EEEE, MMMM d') : ''} */}
                            </span>
                            <div className="flex flex-col gap-2">
                                <div className="flex gap-3">
                                    <div className="max-h-14">
                                        <AlignLeft size={20} className="text-neutral-950"/>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            {event.description}
                                        </p>
                                    </div>
                                </div>
                                {event.location && (
                                <a href={`https://www.google.com/maps/search/?api=1&query=${event.location}`} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground select-text">
                                    <div className="flex items-center gap-3 hover:bg-slate-100">
                                        <MapPin size={20} className="text-neutral-950"/>
                                            {event.location}
                                    </div>
                                </a>
                                )}
                                {event.calendar_group && (
                                <div className="flex items-center gap-3">
                                    <CalendarIcon size={20} className="text-neutral-950"/>
                                    <p className="text-sm text-muted-foreground">
                                        {event.calendar_group}
                                    </p>
                                </div>)}                                        
                            </div>
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</>
	);
}


export function Calendar() {
    const start = new Date(2024, 0, 1);
    const end = new Date(2024, 1, 0);   
    
    // Adjust start to the nearest previous Sunday
    while (start.getDay() !== 0) {
        start.setDate(start.getDate() - 1);
    }
    // Adjust end to the nearest next Saturday
    while (end.getDay() !== 6) {
        end.setDate(end.getDate() + 1);
    }

    const dates = [];
    const weeks = [];
    for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        dates.push(new Date(dt));
    }
    while (dates.length) {
        weeks.push(dates.splice(0, 7));
    }

    return (
        <>
            <div className="pl-2 flex flex-col h-full">
                <CalendarHeader />
                <div className="flex grow flex-shrink basis-0 flex-col" >
                    {weeks.map((week, index) => (
                        <div className="grow flex-shrink basis-0" key={index} role="row">
                            <CalendarCellHeader start={week[0]} end={week[week.length - 1]} />
                            <div className="border-b" role="cells">
                                <div className="flex relative text-2xl min-h-[4em] border-r">
                                    {week.map((date, index2) => (
                                        <CalendarCell key={index2} date={date} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

// Ignore this function, it's just for reference
