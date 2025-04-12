import plotly.graph_objects as go
from datetime import datetime, timedelta
import json

from config import get_selected_source_path  # 导入config.py中的方法

# 获取选中的数据源路径
data_source_path = get_selected_source_path()
print(data_source_path)

# Load data from JSON files (使用config.py提供的路径)
with open(f'{data_source_path}merged_data_EFF.json', 'r') as eff_file:
    eff_data = json.load(eff_file)


# Function to convert time string to datetime object
def time_to_datetime(time_str):
    return datetime.strptime(time_str, "%Y-%m-%d %H:%M:%S")

# Sort by PLAN_DAT and assign plan_ordinal
parcel_data_sorted_plan = sorted(eff_data, key=lambda x: x["PLAN_DAT"])
for idx, parcel in enumerate(parcel_data_sorted_plan):
    parcel["plan_ordinal"] = idx + 1  # Assign ordinal numbers
    parcel["plan_time"] = time_to_datetime(parcel["PLAN_DAT"])
    parcel["eff_time"] = time_to_datetime(parcel["EFF_DAT"])

parcel_data_sorted_eff = sorted(eff_data, key=lambda x: x["EFF_DAT"])
for idx, parcel in enumerate(parcel_data_sorted_eff):
    parcel["eff_ordinal"] = idx + 1  # Assign ordinal numbers

#For .js file
# Extract data for JSON dump
timeline_data = []
for parcel in parcel_data_sorted_plan:
    plan_time_upper = parcel["plan_time"] + timedelta(minutes=15)
    plan_time_lower = parcel["plan_time"] - timedelta(minutes=15)

    timeline_data.append({
        "plan_ordinal": parcel["plan_ordinal"],
        "eff_ordinal": parcel["eff_ordinal"],
        "plan_time": parcel["plan_time"].strftime("%Y-%m-%d %H:%M:%S"),
        "eff_time": parcel["eff_time"].strftime("%Y-%m-%d %H:%M:%S"),
        "plan_time_upper": plan_time_upper.strftime("%Y-%m-%d %H:%M:%S"),
        "plan_time_lower": plan_time_lower.strftime("%Y-%m-%d %H:%M:%S"),
        "coordinates": [parcel["recipient_longitude"], parcel["recipient_latitude"]],  # 添加坐标数据
        "identcode":parcel["identcode"]
    })

# Dump the data to a JSON file
with open (f'{data_source_path}figure_timeline.json', 'w') as output_file:
    json.dump(timeline_data, output_file, indent=4)

print("Timeline Data saved")

