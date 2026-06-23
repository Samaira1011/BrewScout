import { Resend } from "resend";

const resendKey = process.env.RESEND_API_KEY;
const resend = resendKey ? new Resend(resendKey) : null;

// Helper to standardise container styles
function getBaseTemplate(contentHtml: string) {
  return `
    <div style="font-family: 'Inter', system-ui, sans-serif; background-color: #fbf9ff; padding: 40px 20px; text-align: center; color: #21152d;">
      <div style="max-width: 540px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e7dff0; border-radius: 32px; overflow: hidden; box-shadow: 0 10px 30px rgba(116, 65, 181, 0.04);">
        <!-- Header banner gradient -->
        <div style="background: linear-gradient(135deg, #7441b5, #21152d); padding: 32px; text-align: left;">
          <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">VibeCheck<span style="color: #ff6679;">.</span></h1>
        </div>
        
        <!-- Main body content -->
        <div style="padding: 40px 32px; text-align: left;">
          ${contentHtml}
        </div>
        
        <!-- Footer -->
        <div style="background-color: #fcfaff; border-top: 1px solid #f4eff9; padding: 24px; text-align: center;">
          <p style="margin: 0; font-size: 11px; font-weight: 700; text-transform: uppercase; tracking-wider: 0.1em; color: #756a7d;">
            © 2026 VibeCheck. All rights reserved.
          </p>
          <p style="margin: 6px 0 0 0; font-size: 10px; color: #a195ad;">
            You are receiving this because you signed up or signed into vibecheck.cafe
          </p>
        </div>
      </div>
    </div>
  `;
}

export async function sendWelcomeEmail(toEmail: string, role: string) {
  const isOwner = role === "OWNER";
  
  const content = isOwner ? `
    <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 900; color: #7441b5;">Welcome to the Merchant Network! 👋</h2>
    <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #564b60;">
      Thank you for listing your cafe on **VibeCheck**. We help coffee shops connect with local coffee lovers looking for the perfect workspace, brunch, or late-night vibe.
    </p>
    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #564b60;">
      Here is what you can do next with your Business Account:
    </p>
    <ul style="margin: 0 0 24px 0; padding-left: 20px; font-size: 13px; line-height: 1.8; color: #564b60;">
      <li><strong>Claim & Verify your Cafe Listing</strong> so public searchers can locate you.</li>
      <li><strong>Create Events & Flash Deals</strong> to drive foot traffic during slow weekday hours.</li>
      <li><strong>Validate Customer Rewards</strong> in your Cashier Checkout portal instantly using unique ticket claim codes.</li>
    </ul>
    <div style="text-align: center; margin: 32px 0 16px 0;">
      <a href="http://localhost:3001/dashboard" style="display: inline-block; background-color: #21152d; color: #ffffff; font-weight: 900; font-size: 13px; text-decoration: none; padding: 14px 28px; border-radius: 14px; box-shadow: 0 4px 12px rgba(33, 21, 45, 0.15);">
        Access My Owner Dashboard →
      </a>
    </div>
  ` : `
    <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 900; color: #7441b5;">Welcome to VibeCheck! 👋</h2>
    <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #564b60;">
      Hey there! Thank you for signing up to **VibeCheck**. We're excited to have you join our local reviewer community.
    </p>
    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #564b60;">
      VibeCheck isn't just about sharing reviews—we reward you with **VibePoints** for contributing honest experiences:
    </p>
    <ul style="margin: 0 0 24px 0; padding-left: 20px; font-size: 13px; line-height: 1.8; color: #564b60;">
      <li><strong>Earn 10 VibePoints</strong> for standard approved reviews.</li>
      <li><strong>Earn a massive 50 VibePoints</strong> when you scan and upload your receipt bill.</li>
      <li><strong>Redeem Point Balances</strong> for real, free cappuccino vouchers or menu discount perks at participating cafes.</li>
    </ul>
    <div style="text-align: center; margin: 32px 0 16px 0;">
      <a href="http://localhost:3001/rewards" style="display: inline-block; background-color: #c9ff4d; color: #21152d; font-weight: 900; font-size: 13px; text-decoration: none; padding: 14px 28px; border-radius: 14px; box-shadow: 0 4px 12px rgba(201, 255, 77, 0.2);">
        Visit the Rewards Store →
      </a>
    </div>
  `;

  const subject = isOwner ? "Welcome to VibeCheck Merchant Network! ☕" : "Welcome to VibeCheck! ☕";
  await sendEmail(toEmail, subject, getBaseTemplate(content));
}

export async function sendSignInAlert(toEmail: string, points: number, level: string) {
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 900; color: #7441b5;">New Sign-In Detected ☕</h2>
    <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #564b60;">
      This is to confirm a new login was successfully processed for your account: **${toEmail}**.
    </p>
    
    <div style="background-color: #f4eff9; border: 1px solid #e7dff0; border-radius: 20px; padding: 20px; margin: 24px 0; text-align: center;">
      <p style="margin: 0; font-size: 11px; font-weight: 800; color: #7441b5; text-transform: uppercase; tracking-wider: 0.15em;">
        Loyalty Balance Status
      </p>
      <p style="margin: 8px 0 2px 0; font-size: 32px; font-weight: 900; color: #21152d;">
        ${points} PTS
      </p>
      <span style="display: inline-block; background-color: #21152d; color: #ffffff; font-size: 9px; font-weight: 900; padding: 4px 10px; border-radius: 10px; text-transform: uppercase;">
        ${level} Tier Member
      </span>
    </div>

    <p style="margin: 0 0 24px 0; font-size: 13px; line-height: 1.6; color: #756a7d;">
      If this was you, you can safely disregard this email. Happy cafe hunting!
    </p>
  `;

  await sendEmail(toEmail, "New Sign-In Alert ☕", getBaseTemplate(content));
}

export async function sendVoucherBackupEmail(toEmail: string, cafeName: string, voucherTitle: string, claimCode: string) {
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 900; color: #7441b5;">Your Reward Voucher Ticket 🎫</h2>
    <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #564b60;">
      Awesome! You claimed **${voucherTitle}** at **${cafeName}** using your VibePoints.
    </p>
    
    <!-- Coupon Ticket Cutout -->
    <div style="background-color: #fcfaff; border: 2px dashed #e7dff0; border-radius: 20px; padding: 24px; margin: 28px 0; text-align: center; position: relative;">
      <p style="margin: 0; font-size: 10px; font-weight: 900; text-transform: uppercase; tracking-wider: 0.1em; color: #756a7d;">
        Customer Claim Code
      </p>
      <p style="margin: 10px 0; font-size: 28px; font-weight: 900; letter-spacing: 0.15em; color: #7441b5; background-color: #ffffff; padding: 12px; border: 1px solid #f4eff9; border-radius: 12px; display: inline-block;">
        ${claimCode}
      </p>
      <p style="margin: 0; font-size: 10px; font-weight: 700; color: #564b60;">
        Present this code to the cashier/owner to redeem.
      </p>
    </div>

    <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #564b60;">
      You can also view this voucher at any time under your profile page at **http://localhost:3001/profile/vouchers**.
    </p>
  `;

  await sendEmail(toEmail, `Claimed: ${voucherTitle} 🎫`, getBaseTemplate(content));
}

// Low-level sender supporting sandbox fallback
async function sendEmail(toEmail: string, subject: string, html: string) {
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: "VibeCheck Welcome <welcome@vibecheck.cafe>",
        to: toEmail,
        subject,
        html,
      });

      if (error) {
        // Fallback for Resend sandboxed accounts to onboarding@resend.dev
        console.warn("mailer.ts: Custom domain send failed, retrying with onboarding@resend.dev:", error);
        await resend.emails.send({
          from: "VibeCheck Onboarding <onboarding@resend.dev>",
          to: toEmail,
          subject,
          html,
        });
      }
      console.log(`mailer.ts: Email sent successfully to ${toEmail}`);
    } catch (err) {
      console.error(`mailer.ts: Failed to send email to ${toEmail} using Resend:`, err);
    }
  } else {
    // Beautiful dev console output formatting
    console.log("\n========================================================");
    console.log("📨 [MOCK EMAIL LOGGED TO STDOUT]");
    console.log(`TO      : ${toEmail}`);
    console.log(`SUBJECT : ${subject}`);
    console.log("--------------------------------------------------------");
    // Strip HTML tags roughly for quick clean console previewing
    const textPreview = html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    console.log(`BODY PREVIEW: ${textPreview.slice(0, 400)}...`);
    console.log("========================================================\n");
  }
}
