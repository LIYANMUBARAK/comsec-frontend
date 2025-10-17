// models/invited-user.model.ts
export interface InvitedUser {
    _id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    is_Invited: boolean;
  }