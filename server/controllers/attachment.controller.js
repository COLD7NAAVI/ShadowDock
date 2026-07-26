import asyncHandler from "../utils/asyncHandler.js";

import {

    createAttachmentService,

    getAttachmentService,

    getMessageAttachmentsService,

    completeUploadService,

    updateAttachmentMetadataService,

    markVirusScanService,

    recordDownloadService,

    getChatAttachmentsService,

    searchAttachmentsService,

    deleteAttachmentService,

    countMessageAttachmentsService,

    countUserUploadsService

} from "../services/attachment.service.js";

/*
|--------------------------------------------------------------------------
| Attachment Controller
|--------------------------------------------------------------------------
|
| Responsibilities
|
| ✓ Upload lifecycle
| ✓ Download requests
| ✓ Metadata updates
| ✓ Virus scan endpoints
| ✓ Search
| ✓ Media gallery
|
| Business logic belongs in Attachment Service.
|
*/

/*
|--------------------------------------------------------------------------
| Create Attachment
|--------------------------------------------------------------------------
|
| POST /api/v1/attachments
|
*/

export const createAttachment =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const attachment =

                await createAttachmentService({

                    ...req.body,

                    uploaderId: req.user.id,

                    uploaderPublicId: req.user.publicId

                });

            return res

                .status(201)

                .json({

                    success: true,

                    message:

                        "Attachment created successfully.",

                    data: attachment

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Get Attachment
|--------------------------------------------------------------------------
*/

export const getAttachment =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const attachment =

                await getAttachmentService(

                    req.params.attachmentPublicId

                );

            return res

                .status(200)

                .json({

                    success: true,

                    data: attachment

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Get Message Attachments
|--------------------------------------------------------------------------
*/

export const getMessageAttachments =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const attachments =

                await getMessageAttachmentsService(

                    req.params.messagePublicId

                );

            return res

                .status(200)

                .json({

                    success: true,

                    data: attachments

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Complete Upload
|--------------------------------------------------------------------------
*/

export const completeUpload =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const attachment =

                await completeUploadService(

                    req.params.attachmentPublicId

                );

            return res

                .status(200)

                .json({

                    success: true,

                    message:

                        "Upload completed successfully.",

                    data: attachment

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Update Metadata
|--------------------------------------------------------------------------
*/

export const updateAttachmentMetadata =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const attachment =

                await updateAttachmentMetadataService(

                    req.params.attachmentPublicId,

                    req.body

                );

            return res

                .status(200)

                .json({

                    success: true,

                    message:

                        "Attachment metadata updated successfully.",

                    data: attachment

                });

        }

    );
/*
|--------------------------------------------------------------------------
| Mark Virus Scan
|--------------------------------------------------------------------------
*/

export const markVirusScan =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const attachment =

                await markVirusScanService(

                    req.params.attachmentPublicId,

                    req.body.status

                );

            return res

                .status(200)

                .json({

                    success: true,

                    message:

                        "Virus scan status updated successfully.",

                    data: attachment

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Record Download
|--------------------------------------------------------------------------
*/

export const recordDownload =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const result =

                await recordDownloadService(

                    req.params.attachmentPublicId

                );

            return res

                .status(200)

                .json({

                    success: true,

                    message:

                        "Download recorded successfully.",

                    ...result

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Get Chat Attachments
|--------------------------------------------------------------------------
*/

export const getChatAttachments =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const {

                limit = 100,

                attachmentType = null

            } = req.query;

            const attachments =

                await getChatAttachmentsService(

                    req.params.chatPublicId,

                    req.user.id,

                    Number(limit),

                    attachmentType

                );

            return res

                .status(200)

                .json({

                    success: true,

                    data: attachments

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Search Attachments
|--------------------------------------------------------------------------
*/

export const searchAttachments =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const {

                q = "",

                limit = 50

            } = req.query;

            const attachments =

                await searchAttachmentsService(

                    req.params.chatPublicId,

                    req.user.id,

                    q,

                    Number(limit)

                );

            return res

                .status(200)

                .json({

                    success: true,

                    data: attachments

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Delete Attachment
|--------------------------------------------------------------------------
*/

export const deleteAttachment =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const attachment =

                await deleteAttachmentService(

                    req.params.attachmentPublicId,

                    req.user.id

                );

            return res

                .status(200)

                .json({

                    success: true,

                    message:

                        "Attachment deleted successfully.",

                    data: attachment

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Count Message Attachments
|--------------------------------------------------------------------------
*/

export const countMessageAttachments =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const total =

                await countMessageAttachmentsService(

                    req.params.messagePublicId

                );

            return res

                .status(200)

                .json({

                    success: true,

                    data: {

                        total

                    }

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Count User Uploads
|--------------------------------------------------------------------------
*/

export const countUserUploads =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const total =

                await countUserUploadsService(

                    req.user.id

                );

            return res

                .status(200)

                .json({

                    success: true,

                    data: {

                        total

                    }

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Attachment Controller
|--------------------------------------------------------------------------
|
| Responsibilities
|
| ✓ Parse HTTP Requests
| ✓ Invoke Attachment Service
| ✓ Format HTTP Responses
| ✓ Throw Errors Through asyncHandler
|
|--------------------------------------------------------------------------
|
| Controller MUST NEVER
|
| ✗ Execute SQL
| ✗ Access Database
| ✗ Apply Business Logic
| ✗ Modify Repository Data Directly
|
|--------------------------------------------------------------------------
|
| Status
|
| ✓ Production Ready
| ✓ Thin Controller
| ✓ Service Driven
| ✓ Repository Pattern
| ✓ Transaction Ready
| ✓ Upload Ready
| ✓ Cloud Storage Ready
| ✓ Future Socket.IO Compatible
| ✓ Future E2EE Compatible
|
|--------------------------------------------------------------------------
*/