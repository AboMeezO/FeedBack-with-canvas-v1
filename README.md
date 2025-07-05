# Feedback Bot

A Discord bot that creates custom feedback images with user avatars and messages. When users send messages in a designated channel, the bot generates a personalized image with their avatar and message text, then adds a custom reaction.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure the Bot

#### Edit `config.json`:

- **token**: Your Discord bot token
- **prefix**: Command prefix (default: `!`)
- **color**: Embed color in hex format (default: `#0099ff`)

#### Edit `Database.json`:

- **ChannelID**: The channel where feedback messages will be processed
- **ImageURL**: Path to your background image (default: `./Image.png`)
- **Reaction**: Emoji that will be added to feedback messages (default: `🎀`)

### 3. Add Your Background Image

Replace `Image.png` with your own background image. The bot will overlay user avatars and text on this image.

### 4. Run the Bot

```bash
npm start
```

## Bot Commands

### `!help`

Shows available commands and their usage.

### `!setchannel <#channel>`

Sets the channel where feedback messages will be processed.

- Usage: `!setchannel #feedback`

### `!setimage <attach image>`

Updates the background image by attaching a new image to the command.

- Usage: Attach an image and type `!setimage`

### `!setreaction <emoji>`

Changes the emoji that gets added to feedback messages.

- Usage: `!setreaction 👍`

## How It Works

1. **Message Detection**: When a user sends a message in the designated feedback channel, the bot processes it
2. **Image Generation**: The bot creates a custom image by:
   - Loading the background image
   - Adding the user's avatar as a circular overlay
   - Adding the user's message text with proper formatting
   - Handling mentions and converting them to readable text
3. **Response**: The bot sends the generated image with a thank you message
4. **Reaction**: Automatically adds the configured emoji to the response

## Customization Points

### Image Layout

Edit these values in `index.js` to adjust the image layout:

```javascript
// Avatar positioning and size
const avatarSize = 250;
const avatarX = 40;
const avatarY = 25;

// Text box positioning and size
const boxX = 458;
const boxY = 150;
const boxWidth = 410;
const boxHeight = 185;
```

### Text Styling

Modify these properties to change text appearance:

```javascript
// Text alignment and color
ctx.textAlign = "right";
ctx.fillStyle = "#ffffff";

// Shadow effects
ctx.shadowColor = "rgba(0,0,0,0.8)";
ctx.shadowBlur = 8;
ctx.shadowOffsetX = 2;
ctx.shadowOffsetY = 2;

// Font settings
ctx.font = `${fontSize}px Arial`;
```

### Response Message

Change the thank you message by editing:

```javascript
content: `شكراً لتقييمك <@${message.author.id}>`;
```

## File Structure

- `index.js` - Main bot code
- `config.json` - Bot configuration (token, prefix, color)
- `Database.json` - Channel and reaction settings
- `Image.png` - Background image for feedback
- `package.json` - Dependencies and scripts

## Permissions Required

The bot needs these Discord permissions:

- Send Messages
- Attach Files
- Add Reactions
- Manage Messages (to delete original feedback messages)
- Read Message History
- Use External Emojis

## Troubleshooting

- **Bot not responding**: Check if the bot token is correct in `config.json`
- **Image not loading**: Ensure `Image.png` exists and is a valid image file
- **Channel not working**: Verify the channel ID in `Database.json` is correct
- **Reaction not appearing**: Make sure the bot has permission to add reactions

## Support

For support, join the Discord server: https://discord.gg/vas
