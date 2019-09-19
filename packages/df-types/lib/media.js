"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const codec_1 = require("@polkadot/types/codec");
const types_1 = require("@polkadot/types");
const _1 = require("./");
const util_crypto_1 = require("@polkadot/util-crypto");
const keyring_1 = require("@polkadot/keyring");
const util_1 = require("@polkadot/util");
class ContentId extends types_1.Hash {
    static generate() {
        // randomAsU8a uses https://www.npmjs.com/package/tweetnacl#random-bytes-generation
        return new ContentId(util_crypto_1.randomAsU8a());
    }
    /** This function is for backward-compatibility with content ids that were generated as UUID. */
    // TODO Delete this backward-compatibility when a new version of blockchain launched.
    static isUuidFormat(contentId) {
        return typeof contentId === 'string'
            ? contentId.indexOf('-') > 0
            : contentId.indexOf('-'.charCodeAt(0)) > 0;
    }
    static fromAddress(contentId) {
        return new ContentId(ContentId.isUuidFormat(contentId)
            ? util_1.stringToU8a(contentId)
            : keyring_1.decodeAddress(contentId));
    }
    static toAddress(contentId) {
        return ContentId.isUuidFormat(contentId)
            ? util_1.u8aToString(contentId)
            : keyring_1.encodeAddress(contentId);
    }
    toAddress() {
        return ContentId.toAddress(this);
    }
}
exports.ContentId = ContentId;
class DataObjectTypeId extends types_1.u64 {
}
exports.DataObjectTypeId = DataObjectTypeId;
class DataObjectStorageRelationshipId extends types_1.u64 {
}
exports.DataObjectStorageRelationshipId = DataObjectStorageRelationshipId;
class SchemaId extends types_1.u64 {
}
exports.SchemaId = SchemaId;
class DownloadSessionId extends types_1.u64 {
}
exports.DownloadSessionId = DownloadSessionId;
class BlockAndTime extends codec_1.Struct {
    constructor(value) {
        super({
            block: types_1.BlockNumber,
            time: types_1.Moment
        }, value);
    }
    get block() {
        return this.get('block');
    }
    get time() {
        return this.get('time');
    }
}
exports.BlockAndTime = BlockAndTime;
class ContentVisibility extends codec_1.Enum {
    constructor(value) {
        super([
            'Draft',
            'Public'
        ], value);
    }
}
exports.ContentVisibility = ContentVisibility;
class VecContentId extends codec_1.Vector.with(ContentId) {
}
exports.VecContentId = VecContentId;
class ContentMetadata extends codec_1.Struct {
    constructor(value) {
        super({
            owner: types_1.AccountId,
            added_at: BlockAndTime,
            children_ids: VecContentId,
            visibility: ContentVisibility,
            schema: SchemaId,
            json: types_1.Text
        }, value);
    }
    get owner() {
        return this.get('owner');
    }
    get added_at() {
        return this.get('added_at');
    }
    get children_ids() {
        return this.get('children_ids');
    }
    get visibility() {
        return this.get('visibility');
    }
    get schema() {
        return this.get('schema');
    }
    get json() {
        return this.get('json');
    }
    parseJson() {
        return JSON.parse(this.json.toString());
    }
}
exports.ContentMetadata = ContentMetadata;
class OptionVecContentId extends codec_1.Option.with(VecContentId) {
}
exports.OptionVecContentId = OptionVecContentId;
class OptionSchemaId extends codec_1.Option.with(SchemaId) {
}
exports.OptionSchemaId = OptionSchemaId;
class OptionContentVisibility extends codec_1.Option.with(ContentVisibility) {
}
exports.OptionContentVisibility = OptionContentVisibility;
class ContentMetadataUpdate extends codec_1.Struct {
    constructor(value) {
        super({
            children_ids: OptionVecContentId,
            visibility: OptionContentVisibility,
            schema: OptionSchemaId,
            json: _1.OptionText
        }, value);
    }
}
exports.ContentMetadataUpdate = ContentMetadataUpdate;
class LiaisonJudgement extends codec_1.Enum {
    constructor(value) {
        super([
            'Pending',
            'Accepted',
            'Rejected'
        ], value);
    }
}
exports.LiaisonJudgement = LiaisonJudgement;
class DataObject extends codec_1.Struct {
    constructor(value) {
        super({
            owner: types_1.AccountId,
            added_at: BlockAndTime,
            type_id: DataObjectTypeId,
            size: types_1.u64,
            liaison: types_1.AccountId,
            liaison_judgement: LiaisonJudgement
        }, value);
    }
    get owner() {
        return this.get('owner');
    }
    get added_at() {
        return this.get('added_at');
    }
    get type_id() {
        return this.get('type_id');
    }
    /** Actually it's 'size', but 'size' is already reserved by a parent class. */
    get size_in_bytes() {
        return this.get('size');
    }
    get liaison() {
        return this.get('liaison');
    }
    get liaison_judgement() {
        return this.get('liaison_judgement');
    }
}
exports.DataObject = DataObject;
class DataObjectStorageRelationship extends codec_1.Struct {
    constructor(value) {
        super({
            content_id: ContentId,
            storage_provider: types_1.AccountId,
            ready: types_1.Bool
        }, value);
    }
    get content_id() {
        return this.get('content_id');
    }
    get storage_provider() {
        return this.get('storage_provider');
    }
    get ready() {
        return this.get('ready');
    }
}
exports.DataObjectStorageRelationship = DataObjectStorageRelationship;
class DataObjectType extends codec_1.Struct {
    constructor(value) {
        super({
            description: types_1.Text,
            active: types_1.Bool
        }, value);
    }
    get description() {
        return this.get('description');
    }
    get active() {
        return this.get('active');
    }
}
exports.DataObjectType = DataObjectType;
class DownloadState extends codec_1.Enum {
    constructor(value) {
        super([
            'Started',
            'Ended'
        ], value);
    }
}
exports.DownloadState = DownloadState;
class DownloadSession extends codec_1.Struct {
    constructor(value) {
        super({
            content_id: ContentId,
            consumer: types_1.AccountId,
            distributor: types_1.AccountId,
            initiated_at_block: types_1.BlockNumber,
            initiated_at_time: types_1.Moment,
            state: DownloadState,
            transmitted_bytes: types_1.u64
        }, value);
    }
    get content_id() {
        return this.get('content_id');
    }
    get consumer() {
        return this.get('consumer');
    }
    get distributor() {
        return this.get('distributor');
    }
    get initiated_at_block() {
        return this.get('initiated_at_block');
    }
    get initiated_at_time() {
        return this.get('initiated_at_time');
    }
    get state() {
        return this.get('state');
    }
    get transmitted_bytes() {
        return this.get('transmitted_bytes');
    }
}
exports.DownloadSession = DownloadSession;
function registerMediaTypes() {
    try {
        types_1.getTypeRegistry().register({
            '::ContentId': ContentId,
            '::DataObjectTypeId': DataObjectTypeId,
            SchemaId,
            ContentId,
            ContentVisibility,
            ContentMetadata,
            ContentMetadataUpdate,
            LiaisonJudgement,
            DataObject,
            DataObjectStorageRelationshipId,
            DataObjectStorageRelationship,
            DataObjectTypeId,
            DataObjectType,
            DownloadState,
            DownloadSessionId,
            DownloadSession
        });
    }
    catch (err) {
        console.error('Failed to register custom types of media module', err);
    }
}
exports.registerMediaTypes = registerMediaTypes;
