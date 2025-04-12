import json

# Load configuration from the config.json file
def load_config():
    try:
        with open('config.json', 'r') as config_file:
            config = json.load(config_file)
            return config
    except FileNotFoundError:
        # If config file doesn't exist, return a default configuration
        return {"selectedSource": "source1"}

# Get the data source path based on the selected source
def get_selected_source_path():
    config = load_config()
    selected_source = config.get('selectedSource')
    print(config)

    # Example: Define paths for each source
    source_paths = {
        "Source1": "./data/dataSource/Source1/",
        "Source2": "./data/dataSource/Source2/",
        "Source3": "./data/dataSource/Source3/"
    }

    return source_paths.get(selected_source, "data/dataSource/Source1/")
