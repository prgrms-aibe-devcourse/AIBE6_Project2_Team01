"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { getInbox, markAsRead, sendMessage } from "@/lib/api/message";
import type { MessageItem, MessageParticipant, MessageThread } from "@/types/message";

const POLLING_INTERVAL_MS = 30_000;

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
  const grouped = new Map<number, MessageItem[]>();
  const participantMap = new Map(participants.map((participant) => [participant.id, participant]));

  for (const message of messages) {
    const participantId =
      message.senderId === currentUserId ? message.receiverId : message.senderId;
    grouped.set(participantId, [...(grouped.get(participantId) ?? []), message]);
  }

  return [...grouped.entries()]
    .map(([participantId, unsortedMessages]) => {
      const threadMessages = [...unsortedMessages].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      const lastMessage = threadMessages.at(-1)!;
      const participant = participantMap.get(participantId) ?? {
        name: `사용자 ${participantId}`,
        role: "MODEL" as const,
      };

      return {
        id: participantId,
        participantName: participant.name,
        participantRole: getRoleLabel(participant.role),
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
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [currentUser, setCurrentUser] = useState<MessageParticipant | null>(null);
  const [participants, setParticipants] = useState<MessageParticipant[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedId) ?? threads[0] ?? null,
    [selectedId, threads],
  );

  useEffect(() => {
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
  }, []);

  const selectThread = useCallback(async (id: number) => {
    if (!currentUser) return;
    setSelectedId(id);
    const selected = threads.find((thread) => thread.id === id);
    const unreadMessages =
      selected?.messages.filter(
        (message) => message.receiverId === currentUser.id && !message.isRead,
      ) ?? [];

    try {
      await Promise.all(unreadMessages.map((message) => markAsRead(message.id)));
      setThreads((current) =>
        current.map((thread) =>
          thread.id === id
            ? {
                ...thread,
                unreadCount: 0,
                messages: thread.messages.map((message) =>
                  message.receiverId === currentUser.id
                    ? { ...message, isRead: true, readAt: new Date().toISOString() }
                    : message,
                ),
              }
            : thread,
        ),
      );
      setError(null);
    } catch (requestError) {
      setError((requestError as Error).message);
    }
  }, [currentUser, threads]);

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || !selectedThread || !currentUser || sending) return;

    setSending(true);
    try {
      const saved = await sendMessage(
        selectedThread.id,
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

  if (loading) {
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
      <header className="flex h-16 items-center justify-between border-b border-[var(--hairline)] bg-[var(--canvas)] px-6">
        <div className="flex items-center gap-8">
          <strong className="text-xl tracking-[-0.04em]">MODLE</strong>
          <nav className="hidden gap-6 text-sm text-[var(--body)] md:flex">
            <span>공고 찾기</span>
            <span>모델 찾기</span>
            <span className="font-semibold text-[var(--ink)]">쪽지</span>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-[var(--body)] sm:inline">{currentUser?.name}</span>
          <div className="grid size-9 place-items-center rounded-full bg-[var(--ink)] text-xs font-semibold text-white">
            {currentUser?.name.slice(0, 2)}
          </div>
        </div>
      </header>
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
            />
          </div>

          <div>
            {threads.map((thread) => (
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
                <h2 className="text-lg font-semibold">{selectedThread.participantName}</h2>
                <span className="rounded-full border border-[var(--hairline)] px-2 py-0.5 text-xs text-[var(--body)]">
                  {selectedThread.participantRole}
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--mute)]">사용자 #{selectedThread.id}</p>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-5 overflow-y-auto bg-[var(--canvas-soft)] p-6">
            <div className="mx-auto rounded-full border border-[var(--hairline)] bg-[var(--surface)] px-3 py-1 text-xs text-[var(--mute)]">
              {new Intl.DateTimeFormat("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }).format(new Date(selectedThread.messages[0].createdAt))}
            </div>
            {selectedThread.messages.length === 0 ? (
              <div className="grid flex-1 place-items-center text-center">
                <div>
                  <p className="font-semibold">아직 주고받은 쪽지가 없습니다.</p>
                  <p className="mt-2 text-sm text-[var(--mute)]">첫 쪽지를 보내 대화를 시작하세요.</p>
                </div>
              </div>
            ) : (
              selectedThread.messages.map((message) => {
                const mine = message.senderId === currentUser?.id;
                return (
                  <article
                    key={message.id}
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
