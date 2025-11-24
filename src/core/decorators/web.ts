import 'reflect-metadata';

export const GET_METADATA_KEY = Symbol('get');
export const POST_METADATA_KEY = Symbol('post');
export const PUT_METADATA_KEY = Symbol('put');
export const DELETE_METADATA_KEY = Symbol('delete');
export const PATCH_METADATA_KEY = Symbol('patch');
export const REQUEST_BODY_METADATA_KEY = Symbol('requestBody');
export const REQUEST_PARAM_METADATA_KEY = Symbol('requestParam');
export const PATH_VARIABLE_METADATA_KEY = Symbol('pathVariable');
export const REQUEST_HEADER_METADATA_KEY = Symbol('requestHeader');

export interface RouteMetadata {
  path: string;
  method: string;
  handler: string;
  middleware?: Function[];
}

/**
 * Spring @GetMapping equivalent
 */
export function GetMapping(path: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const existingRoutes = Reflect.getMetadata(GET_METADATA_KEY, target.constructor) || [];
    existingRoutes.push({ path, method: 'GET', handler: propertyKey });
    Reflect.defineMetadata(GET_METADATA_KEY, existingRoutes, target.constructor);
  };
}

/**
 * Spring @PostMapping equivalent
 */
export function PostMapping(path: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const existingRoutes = Reflect.getMetadata(POST_METADATA_KEY, target.constructor) || [];
    existingRoutes.push({ path, method: 'POST', handler: propertyKey });
    Reflect.defineMetadata(POST_METADATA_KEY, existingRoutes, target.constructor);
  };
}

/**
 * Spring @PutMapping equivalent
 */
export function PutMapping(path: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const existingRoutes = Reflect.getMetadata(PUT_METADATA_KEY, target.constructor) || [];
    existingRoutes.push({ path, method: 'PUT', handler: propertyKey });
    Reflect.defineMetadata(PUT_METADATA_KEY, existingRoutes, target.constructor);
  };
}

/**
 * Spring @DeleteMapping equivalent
 */
export function DeleteMapping(path: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const existingRoutes = Reflect.getMetadata(DELETE_METADATA_KEY, target.constructor) || [];
    existingRoutes.push({ path, method: 'DELETE', handler: propertyKey });
    Reflect.defineMetadata(DELETE_METADATA_KEY, existingRoutes, target.constructor);
  };
}

/**
 * Spring @PatchMapping equivalent
 */
export function PatchMapping(path: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const existingRoutes = Reflect.getMetadata(PATCH_METADATA_KEY, target.constructor) || [];
    existingRoutes.push({ path, method: 'PATCH', handler: propertyKey });
    Reflect.defineMetadata(PATCH_METADATA_KEY, existingRoutes, target.constructor);
  };
}

/**
 * Spring @RequestBody equivalent
 */
export function RequestBody() {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    const existingParams = Reflect.getMetadata(REQUEST_BODY_METADATA_KEY, target, propertyKey) || {};
    existingParams[parameterIndex] = true;
    Reflect.defineMetadata(REQUEST_BODY_METADATA_KEY, existingParams, target, propertyKey);
  };
}

/**
 * Spring @RequestParam equivalent
 */
export function RequestParam(name?: string) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    const existingParams = Reflect.getMetadata(REQUEST_PARAM_METADATA_KEY, target, propertyKey) || {};
    existingParams[parameterIndex] = { name: name || `param${parameterIndex}` };
    Reflect.defineMetadata(REQUEST_PARAM_METADATA_KEY, existingParams, target, propertyKey);
  };
}

/**
 * Spring @PathVariable equivalent
 */
export function PathVariable(name?: string) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    const existingParams = Reflect.getMetadata(PATH_VARIABLE_METADATA_KEY, target, propertyKey) || {};
    existingParams[parameterIndex] = { name: name || `path${parameterIndex}` };
    Reflect.defineMetadata(PATH_VARIABLE_METADATA_KEY, existingParams, target, propertyKey);
  };
}

/**
 * Spring @RequestHeader equivalent
 */
export function RequestHeader(name: string) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    const existingParams = Reflect.getMetadata(REQUEST_HEADER_METADATA_KEY, target, propertyKey) || {};
    existingParams[parameterIndex] = { name };
    Reflect.defineMetadata(REQUEST_HEADER_METADATA_KEY, existingParams, target, propertyKey);
  };
}

