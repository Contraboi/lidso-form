import { createSignal } from "solid-js";
import { createStore, reconcile } from "solid-js/store";

type LidsoFormElement = HTMLInputElement | HTMLTextAreaElement;

type Validators<T> = Partial<Record<keyof T, string | boolean>>;
type Fields<T> = Partial<Record<keyof T, string>>;
type Errors<T> = Partial<Record<keyof T, string>>;
type Refs<T> = Partial<Record<keyof T, LidsoFormElement>>;

export const createForm = <Values>(options: {
  onSubmit: (values: Values) => Promise<void>;
  initialValues?: Partial<Record<keyof Values, string>>;
}) => {
  type Key = keyof Values;

  let refs: Refs<Values> = {};
  let _validators: Validators<Values> = {};

  const [isLoading, setIsLoading] = createSignal(false);
  const [errors, setErrors] = createStore<Errors<Values>>();
  const [fields, setFields] = createStore<Fields<Values>>(
    options?.initialValues ?? {}
  );

  const register = (key: Key, validators?: Array<boolean | string>) => ({
    ref: (ref: HTMLInputElement | HTMLTextAreaElement) => {
      const instance = (refs[key] = ref);
      if (validators) {
        for (const validator of validators) {
          _validators[key] = validator;
        }
      }
      instance.oninput = () => setFields(key, instance.value);
    },
    name: key,
  });

  const validate = () => {
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

  const submit = async (e: Event) => {
    e.preventDefault();

    if (validate()) {
      setIsLoading(true);
      try {
        await options.onSubmit(fields as Values);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    fields,
    setFields,
    isLoading,
    submit,
    register,
    errors,
  };
};
