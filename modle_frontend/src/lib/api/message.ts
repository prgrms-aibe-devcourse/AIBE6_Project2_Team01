import type {
  MessageConversation,
  MessageInbox,
  MessageItem,
  RecruitingJob,
  ConversationMessages,
} from "@/types/message";
import { authenticatedFetch } from "@/lib/api/client";

interface ApiMessage extends Omit<MessageItem, "isRead"> {
  read: boolean;
}

interface MessageInboxApiResponse {
  currentUser: MessageInbox["currentUser"];
  conversations: Array<Omit<MessageConversation, "latestMessage"> & {
    latestMessage: ApiMessage | null;
  }>;
}

interface ConversationMessagesApiResponse {
  content: ApiMessage[];
  totalElements: number;
  hasNext: boolean;
}

interface ApiResponse<T> {
  data: T;
}

function toMessageItem(message: ApiMessage): MessageItem {
  return { ...message, isRead: message.read };
}

export async function getInbox(): Promise<MessageInbox> {
  const response = await authenticatedFetch("/api/v1/messages/conversations");
  if (!response.ok) throw new Error("쪽지함을 불러오지 못했습니다.");
  const inbox = ((await response.json()) as ApiResponse<MessageInboxApiResponse>).data;
  return {
    currentUser: inbox.currentUser,
    conversations: inbox.conversations.map((conversation) => ({
      ...conversation,
      latestMessage: conversation.latestMessage
        ? toMessageItem(conversation.latestMessage)
        : null,
    })),
  };
}

export async function getConversationMessages(
  conversationId: number,
  page = 0,
  size = 50,
): Promise<ConversationMessages> {
  const response = await authenticatedFetch(
    `/api/v1/messages/conversations/${conversationId}/messages?page=${page}&size=${size}`,
  );
  if (!response.ok) throw new Error("대화 내용을 불러오지 못했습니다.");
  const messagePage = ((await response.json()) as ApiResponse<ConversationMessagesApiResponse>).data;
  return {
    ...messagePage,
    content: messagePage.content.map(toMessageItem).reverse(),
  };
}

export async function getMyRecruitingJobs(): Promise<RecruitingJob[]> {
  const response = await authenticatedFetch("/api/v1/jobs/mine/recruiting");
  if (!response.ok) throw new Error("모집 중 공고를 불러오지 못했습니다.");
  return ((await response.json()) as ApiResponse<RecruitingJob[]>).data;
}

export async function createConversation(
  receiverId: number,
  postId: number | null,
): Promise<MessageConversation> {
  const response = await authenticatedFetch("/api/v1/messages/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ receiverId, postId, applicationId: null }),
  });
  if (!response.ok) throw new Error("대화방을 만들지 못했습니다.");
  return ((await response.json()) as ApiResponse<MessageConversation>).data;
}

export async function sendMessage(
  conversationId: number,
  content: string,
  parentMessageId: number | null,
): Promise<MessageItem> {
  const response = await authenticatedFetch("/api/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId, parentMessageId, content }),
  });
  if (!response.ok) throw new Error("쪽지를 보내지 못했습니다.");
  return toMessageItem(((await response.json()) as ApiResponse<ApiMessage>).data);
}

export async function markConversationAsRead(conversationId: number): Promise<void> {
  const response = await authenticatedFetch("/api/v1/messages/read", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId }),
  });
  if (!response.ok) throw new Error("쪽지를 읽음 처리하지 못했습니다.");
}
