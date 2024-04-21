import { Navbar } from '@/components/navbar'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Toaster } from '@/components/ui/sonner'
import "../globals.css"

export const Route = createRootRoute({
  component: () => (
    <>
        <Navbar />
        <Outlet />
        <Toaster richColors position="top-center" />
        {/* <TanStackRouterDevtools /> */}
    </>
  ),
})