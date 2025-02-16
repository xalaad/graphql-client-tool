import { buildFormData } from "./formDataBuilder";
import { GraphQLClientOptions, GraphQLResponse } from "./types";

/**
 * GraphQL client for making queries and mutations
 * Supports both JSON and file uploads
 */
export class GraphQLClient {
  private endpoint: string;
  private defaultOptions: GraphQLClientOptions;

  constructor(endpoint: string, options: GraphQLClientOptions = {}) {
    this.endpoint = endpoint;
    this.defaultOptions = {
      headers: { "Content-Type": "application/json", ...options.headers },
      credentials: options.credentials || "include",
      fetchFn: options.fetchFn || globalThis.fetch.bind(globalThis),
      interceptors: options.interceptors || {},
    };
  }

  /**
   * Executes a GraphQL request
   */
  private async request<T>(
    operation: string,
    variables?: Record<string, any>,
    options?: RequestInit
  ): Promise<GraphQLResponse<T>> {
    try {
      const { body, headers } = this.prepareRequest(operation, variables);
      const response = await this.executeRequest<T>(body, headers, options);
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Prepares the request body and headers
   */
  private prepareRequest(operation: string, variables?: Record<string, any>) {
    const isFileUpload = Object.values(variables || {}).some(
      (val) => val instanceof File || val instanceof Blob
    );

    if (isFileUpload) {
      const { formData } = buildFormData(operation, variables || {});
      const headers = { ...this.defaultOptions.headers };
      delete headers["Content-Type"];
      return { body: formData, headers };
    }

    return {
      body: JSON.stringify({ query: operation, variables }),
      headers: this.defaultOptions.headers || [],
    };
  }

  /**
   * Executes the fetch request
   */
  private async executeRequest<T>(
    body: BodyInit,
    headers: HeadersInit,
    options?: RequestInit
  ) {
    let requestOptions: RequestInit = {
      method: "POST",
      headers,
      body,
      credentials: options?.credentials || this.defaultOptions.credentials,
      ...options,
    };

    if (this.defaultOptions.interceptors?.request) {
      requestOptions = this.defaultOptions.interceptors.request(requestOptions);
    }

    return (this.defaultOptions.fetchFn as typeof fetch)(
      this.endpoint,
      requestOptions
    );
  }

  /**
   * Handles successful response
   */
  private async handleResponse<T>(
    response: Response
  ): Promise<GraphQLResponse<T>> {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(JSON.stringify(result.errors));
    }

    return {
      data: this.defaultOptions.interceptors?.response
        ? this.defaultOptions.interceptors.response(result.data)
        : result.data,
      loading: false,
      error: null,
    };
  }

  /**
   * Handles request errors
   */
  private handleError(error: unknown): GraphQLResponse<never> {
    return {
      data: null,
      loading: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  /**
   * Executes a GraphQL query
   */
  public async query<T>(
    query: string,
    variables?: Record<string, any>,
    options?: RequestInit
  ): Promise<GraphQLResponse<T>> {
    return this.request<T>(query, variables, options);
  }

  /**
   * Executes a GraphQL mutation
   */
  public async mutation<T>(
    mutation: string,
    variables?: Record<string, any>,
    options?: RequestInit
  ): Promise<GraphQLResponse<T>> {
    return this.request<T>(mutation, variables, options);
  }

  /**
   * Executes a GraphQL query synchronously
   */
  public syncQuery<T>(
    query: string,
    variables?: Record<string, any>,
    options?: RequestInit
  ): GraphQLResponse<T> {
    const { body, headers } = this.prepareRequest(query, variables);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", this.endpoint, false); // false makes it synchronous

      // Add headers
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value as string);
      });

      // Set credentials if specified
      if (options?.credentials === "include") {
        xhr.withCredentials = true;
      }

      xhr.send(body);

      if (xhr.status !== 200) {
        throw new Error(`HTTP ${xhr.status}: ${xhr.statusText}`);
      }

      const result = JSON.parse(xhr.responseText);

      if (result.errors) {
        throw new Error(JSON.stringify(result.errors));
      }

      return {
        data: this.defaultOptions.interceptors?.response
          ? this.defaultOptions.interceptors.response(result.data)
          : result.data,
        loading: false,
        error: null,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Executes a GraphQL mutation synchronously
   */
  public syncMutation<T>(
    mutation: string,
    variables?: Record<string, any>,
    options?: RequestInit
  ): GraphQLResponse<T> {
    return this.syncQuery<T>(mutation, variables, options);
  }
}
