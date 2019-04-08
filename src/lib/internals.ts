import { Observable, Subject } from 'rxjs';

export function isSubscribableOrPromise(obj: any) {
  return obj instanceof Observable || obj instanceof Subject || obj instanceof Promise;
}

export function parseKeys(input: string | string[]): string[] {
  return (Array.isArray(input) ? input : input.split(/\s+/)).filter(key => key);
}
