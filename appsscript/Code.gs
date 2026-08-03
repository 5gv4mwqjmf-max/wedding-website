/**
 * Wedding website backend — RSVP + Guestbook + Contact → Google Sheet + email
 * The WithJoy-style DIY stack for a static site. One Apps Script web app
 * handles every form, writes to a shared Google Sheet (your guest-list
 * manager), and emails you on new RSVPs and contact messages.
 *
 * SETUP (5 minutes, do it once):
 *   1. https://script.google.com → New project → paste this file into Code.gs
 *   2. Edit CONFIG below:
 *      - TO_EMAIL:          your inbox (keshavagali@gmail.com)
 *      - SHEET_ID:          the id from your Google Sheet's URL
 *        (https://docs.google.com/spreadsheets/d/<THIS_ID>/edit)
 *        Create the sheet at sheets.new first. It will be auto-populated
 *        with headers on first run.
 *   3. Deploy → New deployment → Web app:
 *      - Execute as: Me
 *      - Who has access: Anyone
 *      - Deploy, COPY THE URL (looks like
 *        https://script.google.com/macros/s/.../exec)
 *   4. Paste that URL into rsvp.html, guestbook.html, contact.html at the
 *      SCRIPT_URL constant in each page's <script> block.
 *   5. Commit + push. Done.
 *
 * ENDPOINTS (POST JSON):
 *   {action:'rsvp',     name,email,attending,guests,meal,song,notes}
 *   {action:'guestbook',name,city,message}
 *   {action:'contact',  name,email,message}
 *
 * PRIVACY — consent copy is shown on each site form; keep in sync:
 *   - RSVP/Contact emails: used only to plan the wedding / reply back.
 *   - Guestbook name + message: displayed on the reception wall.
 *   - Nothing is shared or sold. Removal requests -> the couple's email.
 */

var CONFIG = {
  TO_EMAIL: 'keshavagali@gmail.com',
  // Auto-detect spreadsheet; set explicitly if you prefer a specific sheet:
  SHEET_ID: '10jlU1JsTb-2cieYwGtEDzlztcpyrEgG-hSE_fnD_m_Q' // e.g. '1AbC...xyz'
};

function getSpreadsheet_() {
  if (CONFIG.SHEET_ID) {
    return SpreadsheetApp.openById(CONFIG.SHEET_ID);
  }
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    // Fallback: create a dedicated sheet in the drive
    ss = SpreadsheetApp.create('Wedding RSVP — ' + new Date().toISOString().slice(0, 10));
  }
  return ss;
}

function ensureSheet_(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sheet;
}

function appendRow_(sheet, values) {
  sheet.appendRow(values);
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action || 'contact';
    var ss = getSpreadsheet_();
    var out;

    if (action === 'rsvp') {
      var rsvpSheet = ensureSheet_(ss, 'RSVPs', [
        'Timestamp', 'Name', 'Email', 'Attending', 'Guests',
        'Meal Preference', 'Song Request', 'Dietary Notes'
      ]);
      appendRow_(rsvpSheet, [
        new Date(), body.name || '', body.email || '', body.attending || '',
        body.guests || '', body.meal || '', body.song || '', body.notes || ''
      ]);
      // Email the couple on every RSVP
      var attending = body.attending === 'yes' ? 'JOYFULLY ACCEPTING' : 'REGRETFULLY DECLINING';
      MailApp.sendEmail(
        CONFIG.TO_EMAIL,
        'RSVP: ' + body.name + ' — ' + attending,
        'Name: ' + body.name + '\nEmail: ' + body.email +
        '\nAttending: ' + attending +
        '\nGuests: ' + (body.guests || '—') +
        '\nMeal: ' + (body.meal || '—') +
        '\nSong request: ' + (body.song || '—') +
        '\nNotes: ' + (body.notes || '—')
      );
      out = {ok: true, action: 'rsvp'};

    } else if (action === 'guestbook') {
      var gbSheet = ensureSheet_(ss, 'Guestbook', [
        'Timestamp', 'Name', 'City', 'Message'
      ]);
      appendRow_(gbSheet, [
        new Date(), body.name || '', body.city || '', body.message || ''
      ]);
      out = {ok: true, action: 'guestbook'};

    } else {
      var ctSheet = ensureSheet_(ss, 'Contact', [
        'Timestamp', 'Name', 'Email', 'Message'
      ]);
      appendRow_(ctSheet, [
        new Date(), body.name || '', body.email || '', body.message || ''
      ]);
      MailApp.sendEmail(
        CONFIG.TO_EMAIL,
        'Wedding website message from ' + body.name,
        'From: ' + body.name + ' <' + body.email + '>\n\n' + body.message
      );
      out = {ok: true, action: 'contact'};
    }

    return ContentService
      .createTextOutput(JSON.stringify(out))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ok: false, error: String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(
    'Wedding backend is live. POST JSON {action: rsvp|guestbook|contact}.'
  );
}

/** Menu helper — run once from the editor to create the spreadsheet + headers. */
function setupSheets() {
  var ss = getSpreadsheet_();
  ensureSheet_(ss, 'RSVPs', ['Timestamp', 'Name', 'Email', 'Attending', 'Guests', 'Meal Preference', 'Song Request', 'Dietary Notes']);
  ensureSheet_(ss, 'Guestbook', ['Timestamp', 'Name', 'City', 'Message']);
  ensureSheet_(ss, 'Contact', ['Timestamp', 'Name', 'Email', 'Message']);
  Logger.log('Sheets ready in spreadsheet: ' + ss.getId());
}
