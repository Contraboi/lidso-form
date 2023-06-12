import { createSignal } from "solid-js";
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
export const createForm = <Values extends object>(
  options: CreateFormOptions<Values>
) => {
  type Key = keyof Values;

  let refs: Refs<Values> = {};
  let _validators: Validators<Values> = {};

  const [isLoading, setIsLoading] = createSignal(false);
  const [errors, setErrors] = createStore<Errors<Values>>();
  const [fields, setFields] = createStore<Values>(
    options?.initialValues ? options.initialValues : ({} as Values)
  );

  const _setAdequateValue = (ref: Refs<Values>[Key]) => {
    const key = ref!.name as any;
    if (!key) return;

    if (ref?.type === "number") {
      setFields(key, parseInt(ref.value));
    } else if (ref?.type === "checkbox") {
      setFields(key, (ref as HTMLInputElement).checked);
    } else {
      setFields(key, ref!.value);
    }
  };

  const _validate = () => {
    const errors: Errors<Values> = {};
    let firstErrorKey: Key | undefined;
    for (const key in _validators) {
      const validator = _validators[key];

      if (typeof validator === "string") {
        if (!firstErrorKey) firstErrorKey = key;
        errors[key] = validator;
        refs[firstErrorKey]?.focus();
      }
    }

    setErrors(reconcile(errors));
    return Object.keys(errors).length === 0;
  };

  const register = (key: Key, validators?: Array<boolean | string>) => ({
    ref: (ref: HTMLInputElement | HTMLTextAreaElement) => {
      const instance = (refs[key] = ref);
      if (validators) {
        for (const validator of validators) {
          _validators[key] = validator;
        }
      }

      instance.oninput = () => _setAdequateValue(instance);
      instance.onblur = () => !errors[key] && _validate();
    },
    name: key,
  });

  const submitForm = async (e: Event) => {
    e.preventDefault();

    if (_validate()) {
      setIsLoading(true);
      try {
        await options.onSubmit(fields as Values);
      } catch (error: any) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    fields,
    setFields,
    isLoading,
    submitForm,
    register,
    errors,
  };
};
