"use client"

import {format, set} from 'date-fns';
import TestData from "./testData.json";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";  

interface CalendarEvent {
    id: number;
    user_id: number;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
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
    // go through testData and find events that have the same month, year and day as date
    const events = TestData.filter((event) => {
        const eventDate = new Date(event.start_time);
        return eventDate.getFullYear() === date.getFullYear() && eventDate.getMonth() === date.getMonth() && eventDate.getDate() === date.getDate();
    });
    // convert events to CalendarEvent[]
    const calendarEvents = events.map((event) => {
        return event as CalendarEvent;
    });
    return (
        <>
            <div className="flex flex-col grow flex-shrink basis-0 border-l w-[14.29%]" role="gridcell">
                {calendarEvents.map((event, index) => (
                    <CalendarEvent key={event.id || index} event={event} />
                ))}
            </div>
        </>
    )

}


function CalendarEvent({ event }: { event: CalendarEvent }) {
	return (
		<>
			<Popover>
				<PopoverTrigger>
					<div
						className="h-6 box-border pr-2 top-0 w-full select-none"
						role="note"
					>
						<div
							className="h-[22px] px-2 text-white text-xs leading-5 rounded flex items-center hover:brightness-[95%]"
							style={{ backgroundColor: event.color }}
							role="button"
						>
							<span className="flex items-center overflow-hidden">
								<span className="text-xs whitespace-nowrap font-semibold">
									{event.title}
								</span>
							</span>
						</div>
					</div>
				</PopoverTrigger>
				<PopoverContent>
					<div className="grid gap-4">
						<div className="space-y-2">
							<h4 className="font-medium leading-none">
								{event.title}
							</h4>
							<p className="text-sm text-muted-foreground">
								{event.description}
							</p>
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
