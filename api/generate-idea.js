const fetch = require('node-fetch');

module.exports = async (req, res) => {
    console.log('API called:', req.method, req.url);
    
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
        console.log('Method not allowed:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('Environment check:', process.env.CLAUDE_API_KEY ? 'API key found' : 'No API key');
        const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
        const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
        console.log('Making request to Claude API...');

        const prompt = `Generate a professional startup idea that could realistically be built and funded. Focus on solving real problems with innovative technology or business models.

Return ONLY a valid JSON object in this exact format:

{
  "name": "Professional company name (2-4 words)",
  "tagline": "Clear value proposition in one sentence",
  "pitch": "Concise 2-3 sentence explanation of the business concept and market opportunity",
  "vibe": "Business category (e.g., 'B2B SaaS', 'HealthTech', 'FinTech', 'EdTech', 'ClimateTech', 'Enterprise Software')",
  "problem": "Specific, measurable problem that affects a large market. Include statistics or market size if relevant.",
  "solution": "Clear explanation of how the product/service solves the problem. List 2-3 core features that differentiate from competitors.",
  "targetAudience": "Specific customer segment with clear demographics, pain points, and willingness to pay. Include market size estimates.",
  "secretSauce": "Competitive advantage: proprietary technology, network effects, data moats, or unique business model that creates defensibility.",
  "monetization": "Specific revenue model with pricing tiers, customer acquisition costs, and unit economics. Include projected ARR or revenue targets.",
  "hurdle": "Most significant business risk: regulatory challenges, technical complexity, market adoption, or competitive threats.",
  "firstStep": "Concrete 30-60 day action plan to validate the idea: customer interviews, MVP development, or pilot program with specific metrics."
}

Requirements:
- Focus on scalable, technology-enabled businesses
- Avoid consumer social apps or simple marketplace ideas
- Include realistic market sizing and business metrics
- Emphasize defensible competitive advantages
- Consider regulatory and technical feasibility
- Target B2B or B2B2C models when possible
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

        // Extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in Claude response');
        }

        try {
            const idea = JSON.parse(jsonMatch[0]);
            res.json(idea);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Raw content:', content);
            throw new Error('Invalid JSON format in Claude response');
        }

    } catch (error) {
        console.error('Error generating idea:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            error: error.message,
            details: 'Check server logs for more information'
        });
    }
};
