import { registerDecorator, ValidationOptions } from 'class-validator';

export type DiscountRule = `> ${number}` | `< ${number}`;

export function IsDiscountRule(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isDiscountRules',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: string) {
          if (typeof value == 'string') return /^\s*[><] \s*\d+$/.test(value);

          return false;
        },
        defaultMessage() {
          return 'A regra deve estar no formato "> N" ou "< N"';
        },
      },
    });
  };
}
