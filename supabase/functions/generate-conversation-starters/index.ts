import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { conversationId, userAId, userBId } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Return cached starters if they already exist
    const { data: existing } = await supabase
      .from("conversation_starters")
      .select("starters")
      .eq("conversation_id", conversationId)
      .maybeSingle();

    if (existing?.starters?.length) {
      return new Response(JSON.stringify({ starters: existing.starters }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch personality answers, profiles, interests for both users
    const [
      { data: answersA }, { data: answersB },
      { data: profileA }, { data: profileB },
      { data: interestsA }, { data: interestsB },
    ] = await Promise.all([
      supabase.from("personality_answers").select("*").eq("user_id", userAId).maybeSingle(),
      supabase.from("personality_answers").select("*").eq("user_id", userBId).maybeSingle(),
      supabase.from("profiles").select("first_name, age, location").eq("user_id", userAId).maybeSingle(),
      supabase.from("profiles").select("first_name, age, location").eq("user_id", userBId).maybeSingle(),
      supabase.from("interests").select("interest").eq("user_id", userAId),
      supabase.from("interests").select("interest").eq("user_id", userBId),
    ]);

    const buildProfile = (answers: any, profile: any, interests: any[]) => {
      const parts: string[] = [];
      if (profile?.first_name) parts.push(`Name: ${profile.first_name}`);
      if (profile?.age) parts.push(`Age: ${profile.age}`);
      if (profile?.location) parts.push(`Location: ${profile.location}`);
      if (answers?.life_goals) parts.push(`Life goal: ${answers.life_goals}`);
      if (answers?.social_battery) parts.push(`Social style: ${answers.social_battery}`);
      if (answers?.relationship_goal) parts.push(`Looking for: ${answers.relationship_goal}`);
      if (answers?.relationship_pace) parts.push(`Pace: ${answers.relationship_pace}`);
      if (answers?.love_language?.length) parts.push(`Love languages: ${answers.love_language.join(", ")}`);
      if (answers?.conflict_style) parts.push(`Conflict style: ${answers.conflict_style}`);
      if (answers?.humor_type) parts.push(`Humor: ${answers.humor_type}`);
      if (answers?.ideal_weekend) parts.push(`Ideal weekend: ${answers.ideal_weekend}`);
      if (answers?.work_ethic) parts.push(`Work ethic: ${answers.work_ethic}`);
      if (interests?.length) parts.push(`Interests: ${interests.map((i: any) => i.interest).join(", ")}`);
      return parts.length ? parts.join(". ") : "New user with no profile data yet.";
    };

    const personA = buildProfile(answersA, profileA, interestsA || []);
    const personB = buildProfile(answersB, profileB, interestsB || []);

    const apiKey = Deno.env.get("NVIDIA_API_KEY");
    if (!apiKey) throw new Error("NVIDIA_API_KEY secret not set in Supabase");

    // Call Kimi K2.5 via NVIDIA API (OpenAI-compatible)
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json",
      },
      body: JSON.stringify({
        model: "moonshotai/kimi-k2.5",
        temperature: 0.85,
        top_p: 1.0,
        max_tokens: 1024,
        stream: false,
        messages: [
          {
            role: "system",
            content: `You are a warm, witty assistant for VibeLink — a personality-first dating app where people connect through personality before photos.
Generate exactly 5 conversation starter suggestions for two matched users.
Rules:
- Be specific to their actual traits, interests, or intriguing differences — never generic
- Each starter must be 1-2 sentences max
- Tone: natural, warm, lightly playful — like a confident friend suggesting an opener
- Never start with "Hey", "Hi", "What's up", "How are you"
- Return ONLY a valid JSON array of exactly 5 strings, nothing else`,
          },
          {
            role: "user",
            content: `Two users just matched on VibeLink. Generate 5 conversation starters.

Person A: ${personA}

Person B: ${personB}

Return ONLY a JSON array: ["starter 1", "starter 2", "starter 3", "starter 4", "starter 5"]`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Kimi K2.5 API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() ?? "";

    // Parse JSON array — handle markdown code blocks too
    let starters: string[] = [];
    try {
      const match = content.match(/\[[\s\S]*?\]/);
      starters = match ? JSON.parse(match[0]) : [];
    } catch {
      starters = content
        .split("\n")
        .map((l: string) => l.replace(/^\d+\.\s*/, "").replace(/^["']|["']$/g, "").trim())
        .filter((l: string) => l.length > 15)
        .slice(0, 5);
    }

    if (!starters.length) {
      starters = [
        "What's something you've been genuinely excited about lately?",
        "If your ideal weekend had a movie title, what would it be?",
        "What's the most underrated thing about where you live?",
        "What's something you're low-key obsessed with right now?",
        "What does a really good day look like for you?",
      ];
    }

    // Cache starters in DB
    await supabase.from("conversation_starters").upsert(
      { conversation_id: conversationId, starters, created_at: new Date().toISOString() },
      { onConflict: "conversation_id" }
    );

    return new Response(JSON.stringify({ starters }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("generate-conversation-starters error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
