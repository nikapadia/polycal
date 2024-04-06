"use client";
import { Button } from "@/components/ui/button";
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarTrigger,
} from "@/components/ui/menubar";
import { Input } from "@/components/ui/input";
import { SubmitEvent } from "@/components/submit-event";
import PolyLogo from "@/assets/poly_logo.png";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { useAtom } from "jotai";
import { sidebarOpenAtom } from "@/routes/index";
import { currentDatesAtom } from "@/lib/hooks";
import { format } from "date-fns";
// import { ThemeToggle } from "./theme-toggle";

function AuthButton() {
    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:8080/auth/google', {
                method: 'GET',
                headers: {
                    // Specify the OAuth provider as a header
                    'X-Provider': 'google',
                },
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('There was an error!', error);
        }
    }
    return (
        <Button onClick={handleLogin}>Sign in</Button>
    )
}

export function Navbar() {
    const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);
    const [currentDates, setCurrentDates] = useAtom(currentDatesAtom);

    const updateCurrentDates = (direction: number) => {
        setCurrentDates([new Date(currentDates[0].getFullYear(), currentDates[0].getMonth() + direction, 1), new Date(currentDates[0].getFullYear(), currentDates[0].getMonth() + direction, 31)])
    }

    return (
		<>
			<div className="w-full h-16 px-4 flex justify-between items-center border-b">
                <div className="flex items-center box-border">
                    <div className="p-3 mx-1 rounded-full hover:bg-neutral-100 cursor-pointer" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <Menu />
                    </div>
                    <a href="/" className="flex items-center">
                        <img src={PolyLogo} alt="logo" className="h-12 w-auto rounded-md" />
                        <span className="text-4xl pl-1">olycal</span>
                    </a>
                    <div className="flex ml-14 justify-center items-center">
                        <Button className="mr-2" variant={"secondary"} onClick={() => {setCurrentDates([new Date(new Date().setDate(1)), new Date(new Date().setDate(31))])}}>
                            Today
                        </Button>
                        <button onClick={() => updateCurrentDates(-1)}>
                            <div className="w-8 h-8 p-1 flex justify-center items-center hover:bg-neutral-200 rounded-full cursor-pointer">
                                <ChevronLeft />
                            </div>
                        </button>
                        <button onClick={() => updateCurrentDates(1)}>
                            <div className="w-8 h-8 p-1 flex justify-center items-center hover:bg-neutral-200 rounded-full cursor-pointer">
                                <ChevronRight />
                            </div>
                        </button>
                        <div>
                            <span className="text-2xl pl-1">{format(currentDates[0], "LLLL yyyy")}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* <ThemeToggle /> */}
                    <SubmitEvent />
                    {/* <div className="w-64">
                        <Input
                            className="focus-visible:ring-0 focus-visible:ring-offset-0"
                            placeholder="Search..."
                        />
                    </div> */}
				    <AuthButton />
                </div>
			</div>
		</>
	);
}

