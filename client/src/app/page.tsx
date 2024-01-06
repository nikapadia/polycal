import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/theme-toggle"
import { Calendar }  from "@/components/calendar"
import { atom } from "jotai";

export default function Home() {
    return (
        <div>
            <div>
                <Calendar />
            </div>
        </div>
    )
}
