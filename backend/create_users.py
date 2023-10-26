import sys
import pandas as pd

file_name = sys.argv[1]
df = pd.read_excel(file_name)

json_file = open('json_file_users.txt', 'w')
all_contents = []
for index, row in df.iterrows():
    data = row.to_json()

    all_contents.append(data)

json_file.write("[")
for item in all_contents:
    json_file.write(item)
    json_file.write(",")
    json_file.write("\n")
json_file.write("]")
json_file.close()






