import pandas as pd

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
    df = pd.read_excel(
        filename,
        sheet_name=0,
        header=None
    )

    # clean the DataFrame by removing the first and last 3 rows and setting headers
    df_cleaned = df.iloc[3:-3].reset_index(drop=True)
    df_cleaned.columns = df_cleaned.iloc[0]
    df_cleaned = df_cleaned[1:].reset_index(drop=True)

    # map PERIOD to START and END times
    period_mapping = {
        'M': ('7:00 AM', '10:00 AM'),
        'A': ('11:00 AM', '2:00 PM'),
        'E': ('3:00 PM', '6:00 PM')
    }

    # conver the 'PERIOD' column to string type to handle NaN vals
    df_cleaned['PERIOD'] = df_cleaned['PERIOD'].astype(str)
    df_cleaned = df_cleaned[df_cleaned['PERIOD'].isin(period_mapping.keys())]

    # apply the mapping for valid periods
    df_cleaned['START'], df_cleaned['END'] = zip(*df_cleaned['PERIOD'].map(period_mapping))

    # remove the PERIOD column
    df_cleaned = df_cleaned.drop(columns=['PERIOD'])

    # format date helper function
    def format_date_with_suffix(date):
        day = date.day
        suffix = 'th' if 11 <= day <= 13 else {1: 'st', 2: 'nd', 3: 'rd'}.get(day % 10, 'th')
        return date.strftime(f"%A, {day}{suffix} %B %Y")

    # process dates
    df_cleaned['DATE'] = pd.to_datetime(df_cleaned['DATE'])
    df_cleaned['DATE'] = df_cleaned['DATE'].apply(format_date_with_suffix)

    # filter by class pattern
    filtered_df = df_cleaned[df_cleaned['CLASS'].str.startswith(class_pattern)]
    filtered_df = filtered_df.drop(columns=['NO'])

    return filtered_df
