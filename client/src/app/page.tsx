import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <div>
        <div className="p-4 flex justify-end items-center">
            <ModeToggle />
        </div>
    </div>
  )
}
