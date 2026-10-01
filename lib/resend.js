import { Resend } from "resend";

// Lazy initialization - only create Resend instance when actually needed
// This prevents build failures when RESEND_API_KEY is not set in Vercel
let resendInstance = null;

export function getResend() {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      throw new Error(
        "Missing RESEND_API_KEY environment variable. " +
        "Please add it to your Vercel project settings or .env file."
      );
    }
    
    resendInstance = new Resend(apiKey);
  }
  
  return resendInstance;
}

export const fromAddress = process.env.RESEND_FROM ?? "Malle Stays <onboarding@resend.dev>";
