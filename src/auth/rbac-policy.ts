import { RolesBuilder } from 'nest-access-control';
import { Role } from './role.enum';

export const RBAC_POLICY: RolesBuilder = new RolesBuilder();

// prettier-ignore
RBAC_POLICY
  .grant(Role.User)
    //permissions given controllers
    .readOwn('employeeData')
  .grant(Role.Mod)
    .extend(Role.User)
    .read('managedEmployeeData')
    .read('employeeDetails')
  .grant(Role.Admin)
    .extend(Role.Mod)
    .read('employeeData')
    .update('employeeData')
    .delete('employeeData')
  .deny(Role.Admin)
    .read('managedEmployeeData')