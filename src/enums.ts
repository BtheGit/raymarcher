export enum CollisionLayer {
  None,
  Player,
  PlayerProjectile,
  FriendlyNPC,
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
export enum GameActorType {
  Prop = "Prop",
  Coin = "Coin",
  Book = "Book",
  Portal = "Portal",
  FriendlyDog = "FriendlyDog",
}
