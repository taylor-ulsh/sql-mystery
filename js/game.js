initSqlJs({ locateFile: function (file) { return 'lib/' + file; } }).then(function (SQL) {
  var db = new SQL.Database(); // an empty database, held in the browser's memory
  var query = document.getElementById('query');
  var output = document.getElementById('output');
  output.textContent = 'Ready.';

  // Runs a query that returns a single number, and gives back that number.
  function count(sql) {
    return db.exec(sql)[0].values[0][0];
  }

  // Turns 1 into "1 table" and 2 into "2 tables".
  function plural(number, word) {
    return number + ' ' + word + (number === 1 ? '' : 's');
  }

  // Runs each statement in turn. Returns the columns and rows of the last one that
  // returns columns (such as a SELECT), even when it has no rows, or null if none do.
  function runStatements(sql) {
    var last = null;
    for (var statement of db.iterateStatements(sql)) {
      var columns = statement.getColumnNames();
      var values = [];
      while (statement.step()) {
        values.push(statement.get());
      }
      if (columns.length > 0) {
        last = { columns: columns, values: values };
      }
    }
    return last;
  }

  // Shows a result as an HTML table: column names in the header, then one row per result row.
  function showTable(result) {
    var table = document.createElement('table');
    var headerRow = table.insertRow();
    result.columns.forEach(function (column) {
      var th = document.createElement('th');
      th.textContent = column;
      headerRow.appendChild(th);
    });
    result.values.forEach(function (row) {
      var tableRow = table.insertRow();
      row.forEach(function (value) {
        var cell = tableRow.insertCell();
        if (value === null) {
          cell.textContent = 'NULL';
          cell.className = 'null';
        } else {
          cell.textContent = value;
        }
      });
    });
    output.textContent = '';
    output.appendChild(table);
  }

  document.getElementById('run').addEventListener('click', function () {
    try {
      var tablesBefore = count("SELECT count(*) FROM sqlite_master WHERE type = 'table'");
      var changesBefore = count('SELECT total_changes()');
      var result = runStatements(query.value);
      if (result === null) {
        var tables = count("SELECT count(*) FROM sqlite_master WHERE type = 'table'") - tablesBefore;
        var rows = count('SELECT total_changes()') - changesBefore;
        var done = [];
        if (tables > 0) done.push(plural(tables, 'table') + ' created');
        if (tables < 0) done.push(plural(-tables, 'table') + ' deleted');
        if (rows > 0) done.push(plural(rows, 'row') + ' changed');
        output.textContent = done.length > 0 ? 'Done. ' + done.join(', ') + '.' : 'Done. No changes.';
        return;
      }
      showTable(result);
    } catch (error) {
      output.textContent = 'Error: ' + error.message;
    }
  });
});