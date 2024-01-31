"use client"

import {eachDayOfInterval, endOfWeek, format, getMinutes, startOfWeek} from 'date-fns';
// import TestData from "../server/events.json";
import { AlignLeft, MapPin, CalendarIcon, CircleDashed, XCircle } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";  
import { useEffect, useState } from 'react';
import tinycolor from 'tinycolor2';
import { useAtom } from 'jotai';
import { currentDatesAtom, swipeCalendarAtom } from '@/lib/hooks';

interface CalendarEvent {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    location: string;
    status: string;
    flags: {
        all_day: boolean;
    }
    calendar_group?: string;
    color: string;
}

function CalendarHeader() {
    return (
        <>
            <div className="flex h-5 text-center">
                <div className="grow flex-shrink basis-0 border-r border-l ">
                    <span className="text-[11px] text-gray-500 uppercase">Sun</span>
                </div>
                <div className="grow flex-shrink basis-0 border-r ">
                    <span className="text-[11px] text-gray-500 uppercase">Mon</span>
                </div>
                <div className="grow flex-shrink basis-0 border-r ">
                    <span className="text-[11px] text-gray-500 uppercase">Tue</span>
                </div>
                <div className="grow flex-shrink basis-0 border-r ">
                    <span className="text-[11px] text-gray-500 uppercase">Wed</span>
                </div>
                <div className="grow flex-shrink basis-0 border-r ">
                    <span className="text-[11px] text-gray-500 uppercase">Thu</span>
                </div>
                <div className="grow flex-shrink basis-0 border-r ">
                    <span className="text-[11px] text-gray-500 uppercase">Fri</span>
                </div>
                <div className="grow flex-shrink basis-0 border-r ">
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
    let today = new Date();
    return (
        <>
            <div className="inset-0 flex text-center">
                {dates.map((date, index) => (
                    <div key={index} className={`grow flex-shrink basis-0 border-l ${index === dates.length - 1 ? 'border-r' : ''}`}>
                        <span className={`text-xs rounded-[50%] p-1 ${format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd") ? 'bg-blue-600 text-white' : ''}`}>
                            {date.getDate() === 1 ? format(date, 'MMM d') : format(date, 'd')}
                        </span>
                    </div>
                ))}
            </div>
        </>
    )    
}

function CalendarCell({date, events}: {date: Date, events: CalendarEvent[]}) {
    // go through testData and find events that have the same month, year and day as date
    
    // convert events to CalendarEvent[]
    const calendarEvents = events.map((event: CalendarEvent) => {
        return event as CalendarEvent;
    });

    const maxEventsToShow = 4;
    const additionalEvents = calendarEvents.length - maxEventsToShow;
    const today = new Date();

    return (
        <>
            <div className="flex flex-col grow flex-shrink basis-0 border-l w-[14.29%]" style={{ color: `${today.getDate() > date.getDate() ? 'rgba(32, 33, 36, .38)' : ''}`}} role="gridcell">
                {calendarEvents.slice(0, maxEventsToShow).map((event: CalendarEvent, index: number) => (
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
                                        {calendarEvents.map((event: CalendarEvent, index: number) => (
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
    const today = new Date();
    const eventDate = new Date(event.start_date);
    function styleCalendarEvent() {
        let style = "";
        if (event.status === 'rejected') {
            let color = tinycolor(event.color ?? "#d50000").darken(30).toHex();
            style = `repeating-linear-gradient(
                -45deg,
                ${event.color ?? "#d50000"},
                ${event.color ?? "#d50000"} 10px,
                #${color} 10px,
                #${color} 20px
            )`
        } else if (event.status === 'pending') {
            let color = tinycolor(event.color ?? "#d50000").lighten(30).toHex();
            style = `repeating-linear-gradient(
                45deg,
                ${event.color ?? "#d50000"},
                ${event.color ?? "#d50000"} 10px,
                #${color} 10px,
                #${color} 20px
            )`
        } else {
            style = event.color ?? "#d50000"
        }

        if (today.getDate() > eventDate.getDate() && today.getMonth() === eventDate.getMonth() && today.getFullYear() === eventDate.getFullYear()) {
            style = `${style}80`
        }
        return style;
    }

	return (
		<>
			<Popover>
				<PopoverTrigger>
					<div className="h-6 box-border pr-2 top-0 w-full select-none" role="note">
                        {event.flags.all_day && (
                            <div className="h-[22px] px-2 text-white text-xs leading-5 rounded flex items-center hover:brightness-[95%]" style={{ background: styleCalendarEvent(), color: `${today.getDate() > eventDate.getDate() ? '#a3a3a3' : ''}`}} role="button" >
                                <span className="flex items-center overflow-hidden">
                                    {event.status === 'pending' && <CircleDashed className="h-5 w-5 mr-2" strokeWidth="2px" />}
                                    {event.status === 'rejected' && <XCircle className="h-5 w-5 mr-2" strokeWidth="2px" />}
                                    <span className="text-xs whitespace-nowrap overflow-hidden font-medium">
                                        {event.title}
                                    </span>
                                </span>
                            </div>
                        )}
                        {!event.flags.all_day && (
                            <div className="h-[22px] px-2 text-xs leading-5 rounded flex items-center hover:bg-neutral-100" role="button">
                                <span className="flex items-center overflow-hidden">
                                    {event.status === 'pending' && <CircleDashed className="h-4 w-4 mr-2" strokeWidth="2px" />}
                                    {event.status === 'rejected' && <XCircle className="h-4 w-4 mr-2" strokeWidth="2px" />}
                                    <div className="flex items-center grow-0 shrink-0 basis-0 justify-center mr-[6px]">
                                        <div className="rounded-lg border-4" style={{borderColor: event.color}}></div>
                                    </div>
                                    <span className="text-xs font-normal mr-1">
                                        {format(new Date(event.start_date), getMinutes(new Date(event.start_date)) === 0 ? 'haaa' : 'h:mmaaa')}
                                    </span>
                                    <span className="text-xs whitespace-nowrap overflow-hidden font-medium">
                                        {event.title}
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
								{event.title}
							</h4>
                            <span className="text-sm text-muted-foreground">
                                {format(new Date(event.start_date), 'EEEE, MMMM d')}
                                {!event.flags.all_day ? ` ⋅ ${format(new Date(event.start_date), "h:mmaaa")} – ${format(new Date(event.end_date), "h:mmaaa")} ` : ''} 
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

function chunk(dates: Date[], arg1: number): Date[][] {
    var R = [];
    for (var i = 0; i < dates.length; i += arg1)
        R.push(dates.slice(i, i + arg1));
    return R;
}

export function Calendar() {
    const [currentDates, setCurrentDates] = useAtom(currentDatesAtom);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [swipeCalendar, setSwipeCalendar] = useAtom(swipeCalendarAtom);
    const start = startOfWeek(currentDates[0])
    const end = endOfWeek(currentDates[1]);

    const dates: Date[] = eachDayOfInterval({ start, end });
    const weeks: Date[][] = chunk(dates, 7);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:8080/events?start_date=${format(startOfWeek(currentDates[0]), "yyyy-MM-dd")}&end_date=${format(endOfWeek(currentDates[1]), "yyyy-MM-dd")}&status=approved`);
                const json = await response.json();
                console.log(json)
                setEvents(json);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
    
        fetchData();
    }, [currentDates]);


    const eventsByDate: {[key: string]: CalendarEvent[]} = {};
    if (events && events.length > 0) {
        events.forEach((event: CalendarEvent) => {
            const date = format(new Date(event.start_date), "yyyy-MM-dd");
            if (eventsByDate[date]) {
                eventsByDate[date].push(event);
            } else {
                eventsByDate[date] = [event];
            }
        });
    }

    return (
        <>
            {/* <div className={`flex flex-col h-full transition-transform duration-500 ${swipeCalendar === 1 ? '-translate-x-full' : swipeCalendar === -1 ? 'translate-x-full' : ''}`}> TODO: Make this actually work.*/}
            <div className="flex flex-col h-full">
                <CalendarHeader />
                <div className="flex grow flex-shrink basis-0 flex-col" >
                    {weeks.map((week, index) => (
                        <div className="flex flex-col grow shrink basis-0" key={index} role="row">
                            <CalendarCellHeader start={week[0]} end={week[week.length - 1]} />
                            <div className="border-b grow shrink basis-0" role="cells">
                                <div className="flex relative text-2xl min-h-[4em] border-r">
                                    {week.map((date, index2) => (
                                        <CalendarCell key={index2} date={date} events={eventsByDate[format(date, "yyyy-MM-dd")] ?? []} />
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
