/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { TelegramAuthFlow } from './components/auth/TelegramAuthFlow';
import { CreateChannelGroupModal } from './components/modals/CreateChannelGroupModal';
import { HtmlCodeModal } from './components/modals/HtmlCodeModal';
import { StoryCreatorModal, StoryViewerModal } from './components/modals/StoryModal';
import { FloatingBottomNav } from './components/navigation/FloatingBottomNav';
import {
  ChatConversationPane,
  RichMessagePayload,
} from './components/views/ChatConversationPane';
import { ChatsListView } from './components/views/ChatsListView';
import { ContactsView } from './components/views/ContactsView';
import { ProfileView } from './components/views/ProfileView';
import { SettingsSubRoute, SettingsView } from './components/views/SettingsView';
import {
  DEFAULT_SETTINGS,
  INITIAL_ACCOUNTS,
  INITIAL_CHATS,
  INITIAL_CONTACTS,
  INITIAL_STORIES,
  toPersianDigits,
} from './data/mockTelegramData';
import {
  AppSettingsState,
  AppTab,
  ChatMessage,
  ChatModeration,
  ChatThread,
  ContactItem,
  StoryItem,
  UserAccount,
} from './types/telegram';

const STORAGE_KEYS = {
  accounts: 'primox_ui_accounts_v2',
  currentAccountId: 'primox_ui_current_acc_v2',
  chats: 'primox_ui_chats_v2',
  contacts: 'primox_ui_contacts_v2',
  stories: 'primox_ui_stories_v2',
  settings: 'primox_ui_settings_v2',
  isAuthenticated: 'primox_ui_authed_v2',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [accounts, setAccounts] = useState<UserAccount[]>(() =>
    loadFromStorage(STORAGE_KEYS.accounts, INITIAL_ACCOUNTS)
  );
  const [currentAccountId, setCurrentAccountId] = useState<string>(() =>
    loadFromStorage(STORAGE_KEYS.currentAccountId, INITIAL_ACCOUNTS[0].id)
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    loadFromStorage(STORAGE_KEYS.isAuthenticated, false)
  );
  const [isAddingAccount, setIsAddingAccount] = useState(false);

  const [chats, setChats] = useState<ChatThread[]>(() =>
    loadFromStorage(STORAGE_KEYS.chats, INITIAL_CHATS)
  );
  const [contacts, setContacts] = useState<ContactItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.contacts, INITIAL_CONTACTS)
  );
  const [stories, setStories] = useState<StoryItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.stories, INITIAL_STORIES)
  );
  const [settings, setSettings] = useState<AppSettingsState>(() => ({
    ...DEFAULT_SETTINGS,
    ...loadFromStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS),
  }));

  const [activeTab, setActiveTab] = useState<AppTab>('chats');
  const [settingsSubRoute, setSettingsSubRoute] = useState<SettingsSubRoute>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(INITIAL_CHATS[1].id);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [htmlModalOpen, setHtmlModalOpen] = useState(false);
  const [createChannelGroupOpen, setCreateChannelGroupOpen] = useState(false);
  const [storyCreatorOpen, setStoryCreatorOpen] = useState(false);
  const [storyViewerIndex, setStoryViewerIndex] = useState<number | null>(null);

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (settings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Persist state in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(accounts));
      localStorage.setItem(STORAGE_KEYS.currentAccountId, JSON.stringify(currentAccountId));
      localStorage.setItem(STORAGE_KEYS.isAuthenticated, JSON.stringify(isAuthenticated));
      localStorage.setItem(STORAGE_KEYS.chats, JSON.stringify(chats));
      localStorage.setItem(STORAGE_KEYS.contacts, JSON.stringify(contacts));
      localStorage.setItem(STORAGE_KEYS.stories, JSON.stringify(stories));
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    } catch {
      // Ignore storage quota errors
    }
  }, [accounts, currentAccountId, isAuthenticated, chats, contacts, stories, settings]);

  const currentAccount = accounts.find((a) => a.id === currentAccountId) || accounts[0];
  const activeChat = chats.find((c) => c.id === activeChatId) || null;
  const totalUnread = chats.reduce((sum, c) => sum + c.unreadCount, 0);

  const handleCompleteAuth = (newAccount: UserAccount) => {
    setAccounts((prev) => [newAccount, ...prev]);
    setCurrentAccountId(newAccount.id);
    setIsAuthenticated(true);
    setIsAddingAccount(false);
    setActiveTab('chats');
  };

  const handleQuickSelectAccount = (accountId: string) => {
    setCurrentAccountId(accountId);
    setIsAuthenticated(true);
    setIsAddingAccount(false);
    setActiveTab('chats');
  };

  const handleUpdateCurrentAccount = (partial: Partial<UserAccount>) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === currentAccount.id ? { ...acc, ...partial } : acc))
    );
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setMobileChatOpen(true);
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleSendMessage = (chatId: string, payload: RichMessagePayload) => {
    const now = new Date();
    const persianTime = toPersianDigits(
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    );

    const newMsgId = `m-${Date.now()}`;
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        return {
          ...c,
          lastTime: persianTime,
          lastMessage: payload.text,
          lastMessageStatus: 'read',
          messages: [
            ...c.messages,
            {
              id: newMsgId,
              sender: 'me',
              type: payload.type || 'text',
              text: payload.text,
              mediaUrl: payload.mediaUrl,
              stickerId: payload.stickerId,
              gifId: payload.gifId,
              voiceDuration: payload.voiceDuration,
              pollData: payload.pollData,
              time: persianTime,
              status: 'read',
              replyTo: payload.replyTo,
            },
          ],
        };
      })
    );

    if (chatId !== 'chat-saved' && payload.type !== 'poll') {
      setTimeout(() => {
        const replyTime = toPersianDigits(
          `${String(new Date().getHours()).padStart(2, '0')}:${String(
            new Date().getMinutes()
          ).padStart(2, '0')}`
        );
        setChats((prev) =>
          prev.map((c) => {
            if (c.id !== chatId) return c;
            const autoReplyText =
              payload.type === 'sticker' || payload.type === 'gif'
                ? 'چه استیکر/گیف باحالی! 😍'
                : c.category === 'personal'
                ? 'پیامت رو در پریموکس دریافت کردم، خیلی هم عالی! ✨'
                : 'ممنون از پیام شما در گفتگو 👍';
            return {
              ...c,
              lastTime: replyTime,
              lastMessage: autoReplyText,
              lastMessageStatus: 'none',
              messages: [
                ...c.messages,
                {
                  id: `m-reply-${Date.now()}`,
                  sender: 'them',
                  senderName: c.title,
                  text: autoReplyText,
                  time: replyTime,
                },
              ],
            };
          })
        );
      }, 900);
    }
  };

  const handleToggleReaction = (chatId: string, messageId: string, emoji: string) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        return {
          ...c,
          messages: c.messages.map((m) => {
            if (m.id !== messageId) return m;
            const existing = m.reactions || [];
            const found = existing.find((r) => r.emoji === emoji);
            const updatedReactions = found
              ? existing
                  .map((r) =>
                    r.emoji === emoji
                      ? {
                          ...r,
                          reacted: !r.reacted,
                          count: r.reacted ? Math.max(0, r.count - 1) : r.count + 1,
                        }
                      : r
                  )
                  .filter((r) => r.count > 0)
              : [...existing, { emoji, count: 1, reacted: true }];
            return { ...m, reactions: updatedReactions };
          }),
        };
      })
    );
  };

  const handleVotePoll = (chatId: string, messageId: string, optionId: string) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        return {
          ...c,
          messages: c.messages.map((m) => {
            if (m.id !== messageId || !m.pollData) return m;
            return {
              ...m,
              pollData: {
                ...m.pollData,
                options: m.pollData.options.map((opt) => {
                  if (opt.id === optionId) {
                    const nextVoted = !opt.voted;
                    return {
                      ...opt,
                      voted: nextVoted,
                      votes: nextVoted ? opt.votes + 1 : Math.max(0, opt.votes - 1),
                    };
                  }
                  if (opt.voted) {
                    return { ...opt, voted: false, votes: Math.max(0, opt.votes - 1) };
                  }
                  return opt;
                }),
              },
            };
          }),
        };
      })
    );
  };

  const handleTogglePinMessage = (chatId: string, messageId: string) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        return {
          ...c,
          messages: c.messages.map((m) =>
            m.id === messageId ? { ...m, isPinned: !m.isPinned } : { ...m, isPinned: false }
          ),
        };
      })
    );
  };

  const handleDeleteMessage = (chatId: string, messageId: string) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        const remaining = c.messages.filter((m) => m.id !== messageId);
        const last = remaining[remaining.length - 1];
        return {
          ...c,
          messages: remaining,
          lastMessage: last ? last.text : 'تاریخچه پیام‌ها خالی است',
          lastTime: last ? last.time : c.lastTime,
        };
      })
    );
  };

  const handleForwardMessage = (targetChatId: string, message: ChatMessage) => {
    const now = new Date();
    const persianTime = toPersianDigits(
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    );
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== targetChatId) return c;
        const forwarded: ChatMessage = {
          ...message,
          id: `m-fwd-${Date.now()}`,
          sender: 'me',
          time: persianTime,
          status: 'read',
          isPinned: false,
          reactions: [],
        };
        return {
          ...c,
          lastTime: persianTime,
          lastMessage: `فوروارد: ${message.text}`,
          lastMessageStatus: 'read',
          messages: [...c.messages, forwarded],
        };
      })
    );
  };

  const handleUpdateChatModeration = (chatId: string, moderation: ChatModeration) => {
    const nextChats = chats.map((c) => (c.id === chatId ? { ...c, moderation } : c));
    setChats(nextChats);
    const bannedChatsCount = nextChats.filter((c) => c.moderation?.isBanned).length;
    setSettings((s) => ({ ...s, blockedCount: bannedChatsCount }));
  };

  const handleClearHistory = (chatId: string) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages: [],
              lastMessage: 'تاریخچه پاک شد',
              lastMessageStatus: 'none',
            }
          : c
      )
    );
  };

  const handleCreateChannelGroup = (payload: {
    title: string;
    category: 'personal' | 'channels' | 'groups';
    description?: string;
    handle?: string;
    isPublic?: boolean;
    avatarUrl?: string;
    avatarGradient: string;
    memberNames: string[];
  }) => {
    const newId = `chat-${Date.now()}`;
    const memberCount = payload.memberNames.length + 1;
    const subtitle =
      payload.category === 'channels'
        ? payload.isPublic
          ? 'کانال عمومی · ۱ مشترک'
          : 'کانال خصوصی · ۱ مشترک'
        : payload.category === 'groups'
        ? `گروه · ${toPersianDigits(memberCount)} عضو`
        : 'آنلاین';

    const welcomeText =
      payload.category === 'channels'
        ? `کانال «${payload.title}» ایجاد شد!${
            payload.description ? `\n${payload.description}` : ''
          }`
        : payload.category === 'groups'
        ? `گروه «${payload.title}» با حضور شما${
            payload.memberNames.length ? ` و ${payload.memberNames.join('، ')}` : ''
          } ساخته شد! 🎉`
        : `گفتگو با «${payload.title}» آغاز شد.`;

    const newThread: ChatThread = {
      id: newId,
      title: payload.title,
      subtitle,
      description: payload.description,
      handle: payload.handle,
      isPublic: payload.isPublic,
      category: payload.category,
      avatarText: payload.title.charAt(0),
      avatarUrl: payload.avatarUrl,
      avatarGradient: payload.avatarGradient,
      verified: payload.category === 'channels',
      lastTime: 'اکنون',
      lastMessage: welcomeText,
      lastMessageStatus: 'none',
      unreadCount: 0,
      messages: [
        {
          id: `m-init-${Date.now()}`,
          sender: 'them',
          senderName: payload.title,
          text: welcomeText,
          time: 'اکنون',
        },
      ],
    };
    setChats((prev) => [newThread, ...prev]);
    setActiveChatId(newId);
    setMobileChatOpen(true);
  };

  const handlePublishStory = (newStory: StoryItem) => {
    setStories((prev) => [newStory, ...prev]);
    setStoryViewerIndex(0);
  };

  const handleToggleStoryLike = (storyId: string) => {
    setStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, liked: !s.liked } : s))
    );
  };

  const handleStartChatWithContact = (contact: ContactItem) => {
    const existing = chats.find((c) => c.title === contact.name);
    if (existing) {
      handleSelectChat(existing.id);
      setActiveTab('chats');
      return;
    }
    const newId = `chat-contact-${contact.id}`;
    const newThread: ChatThread = {
      id: newId,
      title: contact.name,
      subtitle: contact.statusText,
      category: 'personal',
      avatarText: contact.avatarText,
      avatarGradient: contact.avatarGradient,
      isOnline: contact.isOnline,
      lastTime: 'اکنون',
      lastMessage: 'شروع گفتگوی جدید',
      lastMessageStatus: 'none',
      unreadCount: 0,
      messages: [
        {
          id: `m-c-${Date.now()}`,
          sender: 'them',
          senderName: contact.name,
          text: `سلام! من ${contact.name} هستم.`,
          time: 'اکنون',
        },
      ],
    };
    setChats((prev) => [newThread, ...prev]);
    setActiveChatId(newId);
    setActiveTab('chats');
    setMobileChatOpen(true);
  };

  if (!isAuthenticated || isAddingAccount) {
    return (
      <TelegramAuthFlow
        existingAccounts={accounts}
        isAddingAccount={isAddingAccount}
        darkMode={settings.darkMode}
        onToggleDark={() => setSettings((s) => ({ ...s, darkMode: !s.darkMode }))}
        onCancelAddAccount={() => setIsAddingAccount(false)}
        onCompleteAuth={handleCompleteAuth}
        onQuickSelectAccount={handleQuickSelectAccount}
      />
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#F1F3F5] dark:bg-[#0E1621] text-slate-900 dark:text-slate-100">
      {/* Right Sidebar in RTL */}
      <aside
        className={`w-full lg:w-[400px] xl:w-[420px] h-full shrink-0 border-l border-slate-200/80 dark:border-slate-800 relative flex flex-col ${
          mobileChatOpen ? 'hidden lg:flex' : 'flex'
        }`}
      >
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chats' && (
            <ChatsListView
              chats={chats}
              stories={stories}
              currentAccount={currentAccount}
              activeChatId={activeChatId}
              darkMode={settings.darkMode}
              onSelectChat={handleSelectChat}
              onToggleDark={() => setSettings((s) => ({ ...s, darkMode: !s.darkMode }))}
              onOpenHtmlModal={() => setHtmlModalOpen(true)}
              onOpenCreateChannelGroup={() => setCreateChannelGroupOpen(true)}
              onOpenStoryCreator={() => setStoryCreatorOpen(true)}
              onOpenStoryViewer={(idx) => setStoryViewerIndex(idx)}
            />
          )}

          {activeTab === 'contacts' && (
            <ContactsView
              contacts={contacts}
              onAddContact={(c) => setContacts((prev) => [c, ...prev])}
              onStartChatWithContact={handleStartChatWithContact}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              currentAccount={currentAccount}
              accounts={accounts}
              initialSubRoute={settingsSubRoute}
              onClearInitialSubRoute={() => setSettingsSubRoute(null)}
              onUpdateSettings={(partial) => setSettings((prev) => ({ ...prev, ...partial }))}
              onUpdateAccount={handleUpdateCurrentAccount}
              onSwitchAccount={(id) => setCurrentAccountId(id)}
              onAddNewAccount={() => setIsAddingAccount(true)}
              onLogout={() => setIsAuthenticated(false)}
              onOpenHtmlModal={() => setHtmlModalOpen(true)}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              currentAccount={currentAccount}
              accounts={accounts}
              onSwitchAccount={(id) => setCurrentAccountId(id)}
              onAddNewAccount={() => setIsAddingAccount(true)}
              onUpdateCurrentAccount={handleUpdateCurrentAccount}
              onLogout={() => setIsAuthenticated(false)}
              onOpenSettingsSection={(route) => {
                setSettingsSubRoute(route ?? null);
                setActiveTab('settings');
              }}
            />
          )}
        </div>

        <FloatingBottomNav
          activeTab={activeTab}
          unreadCount={totalUnread}
          currentAccount={currentAccount}
          onSelectTab={(tab) => {
            setSettingsSubRoute(null);
            setActiveTab(tab);
            setMobileChatOpen(false);
          }}
        />
      </aside>

      {/* Main Conversation Pane */}
      <main
        className={`flex-1 h-full overflow-hidden ${
          mobileChatOpen ? 'flex fixed inset-0 z-40 lg:static' : 'hidden lg:flex'
        }`}
      >
        <ChatConversationPane
          chat={activeChat}
          allChats={chats}
          settings={settings}
          onBackMobile={() => setMobileChatOpen(false)}
          onSendMessage={handleSendMessage}
          onToggleReaction={handleToggleReaction}
          onVotePoll={handleVotePoll}
          onTogglePinMessage={handleTogglePinMessage}
          onDeleteMessage={handleDeleteMessage}
          onForwardMessage={handleForwardMessage}
          onUpdateModeration={handleUpdateChatModeration}
          onClearHistory={handleClearHistory}
        />
      </main>

      {/* Create Channel / Group Modal */}
      <CreateChannelGroupModal
        open={createChannelGroupOpen}
        contacts={contacts}
        onClose={() => setCreateChannelGroupOpen(false)}
        onCreate={handleCreateChannelGroup}
      />

      {/* Story Creator & Viewer */}
      <StoryCreatorModal
        open={storyCreatorOpen}
        currentAccount={currentAccount}
        onClose={() => setStoryCreatorOpen(false)}
        onPublish={handlePublishStory}
      />
      <StoryViewerModal
        stories={stories}
        activeIndex={storyViewerIndex}
        onClose={() => setStoryViewerIndex(null)}
        onChangeIndex={(idx) => setStoryViewerIndex(idx)}
        onToggleLike={handleToggleStoryLike}
      />

      {/* Standalone HTML Export Modal */}
      <HtmlCodeModal open={htmlModalOpen} onClose={() => setHtmlModalOpen(false)} />
    </div>
  );
}
