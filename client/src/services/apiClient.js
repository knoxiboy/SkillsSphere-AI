const getApiBaseUrl = () => {
  const rawBaseUrl = import.meta.env.VITE_API_URL || "";
  return rawBaseUrl.trim().replace(/\/$/, "");
};

export class ApiError extends Error {
  constructor(message, status, data, errors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.errors = errors;
  }
}

const parseResponseBody = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : {};
};

/**
 * Normalizes API errors into a frontend-friendly shape
 */
export const normalizeApiError = (error) => {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      status: error.status,
      errors: error.errors || {},
    };
  }

  // Network or unexpected errors
  if (error.name === "TypeError" && error.message.includes("fetch")) {
    return {
      message: "Unable to connect. Please check your internet connection and try again.",
      status: 0,
      errors: {},
    };
  }

  return {
    message: error.message || "Something went wrong. Please try again.",
    status: error.status || 500,
    errors: {},
  };
};

export const apiRequest = async (
  path,
  { method = "GET", body, headers = {}, token } = {},
) => {
  const requestHeaders = {
    Accept: "application/json",
    ...headers,
  };

  const requestConfig = {
    method,
    headers: requestHeaders,
  };

  if (body !== undefined) {
    if (body instanceof FormData) {
      requestConfig.body = body;
    } else {
      requestHeaders["Content-Type"] = "application/json";
      requestConfig.body = JSON.stringify(body);
    }
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, requestConfig);
  const data = await parseResponseBody(response);

  if (!response.ok || data?.success === false) {
    const message = data?.message || "Something went wrong. Please try again.";
    const errors = data?.errors || data?.details || {};
    throw new ApiError(message, response.status, data, errors);
  }

  return data;
};
