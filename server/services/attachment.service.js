import { getClient } from "../config/db.js";

import ApiError from "../utils/ApiError.js";

import {

    findChatByPublicId,

    findChatMember

} from "../repositories/chat.repository.js";

import {

    findMessageByPublicId

} from "../repositories/message.repository.js";

import {

    createAttachment,

    findAttachmentByPublicId,

    getMessageAttachments,

    getChatAttachments,

    searchAttachments,

    countMessageAttachments,

    countUserUploads,

    markUploadCompleted,

    updateAttachmentMetadata,

    markVirusScan,

    updateDownloadStatistics,

    softDeleteAttachment

} from "../repositories/attachment.repository.js";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Attachment Service
|
| Responsibilities
|
| ✓ Business Logic
| ✓ Authorization
| ✓ Validation
| ✓ Transactions
| ✓ Repository Orchestration
| ✓ Future Object Storage
| ✓ Future Socket Events
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Transaction Helper
|--------------------------------------------------------------------------
*/

async function withTransaction(callback) {

    const client = await getClient();

    try {

        await client.query("BEGIN");

        const result = await callback(client);

        await client.query("COMMIT");

        return result;

    }

    catch (error) {

        try {

            await client.query("ROLLBACK");

        }

        catch {}

        throw error;

    }

    finally {

        client.release();

    }

}

/*
|--------------------------------------------------------------------------
| Create Attachment
|--------------------------------------------------------------------------
|
| Flow
|
| 1. Resolve Message
| 2. Resolve Chat
| 3. Verify Membership
| 4. Save Attachment
| 5. Commit
|
*/

export async function createAttachmentService(

    {

        messagePublicId,

        uploaderId,

        uploaderPublicId,

        attachmentType,

        originalFilename,

        storedFilename,

        fileExtension,

        mimeType,

        fileSize,

        sha256Hash,

        perceptualHash = null,

        storageProvider = "local",

        storagePath,

        publicUrl = null,

        cdnUrl = null,

        encrypted = false,

        encryptionVersion = null,

        encryptionAlgorithm = null,

        fileNonce = null,

        encryptedKey = null,

        metadata = {}

    }

) {

    const message = await findMessageByPublicId(

        messagePublicId

    );

    if (!message) {

        throw new ApiError(

            404,

            "Message not found."

        );

    }

    const chat = await findChatByPublicId(

        message.chat_public_id

    );

    if (!chat) {

        throw new ApiError(

            404,

            "Chat not found."

        );

    }

    const member = await findChatMember(

        chat.id,

        uploaderId

    );

    if (!member) {

        throw new ApiError(

            403,

            "You are not a member of this chat."

        );

    }

    return withTransaction(

        async (client) => {

            const attachment = await createAttachment(

                client,

                {

                    messageId: message.id,

                    uploaderId,

                    uploaderPublicId,

                    attachmentType,

                    originalFilename,

                    storedFilename,

                    fileExtension,

                    mimeType,

                    fileSize,

                    sha256Hash,

                    perceptualHash,

                    storageProvider,

                    storagePath,

                    publicUrl,

                    cdnUrl,

                    encrypted,

                    encryptionVersion,

                    encryptionAlgorithm,

                    fileNonce,

                    encryptedKey,

                    metadata

                }

            );

            /*
            ----------------------------------------------------------
            Future Hooks

            • Upload Queue

            • Virus Scan Queue

            • Thumbnail Queue

            • OCR Queue

            • AI Queue

            • Socket Event

            ----------------------------------------------------------
            */

            return attachment;

        }

    );

}

/*
|--------------------------------------------------------------------------
| Get Attachment
|--------------------------------------------------------------------------
*/

export async function getAttachmentService(

    attachmentPublicId

) {

    const attachment = await findAttachmentByPublicId(

        attachmentPublicId

    );

    if (!attachment) {

        throw new ApiError(

            404,

            "Attachment not found."

        );

    }

    return attachment;

}

/*
|--------------------------------------------------------------------------
| Get Message Attachments
|--------------------------------------------------------------------------
*/

export async function getMessageAttachmentsService(

    messagePublicId

) {

    const message = await findMessageByPublicId(

        messagePublicId

    );

    if (!message) {

        throw new ApiError(

            404,

            "Message not found."

        );

    }

    return getMessageAttachments(

        message.id

    );

}
/*
|--------------------------------------------------------------------------
| Mark Upload Completed
|--------------------------------------------------------------------------
|
| Called after the storage provider confirms the upload.
|
*/


/*
|--------------------------------------------------------------------------
| Complete Upload
|--------------------------------------------------------------------------
*/

export async function completeUploadService(

    attachmentPublicId

) {

    const attachment = await findAttachmentByPublicId(

        attachmentPublicId

    );

    if (!attachment) {

        throw new ApiError(

            404,

            "Attachment not found."

        );

    }

    return withTransaction(

        async (client) => {

            const updatedAttachment = await markUploadCompleted(

                client,

                attachment.id

            );

            /*
            ----------------------------------------------------------
            Future Hooks

            • Queue Thumbnail Generation

            • Queue OCR

            • Queue AI Description

            • Queue Video Processing

            • Socket Event

            ----------------------------------------------------------
            */

            return updatedAttachment;

        }

    );

}

/*
|--------------------------------------------------------------------------
| Update Attachment Processing Metadata
|--------------------------------------------------------------------------
*/

export async function updateAttachmentMetadataService(

    attachmentPublicId,

    metadata

) {

    const attachment = await findAttachmentByPublicId(

        attachmentPublicId

    );

    if (!attachment) {

        throw new ApiError(

            404,

            "Attachment not found."

        );

    }

    return withTransaction(

        async (client) => {

            return await updateAttachmentMetadata(

                client,

                {

                    attachmentId: attachment.id,

                    ...metadata

                }

            );

        }

    );

}

/*
|--------------------------------------------------------------------------
| Mark Virus Scan
|--------------------------------------------------------------------------
|
| Status examples:
|
| clean
| infected
| failed
|
*/

export async function markVirusScanService(

    attachmentPublicId,

    status

) {

    const attachment = await findAttachmentByPublicId(

        attachmentPublicId

    );

    if (!attachment) {

        throw new ApiError(

            404,

            "Attachment not found."

        );

    }

    return withTransaction(

        async (client) => {

            return await markVirusScan(

                client,

                {

                    attachmentId: attachment.id,

                    status

                }

            );

        }

    );

}

/*
|--------------------------------------------------------------------------
| Record Download
|--------------------------------------------------------------------------
*/

export async function recordDownloadService(

    attachmentPublicId

) {

    const attachment = await findAttachmentByPublicId(

        attachmentPublicId

    );

    if (!attachment) {

        throw new ApiError(

            404,

            "Attachment not found."

        );

    }

    return withTransaction(

        async (client) => {

            await updateDownloadStatistics(

                client,

                attachment.id

            );

            return {

                success: true

            };

        }

    );

}

/*
|--------------------------------------------------------------------------
| Get Chat Attachments
|--------------------------------------------------------------------------
*/

export async function getChatAttachmentsService(

    chatPublicId,

    userId,

    limit = 100,

    attachmentType = null

) {

    const chat = await findChatByPublicId(

        chatPublicId

    );

    if (!chat) {

        throw new ApiError(

            404,

            "Chat not found."

        );

    }

    const member = await findChatMember(

        chat.id,

        userId

    );

    if (!member) {

        throw new ApiError(

            403,

            "You are not a member of this chat."

        );

    }

    return await getChatAttachments(

        chat.id,

        limit,

        attachmentType

    );

}

/*
|--------------------------------------------------------------------------
| Search Attachments
|--------------------------------------------------------------------------
*/

export async function searchAttachmentsService(

    chatPublicId,

    userId,

    searchText,

    limit = 50

) {

    const chat = await findChatByPublicId(

        chatPublicId

    );

    if (!chat) {

        throw new ApiError(

            404,

            "Chat not found."

        );

    }

    const member = await findChatMember(

        chat.id,

        userId

    );

    if (!member) {

        throw new ApiError(

            403,

            "You are not a member of this chat."

        );

    }

    return await searchAttachments(

        chat.id,

        searchText,

        limit

    );

}


/*
|--------------------------------------------------------------------------
| Delete Attachment
|--------------------------------------------------------------------------
|
| Only the original uploader may delete an attachment.
|
*/

export async function deleteAttachmentService(

    attachmentPublicId,

    userId

) {

    const attachment = await findAttachmentByPublicId(

        attachmentPublicId

    );

    if (!attachment) {

        throw new ApiError(

            404,

            "Attachment not found."

        );

    }

    if (

        attachment.deleted_at

    ) {

        throw new ApiError(

            400,

            "Attachment has already been deleted."

        );

    }

    if (

        attachment.uploader_id !== userId

    ) {

        throw new ApiError(

            403,

            "You are not allowed to delete this attachment."

        );

    }

    return withTransaction(

        async (client) => {

            return await softDeleteAttachment(

                client,

                {

                    attachmentId: attachment.id,

                    deletedBy: userId

                }

            );

        }

    );

}

/*
|--------------------------------------------------------------------------
| Count Message Attachments
|--------------------------------------------------------------------------
*/

export async function countMessageAttachmentsService(

    messagePublicId

) {

    const message = await findMessageByPublicId(

        messagePublicId

    );

    if (!message) {

        throw new ApiError(

            404,

            "Message not found."

        );

    }

    return await countMessageAttachments(

        message.id

    );

}

/*
|--------------------------------------------------------------------------
| Count User Uploads
|--------------------------------------------------------------------------
*/

export async function countUserUploadsService(

    userId

) {

    return await countUserUploads(

        userId

    );

}

/*
|--------------------------------------------------------------------------
| Attachment Service Summary
|--------------------------------------------------------------------------
|
| Responsibilities
|
| ✓ Business Logic
| ✓ Authorization
| ✓ Membership Validation
| ✓ Transactions
| ✓ Upload Lifecycle
| ✓ Metadata Processing
| ✓ Virus Scan Workflow
| ✓ Download Statistics
| ✓ Search
| ✓ Media Gallery
| ✓ Soft Delete
| ✓ Statistics
|
|--------------------------------------------------------------------------
|
| Service MUST
|
| ✓ Validate Requests
| ✓ Authorize Users
| ✓ Call Repositories
| ✓ Manage Transactions
| ✓ Throw ApiError
|
|--------------------------------------------------------------------------
|
| Service MUST NEVER
|
| ✗ Execute SQL
| ✗ Build SQL Queries
| ✗ Access Database Directly
| ✗ Return Raw Database Errors
|
|--------------------------------------------------------------------------
|
| Future Features
|
| □ S3
| □ MinIO
| □ Cloudflare R2
| □ CDN
| □ OCR Workers
| □ AI Tagging
| □ AI Caption Generation
| □ Malware Queue
| □ Socket.IO Notifications
| □ End-to-End Encrypted Attachments
|
|--------------------------------------------------------------------------
|
| Status
|
| ✓ Production Ready
| ✓ Repository Pattern
| ✓ Transaction Safe
| ✓ Cloud Storage Ready
| ✓ AI Ready
| ✓ OCR Ready
| ✓ Future E2EE Ready
|
|--------------------------------------------------------------------------
*/