export type SenderType = "USER" | "SYSTEM";
export type UserRole = "MODEL" | "CLIENT" | "ADMIN";

export interface MessageParticipant {
  id: number;
  name: string;
  role: UserRole;
  profileImageUrl: string | null;
}

export interface MessageConversation {
  id: number;
  clientId: number;
  modelId: number;
  postId: number | null;
  applicationId: number | null;
  createdAt: string;
}

export interface MessageItem {
  id: number;
  conversationId: number;
  senderId: number;
  receiverId: number;
  parentMessageId: number | null;
  content: string;
  senderType: SenderType;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface MessageThread {
  id: string;
  conversationId: number | null;
  participantId: number;
  postId: number | null;
  applicationId: number | null;
  participantName: string;
  participantRole: string;
  participantProfileImageUrl: string | null;
  preview: string;
  time: string;
  unreadCount: number;
  messages: MessageItem[];
}

export interface MessageInbox {
  currentUser: MessageParticipant;
  participants: MessageParticipant[];
  conversations: MessageConversation[];
  messages: MessageItem[];
}

export interface RecruitingJob {
  id: number;
  title: string;
  region: string;
  shootDate: string | null;
}
