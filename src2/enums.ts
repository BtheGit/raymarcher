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
  Ball,
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
