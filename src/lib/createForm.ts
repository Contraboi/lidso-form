import { createStore, reconcile } from "solid-js/store";

type LidsoFormElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

type FieldType = string | number | boolean;
type Validators<T> = Partial<Record<keyof T, FieldType>>;
type Errors<T> = Partial<Record<keyof T, string>>;
type Refs<T> = Partial<Record<keyof T, LidsoFormElement>>;
type CreateFormOptions<T> = {
  onSubmit: (values: T) => Promise<void> | void;
  initialValues?: T;
};
type FormState<T> = {
  isDirty: boolean;
  dirtyFields: Array<keyof T>;
  touchedFields: Array<keyof T>;
  submitCount: number;
  isValid: boolean;
  isLoading: boolean;
  errors: Errors<T>;
};

// TODO: Update docs

/**
 * ## Creates a form with validation and submission handling.
 *
 * ### Example
 * ```tsx
 * type LoginForm = {
 *   username: string;
 *   password: string;
 * };
 *
 * const { fields, register, submitForm, errors, isLoading } = createForm({
 *   onSubmit: (values) => {
 *     // do something with values
 *   },
 * });
 *
 * return (
 *   <form onsubmit={submitForm}>
 *     <input
 *       {...register("username", [!fields.username && "Username is required"])}
 *     />
 *     {errors.username && <label>{errors.username}</label>}
 *     <input
 *       {...register("password", [!fields.password && "Password is required"])}
 *     />
 *     {errors.password && <label>{errors.password}</label>}
 *     <button disabled={isLoading()} />
 *   </form>
 * );
 */

type PartialOrType<T, K> = T extends undefined
  ? Partial<K>
  : T extends K
  ? K
  : Partial<K>;

export const createForm = <Values extends object>(
  options: CreateFormOptions<Values>
) => {
  type Key = keyof Values;

  let refs: Refs<Values> = {};
  let _validators: Validators<Values> = {};

  const [fields, setFields] = createStore<Values | Partial<Values>>(
    options.initialValues ?? {}
  );

  const [formState, setFormState] = createStore<FormState<Values>>({
    isDirty: false,
    dirtyFields: [],
    touchedFields: [],
    submitCount: 0,
    isLoading: false,
    isValid: false,
    errors: {},
  });

  const _setAdequateValue = (key: Key, ref: Refs<Values>[Key]) => {
    setFormState("isDirty", true);

    setFormState("touchedFields", (prev) => {
      if (!prev.includes(key)) prev.push(key);
      return prev;
    });

    if (ref?.type === "number") {
      // @ts-ignore
      setFields(key, parseInt(ref.value));
    } else if (ref?.type === "checkbox") {
      // @ts-ignore
      setFields(key, (ref as HTMLInputElement).checked);
    } else {
      // @ts-ignore
      setFields(key, ref!.value);
    }
  };

  const _setInitialValues = (ref: LidsoFormElement, key: Key) => {
    if (options.initialValues) {
      if (ref?.type === "number") {
        ref.value = String(options.initialValues[key]);
      } else if (ref?.type === "checkbox") {
        (ref as HTMLInputElement).checked = Boolean(options.initialValues[key]);
      } else {
        ref.value = String(options.initialValues[key]);
      }
    }
  };

  const _validate = (shouldFocus: boolean) => {
    const errors: Errors<Values> = {};
    let firstErrorKey: Key | undefined;

    for (const key in _validators) {
      const validator = _validators[key];

      if (typeof validator === "string") {
        if (!firstErrorKey) firstErrorKey = key;
        errors[key] = validator;

        if (shouldFocus) refs[firstErrorKey]?.focus();
      }
    }

    if (formState.submitCount > 0) setFormState("errors", reconcile(errors));

    const isFormValid = Object.keys(errors).length === 0;
    setFormState("isValid", isFormValid);
    return isFormValid;
  };

  const register = (key: Key, validators?: Array<boolean | string>) => ({
    ref: (ref: LidsoFormElement) => {
      const instance = (refs[key] = ref);

      _setInitialValues(instance, key);

      if (validators) {
        for (const validator of validators) {
          _validators[key] = validator;
        }
      }

      instance.addEventListener("input", () => {
        _setAdequateValue(key, instance);
        _validate(false);
      });
    },
    name: key,
  });

  const submitForm = async (e: Event) => {
    e.preventDefault();
    setFormState("submitCount", (prev) => prev + 1);

    if (_validate(true)) {
      setFormState("isLoading", true);
      try {
        await options.onSubmit(fields as Values);
      } catch (error: any) {
        console.error(error);
      } finally {
        setFormState("isLoading", false);
      }
    }
  };

  return {
    fields,
    setFields,
    submitForm,
    register,
    formState,
  };
};
