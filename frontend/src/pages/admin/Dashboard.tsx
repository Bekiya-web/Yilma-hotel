import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  DollarSign, 
  Star,
  Calendar,
  BedDouble,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDashboardStats, getBookings, getRoomStatuses } from "@/lib/supabase";
import { useRef } from "react";

const AdminDashboard = () => {
  const statsScrollRef = useRef<HTMLDivElement>(null);
  const bookingsScrollRef = useRef<HTMLDivElement>(null);
  const roomsScrollRef = useRef<HTMLDivElement>(null);
  const actionsScrollRef = useRef<HTMLDivElement>(null);

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
    { label: "Total Revenue", value: `ETB ${stats.totalRevenue.toLocaleString()}`, change: stats.revenueChange, trend: "up", icon: DollarSign },
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

  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="font-serif text-2xl md:text-3xl mb-1 md:mb-2">Welcome back, Admin</h1>
        <p className="text-muted-foreground text-sm md:text-base">Here's what's happening with your hotel today.</p>
      </div>

      {/* Stats Grid - Swipeable on Mobile */}
      <div className="relative -mx-3 md:mx-0 px-3 md:px-0">
        <div 
          ref={statsScrollRef}
          className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 overflow-x-auto md:overflow-visible scrollbar-hide snap-x snap-mandatory pb-2"
        >
          {statsDisplay.map((stat) => (
            <Link 
              key={stat.label} 
              to={
                stat.label === "Total Revenue" ? "/admin/revenue" :
                stat.label === "Bookings Today" ? "/admin/bookings" :
                stat.label === "Occupancy Rate" ? "/admin/rooms" :
                "/admin/reviews"
              }
              className="flex-shrink-0 w-[calc(100vw-3rem)] md:w-auto snap-center first:ml-0"
            >
              <Card className="p-4 md:p-6 hover:shadow-lg hover:border-yellow-500 transition-all cursor-pointer h-full">
                <div className="flex items-start justify-between mb-3 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-yellow-500 border border-yellow-500 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <span className={`text-xs md:text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-xl md:text-3xl font-serif font-semibold break-words">{stat.value}</p>
              </Card>
            </Link>
          ))}
        </div>
        {/* Scroll Indicators for Mobile */}
        <button 
          onClick={() => scroll(statsScrollRef, 'left')}
          className="md:hidden absolute left-1 top-1/2 -translate-y-1/2 bg-yellow-500 text-white p-2 rounded-full shadow-lg z-10"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button 
          onClick={() => scroll(statsScrollRef, 'right')}
          className="md:hidden absolute right-1 top-1/2 -translate-y-1/2 bg-yellow-500 text-white p-2 rounded-full shadow-lg z-10"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Bookings - Swipeable on Mobile */}
        <Card className="p-4 md:p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="font-serif text-lg md:text-2xl">Recent Bookings</h2>
            <Button variant="outline" size="sm" asChild className="hover:bg-yellow-500 hover:text-white hover:border-yellow-500 text-xs md:text-sm">
              <Link to="/admin/bookings">View All</Link>
            </Button>
          </div>
          <div className="relative -mx-4 md:mx-0 px-4 md:px-0">
            <div 
              ref={bookingsScrollRef}
              className="flex md:flex-col gap-3 md:gap-4 overflow-x-auto md:overflow-visible scrollbar-hide snap-x snap-mandatory pb-2 md:pb-0"
            >
              {recentBookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm md:text-base w-full">No bookings yet</p>
              ) : (
                recentBookings.map((booking) => (
                  <Link 
                    key={booking.id} 
                    to="/admin/bookings"
                    className="flex-shrink-0 w-[calc(100vw-5rem)] md:w-auto snap-center flex items-center justify-between p-3 md:p-4 border border-yellow-500 rounded-lg hover:bg-yellow-500/10 transition-colors cursor-pointer"
                  >
                    <div className="flex-1 min-w-0 mr-2">
                      <div className="flex items-center gap-2 md:gap-3 mb-1 flex-wrap">
                        <p className="font-medium text-sm md:text-base truncate">
                          {booking.guest ? `${booking.guest.first_name} ${booking.guest.last_name}` : 'Guest'}
                        </p>
                        <Badge className={`text-xs ${getStatusColor(booking.status)} flex-shrink-0`}>
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground truncate">
                        {booking.room?.name || 'Room'} • {new Date(booking.check_in).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center flex-shrink-0">
                      <p className="font-semibold text-yellow-500 text-sm md:text-base whitespace-nowrap">ETB {booking.amount.toLocaleString()}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
            {recentBookings.length > 0 && (
              <>
                <button 
                  onClick={() => scroll(bookingsScrollRef, 'left')}
                  className="md:hidden absolute left-1 top-1/2 -translate-y-1/2 bg-yellow-500 text-white p-1.5 rounded-full shadow-lg z-10"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => scroll(bookingsScrollRef, 'right')}
                  className="md:hidden absolute right-1 top-1/2 -translate-y-1/2 bg-yellow-500 text-white p-1.5 rounded-full shadow-lg z-10"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </Card>

        {/* Room Status - Swipeable on Mobile */}
        <Card className="p-4 md:p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="font-serif text-lg md:text-2xl">Room Status</h2>
            <Button variant="outline" size="sm" asChild className="hover:bg-yellow-500 hover:text-white hover:border-yellow-500 text-xs md:text-sm">
              <Link to="/admin/rooms">Manage Rooms</Link>
            </Button>
          </div>
          <div className="relative -mx-4 md:mx-0 px-4 md:px-0">
            <div 
              ref={roomsScrollRef}
              className="flex md:flex-col gap-3 md:gap-4 overflow-x-auto md:overflow-visible scrollbar-hide snap-x snap-mandatory pb-2 md:pb-0"
            >
              {roomStatuses.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm md:text-base w-full">No room status data</p>
              ) : (
                roomStatuses.map((room) => (
                  <Link
                    key={room.id}
                    to="/admin/rooms"
                    className="flex-shrink-0 w-[calc(100vw-5rem)] md:w-auto snap-center flex items-center justify-between p-3 md:p-4 border border-yellow-500 rounded-lg hover:bg-yellow-500/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1 mr-2">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-card border border-border flex items-center justify-center flex-shrink-0">
                        <span className="font-semibold text-sm md:text-base">{room.room_number}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm md:text-base truncate">{room.room_type}</p>
                        <p className="text-xs md:text-sm text-muted-foreground truncate">
                          {room.current_guest ? `${room.current_guest} • Until ${room.checkout_date}` : "No guest"}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(room.status)} text-xs flex-shrink-0`}>
                      {room.status}
                    </Badge>
                  </Link>
                ))
              )}
            </div>
            {roomStatuses.length > 0 && (
              <>
                <button 
                  onClick={() => scroll(roomsScrollRef, 'left')}
                  className="md:hidden absolute left-1 top-1/2 -translate-y-1/2 bg-yellow-500 text-white p-1.5 rounded-full shadow-lg z-10"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => scroll(roomsScrollRef, 'right')}
                  className="md:hidden absolute right-1 top-1/2 -translate-y-1/2 bg-yellow-500 text-white p-1.5 rounded-full shadow-lg z-10"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions - Swipeable on Mobile */}
      <Card className="p-4 md:p-6 overflow-hidden">
        <h2 className="font-serif text-lg md:text-2xl mb-4 md:mb-6">Quick Actions</h2>
        <div className="relative -mx-4 md:mx-0 px-4 md:px-0">
          <div 
            ref={actionsScrollRef}
            className="flex md:grid md:grid-cols-4 gap-3 md:gap-4 overflow-x-auto md:overflow-visible scrollbar-hide snap-x snap-mandatory pb-2 md:pb-0"
          >
            <Button variant="outline" asChild className="flex-shrink-0 w-[calc(50vw-2.5rem)] md:w-auto snap-center h-auto py-4 md:py-6 flex-col gap-2 hover:bg-yellow-500 hover:text-white hover:border-yellow-500 group">
              <Link to="/admin/bookings">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-yellow-500 group-hover:text-white" />
                <span className="text-xs md:text-sm">New Booking</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-shrink-0 w-[calc(50vw-2.5rem)] md:w-auto snap-center h-auto py-4 md:py-6 flex-col gap-2 hover:bg-yellow-500 hover:text-white hover:border-yellow-500 group">
              <Link to="/admin/bookings">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-yellow-500 group-hover:text-white" />
                <span className="text-xs md:text-sm">Check In</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-shrink-0 w-[calc(50vw-2.5rem)] md:w-auto snap-center h-auto py-4 md:py-6 flex-col gap-2 hover:bg-yellow-500 hover:text-white hover:border-yellow-500 group">
              <Link to="/admin/bookings">
                <XCircle className="w-5 h-5 md:w-6 md:h-6 text-yellow-500 group-hover:text-white" />
                <span className="text-xs md:text-sm">Check Out</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-shrink-0 w-[calc(50vw-2.5rem)] md:w-auto snap-center h-auto py-4 md:py-6 flex-col gap-2 hover:bg-yellow-500 hover:text-white hover:border-yellow-500 group">
              <Link to="/admin/rooms">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-yellow-500 group-hover:text-white" />
                <span className="text-xs md:text-sm">Housekeeping</span>
              </Link>
            </Button>
          </div>
          <button 
            onClick={() => scroll(actionsScrollRef, 'left')}
            className="md:hidden absolute left-1 top-1/2 -translate-y-1/2 bg-yellow-500 text-white p-1.5 rounded-full shadow-lg z-10"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button 
            onClick={() => scroll(actionsScrollRef, 'right')}
            className="md:hidden absolute right-1 top-1/2 -translate-y-1/2 bg-yellow-500 text-white p-1.5 rounded-full shadow-lg z-10"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
