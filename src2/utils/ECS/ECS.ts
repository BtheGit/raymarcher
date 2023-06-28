/**
 * Simple Entity Component System (ECS) for use in small interactive projects and games.
 *
 * Built on top of a special iterable structure that
 */

export class Bucket<Entity> implements Iterable<Entity> {
  protected bucket: Entity[];
  private memberMap = new Map<Entity, number>();

  constructor(members: Entity[] = []) {
    for (let i = 0; i < members.length; i++) {
      this.add(members[i]);
    }
  }

  [Symbol.iterator](): Iterator<Entity> {
    return this.bucket[Symbol.iterator]();
  }

  get size() {
    return this.bucket.length;
  }

  has = (member: Entity) => {
    return this.memberMap.has(member);
  };

  add = (member: Entity) => {
    if (!member) {
      throw new Error("Member cannot be null");
    }
    if (!this.memberMap.has(member)) {
      this.bucket.push(member);
      this.memberMap.set(member, this.bucket.length - 1);
    }
    return member;
  };

  remove = (member: Entity) => {
    if (!member) {
      throw new Error("Member cannot be null");
    }
    if (!this.memberMap.has(member)) return;

    // Shuffle pop!
    const index = this.memberMap.get(member)!;
    const last = this.bucket.pop()!;
    this.bucket[index] = last;
    this.memberMap.set(last, index);

    this.memberMap.delete(member);

    return member;
  };
}

/**
 * Entities are javascript objects made up of effectively arbitrary key value pairs. Keys represent the name/identifier of components, and the value is the component itself.
 * Note: Without a component instatiator, it is the responsibility of the developer to ensure that the component is of the correct type. Systems will act on entity components expecting a certain shape.
 *
 * I should note, instead of passing around an entiytIndex as reference, I'm expectingthe system to be passing around actual entities. Now, that's partly because the system itself treats objects as references. revisit later in optimization pass. Also look into maps instead ob objects.
 */
export class EntityPool<Entity> extends Bucket<Entity> {
  constructor(members: Entity[] = []) {
    super(members);
  }

  addComponentToEntity = (
    entity: Entity,
    componentKey: string,
    componentValue: any
  ) => {
    // Not checking if entity is still in bucket since we don't care about what happens to stale entity references. We dont want those changes to be broadcast.
    // Hopefully no systems are keeping these references needlessly.

    // Check to make sure the componentKey does not already exist on the entity.
    if (entity[componentKey] !== undefined) {
      throw new Error("Component already exists on entity");
    }

    entity[componentKey] = componentValue;

    // TODO: Broadcast and reindex any queries etc.
  };

  removeComponentFromEntity = (entity: Entity, componentKey: keyof Entity) => {
    if (entity[componentKey] === undefined) {
      throw new Error("Component does not exist on entity");
    }
    delete entity[componentKey];

    // TODO: Broadcast and reindex any queries etc.
  };

  with = (components: string[]) => {
    const entities = this.bucket.filter((entity) => {
      return components.every((component) => {
        return entity[component] !== undefined;
      });
    });
    return entities;
  };

  without = (components: string[]) => {
    const entities = this.bucket.filter((entity) => {
      return components.every((component) => {
        return entity[component] === undefined;
      });
    });
    return entities;
  };
}

// If we use a class. Otherwise we just return a function in a closure that saves the ecs reference
export interface System {
  update(dt: number): void;
}

// This is a placeholder essentially. For now we just need to be able to add these and to loop over them.
export class SystemPool<System> implements Iterable<System> {
  protected systemBucket: System[];

  constructor(systems: System[] = []) {
    this.systemBucket = systems;
  }

  [Symbol.iterator](): Iterator<System> {
    return this.systemBucket[Symbol.iterator]();
  }

  get size() {
    return this.systemBucket.length;
  }

  add = (system: System) => {
    this.systemBucket.push(system);
  };

  remove = (system: System) => {
    const index = this.systemBucket.indexOf(system);
    if (index === -1) return;
    this.systemBucket.splice(index, 1);
  };
}

export class ECS {
  private entityPool: EntityPool<any>;
  private systemPool: SystemPool<System>;

  // TODO: Support passing in existing values or config
  constructor() {
    this.entityPool = new EntityPool();
    this.systemPool = new SystemPool();
  }

  get entities() {
    return this.entityPool;
  }

  get systems() {
    return this.systemPool;
  }

  update(dt: number) {
    for (const system of this.systems) {
      system.update(dt);
    }
  }
}

// TODO: Add a stats debugger to see how many and what type of calls are being performed on various parts of the ECS system.

// CHAT GPT Feedback. All good points to implement:
/**
 * The ECS implementation you provided looks promising, but there are a few points worth considering:

Naming Conflict:
You have used the name System for both the interface and the generic parameter in SystemPool. This can lead to confusion and potential issues. It's recommended to use different names to avoid naming conflicts.

Generics Usage:
While it's great to have generic types for the ECS classes, such as Bucket, EntityPool, and SystemPool, it's important to ensure that the generic type parameters are properly constrained. In your implementation, the generic type parameters (Entity and System) are not constrained, which can lead to unexpected behavior or type errors. Consider adding constraints to restrict the types that can be used.

Handling Component Removal:
In the removeComponentFromEntity method of EntityPool, you're using delete to remove a component from an entity. While this works for JavaScript objects, it's important to note that it won't trigger any notifications or events to other parts of the ECS that might be interested in component removal. Consider adding a mechanism to handle component removal and broadcast events or trigger necessary updates.

Component Indexing and Queries:
You've mentioned using queries and indexing in your comments, but they are currently marked as TODOs in the code. It's important to implement these mechanisms to efficiently retrieve entities with specific components and to optimize the ECS's performance.

Performance Considerations:
The implementation seems to use array-based storage for entities and components. While this can work well for smaller-scale ECS systems, it might not be the most performant solution for larger systems with a significant number of entities. Consider exploring alternative data structures, such as maps or sparse arrays, to improve performance.

Overall, your ECS implementation shows potential, but there are some areas that need further development and consideration. Addressing the points mentioned above should help you improve the adequacy and functionality of your ECS system.
 */
