[API](./README.md) > [Directives](./README.md#Directives)

# ChangeDirective

## Description

A directive that dispatches an interaction event when an input, textarea, or select element changes value.

## Selector

```
oculrChange
```

## Properties

| Property                      | Description                                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `oculrChange: DirectiveEvent` | **optional** </br> [DirectiveEvent](./directive-event.md) holds useful identifiers and data determined by the consuming application. |
| `sensitiveData: boolean`      | **optional** </br> Controls whether or not the directive captures the value of the input or select element. Defaulted to `false`.    |

## Quick start

Add the directive `oculrChange` to any for the following host elements in an Angular component's template.

| Supported elements      |
| ----------------------- |
| `input type="checkbox"` |
| `input type="date"`     |
| `input type="number"`   |
| `input type="radio"`    |
| `input type="search"`   |
| `input type="text"`     |
| `select`                |
| `textarea`              |

### Checkbox input

```html
<input oculrChange type="checkbox" id="attestation" formControlName="attestation" />
<label for="attestation">Do you agree to the terms?</label>
```

### Radio input

```html
<p>What is your favorite mythical creature?</p>
<div>
  <input oculrChange type="radio" id="dragon" value="dragon" formControlName="mythical" />
  <label for="dragon">Dragon</label>
</div>
<div>
  <input oculrChange type="radio" id="unicorn" value="unicorn" formControlName="mythical" />
  <label for="unicorn">Unicorn</label>
</div>
<div>
  <input oculrChange type="radio" id="mermaid" value="mermaid" formControlName="mythical" />
  <label for="mermaid">Mermaid</label>
</div>
```

### Select

```html
<label for="favoriteFood">What is you favorite food?</label>
<select oculrChange id="favoriteFood" formControlName="favoriteFood">
  <option value=""></option>
  <option value="pizza">Pizza</option>
  <option value="tacos">Tacos</option>
  <option value="ramen">Ramen</option>
</select>
```

It is required to include an identifier with the interaction event to help with analysis later. By default the directive will use the host element's `id` attribute if no other identifier is provided.

Another way to include an identifier is by using property binding with the `oculrChange` directive.

```html
<input [oculrChange]="{ id: 'alternateAttestation' }" type="checkbox" id="attestation" formControlName="attestation" />
<label for="attestation">Do you agree to the terms?</label>
```

An `DirectiveEvent` type object is being used in this property binding, where `alternateAttestation` will be used as the identifier since it takes priority over the host element's `id` attribute. It is recommended to still include an `id` attribute in this scenario as it is used for linking the label to the form control. There are other properties that can be set on the `DirectiveEvent` object, which you can read about more in the [DirectiveEvent](./directive-event.md) documentation.

To minimize the amount of content done in the component's template, it is recommended to prepare any `DirectiveEvent` objects in the `ngOnInit()` of the component.

```typescript
import { DirectiveEvent } from 'oculr-ngx';

@Component({
  template: `
    <input [oculrChange]="attestationEvent" type="checkbox" id="attestation" formControlName="attestation" />
    <label for="attestation">Do you agree to the terms?</label>
  `,
})
export class FormComponent implements OnInit {
  attestationEvent: DirectiveEvent;

  ngOnInit() {
    attestationEvent = { id: 'alternateAttestation' };
  }
}
```

## Example output

The following data is an example of the output when using the `oculrChange` directive on select element.

```json
{
  "id": "favoriteFood",
  "interactionType": "change",
  "interactionDetail": "mouse",
  "element": "select",
  "label": "What is you favorite food?",
  "value": "ramen",
  "displayValue": "Ramen",
  "eventType": "CHANGE_EVENT",
  "location": {
    "hostName": "http://example-site.com",
    "path": "/menu",
    "url": "http://example-site.com/menu",
    "queryString": "",
    "virtualPageName": "/menu"
  }
}
```

## Deeper dive

### Sensitive data

Protecting user information is vital and the `oculrChange` directive has a `sensitiveData` input property that blocks the capture of data related to any answer provided by a user.

```html
<label for="dob">Date of birth:</label>
<input oculrChange [sensitiveData]="true" type="date" id="dob" formControlName="dob" />
```

The following table describes what is not captured when `sensitivedata` is set to `true`.

| Control type            | HTML data not captured                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| `input type="checkbox"` | The text content of the linked `label` element(s). </br> The `checked` attribute of the `input` element. |
| `input type="date"`     | The `value` attribute of the `input` element.                                                            |
| `input type="number"`   | The `value` attribute of the `input` element.                                                            |
| `input type="radio"`    | The text content of the linked `label` element(s). </br> The `value` attribute of the `input` element.   |
| `input type="search"`   | The `value` attribute of the `input` element.                                                            |
| `input type="text"`     | The `value` attribute of the `input` element.                                                            |
| `select`                | The text content of any `option` element. </br> The `value` attribute of any `option` element.           |
| `textarea`              | The `value` attribute of the `textarea` element.                                                         |

### Control differences

The `oculrChange` directive captures similar data for each control type. The exception for this is linked label elements. For select elements the label is the question being asked to the user, while for radio and checkbox inputs the label is often the answer to the question. The following examples show the differnces.

```html
<label for="favoriteFood">What is your favorite food?</label>
<select oculrChange id="favoriteFood" formControlName="favoriteFood">
  <option value=""></option>
  <option value="pizza">Pizza</option>
  <option value="tacos">Tacos</option>
  <option value="ramen">Ramen</option>
</select>
```

For this select example the following data is captured in the output. The `label` captured is the question being asked to the user.

| Output property | Value                         |
| --------------- | ----------------------------- |
| `id`            | "favoriteFood"                |
| `label`         | "What is your favorite food?" |
| `value`         | "ramen"                       |
| `displayValue`  | "Ramen"                       |

```html
<p>What is your favorite food?</p>
<div>
  <input oculrChange type="radio" id="pizzaRadio" value="pizza" formControlName="favoriteFood" />
  <label for="pizzaRadio">Pizza</label>
</div>
<div>
  <input oculrChange type="radio" id="tacosRadio" value="tacos" formControlName="favoriteFood" />
  <label for="tacosRadio">Tacos</label>
</div>
<div>
  <input oculrChange type="radio" id="ramenRadio" value="ramen" formControlName="favoriteFood" />
  <label for="ramenRadio">Ramen</label>
</div>
```

For this radio input example the following data is captured. The `label` property is a repeat of the `displayValue` rather than the question being asked in the paragraph element. While the user may see the elements as related, there is nothing technically that links the paragraph element to the following input elements.

Another difference with radio inputs is that they will prioritize the `formControlName` or `name` attributes on the host element when setting the `id` of the `DirectiveEvent`. This helps with the many radio inputs representing a single question situation that is common with this type of control.

| Output property | Value          |
| --------------- | -------------- |
| `id`            | "favoriteFood" |
| `label`         | "Ramen"        |
| `value`         | "ramen"        |
| `displayValue`  | "Ramen"        |

To capture the question for the radio input example, it is recommended to prepare an `DirectiveEvent` object and set the `label` property to match what the user would see.

```typescript
import { DirectiveEvent } from 'oculr-ngx';

@Component({
  template: `
    <p>What is your favorite food?</p>
    <div>
      <input
        [oculrChange]="favoriteFoodEvent"
        type="radio"
        id="pizzaRadio"
        value="pizza"
        formControlName="favoriteFood"
      />
      <label for="pizzaRadio">Pizza</label>
    </div>
    <!--...-->
  `,
})
export class FormComponent implements OnInit {
  favoriteFoodEvent: DirectiveEvent;

  ngOnInit() {
    favoriteFoodEvent = { label: 'What is your favorite food?' };
  }
}
```

## Feedback

Is something not working or unclear? Please create an [issue](https://github.com/Progressive/oculr-ngx/issues/new/choose) or [PR](https://github.com/Progressive/oculr-ngx/blob/main/CONTRIBUTING.md).
