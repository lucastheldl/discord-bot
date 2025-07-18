import fs from "node:fs";
import path from "node:path";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import type { Command } from "./types";

dotenv.config();

export class CustomClient extends Client {
  commands: Collection<string, Command> = new Collection();
}

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
    const command = require(filePath).default as Command;

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
  const event = require(filePath).default;

  if (event.once) {
    client.once(event.name, (...args: unknown[]) => event.execute(...args));
  } else {
    client.on(event.name, (...args: unknown[]) => event.execute(...args));
  }
}

client.login(process.env.TOKEN);
