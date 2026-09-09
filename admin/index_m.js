"use strict";

if (typeof systemDictionary === "undefined") {
  systemDictionary = {};
}

Object.assign(systemDictionary, {
  "GitHub Repository URL": {
    "en": "GitHub Repository URL",
    "de": "GitHub-Repository-URL",
  },
  "GitHub Personal Access Token": {
    "en": "GitHub Personal Access Token",
    "de": "Persönliches GitHub-Zugriffstoken",
  },
  "Local Script Path": {
    "en": "Local Script Path",
    "de": "Lokaler Skriptpfad",
  },
  "Sync Interval (seconds)": {
    "en": "Sync Interval (seconds)",
    "de": "Sync-Intervall (Sekunden)",
  },
  "Auto Sync": {
    "en": "Auto Sync",
    "de": "Automatische Synchronisierung",
  },
  "Pull Before Push": {
    "en": "Pull Before Push",
    "de": "Vor dem Hochladen herunterladen",
  },
  "Include Path Pattern": {
    "en": "Include Path Pattern",
    "de": "Pfadmuster einschließen",
  },
  "Exclude Path Pattern": {
    "en": "Exclude Path Pattern",
    "de": "Pfadmuster ausschließen",
  },
  "GitHub Configuration": {
    "en": "GitHub Configuration",
    "de": "GitHub-Konfiguration",
  },
  "Local Configuration": {
    "en": "Local Configuration",
    "de": "Lokale Konfiguration",
  },
  "Sync Settings": {
    "en": "Sync Settings",
    "de": "Sync-Einstellungen",
  },
  "Advanced File Patterns": {
    "en": "Advanced File Patterns",
    "de": "Erweiterte Dateimuster",
  },
  "Main": {
    "en": "Main",
    "de": "Haupt",
  },
  "Advanced": {
    "en": "Advanced",
    "de": "Fortgeschrittene",
  },
});

// the function loadSettings has to exist ...
// eslint-disable-next-line no-unused-vars
function load(settings, onChange) {
  // example: select elements with id=key and class=value and insert value
  if (!settings) return;
  $(".value").each(function () {
    const $key = $(this).attr("id");
    if ($key) {
      if (typeof settings[$key] !== "undefined") {
        $(this).val(settings[$key]);
      }
    }
  });

  // Load checkboxes
  $("input[type=checkbox].value").each(function () {
    const $key = $(this).attr("id");
    if ($key && typeof settings[$key] !== "undefined") {
      $(this).prop("checked", settings[$key]);
    }
  });

  // Translate
  if (typeof translate !== "undefined") {
    translatePage();
  }

  // Call onChange to mark config as changed
  onChange(false);
}

// the function save has to exist ...
// eslint-disable-next-line no-unused-vars
function save(callback) {
  // example: select elements with id=key and class=value and store value
  const obj = {};
  $(".value").each(function () {
    const $key = $(this).attr("id");
    const $val = $(this).val();
    if ($key) {
      if ($(this).attr("type") === "checkbox") {
        obj[$key] = $(this).prop("checked");
      } else {
        obj[$key] = $val;
      }
    }
  });

  // Validate required fields
  if (!obj.gitHubUrl || !obj.gitHubToken) {
    showMessage("GitHub URL and Token are required", "error");
    callback(false);
    return;
  }

  callback(obj);
}

function showMessage(msg) {
  // Use ioBroker showMessage if available
  if (typeof showToast !== "undefined") {
    showToast(msg);
  } else {
    alert(msg);
  }
}
