// Point AMD loader at our self-hosted Monaco
require.config({
  paths: {
    'vs': '/lib/monaco-editor/min/vs'
  }
});

// Robust worker bootstrap when serving from your own origin
window.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    return '/lib/monaco-editor/min/vs/base/worker/workerMain.js';
  }
};

let diffEditor, originalModel, modifiedModel;
let currentTheme = 'vs-dark';
let swapped = false;

function fetchJsonFile(filename) {
  return fetch(`/json_data/${filename}`)
    .then(res => res.json())
    .catch(() => ({}));
}

function updateModels(originalFile, modifiedFile) {
  Promise.all([
    fetchJsonFile(originalFile),
    fetchJsonFile(modifiedFile)
  ]).then(([originalJson, modifiedJson]) => {
    if (!originalModel) {
      originalModel = monaco.editor.createModel('', 'json');
    }
    if (!modifiedModel) {
      modifiedModel = monaco.editor.createModel('', 'json');
    }
    originalModel.setValue(JSON.stringify(originalJson, null, 2));
    modifiedModel.setValue(JSON.stringify(modifiedJson, null, 2));
    diffEditor.setModel({
      original: swapped ? modifiedModel : originalModel,
      modified: swapped ? originalModel : modifiedModel
    });
  });
}

function refreshDropdowns() {
  fetch('/api/json/list')
    .then(res => res.json())
    .then(files => {
      const origSel = document.getElementById('originalJsonSelect');
      const modSel = document.getElementById('modifiedJsonSelect');
      [origSel, modSel].forEach(sel => {
        sel.innerHTML = '';
        files.forEach(f => {
          const opt = document.createElement('option');
          opt.value = f;
          opt.textContent = f;
          sel.appendChild(opt);
        });
      });
      // Optionally, update diff view after refresh
      updateModels(origSel.value, modSel.value);
    });
}

document.getElementById('saveJsonBtn').addEventListener('click', function () {
  const json = document.getElementById('jsonInput').value;
  let filename = document.getElementById('jsonFilename').value.trim();
  try {
    JSON.parse(json);
  } catch (e) {
    alert('Invalid JSON!');
    return;
  }
  fetch('/api/json/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Json: json, Filename: filename })
  })
    .then(res => res.json())
    .then(data => {
      alert('Saved as ' + data.filename);
      refreshDropdowns();
      document.getElementById('jsonInput').value = '';
      document.getElementById('jsonFilename').value = '';
    });
});

// Call refreshDropdowns on page load
refreshDropdowns();

require(['vs/editor/editor.main'], function () {
  originalModel = monaco.editor.createModel('', 'json');
  modifiedModel = monaco.editor.createModel('', 'json');

  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    allowComments: false
  });

  diffEditor = monaco.editor.createDiffEditor(
    document.getElementById('diff-editor'),
    {
      theme: currentTheme,
      renderSideBySide: true,
      automaticLayout: true,
      readOnly: false,
      originalEditable: false,
      ignoreTrimWhitespace: false,
      renderIndicators: true,
      renderMarginRevertIcon: true,
      renderOverviewRuler: true,
      renderDiffOverview: true,
      enableSplitViewResizing: true
    }
  );

  diffEditor.setModel({
    original: originalModel,
    modified: modifiedModel
  });

  document.getElementById('toggleThemeBtn').addEventListener('click', () => {
    currentTheme = currentTheme === 'vs-dark' ? 'vs' : 'vs-dark';
    monaco.editor.setTheme(currentTheme);
  });

  document.getElementById('swapBtn').addEventListener('click', () => {
    swapped = !swapped;
    const left = swapped ? modifiedModel : originalModel;
    const right = swapped ? originalModel : modifiedModel;
    diffEditor.setModel({ original: left, modified: right });
  });

  updateModels(
    document.getElementById('originalJsonSelect').value,
    document.getElementById('modifiedJsonSelect').value
  );

  document.getElementById('originalJsonSelect').addEventListener('change', function () {
    updateModels(
      this.value,
      document.getElementById('modifiedJsonSelect').value
    );
  });
  document.getElementById('modifiedJsonSelect').addEventListener('change', function () {
    updateModels(
      document.getElementById('originalJsonSelect').value,
      this.value
    );
  });

  window.addEventListener('unload', () => {
    diffEditor?.dispose();
    originalModel?.dispose();
    modifiedModel?.dispose();
  });
});
