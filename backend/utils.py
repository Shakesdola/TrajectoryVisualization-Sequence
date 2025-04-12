from difflib import SequenceMatcher
from collections import defaultdict


# Helper function to calculate similarity between two strings
def similar(a, b):
    return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()


# Function to unify street names
def unify_street_names(parcels_data):
        
    # Step 1: Unify similar street names
    street_name_map = {}
    street_names = [entry["SND_EMPF_STRASSE"] for entry in parcels_data]

    for street in street_names:
        matched = False
        for key in street_name_map:
            if similar(street, key) > 0.8:
                street_name_map[street] = key
                matched = True
                break
        if not matched:
            street_name_map[street] = street

    # Apply the unified street names to the data
    for entry in parcels_data:
        entry["SND_EMPF_STRASSE"] = street_name_map[entry["SND_EMPF_STRASSE"]]
    return parcels_data


# Helper function to group data by address and preserve sequence
def group_by_address(data, date_field):
    grouped = defaultdict(list)
    for entry in data:
        address = (
            entry["SND_EMPF_STRASSE"],
            #entry["SND_EMPF_HAUSNR"],
            entry["SND_EMPF_PLZZZ"]
        )
        grouped[address].append({
            "plan_time": entry["PLAN_DAT"],
            "effective_time": entry["EFF_DAT"],
            "latitude": entry["recipient_latitude"],
            "longitude": entry["recipient_longitude"]
        })
    return grouped

# Helper function to group data by coordinates and preserve sequence
def group_by_coordinate(data):
    grouped = defaultdict(list)
    for entry in data:
        coordinate = (
            entry["recipient_latitude"],
            entry["recipient_longitude"]
        )
        grouped[coordinate].append({
            "plan_time": entry["PLAN_DAT"],
            "effective_time": entry["EFF_DAT"],
            "address": entry["SND_EMPF_STRASSE"],
            "postal_code": entry["SND_EMPF_PLZZZ"]
        })
    return grouped