import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, name, class: className, id } = await req.json();

    const dateToday = new Date().toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });

    const logoUrl = `${process.env.NEXT_PUBLIC_APP_URL}/images/logo/PHS%20logo.webp`;

    const emailHtml = `
      <div style="font-family: 'Helvetica', 'Arial', sans-serif; max-width: 700px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #fff; color: #333;">
        <div style="padding: 40px; border-bottom: 4px solid #7f1d1d;">
          <table width="100%">
            <tr>
              <td width="70">
                <img src="${logoUrl}" alt="Logo" width="60" height="60" style="display: block; margin-right: 15px;">
              </td>
              <td>
                <h1 style="color: #7f1d1d; margin: 0; font-size: 24px; text-transform: uppercase;">Possible Height Schools</h1>
                <p style="margin: 0; font-size: 10px; letter-spacing: 2px; color: #666;">EXCELLENCE IN LEARNING & CHARACTER</p>
              </td>
              <td style="text-align: right; color: #64748b; font-size: 12px;">
                Administrative Office<br/>
                Abuja, Nigeria<br/>
                ${dateToday}
              </td>
            </tr>
          </table>
        </div>

        <div style="padding: 40px;">
          <h2 style="text-align: center; color: #7f1d1d; text-decoration: underline; font-size: 18px; margin-bottom: 30px;">
            OFFER OF PROVISIONAL ADMISSION
          </h2>

          <p>Dear <strong>${name}</strong>,</p>
          <p>We are delighted to offer you provisional admission into <strong>${className}</strong> at Possible Height Schools for the 2026/2027 academic session.</p>

          <div style="text-align: center; margin: 35px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admission-letter/${id}"
               style="background-color: #7f1d1d; color: #ffffff; padding: 18px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
               VIEW & PRINT ADMISSION LETTER
            </a>
          </div>

          <div style="margin: 30px 0; padding: 20px; background-color: #fef2f2; border-radius: 8px; border: 1px solid #fee2e2;">
            <p style="margin-top: 0; font-weight: bold; color: #7f1d1d;">Registration Requirements:</p>
            <ul style="margin-bottom: 0; font-size: 14px;">
              <li>Accept this offer by paying the commitment fee via your portal.</li>
              <li>Download the prospectus and fee schedule from your dashboard.</li>
              <li>Submit two passport photographs and a birth certificate copy upon resumption.</li>
            </ul>
          </div>

          <p>Yours faithfully,</p>
          <div style="margin: 15px 0;">
             <p style="font-family: 'cursive', 'Georgia'; font-size: 20px; color: #7f1d1d; margin: 0;">Proprietress Signature</p>
          </div>
          <p style="margin: 0; font-weight: bold;">Proprietress</p>
          <p style="margin: 0; font-size: 12px; color: #64748b;">Possible Height Schools</p>
        </div>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: 'Possible Height Schools <onboarding@resend.dev>',
      to: [email],
      subject: `Admission Offer: ${name} - Possible Height Schools`,
      html: emailHtml,
    });

    if (error) return NextResponse.json({ error }, { status: 500 });
    return NextResponse.json({ message: 'Success' }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}