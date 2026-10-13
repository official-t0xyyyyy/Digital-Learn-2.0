/**
 * Digital Learn 2.0 — Google Sheets receiver
 * Receives registration, quiz score, and module progress events.
 */

const SPREADSHEET_ID = "1FulLjh2zfjbLE5rikb3mnjiuAeBMr5BHIqOuOV7AbHs";

function doPost(e) {
  try {
    const data = JSON.parse(
      (e && e.postData && e.postData.contents) || "{}"
    );

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const type = String(data.type || "");

    let sheetName;
    let headers;
    let row;

    if (type === "registration") {
      sheetName = "Registrations";

      headers = [
        "Received At",
        "Full Name",
        "Age Group",
        "Education Level",
        "Registered At"
      ];

      row = [
        new Date(),
        clean(data.fullName),
        clean(data.ageGroup),
        clean(data.education),
        clean(data.registeredAt)
      ];

    } else if (type === "quiz_score") {
      sheetName = "Quiz Scores";

      headers = [
        "Received At",
        "Full Name",
        "Score",
        "Total Questions",
        "Submitted At"
      ];

      const total = boundedNumber(data.total, 1, 10);
      const score = boundedNumber(data.score, 0, total);

      row = [
        new Date(),
        clean(data.fullName),
        score,
        total,
        clean(data.submittedAt)
      ];

    } else if (type === "module_completion") {
      sheetName = "Module Progress";

      headers = [
        "Received At",
        "Full Name",
        "Module ID",
        "Completed At",
        "Completed Modules"
      ];

      row = [
        new Date(),
        clean(data.fullName),
        clean(data.module),
        clean(data.completedAt),
        clean(data.completedModules)
      ];

    } else {
      return output({
        ok: false,
        error: "Unsupported event type"
      });
    }

    let sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(headers);
      sheet.setFrozenRows(1);
    }

    sheet.appendRow(row);

    return output({ ok: true });

  } catch (err) {
    return output({
      ok: false,
      error: String(err)
    });
  }
}

function clean(value) {
  let textValue = String(value == null ? "" : value)
    .replace(/[\u0000-\u001F]/g, "")
    .slice(0, 300);

  // Reduce formula injection risk for text fields.
  if (/^[=+\-@]/.test(textValue)) {
    textValue = "'" + textValue;
  }

  return textValue;
}

function boundedNumber(value, min, max) {
  const number = Number(value);

  return Number.isFinite(number)
    ? Math.min(max, Math.max(min, Math.floor(number)))
    : min;
}

function output(object) {
  return ContentService
    .createTextOutput(JSON.stringify(object))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService.createTextOutput(
    "Digital Learn 2.0 Sheet receiver is running."
  );
}
