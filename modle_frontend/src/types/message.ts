export type SenderType = "USER" | "SYSTEM";
export type UserRole = "MODEL" | "CLIENT" | "ADMIN";

export interface MessageParticipant {
  id: number;
  name: string;
  role: UserRole;
  profileImageUrl: string | null;
}

export interface MessageItem {
  id: number;
  senderId: number;
  receiverId: number;
  applicationId: number | null;
  postId: number | null;
  parentMessageId: number | null;
  content: string;
  senderType: SenderType;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface MessageThread {
  id: number;
  participantName: string;
  participantRole: string;
  preview: string;
  time: string;
  unreadCount: number;
  messages: MessageItem[];
}

export interface MessageInbox {
  currentUser: MessageParticipant;
  participants: MessageParticipant[];
  messages: MessageItem[];
}
