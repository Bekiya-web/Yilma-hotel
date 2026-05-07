import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Star, Trash2, CheckCircle, XCircle, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { updateReview, deleteReview } from "@/api";
import { toast } from "sonner";
import type { Review } from "@/types/database";

const AdminReviewsAdmin = () => {
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Review[];
    }
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) => 
      updateReview(id, { approved }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews-admin'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success("Review status updated!");
    },
    onError: (error: Error) => {
      toast.error("Failed to update review", { description: error.message });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews-admin'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success("Review deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete review", { description: error.message });
    }
  });

  const handleApprove = (id: string, currentStatus: boolean) => {
    approveMutation.mutate({ id, approved: !currentStatus });
  };

  const handleDelete = (id: string, guestName: string) => {
    if (confirm(`Are you sure you want to delete the review by ${guestName}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const approvedReviews = reviews.filter(r => r.approved);
  const pendingReviews = reviews.filter(r => !r.approved);
  const avgRating = approvedReviews.length > 0 
    ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-yellow-500 mb-6 transition-smooth">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        
        <div className="mb-8">
          <h1 className="font-serif text-4xl mb-2">Reviews Management</h1>
          <p className="text-muted-foreground">Approve or reject guest reviews submitted after their stay.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 text-center">
            <p className="text-4xl font-serif font-semibold mb-2">{reviews.length}</p>
            <p className="text-sm text-muted-foreground">Total Reviews</p>
          </Card>
          <Card className="p-6 text-center">
            <p className="text-4xl font-serif font-semibold text-yellow-500 mb-2">{pendingReviews.length}</p>
            <p className="text-sm text-muted-foreground">Pending Approval</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-6 h-6 fill-yellow-500 text-yellow-500" />
              <p className="text-4xl font-serif font-semibold text-yellow-500">{avgRating}</p>
            </div>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </Card>
          <Card className="p-6 text-center">
            <p className="text-4xl font-serif font-semibold text-green-600 mb-2">{approvedReviews.length}</p>
            <p className="text-sm text-muted-foreground">Approved Reviews</p>
          </Card>
        </div>

        {/* Pending Reviews */}
        {pendingReviews.length > 0 && (
          <div className="mb-8">
            <h2 className="font-serif text-2xl mb-4">Pending Approval ({pendingReviews.length})</h2>
            <div className="space-y-4">
              {pendingReviews.map((review) => (
                <Card key={review.id} className="p-6 border-yellow-500/50">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-serif text-xl">{review.guest_name}</h3>
                        {review.verified && (
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                            <BadgeCheck className="w-3 h-3 mr-1" /> Verified
                          </Badge>
                        )}
                        <Badge className="bg-yellow-500 text-white">Pending</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {review.country} · {formatDate(review.review_date)} · {review.room_type}
                      </p>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-foreground/85 leading-relaxed mb-4">"{review.text}"</p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleApprove(review.id, review.approved)}
                      disabled={approveMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDelete(review.id, review.guest_name)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Approved Reviews */}
        <div>
          <h2 className="font-serif text-2xl mb-4">Approved Reviews ({approvedReviews.length})</h2>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-12">Loading reviews...</p>
          ) : approvedReviews.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No approved reviews yet. Reviews will appear here after guests submit them and you approve them.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {approvedReviews.map((review) => (
                <Card key={review.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-serif text-xl">{review.guest_name}</h3>
                        {review.verified && (
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                            <BadgeCheck className="w-3 h-3 mr-1" /> Verified
                          </Badge>
                        )}
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/30">Approved</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {review.country} · {formatDate(review.review_date)} · {review.room_type}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-0.5">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        ))}
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleApprove(review.id, review.approved)}
                        disabled={approveMutation.isPending}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDelete(review.id, review.guest_name)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-foreground/85 leading-relaxed">"{review.text}"</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReviewsAdmin;
