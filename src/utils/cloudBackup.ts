/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PromptHistoryItem } from '../types';

export interface BackupMetadata {
  isEnabled: boolean;
  provider: 'google-drive' | 'dropbox' | 'firebase' | 'icloud' | 'custom-backend' | null;
  interval: 'manual' | 'daily' | 'weekly' | 'instant';
  lastBackupTime: string | null;
}

export const getBackupConfig = (): BackupMetadata => {
  try {
    const raw = localStorage.getItem('arabi_prompt_backup_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      // Backwards compatibility
      return {
        isEnabled: parsed.isEnabled ?? (parsed.provider !== null),
        provider: parsed.provider || null,
        interval: parsed.interval || 'manual',
        lastBackupTime: parsed.lastBackupTime || null
      };
    }
  } catch (err) {
    console.error('Failed to parse backup config:', err);
  }
  return {
    isEnabled: false,
    provider: null,
    interval: 'manual',
    lastBackupTime: null
  };
};

export const saveBackupConfig = (config: BackupMetadata) => {
  try {
    localStorage.setItem('arabi_prompt_backup_config', JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save backup config:', err);
  }
};

/**
 * Searches for 'arabprompt_backup.json' in Google Drive.
 * Returns the file ID if found, otherwise null.
 */
export async function searchGDriveBackup(accessToken: string): Promise<string | null> {
  const query = encodeURIComponent("name = 'arabprompt_backup.json' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Google Drive API error: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }
  return null;
}

/**
 * Saves and uploads the backup file to Google Drive.
 */
export async function uploadGDriveBackup(accessToken: string, history: PromptHistoryItem[], fileId: string | null): Promise<string> {
  const metadata = {
    name: 'arabprompt_backup.json',
    mimeType: 'application/json',
    description: 'ArabPrompt application backup history data'
  };

  const fileData = JSON.stringify(history, null, 2);

  if (fileId) {
    // Update existing file
    const url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: fileData
    });

    if (!response.ok) {
      throw new Error(`Failed to update Google Drive backup file: ${response.statusText}`);
    }

    return fileId;
  } else {
    // Create new file
    const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    const contentBlob = new Blob([fileData], { type: 'application/json' });

    const form = new FormData();
    form.append('metadata', metadataBlob);
    form.append('file', contentBlob);

    const url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: form
    });

    if (!response.ok) {
      throw new Error(`Failed to upload new Google Drive backup file: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id;
  }
}

/**
 * Downloads and parses history items from Google Drive.
 */
export async function downloadGDriveBackup(accessToken: string, fileId: string): Promise<PromptHistoryItem[]> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to download backup content: ${response.statusText}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error('Retrieved backup is not a valid prompt history array.');
  }

  return data;
}

/**
 * Dropbox Integration Helpers (True API and fallback simulation workflow)
 */
export async function uploadDropboxBackup(accessToken: string, history: PromptHistoryItem[]): Promise<boolean> {
  const url = 'https://content.dropboxapi.com/2/files/upload';
  const fileData = JSON.stringify(history, null, 2);
  const arg = {
    path: '/arabprompt_backup.json',
    mode: 'overwrite',
    autorename: true,
    mute: false,
    strict_conflict: false
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Dropbox-API-Arg': JSON.stringify(arg),
      'Content-Type': 'application/octet-stream'
    },
    body: fileData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Dropbox upload error: ${errorText || response.statusText}`);
  }

  return true;
}

export async function downloadDropboxBackup(accessToken: string): Promise<PromptHistoryItem[]> {
  const url = 'https://content.dropboxapi.com/2/files/download';
  const arg = {
    path: '/arabprompt_backup.json'
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Dropbox-API-Arg': JSON.stringify(arg)
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Dropbox download error: ${errorText || response.statusText}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error('Dropbox backup is not a valid prompt history array.');
  }

  return data;
}

export async function backupToDropboxSimulated(history: PromptHistoryItem[]): Promise<boolean> {
  return new Promise((resolve) => {
    // Simulating safe cloud round-trip
    setTimeout(() => {
      resolve(true);
    }, 1250);
  });
}

/**
 * iCloud Integration Helpers (iCloud Drive Sandbox Simulation)
 */
export async function backupToICloudSimulated(history: PromptHistoryItem[]): Promise<boolean> {
  return new Promise((resolve) => {
    // Simulating secure Apple iCloud Drive file upload
    setTimeout(() => {
      resolve(true);
    }, 1200);
  });
}

/**
 * Custom Server Backend Integration Helpers (REST Proxy API simulation)
 */
export async function backupToCustomBackendSimulated(history: PromptHistoryItem[]): Promise<boolean> {
  return new Promise((resolve) => {
    // Simulating rest secure backup persistence
    setTimeout(() => {
      resolve(true);
    }, 1400);
  });
}
