"""
Game knowledge base for the RAG system.
Each game has: name, genre, and a description.
This data is converted into a vector store in rag.py.
"""

GAMES = [
    {
        "name": "The Witcher 3: Wild Hunt",
        "genre": "Open-world RPG",
        "description": "A story-rich fantasy RPG where you play Geralt, a monster hunter searching for his adopted daughter. Features deep choices, memorable characters, and a massive open world. Best for players who love narrative-driven adventures."
    },
    {
        "name": "Cyberpunk 2077",
        "genre": "Open-world RPG",
        "description": "Futuristic action RPG set in Night City. First-person perspective, branching storylines, and cybernetic upgrades. Great for fans of dystopian sci-fi and immersive worlds."
    },
    {
        "name": "Skyrim",
        "genre": "Open-world RPG",
        "description": "Classic fantasy RPG with dragons, magic, and endless quests. Highly moddable. Ideal for players who enjoy exploration and freedom to play their own way."
    },
    {
        "name": "Elden Ring",
        "genre": "Soulslike Action RPG",
        "description": "Challenging open-world game from FromSoftware with George R.R. Martin worldbuilding. Difficult combat, cryptic lore, stunning vistas. For players who like a challenge."
    },
    {
        "name": "Hollow Knight",
        "genre": "Metroidvania",
        "description": "Beautiful 2D action game with tight controls, atmospheric world, and challenging bosses. Perfect for fans of exploration platformers and dark fantasy aesthetics."
    },
    {
        "name": "Stardew Valley",
        "genre": "Farming Simulation",
        "description": "Cozy farming RPG where you inherit a farm and build a life in a small town. Relaxing, charming, and full of content. Ideal for unwinding after a long day."
    },
    {
        "name": "Hades",
        "genre": "Roguelike Action",
        "description": "Fast-paced roguelike where you escape the Greek underworld. Excellent storytelling that rewards repeated runs. Great for short play sessions with deep mechanics."
    },
    {
        "name": "Portal 2",
        "genre": "Puzzle",
        "description": "First-person puzzle game with portal mechanics, witty writing, and a brilliant co-op mode. One of the best-designed puzzle games ever made."
    },
    {
        "name": "Red Dead Redemption 2",
        "genre": "Open-world Action",
        "description": "Cinematic western set in the dying days of the Wild West. Incredible attention to detail, emotional story, and a living world. For players who love slow-paced immersion."
    },
    {
        "name": "Minecraft",
        "genre": "Sandbox",
        "description": "Block-building sandbox with infinite worlds. Build, explore, survive, or just create. Suitable for all ages and infinitely replayable."
    },
    {
        "name": "Disco Elysium",
        "genre": "Narrative RPG",
        "description": "Detective RPG with no combat — pure dialogue and skill checks. Deeply philosophical, beautifully written. For players who prefer reading and character building over action."
    },
    {
        "name": "Celeste",
        "genre": "Platformer",
        "description": "Precision platformer about climbing a mountain and battling depression. Tight controls, emotional story, accessible difficulty options. A modern classic."
    },
    {
        "name": "Baldur's Gate 3",
        "genre": "Turn-based RPG",
        "description": "D&D-based party RPG with deep choice-and-consequence storytelling and tactical combat. Massive game with high replay value."
    },
    {
        "name": "DOOM Eternal",
        "genre": "FPS",
        "description": "Fast-paced first-person shooter with brutal combat and heavy metal soundtrack. Pure adrenaline. For players who want intense action."
    },
    {
        "name": "Animal Crossing: New Horizons",
        "genre": "Life Simulation",
        "description": "Relaxing island-life simulator. Decorate, fish, befriend villagers. Plays in real time. Perfect for casual, low-stress sessions."
    },
    {
        "name": "Dark Souls III",
        "genre": "Soulslike Action RPG",
        "description": "Punishing fantasy action RPG with intricate level design and rewarding combat. For players who want to be challenged and earn every victory."
    },
    {
        "name": "Hogwarts Legacy",
        "genre": "Open-world RPG",
        "description": "Open-world Harry Potter game where you attend Hogwarts in the 1800s. Spell-casting combat, magical creatures, exploration. Great for fantasy fans."
    },
    {
        "name": "It Takes Two",
        "genre": "Co-op Adventure",
        "description": "Mandatory two-player co-op adventure with constantly changing gameplay. Charming story about a divorcing couple. Best couch co-op game in years."
    },
    {
        "name": "Slay the Spire",
        "genre": "Roguelike Deckbuilder",
        "description": "Card-based roguelike where you build a deck while climbing a tower. Deep strategy, high replayability. The genre-defining deckbuilder."
    },
    {
        "name": "Outer Wilds",
        "genre": "Exploration Mystery",
        "description": "Space exploration game centered on a 22-minute time loop. Pure discovery — the only progression is knowledge. Best experienced spoiler-free."
    },
]
