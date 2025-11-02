const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { google } = require('googleapis');
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Initialize Gemini AI
const geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize YouTube Data API v3
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

/**
 * Get AI-recommended Indian dishes based on available ingredients and calorie target
 */
router.post('/recommendations', verifyToken, async (req, res) => {
  const { ingredients, calorie_limit } = req.body;
  
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: 'Ingredients array is required' });
  }
  
  if (!calorie_limit || calorie_limit <= 0) {
    return res.status(400).json({ error: 'Valid calorie_limit is required' });
  }
  
  try {
    // Create dynamic prompt for Gemini
    const prompt = `You are a nutrition expert specializing in Indian cuisine. Based on the following available ingredients: ${ingredients.join(', ')}, recommend 5 healthy Indian dishes that:
1. Can be made using these ingredients (and common Indian pantry staples)
2. Are balanced and nutritious
3. Together should add up to approximately ${calorie_limit} calories for a complete meal
4. Include traditional Indian cooking methods and spices

For each dish, provide ONLY in this exact JSON format (no markdown, no extra text):
{
  "dishes": [
    {
      "name": "Dish Name",
      "calories": number,
      "description": "Brief description",
      "ingredients": ["ingredient1", "ingredient2"],
      "cooking_time": "XX minutes"
    }
  ]
}

Make sure the dishes are healthy, authentic Indian recipes. Return ONLY valid JSON.`;

    const model = geminiAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON from response (remove markdown code blocks if present)
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/, '').replace(/```\n?$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/, '').replace(/```\n?$/, '');
    }
    
    const recommendations = JSON.parse(cleanedText);
    
    // For each dish, fetch YouTube video link
    const dishesWithVideos = await Promise.all(
      recommendations.dishes.map(async (dish) => {
        try {
          const videoLink = await searchYouTubeVideo(dish.name);
          return {
            ...dish,
            video_link: videoLink
          };
        } catch (error) {
          console.error(`Error fetching video for ${dish.name}:`, error);
          return {
            ...dish,
            video_link: null
          };
        }
      })
    );
    
    res.json({
      success: true,
      recommendations: dishesWithVideos
    });
    
  } catch (error) {
    console.error('AI recommendation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate recommendations',
      details: error.message 
    });
  }
});

/**
 * Helper function to search YouTube for a recipe video
 */
async function searchYouTubeVideo(dishName) {
  try {
    const searchQuery = `${dishName} recipe Indian cooking tutorial`;
    
    const response = await youtube.search.list({
      part: ['id', 'snippet'],
      q: searchQuery,
      type: 'video',
      maxResults: 1,
      order: 'relevance',
      videoCategoryId: '26', // Howto & Style category
      relevanceLanguage: 'en'
    });
    
    if (response.data.items && response.data.items.length > 0) {
      const videoId = response.data.items[0].id.videoId;
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    
    return null;
  } catch (error) {
    console.error('YouTube API error:', error);
    return null;
  }
}

/**
 * Get user's ingredient suggestions from their recent meals
 */
router.get('/user-ingredients', verifyToken, async (req, res) => {
  const userId = req.userId;
  
  try {
    // Get ingredients from user's food items (if you have an ingredients table)
    // For now, return common Indian ingredients as suggestions
    const commonIngredients = [
      'Rice', 'Wheat Flour', 'Lentils', 'Chickpeas', 'Tomatoes', 'Onions',
      'Garlic', 'Ginger', 'Turmeric', 'Chili Powder', 'Cumin Seeds',
      'Mustard Seeds', 'Curry Leaves', 'Coriander', 'Spinach', 'Potatoes',
      'Eggs', 'Paneer', 'Yogurt', 'Oil', 'Salt', 'Pepper'
    ];
    
    res.json({ ingredients: commonIngredients });
  } catch (error) {
    console.error('Error fetching user ingredients:', error);
    res.status(500).json({ error: 'Failed to fetch ingredients' });
  }
});

module.exports = router;

