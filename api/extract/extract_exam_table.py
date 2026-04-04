import pandas as pd

PERIOD_MAPPING = {
    "M": ("7:00 AM", "10:00 AM"),
    "A": ("11:00 AM", "2:00 PM"),
    "E": ("3:00 PM", "6:00 PM"),
}

COLUMN_ALIASES = {
    "COURSE NO": ["COURSE NO", "CRS CODE"],
    "COURSE NAME": ["COURSE NAME", "COURSE TITLE"],
    "CLASS": ["CLASS"],
    "LECTURER": ["LECTURER", "EXAMINER"],
    "LECTURE HALL": ["LECTURE HALL", "ROOM", "EXAM HALL"],
    "INVIGILATOR (UPDATED)": ["INVIGILATOR (UPDATED)", "INVIGILATOR"],
    "PERIOD": ["PERIOD", "SESSION"],
    "NO": ["NO", "No."],
}


def _find_header_row(df: pd.DataFrame) -> int:
    for index in range(len(df)):
        row = [str(value).strip() for value in df.iloc[index].tolist()]
        if "DATE" in row and ("CLASS" in row or "SESSION" in row or "PERIOD" in row):
            return index

    raise ValueError("Could not find exam timetable header row")


def _resolve_column_name(columns: pd.Index, candidates: list[str]) -> str | None:
    for candidate in candidates:
        if candidate in columns:
            return candidate
    return None


def _normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    renamed_columns: dict[str, str] = {}

    for canonical_name, aliases in COLUMN_ALIASES.items():
        source_name = _resolve_column_name(df.columns, aliases)
        if source_name:
            renamed_columns[source_name] = canonical_name

    return df.rename(columns=renamed_columns)


def _convert_exam_dates(date_series: pd.Series) -> pd.Series:
    """Normalize Excel serial dates and datetime-like values."""
    numeric_dates = pd.to_numeric(date_series, errors="coerce")

    if numeric_dates.notna().all():
        return pd.to_datetime(numeric_dates, unit="D", origin="1899-12-30")

    return pd.to_datetime(date_series, errors="coerce")


def get_exam_timetable(filename, class_pattern) -> pd.DataFrame:
    """
    Process an examination timetable Excel file and return a filtered DataFrame.

    Parameters:
    filename (str): Path to the Excel file
    class_pattern (str): Pattern to filter classes (e.g., 'CE 4')

    Returns:
    pd.DataFrame: Processed and filtered timetable DataFrame
    """
    raw_df = pd.read_excel(filename, sheet_name=0, header=None)

    header_row = _find_header_row(raw_df)
    df = raw_df.iloc[header_row:].reset_index(drop=True)
    df.columns = [str(value).strip() for value in df.iloc[0].tolist()]
    df = df[1:].reset_index(drop=True)
    df = _normalize_columns(df)
    df = df.dropna(axis=1, how="all")

    period_col = _resolve_column_name(df.columns, ["PERIOD"])
    if not period_col:
        raise ValueError("Exam timetable is missing PERIOD/SESSION column")

    df[period_col] = df[period_col].astype(str).str.strip()
    df = df[df[period_col].isin(PERIOD_MAPPING.keys())]

    if df.empty:
        # No valid PERIOD/SESSION rows; propagate an empty result without raising.
        df["START"] = pd.Series(dtype=object)
        df["END"] = pd.Series(dtype=object)
    else:
        df["START"], df["END"] = zip(*df[period_col].map(PERIOD_MAPPING))
    df = df.drop(columns=[period_col])

    def format_date_with_suffix(date):
        day = date.day
        suffix = (
            "th" if 11 <= day <= 13 else {1: "st", 2: "nd", 3: "rd"}.get(day % 10, "th")
        )
        return date.strftime(f"%A, {day}{suffix} %B %Y")

    df["DATE"] = _convert_exam_dates(df["DATE"])
    df = df[df["DATE"].notna()].copy()
    df["DATE"] = df["DATE"].apply(format_date_with_suffix)

    filtered_df = df[df["CLASS"].astype(str).str.startswith(class_pattern)].copy()

    if "NO" in filtered_df.columns:
        filtered_df = filtered_df.drop(columns=["NO"])

    return filtered_df
