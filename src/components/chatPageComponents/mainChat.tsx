import PhoneCallIcon from "../../assets/icons8-phonecall-30.png";
import videoCallIcon from "../../assets/camera.png";
import infoIcon from "../../assets/icons8-info-30.png";
import pictureIcon from "../../assets/icons8-picture-50.png";
import emojiesIcon from "../../assets/icons8-happy-50.png";
import micIcon from "../../assets/icons8-mic-30.png";
import cameraIcon from "../../assets/camera.png";
import useChatsStore from "../../store/useChatsStore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../config/firebase";
import ReactTimeAgo from "react-time-ago";
import { useEffect, useState } from "react";
import upload from "../../helper/upload";
import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import EmojiPicker from "emoji-picker-react";
import { toast, ToastContainer } from "react-toastify";
import avatar from "../../assets/avatar.png";

const MainChat = () => {
  const [user] = useAuthState(auth);
  const [file, setFile] = useState<FileList | null>();
  const [inputValue, setInputValue] = useState<string>();
  const chat = useChatsStore((state) => state.chat);
  const ClickedUser = useChatsStore.getState().clickedUser;
  const chatId = useChatsStore.getState().chatId;
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const isReceiverBlocked = useChatsStore.getState().isReceiverBlocked;
  const isUserBlocked = useChatsStore.getState().isUserBlocked;
  const lastMessageRef = useChatsStore((state) => state.scrollToLastMessage);

  const onEmojiClick = (emojiObject: { emoji: string | number }) => {
    setInputValue((prev = "") => prev + emojiObject.emoji);
  };

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lastMessageRef]);

  const updateUserChat = async (
    userId: string | undefined,
    clickedUserId: string | undefined
  ) => {
    if (!userId || !clickedUserId) return;
    const chatIndex = chat?.length;
    let lastMessage: string;

    if (chatIndex) {
      lastMessage = chat[chatIndex - 1].text;
    }

    const userChatDocRef = doc(db, "userChats", userId);
    const receiverChatDocRef = doc(db, "userChats", clickedUserId);
    const userChatDoc = await getDoc(userChatDocRef);
    const receiverChatDoc = await getDoc(receiverChatDocRef);
    const userChats = userChatDoc.data()?.chats;
    const receiverChats = receiverChatDoc.data()?.chats;

    const updatedUserChat = userChats.map(
      (chat: { receiverId: string | undefined }) => {
        if (chat.receiverId === clickedUserId) {
          return {
            ...chat,
            updatedAt: new Date(),
            lastMessage: inputValue ? inputValue : lastMessage,
            isSeen: true,
          };
        } else {
          return {
            ...chat,
            lastMessage: inputValue ? inputValue : lastMessage,
          };
        }
      }
    );

    const updatedReceiverChat = receiverChats.map(
      (chat: { receiverId: string | undefined }) => {
        if (chat.receiverId === userId) {
          return {
            ...chat,
            updatedAt: new Date(),
            lastMessage: inputValue ? inputValue : lastMessage,
            isSeen: false,
          };
        } else {
          return {
            ...chat,
            lastMessage: inputValue ? inputValue : lastMessage,
          };
        }
      }
    );

    const sortedUserChat = updatedUserChat.sort(
      (a: { updatedAt: number }, b: { updatedAt: number }) =>
        b.updatedAt - a.updatedAt
    );

    if (userChatDoc.exists()) {
      await updateDoc(userChatDocRef, {
        chats: sortedUserChat,
      });
    }

    if (receiverChatDoc.exists()) {
      await updateDoc(receiverChatDocRef, {
        chats: updatedReceiverChat,
      });
    }
  };

  const sendMessage = async () => {
    if (!chatId || !user || !ClickedUser) return;

    if (!inputValue?.trim() && !file) {
      toast.warning("please enter an messages");
      return;
    }

    let image;
    if (file) {
      image = await upload(file[0]);
    }

    const chatDocRef = doc(db, "chats", chatId);

    const chatDoc = await getDoc(chatDocRef);

    updateUserChat(user.uid, ClickedUser.id);

    const userMessagesData = {
      chatId: chatId,
      senderId: user.uid,
      text: inputValue || "",
      image: image || "",
      createdAt: new Date(),
    };

    if (chatDoc.exists()) {
      await updateDoc(chatDocRef, {
        messages: arrayUnion(userMessagesData),
      });
    }

    setFile(null);
    setInputValue("");
  };

  return (
    <div className="flex flex-col flex-[2] text-white">
      <ToastContainer position="top-left" />
      {ClickedUser && chat && (
        <>
          <header className="sticky flex justify-between items-center p-4 flex-2 border-b-[1px] border-gray-500">
            <div className="flex items-center gap-5">
              <img
                src={isUserBlocked ? avatar : ClickedUser.avatar}
                alt="user pfp"
                className="rounded-full w-12 h-12"
              />
              <div>
                <p>{isUserBlocked ? "user" : ClickedUser.username}</p>
                <p>
                  {isUserBlocked ? "user has blocked you!" : ClickedUser.bio}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <img src={PhoneCallIcon} alt="phone call icon" className="w-6 " />
              <img src={videoCallIcon} alt="phone call icon" className="w-6 " />
              <img src={infoIcon} alt="phone call icon" className="w-6 " />
            </div>
          </header>

          <main className="flex-1  overflow-y-scroll scrollbar-custom  p-4">
            {chat &&
              user &&
              chat.map((chat) => {
                if (chat.senderId === user.uid) {
                  return chat.text && !chat.image ? (
                    <div className="flex gap-4 flex-row-reverse mb-3">
                      <img
                        src={user.photoURL || undefined}
                        alt="user pfp"
                        className="rounded-full w-7 h-7"
                      />
                      <div className="flex flex-col">
                        <span className="bg-sky-600 p-3 m-1 text-md rounded-md">
                          {chat.text}
                        </span>
                        <span className="text-[13px]">
                          <ReactTimeAgo
                            date={
                              chat.createdAt instanceof Date
                                ? chat.createdAt.getTime()
                                : chat.createdAt.toDate().getTime()
                            }
                            locale="en-US"
                          />
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-row-reverse">
                      <div className="flex flex-col ">
                        <img
                          src={chat.image}
                          alt="image"
                          className="w-96 h-52 mt-5 rounded-md object-cover"
                        />

                        {chat.text && (
                          <span className="bg-sky-600 w-96 p-3 m-1 text-md rounded-md">
                            {chat.text}
                          </span>
                        )}

                        <span className="text-sm mt-1">
                          <ReactTimeAgo
                            date={
                              chat.createdAt instanceof Date
                                ? chat.createdAt.getTime()
                                : chat.createdAt.toDate().getTime()
                            }
                            locale="en-US"
                          />
                        </span>
                      </div>
                    </div>
                  );
                } else {
                  return chat.text && !chat.image ? (
                    <div className="flex gap-4">
                      <img
                        src={ClickedUser.avatar}
                        alt="user pfp"
                        className="rounded-full w-7 h-7"
                      />
                      <div className="flex flex-col">
                        <span className="bg-gray-800 p-3 m-1 text-md rounded-md">
                          {chat.text}
                        </span>
                        <span className="text-[13px]">
                          <ReactTimeAgo
                            date={
                              chat.createdAt instanceof Date
                                ? chat.createdAt.getTime()
                                : chat.createdAt.toDate().getTime()
                            }
                            locale="en-US"
                          />
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <img
                        src={chat.image}
                        alt="image"
                        className="w-96 h-52 mt-5 rounded-md object-cover"
                      />

                      {chat.text && (
                        <span className="bg-gray-800 w-96 p-3 m-1 text-md rounded-md">
                          {chat.text}
                        </span>
                      )}

                      <span className="text-sm mt-1">
                        <ReactTimeAgo
                          date={
                            chat.createdAt instanceof Date
                              ? chat.createdAt.getTime()
                              : chat.createdAt.toDate().getTime()
                          }
                          locale="en-US"
                        />
                      </span>
                    </div>
                  );
                }
              })}
            <div ref={lastMessageRef}></div>
          </main>

          <footer className="flex items-center justify-between p-4 border-t-[1px] border-gray-500">
            <div className="flex gap-3">
              <div className="w-7 h-7 cursor-pointer">
                <input
                  type="file"
                  id="sendImage"
                  className="hidden "
                  disabled={isUserBlocked || isReceiverBlocked}
                  onChange={(e) => setFile(e.currentTarget.files)}
                />
                <label
                  htmlFor="sendImage"
                  className={`${
                    isUserBlocked || isReceiverBlocked
                      ? "cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  <img src={pictureIcon} alt="picture" className={`w-7 h-7`} />
                </label>
              </div>

              <img src={cameraIcon} alt="camera" className={`w-7 h-7 `} />
              <img src={micIcon} alt="voice" className={`w-7 h-7 `} />
            </div>

            <input
              type="text"
              className={`flex-grow p-3 bg-gray-700 mx-4 rounded focus:outline-none text-sm  ${
                isUserBlocked || isReceiverBlocked
                  ? "cursor-not-allowed"
                  : "cursor-text"
              }`}
              placeholder="type a message"
              value={inputValue}
              onChange={(e) => setInputValue(e.currentTarget.value)}
              onClick={() => setShowEmojiPicker(false)}
              disabled={isUserBlocked || isReceiverBlocked}
            />

            <div className="flex items-center gap-3">
              <img
                src={emojiesIcon}
                alt="emojis"
                className={`w-7 h-7 cursor-pointer ${
                  isUserBlocked || isReceiverBlocked
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                }`}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              />
              <div className="emoji-picker bottom-0 right-12 m-auto absolute">
                {showEmojiPicker && !isUserBlocked && !isReceiverBlocked && (
                  <EmojiPicker onEmojiClick={onEmojiClick} />
                )}
              </div>
              <button
                className={`px-4 py-2 bg-blue-500 text-white rounded ${
                  isUserBlocked || isReceiverBlocked
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                }`}
                onClick={sendMessage}
                disabled={isUserBlocked || isReceiverBlocked}
              >
                Send
              </button>
            </div>
          </footer>
        </>
      )}
    </div>
  );
};

export default MainChat;
