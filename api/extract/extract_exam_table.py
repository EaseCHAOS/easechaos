import pandas as pd


def _normalize_exam_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Normalize exam workbook columns across draft variants."""
    normalized = df.copy()
    normalized.columns = [str(col).strip() for col in normalized.columns]

    session_col = "PERIOD" if "PERIOD" in normalized.columns else "SESSION"
    course_col = (
        "COURSE NAME" if "COURSE NAME" in normalized.columns else "COURSE TITLE"
    )
    hall_col = "LECTURE HALL" if "LECTURE HALL" in normalized.columns else "ROOM"
    invigilator_col = (
        "INVIGILATOR (UPDATED)"
        if "INVIGILATOR (UPDATED)" in normalized.columns
        else "INVIGILATOR"
    )
    number_col = "NO" if "NO" in normalized.columns else "No."

    rename_map = {
        session_col: "PERIOD",
        course_col: "COURSE NAME",
        hall_col: "LECTURE HALL",
        invigilator_col: "INVIGILATOR (UPDATED)",
        number_col: "NO",
    }

    return normalized.rename(columns=rename_map)


def _convert_exam_dates(date_series: pd.Series) -> pd.Series:
    """Convert either Excel serial dates or parsed datetimes to display strings."""
    numeric_dates = pd.to_numeric(date_series, errors="coerce")

    if numeric_dates.notna().all():
        converted = pd.to_datetime(numeric_dates, unit="D", origin="1899-12-30")
    else:
        converted = pd.to_datetime(date_series, errors="coerce")

    return converted


def get_exam_timetable(filename, class_pattern) -> pd.DataFrame:
    """
    Process an examination timetable Excel file and return a filtered DataFrame.

    Parameters:
    filename (str): Path to the Excel file
    class_pattern (str): Pattern to filter classes (e.g., 'CE 4')

    Returns:
    pd.DataFrame: Processed and filtered timetable DataFrame
    """

    # read the Excel file
    df = pd.read_excel(filename, sheet_name=0, header=None)

    # Remove empty columns and locate the header row dynamically.
    df = df.dropna(axis=1, how="all")
    header_row_index = None
    for idx, row in df.iterrows():
        values = {str(value).strip() for value in row.dropna().tolist()}
        if "DATE" in values and ("PERIOD" in values or "SESSION" in values):
            header_row_index = idx
            break

    if header_row_index is None:
        raise ValueError("Could not locate exam timetable header row")

    df_cleaned = df.iloc[header_row_index:].reset_index(drop=True)
    df_cleaned.columns = df_cleaned.iloc[0]
    df_cleaned = df_cleaned[1:].reset_index(drop=True)
    df_cleaned = _normalize_exam_columns(df_cleaned)

    # map PERIOD to START and END times
    period_mapping = {
        "M": ("7:00 AM", "10:00 AM"),
        "A": ("11:00 AM", "2:00 PM"),
        "E": ("3:00 PM", "6:00 PM"),
    }

    # conver the 'PERIOD' column to string type to handle NaN vals
    df_cleaned["PERIOD"] = df_cleaned["PERIOD"].astype(str)
    df_cleaned = df_cleaned[df_cleaned["PERIOD"].isin(period_mapping.keys())]

    # apply the mapping for valid periods
    df_cleaned["START"], df_cleaned["END"] = zip(
        *df_cleaned["PERIOD"].map(period_mapping)
    )

    # remove the PERIOD column
    df_cleaned = df_cleaned.drop(columns=["PERIOD"])

    # format date helper function
    def format_date_with_suffix(date):
        day = date.day
        suffix = (
            "th" if 11 <= day <= 13 else {1: "st", 2: "nd", 3: "rd"}.get(day % 10, "th")
        )
        return date.strftime(f"%A, {day}{suffix} %B %Y")

    # process dates
    df_cleaned["DATE"] = _convert_exam_dates(df_cleaned["DATE"])
    df_cleaned = df_cleaned[df_cleaned["DATE"].notna()]
    df_cleaned["DATE"] = df_cleaned["DATE"].apply(format_date_with_suffix)

    # filter by class pattern
    filtered_df = df_cleaned[df_cleaned["CLASS"].str.startswith(class_pattern)]
    filtered_df = filtered_df.drop(columns=["NO"], errors="ignore")

    return filtered_df
