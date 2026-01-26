# Data Extraction and Excel Format Documentation

## Overview

easeCHAOS processes Excel timetable files to extract structured class schedule data. The system supports two types of timetables: lecture timetables and exam timetables, each with specific format requirements.

## Lecture Timetable Format

### Excel Structure
```
┌─────────────────────────────────────────────────┐
│ Sheet Name: Monday (or Tuesday, etc.)           │
├─────────────┬─────────────┬─────────────┬───────┤
│ Classroom   │ 8:00-10:00  │ 10:00-12:00 │ ...   │
├─────────────┼─────────────┼─────────────┼───────┤
│ LT 1        │ CE 4        │ MECH 3      │       │
│ LT 2        │ EL 3        │             │       │
│ Lab 1       │             │ CE 4A       │       │
└─────────────┴─────────────┴─────────────┴───────┘
```

### Key Requirements

1. **Sheet Names**: Must be day names (Monday, Tuesday, Wednesday, Thursday, Friday)
2. **Time Row**: First row after headers contains time slots in format `HH:MM-HH:MM`
3. **Classroom Column**: First column identifies classroom/venue
4. **Class Entries**: Course codes with optional sections (e.g., "CE 4", "MECH 3A")

### Supported Class Patterns

The extraction system supports various class naming patterns:

```python
# Basic patterns
"CE 4"           # Department + Year
"MECH 3A"        # Department + Year + Section

# Multiple sections
"CE 4A, 4B"      # Same department, multiple sections
"CE 4A, CE 4B"   # Full notation for multiple sections

# Course numbers
"CE 459"         # Department + Course number
"CE/RN 459"      # Multiple departments sharing course

# Complex patterns
"CE 4A, MECH 3B" # Different departments and years
```

### Processing Logic

1. **Time Row Detection**: Finds row containing time patterns using regex `^\d{1,2}:\d{1,2}-\d{1,2}:\d{1,2}$`
2. **Column Mapping**: Maps time slots to column headers
3. **Class Filtering**: Uses regex patterns to match relevant classes
4. **Data Cleaning**: Removes empty rows and columns
5. **Merged Cells**: Handles Excel merged cells by duplicating values

## Exam Timetable Format

### Excel Structure
```
┌─────────────────────────────────────────────────────────┐
│ Single sheet with exam schedule                         │
├─────────┬─────────┬─────────┬─────────┬─────────────────┤
│ NO      │ DATE    │ CLASS   │ COURSE  │ LECTURE HALL    │
├─────────┼─────────┼─────────┼─────────┼─────────────────┤
│ 1       │ 15/01/24│ CE 4    │ MATH 301│ LT 1            │
│ 2       │ 16/01/24│ MECH 3  │ PHYS 201│ Lab 2           │
└─────────┴─────────┴─────────┴─────────┴─────────────────┘
```

### Key Requirements

1. **Header Row**: Column names in row 4 (after skipping first 3 rows)
2. **Period Column**: Uses codes M (Morning), A (Afternoon), E (Evening)
3. **Date Format**: Excel date format (DD/MM/YYYY or similar)
4. **Class Column**: Course codes for filtering

### Period Mapping

```python
period_mapping = {
    'M': ('7:00 AM', '10:00 AM'),    # Morning
    'A': ('11:00 AM', '2:00 PM'),    # Afternoon  
    'E': ('3:00 PM', '6:00 PM')      # Evening
}
```

### Processing Logic

1. **Header Detection**: Skips first 3 rows, uses 4th row as headers
2. **Period Conversion**: Maps period codes to time ranges
3. **Date Formatting**: Converts Excel dates to readable format with suffixes
4. **Class Filtering**: Filters by class pattern using `str.startswith()`

## Data Extraction Functions

### Lecture Timetable Functions

#### `_get_time_row(df)`
- **Purpose**: Locate the row containing time slot definitions
- **Returns**: Tuple of (row_index, row_data)
- **Method**: Iterates through rows looking for time patterns

#### `_get_daily_table(df, class_pattern)`
- **Purpose**: Extract and filter a single day's timetable
- **Process**:
  1. Sets time slots as column headers
  2. Filters rows by class pattern using regex
  3. Removes empty entries
- **Returns**: Filtered DataFrame for specific day

#### `_get_all_daily_tables(filename, class_pattern)`
- **Purpose**: Process all sheets in Excel file
- **Features**:
  - Handles merged cells in Excel
  - Processes each day's sheet separately
  - Applies class filtering to each sheet
- **Returns**: Dictionary of DataFrames keyed by sheet name

#### `get_time_table(filename, class_pattern)`
- **Purpose**: Main function for complete lecture timetable extraction
- **Process**:
  1. Extracts all daily tables
  2. Combines into single weekly structure
  3. Formats output with classroom information
- **Returns**: Complete weekly timetable DataFrame

### Exam Timetable Functions

#### `get_exam_timetable(filename, class_pattern)`
- **Purpose**: Extract exam schedule from Excel file
- **Process**:
  1. Reads Excel with specific header positioning
  2. Maps period codes to time ranges
  3. Formats dates with readable suffixes
  4. Filters by class pattern
- **Returns**: Filtered exam timetable DataFrame

## Time Format Handling

### Lecture Timetables
- **Input**: Times without AM/PM (e.g., "8:00", "2:00")
- **Logic**: Context-based conversion
  - 7:00-11:59 treated as morning
  - 12:00 treated as noon
  - 1:00-6:59 treated as afternoon (converted to 13:00-18:59)

### Exam Timetables
- **Input**: Explicit AM/PM markers
- **Conversion**: Standard 12-hour to 24-hour conversion
  - 12:00 AM → 00:00
  - 1:00-11:59 PM → 13:00-23:59

## Error Handling

### Common Issues
1. **Missing Time Row**: Raises error when no time pattern found
2. **Invalid Sheet Names**: Skips sheets not matching day names
3. **Merged Cells**: Automatically unmerges and duplicates values
4. **Empty Files**: Returns empty DataFrame with proper structure

### Validation
- File existence checks
- Excel format validation
- Pattern matching for class codes
- Time format validation

## Performance Considerations

### Optimization Strategies
1. **Caching**: Redis caching for processed timetables
2. **Lazy Loading**: Process sheets only when needed
3. **Memory Management**: Clean up intermediate DataFrames
4. **File Hash**: Detect file changes for cache invalidation

### Large File Handling
- Stream processing for very large Excel files
- Chunked reading for memory efficiency
- Progress tracking for long operations

## Testing Data Formats

### Sample Lecture Timetable Entry
```excel
| Classroom | 8:00-10:00 | 10:00-12:00 | 12:00-2:00 | 2:00-4:00 |
|-----------|------------|-------------|------------|-----------|
| LT 1      | CE 4       | MECH 3      | EL 3       |           |
| LT 2      | CE 4A      |             | CE 4B      | MECH 3A   |
```

### Sample Exam Timetable Entry
```excel
| NO | DATE       | CLASS | COURSE NAME | LECTURE HALL | PERIOD |
|----|------------|-------|-------------|--------------|--------|
| 1  | 15/01/2024 | CE 4  | MATH 301    | LT 1         | M      |
| 2  | 16/01/2024 | MECH 3| PHYS 201    | Lab 2        | A      |
```

## Integration with API

### Request Flow
1. API receives timetable request with filename and class pattern
2. Extraction function processes Excel file
3. Data converted to JSON format
4. Response cached in Redis for future requests
5. Formatted data returned to frontend

### Response Format
- Lecture: Daily structure with time slots and class info
- Exam: Date-based structure with exam details
- Both include location, time, and course information

## File Management

### Storage Location
- Lecture timetables: `drafts/` directory
- Exam timetables: Same directory with different naming
- File naming: `Draft_1.xlsx`, `Draft_2.xlsx`, etc.

### Version Control
- File hash detection for changes
- Automatic cache invalidation
- Support for multiple draft versions

## Troubleshooting

### Common Extraction Issues
1. **Time Format Errors**: Check time slot formatting in Excel
2. **Class Pattern Matching**: Verify regex patterns for department codes
3. **Merged Cell Problems**: Ensure proper cell merging in Excel
4. **Sheet Name Issues**: Use exact day names for lecture timetables

### Debugging Tips
- Check raw Excel data before processing
- Verify regex patterns for class matching
- Test with simple data structures first
- Use logging to trace extraction process
