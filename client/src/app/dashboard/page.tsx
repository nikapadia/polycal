import { getServerSession } from "next-auth";
import { Button } from "@/components/ui/button";
import { useAtom } from "jotai";
import { eventsAtom } from "@/lib/hooks";
import { DataTable } from "./data-table";
import { Event, columns } from "./columns";
// import testData from "./testData.json";
import testData from "../../server/events.json";

// export const events: Event[] = [
//     {
//         id: 1,
//         eventName: "Event 1",
//         description: "This is event 1",
//         startDate: new Date("2021-09-01"),
//         endDate: new Date("2021-09-02"),
//         location: "Location 1",
//         status: "pending"
//     },
//     {
//         id: 2,
//         eventName: "Event 2",
//         description: "This is event 2",
//         startDate: new Date("2021-09-03"),
//         endDate: new Date("2021-09-04"),
//         location: "Location 2",
//         status: "pending"
//     },
//     {
//         id: 3,
//         eventName: "Event 3",
//         description: "This is event 3",
//         startDate: new Date("2021-09-05"),
//         endDate: new Date("2021-09-06"),
//         location: "Location 3",
//         status: "pending"
//     },
// ];

async function getEventData(): Promise<Event[]> {
    const response = await fetch("http://localhost:3001/api/events", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    return response.json().then((data) => data.map((item: any) => {
        return {
            id: item.id,
            event_name: item.event_name,
            description: item.description,
            start_date: new Date(item.start_date),
            end_date: new Date(item.end_date),
            location: item.location,
            status: item.status,
            all_day: item.all_day
        }
    }));
}


export default async function Dashboard() {
    const session = await getServerSession();
    const eventData = await getEventData();
    return (
        <div className="hidden space-y-6 p-8 md:block">
            <div className="space-y-0.5">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-gray-500">
                    Welcome back, {session?.user?.name}!
                </p>
            </div>
            <DataTable columns={columns} data={eventData} />
            {/* Show the events from the atom */}
            {/* <div className="flex flex-col space-y-4">
                <h3 className="text-xl font-bold tracking-tight">Events</h3>
                <div className="flex flex-col space-y-2">
                    {events.map((event) => (
                        <div className="flex flex-col space-y-1">
                            <span className="text-gray-500">
                                {event.start_date.toDateString()}
                            </span>
                            <span className="text-gray-500">
                                {event.eventName}
                            </span>
                        </div>
                    ))}
                </div>
            </div> */}
        </div>
    );
}