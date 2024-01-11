"use client";
import { signIn, signOut, useSession } from "next-auth/react";
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

function AuthButton() {
    const { data: session } = useSession();
    if (session) {
        return (
            <>
                <Menubar className="border-0 p-0">
                    <MenubarMenu>
                        <MenubarTrigger className="p-0 cursor-pointer focus:bg-transparent focus:text-transparent data-[state=open]:bg-transparent data-[state=open]:text-transparent">
                            <img src={session?.user?.image ?? ""} alt="avatar" className="rounded-full w-8 h-8 outline-none"/> <br />
                        </MenubarTrigger>
                        <MenubarContent align="end">
                            <a href="/dashboard">
                            <MenubarItem>
                                    Dashboard
                            </MenubarItem>
                            </a>
                            <MenubarItem>Profile</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem onClick={() => signOut()}>Sign out</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                </Menubar>
            </>

        )
    } else {
        // return <button onClick={() => signIn()}>Sign in</button>
        return (
            <Button onClick={() => signIn()}>Sign in</Button>        
        )
    }
}

export default function Navbar() {
    return (
		<>
			<div className="w-full h-16 px-4 flex justify-between items-center border-b">
                <div>
                    <a href="/" className="flex items-center">
                        <img src={PolyLogo.src} alt="logo" className="h-12 w-auto rounded-md" />
                        <span className="text-4xl pl-1">olycal</span>
                    </a>
                </div>
                <div className="flex items-center gap-4">
                    <SubmitEvent />
                    <div className="w-64">
                        <Input
                            className="focus-visible:ring-0 focus-visible:ring-offset-0"
                            placeholder="Search..."
                        />
                    </div>
				    <AuthButton />
                </div>
			</div>
		</>
	);
}

