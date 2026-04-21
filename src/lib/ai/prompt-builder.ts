import { UserProfile } from '@/lib/storage';
import { getDailyContext } from './calendar-context';

export interface PromptContext {
    profile: UserProfile;
    currentFocus: string;
    mood?: string;
    history?: {
        recentPrayers: any[];
        recentJournal: any[];
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

function getMetaphors(profile: UserProfile): string {
    const ideologies = profile.ideologies || [];
    if (ideologies.includes('rational')) return METAPHOR_BANKS.tech.join(", ");
    if (ideologies.includes('nature')) return METAPHOR_BANKS.nature.join(", ");
    return METAPHOR_BANKS.general.join(", ");
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
    const metaphors = getMetaphors(profile);
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

    **DEEP USER CONTEXT:**
    - **Core Values**: ${profile.core_values?.join(', ') || 'Balance'}
    - **Current State**: Feeling "${profile.current_state}" in life.
    - **Emotional Focus**: Needs attention on "${profile.emotional_state_focus}".
    - **Intention**: "${profile.current_intention || 'Growth'}"
    
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

    **Constraints:**
    - **Gender Grammar**: YOU MUST WRITE IN STRICT ${profile.gender === 'male' ? 'MASCULINE (לשון זכר)' : 'FEMININE (לשון נקבה)'} GRAMMAR.
    - **Banned Words**: Do NOT use these terms: ${bannedWords.join(", ")}.
    - **Structure**: Split into 4-5 short, punchy paragraphs.
    - **Tone**: ${profile.tone} (e.g., if "Stoic": be direct, firm. If "Soft": be gentle, flowing).
    
    **Output Goal:**
    Create a text that feels like it emerged from the user's own highest self. It should acknowledge the current time (morning/evening), the weekly energy, and the user's specific focus.
    `;
}

export interface PromptContext {
    profile: UserProfile;
    currentFocus: string;
    mood?: string;
    history?: {
        recentPrayers: any[];
        recentJournal: any[];
    };
}

// ... (ADDRESSING_MODES, etc. remain the same) ...

export function buildUserPrompt(context: PromptContext): string {
    const { profile, currentFocus, mood, history } = context;
    const challenges = profile.current_challenges || [];

    // Format History for Context
    let historyContext = "";
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
    }

    return `
    **Current Status:**
    - **Focus**: "${currentFocus}"
    - **Mood**: ${mood || "Neutral/Open"}
    - **Life Challenge**: ${challenges[0] || "General balance"}
    
    ${historyContext}

    **Drafting Instructions:**
    1. **Grounding**: Start by acknowledging the *now* (morning light, current feeling).
    2. **Continuity**: If there is a recurring theme in the history (e.g., same shadow or success), acknowledge progress or persistence.
    3. **Connection**: Weave in the "Weekly Energy" (${getDailyContext().weeklyEnergy.name}) subtly.
    4. **Reframing**: Take the current challenge and reframe it using the "Positive" rule.
    5. **Evidence-Based Power (CBT Focus)**: 
       - **Internal Proof**: Use a STRENGTH ("Yesh Bi"). Phrasing: "זכור את ה[חוזקה] שקיימת בך באופן מובנה" ([Strength] is inherent in you).
       - **External Proof**: Use a SUCCESS ("Hitzlachti"). Phrasing: "כשם שהצלחת ב[הצלחה], המציאות מוכיחה שאתה מסוגל ל..." (Just as you succeeded in [Success], reality proves you can...).
    6. **Declaration**: End with a strong statement of intent for the day.
    
    **Output:**
    Return ONLY the Hebrew text. No explanations.
    `;
}
