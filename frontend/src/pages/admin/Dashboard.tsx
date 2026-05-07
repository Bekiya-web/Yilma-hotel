import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  LayoutDashboard, 
  BedDouble, 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Star,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
  Search,
  Bell,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ThemeToggle from "@/components/ThemeToggle";
import { getDashboardStats, getBookings, getRoomStatuses } from "@/lib/supabase";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: getBookings
  });

  const { data: roomStatuses = [] } = useQuery({
    queryKey: ['room-statuses'],
    queryFn: getRoomStatuses
  });

  const recentBookings = bookings.slice(0, 5);

  const statsDisplay = stats ? [
    { label: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, change: stats.revenueChange, trend: "up", icon: DollarSign },
    { label: "Bookings Today", value: stats.bookingsToday.toString(), change: stats.bookingsChange, trend: "up", icon: Calendar },
    { label: "Occupancy Rate", value: `${stats.occupancyRate}%`, change: stats.occupancyChange, trend: "up", icon: BedDouble },
    { label: "Guest Rating", value: stats.guestRating.toString(), change: stats.ratingChange, trend: "up", icon: Star },
  ] : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-500/10 text-green-600 border-green-500/30";
      case "pending": return "bg-yellow-500 text-white border-yellow-500";
      case "cancelled": return "bg-red-500/10 text-red-600 border-red-500/30";
      case "occupied": return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      case "cleaning": return "bg-purple-500/10 text-purple-600 border-purple-500/30";
      case "available": return "bg-green-500/10 text-green-600 border-green-500/30";
      case "maintenance": return "bg-orange-500/10 text-orange-600 border-orange-500/30";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 h-screen w-64 bg-card border-r border-border transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl tracking-wide text-yellow-500">Auréa</span>
              <span className="font-serif text-xl tracking-wider text-foreground font-semibold uppercase">Grand</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <Link to="/admin" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-yellow-500 text-white border border-yellow-500">
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link to="/admin/bookings" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/70 hover:bg-yellow-500 hover:text-white transition-colors">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Bookings</span>
            </Link>
            <Link to="/admin/rooms" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/70 hover:bg-yellow-500 hover:text-white transition-colors">
              <BedDouble className="w-5 h-5" />
              <span className="font-medium">Rooms</span>
            </Link>
            <Link to="/admin/guests" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/70 hover:bg-yellow-500 hover:text-white transition-colors">
              <Users className="w-5 h-5" />
              <span className="font-medium">Guests</span>
            </Link>
            <Link to="/admin/revenue" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/70 hover:bg-yellow-500 hover:text-white transition-colors">
              <DollarSign className="w-5 h-5" />
              <span className="font-medium">Revenue</span>
            </Link>
            <Link to="/admin/reviews" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/70 hover:bg-yellow-500 hover:text-white transition-colors">
              <Star className="w-5 h-5" />
              <span className="font-medium">Reviews</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-border space-y-2">
            <Link to="/admin/settings" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/70 hover:bg-yellow-500 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </Link>
            <Link to="/admin/login" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/70 hover:bg-yellow-500 hover:text-white transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </Link>
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
              <ThemeToggle />
              <button className="relative p-2 hover:bg-yellow-500 hover:text-white rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-border">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-xs text-muted-foreground">admin@aurea-grand.com</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-yellow-500 border border-yellow-500 flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">AU</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6 space-y-6">
          {/* Welcome Section */}
          <div>
            <h1 className="font-serif text-3xl mb-2">Welcome back, Admin</h1>
            <p className="text-muted-foreground">Here's what's happening with your hotel today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsDisplay.map((stat) => (
              <Link 
                key={stat.label} 
                to={
                  stat.label === "Total Revenue" ? "/admin/revenue" :
                  stat.label === "Bookings Today" ? "/admin/bookings" :
                  stat.label === "Occupancy Rate" ? "/admin/rooms" :
                  "/admin/reviews"
                }
              >
                <Card className="p-6 hover:shadow-lg hover:border-yellow-500 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-yellow-500 border border-yellow-500 flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className={`text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-serif font-semibold">{stat.value}</p>
                </Card>
              </Link>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Bookings */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl">Recent Bookings</h2>
                <Button variant="outline" size="sm" asChild className="hover:bg-yellow-500 hover:text-white hover:border-yellow-500">
                  <Link to="/admin/bookings">View All</Link>
                </Button>
              </div>
              <div className="space-y-4">
                {recentBookings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No bookings yet</p>
                ) : (
                  recentBookings.map((booking) => (
                    <Link 
                      key={booking.id} 
                      to="/admin/bookings"
                      className="flex items-center justify-between p-4 border border-yellow-500 rounded-lg hover:bg-yellow-500/10 transition-colors cursor-pointer"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-medium">
                            {booking.guest ? `${booking.guest.first_name} ${booking.guest.last_name}` : 'Guest'}
                          </p>
                          <Badge className={`text-xs ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {booking.room?.name || 'Room'} • {new Date(booking.check_in).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-semibold text-yellow-500">ETB {booking.amount.toLocaleString()}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </Card>

            {/* Room Status */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl">Room Status</h2>
                <Button variant="outline" size="sm" asChild className="hover:bg-yellow-500 hover:text-white hover:border-yellow-500">
                  <Link to="/admin/rooms">Manage Rooms</Link>
                </Button>
              </div>
              <div className="space-y-4">
                {roomStatuses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No room status data</p>
                ) : (
                  roomStatuses.map((room) => (
                    <Link
                      key={room.id}
                      to="/admin/rooms"
                      className="flex items-center justify-between p-4 border border-yellow-500 rounded-lg hover:bg-yellow-500/10 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-card border border-border flex items-center justify-center">
                          <span className="font-semibold">{room.room_number}</span>
                        </div>
                        <div>
                          <p className="font-medium">{room.room_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {room.current_guest ? `${room.current_guest} • Until ${room.checkout_date}` : "No guest"}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(room.status)}`}>
                        {room.status}
                      </Badge>
                    </Link>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="font-serif text-2xl mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" asChild className="h-auto py-6 flex-col gap-2 hover:bg-yellow-500 hover:text-white hover:border-yellow-500 group">
                <Link to="/admin/bookings">
                  <Calendar className="w-6 h-6 text-yellow-500 group-hover:text-white" />
                  <span>New Booking</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-auto py-6 flex-col gap-2 hover:bg-yellow-500 hover:text-white hover:border-yellow-500 group">
                <Link to="/admin/bookings">
                  <CheckCircle className="w-6 h-6 text-yellow-500 group-hover:text-white" />
                  <span>Check In</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-auto py-6 flex-col gap-2 hover:bg-yellow-500 hover:text-white hover:border-yellow-500 group">
                <Link to="/admin/bookings">
                  <XCircle className="w-6 h-6 text-yellow-500 group-hover:text-white" />
                  <span>Check Out</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-auto py-6 flex-col gap-2 hover:bg-yellow-500 hover:text-white hover:border-yellow-500 group">
                <Link to="/admin/rooms">
                  <Clock className="w-6 h-6 text-yellow-500 group-hover:text-white" />
                  <span>Housekeeping</span>
                </Link>
              </Button>
            </div>
          </Card>
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

export default AdminDashboard;
