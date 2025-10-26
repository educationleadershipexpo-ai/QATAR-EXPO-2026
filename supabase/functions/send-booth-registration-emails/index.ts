import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = "partnerships@eduexpoqatar.com";

interface BoothRegistration {
  name: string;
  email: string;
  phone: string;
  country: string;
  website: string;
  company: string;
  job_title: string;
  company_field: string;
  package: string;
  source: string;
  message?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      throw new Error("Method not allowed");
    }

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const registration: BoothRegistration = await req.json();

    // Send confirmation email to user
    const userEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "QELE 2026 <noreply@eduexpoqatar.com>",
        to: [registration.email],
        subject: "Registration Confirmation - QELE 2026 Exhibitor Booth",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #1a5490; color: white; padding: 30px 20px; text-align: center; }
              .content { background-color: #f9f9f9; padding: 30px 20px; }
              .footer { background-color: #333; color: white; padding: 20px; text-align: center; font-size: 0.9em; }
              .button { display: inline-block; background-color: #4db6ac; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .info-box { background-color: white; padding: 20px; border-left: 4px solid #4db6ac; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Thank You for Your Interest!</h1>
              </div>
              <div class="content">
                <p>Dear ${registration.name},</p>
                
                <p>Thank you for your interest in exhibiting at the <strong>Qatar Education Leadership Expo 2026</strong>!</p>
                
                <p>We have received your booth registration inquiry with the following details:</p>
                
                <div class="info-box">
                  <strong>Company:</strong> ${registration.company}<br>
                  <strong>Package:</strong> ${registration.package}<br>
                  <strong>Contact:</strong> ${registration.email}<br>
                  <strong>Phone:</strong> ${registration.phone}
                </div>
                
                <p>Our partnership team will review your information and contact you within 2-3 business days to discuss:</p>
                <ul>
                  <li>Available booth locations and placement</li>
                  <li>Pricing and payment options</li>
                  <li>Additional services and customization</li>
                  <li>Next steps to confirm your booking</li>
                </ul>
                
                <p>In the meantime, if you have any urgent questions, please don't hesitate to reach out to us at <a href="mailto:partnerships@eduexpoqatar.com">partnerships@eduexpoqatar.com</a> or call us at +974 7444 9111.</p>
                
                <p>We look forward to having you as part of QELE 2026!</p>
                
                <p>Best regards,<br>
                <strong>QELE 2026 Partnership Team</strong></p>
              </div>
              <div class="footer">
                <p>Qatar Education Leadership Expo 2026<br>
                Sheraton Grand Doha, Qatar<br>
                Email: partnerships@eduexpoqatar.com | Phone: +974 7444 9111</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!userEmailResponse.ok) {
      const errorText = await userEmailResponse.text();
      console.error("Failed to send user confirmation email:", errorText);
      throw new Error(`Failed to send user confirmation email: ${errorText}`);
    }

    // Send notification email to admin with all details
    const adminEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "QELE 2026 <noreply@eduexpoqatar.com>",
        to: [ADMIN_EMAIL],
        subject: `New Booth Registration: ${registration.company}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 700px; margin: 0 auto; padding: 20px; }
              .header { background-color: #1a5490; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f9f9f9; padding: 30px 20px; }
              .field { margin-bottom: 15px; padding: 10px; background-color: white; border-left: 3px solid #4db6ac; }
              .field-label { font-weight: bold; color: #1a5490; }
              .field-value { margin-top: 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>New Booth Registration Received</h2>
              </div>
              <div class="content">
                <p><strong>A new exhibitor has expressed interest in booking a booth at QELE 2026.</strong></p>
                
                <h3>Contact Information:</h3>
                <div class="field">
                  <div class="field-label">Full Name:</div>
                  <div class="field-value">${registration.name}</div>
                </div>
                
                <div class="field">
                  <div class="field-label">Email:</div>
                  <div class="field-value"><a href="mailto:${registration.email}">${registration.email}</a></div>
                </div>
                
                <div class="field">
                  <div class="field-label">Phone:</div>
                  <div class="field-value"><a href="tel:${registration.phone}">${registration.phone}</a></div>
                </div>
                
                <div class="field">
                  <div class="field-label">Country:</div>
                  <div class="field-value">${registration.country}</div>
                </div>
                
                <h3>Company Information:</h3>
                <div class="field">
                  <div class="field-label">Company Name:</div>
                  <div class="field-value">${registration.company}</div>
                </div>
                
                <div class="field">
                  <div class="field-label">Website:</div>
                  <div class="field-value"><a href="${registration.website}" target="_blank">${registration.website}</a></div>
                </div>
                
                <div class="field">
                  <div class="field-label">Job Title/Position:</div>
                  <div class="field-value">${registration.job_title}</div>
                </div>
                
                <div class="field">
                  <div class="field-label">Company Field:</div>
                  <div class="field-value">${registration.company_field}</div>
                </div>
                
                <h3>Booth Details:</h3>
                <div class="field">
                  <div class="field-label">Selected Package:</div>
                  <div class="field-value">${registration.package}</div>
                </div>
                
                <div class="field">
                  <div class="field-label">How They Heard About Us:</div>
                  <div class="field-value">${registration.source}</div>
                </div>
                
                ${registration.message ? `
                <h3>Additional Message:</h3>
                <div class="field">
                  <div class="field-value">${registration.message}</div>
                </div>
                ` : ''}
                
                <p style="margin-top: 30px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107;">
                  <strong>Action Required:</strong> Please follow up with this exhibitor within 2-3 business days to finalize their booth booking.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!adminEmailResponse.ok) {
      const errorText = await adminEmailResponse.text();
      console.error("Failed to send admin notification email:", errorText);
      throw new Error(`Failed to send admin notification email: ${errorText}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Emails sent successfully"
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in send-booth-registration-emails:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "An error occurred while sending emails"
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});