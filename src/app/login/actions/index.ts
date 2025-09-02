"use server";

import { createClient } from "@/app/utils/supabase";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function login(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const res = await supabase.auth.signInWithPassword(data);

  console.log("login res", res);

  if (res.error) {
    redirect("/error");
  }

  const { data: listFactorData, error } = await supabase.auth.mfa.listFactors();

  if (error) {
    console.error("MFA check error:", error.message);
  }

  console.log('MFA factors:', listFactorData);

  if (listFactorData!.all?.length > 0) {
    console.log("✅ User has MFA factors enabled:", listFactorData?.all);
  } else {
    console.log("❌ No MFA enabled yet");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function enableMFA() {
  const supabase = await createClient();
  
    try {
      const supabase = await createClient();
      
      // Check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError.message);
        return;
      }
  
      if (!session?.user) {
        console.error("User not authenticated - cannot enable MFA");
        return;
      }
  
      console.log("User authenticated, enabling MFA for user:", session.user.id);
  
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "My Authenticator",
      });
  
      if (error) {
        console.error("MFA enrollment error:", error.message);
        return;
      }
  
      if (data) {
        console.log("✅ MFA enrollment successful:", data);
        return ({
          success: true,
          factorId: data.id,
          qrCode: data.totp?.qr_code,
          secret: data.totp?.secret,
          uri: data.totp?.uri,
          message: "MFA enrollment successful - scan the QR code with your authenticator app"
        });
      }
  
      console.log('Error while enrolling');
      return;
      
    } catch (err) {
      console.error("Unexpected error during MFA enrollment:", err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.log('Error Message:', errorMessage)
      return;
    }
}
