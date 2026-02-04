import React from "react"
import { MedicationProvider } from "@/lib/medication-context"
import { BottomNavigation } from "@/components/bottom-navigation"
import { SidebarNavigation } from "@/components/sidebar-navigation"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MedicationProvider>
      <div className="min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <SidebarNavigation />
        
        {/* Main Content Area */}
        <div className="lg:pl-64 pb-20 lg:pb-0">
          {children}
        </div>
        
        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden">
          <BottomNavigation />
        </div>
      </div>
    </MedicationProvider>
  )
}
