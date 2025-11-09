import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId } = await req.json();
    
    console.log("Calculating compatibility for user:", userId);

    // Get current user's profile
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    console.log("User profile:", userProfile, "Error:", profileError);

    if (!userProfile) {
      console.error("Profile not found for user:", userId);
      return new Response(
        JSON.stringify({ error: "User profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's match preferences
    const { data: userPreferences } = await supabase
      .from("match_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // Get user's interests
    const { data: userInterestsData } = await supabase
      .from("interests")
      .select("*")
      .eq("user_id", userId);

    const userInterests = userInterestsData?.map((i: any) => i.interest) || [];
    
    console.log("User interests:", userInterests);
    console.log("User preferences:", userPreferences);

    // Get all potential matches
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from("profiles")
      .select("*")
      .neq("user_id", userId);

    console.log("Found potential profiles:", allProfiles?.length);

    if (allProfilesError) {
      console.error("Error fetching profiles:", allProfilesError);
    }

    if (!allProfiles || allProfiles.length === 0) {
      console.log("No other profiles found");
      return new Response(
        JSON.stringify({ matches: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate compatibility scores
    const matchesPromises = allProfiles.map(async (profile: any) => {
      // Get interests for this profile
      const { data: profileInterestsData } = await supabase
        .from("interests")
        .select("*")
        .eq("user_id", profile.user_id);

      const profileInterests = profileInterestsData?.map((i: any) => i.interest) || [];

      let score = 0;

      // Interest matching (40% weight)
      const commonInterests = userInterests.filter((interest: string) =>
        profileInterests.includes(interest)
      );
      const interestScore = (commonInterests.length / Math.max(userInterests.length, 1)) * 40;
      score += interestScore;

      // Age preference matching (30% weight)
      if (userPreferences) {
        const ageInRange =
          profile.age >= userPreferences.min_age &&
          profile.age <= userPreferences.max_age;
        if (ageInRange) score += 30;
      }

      // Gender preference matching (20% weight)
      if (userPreferences?.preferred_gender) {
        if (
          userPreferences.preferred_gender === "all" ||
          profile.gender === userPreferences.preferred_gender
        ) {
          score += 20;
        }
      } else {
        score += 20; // No preference = match
      }

      // Profile completeness bonus (10% weight)
      const completeness =
        (profile.bio ? 3 : 0) +
        (profile.profile_photo_url ? 3 : 0) +
        (profile.location ? 2 : 0) +
        (profileInterests.length > 0 ? 2 : 0);
      score += completeness;

      return {
        user_id: userId,
        matched_user_id: profile.user_id,
        compatibility_score: Math.round(score),
        profile: {
          id: profile.id,
          first_name: profile.first_name,
          age: profile.age,
          bio: profile.bio,
          tagline: profile.tagline,
          profile_photo_url: profile.profile_photo_url,
          location: profile.location,
          interests: profileInterests,
        },
      };
    });

    const matches = await Promise.all(matchesPromises);
    console.log("Calculated matches:", matches.length);

    // Sort by compatibility score
    matches.sort((a, b) => b.compatibility_score - a.compatibility_score);

    // Store top matches in database
    const topMatches = matches.slice(0, 20);
    
    console.log("Storing top matches:", topMatches.length);

    for (const match of topMatches) {
      const { error: upsertError } = await supabase
        .from("matches")
        .upsert(
          {
            user_id: match.user_id,
            matched_user_id: match.matched_user_id,
            compatibility_score: match.compatibility_score,
          },
          { onConflict: "user_id,matched_user_id" }
        );

      if (upsertError) {
        console.error("Error upserting match:", upsertError);
      }
    }

    console.log("Successfully calculated compatibility");

    return new Response(
      JSON.stringify({ matches: topMatches }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error calculating compatibility:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Failed to calculate compatibility" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
