import { useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetSettings, useUpdateSettings } from "@workspace/api-client-react";
import { Loader } from "@/components/ui/Loader";
import { getAuthHeaders } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Save, Store, Phone, Globe, CreditCard, Truck, MessageCircle, Type } from "lucide-react";

const inputClass = "w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-foreground/20";
const inputStyle = { background: 'hsl(0 0% 9.5%)', border: '1px solid #e5e7eb', color: '#111827' };

const SectionCard = ({ icon: Icon, title, iconColor = "hsl(var(--primary))", children }: {
  icon: any; title: string; iconColor?: string; children: React.ReactNode;
}) => (
  <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #e5e7eb' }}>
    <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5" style={{ background: 'hsl(0 0% 7.5%)' }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${iconColor}15`, border: `1px solid ${iconColor}25` }}>
        <Icon className="w-4 h-4" style={{ color: iconColor }} />
      </div>
      <h2 className="font-bold text-sm">{title}</h2>
    </div>
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>
    </div>
  </div>
);

const Field = ({ label, children, full = false }: { label: string; children: React.ReactNode; full?: boolean }) => (
  <div className={full ? "md:col-span-2" : ""}>
    <label className="block text-[11px] font-black uppercase tracking-widest text-foreground/30 mb-2">{label}</label>
    {children}
  </div>
);

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: settings, isLoading } = useGetSettings({ request: { headers: getAuthHeaders() } });
  const { mutateAsync: updateSettings, isPending } = useUpdateSettings();
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (settings) reset(settings);
  }, [settings, reset]);

  const onSubmit = async (data: any) => {
    try {
      await updateSettings({ data, request: { headers: getAuthHeaders() } });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "✓ Settings saved successfully!" });
    } catch {
      toast({ title: "Failed to save settings", variant: "destructive" });
    }
  };

  if (isLoading) return <AdminLayout><Loader /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Configuration</p>
        <h1 className="text-4xl font-black font-display tracking-tighter">Store Settings</h1>
        <p className="text-sm text-foreground/35 mt-2">Configure your store details, payment numbers and more.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">

        {/* General */}
        <SectionCard icon={Store} title="General Information">
          <Field label="Store Name">
            <input {...register("siteName")} className={inputClass} style={inputStyle} placeholder="TryNex Lifestyle" />
          </Field>
          <Field label="Tagline">
            <input {...register("tagline")} className={inputClass} style={inputStyle} placeholder="You imagine, we craft." />
          </Field>
          <Field label="Hero Section Title" full>
            <input {...register("heroTitle")} className={inputClass} style={inputStyle} placeholder="Premium Custom Apparel" />
          </Field>
          <Field label="Hero Subtitle" full>
            <input {...register("heroSubtitle")} className={inputClass} style={inputStyle} placeholder="Elevate your wardrobe with bespoke custom apparel." />
          </Field>
          <Field label="Announcement Bar Text" full>
            <input {...register("announcementBar")} className={inputClass} style={inputStyle} placeholder="🚚 Free delivery on orders above ৳1,500!" />
          </Field>
        </SectionCard>

        {/* Contact */}
        <SectionCard icon={Phone} title="Contact Information" iconColor="#60a5fa">
          <Field label="Support Phone">
            <input {...register("phone")} className={inputClass} style={inputStyle} placeholder="+880 1700-000000" />
          </Field>
          <Field label="WhatsApp Number">
            <input {...register("whatsappNumber")} className={inputClass} style={inputStyle} placeholder="01700-000000" />
          </Field>
          <Field label="Support Email">
            <input {...register("email")} className={inputClass} style={inputStyle} placeholder="hello@trynex.com" />
          </Field>
          <Field label="Business Address">
            <input {...register("address")} className={inputClass} style={inputStyle} placeholder="Banani, Dhaka-1213, Bangladesh" />
          </Field>
        </SectionCard>

        {/* Social Media */}
        <SectionCard icon={Globe} title="Social Media" iconColor="#a78bfa">
          <Field label="Facebook Page URL">
            <input {...register("facebookUrl")} className={inputClass} style={inputStyle} placeholder="https://facebook.com/trynex" />
          </Field>
          <Field label="Instagram Profile URL">
            <input {...register("instagramUrl")} className={inputClass} style={inputStyle} placeholder="https://instagram.com/trynex" />
          </Field>
          <Field label="YouTube Channel URL">
            <input {...register("youtubeUrl")} className={inputClass} style={inputStyle} placeholder="https://youtube.com/@trynex" />
          </Field>
        </SectionCard>

        {/* Payment */}
        <SectionCard icon={CreditCard} title="Payment Methods" iconColor="#e2136e">
          <Field label="bKash Merchant Number">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black" style={{ color: '#e2136e' }}>bK</span>
              <input {...register("bkashNumber")} className={inputClass} style={{ ...inputStyle, paddingLeft: '2.5rem' }} placeholder="01712-345678" />
            </div>
          </Field>
          <Field label="Nagad Merchant Number">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black" style={{ color: '#f7941d' }}>N</span>
              <input {...register("nagadNumber")} className={inputClass} style={{ ...inputStyle, paddingLeft: '2.5rem' }} placeholder="01811-234567" />
            </div>
          </Field>
          <Field label="Rocket (DBBL) Number">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black" style={{ color: '#8b2291' }}>R</span>
              <input {...register("rocketNumber")} className={inputClass} style={{ ...inputStyle, paddingLeft: '2.5rem' }} placeholder="01611-234567" />
            </div>
          </Field>
        </SectionCard>

        {/* Shipping */}
        <SectionCard icon={Truck} title="Shipping & Delivery" iconColor="#4ade80">
          <Field label="Free Shipping Threshold (৳)">
            <input type="number" {...register("freeShippingThreshold")} className={inputClass} style={inputStyle} placeholder="1500" />
          </Field>
          <Field label="Standard Shipping Cost (৳)">
            <input type="number" {...register("shippingCost")} className={inputClass} style={inputStyle} placeholder="100" />
          </Field>
        </SectionCard>

        {/* Save Button */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="btn-glow flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-white text-sm disabled:opacity-50 disabled:transform-none"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), rgba(255,152,64,1))', boxShadow: '0 8px 30px rgba(255,107,43,0.35)' }}
          >
            <Save className="w-4 h-4" />
            {isPending ? "Saving Changes..." : "Save All Settings"}
          </button>
          <p className="text-xs text-foreground/30">Changes take effect immediately.</p>
        </div>
      </form>
    </AdminLayout>
  );
}
