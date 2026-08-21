/**
 * TalentLedger — Google Sheets backend
 * Sheets used: Companies, Positions, Candidates, SourcingResources, AuditLog (auto-created on first run)
 * Deploy: Deploy > New deployment > Web app
 *   Execute as: Me · Who has access: Anyone
 */

var SHEET_COLUMNS = {
  Companies:  ['id', 'name', 'address', 'contact', 'contactEmail', 'contactPhone', 'website',
               'picName', 'picPosition', 'picEmail', 'picPhoneWA',
               'contractStart', 'contractEnd', 'contractStatus', 'contractFileName', 'contractDriveFileId', 'contractLocalCacheId',
               'isActive', 'createdAt', 'updatedAt'],
  Positions:  ['id', 'companyId', 'title', 'department', 'level', 'headcount', 'filledCount',
               'minSalary', 'maxSalary', 'employmentType', 'workLocation', 'workArrangement',
               'targetDate', 'hiringManagerName', 'hiringManagerEmail', 'jobDescription', 'requiredSkills', 'sourcingChannels',
               'status', 'holdSince', 'phases', 'salary',
               'openedAt', 'createdAt', 'updatedAt'],
  Candidates: ['id', 'name', 'email', 'phone', 'positionId', 'stage',
               'source', 'note', 'createdAt', 'updatedAt'],
  Contracts:  ['id', 'companyId', 'documentType', 'startDate', 'endDate',
               'documentUrl', 'notes', 'createdAt', 'updatedAt'],
  SourcingResources: ['id', 'companyId', 'resourceName', 'resourceType', 'url',
                      'accountUsername', 'credentialReference', 'accessStatus', 'notes',
                      'createdAt', 'updatedAt'],
  AuditLog: ['id', 'entityType', 'entityId', 'field', 'oldValue', 'newValue',
             'actor', 'reason', 'timestamp']
};

function getSheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(SHEET_COLUMNS[name]);
    sh.getRange(1, 1, 1, SHEET_COLUMNS[name].length)
      .setFontWeight('bold').setBackground('#0D2F22').setFontColor('#F2F1EA');
    sh.setFrozenRows(1);
  }
  return sh;
}

function readAll_(name) {
  var sh = getSheet_(name);
  var values = sh.getDataRange().getValues();
  var headers = SHEET_COLUMNS[name];
  var out = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (!row[0]) continue;
    var rec = {};
    for (var j = 0; j < headers.length; j++) rec[headers[j]] = row[j];
    out.push(rec);
  }
  return out;
}

function writeAll_(name, records) {
  var sh = getSheet_(name);
  var headers = SHEET_COLUMNS[name];
  var last = sh.getLastRow();
  if (last > 1) sh.getRange(2, 1, last - 1, headers.length).clearContent();
  var rows = [];
  for (var i = 0; i < records.length; i++) {
    var rec = records[i];
    var row = [];
    for (var j = 0; j < headers.length; j++) {
      var v = rec[headers[j]];
      row.push(v === undefined || v === null ? '' : v);
    }
    rows.push(row);
  }
  if (rows.length) sh.getRange(2, 1, rows.length, headers.length).setValues(rows);
}

function upsert_(name, rec) {
  var all = readAll_(name);
  var found = false;
  for (var i = 0; i < all.length; i++) {
    if (String(all[i].id) === String(rec.id)) { all[i] = rec; found = true; break; }
  }
  if (!found) all.push(rec);
  writeAll_(name, all);
}

function remove_(name, id) {
  var all = readAll_(name);
  var next = [];
  for (var i = 0; i < all.length; i++) {
    if (String(all[i].id) !== String(id)) next.push(all[i]);
  }
  writeAll_(name, next);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'ping';
  if (action === 'ping') {
    return json_({ ok: true, app: 'TalentLedger', time: new Date().toISOString() });
  }
  if (action === 'getAll') {
    return json_({
      ok: true,
       {
        Companies: readAll_('Companies'),
        Positions: readAll_('Positions'),
        Candidates: readAll_('Candidates')
      }
    });
  }
  return json_({ ok: false, error: 'Unknown action: ' + action });
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.action === 'replaceAll') {
      writeAll_('Companies', body.data.Companies || []);
      writeAll_('Positions', body.data.Positions || []);
      writeAll_('Candidates', body.data.Candidates || []);
      return json_({ ok: true });
    }
    if (body.action === 'upsert') {
      upsert_(body.sheet, body.record);
      return json_({ ok: true });
    }
    if (body.action === 'remove') {
      remove_(body.sheet, body.id);
      return json_({ ok: true });
    }
    return json_({ ok: false, error: 'Unknown action: ' + body.action });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}
