export interface DriveConfig {
  clientId: string;
  folderId: string | null;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  webContentLink: string;
  createdTime: string;
  size: string;
}

export interface DriveUploadMetadata {
  name: string;
  mimeType: string;
  parents?: string[];
}

export interface DriveTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface DriveApiError {
  error: {
    code: number;
    message: string;
    status: string;
  };
}

/** Returned by DriveService.uploadScreenshot on success. */
export interface DriveUploadResult {
  fileName: string;
  fileId: string;
  /** Public share URL — valid for anyone with the link. */
  publicUrl: string;
  createdDate: string;
}

export type DriveErrorCode =
  | 'NOT_AUTHENTICATED'
  | 'UPLOAD_FAILED'
  | 'PERMISSION_FAILED'
  | 'FOLDER_CREATION_FAILED'
  | 'UNKNOWN';

export class DriveUploadError extends Error {
  readonly code: DriveErrorCode;

  constructor(code: DriveErrorCode, message: string) {
    super(message);
    this.name = 'DriveUploadError';
    this.code = code;
    Object.setPrototypeOf(this, DriveUploadError.prototype);
  }

  get userMessage(): string {
    switch (this.code) {
      case 'NOT_AUTHENTICATED':
        return 'Google sign-in required. Please connect your account in Settings.';
      case 'UPLOAD_FAILED':
        return 'Screenshot upload to Drive failed. Check your connection and try again.';
      case 'PERMISSION_FAILED':
        return 'Could not make the screenshot public on Drive.';
      case 'FOLDER_CREATION_FAILED':
        return 'Could not create or locate the Drive folder for screenshots.';
      default:
        return 'An unexpected Drive error occurred.';
    }
  }
}
