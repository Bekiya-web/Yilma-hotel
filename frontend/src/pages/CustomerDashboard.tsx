import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, CreditCard, User, Bell, LogOut, Clock, CheckCircle, XCircle, Phone, Mail, MapPin, FileText } from "lucide-react";
import SiteLayout from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getBookingsByEmail, getGuestByEmail, updateGuestProfile, cancelBooking } from "@/api/bookings.api";
import type { Guest, Booking } from "@/types/database";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [customerEmail, setCustomerEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Get return URL from location state
  const returnTo = (location.state as { returnTo?: string })?.returnTo;

  // Fetch customer profile
  const { data: customerData, isLoading: profileLoading } = useQuery({
    queryKey: ['customer-profile', customerEmail],
    queryFn: () => getGuestByEmail(customerEmail),
    enabled: isLoggedIn && !!customerEmail,
  });

  // Fetch customer bookings
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['customer-bookings', customerEmail],
    queryFn: () => getBookingsByEmail(customerEmail),
    enabled: isLoggedIn && !!customerEmail,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (updates: Partial<Guest>) => updateGuestProfile(customerEmail, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-profile'] });
      toast.success("Profile updated successfully");
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId: string) => cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      toast.success("Booking cancelled successfully");
    },
    onError: () => {
      toast.error("Failed to cancel booking");
    },
  });

  useEffect(() => {
    // Check if customer is logged in (check localStorage or session)
    const email = localStorage.getItem("customerEmail");
    if (email) {
      setCustomerEmail(email);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("customerEmail");
    setIsLoggedIn(false);
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerData) {
      updateProfileMutation.mutate({
        first_name: customerData.first_name,
        last_name: customerData.last_name,
        phone: customerData.phone,
      });
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      cancelBookingMutation.mutate(bookingId);
    }
  };

  const viewBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "telebirr": return "Telebirr";
      case "bank": return "Bank Transfer";
      case "hotel": return "Pay at Hotel";
      default: return "Unknown";
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      confirmed: "default",
      pending: "secondary",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    if (status === "paid" || status === "verified") {
      return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Paid</Badge>;
    } else if (status === "failed") {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
    } else {
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  // Login form for customers
  if (!isLoggedIn) {
    return (
      <SiteLayout>
        <section className="py-32">
          <div className="container max-w-md">
            <Card className="p-8">
              <div className="text-center mb-8">
                <h1 className="font-serif text-3xl mb-2">Customer Portal</h1>
                <p className="text-sm text-muted-foreground">
                  Access your bookings and manage your account
                </p>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (customerEmail) {
                    try {
                      // Validate email exists in database
                      const guest = await getGuestByEmail(customerEmail);
                      
                      if (!guest) {
                        toast.error("No account found with this email. Please make a booking first to create an account.");
                        return;
                      }

                      // Email is valid - allow login even without bookings
                      localStorage.setItem("customerEmail", customerEmail);
                      setIsLoggedIn(true);
                      toast.success("Logged in successfully");
                      
                      // Redirect to return URL if provided, otherwise stay on dashboard
                      if (returnTo) {
                        navigate(returnTo);
                      }
                    } catch (error) {
                      toast.error("Failed to verify email. Please try again.");
                    }
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" variant="hero" size="lg" className="w-full">
                  Access Dashboard
                </Button>
              </form>
              <p className="text-xs text-center text-muted-foreground mt-6">
                Enter the email you used for booking. Only registered guests can access the dashboard.
              </p>
            </Card>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="pt-32 pb-12 border-b border-border">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-4xl mb-2">
                Welcome back, {customerData?.first_name || 'Guest'}!
              </h1>
              <p className="text-muted-foreground">Manage your bookings and account</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </section>
      <section className="py-12">
        <div className="container">
          <Tabs defaultValue="bookings" className="space-y-8">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="bookings">
                <Calendar className="w-4 h-4 mr-2" />
                Bookings
              </TabsTrigger>
              <TabsTrigger value="profile">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
            </TabsList>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl mb-4">My Bookings</h2>
                {bookingsLoading ? (
                  <div className="text-center py-20">
                    <p className="text-muted-foreground">Loading bookings...</p>
                  </div>
                ) : bookings.length > 0 ? (
                  <div className="grid gap-4">
                    {bookings.map((booking) => (
                      <Card key={booking.id} className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="font-serif text-xl">{booking.room?.name || 'Room'}</h3>
                              {getStatusBadge(booking.status)}
                              {getPaymentBadge(booking.payment_status)}
                            </div>

                            {/* Status Explanation */}
                            {booking.status === "pending" && (
                              <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                                <p className="text-xs text-yellow-700 dark:text-yellow-600">
                                  {booking.payment_status === 'pending' 
                                    ? '⏳ Your booking is being reviewed. We will verify your payment and confirm within 24 hours.'
                                    : '⏳ Payment verified! Your booking will be confirmed shortly.'}
                                </p>
                              </div>
                            )}

                            {booking.status === "confirmed" && (
                              <div className="mb-3 p-2 bg-green-500/10 border border-green-500/20 rounded-md">
                                <p className="text-xs text-green-700 dark:text-green-600">
                                  ✓ Your booking is confirmed! We look forward to welcoming you.
                                </p>
                              </div>
                            )}

                            <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                              <p>
                                <strong>Booking ID:</strong> {booking.booking_id}
                              </p>
                              <p>
                                <strong>Guests:</strong> {booking.guests_count}
                              </p>
                              <p>
                                <strong>Check-in:</strong>{" "}
                                {new Date(booking.check_in).toLocaleDateString()}
                              </p>
                              <p>
                                <strong>Check-out:</strong>{" "}
                                {new Date(booking.check_out).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="mt-3 text-lg font-semibold text-yellow-600">
                              ETB {booking.amount.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            {booking.status === "confirmed" && (
                              <Button variant="outline" size="sm" onClick={() => viewBookingDetails(booking)}>
                                View Details
                              </Button>
                            )}
                            {booking.status === "pending" && (
                              <>
                                {booking.payment_status === 'pending' && booking.payment_method !== 'hotel' && (
                                  <Button variant="outline" size="sm" disabled>
                                    Payment Under Review
                                  </Button>
                                )}
                                {booking.payment_status === 'verified' && (
                                  <Button variant="outline" size="sm" disabled className="text-green-600">
                                    Payment Verified ✓
                                  </Button>
                                )}
                                <Button variant="outline" size="sm" onClick={() => viewBookingDetails(booking)}>
                                  View Details
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleCancelBooking(booking.id)}
                                  disabled={cancelBookingMutation.isPending}
                                >
                                  {cancelBookingMutation.isPending ? 'Cancelling...' : 'Cancel'}
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-serif text-xl mb-2">No Bookings Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      You haven't made any bookings with this email address.
                    </p>
                    <Button variant="hero" onClick={() => navigate('/rooms')}>
                      Browse Rooms
                    </Button>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card className="p-8 max-w-2xl">
                <h2 className="font-serif text-2xl mb-6">Profile Information</h2>
                {profileLoading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading profile...</p>
                  </div>
                ) : customerData ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input
                          value={customerData.first_name}
                          onChange={(e) => {
                            // Update local state for controlled input
                            queryClient.setQueryData(['customer-profile', customerEmail], {
                              ...customerData,
                              first_name: e.target.value
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input
                          value={customerData.last_name}
                          onChange={(e) => {
                            queryClient.setQueryData(['customer-profile', customerEmail], {
                              ...customerData,
                              last_name: e.target.value
                            });
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={customerData.email}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        type="tel"
                        value={customerData.phone || ''}
                        onChange={(e) => {
                          queryClient.setQueryData(['customer-profile', customerEmail], {
                            ...customerData,
                            phone: e.target.value
                          });
                        }}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      variant="hero"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Profile not found</p>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card className="p-8 max-w-2xl">
                <h2 className="font-serif text-2xl mb-6">Notifications</h2>
                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-start gap-4 p-4 border border-border rounded-md">
                        <Bell className="w-5 h-5 text-yellow-600 mt-1" />
                        <div>
                          <h3 className="font-medium mb-1">
                            {booking.status === 'confirmed' ? 'Booking Confirmed' : 
                             booking.status === 'pending' ? 'Booking Pending' : 
                             'Booking Update'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {booking.status === 'confirmed' 
                              ? `Your booking ${booking.booking_id} has been confirmed. Check-in: ${new Date(booking.check_in).toLocaleDateString()}`
                              : booking.status === 'pending'
                              ? `Complete payment for booking ${booking.booking_id} to confirm your reservation`
                              : `Booking ${booking.booking_id} status: ${booking.status}`
                            }
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(booking.created_at || '').toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No notifications yet</p>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Booking Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Booking Details</DialogTitle>
            <DialogDescription>
              Complete information about your reservation
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              {/* Booking Status */}
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <h3 className="font-semibold text-lg">{selectedBooking.booking_id}</h3>
                  <p className="text-sm text-muted-foreground">
                    Booked on {formatDate(selectedBooking.created_at || '')}
                  </p>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(selectedBooking.status)}
                  {getPaymentBadge(selectedBooking.payment_status)}
                </div>
              </div>

              {/* Room Information */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  Room Details
                </h4>
                <div className="bg-muted/30 p-4 rounded-md space-y-3">
                  <div className="flex items-start gap-4">
                    {selectedBooking.room?.image && (
                      <img 
                        src={selectedBooking.room.image} 
                        alt={selectedBooking.room.name}
                        className="w-24 h-24 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1">
                      <h5 className="font-medium text-lg">{selectedBooking.room?.name || 'Room'}</h5>
                      <p className="text-sm text-muted-foreground">{selectedBooking.room?.view}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Bed:</strong> {selectedBooking.room?.bed}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stay Information */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  Stay Information
                </h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-md">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-yellow-600" />
                    <div>
                      <p className="text-muted-foreground">Check-in</p>
                      <p className="font-medium">{formatDate(selectedBooking.check_in)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-yellow-600" />
                    <div>
                      <p className="text-muted-foreground">Check-out</p>
                      <p className="font-medium">{formatDate(selectedBooking.check_out)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-yellow-600" />
                    <div>
                      <p className="text-muted-foreground">Guests</p>
                      <p className="font-medium">{selectedBooking.guests_count} people</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-yellow-600" />
                    <div>
                      <p className="text-muted-foreground">Total Amount</p>
                      <p className="font-semibold text-yellow-600">ETB {selectedBooking.amount.toLocaleString()}</p>
                    </div>
                  </div>
                  {selectedBooking.special_requests && (
                    <div className="md:col-span-2 flex items-start gap-2">
                      <FileText className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-muted-foreground">Special Requests</p>
                        <p className="font-medium">{selectedBooking.special_requests}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  Payment Information
                </h4>
                <div className="bg-muted/30 p-4 rounded-md space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span className="font-medium">{getPaymentMethodLabel(selectedBooking.payment_method || '')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Status:</span>
                    {getPaymentBadge(selectedBooking.payment_status)}
                  </div>
                  {selectedBooking.payment_status === 'pending' && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-3 mt-3">
                      <p className="text-sm text-yellow-600">
                        ⏳ Your payment is being verified. We'll confirm your booking within 24 hours.
                      </p>
                    </div>
                  )}
                  {selectedBooking.payment_status === 'verified' && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-md p-3 mt-3">
                      <p className="text-sm text-green-600">
                        ✓ Payment verified! Your booking is confirmed.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  Need Help?
                </h4>
                <div className="bg-muted/30 p-4 rounded-md space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-yellow-600" />
                    <span>Call us: +251 911 234 567</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-yellow-600" />
                    <span>Email: info@yilmahotel.com</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedBooking.status === 'pending' && (
                <div className="pt-4 border-t">
                  <Button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleCancelBooking(selectedBooking.id);
                    }}
                    variant="destructive"
                    className="w-full"
                  >
                    Cancel This Booking
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
};

export default CustomerDashboard;
