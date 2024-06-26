import { useEffect, useState } from 'react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";  
import { AlignLeft, MapPin, CalendarIcon, XCircle } from "lucide-react"
import { eachDayOfInterval, endOfWeek, format, startOfWeek } from 'date-fns';
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
    flags?: {
        all_day?: boolean;
    }
    calendar_group?: string;
    color?: string;
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
    let dates = []; // Array of dates
    for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        dates.push(new Date(dt));
    }
    const today = new Date();
    return (
        <>
            <div className="inset-0 flex text-center">
                {dates.map((date, index) => (
                    <div key={index} className={`grow flex-shrink basis-0 border-l ${index === dates.length - 1 ? 'border-r' : ''}`}>
                        {/* If today, add a blue circle */}
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
    let calendarEvents = events.map((event: CalendarEvent) => {
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
                {/* Event Overflow */}
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
        let style = event.color ?? "#d50000";

        /* TODO: This code is a bit bugged, will come back later
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
        
        the event is in the past and not today and not in the future
        if (compareAsc(today, eventDate) === 1) {
            style = `${style}80`
        }  */

        return style;
    }

	return (
		<>
			<Popover>
				<PopoverTrigger>
					<div className="h-6 box-border pr-2 top-0 w-full select-none text-black" role="note">
                        {event.flags?.all_day && (
                            <div className="h-[22px] px-2 text-red text-xs leading-5 rounded flex items-center hover:brightness-[95%]" style={{ background: styleCalendarEvent(), color: `#d50000` }} role="button">
                                <span className="flex items-center overflow-hidden">
                                    {event.status === 'rejected' && <XCircle className="h-5 w-5 mr-2" strokeWidth="2px" />}
                                    <span className="text-xs whitespace-nowrap overflow-hidden font-medium text-white">
                                        {event.title}
                                    </span>
                                </span>
                            </div>
                        )}
                        {!event.flags?.all_day && (
                            <div className="h-[22px] px-2 text-xs leading-5 rounded flex items-center hover:bg-neutral-100" role="button">
                                <span className="flex items-center overflow-hidden">
                                    {event.status === 'rejected' && <XCircle className="h-4 w-4 mr-2" strokeWidth="2px" />}
                                    <div className="flex items-center grow-0 shrink-0 basis-0 justify-center mr-[6px]">
                                        <div className="rounded-lg border-4" style={{borderColor: "#000000"}}></div>
                                    </div>
                                    <span className="text-xs font-normal mr-1">
                                        {format(new Date(event.start_date), new Date(event.start_date).getMinutes() === 0 ? 'haaa' : 'h:mmaaa')}
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
                                {!event.flags?.all_day ? ` ⋅ ${format(new Date(event.start_date), "h:mmaaa")} – ${format(new Date(event.end_date), "h:mmaaa")} ` : ''} 
                            </span>
                            <div className="flex flex-col gap-2">
                                {event.description && (
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
                                )}
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

// Split an array into chunks of a specified size. Can be used to split an array of dates into weeks or potentially smaller chunks (3 days, 4 days, etc.)
function chunk(dates: Date[], arg1: number): Date[][] {
    let arr = []; 
    for (let i = 0; i < dates.length; i += arg1)
        arr.push(dates.slice(i, i + arg1));
    return arr;
}

export function Calendar() {
    const [currentDates, setCurrentDates] = useAtom(currentDatesAtom);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [eventsByDate, setEventsByDate] = useState<{[key: string]: CalendarEvent[]}>({});
    // const [swipeCalendar, setSwipeCalendar] = useAtom(swipeCalendarAtom);
    const start = startOfWeek(currentDates[0])
    const end = endOfWeek(currentDates[1]);

    const dates: Date[] = eachDayOfInterval({ start, end });
    const weeks: Date[][] = chunk(dates, 7);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Plus 1 to the start and end date to fix the timezone issue
                const response = await fetch(`http://localhost:8080/events?start_date=${format(+start - 1, "yyyy-MM-dd")}&end_date=${format(+end + 1, "yyyy-MM-dd")}`);
                const json = await response.json();
                let eventsByDate: {[key: string]: CalendarEvent[]} = {};
                json.forEach((event: CalendarEvent) => {
                    const date = format(new Date(event.start_date), "yyyy-MM-dd");
                    if (eventsByDate[date]) {
                        eventsByDate[date].push(event);
                    } else {
                        eventsByDate[date] = [event];
                    }
                });

                for (let date in eventsByDate) {
                    eventsByDate[date].sort((a, b) => {
                        // First sort by all_day flag
                        const allDayComparison = (b.flags?.all_day ? 1 : 0) - (a.flags?.all_day ? 1 : 0);
                        if (allDayComparison !== 0) {
                            return allDayComparison;
                        }
                
                        // If both events have the same all_day flag, sort by start_date
                        const aStartDate = new Date(a.start_date);
                        const bStartDate = new Date(b.start_date);
                        return aStartDate.getTime() - bStartDate.getTime();
                    });
                }

                setEvents(json);
                setEventsByDate(eventsByDate);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
    
        fetchData();
    }, [currentDates]);


    return (
        <>
            {/* <div className={`flex flex-col h-full transition-transform duration-500 ${swipeCalendar === 1 ? '-translate-x-full' : swipeCalendar === -1 ? 'translate-x-full' : ''}`}> TODO: Make the swipe animation actually work.*/}
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
