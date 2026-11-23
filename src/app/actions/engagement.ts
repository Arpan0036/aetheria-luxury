"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  ConciergeInquiryInput,
  ConnectionMode,
  ContactInquiry,
  NewsletterSubscriber,
} from "@/types/database";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function deriveTicketCode(id: string): string {
  const clean = id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const suffix = clean.slice(-4).padStart(4, "8");
  return `CONC-${suffix}`;
}

export async function submitConciergeInquiryAction(
  input: ConciergeInquiryInput,
): Promise<{
  ok: boolean;
  mode: ConnectionMode;
  ticketNumber?: string;
  inquiry?: ContactInquiry;
  error?: string;
}> {
  const fullName = input.full_name.trim();
  const email = input.email.trim().toLowerCase();
  const subject = input.subject.trim() || "Product Specification";
  const orderReference = input.order_reference?.trim()
    ? input.order_reference.trim().toUpperCase()
    : null;
  const message = input.message.trim();

  if (!fullName || fullName.length < 2) {
    return {
      ok: false,
      mode: "local-fallback",
      error: "Please enter your full name for our Private Client Concierge ledger.",
    };
  }
  if (!EMAIL_RE.test(email)) {
    return {
      ok: false,
      mode: "local-fallback",
      error: "Please provide a valid email address for return correspondence.",
    };
  }
  if (!message || message.length < 10) {
    return {
      ok: false,
      mode: "local-fallback",
      error: "Please include a brief summary of your specification or dispatch inquiry (min 10 characters).",
    };
  }

  const client = await createClient();

  if (client) {
    try {
      const { data, error } = await client
        .from("contact_inquiries")
        .insert({
          full_name: fullName,
          email,
          subject,
          order_reference: orderReference,
          message,
          status: "new",
        })
        .select("*")
        .single();

      if (!error && data) {
        const inquiry: ContactInquiry = {
          id: String(data.id),
          full_name: String(data.full_name),
          email: String(data.email),
          subject: String(data.subject),
          order_reference: data.order_reference ? String(data.order_reference) : null,
          message: String(data.message),
          status: String(data.status ?? "new"),
          created_at: String(data.created_at ?? new Date().toISOString()),
        };
        return {
          ok: true,
          mode: "supabase-live",
          ticketNumber: deriveTicketCode(inquiry.id),
          inquiry,
        };
      }
    } catch {
      // Fall through to resilient local ticket generation if offline
    }
  }

  const fallbackId = `local-${Date.now()}`;
  const fallbackInquiry: ContactInquiry = {
    id: fallbackId,
    full_name: fullName,
    email,
    subject,
    order_reference: orderReference,
    message,
    status: "new",
    created_at: new Date().toISOString(),
  };

  return {
    ok: true,
    mode: "local-fallback",
    ticketNumber: deriveTicketCode(fallbackId),
    inquiry: fallbackInquiry,
  };
}

export async function subscribeNewsletterAction(
  rawEmail: string,
  source = "footer",
): Promise<{
  ok: boolean;
  mode: ConnectionMode;
  alreadySubscribed: boolean;
  message: string;
  subscriber?: NewsletterSubscriber;
}> {
  const email = rawEmail.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return {
      ok: false,
      mode: "local-fallback",
      alreadySubscribed: false,
      message: "Please enter a valid collector email address.",
    };
  }

  const client = await createClient();

  if (client) {
    try {
      const { data, error } = await client
        .from("newsletter_subscribers")
        .insert({
          email,
          source: source.trim() || "footer",
        })
        .select("*")
        .single();

      if (error) {
        // PostgreSQL 23505 unique_violation — handle duplicate gracefully
        if (
          error.code === "23505" ||
          error.message.toLowerCase().includes("duplicate") ||
          error.message.toLowerCase().includes("unique")
        ) {
          return {
            ok: true,
            mode: "supabase-live",
            alreadySubscribed: true,
            message: "Already on the Private Archive List",
          };
        }
      } else if (data) {
        const subscriber: NewsletterSubscriber = {
          id: String(data.id),
          email: String(data.email),
          source: String(data.source ?? source),
          created_at: String(data.created_at ?? new Date().toISOString()),
        };
        return {
          ok: true,
          mode: "supabase-live",
          alreadySubscribed: false,
          message: "Archive Access Granted — Dispatches Enabled",
          subscriber,
        };
      }
    } catch {
      // Fall through to resilient local response
    }
  }

  return {
    ok: true,
    mode: "local-fallback",
    alreadySubscribed: false,
    message: "Archive Access Granted — Dispatches Enabled",
  };
}
