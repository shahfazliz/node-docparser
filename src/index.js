import { ParserIds, DocumentParser } from './DocumentParser';
import { startOfDayInUTC } from './utils/DateTime';
import AssignDeep from './utils/AssignDeep';

const parser = new DocumentParser({ DOCPARSERKEY: '98a2d8daa74408f022f4f764b37ae207f61c84b5' });

const availableCommands = {
  // eg: npm start -- --get-all-parsed-documents --report-type "Maybank Daily Booking Report"
  '--get-all-parsed-documents': {
    callback: getAllParsedDocuments,
    params: {
      '--report-type': () => ({ reportType: getValueOfCommand('--report-type') }),
    },
  },
  '--get-parsed-document': {
    callback: getParsedDocument,
  },
  // eg: npm start -- --upload-file --report-type "Maybank Daily Booking Report" --file-path ./maybank.pdf
  '--upload-file': {
    callback: uploadFile,
    params: {
      '--file-path': () => ({ filePath: getValueOfCommand('--file-path') }),
      '--report-type': () => ({ reportType: getValueOfCommand('--report-type') }),
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

availableCommands[theCommand].callback(getRequiredValues(
  availableCommands[theCommand].params)
);

function getRequiredValues (params) {
  return AssignDeep(
    ...Object
      .keys(params)
      .map(requiredParam => params[requiredParam]())
  );
}

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

function getValueOfCommand (command) {
  return process.argv[process
    .argv
    .indexOf(command) + 1];
}
