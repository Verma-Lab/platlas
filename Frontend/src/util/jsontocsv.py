import json

# Load the JSON data from a file
with open('/Users/hritvik/all-by-all-browser/src/data/gwas/Phe_394/AFR/table.json', 'r') as json_file:
    json_data = json.load(json_file)

# Open a TXT file for writing
with open('/Users/hritvik/all-by-all-browser/src/data/gwas/Phe_394/AFR/table.txt', 'w') as txt_file:
    # Write the headers (keys of the dictionary)
    if isinstance(json_data, list):
        header = "\t".join(json_data[0].keys())
    else:
        header = "\t".join(json_data.keys())
    
    txt_file.write(header + "\n")
    
    # Write the rows
    if isinstance(json_data, list):
        for row in json_data:
            row_data = "\t".join(map(str, row.values()))
            txt_file.write(row_data + "\n")
    else:
        row_data = "\t".join(map(str, json_data.values()))
        txt_file.write(row_data + "\n")
