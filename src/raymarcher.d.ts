import { Vector2 } from "./utils/math";
import { CollisionLayer, EquipableWeapon, EquipableWeaponState } from "./enums";

export type Entity = any;

// TODO: Do better.
export type KineticEntity = PlayerEntity | ObjectEntity;

export type Ray = {
  // distance: number;
  normalizedDistance: number; // (This is derived so probably can be calculated later)
  wall: GridTileEntity | null;
  wallOrientation: "horizontal" | "vertical"; // This is derived too since wallFace tells us the same thing.
  wallFace: "north" | "south" | "east" | "west" | undefined;
  wallIntersection: number;
  rayDirection: Vector2;
  activeCell: Vector2;
};

export interface PlayerStateComponent {
  currentState;
}

export interface PlayerEntity {
  camera: CameraComponent;
  userControl: UserControlledComponent;
  transform: TransformComponent;
  // position: PositionComponent;
  // direction: Vector;
  plane: Vector2;
  velocity: VelocityComponent;
  movement: MovementComponent;
  // sprite: SpriteComponent;
  collider: ColliderComponent;
  collisions: CollisionReport[];
  collisionLayer: CollisionLayerComponent;
  state: PlayerStateComponent;
  equippedWeapon: EquipableWeaponComponent;
  equippedWeaponAnimation: AnimationState;
  equippedWeaponSprite: EquipableWeaponSprite;
  // TODO: Inventory or weaponinventory to make some things not immediately available.
}

export interface EquipableWeaponComponent {
  type: EquipableWeapon;
  state: EquipableWeaponState;
}

// This doesn't have the actual sprite. Just the render related info
// We really care about width not height, since it's bottom aligned. However, if I ever get weapon bob in, height will be a small factor.
export interface EquipableWeaponSprite {
  width: number;
  // TODO: allow other customizations besides centering.
  // In some cases I assume separate frames will need to be repositioned, like an axe chop.
}

// TODO: Oh man. Uh. Sort term gonna just stick a flag on player, then we figure out how to make the camera jump around for freeview and stuff.
export interface CameraComponent {
  inverseDeterminate: number;
  fov: number;
}

export interface UserControlledComponent {
  isControlled: boolean;
}

export interface PositionComponent extends Vector2 {}

export interface RotationComponent {
  angle: number; // Player's facing direction in radians // TODO: Match the existing setup
}

export interface VelocityComponent extends Vector2 {}

// TODO: Hard code for now.
export interface MovementComponent {
  speed: number;
  // walkSpeed: number;
  // rotationSpeed: number;
}

// Breaking these apart to gently deprecate rotation;
export interface BaseTransformComponent {
  position: Vector2;
  elevation: number; // Already regretting not using a second component for object dimensions. Come back to that ASAP. This is what would the third axis in 3d. It will allow us to position in 3d space, but I'm concerned about just using vector3's for everything since the plane and direction of the camera will never move on that axis(unless I really want tilt, but nah) and 8 directional sprites don't have directions for those angles either. So really, this just lets things jump up and down, but not angle in a third dimension. It opens up gravity too of course.
  // We'll probably want to get smart and use it for collisions as well so things can go over other things heads. Height will be very helpful there.
  direction: Vector2;
  // scale: Vector;
  height: number;
}

export interface TransformComponent extends BaseTransformComponent {}

export interface SpriteComponent {
  texture: string;
  width: number;
  height: number;
}

export interface EntityState {
  name: string;
  animation: AnimationState;
  height?: number; // To optionally let me resize objects during different states. Should be opt in to avoid overwork
  sound?: SoundComponent; // Some entities should play a sound continuously during a certain state.
}

export interface AnimationDefinition {
  name: string; // needed?
  frames: AnimationFrame[];
  // TODO: allow for random duration
  frameDuration: number; // Allow for all frames to share a duration
  looping: boolean;
  events?: FrameEvent[]; // TODO: Define events
}

export interface AnimationState extends AnimationDefinition {
  currentFrame: number;
  timeSinceLastFrame: number;
  // These two values may better belong on the EntityState
}

export interface AnimationFrame {
  frameId: string;
  directions: 0 | 8;
  duration?: number; // Allow a frame to override the base duration of the animation
  sound?: SoundComponent;
}

export interface AnimationAsset {
  name: string;
  frames: AnimationFrame[];
  events: FrameEvent[];
}

export interface EquipableWeaponAssets {
  // Since Map enum isn't mapped I can't use a generic 'in' :/
  [EquipableWeaponState.Idle]: AnimationAsset;
  [EquipableWeaponState.Firing]: AnimationAsset;
  sprite: {
    width: number;
  };
}

export interface FrameEvent {
  frameId: string;
  eventType: string;
  eventPayload: any; // TODO:
}

export interface SoundComponent {}

export interface EntityStateComponent {
  currentState: string | number;
  previousState: string | number | null;
  initialState: string | number;
  lastStateChange: number;
  states: {
    [state: string | number]: EntityState;
  };
}

// Keeping it here to make turning it into an array potentially easier.
export interface CollisionLayerComponent {
  layer: CollisionLayer;
}

export interface ColliderComponent {
  type: "aabb" | "circle";
  radius?: number;
  width?: number;
  height?: number;
  solid: boolean;
}

export interface CollisionReport {
  entity: Entity;
  collidedWith: Entity;
  axis: "x" | "y";
  overlap: number;
  timestamp: number; // Maybe should be frame id
  // collisionPoints: Vector[];
  // Additional properties as needed
  // collisionNormal: Vector;
  // surfaceMaterial: string;
  // contactForce: number;
  // ...
  // TODO: Unfortunately, I need to rethink how to do projectile impacts when the colliding entity is removed. Maybe I need to schedule dead entities for deletion so that references aren't immediately lost. That would be a short term hack.
}

export interface BaseAIComponent {
  aiType: string;
}

export interface SeekTargetComponent {
  target: Vector2 | null;
}

export interface SeekPathComponent {
  path: GridNode[] | null;
  currentIndex: number;
}

export interface DogAIComponent extends BaseAIComponent {
  aiType: "dog_friendly";
  playRadius: number;
  swarmRadius: number;
  idleDurationRange: [number, number];
  idleTimer: number;
  // TODO: I'm getting a bit overwhelmed with options here. Just going to try and keep all these values here, but some might make more sense to be related to state or movement or physics. Also, I should be redefining the state component to not include animations directly again. Ha.
  seekTarget: SeekTargetComponent;
  seekPath: SeekPathComponent;
}

export type AIComponent = DogAIComponent;

export interface BaseObjectEntity {
  objectType: string;
  transform: TransformComponent;
  movement: MovementComponent;
  velocity: VelocityComponent;
  ai?: AIComponent;
}

export interface StaticObjectEntity extends BaseObjectEntity {
  // NOTE: This is to make it easier to deal with typescript. It's really got no other use today.
  objectType: "object__static";
  sprite: SpriteTextureComponent;
  collider?: ColliderComponent;
  collisions?: CollisionReport[];
  collisionLayer?: CollisionLayerComponent;
}

export interface AnimatedObjectEntity extends BaseObjectEntity {
  objectType: "object__animated";
  state: EntityStateComponent;
  collider?: ColliderComponent;
  collisions?: CollisionReport[];
  collisionLayer?: CollisionLayerComponent;
}

export interface ProjectileEntity extends AnimatedObjectEntity {
  projectileType: string;
}

export interface MagicShotProjectileEntity extends ProjectileEntity {
  projectileType: "magic_shot";
  objectType: "object__animated";
  velocity: VelocityComponent;
  lifetime: number;
  movement: MovementComponent;
}

export interface FriendlyDogEntity extends AnimatedObjectEntity {
  ai: DogAIComponent;
}

export type ObjectEntity = StaticObjectEntity | AnimatedObjectEntity;

export interface GridCoord {
  x: number;
  y: number;
}

export interface GridNode extends GridCoord {
  parent: GridNode | null;
}

// Component to store the texture information for the grid tile face
export interface TileTextureComponent {
  name: string; // Texture URL or identifier
}

export interface SpriteTextureComponent {
  name: string; // Texture URL or identifier
  directions: 0 | 8;
}

// Component to store the color information for the grid tile face
export interface TileColorComponent {
  r: number;
  g: number;
  b: number;
}

// Component to store the animated texture information for the grid tile face
export interface TileAnimatedTextureComponent {
  texture: string; // Texture URL or identifier
  frames: number; // Number of frames in the texture
  fps: number; // Frames per second
}

export interface TileSurfaceComponent {
  surface: "color" | "texture" | "animatedTexture" | "spriteTexture";
  texture?: TileTextureComponent;
  color?: TileColorComponent;
  animatedTexture?: TileAnimatedTextureComponent;
}

export interface WallFaceComponent extends TileSurfaceComponent {
  wallFace: "north" | "south" | "east" | "west";
}

export interface WallTileComponent extends TileSurfaceComponent {
  wallFaces?: WallFaceComponent[];
}

export interface FloorTileComponent extends TileSurfaceComponent {
  ceiling?: TileSurfaceComponent;
}

export interface GridTileEntity {
  type: "wall" | "floor";
  gridLocation: GridCoord;
  accessible: boolean;
  wallTile?: WallTileComponent;
  floorTile?: FloorTileComponent;
  // collider?: ColliderComponent;
  // collisionResult: CollisionResultComponent;
}

export interface SkyboxEntity {
  skybox: TileSurfaceComponent;
}

export interface GameSettingsComponent {
  width: number;
  height: number;
  canvasId: string;
  tileSize: number;
}

export interface GameSettingsEntity {
  gameSettings: GameSettingsComponent;
}

export interface SpriteFrame {
  frame: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  rotated: boolean;
  trimmed: boolean;
  spriteSourceSize: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  sourceSize: {
    w: number;
    h: number;
  };
  pivot: {
    x: number;
    y: number;
  };
}

export interface SpritesheetData {
  frames: { [key: string]: SpriteFrame };
  meta: {
    image: string;
    name: string;
    id: string;
    format: string;
    size: {
      w: number;
      h: number;
    };
    scale: number;
  };
}

export interface SpriteFrameData {
  textureKey: string;
  frame: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  // Add additional frame data properties as needed
}

export interface WADTexture {
  type: "texture" | "color";
}

export interface WADTextureTexture extends WADTexture {
  type: "texture";
  textureName: string;
}
export interface WADTextureColor extends WADTexture {
  type: "color";
  color: {
    r: number;
    g: number;
    b: number;
  };
}

export interface WADGridCell {
  type: "floor" | "wall";
  accessible: boolean;
  texture: WADTextureColor | WADTextureTexture;
  ceiling?: WADTextureColor | WADTextureTexture;
  wallFaces?: [];
}

export type WADGrid = WADGridCell[][];

export interface WADObjectEntity {
  transform: {
    position: {
      x: number;
      y: number;
    };
    rotation: number;
    // scale: {
    //   x: number;
    //   y: number;
    // };
    height: number;
    elevation: number;
  };
  sprite?: {
    name: string;
    directions: 0 | 8;
  };
  initialState?: string;
  states?: Array<{
    name: string;
    animation: string;
    height?: number;
    sound?: any;
  }>;
  collider?: {
    type: "aabb" | "circle";
    radius?: number;
    width?: number;
    height?: number;
    solid: boolean;
  };
  movement?: MovementComponent;
  collisionLayer?: number;
  ai?: any;
}

export interface WADAnimation {
  name: string;
  frames: Array<{
    frameId: string;
    directions: 0 | 8;
    duration?: number;
  }>;
  looping: boolean;
  frameDuration: number;
  nextState?: string;
  events?: FrameEvent[];
}

// TODO: This is really only one type of animation. Will support others.
export interface WADTextureAnimationBase {
  animationType: string;
  name: string;
  frameCount: number; // TODO: Maybe only support a fwe different frame lengths if I'm going to pregenerate.
  // frameDuration: number; // For now all animated tiles are on the same frame rate..
}

export interface WADTextureAnimationFlatWarp extends WADTextureAnimationBase {
  animationType: "flat_warp";
  texture: string;
}
export interface WADTextureAnimationSprite extends WADTextureAnimationBase {
  animationType: "sprite";
  frames: string[];
}

export type WADTextureAnimation =
  | WADTextureAnimationFlatWarp
  | WADTextureAnimationSprite;

export interface WADMap {
  grid: WADGrid;
  sky: any;
  start: any;
  objects: WADObjectEntity[];
}

export interface WAD {
  wadSettings: {
    firstMap: string;
  };
  textures: any;
  sprites: any;
  animations: WADAnimation[];
  textureAnimations: WADTextureAnimation[];
  maps: {
    [key: string]: WADMap;
  };
}

export interface EventMessage {
  type: string;
}

export interface EmitProjectileEvent extends EventMessage {
  name: "emit_projectile";
  emitter: "player";
  type: string;
  // TODO: Type of projectile and parameters and associated sprite
  sprite: SpriteTextureComponent; // TODO: Sprite types (static animated)
  origin: Vector2;
  direction: Vector2;
  velocity: Vector2;
  speed: 2;
  collider: ColliderComponent;
  collisionLayer: CollisionLayerComponent;
}

// This is tricky because it's going to rely on entity references. Would be better to have an entity Id to pass
export interface DestroyProjectileEvent extends EventMessage {
  name: "destroy_projectile";
  // TODO: If entity's had generic lifecycles i could obviously reuse this.
  entity: ProjectileEntity;
}
