/**
 * Wedding website contact form → email
 * Deploy this as a Google Apps Script web app so the static contact form
 * can send messages to your inbox with no backend server.
 *
 * SETUP (2 minutes, do it once):
 *   1. Go to https://script.google.com and create a new project.
 *   2. Paste this whole file into Code.gs.
 *   3. Change TO_EMAIL to the inbox you want messages delivered to
 *      (e.g. keshavagali@gmail.com).
 *   4. Deploy → New deployment → Web app:
 *      - Execute as: Me
 *      - Who has access: Anyone
 *      - Deploy, and COPY THE WEB APP URL.
 *   5. Paste that URL into contact.html at:
 *      var SCRIPT_URL = 'https://script.google.com/macros/s/.../exec';
 *   6. Commit + push. Done — the contact form now emails you.
 *
 * NOTE: The form uses mode:'no-cors', so the response is fire-and-forget.
 * Messages appear in your inbox within a few seconds.
 */
var TO_EMAIL = 'keshavagali@gmail.com';

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var name = body.name || 'Guest';
    var email = body.email || 'no-reply';
    var message = body.message || '';
    var subject = 'Wedding website message from ' + name;
    var text =
      'New message from the wedding website contact form.\n\n' +
      'From: ' + name + ' <' + email + '>\n\n' +
      message + '\n\n— ' + name;
    MailApp.sendEmail(TO_EMAIL, subject, text);
    return ContentService.createTextOutput('OK');
  } catch (err) {
    return ContentService.createTextOutput('ERR: ' + err);
  }
}

function doGet() {
  return ContentService.createTextOutput(
    'Wedding contact form endpoint is live. POST JSON {name, email, message}.'
  );
}
