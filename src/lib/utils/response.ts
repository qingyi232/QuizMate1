/**
 * Utility functions for creating standardized API responses
 */

export interface SuccessResponse<T = any> {
  success: true
  data: T
  message?: string
  timestamp: string
  metadata?: any
}

export interface ErrorResponse {
  success: false
  error: string
  message: string
  timestamp: string
  details?: any
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T, 
  message?: string | boolean,
  metadata?: any
): SuccessResponse<T> {
  return {
    success: true,
    data,
    message: typeof message === 'string' ? message : undefined,
    metadata,
    timestamp: new Date().toISOString()
  }
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: string,
  message: string,
  details?: any
): ErrorResponse {
  return {
    success: false,
    error,
    message,
    details,
    timestamp: new Date().toISOString()
  }
}