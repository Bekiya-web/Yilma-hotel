import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RoomForm } from "./RoomForm";
import { RoomCard } from "./RoomCard";
import { getRooms, createRoom, updateRoom, deleteRoom } from "@/api";
import { toast } from "sonner";
import type { Room } from "@/types/database";

const RoomsAdmin = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms
  });

  const createMutation = useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success("Room created successfully!");
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to create room", { description: error.message });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Room> }) => 
      updateRoom(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success("Room updated successfully!");
      setIsDialogOpen(false);
      setEditingRoom(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to update room", { description: error.message });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success("Room deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete room", { description: error.message });
    }
  });

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setIsDialogOpen(true);
  };

  const handleSubmit = (roomData: any) => {
    if (editingRoom) {
      updateMutation.mutate({ id: editingRoom.id, updates: roomData });
    } else {
      createMutation.mutate(roomData);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-yellow-500 mb-6 transition-smooth">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-4xl mb-2">Rooms Management</h1>
            <p className="text-muted-foreground">Manage room inventory, pricing, and availability.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingRoom(null)}>
                <Plus className="w-4 h-4 mr-2" /> Add Room
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
              </DialogHeader>
              <RoomForm
                room={editingRoom}
                onSubmit={handleSubmit}
                onCancel={() => setIsDialogOpen(false)}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-12">Loading rooms...</p>
        ) : rooms.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No rooms yet. Add your first room to get started.</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Room
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomsAdmin;
