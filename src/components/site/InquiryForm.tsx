import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { inquirySchema, type InquiryRequest } from "@/lib/inquiry-schema";
import { submitInquiry } from "@/lib/inquiry.functions";

type InquiryKind = InquiryRequest["kind"];

export function InquiryForm({ kind }: { kind: InquiryKind }) {
  const { t } = useI18n();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const idPrefix = `inquiry-${kind}`;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setSubmitting(true);
    setSuccess(false);
    setError("");
    const values = new FormData(form);
    const optionalNumber = (key: string) => {
      const value = values.get(key)?.toString() ?? "";
      return value ? Number(value) : null;
    };
    const request = inquirySchema.safeParse({
      kind,
      fullName: values.get("fullName")?.toString() ?? "",
      email: values.get("email")?.toString() ?? "",
      phone: values.get("phone")?.toString() ?? "",
      organization: values.get("organization")?.toString() ?? "",
      eventType: values.get("eventType")?.toString() ?? "",
      requestedDate: values.get("requestedDate")?.toString() ?? "",
      guestCount: optionalNumber("guestCount"),
      quantity: optionalNumber("quantity"),
      message: values.get("message")?.toString() ?? "",
      honeypot: values.get("companyWebsite")?.toString() ?? "",
    });

    if (!request.success) {
      setError(t.inquiry.validation);
      setSubmitting(false);
      return;
    }

    try {
      await submitInquiry({ data: request.data });
      setSuccess(true);
      form.reset();
    } catch (submitError: unknown) {
      console.error("Inquiry form submission failed:", submitError);
      setError(t.inquiry.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-5 rounded-2xl border border-border bg-card p-5 sm:p-8"
      noValidate
    >
      <div>
        <Label htmlFor={`${idPrefix}-name`}>{t.inquiry.name}</Label>
        <Input
          id={`${idPrefix}-name`}
          name="fullName"
          autoComplete="name"
          required
          maxLength={100}
        />
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-email`}>{t.inquiry.email}</Label>
        <Input
          id={`${idPrefix}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={255}
        />
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-phone`}>{t.inquiry.phone}</Label>
        <Input id={`${idPrefix}-phone`} name="phone" type="tel" autoComplete="tel" maxLength={30} />
      </div>
      {kind === "private_event" && (
        <>
          <div>
            <Label htmlFor={`${idPrefix}-event-type`}>{t.inquiry.eventType}</Label>
            <select
              id={`${idPrefix}-event-type`}
              name="eventType"
              defaultValue=""
              required
              className="field"
            >
              <option value="">{t.inquiry.eventTypes.choose}</option>
              <option value="birthday">{t.inquiry.eventTypes.birthday}</option>
              <option value="group">{t.inquiry.eventTypes.group}</option>
              <option value="corporate_dinner">{t.inquiry.eventTypes.corporate_dinner}</option>
            </select>
          </div>
          <div>
            <Label htmlFor={`${idPrefix}-date`}>{t.inquiry.requestedDate}</Label>
            <Input id={`${idPrefix}-date`} name="requestedDate" type="date" />
          </div>
          <div>
            <Label htmlFor={`${idPrefix}-guests`}>{t.inquiry.guestCount}</Label>
            <Input id={`${idPrefix}-guests`} name="guestCount" type="number" min={1} max={500} />
          </div>
        </>
      )}
      {kind === "gift" && (
        <div>
          <Label htmlFor={`${idPrefix}-quantity`}>{t.inquiry.quantity}</Label>
          <Input
            id={`${idPrefix}-quantity`}
            name="quantity"
            type="number"
            min={1}
            max={100}
            required
          />
        </div>
      )}
      {kind === "partner" && (
        <div>
          <Label htmlFor={`${idPrefix}-organization`}>{t.inquiry.organization}</Label>
          <Input
            id={`${idPrefix}-organization`}
            name="organization"
            autoComplete="organization"
            required
            maxLength={160}
          />
        </div>
      )}
      <div>
        <Label htmlFor={`${idPrefix}-message`}>{t.inquiry.message}</Label>
        <textarea
          id={`${idPrefix}-message`}
          name="message"
          className="field min-h-32"
          maxLength={2000}
          required
        />
      </div>
      <div aria-hidden="true" className="absolute -start-[10000px] h-px w-px overflow-hidden">
        <label htmlFor={`${idPrefix}-website`}>{t.inquiry.honeypot}</label>
        <input
          id={`${idPrefix}-website`}
          name="companyWebsite"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="text-sm text-accent">
          {t.inquiry.success}
        </p>
      )}
      <Button type="submit" disabled={submitting}>
        {submitting ? t.inquiry.sending : t.inquiry.submit}
      </Button>
    </form>
  );
}
