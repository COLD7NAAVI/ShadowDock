import { Router } from "express";

import { authenticate }
    from "../../middleware/auth.middleware.js";

import {

    createAttachment,

    getAttachment,

    getMessageAttachments,

    completeUpload,

    updateAttachmentMetadata,

    markVirusScan,

    recordDownload,

    getChatAttachments,

    searchAttachments,

    deleteAttachment,

    countMessageAttachments,

    countUserUploads

} from "../../controllers/attachment.controller.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Attachment Routes
|--------------------------------------------------------------------------
|
| Base URL
|
| /api/v1/attachments
|
*/

/*
|--------------------------------------------------------------------------
| Create Attachment
|--------------------------------------------------------------------------
|
| POST /attachments
|
*/

router.post(
    "/",
    authenticate,
    createAttachment
);

/*
|--------------------------------------------------------------------------
| Get Attachment
|--------------------------------------------------------------------------
|
| GET /attachments/:attachmentPublicId
|
*/

router.get(
    "/:attachmentPublicId",
    authenticate,
    getAttachment
);

/*
|--------------------------------------------------------------------------
| Complete Upload
|--------------------------------------------------------------------------
|
| PATCH /attachments/:attachmentPublicId/complete
|
*/

router.patch(
    "/:attachmentPublicId/complete",
    authenticate,
    completeUpload
);

/*
|--------------------------------------------------------------------------
| Update Attachment Metadata
|--------------------------------------------------------------------------
|
| PATCH /attachments/:attachmentPublicId/metadata
|
*/

router.patch(
    "/:attachmentPublicId/metadata",
    authenticate,
    updateAttachmentMetadata
);

/*
|--------------------------------------------------------------------------
| Mark Virus Scan
|--------------------------------------------------------------------------
|
| PATCH /attachments/:attachmentPublicId/virus-scan
|
*/

router.patch(
    "/:attachmentPublicId/virus-scan",
    authenticate,
    markVirusScan
);

/*
|--------------------------------------------------------------------------
| Record Download
|--------------------------------------------------------------------------
|
| POST /attachments/:attachmentPublicId/download
|
*/

router.post(
    "/:attachmentPublicId/download",
    authenticate,
    recordDownload
);

/*
|--------------------------------------------------------------------------
| Delete Attachment
|--------------------------------------------------------------------------
|
| DELETE /attachments/:attachmentPublicId
|
*/

router.delete(
    "/:attachmentPublicId",
    authenticate,
    deleteAttachment
);

/*
|--------------------------------------------------------------------------
| Message Attachments
|--------------------------------------------------------------------------
|
| GET /attachments/message/:messagePublicId
|
*/

router.get(
    "/message/:messagePublicId",
    authenticate,
    getMessageAttachments
);

/*
|--------------------------------------------------------------------------
| Message Attachment Count
|--------------------------------------------------------------------------
|
| GET /attachments/message/:messagePublicId/count
|
*/

router.get(
    "/message/:messagePublicId/count",
    authenticate,
    countMessageAttachments
);

/*
|--------------------------------------------------------------------------
| Chat Attachments
|--------------------------------------------------------------------------
|
| GET /attachments/chat/:chatPublicId
|
*/

router.get(
    "/chat/:chatPublicId",
    authenticate,
    getChatAttachments
);

/*
|--------------------------------------------------------------------------
| Search Attachments
|--------------------------------------------------------------------------
|
| GET /attachments/chat/:chatPublicId/search
|
*/

router.get(
    "/chat/:chatPublicId/search",
    authenticate,
    searchAttachments
);

/*
|--------------------------------------------------------------------------
| User Upload Statistics
|--------------------------------------------------------------------------
|
| GET /attachments/user/uploads/count
|
*/

router.get(
    "/user/uploads/count",
    authenticate,
    countUserUploads
);

/*
|--------------------------------------------------------------------------
| Status
|--------------------------------------------------------------------------
|
| ✓ Production Ready
| ✓ RESTful Routes
| ✓ Thin Router
| ✓ Authentication Protected
| ✓ Controller Driven
| ✓ Service Driven
| ✓ Repository Pattern
| ✓ Upload Lifecycle Ready
| ✓ Cloud Storage Ready
| ✓ Future E2EE Compatible
|
*/

export default router;