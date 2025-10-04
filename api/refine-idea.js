const fetch = require('node-fetch');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { currentIdea } = req.body;
        
        if (!currentIdea) {
            return res.status(400).json({ error: 'Current idea is required' });
        }

        const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
        const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

        const prompt = `Refine and improve this startup idea by addressing potential weaknesses, exploring new angles, or pivoting to a better market opportunity.

Current idea: ${JSON.stringify(currentIdea, null, 2)}

Return ONLY a valid JSON object in this exact format with the refined idea:

{
  "name": "Refined company name (2-4 words)",
  "tagline": "Improved value proposition in one sentence",
  "pitch": "Enhanced 2-3 sentence explanation of the business concept and market opportunity",
  "vibe": "Business category (e.g., 'B2B SaaS', 'HealthTech', 'FinTech', 'EdTech', 'ClimateTech', 'Enterprise Software')",
  "problem": "More specific, measurable problem with better market sizing and statistics",
  "solution": "Improved solution with 2-3 core features that better differentiate from competitors",
  "targetAudience": "Refined customer segment with clearer demographics, pain points, and willingness to pay",
  "secretSauce": "Stronger competitive advantage with proprietary technology, network effects, or unique business model",
  "monetization": "Better revenue model with realistic pricing tiers and unit economics",
  "hurdle": "Addressed business risk with mitigation strategies",
  "firstStep": "More concrete 30-60 day action plan with specific metrics"
}

Requirements:
- Significantly improve upon the original idea
- Address any weaknesses or gaps in the original
- Consider market feedback and pivot opportunities
- Maintain professional, realistic business focus
- Avoid excessive emojis or casual language`;

        const response = await fetch(CLAUDE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-haiku-20241022',
                max_tokens: 1000,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`Claude API request failed: ${response.status}`);
        }

        const data = await response.json();
        const content = data.content[0].text;

        // Extract JSON from the response - try multiple approaches
        let idea;
        
        // First try: look for JSON object
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                idea = JSON.parse(jsonMatch[0]);
            } catch (e) {
                console.log('First JSON parse failed, trying alternative extraction');
            }
        }
        
        // Second try: look for JSON between code blocks
        if (!idea) {
            const codeBlockMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/);
            if (codeBlockMatch) {
                try {
                    idea = JSON.parse(codeBlockMatch[1]);
                } catch (e) {
                    console.log('Code block JSON parse failed');
                }
            }
        }
        
        // Third try: look for any JSON-like structure
        if (!idea) {
            const anyJsonMatch = content.match(/\{[\s\S]*?\}/g);
            if (anyJsonMatch) {
                for (const jsonStr of anyJsonMatch) {
                    try {
                        idea = JSON.parse(jsonStr);
                        if (idea && typeof idea === 'object' && idea.name) {
                            break; // Found valid idea object
                        }
                    } catch (e) {
                        continue;
                    }
                }
            }
        }
        
        if (!idea) {
            console.error('No valid JSON found in response:', content);
            throw new Error('No valid JSON found in Claude response');
        }
        
        res.json(idea);

    } catch (error) {
        console.error('Error refining idea:', error);
        res.status(500).json({ error: error.message });
    }
};
