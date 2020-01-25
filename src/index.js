import docparser from 'docparser-node';
import moment from 'moment';

class NodeDocparser {
  constructor ({
    DOCPARSERKEY,
  }) {
    // Static variables
    NodeDocparser.QUOTA_LEFT = 0;
    NodeDocparser.QUOTA_REFILL = 0;
    NodeDocparser.QUOTA_USED = 0;

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
        NodeDocparser.QUOTA_LEFT = response.quota_left;
        NodeDocparser.QUOTA_REFILL = response.quota_refill;
        NodeDocparser.QUOTA_USED = response.quota_used;

        this.documentId = response.id;

        successCallback(response);
      })
      .catch(errorCallback);
  }

  getParsedFile ({
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

  getParsed ({
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

/**
 * List of available parsers created
 */
const parserIds = {
  'Cash Orders Report': 'injkrceqmwxy',
  'Maybank Daily Booking Report': 'iwdlifylqpae',
  'UOB Daily Subscription Daily Booking Summary': 'sjvhyxphmcwu',
};

/**
 * args are the arguments form node cli
 * args[0]: the parser name to find the right parserId
 * args[1]: the path to a single file
 */
const args = process
  .argv
  .slice(2); // remove  node by taking 2nd element onwards

const parser = new NodeDocparser({ DOCPARSERKEY: process.env.DOCPARSERKEY });

parser.uploadFile({
  parserId: parserIds[args[0]],
  remoteId: '810802086665', // User identifier that only allow the user only can download their uploaded file
  singleFilePath: args[1],
  successCallback: console.log,
});

// TODO: Wait for websocket to tell the file has finished parsed
setTimeout(() => {
  parser.getParsedFile({
    format: 'flat',
    successCallback: console.log,
  });
}, 10000);

const startOfDayInUTC = moment
  .utc(moment()
    .set('hour', 0)
    .set('minute', 0)
    .set('second', 0)
    .set('millisecond', 0))
  .format();

parser.getParsed({
  from: startOfDayInUTC,
  parserId: parserIds[args[0]],
});
