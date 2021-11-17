[API](./README.md) > [Directives](./README.md#Directives)

# ChangeDirective

## Description

A directive that dispatches an interaction event when an input, textarea, or select element changes value.

## Selector

```
oculrChange
```

## Properties

| Property                     | Description                                                                                                                       |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `oculrChange: AnalyticEvent` | **optional** </br> [AnalyticEvent]() holds useful identifiers and data determined by the consuming application.                   |
| `sensitiveData: boolean`     | **optional** </br> Controls whether or not the directive captures the value of the input or select element. Defaulted to `false`. |

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
<input oculrChange type="checkbox" id="myCheckbox" formControlName="myCheckbox" />
<label for="myCheckbox">Do you agree?</label>
```

### Radio input

```html
<div>
  <input oculrChange type="radio" id="myRadioYes" value="yes" formControlName="myRadio" />
  <label for="myRadioYes">Yes</label>
</div>
<div>
  <input oculrChange type="radio" id="myRadioNo" value="no" formControlName="myRadio" />
  <label for="myRadioNo">No</label>
</div>
```

### Select

```html
<label for="mySelect">What is you favorite food?</label>
<select oculrChange id="mySelect" formControlName="mySelect">
  <option value=""></option>
  <option value="pizza">Pizza</option>
  <option value="tacos">Tacos</option>
  <option value="ramen">Ramen</option>
</select>
```

It is required to include an identifier with the interaction event to help with analysis later. By default the directive will use the host element's `id` attribute if no other identifier is provided.

Another way to include an identifier is by using property binding with the `oculrChange` directive.

```html
<input [oculrChange]="{ id: 'agreementCheckbox' }" type="checkbox" id="myCheckbox" formControlName="myCheckbox" />
<label for="myCheckbox">Do you agree?</label>
```

An `AnalyticEvent` type object is being used in this property binding, where `agreementCheckbox` will be used as the identifier since it takes priority over the host element's `id` attribute. It is recommended to still include an `id` attribute in this scenario as it is used for linking the label to the form control. There are other properties that can be set on the `AnalyticEvent` object, which you can read about more in the [AnalyticEvent]() documentation.

To minimize the amount of content done in the component's template, it is recommended to prepare any `AnalyticEvent` objects in the `ngOnInit()` of the component.

```typescript
import { AnalyticEvent } from 'oculr-ngx';

@Component({
  template: `
    <input [oculrChange]="myChangeEvent" type="checkbox" id="myCheckbox" formControlName="myCheckbox" />
    <label for="myCheckbox">Do you agree?</label>
  `,
})
export class MyComponent implements OnInit {
  myChangeEvent: AnalyticEvent;

  ngOnInit() {
    myChangeEvent = { id: 'agreementCheckbox' };
  }
}
```

## Deeper dive

### Sensitive data

Protecting user information is vital and the `oculrChange` directive has a `sensitiveData` input property that blocks the capture of data related to any answer provided by a user.

```html
<input oculrChange [sensitiveData]="true" type="checkbox" id="myCheckbox" formControlName="myCheckbox" />
<label for="myCheckbox">Do you agree?</label>
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
<label for="mySelect">What is your favorite food?</label>
<select oculrChange id="mySelect" formControlName="mySelect">
  <option value=""></option>
  <option value="pizza">Pizza</option>
  <option value="tacos">Tacos</option>
  <option value="ramen">Ramen</option>
</select>
```

For this select example the following data is captured with the `AnalyticEvent`. The `label` captured is the question being asked to the user.

| AnalyticEvent property | Value                         |
| ---------------------- | ----------------------------- |
| `label`                | "What is your favorite food?" |
| `value`                | "ramen"                       |
| `displayValue`         | "Ramen"                       |

```html
<p>What is your favorite food?</p>
<div>
  <input oculrChange type="radio" id="myRadioPizza" value="pizza" formControlName="myRadio" />
  <label for="myRadioPizza">Pizza</label>
</div>
<div>
  <input oculrChange type="radio" id="myRadioTacos" value="tacos" formControlName="myRadio" />
  <label for="myRadioTacos">Tacos</label>
</div>
<div>
  <input oculrChange type="radio" id="myRadioRamen" value="ramen" formControlName="myRadio" />
  <label for="myRadioRamen">Ramen</label>
</div>
```

For this radio input example the following data is captured. The `label` property is a repeat of the `displayValue` rather than the question being asked in the paragraph element. While the user may see the elements as related, there is nothing technically that links the paragraph element to the following input elements.

| AnalyticEvent property | Value   |
| ---------------------- | ------- |
| `label`                | "Ramen" |
| `value`                | "ramen" |
| `displayValue`         | "Ramen" |

To capture the question for the radio input example, it is recommended to prepare an `AnalyticEvent` object and set the `label` property to match what the user would see.

```typescript
import { AnalyticEvent } from 'oculr-ngx';

@Component({
  template: `
    <p>What is your favorite food?</p>
    <div>
      <input [oculrChange]="myChangeEvent" type="radio" id="myRadioPizza" value="pizza" formControlName="myRadio" />
      <label for="myRadioPizza">Pizza</label>
    </div>
    <!--...-->
  `,
})
export class MyComponent implements OnInit {
  myChangeEvent: AnalyticEvent;

  ngOnInit() {
    myChangeEvent = { label: 'What is your favorite food?' };
  }
}
```

## Feedback

Is something not working or unclear? Please create an [issue](https://github.com/Progressive/oculr-ngx/issues/new/choose) or [PR](https://github.com/Progressive/oculr-ngx/blob/main/CONTRIBUTING.md).
