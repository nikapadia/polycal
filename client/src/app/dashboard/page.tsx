import { AuthOptions, getServerSession } from "next-auth";
import { signOut } from "next-auth/react";
import { Separator } from "@/components/ui/separator"

import { Button } from "@/components/ui/button";

export default async function Dashboard() {
    const session = await getServerSession();
    // console.log(session);
    return (
        <div className="hidden space-y-6 p-8 md:block">
            <div className="space-y-0.5">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>
        </div>
    );
}