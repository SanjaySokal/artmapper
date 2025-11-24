import 'reflect-metadata';

export const DATA_METADATA_KEY = Symbol('data');
export const GETTER_METADATA_KEY = Symbol('getter');
export const SETTER_METADATA_KEY = Symbol('setter');
export const BUILDER_METADATA_KEY = Symbol('builder');
export const TO_STRING_METADATA_KEY = Symbol('toString');
export const EQUALS_AND_HASH_CODE_METADATA_KEY = Symbol('equalsAndHashCode');
export const NO_ARGS_CONSTRUCTOR_METADATA_KEY = Symbol('noArgsConstructor');
export const ALL_ARGS_CONSTRUCTOR_METADATA_KEY = Symbol('allArgsConstructor');
export const REQUIRED_ARGS_CONSTRUCTOR_METADATA_KEY = Symbol('requiredArgsConstructor');

/**
 * Lombok @Data equivalent - generates getters, setters, toString, equals, hashCode, and constructors
 */
export function Data() {
  return function (target: Function) {
    Reflect.defineMetadata(DATA_METADATA_KEY, true, target);
    // Apply all Lombok features
    generateGetters(target);
    generateSetters(target);
    generateToString(target);
    generateEqualsAndHashCode(target);
    generateNoArgsConstructor(target);
  };
}

/**
 * Lombok @Getter - generates getter methods for all properties
 */
export function Getter(accessLevel?: 'PUBLIC' | 'PROTECTED' | 'PRIVATE') {
  return function (target: Function) {
    Reflect.defineMetadata(GETTER_METADATA_KEY, { accessLevel: accessLevel || 'PUBLIC' }, target);
    generateGetters(target);
  };
}

/**
 * Lombok @Setter - generates setter methods for all properties
 */
export function Setter(accessLevel?: 'PUBLIC' | 'PROTECTED' | 'PRIVATE') {
  return function (target: Function) {
    Reflect.defineMetadata(SETTER_METADATA_KEY, { accessLevel: accessLevel || 'PUBLIC' }, target);
    generateSetters(target);
  };
}

/**
 * Lombok @Builder - generates a builder pattern
 */
export function Builder() {
  return function (target: Function) {
    Reflect.defineMetadata(BUILDER_METADATA_KEY, true, target);
    generateBuilder(target);
  };
}

/**
 * Lombok @ToString - generates toString method
 */
export function ToString(includeFieldNames?: boolean) {
  return function (target: Function) {
    Reflect.defineMetadata(TO_STRING_METADATA_KEY, { includeFieldNames: includeFieldNames !== false }, target);
    generateToString(target);
  };
}

/**
 * Lombok @EqualsAndHashCode - generates equals and hashCode methods
 */
export function EqualsAndHashCode() {
  return function (target: Function) {
    Reflect.defineMetadata(EQUALS_AND_HASH_CODE_METADATA_KEY, true, target);
    generateEqualsAndHashCode(target);
  };
}

/**
 * Lombok @NoArgsConstructor - generates no-args constructor
 */
export function NoArgsConstructor() {
  return function (target: Function) {
    Reflect.defineMetadata(NO_ARGS_CONSTRUCTOR_METADATA_KEY, true, target);
    generateNoArgsConstructor(target);
  };
}

/**
 * Lombok @AllArgsConstructor - generates constructor with all fields
 */
export function AllArgsConstructor() {
  return function (target: Function) {
    Reflect.defineMetadata(ALL_ARGS_CONSTRUCTOR_METADATA_KEY, true, target);
    generateAllArgsConstructor(target);
  };
}

/**
 * Lombok @RequiredArgsConstructor - generates constructor with required fields
 */
export function RequiredArgsConstructor() {
  return function (target: Function) {
    Reflect.defineMetadata(REQUIRED_ARGS_CONSTRUCTOR_METADATA_KEY, true, target);
    generateRequiredArgsConstructor(target);
  };
}

// Helper functions to generate code

function generateGetters(target: Function) {
  const prototype = target.prototype;
  const propertyNames = Object.getOwnPropertyNames(prototype).filter(
    name => name !== 'constructor' && typeof prototype[name] !== 'function'
  );

  propertyNames.forEach(prop => {
    const getterName = `get${capitalize(prop)}`;
    if (!prototype[getterName]) {
      Object.defineProperty(prototype, getterName, {
        get: function () {
          return this[prop];
        },
        enumerable: false,
        configurable: true,
      });
    }
  });
}

function generateSetters(target: Function) {
  const prototype = target.prototype;
  const propertyNames = Object.getOwnPropertyNames(prototype).filter(
    name => name !== 'constructor' && typeof prototype[name] !== 'function'
  );

  propertyNames.forEach(prop => {
    const setterName = `set${capitalize(prop)}`;
    if (!prototype[setterName]) {
      prototype[setterName] = function (value: any) {
        this[prop] = value;
        return this;
      };
    }
  });
}

function generateToString(target: Function) {
  const prototype = target.prototype;
  if (!prototype.toString || prototype.toString === Object.prototype.toString) {
    prototype.toString = function () {
      const props = Object.keys(this).map(key => `${key}=${this[key]}`);
      return `${target.name}(${props.join(', ')})`;
    };
  }
}

function generateEqualsAndHashCode(target: Function) {
  const prototype = target.prototype;
  
  if (!prototype.equals) {
    prototype.equals = function (other: any): boolean {
      if (this === other) return true;
      if (!other || this.constructor !== other.constructor) return false;
      const keys = Object.keys(this);
      return keys.every(key => this[key] === other[key]);
    };
  }

  if (!prototype.hashCode) {
    prototype.hashCode = function (): number {
      const keys = Object.keys(this).sort();
      let hash = 0;
      keys.forEach(key => {
        const value = this[key];
        const valueHash = value === null ? 0 : typeof value === 'object' ? JSON.stringify(value).length : String(value).length;
        hash = ((hash << 5) - hash) + valueHash;
        hash = hash & hash;
      });
      return hash;
    };
  }
}

function generateNoArgsConstructor(target: Function) {
  // TypeScript classes already have no-args constructor by default
  // This is mainly for metadata tracking
}

function generateAllArgsConstructor(target: Function) {
  // In TypeScript, we can't dynamically modify constructors
  // This would need to be handled at compile time or through factory methods
}

function generateRequiredArgsConstructor(target: Function) {
  // Similar to AllArgsConstructor, would need compile-time transformation
}

function generateBuilder(target: Function) {
  const prototype = target.prototype;
  
  if (!prototype.builder) {
    (target as any).builder = function () {
      return new BuilderClass(target);
    };
  }
}

class BuilderClass {
  private data: any = {};

  constructor(private targetClass: Function) {}

  set(key: string, value: any): this {
    this.data[key] = value;
    return this;
  }

  build(): any {
    const instance = Object.create(this.targetClass.prototype);
    Object.assign(instance, this.data);
    return instance;
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

