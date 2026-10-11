/**
 * Digital Learn 2.0 — Google Sheets receiver
 * Set SPREADSHEET_ID, deploy as a web app, then put the /exec URL in index.html.
 * Public Apps Script deployments can be abused. Do not use this simple receiver
 * for sensitive data or a production service without authentication/validation.
 */
const SPREADSHEET_ID = "PASTE_YOUR_GOOGLE_SHEET_ID_HERE";

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const type = String(data.type || "");
    let name, row, headers;
    if (type === "registration") {
      name = "Registrations";
      headers = ["Received At","Full Name","Age Group","Education Level","Registered At"];
      row = [new Date(), clean(data.fullName), clean(data.ageGroup), clean(data.education), clean(data.registeredAt)];
    } else if (type === "quiz_score") {
      name = "Quiz Scores";
      headers = ["Received At","Full Name","Score","Total Questions","Submitted At"];
      row = [new Date(), clean(data.fullName), boundedNumber(data.score,0,3), boundedNumber(data.total,1,3), clean(data.submittedAt)];
    } else if (type === "module_completion") {
      name = "Module Progress";
      headers = ["Received At","Full Name","Module ID","Completed At","Completed Modules"];
      row = [new Date(), clean(data.fullName), clean(data.module), clean(data.completedAt), clean(data.completedModules)];
    } else {
      return output({ok:false,error:"Unsupported event"});
    }
    let sh = ss.getSheetByName(name);
    if (!sh) { sh = ss.insertSheet(name); sh.appendRow(headers); sh.setFrozenRows(1); }
    sh.appendRow(row);
    return output({ok:true});
  } catch (err) {
    return output({ok:false,error:String(err)});
  }
}
function clean(v) {
  // Basic length/control-character cleanup. Not authentication or full sanitisation.
  let s = String(v == null ? "" : v).replace(/[\u0000-\u001F]/g,"").slice(0,300);
  // Reduce formula injection risk for text fields.
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}
function boundedNumber(v,min,max) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max,Math.max(min,Math.floor(n))) : min;
}
function output(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function doGet() { return ContentService.createTextOutput("Digital Learn 2.0 Sheet receiver is running."); }
