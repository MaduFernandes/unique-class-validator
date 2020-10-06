import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

import { getRepository, Not } from "typeorm";

export interface IIsUnique {
  // eslint-disable-next-line @typescript-eslint/ban-types
  entity: Function;

  id?: number;
}

export function IsUnique(
  params: IIsUnique,
  validationOptions?: ValidationOptions
) {
  return function (object: Record<string, any>, propertyName: string) {
    object[`class_entity_${propertyName}`] = params.entity;
    object["id"] = params.id;
    registerDecorator({
      name: "isUnique",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: UniqueContraint,
    });
  };
}

@ValidatorConstraint({ async: true })
export class UniqueContraint implements ValidatorConstraintInterface {
  async validate(value: any, args: ValidationArguments) {
    const entity = args.object[`class_entity_${args.property}`];
    const req_id = args.object["id"] || -1;

    return !(await getRepository(entity).count({
      [args.property]: value,
      id: Not(req_id),
    }));
  }
}
