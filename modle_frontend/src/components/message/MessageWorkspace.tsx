"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ReportModal } from "@/components/ui/ReportModal";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  createConversation,
  getConversationMessages,
  getInbox,
  getMyRecruitingJobs,
  markConversationAsRead,
  sendMessage,
} from "@/lib/api/message";
import type {
  MessageInbox,
  MessageItem,
  MessageParticipant,
  MessageThread,
  RecruitingJob,
} from "@/types/message";

const POLLING_INTERVAL_MS = 30_000;
const MAX_MESSAGE_LENGTH = 2_000;

function roleLabel(role: MessageParticipant["role"]): string {
  return { MODEL: "모델", CLIENT: "의뢰인", ADMIN: "관리자" }[role];
}

function participantInitial(name: string): string {
  return name.trim().slice(0, 1) || "?";
}

function buildThreads(inbox: MessageInbox, currentThreads: MessageThread[] = []): MessageThread[] {
  const currentMap = new Map(currentThreads.map((thread) => [thread.id, thread]));
  return [...inbox.conversations].sort((a, b) => {
    const aTime = a.latestMessage?.createdAt ?? a.createdAt;
    const bTime = b.latestMessage?.createdAt ?? b.createdAt;
    return bTime.localeCompare(aTime);
  }).map((conversation) => {
    const participantId =
      conversation.clientId === inbox.currentUser.id ? conversation.modelId : conversation.clientId;
    const participant = conversation.participant;
    const messages = currentMap.get(String(conversation.id))?.messages ?? [];
    const last = conversation.latestMessage;
    return {
      id: String(conversation.id),
      conversationId: conversation.id,
      participantId,
      postId: conversation.postId,
      applicationId: conversation.applicationId,
      participantName: participant?.name ?? `사용자 ${participantId}`,
      participantRole: participant ? roleLabel(participant.role) : "모델",
      participantProfileImageUrl: participant?.profileImageUrl ?? null,
      preview: last?.content ?? "새 대화방",
      time: last
        ? new Intl.DateTimeFormat("ko-KR", { month: "numeric", day: "numeric" }).format(new Date(last.createdAt))
        : "",
      unreadCount: conversation.unreadCount,
      messages,
    };
  });
}

function draftThread(recipientId: number, postId: number | null): MessageThread {
  return {
    id: `draft:${recipientId}:${postId ?? "none"}`,
    conversationId: null,
    participantId: recipientId,
    postId,
    applicationId: null,
    participantName: `모델 #${recipientId}`,
    participantRole: "모델",
    participantProfileImageUrl: null,
    preview: "새 섭외 제안",
    time: "",
    unreadCount: 0,
    messages: [],
  };
}

export function MessageWorkspace() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [currentUser, setCurrentUser] = useState<MessageParticipant | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<RecruitingJob[]>([]);
  const [content, setContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [reportingMessageId, setReportingMessageId] = useState<number | null>(null);

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
        thread.preview.toLocaleLowerCase("ko-KR").includes(query),
    );
  }, [searchQuery, threads]);
  const selectedJob = jobs.find((job) => job.id === selectedThread?.postId) ?? null;

  useEffect(() => {
    if (!isAuthLoading && !user) router.replace("/login?next=/messages");
  }, [isAuthLoading, router, user]);

  useEffect(() => {
    if (isAuthLoading || !user) return;
    const userRole = user.role;
    async function load() {
      const recipientId = Number(new URLSearchParams(window.location.search).get("recipientId"));
      const draft =
        userRole === "CLIENT" && Number.isFinite(recipientId) && recipientId > 0
          ? draftThread(recipientId, null)
          : null;

      try {
        const inbox = await getInbox();
        setCurrentUser(inbox.currentUser);
        setThreads((currentThreads) => {
          const loadedThreads = buildThreads(inbox, currentThreads);
          const existingTarget = draft
            ? loadedThreads.find((thread) => thread.participantId === draft.participantId)
            : null;
          const targetThread = existingTarget ?? draft;
          if (draft && !existingTarget) loadedThreads.unshift(draft);
          setSelectedId((current) => {
            if (targetThread) return targetThread.id;
            return loadedThreads.some((thread) => thread.id === current)
              ? current
              : loadedThreads[0]?.id ?? null;
          });
          if (existingTarget) router.replace("/messages");
          return loadedThreads;
        });
        if (userRole === "CLIENT") {
          getMyRecruitingJobs()
            .then(setJobs)
            .catch((requestError) => setError((requestError as Error).message));
        }
        setError(null);
      } catch (requestError) {
        if (draft) {
          setThreads([draft]);
          setSelectedId(draft.id);
        }
        setError((requestError as Error).message);
      } finally {
        setLoading(false);
      }
    }
    void load();
    const pollingId = window.setInterval(load, POLLING_INTERVAL_MS);
    return () => window.clearInterval(pollingId);
  }, [isAuthLoading, router, user]);

  const selectThread = useCallback((id: string) => setSelectedId(id), []);

  useEffect(() => {
    if (!selectedThread?.conversationId) return;
    const conversationId = selectedThread.conversationId;
    async function loadMessages() {
      try {
        const page = await getConversationMessages(conversationId);
        setThreads((current) => current.map((thread) =>
          thread.conversationId === conversationId
            ? { ...thread, messages: page.content }
            : thread,
        ));
      } catch (requestError) {
        setError((requestError as Error).message);
      }
    }
    void loadMessages();
    const pollingId = window.setInterval(loadMessages, POLLING_INTERVAL_MS);
    return () => window.clearInterval(pollingId);
  }, [selectedThread?.conversationId]);

  useEffect(() => {
    if (!currentUser || !selectedThread?.conversationId) return;
    const currentUserId = currentUser.id;
    const unread = selectedThread.messages.some(
      (message) => message.receiverId === currentUserId && !message.isRead,
    );
    if (!unread) return;
    void markConversationAsRead(selectedThread.conversationId).then(() => {
      setThreads((current) => current.map((thread) =>
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
      ));
    }).catch((requestError) => setError((requestError as Error).message));
  }, [currentUser, selectedThread]);

  function changeDraftPost(value: string) {
    if (!selectedThread || selectedThread.conversationId) return;
    const nextPostId = value ? Number(value) : null;
    const updated = draftThread(selectedThread.participantId, nextPostId);
    setThreads((current) => current.map((thread) => thread.id === selectedThread.id ? updated : thread));
    setSelectedId(updated.id);
  }

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || !selectedThread || !currentUser || sending) return;
    setSending(true);
    try {
      const wasDraft = !selectedThread.conversationId;
      const conversation = selectedThread.conversationId
        ? null
        : await createConversation(selectedThread.participantId, selectedThread.postId);
      const conversationId = selectedThread.conversationId ?? conversation!.id;
      const saved = await sendMessage(conversationId, trimmed, null);
      const nextThread = {
        ...selectedThread,
        id: String(conversationId),
        conversationId,
        messages: [...selectedThread.messages, saved],
        preview: saved.content,
      };
      setThreads((current) => [
        nextThread,
        ...current.filter((thread) => thread.id !== selectedThread.id),
      ]);
      setSelectedId(nextThread.id);
      setContent("");
      setError(null);
      if (wasDraft) router.replace("/messages");
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setSending(false);
    }
  }

  if (isAuthLoading || !user || loading) {
    return (
      <main className="grid h-[calc(100dvh-64px)] place-items-center bg-canvas-soft">
        <div className="text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-2 border-hairline border-t-ink" />
          <p className="mt-4 text-sm text-mute">쪽지함을 불러오는 중입니다.</p>
        </div>
      </main>
    );
  }
  if (!selectedThread) {
    return (
      <main className="grid h-[calc(100dvh-64px)] place-items-center bg-canvas-soft px-6 text-center">
        <div className="rounded-2xl border border-hairline bg-surface px-12 py-14 shadow-sm">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-canvas-soft text-xl">✉</div>
          <p className="mt-5 font-semibold text-ink">아직 시작된 대화가 없습니다.</p>
          <p className="mt-2 text-sm text-mute">모델 상세 페이지에서 섭외 문의를 시작해 보세요.</p>
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="relative h-[calc(100dvh-64px)] overflow-hidden bg-canvas-soft p-0 md:p-2">
      {error && (
        <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full border border-error/20 bg-error-soft px-4 py-2 text-sm font-medium text-error shadow-sm">
          {error}
        </div>
      )}
      <div className="mx-auto grid h-full max-w-[1360px] overflow-hidden border-hairline bg-surface shadow-sm md:grid-cols-[270px_minmax(0,1fr)] md:rounded-xl md:border xl:grid-cols-[270px_minmax(0,1fr)_240px]">
        <aside className="hidden min-h-0 flex-col border-r border-hairline bg-canvas md:flex">
          <div className="border-b border-hairline px-4 pb-3 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mute">Messages</p>
                <h1 className="mt-0.5 text-lg font-bold text-ink">쪽지함</h1>
              </div>
              <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-white">
                {threads.length}
              </span>
            </div>
            <div className="relative mt-3">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-mute">⌕</span>
              <input
                className="h-9 w-full rounded-lg border border-hairline bg-canvas-soft pl-9 pr-3 text-xs outline-none transition focus:border-hairline-strong focus:bg-white"
                placeholder="이름 또는 내용 검색"
                onChange={(event) => setSearchQuery(event.target.value)}
                value={searchQuery}
              />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
            {visibleThreads.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-mute">검색 결과가 없습니다.</p>
            ) : visibleThreads.map((thread) => (
              <button
                key={thread.id}
                className={`mb-0.5 flex w-full gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition ${
                  selectedThread.id === thread.id ? "bg-ink text-white" : "hover:bg-canvas-soft"
                }`}
                onClick={() => selectThread(thread.id)}
                type="button"
              >
                <div className="relative shrink-0">
                  {thread.participantProfileImageUrl ? (
                    <Image alt="" className="size-9 rounded-full object-cover" height={36} src={thread.participantProfileImageUrl} unoptimized width={36} />
                  ) : (
                    <div className={`grid size-9 place-items-center rounded-full text-xs font-bold ${selectedThread.id === thread.id ? "bg-white/15" : "bg-canvas-soft text-body"}`}>
                      {participantInitial(thread.participantName)}
                    </div>
                  )}
                  {thread.unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-white bg-error" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="truncate text-sm">{thread.participantName}</strong>
                    <span className={`shrink-0 text-[11px] ${selectedThread.id === thread.id ? "text-white/55" : "text-mute"}`}>{thread.time}</span>
                  </div>
                  <p className={`mt-1 truncate text-xs ${selectedThread.id === thread.id ? "text-white/65" : "text-mute"}`}>{thread.preview}</p>
                </div>
              </button>
            ))}
          </div>
        </aside>
        <section className="flex min-h-0 min-w-0 flex-col bg-surface">
          <div className="flex min-h-[60px] shrink-0 items-center justify-between border-b border-hairline px-4">
            <div className="flex min-w-0 items-center gap-3">
              {selectedThread.participantProfileImageUrl ? (
                <Image alt="" className="size-9 rounded-full object-cover" height={36} src={selectedThread.participantProfileImageUrl} unoptimized width={36} />
              ) : (
                <div className="grid size-9 shrink-0 place-items-center rounded-full bg-canvas-soft text-xs font-bold text-body">
                  {participantInitial(selectedThread.participantName)}
                </div>
              )}
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold text-ink">{selectedThread.participantName}</h2>
                <p className="mt-0.5 text-xs text-mute">{selectedThread.participantRole} · {selectedThread.conversationId ? "대화 중" : "새로운 섭외 제안"}</p>
              </div>
            </div>
            {!selectedThread.conversationId && (
              <label className="hidden items-center gap-2 text-xs md:flex">
                <span className="font-semibold text-body">연결 공고</span>
                <select className="h-8 max-w-48 rounded-md border border-hairline bg-white px-2 text-xs outline-none focus:border-ink" onChange={(event) => changeDraftPost(event.target.value)} value={selectedThread.postId ?? ""}>
                  <option value="">공고 없이 일반 헤드헌팅</option>
                  {jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}
                </select>
              </label>
            )}
          </div>
          {!selectedThread.conversationId && (
            <label className="flex shrink-0 items-center gap-2 border-b border-hairline px-4 py-2 text-xs md:hidden">
              <span className="shrink-0 font-semibold text-body">연결 공고</span>
              <select className="h-9 min-w-0 flex-1 rounded-lg border border-hairline bg-white px-3 text-xs" onChange={(event) => changeDraftPost(event.target.value)} value={selectedThread.postId ?? ""}>
                <option value="">공고 없이 일반 헤드헌팅</option>
                {jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}
              </select>
            </label>
          )}
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-canvas-soft px-4 py-4 md:px-6">
            {selectedThread.messages.length === 0
              ? <div className="grid flex-1 place-items-center text-center">
                  <div>
                    <div className="mx-auto grid size-14 place-items-center rounded-full border border-hairline bg-white text-xl shadow-sm">✦</div>
                    <p className="mt-4 font-semibold text-ink">첫 메시지를 보내 대화를 시작하세요.</p>
                    <p className="mt-1 text-xs text-mute">공고를 연결하거나 일반 헤드헌팅으로 제안할 수 있습니다.</p>
                  </div>
                </div>
              : selectedThread.messages.map((message: MessageItem, index) => {
                  const mine = message.senderId === currentUser?.id;
                  const date = new Date(message.createdAt);
                  const previous = index > 0 ? new Date(selectedThread.messages[index - 1].createdAt) : null;
                  const showDate = !previous || date.toDateString() !== previous.toDateString();
                  return <div className="contents" key={message.id}>
                    {showDate && <div className="mx-auto rounded-full border border-hairline bg-white px-3 py-1 text-[11px] font-medium text-mute">{new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(date)}</div>}
                    <article className={`group flex max-w-[82%] flex-col md:max-w-[68%] ${mine ? "ml-auto items-end" : "items-start"}`}>
                      <div className={`whitespace-pre-wrap rounded-xl px-3.5 py-2 text-sm leading-5 shadow-sm ${mine ? "rounded-br-sm bg-ink text-white" : "rounded-bl-sm border border-hairline bg-white text-ink"}`}>{message.content}</div>
                      <div className={`mt-1 flex items-center gap-2 px-1 ${mine ? "flex-row-reverse" : ""}`}>
                        <time className="text-[10px] text-mute">{new Intl.DateTimeFormat("ko-KR", { hour: "numeric", minute: "2-digit" }).format(date)}</time>
                        {!mine && (
                          <button
                            type="button"
                            onClick={() => setReportingMessageId(message.id)}
                            className="hidden text-[10px] text-mute transition hover:text-red-500 group-hover:inline-block"
                          >
                            신고
                          </button>
                        )}
                      </div>
                    </article>
                  </div>;
                })}
              {reportingMessageId !== null && (
                <ReportModal
                  targetType="MESSAGE"
                  targetId={reportingMessageId}
                  onClose={() => setReportingMessageId(null)}
                />
              )}
          </div>
          <form className="shrink-0 border-t border-hairline bg-white px-4 py-2.5" onSubmit={submitMessage}>
            <div className="flex items-end gap-2 rounded-xl border border-hairline bg-canvas-soft p-1.5 transition focus-within:border-hairline-strong focus-within:bg-white">
              <textarea className="max-h-24 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-5 outline-none" maxLength={MAX_MESSAGE_LENGTH} onChange={(event) => setContent(event.target.value)} placeholder="메시지를 입력하세요." rows={1} value={content} />
              <button className="grid size-9 shrink-0 place-items-center rounded-lg bg-ink text-sm font-bold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-25" disabled={!content.trim() || sending} type="submit">
                {sending ? "…" : "↑"}
              </button>
            </div>
            <p className="mt-1.5 text-right text-[10px] text-mute">{content.length.toLocaleString()} / {MAX_MESSAGE_LENGTH.toLocaleString()}</p>
          </form>
        </section>
        <aside className="hidden min-h-0 overflow-y-auto border-l border-hairline bg-canvas px-4 py-5 xl:block">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mute">Conversation</p>
          <div className="mt-4 flex flex-col items-center border-b border-hairline pb-5 text-center">
            {selectedThread.participantProfileImageUrl ? (
              <Image alt="" className="size-14 rounded-full object-cover" height={56} src={selectedThread.participantProfileImageUrl} unoptimized width={56} />
            ) : (
              <div className="grid size-14 place-items-center rounded-full bg-canvas-soft text-lg font-bold text-body">{participantInitial(selectedThread.participantName)}</div>
            )}
            <h3 className="mt-3 font-bold text-ink">{selectedThread.participantName}</h3>
            <p className="mt-1 text-xs text-mute">{selectedThread.participantRole}</p>
          </div>
          <div className="mt-5">
            <p className="text-xs font-semibold text-mute">연결된 제안</p>
            <div className="mt-2.5 rounded-lg border border-hairline bg-white p-3.5">
              <span className="inline-flex rounded-full bg-canvas-soft px-2 py-1 text-[10px] font-bold text-body">
                {selectedThread.postId ? "공고 제안" : "헤드헌팅"}
              </span>
              <h4 className="mt-3 text-sm font-bold leading-5 text-ink">{selectedJob?.title ?? (selectedThread.postId ? `공고 #${selectedThread.postId}` : "일반 헤드헌팅")}</h4>
              {selectedJob && <><p className="mt-3 text-xs text-body">{selectedJob.region}</p><p className="mt-1 text-xs text-mute">{selectedJob.shootDate ?? "촬영일 미정"}</p></>}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
