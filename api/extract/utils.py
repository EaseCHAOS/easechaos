import pandas as pd

def save_to_excel(df: pd.DataFrame, filename: str) -> None:
    writer = pd.ExcelWriter(filename, engine="xlsxwriter")
    df.to_excel(writer, index=False, sheet_name="Sheet1")

    workbook = writer.book
    worksheet = writer.sheets["Sheet1"]
    worksheet.set_zoom(75)

    header_format = workbook.add_format(
        {
            'valign': 'vcenter',
            'align': 'center',
            'bold': True,
            'text_wrap': True}
    )
    format = workbook.add_format(
        {
            'text_wrap': True, 
            'align': 'center', 
            'valign': 'vcenter'
        }
    )
    format.set_font_size(20)

    worksheet.set_column("A:XFD", 30, format)

    for col_num, value in enumerate(df.columns.values):
        worksheet.write(0, col_num, value, header_format)

    for row in range(df.shape[0]):
        worksheet.set_row(row, 60, format)

        row_values = df.iloc[row].astype(str).str.strip().tolist()
        for col in range(df.shape[1] - 1):  # -1 is moved here to avoid checking inside the loop
            cell_value = row_values[col]
            next_cell_value = row_values[col + 1]

            if cell_value == next_cell_value and cell_value != "nan":
                worksheet.merge_range(
                    row + 1,
                    col + 1,
                    row + 1,
                    col + 2,
                    cell_value,
                    format,
                )
    worksheet.set_row(df.shape[0], 45)

    writer.close()