import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Check, Lock, ShieldCheck, Upload, Phone, Building2, Wallet, CreditCard, IdCard, User, LogIn } from "lucide-react";
import SiteLayout from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { getRoom } from "@/api";
import { createBooking } from "@/lib/supabase";
import { getPaymentSettings, type PaymentSettings } from "@/api/settings.api";
import { getGuestByEmail } from "@/api/bookings.api";
import { toast } from "sonner";

const steps = ["Your details", "Verification", "Payment", "Confirmation"];

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("telebirr");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  
  // Check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  
  // ID Verification
  const [idType, setIdType] = useState<'national_id' | 'drivers_license' | 'regional_id'>('national_id');
  const [idFrontImage, setIdFrontImage] = useState<File | null>(null);
  const [idBackImage, setIdBackImage] = useState<File | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    checkInDate: '',
    checkInTime: '',
    checkOutDate: '',
    checkOutTime: '',
    guests: 2,
    specialRequests: ''
  });

  // Check authentication on mount
  useEffect(() => {
    const email = localStorage.getItem("customerEmail");
    if (email) {
      setIsLoggedIn(true);
      setCustomerEmail(email);
    }
  }, []);

  // Fetch customer data if logged in
  const { data: customerData } = useQuery({
    queryKey: ['customer-profile', customerEmail],
    queryFn: () => getGuestByEmail(customerEmail),
    enabled: isLoggedIn && !!customerEmail,
  });

  // Auto-fill form with customer data
  useEffect(() => {
    if (customerData) {
      setFormData(prev => ({
        ...prev,
        firstName: customerData.first_name || '',
        lastName: customerData.last_name || '',
        email: customerData.email || '',
        phone: customerData.phone || '',
      }));
    }
  }, [customerData]);

  const { data: room, isLoading } = useQuery({
    queryKey: ['room', id],
    queryFn: () => getRoom(id || ''),
    enabled: !!id
  });

  // Load payment settings
  useEffect(() => {
    const loadPaymentSettings = async () => {
      try {
        const settings = await getPaymentSettings();
        if (settings) {
          setPaymentSettings(settings);
          // Set default payment method based on enabled options
          if (settings.telebirrEnabled) {
            setPaymentMethod('telebirr');
          } else if (settings.bankEnabled) {
            setPaymentMethod('bank');
          } else if (settings.payAtHotelEnabled) {
            setPaymentMethod('hotel');
          }
        }
      } catch (error) {
        console.error('Error loading payment settings:', error);
      }
    };
    loadPaymentSettings();
  }, []);

  const bookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      toast.success("Booking confirmed!", { description: "A confirmation email has been sent." });
      navigate("/");
    },
    onError: (error) => {
      toast.error("Booking failed", { description: error.message });
    }
  });

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="container py-40 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </SiteLayout>
    );
  }

  if (!room) {
    return (
      <SiteLayout>
        <div className="container py-40 text-center">
          <h1 className="font-serif text-4xl mb-4">Room not found</h1>
          <Button asChild variant="gold"><Link to="/rooms">Browse rooms</Link></Button>
        </div>
      </SiteLayout>
    );
  }

  // Require login before booking
  if (!isLoggedIn) {
    return (
      <SiteLayout>
        <section className="py-32">
          <div className="container max-w-2xl">
            <Card className="p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogIn className="w-8 h-8 text-yellow-500" />
                </div>
                <h1 className="font-serif text-3xl mb-3">Sign In Required</h1>
                <p className="text-muted-foreground">
                  Please sign in to your customer account to continue with your booking
                </p>
              </div>

              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-md p-6 mb-8">
                <h3 className="font-medium mb-3">Why sign in?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                    <span>Track all your bookings in one place</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                    <span>Auto-fill your details for faster checkout</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                    <span>Manage and cancel bookings easily</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                    <span>Receive booking updates and notifications</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  onClick={() => navigate('/my-bookings', { state: { returnTo: `/checkout/${id}` } })}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In to Continue
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Don't have an account? Sign in with your email to create one automatically
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/rooms')}
                  >
                    Back to Rooms
                  </Button>
                </div>
              </div>

              {/* Room Preview */}
              <div className="mt-8 pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">You're booking:</p>
                <div className="flex gap-4">
                  <img 
                    src={room.image} 
                    alt={room.name} 
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <div>
                    <h3 className="font-serif text-lg mb-1">{room.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{room.view}</p>
                    <p className="text-yellow-600 font-semibold">
                      ETB {room.price.toLocaleString()} / night
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </SiteLayout>
    );
  }

  // Calculate nights dynamically based on selected dates
  const calculateNights = () => {
    if (!formData.checkInDate || !formData.checkOutDate) return 1;
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 1;
  };

  const nights = calculateNights();
  const subtotal = room.price * nights;

  // Validation functions for each step
  const validateStep0 = () => {
    // Validate Your Details step
    if (!formData.firstName.trim()) {
      toast.error("Please enter your first name");
      return false;
    }
    if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
      toast.error("First name should only contain letters");
      return false;
    }
    if (!formData.lastName.trim()) {
      toast.error("Please enter your last name");
      return false;
    }
    if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
      toast.error("Last name should only contain letters");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Please enter your email");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error("Please enter your phone number");
      return false;
    }
    if (!/^\+?[0-9\s\-()]+$/.test(formData.phone)) {
      toast.error("Phone number should only contain numbers");
      return false;
    }
    // Validate phone length (must be at least 10 digits)
    const phoneDigits = formData.phone.replace(/[^0-9]/g, '');
    if (phoneDigits.length < 10) {
      toast.error("Phone number must be at least 10 digits");
      return false;
    }
    if (!formData.checkInDate) {
      toast.error("Please select check-in date");
      return false;
    }
    if (!formData.checkInTime) {
      toast.error("Please select check-in time");
      return false;
    }
    if (!formData.checkOutDate) {
      toast.error("Please select check-out date");
      return false;
    }
    if (!formData.checkOutTime) {
      toast.error("Please select check-out time");
      return false;
    }
    if (formData.guests < 1) {
      toast.error("Please enter number of guests");
      return false;
    }
    return true;
  };

  const validateStep1 = () => {
    // Validate Verification step
    if (!idFrontImage) {
      toast.error("Please upload the front image of your ID");
      return false;
    }
    if (!idBackImage) {
      toast.error("Please upload the back image of your ID");
      return false;
    }
    if (!selfieImage) {
      toast.error("Please upload a selfie photo");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    // Validate Payment step
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return false;
    }
    if ((paymentMethod === 'telebirr' || paymentMethod === 'bank') && !paymentProof) {
      toast.error("Please upload payment proof");
      return false;
    }
    return true;
  };

  const next = () => {
    // Validate current step before proceeding
    if (step === 0 && !validateStep0()) {
      return;
    }
    if (step === 1 && !validateStep1()) {
      return;
    }
    if (step === 2 && !validateStep2()) {
      return;
    }

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Create booking
      handleBookingSubmit();
    }
  };

  const handleBookingSubmit = async () => {
    // Validate dates
    if (!formData.checkInDate || !formData.checkOutDate) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    // Validate ID images
    if (!idFrontImage || !idBackImage) {
      toast.error("Please upload both front and back images of your ID");
      return;
    }

    // Validate selfie image
    if (!selfieImage) {
      toast.error("Please capture a selfie for face verification");
      return;
    }

    // Use the dates from form
    const checkIn = formData.checkInDate;
    const checkOut = formData.checkOutDate;

    // Calculate nights
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const calculatedNights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    if (calculatedNights <= 0) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    try {
      toast.info("Uploading documents...");
      
      const { uploadToCloudinary } = await import('@/lib/cloudinary');
      
      // Upload ID images and selfie
      const [idFrontResult, idBackResult, selfieResult] = await Promise.all([
        uploadToCloudinary(idFrontImage, 'id-verification'),
        uploadToCloudinary(idBackImage, 'id-verification'),
        uploadToCloudinary(selfieImage, 'selfie-verification')
      ]);

      let paymentProofUrl = '';

      // Upload payment proof if exists
      if (paymentProof && (paymentMethod === 'telebirr' || paymentMethod === 'bank')) {
        toast.info("Uploading payment proof...");
        const uploadResult = await uploadToCloudinary(paymentProof, 'payment-proofs');
        paymentProofUrl = uploadResult.secure_url;
      }

      // Create booking with payment and ID information
      bookingMutation.mutate({
        guest: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone
        },
        room_id: room.id,
        check_in: checkIn,
        check_out: checkOut,
        guests_count: formData.guests,
        special_requests: formData.specialRequests,
        payment_method: paymentMethod,
        payment_proof_url: paymentProofUrl,
        id_type: idType,
        id_front_url: idFrontResult.secure_url,
        id_back_url: idBackResult.secure_url,
        selfie_url: selfieResult.secure_url
      });
    } catch (error: any) {
      toast.error("Failed to process booking", { description: error.message });
    }
  };

  return (
    <SiteLayout>
      <section className="pt-28 pb-20">
        <div className="container max-w-5xl">
          {/* PROGRESS */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium border ${
                      i <= step
                        ? "bg-yellow-500 text-white border-yellow-500"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {i < step ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-sm hidden sm:inline ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>
                    {s}
                  </span>
                </div>
                {i < steps.length - 1 && <div className={`w-12 h-px ${i < step ? "bg-yellow-500" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-[1fr_360px] gap-10">
            <div className="bg-card border border-border rounded-md p-8">
              {step === 0 && (
                <>
                  <h2 className="font-serif text-3xl mb-6">Guest details</h2>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label>First name *</Label>
                      <Input 
                        required
                        placeholder="Helena" 
                        value={formData.firstName}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                          setFormData({...formData, firstName: value});
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last name *</Label>
                      <Input 
                        required
                        placeholder="Marlow" 
                        value={formData.lastName}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                          setFormData({...formData, lastName: value});
                        }}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Email *</Label>
                      <Input 
                        required
                        type="email" 
                        placeholder="you@example.com" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Phone *</Label>
                      <Input 
                        required
                        type="tel" 
                        placeholder="+251 912 345 678" 
                        value={formData.phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9+\s\-()]/g, '');
                          setFormData({...formData, phone: value});
                        }}
                      />
                    </div>

                    {/* Check-in Date & Time */}
                    <div className="space-y-2 sm:col-span-2 pt-4 border-t">
                      <h3 className="font-medium text-lg mb-3">Check-in Details</h3>
                    </div>
                    <div className="space-y-2">
                      <Label>Check-in Date *</Label>
                      <Input 
                        required
                        type="date" 
                        value={formData.checkInDate}
                        onChange={(e) => setFormData({...formData, checkInDate: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Check-in Time *</Label>
                      <Input 
                        required
                        type="time" 
                        value={formData.checkInTime}
                        onChange={(e) => setFormData({...formData, checkInTime: e.target.value})}
                        placeholder="14:00"
                      />
                      <p className="text-xs text-muted-foreground">Standard check-in: 2:00 PM</p>
                    </div>

                    {/* Check-out Date & Time */}
                    <div className="space-y-2 sm:col-span-2 pt-4 border-t">
                      <h3 className="font-medium text-lg mb-3">Check-out Details</h3>
                    </div>
                    <div className="space-y-2">
                      <Label>Check-out Date *</Label>
                      <Input 
                        required
                        type="date" 
                        value={formData.checkOutDate}
                        onChange={(e) => setFormData({...formData, checkOutDate: e.target.value})}
                        min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Check-out Time *</Label>
                      <Input 
                        required
                        type="time" 
                        value={formData.checkOutTime}
                        onChange={(e) => setFormData({...formData, checkOutTime: e.target.value})}
                        placeholder="12:00"
                      />
                      <p className="text-xs text-muted-foreground">Standard check-out: 12:00 PM</p>
                    </div>

                    {/* Number of Guests */}
                    <div className="space-y-2 sm:col-span-2 pt-4 border-t">
                      <Label>Number of Guests *</Label>
                      <Input 
                        required
                        type="number" 
                        min="1"
                        max={room?.guests || 10}
                        value={formData.guests || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : Number(e.target.value);
                          setFormData({...formData, guests: value});
                        }}
                        onFocus={(e) => {
                          if (e.target.value === '0') {
                            setFormData({...formData, guests: 0});
                            e.target.value = '';
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground">Maximum {room?.guests || 2} guests for this room</p>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label>Special requests <span className="text-muted-foreground">(optional)</span></Label>
                      <Textarea 
                        placeholder="Late check-in, dietary needs, celebrations..." 
                        rows={3} 
                        value={formData.specialRequests}
                        onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                      />
                    </div>
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <h2 className="font-serif text-3xl mb-6">ID Verification</h2>
                  <div className="grid sm:grid-cols-2 gap-5">
                    {/* ID Verification Section */}
                    <div className="space-y-2 sm:col-span-2">
                      <div className="flex items-center gap-2 mb-4">
                        <IdCard className="w-5 h-5 text-yellow-500" />
                        <h3 className="font-medium text-lg">Verify Your Identity</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        For security purposes, please upload a valid ID document (front and back)
                      </p>
                    </div>

                    {/* ID Type Selection */}
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Select ID Type *</Label>
                      <RadioGroup value={idType} onValueChange={(value: any) => setIdType(value)} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Label className="flex items-center gap-3 border border-border rounded-md p-4 cursor-pointer hover:border-yellow-500 transition-smooth">
                          <RadioGroupItem value="national_id" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-yellow-600" />
                              <span className="font-medium">National ID</span>
                            </div>
                          </div>
                        </Label>

                        <Label className="flex items-center gap-3 border border-border rounded-md p-4 cursor-pointer hover:border-yellow-500 transition-smooth">
                          <RadioGroupItem value="drivers_license" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-yellow-600" />
                              <span className="font-medium">Driver's License</span>
                            </div>
                          </div>
                        </Label>

                        <Label className="flex items-center gap-3 border border-border rounded-md p-4 cursor-pointer hover:border-yellow-500 transition-smooth">
                          <RadioGroupItem value="regional_id" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-yellow-600" />
                              <span className="font-medium">Regional ID</span>
                            </div>
                          </div>
                        </Label>
                      </RadioGroup>
                    </div>

                    {/* ID Front Image */}
                    <div className="space-y-2">
                      <Label>ID Front Image *</Label>
                      <div className="border-2 border-dashed border-border rounded-md p-6 text-center hover:border-yellow-500 transition-smooth">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <Input 
                          required
                          type="file" 
                          accept="image/*"
                          onChange={(e) => setIdFrontImage(e.target.files?.[0] || null)}
                          className="cursor-pointer"
                        />
                        {idFrontImage && (
                          <p className="text-sm text-green-600 mt-2">✓ {idFrontImage.name}</p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Upload a clear photo of the front of your ID</p>
                    </div>

                    {/* ID Back Image */}
                    <div className="space-y-2">
                      <Label>ID Back Image *</Label>
                      <div className="border-2 border-dashed border-border rounded-md p-6 text-center hover:border-yellow-500 transition-smooth">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <Input 
                          required
                          type="file" 
                          accept="image/*"
                          onChange={(e) => setIdBackImage(e.target.files?.[0] || null)}
                          className="cursor-pointer"
                        />
                        {idBackImage && (
                          <p className="text-sm text-green-600 mt-2">✓ {idBackImage.name}</p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Upload a clear photo of the back of your ID</p>
                    </div>

                    {/* Face Verification Section */}
                    <div className="space-y-2 sm:col-span-2 pt-6 border-t-2">
                      <div className="flex items-center gap-2 mb-4">
                        <User className="w-5 h-5 text-yellow-500" />
                        <h3 className="font-medium text-lg">Face Verification *</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload a selfie photo to verify your identity matches the ID document
                      </p>
                    </div>

                    {/* Selfie Upload */}
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Selfie Photo *</Label>
                      <div className="border-2 border-dashed border-border rounded-md p-6 text-center hover:border-yellow-500 transition-smooth">
                        <User className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <Input 
                          required
                          type="file" 
                          accept="image/*"
                          onChange={(e) => setSelfieImage(e.target.files?.[0] || null)}
                          className="cursor-pointer"
                        />
                        {selfieImage && (
                          <p className="text-sm text-green-600 mt-2">✓ {selfieImage.name}</p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Upload a clear photo of your face (your face should be clearly visible)
                      </p>
                    </div>

                    {/* ID Upload Guidelines */}
                    <div className="sm:col-span-2 bg-blue-500/5 border border-blue-500/20 rounded-md p-4">
                      <h4 className="font-medium text-sm mb-2">Verification Guidelines:</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Ensure the ID is valid and not expired</li>
                        <li>• Photo should be clear and all text readable</li>
                        <li>• Avoid glare or shadows on the ID</li>
                        <li>• Both front and back images are required</li>
                        <li>• Your selfie should clearly show your face</li>
                        <li>• Make sure your face matches the ID photo</li>
                        <li>• Accepted formats: JPG, PNG</li>
                      </ul>
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="font-serif text-3xl mb-6">Payment Method</h2>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3 mb-6">
                    {paymentSettings?.telebirrEnabled && (
                      <Label className="flex items-start gap-3 border border-border rounded-md p-4 cursor-pointer hover:border-yellow-500 transition-smooth">
                        <RadioGroupItem value="telebirr" className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Phone className="w-4 h-4 text-yellow-600" />
                            <span className="font-medium">Telebirr (Manual)</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Pay via Telebirr and upload payment screenshot</p>
                        </div>
                      </Label>
                    )}

                    {paymentSettings?.bankEnabled && (
                      <Label className="flex items-start gap-3 border border-border rounded-md p-4 cursor-pointer hover:border-yellow-500 transition-smooth">
                        <RadioGroupItem value="bank" className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Building2 className="w-4 h-4 text-yellow-600" />
                            <span className="font-medium">Bank Transfer</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Transfer to our bank account and upload proof</p>
                        </div>
                      </Label>
                    )}

                    {paymentSettings?.payAtHotelEnabled && (
                      <Label className="flex items-start gap-3 border border-border rounded-md p-4 cursor-pointer hover:border-yellow-500 transition-smooth">
                        <RadioGroupItem value="hotel" className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Wallet className="w-4 h-4 text-yellow-600" />
                            <span className="font-medium">Pay at Hotel</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Pay when you arrive at the hotel</p>
                        </div>
                      </Label>
                    )}
                  </RadioGroup>

                  {/* Telebirr Payment Details */}
                  {paymentMethod === "telebirr" && paymentSettings && (
                    <Card className="p-6 bg-yellow-500/5 border-yellow-500/20 mb-6">
                      <h3 className="font-medium mb-4 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-yellow-600" />
                        Telebirr Payment Instructions
                      </h3>
                      <div className="space-y-3 text-sm mb-4">
                        <div>
                          <p className="text-muted-foreground mb-1">Phone Number:</p>
                          <p className="font-mono text-lg font-semibold">{paymentSettings.telebirrPhone}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Account Name:</p>
                          <p className="font-medium">{paymentSettings.telebirrAccountName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Amount to Pay:</p>
                          <p className="font-serif text-2xl text-yellow-600">{paymentSettings.currency} {subtotal}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label>Upload Payment Screenshot *</Label>
                        <Input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                          className="cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground">
                          After sending money via Telebirr, take a screenshot and upload it here
                        </p>
                      </div>
                    </Card>
                  )}

                  {/* Bank Transfer Details */}
                  {paymentMethod === "bank" && paymentSettings && (
                    <Card className="p-6 bg-yellow-500/5 border-yellow-500/20 mb-6">
                      <h3 className="font-medium mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-yellow-600" />
                        Bank Transfer Instructions
                      </h3>
                      <div className="space-y-3 text-sm mb-4">
                        <div>
                          <p className="text-muted-foreground mb-1">Bank Name:</p>
                          <p className="font-medium">{paymentSettings.bankName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Account Number:</p>
                          <p className="font-mono text-lg font-semibold">{paymentSettings.bankAccountNumber}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Account Name:</p>
                          <p className="font-medium">{paymentSettings.bankAccountName}</p>
                        </div>
                        {paymentSettings.bankSwiftCode && (
                          <div>
                            <p className="text-muted-foreground mb-1">SWIFT Code:</p>
                            <p className="font-mono">{paymentSettings.bankSwiftCode}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-muted-foreground mb-1">Amount to Transfer:</p>
                          <p className="font-serif text-2xl text-yellow-600">{paymentSettings.currency} {subtotal}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label>Upload Transfer Receipt *</Label>
                        <Input 
                          type="file" 
                          accept="image/*,application/pdf"
                          onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                          className="cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground">
                          Upload your bank transfer receipt or screenshot
                        </p>
                      </div>
                    </Card>
                  )}

                  {/* Pay at Hotel */}
                  {paymentMethod === "hotel" && (
                    <Card className="p-6 bg-green-500/5 border-green-500/20 mb-6">
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-green-600" />
                        Pay at Hotel
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Your booking will be confirmed instantly. You can pay when you arrive at the hotel using cash or card.
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>No payment required now</span>
                      </div>
                    </Card>
                  )}

                  {(paymentMethod === "telebirr" || paymentMethod === "bank") && (
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-md p-4">
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        <strong>Note:</strong> Your booking will be marked as "Pending" until we verify your payment. 
                        We'll confirm within 24 hours.
                      </p>
                    </div>
                  )}
                </>
              )}

              {step === 3 && (
                <>
                  <h2 className="font-serif text-3xl mb-6">Review & confirm</h2>
                  <div className="space-y-3 text-sm">
                    <p className="text-muted-foreground">You're booking the <span className="text-foreground font-medium">{room.name}</span> for {nights} nights.</p>
                    <ul className="space-y-2 mt-4">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /> Free cancellation up to 48 hours</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /> Instant confirmation by email</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /> No hidden fees</li>
                    </ul>
                  </div>
                </>
              )}

              <div className="flex gap-3 mt-10">
                {step > 0 && (
                  <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
                )}
                <Button variant="hero" size="lg" className="ml-auto" onClick={next} disabled={bookingMutation.isPending}>
                  {bookingMutation.isPending ? 'Processing...' : step === steps.length - 1 ? "Confirm Booking" : "Continue"}
                </Button>
              </div>
            </div>

            {/* SUMMARY */}
            <aside className="lg:sticky lg:top-28 self-start">
              <div className="bg-card border border-border rounded-md overflow-hidden">
                <img src={room.image} alt={room.name} className="w-full h-40 object-cover" />
                <div className="p-6">
                  <h3 className="font-serif text-xl mb-1">{room.name}</h3>
                  <p className="text-xs text-muted-foreground mb-5">{room.view} · {room.bed}</p>

                  {/* Stay Duration Info */}
                  {formData.checkInDate && formData.checkOutDate && (
                    <div className="mb-5 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                      <p className="text-sm font-medium text-foreground mb-1">
                        You are staying for {nights} {nights === 1 ? 'night' : 'nights'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(formData.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(formData.checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  )}

                  <div className="space-y-3 text-sm pb-5 border-b border-border">
                    <div className="flex justify-between"><span className="text-muted-foreground">ETB {room.price.toLocaleString()} × {nights} {nights === 1 ? 'night' : 'nights'}</span><span>ETB {subtotal.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Taxes & fees</span><span className="text-success">Included</span></div>
                  </div>
                  <div className="flex justify-between pt-5 text-base">
                    <span className="font-medium">Total Payment</span>
                    <span className="font-serif text-2xl text-yellow-600">ETB {subtotal.toLocaleString()}</span>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border space-y-2 text-xs text-muted-foreground">
                    <p className="flex items-center gap-2"><ShieldCheck className="w-3 h-3 text-yellow-600" /> Best price guaranteed</p>
                    <p className="flex items-center gap-2"><Lock className="w-3 h-3 text-yellow-600" /> Secure 256-bit checkout</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Checkout;