/**
 * Configuration options for the GraphQL client
 */
interface GraphQLClientOptions {
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
interface GraphQLResponse<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

/**
 * GraphQL client for making queries and mutations
 * Supports both JSON and file uploads
 */
declare class GraphQLClient {
    private endpoint;
    private defaultOptions;
    constructor(endpoint: string, options?: GraphQLClientOptions);
    /**
     * Executes a GraphQL request
     */
    private request;
    /**
     * Prepares the request body and headers
     */
    private prepareRequest;
    /**
     * Executes the fetch request
     */
    private executeRequest;
    /**
     * Handles successful response
     */
    private handleResponse;
    /**
     * Handles request errors
     */
    private handleError;
    /**
     * Executes a GraphQL query
     */
    query<T>(query: string, variables?: Record<string, any>, options?: RequestInit): Promise<GraphQLResponse<T>>;
    /**
     * Executes a GraphQL mutation
     */
    mutation<T>(mutation: string, variables?: Record<string, any>, options?: RequestInit): Promise<GraphQLResponse<T>>;
    /**
     * Executes a GraphQL query synchronously
     */
    syncQuery<T>(query: string, variables?: Record<string, any>, options?: RequestInit): GraphQLResponse<T>;
    /**
     * Executes a GraphQL mutation synchronously
     */
    syncMutation<T>(mutation: string, variables?: Record<string, any>, options?: RequestInit): GraphQLResponse<T>;
}

export { GraphQLClient };
