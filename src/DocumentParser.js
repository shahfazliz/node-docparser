import docparser from 'docparser-node';

/**
   * List of available parsers created
   */
export const ParserIds = {
  'Cash Orders Report': 'injkrceqmwxy',
  'Maybank Daily Booking Report': 'iwdlifylqpae',
  'UOB Daily Subscription Daily Booking Summary': 'sjvhyxphmcwu',
};

export class DocumentParser {
  constructor ({
    DOCPARSERKEY,
  }) {
    // Static variables
    DocumentParser.QUOTA_LEFT = 0;
    DocumentParser.QUOTA_REFILL = 0;
    DocumentParser.QUOTA_USED = 0;

    this.client = new docparser.Client(DOCPARSERKEY);

    this
      .client
      .ping()
      .then(() => {
        console.log('Authentication Succeeded');
      })
      .catch(error => {
        console.log('Authentication Failed\n', error);
      });
  }

  uploadFile ({
    errorCallback = console.log,
    singleFilePath,
    parserId,
    remoteId = undefined, // User identifier that only allow the user only can download their uploaded file
    successCallback = console.log,
  }) {
    this.parserId = parserId;
    this.remoteId = remoteId;

    this
      .client
      .uploadFileByPath(
        parserId,
        singleFilePath,
        JSON.parse(JSON.stringify({ // Remove undefined values
          remote_id: remoteId,
        })))
    /**
         * Sample output response = {
         *  id: "document_id",
         *  file_size: 198989,
         *  quota_used: 16,
         *  quota_left: 34,
         *  quota_refill: "1970-01-01T00:00:00+00:00",
         * }
         */
      .then(response => {
        DocumentParser.QUOTA_LEFT = response.quota_left;
        DocumentParser.QUOTA_REFILL = response.quota_refill;
        DocumentParser.QUOTA_USED = response.quota_used;

        this.documentId = response.id;

        successCallback(response);
      })
      .catch(errorCallback);
  }

  getParsedDocument ({
    documentId = this.documentId,
    errorCallback = console.log,
    format = 'object', // 'flat'
    parserId = this.parserId,
    successCallback = console.log,
  }) {
    this
      .client
      .getResultsByDocument(parserId, documentId, {
        format,
      })
      .then(successCallback)
      .catch(errorCallback);
  }

  getAllParsedDocuments ({
    errorCallback = console.log,
    format = 'object', // 'flat'
    from,
    parserId = this.parserId,
    successCallback = console.log,
    remoteId = this.remoteId,
  }) {
    this
      .client
      .getResultsByParser(
        parserId,
        JSON.parse(JSON.stringify({ // Remove undefined values
          date: from,
          format,
          list: 'uploaded_after',
          remoteId,
        })))
      .then(successCallback)
      .catch(errorCallback);
  }
}
