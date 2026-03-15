import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@aurora/shared/supabase";

interface FormState {
  buyer_name: string;
  company: string;
  contact: string;
  message: string;
}

const empty: FormState = { buyer_name: '', company: '', contact: '', message: '' };

const InquiryForm = () => {
  const { t } = useTranslation();
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

    const { error } = await supabase.from('inquiries').insert([form]);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setForm(empty);
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="rounded-xl border border-status-green/30 bg-status-green/10 p-6 text-center space-y-2">
        <p className="text-status-green font-semibold">{t('inquiry_sent')}</p>
        <p className="text-sm text-muted-foreground">{t('well_be_in_touch')}</p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-2 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
        >
          {t('send_another')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('name')}</label>
          <input
            name="buyer_name"
            value={form.buyer_name}
            onChange={handleChange}
            required
            placeholder={t('your_name')}
            className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-input text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('company')}</label>
          <input
            name="company"
            value={form.company}
            onChange={handleChange}
            required
            placeholder={t('company_name')}
            className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-input text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('email_or_wechat')}</label>
        <input
          name="contact"
          value={form.contact}
          onChange={handleChange}
          required
          placeholder={t('email_or_wechat_placeholder')}
          className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-input text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-colors"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('message')}</label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          required
          rows={4}
          placeholder={t('message_placeholder')}
          className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-input text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-colors resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-status-red">{t('failed_to_submit')} {error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-2.5 bg-accent text-accent-foreground font-medium rounded-lg text-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
      >
        {submitting ? t('sending') : t('send_inquiry')}
      </button>
    </form>
  );
};

export default InquiryForm;
