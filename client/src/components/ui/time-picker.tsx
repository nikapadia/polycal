"use client"
import { Input } from "@/components/ui/input"

export const TimePicker: React.FC = () => {
    return (
        <div className="flex flex-row gap-2">
            <Input type="time" />
            <Input type="time" />
        </div>
    )
}