import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Search, Mail, Phone, MapPin, Calendar, Edit, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getGuests, getBookings, updateGuest, deleteGuest } from "@/lib/supabase";
import { toast } from "sonner";
import type { Guest } from "@/types/database";

const AdminGuests = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    country: ''
  });

  const { data: guests = [], isLoading } = useQuery({
    queryKey: ['guests'],
    queryFn: getGuests
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: getBookings
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Guest> }) => 
      updateGuest(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success("Guest updated successfully!");
      setIsDialogOpen(false);
      setEditingGuest(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error("Failed to update guest", { description: error.message });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGuest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      toast.success("Guest deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete guest", { description: error.message });
    }
  });

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      country: ''
    });
  };

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData({
      first_name: guest.first_name,
      last_name: guest.last_name,
      email: guest.email,
      phone: guest.phone || '',
      country: guest.country || ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGuest) {
      updateMutation.mutate({ id: editingGuest.id, updates: formData });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This will also delete all their bookings.`)) {
      deleteMutation.mutate(id);
    }
  };

  const getGuestBookings = (guestId: string) => {
    return bookings.filter(b => b.guest_id === guestId);
  };

  const filteredGuests = guests.filter(guest => {
    const searchLower = searchTerm.toLowerCase();
    return searchTerm === "" ||
      guest.first_name.toLowerCase().includes(searchLower) ||
      guest.last_name.toLowerCase().includes(searchLower) ||
      guest.email.toLowerCase().includes(searchLower) ||
      (guest.country && guest.country.toLowerCase().includes(searchLower));
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
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
          <h1 className="font-serif text-4xl mb-2">Guests Management</h1>
          <p className="text-muted-foreground">View and manage guest information.</p>
        </div>

        {/* Search */}
        <Card className="p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Guest</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Country</Label>
                <Input
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={updateMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" /> Update Guest
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Guests List */}
        {isLoading ? (
          <p className="text-center text-muted-foreground py-12">Loading guests...</p>
        ) : filteredGuests.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              {searchTerm 
                ? "No guests match your search." 
                : "No guests yet. Guest records are created when bookings are made."}
            </p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredGuests.map((guest) => {
              const guestBookings = getGuestBookings(guest.id);
              const totalSpent = guestBookings.reduce((sum, b) => sum + Number(b.amount), 0);
              
              return (
                <Card key={guest.id} className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Guest Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 rounded-full bg-yellow-500 border-2 border-yellow-500 flex items-center justify-center">
                        <span className="text-2xl font-semibold text-white">
                          {guest.first_name[0]}{guest.last_name[0]}
                        </span>
                      </div>
                    </div>

                    {/* Guest Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-serif text-2xl mb-1">
                            {guest.first_name} {guest.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Member since {formatDate(guest.created_at)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(guest)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDelete(guest.id, `${guest.first_name} ${guest.last_name}`)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-yellow-500" />
                          <span className="text-muted-foreground">Email:</span>
                          <span>{guest.email}</span>
                        </div>
                        {guest.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-yellow-500" />
                            <span className="text-muted-foreground">Phone:</span>
                            <span>{guest.phone}</span>
                          </div>
                        )}
                        {guest.country && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-yellow-500" />
                            <span className="text-muted-foreground">Country:</span>
                            <span>{guest.country}</span>
                          </div>
                        )}
                      </div>

                      {/* Booking Stats */}
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                        <div className="text-center">
                          <p className="text-2xl font-serif font-semibold">{guestBookings.length}</p>
                          <p className="text-xs text-muted-foreground">Total Bookings</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-serif font-semibold text-yellow-500">
                            ${totalSpent.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">Total Spent</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-serif font-semibold text-green-600">
                            {guestBookings.filter(b => b.status === 'completed').length}
                          </p>
                          <p className="text-xs text-muted-foreground">Completed Stays</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {!isLoading && filteredGuests.length > 0 && (
          <Card className="p-6 mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-2xl font-serif font-semibold">{filteredGuests.length}</p>
                <p className="text-sm text-muted-foreground">Total Guests</p>
              </div>
              <div>
                <p className="text-2xl font-serif font-semibold text-yellow-500">
                  {bookings.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
              </div>
              <div>
                <p className="text-2xl font-serif font-semibold text-green-600">
                  ETB {bookings.reduce((sum, b) => sum + Number(b.amount), 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminGuests;
