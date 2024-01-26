import { IAuth } from "@/models/IAuth";

export interface ISignIn {
  name?: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  singNumber?: string;
  role?: string;
}

export interface IState {
  isLoading: boolean;
  userCreationError: any;
  isAuth: boolean;
  user: IAuth;
}
