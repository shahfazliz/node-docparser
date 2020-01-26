import { ParserIds, DocumentParser } from './DocumentParser';
import { startOfDayInUTC } from './utils/DateTime';
import AssignDeep from './utils/AssignDeep';

const availableCommands = {
  '--get-all-parsed-documents': {
    callback: getAllParsedDocuments,
  },
  '--get-parsed-document': {
    callback: getParsedDocument,
    params: {
      '--report-type': () => {},
    },
  },
  '--upload-file': {
    callback: uploadFile,
    params: {
      '--file-path': () => {},
      '--report-type': () => {},
    },
  },
};

/**
 * args are the arguments form node cli
 * args[0]: the parser name to find the right parserId
 * args[1]: the path to a single file
 * example command:
 * node ./dist/main.js --upload-file --report-type "Maybank Daily Booking Report" --file-path ./test.pdf
 */
const enteredCommands = process
  .argv
  .join(' ');

const theCommand = Object
  .keys(availableCommands)
  .find(command => enteredCommands.indexOf(command) > -1);

enteredCommands[theCommand].callback(getRequiredValues(
  enteredCommands[theCommand].params)
);

function getRequiredValues (params) {
  return AssignDeep(...Object
    .keys(params)
    .map(requiredParam => params[requiredParam]()));
}

const parser = new DocumentParser({ DOCPARSERKEY: process.env.DOCPARSERKEY });

function getAllParsedDocuments ({ reportType }) {
  parser.getAllParsedDocuments({
    from: startOfDayInUTC,
    parserId: ParserIds[reportType],
  });
}

function getParsedDocument () {
  parser.getParsedDocument({
    successCallback: console.log,
  });
}

function uploadFile ({ filePath, reportType }) {
  parser.uploadFile({
    parserId: ParserIds[reportType],
    // remoteId: '810802086665', // User identifier that only allow the user only can download their uploaded file
    singleFilePath: filePath,
    successCallback: console.log,
  });
}
