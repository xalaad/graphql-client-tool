/**
 * Configuration options for the GraphQL client
 */
export interface GraphQLClientOptions {
    headers?: Record<string, string>;
    credentials?: RequestCredentials;
    fetchFn?: typeof fetch;
    interceptors?: {
      request?: (options: RequestInit) => RequestInit;
      response?: <T>(response: T) => T;
    };
  }
  
  /**
   * GraphQL response structure
   */
  export interface GraphQLResponse<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
  }
  
  /**
   * File upload map structure for multipart requests
   */
  export interface FileMap {
    [key: string]: string[];
  }
  
  /**
   * Upload variables structure
   */
  export interface UploadVariables {
    [key: string]: File | Blob;
  }