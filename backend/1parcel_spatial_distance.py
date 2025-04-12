import json
from geopy.distance import geodesic
from config import get_selected_source_path  # 导入config.py中的方法

# 获取选中的数据源路径
data_source_path = get_selected_source_path()
print(data_source_path)

# Load data from JSON files (使用config.py提供的路径)
with open(f'{data_source_path}merged_data_PLAN.json', 'r') as plan_file:
    plan_data = json.load(plan_file)

with open(f'{data_source_path}merged_data_EFF.json', 'r') as eff_file:
    eff_data = json.load(eff_file)


# Extract polylines by parcels to calculate spatial distanace
parcel_plan = [
    (feature['recipient_longitude'], feature['recipient_latitude'])
    for feature in plan_data
    if 'recipient_longitude' in feature and 'recipient_latitude' in feature
]
parcel_eff = [
    (feature['recipient_longitude'], feature['recipient_latitude'])
    for feature in eff_data
    if 'recipient_longitude' in feature and 'recipient_latitude' in feature
]
# print(parcel_eff)
# print(parcel_plan)

# Extract polylines
# To calculate total distance
lines_plan = [
    value for feature in plan_data
    for value in feature.get('polylines', {}).values() if value
]
lines_eff = [
    value for feature in eff_data
    for value in feature.get('polylines', {}).values() if value
]
#print(lines_plan)
# print(lines_eff)

# Calculate distances
distances = []
for plan_coord, eff_coord in zip(parcel_plan, parcel_eff):
    distance = geodesic(plan_coord, eff_coord).meters
    distance = round(distance,2)
    distances.append({
        "plan_coordinate:":plan_coord,
        "eff_coordinate": eff_coord,
        "distance": distance
    })

plan_total_distance = 0.0
for i in range(len(lines_plan) - 1):
    plan_total_distance += geodesic(lines_plan[i], lines_plan[i+1]).kilometers

print(plan_total_distance)

eff_total_distance = 0.0
for i in range(len(lines_eff) - 1):
    eff_total_distance += geodesic(lines_eff[i], lines_eff[i+1]).kilometers

print(eff_total_distance)

# Gather additional data
# parcel_counts = [len(lines_plan), len(lines_eff)]
# address_labels = [
#     feature['SND_EMPF_STRASSE'] for feature in plan_data
#     if 'SND_EMPF_STRASSE' in feature
# ]



def normalized_levenshtein_with_proximity(seq1, seq2, threshold, insert_cost, delete_cost):
    """
    Compute the normalized Levenshtein distance between two sequences of coordinates,
    considering proximity within a threshold distance.

    Args:
    seq1: List of coordinates (e.g., [(x1, y1), (x2, y2), ...])
    seq2: List of coordinates (e.g., [(x1, y1), (x2, y2), ...])
    threshold: Maximum distance considered "close" for substitution (200)
    insert_cost: Cost of an insertion operation
    delete_cost: Cost of a deletion operation

    Returns:
    A float representing the normalized Levenshtein distance.
    """
    """
    Compute the normalized Levenshtein distance between two sequences of coordinates,
    considering proximity within a threshold distance.
    Use:  Seq_Plan,Seq_Eff, threshold=200,insert_cost=1,delete_cost=1
    """
    # print("seq1:",seq1)
    # print("seq2:",seq2)
    n, m = len(seq1), len(seq2)
    dp = [[0] * (m + 1) for _ in range(n + 1)]

    # Initialize base cases
    for i in range(1, n + 1):
        dp[i][0] = i * delete_cost
    for j in range(1, m + 1):
        dp[0][j] = j * insert_cost

    # Fill the matrix
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            delete = dp[i - 1][j] + delete_cost
            insert = dp[i][j - 1] + insert_cost
            # Calculate substitution cost considering proximity
            substitution_cost = 0 if geodesic(seq1[i - 1], seq2[j - 1]).meters <= threshold else 1
            substitute = dp[i - 1][j - 1] + substitution_cost
            dp[i][j] = min(delete, insert, substitute)

    # Compute normalized distance
    levenshtein_distance = dp[n][m]
    max_length = max(n, m)
    print('max lenth :',max_length)
    print('lenv distance :',levenshtein_distance)

    normalized_distance = levenshtein_distance / max_length

    return 1 - normalized_distance
# #Calculate similarity
similarity = normalized_levenshtein_with_proximity(parcel_plan, parcel_eff, 200,1,1)
print("similarity:", similarity)

# #hard-coded but faster:
# if "1" in data_source_path:
#     similarity = 0.9565217391304348
# elif "2" in data_source_path:
#     similarity = 0.2576419213973799
# elif "3" in data_source_path:
#     similarity = 0.49425287356321834


# Prepare output data
data = {
    "distances": distances,
    "plan_total_distance": plan_total_distance,
    "eff_total_distance": eff_total_distance,
    "similarity": similarity
}

# Write output to JSON in the respective source folder
with open(f'{data_source_path}figure_spatial.json', 'w') as output_file:
    json.dump(data, output_file, indent=4)


print("Spatial distance Data and Similarity saved")



