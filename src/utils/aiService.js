import { supabase } from '../configs/supabaseClient';

export const getPrimaryAIConfig = async () => {
    const { data, error } = await supabase
        .from('app_ai_configs')
        .select('*')
        .eq('is_primary', true)
        .single();

    if (error || !data) {
        console.error("No primary AI config found or error fetching:", error);
        return null;
    }
    return data;
};

export const generateAIResponse = async (messages, config = null) => {
    if (!config) {
        config = await getPrimaryAIConfig();
    }

    if (!config || !config.api_key) {
        throw new Error("AI Configuration missing or incomplete. Please set a primary AI provider in Settings.");
    }

    const { base_url, api_key, models } = config;
    const model = models || 'gpt-3.5-turbo'; // Fallback if no model selected

    try {
        const response = await fetch(`${base_url}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${api_key}`
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                max_tokens: 2000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(`AI API Error: ${response.status} ${errData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error("AI Generation Error:", error);
        throw error;
    }
};
