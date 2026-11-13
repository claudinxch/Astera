import { atomWithStorage, createJSONStorage } from "jotai/utils";
import Cookies from "js-cookie";

const COOKIE_MAX_AGE_DAYS = 7;
const COOKIE_PREFIX = "astera_";

const cookieStorage = <T>() =>
  createJSONStorage<T>(() =>
    typeof window !== "undefined"
      ? {
          getItem: (key) => Cookies.get(`${COOKIE_PREFIX}${key}`) ?? null,
          setItem: (key, value) =>
            Cookies.set(`${COOKIE_PREFIX}${key}`, value, {
              sameSite: "strict",
              "max-age": COOKIE_MAX_AGE_DAYS.toString(),
            }),
          removeItem: (key) => Cookies.remove(`${COOKIE_PREFIX}${key}`),
          subscribe: (key, callback) => {
            function handler(event: CookieChangeEvent) {
              const cookie = event.changed.find(
                (c) => c.name === `${COOKIE_PREFIX}${key}`,
              );

              if (cookie?.value) {
                callback(cookie.value);
              }
            }

            cookieStore.addEventListener(
              "cookiechange",
              handler as EventListener,
            );
            return () =>
              cookieStore.removeEventListener(
                "cookiechange",
                handler as EventListener,
              );
          },
        }
      : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        },
  );

export function atomWithCookie<T>(key: string, initialValue: T) {
  const defaultValue =
    typeof window !== "undefined"
      ? Cookies.get(`${COOKIE_PREFIX}${key}`)
      : undefined;

  if (!defaultValue && initialValue && typeof window !== "undefined") {
    Cookies.set(`${COOKIE_PREFIX}${key}`, JSON.stringify(initialValue));
  }

  return atomWithStorage<T>(
    key,
    (defaultValue ? JSON.parse(defaultValue) : initialValue) as T,
    cookieStorage(),
    { getOnInit: true },
  );
}
