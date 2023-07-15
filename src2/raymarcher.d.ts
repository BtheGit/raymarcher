import { Vector } from "./utils/math";

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
  rayDirection: Vector;
  activeCell: Vector;
};

// TODO: Oh man. Uh. Sort term gonna just stick a flag on player, then we figure out how to make the camera jump around for freeview and stuff.
export interface CameraComponent {
  inverseDeterminate: number;
  fov: number;
}

export interface UserControlledComponent {
  isControlled: boolean;
}

export interface PositionComponent extends Vector {}

export interface RotationComponent {
  angle: number; // Player's facing direction in radians // TODO: Match the existing setup
}

export interface VelocityComponent extends Vector {}

// TODO: Hard code for now.
export interface MovementComponent {
  walkSpeed: number;
  rotationSpeed: number;
}

// Breaking these apart to gently deprecate rotation;
export interface BaseTransformComponent {
  position: Vector;
  direction: Vector;
  scale: Vector;
}

export interface TransformComponent extends BaseTransformComponent {
  rotation: number;
}

export interface SpriteComponent {
  texture: string;
  width: number;
  height: number;
}

export interface EntityState {
  name: string;
  animation: AnimationState;
  sound?: SoundComponent; // Some entities should play a sound continuously during a certain state.
}

export interface AnimationDefinition {
  name: string; // needed?
  frames: AnimationFrame[];
  // TODO: allow for random duration
  frameDuration: number; // Allow for all frames to share a duration
  looping: boolean;
  nextState?: string; // At the end of the animation, change entity state to this. (Wouldn't make sense if looping of course)
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

export interface SoundComponent {}

export interface EntityStateComponent {
  currentState: string;
  previousState: string | null;
  initialState: string;
  timeElapsedInState: number;
  states: {
    [state: string]: EntityState;
  };
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
}

export interface BaseAIComponent {
  aiType: string;
}

export interface SeekTargetComponent {
  target: Vector | null;
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
  velocity: VelocityComponent;
  ai?: AIComponent;
}

export interface StaticObjectEntity extends BaseObjectEntity {
  // NOTE: This is to make it easier to deal with typescript. It's really got no other use today.
  objectType: "object__static";
  sprite: SpriteTextureComponent;
  collider?: ColliderComponent;
  collisions?: CollisionReport[];
}

export interface AnimatedObjectEntity extends BaseObjectEntity {
  objectType: "object__animated";
  state: EntityStateComponent;
  collider?: ColliderComponent;
  collisions?: CollisionReport[];
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
  surface: "color" | "texture" | "animatedTexture";
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

export interface PlayerStateComponent {
  currentState;
}

export interface PlayerEntity {
  camera: CameraComponent;
  userControl: UserControlledComponent;
  transform: TransformComponent;
  // position: PositionComponent;
  // direction: Vector;
  plane: Vector;
  velocity: VelocityComponent;
  movement: MovementComponent;
  // sprite: SpriteComponent;
  collider: ColliderComponent;
  collisions: CollisionReport[];
  state: PlayerStateComponent;
}

export interface SkyboxEntity {
  skybox: TileSurfaceComponent;
}

export interface GameSettingsComponent {
  width: number;
  height: number;
  canvasId: string;
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
    scale: {
      x: number;
      y: number;
    };
  };
  sprite?: {
    name: string;
    directions: 0 | 8;
  };
  initialState?: string;
  states?: Array<{
    name: string;
    animation: string;
    sound?: any;
  }>;
  collider?: {
    type: "aabb" | "circle";
    radius?: number;
    width?: number;
    height?: number;
    solid: boolean;
  };
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
}

// TODO: This is really only one type of animation. Will support others.
export interface WADTextureAnimation {
  animationType: "flat_warp";
  name: string;
  frameCount: number; // TODO: Maybe only support a fwe different frame lengths if I'm going to pregenerate.
  // frameDuration: number; // For now all animated tiles are on the same frame rate..
  texture: string;
}

export interface WAD {
  textures: any;
  sprites: any;
  animations: WADAnimation[];
  textureAnimations: WADTextureAnimation[];
  map: {
    grid: WADGrid;
    sky: any;
    start: any;
    objects: WADObjectEntity[];
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
  origin: Vector;
  direction: Vector;
  velocity: Vector;
  speed: 2;
  collider: ColliderComponent;
}

export interface ProjectileEntity {
  projectileType: string;
}

export interface BallProjectileEntity extends ProjectileEntity {
  projectileType: "ball";
  objectType: "object__static";
  sprite: SpriteTextureComponent;
  transform: BaseTransformComponent;
  velocity: VelocityComponent;
  lifetime: number;
  speed: number;
  collider: ColliderComponent;
  collisions: CollisionReport[];
}
