import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Search, Filter, Edit, Trash2, CheckCircle, XCircle, Eye, Phone, Building2, Wallet, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getBookings, updateBooking, deleteBooking } from "@/lib/supabase";
import { toast } from "sonner";
import { getCurrentAdmin } from "@/api/auth.api";
import type { Booking } from "@/types/database";

const AdminBookings = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Get current admin's email for auto-filling in messages
  const currentAdmin = getCurrentAdmin();
  const adminEmail = currentAdmin?.email || "admin@yilmahotel.com";

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: getBookings
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Booking> }) => 
      updateBooking(id, updates),
    onSuccess: (updatedBooking) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      
      // Update the selected booking in the modal immediately
      if (selectedBooking && updatedBooking) {
        setSelectedBooking(updatedBooking);
      }
      
      toast.success("Booking updated successfully!");
    },
    onError: (error: Error) => {
      toast.error("Failed to update booking", { description: error.message });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success("Booking deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete booking", { description: error.message });
    }
  });

  const handleStatusChange = (bookingId: string, newStatus: string) => {
    updateMutation.mutate({ 
      id: bookingId, 
      updates: { status: newStatus as Booking['status'] } 
    });
  };

  const handleDelete = (id: string, bookingId: string) => {
    if (confirm(`Are you sure you want to delete booking ${bookingId}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleApprove = (booking: Booking) => {
    updateMutation.mutate({ 
      id: booking.id, 
      updates: { 
        status: 'confirmed',
        payment_status: 'verified'
      } 
    });
    setShowDetailsModal(false);
    toast.success("Booking approved and confirmed!");
  };

  const handleReject = (booking: Booking) => {
    if (confirm(`Are you sure you want to reject booking ${booking.booking_id}?`)) {
      updateMutation.mutate({ 
        id: booking.id, 
        updates: { 
          status: 'cancelled',
          payment_status: 'failed'
        } 
      });
      setShowDetailsModal(false);
      toast.success("Booking rejected");
    }
  };

  const viewBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = searchTerm === "" || 
      booking.booking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.guest && `${booking.guest.first_name} ${booking.guest.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.room && booking.room.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-500/10 text-green-600 border-green-500/30";
      case "pending": return "bg-yellow-500 text-white border-yellow-500";
      case "cancelled": return "bg-red-500/10 text-red-600 border-red-500/30";
      case "completed": return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/30";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "bg-green-500/10 text-green-600 border-green-500/30";
      case "pending": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
      case "failed": return "bg-red-500/10 text-red-600 border-red-500/30";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/30";
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "telebirr": return <Phone className="w-4 h-4" />;
      case "bank": return <Building2 className="w-4 h-4" />;
      case "hotel": return <Wallet className="w-4 h-4" />;
      default: return null;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "telebirr": return "Telebirr";
      case "bank": return "Bank Transfer";
      case "hotel": return "Pay at Hotel";
      default: return "Unknown";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-yellow-500 mb-6 transition-smooth">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        
        <div className="mb-8">
          <h1 className="font-serif text-4xl mb-2">Bookings Management</h1>
          <p className="text-muted-foreground">View and manage all hotel bookings.</p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by booking ID, guest name, or room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Bookings List */}
        {isLoading ? (
          <p className="text-center text-muted-foreground py-12">Loading bookings...</p>
        ) : filteredBookings.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all" 
                ? "No bookings match your filters." 
                : "No bookings yet. Bookings will appear here when guests make reservations."}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-lg">{booking.booking_id}</h3>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Created: {formatDate(booking.created_at || '')}
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Guest:</span>
                        <span className="ml-2 font-medium">
                          {booking.guest 
                            ? `${booking.guest.first_name} ${booking.guest.last_name}`
                            : 'Unknown'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <span className="ml-2">{booking.guest?.email || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="ml-2">{booking.guest?.phone || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Room:</span>
                        <span className="ml-2 font-medium">{booking.room?.name || 'Unknown'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Check-in:</span>
                        <span className="ml-2">{formatDate(booking.check_in)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Check-out:</span>
                        <span className="ml-2">{formatDate(booking.check_out)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Guests:</span>
                        <span className="ml-2">{booking.guests_count} people</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="ml-2 font-semibold text-yellow-500">ETB {booking.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Payment:</span>
                        <div className="flex items-center gap-1">
                          {booking.payment_method && getPaymentMethodIcon(booking.payment_method)}
                          <span className="ml-1">{booking.payment_method ? getPaymentMethodLabel(booking.payment_method) : 'N/A'}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Payment Status:</span>
                        <Badge className={`ml-2 ${getPaymentStatusColor(booking.payment_status || 'pending')}`}>
                          {booking.payment_status || 'pending'}
                        </Badge>
                      </div>
                      {booking.special_requests && (
                        <div className="md:col-span-2">
                          <span className="text-muted-foreground">Special Requests:</span>
                          <span className="ml-2">{booking.special_requests}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => viewBookingDetails(booking)}
                      className="flex-1 lg:w-40"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>

                    {/* Quick Verify Payment Button */}
                    {booking.status === 'pending' && booking.payment_status === 'pending' && booking.payment_method !== 'hotel' && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          updateMutation.mutate({ 
                            id: booking.id, 
                            updates: { 
                              payment_status: 'verified'
                            } 
                          });
                        }}
                        disabled={updateMutation.isPending}
                        className="flex-1 lg:w-40 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verify Payment
                      </Button>
                    )}
                    
                    <Select 
                      value={booking.status} 
                      onValueChange={(value) => handleStatusChange(booking.id, value)}
                      disabled={updateMutation.isPending}
                    >
                      <SelectTrigger className="flex-1 lg:w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(booking.id, booking.booking_id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Summary */}
        {!isLoading && filteredBookings.length > 0 && (
          <Card className="p-6 mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-2xl font-serif font-semibold">{filteredBookings.length}</p>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
              </div>
              <div>
                <p className="text-2xl font-serif font-semibold text-yellow-500">
                  {filteredBookings.filter(b => b.status === 'confirmed').length}
                </p>
                <p className="text-sm text-muted-foreground">Confirmed</p>
              </div>
              <div>
                <p className="text-2xl font-serif font-semibold text-green-600">
                  {filteredBookings.filter(b => b.status === 'completed').length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-serif font-semibold text-blue-600">
                  ETB {filteredBookings.reduce((sum, b) => sum + Number(b.amount), 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </Card>
        )}

        {/* Booking Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Booking Details</DialogTitle>
              <DialogDescription>
                Complete information about this booking
              </DialogDescription>
            </DialogHeader>

            {selectedBooking && (
              <div className="space-y-6">
                {/* Booking ID and Status */}
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedBooking.booking_id}</h3>
                    <p className="text-sm text-muted-foreground">
                      Created: {formatDate(selectedBooking.created_at || '')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(selectedBooking.status)}>
                      {selectedBooking.status}
                    </Badge>
                    <Badge className={getPaymentStatusColor(selectedBooking.payment_status || 'pending')}>
                      {selectedBooking.payment_status || 'pending'}
                    </Badge>
                  </div>
                </div>

                {/* Guest Information */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    Guest Information
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-md">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <span className="ml-2 font-medium">
                        {selectedBooking.guest 
                          ? `${selectedBooking.guest.first_name} ${selectedBooking.guest.last_name}`
                          : 'Unknown'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <span className="ml-2">{selectedBooking.guest?.email || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="ml-2 font-medium">{selectedBooking.guest?.phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Guests Count:</span>
                      <span className="ml-2">{selectedBooking.guests_count} people</span>
                    </div>
                  </div>
                </div>

                {/* Room & Stay Information */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    Room & Stay Details
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-md">
                    <div>
                      <span className="text-muted-foreground">Room:</span>
                      <span className="ml-2 font-medium">{selectedBooking.room?.name || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="ml-2 font-semibold text-yellow-500">ETB {selectedBooking.amount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Check-in:</span>
                      <span className="ml-2">{formatDate(selectedBooking.check_in)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Check-out:</span>
                      <span className="ml-2">{formatDate(selectedBooking.check_out)}</span>
                    </div>
                    {selectedBooking.special_requests && (
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground">Special Requests:</span>
                        <p className="mt-1 text-foreground">{selectedBooking.special_requests}</p>
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
                  <div className="space-y-4 bg-muted/30 p-4 rounded-md">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Payment Method:</span>
                        <div className="flex items-center gap-2 mt-1">
                          {selectedBooking.payment_method && getPaymentMethodIcon(selectedBooking.payment_method)}
                          <span className="font-medium">
                            {selectedBooking.payment_method ? getPaymentMethodLabel(selectedBooking.payment_method) : 'Not specified'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Payment Status:</span>
                        <div className="mt-1">
                          <Badge className={getPaymentStatusColor(selectedBooking.payment_status || 'pending')}>
                            {selectedBooking.payment_status || 'pending'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Payment Proof */}
                    {selectedBooking.payment_proof_url && (
                      <div>
                        <span className="text-muted-foreground text-sm">Payment Proof:</span>
                        <div className="mt-2 border border-border rounded-md overflow-hidden">
                          <img 
                            src={selectedBooking.payment_proof_url} 
                            alt="Payment proof" 
                            className="w-full h-auto max-h-96 object-contain bg-muted"
                          />
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(selectedBooking.payment_proof_url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open in New Tab
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = selectedBooking.payment_proof_url!;
                              link.download = `payment-proof-${selectedBooking.booking_id}.jpg`;
                              link.click();
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    )}

                    {!selectedBooking.payment_proof_url && selectedBooking.payment_method !== 'hotel' && (
                      <div className="text-sm text-muted-foreground italic">
                        No payment proof uploaded yet
                      </div>
                    )}

                    {selectedBooking.payment_method === 'hotel' && (
                      <div className="text-sm text-green-600 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Payment will be collected at the hotel
                      </div>
                    )}
                  </div>
                </div>

                {/* ID Verification */}
                {(selectedBooking.id_type || selectedBooking.id_front_url || selectedBooking.id_back_url) && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                      ID Verification
                    </h4>
                    <div className="space-y-4 bg-muted/30 p-4 rounded-md">
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">ID Type:</span>
                          <div className="mt-1">
                            <span className="font-medium capitalize">
                              {selectedBooking.id_type?.replace('_', ' ') || 'Not specified'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Verification Status:</span>
                          <div className="mt-1">
                            <Badge className={selectedBooking.id_verified ? 'bg-green-500/10 text-green-600 border-green-500/30' : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30'}>
                              {selectedBooking.id_verified ? 'Verified' : 'Pending Verification'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* ID Images */}
                      <div className="grid md:grid-cols-2 gap-4">
                        {selectedBooking.id_front_url && (
                          <div>
                            <span className="text-muted-foreground text-sm">ID Front:</span>
                            <div className="mt-2 border border-border rounded-md overflow-hidden">
                              <img 
                                src={selectedBooking.id_front_url} 
                                alt="ID Front" 
                                className="w-full h-auto max-h-64 object-contain bg-muted"
                              />
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full mt-2"
                              onClick={() => window.open(selectedBooking.id_front_url, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View Full Size
                            </Button>
                          </div>
                        )}

                        {selectedBooking.id_back_url && (
                          <div>
                            <span className="text-muted-foreground text-sm">ID Back:</span>
                            <div className="mt-2 border border-border rounded-md overflow-hidden">
                              <img 
                                src={selectedBooking.id_back_url} 
                                alt="ID Back" 
                                className="w-full h-auto max-h-64 object-contain bg-muted"
                              />
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full mt-2"
                              onClick={() => window.open(selectedBooking.id_back_url, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View Full Size
                            </Button>
                          </div>
                        )}
                      </div>

                      {!selectedBooking.id_verified && selectedBooking.status === 'pending' && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-3">
                          <p className="text-sm text-yellow-600 mb-3">
                            ⚠️ ID verification pending. Please review the ID images above before approving the booking.
                          </p>
                          <Button
                            onClick={() => {
                              updateMutation.mutate({ 
                                id: selectedBooking.id, 
                                updates: { 
                                  id_verified: true
                                } 
                              });
                              toast.success("ID verified successfully!");
                            }}
                            disabled={updateMutation.isPending}
                            size="sm"
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Verify ID Documents
                          </Button>
                        </div>
                      )}

                      {selectedBooking.id_verified && (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-md p-3 text-center">
                          <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                          <p className="text-sm text-green-600 font-medium">
                            ID Documents Verified ✓
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedBooking.status === 'pending' && (
                  <div className="space-y-3 pt-4 border-t">
                    {/* Payment Verification Section - Only show if payment is pending */}
                    {selectedBooking.payment_status === 'pending' && selectedBooking.payment_method !== 'hotel' && selectedBooking.payment_proof_url && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-4 mb-3">
                        <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                          Step 1: Verify Payment
                        </h5>
                        <p className="text-sm text-muted-foreground mb-3">
                          Review the payment proof above and verify the payment.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              updateMutation.mutate({ 
                                id: selectedBooking.id, 
                                updates: { 
                                  payment_status: 'verified'
                                } 
                              });
                              toast.success("Payment verified successfully!");
                            }}
                            disabled={updateMutation.isPending}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Verify Payment
                          </Button>
                          <Button
                            onClick={() => {
                              if (confirm("Are you sure you want to reject this payment?")) {
                                updateMutation.mutate({ 
                                  id: selectedBooking.id, 
                                  updates: { 
                                  payment_status: 'failed',
                                    status: 'cancelled'
                                  } 
                                });
                                toast.success("Payment rejected");
                                setShowDetailsModal(false);
                              }
                            }}
                            disabled={updateMutation.isPending}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject Payment
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Payment Verified Confirmation */}
                    {(selectedBooking.payment_status === 'verified' || selectedBooking.payment_method === 'hotel') && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-md p-3 text-center mb-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                        <p className="text-sm text-green-600 font-medium">
                          {selectedBooking.payment_method === 'hotel' 
                            ? 'Payment will be collected at hotel ✓' 
                            : 'Payment Verified ✓'}
                        </p>
                      </div>
                    )}

                    {/* Final Approval Section */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-4 mb-3">
                      <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        {(selectedBooking.payment_status === 'verified' || selectedBooking.payment_method === 'hotel') && selectedBooking.id_verified
                          ? 'Step 2: Final Approval'
                          : 'Final Step: Approve Booking'}
                      </h5>
                      <p className="text-sm text-muted-foreground mb-3">
                        {!(selectedBooking.payment_status === 'verified' || selectedBooking.payment_method === 'hotel')
                          ? '⚠️ Please verify payment first'
                          : !selectedBooking.id_verified
                          ? '⚠️ Please verify ID documents first'
                          : 'All verifications complete. Ready to approve!'}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(selectedBooking)}
                          disabled={
                            updateMutation.isPending || 
                            !(selectedBooking.payment_status === 'verified' || selectedBooking.payment_method === 'hotel') ||
                            !selectedBooking.id_verified
                          }
                          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve & Confirm Booking
                        </Button>
                        <Button
                          onClick={() => handleReject(selectedBooking)}
                          disabled={updateMutation.isPending}
                          variant="outline"
                          className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject Booking
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        const email = selectedBooking.guest?.email;
                        const phone = selectedBooking.guest?.phone;
                        const subject = `Regarding Your Booking ${selectedBooking.booking_id}`;
                        const body = `Dear ${selectedBooking.guest?.first_name},\n\nWe need to discuss your booking ${selectedBooking.booking_id}.\n\nBest regards,\n${adminEmail}\nAuréa Grand Hotel`;
                        
                        if (email) {
                          window.location.href = `mailto:${email}?from=${encodeURIComponent(adminEmail)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        } else if (phone) {
                          window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${selectedBooking.guest?.first_name}, regarding your booking ${selectedBooking.booking_id}...`)}`, '_blank');
                        } else {
                          toast.error("No contact information available");
                        }
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      📧 Send Message to Guest
                    </Button>
                  </div>
                )}

                {selectedBooking.status === 'confirmed' && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-md p-4 text-center">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-green-600 font-medium">This booking has been approved</p>
                    </div>
                    <Button
                      onClick={() => {
                        const email = selectedBooking.guest?.email;
                        const phone = selectedBooking.guest?.phone;
                        const subject = `Regarding Your Booking ${selectedBooking.booking_id}`;
                        const body = `Dear ${selectedBooking.guest?.first_name},\n\nRegarding your confirmed booking ${selectedBooking.booking_id}.\n\nBest regards,\n${adminEmail}\nAuréa Grand Hotel`;
                        
                        if (email) {
                          window.location.href = `mailto:${email}?from=${encodeURIComponent(adminEmail)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        } else if (phone) {
                          window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${selectedBooking.guest?.first_name}, regarding your booking ${selectedBooking.booking_id}...`)}`, '_blank');
                        } else {
                          toast.error("No contact information available");
                        }
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      📧 Send Message to Guest
                    </Button>
                  </div>
                )}

                {selectedBooking.status === 'cancelled' && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-md p-4 text-center">
                    <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <p className="text-red-600 font-medium">This booking has been cancelled</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminBookings;
