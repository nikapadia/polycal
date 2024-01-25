import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { getServerSession } from "next-auth";
import SessionProvider from "@/components/session-provider";
import Navbar from "@/components/navbar";

import "./globals.css";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "PolyCal",
	description: "A calendar for RPI students",
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
    const session = await getServerSession();
	return (
		<html lang="en">
            <head>
                <link rel="icon" href="" />
            </head>
			<body className={inter.className}>
                <SessionProvider session={session}>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <Navbar />
                        {children}
                    </ThemeProvider>
                </SessionProvider>
			</body>
		</html>
	);
}
