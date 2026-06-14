import type { MessageInbox, MessageItem, MessageParticipant } from "@/types/message";

interface MessagePage {
  currentUser: MessageParticipant;
  participants: MessageParticipant[];
  content: ApiMessage[];
  hasNext: boolean;
}

interface ApiMessage {
  id: number;
  senderId: number;
  receiverId: number;
  applicationId: number | null;
  postId: number | null;
  parentMessageId: number | null;
  content: string;
  senderType: "USER" | "SYSTEM";
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

function toMessageItem(message: ApiMessage): MessageItem {
  return {
    ...message,
    isRead: message.read,
  };
}

export async function getInbox(): Promise<MessageInbox> {
  const messages: MessageItem[] = [];
  const participants = new Map<number, MessageParticipant>();
  let currentUser: MessageParticipant | null = null;
  let page = 0;
  let hasNext = true;

  while (hasNext) {
    const response = await fetch(`/api/v1/messages?page=${page}&size=100`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("쪽지함을 불러오지 못했습니다.");
    }

    const responsePage: MessagePage = await response.json();
    currentUser = responsePage.currentUser;
    responsePage.participants.forEach((participant) =>
      participants.set(participant.id, participant),
    );
    messages.push(...responsePage.content.map(toMessageItem));
    hasNext = responsePage.hasNext;
    page += 1;
  }

  if (!currentUser) {
    throw new Error("로그인 사용자 정보를 확인하지 못했습니다.");
  }

  return {
    currentUser,
    participants: [...participants.values()],
    messages,
  };
}

export async function sendMessage(
  receiverId: number,
  content: string,
  applicationId: number | null,
  postId: number | null,
  parentMessageId: number | null,
): Promise<MessageItem> {
  const response = await fetch("/api/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      receiverId,
      applicationId,
      postId,
      parentMessageId,
      content,
    }),
  });

  if (!response.ok) {
    throw new Error("쪽지를 보내지 못했습니다.");
  }

  return toMessageItem(await response.json());
}

export async function markConversationAsRead(
  participantId: number,
  applicationId: number | null,
  postId: number | null,
): Promise<void> {
  const response = await fetch("/api/v1/messages/read", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      participantId,
      applicationId,
      postId,
    }),
  });

  if (!response.ok) {
    throw new Error("쪽지를 읽음 처리하지 못했습니다.");
  }
}
