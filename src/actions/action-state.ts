// Plain (non "use server") module for the shared server-action state shape.
// Files with the "use server" directive may only export async functions, so
// this constant/type must live outside any "use server" file.

export type ActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  devResetLink?: string;
  id?: string;
};

export const initialActionState: ActionState = { success: false };
