export enum CollisionLayer {
  None = "None",
  Player = "Player",
  PlayerProjectile = "PlayerProjectile",
  FriendlyNPC = "FriendlyNPC",
  PickupItem = "PickupItem",
}

export enum EquipableWeapon {
  None,
  MagicHands,
}

export enum Projectile {
  MagicShot,
}

export enum EquipableWeaponState {
  Idle,
  Firing,
}

// TODO: Combine with general actor state?
export enum ProjectileState {
  Active,
  Destroying,
  // Destroyed // TODO: If I want remnants left behind.
}

// These should be generified, just testing to support portals and text triggers short-term.
// Not sure If I should mix objects and npcs either.

//Using this style of enum to better correlate strings in wad (so, it's not just numbers that are more likely to change during initial dev)

// Generic for N
export enum GameActorType {
  Prop = "Prop",
  Coin = "Coin",
  Book = "Book",
  Portal = "Portal",
  NPC = "NPC",
  DogFriendly = "DogFriendly",
}

export enum AIType {
  DogFriendly = "DogFriendly",
  BirdSkittish = "BirdSkittish",
}

export enum EventMessageName {
  PlayerActorCollision = "PlayerActorCollision",
  DestroyProjectile = "DestroyProjectile",
  EmitProjectile = "EmitProjectile",
  ProjectileCollision = "ProjectileCollision",
  PlaySound = "PlaySound",
  InteractionDirective = "InteractionDirective",
  RaysUpdated = "RaysUpdated",
  LoadLevel = "LoadLevel",
}

export enum InteractionDirectiveName {
  ShowMessage = "ShowMessage",
  PlayAudio = "PlayAudio",
  LoadLevel = "LoadLevel",
}

export enum CustomEventType {
  GameEvent = "GameEvent",
}

export enum GameEvent {
  LoadLevel = "LoadLevel",
  // TeleportPlayer = "TeleportPlayer",
}
