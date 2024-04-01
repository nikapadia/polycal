import { createFileRoute } from '@tanstack/react-router'
import { Calendar }  from "@/components/calendar"
import { Sidebar } from "@/components/sidebar"
import { atom, useAtom } from "jotai"

export const Route = createFileRoute('/')({
  component: Index,
})


export const sidebarOpenAtom = atom<boolean>(true);

export default function Index() {
    const [sidebarOpen] = useAtom<boolean>(sidebarOpenAtom);
    return (
        <div>
            <div className="flex">
                <div className={`absolute transform transition-transform duration-500 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <Sidebar />
                </div>
                <div className={`min-w-0 min-h-0 w-screen flex-grow transition-all duration-500 ease-in-out ${sidebarOpen ? 'ml-[276px]' : 'pl-2'}`}>
                    <Calendar />
                </div>
            </div>
        </div>
    )
}