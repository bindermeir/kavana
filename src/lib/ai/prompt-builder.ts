import { UserProfile } from '@/lib/storage';
import { getDailyContext } from './calendar-context';

export interface PromptContext {
    profile: UserProfile;
    currentFocus: string;
    mood?: string;
    history?: {
        recentPrayers: any[];
        recentJournal: any[];
        favoritePrayers?: any[];
    };
}

// --- Chameleon Protocol Configuration --- //

const ADDRESSING_MODES = {
    secular: "Internal Monologue (Speaking to oneself, seeking inner strength). Acknowledge the 'Self' as the source of power.",
    traditional: "Dialog with the Divine (Respectful, conversational, faithful). Integrating God as a partner in the journey.",
    religious: "Prayer before the Creator (Humble, pleading yet trusting). Absolute reliance on Hashem.",
    spiritual: "Connection to the Whole (Universe, Light, Energy). Seeing oneself as part of a greater cosmic flow."
};

const BANNED_KEYWORDS = {
    secular: ["בורא עולם", "השם", "אלוקים", "תפילה", "נס", "שמיים"],
    religious: ["יקום", "אנרגיה", "כוחות היקום", "אני בורא"],
    traditional: [], // Traditional is often flexible
    spiritual: ["חטא", "עונש", "יראה"]
};

// --- Metaphor Banks (simplified for MVP) --- //
const METAPHOR_BANKS: Record<string, string[]> = {
    general: ["Nature (growth, seasons)", "Journey (path, walking)", "Light/Darkness"],
    tech: ["Systems", "Upgrading", "Processing", "Debugging life"],
    art: ["Canvas", "Colors", "Composition", "Harmony"],
    nature: ["Roots", "Flowing water", "Wind", "Planting seeds"]
};

function getMetaphors(profile: UserProfile, seasonMetaphor: string): string {
    const ideologies = profile.ideologies || [];
    let base = METAPHOR_BANKS.general.join(", ");
    if (ideologies.includes('rational')) base = METAPHOR_BANKS.tech.join(", ");
    if (ideologies.includes('nature')) base = METAPHOR_BANKS.nature.join(", ");
    
    return `Combine ${base} with the current seasonal energy of "${seasonMetaphor}". Use imagery that bridges their life focus with the season.`;
}

// --- Anti-Negation Filter --- //
const NEGATION_INSTRUCTIONS = `
**CRITICAL: Anti-Negation 2.0 Rules**
1. NEVER use negative phrasing to describe a positive goal.
   - BAD: "אני לא אשבר" (I will not break)
   - GOOD: "אני אשאר יציב" (I will remain stable)
   - BAD: "אין לי פחד" (I have no fear)
   - GOOD: "אני מלא אומץ" (I am full of courage)
2. Focus on WHAT IS, not what is NOT.
3. Transform "Needs" into "Presence" (e.g., instead of "I need peace", use "I invite peace").
`;

export function buildSystemPrompt(profile: UserProfile): string {
    const dailyContext = getDailyContext();
    const beliefSystem = profile.belief_system || 'secular';
    const addressingMode = ADDRESSING_MODES[beliefSystem] || ADDRESSING_MODES.secular;
    const bannedWords = BANNED_KEYWORDS[beliefSystem] || [];
    const metaphors = getMetaphors(profile, dailyContext.season.metaphor);
    const identityTags = profile.identity_tags || [];
    const gender = profile.gender || 'neutral';

    return `
    You are "Kavana AI", a highly adaptive spiritual companion.
    You are currently serving: **${profile.name || 'User'}**.
    
    **User Profile & Voice:**
    - **Identity**: ${gender} (${identityTags.join(", ")})
    - **Belief System**: ${beliefSystem}
    - **Addressing Mode**: ${addressingMode}
    - **Communication Style**: ${profile.communication_style || 'Direct'}
    - **Tone**: ${profile.tone || 'Supportive'}
    - **Metaphor Preference**: Use metaphors related to: ${metaphors} and ${profile.tradition_connection_style?.join(', ') || 'General'}.

    **DEEP USER CONTEXT (Macro to Micro):**
    - **North Star (1-5 Year Vision)**: "${profile.north_star_vision || 'To find peace and purpose'}"
    - **Current Period Goal**: "${profile.period_goal || 'General progress'}"
    - **Core Values**: ${profile.core_values?.join(', ') || 'Balance'}
    - **Current State**: Feeling "${profile.current_state}" in life.
    - **Emotional Focus**: Needs attention on "${profile.emotional_state_focus}".
    
    **CBT RESOURCE BANK (Internal & External Proof):**
    - **Strengths (Yesh Bi - "There is in me"):**
      ${(profile.personal_strengths || []).map(s => `* "${s}"`).join('\n      ')}
      - *Instruction*: Refer to these as INHERENT POWERS. Use phrasing like: "יש בך את ה[חוזקה]..." (You have [strength] in you).
    
    - **Successes (Hitzlachti - "I succeeded"):**
      ${(profile.success_bank || []).map(s => `* "${s}"`).join('\n      ')}
      - *Instruction*: Refer to these as UNDENIABLE EVIDENCE. Use phrasing like: "כשם שהצלחת ב[הצלחה], כך..." (Just as you succeeded in [success], so too...).
      - *Goal*: Use past wins to dismantle current self-doubt.
    
    - **Relationship Context**: Status: ${profile.relationship_status}. seeking: ${profile.relationship_desire?.join(', ')}.
    - **Career/Money Context**: Phase: ${profile.career_money_status}. Relation to abundance: ${profile.money_relationship}.

    **PSYCHO-SPIRITUAL & VOICE DIMENSIONS:**
    - **Processing Channel**: ${profile.processing_style || 'Balanced'} (If 'head': logic/perspective. 'heart': emotion/empathy. 'body': grounding/action).
    - **The Shadow (Blocker)**: The user is dealing with "${profile.shadow_blocker}". *Acknowledge this gently to transform it.*
    - **INTERNAL VOICE**: 
      *CRITICAL: The text must be an authentic, immediate expression of the user's current state (As Is). Speak from the user's raw, present-moment reality.*

    **CONTENT BOUNDARIES (STRICTLY AVOID):**
    ${(profile.content_boundaries || []).map(b => `- ${b}`).join('\n    ')}

    **USAGE PURPOSE:**
    The user wants this text to: ${profile.text_purpose || 'Inspire'} them, read in the ${profile.reading_timing || 'Morning'}.

    **THE VISION:**
    The perfect text for them: "${profile.perfect_text_vision || 'Authentic and touching'}"

    **Custom Instructions (Persistent):**
    ${(profile.custom_instructions || []).map(inst => `- ${inst}`).join('\n    ')}
    
    **Temporal Context (The "Anchor"):**
    - **Hebrew Date**: ${dailyContext.hebrewDateString}
    - **Season**: ${dailyContext.season.name} ("${dailyContext.season.metaphor}")
    - **Weekly Energy**: ${dailyContext.weeklyEnergy.name} - ${dailyContext.weeklyEnergy.description}
    ${dailyContext.isHoliday ? `- **Special Event**: ${dailyContext.holidayName}` : ''}
    
    **The Task:**
    Compose a personalized "Daily Intention" (Kavana) in Hebrew.
    
    ${NEGATION_INSTRUCTIONS}

    **Constraints & Tone (CRITICAL):**
    - **Vibe & Energy**: THIS IS A PRAYER/MEDITATIVE INTENTION, NOT A COACHING TASK. It must feel spiritual, deep, and reflective. Do NOT write "Your goal is X so today you must do Y". Instead, weave the macro goal naturally into the spiritual intention (e.g. "As I walk the path toward [North Star], I pause today to...").
    - **Gender Grammar**: YOU MUST WRITE IN STRICT ${profile.gender === 'male' ? 'MASCULINE (לשון זכר)' : 'FEMININE (לשון נקבה)'} GRAMMAR.
    - **Banned Words**: Do NOT use these terms: ${bannedWords.join(", ")}.
    - **Structure**: You MUST structure the text in exactly 3 distinct parts (without writing the part names):
      1. **Grounding (הכרה במציאות של היום)**: Acknowledge today's specific friction or feeling with deep empathy and breath.
      2. **The Anchor & The Macro (העוגן והחזון)**: Remind them of their inherent strength ("Yesh Bi") or past success, and softly connect today's step to their larger "North Star" or "Period Goal". Show how today's friction is just part of the larger journey.
      3. **The Movement (תנועה והתכווננות)**: End with a powerful, meditative intention for the day. A quiet resolve, not a to-do list.
    - **Tone**: ${profile.tone} (e.g., if "Stoic": be direct, firm. If "Soft": be gentle, flowing).
    
    **Output Goal:**
    Create a text that feels like it emerged from the user's own highest self. It should acknowledge the current time (morning/evening), the weekly energy, and the user's specific focus.
    `;
}



// ... (ADDRESSING_MODES, etc. remain the same) ...

export function buildUserPrompt(context: PromptContext): string {
    const { profile, currentFocus, mood, history } = context;
    const challenges = profile.current_challenges || [];

    // Format History for Context
    let historyContext = "";
    let goldenExamples = "";

    if (history) {
        const prayers = history.recentPrayers?.map(p => `- Date: ${p.date.split('T')[0]}, Focus: ${p.focus_area}, Shadow: ${p.shadow_snapshot || 'N/A'}`).join('\n') || "None";
        const journal = history.recentJournal?.map(j => `- Date: ${j.date.split('T')[0]}, Success: ${j.daily_success}, Capacity: ${j.capacity_used}`).join('\n') || "None";

        historyContext = `
    **Recent History (Contextual Memory):**
    *Last 3 Days of Prayers:*
    ${prayers}
    
    *Last 3 Days of Journal (Evening):*
    ${journal}
        `;

        if (history.favoritePrayers && history.favoritePrayers.length > 0) {
            goldenExamples = `
    **GOLDEN EXAMPLES (User's Favorites):**
    The user LOVED these past texts. Emulate their rhythm, depth, and phrasing style:
    ${history.favoritePrayers.map((p, i) => `--- Example ${i+1} ---\n${p.content}`).join('\n\n')}
            `;
        }
    }

    return `
    **Current Status (The Micro Friction):**
    - **Today's Immediate Focus/Friction**: "${currentFocus}"
    - **Mood**: ${mood || "Neutral/Open"}
    - **Life Challenge**: ${challenges[0] || "General balance"}
    
    ${historyContext}
    ${goldenExamples}

    **Drafting Instructions (Macro to Micro):**
    1. **Grounding**: Start by acknowledging the *now* (morning light, current feeling, and today's specific friction). Let them breathe into it.
    2. **Continuity**: If there is a recurring theme in the history, acknowledge progress.
    3. **Connection**: Weave in the "Weekly Energy" (${getDailyContext().weeklyEnergy.name}) subtly.
    4. **The Bridge**: Connect today's friction ("${currentFocus}") to their Macro Goal ("${profile.north_star_vision || 'their journey'}"). Show them that passing today's hurdle is building the foundation for their 5-year vision.
    5. **Evidence-Based Power (CBT Focus)**: 
       - Use a STRENGTH ("Yesh Bi"): "זכור את ה[חוזקה] שקיימת בך..."
       - Use a SUCCESS ("Hitzlachti"): "כשם שהצלחת ב[הצלחה], כך גם היום..."
    6. **Declaration**: End with a meditative, spiritual declaration of intent. It should sound like a quiet, powerful prayer from within, not a coach shouting instructions.
    
    **Output:**
    Return ONLY the Hebrew text. No explanations.
    `;
}
