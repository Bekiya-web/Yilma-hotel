import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Hotel, Phone, Mail, MapPin, DollarSign, CreditCard, Building2, Save, Check, Loader2, Lock, Key } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  getHotelInfo, 
  getPaymentSettings, 
  getBookingSettings, 
  getNotificationSettings,
  updateHotelInfo,
  updatePaymentSettings,
  updateBookingSettings,
  updateNotificationSettings,
  type HotelInfo,
  type PaymentSettings,
  type BookingSettings,
  type NotificationSettings
} from "@/api/settings.api";
import { changePassword, getCurrentAdmin } from "@/api/auth.api";

const AdminSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Hotel Information
  const [hotelInfo, setHotelInfo] = useState<HotelInfo>({
    name: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    website: ""
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    telebirrEnabled: true,
    telebirrPhone: "",
    telebirrAccountName: "",
    bankEnabled: true,
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: "",
    bankSwiftCode: "",
    payAtHotelEnabled: true,
    currency: "ETB",
    taxRate: 15
  });

  // Booking Settings
  const [bookingSettings, setBookingSettings] = useState<BookingSettings>({
    minAdvanceBookingDays: 1,
    maxAdvanceBookingDays: 365,
    cancellationHours: 48,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    requirePaymentProof: true,
    autoApprovePayAtHotel: false
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    adminEmail: "",
    bookingNotificationEmail: ""
  });

  // Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadAllSettings();
  }, []);

  const loadAllSettings = async () => {
    setIsLoading(true);
    try {
      const [hotel, payment, booking, notification] = await Promise.all([
        getHotelInfo(),
        getPaymentSettings(),
        getBookingSettings(),
        getNotificationSettings()
      ]);

      if (hotel) setHotelInfo(hotel);
      if (payment) setPaymentSettings(payment);
      if (booking) setBookingSettings(booking);
      if (notification) setNotificationSettings(notification);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveHotelInfo = async () => {
    setIsSaving(true);
    try {
      await updateHotelInfo(hotelInfo);
      toast.success("Hotel information saved successfully!");
      // Reload settings to confirm save
      const updated = await getHotelInfo();
      if (updated) setHotelInfo(updated);
    } catch (error: unknown) {
      console.error('Save hotel info error:', error);
      toast.error("Failed to save hotel information", { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePaymentSettings = async () => {
    setIsSaving(true);
    try {
      await updatePaymentSettings(paymentSettings);
      toast.success("Payment settings saved successfully!");
      // Reload settings to confirm save
      const updated = await getPaymentSettings();
      if (updated) setPaymentSettings(updated);
    } catch (error: unknown) {
      console.error('Save payment settings error:', error);
      toast.error("Failed to save payment settings", { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBookingSettings = async () => {
    setIsSaving(true);
    try {
      await updateBookingSettings(bookingSettings);
      toast.success("Booking settings saved successfully!");
      // Reload settings to confirm save
      const updated = await getBookingSettings();
      if (updated) setBookingSettings(updated);
    } catch (error: unknown) {
      console.error('Save booking settings error:', error);
      toast.error("Failed to save booking settings", { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    setIsSaving(true);
    try {
      await updateNotificationSettings(notificationSettings);
      toast.success("Notification settings saved successfully!");
      // Reload settings to confirm save
      const updated = await getNotificationSettings();
      if (updated) setNotificationSettings(updated);
    } catch (error: unknown) {
      console.error('Save notification settings error:', error);
      toast.error("Failed to save notification settings", { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
            <span className="ml-3 text-muted-foreground">Loading settings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="mb-4 md:mb-6">
        <h1 className="font-serif text-2xl md:text-4xl mb-2">Settings</h1>
        <p className="text-sm md:text-base text-muted-foreground">Configure your hotel system settings and preferences.</p>
      </div>

      {/* Grid Layout for Settings Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Hotel Information */}
          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <Hotel className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
              </div>
              <div>
                <h2 className="font-semibold text-base md:text-xl">Hotel Information</h2>
                <p className="text-xs md:text-sm text-muted-foreground">Basic information</p>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div className="space-y-2">
                <Label className="text-xs md:text-sm">Hotel Name</Label>
                <Input
                  value={hotelInfo.name}
                  onChange={(e) => setHotelInfo({...hotelInfo, name: e.target.value})}
                  placeholder="Auréa Grand Hotel"
                  className="text-sm md:text-base h-9 md:h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs md:text-sm">Email</Label>
                <Input
                  type="email"
                  value={hotelInfo.email}
                  onChange={(e) => setHotelInfo({...hotelInfo, email: e.target.value})}
                  placeholder="info@aureagrand.com"
                  className="text-sm md:text-base h-9 md:h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs md:text-sm">Phone</Label>
                <Input
                  type="tel"
                  value={hotelInfo.phone}
                  onChange={(e) => setHotelInfo({...hotelInfo, phone: e.target.value})}
                  placeholder="+251 912 345 678"
                  className="text-sm md:text-base h-9 md:h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs md:text-sm">Website</Label>
                <Input
                  type="url"
                  value={hotelInfo.website}
                  onChange={(e) => setHotelInfo({...hotelInfo, website: e.target.value})}
                  placeholder="https://aureagrand.com"
                  className="text-sm md:text-base h-9 md:h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs md:text-sm">Address</Label>
                <Input
                  value={hotelInfo.address}
                  onChange={(e) => setHotelInfo({...hotelInfo, address: e.target.value})}
                  placeholder="Addis Ababa, Ethiopia"
                  className="text-sm md:text-base h-9 md:h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs md:text-sm">Description</Label>
                <Textarea
                  value={hotelInfo.description}
                  onChange={(e) => setHotelInfo({...hotelInfo, description: e.target.value})}
                  placeholder="Brief description"
                  rows={2}
                  className="text-sm md:text-base"
                />
              </div>
              <Button onClick={handleSaveHotelInfo} disabled={isSaving} className="bg-yellow-500 hover:bg-yellow-600 w-full text-xs md:text-sm h-9 md:h-10">
                <Save className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                Save
              </Button>
            </div>
          </Card>

          {/* Payment Settings */}
          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
              </div>
              <div>
                <h2 className="font-semibold text-base md:text-xl">Payment Settings</h2>
                <p className="text-xs md:text-sm text-muted-foreground">Payment methods</p>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              {/* Telebirr Settings */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 md:w-4 md:h-4 text-yellow-500" />
                    <h3 className="font-medium text-xs md:text-sm">Telebirr</h3>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentSettings.telebirrEnabled}
                      onChange={(e) => setPaymentSettings({...paymentSettings, telebirrEnabled: e.target.checked})}
                      className="w-3 h-3 md:w-4 md:h-4"
                    />
                    <span className="text-xs">Enabled</span>
                  </label>
                </div>
                {paymentSettings.telebirrEnabled && (
                  <div className="space-y-2 pl-4 md:pl-5">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Phone</Label>
                      <Input
                        value={paymentSettings.telebirrPhone}
                        onChange={(e) => setPaymentSettings({...paymentSettings, telebirrPhone: e.target.value})}
                        placeholder="+251 912 345 678"
                        className="text-xs md:text-sm h-8 md:h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Account Name</Label>
                      <Input
                        value={paymentSettings.telebirrAccountName}
                        onChange={(e) => setPaymentSettings({...paymentSettings, telebirrAccountName: e.target.value})}
                        placeholder="Hotel Name"
                        className="text-xs md:text-sm h-8 md:h-9"
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Bank Transfer Settings */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3 h-3 md:w-4 md:h-4 text-yellow-500" />
                    <h3 className="font-medium text-xs md:text-sm">Bank Transfer</h3>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentSettings.bankEnabled}
                      onChange={(e) => setPaymentSettings({...paymentSettings, bankEnabled: e.target.checked})}
                      className="w-3 h-3 md:w-4 md:h-4"
                    />
                    <span className="text-xs">Enabled</span>
                  </label>
                </div>
                {paymentSettings.bankEnabled && (
                  <div className="space-y-2 pl-4 md:pl-5">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Bank Name</Label>
                      <Input
                        value={paymentSettings.bankName}
                        onChange={(e) => setPaymentSettings({...paymentSettings, bankName: e.target.value})}
                        placeholder="Bank Name"
                        className="text-xs md:text-sm h-8 md:h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Account Number</Label>
                      <Input
                        value={paymentSettings.bankAccountNumber}
                        onChange={(e) => setPaymentSettings({...paymentSettings, bankAccountNumber: e.target.value})}
                        placeholder="1000123456789"
                        className="text-xs md:text-sm h-8 md:h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Account Name</Label>
                      <Input
                        value={paymentSettings.bankAccountName}
                        onChange={(e) => setPaymentSettings({...paymentSettings, bankAccountName: e.target.value})}
                        placeholder="Hotel Name PLC"
                        className="text-xs md:text-sm h-8 md:h-9"
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Pay at Hotel */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3 h-3 md:w-4 md:h-4 text-yellow-500" />
                  <div>
                    <h3 className="font-medium text-xs md:text-sm">Pay at Hotel</h3>
                    <p className="text-[10px] md:text-xs text-muted-foreground">Pay on arrival</p>
                  </div>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentSettings.payAtHotelEnabled}
                    onChange={(e) => setPaymentSettings({...paymentSettings, payAtHotelEnabled: e.target.checked})}
                    className="w-3 h-3 md:w-4 md:h-4"
                  />
                  <span className="text-xs">Enabled</span>
                </label>
              </div>

              <Separator />

              {/* Currency & Tax */}
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Currency</Label>
                  <Input
                    value={paymentSettings.currency}
                    onChange={(e) => setPaymentSettings({...paymentSettings, currency: e.target.value})}
                    placeholder="ETB"
                    className="text-xs md:text-sm h-8 md:h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tax Rate (%)</Label>
                  <Input
                    type="number"
                    value={paymentSettings.taxRate}
                    onChange={(e) => setPaymentSettings({...paymentSettings, taxRate: Number(e.target.value)})}
                    placeholder="15"
                    className="text-xs md:text-sm h-8 md:h-9"
                  />
                </div>
              </div>

              <Button onClick={handleSavePaymentSettings} disabled={isSaving} className="bg-yellow-500 hover:bg-yellow-600 w-full text-xs md:text-sm h-9 md:h-10">
                <Save className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                Save
              </Button>
            </div>
          </Card>

          {/* Booking Settings */}
          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
              </div>
              <div>
                <h2 className="font-semibold text-base md:text-xl">Booking Settings</h2>
                <p className="text-xs md:text-sm text-muted-foreground">Booking rules</p>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Min Advance (Days)</Label>
                  <Input
                    type="number"
                    value={bookingSettings.minAdvanceBookingDays}
                    onChange={(e) => setBookingSettings({...bookingSettings, minAdvanceBookingDays: Number(e.target.value)})}
                    placeholder="1"
                    className="text-xs md:text-sm h-8 md:h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Max Advance (Days)</Label>
                  <Input
                    type="number"
                    value={bookingSettings.maxAdvanceBookingDays}
                    onChange={(e) => setBookingSettings({...bookingSettings, maxAdvanceBookingDays: Number(e.target.value)})}
                    placeholder="365"
                    className="text-xs md:text-sm h-8 md:h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Cancellation (Hrs)</Label>
                  <Input
                    type="number"
                    value={bookingSettings.cancellationHours}
                    onChange={(e) => setBookingSettings({...bookingSettings, cancellationHours: Number(e.target.value)})}
                    placeholder="48"
                    className="text-xs md:text-sm h-8 md:h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Check-in Time</Label>
                  <Input
                    type="time"
                    value={bookingSettings.checkInTime}
                    onChange={(e) => setBookingSettings({...bookingSettings, checkInTime: e.target.value})}
                    className="text-xs md:text-sm h-8 md:h-9"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-xs">Check-out Time</Label>
                  <Input
                    type="time"
                    value={bookingSettings.checkOutTime}
                    onChange={(e) => setBookingSettings({...bookingSettings, checkOutTime: e.target.value})}
                    className="text-xs md:text-sm h-8 md:h-9"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bookingSettings.requirePaymentProof}
                    onChange={(e) => setBookingSettings({...bookingSettings, requirePaymentProof: e.target.checked})}
                    className="w-3 h-3 md:w-4 md:h-4 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <span className="font-medium text-xs md:text-sm">Require Payment Proof</span>
                    <p className="text-[10px] md:text-xs text-muted-foreground">Upload proof for transfers</p>
                  </div>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bookingSettings.autoApprovePayAtHotel}
                    onChange={(e) => setBookingSettings({...bookingSettings, autoApprovePayAtHotel: e.target.checked})}
                    className="w-3 h-3 md:w-4 md:h-4 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <span className="font-medium text-xs md:text-sm">Auto-approve Pay at Hotel</span>
                    <p className="text-[10px] md:text-xs text-muted-foreground">Confirm automatically</p>
                  </div>
                </label>
              </div>

              <Button onClick={handleSaveBookingSettings} disabled={isSaving} className="bg-yellow-500 hover:bg-yellow-600 w-full text-xs md:text-sm h-9 md:h-10">
                <Save className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                Save
              </Button>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
              </div>
              <div>
                <h2 className="font-semibold text-base md:text-xl">Notification Settings</h2>
                <p className="text-xs md:text-sm text-muted-foreground">Notifications</p>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div className="space-y-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => setNotificationSettings({...notificationSettings, emailNotifications: e.target.checked})}
                    className="w-3 h-3 md:w-4 md:h-4 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <span className="font-medium text-xs md:text-sm">Email Notifications</span>
                    <p className="text-[10px] md:text-xs text-muted-foreground">Receive via email</p>
                  </div>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.smsNotifications}
                    onChange={(e) => setNotificationSettings({...notificationSettings, smsNotifications: e.target.checked})}
                    className="w-3 h-3 md:w-4 md:h-4 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <span className="font-medium text-xs md:text-sm">SMS Notifications</span>
                    <p className="text-[10px] md:text-xs text-muted-foreground">Receive via SMS</p>
                  </div>
                </label>
              </div>

              <Separator />

              <div className="space-y-2 md:space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Admin Email</Label>
                  <Input
                    type="email"
                    value={notificationSettings.adminEmail}
                    onChange={(e) => setNotificationSettings({...notificationSettings, adminEmail: e.target.value})}
                    placeholder="admin@hotel.com"
                    className="text-xs md:text-sm h-8 md:h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Booking Email</Label>
                  <Input
                    type="email"
                    value={notificationSettings.bookingNotificationEmail}
                    onChange={(e) => setNotificationSettings({...notificationSettings, bookingNotificationEmail: e.target.value})}
                    placeholder="bookings@hotel.com"
                    className="text-xs md:text-sm h-8 md:h-9"
                  />
                </div>
              </div>

              <Button onClick={handleSaveNotificationSettings} disabled={isSaving} className="bg-yellow-500 hover:bg-yellow-600 w-full text-xs md:text-sm h-9 md:h-10">
                <Save className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                Save
              </Button>
            </div>
          </Card>
        </div>

      {/* Password Change - Full Width */}
      <Card className="p-4 md:p-6">
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
            <Lock className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
          </div>
          <div>
            <h2 className="font-semibold text-base md:text-xl">Change Password</h2>
            <p className="text-xs md:text-sm text-muted-foreground">Update your admin password</p>
          </div>
        </div>

        <div className="space-y-3 md:space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-2.5 md:p-3">
            <p className="text-xs md:text-sm text-blue-600 dark:text-blue-400">
              <strong>Security Tip:</strong> Use a strong password with at least 8 characters.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-2 md:gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword" className="text-xs">Current Password *</Label>
              <div className="relative">
                <Key className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Current"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="pl-8 md:pl-10 text-xs md:text-sm h-8 md:h-9"
                  disabled={isChangingPassword}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-xs">New Password *</Label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="New"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="pl-8 md:pl-10 text-xs md:text-sm h-8 md:h-9"
                  disabled={isChangingPassword}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs">Confirm Password *</Label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="pl-8 md:pl-10 text-xs md:text-sm h-8 md:h-9"
                  disabled={isChangingPassword}
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={async () => {
              if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
                toast.error("Please fill in all password fields");
                return;
              }

              if (passwordData.newPassword !== passwordData.confirmPassword) {
                toast.error("New passwords do not match");
                return;
              }

              if (passwordData.newPassword.length < 6) {
                toast.error("New password must be at least 6 characters");
                return;
              }

              const admin = getCurrentAdmin();
              if (!admin) {
                toast.error("Not logged in");
                return;
              }

              setIsChangingPassword(true);
              try {
                await changePassword(admin.email, passwordData.currentPassword, passwordData.newPassword);
                toast.success("Password changed successfully!");
                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
              } catch (error: unknown) {
                toast.error("Failed to change password", { 
                  description: error instanceof Error ? error.message : 'Unknown error' 
                });
              } finally {
                setIsChangingPassword(false);
              }
            }}
            disabled={isChangingPassword} 
            className="bg-yellow-500 hover:bg-yellow-600 w-full md:w-auto text-xs md:text-sm h-9 md:h-10"
          >
            {isChangingPassword ? (
              <>
                <Loader2 className="w-3 h-3 md:w-4 md:h-4 mr-2 animate-spin" />
                Changing...
              </>
            ) : (
              <>
                <Save className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                Change Password
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminSettings;
