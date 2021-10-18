# Functionality no longer supported

The [Analytics Library](https://tfsprod/tfs/PROGAPPS/PS/_git/PS_S2_analytics) that this project was based off of had some functionality that was determined to be too client-specific to be included in a generic library such as this one. Below is a list of the functionality that is no longer supported. Existing clients will need to mitigate these changes with their own solutions.

## Utility Functions

### formatFormErrors

The logic in this function formats Angular form errors in a format specific to their existing clients. It has no discernable value to the rest of the library's feature set.

> ### Recommended refactor
>
> Implement the `formatFormErrors` [function](https://github.com/Progressive/monocle-ngx/blob/cf828395364367fd2ffee6f4babd9f2c761e1bb4/projects/monocle-ngx/src/lib/utils/format-form-errors.ts) within your own client and replace any calls.

### getCheckboxState

This function returns a string based on the state of a checkbox control. This type of functionality is best left up to a client-specific implementation.

> ### Recommended refactor
>
> Implement the `getCheckboxState` [function](https://github.com/Progressive/monocle-ngx/blob/7eb948cefbbc2f9bdd65c199cb07d975a882d992/projects/monocle-ngx/src/lib/utils/get-checkbox-state.ts) within your own client and replace any calls.

### getInputLabel

This function is far too specialized to provide value to multiple clients. It's best left up to a client-specific implementation.

> ### Recommended refactor
>
> Implement the `getInputLabel` [function](https://github.com/Progressive/monocle-ngx/blob/7eb948cefbbc2f9bdd65c199cb07d975a882d992/projects/monocle-ngx/src/lib/utils/get-input-label.ts) within your own client and replace any calls.

### remoteHtmlEntities

The logic for this function has been absorbed by the library as a part of the `htmlToText` method on the `FormattingService`. It was only used as a part of that flow so internalizing it reduces the complexity a consuming client needs to deal with.

> ### Recommended refactor
>
> Replace any calls to `removeHtmlEntities` by taking its input parameter and instead pass it directly to `htmlToText`.
