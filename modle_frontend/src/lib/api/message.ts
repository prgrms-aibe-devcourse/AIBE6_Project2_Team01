import type {
  MessageConversation,
  MessageInbox,
  MessageItem,
  MessageParticipant,
  RecruitingJob,
} from "@/types/message";

interface MessagePage {
  currentUser: MessageParticipant;
  participants: MessageParticipant[];
  conversations: MessageConversation[];
  content: ApiMessage[];
  hasNext: boolean;
}

interface ApiMessage extends Omit<MessageItem, "isRead"> {
  read: boolean;
}

interface ApiResponse<T> {
  data: T;
}

function toMessageItem(message: ApiMessage): MessageItem {
  return { ...message, isRead: message.read };
}

export async function getInbox(): Promise<MessageInbox> {
  const messages: MessageItem[] = [];
  const participants = new Map<number, MessageParticipant>();
  const conversations = new Map<number, MessageConversation>();
  let currentUser: MessageParticipant | null = null;
  let page = 0;
  let hasNext = true;

  while (hasNext) {
    const response = await fetch(`/api/v1/messages?page=${page}&size=100`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("쪽지함을 불러오지 못했습니다.");

    const responsePage: MessagePage = await response.json();
    currentUser = responsePage.currentUser;
    responsePage.participants.forEach((participant) => participants.set(participant.id, participant));
    responsePage.conversations.forEach((conversation) => conversations.set(conversation.id, conversation));
    messages.push(...responsePage.content.map(toMessageItem));
    hasNext = responsePage.hasNext;
    page += 1;
  }

  if (!currentUser) throw new Error("로그인 사용자 정보를 확인하지 못했습니다.");
  return {
    currentUser,
    participants: [...participants.values()],
    conversations: [...conversations.values()],
    messages,
  };
}

export async function getMyRecruitingJobs(): Promise<RecruitingJob[]> {
  const response = await fetch("/api/v1/jobs/mine/recruiting", { credentials: "include" });
  if (!response.ok) throw new Error("모집 중 공고를 불러오지 못했습니다.");
  return ((await response.json()) as ApiResponse<RecruitingJob[]>).data;
}

export async function createConversation(
  receiverId: number,
  postId: number | null,
): Promise<MessageConversation> {
  const response = await fetch("/api/v1/messages/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ receiverId, postId, applicationId: null }),
  });
  if (!response.ok) throw new Error("대화방을 만들지 못했습니다.");
  return response.json();
}

export async function sendMessage(
  conversationId: number,
  content: string,
  parentMessageId: number | null,
): Promise<MessageItem> {
  const response = await fetch("/api/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ conversationId, parentMessageId, content }),
  });
  if (!response.ok) throw new Error("쪽지를 보내지 못했습니다.");
  return toMessageItem(await response.json());
}

export async function markConversationAsRead(conversationId: number): Promise<void> {
  const response = await fetch("/api/v1/messages/read", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ conversationId }),
  });
  if (!response.ok) throw new Error("쪽지를 읽음 처리하지 못했습니다.");
}
