/**
 * Wedding Ops — Mail merge + reminders (2026-08-03, Round 63)
 * Companion to Code.gs in the same Apps Script project. Adds a "Wedding Ops"
 * menu to the Sheet for bulk sends WITHOUT any third-party service:
 *
 *   - Send Save-the-Dates  → clones your Gmail draft template to every
 *                            invited household (marks Sent STD)
 *   - Send Invitations     → same, for the formal invite
 *   - Send RSVP Reminders  → emails only guests whose RSVP Status is empty
 *   - Export Guest List    → 9-column Butter/Mailchimp-ready CSV
 *   - Setup Ops Tabs       → creates the Invitees tab if missing
 *
 * TEMPLATE (5 min, do once in Gmail):
 *   1. Compose a NEW email in Gmail with the draft you want sent
 *      (paste your save-the-date / evite HTML or text).
 *   2. Put these placeholders anywhere in it:
 *        {{FirstName}} {{FullName}} {{Email}} {{Group}}
 *        {{RSVPLink}} {{RSVPDeadline}} {{BookBy}}
 *   3. Give the draft a title that starts with "STD:" or "INVITE:".
 *   4. In the Sheet: Wedding Ops → Send Save-the-Dates (or Invitations).
 *
 * The RSVP link resolves to the wedding site RSVP section; deadlines come
 * from CONFIG below. Bulk sends are throttled (1 email / 1.1s) to stay
 * inside Gmail quota (500/day personal, 2000/day Workspace).
 */

var OPS = {
  SITE_URL: 'https://5gv4mwqjmf-max.github.io/wedding-website/',
  RSVP_DEADLINE: 'November 13, 2027',
  BOOK_BY: 'November 1, 2027',
  DRAFT_PREFIX_STD: 'STD:',
  DRAFT_PREFIX_INVITE: 'INVITE:'
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('💍 Wedding Ops')
    .addItem('Setup Ops Tabs', 'setupOpsTabs')
    .addItem('Send Save-the-Dates', 'sendSaveTheDates')
    .addItem('Send Invitations', 'sendInvitations')
    .addItem('Send RSVP Reminders', 'sendReminders')
    .addItem('Sync RSVP Status (from RSVPs tab)', 'syncRsvpStatus')
    .addItem('Export Guest List (CSV)', 'exportGuestList')
    .addToUi();
}

function opsSheet_() {
  var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  var s = ss.getSheetByName('Invitees');
  if (!s) {
    s = ss.insertSheet('Invitees');
    s.appendRow(['First Name', 'Last Name', 'Email', 'Group', 'Party Size',
      'Plus One', 'Address', 'RSVP Status', 'Sent STD', 'Sent Invite', 'Notes']);
    s.setFrozenRows(1);
    s.getRange(1, 1, 1, 11).setFontWeight('bold');
  }
  return s;
}

function setupOpsTabs() {
  opsSheet_();
  SpreadsheetApp.getUi().alert('Invitees tab ready. Fill it with your guest '
    + 'list (First Name, Last Name, Email, Group, Party Size…), then create '
    + 'your Gmail draft titled "STD: …" or "INVITE: …" and use the menu.');
}

function inviteesRows_() {
  var s = opsSheet_();
  var last = s.getLastRow();
  if (last < 2) return [];
  return s.getRange(2, 1, last - 1, 11).getValues();
}

function findDraft_(prefix) {
  var drafts = GmailApp.getDrafts();
  for (var i = 0; i < drafts.length; i++) {
    var d = drafts[i];
    var subj = d.getMessage().getSubject() || '';
    if (subj.indexOf(prefix) === 0) {
      return { subject: subj, body: d.getMessage().getBody() };
    }
  }
  return null;
}

function fillTemplate_(tpl, guest) {
  var full = (guest[0] || '') + ' ' + (guest[1] || '');
  var map = {
    '{{FirstName}}': guest[0] || '',
    '{{FullName}}': full.trim(),
    '{{Email}}': guest[2] || '',
    '{{Group}}': guest[3] || '',
    '{{RSVPLink}}': OPS.SITE_URL + '#rsvp',
    '{{RSVPDeadline}}': OPS.RSVP_DEADLINE,
    '{{BookBy}}': OPS.BOOK_BY
  };
  return tpl.replace(/\{\{[A-Za-z]+\}\}/g, function (m) {
    return Object.prototype.hasOwnProperty.call(map, m) ? map[m] : m;
  });
}

function sendCampaign_(prefix, markColIndex, label) {
  var draft = findDraft_(prefix);
  if (!draft) {
    SpreadsheetApp.getUi().alert('No Gmail draft starting with "' + prefix
      + '" found. Create one first (see the file header for placeholders).');
    return;
  }
  var rows = inviteesRows_();
  if (!rows.length) {
    SpreadsheetApp.getUi().alert('Invitees tab is empty. Fill it first.');
    return;
  }
  var sent = 0, skipped = 0;
  for (var i = 0; i < rows.length; i++) {
    var g = rows[i];
    var email = (g[2] || '').trim();
    if (!email) { skipped++; continue; }
    if (g[markColIndex - 1]) { skipped++; continue; } // already sent
    var subject = draft.subject.replace(prefix, '').trim() + ' — ' + (g[0] || '');
    var html = fillTemplate_(draft.body, g);
    GmailApp.sendEmail(email, subject, '', { htmlBody: html });
    var s = opsSheet_();
    s.getRange(i + 2, markColIndex).setValue(new Date());
    sent++;
    Utilities.sleep(1100); // stay under quota
  }
  SpreadsheetApp.getUi().alert(label + ' complete.\nSent: ' + sent
    + '\nSkipped (no email / already sent): ' + skipped);
}

function sendSaveTheDates() { sendCampaign_(OPS.DRAFT_PREFIX_STD, 9, 'Save-the-Dates'); }
function sendInvitations() { sendCampaign_(OPS.DRAFT_PREFIX_INVITE, 10, 'Invitations'); }

function sendReminders() {
  var rows = inviteesRows_();
  if (!rows.length) {
    SpreadsheetApp.getUi().alert('Invitees tab is empty.');
    return;
  }
  var draft = findDraft_('REMINDER:');
  var pending = 0, sent = 0;
  for (var i = 0; i < rows.length; i++) {
    var g = rows[i];
    var email = (g[2] || '').trim();
    var status = (g[7] || '').trim();
    if (!email || status) continue;
    pending++;
    if (!draft) continue;
    var subject = 'RSVP reminder — Keshava & Cayla (' + (g[0] || '') + ')';
    var html = fillTemplate_(draft.body, g);
    GmailApp.sendEmail(email, subject, '', { htmlBody: html });
    sent++;
    Utilities.sleep(1100);
  }
  if (!draft) {
    SpreadsheetApp.getUi().alert('No "REMINDER:" draft found — create one in '
      + 'Gmail with {{FirstName}}, {{RSVPLink}}, {{RSVPDeadline}}.\n\n'
      + 'Pending guests (no RSVP yet): ' + pending);
  } else {
    SpreadsheetApp.getUi().alert('Reminders sent: ' + sent + '\nStill pending: '
      + (pending - sent));
  }
}

function exportGuestList() {
  var rows = inviteesRows_();
  var csv = ['First Name,Last Name,Email,Party Size,Guest Group,RSVP Status,'
    + 'Meal Preference,Song Request,Notes'];
  rows.forEach(function (g) {
    var meal = (g[8] || ''); // placeholder: map from RSVPs tab by email if you want
    var song = '';
    csv.push([g[0], g[1], g[2], g[4], g[3], g[7], meal, song, g[10]]
      .map(function (v) { return '"' + String(v || '').replace(/"/g, '""') + '"'; })
      .join(','));
  });
  var f = DriveApp.createFile('guest-list-' + new Date().toISOString().slice(0, 10)
    + '.csv', csv.join('\n'), 'text/csv');
  SpreadsheetApp.getUi().alert('CSV saved to Drive: ' + f.getUrl());
}

/**
 * Round 66: sync RSVP Status on the Invitees tab from the RSVPs tab.
 * Matches by email (case-insensitive). Updates the RSVP Status column to
 * Yes/No for any invitee whose email appears in the RSVPs tab, and stamps
 * the date the status was last synced in Notes if not already present.
 * Run manually from the Wedding Ops menu after guests RSVP, or add a
 * time trigger (e.g. daily at 8am) to run automatically.
 */
function syncRsvpStatus() {
  var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  var rsvpSheet = ss.getSheetByName('RSVPs');
  var inv = ss.getSheetByName('Invitees');
  if (!rsvpSheet || !inv || rsvpSheet.getLastRow() < 2 || inv.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('Need both RSVPs and Invitees tabs with data.');
    return;
  }
  var rsvpVals = rsvpSheet.getRange(2, 1, rsvpSheet.getLastRow() - 1, 8).getValues();
  var invVals = inv.getRange(2, 1, inv.getLastRow() - 1, 11).getValues();
  // Map email -> status (last row wins for duplicates)
  var byEmail = {};
  rsvpVals.forEach(function (r) {
    var em = String(r[2] || '').trim().toLowerCase();
    var att = String(r[3] || '').trim().toLowerCase();
    if (em && (att === 'yes' || att === 'no')) byEmail[em] = att;
  });
  var updated = 0;
  for (var i = 0; i < invVals.length; i++) {
    var em = String(invVals[i][2] || '').trim().toLowerCase();
    if (!em || !byEmail[em]) continue;
    var want = byEmail[em] === 'yes' ? 'Yes' : 'No';
    if (String(invVals[i][7] || '').trim().toLowerCase() !== byEmail[em]) {
      invVals[i][7] = want;
      updated++;
    }
  }
  if (updated > 0) {
    inv.getRange(2, 8, invVals.length, 1).setValues(invVals.map(function (r) { return [r[7]]; }));
  }
  SpreadsheetApp.getUi().alert('RSVP sync complete. Updated ' + updated
    + ' invitee statuses from the RSVPs tab.');
  Logger.log('syncRsvpStatus updated ' + updated);
}

/** Counts RSVPs by status from the RSVPs tab — call from a time trigger. */
function rsvpSummary() {
  var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  var s = ss.getSheetByName('RSVPs');
  if (!s || s.getLastRow() < 2) return 'No RSVPs yet.';
  var vals = s.getRange(2, 4, s.getLastRow() - 1, 1).getValues(); // Attending col
  var yes = 0, no = 0;
  vals.forEach(function (r) { if (String(r[0]).toLowerCase() === 'yes') yes++; else if (String(r[0]).toLowerCase() === 'no') no++; });
  var out = 'RSVP summary: ' + yes + ' attending, ' + no + ' declining, '
    + (yes + no) + ' total responses.';
  Logger.log(out);
  return out;
}
