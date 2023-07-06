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

export enum PlayerState {
  Standing,
  Walking,
  Running,
}

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

export interface StateComponent {
  currentState: string;
}

export interface AnimationComponent {
  animations: {
    [state: string]: {
      name: string;
      frames: string[];
      directions: 0 | 8;
      duration: number; // Length between frame changes
    };
  };
  currentAnimation: string;
  currentFrame: number;
  timeSinceLastFrame: number;
}

export interface ColliderComponent {
  type: "aabb" | "circle";
  radius?: number;
  width?: number;
  height?: number;
  solid: boolean;
  // TODO: Support circle and rectangle bounding boxes.
}

export interface CollisionResultComponent {
  collidedWith: Entity[];
}

export interface PlayerStateComponent {
  isStanding: boolean;
  // isRunning: boolean;
  isWalking: boolean;
  // isJumping: boolean;
}

// TODO: Model entities so it's easier to track in code.

// Component to represent the type of the grid tile (wall or floor)
// export interface GridTileTypeComponent {
//   type: "wall" | "floor";
// }

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

export interface PlayerEntity {
  camera: CameraComponent;
  userControl: UserControlledComponent;
  position: PositionComponent;
  direction: Vector; // TODO: Until I can figure out how to switch to rotation. this is what we have.
  // rotation: RotationComponent;
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

export interface ObjectEntity {
  transform: TransformComponent;
  // sprite: SpriteComponent;
  state?: StateComponent;
  texture?: TileTextureComponent;
  animation?: AnimationComponent;
  collider?: ColliderComponent;
  collisions?: CollisionResultComponent;
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
