"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getInbox, markConversationAsRead, sendMessage } from "@/lib/api/message";
import type { MessageItem, MessageParticipant, MessageThread } from "@/types/message";

const POLLING_INTERVAL_MS = 30_000;
const MAX_MESSAGE_LENGTH = 2_000;

function getThreadId(
  participantId: number,
  applicationId: number | null,
  postId: number | null,
): string {
  return `${participantId}:${applicationId ?? "none"}:${postId ?? "none"}`;
}

function getRoleLabel(role: MessageParticipant["role"]): string {
  return {
    MODEL: "모델",
    CLIENT: "의뢰인",
    ADMIN: "관리자",
  }[role];
}

function buildThreads(
  messages: MessageItem[],
  currentUserId: number,
  participants: MessageParticipant[],
): MessageThread[] {
  const grouped = new Map<string, MessageItem[]>();
  const participantMap = new Map(participants.map((participant) => [participant.id, participant]));

  for (const message of messages) {
    const participantId =
      message.senderId === currentUserId ? message.receiverId : message.senderId;
    const threadId = getThreadId(participantId, message.applicationId, message.postId);
    grouped.set(threadId, [...(grouped.get(threadId) ?? []), message]);
  }

  return [...grouped.entries()]
    .map(([threadId, unsortedMessages]) => {
      const threadMessages = [...unsortedMessages].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      const lastMessage = threadMessages.at(-1)!;
      const participantId =
        lastMessage.senderId === currentUserId ? lastMessage.receiverId : lastMessage.senderId;
      const participant = participantMap.get(participantId) ?? {
        name: `사용자 ${participantId}`,
        role: "MODEL" as const,
        profileImageUrl: null,
      };

      return {
        id: threadId,
        participantId,
        applicationId: lastMessage.applicationId,
        postId: lastMessage.postId,
        participantName: participant.name,
        participantRole: getRoleLabel(participant.role),
        participantProfileImageUrl: participant.profileImageUrl,
        preview: lastMessage.content,
        time: new Intl.DateTimeFormat("ko-KR", {
          month: "numeric",
          day: "numeric",
        }).format(new Date(lastMessage.createdAt)),
        unreadCount: threadMessages.filter(
          (message) => message.receiverId === currentUserId && !message.isRead,
        ).length,
        messages: threadMessages,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.messages.at(-1)!.createdAt).getTime() -
        new Date(a.messages.at(-1)!.createdAt).getTime(),
    );
}

export function MessageWorkspace() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [currentUser, setCurrentUser] = useState<MessageParticipant | null>(null);
  const [participants, setParticipants] = useState<MessageParticipant[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedId) ?? threads[0] ?? null,
    [selectedId, threads],
  );
  const visibleThreads = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("ko-KR");
    if (!query) return threads;
    return threads.filter(
      (thread) =>
        thread.participantName.toLocaleLowerCase("ko-KR").includes(query) ||
        thread.messages.some((message) =>
          message.content.toLocaleLowerCase("ko-KR").includes(query),
        ),
    );
  }, [searchQuery, threads]);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login?next=/messages");
    }
  }, [isAuthLoading, router, user]);

  useEffect(() => {
    if (isAuthLoading || !user) return;

    async function loadMessages() {
      try {
        const inbox = await getInbox();
        const loadedThreads = buildThreads(
          inbox.messages,
          inbox.currentUser.id,
          inbox.participants,
        );
        setCurrentUser(inbox.currentUser);
        setParticipants(inbox.participants);
        setThreads(loadedThreads);
        setSelectedId((current) => current ?? loadedThreads[0]?.id ?? null);
        setError(null);
      } catch (requestError) {
        setError((requestError as Error).message);
      } finally {
        setLoading(false);
      }
    }

    void loadMessages();
    const pollingId = window.setInterval(loadMessages, POLLING_INTERVAL_MS);

    return () => window.clearInterval(pollingId);
  }, [isAuthLoading, user]);

  const selectThread = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  useEffect(() => {
    if (!currentUser || !selectedThread) return;
    const currentUserId = currentUser.id;
    const unreadMessages =
      selectedThread.messages.filter(
        (message) => message.receiverId === currentUserId && !message.isRead,
      );
    if (unreadMessages.length === 0) return;

    let cancelled = false;
    async function readSelectedConversation() {
      try {
        await markConversationAsRead(
          selectedThread.participantId,
          selectedThread.applicationId,
          selectedThread.postId,
        );
        if (cancelled) return;
        setThreads((current) =>
          current.map((thread) =>
            thread.id === selectedThread.id
              ? {
                  ...thread,
                  unreadCount: 0,
                  messages: thread.messages.map((message) =>
                    message.receiverId === currentUserId
                      ? { ...message, isRead: true, readAt: new Date().toISOString() }
                      : message,
                  ),
                }
              : thread,
          ),
        );
        setError(null);
      } catch (requestError) {
        if (cancelled) return;
        setError((requestError as Error).message);
      }
    }

    void readSelectedConversation();
    return () => {
      cancelled = true;
    };
  }, [currentUser, selectedThread]);

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || !selectedThread || !currentUser || sending) return;

    setSending(true);
    try {
      const saved = await sendMessage(
        selectedThread.participantId,
        trimmed,
        selectedThread.messages.at(-1)?.applicationId ?? null,
        selectedThread.messages.at(-1)?.postId ?? null,
        selectedThread.messages.at(-1)?.id ?? null,
      );
      setThreads(
        buildThreads(
          [...threads.flatMap((thread) => thread.messages), saved],
          currentUser.id,
          participants,
        ),
      );
      setSelectedId(selectedThread.id);
      setContent("");
      setError(null);
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setSending(false);
    }
  }

  if (isAuthLoading || !user || loading) {
    return <main className="grid min-h-screen place-items-center">쪽지함을 불러오는 중입니다.</main>;
  }

  if (!selectedThread) {
    return (
      <main className="grid min-h-screen place-items-center text-center">
        <div>
          <p className="font-semibold">쪽지함을 표시할 수 없습니다.</p>
          <p className="mt-2 text-sm text-[var(--mute)]">{error ?? "쪽지가 없습니다."}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--canvas-soft)]">
      {error && (
        <div className="border-b border-[var(--hairline)] bg-[var(--canvas)] px-6 py-3 text-center text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-[1480px] grid-cols-1 border-x border-[var(--hairline)] bg-[var(--surface)] lg:grid-cols-[320px_minmax(0,1fr)_320px]">
        <aside className="border-b border-[var(--hairline)] lg:border-b-0 lg:border-r">
          <div className="border-b border-[var(--hairline)] p-6">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="mb-1 text-xs font-semibold tracking-[0.12em] text-[var(--mute)]">
                  MESSAGE
                </p>
                <h1 className="text-2xl font-bold tracking-[-0.04em]">쪽지함</h1>
              </div>
              <span className="text-xs text-[var(--mute)]">총 {threads.length}개</span>
            </div>
            <input
              className="h-11 w-full rounded-md border border-[var(--hairline)] bg-[var(--canvas-soft)] px-3 text-sm outline-none placeholder:text-[var(--mute)] focus:border-[var(--hairline-strong)]"
              placeholder="이름 또는 내용 검색"
              onChange={(event) => setSearchQuery(event.target.value)}
              value={searchQuery}
            />
          </div>

          <div>
            {visibleThreads.map((thread) => (
              <button
                key={thread.id}
                className={`relative w-full border-b border-[var(--hairline)] px-6 py-5 text-left transition-colors hover:bg-[var(--canvas-soft)] ${
                  selectedThread.id === thread.id ? "bg-[var(--canvas-soft)]" : ""
                }`}
                onClick={() => selectThread(thread.id)}
                type="button"
              >
                {thread.unreadCount > 0 && (
                  <span className="absolute left-2 top-7 size-1.5 rounded-full bg-[var(--ink)]" />
                )}
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <strong className="text-[15px]">{thread.participantName}</strong>
                    <p className="mt-0.5 text-xs text-[var(--mute)]">{thread.participantRole}</p>
                  </div>
                  <span className="whitespace-nowrap text-xs text-[var(--mute)]">
                    {thread.time}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm leading-5 text-[var(--body)]">
                  {thread.preview}
                </p>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex min-h-[720px] flex-col">
          <div className="flex h-[88px] items-center justify-between border-b border-[var(--hairline)] px-6">
            <div>
              <div className="flex items-center gap-2">
                {selectedThread.participantProfileImageUrl && (
                  <Image
                    alt={`${selectedThread.participantName} 프로필`}
                    className="size-9 rounded-full object-cover"
                    height={36}
                    src={selectedThread.participantProfileImageUrl}
                    unoptimized
                    width={36}
                  />
                )}
                <h2 className="text-lg font-semibold">{selectedThread.participantName}</h2>
                <span className="rounded-full border border-[var(--hairline)] px-2 py-0.5 text-xs text-[var(--body)]">
                  {selectedThread.participantRole}
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--mute)]">
                사용자 #{selectedThread.participantId}
              </p>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-5 overflow-y-auto bg-[var(--canvas-soft)] p-6">
            {selectedThread.messages.length === 0 ? (
              <div className="grid flex-1 place-items-center text-center">
                <div>
                  <p className="font-semibold">아직 주고받은 쪽지가 없습니다.</p>
                  <p className="mt-2 text-sm text-[var(--mute)]">첫 쪽지를 보내 대화를 시작하세요.</p>
                </div>
              </div>
            ) : (
              selectedThread.messages.map((message, index) => {
                const mine = message.senderId === currentUser?.id;
                const messageDate = new Date(message.createdAt);
                const previousDate =
                  index > 0 ? new Date(selectedThread.messages[index - 1].createdAt) : null;
                const showDate =
                  !previousDate || messageDate.toDateString() !== previousDate.toDateString();
                return (
                  <div className="contents" key={message.id}>
                    {showDate && (
                      <div className="mx-auto rounded-full border border-[var(--hairline)] bg-[var(--surface)] px-3 py-1 text-xs text-[var(--mute)]">
                        {new Intl.DateTimeFormat("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }).format(messageDate)}
                      </div>
                    )}
                    <article
                      className={`flex max-w-[76%] flex-col ${mine ? "ml-auto items-end" : "items-start"}`}
                    >
                      <div
                        className={`rounded-xl px-4 py-3 text-[15px] leading-6 ${
                          mine
                            ? "bg-[var(--primary)] text-[var(--on-primary)]"
                            : "border border-[var(--hairline)] bg-[var(--surface)] text-[var(--ink)]"
                        }`}
                      >
                        {message.content}
                      </div>
                      <div className="mt-1.5 flex items-center gap-2 text-xs text-[var(--mute)]">
                        {mine && <span>{message.isRead ? "읽음" : "전송됨"}</span>}
                        <time>
                          {new Intl.DateTimeFormat("ko-KR", {
                            hour: "numeric",
                            minute: "2-digit",
                          }).format(new Date(message.createdAt))}
                        </time>
                      </div>
                    </article>
                  </div>
                );
              })
            )}
          </div>

          <form className="border-t border-[var(--hairline)] bg-[var(--surface)] p-5" onSubmit={submitMessage}>
            {(selectedThread.messages.at(-1)?.postId ||
              selectedThread.messages.at(-1)?.applicationId) && (
              <div className="mb-3 flex items-center gap-2 text-xs text-[var(--body)]">
                {selectedThread.messages.at(-1)?.postId && (
                  <span className="rounded-full border border-[var(--hairline)] px-2.5 py-1">
                    공고 #{selectedThread.messages.at(-1)?.postId}
                  </span>
                )}
                {selectedThread.messages.at(-1)?.applicationId && (
                  <span className="rounded-full border border-[var(--hairline)] px-2.5 py-1">
                    지원 #{selectedThread.messages.at(-1)?.applicationId}
                  </span>
                )}
              </div>
            )}
            <div className="flex items-end gap-3">
              <textarea
                className="min-h-24 flex-1 resize-none rounded-md border border-[var(--hairline)] bg-[var(--canvas-soft)] p-3 text-[15px] leading-6 outline-none placeholder:text-[var(--mute)] focus:border-[var(--hairline-strong)]"
                onChange={(event) => setContent(event.target.value)}
                maxLength={MAX_MESSAGE_LENGTH}
                placeholder="쪽지 내용을 입력하세요."
                value={content}
              />
              <button
                className="h-11 rounded-md bg-[var(--primary)] px-6 text-sm font-semibold text-[var(--on-primary)] disabled:cursor-not-allowed disabled:opacity-30"
                disabled={!content.trim() || sending}
                type="submit"
              >
                {sending ? "전송 중" : "보내기"}
              </button>
            </div>
            <p className="mt-2 text-right text-xs text-[var(--mute)]">
              {content.length.toLocaleString()} / {MAX_MESSAGE_LENGTH.toLocaleString()}
            </p>
          </form>
        </section>

        <aside className="hidden border-l border-[var(--hairline)] bg-[var(--canvas)] p-6 lg:block">
          <p className="text-xs font-semibold tracking-[0.12em] text-[var(--mute)]">CONTEXT</p>
          <h3 className="mt-2 text-lg font-semibold">연결 정보</h3>
          <div className="mt-5 rounded-xl border border-[var(--hairline)] p-5 text-sm">
            <p className="text-[var(--mute)]">공고 및 지원 도메인 연결 후 상세 정보가 표시됩니다.</p>
            {selectedThread.messages.at(-1)?.postId && (
              <p className="mt-4 font-medium">공고 #{selectedThread.messages.at(-1)?.postId}</p>
            )}
            {selectedThread.messages.at(-1)?.applicationId && (
              <p className="mt-2 font-medium">지원 #{selectedThread.messages.at(-1)?.applicationId}</p>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
