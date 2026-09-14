import { UploadFile } from "antd";
import dayjs from "dayjs";
import { FileCategory, EntityType } from "@/shared/constants/enum";
import { BASE_URL, HOST_URL, apiEndpoint } from "@/shared/constants/apiEndpoint";
import { buildUrlWithId } from "@/shared/utils/url.util";
import { File } from "@/shared/interfaces/file";
import { getInitialCurrentStore } from "@/shared/stores/global.slice";

const getFileRequestHeaders = (): Record<string, string> => {
  const currentStoreId = getInitialCurrentStore()?.id;
  return currentStoreId ? { "x-store-id": currentStoreId } : {};
};

export function parseFileInfo(fileName: string) {
  if (!fileName.includes("-")) {
    const [name, ext] = fileName.split(".");
    return {
      name,
      date: dayjs().format("DD/MM/YYYY"),
      ext: ext ? `.${ext}` : "",
    };
  }
  const fullFileName =
    fileName.substring(Math.max(fileName.lastIndexOf("/"), fileName.lastIndexOf("\\")) + 1) || "";

  // Tìm dấu . cuối cùng để tách extension
  const lastDotIndex = fullFileName.lastIndexOf(".");
  const nameWithTimestamp =
    lastDotIndex >= 0 ? fullFileName.substring(0, lastDotIndex) : fullFileName;
  const extension = lastDotIndex >= 0 ? fullFileName.substring(lastDotIndex) : "";

  // Tìm dấu - cuối cùng để tách timestamp
  const lastDashIndex = nameWithTimestamp.lastIndexOf("-");
  let originalName = nameWithTimestamp;
  let date: Date = new Date();

  if (lastDashIndex >= 0) {
    originalName = nameWithTimestamp.substring(0, lastDashIndex);
    const timestampStr = nameWithTimestamp.substring(lastDashIndex + 1);
    const timestamp = parseInt(timestampStr, 10);
    if (!isNaN(timestamp)) {
      date = new Date(timestamp);
    }
  }

  return {
    name: originalName,
    date: dayjs(date).format("DD/MM/YYYY"),
    ext: extension,
  };
}

export const downloadFile = (fileUrl: string) => {
  const url = (HOST_URL + fileUrl)?.replace("//uploads", "/uploads") || "";
  const a = document.createElement("a");
  a.href = url;
  a.download = ""; // backend quyết định filename
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const mapFileList = (files: string[]): UploadFile[] => {
  return files.map((url, index) => {
    const fullFileName = url.split("/").pop() || "";
    const [nameWithoutTime, ...extParts] = fullFileName.split(".");
    const lastDashIndex = nameWithoutTime.lastIndexOf("-");
    const originalName = nameWithoutTime.substring(0, lastDashIndex);
    const extension = extParts.length ? `.${extParts.join(".")}` : "";

    return {
      uid: `old-${index}`,
      name: `${originalName}${extension}`,
      status: "done",
      url: `${HOST_URL}${url}`,
    };
  });
};

interface UploadProps {
  files: UploadFile[];
  oId?: string;
  entity: EntityType;
  category: FileCategory;
  isActive?: boolean;
  messageApi?: {
    error: (content: string) => void;
  };
}
export async function uploads({
  files,
  oId,
  entity,
  category,
  isActive = false,
  messageApi,
}: UploadProps): Promise<File[] | null> {
  try {
    const deviceId = localStorage.getItem("deviceId");
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const formData = new FormData();

    const formatData = files.filter((file) => file.originFileObj && !file.url);

    // Append từng file vào formData
    formatData.forEach((file) => {
      if (file.originFileObj) {
        formData.append("files", file.originFileObj);
      }
    });

    // Append metadata
    if (oId) formData.append("entityId", oId);
    formData.append("entityType", entity);
    formData.append("category", category);
    formData.append("isActive", String(isActive));

    const response = await fetch(BASE_URL + apiEndpoint.files.base, {
      method: "POST",
      body: formData,
      credentials: "include",
      headers: {
        "x-device-id": deviceId || "1",
        "x-timezone": timeZone,
        ...getFileRequestHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const result = await response.json();
    return result?.data?.files;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);

    messageApi?.error("Tải lên không thành công. Vui lòng thử lại.");

    return null;
  }
}

// set main cho ảnh
export async function setMainFile(fileId: string): Promise<boolean> {
  try {
    const deviceId = localStorage.getItem("deviceId") || "1";
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const response = await fetch(BASE_URL + buildUrlWithId(apiEndpoint.files.setMain, fileId), {
      method: "POST",
      credentials: "include",
      headers: {
        "x-device-id": deviceId || "1",
        "x-timezone": timeZone,
        ...getFileRequestHeaders(),
      },
    });
    if (!response.ok) {
      const result = await response.json();
      console.error("Failed to set main file with id:", result);
      return false;
    }
    return true;
  } catch (error) {
    console.error("There was a problem with the set main operation:", error);
    return false;
  }
}

export async function deleteFile(
  fileId: string,
  messageApi?: {
    error: (content: string) => void;
  },
): Promise<boolean> {
  try {
    const deviceId = localStorage.getItem("deviceId");
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const response = await fetch(`${BASE_URL + apiEndpoint.files.base}/${fileId}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "x-device-id": deviceId || "1",
        "x-timezone": timeZone,
        ...getFileRequestHeaders(),
      },
    });
    if (!response.ok) {
      messageApi?.error("Xóa file không thành công. Vui lòng thử lại sau.");
      return false;
    }
    return true;
  } catch (error) {
    messageApi?.error("Xóa file không thành công. Vui lòng thử lại sau.");
    return false;
  }
}

/**
 * Delete all pending files for an entityId (called when user closes form without saving)
 */
export async function deletePendingFiles(entityId: string): Promise<boolean> {
  try {
    const deviceId = localStorage.getItem("deviceId");
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const response = await fetch(
      `${BASE_URL + apiEndpoint.files.deletePending}?entityId=${encodeURIComponent(entityId)}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          "x-device-id": deviceId || "1",
          "x-timezone": timeZone,
          ...getFileRequestHeaders(),
        },
      },
    );
    return response.ok;
  } catch (error) {
    console.error("Failed to delete pending files:", error);
    return false;
  }
}

// Tìm file chính của trong files
export function getMainFile(files: File[] | undefined | null): File | null {
  if (!files || files.length === 0) return null;
  const existingMain = files.find((file) => file.isMain);
  return existingMain || (files.length > 0 ? files[0] : null);
}

export const exportPdfFile = (content: string, fileName: string = "") => {};

// Get main image URL from files
export function getMainImage(files: File[] | undefined | null): string | null {
  const mainFile = getMainFile(files);
  if (!mainFile) return null;
  return mainFile.url || mainFile.thumbnailUrl || null;
}
