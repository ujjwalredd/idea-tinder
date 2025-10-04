# 💡 Idea Tinder - AI Startup Generator

A modern, sleek startup idea generator powered by Claude AI. Swipe through unique startup ideas and get detailed pitch decks for the ones you like!

## 🌐 Live Demo

**Try it now:** [https://idea-tinder.vercel.app](https://idea-tinder.vercel.app)

## 🚀 Features

- **Professional AI Generation**: High-quality, fundable startup ideas using Claude 3.5 Haiku
- **Enterprise Focus**: B2B and enterprise software ideas with realistic market sizing
- **No Predefined Templates**: Every idea is unique and dynamically created
- **Swipe Interface**: Tinder-like interface for browsing ideas
- **Strategic Refinement**: AI-powered pivots to improve market positioning
- **Detailed Pitch Decks**: Comprehensive business plans with metrics and validation steps
- **Premium UI/UX**: Glassmorphism design with animations and haptic feedback
- **Data Persistence**: Save favorites and track your idea generation journey
- **Mobile Optimized**: Touch gestures and responsive design

## 🛠️ Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Copy the example environment file and add your Claude API key:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and replace `your_claude_api_key_here` with your actual Claude API key.

3. **Start the Server**
   ```bash
   npm start
   ```

4. **Open Your Browser**
   Navigate to `http://localhost:8080`

## 🎮 How to Use

- **Swipe Right** (❤️) or press **→** to like an idea and see the full pitch deck
- **Swipe Left** (❌) or press **←** to pass on an idea
- **Refine** (🔄) or press **R** to pivot the current idea
- **Escape** to go back from the pitch deck

## 🔧 Development

- **Frontend**: HTML, Tailwind CSS, Vanilla JavaScript
- **Backend**: Node.js, Express
- **AI**: Claude API for idea generation
- **Styling**: Tailwind CSS with custom animations

## 📱 Mobile Support

The app includes touch gestures for mobile devices:
- Swipe left/right to navigate
- Touch and drag for smooth interactions
- Responsive design for all screen sizes

## 🚀 Deployment

This project is deployed on Vercel with serverless functions:

1. **Fork this repository**
2. **Connect to Vercel**
3. **Add environment variables** in Vercel dashboard:
   - `CLAUDE_API_KEY`: Your Claude API key
4. **Deploy automatically**

## 🎨 Customization

The app uses a clean black and white theme with:
- Gradient backgrounds
- Smooth animations
- Modern typography
- Intuitive interactions

## 🔒 Security

- API keys are stored as environment variables
- Never commit `.env` files to version control
- Use `.env.example` as a template for required variables

Enjoy generating your next startup idea! 🚀
