const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type BookingPayload = {
  name?: string;
  date?: string;
  guests?: string;
  location?: string;
  details?: string;
  language?: "en" | "es";
  message?: string;
};

function text(value: unknown, fallback = "") {
  return String(value ?? fallback).trim();
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function htmlLines(value: string) {
  return escapeHtml(value).replace(/\n/g, "<br />");
}

function isValidPayload(payload: BookingPayload) {
  return (
    text(payload.name).length >= 2 &&
    text(payload.date).length >= 8 &&
    Number(text(payload.guests)) >= 1 &&
    text(payload.location).length >= 2
  );
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const toEmail = Deno.env.get("CHEF_BOOKING_EMAIL");
  const fromEmail = Deno.env.get("BOOKING_FROM_EMAIL") || "Dining Experience <onboarding@resend.dev>";

  if (!resendApiKey || !toEmail) {
    return jsonResponse({ error: "Email service is not configured" }, 500);
  }

  let payload: BookingPayload;

  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (!isValidPayload(payload)) {
    return jsonResponse({ error: "Missing required booking details" }, 400);
  }

  const lang = payload.language === "es" ? "es" : "en";
  const name = text(payload.name);
  const date = text(payload.date);
  const guests = text(payload.guests);
  const location = text(payload.location);
  const details = text(payload.details, lang === "es" ? "Sin detalles adicionales." : "No extra details.");
  const message = text(payload.message);
  const safeName = escapeHtml(name);
  const safeDate = escapeHtml(date);
  const safeGuests = escapeHtml(guests);
  const safeLocation = escapeHtml(location);
  const safeDetails = htmlLines(details);
  const safeMessage = htmlLines(message);

  const subject =
    lang === "es"
      ? `Nueva solicitud de chef privado - ${name}`
      : `New private chef request - ${name}`;

  const html =
    lang === "es"
      ? `
        <h2>Nueva solicitud de experiencia privada</h2>
        <p>Un cliente completo el formulario de Dining Experience.</p>
        <p><strong>Nombre:</strong> ${safeName}</p>
        <p><strong>Fecha:</strong> ${safeDate}</p>
        <p><strong>Cantidad de personas:</strong> ${safeGuests}</p>
        <p><strong>Ubicacion:</strong> ${safeLocation}</p>
        <p><strong>Detalles:</strong></p>
        <p>${safeDetails}</p>
        ${message ? `<hr /><p><strong>Mensaje para WhatsApp:</strong></p><p>${safeMessage}</p>` : ""}
      `
      : `
        <h2>New private chef experience request</h2>
        <p>A guest submitted the Dining Experience booking form.</p>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Date:</strong> ${safeDate}</p>
        <p><strong>Guest count:</strong> ${safeGuests}</p>
        <p><strong>Location:</strong> ${safeLocation}</p>
        <p><strong>Details:</strong></p>
        <p>${safeDetails}</p>
        ${message ? `<hr /><p><strong>WhatsApp message:</strong></p><p>${safeMessage}</p>` : ""}
      `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return jsonResponse({ error }, 502);
  }

  return jsonResponse({ ok: true });
});
