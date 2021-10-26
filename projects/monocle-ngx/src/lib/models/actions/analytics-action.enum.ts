// TODO: remove all name spacing
export enum AnalyticsAction {
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
   * [Analytics 2.0] When tracking a system event (such as redirect from mobile)
   */
  SYSTEM_EVENT = '@pgr/analytics/SYSTEM_EVENT',

  /**
   * [Analytics 2.0] When a validation error occurs
   */
  VALIDATION_ERROR_EVENT = '@pgr/analytics/VALIDATION_ERROR_EVENT',

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
}
