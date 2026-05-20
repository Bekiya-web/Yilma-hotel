import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Rooms from "./pages/Rooms.tsx";
import RoomDetail from "./pages/RoomDetail.tsx";
import Checkout from "./pages/Checkout.tsx";
import Reviews from "./pages/Reviews.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import Gallery from "./pages/Gallery.tsx";
import CustomerDashboard from "./pages/CustomerDashboard.tsx";
import AdminDashboard from "./pages/admin/Dashboard.tsx";
import AdminLogin from "./pages/admin/Login.tsx";
import AdminBookings from "./pages/admin/Bookings.tsx";
import AdminRooms from "./pages/admin/Rooms.tsx";
import AdminGuests from "./pages/admin/Guests.tsx";
import AdminRevenue from "./pages/admin/Revenue.tsx";
import AdminReviews from "./pages/admin/ReviewsAdmin.tsx";
import AdminSettings from "./pages/admin/Settings.tsx";
import AdminGallery from "./pages/admin/GalleryAdmin.tsx";
import AdminLayout from "./components/admin/AdminLayout.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:id" element={<RoomDetail />} />
          <Route path="/checkout/:id" element={<Checkout />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/my-bookings" element={<CustomerDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/bookings" element={<AdminLayout><AdminBookings /></AdminLayout>} />
          <Route path="/admin/rooms" element={<AdminLayout><AdminRooms /></AdminLayout>} />
          <Route path="/admin/guests" element={<AdminLayout><AdminGuests /></AdminLayout>} />
          <Route path="/admin/revenue" element={<AdminLayout><AdminRevenue /></AdminLayout>} />
          <Route path="/admin/reviews" element={<AdminLayout><AdminReviews /></AdminLayout>} />
          <Route path="/admin/gallery" element={<AdminLayout><AdminGallery /></AdminLayout>} />
          <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
