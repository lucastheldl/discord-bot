// Import necessary modules and types
import fs from "node:fs";
import path from "node:path";
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { Command } from "./types"; // We'll define this type below

// Initialize environment variables
dotenv.config();

// Extend the Client class to include the commands collection
class CustomClient extends Client {
  commands: Collection<string, Command> = new Collection();
}

// Create a new client instance
const client = new CustomClient({ intents: [GatewayIntentBits.Guilds] });

// Load commands
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath) as Command;

    // Set a new item in the Collection with the key as the command name
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

// Load events
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);

  if (event.once) {
    client.once(event.name, (...args: unknown[]) => event.execute(...args));
  } else {
    client.on(event.name, (...args: unknown[]) => event.execute(...args));
  }
}

// Log in to Discord with your client's token
client.login(process.env.TOKEN);

// Add this to a types.ts file in your project root
export interface Command {
  data: any; // Replace with proper type from discord.js or your command structure
  execute: (...args: any[]) => Promise<void> | void;
}
