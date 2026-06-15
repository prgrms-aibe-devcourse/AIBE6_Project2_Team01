"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  createConversation,
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

function buildThreads(inbox: MessageInbox): MessageThread[] {
  const participantMap = new Map(inbox.participants.map((participant) => [participant.id, participant]));
  return inbox.conversations.map((conversation) => {
    const participantId =
      conversation.clientId === inbox.currentUser.id ? conversation.modelId : conversation.clientId;
    const participant = participantMap.get(participantId);
    const messages = inbox.messages
      .filter((message) => message.conversationId === conversation.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const last = messages.at(-1);
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
      unreadCount: messages.filter(
        (message) => message.receiverId === inbox.currentUser.id && !message.isRead,
      ).length,
      messages,
    };
  }).sort((a, b) => {
    const aTime = a.messages.at(-1)?.createdAt ?? "";
    const bTime = b.messages.at(-1)?.createdAt ?? "";
    return bTime.localeCompare(aTime);
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
        thread.messages.some((message) => message.content.toLocaleLowerCase("ko-KR").includes(query)),
    );
  }, [searchQuery, threads]);
  const selectedJob = jobs.find((job) => job.id === selectedThread?.postId) ?? null;

  useEffect(() => {
    if (!isAuthLoading && !user) router.replace("/login?next=/messages");
  }, [isAuthLoading, router, user]);

  useEffect(() => {
    if (isAuthLoading || !user) return;
    async function load() {
      const recipientId = Number(new URLSearchParams(window.location.search).get("recipientId"));
      const draft =
        user.role === "CLIENT" && Number.isFinite(recipientId) && recipientId > 0
          ? draftThread(recipientId, null)
          : null;

      try {
        const inbox = await getInbox();
        const loadedThreads = buildThreads(inbox);
        if (draft) loadedThreads.unshift(draft);
        setCurrentUser(inbox.currentUser);
        setThreads(loadedThreads);
        setSelectedId((current) => current ?? loadedThreads[0]?.id ?? null);
        if (user.role === "CLIENT") {
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
  }, [isAuthLoading, user]);

  const selectThread = useCallback((id: string) => setSelectedId(id), []);

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
      const saved = await sendMessage(conversationId, trimmed, selectedThread.messages.at(-1)?.id ?? null);
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
    return <main className="grid min-h-screen place-items-center">쪽지함을 불러오는 중입니다.</main>;
  }
  if (!selectedThread) {
    return (
      <main className="grid min-h-screen place-items-center text-center">
        <div>
          <p>표시할 대화가 없습니다.</p>
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--canvas-soft)]">
      {error && <div className="border-b bg-white px-6 py-3 text-center text-sm text-red-700">{error}</div>}
      <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-[1480px] grid-cols-1 border-x bg-white lg:grid-cols-[320px_minmax(0,1fr)_320px]">
        <aside className="border-r">
          <div className="border-b p-6">
            <h1 className="text-2xl font-bold">쪽지함</h1>
            <input className="mt-5 h-11 w-full rounded-md border px-3 text-sm" placeholder="이름 또는 내용 검색" onChange={(event) => setSearchQuery(event.target.value)} value={searchQuery} />
          </div>
          {visibleThreads.map((thread) => (
            <button key={thread.id} className={`w-full border-b px-6 py-5 text-left ${selectedThread.id === thread.id ? "bg-gray-50" : ""}`} onClick={() => selectThread(thread.id)} type="button">
              <div className="flex justify-between gap-3">
                <strong>{thread.participantName}</strong><span className="text-xs text-gray-500">{thread.time}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-gray-600">{thread.preview}</p>
            </button>
          ))}
        </aside>
        <section className="flex min-h-[720px] flex-col">
          <div className="border-b px-6 py-5">
            <div className="flex items-center gap-2">
              {selectedThread.participantProfileImageUrl && <Image alt="" className="size-9 rounded-full object-cover" height={36} src={selectedThread.participantProfileImageUrl} unoptimized width={36} />}
              <h2 className="text-lg font-semibold">{selectedThread.participantName}</h2>
              <span className="rounded-full border px-2 py-0.5 text-xs">{selectedThread.participantRole}</span>
            </div>
            {!selectedThread.conversationId && jobs.length > 0 && (
              <label className="mt-4 block text-sm">
                <span className="mr-3 font-medium">연결할 공고</span>
                <select className="h-10 rounded-md border px-3" onChange={(event) => changeDraftPost(event.target.value)} value={selectedThread.postId ?? ""}>
                  <option value="">공고 없이 일반 헤드헌팅</option>
                  {jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}
                </select>
              </label>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto bg-gray-50 p-6">
            {selectedThread.messages.length === 0
              ? <div className="grid flex-1 place-items-center text-center"><p>첫 쪽지를 보내 대화를 시작하세요.</p></div>
              : selectedThread.messages.map((message: MessageItem, index) => {
                  const mine = message.senderId === currentUser?.id;
                  const date = new Date(message.createdAt);
                  const previous = index > 0 ? new Date(selectedThread.messages[index - 1].createdAt) : null;
                  const showDate = !previous || date.toDateString() !== previous.toDateString();
                  return <div className="contents" key={message.id}>
                    {showDate && <div className="mx-auto rounded-full border bg-white px-3 py-1 text-xs text-gray-500">{new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(date)}</div>}
                    <article className={`flex max-w-[76%] flex-col ${mine ? "ml-auto items-end" : "items-start"}`}>
                      <div className={`rounded-xl px-4 py-3 ${mine ? "bg-black text-white" : "border bg-white"}`}>{message.content}</div>
                      <time className="mt-1 text-xs text-gray-500">{new Intl.DateTimeFormat("ko-KR", { hour: "numeric", minute: "2-digit" }).format(date)}</time>
                    </article>
                  </div>;
                })}
          </div>
          <form className="border-t p-5" onSubmit={submitMessage}>
            <div className="flex items-end gap-3">
              <textarea className="min-h-24 flex-1 resize-none rounded-md border p-3" maxLength={MAX_MESSAGE_LENGTH} onChange={(event) => setContent(event.target.value)} placeholder="쪽지 내용을 입력하세요." value={content} />
              <button className="h-11 rounded-md bg-black px-6 text-sm font-semibold text-white disabled:opacity-30" disabled={!content.trim() || sending} type="submit">{sending ? "전송 중" : "보내기"}</button>
            </div>
            <p className="mt-2 text-right text-xs text-gray-500">{content.length.toLocaleString()} / {MAX_MESSAGE_LENGTH.toLocaleString()}</p>
          </form>
        </section>
        <aside className="hidden border-l p-6 lg:block">
          <p className="text-xs font-semibold text-gray-500">CONTEXT</p>
          <h3 className="mt-2 text-lg font-semibold">{selectedJob?.title ?? (selectedThread.postId ? `공고 #${selectedThread.postId}` : "일반 헤드헌팅")}</h3>
          {selectedJob && <><p className="mt-4 text-sm">{selectedJob.region}</p><p className="mt-2 text-sm">{selectedJob.shootDate ?? "촬영일 미정"}</p></>}
        </aside>
      </div>
    </main>
  );
}
