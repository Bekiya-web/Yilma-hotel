import { useState, ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  BedDouble, 
  Users, 
  Calendar, 
  DollarSign, 
  Star,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Image,
  Home
} from "lucide-react";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/ThemeToggle";
import { logoutAdmin } from "@/api/auth.api";
import { toast } from "sonner";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logoutAdmin();
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  const navItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/bookings", icon: Calendar, label: "Bookings" },
    { path: "/admin/rooms", icon: BedDouble, label: "Rooms" },
    { path: "/admin/guests", icon: Users, label: "Guests" },
    { path: "/admin/revenue", icon: DollarSign, label: "Revenue" },
    { path: "/admin/reviews", icon: Star, label: "Reviews" },
    { path: "/admin/gallery", icon: Image, label: "Gallery" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 h-screen w-64 bg-card border-r border-border transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <Link to="/admin" className="flex items-center gap-2">
              <span className="font-serif text-xl tracking-wider text-yellow-500 font-semibold uppercase">YILMA</span>
              <span className="font-serif text-xl tracking-wider text-foreground font-semibold uppercase">HOTEL</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? "bg-yellow-500 text-white border border-yellow-500"
                    : "text-foreground/70 hover:bg-yellow-500 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-3 md:p-4 border-t border-border space-y-1.5 md:space-y-2">
            {/* Back to Site Button - Always visible at bottom */}
            <Link
              to="/"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-sm hover:shadow-md font-medium text-sm md:text-base"
            >
              <Home className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="font-medium">Back to Site</span>
            </Link>
            
            <Link
              to="/admin/settings"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg transition-all text-sm md:text-base ${
                isActive("/admin/settings")
                  ? "bg-yellow-500 text-white shadow-sm"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground"
              }`}
            >
              <Settings className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="font-medium">Settings</span>
            </Link>
            <button
              onClick={() => {
                setSidebarOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg text-foreground/70 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400 transition-all w-full text-left text-sm md:text-base"
            >
              <LogOut className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
                <Menu className="w-6 h-6" />
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search bookings, guests, rooms..." 
                  className="pl-10 w-80 hidden md:block"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-colors text-sm font-medium shadow-sm"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Site</span>
              </Link> */}
              <ThemeToggle />
              <button className="relative p-2 hover:bg-yellow-500 hover:text-white rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-border">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-xs text-muted-foreground">yilmahotel@gmail.com</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-yellow-500 border border-yellow-500 flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">YH</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-3 md:p-6">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
