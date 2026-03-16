import { useState } from "react";
import Aurora from "@/components/Aurora";
import Logo from "@/components/Logo";
import { supabase } from "@aurora/shared/supabase";

interface FormState {
  buyer_name: string;
  company: string;
  contact: string;
  product_name: string;
  quantity: string;
  message: string;
}

const empty: FormState = {
  buyer_name: '',
  company: '',
  contact: '',
  product_name: '',
  quantity: '',
  message: '',
};

const Inquiry = () => {
  const [form, setForm] = useState<FormState>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error } = await supabase.from('inquiries').insert([{
      buyer_name: form.buyer_name,
      company: form.company,
      contact: form.contact,
      product_name: form.product_name,
      quantity: form.quantity ? parseInt(form.quantity) : null,
      message: form.message,
    }]);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setForm(empty);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <img
        src="https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1920&q=80"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/[0.55]" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(6,182,212,0.08) 75%, rgba(6,182,212,0.18) 100%)",
        }}
      />
      <div className="absolute inset-0 opacity-25 mix-blend-screen">
        <Aurora />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[520px] mx-4 my-8">
        <div className="backdrop-blur-2xl bg-black/[0.55] rounded-2xl p-8 md:p-10 border border-white/[0.08] shadow-2xl shadow-black/40">
          <div className="text-center mb-8">
            <Logo className="h-10 mx-auto mb-6 block" variant="dark" />
            <h1 className="text-lg font-semibold text-foreground tracking-wide">Send en forespørsel</h1>
            <p className="text-muted-foreground text-sm mt-1.5 font-light">
              Fyll ut skjemaet — vi svarer innen 24 timer
            </p>
          </div>

          {success ? (
            <div className="rounded-xl border border-status-green/30 bg-status-green/10 p-6 text-center space-y-2">
              <p className="text-status-green font-semibold text-lg">Forespørsel mottatt!</p>
              <p className="text-sm text-muted-foreground">Vi tar kontakt med deg snart.</p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-3 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Send en ny forespørsel
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name + Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/40 text-xs block mb-1.5 font-medium tracking-wide uppercase">
                    Navn *
                  </label>
                  <input
                    name="buyer_name"
                    value={form.buyer_name}
                    onChange={handleChange}
                    required
                    placeholder="Ditt navn"
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-lg text-foreground placeholder-white/20 text-sm focus:border-white/[0.25] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-white/40 text-xs block mb-1.5 font-medium tracking-wide uppercase">
                    Firma *
                  </label>
                  <input
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    required
                    placeholder="Firmanavn"
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-lg text-foreground placeholder-white/20 text-sm focus:border-white/[0.25] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Contact */}
              <div>
                <label className="text-white/40 text-xs block mb-1.5 font-medium tracking-wide uppercase">
                  E-post eller WeChat *
                </label>
                <input
                  name="contact"
                  value={form.contact}
                  onChange={handleChange}
                  required
                  placeholder="email@firma.com eller WeChat-ID"
                  className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-lg text-foreground placeholder-white/20 text-sm focus:border-white/[0.25] focus:outline-none transition-all"
                />
              </div>

              {/* Product + Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/40 text-xs block mb-1.5 font-medium tracking-wide uppercase">
                    Produkt *
                  </label>
                  <input
                    name="product_name"
                    value={form.product_name}
                    onChange={handleChange}
                    required
                    placeholder="f.eks. Vinterjakke, Softshell"
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-lg text-foreground placeholder-white/20 text-sm focus:border-white/[0.25] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-white/40 text-xs block mb-1.5 font-medium tracking-wide uppercase">
                    Mengde (stk)
                  </label>
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={handleChange}
                    placeholder="f.eks. 500"
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-lg text-foreground placeholder-white/20 text-sm focus:border-white/[0.25] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-white/40 text-xs block mb-1.5 font-medium tracking-wide uppercase">
                  Melding *
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Beskriv hva du leter etter — spesifikasjoner, størrelsesfordeling, ønsket leveringstid..."
                  className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-lg text-foreground placeholder-white/20 text-sm focus:border-white/[0.25] focus:outline-none transition-all resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-status-red">Kunne ikke sende: {error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="block w-full py-2.5 mt-2 bg-white/[0.06] text-white/85 font-medium rounded-lg text-center border border-white/[0.12] hover:bg-white/[0.1] hover:border-white/[0.2] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm tracking-wide"
              >
                {submitting ? 'Sender...' : 'Send forespørsel'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[11px] text-white/20 mt-8 tracking-wide">
          © 2026 Global Distribution AS
        </p>
      </div>
    </div>
  );
};

export default Inquiry;
