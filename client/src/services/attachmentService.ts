import api from '../lib/api';

export interface Attachment {
  id: string;
  name: string;
  fileName?: string;
  filePath?: string;
  url?: string;
  fileSize?: number;
  mimeType?: string;
  type: 'file' | 'link';
  cardId: string;
  uploadedById: string;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export const uploadAttachment = async (cardId: string, file: File, name?: string): Promise<Attachment> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (name) {
      formData.append('name', name);
    }

    console.log('Uploading attachment:', { cardId, fileName: file.name, fileSize: file.size });

    const response = await api.post(`/api/cards/${cardId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Upload response:', response.data);
    return response.data.attachment;
  } catch (error: any) {
    console.error('Upload attachment error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to upload attachment');
  }
};

export const addLinkAttachment = async (cardId: string, name: string, url: string): Promise<Attachment> => {
  const response = await api.post(`/api/cards/${cardId}/attachments/link`, { name, url });
  return response.data.attachment;
};

export const deleteAttachment = async (attachmentId: string): Promise<void> => {
  await api.delete(`/api/attachments/${attachmentId}`);
};

export const getAttachmentUrl = (attachment: Attachment): string => {
  if (attachment.type === 'link' && attachment.url) {
    return attachment.url;
  }
  
  if (attachment.type === 'file' && attachment.filePath) {
    // Convert server file path to accessible URL
    const fileName = attachment.fileName || attachment.name;
    return `/uploads/${fileName}`;
  }
  
  return '';
};
