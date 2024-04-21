import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/dashboard/data-table";
import { Event, ColumnsEvents } from "@/components/dashboard/columns-events";
import { User, ColumnsUsers } from "@/components/dashboard/columns-users";
import { ColumnsQueue } from "@/components/dashboard/columns-queue";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/dashboard')({
    component: Dashboard,
})

export function Dashboard() {
    const [eventData, setEventData] = useState<Event[]>([]);
    const [queueDate, setQueueDate] = useState<Event[]>([]);
    const [userData, setUserData] = useState<User[]>([]);

    useEffect(() => {
        async function getEventData(): Promise<Event[]> {
            const response = await fetch("http://localhost:8080/events");
        
            return response.json().then((data) => data.map((item: any) => {
                return {
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    start_date: new Date(item.start_date),
                    end_date: new Date(item.end_date),
                    location: item.location,
                    status: item.status,
                    flags: item.flags
                }
            }));
        }

        getEventData().then((data) => setEventData(data));
    }, []);

    useEffect(() => {
        async function getEventData(): Promise<Event[]> {
            const response = await fetch("http://localhost:8080/queue");
        
            return response.json().then((data) => data.map((item: any) => {
                return {
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    start_date: new Date(item.start_date),
                    end_date: new Date(item.end_date),
                    location: item.location,
                    flags: item.flags
                }
            }));
        }

        getEventData().then((data) => setQueueDate(data));
    }, []);

    useEffect(() => {
        async function getUserData(): Promise<User[]> {
            const response = await fetch("http://localhost:8080/users");
        
            return response.json().then((data) => data.map((item: any) => {
                return {
                    id: item.id,
                    first_name: item.first_name,
                    last_name: item.last_name,
                    email: item.email,
                    created_at: new Date(item.created_at)
                }
            }));
        }

        getUserData().then((data) => setUserData(data));
    }, []);

    return (
        <div className="hidden space-y-6 p-8 md:block">
            <div className="space-y-0.5 pl-24">
                <h2 className="text-4xl font-bold">Dashboard</h2>
                <p className="text-gray-500">
                    Welcome back!
                </p>
            </div>

            <div className="px-24">
                <h2 className="text-3xl font-bold pb-2">Event Queue</h2>
                <DataTable columns={ColumnsQueue} data={queueDate} />
            </div>
            <div className="flex gap-12 mt-0 justify-between px-24">
                <div>
                    <h2 className="text-3xl font-bold pb-2">Events</h2>
                    <DataTable columns={ColumnsEvents} data={eventData} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold pb-2">Users</h2>
                    <DataTable columns={ColumnsUsers} data={userData} />
                </div>
            </div>
        </div>
    );
}