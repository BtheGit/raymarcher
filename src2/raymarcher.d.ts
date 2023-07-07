import { Vector } from "./utils/math";

export type Entity = any;

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

export interface TransformComponent {
  position: Vector;
  rotation: number;
  direction: Vector;
  scale: Vector;
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

export interface AnimationState {
  name: string; // needed?
  frames: AnimationFrame[];
  currentFrame: number;
  timeSinceLastFrame: number;
  // TODO: allow for random duration
  frameDuration: number; // Allow for all frames to share a duration
  // These two values may better belong on the EntityState
  looping: boolean;
  nextState?: string; // At the end of the animation, change entity state to this. (Wouldn't make sense if looping of course)
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
  // TODO: Previous state
  initialState: string;
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

export interface CollisionResultComponent {
  collidedWith: Entity[];
}

export interface GridLocationComponent {
  x: number;
  y: number;
}

// Component to store the texture information for the grid tile face
export interface TileTextureComponent {
  name: string; // Texture URL or identifier
}

// Component to store the color information for the grid tile face
export interface TileColorComponent {
  color: string; // Hex color code or color name
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
  gridLocation: GridLocationComponent;
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
  position: PositionComponent;
  direction: Vector;
  plane: Vector;
  velocity: VelocityComponent;
  movement: MovementComponent;
  // sprite: SpriteComponent;
  collider: ColliderComponent;
  collisions: CollisionResultComponent;
  state: PlayerStateComponent;
}

export interface SkyboxEntity {
  skybox: TileSurfaceComponent;
}

export interface StaticObjectEntity {
  // NOTE: This is to make it easier to deal with typescript. It's really got no other use today.
  entityType: "object__static";
  transform: TransformComponent;
  texture: TileTextureComponent;
  collider?: ColliderComponent;
  collisions?: CollisionResultComponent;
}

export interface AnimatedObjectEntity {
  entityType: "object__animated";
  transform: TransformComponent;
  state: EntityStateComponent;
  collider?: ColliderComponent;
  collisions?: CollisionResultComponent;
}

export type ObjectEntity = StaticObjectEntity | AnimatedObjectEntity;

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

export interface WADGridCell {
  type: "floor" | "wall";
  accessible: boolean;
  texture: {
    type: "texture";
    textureName?: string;
  };
  ceiling?: {
    type: "texture";
    textureName?: string;
  };
  faces?: [];
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
  texture?: string;
  initialState?: string;
  states?: Array<{
    name: string;
    animation: {
      name: string;
      frames: Array<{
        frameId: string;
        directions: 0 | 8;
        duration?: number;
      }>;
      looping: boolean;
      frameDuration: number;
      nextState?: string;
    };
    sound?: any;
  }>;
  collider?: {
    type: "aabb" | "circle";
    radius?: number;
    width?: number;
    height?: number;
    solid: boolean;
  };
  animation?: {
    animations: {
      [key: string]: {
        name: string;
        duration: number;
        frames: string[];
        directions: 0 | 8;
      };
    };
    currentAnimation: string;
    currentFrame: number;
  };
}
