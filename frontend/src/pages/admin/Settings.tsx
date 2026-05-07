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
    } catch (error: any) {
      console.error('Save hotel info error:', error);
      toast.error("Failed to save hotel information", { 
        description: error.message || 'Unknown error' 
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
    } catch (error: any) {
      console.error('Save payment settings error:', error);
      toast.error("Failed to save payment settings", { 
        description: error.message || 'Unknown error' 
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
    } catch (error: any) {
      console.error('Save booking settings error:', error);
      toast.error("Failed to save booking settings", { 
        description: error.message || 'Unknown error' 
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
    } catch (error: any) {
      console.error('Save notification settings error:', error);
      toast.error("Failed to save notification settings", { 
        description: error.message || 'Unknown error' 
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-yellow-500 mb-6 transition-smooth">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        
        <div className="mb-8">
          <h1 className="font-serif text-4xl mb-2">Settings</h1>
          <p className="text-muted-foreground">Configure your hotel system settings and preferences.</p>
        </div>

        <div className="space-y-6">
          {/* Hotel Information */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Hotel className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h2 className="font-semibold text-xl">Hotel Information</h2>
                <p className="text-sm text-muted-foreground">Basic information about your hotel</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hotel Name</Label>
                  <Input
                    value={hotelInfo.name}
                    onChange={(e) => setHotelInfo({...hotelInfo, name: e.target.value})}
                    placeholder="Auréa Grand Hotel"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={hotelInfo.email}
                    onChange={(e) => setHotelInfo({...hotelInfo, email: e.target.value})}
                    placeholder="info@aureagrand.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    value={hotelInfo.phone}
                    onChange={(e) => setHotelInfo({...hotelInfo, phone: e.target.value})}
                    placeholder="+251 912 345 678"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    type="url"
                    value={hotelInfo.website}
                    onChange={(e) => setHotelInfo({...hotelInfo, website: e.target.value})}
                    placeholder="https://aureagrand.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={hotelInfo.address}
                  onChange={(e) => setHotelInfo({...hotelInfo, address: e.target.value})}
                  placeholder="Addis Ababa, Ethiopia"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={hotelInfo.description}
                  onChange={(e) => setHotelInfo({...hotelInfo, description: e.target.value})}
                  placeholder="Brief description of your hotel"
                  rows={3}
                />
              </div>
              <Button onClick={handleSaveHotelInfo} disabled={isSaving} className="bg-yellow-500 hover:bg-yellow-600">
                <Save className="w-4 h-4 mr-2" />
                Save Hotel Information
              </Button>
            </div>
          </Card>

          {/* Payment Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h2 className="font-semibold text-xl">Payment Settings</h2>
                <p className="text-sm text-muted-foreground">Configure payment methods and details</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Telebirr Settings */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-yellow-500" />
                    <h3 className="font-medium">Telebirr</h3>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentSettings.telebirrEnabled}
                      onChange={(e) => setPaymentSettings({...paymentSettings, telebirrEnabled: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Enabled</span>
                  </label>
                </div>
                {paymentSettings.telebirrEnabled && (
                  <div className="grid md:grid-cols-2 gap-4 pl-6">
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input
                        value={paymentSettings.telebirrPhone}
                        onChange={(e) => setPaymentSettings({...paymentSettings, telebirrPhone: e.target.value})}
                        placeholder="+251 912 345 678"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Name</Label>
                      <Input
                        value={paymentSettings.telebirrAccountName}
                        onChange={(e) => setPaymentSettings({...paymentSettings, telebirrAccountName: e.target.value})}
                        placeholder="Auréa Grand Hotel"
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Bank Transfer Settings */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-yellow-500" />
                    <h3 className="font-medium">Bank Transfer</h3>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentSettings.bankEnabled}
                      onChange={(e) => setPaymentSettings({...paymentSettings, bankEnabled: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Enabled</span>
                  </label>
                </div>
                {paymentSettings.bankEnabled && (
                  <div className="grid md:grid-cols-2 gap-4 pl-6">
                    <div className="space-y-2">
                      <Label>Bank Name</Label>
                      <Input
                        value={paymentSettings.bankName}
                        onChange={(e) => setPaymentSettings({...paymentSettings, bankName: e.target.value})}
                        placeholder="Commercial Bank of Ethiopia"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Number</Label>
                      <Input
                        value={paymentSettings.bankAccountNumber}
                        onChange={(e) => setPaymentSettings({...paymentSettings, bankAccountNumber: e.target.value})}
                        placeholder="1000123456789"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Name</Label>
                      <Input
                        value={paymentSettings.bankAccountName}
                        onChange={(e) => setPaymentSettings({...paymentSettings, bankAccountName: e.target.value})}
                        placeholder="Auréa Grand Hotel PLC"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>SWIFT Code (Optional)</Label>
                      <Input
                        value={paymentSettings.bankSwiftCode}
                        onChange={(e) => setPaymentSettings({...paymentSettings, bankSwiftCode: e.target.value})}
                        placeholder="CBETETAA"
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Pay at Hotel */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-yellow-500" />
                    <div>
                      <h3 className="font-medium">Pay at Hotel</h3>
                      <p className="text-sm text-muted-foreground">Allow guests to pay upon arrival</p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentSettings.payAtHotelEnabled}
                      onChange={(e) => setPaymentSettings({...paymentSettings, payAtHotelEnabled: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Enabled</span>
                  </label>
                </div>
              </div>

              <Separator />

              {/* Currency & Tax */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input
                    value={paymentSettings.currency}
                    onChange={(e) => setPaymentSettings({...paymentSettings, currency: e.target.value})}
                    placeholder="USD"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tax Rate (%)</Label>
                  <Input
                    type="number"
                    value={paymentSettings.taxRate}
                    onChange={(e) => setPaymentSettings({...paymentSettings, taxRate: Number(e.target.value)})}
                    placeholder="15"
                  />
                </div>
              </div>

              <Button onClick={handleSavePaymentSettings} disabled={isSaving} className="bg-yellow-500 hover:bg-yellow-600">
                <Save className="w-4 h-4 mr-2" />
                Save Payment Settings
              </Button>
            </div>
          </Card>

          {/* Booking Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h2 className="font-semibold text-xl">Booking Settings</h2>
                <p className="text-sm text-muted-foreground">Configure booking rules and policies</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Minimum Advance Booking (Days)</Label>
                  <Input
                    type="number"
                    value={bookingSettings.minAdvanceBookingDays}
                    onChange={(e) => setBookingSettings({...bookingSettings, minAdvanceBookingDays: Number(e.target.value)})}
                    placeholder="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Advance Booking (Days)</Label>
                  <Input
                    type="number"
                    value={bookingSettings.maxAdvanceBookingDays}
                    onChange={(e) => setBookingSettings({...bookingSettings, maxAdvanceBookingDays: Number(e.target.value)})}
                    placeholder="365"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Free Cancellation (Hours)</Label>
                  <Input
                    type="number"
                    value={bookingSettings.cancellationHours}
                    onChange={(e) => setBookingSettings({...bookingSettings, cancellationHours: Number(e.target.value)})}
                    placeholder="48"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Check-in Time</Label>
                  <Input
                    type="time"
                    value={bookingSettings.checkInTime}
                    onChange={(e) => setBookingSettings({...bookingSettings, checkInTime: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Check-out Time</Label>
                  <Input
                    type="time"
                    value={bookingSettings.checkOutTime}
                    onChange={(e) => setBookingSettings({...bookingSettings, checkOutTime: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bookingSettings.requirePaymentProof}
                    onChange={(e) => setBookingSettings({...bookingSettings, requirePaymentProof: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <div>
                    <span className="font-medium">Require Payment Proof</span>
                    <p className="text-sm text-muted-foreground">Guests must upload payment proof for Telebirr/Bank transfers</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bookingSettings.autoApprovePayAtHotel}
                    onChange={(e) => setBookingSettings({...bookingSettings, autoApprovePayAtHotel: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <div>
                    <span className="font-medium">Auto-approve "Pay at Hotel" Bookings</span>
                    <p className="text-sm text-muted-foreground">Automatically confirm bookings with "Pay at Hotel" option</p>
                  </div>
                </label>
              </div>

              <Button onClick={handleSaveBookingSettings} disabled={isSaving} className="bg-yellow-500 hover:bg-yellow-600">
                <Save className="w-4 h-4 mr-2" />
                Save Booking Settings
              </Button>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h2 className="font-semibold text-xl">Notification Settings</h2>
                <p className="text-sm text-muted-foreground">Configure how you receive notifications</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => setNotificationSettings({...notificationSettings, emailNotifications: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <div>
                    <span className="font-medium">Email Notifications</span>
                    <p className="text-sm text-muted-foreground">Receive booking notifications via email</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.smsNotifications}
                    onChange={(e) => setNotificationSettings({...notificationSettings, smsNotifications: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <div>
                    <span className="font-medium">SMS Notifications</span>
                    <p className="text-sm text-muted-foreground">Receive booking notifications via SMS</p>
                  </div>
                </label>
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Admin Email</Label>
                  <Input
                    type="email"
                    value={notificationSettings.adminEmail}
                    onChange={(e) => setNotificationSettings({...notificationSettings, adminEmail: e.target.value})}
                    placeholder="admin@aureagrand.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Booking Notification Email</Label>
                  <Input
                    type="email"
                    value={notificationSettings.bookingNotificationEmail}
                    onChange={(e) => setNotificationSettings({...notificationSettings, bookingNotificationEmail: e.target.value})}
                    placeholder="bookings@aureagrand.com"
                  />
                </div>
              </div>

              <Button onClick={handleSaveNotificationSettings} disabled={isSaving} className="bg-yellow-500 hover:bg-yellow-600">
                <Save className="w-4 h-4 mr-2" />
                Save Notification Settings
              </Button>
            </div>
          </Card>

          {/* Password Change */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Lock className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h2 className="font-semibold text-xl">Change Password</h2>
                <p className="text-sm text-muted-foreground">Update your admin password</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-4">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  <strong>Security Tip:</strong> Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.
                </p>
              </div>

              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password *</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="Enter current password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="pl-10"
                      disabled={isChangingPassword}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="pl-10"
                      disabled={isChangingPassword}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="pl-10"
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
                  } catch (error: any) {
                    toast.error("Failed to change password", { 
                      description: error.message 
                    });
                  } finally {
                    setIsChangingPassword(false);
                  }
                }}
                disabled={isChangingPassword} 
                className="bg-yellow-500 hover:bg-yellow-600"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Change Password
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
