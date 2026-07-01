import { Resend } from "resend";
import { prisma } from "./prisma";

const resendKey = process.env.RESEND_API_KEY;
const resend = resendKey ? new Resend(resendKey) : null;

// Helper to standardise container styles with modern premium layout
function getBaseTemplate(contentHtml: string) {
  return `
    <div style="font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif; background-color: #fdfbf7; padding: 40px 20px; text-align: center; color: #1a0f23; margin: 0;">
      <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border: 1px solid #f1ece4; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(26, 15, 35, 0.05); text-align: left;">
        
        <!-- Header banner gradient -->
        <div style="background: linear-gradient(135deg, #7441b5 0%, #3e1b6d 50%, #1a0f23 100%); padding: 36px 32px; position: relative;">
          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; font-family: 'Outfit', sans-serif;">VibeCheck<span style="color: #c9ff4d;">.</span></h1>
          <p style="margin: 6px 0 0 0; color: rgba(255, 255, 255, 0.7); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Your passport to the best local cafe vibes</p>
        </div>
        
        <!-- Main body content -->
        <div style="padding: 40px 32px;">
          ${contentHtml}
        </div>
        
        <!-- Footer -->
        <div style="background-color: #faf8f5; border-top: 1px solid #f1ece4; padding: 28px 24px; text-align: center;">
          <p style="margin: 0; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: #756a7d;">
            © 2026 VibeCheck. All rights reserved.
          </p>
          <p style="margin: 8px 0 0 0; font-size: 10px; line-height: 1.5; color: #a195ad;">
            You are receiving this because you signed up or signed into <a href="https://vibecheck.cafe" style="color: #7441b5; text-decoration: none; font-weight: bold;">vibecheck.cafe</a>
          </p>
        </div>
      </div>
    </div>
  `;
}

export async function sendWelcomeEmail(toEmail: string, role: string, passedCafeName?: string) {
  const isOwner = role === "OWNER";
  let cafeName = passedCafeName;

  // If no cafe name was passed for a merchant, try to lookup their cafe name from DB
  if (isOwner && !cafeName) {
    try {
      const userWithCafe = await prisma.user.findUnique({
        where: { email: toEmail },
        include: { ownedCafes: true }
      });
      if (userWithCafe && userWithCafe.ownedCafes && userWithCafe.ownedCafes.length > 0) {
        cafeName = userWithCafe.ownedCafes[0].name;
      }
    } catch (e) {
      console.warn("mailer.ts: Failed to auto-fetch owned cafe for welcome email", e);
    }
  }
  
  const content = isOwner ? `
    <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 800; color: #1a0f23; font-family: 'Outfit', sans-serif; letter-spacing: -0.5px;">Welcome to the Merchant Network! 👋</h2>
    <div style="width: 40px; height: 4px; background: linear-gradient(90deg, #7441b5, #c9ff4d); border-radius: 2px; margin-bottom: 24px;"></div>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #564b60;">
      ${cafeName 
        ? `We are absolutely thrilled to welcome **${cafeName}** to the VibeCheck merchant community!` 
        : `Thank you for listing your cafe on **VibeCheck**.`
      } We help coffee shops connect with local coffee lovers looking for the perfect workspace, brunch, or late-night vibe.
    </p>

    <!-- Merchant Toolkit Preview Card -->
    <div style="background-color: #faf8f5; border: 1px solid #f1ece4; border-radius: 20px; padding: 24px; margin: 28px 0;">
      <h4 style="margin: 0 0 16px 0; font-size: 12px; font-weight: 800; color: #7441b5; text-transform: uppercase; letter-spacing: 0.1em; font-family: 'Outfit', sans-serif;">Your Merchant Toolkit 🛠️</h4>
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td valign="top" style="width: 24px; padding-bottom: 16px;"><span style="color: #7441b5; font-size: 16px; font-weight: bold;">✓</span></td>
          <td valign="top" style="padding-bottom: 16px; font-size: 13px; color: #564b60; line-height: 1.5; padding-left: 8px;">
            <strong>Claim & Verify your Cafe Listing</strong> so public searchers can locate you and view your amenities.
          </td>
        </tr>
        <tr>
          <td valign="top" style="width: 24px; padding-bottom: 16px;"><span style="color: #7441b5; font-size: 16px; font-weight: bold;">✓</span></td>
          <td valign="top" style="padding-bottom: 16px; font-size: 13px; color: #564b60; line-height: 1.5; padding-left: 8px;">
            <strong>Create Events & Flash Deals</strong> to drive foot traffic during slow weekday hours.
          </td>
        </tr>
        <tr>
          <td valign="top" style="width: 24px;"><span style="color: #7441b5; font-size: 16px; font-weight: bold;">✓</span></td>
          <td valign="top" style="font-size: 13px; color: #564b60; line-height: 1.5; padding-left: 8px;">
            <strong>Validate Customer Rewards</strong> in your Cashier Checkout portal instantly using unique ticket claim codes.
          </td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin: 36px 0 16px 0;">
      <a href="http://localhost:3001/dashboard" style="display: inline-block; background-color: #7441b5; color: #ffffff; font-weight: 800; font-size: 14px; text-decoration: none; padding: 16px 32px; border-radius: 16px; box-shadow: 0 8px 20px rgba(116, 65, 181, 0.2); letter-spacing: -0.1px; font-family: 'Outfit', sans-serif;">
        Access Owner Dashboard →
      </a>
    </div>
  ` : `
    <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 800; color: #1a0f23; font-family: 'Outfit', sans-serif; letter-spacing: -0.5px;">Welcome to the Club, Cafe Lover! ☕✨</h2>
    <div style="width: 40px; height: 4px; background: linear-gradient(90deg, #7441b5, #c9ff4d); border-radius: 2px; margin-bottom: 24px;"></div>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #564b60;">
      Hey there! Thank you for signing up to **VibeCheck**. We're excited to have you join our local reviewer community to discover and review the best cafes.
    </p>

    <!-- Gamified Membership Card -->
    <div style="background: linear-gradient(135deg, #2a1b40 0%, #150a21 100%); border-radius: 20px; padding: 24px; color: #ffffff; margin: 28px 0; border: 1px solid rgba(255,255,255,0.08); font-family: 'Outfit', sans-serif; box-shadow: 0 12px 30px rgba(26,15,35,0.15);">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="left">
            <p style="margin: 0; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #a195ad;">MEMBER PASSPORT</p>
            <h3 style="margin: 4px 0 0 0; font-size: 18px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Bronze Tier Explorer</h3>
          </td>
          <td align="right" valign="top">
            <span style="background-color: #c9ff4d; color: #1a0f23; font-size: 9px; font-weight: 800; padding: 4px 10px; border-radius: 30px; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block;">ACTIVE</span>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding-top: 36px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td align="left"><span style="font-size: 11px; color: #a195ad;">VibePoints Balance</span></td>
                <td align="right"><span style="font-size: 20px; font-weight: 900; color: #c9ff4d;">0 PTS</span></td>
              </tr>
            </table>
            <div style="width: 100%; height: 6px; background-color: rgba(255,255,255,0.15); border-radius: 3px; overflow: hidden; margin-top: 8px; margin-bottom: 6px;">
              <div style="width: 10%; height: 6px; background-color: #c9ff4d; border-radius: 3px;"></div>
            </div>
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td align="left"><span style="font-size: 9px; color: #756a7d;">0 PTS</span></td>
                <td align="right"><span style="font-size: 9px; color: #756a7d;">100 PTS FOR SILVER TIER</span></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>

    <!-- Quick Start Guide -->
    <h3 style="margin: 32px 0 16px 0; font-size: 16px; font-weight: 800; color: #1a0f23; font-family: 'Outfit', sans-serif;">Quick Start Guide 🚀</h3>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
      <tr>
        <td valign="top" style="width: 44px; padding-bottom: 20px;">
          <div style="width: 32px; height: 32px; line-height: 32px; border-radius: 50%; background-color: #f4eff9; color: #7441b5; font-weight: 800; font-size: 14px; text-align: center;">1</div>
        </td>
        <td valign="top" style="padding-bottom: 20px; padding-left: 8px;">
          <h4 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 700; color: #1a0f23;">Earn 10 VibePoints</h4>
          <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #564b60;">Share your honest experience at local cafes with detailed vibe reviews.</p>
        </td>
      </tr>
      <tr>
        <td valign="top" style="width: 44px; padding-bottom: 20px;">
          <div style="width: 32px; height: 32px; line-height: 32px; border-radius: 50%; background-color: #f4eff9; color: #7441b5; font-weight: 800; font-size: 14px; text-align: center;">2</div>
        </td>
        <td valign="top" style="padding-bottom: 20px; padding-left: 8px;">
          <h4 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 700; color: #1a0f23;">Boost to 50 VibePoints</h4>
          <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #564b60;">Scan and upload your receipt bill to get your review verified instantly.</p>
        </td>
      </tr>
      <tr>
        <td valign="top" style="width: 44px; padding-bottom: 20px;">
          <div style="width: 32px; height: 32px; line-height: 32px; border-radius: 50%; background-color: #f4eff9; color: #7441b5; font-weight: 800; font-size: 14px; text-align: center;">3</div>
        </td>
        <td valign="top" style="padding-bottom: 20px; padding-left: 8px;">
          <h4 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 700; color: #1a0f23;">Redeem Free Coffee & Perks</h4>
          <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #564b60;">Redeem your points for free cappuccinos, discounts, and exclusive rewards.</p>
        </td>
      </tr>
    </table>

    <div style="text-align: center; margin: 36px 0 16px 0;">
      <a href="http://localhost:3001/rewards" style="display: inline-block; background-color: #c9ff4d; color: #1a0f23; font-weight: 800; font-size: 14px; text-decoration: none; padding: 16px 32px; border-radius: 16px; box-shadow: 0 8px 20px rgba(201, 255, 77, 0.25); letter-spacing: -0.1px; font-family: 'Outfit', sans-serif;">
        Explore Rewards Store →
      </a>
    </div>
  `;

  const subject = isOwner ? "Welcome to VibeCheck Merchant Network! ☕" : "Welcome to VibeCheck! ☕";
  await sendEmail(toEmail, subject, getBaseTemplate(content));
}

export async function sendSignInAlert(toEmail: string, points: number, level: string) {
  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 800; color: #1a0f23; font-family: 'Outfit', sans-serif; letter-spacing: -0.5px;">New Sign-In Detected ☕</h2>
    <div style="width: 40px; height: 4px; background: linear-gradient(90deg, #7441b5, #c9ff4d); border-radius: 2px; margin-bottom: 24px;"></div>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #564b60;">
      This is to confirm a new login was successfully processed for your account: <strong>${toEmail}</strong>.
    </p>
    
    <!-- Loyalty Status Card -->
    <div style="background-color: #faf8f5; border: 1px solid #f1ece4; border-radius: 20px; padding: 24px; margin: 28px 0; text-align: center; box-shadow: inset 0 2px 4px rgba(0,0,0,0.01);">
      <p style="margin: 0; font-size: 10px; font-weight: 800; color: #7441b5; text-transform: uppercase; letter-spacing: 0.15em;">Loyalty Balance Status</p>
      <p style="margin: 12px 0 6px 0; font-size: 36px; font-weight: 900; color: #1a0f23; font-family: 'Outfit', sans-serif; letter-spacing: -1px;">${points} PTS</p>
      <span style="display: inline-block; background-color: #1a0f23; color: #ffffff; font-size: 9px; font-weight: 800; padding: 6px 14px; border-radius: 30px; text-transform: uppercase; letter-spacing: 0.05em;">
        ${level} Tier Member
      </span>
    </div>

    <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #756a7d; text-align: center;">
      If this was you, you can safely disregard this email. Happy cafe hunting!
    </p>
  `;

  await sendEmail(toEmail, "New Sign-In Alert ☕", getBaseTemplate(content));
}

export async function sendVoucherBackupEmail(toEmail: string, cafeName: string, voucherTitle: string, claimCode: string) {
  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 800; color: #1a0f23; font-family: 'Outfit', sans-serif; letter-spacing: -0.5px;">Your Reward Voucher Ticket 🎫</h2>
    <div style="width: 40px; height: 4px; background: linear-gradient(90deg, #7441b5, #c9ff4d); border-radius: 2px; margin-bottom: 24px;"></div>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #564b60;">
      Awesome! You claimed <strong>${voucherTitle}</strong> at <strong>${cafeName}</strong> using your VibePoints.
    </p>
    
    <!-- Coupon Ticket Cutout -->
    <div style="background-color: #faf8f5; border: 2px dashed #7441b5; border-radius: 20px; padding: 28px; margin: 28px 0; text-align: center; position: relative;">
      <p style="margin: 0; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #756a7d; font-family: 'Outfit', sans-serif;">Customer Claim Code</p>
      <p style="margin: 14px 0; font-size: 30px; font-weight: 900; letter-spacing: 0.15em; color: #7441b5; background-color: #ffffff; padding: 14px 24px; border: 1px solid #f1ece4; border-radius: 12px; display: inline-block; font-family: monospace;">
        ${claimCode}
      </p>
      <p style="margin: 0; font-size: 11px; font-weight: 700; color: #564b60;">Present this code to the cashier or owner to redeem.</p>
    </div>

    <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #564b60;">
      You can also view this voucher at any time under your profile page at <a href="http://localhost:3001/profile/vouchers" style="color: #7441b5; text-decoration: none; font-weight: bold;">vibecheck.cafe/profile/vouchers</a>.
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
