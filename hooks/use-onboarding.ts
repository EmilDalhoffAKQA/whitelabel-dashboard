import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useOnboarding(userEmail: string) {
  const [isOnboarded, setIsOnboarded] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) {
      setLoading(false);
      return;
    }
    checkOnboardingStatus();
  }, [userEmail]);

  const checkOnboardingStatus = async () => {
    try {
      const { data: user } = await supabase
        .from("users")
        .select("is_onboarded")
        .eq("email", userEmail)
        .single();

      setIsOnboarded(user?.is_onboarded ?? true);
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setIsOnboarded(true);
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    if (!userEmail) return;

    try {
      const { error } = await supabase
        .from("users")
        .update({ is_onboarded: true })
        .eq("email", userEmail);

      if (!error) {
        setIsOnboarded(true);
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  return {
    isOnboarded,
    loading,
    completeOnboarding,
  };
}
