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

  // Check if MFA is required for this user
  const { data: listFactorData, error } = await supabase.auth.mfa.listFactors();

  if (error) {
    console.error("MFA check error:", error.message);
  }

  console.log('MFA factors:', listFactorData);

  if (listFactorData!.all?.length > 0) {
    console.log("✅ User has MFA factors enabled - redirecting to MFA challenge");
    // User has MFA enabled, redirect to MFA challenge page
    redirect("/mfa-challenge");
  } else {
    console.log("❌ No MFA enabled yet");
    // No MFA, proceed normally
    revalidatePath("/", "layout");
    redirect("/");
  }
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

export async function completeMFAEnrollment(formData: FormData) {
  const supabase = await createClient();
  
  try {
    const factorId = formData.get("factorId") as string;
    const code = formData.get("code") as string;
    
    if (!factorId || !code) {
      return { error: 'Factor ID and code are required' };
    }
    
    console.log('Completing MFA enrollment with:', { factorId, code });
    
    // Check factor status first
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const factor = factors?.all?.find(f => f.id === factorId);
    console.log('Factor status:', factor?.status, 'Type:', factor?.factor_type);
    
    // Challenge and verify the enrolled factor to complete setup
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: factorId
    });
    
    if (challengeError) {
      console.error('MFA challenge failed:', challengeError);
      return { error: challengeError.message };
    }
    
    const { data, error } = await supabase.auth.mfa.verify({
      factorId: factorId,
      challengeId: challengeData.id,
      code
    });
    
    if (error) {
      console.error('MFA enrollment verification failed:', error);
      return { error: error.message };
    }
    
    console.log('MFA enrollment completed successfully:', data);
    return { success: true, message: 'MFA enrollment completed successfully' };
    
  } catch (err) {
    console.error('MFA enrollment completion error:', err);
    return { error: 'Failed to complete MFA enrollment' };
  }
}

export async function verifyMFAWithChallenge(formData: FormData) {
  const supabase = await createClient();
  
  try {
    const code = formData.get("code") as string;
    
    if (!code) {
      return { error: 'Code is required' };
    }
    
    // Get the factor ID for challenge and verification
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const totpFactor = factors?.all?.find(factor => factor.factor_type === 'totp');
    
    if (!totpFactor) {
      return { error: 'No TOTP factor found' };
    }
    
    // Create challenge and verify in the same request to avoid IP mismatch
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: totpFactor.id
    });
    
    if (challengeError) {
      return { error: challengeError.message };
    }
    
    console.log('MFA challenge created:', challengeData);
    console.log('Attempting verification with:', {
      factorId: totpFactor.id,
      challengeId: challengeData.id,
      code: code
    });
    
    // Immediately verify with the challenge ID
    const { data, error } = await supabase.auth.mfa.verify({
      factorId: totpFactor.id,
      challengeId: challengeData.id,
      code
    });
    
    if (error) {
      console.error('MFA verification failed:', error);
      return { error: error.message };
    }
    
    console.log('MFA verification successful:', data);
    
    // MFA verification successful, redirect to main app
    revalidatePath("/", "layout");
  } catch (err) {
    console.error('MFA verification error:', err);
    return { error: 'Failed to verify MFA code' };
  }
}

export async function unenrollMFA() {
  const supabase = await createClient();
  
  try {
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const totpFactor = factors?.all?.find(factor => factor.factor_type === 'totp');
    
    if (!totpFactor) {
      return { error: 'No verified TOTP factor found' };
    }
    
    const { data, error } = await supabase.auth.mfa.unenroll({
      factorId: totpFactor.id
    });
    
    if (error) {
      return { error: error.message };
    }
    
    return { success: true, challengeId: data.id };
  } catch (err) {
    console.error('MFA challenge error:', err);
    return { error: 'Failed to unenroll MFA challenge' };
  }
}