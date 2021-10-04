// TODO - Rename file to analytics-action.type.ts and export to AnalyticsActionType
export enum AnalyticsAction {
  /**
   * When an API request has started
   * @deprecated use API_START_EVENT for Analytics 2.0
   */
  API_STARTED = '@pgr/analytics/API_STARTED',

  /**
   * When an API request has been successful
   * @deprecated use API_SUCCESS_EVENT for Analytics 2.0
   */
  API_SUCCEEDED = '@pgr/analytics/API_SUCCEEDED',

  /**
   * When an API request returns an error http status code, but the application can recover
   * @deprecated removed with Analytics 2.0
   */
  API_HANDLED_ERROR = '@pgr/analytics/API_HANDLED_ERROR',

  /**
   * When an API request returns an error http status code
   * @deprecated use API_FAILURE_EVENT for Analytics 2.0
   */
  API_UNHANDLED_ERROR = '@pgr/analytics/API_UNHANDLED_ERROR',

  /**
   * When an API request has completed - regardless of success or error
   * @deprecated use API_COMPLETE_EVENT for Analytics 2.0
   */
  API_COMPLETED = '@pgr/analytics/API_COMPLETED',

  /**
   * On a router location change
   * @deprecated use PAGE_VIEW_EVENT for Analytics 2.0
   */
  UPDATE_LOCATION = '@pgr/analytics/UPDATE_LOCATION',

  /**
   * On an error in logging in one of the destinations
   * @deprecated unused action
   */
  LOGGED_ERROR = '@pgr/analytics/LOGGED_ERROR',

  /**
   * [Analytics 1.0/2.0] When the analytics module is initialized.
   * Used by some destinations to log extra data.
   */
  INIT = '@pgr/analytics/INIT',

  /**
   * [Analytics 1.0/2.0] When the user interacts with the application
   */
  INTERACTION_EVENT = '@pgr/analytics/INTERACTION_EVENT',

  /**
   * [Analytics 2.0] Used to initialize the gtm dataLayer
   */
  APP_INIT = '@pgr/analytics/APP_INIT',

  /**
   * [Analytics 2.0] When the application encounters an error
   */
  APP_ERROR = '@pgr/analytics/APP_ERROR',

  /**
   * [Analytics 2.0] When conditional elements are displayed
   */
  DISPLAY_EVENT = '@pgr/analytics/DISPLAY_EVENT',

  /**
   * [Analytics 2.0] When tracking a system event (such as redirect from mobile)
   */
  SYSTEM_EVENT = '@pgr/analytics/SYSTEM_EVENT',

  /**
   * When there's an error in the analytics module
   * @deprecated use ANALYTICS_ERROR
   */
  TRACK_ERROR = '@pgr/analytics/TRACK_ERROR',

  /**
   * [Analytics 2.0] When a validation error occurs
   */
  VALIDATION_ERROR_EVENT = '@pgr/analytics/VALIDATION_ERROR_EVENT',

  /**
   * Used to set some information in the store based on access token
   * @deprecated unused action
   */
  SET_DECODED_TOKEN_VALUE = '@pgr/analytics/SET_DECODED_TOKEN_VALUE',

  /**
   * Used to set the type of access a user has in the store
   * @deprecated unused action
   */
  SET_ACCESS_TYPE = '@pgr/analytics/SET_ACCESS_TYPE',

  /**
   * When an error was successfully logged
   * @deprecated unused action
   */
  LOG_ERROR_SUCCESS = '@pgr/analytics/LOG_ERROR_SUCCESS',

  /**
   * When an error was not successfully logged
   * @deprecated unused action
   */
  LOG_ERROR_FAILURE = '@pgr/analytics/LOG_ERROR_FAILURE',

  /**
   * [Analytics 1.0/2.0] When there's an error in the analytics module
   */
  ANALYTICS_ERROR = '@pgr/analytics/ANALYTICS_ERROR',

  /**
   * [Analytics 2.0] When Angular route changed or modal is displayed
   */
  PAGE_VIEW_EVENT = '@pgr/analytics/PAGE_VIEW_EVENT',

  /**
   * [Analytics 2.0] When an API request has started
   */
  API_START_EVENT = '@pgr/analytics/API_START_EVENT',

  /**
   * [Analytics 2.0] When an API request has been successful
   */
  API_SUCCESS_EVENT = '@pgr/analytics/API_SUCCESS_EVENT',

  /**
   * [Analytics 2.0] When an API request has completed - regardless of success or error
   */
  API_COMPLETE_EVENT = '@pgr/analytics/API_COMPLETE_EVENT',

  /**
   * [Analytics 2.0] When an API request returns an error http status code
   */
  API_FAILURE_EVENT = '@pgr/analytics/API_FAILURE_EVENT',

  /**
   * When the user initiates an event
   * @deprecated unused action
   */
  USER_EVENT = '@pgr/analytics/actions/USER_EVENT'
}
