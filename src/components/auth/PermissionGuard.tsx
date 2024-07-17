import { useTypedSelector } from '@/hooks/useTypedSelector';
import { rolePermissions } from '@/services/utilites';
import React from 'react';

export enum Permission {
  USER_ACTIONS = 'USER_ACTIONS',
  WO_ACTIONS = 'WO_ACTIONS',
  WP_ACTIONS = 'WP_ACTIONS',
  PROJECT_TASK_ACTIONS = 'PROJECT_TASK_ACTIONS',
  EDIT_PROJECT_TASK = 'EDIT_PROJECT_TASK',
  REOPEN_TASK = 'REOPEN_TASK',
  ADD_NRC = 'ADD_NRC',
  REQUIREMENT_ACTIONS = 'REQUIREMENT_ACTIONS',
  DELETE_REQUIREMENT = 'DELETE_REQUIREMENT',
  ORDER_ACTIONS = 'ORDER_ACTIONS',
  DELETE_ORDER = 'DELETE_ORDER',
  ORDER_VIEWER = 'ORDER_VIEWER',
  PICKSLIP_ACTIONS = 'PICKSLIP_ACTIONS',
  PICKSLIP_CONFIRMATION_ACTIONS = 'PICKSLIP_CONFIRMATION_ACTIONS',
  DELETE_PICKSLIP = 'DELETE_PICKSLIP',
  PART_NUMBER_EDIT = 'PART_NUMBER_EDIT',
  DELETE_PART_NUMBER = 'DELETE_PART_NUMBER',
  ADD_ALTERNATIVE = 'ADD_ALTERNATIVE',
  DELETE_ALTERNATIVE = 'DELETE_ALTERNATIVE',
  PART_TRANSFER_ACTIONS = 'PART_TRANSFER_ACTIONS',
  PART_EDIT_ACTIONS = 'PART_EDIT_ACTIONS',
  TASK_ACTIONS = 'TASK_ACTIONS',
  PRINT_REPORT_TABLE = 'PRINT_REPORT_TABLE',
  PRINT_REPORT_WP = 'PRINT_REPORT_WP',
  PRINT_REPORT_MATERIAL = 'PRINT_REPORT_MATERIAL',
  PRINT_REPORT_EXPIRY = 'PRINT_REPORT_EXPIRY',
  COPY_ROWS = 'COPY_ROWS',
  EXPORT = 'EXPORT',
  PERMISSIONS_ACTIONS = 'PERMISSIONS_ACTIONS',
  VENDORS_ACTIONS = 'VENDORS_ACTIONS',
  AC_ACTIONS = 'AC_ACTIONS',
  SKILL_ACTIONS = 'SKILL_ACTIONS',
  COMPANY_ACTIONS = 'COMPANY_ACTIONS',
  STORE_ACTIONS = 'STORE_ACTIONS',
  STORE_DELETE_ACTIONS = 'STORE_DELETE_ACTIONS',
  ADD_ACCESS = 'ADD_ACCESS',
  CLOSE_ACCESS = 'CLOSE_ACCESS',
  OPEN_ACCESS = 'OPEN_ACCESS',
  INSPECT_ACCESS = 'INSPECT_ACCESS',
  ADD_ACTION = 'ADD_ACTION',
  DELETE_ACTION = 'DELETE_ACTION',
  EDIT_ACTION = 'EDIT_ACTION',
  ADD_STEP = 'ADD_STEP',
  DELETE_STEP = 'DELETE_STEP',
  EDIT_STEP = 'EDIT_STEP',
}

type Role =
  | 'admin'
  | 'mech'
  | 'engeneer'
  | 'planing'
  | 'logistic'
  | 'storeman'
  | 'director';

interface PermissionGuardProps {
  requiredPermissions: Permission[];
  children: React.ReactElement;
}

const stringToPermissionsArray = (
  permissionsString: string | undefined | null
): Permission[] => {
  if (typeof permissionsString !== 'string') {
    return [];
  }
  return permissionsString
    .split(',')
    .map((permission) => permission.trim() as Permission);
};

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  requiredPermissions,
  children,
}) => {
  const { user } = useTypedSelector((state) => state.auth);

  if (!user || !user.role) {
    return React.cloneElement(children, { disabled: true });
  }

  const roleBasedPermissions = rolePermissions[user.role as Role] || [];
  const userSpecificPermissions = stringToPermissionsArray(user.permissions);
  const combinedPermissions = [
    ...roleBasedPermissions,
    ...userSpecificPermissions,
  ];

  console.log('combinedPermissions', combinedPermissions);

  const hasPermission = requiredPermissions.every((permission) =>
    combinedPermissions.includes(permission)
  );

  // Объединение условий disabled
  const childDisabled = children.props.disabled;
  const combinedDisabled = !hasPermission || childDisabled;

  return React.cloneElement(children, { disabled: combinedDisabled });
};

export default PermissionGuard;
