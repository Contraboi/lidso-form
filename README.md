# lidso-form

lidso-form is a library for managing forms in SolidJS, inspired by react-hook-form. 
It is a wrapper around the native HTML form element, which provides a simple API to manage form state and validation.

+ Built with performance, UX and DX in mind
+ Embraces native HTML form validation
+ Out of the box integration with UI libraries
+ Small size and no dependencies
+ TypeSafety

## Installation

```bash
npm install lidso-form
```

```bash
pnpm install lidso-form
```

```bash
yarn add lidso-form
```

## Quick start

```tsx
type LoginForm = {
    username: string;
    password: string;
};

const { fields, register, submitForm, formState: {errors, isLoading} } = createForm({
    onSubmit: (values) => {
        // do something with values
    },
});

return (
    <form onsubmit={submitForm}>
        <input
            {...register("username", [!fields.username && "Username is required"])}
        />
        {errors.username && <label>{errors.username}</label>}
        <input
            {...register("password", [!fields.password && "Password is required"])}
        />
        {errors.password && <label>{errors.password}</label>}
        <button disabled={isLoading} />
    </form>
);
```

## API

### `createForm`

The createForm function is a generic function that takes an options object where T represents the type of values that will be submitted through the form.

It has two properties:

+ **onSubmit**: This property is a function that takes a parameter values of type T, which represents the values submitted through the form.
+ **initialValues (optional)**:  Represents the initial values of the form fields. It allows specifying default values for the form fields. The keys of this object correspond to the keys of T, and the values can be string, number or boolean(depends on input type).

### `register`
This method allows you to register an input or select element and apply validation rules to form. Validation rules are all based on booleans, and return a string if the validation fails.
By invoking the register function and supplying an input's name, next things will happen:
+ oninput event will be registered to the input element which will trigger form state update & validation
+ name of the input element will be registered to the form state

### `formState`
This property is an object that contains all the state of the form. It has the following properties:
+ **isValid**: This property is a boolean value that indicates whether the form is valid.
+ **errors**: This property is an object that contains all the errors of the form. The keys of this object correspond to the keys of T, and the values are strings that represent the error message.
+ **isValid**: This property is a boolean value that indicates whether the form is valid.
+ **touchedFields**: This property is an object that contains all the touched fields of the form. The keys of this object correspond to the keys of T, and the values are boolean values that indicate whether the field has been touched.
+ **submitCount**: This property is a number that indicates how many times the form has been submitted.
+ **isLoading**: This property is a boolean value that indicates whether the form is in the process of submitting.

### `submitForm`
This method allows you to submit the form. It will trigger validation for all fields and if all fields are valid, it will invoke the onSubmit function passed to the registered to form.

### `fields`
This property is an object that contains all the fields of the form. The keys of this object correspond to the keys of T.

### `setFields`
This is SolidJS Store that allows you to set the fields of the form. It takes an object where the keys correspond to the keys of T, and the values can be string, number or boolean(depends on input type).


