import { storage } from "../config/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const upload = async (file: File) => {
  if (!file) return;

  const storageRef = ref(storage, `images/${file.name}`);

  try {
    const snapshot = await uploadBytes(storageRef, file);

    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error("Upload failed", error);
  }
};

export default upload;
