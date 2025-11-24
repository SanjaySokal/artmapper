import 'reflect-metadata';

export const COMPONENT_METADATA_KEY = Symbol('component');
export const SERVICE_METADATA_KEY = Symbol('service');
export const CONTROLLER_METADATA_KEY = Symbol('controller');
export const REPOSITORY_METADATA_KEY = Symbol('repository');
export const AUTOWIRED_METADATA_KEY = Symbol('autowired');
export const VALUE_METADATA_KEY = Symbol('value');
export const QUALIFIER_METADATA_KEY = Symbol('qualifier');

/**
 * Marks a class as a Spring component
 */
export function Component(name?: string) {
  return function (target: Function) {
    Reflect.defineMetadata(COMPONENT_METADATA_KEY, { name: name || target.name }, target);
  };
}

/**
 * Marks a class as a Spring service
 */
export function Service(name?: string) {
  return function (target: Function) {
    Reflect.defineMetadata(SERVICE_METADATA_KEY, { name: name || target.name }, target);
    Reflect.defineMetadata(COMPONENT_METADATA_KEY, { name: name || target.name }, target);
  };
}

/**
 * Marks a class as a Spring controller
 */
export function Controller(path?: string) {
  return function (target: Function) {
    Reflect.defineMetadata(CONTROLLER_METADATA_KEY, { path: path || '' }, target);
    Reflect.defineMetadata(COMPONENT_METADATA_KEY, { name: target.name }, target);
  };
}

/**
 * Marks a class as a Spring repository
 */
export function Repository(name?: string) {
  return function (target: Function) {
    Reflect.defineMetadata(REPOSITORY_METADATA_KEY, { name: name || target.name }, target);
    Reflect.defineMetadata(COMPONENT_METADATA_KEY, { name: name || target.name }, target);
  };
}

/**
 * Marks a property for dependency injection
 */
export function Autowired(type?: Function) {
  return function (target: any, propertyKey: string) {
    const existingAutowired = Reflect.getMetadata(AUTOWIRED_METADATA_KEY, target.constructor) || {};
    existingAutowired[propertyKey] = {
      type: type || Reflect.getMetadata('design:type', target, propertyKey),
    };
    Reflect.defineMetadata(AUTOWIRED_METADATA_KEY, existingAutowired, target.constructor);
  };
}

/**
 * Injects a configuration value
 */
export function Value(key: string) {
  return function (target: any, propertyKey: string) {
    const existingValues = Reflect.getMetadata(VALUE_METADATA_KEY, target.constructor) || {};
    existingValues[propertyKey] = key;
    Reflect.defineMetadata(VALUE_METADATA_KEY, existingValues, target.constructor);
  };
}

/**
 * Qualifies which bean to inject
 */
export function Qualifier(name: string) {
  return function (target: any, propertyKey: string) {
    const existingQualifiers = Reflect.getMetadata(QUALIFIER_METADATA_KEY, target.constructor) || {};
    existingQualifiers[propertyKey] = name;
    Reflect.defineMetadata(QUALIFIER_METADATA_KEY, existingQualifiers, target.constructor);
  };
}

