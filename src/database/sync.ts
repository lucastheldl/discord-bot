import {
  User,
  Character,
  Planet,
  Location,
  Vehicle,
  Item,
  CharacterItem,
} from "../models";

export async function syncDatabase(force = false) {
  try {
    console.log("Starting database synchronization...");

    // Sync all models in the correct order (dependencies first)
    await Planet.sync({ force });
    console.log("✓ Planet table synced");

    await Location.sync({ force });
    console.log("✓ Location table synced");

    await Vehicle.sync({ force });
    console.log("✓ Vehicle table synced");

    await Item.sync({ force });
    console.log("✓ Item table synced");

    await User.sync({ force });
    console.log("✓ User table synced");

    await Character.sync({ force });
    console.log("✓ Character table synced");

    await CharacterItem.sync({ force });
    console.log("✓ CharacterItem table synced");

    console.log("Database synchronization completed successfully!");
  } catch (error) {
    console.error("Database synchronization failed:", error);
    throw error;
  }
}
