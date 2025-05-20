export interface AICharacterState {
  isCharacterOpen: boolean;
  hasInteractedBefore: boolean;
  username: string;
  userType: UserType;
  isChatting: boolean;
}

export type UserType = 'new' | 'experienced' | 'agency' | 'teamLead' | '';

export interface AICharacterContextType extends AICharacterState {
  openCharacter: () => void;
  closeCharacter: () => void;
  setHasInteractedBefore: (value: boolean) => void;
  setUserType: (type: UserType) => void;
  startChatting: () => void;
}
