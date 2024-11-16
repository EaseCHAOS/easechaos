# Time Table Module

This module is designed to extract a time table for a particular class from a general time table in excel. The main function exposed for use is `get_time_table`.

## Function: get_time_table

The `get_time_table` function retrieves the complete time table for a particular class for all days from an Excel file.

### Parameters

- `filname` (str): The filename of the Excel file. This file should contain every class with the days as the sheet names.
- `class_pattern` (str): The class to get the complete time table for. For example, 'EL 3'.

### Returns

- `pd.DataFrame`: A DataFrame containing the complete time table for the specified class.

### Usage

```python
from extract.extract_table import get_time_table

# Get the time table for class 'EL 3' from the specified Excel file
el3_time_table = get_time_table('filename.xlsx', 'EL 3')
```
