/**
 * Commander Comics read-only public feed.
 * Deploy as a Google Apps Script Web App, execute as yourself, access: Anyone.
 * Only selected fields from Series and Reading Log are returned. No write endpoint.
 */
const SPREADSHEET_ID = '11jadb6KSRRMTEfjubJeovP6frdICEUKFUn_6phFg-Yg';
function doGet(e) {
  const callback = String((e && e.parameter && e.parameter.callback) || '');
  if (!/^commanderComicsFeed_[a-zA-Z0-9_]+$/.test(callback)) {
    return ContentService.createTextOutput('Missing valid callback').setMimeType(ContentService.MimeType.TEXT);
  }
  const book = SpreadsheetApp.openById(SPREADSHEET_ID);
  const s = book.getSheetByName('Series').getDataRange().getDisplayValues().slice(1);
  const l = book.getSheetByName('Reading Log').getDataRange().getDisplayValues().slice(1);
  const series = s.filter(r => r[0] && r[1]).map(r => ({
    id:r[0], title:r[1], publisher:r[2], year:r[3], owned:r[4],
    latest:r[5], status:r[6], updated:r[7], notes:r[8],
    entries:l.filter(e=>e[1]===r[0]).map(e=>({date:e[0],issue:e[2],activity:e[3],rating:e[4],note:e[5]}))
  }));
  return ContentService.createTextOutput(callback+'('+JSON.stringify({series:series})+');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
