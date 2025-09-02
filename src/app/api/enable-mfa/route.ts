import { createClient } from "@/app/utils/supabase";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError.message);
      return NextResponse.json(
        { error: "Session error", message: sessionError.message },
        { status: 401 }
      );
    }

    if (!session?.user) {
      console.error("User not authenticated - cannot enable MFA");
      return NextResponse.json(
        { error: "Not authenticated", message: "User must be logged in to enable MFA" },
        { status: 401 }
      );
    }

    console.log("User authenticated, enabling MFA for user:", session.user.id);

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "My Authenticator",
    });

    if (error) {
      console.error("MFA enrollment error:", error.message);
      return NextResponse.json(
        { error: "MFA enrollment failed", message: error.message },
        { status: 400 }
      );
    }

    if (data) {
      console.log("✅ MFA enrollment successful:", data);
      return NextResponse.json({
        success: true,
        factorId: data.id,
        qrCode: data.totp?.qr_code,
        secret: data.totp?.secret,
        uri: data.totp?.uri,
        message: "MFA enrollment successful - scan the QR code with your authenticator app"
      });
    }

    return NextResponse.json(
      { error: "Unknown error", message: "No data returned from MFA enrollment" },
      { status: 500 }
    );
    
  } catch (err) {
    console.error("Unexpected error during MFA enrollment:", err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: "Unexpected error", message: errorMessage },
      { status: 500 }
    );
  }
}