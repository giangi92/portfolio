import type { DocumentName } from "../shared/content";

const API = `${import.meta.env.BASE_URL}api/index.php`;

export type Status = {
  configured: boolean;
  authenticated: boolean;
  csrf: string;
  minPasswordLength: number;
};

/** `code` + `params` come from the API and are translated in the UI; `message` is the English fallback. */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public params?: Record<string, unknown>
  ) {
    super(message);
  }
}

let csrfToken = "";
let onUnauthorized: () => void = () => {};
export const setUnauthorizedHandler = (fn: () => void) => {
  onUnauthorized = fn;
};

const call = async <T,>(action: string, init: RequestInit = {}): Promise<T> => {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.method === "POST") headers.set("X-CSRF-Token", csrfToken);
  const res = await fetch(`${API}?action=${encodeURIComponent(action)}`, {
    ...init,
    headers,
    credentials: "same-origin",
    cache: "no-store",
  });
  let body: any = {};
  try {
    body = await res.json();
  } catch {
    // non-JSON (e.g. PHP not running)
  }
  if (!res.ok) {
    if (res.status === 401 && action !== "login" && action !== "change-password") onUnauthorized();
    if (typeof body.error !== "string")
      throw new ApiError(`Error ${res.status}: API not reachable`, res.status, "unreachable");
    throw new ApiError(body.error, res.status, body.code, body.params);
  }
  if (typeof body.csrf === "string") csrfToken = body.csrf;
  return body as T;
};

const post = <T,>(action: string, data: unknown) =>
  call<T>(action, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const api = {
  status: () => call<Status>("status"),
  setup: (password: string) => post("setup", { password }),
  login: (password: string) => post("login", { password }),
  logout: () => post("logout", {}),
  changePassword: (currentPassword: string, newPassword: string) =>
    post("change-password", { currentPassword, newPassword }),
  /** `language` saves the translated version of a localizable document (omit for English). */
  save: <T,>(document: DocumentName, content: T, language?: string) =>
    post<{ content: T }>("save", { document, content, language }),
  deleteTranslation: (document: DocumentName, language: string) =>
    post("delete-translation", { document, language }),
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append("image", file);
    return call<{ content: unknown }>("upload-image", { method: "POST", body: form });
  },
};
